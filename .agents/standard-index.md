# Standard Operator & User Context Index

Routing map for using AgenticAxelor with the current session-sync extension and MCP tools.

---

## 1. Primary References
- **Session Setup & Tool Usage**: [README](../README.md)
- **Axelor REST API Cheatsheet**: [Axelor REST API](docs/axelor-api-cheatsheet.md)
- **Optional Server-Side Route Authoring**: [Axelor Guidance Builder](skills/axelor-guidance-builder/SKILL.md)

---

## 2. Runtime Architecture & Ports
- **Session flow**: The Chrome popup sends the active Axelor session to the local Bridge on `127.0.0.1:3210`; the MCP server reads the saved session. The extension does not display guidance or a HUD.
- **Retained guidance state**: The Bridge still accepts and stores routes via `/api/guide/*`, but the shipped extension does not consume them.
- **Active MCP Tools**:
  - `sync_axelor_session`: Checks saved session status with no input (`{}`); returns no cookie and does not validate the session with Axelor.
  - `search_axelor_menu`: Looks up Axelor menu tree and navigation targets.
  - `inspect_axelor_view`: Introspects form fields, tabs, and sub-grids.
  - `query_axelor_data`: Runs entity search and domain filter queries.
  - `save_axelor_record`: Creates or updates ERP records via REST API.
  - `delete_axelor_record`: Deletes an ERP record.
  - `execute_axelor_action`: Runs an Axelor action.
  - `guide_axelor_path`: Calculates and pushes a route to Bridge state; does not display it in the current extension.
  - `clear_axelor_guide`: Clears stored Bridge guidance state; does not hide a browser HUD.

---

## 3. Operational Rules
- Do NOT edit TypeScript or extension source files.
- Follow the [README](../README.md) to synchronize the browser session before using Axelor tools. Never paste a session cookie into chat.
- `save_axelor_record`, `delete_axelor_record`, and `execute_axelor_action` can change ERP data; verify the target and obtain appropriate authorization before using them.
- For optional route authoring, follow Axelor state transitions and ground payloads in the [GuidanceRoute contract](../src/types/guidance.ts) and [guidance skill](skills/axelor-guidance-builder/SKILL.md). Do not promise a visible overlay.

