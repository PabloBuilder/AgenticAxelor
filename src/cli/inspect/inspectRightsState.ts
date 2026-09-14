import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { DataService } from "../../services/dataService.js";
import { MenuService } from "../../services/menuService.js";
import { ViewService } from "../../services/viewService.js";

dotenv.config();

const client = new AxelorClient({
  baseUrl: process.env.AXELOR_URL || "http://localhost:8080/axelor-erp",
  username: process.env.AXELOR_USERNAME || "admin",
  password: process.env.AXELOR_PASSWORD || "admin",
});

const dataService = new DataService(client);
const menuService = new MenuService(client);
const viewService = new ViewService(client);

async function inspectAxelorState() {
  console.log("=== INSPECTION DE L'ÉTAT RÉEL AXELOR ===");
  try {
    await client.authenticate();
    console.log("✅ Authentifié sur Axelor");

    console.log("\n--- 1. Recherche des Groupes existants ---");
    const groups = await dataService.queryData({
      model: "com.axelor.auth.db.Group",
      fields: ["id", "name", "code", "roles"],
      limit: 20
    });
    console.log("Groupes trouvés :", JSON.stringify(groups.records, null, 2));

    console.log("\n--- 2. Recherche des Rôles existants ---");
    const roles = await dataService.queryData({
      model: "com.axelor.auth.db.Role",
      fields: ["id", "name", "code"],
      limit: 30
    });
    console.log("Rôles trouvés :", JSON.stringify(roles.records, null, 2));

    console.log("\n--- 3. Recherche des Utilisateurs (test / comptable) ---");
    const users = await dataService.queryData({
      model: "com.axelor.auth.db.User",
      fields: ["id", "name", "code", "group", "roles"],
      limit: 15
    });
    console.log("Utilisateurs trouvés :", JSON.stringify(users.records, null, 2));

    console.log("\n--- 4. Recherche des Menus liés aux droits ---");
    const groupMenus = await menuService.searchMenu("Group", 5);
    const userMenus = await menuService.searchMenu("User", 5);
    const roleMenus = await menuService.searchMenu("Role", 5);
    console.log("Menus Groupes :", groupMenus.map(m => `[${m.name}] ${m.title} -> ${m.action || m.breadcrumb}`));
    console.log("Menus Utilisateurs :", userMenus.map(m => `[${m.name}] ${m.title} -> ${m.action || m.breadcrumb}`));
    console.log("Menus Rôles :", roleMenus.map(m => `[${m.name}] ${m.title} -> ${m.action || m.breadcrumb}`));

    console.log("\n--- 5. Recherche des MetaPermission / Permissions ---");
    try {
      const perms = await dataService.queryData({
        model: "com.axelor.meta.db.MetaPermission",
        fields: ["id", "name", "condition"],
        limit: 10
      });
      console.log("MetaPermissions :", perms.records);
    } catch (e: any) {
      console.log("MetaPermission query note:", e.message);
    }

  } catch (err: any) {
    console.error("Erreur inspection:", err.message);
  }
}

inspectAxelorState();
