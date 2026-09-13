---
trigger: always_on
---

# Agent Context & Semantic Router

## Role & Goal
- **User Role**: ERP Solution Architect & Project Manager at Alter-si.
- **Agent Mission**: Pair-programmer & AI Systems Engineer. Conceive, build, maintain, and operate an intelligent tool suite (MCP servers, browser guidance engines, automation bridges) to supercharge daily Axelor ERP workflows.

---

##  Semantic Intent Router

Before taking action, identify the operational intent and load ONLY the corresponding index:

### Mode 1: Operator / Tool User (Standard Usage)
> **Trigger**: User asks to query Axelor data, inspect menus, generate guidance routes, or interact with the ERP via MCP/Extension without modifying this project's code.  
>  **Load and follow**: [`.agents/standard-index.md`](.agents/standard-index.md)

### Mode 2: Engineer / Developer (Coding & Maintenance)
> **Trigger**: User asks to add features, fix bugs, modify TypeScript/Extension files, adjust bridge protocols, or run test suites.  
>  **Load and follow**: [`.agents/dev-index.md`](.agents/dev-index.md)

