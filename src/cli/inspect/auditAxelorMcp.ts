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

async function queryModel(model: string, fields: string[] = ["id", "name", "code"], criteria: any = {}) {
  try {
    const res = await api.post(`/ws/rest/${model}/search`, {
      fields,
      limit: 20,
      ...criteria
    });
    return res.data;
  } catch (e: any) {
    return { error: e.response?.data || e.message };
  }
}

async function auditRealAxelorState() {
  console.log(`\n============================================================`);
  console.log(`[MCP Axelor Inspection Réelle EN LIGNE 🟢]`);
  console.log(`Cible : ${baseURL}`);
  console.log(`============================================================\n`);

  // 1. Groupes
  console.log("🔍 1. Groupes Existants (com.axelor.auth.db.Group) :");
  const groups = await queryModel("com.axelor.auth.db.Group", ["id", "name", "code", "roles"]);
  if (groups.data) {
    console.log(`   -> ${groups.total || groups.data.length} groupes trouvés :`);
    groups.data.forEach((g: any) => console.log(`      * [ID: ${g.id}] Nom: "${g.name}", Code: "${g.code}"`));
  }

  // 2. Rôles
  console.log("\n🔍 2. Rôles Existants (com.axelor.auth.db.Role) :");
  const roles = await queryModel("com.axelor.auth.db.Role", ["id", "name", "code"]);
  if (roles.data) {
    console.log(`   -> ${roles.total || roles.data.length} rôles trouvés :`);
    roles.data.forEach((r: any) => console.log(`      * [ID: ${r.id}] "${r.name}" (${r.code})`));
  }

  // 3. Permissions existantes
  console.log("\n🔍 3. Permissions Existantes (com.axelor.auth.db.Permission) :");
  const perms = await queryModel("com.axelor.auth.db.Permission", ["id", "name", "object", "canRead", "canWrite", "canCreate", "canRemove", "canExport"]);
  if (perms.data) {
    console.log(`   -> ${perms.total || perms.data.length} permissions trouvées :`);
    perms.data.slice(0, 10).forEach((p: any) => console.log(`      * [ID: ${p.id}] ${p.name || 'Sans Nom'} sur '${p.object}' -> r:${p.canRead} w:${p.canWrite} c:${p.canCreate} d:${p.canRemove} e:${p.canExport}`));
  }

  // 4. Utilisateurs de test
  console.log("\n🔍 4. Utilisateurs Existants (com.axelor.auth.db.User) :");
  const users = await queryModel("com.axelor.auth.db.User", ["id", "name", "code", "group", "roles"]);
  if (users.data) {
    console.log(`   -> ${users.total || users.data.length} utilisateurs trouvés :`);
    users.data.forEach((u: any) => console.log(`      * [ID: ${u.id}] ${u.name} (login: ${u.code}) - Groupe: ${u.group?.name || 'Aucun'}`));
  }

  // 5. Menus Réels Axelor
  console.log("\n🔍 5. Menus Axelor Clés (com.axelor.meta.db.MetaMenu) :");
  for (const kw of ["Commande", "Facture", "Paiement", "Groupe", "Utilisateur"]) {
    const menus = await queryModel("com.axelor.meta.db.MetaMenu", ["id", "name", "title", "parent", "action"], {
      data: {
        _domain: "self.title like :kw or self.name like :kw",
        _domainContext: { kw: `%${kw}%` }
      },
      limit: 5
    });
    if (menus.data && menus.data.length > 0) {
      console.log(`   📌 Menus contenant "${kw}" :`);
      menus.data.forEach((m: any) => console.log(`      - [${m.name}] "${m.title}"`));
    }
  }
}

auditRealAxelorState();
