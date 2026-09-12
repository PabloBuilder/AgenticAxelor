# AgenticAxelor

High-density Model Context Protocol (MCP) server and companion passive GPS navigation extension for Axelor Open Suite ERP.

For complete technical architecture, data flows, and bridge schemas, see [ARCHITECTURE.md](file:///g:/doc/projets/AgenticAxelor/ARCHITECTURE.md).

---

## ⚡ Core Capabilities

### 1. Local MCP Server (`src/`)
- **Passive Path Guidance**: `guide_axelor_path` and `clear_axelor_guide` (resolves canonical menu hierarchies and view targets into guided roadmaps).
- **ERP Metadata Introspection**: `search_axelor_menu`, `inspect_axelor_view`.
- **Data Engine Tools**: `query_axelor_data`, `fetch_axelor_record`, `save_axelor_record`, `delete_axelor_record`, `execute_axelor_action`.
- **Local Bridge Server (`localhost:3210`)**: Embedded HTTP/SSE synchronization bridge powering real-time browser guidance.

### 2. Passive GPS Chrome Extension (`extension/`)
- **Passive Operator Principle**: Zero automated typing and zero synthetic clicks. Highlights target elements with a glowing halo; advances only when the user clicks the real DOM element.
- **Glassmorphic Dual-State HUD**: Minimalist circular pill indicator (`X/Y`) that unfolds into a comprehensive step guidance card with Rollback (`↺ Recommencer`), Skip (`Passer l'étape ➜`), and Minimize (`✖`) actions.
- **Context Awareness**: 3-tier heuristic ERP detector (URL, DOM signatures, user custom domains) preventing HUD rendering on non-Axelor pages.
- **Action Popup**: Real-time status indicators (MCP Bridge connection, Axelor session cookie detection, active route overview) and custom domain manager.

---

## 🛠️ Quick Start

### Build & Run MCP Server
```bash
npm install
npm run build
npm start
```

### CLI Guidance Runners
```bash
# Push single-target guidance route (e.g. Sequences menu)
npx tsx src/cli/pushGuide.ts "Sequences"

# Push complex multi-step customer creation roadmap
npx tsx src/cli/pushComplexGuide.ts
```

### Install Chrome Extension
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the [`extension/`](file:///g:/doc/projets/AgenticAxelor/extension) directory.
3. Configure custom ERP instances in the extension popup if using custom hostnames.
