# Developer & Engineer Context Index

High-density routing map for modifying codebase, maintaining MCP tools, updating extension engines, and running test suites.

---

## 1. Technical Documentation & Specs
- **Architecture & Protocol Specifications**: [`.agents/docs/ARCHITECTURE.md`](file:///g:/doc/projets/AgenticAxelor/.agents/docs/ARCHITECTURE.md) (Mermaid topology, Bridge `:3210` endpoints, contracts, HUD engine).
- **Developer Guide & CLI Matrix**: [`.agents/docs/DEV_GUIDE.md`](file:///g:/doc/projets/AgenticAxelor/.agents/docs/DEV_GUIDE.md) (Dev commands, CLI testing suite, skills catalog).
- **Axelor Open Suite XML Matrix**: [`.agents/Axelor-index.md`](file:///g:/doc/projets/AgenticAxelor/.agents/Axelor-index.md) (Module index and XML glob mapping).
- **Active Session Handoff**: [`.agents/HANDOFF.md`](file:///g:/doc/projets/AgenticAxelor/.agents/HANDOFF.md) (Current development status and execution frontier).

---

## 2. Workspace Layout

| Path | Component / Target | Key Entry Points |
| :--- | :--- | :--- |
| `src/` | MCP Server & Local Bridge Server (`:3210`) | [`src/index.ts`](file:///g:/doc/projets/AgenticAxelor/src/index.ts), [`src/services/guidanceService.ts`](file:///g:/doc/projets/AgenticAxelor/src/services/guidanceService.ts), [`src/types/guidance.ts`](file:///g:/doc/projets/AgenticAxelor/src/types/guidance.ts) |
| `extension/` | Chrome Extension Copilot HUD (Manifest V3) | [`extension/spotlightEngine.js`](file:///g:/doc/projets/AgenticAxelor/extension/spotlightEngine.js), [`extension/spotlight.css`](file:///g:/doc/projets/AgenticAxelor/extension/spotlight.css), [`extension/background.js`](file:///g:/doc/projets/AgenticAxelor/extension/background.js) |
| `.agents/skills/` | Dev Skills Registry | `read-only-consultant`, `stepwise-planner`, `handoff`, `axelor-guidance-builder` |
| `reference-sources/` | Upstream Axelor ERP codebase | Query XML resources using globs from [`.agents/Axelor-index.md`](file:///g:/doc/projets/AgenticAxelor/.agents/Axelor-index.md) |

---

## 3. Engineering Directives
- **Zero Java UI Scanning**: Restrict UI, field, and view discovery to XML files (`*-form.xml`, `*-menu.xml`, `*-grid.xml`).
- **Strict Typing**: Ground all changes in typed interfaces ([`src/types/`](file:///g:/doc/projets/AgenticAxelor/src/types)).
- **DOM Decoupling**: Keep browser Copilot HUD fully isolated from Axelor host React internals.
