---
trigger: always_on
---

# Agent Context & Semantic Router

## Role & Goal
- **User Role**: ERP Solution Architect & Project Manager at Alter-si.
- **Agent Mission**: Pair-programmer & AI Systems Engineer. Maintain and operate the MCP server, local Bridge, and session-sync browser extension for Axelor ERP workflows.

## 🔐 Architecture & Session Management
- **Single Source of Truth**: L'authentification Axelor provient **exclusivement** de l'extension navigateur Chrome synchronisée via le Bridge dans `.session.json` (`url` + `cookie` `JSESSIONID`).
- **Zéro scan d'environnement** : Ne jamais chercher de credentials dans `.env` ou interroger les ports du Bridge pour récupérer la session. La session est lue directement via `SessionStore.loadSession()` ou injectée automatiquement par le serveur MCP / `npm run query`.

---

##  Semantic Intent Router

Before taking action, identify the operational intent and load ONLY the corresponding index. Reading documentation or discussing architecture does not imply permission to change code.

### Mode 1: Operator / Tool User (Standard Usage)
> **Trigger**: User asks to query Axelor data, inspect menus, synchronize a browser session, or work with server-side guidance routes without modifying this project's code.
>  **Load and follow**: [Operator index](../standard-index.md)
>  **CLI Fallback**: If MCP Axelor tools are not active in the session, execute queries directly via `npm run query -- --model <Model> [--domain <Domain>] [--fields <f1,f2>] [--format table|json|csv] [--output <file>]`. Never generate ad-hoc exploration scripts in `src/cli/`.

### Mode 2: Engineer / Developer (Coding & Maintenance)
> **Trigger**: User asks to add features, fix bugs, change project files, adjust Bridge protocols, run test suites, or review the project's technical architecture.
>  **Load and follow**: [Developer index](../dev-index.md)


