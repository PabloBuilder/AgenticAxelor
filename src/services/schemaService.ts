import { AxelorClient } from "./axelorClient.js";
import {
  MetaModelRecord,
  MetaFieldRecord,
  InspectedModelResult,
  InspectedModelField,
  ModelSearchResult,
  InspectSelectionOptions,
  SelectionResult,
  SelectionOptionItem,
  GetSchemaRelationsOptions,
  SchemaRelationsResult,
  SchemaRelationItem,
  InspectCustomFieldsOptions,
  InspectCustomFieldsResult,
  CustomFieldItem,
} from "../types/axelor.js";

export interface InspectModelOptions {
  model: string;
  relationshipOnly?: boolean;
}

export interface SearchModelOptions {
  query?: string;
  packageName?: string;
  limit?: number;
}

export class SchemaService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  /**
   * Introspect Axelor JPA schema & fields using MetaModel and MetaField entities.
   */
  async inspectModel(options: InspectModelOptions): Promise<InspectedModelResult | null> {
    const rawInput = options.model.trim();
    if (!rawInput) {
      throw new Error("Model name is required for inspection.");
    }

    // Determine if user passed a full model name (e.g. 'com.axelor.apps.sale.db.SaleOrder') or simple entity name ('SaleOrder')
    const isFullName = rawInput.includes(".");
    const simpleName = isFullName ? rawInput.split(".").pop()! : rawInput;

    // Search MetaModel record
    const metaModelRes = await this.client.search<MetaModelRecord>("com.axelor.meta.db.MetaModel", {
      limit: 10,
      domain: isFullName
        ? "self.fullName = :input or self.name = :simpleName"
        : "self.name = :simpleName or self.fullName like :wildcard",
      domainContext: isFullName
        ? { input: rawInput, simpleName }
        : { simpleName, wildcard: `%.${simpleName}` },
    });

    const metaModel = metaModelRes.data?.[0];
    if (!metaModel) {
      return null;
    }

    // Build full model name
    const resolvedFullName =
      metaModel.fullName ||
      (metaModel.packageName ? `${metaModel.packageName}.${metaModel.name}` : metaModel.name);

    // Fetch associated MetaFields for this MetaModel
    const metaFieldDomain = options.relationshipOnly
      ? "self.metaModel.id = :modelId and self.relationship is not null"
      : "self.metaModel.id = :modelId";

    const metaFieldsRes = await this.client.search<MetaFieldRecord>("com.axelor.meta.db.MetaField", {
      limit: 200,
      sortBy: ["name"],
      domain: metaFieldDomain,
      domainContext: { modelId: metaModel.id },
      fields: [
        "id",
        "name",
        "label",
        "typeName",
        "relationship",
        "target",
        "targetModel",
        "packageName",
        "required",
        "readonly",
        "selection",
        "selectionText",
        "columnName",
        "mappedBy",
        "help",
      ],
    });

    const rawFields = metaFieldsRes.data || [];

    const fields: InspectedModelField[] = rawFields.map((f) => {
      let targetModel = f.targetModel || f.target;
      if (!targetModel && f.relationship && f.typeName) {
        targetModel = f.packageName ? `${f.packageName}.${f.typeName}` : f.typeName;
      }

      return {
        name: f.name,
        label: f.label || undefined,
        type: f.typeName || undefined,
        relationship: f.relationship || undefined,
        targetModel: targetModel || undefined,
        required: f.required ? true : undefined,
        readonly: f.readonly ? true : undefined,
        selection: f.selection || f.selectionText || undefined,
        columnName: f.columnName || undefined,
        mappedBy: f.mappedBy || undefined,
        help: f.help || undefined,
      };
    });

    return {
      id: metaModel.id,
      name: metaModel.name,
      fullName: resolvedFullName,
      packageName: metaModel.packageName || undefined,
      tableName: metaModel.tableName || undefined,
      title: metaModel.title || undefined,
      description: metaModel.description || undefined,
      fieldsCount: fields.length,
      fields,
    };
  }

  /**
   * Search available Axelor JPA models by keyword or package name.
   */
  async searchModels(options: SearchModelOptions = {}): Promise<ModelSearchResult[]> {
    const limit = options.limit ?? 20;
    const query = options.query?.trim();
    const packageName = options.packageName?.trim();

    const domainParts: string[] = [];
    const domainContext: Record<string, unknown> = {};

    if (query) {
      domainParts.push(
        "(lower(self.name) like :q or lower(self.fullName) like :q or lower(self.tableName) like :q)"
      );
      domainContext.q = `%${query.toLowerCase()}%`;
    }

    if (packageName) {
      domainParts.push("lower(self.packageName) like :pkg");
      domainContext.pkg = `%${packageName.toLowerCase()}%`;
    }

    const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

    const response = await this.client.search<MetaModelRecord>("com.axelor.meta.db.MetaModel", {
      limit,
      sortBy: ["name"],
      domain,
      domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
      fields: ["id", "name", "packageName", "fullName", "tableName"],
    });

    const records = response.data || [];

    return records.map((m) => ({
      id: m.id,
      name: m.name,
      fullName: m.fullName || (m.packageName ? `${m.packageName}.${m.name}` : m.name),
      packageName: m.packageName || undefined,
      tableName: m.tableName || undefined,
    }));
  }

  /**
   * Introspect selection dictionaries (MetaSelect & MetaSelectItem) to translate statusSelect, typeSelect, etc.
   */
  async inspectSelections(options: InspectSelectionOptions = {}): Promise<SelectionResult[]> {
    const limit = options.limit ?? 10;
    let targetSelectionName = options.name?.trim();

    // 1. If model + field provided, lookup or deduce selection name
    if (!targetSelectionName && options.model && options.field) {
      const rawModel = options.model.trim();
      const simpleModel = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
      const fieldName = options.field.trim();

      // Convert camelCase (e.g. SaleOrder -> sale.order, statusSelect -> status.select)
      const toDotCase = (s: string) =>
        s
          .replace(/([a-z0-9])([A-Z])/g, "$1.$2")
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, ".");

      const modelDot = toDotCase(simpleModel);
      const fieldDot = toDotCase(fieldName);

      // Candidate names (e.g. "sale.order.status.select", "sale.order.status", "invoice.status.select", etc.)
      const candidates = [
        `${modelDot}.${fieldDot}`,
        `${modelDot}.${fieldDot.replace(/\.select$/, "")}.select`,
        `${modelDot}.${fieldDot.replace(/\.select$/, "")}`,
        fieldDot,
      ];

      // Try looking up in MetaSelect directly by heuristic pattern
      const heuristicRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaSelect", {
        limit: 20,
        domain: "self.name in :candidates or self.name like :wildcard",
        domainContext: {
          candidates,
          wildcard: `%${modelDot}%${fieldDot.replace(/\.select$/, "")}%`,
        },
        fields: ["id", "name"],
      });

      if (heuristicRes.data && heuristicRes.data.length > 0) {
        // Prioritize exact candidate or best match
        const exact = heuristicRes.data.find(
          (s) => candidates.includes(s.name) || s.name.endsWith(`${modelDot}.${fieldDot}`)
        );
        targetSelectionName = exact ? exact.name : heuristicRes.data[0].name;
      }
    }

    // 2. Search MetaSelect records
    const domainParts: string[] = [];
    const domainContext: Record<string, unknown> = {};

    if (targetSelectionName) {
      domainParts.push("(self.name = :targetName or self.name like :wildcard)");
      domainContext.targetName = targetSelectionName;
      domainContext.wildcard = `%${targetSelectionName}%`;
    } else if (options.query) {
      domainParts.push("lower(self.name) like :q");
      domainContext.q = `%${options.query.toLowerCase()}%`;
    }

    const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

    const selectRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaSelect", {
      limit,
      sortBy: ["name"],
      domain,
      domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
      fields: ["id", "name"],
    });

    const metaSelects = selectRes.data || [];
    if (metaSelects.length === 0) return [];

    const selectIds = metaSelects.map((s) => s.id);

    // 3. Fetch all MetaSelectItem options for these MetaSelects
    const itemsRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaSelectItem", {
      limit: 200,
      sortBy: ["order", "id"],
      domain: "self.select.id in :selectIds",
      domainContext: { selectIds },
      fields: ["id", "select", "value", "title", "order", "color", "icon", "hidden"],
    });

    const itemMap = new Map<number, SelectionOptionItem[]>();
    (itemsRes.data || []).forEach((it) => {
      const parentId = it.select?.id;
      if (!parentId) return;

      const optionItem: SelectionOptionItem = {
        id: it.id,
        value: it.value !== null && it.value !== undefined ? String(it.value) : "",
        title: it.title || it.value || "",
        order: it.order !== null && it.order !== undefined ? it.order : undefined,
        color: it.color || undefined,
        icon: it.icon || undefined,
        hidden: it.hidden || undefined,
      };

      if (!itemMap.has(parentId)) {
        itemMap.set(parentId, []);
      }
      itemMap.get(parentId)!.push(optionItem);
    });

    return metaSelects.map((s) => {
      const optionsList = itemMap.get(s.id) || [];
      return {
        id: s.id,
        name: s.name,
        optionsCount: optionsList.length,
        options: optionsList,
      };
    });
  }

  /**
   * Introspect incoming and outgoing relational schema links (Foreign Keys / OneToMany / ManyToMany)
   * for an entity model.
   */
  async getSchemaRelations(options: GetSchemaRelationsOptions): Promise<SchemaRelationsResult> {
    const rawModel = options.model.trim();
    const simpleModel = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
    const direction = options.direction || "all";
    const relType = options.relationshipType?.trim();
    const limit = options.limit ?? 50;

    // 1. Resolve MetaModel record
    const metaModelRes = await this.client.search<MetaModelRecord>("com.axelor.meta.db.MetaModel", {
      limit: 1,
      domain: "self.name = :simpleModel or self.fullName = :rawModel",
      domainContext: { simpleModel, rawModel },
      fields: ["id", "name", "fullName", "tableName", "title"],
    });

    const metaModel = metaModelRes.data?.[0];
    const resolvedSimpleName = metaModel?.name || simpleModel;
    const resolvedFullName = metaModel?.fullName || rawModel;
    const tableName = metaModel?.tableName;

    const outgoing: SchemaRelationItem[] = [];
    const incoming: SchemaRelationItem[] = [];

    // 2. Fetch Outgoing Relations (fields defined on this model where relationship is not null)
    if (direction === "all" || direction === "outgoing") {
      const domainParts = [
        "(self.metaModel.name = :simpleModel or self.metaModel.fullName = :rawModel)",
        "self.relationship is not null",
      ];
      const domainContext: Record<string, unknown> = {
        simpleModel: resolvedSimpleName,
        rawModel: resolvedFullName,
      };

      if (relType) {
        domainParts.push("self.relationship = :relType");
        domainContext.relType = relType;
      }

      const outgoingRes = await this.client.search<MetaFieldRecord>("com.axelor.meta.db.MetaField", {
        limit,
        domain: domainParts.join(" and "),
        domainContext,
        sortBy: ["name"],
        fields: ["id", "name", "label", "relationship", "typeName", "packageName", "mappedBy"],
      });

      (outgoingRes.data || []).forEach((f) => {
        if (!f.relationship) return;
        outgoing.push({
          id: f.id,
          fieldName: f.name,
          label: f.label || undefined,
          relationship: f.relationship,
          sourceModel: resolvedSimpleName,
          targetModel: f.typeName || f.packageName || "Unknown",
          mappedBy: f.mappedBy || undefined,
        });
      });
    }

    // 3. Fetch Incoming Relations (fields on OTHER models pointing to this model)
    if (direction === "all" || direction === "incoming") {
      const domainParts = [
        "self.typeName = :simpleModel",
        "self.relationship is not null",
        "(self.metaModel.name != :simpleModel and self.metaModel.fullName != :rawModel)",
      ];
      const domainContext: Record<string, unknown> = {
        simpleModel: resolvedSimpleName,
        rawModel: resolvedFullName,
      };

      if (relType) {
        domainParts.push("self.relationship = :relType");
        domainContext.relType = relType;
      }

      const incomingRes = await this.client.search<MetaFieldRecord>("com.axelor.meta.db.MetaField", {
        limit,
        domain: domainParts.join(" and "),
        domainContext,
        sortBy: ["metaModel.name", "name"],
        fields: ["id", "name", "label", "relationship", "metaModel.name", "metaModel.fullName", "typeName", "mappedBy"],
      });

      (incomingRes.data || []).forEach((f) => {
        if (!f.relationship) return;
        const sourceName = (f as any)["metaModel.name"] || (f as any).metaModel?.name || "Unknown";
        incoming.push({
          id: f.id,
          fieldName: f.name,
          label: f.label || undefined,
          relationship: f.relationship,
          sourceModel: sourceName,
          targetModel: resolvedSimpleName,
          mappedBy: f.mappedBy || undefined,
        });
      });
    }

    return {
      model: resolvedSimpleName,
      fullName: resolvedFullName,
      tableName: tableName || undefined,
      outgoingCount: outgoing.length,
      outgoing,
      incomingCount: incoming.length,
      incoming,
    };
  }

  /**
   * Inspect custom attributes (Studio JSON attrs, dynamic fields, transient $fields, and customized views)
   * for an entity model.
   */
  async inspectCustomFields(options: InspectCustomFieldsOptions): Promise<InspectCustomFieldsResult> {
    const rawModel = options.model.trim();
    const simpleModel = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
    const resolvedSimpleName = simpleModel;

    // 1. Check if model has standard `attrs` JSON field or meta json fields
    const metaFieldRes = await this.client.search<MetaFieldRecord>("com.axelor.meta.db.MetaField", {
      limit: 100,
      domain: "(self.metaModel.name = :simpleModel or self.metaModel.fullName = :rawModel)",
      domainContext: { simpleModel, rawModel },
      fields: ["name", "label", "typeName", "json", "relationship"],
    });

    const fields = metaFieldRes.data || [];
    const hasAttrsField = fields.some((f) => f.name === "attrs" || f.name.endsWith("Attrs"));
    const jsonFields = fields.filter((f) => f.json || f.name === "attrs" || f.name.endsWith("Attrs"));

    const customFieldsMap = new Map<string, CustomFieldItem>();

    jsonFields.forEach((jf) => {
      customFieldsMap.set(jf.name, {
        name: jf.name,
        title: jf.label || undefined,
        type: jf.typeName || "json",
        source: "meta_json",
        readonly: jf.readonly,
        required: jf.required,
      });
    });

    // 2. Fetch Customized Views (MetaViewCustom)
    const viewCustomDomain = "(self.model = :simpleModel or self.model = :rawModel)";
    const viewCustomRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaViewCustom", {
      limit: 20,
      domain: options.viewName ? `${viewCustomDomain} and self.name = :vn` : viewCustomDomain,
      domainContext: { simpleModel, rawModel, vn: options.viewName },
      fields: ["id", "name", "title", "type", "version", "xml"],
    });

    const customViews = (viewCustomRes.data || []).map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      title: v.title || undefined,
      version: v.version ?? 0,
    }));

    // Parse custom fields from MetaViewCustom XML
    (viewCustomRes.data || []).forEach((v) => {
      const xml = v.xml || "";
      const fieldRegex = /<field\b([^>]*)\/?>/g;
      let match: RegExpExecArray | null;

      while ((match = fieldRegex.exec(xml)) !== null) {
        const attrsStr = match[1];
        const nameMatch = attrsStr.match(/\bname=["']([^"']+)["']/);
        if (!nameMatch) continue;
        const name = nameMatch[1];

        // Is it an attrs.customField, a $transientField, or a customized view field?
        const isAttrs = name.startsWith("attrs.") || name.includes(".attrs.");
        const isTransient = name.startsWith("$");

        const titleMatch = attrsStr.match(/\btitle=["']([^"']+)["']/);
        const typeMatch = attrsStr.match(/\btype=["']([^"']+)["']/);
        const widgetMatch = attrsStr.match(/\bwidget=["']([^"']+)["']/);
        const targetModelMatch = attrsStr.match(/\btargetModel=["']([^"']+)["']/);
        const selectionMatch = attrsStr.match(/\bselection=["']([^"']+)["']/);
        const readonlyMatch = attrsStr.match(/\breadonly=["']true["']/);
        const requiredMatch = attrsStr.match(/\brequired=["']true["']/);
        const hiddenMatch = attrsStr.match(/\bhidden=["']true["']/);

        const source = isAttrs ? "attrs" : isTransient ? "view_transient" : "view_custom";

        if (!customFieldsMap.has(name) || isAttrs || isTransient) {
          customFieldsMap.set(name, {
            name,
            title: titleMatch ? titleMatch[1] : undefined,
            type: typeMatch ? typeMatch[1] : undefined,
            widget: widgetMatch ? widgetMatch[1] : undefined,
            source,
            targetModel: targetModelMatch ? targetModelMatch[1] : undefined,
            selection: selectionMatch ? selectionMatch[1] : undefined,
            readonly: readonlyMatch ? true : undefined,
            required: requiredMatch ? true : undefined,
            hidden: hiddenMatch ? true : undefined,
            viewName: v.name,
          });
        }
      }
    });

    // 3. Search Standard Views (MetaView) for attrs.* or $transient fields on this model
    const standardViewDomain = "(self.model = :simpleModel or self.model = :rawModel)";
    const standardViewRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaView", {
      limit: 20,
      domain: options.viewName ? `${standardViewDomain} and self.name = :vn` : standardViewDomain,
      domainContext: { simpleModel, rawModel, vn: options.viewName },
      fields: ["name", "title", "type", "xml"],
    });

    (standardViewRes.data || []).forEach((v) => {
      const xml = v.xml || "";
      const fieldRegex = /<field\b([^>]*)\/?>/g;
      let match: RegExpExecArray | null;

      while ((match = fieldRegex.exec(xml)) !== null) {
        const attrsStr = match[1];
        const nameMatch = attrsStr.match(/\bname=["']([^"']+)["']/);
        if (!nameMatch) continue;
        const name = nameMatch[1];

        const isAttrs = name.startsWith("attrs.") || name.includes(".attrs.");
        const isTransient = name.startsWith("$");

        if (isAttrs || isTransient) {
          const titleMatch = attrsStr.match(/\btitle=["']([^"']+)["']/);
          const typeMatch = attrsStr.match(/\btype=["']([^"']+)["']/);
          const widgetMatch = attrsStr.match(/\bwidget=["']([^"']+)["']/);
          const targetModelMatch = attrsStr.match(/\btargetModel=["']([^"']+)["']/);
          const selectionMatch = attrsStr.match(/\bselection=["']([^"']+)["']/);
          const readonlyMatch = attrsStr.match(/\breadonly=["']true["']/);
          const requiredMatch = attrsStr.match(/\brequired=["']true["']/);
          const hiddenMatch = attrsStr.match(/\bhidden=["']true["']/);

          const source = isAttrs ? "attrs" : "view_transient";

          customFieldsMap.set(name, {
            name,
            title: titleMatch ? titleMatch[1] : undefined,
            type: typeMatch ? typeMatch[1] : undefined,
            widget: widgetMatch ? widgetMatch[1] : undefined,
            source,
            targetModel: targetModelMatch ? targetModelMatch[1] : undefined,
            selection: selectionMatch ? selectionMatch[1] : undefined,
            readonly: readonlyMatch ? true : undefined,
            required: requiredMatch ? true : undefined,
            hidden: hiddenMatch ? true : undefined,
            viewName: v.name,
          });
        }
      }
    });

    const customFields = Array.from(customFieldsMap.values());

    return {
      model: resolvedSimpleName,
      hasAttrsField,
      customFieldsCount: customFields.length,
      customFields,
      customViewsCount: customViews.length,
      customViews,
    };
  }
}


