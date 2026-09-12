/**
 * AgenticAxelor - Content Script & Local Bridge SSE Connector
 */

(function () {
  if (window.__agenticAxelorGPSInjected) return;
  window.__agenticAxelorGPSInjected = true;

  let lastRouteId = null;
  let lastStepIndex = -1;
  let customDomains = [];

  // Load custom domains from storage
  chrome.storage.local.get("customAxelorDomains", (data) => {
    if (data.customAxelorDomains && Array.isArray(data.customAxelorDomains)) {
      customDomains = data.customAxelorDomains;
    }
  });

  // Listen for storage updates to immediately recognize newly added domains
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.customAxelorDomains) {
      customDomains = changes.customAxelorDomains.newValue || [];
      fetchActiveGuide();
    }
  });

  function isAxelorContext() {
    const href = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const host = window.location.host.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    // Tier 1: User-configured custom domains & keywords
    if (customDomains.some((d) => d && (hostname === d.toLowerCase() || host === d.toLowerCase() || href.includes(d.toLowerCase())))) {
      return true;
    }

    if (pathname.includes("axelor") || pathname.includes("open-suite") || hostname.includes("axelor")) {
      return true;
    }

    // Tier 2: Axelor DOM Signatures & Framework Markers
    const axelorDomSignatures = [
      "[ng-app*='axelor']",
      "[data-ng-app*='axelor']",
      ".navbar-axelor",
      ".ax-navbar",
      "#axelor-app",
      ".nav-item[data-menu-title]",
      ".main-navigation",
      "meta[name='axelor:version']",
      "meta[name='generator'][content*='axelor' i]",
      "link[href*='axelor']",
      "script[src*='axelor']",
      "script[src*='open-suite']"
    ];

    for (const selector of axelorDomSignatures) {
      if (document.querySelector(selector)) {
        return true;
      }
    }

    // Tier 3: Global JS Context / Title heuristics
    if (document.title && document.title.toLowerCase().includes("axelor")) {
      return true;
    }

    return false;
  }

  function fetchActiveGuide() {
    // Only poll and project guide if we are in an Axelor context
    if (!isAxelorContext()) {
      if (lastRouteId !== null) {
        lastRouteId = null;
        lastStepIndex = -1;
        if (window.AxelorSpotlight) {
          window.AxelorSpotlight.clear();
        }
      }
      return;
    }

    chrome.runtime.sendMessage({ action: "GET_CURRENT_GUIDE" }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response && response.payload) {
        handleBridgeMessage(response);
      }
    });
  }

  function handleBridgeMessage(message) {
    const { event, payload } = message;

    switch (event) {
      case "INIT":
      case "ROUTE_SET":
      case "STEP_ADVANCED": {
        if (payload && payload.currentRoute) {
          const route = payload.currentRoute;
          const stepIndex = payload.activeStepIndex || 0;

          // Only re-render if the route or step actually changed
          if (lastRouteId !== route.id || lastStepIndex !== stepIndex) {
            lastRouteId = route.id;
            lastStepIndex = stepIndex;
            if (window.AxelorSpotlight) {
              window.AxelorSpotlight.setRoute(route, stepIndex);
            }
          }
        } else {
          if (lastRouteId !== null) {
            lastRouteId = null;
            lastStepIndex = -1;
            if (window.AxelorSpotlight) {
              window.AxelorSpotlight.clear();
            }
          }
        }
        break;
      }

      case "ROUTE_CLEARED": {
        lastRouteId = null;
        lastStepIndex = -1;
        if (window.AxelorSpotlight) {
          window.AxelorSpotlight.clear();
        }
        break;
      }
    }
  }

  // Handle runtime messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CLEAR_GUIDE") {
      lastRouteId = null;
      lastStepIndex = -1;
      if (window.AxelorSpotlight) {
        window.AxelorSpotlight.clear();
      }
      sendResponse({ status: "cleared" });
    }
    return true;
  });

  // Poll via background worker every 1.5s
  setInterval(fetchActiveGuide, 1500);
  fetchActiveGuide();
})();
