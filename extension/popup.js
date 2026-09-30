document.addEventListener("DOMContentLoaded", () => {
  const siteHost = document.getElementById("site-host");
  const siteContext = document.getElementById("site-context");
  const syncButton = document.getElementById("sync-button");
  const syncStatus = document.getElementById("sync-status");
  let activeTab = null;

  function setStatus(message, state = "idle") {
    syncStatus.textContent = message;
    syncStatus.dataset.state = state;
  }

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    activeTab = tabs && tabs[0] ? tabs[0] : null;

    try {
      if (!activeTab || typeof activeTab.id !== "number" || !activeTab.url) {
        throw new Error("Aucun onglet actif disponible.");
      }

      const tabUrl = new URL(activeTab.url);
      if (tabUrl.protocol !== "http:" && tabUrl.protocol !== "https:") {
        throw new Error("Ouvrez une page Axelor en HTTP ou HTTPS.");
      }

      siteHost.textContent = tabUrl.host;
      siteContext.textContent = tabUrl.pathname;
      syncButton.disabled = false;
      setStatus("Prêt à synchroniser la session de cet onglet.");
    } catch (error) {
      siteHost.textContent = "Page non prise en charge";
      siteContext.textContent = "";
      syncButton.disabled = true;
      setStatus(error.message, "error");
    }
  });

  syncButton.addEventListener("click", () => {
    if (!activeTab) return;

    syncButton.disabled = true;
    const tabUrl = new URL(activeTab.url);
    const originPattern = `${tabUrl.protocol}//${tabUrl.hostname}/*`;
    setStatus(`Autorisation d’accès à ${tabUrl.host}…`, "busy");

    chrome.permissions.request({ origins: [originPattern] }, (granted) => {
      const permissionError = chrome.runtime.lastError;
      if (permissionError) {
        setStatus(`Chrome n’a pas accordé l’accès au site : ${permissionError.message}`, "error");
        syncButton.disabled = false;
        return;
      }

      if (!granted) {
        setStatus(`Autorise l’accès à ${tabUrl.host} pour lire son cookie de session.`, "error");
        syncButton.disabled = false;
        return;
      }

      setStatus("Lecture et transfert de la session…", "busy");
      chrome.runtime.sendMessage({
        action: "SYNC_ACTIVE_TAB",
        tabId: activeTab.id,
        tabUrl: activeTab.url,
      }, (response) => {
        if (chrome.runtime.lastError) {
          setStatus(`Service de l’extension indisponible : ${chrome.runtime.lastError.message}`, "error");
          syncButton.disabled = false;
          return;
        }

        if (!response?.success) {
          setStatus(response?.message || "La synchronisation a échoué. Réessaie.", "error");
          syncButton.disabled = false;
          return;
        }

        setStatus(`Session synchronisée avec ${response.url}.`, "success");
        syncButton.disabled = false;
      });
    });
  });
});