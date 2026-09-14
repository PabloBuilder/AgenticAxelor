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

async function unblockUser() {
  console.log("Activation & déblocage du compte compta.test (ID 27)...");
  const res = await api.post(`/ws/rest/com.axelor.auth.db.User`, {
    data: {
      id: 27,
      version: 0,
      blocked: false
    }
  });
  console.log("Statut compte débloqué :", JSON.stringify(res.data, null, 2));
}

unblockUser();
