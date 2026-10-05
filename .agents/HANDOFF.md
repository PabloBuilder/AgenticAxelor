# Session Handoff: Plug & Play Onboarding & Tooling Roadmap

## 1. Goal
- Make AgenticAxelor plug & play for non-tech / functional users (vulgarized docs, ZIP/Release downloads, AI safety disclaimers, and automated guided setup skill).

## 2. Key Decisions & Architecture
- **Onboarding UX**: Shift from strict `git clone` to GitHub Release `.zip` download + interactive AI setup.
- **Safety**: Formalized warning block in README on AI hallucinations, context precision, and write/delete permission risks.
- **Skill Addition**: Created `.agents/skills/setup-assistant/SKILL.md` orchestrating Node/npm checks, build, MCP config guidance, Bridge daemon, and browser extension syncing checkpoints.
- **Windows Priority**: Highlighted `start-bridge.bat` double-click as primary launch method for Windows users.
- **Future Tooling Backlog**: Prioritized `inspect_axelor_model` (via `com.axelor.meta.db.MetaModel` / `MetaField`) as top candidate for next MCP tool extension.

## 3. Important Files
- `README.md`: Overhauled documentation with use cases, safety alerts, release links, and setup options.
- `.agents/skills/setup-assistant/SKILL.md`: Guided setup assistant skill with human checkpoints for browser sync.
- `.agents/standard-index.md`: Standard operator index updated with setup assistant link.
- `src/index.ts`: Main MCP server entrypoint registering all Axelor tools.

## 4. Verified Facts & Completed Work
- [x] `README.md` completely overhauled and validated.
- [x] `.agents/skills/setup-assistant/SKILL.md` created and structured.
- [x] `.agents/standard-index.md` updated with primary skill reference.
- [x] Implemented and validated `inspect_axelor_model` (JPA schema introspection).
- [x] Implemented and validated `search_axelor_models` (Model catalog discovery).
- [x] Implemented and validated `get_axelor_attachments` (DMS attachment listing).
- [x] Implemented and validated `upload_axelor_attachment` (DMS attachment uploading).
- [x] Implemented and validated `download_axelor_attachment` (DMS binary/base64 downloading).
- [x] Implemented and validated `list_axelor_templates` (Report/BIRT/Jasper/Mail templates discovery).
- [x] Implemented and validated `get_axelor_bpm_state` (BPMN workflow instance state introspection).
- [x] Implemented and validated `export_axelor_data` (Bulk data extraction & CSV/JSON serialization).
- [x] Implemented and validated `get_axelor_audit_log` (Audit trail & field modification tracking).
- [x] Implemented and validated `inspect_axelor_selections` (MetaSelect & MetaSelectItem dictionary introspection).
- [x] Implemented and validated `get_axelor_schema_relations` (ERD dependency & relational link exploration).
- [x] Implemented and validated `batch_axelor_operations` (Multi-entity batch create/update/delete execution).
- [x] Implemented and validated `inspect_axelor_custom_fields` (Studio JSON attrs, dynamic fields, and MetaViewCustom introspection).
- [x] Implemented and validated `simulate_axelor_onchange` (Form onChange simulation & server-side dynamic calculation).
- [x] Implemented and validated `generate_axelor_report` (Server-side document & BIRT/Jasper report generation).
- [x] Aligned `.agents/standard-index.md` & `.agents/dev-index.md` with exhaustive 18-tool MCP decision trees and token efficiency rules.

## 5. Status & Next Actions (Tooling Roadmap Backlog)
- **Status**: Production-ready agentic MCP platform (18 tools, 0 build error, full live testing on demo instance).
- **Optional Next Candidates**:
  1. **BPM & Workflow Execution**:
     - `advance_axelor_bpm`: Transition or signal a BPM workflow to next step.
