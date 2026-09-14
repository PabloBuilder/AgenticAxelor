import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { DataService } from "../../services/dataService.js";
import { MenuService } from "../../services/menuService.js";

dotenv.config();

const client = new AxelorClient({
  baseUrl: process.env.AXELOR_URL || "http://localhost:8080/axelor-erp",
  username: process.env.AXELOR_USERNAME || "admin",
  password: process.env.AXELOR_PASSWORD || "admin",
});

const dataService = new DataService(client);
const menuService = new MenuService(client);

async function inspect() {
  console.log("=== VERIFICATION DES ROLES & PERMISSIONS EXISTANTS ===");
  try {
    const roles = await dataService.queryData({
      model: "com.axelor.auth.db.Role",
      fields: ["id", "name", "code"],
      limit: 50
    });
    console.log("RÔLES :", JSON.stringify(roles.records, null, 2));

    const perms = await dataService.queryData({
      model: "com.axelor.auth.db.Permission",
      fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
      limit: 50
    });
    console.log("PERMISSIONS :", JSON.stringify(perms.records, null, 2));

    const menus = await menuService.searchMenu("Comptabilité", 10);
    console.log("MENUS COMPTA :", JSON.stringify(menus, null, 2));
  } catch (err: any) {
    console.error("Erreur inspection :", err.message);
  }
}

inspect();
