document.addEventListener("DOMContentLoaded", () => {
  const siteHost = document.getElementById("site-host");
  const siteContext = document.getElementById("site-context");
  const syncButton = document.getElementById("sync-button");
  const syncStatus = document.getElementById("sync-status");
  let activeTab = null;
  const sessionsList = document.getElementById("sessions-list");
  const sessionsStatus = document.getElementById("sessions-status");
  const sessionsRetry = document.getElementById("sessions-retry");
  const bridgeSessionsUrl = "http://127.0.0.1:3210/api/sessions";
  let cachedSessions = [];
  let hasCachedSessions = false;

  function renderSessions(sessions, offline = false) {
      sessionsList.replaceChildren();
      for (const session of sessions) {
        const item = document.createElement("div");
        item.className = "session-item";
        const head = document.createElement("div");
        head.className = "session-head";
        const indicator = document.createElement("span");
        indicator.className = "indicator";
        indicator.dataset.active = String(session.active);
        indicator.setAttribute("aria-hidden", "true");
        const title = document.createElement("strong");
        try {
          title.textContent = session.name === session.url ? new URL(session.url).host : session.name;
        } catch {
          title.textContent = session.name;
        }
        const toggleLabel = document.createElement("label");
        toggleLabel.className = "switch";
        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.checked = session.active;
        toggle.disabled = offline;
        toggle.setAttribute("aria-label", `Accès MCP pour ${session.name}`);
        const slider = document.createElement("span");
        slider.className = "slider";
        slider.setAttribute("aria-hidden", "true");
        toggleLabel.append(toggle, slider);
        toggle.addEventListener("change", () => {
          toggle.disabled = true;
          changeSession(toggle.checked ? "activate" : "deactivate", session.id);
        });
        head.append(indicator, title, toggleLabel);
        const details = document.createElement("p");
        details.textContent = session.url;
        const state = document.createElement("p");
        state.textContent = session.active ? "Accès MCP activé" : "Accès MCP désactivé";
        const identifier = document.createElement("p");
        identifier.textContent = `Identifiant : ${session.id}`;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove";
        remove.disabled = offline;
        remove.textContent = "Supprimer";
        remove.addEventListener("click", () => {
          if (window.confirm(`Supprimer la session ${session.name} du registre local ?`)) changeSession("delete", session.id);
        });
        const expandable = document.createElement("details");
        expandable.className = "session-details";
        const summary = document.createElement("summary");
        summary.textContent = "Détails";
        expandable.append(summary, details, state, identifier, remove);
        item.append(head, expandable);
        sessionsList.append(item);
      }
  }

  async function refreshSessions() {
    try {
      const response = await fetch(bridgeSessionsUrl, { cache: "no-store" });
      if (response.status === 404) throw new Error("API des sessions introuvable : redémarrez le Bridge après compilation pour charger la nouvelle version.");
      if (response.status === 403) throw new Error("Accès au Bridge refusé : vérifiez l’identifiant de l’extension autorisée.");
      if (!response.ok) throw new Error(`Le Bridge a répondu avec une erreur HTTP ${response.status}.`);
      let result;
      try { result = await response.json(); } catch { throw new Error("Réponse du Bridge invalide : redémarrez-le après compilation."); }
      if (!result.success || !Array.isArray(result.sessions)) throw new Error("Liste des sessions indisponible côté Bridge.");
      cachedSessions = result.sessions.map(({ id, name, url, active }) => ({ id, name, url, active }));
      hasCachedSessions = true;
      sessionsRetry.hidden = true;
      renderSessions(cachedSessions);
      sessionsStatus.textContent = cachedSessions.length ? "" : "Aucune session synchronisée.";
      try { await chrome.storage.local.set({ sessionsCache: cachedSessions }); } catch { /* affichage en ligne reste utilisable */ }
    } catch (error) {
      renderSessions(cachedSessions, true);
      sessionsRetry.hidden = false;
      const reason = error instanceof TypeError
        ? "Bridge inaccessible. Démarrez-le, puis réessayez."
        : (error.message || "Liste des sessions indisponible.");
      sessionsStatus.textContent = hasCachedSessions
        ? `${reason} Dernière liste mémorisée, potentiellement obsolète ; commandes indisponibles.`
        : reason;
    }
  }
  sessionsRetry.addEventListener("click", refreshSessions);

  async function changeSession(action, id) {
    sessionsStatus.textContent = "Mise à jour…";
    try {
      const response = await fetch(bridgeSessionsUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();
      await refreshSessions();
    } catch {
      await refreshSessions();
      sessionsStatus.textContent = `Modification impossible. ${sessionsStatus.textContent || "État relu depuis le Bridge."}`;
    }
  }

  (async () => {
    try {
      const stored = await chrome.storage.local.get("sessionsCache");
      if (Array.isArray(stored.sessionsCache)) {
        cachedSessions = stored.sessionsCache.filter(s => s && typeof s.id === "string" && typeof s.name === "string" && typeof s.url === "string" && typeof s.active === "boolean");
        hasCachedSessions = true;
        renderSessions(cachedSessions, true);
        sessionsStatus.textContent = "Liste mémorisée ; vérification auprès du Bridge…";
      }
    } catch { /* le Bridge reste la source de vérité */ }
    await refreshSessions();
  })();

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
        refreshSessions();
      });
    });
  });
});