# Developer & Contributor Guide

Internal repository organization, development workflow, CLI test suite, and agent skills registry.

---

## 1. Architecture Topology

```text
AgenticAxelor/
├── src/                      # MCP Server & HTTP/SSE Bridge (port 3210)
│   ├── guides/               # Pure GuidanceRoute scenario definitions & registry
│   ├── cli/                  # CLI tools & test runners
│   │   ├── guidePusher.ts    # Universal guide injection runner
│   │   ├── inspect/          # Metadata, permissions & schema inspection
│   │   ├── ops/              # Axelor DB mutations & user ops
│   │   └── test/             # Integration & smoke tests (MCP, View, Menu)
│   ├── services/             # BridgeServer, AxelorClient, GuidanceService
│   └── types/                # GuidanceRoute & GuidanceStep contracts
│
├── extension/                # Manifest V3 Chrome Extension
│   ├── spotlightEngine.js    # HUD rendering, state cache, copy handlers
│   ├── spotlight.css         # Glassmorphism design system & animations
│   └── background.js         # Service worker & bridge proxy
│
├── docs/                     # Technical Documentation
│   ├── ARCHITECTURE.md       # Full protocol & component mapping
│   ├── DEV_GUIDE.md          # Developer guide
│   └── axelor-api-cheatsheet.md # REST API & MetaModel reference
│
├── .agents/skills/           # Agent Skills Registry
│   ├── axelor-guidance-builder/ # [PRODUCT] Guidance route authoring
│   ├── read-only-consultant/    # [DEV] Pure architectural review
│   ├── stepwise-planner/        # [DEV] Atomic step planner
│   └── handoff/                 # [DEV] High-density session handoff
│
└── reference-sources/        # Upstream Axelor sources (for R&D and deep inspection)
    ├── axelor-open-suite/    # Functional ERP business modules (Java/Groovy/XML)
    └── axelor-open-platform/ # Core platform framework sources
```

---

## 2. Dev Commands

```bash
# Dependencies
npm install

# TypeScript Build (dist/)
npm run build

# Start Bridge & MCP Server (watch mode)
npm start

# Push pre-packaged or dynamic guide
npm run guide:push -- <guide-id | menu-name>
```

---

## 3. CLI Testing Suite (`src/cli/`)

Inject test scenarios directly into local bridge (`localhost:3210`) or run diagnostics:

| Command | Target | Scope |
| :--- | :--- | :--- |
| `npx tsx src/cli/guidePusher.ts sales-rights` | **Pre-packaged Route** | Injects Level 2 sales permissions & perimeter restriction guide. |
| `npx tsx src/cli/guidePusher.ts accounting-rights` | **Pre-packaged Route** | Injects canonical role > permissions > group accounting guide. |
| `npx tsx src/cli/guidePusher.ts "Sequences"` | **Dynamic Menu Route** | Resolves menu path dynamically from Axelor metadata. |
| `npm run test:menu` / `test:view` | **Smoke Tests** | Runs integration tests from `src/cli/test/`. |

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
