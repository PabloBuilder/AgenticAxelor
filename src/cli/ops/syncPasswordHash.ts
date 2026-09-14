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

async function copyAdminPasswordHash() {
  console.log("=== COPIE DU HASH DU MOT DE PASSE ADMIN SUR COMPTA.TEST ===");

  // 1. Récupérer le hash du mot de passe admin
  const adminRes = await api.post(`/ws/rest/com.axelor.auth.db.User/search`, {
    data: { _domain: "self.code = 'admin'" },
    fields: ["id", "code", "password", "version"]
  });

  const adminHash = adminRes.data?.data?.[0]?.password;
  console.log("Hash admin récupéré :", adminHash ? `${adminHash.substring(0, 15)}...` : "Aucun");

  if (!adminHash) {
    console.error("❌ Impossible de lire le hash admin");
    return;
  }

  // 2. Récupérer la version de l'utilisateur compta.test (ID 27)
  const userRes = await api.post(`/ws/rest/com.axelor.auth.db.User/search`, {
    data: { _domain: "self.code = 'compta.test'" },
    fields: ["id", "code", "version"]
  });
  const user = userRes.data?.data?.[0];

  // 3. Injecter le même hash valide
  const updateRes = await api.post(`/ws/rest/com.axelor.auth.db.User`, {
    data: {
      id: user.id,
      version: user.version,
      password: adminHash,
      blocked: false
    }
  });

  console.log("✅ Résultat mise à jour mot de passe compta.test :", JSON.stringify(updateRes.data, null, 2));

  // 4. Mettre à jour également exo.3 au cas où
  const exoRes = await api.post(`/ws/rest/com.axelor.auth.db.User/search`, {
    data: { _domain: "self.code = 'exo.3'" },
    fields: ["id", "code", "version"]
  });
  const exoUser = exoRes.data?.data?.[0];
  if (exoUser) {
    await api.post(`/ws/rest/com.axelor.auth.db.User`, {
      data: {
        id: exoUser.id,
        version: exoUser.version,
        password: adminHash,
        blocked: false
      }
    });
    console.log("✅ Mot de passe synchronisé également sur 'exo.3'");
  }
}

copyAdminPasswordHash().catch(console.error);
