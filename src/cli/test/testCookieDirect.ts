import dotenv from "dotenv";
import axios from "axios";
import { SessionStore } from "../../services/sessionStore.js";

dotenv.config();

const session = SessionStore.loadSession();
const baseURL = session?.url || process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp";
const cookie = session?.cookie || process.env.AXELOR_COOKIE || "";

console.log(`[Audit] URL: ${baseURL}`);
console.log(`[Audit] Cookie actif: ${cookie}`);

const api = axios.create({
  baseURL,
  headers: {
    "Cookie": cookie,
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

async function run() {
  try {
    const res = await api.post(`/ws/rest/com.axelor.auth.db.Group/search`, {
      fields: ["id", "name", "code"],
      limit: 10
    });
    console.log("✅ SUCCÈS ! Status:", res.status);
    console.log("Données Groupes :", JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error("❌ Échec :", err.response?.status, err.response?.data || err.message);
  }
}

run();
