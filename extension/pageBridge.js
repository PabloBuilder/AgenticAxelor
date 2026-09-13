/**
 * AgenticAxelor - Page Bridge (Runs in MAIN World context)
 * Directly interacts with React 17/18 Fibers, Component Props, and Native Page Event Handlers.
 */

(function () {
  if (window.__AGENTIC_AXELOR_PAGE_BRIDGE_LOADED__) return;
  window.__AGENTIC_AXELOR_PAGE_BRIDGE_LOADED__ = true;

  console.log("[AgenticAxelor PageBridge] Initialized in MAIN world context.");

  const activeClicks = new Set();

  function dispatchSyntheticSequence(targetEl) {
    if (!targetEl) return;
    const win = targetEl.ownerDocument?.defaultView || window;
    const rect = targetEl.getBoundingClientRect ? targetEl.getBoundingClientRect() : { clientX: 0, clientY: 0 };
    const clientX = rect.left + (rect.width || 0) / 2;
    const clientY = rect.top + (rect.height || 0) / 2;

    const eventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: win,
      clientX,
      clientY,
      button: 0,
      buttons: 1
    };

    // 1. Focus
    if (typeof targetEl.focus === "function") {
      try { targetEl.focus(); } catch {}
    }

    // 2. Pointer & Mouse down sequence (critical for React 18 controlled components & modals)
    if (typeof win.PointerEvent === "function") {
      targetEl.dispatchEvent(new win.PointerEvent("pointerdown", eventInit));
    }
    targetEl.dispatchEvent(new win.MouseEvent("mousedown", eventInit));

    // 3. Pointer & Mouse up
    if (typeof win.PointerEvent === "function") {
      targetEl.dispatchEvent(new win.PointerEvent("pointerup", { ...eventInit, buttons: 0 }));
    }
    targetEl.dispatchEvent(new win.MouseEvent("mouseup", { ...eventInit, buttons: 0 }));

    // 4. Click
    if (typeof targetEl.click === "function") {
      targetEl.click();
    } else {
      targetEl.dispatchEvent(new win.MouseEvent("click", { ...eventInit, buttons: 0 }));
    }
  }

  function findFiberHandler(fiber, maxDepth = 6) {
    let curr = fiber;
    let depth = 0;
    while (curr && depth < maxDepth) {
      const props = curr.memoizedProps;
      if (props) {
        if (typeof props.onClick === "function") return { fn: props.onClick, target: curr.stateNode, props };
        if (typeof props.onItemClick === "function") return { fn: props.onItemClick, target: curr.stateNode, props, arg: props.item || props };
        if (typeof props.onSelect === "function") return { fn: props.onSelect, target: curr.stateNode, props, arg: props.item || props.eventKey || props };
        if (typeof props.onChange === "function" && (curr.stateNode?.tagName === "INPUT" || curr.stateNode?.tagName === "SELECT")) {
          return { fn: props.onChange, target: curr.stateNode, props };
        }
      }
      curr = curr.return;
      depth++;
    }
    return null;
  }

  function performMainWorldClick(targetId) {
    if (!targetId || activeClicks.has(targetId)) return false;
    activeClicks.add(targetId);
    setTimeout(() => activeClicks.delete(targetId), 400);

    try {
      const target = document.querySelector(`[data-ax-autoclick="${targetId}"]`);
      if (!target) {
        console.warn("[AgenticAxelor PageBridge] Target not found for ID:", targetId);
        return false;
      }

      console.log("[AgenticAxelor PageBridge] Executing atomic single-shot click on:", target);

      // Identify closest interactive leaf element (button, a, link, input, tab)
      const interactiveEl = target.matches("button, a, input, select, textarea, [role='button'], [role='menuitem'], [role='treeitem'], [role='tab'], .nav-link")
        ? target
        : (target.closest("button, a, input, select, textarea, [role='button'], [role='menuitem'], [role='treeitem'], [role='tab'], .nav-link") ||
           target.querySelector("button, a, input, select, textarea, [role='button'], [role='menuitem'], [role='treeitem'], [role='tab'], .nav-link") ||
           target);

      const candidates = [
        interactiveEl,
        target,
        target.parentElement,
        target.closest("li, .nav-item, .btn-group, [role='group']")
      ].filter(Boolean);

      // Strategy 1: Find React Props onClick / onItemClick on direct candidate nodes
      for (const cand of candidates) {
        const reactPropKey = Object.keys(cand).find(
          (k) => k.startsWith("__reactProps$") || k.startsWith("__reactEventHandlers$")
        );

        if (reactPropKey && cand[reactPropKey]) {
          const props = cand[reactPropKey];
          if (typeof props.onClick === "function") {
            console.log("[AgenticAxelor PageBridge] Executed React props.onClick on:", cand);
            props.onClick({
              preventDefault: () => {},
              stopPropagation: () => {},
              target: cand,
              currentTarget: cand,
              bubbles: true
            });
            return true;
          }
          if (typeof props.onItemClick === "function") {
            console.log("[AgenticAxelor PageBridge] Executed React props.onItemClick on:", cand);
            props.onItemClick(props.item || props);
            return true;
          }
          if (typeof props.onSelect === "function") {
            console.log("[AgenticAxelor PageBridge] Executed React props.onSelect on:", cand);
            props.onSelect(props.item || props.eventKey || props);
            return true;
          }
        }
      }

      // Strategy 2: Deep React Fiber memoizedProps & Parent hierarchy traversal
      for (const cand of candidates) {
        const reactFiberKey = Object.keys(cand).find(
          (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
        );
        if (reactFiberKey && cand[reactFiberKey]) {
          const handler = findFiberHandler(cand[reactFiberKey], 6);
          if (handler) {
            console.log("[AgenticAxelor PageBridge] Executed Fiber parent handler on:", cand);
            handler.fn(handler.arg || {
              preventDefault: () => {},
              stopPropagation: () => {},
              target: cand,
              currentTarget: cand,
              bubbles: true
            });
            return true;
          }
        }
      }

      // Strategy 3: Full synthetic event sequence (pointerdown -> mousedown -> mouseup -> click)
      console.log("[AgenticAxelor PageBridge] Executing full synthetic event sequence on:", interactiveEl);
      dispatchSyntheticSequence(interactiveEl);

      return true;
    } catch (err) {
      console.error("[AgenticAxelor PageBridge] Execution error:", err);
      return false;
    }
  }

  // Listen via single CustomEvent channel across document
  document.addEventListener("AGENTIC_AXELOR_CLICK_REQUEST", (e) => {
    if (e.detail && e.detail.targetId) {
      performMainWorldClick(e.detail.targetId);
    }
  });
})();
