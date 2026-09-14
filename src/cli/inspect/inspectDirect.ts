import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function inspectWithFreshAuth() {
  const baseURL = process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp";
  const username = process.env.AXELOR_USERNAME || "admin";
  const password = process.env.AXELOR_PASSWORD || "@2023#@xelor6.5.4";

  console.log(`Connexion à ${baseURL} avec ${username}...`);
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  let jsessionId = "";
  let csrfToken = "";

  // 1. Get initial cookie
  const loginGet = await instance.get("/login.jsp", {
    maxRedirects: 0,
    validateStatus: () => true
  });
  const rawSetCookie = loginGet.headers["set-cookie"] || [];
  console.log("Cookies initiaux :", rawSetCookie);

  // 2. Post credentials
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const loginPost = await instance.post("/login.jsp", params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: rawSetCookie.map(c => c.split(";")[0]).join("; ")
    },
    maxRedirects: 0,
    validateStatus: () => true
  });
  console.log("Status login POST :", loginPost.status, loginPost.headers.location);

  const allCookies = [...rawSetCookie, ...(loginPost.headers["set-cookie"] || [])];
  const cookieHeader = allCookies.map(c => c.split(";")[0]).join("; ");
  console.log("Cookie session actif :", cookieHeader);

  // 3. Query Groups
  const groupRes = await instance.post("/ws/rest/com.axelor.auth.db.Group/search", {
    fields: ["id", "name", "code", "roles"],
    limit: 20
  }, {
    headers: { Cookie: cookieHeader, "Content-Type": "application/json" }
  });
  console.log("\n=== GROUPES EXISTANTS ===");
  console.log(JSON.stringify(groupRes.data, null, 2));

  // 4. Query Roles
  const roleRes = await instance.post("/ws/rest/com.axelor.auth.db.Role/search", {
    fields: ["id", "name", "code"],
    limit: 50
  }, {
    headers: { Cookie: cookieHeader, "Content-Type": "application/json" }
  });
  console.log("\n=== RÔLES EXISTANTS ===");
  console.log(roleRes.data.data?.map((r: any) => `${r.name} (${r.code})`).join("\n"));

  // 5. Query Users (test / compta)
  const userRes = await instance.post("/ws/rest/com.axelor.auth.db.User/search", {
    fields: ["id", "name", "code", "group", "roles"],
    limit: 20
  }, {
    headers: { Cookie: cookieHeader, "Content-Type": "application/json" }
  });
  console.log("\n=== UTILISATEURS EXISTANTS ===");
  console.log(userRes.data.data?.map((u: any) => `${u.name} (code: ${u.code}, id: ${u.id}, groupe: ${u.group?.name || 'aucun'})`).join("\n"));

  // 6. Query Menus
  const menuRes = await instance.post("/ws/rest/com.axelor.meta.db.MetaMenu/search", {
    data: {
      _domain: "self.title like :query or self.name like :query",
      _domainContext: { query: "%Group%" }
    },
    fields: ["id", "name", "title", "parent", "action"],
    limit: 10
  }, {
    headers: { Cookie: cookieHeader, "Content-Type": "application/json" }
  });
  console.log("\n=== MENUS GROUPES ===");
  console.log(menuRes.data.data?.map((m: any) => `${m.title} [${m.name}]`).join("\n"));
}

inspectWithFreshAuth().catch(console.error);
