# Developer & Engineer Context Index

High-density routing map for modifying codebase, maintaining MCP tools, updating extension engines, and running test suites.

---

## 1. Technical Documentation & Specs
- **Architecture & Protocol Specifications**: [`.agents/docs/ARCHITECTURE.md`](.agents/docs/ARCHITECTURE.md) (Mermaid topology, Bridge `:3210` endpoints, contracts, HUD engine).
- **Developer Guide & CLI Matrix**: [`.agents/docs/DEV_GUIDE.md`](.agents/docs/DEV_GUIDE.md) (Dev commands, CLI testing suite, skills catalog).
- **Axelor Open Suite XML Matrix**: [`.agents/Axelor-index.md`](.agents/Axelor-index.md) (Module index and XML glob mapping).
- **Active Session Handoff**: [`.agents/HANDOFF.md`](.agents/HANDOFF.md) (Current development status and execution frontier).

---

## 2. Workspace Layout

| Path | Component / Target | Key Entry Points |
| :--- | :--- | :--- |
| `src/` | MCP Server & Local Bridge Server (`:3210`) | [`src/index.ts`](src/index.ts), [`src/services/guidanceService.ts`](src/services/guidanceService.ts), [`src/types/guidance.ts`](src/types/guidance.ts) |
| `extension/` | Chrome Extension Copilot HUD (Manifest V3) | [`extension/spotlightEngine.js`](extension/spotlightEngine.js), [`extension/spotlight.css`](extension/spotlight.css), [`extension/background.js`](extension/background.js) |
| `.agents/skills/` | Dev Skills Registry | `read-only-consultant`, `stepwise-planner`, `handoff`, `axelor-guidance-builder` |
| `reference-sources/` | Upstream Axelor ERP codebase | Query XML resources using globs from [`.agents/Axelor-index.md`](.agents/Axelor-index.md) |

---

## 3. Engineering Directives
- **Zero Java UI Scanning**: Restrict UI, field, and view discovery to XML files (`*-form.xml`, `*-menu.xml`, `*-grid.xml`).
- **Strict Typing**: Ground all changes in typed interfaces ([`src/types/`](src/types/)).
- **DOM Decoupling**: Keep browser Copilot HUD fully isolated from Axelor host React internals.

