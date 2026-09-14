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

async function findExactSaleAndPaymentPerms() {
  // 1. SaleOrder
  const sale = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object like '%SaleOrder%' or self.name like '%saleOrder%' or self.name like '%SaleOrder%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 10
  });
  console.log("📌 Permissions SaleOrder :");
  sale.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" (object: ${p.object}) -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate}`));

  // 2. Invoice
  const invoice = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object = 'com.axelor.apps.account.db.Invoice'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 10
  });
  console.log("\n📌 Permissions Invoice :");
  invoice.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate} d:${p.canRemove} e:${p.canExport}`));

  // 3. Payment / PaymentSchedule
  const payment = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.object like '%Payment%' and self.name not like '%Configurator%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"],
    limit: 20
  });
  console.log("\n📌 Permissions Payment :");
  payment.data.data?.forEach((p: any) => console.log(`   - [ID: ${p.id}] "${p.name}" (object: ${p.object}) -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate}`));
}

findExactSaleAndPaymentPerms();
