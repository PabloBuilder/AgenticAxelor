import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { ViewService } from "../../services/viewService.js";
import { ViewPanelInfo, ViewFieldInfo } from "../../types/axelor.js";

dotenv.config();

const baseUrl = process.env.AXELOR_URL || "http://localhost:8080/axelor-erp";
const username = process.env.AXELOR_USERNAME || "admin";
const password = process.env.AXELOR_PASSWORD || "admin";
const apiKey = process.env.AXELOR_API_KEY;
const cookie = process.env.AXELOR_COOKIE;

const query = process.argv[2] || "sale-order-form";
const viewType = (process.argv[3] as "form" | "grid" | "all") || "all";

function renderField(f: ViewFieldInfo, indent: string = "     "): string {
  const details: string[] = [];
  if (f.title) details.push(`title: "${f.title}"`);
  if (f.widget) details.push(`widget: ${f.widget}`);
  if (f.target) details.push(`target: ${f.target}`);
  if (f.type) details.push(`type: ${f.type}`);
  if (f.required) details.push(`required`);
  if (f.readonly) details.push(`readonly`);
  const detailStr = details.length > 0 ? ` (${details.join(", ")})` : "";
  return `${indent}- ${f.name}${detailStr}`;
}

function renderPanelTree(panel: ViewPanelInfo, depth: number = 1): void {
  const indent = "   ".repeat(depth);
  const panelName = panel.title || panel.name || "Untitled Panel";
  console.log(`${indent}📁 [${panel.itemType}] ${panelName}`);

  panel.fields.forEach((f) => {
    console.log(renderField(f, indent + "  "));
  });

  if (panel.panels) {
    panel.panels.forEach((sub) => renderPanelTree(sub, depth + 1));
  }
}

async function main() {
  console.log(`[TestView] Connecting to Axelor at ${baseUrl}...`);

  const client = new AxelorClient({
    baseUrl,
    username,
    password,
    apiKey,
    cookie,
  });

  const viewService = new ViewService(client);

  console.log(`[TestView] Inspecting view/model: "${query}" (type: ${viewType})...\n`);

  try {
    const views = await viewService.inspectView({
      nameOrModel: query,
      viewType,
      limit: 5,
    });

    if (views.length === 0) {
      console.log(`[TestView] No views found matching "${query}".`);
      return;
    }

    console.log(`[TestView] Found ${views.length} view(s):\n`);

    views.forEach((v, index) => {
      const primaryTag = v.isPrimary ? " ⭐ [PRIMARY]" : "";
      const scoreStr = v.priorityScore !== undefined ? ` (score: ${v.priorityScore})` : "";
      console.log(`${index + 1}. [${v.name}] ${v.title || "Untitled"} (${v.type})${primaryTag}${scoreStr}`);
      console.log(`   Model: ${v.model || "N/A"}`);
      console.log(`   Total Fields: ${v.fields.length}`);

      if (v.panels && v.panels.length > 0) {
        console.log(`   Hierarchy / Panels:`);
        v.panels.forEach((p) => renderPanelTree(p, 2));
      } else {
        console.log(`   Fields (flat list):`);
        v.fields.slice(0, 10).forEach((f) => {
          console.log(renderField(f));
        });
        if (v.fields.length > 10) {
          console.log(`     ... and ${v.fields.length - 10} more fields`);
        }
      }
      console.log("");
    });
  } catch (error: any) {
    console.error(`[TestView] Error during inspection:`, error.message || error);
    process.exit(1);
  }
}

main();
