import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { MenuService } from "../../services/menuService.js";
import { SessionStore } from "../../services/sessionStore.js";

dotenv.config();

const session = SessionStore.loadSession();
const client = new AxelorClient({
  baseUrl: session?.url || process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp",
  username: process.env.AXELOR_USERNAME || "admin",
  password: process.env.AXELOR_PASSWORD || "admin",
  cookie: session?.cookie
});

const menuService = new MenuService(client);

async function search() {
  console.log(`=== INTERROGATION REELLE DU SERVEUR AXELOR (${session?.url || "remote"}) ===`);
  const keywords = ["Commande", "Facture", "Paiement", "Sale", "Invoice", "Payment"];
  for (const kw of keywords) {
    try {
      const res = await menuService.searchMenu(kw, 5);
      console.log(`\nRecherche Menu "${kw}" :`);
      res.forEach(m => console.log(`  - [${m.name}] "${m.title}" -> chemin: ${m.breadcrumb}`));
    } catch (e: any) {
      console.error(`Erreur recherche "${kw}":`, e.message);
    }
  }
}

search();
