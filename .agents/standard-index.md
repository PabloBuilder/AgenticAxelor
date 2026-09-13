# Standard Operator & User Context Index

High-density routing map for operating AgenticAxelor tools, executing MCP queries, and authoring browser guidance routes without modifying codebase.

---

## 1. Primary References
- **Quick Start & Tool Usage**: [`README.md`](file:///g:/doc/projets/AgenticAxelor/README.md)
- **Guidance Route Authoring Skill**: [`.agents/skills/axelor-guidance-builder/SKILL.md`](file:///g:/doc/projets/AgenticAxelor/.agents/skills/axelor-guidance-builder/SKILL.md)
- **Axelor REST API Cheatsheet**: [`.agents/docs/axelor-api-cheatsheet.md`](file:///g:/doc/projets/AgenticAxelor/.agents/docs/axelor-api-cheatsheet.md)

---

## 2. Runtime Architecture & Ports
- **Local Bridge Server**: `http://localhost:3210` (HTTP/SSE sync with browser extension).
- **Active MCP Tools**:
  - `guide_axelor_path`: Injects step-by-step guidance roadmaps into browser Copilot HUD.
  - `clear_axelor_guide`: Hides active guidance HUD.
  - `search_axelor_menu`: Looks up Axelor menu tree and navigation targets.
  - `inspect_axelor_view`: Introspects form fields, tabs, and sub-grids.
  - `query_axelor_data`: Runs entity search and domain filter queries.
  - `save_axelor_record`: Creates or updates ERP records via REST API.

---

## 3. Operational Rules
- Do NOT edit TypeScript or extension source files.
- Ensure scenarios follow Axelor state transitions (Edit mode switch, sub-modal CRUD, parent commit, grouped fields).
- **Schema Grounding**: Structure guidance payloads strictly against the `GuidanceRoute` contract defined in [axelor-guidance-builder](file:///g:/doc/projets/AgenticAxelor/.agents/skills/axelor-guidance-builder/SKILL.md).
