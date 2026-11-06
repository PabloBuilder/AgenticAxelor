# n8n Operational Index

Use the installed external n8n CLI for workflows and execution diagnosis. It is not an MCP server and does not use the Axelor Bridge. For n8n operations, read and follow [n8n-axi knowledge](knowledge/n8n-axi/index.md) for CLI commands and task-specific references; the safeguards in this index remain applicable.

Use the [lessons learned](docs/retour-experience-axelor-n8n-factures.md) selectively before designing changes or repeating tests. It distinguishes live evidence, local simulations and unresolved limits; historical evidence does not prove the current state or grant permission. Environment-specific IDs remain in `Work_data/`.

| Task or risk | Read in the lessons learned |
|---|---|
| Publication, webhook testing or execution diagnosis | [Publication and diagnostics](knowledge/n8n-axi/references/publication-diagnostics.md); lessons §§13–15. |
| Axelor integration, invoice creation or accounting | [Axelor invoices](knowledge/n8n-axi/references/axelor-invoices.md); lessons §§3–7. For generic API contracts also use the cheatsheet below. |
| OCR, PDF extraction or AI-produced invoice data | [Documents and OCR](knowledge/n8n-axi/references/documents-ocr.md); lessons §§8–12. |
| Duplicate prevention, concurrency or partial failure | [Recovery and idempotence](knowledge/n8n-axi/references/recovery-idempotence.md); lessons §§16–17. Apply safeguards proportionately to actual side effects. |
| Binary attachment or Drive handling | [Files and Drive](knowledge/n8n-axi/references/files-drive.md); lessons §§18–19. |
| Resuming the supplier-invoice V3 | Current project handoff `.agents/HANDOFF-factures-V3.md` §0, then lessons §§1–2 and 20–22 and relevant topics above; recheck live evidence. The separate inactive batch is a bounded test, not a new supplier-specific V3. |

For technical API contracts, also consult the [Axelor REST API Cheatsheet](docs/axelor-api-cheatsheet.md). Read only applicable topics; do not impose invoice-specific bindings or the V3 mutex on unrelated workflows.

## 1. Local Availability & Authentication

- Verified workstation executable: `%LOCALAPPDATA%/Alter-si/connectors/n8n-axi/0.1.0/n8n-axi-0.1.0-win-x64/n8n-axi.exe`. In PowerShell invoke it with `& "$env:LOCALAPPDATA\Alter-si\connectors\n8n-axi\0.1.0\n8n-axi-0.1.0-win-x64\n8n-axi.exe"` followed by command arguments.
- This versioned path is a workstation setting, not a repository prerequisite or proof of current access/write permissions.
- The process inherits `N8N_BASE_URL` and `N8N_API_KEY`; accepted user-level Windows storage is local and non-encrypted. Use inherited authentication without reading, printing, or dumping variable values, registry entries, credential files, or `.env`.
- Verify the executable exists and use the requested read to check access. If credentials are missing/expired, user enters them directly through the agreed masked terminal procedure, not chat. Do not run the no-argument installer/setup or change Goose, PATH, or persistent storage implicitly.
- Removing local configuration does not revoke the server-side key. User revokes keys through n8n API-key management; instance-specific controls must be verified before claiming revocation.

## 2. Read & Diagnose

- Verified help families include `workflow list`, `workflow search`, `workflow view <id>`, `execution list`, `execution view <id>`, and `execution last <workflow>`. Consult command-specific `--help` for exact flags; do not invent syntax. Help may require configured credentials.
- Resolve exact workflow/execution IDs. Read current workflow state and relevant failing nodes before diagnosing or editing; listing metadata alone is not full workflow inspection.
- Filter and paginate where supported. Prefer supported output to local `Work_data/` files for large payloads; do not dump raw executions, credentials, or sensitive node data into chat.
- For required mixed work only, use [Axelor](standard-index.md), [Redmine](redmine-index.md), or [Google](google-workspace-index.md) indexes under the router's conditional-loading and untrusted-content rules.

## 3. Validate & Mutate

- Use command-specific help for scaffold/build, push/patch, validate, activate/deactivate, tag, archive/delete, or execution deletion/pruning; advertised commands do not establish permission or operation success.
- Consult help before mutations and preserve the existing workflow representation needed for recovery without exposing secrets. Read-before-edit; distinguish offline spec construction/validation from remote creation, replacement, and validation against live state.
- Help states `workflow build ... --push` creates a new workflow, whereas `workflow push <id>` replaces an existing workflow. Never confuse these operations.
- Validate the proposed changes using documented non-mutating validation before activation; validation is not permission to activate or execute a workflow.
- Confirm activation, execution triggers, deletion, bulk changes, and potentially externally communicating operations. Do not mutate or trigger workflows as arbitrary setup tests.
- Standing approval in `rules/agents.md` covers local preparation and creation of separate manual inactive Axelor demo test workflows; do not ask again for that preparation scope. Preserve existing workflows and execution-data protections. Execution, activation, existing-workflow changes and ERP writes remain separately approval-gated.
- Read back changed state and report partial failures. Do not blindly repeat non-idempotent writes or claim a successful execution from activation alone.

## 4. Architecture & Design Rules (Zero-Bloat Doctrine)

**Work proportionately:** Start with the existing workflow, tools, scripts and tests. For a defect, identify the specific cause, make the smallest suitable common change, and run relevant existing tests and checks for the affected behavior and risk. Do not run a full battery after every small correction or create a script, file, prototype, workflow or infrastructure without a clear need. Reuse existing choices and components when applicable. Keep strict validation before publication, test changed behavior and verify actual effects; never skip safety checks or permissions for speed.

When designing, refactoring, or diagnosing n8n workflows, use the following safeguards where applicable; consult the [n8n ↔ Axelor & AI Engineering Guide](docs/n8n-axelor-engineering.md) and [Axelor REST API Cheatsheet](docs/axelor-api-cheatsheet.md) for integrations in their scope:

1. **Single Idempotent Pipeline (No Duplicated Recovery Corridors)**: Query existing ERP state (`IF Record Exists`, `IF Attachment Exists`) and reuse fully verified drafts instead of building parallel "Creation" and "Recovery" branches. A pre-search alone is not an atomic lock; protect consequential concurrent creations appropriately.
2. **Strict `I/O → Code → I/O` Alternation**: Never chain `Code → Code` on the main port. Merge consecutive validation/preparation logic into a single `Code` node between I/O boundaries.
3. **Minimal `Data Table` Footprint**: At most 1 Data Table state read at workflow start and 2 writes at workflow exit (`DONE`/`ERROR` status + event log). Never build per-node Two-Phase Commit state machines. This limit does not replace a separate atomic reservation and durable journal when concurrency or safe recovery requires them; preserve the existing V3 mutex invariants.
4. **Centralized 4-Node Error Branch**: Route all `main:1` error outputs directly to one central error collector (`Diagnostic & Preparation Erreur` → `Fallback Action` → `Statut ERROR` → `Journal Erreur`). Prefix thrown errors with `[STAGE:<Node Name>]` instead of adding per-node capture/diagnostic wrappers.
5. **Reproducible Build & Focused Offline Tests**: Reuse an existing generator or spec; use declarative generation when the workflow's complexity warrants it, not as a reason to create files for every change. Before publication, validate with `n8n-axi.exe workflow validate --strict` (`0 warnings`) and test changed Code and expressions with representative inputs; expand tests to other affected paths and risks. Keep environment-specific IDs in `Work_data/*-bindings.json`, never in `.agents/`.