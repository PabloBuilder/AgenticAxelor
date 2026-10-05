import { AxelorClient } from "./axelorClient.js";
import {
  AuditLogItem,
  AuditLogChangeItem,
  GetAuditLogOptions,
} from "../types/axelor.js";

export class AuditService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  private mapActionType(typeSelect?: number): AuditLogItem["actionType"] {
    switch (typeSelect) {
      case 1:
        return "creation";
      case 2:
        return "read";
      case 3:
        return "update";
      case 4:
        return "deletion";
      case 5:
        return "export";
      default:
        return "unknown";
    }
  }

  /**
   * Fetch audit trails and field modification logs for an ERP record, model, or user.
   */
  async getAuditLog(options: GetAuditLogOptions = {}): Promise<AuditLogItem[]> {
    const rawModel = options.model?.trim();
    const recordId = options.recordId;
    const userCode = options.userCode?.trim();
    const limit = options.limit ?? 20;

    const domainParts: string[] = [];
    const domainContext: Record<string, unknown> = {};

    if (rawModel) {
      const simpleName = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
      domainParts.push(
        "(self.metaModel.name = :simpleName or self.metaModel.fullName = :rawModel or self.metaModel.fullName like :wildcard)"
      );
      domainContext.simpleName = simpleName;
      domainContext.rawModel = rawModel;
      domainContext.wildcard = `%.${simpleName}`;
    }

    if (recordId !== undefined && !isNaN(recordId)) {
      domainParts.push("self.relatedId = :recordId");
      domainContext.recordId = recordId;
    }

    if (userCode) {
      domainParts.push("(lower(self.user.code) = :userCode or lower(self.createdBy.code) = :userCode)");
      domainContext.userCode = userCode.toLowerCase();
    }

    const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

    const response = await this.client.search<Record<string, any>>(
      "com.axelor.apps.base.db.GlobalTrackingLog",
      {
        limit,
        sortBy: ["-dateT", "-id"],
        domain,
        domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
        fields: [
          "id",
          "metaModel",
          "relatedId",
          "relatedReference",
          "typeSelect",
          "dateT",
          "user",
          "createdBy",
        ],
      }
    );

    const logs = response.data || [];
    if (logs.length === 0) return [];

    const logIds = logs.map((l) => l.id);

    // Fetch detailed change lines for these logs
    const linesRes = await this.client.search<Record<string, any>>(
      "com.axelor.apps.base.db.GlobalTrackingLogLine",
      {
        limit: 200,
        sortBy: ["id"],
        domain: "self.globalTrackingLog.id in :logIds",
        domainContext: { logIds },
        fields: ["id", "globalTrackingLog", "metaField", "metaFieldName", "previousValue", "newValue", "createdOn"],
      }
    );

    const lineMap = new Map<number, AuditLogChangeItem[]>();
    (linesRes.data || []).forEach((line) => {
      const parentId = line.globalTrackingLog?.id;
      if (!parentId) return;

      const changeItem: AuditLogChangeItem = {
        id: line.id,
        fieldName: line.metaField?.name || line.metaFieldName || undefined,
        previousValue: line.previousValue || undefined,
        newValue: line.newValue || undefined,
        createdOn: line.createdOn || undefined,
      };

      if (!lineMap.has(parentId)) {
        lineMap.set(parentId, []);
      }
      lineMap.get(parentId)!.push(changeItem);
    });

    return logs.map((l) => {
      const changes = lineMap.get(l.id) || [];
      const userObj = l.user || l.createdBy;

      return {
        id: l.id,
        modelName: l.metaModel?.name || l.metaModel?.fullName || l.metaModelName || "Unknown",
        recordId: l.relatedId,
        relatedReference: l.relatedReference || undefined,
        typeSelect: l.typeSelect || undefined,
        actionType: this.mapActionType(l.typeSelect),
        date: l.dateT || l.createdOn || "",
        author: userObj
          ? {
              code: userObj.code || undefined,
              fullName: userObj.fullName || userObj.name || undefined,
            }
          : undefined,
        changesCount: changes.length,
        changes,
      };
    });
  }
}
