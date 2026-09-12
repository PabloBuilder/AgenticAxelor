import { AxelorClient } from "./axelorClient.js";
import {
  MetaViewRecord,
  ViewFieldInfo,
  ViewPanelInfo,
  InspectedViewResult,
} from "../types/axelor.js";

export class ViewService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  /**
   * Parse XML content of an Axelor view and extract flat field definitions.
   */
  parseViewXml(xml: string): ViewFieldInfo[] {
    if (!xml) return [];

    const fields: ViewFieldInfo[] = [];
    const seenFieldNames = new Set<string>();

    const fieldTagRegex = /<field\b([^>]*)(?:\/>|>[\s\S]*?<\/field>)/gi;
    let match: RegExpExecArray | null;

    while ((match = fieldTagRegex.exec(xml)) !== null) {
      const attributesString = match[1];
      const fieldInfo = this.extractFieldAttributes(attributesString);

      if (fieldInfo.name && !seenFieldNames.has(fieldInfo.name)) {
        seenFieldNames.add(fieldInfo.name);
        fields.push(fieldInfo);
      }
    }

    return fields;
  }

  /**
   * Parse hierarchical panel and tab tree from XML.
   */
  parseViewHierarchy(xml: string): { fields: ViewFieldInfo[]; panels: ViewPanelInfo[] } {
    const flatFields = this.parseViewXml(xml);
    if (!xml) return { fields: [], panels: [] };

    const panels = this.parseXmlPanels(xml);
    return {
      fields: flatFields,
      panels,
    };
  }

  /**
   * Recursively extract panel blocks and nested fields from XML markup.
   */
  private parseXmlPanels(xmlSnippet: string): ViewPanelInfo[] {
    const panelTagRegex = /<(panel|panel-tabs|panel-dashlet|panel-related|panel-include)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    const panels: ViewPanelInfo[] = [];
    let match: RegExpExecArray | null;

    while ((match = panelTagRegex.exec(xmlSnippet)) !== null) {
      const tagType = match[1] as ViewPanelInfo["itemType"];
      const attrStr = match[2];
      const innerContent = match[3];

      const attrs = this.parseRawAttributes(attrStr);
      const childPanels = this.parseXmlPanels(innerContent);

      // Extract direct fields in this panel (not belonging to child panels)
      // Strip nested panel contents to isolate current panel's direct fields
      const isolatedDirectContent = innerContent.replace(
        /<(panel|panel-tabs|panel-dashlet|panel-related|panel-include)\b[^>]*>[\s\S]*?<\/\1>/gi,
        ""
      );
      const directFields = this.parseViewXml(isolatedDirectContent);

      const panelInfo: ViewPanelInfo = {
        itemType: tagType,
        fields: directFields,
      };

      if (attrs.name) panelInfo.name = attrs.name;
      if (attrs.title) panelInfo.title = attrs.title;
      if (attrs.sidebar === "true") panelInfo.sidebar = true;
      if (attrs.colSpan) {
        const parsed = parseInt(attrs.colSpan, 10);
        if (!isNaN(parsed)) panelInfo.colSpan = parsed;
      }

      if (childPanels.length > 0) {
        panelInfo.panels = childPanels;
      }

      panels.push(panelInfo);
    }

    return panels;
  }

  /**
   * Extract key attributes from an XML attribute string.
   */
  private parseRawAttributes(attrStr: string): Record<string, string> {
    const attrRegex = /([a-zA-Z0-9_\-:]+)="([^"]*)"/g;
    let match: RegExpExecArray | null;
    const attrs: Record<string, string> = {};

    while ((match = attrRegex.exec(attrStr)) !== null) {
      attrs[match[1]] = match[2];
    }
    return attrs;
  }

  /**
   * Extract field attributes into structured ViewFieldInfo.
   */
  private extractFieldAttributes(attrStr: string): ViewFieldInfo {
    const attrs = this.parseRawAttributes(attrStr);

    const field: ViewFieldInfo = {
      name: attrs.name || "",
    };

    if (attrs.title) field.title = attrs.title;
    if (attrs.widget) field.widget = attrs.widget;
    if (attrs.target) field.target = attrs.target;
    if (attrs.type) field.type = attrs.type;
    if (attrs.selection) field.selection = attrs.selection;
    if (attrs.readonly === "true") field.readonly = true;
    if (attrs.required === "true") field.required = true;
    if (attrs.colSpan) {
      const parsed = parseInt(attrs.colSpan, 10);
      if (!isNaN(parsed)) field.colSpan = parsed;
    }

    return field;
  }

  /**
   * Calculate heuristic priority score for primary view resolution.
   */
  calculateViewPriority(
    view: MetaViewRecord,
    requestedQuery: string,
    fieldCount: number
  ): number {
    let score = 0;
    const viewName = (view.name || "").toLowerCase();
    const query = requestedQuery.toLowerCase();
    const model = (view.model || "").toLowerCase();

    // 1. Exact view name match
    if (viewName === query) {
      score += 1000;
    }

    // 2. Canonical naming patterns: e.g. "sale-order-form", "sale-order-grid"
    const modelSimpleName = model.split(".").pop() || "";
    const kebabModel = modelSimpleName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

    if (viewName === `${kebabModel}-${view.type}`) {
      score += 500;
    } else if (viewName.endsWith(`-${view.type}`) && !viewName.startsWith("incl-") && !viewName.startsWith("custom-")) {
      score += 200;
    }

    // 3. Penalize partial, wizard, and included subviews
    if (viewName.startsWith("incl-")) score -= 300;
    if (viewName.includes("-wizard-") || viewName.startsWith("wizard-")) score -= 200;
    if (viewName.includes("-popup-") || viewName.startsWith("popup-")) score -= 150;
    if (viewName.includes("-search-filters-") || view.type === "search-filters") score -= 250;

    // 4. Prefer richer views with more fields
    score += Math.min(fieldCount * 5, 250);

    return score;
  }

  /**
   * Search for view metadata definitions by keyword (name, title, model).
   */
  async searchViews(keyword: string, limit: number = 20): Promise<MetaViewRecord[]> {
    const response = await this.client.search<MetaViewRecord>(
      "com.axelor.meta.db.MetaView",
      {
        limit,
        fields: ["id", "name", "title", "type", "model"],
        domain: "self.name like :keyword or self.title like :keyword or self.model like :keyword",
        domainContext: {
          keyword: `%${keyword}%`,
        },
      }
    );

    return response.data || [];
  }

  /**
   * Inspect view(s) by technical name or model name and parse their XML schemas.
   */
  async inspectView(options: {
    nameOrModel: string;
    viewType?: "form" | "grid" | "all";
    includeXml?: boolean;
    limit?: number;
  }): Promise<InspectedViewResult[]> {
    const limit = options.limit ?? 10;
    const viewType = options.viewType || "all";

    let domain = "(self.name = :nameOrModel or self.name like :namePattern or self.model = :nameOrModel or self.model like :namePattern)";
    if (viewType !== "all") {
      domain += " and self.type = :viewType";
    }

    const response = await this.client.search<MetaViewRecord>(
      "com.axelor.meta.db.MetaView",
      {
        limit: Math.max(limit * 2, 20), // Fetch a broader candidate pool to score priorities accurately
        fields: ["id", "name", "title", "type", "model", "xml"],
        domain,
        domainContext: {
          nameOrModel: options.nameOrModel,
          namePattern: `%${options.nameOrModel}%`,
          viewType,
        },
      }
    );

    const records = response.data || [];

    const scoredResults: InspectedViewResult[] = records.map((rec) => {
      const hierarchy = rec.xml ? this.parseViewHierarchy(rec.xml) : { fields: [], panels: [] };
      const priorityScore = this.calculateViewPriority(rec, options.nameOrModel, hierarchy.fields.length);

      const result: InspectedViewResult = {
        id: rec.id,
        name: rec.name,
        title: rec.title,
        type: rec.type,
        model: rec.model,
        priorityScore,
        fields: hierarchy.fields,
        panels: hierarchy.panels.length > 0 ? hierarchy.panels : undefined,
      };

      if (options.includeXml) {
        result.rawXml = rec.xml;
      }

      return result;
    });

    // Sort descending by priorityScore
    scoredResults.sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

    // Mark the top view as primary
    if (scoredResults.length > 0) {
      scoredResults[0].isPrimary = true;
    }

    return scoredResults.slice(0, limit);
  }
}
