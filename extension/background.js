/**
 * AgenticAxelor - Background Service Worker
 * Real-time cookie synchronization & Local Bridge Proxy
 */

const DEFAULT_BRIDGE_URL = "http://localhost:3210";

async function getBridgeUrl() {
  const data = await chrome.storage.local.get("bridgeUrl");
  return data.bridgeUrl || DEFAULT_BRIDGE_URL;
}

// Handle messages from content script & popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_CURRENT_GUIDE") {
    getBridgeUrl().then((bridgeUrl) => {
      fetch(`${bridgeUrl}/api/guide/current`)
        .then((res) => res.json())
        .then((data) => {
          sendResponse({
            event: "ROUTE_SET",
            payload: data,
          });
        })
        .catch(() => {
          sendResponse({ event: "OFFLINE", payload: null });
        });
    });
    return true; // async
  }

  if (request.action === "ADVANCE_STEP") {
    getBridgeUrl().then((bridgeUrl) => {
      fetch(`${bridgeUrl}/api/guide/advance`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ error: err.message }));
    });
    return true;
  }

  if (request.action === "RESET_STEP") {
    getBridgeUrl().then((bridgeUrl) => {
      fetch(`${bridgeUrl}/api/guide/reset`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ error: err.message }));
    });
    return true;
  }

  if (request.action === "CLEAR_GUIDE") {
    getBridgeUrl().then((bridgeUrl) => {
      fetch(`${bridgeUrl}/api/guide/clear`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ error: err.message }));
    });
    return true;
  }

  if (request.action === "SET_BRIDGE_URL") {
    const newUrl = (request.url || DEFAULT_BRIDGE_URL).replace(/\/+$/, "");
    chrome.storage.local.set({ bridgeUrl: newUrl }).then(() => {
      sendResponse({ success: true, bridgeUrl: newUrl });
    });
    return true;
  }

  if (request.action === "GET_SYSTEM_STATUS") {
    (async () => {
      const bridgeUrl = await getBridgeUrl();
      const storage = await chrome.storage.local.get([
        "lastJSessionId",
        "lastCookieDomain",
        "lastUpdated",
      ]);

      let bridgeOnline = false;
      let bridgeData = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${bridgeUrl}/api/guide/current`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          bridgeOnline = true;
          bridgeData = await res.json();
        }
      } catch {}

      sendResponse({
        bridgeUrl,
        bridgeOnline,
        sessionCookie: {
          present: !!storage.lastJSessionId,
          domain: storage.lastCookieDomain || null,
          lastUpdated: storage.lastUpdated || null,
        },
        guideState: bridgeData || null,
      });
    })();
    return true;
  }
});

// Real-time Axelor JSESSIONID cookie listener
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const { cookie, removed } = changeInfo;
  if (removed) return;

  if (cookie.name === "JSESSIONID") {
    await chrome.storage.local.set({
      lastJSessionId: cookie.value,
      lastCookieDomain: cookie.domain,
      lastUpdated: new Date().toISOString(),
    });
  }
});
