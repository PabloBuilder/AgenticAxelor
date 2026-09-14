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

async function createAccountingUser() {
  console.log("=== CRÉATION UTILISATEUR TEST COMPTABILITÉ ===");

  const loginCode = "compta.test";
  const passwordClear = "Axelor2026!";
  const fullName = "Test Comptable";

  // 1. Vérifier si l'utilisateur existe déjà
  const checkRes = await api.post(`/ws/rest/com.axelor.auth.db.User/search`, {
    data: {
      _domain: "self.code = :code",
      _domainContext: { code: loginCode }
    },
    fields: ["id", "name", "code", "group"]
  });

  if (checkRes.data?.data && checkRes.data.data.length > 0) {
    const existing = checkRes.data.data[0];
    console.log(`ℹ️ L'utilisateur '${loginCode}' existe déjà (ID: ${existing.id}). Mise à jour du mot de passe et groupe...`);
    
    // Update existing
    const updateRes = await api.post(`/ws/rest/com.axelor.auth.db.User`, {
      data: {
        id: existing.id,
        version: existing.version ?? 0,
        name: fullName,
        code: loginCode,
        password: passwordClear,
        group: { id: 29, name: "Comptabilité" },
        active: true
      }
    });
    console.log("✅ Utilisateur mis à jour :", JSON.stringify(updateRes.data, null, 2));
  } else {
    // Create new
    console.log(`Création d'un nouvel utilisateur '${loginCode}' rattaché au groupe Comptabilité (ID 29)...`);
    const createRes = await api.post(`/ws/rest/com.axelor.auth.db.User`, {
      data: {
        name: fullName,
        code: loginCode,
        password: passwordClear,
        group: { id: 29, name: "Comptabilité" },
        active: true
      }
    });
    console.log("✅ Résultat création :", JSON.stringify(createRes.data, null, 2));
  }

  console.log(`\n============================================================`);
  console.log(`IDENTIFIANTS DE TEST CRÉÉS :`);
  console.log(`👉 Identifiant (Code) : ${loginCode}`);
  console.log(`👉 Mot de passe       : ${passwordClear}`);
  console.log(`👉 Groupe assigné     : Comptabilité (ID 29)`);
  console.log(`============================================================\n`);
}

createAccountingUser().catch(console.error);
