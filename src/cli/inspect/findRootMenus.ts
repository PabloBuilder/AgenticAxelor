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

async function findRootMenus() {
  console.log("=== RECHERCHE DES MENUS RACINES DANS AXELOR ===");
  try {
    const res = await api.post(`/ws/rest/com.axelor.meta.db.MetaMenu/search`, {
      fields: ["id", "name", "title", "parent", "priority", "xmlId"],
      data: {
        _domain: "self.parent is null"
      },
      sortBy: ["priority"]
    });
    console.log("Menus racines trouvés (Parent IS NULL) :");
    res.data?.data?.forEach((m: any) => {
      console.log(`- [ID: ${m.id}] Title: "${m.title}" | Name: "${m.name}" | xmlId: "${m.xmlId}"`);
    });
  } catch (err: any) {
    console.error("Erreur:", err.message);
  }
}

findRootMenus();
