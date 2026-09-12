import { AxelorClient } from "./axelorClient.js";

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
   */
  async deleteRecord(
    model: string,
    id: number,
    version?: number
  ): Promise<{ success: boolean; message?: string }> {
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
}

