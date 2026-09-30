const BRIDGE_URL = "http://127.0.0.1:3210";
const APP_ROOT_PATHS = new Set([
  "favicon.ico",
  "index.jsp",
  "login.jsp",
  "res",
  "static",
  "ws",
]);

function deriveAxelorBaseUrl(tabUrl, cookiePath) {
  const pageUrl = new URL(tabUrl);
  if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
    throw new Error("Ouvrez une page Axelor en HTTP ou HTTPS.");
  }

  let contextPath = cookiePath && cookiePath !== "/" ? cookiePath : "";
  if (!contextPath) {
    const firstSegment = pageUrl.pathname.split("/").filter(Boolean)[0] || "";
    if (firstSegment && !APP_ROOT_PATHS.has(firstSegment.toLowerCase())) {
      contextPath = `/${firstSegment}`;
    }
  }

  return `${pageUrl.origin}${contextPath.replace(/\/+$/, "")}`;
}

async function synchronizeActiveTab(request) {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const activeTab = tabs[0];

  if (!activeTab || activeTab.id !== request.tabId || activeTab.url !== request.tabUrl) {
    return { success: false, code: "tab_changed", message: "L’onglet actif a changé. Rouvrez le popup et réessayez." };
  }

  let pageUrl;
  try {
    pageUrl = new URL(activeTab.url);
  } catch {
    return { success: false, code: "unsupported_page", message: "Cette page ne permet pas de synchroniser une session Axelor." };
  }

  if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
    return { success: false, code: "unsupported_page", message: "Ouvrez une page Axelor en HTTP ou HTTPS." };
  }

  let cookie;
  try {
    cookie = await chrome.cookies.get({ url: activeTab.url, name: "JSESSIONID" });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: "cookie_unavailable",
      message: `Chrome refuse l’accès au cookie : ${reason}`,
    };
  }

  if (!cookie || !cookie.value) {
    return { success: false, code: "missing_cookie", message: "Aucun cookie JSESSIONID trouvé pour cet onglet." };
  }

  let url;
  try {
    url = deriveAxelorBaseUrl(activeTab.url, cookie.path);
  } catch (error) {
    return { success: false, code: "unsupported_page", message: error.message };
  }

  try {
    const response = await fetch(`${BRIDGE_URL}/api/session/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookie: `JSESSIONID=${cookie.value}`, url }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      return {
        success: false,
        code: "sync_rejected",
        message: result?.error || "Le serveur local a refusé la synchronisation.",
      };
    }

    return { success: true, url: result.url || url };
  } catch {
    return {
      success: false,
      code: "bridge_offline",
      message: "Serveur AgenticAxelor inaccessible. Vérifiez qu’il est démarré sur le port 3210.",
    };
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.action !== "SYNC_ACTIVE_TAB") return false;

  synchronizeActiveTab(request)
    .then(sendResponse)
    .catch(() => sendResponse({
      success: false,
      code: "sync_failed",
      message: "La synchronisation a échoué. Réessayez.",
    }));
  return true;
});