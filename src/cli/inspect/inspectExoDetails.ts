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

async function inspectExo3Group() {
  console.log("=== INSPECTION DU GROUPE COMPTABILITÉ (ID 29) & UTILISATEUR TEST (ID 26) ===");

  // 1. Fiche du groupe Comptabilité
  const groupRes = await api.post(`/ws/rest/com.axelor.auth.db.Group/search`, {
    data: {
      _domain: "self.id = 29"
    },
    fields: ["id", "name", "code", "roles", "permissions", "rules"],
    limit: 1
  });
  console.log("\n📌 Groupe Comptabilité (ID: 29) :", JSON.stringify(groupRes.data.data?.[0], null, 2));

  // 2. Fiche de l'utilisateur Tester Exo3
  const userRes = await api.post(`/ws/rest/com.axelor.auth.db.User/search`, {
    data: {
      _domain: "self.id = 26"
    },
    fields: ["id", "name", "code", "group", "roles"],
    limit: 1
  });
  console.log("\n📌 Utilisateur Test (ID: 26 - exo.3) :", JSON.stringify(userRes.data.data?.[0], null, 2));

  // 3. Rôles liés à la facturation & paiement
  const rolesRes = await api.post(`/ws/rest/com.axelor.auth.db.Role/search`, {
    data: {
      _domain: "self.name like '%Account%' or self.name like '%Sale%' or self.name like '%Invoice%' or self.name like '%Payment%'"
    },
    fields: ["id", "name", "code"],
    limit: 20
  });
  console.log("\n📌 Rôles Standards Disponibles :");
  rolesRes.data.data?.forEach((r: any) => console.log(`   - [ID: ${r.id}] ${r.name} (${r.code || 'sans code'})`));
}

inspectExo3Group();
