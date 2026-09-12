# REPOSITORY CONTEXT ROUTING MAP

High-density routing index for autonomous agent exploration and context loading.

## Topology & Technical Specs
- **System Architecture & API Protocols**: [`ARCHITECTURE.md`](file:///g:/doc/projets/AgenticAxelor/ARCHITECTURE.md) (Mermaid topology, Bridge `:3210` endpoints, contracts, HUD engine).
- **Agent Behavioral Rules**: [`.agents/rules/agents.md`](file:///g:/doc/projets/AgenticAxelor/.agents/rules/agents.md) (XML-only UI tracing algorithms, passive operator directives).
- **Axelor Open Suite XML Matrix**: [`.agents/Axelor-index.md`](file:///g:/doc/projets/AgenticAxelor/.agents/Axelor-index.md) (Module index and XML glob mapping).

---

## Workspace Layout

| Path | Purpose | Key References |
| :--- | :--- | :--- |
| `src/` | MCP Server & Local Bridge Server (`:3210`) | [`src/index.ts`](file:///g:/doc/projets/AgenticAxelor/src/index.ts), [`src/services/guidanceService.ts`](file:///g:/doc/projets/AgenticAxelor/src/services/guidanceService.ts) |
| `extension/` | Passive Chrome Extension (Manifest V3) | [`extension/spotlightEngine.js`](file:///g:/doc/projets/AgenticAxelor/extension/spotlightEngine.js), [`extension/popup.html`](file:///g:/doc/projets/AgenticAxelor/extension/popup.html) |
| `axelor-open-suite/` | Core ERP modules (Models, Views, Actions, Menus) | Search solely via XML definitions per [`.agents/Axelor-index.md`](file:///g:/doc/projets/AgenticAxelor/.agents/Axelor-index.md) |
| `Alter-si Documenatation/` | Client & functional ERP reference manuals | Direct filename keyword lookup |
| `Donnés trataiées/` | Volatile datasets & active working drafts | Ephemeral working data |
