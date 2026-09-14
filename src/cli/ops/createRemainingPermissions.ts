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

interface PermSpec {
  name: string;
  object: string;
  canRead: boolean;
  canWrite: boolean;
  canCreate: boolean;
  canRemove: boolean;
  canExport: boolean;
  condition?: string;
  description: string;
}

const permsToCreate: PermSpec[] = [
  {
    name: "perm.sale.commercial.rwc",
    object: "com.axelor.apps.sale.db.SaleOrder",
    canRead: true,
    canWrite: true,
    canCreate: true,
    canRemove: false,
    canExport: true,
    condition: "self.clientPartner.user = :__user__",
    description: "Commandes & Devis de vente limités aux clients du commercial connecté"
  },
  {
    name: "perm.purchase.commercial.rwc",
    object: "com.axelor.apps.purchase.db.PurchaseOrder",
    canRead: true,
    canWrite: true,
    canCreate: true,
    canRemove: false,
    canExport: true,
    condition: "",
    description: "Commandes d'achats (Lecture, Écriture, Création autorisées)"
  },
  {
    name: "perm.invoice.commercial.r",
    object: "com.axelor.apps.account.db.Invoice",
    canRead: true,
    canWrite: false,
    canCreate: false,
    canRemove: false,
    canExport: true,
    condition: "self.partner.user = :__user__",
    description: "Factures en lecture seule limitées aux clients du commercial connecté (Pas de création/écriture)"
  },
  {
    name: "perm.event.commercial.rwc",
    object: "com.axelor.apps.crm.db.Event",
    canRead: true,
    canWrite: true,
    canCreate: true,
    canRemove: false,
    canExport: true,
    condition: "self.partner.user = :__user__ or self.user = :__user__",
    description: "Événements CRM limités au portefeuille client du commercial connecté"
  }
];

async function createPermissions() {
  console.log("=== CRÉATION DES PERMISSIONS RESTREINTES VIA MCP AXELOR ===");

  for (const p of permsToCreate) {
    // 1. Check if permission already exists
    const searchRes = await api.post(`/ws/rest/com.axelor.auth.db.Permission/search`, {
      data: {
        _domain: "self.name = :name",
        _domainContext: { name: p.name }
      },
      fields: ["id", "name", "object", "condition"]
    });

    if (searchRes.data?.data && searchRes.data.data.length > 0) {
      const existing = searchRes.data.data[0];
      console.log(`ℹ️ La permission '${p.name}' existe déjà (ID: ${existing.id}). Mise à jour des règles...`);
      const updateRes = await api.post(`/ws/rest/com.axelor.auth.db.Permission`, {
        data: {
          id: existing.id,
          version: existing.version ?? 0,
          name: p.name,
          object: p.object,
          canRead: p.canRead,
          canWrite: p.canWrite,
          canCreate: p.canCreate,
          canRemove: p.canRemove,
          canExport: p.canExport,
          condition: p.condition || null
        }
      });
      console.log(`✅ [OK] Permission mise à jour : [ID: ${existing.id}] ${p.name}`);
    } else {
      console.log(`Création de la permission '${p.name}' pour ${p.object}...`);
      const createRes = await api.post(`/ws/rest/com.axelor.auth.db.Permission`, {
        data: {
          name: p.name,
          object: p.object,
          canRead: p.canRead,
          canWrite: p.canWrite,
          canCreate: p.canCreate,
          canRemove: p.canRemove,
          canExport: p.canExport,
          condition: p.condition || null
        }
      });
      console.log(`✅ [OK] Nouvelle permission créée : ${p.name} (ID: ${createRes.data?.data?.[0]?.id || 'créé'})`);
    }
  }

  console.log("\n🚀 Toutes les permissions ont été injectées avec succès dans la base Axelor !");
}

createPermissions().catch(console.error);
