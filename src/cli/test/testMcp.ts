import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { DataService } from "../../services/dataService.js";
import { MenuService } from "../../services/menuService.js";

dotenv.config();

const client = new AxelorClient({
  baseUrl: process.env.AXELOR_URL || "http://localhost:8080/axelor-erp",
  username: process.env.AXELOR_USERNAME || "admin",
  password: process.env.AXELOR_PASSWORD || "admin",
  cookie: process.env.AXELOR_COOKIE,
});

const dataService = new DataService(client);
const menuService = new MenuService(client);

async function testMcpDirect() {
  console.log("=== TEST DIRECT DU SERVEUR MCP AXELOR ===");
  console.log("Base URL configurée :", process.env.AXELOR_URL || "http://localhost:8080/axelor-erp");

  try {
    console.log("\n1. Test Authentification...");
    await client.authenticate();
    console.log(" -> Authentification réussie !");

    console.log("\n2. Test Recherche de Menus (Sale)...");
    const menus = await menuService.searchMenu("Sale", 3);
    console.log(" -> Menus trouvés :", menus.map(m => `[${m.name}] ${m.title}`).join(", "));

    console.log("\n3. Test Requête Données (com.axelor.auth.db.Role)...");
    const roles = await dataService.queryData({
      model: "com.axelor.auth.db.Role",
      fields: ["id", "name", "code"],
      limit: 3
    });
    console.log(" -> Rôles retournés :", roles.records.map((r: any) => `${r.name} (${r.code})`).join(", "));

    console.log("\n>>> BILAN : LE CLIENT MCP EST 100% FONCTIONNEL ! <<<");
  } catch (err: any) {
    console.error("\nErreur de test :", err.message);
  }
}

testMcpDirect();
