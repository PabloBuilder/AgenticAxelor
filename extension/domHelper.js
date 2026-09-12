/**
 * AgenticAxelor - Axelor DOM Inspector & Interaction Engine
 */

window.AxelorDOM = {
  /**
   * Detect current active view, model, title, and record ID from Axelor UI state
   */
  detectActiveView() {
    let viewName = null;
    let model = null;
    let viewType = null;
    let title = null;
    let recordId = null;

    // 1. Try URL hash parameters (#/ds/model/view or similar)
    const hash = window.location.hash || "";
    if (hash.includes("/")) {
      const parts = hash.replace(/^#\/?/, "").split("/");
      if (parts.length >= 2) {
        if (parts[0].includes(".")) {
          model = parts[0];
        }
      }
    }

    // 2. Try Axelor active tab / main container attributes
    const activeTab = document.querySelector(".nav-tabs .active a, .tab-pane.active, .main-view.active");
    if (activeTab) {
      title = activeTab.textContent?.trim() || title;
    }

    // 3. Inspect Form container
    const formContainer = document.querySelector("form.ax-form, .ax-form-view, [data-view-name], [data-model]");
    if (formContainer) {
      viewName = formContainer.getAttribute("data-view-name") || viewName;
      model = formContainer.getAttribute("data-model") || model;
      viewType = formContainer.getAttribute("data-view-type") || "form";
    }

    // 4. Try breadcrumbs or title headers
    const headerTitle = document.querySelector(".view-title, .ax-header-title, .page-header h1, .navbar-brand");
    if (headerTitle && !title) {
      title = headerTitle.textContent?.trim();
    }

    // 5. Look for hidden ID input
    const idInput = document.querySelector("input[name='id'], input[data-field='id']");
    if (idInput && idInput.value) {
      const parsed = parseInt(idInput.value, 10);
      if (!isNaN(parsed)) {
        recordId = parsed;
      }
    }

    return {
      url: window.location.href,
      viewName,
      model,
      viewType,
      title: title || document.title,
      recordId,
    };
  },

  /**
   * Discover visible form input elements on the current Axelor page
   */
  getVisibleFields() {
    const fields = [];
    const inputs = document.querySelectorAll(
      "input:not([type='hidden']), select, textarea, [contenteditable='true'], .select2-container"
    );

    inputs.forEach((el) => {
      // Find field name
      const name =
        el.getAttribute("name") ||
        el.getAttribute("data-field") ||
        el.getAttribute("ng-model") ||
        el.id;

      if (!name) return;

      // Find label
      let label = "";
      const formGroup = el.closest(".form-group, .ax-form-group, tr, td");
      if (formGroup) {
        const labelEl = formGroup.querySelector("label, .control-label, th");
        if (labelEl) {
          label = labelEl.textContent?.trim() || "";
        }
      }

      let val = el.value;
      if (el.type === "checkbox") {
        val = el.checked;
      }

      fields.push({
        name,
        label,
        type: el.tagName.toLowerCase() === "select" ? "select" : el.type || "text",
        value: val,
        disabled: el.disabled || el.readOnly,
      });
    });

    return fields;
  },

  /**
   * Autofill form fields with synthetic DOM events (input, change, blur)
   */
  autofillForm(fieldMap) {
    const filled = [];
    const skipped = [];

    for (const [key, value] of Object.entries(fieldMap)) {
      const input = document.querySelector(
        `[name="${key}"], [data-field="${key}"], #${key}, input[ng-model*="${key}"]`
      );

      if (!input) {
        skipped.push(key);
        continue;
      }

      try {
        if (input.type === "checkbox") {
          input.checked = Boolean(value);
        } else {
          input.value = value;
        }

        // Trigger reactive events so Axelor / Angular / Vue models sync
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("blur", { bubbles: true }));

        filled.push(key);
      } catch {
        skipped.push(key);
      }
    }

    return { filled, skipped };
  },

  /**
   * Trigger a button by action name, class, or title
   */
  triggerButton(btnNameOrTitle) {
    const query = btnNameOrTitle.toLowerCase();
    const buttons = Array.from(document.querySelectorAll("button, a.btn, .ax-btn, .btn"));

    const target = buttons.find((btn) => {
      const text = btn.textContent?.trim().toLowerCase() || "";
      const title = btn.getAttribute("title")?.toLowerCase() || "";
      const name = btn.getAttribute("name")?.toLowerCase() || "";
      return text.includes(query) || title.includes(query) || name === query;
    });

    if (target) {
      target.click();
      return true;
    }

    return false;
  },
};
