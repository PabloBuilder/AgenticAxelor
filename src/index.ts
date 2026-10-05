import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AxelorClient } from "./services/axelorClient.js";
import { MenuService } from "./services/menuService.js";
import { ViewService } from "./services/viewService.js";
import { SchemaService } from "./services/schemaService.js";
import { DmsService } from "./services/dmsService.js";
import { ReportService } from "./services/reportService.js";
import { BpmService } from "./services/bpmService.js";
import { AuditService } from "./services/auditService.js";
import { DataService } from "./services/dataService.js";
import { GuidanceService } from "./services/guidanceService.js";
import { BridgeClient } from "./services/bridgeClient.js";
import { SessionStore } from "./services/sessionStore.js";

dotenv.config();

const baseUrl = process.env.AXELOR_URL || "http://localhost:8080/axelor-erp";
const username = process.env.AXELOR_USERNAME || "admin";
const password = process.env.AXELOR_PASSWORD || "admin";
const apiKey = process.env.AXELOR_API_KEY;
const bridgePort = parseInt(process.env.BRIDGE_PORT || "3210", 10);

const axelorClient = new AxelorClient({
  baseUrl,
  username,
  password,
  apiKey,
});

const menuService = new MenuService(axelorClient);
const viewService = new ViewService(axelorClient);
const schemaService = new SchemaService(axelorClient);
const dmsService = new DmsService(axelorClient);
const reportService = new ReportService(axelorClient);
const bpmService = new BpmService(axelorClient);
const auditService = new AuditService(axelorClient);
const dataService = new DataService(axelorClient);
const guidanceService = new GuidanceService(menuService, viewService);
const bridgeClient = new BridgeClient(bridgePort);

const server = new McpServer({
  name: "agentic-axelor-mcp",
  version: "0.1.0",
});

server.tool(
  "search_axelor_menu",
  "Search Axelor ERP menus by keyword and return matching items with their full hierarchical breadcrumb path (Parent > Submenu > Item).",
  {
    keyword: z.string().describe("Keyword to match against menu titles or technical names (e.g., 'Stock', 'Séquences', 'Factures')"),
    limit: z.number().optional().describe("Maximum number of results to return (default: 20)"),
  },
  async ({ keyword, limit }) => {
    try {
      const results = await menuService.searchMenu(keyword, limit ?? 20);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No Axelor menu found matching "${keyword}".`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error searching Axelor menu: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "inspect_axelor_view",
  "Inspect Axelor ERP views (form/grid) by view name or model name, prioritizing canonical primary views and returning parsed fields, panels/tabs hierarchy, and widgets.",
  {
    nameOrModel: z.string().describe("Technical view name (e.g. 'sale-order-form', 'partner-form') or model name (e.g. 'com.axelor.sale.db.SaleOrder')"),
    viewType: z.enum(["form", "grid", "all"]).optional().describe("Type of view to filter by ('form', 'grid', or 'all'). Defaults to 'all'"),
    hierarchical: z.boolean().optional().describe("Whether to include panel/tab hierarchy structure (default: true)"),
    includeXml: z.boolean().optional().describe("Whether to include raw view XML definition (default: false)"),
    limit: z.number().optional().describe("Maximum number of views to inspect (default: 5)"),
  },
  async ({ nameOrModel, viewType, hierarchical, includeXml, limit }) => {
    try {
      const results = await viewService.inspectView({
        nameOrModel,
        viewType,
        includeXml,
        limit: limit ?? 5,
      });

      if (!hierarchical && hierarchical !== undefined) {
        results.forEach((r) => {
          delete r.panels;
        });
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No Axelor views found matching "${nameOrModel}".`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error inspecting Axelor view: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "inspect_axelor_model",
  "Introspect an Axelor JPA entity schema and its field definitions directly via MetaModel and MetaField metadata.",
  {
    model: z.string().describe("Technical full model name (e.g. 'com.axelor.apps.sale.db.SaleOrder') or simple entity name (e.g. 'SaleOrder', 'Partner')"),
    relationshipOnly: z.boolean().optional().describe("If true, only returns relational fields (ManyToOne, OneToMany, ManyToMany, OneToOne). Default: false"),
  },
  async ({ model, relationshipOnly }) => {
    try {
      const result = await schemaService.inspectModel({
        model,
        relationshipOnly,
      });

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `No Axelor model found matching "${model}". Verify the entity name or full package path.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error inspecting Axelor model: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "search_axelor_models",
  "Search available Axelor JPA entity models by keyword (matching name, full package, table name, or title) or filter by package name.",
  {
    query: z.string().optional().describe("Keyword to match against model name, full name, table name, or title (e.g. 'Invoice', 'Partner', 'Stock', 'SaleOrder')"),
    packageName: z.string().optional().describe("Filter models by package name (e.g. 'com.axelor.apps.sale.db', 'com.axelor.apps.account.db')"),
    limit: z.number().optional().describe("Maximum number of models to return (default: 20)"),
  },
  async ({ query, packageName, limit }) => {
    try {
      const results = await schemaService.searchModels({
        query,
        packageName,
        limit: limit ?? 20,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No Axelor models found matching the search criteria (query: "${query || "none"}", package: "${packageName || "none"}").`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error searching Axelor models: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "inspect_axelor_selections",
  "Inspect selection dictionaries and enum options (MetaSelect / MetaSelectItem) for dropdown fields (e.g. statusSelect, typeSelect) with titles, technical values, colors, and order.",
  {
    name: z.string().optional().describe("Technical name of the MetaSelect list (e.g. 'sale.order.status.select', 'invoice.status.select')"),
    model: z.string().optional().describe("Target entity model (e.g. 'SaleOrder', 'Invoice', 'Partner') when resolving a field's selection list"),
    field: z.string().optional().describe("Field name on the model (e.g. 'statusSelect', 'typeSelect') to inspect its underlying selection dictionary"),
    query: z.string().optional().describe("Keyword search matching selection list name"),
    limit: z.number().optional().describe("Maximum number of selection lists to return (default: 20)"),
  },
  async ({ name, model, field, query, limit }) => {
    try {
      const results = await schemaService.inspectSelections({
        name,
        model,
        field,
        query,
        limit: limit ?? 20,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No Axelor selection lists found matching criteria (name: "${name || "none"}", model: "${model || "none"}", field: "${field || "none"}", query: "${query || "none"}").`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error inspecting Axelor selections: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_axelor_schema_relations",
  "Explore relational dependencies, foreign keys, and ERD links (outgoing & incoming ManyToOne, OneToMany, ManyToMany) for any Axelor model.",
  {
    model: z.string().describe("Target entity model (e.g. 'SaleOrder', 'com.axelor.apps.sale.db.SaleOrder', 'Partner', 'Invoice')"),
    direction: z.enum(["all", "outgoing", "incoming"]).optional().describe("Filter relations by direction: 'outgoing' (foreign keys on this model), 'incoming' (other models referencing this model), or 'all' (default: 'all')"),
    relationshipType: z.enum(["ManyToOne", "OneToMany", "ManyToMany", "OneToOne"]).optional().describe("Filter by relationship type (e.g. 'ManyToOne', 'OneToMany')"),
    limit: z.number().optional().describe("Maximum number of relations to return per direction (default: 50)"),
  },
  async ({ model, direction, relationshipType, limit }) => {
    try {
      const results = await schemaService.getSchemaRelations({
        model,
        direction,
        relationshipType,
        limit: limit ?? 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error querying schema relations: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "inspect_axelor_custom_fields",
  "Inspect dynamic custom fields, Studio JSON attributes (stored in 'attrs'), transient $fields, and customized views (MetaViewCustom) for an entity model.",
  {
    model: z.string().describe("Target entity model (e.g. 'Partner', 'SaleOrder', 'Product', 'InterventionQuestion')"),
    viewName: z.string().optional().describe("Optional specific view name to inspect for custom or transient fields (e.g. 'product-grid', 'sale-order-form')"),
  },
  async ({ model, viewName }) => {
    try {
      const results = await schemaService.inspectCustomFields({
        model,
        viewName,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error inspecting custom fields for model ${model}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_axelor_attachments",
  "List attached files and documents linked to any Axelor business record with direct download URLs.",
  {
    model: z.string().describe("Technical full model name (e.g. 'com.axelor.apps.sale.db.SaleOrder') or simple entity name (e.g. 'SaleOrder', 'Partner', 'Invoice')"),
    recordId: z.number().describe("ID of the Axelor business record"),
    limit: z.number().optional().describe("Maximum number of attachments to return (default: 20)"),
  },
  async ({ model, recordId, limit }) => {
    try {
      const results = await dmsService.getAttachments({
        model,
        recordId,
        limit: limit ?? 20,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No attachments found for ${model} (ID: ${recordId}).`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error fetching attachments: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "upload_axelor_attachment",
  "Attach a document or file (from local disk path or inline content) to any Axelor business record.",
  {
    model: z.string().describe("Technical full model name (e.g. 'com.axelor.apps.sale.db.SaleOrder') or simple entity name (e.g. 'SaleOrder', 'Partner', 'Invoice')"),
    recordId: z.number().describe("ID of the Axelor business record to attach the document to"),
    fileName: z.string().describe("File name with extension (e.g. 'audit_note.txt', 'devis_signe.pdf')"),
    content: z.string().optional().describe("Inline content of the file (plain text string or Base64 encoded data)"),
    localFilePath: z.string().optional().describe("Absolute or relative path to a file on local filesystem to upload"),
    fileType: z.string().optional().describe("MIME type of the file (e.g. 'text/plain', 'application/pdf'). Inferred automatically if omitted."),
    description: z.string().optional().describe("Optional note or description for the attachment"),
  },
  async ({ model, recordId, fileName, content, localFilePath, fileType, description }) => {
    try {
      if (!content && !localFilePath) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Either 'content' (inline text/base64) or 'localFilePath' must be provided to upload an attachment.",
            },
          ],
        };
      }

      const result = await dmsService.uploadAttachment({
        model,
        recordId,
        fileName,
        content,
        localFilePath,
        fileType,
        description,
      });

      return {
        content: [
          {
            type: "text",
            text: `Attachment successfully uploaded and linked to ${model} (ID: ${recordId}):\n\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error uploading attachment: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "download_axelor_attachment",
  "Download a DMS attachment by fileId with option to save it directly to a local disk path or receive it as base64 content.",
  {
    fileId: z.number().describe("ID of the MetaFile record to download (obtained from 'get_axelor_attachments')"),
    outputPath: z.string().optional().describe("Local file path where to save the downloaded file (e.g. './downloads/facture.pdf')"),
    includeBase64: z.boolean().optional().describe("Whether to include base64-encoded file content in the JSON response (default: false)"),
  },
  async ({ fileId, outputPath, includeBase64 }) => {
    try {
      const result = await dmsService.downloadAttachment({
        fileId,
        outputPath,
        includeBase64,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error downloading attachment: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "list_axelor_templates",
  "List available print templates, BIRT/Jasper reports, and email templates for an entity model or across the ERP system.",
  {
    model: z.string().optional().describe("Filter templates by target entity model (e.g. 'SaleOrder', 'com.axelor.apps.sale.db.SaleOrder', 'Invoice')"),
    templateType: z.enum(["report", "mail", "printing", "all"]).optional().describe("Filter by template category: 'report' (BIRT/Jasper), 'mail' (email templates), 'printing' (printing configs), or 'all' (default: 'all')"),
    query: z.string().optional().describe("Keyword search matching template name, link, or subject"),
    limit: z.number().optional().describe("Maximum templates to return (default: 20)"),
  },
  async ({ model, templateType, query, limit }) => {
    try {
      const results = await reportService.listTemplates({
        model,
        templateType,
        query,
        limit: limit ?? 20,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No templates found matching the criteria (model: "${model || "all"}", type: "${templateType || "all"}", query: "${query || "none"}").`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error listing templates: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "generate_axelor_report",
  "Generate a printable document (PDF, Word, Excel) or BIRT/Jasper report for an ERP record with optional local saving.",
  {
    model: z.string().describe("Technical entity model name (e.g. 'SaleOrder', 'Invoice', 'PurchaseOrder', 'com.axelor.apps.sale.db.SaleOrder')"),
    recordId: z.number().describe("ID of the target entity record to generate the report for"),
    reportAction: z.string().optional().describe("Explicit report action name if custom (e.g. 'action-sale-order-method-print-sale-order')"),
    templateId: z.number().optional().describe("Specific PrintingTemplate ID to use (auto-resolved from active templates if omitted)"),
    reportType: z.number().optional().describe("Report variant type index (default: 1)"),
    outputPath: z.string().optional().describe("Local file or directory path where to save the generated report (e.g. './reports/Facture-1.pdf')"),
    includeBase64: z.boolean().optional().describe("Whether to include base64-encoded file content in the JSON response (default: false)"),
  },
  async ({ model, recordId, reportAction, templateId, reportType, outputPath, includeBase64 }) => {
    try {
      const result = await reportService.generateReport({
        model,
        recordId,
        reportAction,
        templateId,
        reportType,
        outputPath,
        includeBase64,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error generating report for ${model} #${recordId}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_axelor_bpm_state",
  "Inspect active BPMN workflow instances, current execution stages, assigned tasks, and blocking errors for an ERP record or process.",
  {
    model: z.string().optional().describe("Target entity model to filter workflow instances (e.g. 'SaleOrder', 'com.axelor.apps.sale.db.SaleOrder', 'Invoice')"),
    recordId: z.number().optional().describe("ID of the business record linked to the workflow instance"),
    instanceId: z.string().optional().describe("Unique process instance ID (e.g. '12345')"),
    limit: z.number().optional().describe("Maximum workflow instances to return (default: 20)"),
  },
  async ({ model, recordId, instanceId, limit }) => {
    try {
      const results = await bpmService.getBpmState({
        model,
        recordId,
        instanceId,
        limit: limit ?? 20,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No active BPM workflow instances found (model: "${model || "all"}", recordId: "${recordId || "none"}", instanceId: "${instanceId || "none"}").`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error fetching BPM workflow state: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "export_axelor_data",
  "Export large datasets from any Axelor model to CSV or JSON with automatic pagination loop, field selection, domain filters, and optional local file saving.",
  {
    model: z.string().describe("Technical full model name (e.g. 'com.axelor.apps.base.db.Partner', 'com.axelor.apps.sale.db.SaleOrder') or simple entity name"),
    fields: z.array(z.string()).optional().describe("List of field names to export (e.g. ['id', 'name', 'code', 'emailAddress.address'])"),
    domain: z.string().optional().describe("Axelor domain filter query (e.g. 'self.isCustomer = true')"),
    domainContext: z.record(z.any()).optional().describe("Named parameters for domain query"),
    sortBy: z.array(z.string()).optional().describe("Sorting expressions (e.g. ['-id'])"),
    maxRecords: z.number().optional().describe("Maximum total records to export across all pages (default: 1000)"),
    format: z.enum(["csv", "json"]).optional().describe("Export format: 'csv' or 'json' (default: 'csv')"),
    outputPath: z.string().optional().describe("Local file path to save the full exported data (e.g. './exports/partners.csv')"),
  },
  async ({ model, fields, domain, domainContext, sortBy, maxRecords, format, outputPath }) => {
    try {
      const result = await dataService.exportData({
        model,
        fields,
        domain,
        domainContext,
        sortBy,
        maxRecords,
        format,
        outputPath,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error exporting Axelor data: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_axelor_audit_log",
  "Query audit trails and historical field modifications (who changed what, previous value, new value, date) for any Axelor business record, model, or user.",
  {
    model: z.string().optional().describe("Target entity model (e.g. 'Partner', 'SaleOrder', 'Invoice')"),
    recordId: z.number().optional().describe("ID of the business record to query history for"),
    userCode: z.string().optional().describe("Filter audit trails by author user login (e.g. 'admin', 'jdupont')"),
    limit: z.number().optional().describe("Maximum audit logs to return (default: 20)"),
  },
  async ({ model, recordId, userCode, limit }) => {
    try {
      const results = await auditService.getAuditLog({
        model,
        recordId,
        userCode,
        limit: limit ?? 20,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No audit log entries found (model: "${model || "all"}", recordId: "${recordId || "none"}", user: "${userCode || "all"}").`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error querying audit logs: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "query_axelor_data",
  "Query business records of any Axelor model with optional field selection, domain filters, sorting, and pagination.",
  {
    model: z.string().describe("Full technical model name (e.g. 'com.axelor.apps.base.db.Partner', 'com.axelor.apps.sale.db.SaleOrder')"),
    fields: z.array(z.string()).optional().describe("List of field names to retrieve (e.g. ['id', 'name', 'code', 'statusSelect'])"),
    domain: z.string().optional().describe("Axelor domain filter query (e.g. 'self.isCustomer = true and self.name like :name')"),
    domainContext: z.record(z.any()).optional().describe("Named parameters for domain query (e.g. { name: '%Dupont%' })"),
    sortBy: z.array(z.string()).optional().describe("Sorting expressions (e.g. ['-id', 'name'])"),
    limit: z.number().optional().describe("Maximum records to fetch (default: 20)"),
    offset: z.number().optional().describe("Offset for pagination (default: 0)"),
  },
  async ({ model, fields, domain, domainContext, sortBy, limit, offset }) => {
    try {
      const result = await dataService.queryData({
        model,
        fields,
        domain,
        domainContext,
        sortBy,
        limit,
        offset,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error querying Axelor data for model ${model}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "fetch_axelor_record",
  "Fetch a single Axelor record by model name and record ID.",
  {
    model: z.string().describe("Full technical model name (e.g. 'com.axelor.apps.base.db.Partner')"),
    id: z.number().describe("Record ID"),
    fields: z.array(z.string()).optional().describe("Optional list of specific field names to retrieve"),
  },
  async ({ model, id, fields }) => {
    try {
      const record = await dataService.fetchRecord(model, id, fields);

      if (!record) {
        return {
          content: [
            {
              type: "text",
              text: `No record found in model "${model}" with ID ${id}.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(record, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error fetching record ${id} from model ${model}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "save_axelor_record",
  "Create or update a record for any Axelor model. Provide 'id' and 'version' inside record for updating an existing entity, or omit them to create a new one.",
  {
    model: z.string().describe("Full technical model name (e.g. 'com.axelor.apps.base.db.Partner', 'com.axelor.apps.sale.db.SaleOrder')"),
    record: z.record(z.any()).describe("Key-value attributes of the entity to persist (e.g. { name: 'ACME Corp', isCustomer: true })"),
  },
  async ({ model, record }) => {
    try {
      const result = await dataService.saveRecord(model, record);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error saving record in model ${model}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "delete_axelor_record",
  "Delete a record by model name, record ID, and optional version (optimistic lock).",
  {
    model: z.string().describe("Full technical model name (e.g. 'com.axelor.apps.base.db.Partner')"),
    id: z.number().describe("Record ID to delete"),
    version: z.number().optional().describe("Optimistic locking version number if required"),
  },
  async ({ model, id, version }) => {
    try {
      const result = await dataService.deleteRecord(model, id, version);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error deleting record ${id} from model ${model}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "batch_axelor_operations",
  "Execute a sequence of multiple create, update, and delete operations across records or models in a single batch call.",
  {
    operations: z.array(
      z.object({
        type: z.enum(["create", "update", "delete"]).describe("Operation type: 'create', 'update', or 'delete'"),
        model: z.string().describe("Full technical model name (e.g. 'com.axelor.apps.base.db.Partner', 'com.axelor.apps.sale.db.SaleOrder')"),
        id: z.number().optional().describe("Record ID (required for 'update' and 'delete')"),
        version: z.number().optional().describe("Record version for optimistic locking (optional)"),
        data: z.record(z.any()).optional().describe("Record field values (required for 'create' and 'update')"),
      })
    ).describe("List of create, update, or delete operations to execute sequentially"),
    continueOnError: z.boolean().optional().describe("Whether to continue executing remaining operations if one fails (default: false)"),
  },
  async ({ operations, continueOnError }) => {
    try {
      const result = await dataService.batchOperations({
        operations,
        continueOnError: continueOnError ?? false,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error executing batch operations: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "execute_axelor_action",
  "Execute an Axelor Action (action-method, action-record, action-attrs, action-group) via /ws/action with contextual entity data.",
  {
    action: z.string().describe("Technical name of the action (e.g. 'action-sale-order-group-confirm', 'action-partner-attrs')"),
    model: z.string().optional().describe("Associated technical model name (e.g. 'com.axelor.apps.sale.db.SaleOrder')"),
    context: z.record(z.any()).optional().describe("Execution context payload including active record values or parameters"),
  },
  async ({ action, model, context }) => {
    try {
      const result = await dataService.runAction(action, model, context);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error executing Axelor action "${action}": ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "simulate_axelor_onchange",
  "Simulate UI onChange triggers to automatically compute dependent values (prices, taxes, payment terms, addresses) and UI field attributes before saving a record.",
  {
    model: z.string().describe("Target entity model (e.g. 'com.axelor.apps.sale.db.SaleOrder', 'SaleOrder', 'Invoice')"),
    record: z.record(z.any()).describe("Active record data payload containing current form values (e.g. { clientPartner: { id: 1 }, company: { id: 1 } })"),
    field: z.string().optional().describe("The field whose value changed (e.g. 'clientPartner', 'currency', 'priceList') to auto-resolve its onChange action from the form view"),
    action: z.string().optional().describe("Explicit technical action name (e.g. 'action-sale-order-method-client-partner-onchange') if known"),
    viewName: z.string().optional().describe("Specific form view name to resolve field onChange from (optional)"),
  },
  async ({ model, record, field, action, viewName }) => {
    try {
      const result = await dataService.simulateOnChange({
        model,
        record,
        field,
        action,
        viewName,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error simulating onChange for model ${model}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "sync_axelor_session",
  "Check and adopt the Axelor browser session saved by the extension. This tool takes no cookie or URL input. If the session is missing, sign in to Axelor in your browser and sync with the extension. If the session is expired, sign in again in the browser and sync again; never paste a cookie into chat or .env.",
  {},
  async () => {
    try {
      const session = SessionStore.loadSessionStatus();
      if (!session) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "No synchronized Axelor browser session was found. Sign in to Axelor in your browser, then use the extension's sync button and try again. Do not paste a cookie into chat or .env.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Using the Axelor browser session saved by the extension. If Axelor rejects it as expired, sign in through the browser and sync again with the extension. Never paste a cookie into chat or .env.",
              url: session.url,
              updatedAt: session.updatedAt,
            }, null, 2),
          },
        ],
      };
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Could not read the saved Axelor browser session. Sign in to Axelor in your browser, then sync with the extension and try again. Do not paste a cookie into chat or .env.",
          },
        ],
      };
    }
  }
);

server.tool(
  "guide_axelor_path",
  "Calculate a navigation route (menu breadcrumbs, new button, target fields) and store it in the local Bridge. The current extension does not display guides in the browser.",
  {
    targetMenu: z.string().optional().describe("Menu keyword or section title to navigate to (e.g. 'Commandes clients', 'Sequences')"),
    targetModel: z.string().optional().describe("Axelor technical model name (e.g. 'com.axelor.apps.sale.db.SaleOrder')"),
    targetField: z.string().optional().describe("Target field name on the form for the route (e.g. 'clientPartner', 'currency')"),
    description: z.string().optional().describe("User intent or summary of the guided action"),
  },
  async ({ targetMenu, targetModel, targetField, description }) => {
    try {
      const route = await guidanceService.resolveRoute({
        targetMenu,
        targetModel,
        targetField,
        description,
      });

      // Push roadmap to the local bridge for the browser extension spotlight
      await bridgeClient.pushRoute(route);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Guidance route "${route.title}" stored in the local Bridge (127.0.0.1:${bridgePort}). The current extension does not display guides.`,
                totalSteps: route.totalSteps,
                steps: route.steps.map((s, idx) => ({
                  step: idx + 1,
                  type: s.type,
                  label: s.label,
                  hint: s.hint,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error resolving guidance route: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "clear_axelor_guide",
  "Clear the guidance route stored in the local Bridge. The current extension does not display guides in the browser.",
  {},
  async () => {
    try {
      await bridgeClient.clearRoute();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, message: "Guidance route cleared from the local Bridge; the current extension has no guide display." }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error clearing guidance: ${error.message || String(error)}`,
          },
        ],
      };
    }
  }
);

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error("Fatal error starting AgenticAxelor MCP server:", error);
  process.exit(1);
});


