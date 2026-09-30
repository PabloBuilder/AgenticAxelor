import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AxelorClient } from "./services/axelorClient.js";
import { MenuService } from "./services/menuService.js";
import { ViewService } from "./services/viewService.js";
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


