# Chrome Extension & Copilot HUD Specification

Technical breakdown of the Manifest V3 passive overlay engine and perimeter detection.

---

## 1. Perimeter Detection Pipeline (`extension/content.js`)

1. **Tier 1 (Host/Storage Match)**: Checks `window.location.hostname` against `chrome.storage.local.customAxelorDomains` + default keywords (`axelor`, `open-suite`).
2. **Tier 2 (DOM & Framework Markers)**: Evaluates root selectors (`[ng-app*='axelor']`, `#axelor-app`, `.navbar-axelor`, `meta[name='axelor:version']`, `link[href*='axelor']`).
3. **Tier 3 (Passive Bailout)**: Non-Axelor pages skip bridge polling and suppress HUD rendering completely.

---

## 2. Dual-State Pure HUD Engine (`extension/spotlightEngine.js`)

- **Design Tokens**: Glassmorphism card (`rgba(255, 255, 255, 0.95)` + `blur(24px)` + subtle border & glow).
- **State 1 (Collapsed Pill)**: 48px round trigger with current step badge (`X/Y`), click-to-expand.
- **State 2 (Expanded Glass Card)**: Unfolded 380px card containing:
  - Header with step pill (`Step X/Y`) and minimize toggle.
  - Action directive (`ax-hud-instruction-box`).
  - Single copyable badge or multi-fields table (`ax-hud-fields-table`) with unit Copy triggers.
  - Contextual advice block (Pro Tip) powered by `step.explanation`.
  - Breadcrumb trail (`ax-hud-breadcrumb`).
  - Bidirectional navigation: Previous, Reset, and Next / Finish.
- **Render Cache (`lastRenderedStepKey`)**: Prevents DOM re-renders during active polling to avoid UI flickering and broken clipboard handlers.
- **DOM Decoupling**: Complete separation from host ERP internals—no synthetic auto-clicks, no DOM hijacking, no fragile outline injections.
