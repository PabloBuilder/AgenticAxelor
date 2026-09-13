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

Create `.env` in the root (see [`.env.example`](file:///g:/doc/projets/AgenticAxelor/.env.example)):
```env
AXELOR_URL=http://localhost:8080/axelor-erp
AXELOR_USERNAME=admin
AXELOR_PASSWORD=admin
# Optional: Session cookie (auto-captured by extension or set manually)
AXELOR_COOKIE=JSESSIONID=...
PORT=3210
```

### 2. Start MCP & Bridge Server
```bash
npm start
```
*Bridge listens on `http://localhost:3210` and MCP runs via standard I/O (`stdio`).*

### 3. Load Chrome Extension
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the [`extension/`](file:///g:/doc/projets/AgenticAxelor/extension) folder.
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

## Reference Use Cases (CLI Walkthroughs)

### 1. Obscure Menu Discovery
```bash
npx tsx src/cli/pushGuide.ts "Sequences"
```
*HUD expands and highlights exact hierarchical menu path.*

### 2. Sub-Modal Contact Creation (Multi-Fields Copy Table)
```bash
npx tsx src/cli/pushSubWindowGuide.ts
```
*Walks through edit mode switch, contact tab, add modal, copyable values, and double commit.*

### 3. Full Customer Onboarding Flow
```bash
npx tsx src/cli/pushComplexGuide.ts
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

## MCP Tool Registry

| Tool | Purpose |
| :--- | :--- |
| `guide_axelor_path` | Pushes deterministic guidance route to browser HUD |
| `clear_axelor_guide` | Resets and hides Copilot HUD |
| `search_axelor_menu` | Searches menu tree and views |
| `inspect_axelor_view` | Introspects form fields, tabs, and sub-grids |
| `query_axelor_data` | Runs domain filters and entity queries |
| `save_axelor_record` | Creates/updates records via Axelor REST API |

---

## Documentation
- [Architecture & Protocol Specs](file:///g:/doc/projets/AgenticAxelor/.agents/docs/ARCHITECTURE.md)
- [Developer Guide & CLI Suite](file:///g:/doc/projets/AgenticAxelor/.agents/docs/DEV_GUIDE.md)
- [Guidance Authoring Rules (`axelor-guidance-builder`)](file:///g:/doc/projets/AgenticAxelor/.agents/skills/axelor-guidance-builder/SKILL.md)
- [Axelor REST API Cheatsheet](file:///g:/doc/projets/AgenticAxelor/.agents/docs/axelor-api-cheatsheet.md)
