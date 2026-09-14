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

async function inspectUserFields() {
  const user = await api.post(`/ws/rest/com.axelor.auth.db.User/search`, {
    data: { _domain: "self.code = 'exo.3' or self.code = 'admin'" },
    fields: ["id", "name", "code", "password", "transientPassword", "blocked", "group"],
    limit: 2
  });
  console.log("Users :", JSON.stringify(user.data, null, 2));

  // Inspect form view XML
  const viewRes = await api.post(`/ws/rest/com.axelor.meta.db.MetaView/search`, {
    data: { _domain: "self.name = 'user-form'" },
    fields: ["id", "name", "title", "content"]
  });
  console.log("user-form view :", viewRes.data.data?.[0]?.content?.substring(0, 1500));
}

inspectUserFields();
