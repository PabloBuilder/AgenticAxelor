import dotenv from "dotenv";
import axios from "axios";
import { SessionStore } from "../../services/sessionStore.js";

dotenv.config();

const session = SessionStore.loadSession();
const baseURL = session?.url || process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp";
const cookie = session?.cookie || process.env.AXELOR_COOKIE || "";

const api = axios.create({
  baseURL,
  headers: {
    "Cookie": cookie,
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

async function findExactPermissions() {
  console.log("=== RECHERCHE DES PERMISSIONS EXACTES (com.axelor.auth.db.Permission) ===");
  
  // 1. Permissions SaleOrder
  const salePerms = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object like '%SaleOrder%' or self.name like '%SaleOrder%' or self.name like '%perm.sale%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 20
  });
  console.log("\n📌 Permissions SaleOrder :");
  salePerms.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" (object: ${p.object}) -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate} d:${p.canRemove}`));

  // 2. Permissions Invoice
  const invoicePerms = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object like '%Invoice%' or self.name like '%Invoice%' or self.name like '%perm.account.Invoice%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 20
  });
  console.log("\n📌 Permissions Invoice :");
  invoicePerms.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" (object: ${p.object}) -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate} d:${p.canRemove}`));

  // 3. Permissions Payment / Account
  const paymentPerms = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object like '%Payment%' or self.name like '%Payment%' or self.object like '%Account%' or self.name like '%Account%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 30
  });
  console.log("\n📌 Permissions Payment / Account :");
  paymentPerms.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" (object: ${p.object}) -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate} d:${p.canRemove}`));
}

findExactPermissions();
