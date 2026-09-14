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

async function inspectMenuPermissions() {
  console.log("=== INSPECTION DES RÔLES ET MENUS POUR LA COMPTABILITÉ ===");

  // 1. Inspecter les rôles attachés au groupe 29
  const group = await api.post(`/ws/rest/com.axelor.auth.db.Group/search`, {
    data: { _domain: "self.id = 29" },
    fields: ["id", "name", "code", "roles", "permissions"]
  });
  console.log("Groupe 29 actuel :", JSON.stringify(group.data.data?.[0], null, 2));

  // 2. Chercher les rôles qui donnent accès aux menus
  const roles = await api.post(`/ws/rest/com.axelor.auth.db.Role/search`, {
    data: {
      _domain: "self.name in ('Base User', 'Account User', 'Sale Read', 'Invoice User', 'Bank Payment User')"
    },
    fields: ["id", "name", "code"]
  });
  console.log("\nRôles recommandés pour afficher les menus :", JSON.stringify(roles.data.data, null, 2));
}

inspectMenuPermissions().catch(console.error);
