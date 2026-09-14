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

async function findSaleOrderPerms() {
  const sale = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object = 'com.axelor.apps.sale.db.SaleOrder' or self.name like '%perm.sale.SaleOrder%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 10
  });
  console.log("📌 Permissions SaleOrder exactes :");
  sale.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" (object: ${p.object}) -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate} d:${p.canRemove} e:${p.canExport}`));
}

findSaleOrderPerms();
