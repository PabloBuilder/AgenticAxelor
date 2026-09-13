# AgenticAxelor Architecture Specification

High-density technical architecture map of the AgenticAxelor MCP server, local guidance bridge, and passive Chrome extension HUD.

```mermaid
graph TD
  User((Operator)) -->|Interacts & Copies Values| AxelorUI[Axelor ERP DOM]
  MCP[Agent / LLM] -->|guide_axelor_path| GuidanceSvc[GuidanceService]
  GuidanceSvc -->|Routes & Steps| Bridge[BridgeServer :3210]
  
  subgraph Chrome Extension [Manifest V3 Isolated Context]
    Popup[Settings Popup UI] -->|Config & Commands| BgWorker[Background Service Worker]
    BgWorker <-->|HTTP / CORS Proxy| Bridge
    BgWorker -->|Storage & Cookies| Storage[(chrome.storage.local)]
    ContentScript[Content Script] -->|Polls Bridge| BgWorker
    ContentScript -->|Renders| HUD[Copilot HUD Engine]
    HUD -->|Displays Instructions & Copyable Fields| User
  end
```

---

## 1. System Topology & Data Flow

| Layer | Component | Port / Runtime | Key Responsibility |
| :--- | :--- | :--- | :--- |
| **MCP Server** | [`src/index.ts`](file:///g:/doc/projets/AgenticAxelor/src/index.ts) | Node.js (Stdio) | Exposes Axelor tools (`guide_axelor_path`, `clear_axelor_guide`, `query_axelor_data`, etc.). |
| **Guidance Engine** | [`src/services/guidanceService.ts`](file:///g:/doc/projets/AgenticAxelor/src/services/guidanceService.ts) | TypeScript | Resolves high-level intents into ordered `GuidanceRoute` & `GuidanceStep[]`. |
| **Local Bridge** | [`src/services/bridgeServer.ts`](file:///g:/doc/projets/AgenticAxelor/src/services/bridgeServer.ts) | `http://localhost:3210` | Lightweight HTTP/SSE server managing route progression state & broadcast. |
| **Extension Proxy** | [`extension/background.js`](file:///g:/doc/projets/AgenticAxelor/extension/background.js) | Manifest V3 SW | Proxies HTTPS-to-HTTP mixed content & auto-captures `JSESSIONID` cookies. |
| **HUD & Spotlight** | [`extension/spotlightEngine.js`](file:///g:/doc/projets/AgenticAxelor/extension/spotlightEngine.js) | Content Script | Dual-state UI (Circle Pill $\leftrightarrow$ Glass Card), DOM element discovery, step progression. |
| **Perimeter Detector** | [`extension/content.js`](file:///g:/doc/projets/AgenticAxelor/extension/content.js) | Content Script | 3-tier heuristic ERP context detection & background communication loop. |
| **Control Popup** | [`extension/popup.html`](file:///g:/doc/projets/AgenticAxelor/extension/popup.html) | Extension Action | Live connection status, cookie inspection, route controls (Restart/Clear), custom domains. |

---

---

## 2. Component Reference & Sub-Specs

| Component | Target Spec | Key Directives |
| :--- | :--- | :--- |
| **Bridge Protocol (`:3210`)** | [`.agents/docs/bridge-protocol.md`](file:///g:/doc/projets/AgenticAxelor/.agents/docs/bridge-protocol.md) | SSE stream, HTTP REST sync endpoints (`/api/guide/*`). |
| **Extension & HUD Engine** | [`.agents/docs/extension-hud.md`](file:///g:/doc/projets/AgenticAxelor/.agents/docs/extension-hud.md) | 3-tier detection, Dual-State HUD UI, DOM decoupling. |
| **Axelor REST API** | [`.agents/docs/axelor-api-cheatsheet.md`](file:///g:/doc/projets/AgenticAxelor/.agents/docs/axelor-api-cheatsheet.md) | Direct Axelor CRUD & search query endpoints. |
| **Data Contracts** | [`src/types/guidance.ts`](file:///g:/doc/projets/AgenticAxelor/src/types/guidance.ts) | Ground truth for `GuidanceRoute`, `GuidanceStep`, and `GuidanceFieldInput`. |

---

## 3. High-Level Engineering Directives
- **Zero Java UI Scanning**: Restrict ERP introspection strictly to XML resources (`*-form.xml`, `*-menu.xml`, `*-grid.xml`).
- **DOM Decoupling**: Keep browser Copilot HUD fully isolated from Axelor host React/Angular internals.
- **Strict Typing**: Ground all payloads in typed interfaces defined in [`src/types/`](file:///g:/doc/projets/AgenticAxelor/src/types).

