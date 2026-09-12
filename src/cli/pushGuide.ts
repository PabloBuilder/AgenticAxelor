import dotenv from "dotenv";
import { AxelorClient } from "../services/axelorClient.js";
import { MenuService } from "../services/menuService.js";
import { ViewService } from "../services/viewService.js";
import { GuidanceService } from "../services/guidanceService.js";

dotenv.config();

async function main() {
  const targetMenu = process.argv[2] || "Sequences";
  const targetModel = process.argv[3];
  const targetField = process.argv[4];

  const baseUrl = process.env.AXELOR_URL || "http://localhost:8080/axelor-erp";
  const username = process.env.AXELOR_USERNAME || "admin";
  const password = process.env.AXELOR_PASSWORD || "admin";
  const apiKey = process.env.AXELOR_API_KEY;
  const cookie = process.env.AXELOR_COOKIE;

  const client = new AxelorClient({
    baseUrl,
    username,
    password,
    apiKey,
    cookie,
  });

  const menuService = new MenuService(client);
  const viewService = new ViewService(client);
  const guidanceService = new GuidanceService(menuService, viewService);

  console.log(`[PushGuide] Resolving route for: "${targetMenu}"...`);
  const route = await guidanceService.resolveRoute({
    targetMenu,
    targetModel,
    targetField,
    description: `Guide vers ${targetMenu}`,
  });

  console.log(`[PushGuide] Resolved ${route.steps.length} steps:`);
  route.steps.forEach((s, idx) => {
    console.log(`  Step ${idx + 1}: [${s.type}] ${s.label} -> "${s.hint}"`);
  });

  // Push to local bridge server
  try {
    const res = await fetch("http://localhost:3210/api/guide/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    });

    if (res.ok) {
      console.log(`\n[PushGuide] SUCCESS: Route pushed to browser via bridge (localhost:3210)!`);
    } else {
      console.error(`[PushGuide] Bridge responded with status ${res.status}`);
    }
  } catch (err: any) {
    console.error(`[PushGuide] Could not connect to bridge on localhost:3210 (${err.message}). Is MCP server running?`);
  }
}

main();
