import dotenv from "dotenv";
import { GUIDE_REGISTRY } from "../guides/index.js";
import { GuidanceRoute } from "../types/guidance.js";
import { AxelorClient } from "../services/axelorClient.js";
import { MenuService } from "../services/menuService.js";
import { ViewService } from "../services/viewService.js";
import { GuidanceService } from "../services/guidanceService.js";

dotenv.config();

async function main() {
  const target = process.argv[2];

  if (!target) {
    console.log("Usage: npx tsx src/cli/guidePusher.ts <guide-id | menu-name> [model] [field]");
    console.log("\nAvailable pre-packaged guides:");
    Object.keys(GUIDE_REGISTRY).forEach((key) => {
      console.log(`  - ${key} ("${GUIDE_REGISTRY[key].title}")`);
    });
    process.exit(1);
  }

  let route: GuidanceRoute;

  if (GUIDE_REGISTRY[target]) {
    route = {
      ...GUIDE_REGISTRY[target],
      id: `${GUIDE_REGISTRY[target].id}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    console.log(`[GuidePusher] Selected pre-packaged guide: "${route.title}" (${route.steps.length} steps)`);
  } else {
    // Dynamic resolution via MenuService & ViewService
    console.log(`[GuidePusher] Resolving dynamic menu route for: "${target}"...`);
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

    route = await guidanceService.resolveRoute({
      targetMenu: target,
      targetModel: process.argv[3],
      targetField: process.argv[4],
      description: `Guide vers ${target}`,
    });
  }

  route.steps.forEach((s, idx) => {
    console.log(`  Step ${idx + 1}/${route.totalSteps || route.steps.length}: [${s.type}] ${s.label} -> "${s.hint}"`);
  });

  try {
    const res = await fetch("http://localhost:3210/api/guide/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    });

    if (res.ok) {
      console.log(`\n[GuidePusher] ✅ SUCCESS: Guidance route pushed to browser via bridge (localhost:3210)!`);
    } else {
      console.error(`\n[GuidePusher] ❌ Bridge responded with status: ${res.status}`);
    }
  } catch (err: any) {
    console.error(`\n[GuidePusher] ❌ Could not connect to bridge on localhost:3210 (${err.message}). Is MCP server running?`);
  }
}

main();
