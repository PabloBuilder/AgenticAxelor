import fs from "fs";
import path from "path";
import { AxelorClient } from "./axelorClient.js";
import {
  AxelorApiError,
  ExportDataOptions,
  ExportDataResult,
  BatchOperationsOptions,
  BatchOperationsResult,
  BatchOperationItemResult,
  SimulateOnChangeOptions,
  SimulateOnChangeResult,
} from "../types/axelor.js";

export interface DataQueryOptions {
  model: string;
  fields?: string[];
  domain?: string;
  domainContext?: Record<string, unknown>;
  sortBy?: string[];
  limit?: number;
  offset?: number;
}

export interface DataQueryResult {
  model: string;
  total?: number;
  offset: number;
  limit: number;
  records: Record<string, any>[];
}

export class DataService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  /**
   * Query records of any Axelor business model with filtering, sorting, and field selection.
   */
  async queryData(options: DataQueryOptions): Promise<DataQueryResult> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    const response = await this.client.search<Record<string, any>>(options.model, {
      limit,
      offset,
      fields: options.fields && options.fields.length > 0 ? options.fields : undefined,
      sortBy: options.sortBy,
      domain: options.domain,
      domainContext: options.domainContext,
    });

    return {
      model: options.model,
      total: response.total ?? response.data?.length ?? 0,
      offset,
      limit,
      records: response.data || [],
    };
  }

  /**
   * Fetch a single record by ID with specific fields or full default representation.
   */
  async fetchRecord(
    model: string,
    id: number,
    fields?: string[]
  ): Promise<Record<string, any> | null> {
    return this.client.fetchById<Record<string, any>>(model, id, fields);
  }

  /**
   * Create or update a record for any Axelor model.
   * If record.id and record.version are provided, it performs an update; otherwise it creates a new entity.
   */
  async saveRecord(
    model: string,
    record: Record<string, unknown>
  ): Promise<Record<string, any>> {
    const response = await this.client.save<Record<string, any>>(model, record);

    if (response.status !== 0) {
      throw new Error(
        response.error || response.message || `Failed to save record in ${model} (status: ${response.status})`
      );
    }

    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return { success: true };
  }

  /**
   * Delete a record by ID and optional optimistic lock version.
   * Auto-fetches live version if omitted and translates relational constraint errors.
   */
  async deleteRecord(
    model: string,
    id: number,
    version?: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.client.remove(model, id, version);

      if (response.status !== 0) {
        throw new Error(
          response.error || response.message || `Failed to delete record ${id} in ${model}`
        );
      }

      return {
        success: true,
        message: `Record ${id} in model ${model} successfully deleted.`,
      };
    } catch (error: any) {
      if (error instanceof AxelorApiError && error.details) {
        let msg = error.details.message;
        if (error.details.targetTable) {
          msg = `Cannot delete ${model} #${id}: still referenced by table '${error.details.targetTable}'. Clean referencing records first.`;
        } else if (error.details.title) {
          msg = `${error.details.title}: ${error.details.message}`;
        }
        throw new Error(msg);
      }
      throw error;
    }
  }

  /**
   * Trigger an Axelor Action (action-method, action-record, action-attrs, action-group, etc.)
   * with contextual parameters and return the execution results.
   */
  async runAction(
    action: string,
    model?: string,
    context?: Record<string, unknown>
  ): Promise<Record<string, any>> {
    const response = await this.client.executeAction(action, model, context);

    if (response.status !== 0) {
      throw new Error(
        response.error || response.message || `Failed to execute action ${action} (status: ${response.status})`
      );
    }

    return {
      action,
      model,
      status: response.status,
      results: response.data || [],
    };
  }

  /**
   * Export large datasets from an Axelor model to CSV or JSON by iterating paginated searches.
   */
  async exportData(options: ExportDataOptions): Promise<ExportDataResult> {
    const rawModel = options.model.trim();
    if (!rawModel) throw new Error("Model name is required for export.");

    const maxRecords = options.maxRecords ?? 1000;
    const format = options.format || "csv";
    const pageSize = 100;
    let offset = 0;
    const allRecords: Record<string, any>[] = [];

    while (allRecords.length < maxRecords) {
      const fetchLimit = Math.min(pageSize, maxRecords - allRecords.length);
      const res = await this.queryData({
        model: rawModel,
        fields: options.fields,
        domain: options.domain,
        domainContext: options.domainContext,
        sortBy: options.sortBy,
        limit: fetchLimit,
        offset,
      });

      const chunk = res.records || [];
      if (chunk.length === 0) break;

      allRecords.push(...chunk);
      offset += chunk.length;

      // Stop if fewer records than requested page size was returned
      if (chunk.length < fetchLimit) break;
    }

    let formattedOutput = "";
    if (format === "json") {
      formattedOutput = JSON.stringify(allRecords, null, 2);
    } else {
      // CSV format
      if (allRecords.length > 0) {
        // Collect all distinct headers across records
        const headersSet = new Set<string>();
        if (options.fields && options.fields.length > 0) {
          options.fields.forEach((f) => headersSet.add(f));
        } else {
          allRecords.forEach((r) => {
            Object.keys(r).forEach((k) => {
              if (k !== "$version" && k !== "$wkfStatus" && k !== "selected" && k !== "cid") {
                headersSet.add(k);
              }
            });
          });
        }

        const headers = Array.from(headersSet);
        const csvRows: string[] = [];

        // Header row
        csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

        // Data rows
        allRecords.forEach((r) => {
          const row = headers.map((h) => {
            const val = r[h];
            if (val === null || val === undefined) return '""';
            if (typeof val === "object") {
              const displayVal = val.fullName || val.name || val.code || JSON.stringify(val);
              return `"${String(displayVal).replace(/"/g, '""')}"`;
            }
            return `"${String(val).replace(/"/g, '""')}"`;
          });
          csvRows.push(row.join(","));
        });

        formattedOutput = csvRows.join("\n");
      }
    }

    let savedPath: string | undefined;
    if (options.outputPath) {
      const resolvedPath = path.resolve(options.outputPath);
      const targetDir = path.dirname(resolvedPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, formattedOutput, "utf-8");
      savedPath = resolvedPath;
    }

    // Limit returned content in memory to avoid huge payloads in LLM context
    const isTruncated = formattedOutput.length > 15000;
    const content = isTruncated
      ? formattedOutput.substring(0, 15000) + `\n\n... [Truncated remaining output. Total records exported: ${allRecords.length}]`
      : formattedOutput;

    return {
      model: rawModel,
      totalExported: allRecords.length,
      format,
      savedPath,
      content,
      truncated: isTruncated,
    };
  }

  /**
   * Execute a transactional-style batch of create, update, and delete operations across multiple records or models.
   */
  async batchOperations(options: BatchOperationsOptions): Promise<BatchOperationsResult> {
    const operations = options.operations || [];
    const continueOnError = options.continueOnError ?? false;
    const results: BatchOperationItemResult[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const model = op.model.trim();

      try {
        if (op.type === "create") {
          if (!op.data || Object.keys(op.data).length === 0) {
            throw new Error("Missing 'data' payload for create operation.");
          }
          const saved = await this.saveRecord(model, op.data);
          results.push({
            index: i,
            type: "create",
            model,
            id: saved.id,
            success: true,
            data: saved,
          });
          successful++;
        } else if (op.type === "update") {
          if (!op.id) {
            throw new Error("Missing 'id' for update operation.");
          }
          const updatePayload: Record<string, unknown> = {
            id: op.id,
            ...(op.version !== undefined ? { version: op.version, $version: op.version } : {}),
            ...(op.data || {}),
          };
          const updated = await this.saveRecord(model, updatePayload);
          results.push({
            index: i,
            type: "update",
            model,
            id: op.id,
            success: true,
            data: updated,
          });
          successful++;
        } else if (op.type === "delete") {
          if (!op.id) {
            throw new Error("Missing 'id' for delete operation.");
          }
          await this.deleteRecord(model, op.id, op.version);
          results.push({
            index: i,
            type: "delete",
            model,
            id: op.id,
            success: true,
          });
          successful++;
        } else {
          throw new Error(`Unsupported batch operation type: '${(op as any).type}'. Must be 'create', 'update', or 'delete'.`);
        }
      } catch (err: any) {
        failed++;
        results.push({
          index: i,
          type: op.type,
          model,
          id: op.id,
          success: false,
          error: err.message || String(err),
        });

        if (!continueOnError) {
          break;
        }
      }
    }

    return {
      total: operations.length,
      successful,
      failed,
      hasErrors: failed > 0,
      results,
    };
  }

  /**
   * Simulate form onChange actions / dynamic field updates with contextual entity values.
   */
  async simulateOnChange(options: SimulateOnChangeOptions): Promise<SimulateOnChangeResult> {
    const rawModel = options.model.trim();
    const simpleModel = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
    const fullModel = rawModel.includes(".") ? rawModel : `com.axelor.apps.${simpleModel.toLowerCase()}.db.${simpleModel}`;
    let targetAction = options.action?.trim();

    // 1. If action is omitted but field is provided, resolve the onChange action from MetaView
    if (!targetAction && options.field) {
      const fieldName = options.field.trim();
      const domainParts = ["(self.model = :simpleModel or self.model = :rawModel or self.model = :fullModel)"];
      const domainContext: Record<string, unknown> = { simpleModel, rawModel, fullModel };

      if (options.viewName) {
        domainParts.push("self.name = :viewName");
        domainContext.viewName = options.viewName;
      }

      const viewsRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaView", {
        limit: 30,
        domain: domainParts.join(" and "),
        domainContext,
        sortBy: ["type", "name"],
        fields: ["name", "type", "xml"],
      });

      for (const v of viewsRes.data || []) {
        const xml = v.xml || "";
        // Match <field name="fieldName" ... onChange="..." ... />
        const fieldRegex = new RegExp(`<field\\b[^>]*name=["']${fieldName}["'][^>]*>`, "i");
        const match = xml.match(fieldRegex);
        if (match) {
          const actionMatch = match[0].match(/\bonChange=["']([^"']+)["']/i);
          if (actionMatch) {
            targetAction = actionMatch[1];
            break;
          }
        }
      }
    }

    if (!targetAction) {
      throw new Error(
        `Unable to resolve onChange action for model '${options.model}'${options.field ? ` and field '${options.field}'` : ""}. Please provide an explicit 'action' parameter.`
      );
    }

    // 2. Prepare Context
    const recordPayload = { ...(options.record || {}) };
    if (options.field) {
      recordPayload._source = options.field;
    }

    // 3. Execute via client.executeAction
    const actionRes = await this.client.executeAction(targetAction, rawModel, recordPayload);

    const values: Record<string, any> = {};
    const attrs: Record<string, any> = {};
    const alerts: Array<{ type?: string; message?: string }> = [];

    // Parse response data array
    const dataItems = actionRes.data || [];
    dataItems.forEach((item) => {
      if (item.values) {
        Object.assign(values, item.values);
      }
      if (item.attrs) {
        Object.assign(attrs, item.attrs);
      }
      if (item.info?.message) {
        alerts.push({ type: "info", message: item.info.message });
      }
      if (item.warning?.message) {
        alerts.push({ type: "warning", message: item.warning.message });
      }
      if (item.error?.message) {
        alerts.push({ type: "error", message: item.error.message });
      }
    });

    return {
      model: rawModel,
      actionExecuted: targetAction,
      field: options.field,
      values,
      attrs: Object.keys(attrs).length > 0 ? attrs : undefined,
      alerts: alerts.length > 0 ? alerts : undefined,
    };
  }
}



