# Developer & Contributor Guide

Repository organization, development workflow, CLI tools, and agent skills registry. For the user setup flow, see the [README](../../README.md).

---

## 1. Architecture Topology

```text
AgenticAxelor/
├── src/index.ts              # MCP server (stdio), launched by an MCP client
├── src/bridge.ts             # Separate HTTP Bridge on 127.0.0.1:3210
├── src/services/             # Axelor client, Bridge, session store, guidance
├── src/guides/               # GuidanceRoute definitions and registry
├── src/cli/                  # Guide pusher, inspection, operations, tests
├── src/types/                # Axelor and guidance contracts
├── extension/                # Session-sync extension; no HUD content script
│   ├── manifest.json         # Manifest V3 permissions and popup
│   ├── popup.html / popup.js  # Active-tab session sync UI
│   └── background.js         # Reads JSESSIONID and posts to Bridge
├── .agents/docs/             # Architecture, Bridge protocol, API reference
├── .agents/skills/           # Agent skills, including route authoring
└── reference-sources/
   └── axelor-open-suite/    # Upstream ERP modules; no platform checkout here
```

---

## 2. Dev Commands

```bash
# Dependencies (from the repository root)
npm ci

# TypeScript Build (dist/)
npm run build

# Start the separate Bridge and leave it running (terminal 1)
npm run bridge

# MCP is launched by the configured MCP client over stdio.
# For manual use after the build, npm start runs only dist/index.js (terminal 2).
npm start

# Or run only the MCP TypeScript entry point during development
npm run dev

# Optional: push a route to Bridge state; the extension does not display it
npm run guide:push -- <guide-id | menu-name>
```

Both processes must use the same checkout to share `.session.json`. The extension uses port `3210`; leave that port unchanged for the browser session flow. See the [current architecture](ARCHITECTURE.md) and [Bridge protocol](bridge-protocol.md).

---

## 3. CLI Testing Suite (`src/cli/`)

Guide CLI commands push routes to the local Bridge (`127.0.0.1:3210`) for a future consumer; they do not inject a visible HUD. Dynamic guides and the listed smoke tests can contact Axelor, so review their behavior before running them.

| Command | Target | Scope |
| :--- | :--- | :--- |
| `npx tsx src/cli/guidePusher.ts sales-rights` | **Pre-packaged Route** | Stores a sales permissions route in Bridge state. |
| `npx tsx src/cli/guidePusher.ts accounting-rights` | **Pre-packaged Route** | Stores an accounting permissions route in Bridge state. |
| `npx tsx src/cli/guidePusher.ts "Sequences"` | **Dynamic Menu Route** | Resolves menu path dynamically from Axelor metadata. |
| `npm run test:menu` / `npm run test:view` | **Smoke Tests** | Runs Axelor integration tests from `src/cli/test/`. |

---

## 4. Agent Skills Registry (`.agents/skills/`)

1. **`axelor-guidance-builder`** (Product Skill):
   - Generates deterministic `GuidanceRoute` scenarios.
   - Enforces Axelor FSM state transitions (Edit mode switch, sub-modal CRUD, parent commit, grouped inputs).

2. **`read-only-consultant`** (`/read-only-consultant`):
   - Architecture review, critical friction analysis, zero code modification.

3. **`stepwise-planner`** (`/stepwise-planner`):
   - 1-7 atomic step implementation plan generator (`plan.md`).

4. **`handoff`** (`/handoff`):
   - High-density session status compiler (`HANDOFF.md`).
