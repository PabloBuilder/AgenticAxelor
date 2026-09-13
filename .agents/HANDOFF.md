# Session Handoff: Axelor Pure Step-by-Step Copilot HUD

## 1. Goal
- Pivot the Chrome Extension from brittle auto-click/DOM spotlighting to a robust, non-intrusive step-by-step Copilot HUD providing clear actions, copyable values, and contextual explanations with bidirectional navigation.

## 2. Key Decisions & Architecture
- **DOM Decoupling & Dead Code Archive**: Removed active DOM injection, synthetic clicks, and pulsing halo rings to avoid React 18 / portal desyncs. Legacy methods preserved in dead-code comments (`[spotlightEngine.js](file:///g:/doc/projets/AgenticAxelor/extension/spotlightEngine.js)` & `[spotlight.css](file:///g:/doc/projets/AgenticAxelor/extension/spotlight.css)`).
- **HUD Hierarchy & Copyable Fields**: Glassmorphism bottom-right card with step badge, direct action directive (`hint`), single/multi-field copy table with unit `📋 Copier` triggers, breadcrumbs, and conditional context block (`explanation` / `💡 Bon à savoir`).
- **Bidirectional Control**: Full support for previous step (`/api/guide/previous`), reset (`/api/guide/reset`), advance (`/api/guide/advance`), and clear (`/api/guide/clear`) via Local Bridge (`localhost:3210`).
- **Standardized Guidance Authoring**: Dedicated skill `axelor-guidance-builder` enforcing Axelor ERP CRUD state transitions (Edit mode switch, grouped sub-modal inputs, parent persistence).

## 3. Important Files
- `[spotlightEngine.js](file:///g:/doc/projets/AgenticAxelor/extension/spotlightEngine.js)`: Copilot HUD rendering engine, pill/card expansion, multi-field copy table, and bidirectional step message dispatching.
- `[spotlight.css](file:///g:/doc/projets/AgenticAxelor/extension/spotlight.css)`: Minimalist glassmorphism styles for instructions box, copy tables, explanation callouts, and navigation actions.
- `[guidance.ts](file:///g:/doc/projets/AgenticAxelor/src/types/guidance.ts)`: Canonical TypeScript schema supporting `explanation`, `fields`, and `valueHint`.
- `[bridgeServer.ts](file:///g:/doc/projets/AgenticAxelor/src/services/bridgeServer.ts)`: Local HTTP & SSE server supporting `push`, `advance`, `previous`, and `reset`.
- `[background.js](file:///g:/doc/projets/AgenticAxelor/extension/background.js)`: Extension service worker routing `ADVANCE_STEP`, `PREVIOUS_STEP`, and `RESET_STEP`.
- `[pushSubWindowGuide.ts](file:///g:/doc/projets/AgenticAxelor/src/cli/pushSubWindowGuide.ts)`: Reference scenario for adding a contact to a supplier with multi-field copy table.
- `[SKILL.md](file:///g:/doc/projets/AgenticAxelor/.agents/skills/axelor-guidance-builder/SKILL.md)`: Skill instructions for generating complete Axelor guidance routes.

## 4. Verified Facts & Completed Work
- Verified `/api/guide/previous`, `/api/guide/advance`, `/api/guide/reset`, and `/api/guide/push` endpoints in `[bridgeServer.ts](file:///g:/doc/projets/AgenticAxelor/src/services/bridgeServer.ts)`.
- Implemented single and multi-field copyable tables with clipboard feedback (`✓ Copié !` / `✓`) in `[spotlightEngine.js](file:///g:/doc/projets/AgenticAxelor/extension/spotlightEngine.js)`.
- Verified contextual advice block rendering (`💡 Bon à savoir`) powered by `step.explanation`.
- Fully documented and updated `[README.md](file:///g:/doc/projets/AgenticAxelor/README.md)`, `[ARCHITECTURE.md](file:///g:/doc/projets/AgenticAxelor/.agents/docs/ARCHITECTURE.md)`, and `[DEV_GUIDE.md](file:///g:/doc/projets/AgenticAxelor/.agents/docs/DEV_GUIDE.md)`.

## 5. Status
- **System Ready**: All architectural contracts, bridge endpoints, extension HUD components, skills, and documentation files are fully synchronized and operational.
