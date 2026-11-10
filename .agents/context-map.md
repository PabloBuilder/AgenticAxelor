# Context Navigation Map

A navigation aid for maintaining context, not an authoritative or guaranteed exhaustive inventory. Based on the routes, indexes, descriptions, and directories inspected; links and roles may have changed. Before modifying a subject, read the candidate files and their actual routes. Inclusion here does not imply automatic invocation or permission to write. Internal resources within branches are not all listed.

## Entry Points and Navigation

| Path | Role and candidate use | Relationships / limits |
|---|---|---|
| `.agents/rules/agents.md` | General rules, security, and primary intent routing. Use for a general rule or new entry point. | Routes to indexes and optionally `.agents/local/user-profile.json` (ignored local user data); avoid duplicating specialized procedures here. |
| `.agents/standard-index.md` | Axelor operations index: tool selection, task routes, validation, and safety. | Points to Axelor knowledge and skills; consult before changing an operational route. |
| `.agents/dev-index.md` | Developer index: architecture, technical owners, and engineering directives. | Points to technical documentation, the Axelor index, and context maintenance. |
| `.agents/google-workspace-index.md` | Google Workspace access, reading, and write safeguards. | For Google operations, not local spreadsheets generally. |
| `.agents/n8n-index.md` | Routing and safeguards for n8n workflows. | Points to `.agents/knowledge/n8n-axi/index.md` and topic-specific references. |
| `.agents/redmine-index.md` | Redmine operations index and cross-domain links. | The primary Redmine read route is the repository skill identified in `.agents/rules/agents.md`; the CLI must also be available. |
| `.agents/Axelor-index.md` | XML search guidance and Axelor Open Suite module matrix. | Developer reference; does not establish the state of a target instance. |
| `.agents/missions-index.md` | Business missions and playbooks index: multi-system end-to-end delivery orchestrations. | Routed under Mode 6 in .agents/rules/agents.md; points to task-specific playbooks in .agents/missions/. |

## Operational Knowledge

These files are candidates for extending existing subjects; verify their actual links in the relevant index.

| Path | Content / use |
|---|---|
| `.agents/knowledge/axelor-sessions.md` | Axelor session targeting; required route for operations using a session. |
| `.agents/knowledge/axelor-data-reconciliation.md` | Data reconciliation, migrations, and post-import verification. |
| `.agents/knowledge/axelor-advanced-import.md` | Advanced graphical import configuration and diagnosis. |
| `.agents/knowledge/axelor-functional-testing.md` | Preparation and analysis of Axelor functional tests. |
| `.agents/knowledge/axelor-permissions-audit.md` | Read-only Axelor permissions audits. |
| `.agents/knowledge/n8n-axi/index.md` | Entry point for n8n CLI knowledge; its references cover dedicated Axelor nodes, workflows, diagnostics, invoices, documents, recovery, and files. |
| `.agents/knowledge/drive-projets-index.md` | Index and routing for Drive project folders. |
| `.agents/knowledge/redmine-mentions.md` | Knowledge concerning Redmine mentions; verify its scope and links before modifying it. |
| `.agents/knowledge/task-memory-contract.md` | Task memory data contract and schema specification for low-token episodic retrospectives. |

## Skills

Paths below are relative to `.agents/skills/` and end in `/SKILL.md`. The map describes their stated roles; consult each file for invocation conditions and actual behavior.

| Skill | Stated role |
|---|---|
| `context-architecture-maintainer` | Review conversation knowledge, place it in context, and audit selected context freshness. Uses this map to identify candidates. |
| `skill-creator` | Create, repair, restructure, and validate skills. |
| `read-only-consultant` | Critical architectural analysis in read-only mode, without edits. |
| `stepwise-planner` | Code-grounded implementation planning in steps. |
| `setup-assistant` | Local installation, MCP configuration, Bridge, and extension setup. |
| `axelor-xml-data-import` | Prepare and validate XML binding files for Axelor CSV imports. |
| `xlsx` | Read, create, or modify local spreadsheet files. |
| `powerpoint` | Create and modify PowerPoint presentations. |
| `compte-rendu-docs` | Write factual procedure or ERP intervention reports. |
| `contexte-ticket` | Present the context, purpose, and user role for a Redmine ticket. |
| `reponse-redmine` | Draft a response suited to a task or ticket's state. |
| `interconnexion-fin-de-tache` | Task follow-up: Google Docs report and Redmine response, with approval before publication. |
| `project-retrospective` | Capture project outcomes, deliverables, and automation opportunities. |
| `handoff` | Prepare a concise session handoff. |

## References and Limits

| Path | Role |
|---|---|
| `.agents/docs/ARCHITECTURE.md` | Technical architecture and component boundaries. |
| `.agents/docs/bridge-protocol.md` | Bridge contract. |
| `.agents/docs/DEV_GUIDE.md` | Developer commands and usage. |
| `.agents/docs/axelor-api-cheatsheet.md` | Axelor API reference. |
| `.agents/docs/n8n-axelor-engineering.md` | n8n / Axelor engineering guide. |
| `.agents/docs/retour-experience-axelor-n8n-factures.md` | Lessons learned for n8n / Axelor invoices; do not generalize historical observations. |
| `.agents/docs/context-freshness.md` | Register of context documents and watched sources; its status alone does not establish freshness. |
| `README.md` | Project overview and setup. |
| `context-graph.html` | Visual snapshot of nodes and relationships; its presence does not guarantee completeness or freshness. |

Handoffs, working deliverables, external data, reference sources, and internal skill details are not exhaustively listed. Their inclusion or absence here does not determine their status. For an absent or ambiguous topic, explore relevant entry points and report limitations rather than assuming no knowledge exists.

## Maintenance

For the review, placement, and verification procedure, see `.agents/skills/context-architecture-maintainer/SKILL.md`.
