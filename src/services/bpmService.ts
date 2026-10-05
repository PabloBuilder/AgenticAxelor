import { AxelorClient } from "./axelorClient.js";
import {
  BpmInstanceState,
  GetBpmStateOptions,
} from "../types/axelor.js";

export class BpmService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  /**
   * Query the active BPMN workflow instance and execution state for an ERP record or process.
   */
  async getBpmState(options: GetBpmStateOptions = {}): Promise<BpmInstanceState[]> {
    const rawModel = options.model?.trim();
    const recordId = options.recordId;
    const instanceId = options.instanceId?.trim();
    const limit = options.limit ?? 20;

    const domainParts: string[] = [];
    const domainContext: Record<string, unknown> = {};

    if (instanceId) {
      domainParts.push("(self.instanceId = :instanceId or self.processInstanceId = :instanceId)");
      domainContext.instanceId = instanceId;
    }

    if (rawModel) {
      const simpleName = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
      domainParts.push(
        "(self.modelName = :rawModel or self.modelName = :simpleName or self.modelName like :wildcard)"
      );
      domainContext.rawModel = rawModel;
      domainContext.simpleName = simpleName;
      domainContext.wildcard = `%.${simpleName}`;
    }

    if (recordId !== undefined && !isNaN(recordId)) {
      domainParts.push("self.modelId = :recordId");
      domainContext.recordId = recordId;
    }

    const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

    const response = await this.client.search<Record<string, any>>(
      "com.axelor.studio.db.WkfInstance",
      {
        limit,
        sortBy: ["-createdOn", "-id"],
        domain,
        domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
        fields: [
          "id",
          "name",
          "instanceId",
          "processInstanceId",
          "modelName",
          "modelId",
          "node",
          "currentStatus",
          "instanceError",
          "currentError",
          "statusSelect",
          "createdOn",
          "updatedOn",
          "wkfProcess",
        ],
      }
    );

    const records = response.data || [];

    return records.map((r) => ({
      id: r.id,
      instanceId: r.instanceId || r.processInstanceId || String(r.id),
      name: r.name || undefined,
      modelName: r.modelName || undefined,
      modelId: r.modelId || undefined,
      processName: r.wkfProcess?.name || undefined,
      currentNode: r.node || undefined,
      currentStatus: r.currentStatus || undefined,
      hasError: Boolean(r.instanceError || r.currentError),
      currentError: r.currentError || undefined,
      statusSelect: r.statusSelect || undefined,
      createdOn: r.createdOn || undefined,
      updatedOn: r.updatedOn || undefined,
    }));
  }
}
