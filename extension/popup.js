/**
 * AgenticAxelor - Settings & Live Status Popup Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  const bridgeDot = document.getElementById("bridge-dot");
  const bridgeText = document.getElementById("bridge-text");
  const cookieDot = document.getElementById("cookie-dot");
  const cookieText = document.getElementById("cookie-text");

  const guideStepBadge = document.getElementById("guide-step-badge");
  const guideTitle = document.getElementById("guide-title");
  const guideHint = document.getElementById("guide-hint");

  const btnRestart = document.getElementById("btn-restart");
  const btnClear = document.getElementById("btn-clear");
  const bridgeUrlInput = document.getElementById("bridge-url-input");
  const btnSaveUrl = document.getElementById("btn-save-url");

  const domainInput = document.getElementById("domain-input");
  const btnAddDomain = document.getElementById("btn-add-domain");
  const domainTagsContainer = document.getElementById("domain-tags");

  let currentDomains = [];

  function loadDomains() {
    chrome.storage.local.get("customAxelorDomains", (data) => {
      currentDomains = (data.customAxelorDomains && Array.isArray(data.customAxelorDomains))
        ? data.customAxelorDomains
        : [];
      renderDomainTags();
    });
  }

  function renderDomainTags() {
    domainTagsContainer.innerHTML = "";
    if (currentDomains.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.style.color = "#94a3b8";
      placeholder.style.fontSize = "11px";
      placeholder.textContent = "Aucun domaine personnalisé (auto-détection active)";
      domainTagsContainer.appendChild(placeholder);
      return;
    }

    currentDomains.forEach((domain, idx) => {
      const tag = document.createElement("span");
      tag.className = "domain-tag";
      tag.innerHTML = `
        <span>${escapeHtml(domain)}</span>
        <span class="domain-tag-remove" data-idx="${idx}">&times;</span>
      `;
      domainTagsContainer.appendChild(tag);
    });

    domainTagsContainer.querySelectorAll(".domain-tag-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.getAttribute("data-idx"), 10);
        currentDomains.splice(idx, 1);
        chrome.storage.local.set({ customAxelorDomains: currentDomains }, () => {
          renderDomainTags();
        });
      });
    });
  }

  function addDomain() {
    const raw = domainInput.value.trim().toLowerCase();
    if (!raw) return;
    
    // Clean protocol/path if user pasted full URL
    const cleaned = raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (cleaned && !currentDomains.includes(cleaned)) {
      currentDomains.push(cleaned);
      chrome.storage.local.set({ customAxelorDomains: currentDomains }, () => {
        domainInput.value = "";
        renderDomainTags();
      });
    }
  }

  btnAddDomain.addEventListener("click", addDomain);
  domainInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addDomain();
  });

  function refreshStatus() {
    chrome.runtime.sendMessage({ action: "GET_SYSTEM_STATUS" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        bridgeDot.className = "status-dot offline";
        bridgeText.textContent = "Inaccessible";
        return;
      }

      // 1. Bridge Status
      bridgeUrlInput.value = response.bridgeUrl || "http://localhost:3210";
      if (response.bridgeOnline) {
        bridgeDot.className = "status-dot online";
        bridgeText.textContent = "Connecté (3210)";
      } else {
        bridgeDot.className = "status-dot offline";
        bridgeText.textContent = "Hors-ligne";
      }

      // 2. Cookie Status
      if (response.sessionCookie && response.sessionCookie.present) {
        cookieDot.className = "status-dot online";
        cookieText.textContent = "JSESSIONID capturé";
      } else {
        cookieDot.className = "status-dot offline";
        cookieText.textContent = "Non détectée";
      }

      // 3. Active Guide
      const guide = response.guideState;
      if (guide && guide.currentRoute && guide.currentRoute.steps) {
        const route = guide.currentRoute;
        const totalSteps = route.steps.length;
        const stepIdx = guide.activeStepIndex || 0;
        const isCompleted = stepIdx >= totalSteps;

        if (isCompleted) {
          guideStepBadge.textContent = "Terminé (Succès)";
          guideStepBadge.style.color = "#10b981";
          guideTitle.textContent = "Objectif atteint";
          guideHint.textContent = "Le parcours a été suivi jusqu'à sa destination.";
        } else {
          const currentStep = route.steps[stepIdx];
          guideStepBadge.textContent = `Étape ${stepIdx + 1}/${totalSteps}`;
          guideStepBadge.style.color = "#2563eb";
          guideTitle.textContent = currentStep?.label || route.description || "Navigation";
          guideHint.textContent = currentStep?.hint || "Cliquez sur l'élément surligné pour continuer.";
        }

        btnRestart.disabled = false;
        btnClear.disabled = false;
      } else {
        guideStepBadge.textContent = "Aucun guide actif";
        guideStepBadge.style.color = "#64748b";
        guideTitle.textContent = "En attente d'un parcours";
        guideHint.textContent = "Déclenchez un guidage via l'agent ou les commandes MCP pour lancer le GPS.";
        btnRestart.disabled = true;
        btnClear.disabled = true;
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Action listeners
  btnRestart.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "RESET_STEP" }, () => {
      refreshStatus();
    });
  });

  btnClear.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "CLEAR_GUIDE" }, () => {
      refreshStatus();
    });
  });

  btnSaveUrl.addEventListener("click", () => {
    const newUrl = bridgeUrlInput.value.trim();
    if (newUrl) {
      chrome.runtime.sendMessage({ action: "SET_BRIDGE_URL", url: newUrl }, () => {
        refreshStatus();
      });
    }
  });

  loadDomains();
  refreshStatus();
  setInterval(refreshStatus, 2000);
});
