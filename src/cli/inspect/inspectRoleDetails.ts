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

async function inspectRoleDetails() {
  console.log("=== INSPECTION DU RÔLE ID 115 (utilisateur comptable) ===");

  const roleRes = await api.post(`/ws/rest/com.axelor.auth.db.Role/search`, {
    data: {
      _domain: "self.id = 115"
    },
    fields: ["id", "name", "code", "permissions", "roles"],
    limit: 1
  });
  console.log("Rôle 115 :", JSON.stringify(roleRes.data.data?.[0], null, 2));

  // Permissions associées au rôle 115
  const perms = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
    data: {
      _domain: "self.role.id = 115 or self.name like '%SalesOrder%' or self.name like '%compta%'"
    },
    fields: ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport", "condition"],
    limit: 20
  });
  console.log("\nPermissions trouvées :", JSON.stringify(perms.data.data, null, 2));
}

inspectRoleDetails();
