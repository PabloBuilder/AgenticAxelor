import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function inspectAxelor7Auth() {
  const baseURL = process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp";
  const username = process.env.AXELOR_USERNAME || "admin";
  const password = process.env.AXELOR_PASSWORD || "@2023#@xelor6.5.4";

  console.log(`Inspection Axelor Open Suite : ${baseURL}`);
  
  const jar = axios.create({
    baseURL,
    withCredentials: true,
    headers: { Accept: "application/json" }
  });

  // Test /login or /login.jsp or /ws/login
  const endpoints = [
    { url: "/login.jsp", form: true },
    { url: "/login", form: true },
    { url: "/ws/login", json: true },
    { url: "/ws/rest/com.axelor.auth.db.Group/search", basic: true }
  ];

  for (const ep of endpoints) {
    try {
      console.log(`\nTest endpoint : ${ep.url}`);
      let res;
      if (ep.form) {
        const p = new URLSearchParams();
        p.append("username", username);
        p.append("password", password);
        res = await jar.post(ep.url, p.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          maxRedirects: 0,
          validateStatus: () => true
        });
      } else if (ep.json) {
        res = await jar.post(ep.url, { username, password }, {
          validateStatus: () => true
        });
      }
      console.log(`Status: ${res?.status}, Set-Cookie:`, res?.headers["set-cookie"]);
    } catch (e: any) {
      console.log(`Failed: ${e.message}`);
    }
  }
}

inspectAxelor7Auth();
