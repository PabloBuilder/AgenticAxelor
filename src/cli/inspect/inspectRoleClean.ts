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

async function inspectRoleClean() {
  const roleRes = await api.post(`/ws/rest/com.axelor.auth.db.Role/115`, {
    fields: ["id", "name", "code", "permissions", "roles"]
  });
  console.log("Rôle 115 complet :", JSON.stringify(roleRes.data, null, 2));
}

inspectRoleClean();
