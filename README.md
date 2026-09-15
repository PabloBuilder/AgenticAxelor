# AgenticAxelor

> **Step-by-step Copilot GPS navigation assistant for Axelor Open Suite ERP.**  
> Provides interactive HUD guidance cards, bidirectional navigation sync, and copy-paste form inputs.

---

## Core Architecture

- **MCP Server (`src/`)**: Connects LLMs (Claude Desktop, Cursor, Autonomous Agents) to Axelor for menu/view introspection, data operations, and interactive guidance push.
- **Chrome Extension (`extension/`)**: Non-intrusive bottom-right glassmorphic HUD displaying required actions, contextual advice (**Pro Tip**), and 1-click copyable inputs (**Copy**).
- **Local Bridge (`localhost:3210`)**: Real-time HTTP/SSE bidirectional synchronization between agent runtime and browser HUD.

---

## Quick Start (3 Minutes)

### 1. Configure Environment
```bash
git clone https://github.com/your-repo/AgenticAxelor.git
cd AgenticAxelor
npm install
```

Create `.env` in the root (see [`.env.example`](.env.example)):
```env
AXELOR_URL=http://localhost:8080/axelor-erp
AXELOR_USERNAME=admin
AXELOR_PASSWORD=admin
# Optional: Session cookie (auto-captured by extension or set manually)
AXELOR_COOKIE=JSESSIONID=...
BRIDGE_PORT=3210
```

### 2. Start MCP & Bridge Server
```bash
npm start
```
*Bridge listens on `http://localhost:3210` and MCP runs via standard I/O (`stdio`).*

### 3. Load Chrome Extension
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the [`extension/`](extension/) folder.
3. Open your Axelor tab: the Copilot trigger appears in the bottom right corner.

---

## Universal MCP Integration (Any Agentic IDE / CLI)

AgenticAxelor works with **all MCP-compatible AI environments**: Claude Desktop, Claude Code, Google Antigravity, Cursor, Windsurf, Roo Code / Cline, Zed, and custom LLM agents.

### Standard `mcpServers` JSON Configuration
Add to your environment's MCP config file (e.g. `claude_desktop_config.json`, `.cursor/mcp.json`, `settings.json`):
```json
{
  "mcpServers": {
    "agentic-axelor": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_PROJECT>/dist/index.js"],
      "env": {
        "AXELOR_URL": "http://localhost:8080/axelor-erp",
        "AXELOR_USERNAME": "admin",
        "AXELOR_PASSWORD": "admin",
        "AXELOR_COOKIE": "JSESSIONID=..."
      }
    }
  }
}
```

---

## Copilot HUD Layout

```text
┌─────────────────────────────────────────────────────────┐
│ Axelor Guide                           Step 2/7    [—]  │
├─────────────────────────────────────────────────────────┤
│ Contact Details Form                                    │
│                                                         │
│ REQUIRED ACTION                                         │
│ Fill in contact info in the modal window.               │
│                                                         │
│ FIELDS TO ENTER (3)                                     │
│ Full Name    │ [ John Doe                ] [Copy]       │
│ Work Email   │ [ john.doe@supplier.com   ] [Copy]       │
│ Phone        │ [ +1 555 019 2834         ] [Copy]       │
│                                                         │
│ PRO TIP                                                 │
│ Saving the modal refreshes the parent grid.             │
│                                                         │
│ Suppliers > Supplier Form > Contacts                    │
├─────────────────────────────────────────────────────────┤
│ [ < Previous ]  [ Reset ]                   [ Next > ]  │
└─────────────────────────────────────────────────────────┘
```

- **Bidirectional Controls**: `Previous`, `Reset`, and `Next / Finish` synced via bridge.
- **Copy Triggers**: Unit copy buttons with visual confirmation (`Copied!`).
- **Pill Mode**: Collapses into a minimal circular `X/Y` trigger.
- **Zero DOM Hijacking**: No synthetic clicks or destructive DOM mutations.

---

## MCP Tool Registry (10 Tools)

| Tool | Purpose |
| :--- | :--- |
| `guide_axelor_path` | Pushes deterministic guidance route to browser HUD |
| `clear_axelor_guide` | Resets and hides Copilot HUD |
| `search_axelor_menu` | Searches menu tree and hierarchical breadcrumbs |
| `inspect_axelor_view` | Introspects form fields, tabs, widgets, and sub-grids |
| `query_axelor_data` | Runs domain filters, pagination, and entity queries |
| `fetch_axelor_record` | Fetches a single business entity by ID with fields selection |
| `save_axelor_record` | Creates or updates records via Axelor REST API |
| `delete_axelor_record` | Deletes records with live auto-versioning and relational error parsing |
| `execute_axelor_action` | Triggers Axelor Actions (`action-method`, `action-attrs`, `action-group`) |
| `sync_axelor_session` | Synchronizes runtime session cookie or target URL on the fly |

---

## SDK Features

- **Auto-Versioning**: `AxelorClient.remove` automatically resolves the latest database `$version` before executing `removeAll`.
- **Relational Error Translation**: Converts PostgreSQL/Hibernate foreign key violations into readable messages indicating the exact referencing table.
- **Session Namespacing**: Helper utilities in `src/services/namespacing.ts` (`formatSessionName`, `formatSessionCode`) to isolate test runs (`[S1]`, `[S2]`) and avoid constraint collisions.

---

## Documentation
- [Architecture & Protocol Specs](.agents/docs/ARCHITECTURE.md)
- [Developer Guide & CLI Suite](.agents/docs/DEV_GUIDE.md)
- [Guidance Authoring Rules (`axelor-guidance-builder`)](.agents/skills/axelor-guidance-builder/SKILL.md)
- [Axelor REST API Cheatsheet](.agents/docs/axelor-api-cheatsheet.md)
