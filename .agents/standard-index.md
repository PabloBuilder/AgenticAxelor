# Standard Operator & AI Agent Operational Index

Conditional task guidance for Axelor ERP operations. Discover available tools and use their runtime schemas for exact arguments; this index is not a parameter catalog. Inspect missing evidence rather than guessing models, fields, enum values, or actions.

---

## 1. Primary References & Setup
- **Onboarding & Setup Assistant**: [Setup Assistant Skill](skills/setup-assistant/SKILL.md)
- **User Documentation & Safety**: [README](../README.md)
- **Axelor REST API Cheatsheet**: [Axelor REST API Cheatsheet](../docs/axelor-api-cheatsheet.md)
- **Architectural Analysis & Critique**: [Read-Only Consultant Skill](skills/read-only-consultant/SKILL.md)
- **Optional Guidance Authoring**: [Axelor Guidance Builder Skill](skills/axelor-guidance-builder/SKILL.md)

---

## 2. Task-to-Tool Map

| Task | Choose only the needed tools |
| :--- | :--- |
| Known record or search | `fetch_axelor_record` for known model/ID; otherwise filtered `query_axelor_data`, with supported pagination or `export_axelor_data` |
| Missing model/field evidence | `search_axelor_models`, then `inspect_axelor_model` only as needed |
| Enum, Studio field, dependency | `inspect_axelor_selections` for enum values; `inspect_axelor_custom_fields` for dynamic fields; `get_axelor_schema_relations` for dependency questions |
| Menu or form | `search_axelor_menu`, `inspect_axelor_view` when UI/action evidence is needed |
| Authorized mutation | `save_axelor_record`, `batch_axelor_operations`, `delete_axelor_record`, or `execute_axelor_action`, subject to safeguards below |
| Documents or workflow | Attachments: list/upload/download tools; reports: `list_axelor_templates` when template unknown, then `generate_axelor_report`; BPM: `get_axelor_bpm_state` |
| Session or guidance | `sync_axelor_session` when synchronization is needed; `guide_axelor_path` / `clear_axelor_guide` store/clear Bridge routes, not browser overlays |

## 3. Validation & Verification

- A known-model/ID read can fetch directly. Selections, custom fields, relations and views are conditional on missing evidence and task needs, not mandatory introspection stages.
- Before writes, resolve exact targets, read current records and related context, validate fields and status constraints, and retain optimistic-lock versions where supported. Apply specific authorization and sensitive-action confirmation from the router.
- Use `simulate_axelor_onchange` when changed fields require dependent calculations (prices, taxes, addresses, terms or UI attributes). Resolve applicable actions from schema/view evidence; simulation is not a persisted save or permission to execute arbitrary actions.
- Save only the validated payload or execute the supported business action. Read back affected state to verify results; use `get_axelor_audit_log` only when history or traceability is needed, not as a substitute for verification. Report partial batch failures and do not blindly retry non-idempotent mutations.

---

## 4. Token Economy & Operational Safety Rules

**CLI fallback**: If MCP Axelor tools are not active in the session, use `npm run query -- --model <Model> [--domain <Domain>] [--fields <f1,f2>] [--format table|json|csv] [--output <file>]`. Never generate ad-hoc exploration scripts in `src/cli/`.

1. **Large Dataset Export Policy (Threshold >= 15 records)**:
   - **Never dump massive tables or CSV strings directly in chat**.
   - If a query returns $\ge 15$ records, export the dataset to a file (e.g. `Work_data/<name>.csv` or `.json` via `export_axelor_data` or `npm run query -- --output`).
   - In chat, output **strictly**: high-level aggregates / KPIs, top 5 sample rows, and a clickable Markdown file link.
2. **Prefer Disk `outputPath` over `includeBase64`**:
   - Binary files (PDFs, DOCs, attachments) encoded in Base64 consume tens of thousands of LLM context tokens. Always pass `outputPath: "./output.pdf"` when downloading or generating documents.
3. **Dependency- and Status-Aware Deletion**:
   - Inspect actual incoming dependencies and business/status constraints before proposing deletion; delete dependent children first only within the authorized scope. No fixed entity chain or universal `statusSelect` value guarantees safe deletion.
   - Resolve valid transitions from selections/views and supported business actions. Never downgrade status merely to bypass restrictions; obtain authorization for required transitions, then verify each deletion and stop/report blockers.
4. **Session Security**:
   - Authentication comes exclusively from browser extension sync through `SessionStore`. Never paste cookies into chat/code, scan `.env` for credentials, or query Bridge ports to extract a session. Use the extension sync button.
