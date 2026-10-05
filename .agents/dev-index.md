# Developer & Engineer Context Index

Routing map for maintaining the MCP server, separate Bridge, and session-sync extension.

---

## 1. Technical Documentation & Specs
- **Setup and supported workflow**: [README](../README.md) (Bridge startup, browser session sync, MCP configuration).
- **Architecture and Bridge contract**: [Architecture](docs/ARCHITECTURE.md), [Bridge protocol](docs/bridge-protocol.md) (separate processes, session persistence, retained guide endpoints).
- **Developer commands and CLI**: [Developer guide](docs/DEV_GUIDE.md).
- **Axelor Open Suite XML matrix**: [Axelor index](Axelor-index.md).
- **Context refresh**: When architecture or agent docs may have drifted, use the [on-demand refresh skill](skills/context-architecture-maintainer/SKILL.md) with its [dependency register](docs/context-freshness.md); do not run it on every task.

The [HUD specification](docs/extension-hud.md) is historical only; the shipped extension does not display guide routes. The session handoff is not an evergreen architecture reference.

---

## 2. Workspace Layout & Service Architecture

| Path / Service | Component / Purpose | Key Entry Points |
| :--- | :--- | :--- |
| `src/index.ts` | Main MCP server registering 18 tools over stdio | [MCP Entry](../src/index.ts) |
| `src/services/schemaService.ts` | JPA model discovery, schema introspection, selections (`MetaSelect`), custom fields (`attrs`), ERD relations | `inspectModel`, `searchModels`, `inspectSelections`, `getSchemaRelations`, `inspectCustomFields` |
| `src/services/dataService.ts` | Business record querying, single fetch, save, LIFO delete, batch operations, onchange simulation, bulk export | `queryData`, `fetchRecord`, `saveRecord`, `deleteRecord`, `batchOperations`, `simulateOnChange`, `exportData` |
| `src/services/reportService.ts` | Report & template listing, server-side BIRT/Jasper report generation and downloading | `listTemplates`, `generateReport` |
| `src/services/dmsService.ts` | Attachment listing (`MetaAttachment`), upload, and binary downloading (`MetaFile`) | `getAttachments`, `uploadAttachment`, `downloadAttachment` |
| `src/services/bpmService.ts` | BPMN workflow instance introspection (`WkfInstance`), stages, and task assignments | `getBpmState` |
| `src/services/auditService.ts` | Historical field changes and audit trail querying (`GlobalTrackingLog`) | `getAuditLog` |
| `src/services/menuService.ts` | Menu hierarchy traversal and keyword searching (`MetaMenu`) | `searchMenu` |
| `src/services/viewService.ts` | XML view structure introspection (`MetaView`) | `inspectView` |
| `src/services/axelorClient.ts` | HTTP client with automatic session synchronization, CSRF, and login handling | `AxelorClient` |
| `src/bridge.ts` | Local Bridge daemon on `127.0.0.1:3210` receiving session sync from Chrome extension | [Bridge Server](../src/services/bridgeServer.ts), [Session Store](../src/services/sessionStore.ts) |
| `extension/` | Manifest V3 browser extension for 1-click Axelor session synchronization | [Manifest](../extension/manifest.json), [Popup](../extension/popup.js) |
| `.agents/skills/` | Specialized agent workflows | [Skills Registry](skills/) |

---

## 3. Engineering Directives
- **Strict Typing**: Ground all changes in typed interfaces ([types](../src/types/axelor.ts)).
- **Token Efficiency**: Always prefer local disk `outputPath` over binary base64 returns in MCP tool calls.
- **Session Security**: Keep the cookie out of chat and `.env`. Rely strictly on extension sync via `SessionStore`.
- **ERP Deletion Order (LIFO)**: `StockLocationLineHistory` ➔ `StockLocationLine` ➔ `InvoiceLine` ➔ `Invoice` ➔ `StockMoveLine` ➔ `StockMove` ➔ `OrderLine` ➔ `Order` ➔ `Parent Entity`. Validate FSM downgrade (`statusSelect: 1` or `4`) before parent deletion.


