# Developer & Contributor Guide

Internal repository organization, development workflow, CLI test suite, and agent skills registry.

---

## 1. Architecture Topology

```text
AgenticAxelor/
├── src/                      # MCP Server & HTTP/SSE Bridge (port 3210)
│   ├── cli/                  # CLI test scripts & scenario injectors
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
```

---

## 3. CLI Testing Suite (`src/cli/`)

Inject test scenarios directly into local bridge (`localhost:3210`):

| Command | Target | Scope |
| :--- | :--- | :--- |
| `npx tsx src/cli/pushGuide.ts "Sequences"` | **Menu Navigation** | Validates deep menu tree traversal. |
| `npx tsx src/cli/pushSubWindowGuide.ts` | **Sub-Modal & Copy Table** | Tests sub-tabs, modal popups, and multi-field inputs (`fields: [...]`) with unit copy buttons. |
| `npx tsx src/cli/pushComplexGuide.ts` | **Full Flow** | Multi-screen customer creation and validation sequence. |

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
