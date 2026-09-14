import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function testAuthVariations() {
  const baseURL = process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp";
  const username = process.env.AXELOR_USERNAME || "admin";
  const password = process.env.AXELOR_PASSWORD || "@2023#@xelor6.5.4";

  console.log(`Test auth sur ${baseURL}`);

  // Variation 1: Basic Auth
  try {
    const basicRes = await axios.post(`${baseURL}/ws/rest/com.axelor.auth.db.Group/search`, { limit: 1 }, {
      auth: { username, password },
      headers: { "Content-Type": "application/json" }
    });
    console.log("✅ Basic Auth SUCCESS ! Total:", basicRes.data.total);
    return;
  } catch (e: any) {
    console.log("❌ Basic Auth failed:", e.response?.status || e.message);
  }

  // Variation 2: Login form followed by /index.jsp or session capture
  const instance = axios.create({ baseURL, withCredentials: true });
  const getLogin = await instance.get("/login.jsp");
  const cookies1 = getLogin.headers["set-cookie"] || [];

  const postLogin = await instance.post("/login.jsp", new URLSearchParams({ username, password }).toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies1.map(c => c.split(";")[0]).join("; ")
    },
    maxRedirects: 5,
    validateStatus: () => true
  });
  console.log("POST login.jsp response:", postLogin.status, postLogin.headers);
  const cookies2 = [...cookies1, ...(postLogin.headers["set-cookie"] || [])];
  const fullCookie = cookies2.map(c => c.split(";")[0]).join("; ");

  try {
    const res = await instance.post("/ws/rest/com.axelor.auth.db.Group/search", { limit: 1 }, {
      headers: { Cookie: fullCookie, "Content-Type": "application/json" }
    });
    console.log("✅ Form Auth SUCCESS ! Groups total:", res.data.total);
  } catch (e: any) {
    console.log("❌ Form Auth failed:", e.response?.status || e.message);
  }
}

testAuthVariations();
