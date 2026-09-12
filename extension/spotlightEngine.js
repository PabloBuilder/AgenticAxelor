/**
 * AgenticAxelor - Passive GPS Spotlight & Click Listener Engine
 */

(function () {
  window.AxelorSpotlight = {
    currentRoute: null,
    activeStepIndex: 0,
    currentHighlightedEl: null,
    hudEl: null,
    isExpanded: false,
    lastRenderedStepKey: null,
    observer: null,
    isRendering: false,

    init() {
      this.createHUD();
      this.startObserver();
    },

    createHUD() {
      if (document.getElementById("agentic-axelor-hud")) {
        this.hudEl = document.getElementById("agentic-axelor-hud");
        return;
      }

      const hud = document.createElement("div");
      hud.id = "agentic-axelor-hud";
      hud.className = "hidden";
      document.body.appendChild(hud);
      this.hudEl = hud;
    },

    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      this.lastRenderedStepKey = null;
      this.render();
    },

    collapse() {
      this.isExpanded = false;
      this.lastRenderedStepKey = null;
      this.render();
    },

    expand() {
      this.isExpanded = true;
      this.lastRenderedStepKey = null;
      this.render();
    },

    setRoute(route, activeStepIndex = 0) {
      const routeChanged = !this.currentRoute || this.currentRoute.id !== route?.id;
      this.currentRoute = route;
      this.activeStepIndex = activeStepIndex;
      
      if (routeChanged && route && route.steps && route.steps.length > 0) {
        this.isExpanded = true;
      }
      this.render();
    },

    clear() {
      this.clearHighlight();
      this.currentRoute = null;
      this.activeStepIndex = 0;
      this.isExpanded = false;
      this.lastRenderedStepKey = null;
      if (this.hudEl) {
        this.hudEl.className = "hidden";
        this.hudEl.innerHTML = "";
      }
    },

    clearHighlight() {
      if (this.currentHighlightedEl) {
        this.currentHighlightedEl.classList.remove("agentic-axelor-highlighted");
        this.currentHighlightedEl = null;
      }
    },

    render() {
      if (this.isRendering) return;
      this.isRendering = true;

      try {
        if (!this.currentRoute || !this.currentRoute.steps || this.currentRoute.steps.length === 0) {
          this.clear();
          return;
        }

        const isCompleted = this.activeStepIndex >= this.currentRoute.steps.length;

        if (isCompleted) {
          this.renderCompleted();
          return;
        }

        const step = this.currentRoute.steps[this.activeStepIndex];
        this.renderHUDContent(step);

        // Highlight element if not already highlighted
        if (!this.currentHighlightedEl || !document.body.contains(this.currentHighlightedEl)) {
          const targetEl = this.findElement(step);
          if (targetEl) {
            this.clearHighlight();
            targetEl.classList.add("agentic-axelor-highlighted");
            this.currentHighlightedEl = targetEl;

            // Passive one-time advance on target click
            const onClickHandler = () => {
              targetEl.removeEventListener("click", onClickHandler);
              this.advance();
            };
            targetEl.addEventListener("click", onClickHandler, { once: true });
          }
        }
      } finally {
        this.isRendering = false;
      }
    },

    renderHUDContent(step = null) {
      if (!this.hudEl) this.createHUD();
      this.hudEl.className = "";

      if (!step && this.currentRoute && this.currentRoute.steps) {
        step = this.currentRoute.steps[this.activeStepIndex];
      }

      const totalSteps = this.currentRoute?.steps?.length || 1;
      const currentStepNum = Math.min(this.activeStepIndex + 1, totalSteps);
      const stepKey = `${this.currentRoute?.id || 'none'}-${this.activeStepIndex}-${this.isExpanded}`;

      // Prevent DOM wiping if view state is unchanged (stops flickering & dead clicks)
      if (this.lastRenderedStepKey === stepKey) {
        return;
      }
      this.lastRenderedStepKey = stepKey;

      if (!this.isExpanded) {
        // State 1: Ultra-minimalist Circular Pill Trigger
        this.hudEl.innerHTML = `
          <div class="ax-hud-pill" id="ax-hud-pill-trigger" title="Ouvrir l'assistant GPS Axelor">
            <div class="ax-hud-pill-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            </div>
            <div class="ax-hud-pill-badge">${currentStepNum}/${totalSteps}</div>
          </div>
        `;

        const pill = document.getElementById("ax-hud-pill-trigger");
        if (pill) {
          pill.onclick = (e) => {
            e.stopPropagation();
            this.expand();
          };
        }
      } else {
        // State 2: Unfolded Glass Card
        const breadcrumbHtml = (step?.breadcrumb || [])
          .map((b) => `<span>${this.escapeHtml(b)}</span>`)
          .join("");

        const isNotFirstStep = this.activeStepIndex > 0;

        this.hudEl.innerHTML = `
          <div class="ax-hud-card">
            <div class="ax-hud-header">
              <div class="ax-hud-header-left">
                <span class="ax-hud-tag">GPS AXELOR</span>
                <span class="ax-hud-step-pill">Étape ${currentStepNum}/${totalSteps}</span>
              </div>
              <button class="ax-hud-btn-minimize" id="ax-hud-minimize-btn" title="Minimiser l'assistant" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="ax-hud-title">${this.escapeHtml(step?.label || "Navigation")}</div>
            <div class="ax-hud-hint">${this.escapeHtml(step?.hint || "Cliquez sur l'élément surligné pour continuer.")}</div>
            ${breadcrumbHtml ? `<div class="ax-hud-breadcrumb">${breadcrumbHtml}</div>` : ""}
            <div class="ax-hud-actions">
              <button class="ax-hud-btn-secondary" id="ax-hud-rollback-btn" type="button" title="Revenir au début du parcours" ${!isNotFirstStep ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <span>Recommencer</span>
              </button>
              <div class="ax-hud-actions-right">
                <button class="ax-hud-btn-action" id="ax-hud-skip-btn" type="button">Passer l'étape ➜</button>
              </div>
            </div>
          </div>
        `;

        const minimizeBtn = document.getElementById("ax-hud-minimize-btn");
        if (minimizeBtn) {
          minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            this.collapse();
          };
        }

        const rollbackBtn = document.getElementById("ax-hud-rollback-btn");
        if (rollbackBtn && isNotFirstStep) {
          rollbackBtn.onclick = (e) => {
            e.stopPropagation();
            this.rollback();
          };
        }

        const skipBtn = document.getElementById("ax-hud-skip-btn");
        if (skipBtn) {
          skipBtn.onclick = (e) => {
            e.stopPropagation();
            this.advance();
          };
        }
      }
    },

    renderCompleted() {
      this.clearHighlight();
      if (!this.hudEl) return;
      this.hudEl.className = "";

      const totalSteps = this.currentRoute?.steps?.length || 1;
      const stepKey = `completed-${this.isExpanded}`;

      if (this.lastRenderedStepKey === stepKey) {
        return;
      }
      this.lastRenderedStepKey = stepKey;

      if (!this.isExpanded) {
        // Collapsed Completed Pill
        this.hudEl.innerHTML = `
          <div class="ax-hud-pill" id="ax-hud-pill-trigger" title="Guide terminé (cliquez pour ouvrir)">
            <div class="ax-hud-pill-icon" style="color: #10b981;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="ax-hud-pill-badge" style="background: #10b981;">✓</div>
          </div>
        `;

        const pill = document.getElementById("ax-hud-pill-trigger");
        if (pill) {
          pill.onclick = (e) => {
            e.stopPropagation();
            this.expand();
          };
        }
      } else {
        // Expanded Completed Card
        this.hudEl.innerHTML = `
          <div class="ax-hud-card">
            <div class="ax-hud-header">
              <span class="ax-hud-tag" style="color: #10b981;">TERMINÉ</span>
              <button class="ax-hud-btn-minimize" id="ax-hud-minimize-btn" type="button" title="Minimiser l'assistant">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="ax-hud-title">Objectif atteint !</div>
            <div class="ax-hud-hint">Vous êtes arrivé à destination sur le bon écran.</div>
            <div class="ax-hud-actions" style="margin-top: 14px;">
              <button class="ax-hud-btn-secondary" id="ax-hud-restart-btn" type="button">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <span>Recommencer le guide</span>
              </button>
            </div>
          </div>
        `;

        const minimizeBtn = document.getElementById("ax-hud-minimize-btn");
        if (minimizeBtn) {
          minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            this.collapse();
          };
        }

        const restartBtn = document.getElementById("ax-hud-restart-btn");
        if (restartBtn) {
          restartBtn.onclick = (e) => {
            e.stopPropagation();
            this.rollback();
          };
        }
      }
    },

    advance() {
      this.lastRenderedStepKey = null;
      chrome.runtime.sendMessage({ action: "ADVANCE_STEP" }, () => {
        if (this.currentRoute) {
          this.activeStepIndex++;
          this.clearHighlight();
          this.render();
        }
      });
    },

    rollback() {
      this.lastRenderedStepKey = null;
      this.isExpanded = true;
      chrome.runtime.sendMessage({ action: "RESET_STEP" }, () => {
        if (this.currentRoute) {
          this.activeStepIndex = 0;
          this.clearHighlight();
          this.render();
        }
      });
    },

    escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    findElement(step) {
      // 1. Direct standard CSS selector
      try {
        if (step.selector && !step.selector.includes(":contains") && !step.selector.includes(":has")) {
          const el = document.querySelector(step.selector);
          if (el && this.isVisible(el)) return el;
        }
      } catch {}

      // 2. Specialized toolbar button discovery for Axelor (+) and (Nouveau) buttons
      if (step.type === "button" || (step.label && (step.label.includes("Nouveau") || step.label.includes("+")))) {
        const newBtn = document.querySelector(
          ".btn-toolbar button:has(.fa-plus), .view-toolbar button:has(.fa-plus), button:has(i.fa-plus), button[name='new'], button.btn-new, button[title*='New'], button[title*='Nouveau'], a:has(i.fa-plus)"
        );
        if (newBtn && this.isVisible(newBtn)) return newBtn;

        const allButtons = Array.from(document.querySelectorAll("button, a.btn, .btn"));
        for (const btn of allButtons) {
          const hasPlusIcon = !!btn.querySelector(".fa-plus, .icon-plus, i.fa");
          const text = btn.textContent?.trim().toLowerCase() || "";
          const title = btn.getAttribute("title")?.toLowerCase() || "";
          if (hasPlusIcon || text.includes("nouveau") || title.includes("nouveau") || text === "+") {
            if (this.isVisible(btn)) return btn;
          }
        }
      }

      // 3. Target Axelor Sidebar & Navigation Items specifically
      if (step.label) {
        const query = step.label.toLowerCase().trim();
        const menuCandidates = Array.from(
          document.querySelectorAll(
            ".nav-item, .nav-link, .sidebar-nav li, .treeview li, a, button, [data-menu-title], span"
          )
        );

        for (const el of menuCandidates) {
          const text = el.textContent?.trim().toLowerCase() || "";
          const title = el.getAttribute("title")?.toLowerCase() || "";

          if (
            text === query ||
            title === query ||
            (query.length > 4 && (text.includes(query) || title.includes(query)))
          ) {
            const clickable = el.closest("a, button, .nav-item, li") || el;
            if (this.isVisible(clickable)) return clickable;
          }
        }

        if (query.includes("config") || query.includes("application")) {
          const match = Array.from(document.querySelectorAll("a, span, .nav-item")).find(
            (el) => el.textContent?.toLowerCase().includes("config")
          );
          if (match && this.isVisible(match)) return match.closest("a, li") || match;
        }
      }

      // 4. Try fallback selectors
      if (step.fallbackSelectors) {
        for (const selector of step.fallbackSelectors) {
          try {
            if (!selector.includes(":contains") && !selector.includes(":has")) {
              const el = document.querySelector(selector);
              if (el && this.isVisible(el)) return el;
            }
          } catch {}
        }
      }

      return null;
    },

    isVisible(el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    },

    startObserver() {
      let debounceTimer = null;
      this.observer = new MutationObserver((mutations) => {
        // Ignore mutations triggered from our own HUD container
        const isHudMutation = mutations.every((m) => {
          return this.hudEl && (this.hudEl === m.target || this.hudEl.contains(m.target));
        });
        if (isHudMutation) return;

        if (this.currentRoute && !this.currentHighlightedEl) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.render();
          }, 200);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },
  };

  // Auto initialize when loaded in page
  if (document.body) {
    window.AxelorSpotlight.init();
  } else {
    document.addEventListener("DOMContentLoaded", () => window.AxelorSpotlight.init());
  }
})();
