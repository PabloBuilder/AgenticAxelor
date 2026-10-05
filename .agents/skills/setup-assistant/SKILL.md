---
name: setup-assistant
description: Guides and automates full local setup of AgenticAxelor (prerequisites, dependencies, build, MCP config, Bridge daemon, and browser extension syncing).
---

# Setup Assistant

Automated, interactive onboarding workflow for setting up AgenticAxelor from scratch.

---

## 🛠️ Step-by-Step Execution Protocol

Execute the following sequential phases. Stop and prompt the user ONLY at required manual checkpoints.

### Phase 1: Environment & Prerequisites Check
1. Verify Node.js and npm:
   - Run `rtk node -v` and `rtk npm -v`.
   - Verify Node.js is installed (v20+ or v22+ recommended).
   - If missing, inform the user to install Node.js from https://nodejs.org.

### Phase 2: Dependency Installation & Project Build
1. Install project dependencies:
   - Run `rtk npm install`.
2. Compile TypeScript project:
   - Run `rtk npm run build`.
   - Ensure `dist/` is generated without build errors.

### Phase 3: MCP Configuration Setup
1. Detect current workspace absolute path.
2. Read [mcp-config.example.json](../../../mcp-config.example.json).
3. Generate or present the ready-to-use configuration snippet with absolute paths formatted properly (e.g. `C:/...` on Windows).
4. Inform the user how to paste it into their MCP client settings if not already auto-configured.

### Phase 4: Launch Bridge Daemon
1. Launch the local Bridge server in the background:
   - Run `rtk npm run bridge` (or run background daemon).
   - Verify that port `3210` is responding (`http://127.0.0.1:3210/api/health` or status check).

### Phase 5: Chrome Extension Loading (Human Checkpoint)
Prompt the user with clear instructions:
1. Open Chrome/Chromium and navigate to `chrome://extensions`.
2. Toggle on **Mode développeur** (Developer Mode) in the top-right corner.
3. Click **Charger l'extension non empaquetée** (Load unpacked).
4. Select the `extension/` folder inside this project directory.

### Phase 6: Session Synchronization & Verification
Prompt the user to synchronize:
1. Log in to your target Axelor ERP instance in a browser tab.
2. Click the **AgenticAxelor** extension icon in the browser toolbar.
3. Click **Synchroniser la session** (authorize cookie access if prompted).
4. Agent verification:
   - Check if `.session.json` exists in the project root.
   - Run MCP tool `sync_axelor_session` to confirm valid session connection.
   - Announce full setup completion to the user!
