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

## 2. Workspace Layout

| Path | Component / Target | Key Entry Points |
| :--- | :--- | :--- |
| `src/` | MCP server over stdio; separate local Bridge on `127.0.0.1:3210` | [MCP entry](../src/index.ts), [Bridge entry](../src/bridge.ts), [Bridge server](../src/services/bridgeServer.ts), [session store](../src/services/sessionStore.ts) |
| `src/guides/` | Retained server-side route definitions and contracts; no browser consumer | [Guide registry](../src/guides/index.ts), [guidance types](../src/types/guidance.ts) |
| `src/cli/` | CLI runners, diagnostics, and tests | [Guide pusher](../src/cli/guidePusher.ts), [inspection](../src/cli/inspect/), [operations](../src/cli/ops/), [tests](../src/cli/test/) |
| `extension/` | Manifest V3 browser session sync; no HUD content script | [Manifest](../extension/manifest.json), [popup](../extension/popup.js), [background worker](../extension/background.js) |
| `.agents/skills/` | Agent skills registry | [Skills](skills/) |
| `reference-sources/` | Upstream Axelor Open Suite reference code | Query XML resources using globs from [Axelor index](Axelor-index.md) |

---

## 3. Engineering Directives
- **Zero Java UI Scanning**: Restrict UI, field, and view discovery to XML files (`*-form.xml`, `*-menu.xml`, `*-grid.xml`).
- **Strict Typing**: Ground all changes in typed interfaces ([types](../src/types/)).
- **Session sync**: Keep the cookie out of chat and ensure the Bridge and MCP share the same checkout; the extension does not render guides.
- **Session Namespacing**: Use `formatSessionName` (`[S1]`, `[T2]`) or `formatSessionCode` from `src/services/namespacing.ts` for demo/test entities.
- **ERP Deletion Order (LIFO)**: `StockLocationLineHistory` ➔ `StockLocationLine` ➔ `InvoiceLine` ➔ `Invoice` ➔ `StockMoveLine` ➔ `StockMove` ➔ `OrderLine` ➔ `Order` ➔ `Parent Entity`. Validate FSM downgrade (`statusSelect: 1` or `4`) before parent deletion.


