import fs from "fs";
import path from "path";
import { AxelorClient } from "./axelorClient.js";
import {
  AxelorTemplateItem,
  ListTemplatesOptions,
  GenerateReportOptions,
  GenerateReportResult,
} from "../types/axelor.js";

export class ReportService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  /**
   * List print templates, BIRT/Jasper reports, and email templates configured for an entity or across the ERP.
   */
  async listTemplates(options: ListTemplatesOptions = {}): Promise<AxelorTemplateItem[]> {
    const rawModel = options.model?.trim();
    const typeFilter = options.templateType || "all";
    const query = options.query?.trim();
    const limit = options.limit ?? 20;

    const simpleName = rawModel
      ? rawModel.includes(".")
        ? rawModel.split(".").pop()!
        : rawModel
      : undefined;

    const results: AxelorTemplateItem[] = [];

    // 1. Fetch BIRT / Report Templates (com.axelor.apps.base.db.BirtTemplate)
    if (typeFilter === "all" || typeFilter === "report") {
      try {
        const domainParts: string[] = [];
        const domainContext: Record<string, unknown> = {};

        if (simpleName) {
          domainParts.push(
            "(self.metaModel.name = :simpleName or self.metaModel.fullName = :rawModel or self.metaModel.fullName like :wildcard)"
          );
          domainContext.simpleName = simpleName;
          domainContext.rawModel = rawModel;
          domainContext.wildcard = `%.${simpleName}`;
        }

        if (query) {
          domainParts.push("(lower(self.name) like :q or lower(self.templateLink) like :q)");
          domainContext.q = `%${query.toLowerCase()}%`;
        }

        const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

        const birtRes = await this.client.search<Record<string, any>>(
          "com.axelor.apps.base.db.BirtTemplate",
          {
            limit,
            sortBy: ["name"],
            domain,
            domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
            fields: ["id", "name", "templateLink", "format", "metaModel", "templateEngineSelect"],
          }
        );

        (birtRes.data || []).forEach((r) => {
          results.push({
            id: r.id,
            name: r.name,
            templateType: "report",
            targetModel: r.metaModel?.name || r.metaModel?.fullName || undefined,
            format: r.format || "pdf",
            templateLink: r.templateLink || undefined,
            engine: r.templateEngineSelect === 1 ? "Jasper" : r.templateEngineSelect === 2 ? "BIRT" : undefined,
          });
        });
      } catch {
        // Module base not installed or no access
      }
    }

    // 2. Fetch Printing Templates (com.axelor.apps.base.db.PrintingTemplate)
    if (typeFilter === "all" || typeFilter === "printing") {
      try {
        const domainParts: string[] = [];
        const domainContext: Record<string, unknown> = {};

        if (simpleName) {
          domainParts.push(
            "(self.metaModel.name = :simpleName or self.metaModel.fullName = :rawModel or self.metaModel.fullName like :wildcard)"
          );
          domainContext.simpleName = simpleName;
          domainContext.rawModel = rawModel;
          domainContext.wildcard = `%.${simpleName}`;
        }

        if (query) {
          domainParts.push("lower(self.name) like :q");
          domainContext.q = `%${query.toLowerCase()}%`;
        }

        const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

        const printRes = await this.client.search<Record<string, any>>(
          "com.axelor.apps.base.db.PrintingTemplate",
          {
            limit,
            sortBy: ["name"],
            domain,
            domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
            fields: ["id", "name", "metaModel", "statusSelect", "toAttach"],
          }
        );

        (printRes.data || []).forEach((r) => {
          results.push({
            id: r.id,
            name: r.name,
            templateType: "printing",
            targetModel: r.metaModel?.name || r.metaModel?.fullName || undefined,
          });
        });
      } catch {
        // Ignore if not present
      }
    }

    // 3. Fetch Email / Message Templates (com.axelor.message.db.Template)
    if (typeFilter === "all" || typeFilter === "mail") {
      try {
        const domainParts: string[] = [];
        const domainContext: Record<string, unknown> = {};

        if (simpleName) {
          domainParts.push(
            "(self.metaModel.name = :simpleName or self.metaModel.fullName = :rawModel or self.metaModel.fullName like :wildcard)"
          );
          domainContext.simpleName = simpleName;
          domainContext.rawModel = rawModel;
          domainContext.wildcard = `%.${simpleName}`;
        }

        if (query) {
          domainParts.push("(lower(self.name) like :q or lower(self.subject) like :q)");
          domainContext.q = `%${query.toLowerCase()}%`;
        }

        const domain = domainParts.length > 0 ? domainParts.join(" and ") : undefined;

        const mailRes = await this.client.search<Record<string, any>>(
          "com.axelor.message.db.Template",
          {
            limit,
            sortBy: ["name"],
            domain,
            domainContext: Object.keys(domainContext).length > 0 ? domainContext : undefined,
            fields: ["id", "name", "subject", "metaModel", "isDefault", "mediaTypeSelect"],
          }
        );

        (mailRes.data || []).forEach((r) => {
          results.push({
            id: r.id,
            name: r.name,
            templateType: "mail",
            targetModel: r.metaModel?.name || r.metaModel?.fullName || undefined,
            subject: r.subject || undefined,
            isDefault: r.isDefault || undefined,
          });
        });
      } catch {
        // Ignore if not present
      }
    }

    return results.slice(0, limit);
  }

  /**
   * Trigger server-side report generation (BIRT/Jasper/PrintTemplate) and download/save the resulting document.
   */
  async generateReport(options: GenerateReportOptions): Promise<GenerateReportResult> {
    const rawModel = options.model.trim();
    const simpleModel = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;
    let fullModel = rawModel;

    if (!rawModel.includes(".")) {
      const metaModelRes = await this.client.search<Record<string, any>>("com.axelor.meta.db.MetaModel", {
        limit: 1,
        domain: "self.name = :simpleModel",
        domainContext: { simpleModel },
        fields: ["fullName"],
      });
      fullModel = metaModelRes.data?.[0]?.fullName || `com.axelor.apps.${simpleModel.toLowerCase()}.db.${simpleModel}`;
    }

    const recordId = options.recordId;

    // 1. Fetch live target record to obtain context (company, status, etc.)
    const record = await this.client.fetchById<Record<string, any>>(fullModel, recordId);
    if (!record) {
      throw new Error(`Record #${recordId} not found in model '${fullModel}'.`);
    }

    // 2. Resolve PrintingTemplate or BirtTemplate
    let printingTemplate: Record<string, any> | null = null;
    if (options.templateId) {
      printingTemplate = await this.client.fetchById<Record<string, any>>("com.axelor.apps.base.db.PrintingTemplate", options.templateId);
    }

    if (!printingTemplate) {
      const ptRes = await this.client.search<Record<string, any>>("com.axelor.apps.base.db.PrintingTemplate", {
        limit: 1,
        domain: "(self.metaModel.name = :simpleModel or self.metaModel.fullName = :fullModel) and self.statusSelect = 2",
        domainContext: { simpleModel, fullModel },
      });
      printingTemplate = ptRes.data?.[0] || null;
    }

    // 3. Resolve report action
    let actionName = options.reportAction?.trim();
    const context: Record<string, unknown> = {
      _company: record.company,
      company: record.company,
      reportType: options.reportType ?? 1,
    };

    // Specific model configurations
    if (simpleModel === "SaleOrder") {
      actionName = actionName || "action-sale-order-method-print-sale-order";
      context._saleOrderId = recordId;
      context.saleOrderId = recordId;
      context.saleOrderPrintTemplate = printingTemplate;
      context["$reportType"] = options.reportType ?? 1;
      context["$saleOrderPrintTemplate"] = printingTemplate;
    } else if (simpleModel === "Invoice") {
      actionName = actionName || "action-invoice-method-show-invoice";
      context._invoiceId = recordId;
      context.invoiceId = recordId;
      context._statusSelect = record.statusSelect;
      context._operationSubTypeSelect = record.operationSubTypeSelect;
      context.invoicePrintTemplate = printingTemplate;
      context["$reportType"] = options.reportType ?? 1;
      context["$invoicePrintTemplate"] = printingTemplate;
    } else if (simpleModel === "PurchaseOrder") {
      actionName = actionName || "action-purchase-order-method-print-purchase-order";
      context._purchaseOrderId = recordId;
      context.purchaseOrderId = recordId;
      context.purchaseOrderPrintTemplate = printingTemplate;
      context["$reportType"] = options.reportType ?? 1;
      context["$purchaseOrderPrintTemplate"] = printingTemplate;
    } else if (!actionName) {
      actionName = `action-${simpleModel.toLowerCase()}-method-print-${simpleModel.toLowerCase()}`;
      context[`_${simpleModel.toLowerCase()}Id`] = recordId;
    }

    // 4. Trigger print action
    const actionRes = await this.client.executeAction(actionName, "com.axelor.utils.db.Wizard", context);

    // 5. Extract generated report URL from action result views
    let reportUrl: string | undefined;
    let reportTitle: string | undefined;

    const dataItems = actionRes.data || [];
    for (const item of dataItems) {
      if (item.view) {
        reportTitle = item.view.title || reportTitle;
        const subViews = item.view.views || [];
        for (const sv of subViews) {
          if (sv.name && (sv.name.startsWith("ws/files/report/") || sv.name.startsWith("/ws/files/report/") || sv.name.includes("/report/"))) {
            reportUrl = sv.name.startsWith("/") ? sv.name : `/${sv.name}`;
            break;
          }
        }
      }
      if (reportUrl) break;
    }

    if (!reportUrl) {
      // Check if action returned an info/error message
      const errorMsg = dataItems.find((d) => d.error?.message || d.info?.message);
      throw new Error(
        `Failed to generate report for ${simpleModel} #${recordId}: ${errorMsg?.error?.message || errorMsg?.info?.message || "No report download URL returned by Axelor action."}`
      );
    }

    // 6. Download binary report file
    const downloadRes = await (this.client as any).http.get(reportUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(downloadRes.data);
    const contentType = downloadRes.headers["content-type"] || "application/pdf";

    // Extract filename from URL or header
    let fileName = `${simpleModel}-${recordId}.pdf`;
    const urlMatch = reportUrl.match(/[?&]name=([^&]+)/);
    if (urlMatch && urlMatch[1]) {
      fileName = decodeURIComponent(urlMatch[1].replace(/\+/g, " "));
    } else {
      const slashPart = reportUrl.split("?")[0].split("/").pop();
      if (slashPart) fileName = slashPart;
    }

    let savedPath: string | undefined;
    if (options.outputPath) {
      let resolvedPath = path.resolve(options.outputPath);
      // If outputPath is a directory, append fileName
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        resolvedPath = path.join(resolvedPath, fileName);
      }
      const targetDir = path.dirname(resolvedPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, buffer);
      savedPath = resolvedPath;
    }

    const base64 = options.includeBase64 ? buffer.toString("base64") : undefined;

    return {
      model: fullModel,
      recordId,
      title: reportTitle,
      fileName,
      fileUrl: reportUrl,
      contentType,
      sizeBytes: buffer.length,
      savedPath,
      base64,
    };
  }
}
