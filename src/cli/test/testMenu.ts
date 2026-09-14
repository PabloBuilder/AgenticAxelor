import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { MenuService } from "../../services/menuService.js";

dotenv.config();

async function main() {
  const keyword = process.argv[2] || "Stock";
  const baseUrl = process.env.AXELOR_URL || "http://localhost:8080/axelor-erp";
  const username = process.env.AXELOR_USERNAME || "admin";
  const password = process.env.AXELOR_PASSWORD || "admin";
  const apiKey = process.env.AXELOR_API_KEY;
  const cookie = process.env.AXELOR_COOKIE;

  console.log(`[TestMenu] Connecting to Axelor at ${baseUrl}...`);
  console.log(`[TestMenu] Searching menu keyword: "${keyword}"`);

  const client = new AxelorClient({
    baseUrl,
    username,
    password,
    apiKey,
    cookie,
  });

  const menuService = new MenuService(client);

  try {
    const results = await menuService.searchMenu(keyword);
    console.log(`\n[TestMenu] Found ${results.length} results:\n`);

    if (results.length === 0) {
      console.log("No menu found matching keyword.");
      return;
    }

    results.forEach((item, index) => {
      console.log(`${index + 1}. [${item.name}] ${item.title}`);
      console.log(`   Breadcrumb: ${item.breadcrumb}`);
      if (item.action) {
        console.log(`   Action: ${item.action}`);
      }
      console.log("");
    });
  } catch (error: any) {
    console.error("[TestMenu] Error executing search:", error.message || error);
    process.exit(1);
  }
}

main();
