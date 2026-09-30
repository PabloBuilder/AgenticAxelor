/**
 * AgenticAxelor - Step-by-Step GPS Copilot HUD Engine
 * Provides clean, deterministic step-by-step guidance cards without DOM hijacking or intrusive halos.
 */

(function () {
  window.AxelorSpotlight = {
    currentRoute: null,
    activeStepIndex: 0,
    currentHighlightedEl: null,
    hudEl: null,
    isExpanded: true,
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
      this.currentRoute = route;
      this.activeStepIndex = activeStepIndex;
      
      if (route && route.steps && route.steps.length > 0) {
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
      // Archived: No visual DOM alteration
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

      if (this.lastRenderedStepKey === stepKey) {
        return;
      }
      this.lastRenderedStepKey = stepKey;

      if (!this.isExpanded) {
        // State 1: Ultra-minimalist Circular Pill Trigger
        this.hudEl.innerHTML = `
          <div class="ax-hud-pill" id="ax-hud-pill-trigger" title="Ouvrir le guide Copilot Axelor">
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
        // State 2: Unfolded Clean Copilot Card
        const breadcrumbHtml = (step?.breadcrumb || [])
          .map((b) => `<span>${this.escapeHtml(b)}</span>`)
          .join("");

        const isNotFirstStep = this.activeStepIndex > 0;
        const isLastStep = this.activeStepIndex === totalSteps - 1;

        // Build Copyable Fields Block (Single value badge or Multi-values table)
        let valuesHtml = "";
        const fieldsList = (step?.fields && step.fields.length > 0)
          ? step.fields
          : (step?.valueHint ? [{ label: "Valeur", value: step.valueHint }] : []);

        if (fieldsList.length === 1) {
          // Single Value Badge with Copy button
          const singleField = fieldsList[0];
          valuesHtml = `
            <div class="ax-hud-value-box">
              <div class="ax-hud-value-header">
                <span class="ax-hud-value-label">${this.escapeHtml(singleField.label || "Valeur à saisir")}</span>
                <button class="ax-hud-btn-copy" type="button" data-copy-val="${this.escapeHtml(singleField.value)}">
                  📋 Copier
                </button>
              </div>
              <div class="ax-hud-value-content">${this.escapeHtml(singleField.value)}</div>
            </div>
          `;
        } else if (fieldsList.length > 1) {
          // Multi-values Table with independent unit copy buttons
          const rows = fieldsList.map((f, idx) => `
            <tr>
              <td class="ax-hud-tbl-label">${this.escapeHtml(f.label)}</td>
              <td class="ax-hud-tbl-val"><code>${this.escapeHtml(f.value)}</code></td>
              <td class="ax-hud-tbl-action">
                <button class="ax-hud-btn-copy-sm" type="button" data-copy-val="${this.escapeHtml(f.value)}" title="Copier ${this.escapeHtml(f.label)}">
                  📋
                </button>
              </td>
            </tr>
          `).join("");

          valuesHtml = `
            <div class="ax-hud-fields-table-box">
              <div class="ax-hud-fields-table-title">Champs à renseigner (${fieldsList.length})</div>
              <table class="ax-hud-fields-table">
                <thead>
                  <tr>
                    <th>Champ</th>
                    <th>Valeur</th>
                    <th style="width: 38px;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }

        this.hudEl.innerHTML = `
          <div class="ax-hud-card">
            <div class="ax-hud-header">
              <div class="ax-hud-header-left">
                <span class="ax-hud-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  Guide Axelor
                </span>
                <span class="ax-hud-step-pill">Étape ${currentStepNum}/${totalSteps}</span>
              </div>
              <button class="ax-hud-btn-minimize" id="ax-hud-minimize-btn" title="Minimiser l'assistant" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="ax-hud-title">${this.escapeHtml(step?.label || "Instruction")}</div>
            
            <div class="ax-hud-instruction-box">
              <div class="ax-hud-instruction-title">Action requise</div>
              <div class="ax-hud-hint">${this.escapeHtml(step?.hint || "Effectuez l'action sur votre écran puis cliquez sur Suivant.")}</div>
            </div>

            ${valuesHtml}

            ${step?.explanation ? `
            <div class="ax-hud-explanation-box">
              <div class="ax-hud-explanation-title">💡 Bon à savoir</div>
              <div class="ax-hud-explanation-text">${this.escapeHtml(step.explanation)}</div>
            </div>` : ""}

            ${breadcrumbHtml ? `<div class="ax-hud-breadcrumb">${breadcrumbHtml}</div>` : ""}

            <div class="ax-hud-actions">
              <div class="ax-hud-actions-left">
                <button class="ax-hud-btn-secondary" id="ax-hud-prev-btn" type="button" title="Étape précédente" ${!isNotFirstStep ? 'style="opacity: 0.4; pointer-events: none;"' : ''}>
                  ◀ Précédent
                </button>
                <button class="ax-hud-btn-secondary" id="ax-hud-reset-btn" type="button" title="Revenir au début" ${!isNotFirstStep ? 'style="opacity: 0.4; pointer-events: none;"' : ''}>
                  ↺ Début
                </button>
              </div>
              <div class="ax-hud-actions-right">
                <button class="ax-hud-btn-action" id="ax-hud-next-btn" type="button" title="${isLastStep ? 'Finaliser le guide' : 'Passer à l\'étape suivante'}">
                  ${isLastStep ? 'Terminer ✓' : 'Suivant ➜'}
                </button>
              </div>
            </div>
          </div>
        `;

        // Wire Copy Buttons with clipboard feedback
        this.hudEl.querySelectorAll("[data-copy-val]").forEach((btn) => {
          btn.onclick = async (e) => {
            e.stopPropagation();
            const textToCopy = btn.getAttribute("data-copy-val");
            if (!textToCopy) return;

            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
              } else {
                const tempInput = document.createElement("textarea");
                tempInput.value = textToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
              }

              const origText = btn.innerHTML;
              btn.classList.add("ax-hud-copied");
              btn.innerHTML = btn.classList.contains("ax-hud-btn-copy-sm") ? "✓" : "✓ Copié !";
              setTimeout(() => {
                btn.innerHTML = origText;
                btn.classList.remove("ax-hud-copied");
              }, 1600);
            } catch (err) {
              console.warn("[CopilotHUD] Failed to copy:", err);
            }
          };
        });

        const minimizeBtn = document.getElementById("ax-hud-minimize-btn");
        if (minimizeBtn) {
          minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            this.collapse();
          };
        }

        const prevBtn = document.getElementById("ax-hud-prev-btn");
        if (prevBtn && isNotFirstStep) {
          prevBtn.onclick = (e) => {
            e.stopPropagation();
            this.previous();
          };
        }

        const resetBtn = document.getElementById("ax-hud-reset-btn");
        if (resetBtn && isNotFirstStep) {
          resetBtn.onclick = (e) => {
            e.stopPropagation();
            this.rollback();
          };
        }

        const nextBtn = document.getElementById("ax-hud-next-btn");
        if (nextBtn) {
          nextBtn.onclick = (e) => {
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

      const stepKey = `completed-${this.isExpanded}`;
      if (this.lastRenderedStepKey === stepKey) return;
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
              <span class="ax-hud-tag" style="color: #10b981;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                SUCCÈS
              </span>
              <button class="ax-hud-btn-minimize" id="ax-hud-minimize-btn" type="button" title="Minimiser l'assistant">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="ax-hud-title">Parcours terminé avec succès !</div>
            <div class="ax-hud-hint" style="margin-bottom: 14px;">Toutes les étapes ont été suivies jusqu'au bout.</div>
            <div class="ax-hud-actions">
              <button class="ax-hud-btn-secondary" id="ax-hud-restart-btn" type="button">
                ↺ Recommencer le guide
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
          this.render();
        }
      });
    },

    previous() {
      this.lastRenderedStepKey = null;
      chrome.runtime.sendMessage({ action: "PREVIOUS_STEP" }, () => {
        if (this.currentRoute && this.activeStepIndex > 0) {
          this.activeStepIndex--;
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

    startObserver() {
      // Lightweight observer to keep HUD mounted if SPA wipes body
      this.observer = new MutationObserver(() => {
        if (this.currentRoute && (!this.hudEl || !document.body.contains(this.hudEl))) {
          this.createHUD();
          this.lastRenderedStepKey = null;
          this.render();
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: false
      });
    }
  };

  /* ==========================================================================
     LEGACY / DEAD CODE ARCHIVE: AUTO-CLICK & DOM SPOTLIGHT SEARCH
     ========================================================================== */
  /*
  window.AxelorSpotlightLegacy = {
    highlight(targetEl) {
      if (!targetEl) return;
      targetEl.classList.add("agentic-axelor-highlighted");
      this.currentHighlightedEl = targetEl;
    },
    clickTarget(el) {
      if (!el) return false;
      const targetDoc = el.ownerDocument || document;
      targetDoc.dispatchEvent(new CustomEvent("AGENTIC_AXELOR_CLICK_REQUEST", { detail: { targetId: el } }));
      return true;
    },
    findElement(step) {
      // Preserved deep heuristics (Navbar, Material Symbols, Form Tabs, Sub-Grids)
      return null;
    }
  };
  */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.AxelorSpotlight.init());
  } else {
    window.AxelorSpotlight.init();
  }
})();
