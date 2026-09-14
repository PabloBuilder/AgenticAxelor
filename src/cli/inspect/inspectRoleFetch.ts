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

async function inspectRoleFetch() {
  const roleRes = await api.post(`/ws/rest/com.axelor.auth.db.Role/search`, {
    data: {
      _domain: "self.id = 115"
    },
    fields: ["id", "name", "code", "permissions", "roles"],
    limit: 1
  });
  console.log("Rôle 115 :", JSON.stringify(roleRes.data.data?.[0], null, 2));

  // Rôles standard Axelor recommandés pour la comptabilité :
  const stdRoles = await api.post(`/ws/rest/com.axelor.auth.db.Role/search`, {
    data: {
      _domain: "self.name in ('Sale Read', 'Invoice User', 'Invoice Manager', 'Bank Payment User', 'Bank Payment Manager', 'Account User')"
    },
    fields: ["id", "name", "code"],
    limit: 10
  });
  console.log("\n📌 Rôles Standards Existants trouvés pour l'affectation :", JSON.stringify(stdRoles.data.data, null, 2));
}

inspectRoleFetch();
