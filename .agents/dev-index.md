# Developer & Engineer Context Index

Routing map for maintaining the MCP server, separate Bridge, and session-sync extension.

---

## 1. Technical Documentation & Specs
- **Setup and supported workflow**: [README](../README.md) (Bridge startup, browser session sync, MCP configuration).
- **Architecture and Bridge contract**: Read [Architecture](docs/ARCHITECTURE.md) or [Bridge protocol](docs/bridge-protocol.md) only when the touched behavior depends on them (separate processes, session persistence, retained guide endpoints).
- **Developer commands and CLI**: [Developer guide](docs/DEV_GUIDE.md).
- **Axelor Open Suite XML matrix**: [Axelor index](Axelor-index.md).
- **Context refresh**: When architecture or agent docs may have drifted, use the [on-demand refresh skill](skills/context-architecture-maintainer/SKILL.md) with its [dependency register](docs/context-freshness.md); do not run it on every task.

The [HUD specification](docs/extension-hud.md) is historical only; the shipped extension does not display guide routes. The session handoff is not an evergreen architecture reference.

---

## 2. Workspace Layout & Service Architecture

Start at the requested behavior and its owning implementation/test; consult only relevant references. For actual ERP operations, conditionally follow the [Operator index](standard-index.md), including its export, validation, verification and deletion policy; code work alone does not require it.

- **Tool contracts**: [MCP entry](../src/index.ts) defines registrations. Use exposed runtime schemas for operational arguments, not a fixed tool count or copied parameter table.
- **Data/schema**: `src/services/dataService.ts` owns query/fetch/save/delete/batch/onchange/export; `schemaService.ts` owns model/field/selection/custom-field/relation discovery.
- **Other services**: `menuService.ts` and `viewService.ts` for UI evidence; `reportService.ts`, `dmsService.ts`, `bpmService.ts`, `auditService.ts` for reports, attachments, BPM and history respectively. Read only the relevant owner.
- **Authentication/Bridge**: `src/services/axelorClient.ts`, [Bridge server](../src/services/bridgeServer.ts), [Session store](../src/services/sessionStore.ts) and `src/bridge.ts` own HTTP/session synchronization and the separate local daemon.
- **Extension**: [Manifest](../extension/manifest.json), [Popup](../extension/popup.js); session sync only, no rendered guidance HUD.

---

## 3. Engineering Directives
- **Strict Typing**: Ground all changes in typed interfaces ([types](../src/types/axelor.ts)).
- **Token Efficiency**: Always prefer local disk `outputPath` over binary base64 returns in MCP tool calls.
- **Session Security**: Keep the cookie out of chat and `.env`. Local MCP/browser mode relies strictly on extension sync via `SessionStore`.
- **Authentication Boundary**: Never scan credentials or query Bridge ports to extract sessions; preserve the browser-synchronized session path. The isolated n8n read-only pilot exception approved on 2026-10-08 is defined in [agent rules](rules/agents.md); it does not authorize workflow changes or execution by itself.
- **n8n Pilot**: A separately approved HTTP test workflow can run from n8n without SSH. Verify protected n8n credential compatibility and session-cookie handling before authenticated execution; do not read secrets, transfer workstation cookies, or store passwords in repository TXT files. Deployment of the future server-side connector requires separate access and authorization.
- **Focused Validation**: Validate the touched behavior with its narrow test/typecheck when applicable; distinguish local checks from live ERP acceptance. Operational writes still require authorization and readback, not just successful compilation.


