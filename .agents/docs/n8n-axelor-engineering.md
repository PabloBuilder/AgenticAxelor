# n8n ↔ Axelor & AI Engineering Guide

Reference patterns for building compact n8n workflows integrated with Axelor ERP, Google Drive, and LLMs. Adapt safeguards to the actual risks and verify the target installation. The [lessons learned](retour-experience-axelor-n8n-factures.md) distinguish real observations, local tests and unresolved limitations; they do not grant execution or write permission.

---

## 1. Zero-Bloat Workflow Architecture

Choose a shape and size appropriate to the task; there is no target node count. The following patterns are useful where their assumptions apply, not a requirement to add invoice, state or error-handling nodes to a simple workflow.

1. **Single Idempotent Pipeline (Zero Duplicated Recovery Corridors)**:
   - Never build a separate "Creation" branch and "Recovery" branch.
   - Query ERP state before mutating (`Recherche Facture Existante Axelor` → `IF Facture Deja Creee`, `Recherche Piece Jointe PDF` → `IF PDF Deja Attache`).
   - Reuse a draft only after a complete, strict comparison of the relevant header, supplier, company, dates, currency, lines, accounts, units, discounts and taxes; matching totals alone are insufficient. Read related lines and taxes separately when relations are abbreviated.
   - A pre-creation search is not an atomic lock: concurrent executions can both see no record. Where duplicate creation is consequential, design an appropriate atomic reservation or lock and recovery protocol. The V3 DEMO mutex protects only participating workflows, not humans or other programs; do not present it as a universal solution.
2. **Strict `I/O → Code → I/O` Alternation**:
   - Never chain `Code → Code` on the main port. One `Code` node between two I/O nodes validates the previous response and builds the next request payload.
3. **Minimal State Persistence (`Data Table`)**:
   - Read the state registry once at workflow entry (`Lecture Registre Traitements`).
   - Prefer final status and event writes at workflow exit and avoid per-node Two-Phase Commit state machines. This Data Table guideline does not replace a separate durable reservation/journal when concurrency or safe recovery requires one; preserve the V3 mutex's acquisition, reconciliation and release invariants when working on that pipeline.
4. **Centralized 4-Node Error Branch**:
   - Route `onError: 'continueErrorOutput'` (`main:1`) of all I/O and validation nodes directly to a single collector:
     `Diagnostic & Preparation Erreur` → `Deplacement PDF Erreur Drive` → `Enregistrement Statut ERROR` → `Enregistrement Journal Erreur`.
   - Prefix thrown errors in every `Code` node with `[STAGE:<Node Name>] <ERROR_CODE>` so the central collector attributes the exact failing stage without wrapper nodes.
5. **Readable Visual Layout**:
   - Group stages by responsibility when useful; a three-lane layout is an optional aid for complex document-to-ERP pipelines, not a mandatory layout or fixed coordinate scheme.

---

## 2. n8n Runtime Pitfalls & Proven Solutions

### A. Binary Data Preservation & SHA-256
- Intermediate nodes may not preserve `item.binary`. Depending on storage mode, `binary.data` may be a filesystem reference, not base64 bytes; do not hash that reference as if it were PDF content. Use `this.helpers.getBinaryDataBuffer` where needed and verify the effective input item.
- Preserve or restore the original binary immediately before upload. Hash the original bytes, then download the actually linked MetaFile, check HTTP success and compare its bytes' SHA-256 before declaring success. A local hash or attachment relation alone is not proof of remote content.
- On the examined Axelor installation, `Accept: application/pdf` returned 406 and `Accept: */*` worked; verify the target contract. See [lessons learned, §18](retour-experience-axelor-n8n-factures.md#18-pièces-jointes--une-relation-nest-pas-une-preuve-de-contenu).

### B. Webhook Node Contract (`n8n-axi workflow validate`)
- Every `n8n-nodes-base.webhook` node pushed via API must define a stable `webhookId` parameter alongside `path`, `httpMethod`, and `responseMode: 'responseNode'`. Omitting `webhookId` triggers `MISSING_WEBHOOK_ID` validation warnings and can prevent production webhook registration.

### C. Axelor Node Discipline & HTTP Fallback
- **Dedicated Axelor Node (`n8n-nodes-axelor-connect.axelor`)**: Use for flat record operations and DMS. Trap errors by enabling `Settings > On Error > Continue (Using Error Output)` (`main:1`) to cleanly route Axelor business errors (`status: -1`) to the central 4-node collector.
- **HTTP Request Fallback (`neverError: true`)**: When handling composite `OneToMany` trees (invoices, orders) or calling arbitrary LLM endpoints via `n8n-nodes-base.httpRequest`, configure `options: { response: { response: { fullResponse: true, neverError: true, responseFormat: 'text' } } }` so downstream `Code` nodes can deterministically inspect `statusCode` and parse payloads without silent aborts.

---

## 3. Reliable AI / LLM Extraction Pattern (3-Step Sandwich)

1. **Pre-LLM Readability Guard (`Code`)**:
   - Check page coverage, ordering and readable text before extraction. Empty or scanned pages may require OCR or review; a nonempty combined text is not proof that all pages were read. Thresholds and invoice tokens are task-specific, not universal proof of readability.
2. **Strict JSON Contract (`HTTP Request` to LLM)**:
   - Use `temperature: 0`, explicit system prompt with closed enums (`INVOICE | CREDIT_NOTE`, `STANDARD | EXEMPT | REVERSE_CHARGE`), and require raw JSON output without Markdown fences.
3. **Deterministic Post-LLM Accounting Gate (`Code`)**:
   - Never trust LLM arithmetic, identity, citations or ERP IDs blindly. Validate extracted values independently against the source, including supplier/customer roles, line completeness, dates and tax evidence; preserve unknown values rather than inventing them.
   - Recalculate amounts using explicit, task-approved precision and rounding rules; a fixed tolerance alone does not establish accounting correctness.
   - Separate printed source facts from accounting projections. Map accounting codes, tax line IDs, units, and currencies from verified environment-specific bindings, never from LLM hallucinations. A justified review is not an automatic success.

---

## 4. Reproducible Build, Validation & Offline Test Pipeline

Start from the existing workflow, generator, spec and tests. Choose a scaffold, existing spec, targeted patch or declarative generator according to the change and its complexity; avoid hand-editing complex n8n JSON. Do not create scripts, test files, prototypes or infrastructure without a clear need. For a small correction, run focused existing tests for changed behavior and affected risks rather than the entire battery; broaden checks when the impact warrants it.

1. **Reproducible preparation**:
   - Keep environment/pilot IDs in `Work_data/` bindings (never hardcode test IDs in `.agents/`).
   - Reuse existing build artifacts where appropriate; generate a spec or expanded JSON only when useful for the change and validation.
2. **Static CLI Validation (`n8n-axi.exe workflow validate`)**:
   - Run `n8n-axi.exe workflow validate --file <expanded.json> --strict --json` and enforce `ok === true` and `warnings.length === 0`.
3. **Focused offline tests**:
   - Reuse existing tests. Execute changed Code nodes with representative inputs and compile changed expressions with an n8n-compatible compiler, not just generic `Function` or static CLI validation. A local compiler does not prove the installed server version or end-to-end execution.
   - Test affected creation, reuse, concurrency, binary verification and error paths when relevant to the change and its risk. Add durable tests or files only when justified; a local simulation is not live ERP acceptance.
4. **Controlled publication**:
   - Read the current remote workflow and version, preserve rollback, compare critical logic and run strict validation and the appropriate dry-run. `workflow build --push` creates a workflow; `workflow push <id>` replaces an existing one. Check command-specific help and the dry-run envelope.
   - Publication, activation and execution require separate authorization. Before an authorized replacement recheck the version; afterwards read back nodes, parameters, connections, settings, credential identity/type and active state, not merely node count.
   - For a controlled webhook test use the global workflow execution listener, send once and inspect state before retrying an ambiguous result. A green n8n execution may end in a business error: verify the terminal business result and external effects independently. Do not enable sensitive execution retention for convenience.

See [lessons learned, §§13–17](retour-experience-axelor-n8n-factures.md#13-n8n--le-vert-technique-nest-pas-le-succès-métier) for publication, testing, concurrency and partial recovery.
