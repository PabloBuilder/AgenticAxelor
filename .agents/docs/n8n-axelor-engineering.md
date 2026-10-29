# n8n ↔ Axelor & AI Engineering Guide

Reference patterns and runtime safeguards for building compact, idempotent, production-grade n8n workflows integrated with Axelor ERP, Google Drive, and LLMs.

---

## 1. Zero-Bloat Workflow Architecture (~25–35 Nodes Target)

1. **Single Idempotent Pipeline (Zero Duplicated Recovery Corridors)**:
   - Never build a separate "Creation" branch and "Recovery" branch.
   - Query ERP state before mutating (`Recherche Facture Existante Axelor` → `IF Facture Deja Creee`, `Recherche Piece Jointe PDF` → `IF PDF Deja Attache`).
   - If the draft record already exists and matches expected amounts (`HT / TVA / TTC`), return `invoiceAction: 'REUSE'` and skip straight to attachment check.
2. **Strict `I/O → Code → I/O` Alternation**:
   - Never chain `Code → Code` on the main port. One `Code` node between two I/O nodes validates the previous response and builds the next request payload.
3. **Minimal State Persistence (`Data Table`)**:
   - Read the state registry once at workflow entry (`Lecture Registre Traitements`).
   - Write final state only at workflow exit: `Enregistrement Statut DONE` + `Enregistrement Journal Succes` (or `ERROR` + `Journal Erreur`). Avoid per-node Two-Phase Commit writes.
4. **Centralized 4-Node Error Branch**:
   - Route `onError: 'continueErrorOutput'` (`main:1`) of all I/O and validation nodes directly to a single collector:
     `Diagnostic & Preparation Erreur` → `Deplacement PDF Erreur Drive` → `Enregistrement Statut ERROR` → `Enregistrement Journal Erreur`.
   - Prefix thrown errors in every `Code` node with `[STAGE:<Node Name>] <ERROR_CODE>` so the central collector attributes the exact failing stage without wrapper nodes.
5. **Three-Swimlane Visual Layout**:
   - **Couloir 1 (`Y = 180`)**: Triggers, Source Selection, Readability Guard & LLM Extraction.
   - **Couloir 2 (`Y = 540`)**: Axelor Auth, Partner/Entity Lookup, Idempotent Creation & DMS Attachment.
   - **Couloir 3 (`Y = 880` / `Y = 1140`)**: Success Classification & State Persistence (`Y = 880`) + Centralized Error Branch (`Y = 1140`).

---

## 2. n8n Runtime Pitfalls & Proven Solutions

### A. Binary Data Preservation & Pure-JS SHA-256
- **Pitfall**: Intermediate nodes (`HTTP Request`, `Data Table`, `n8n-nodes-base.crypto`) strip `item.binary` from the execution item. Furthermore, `this.helpers.getBinaryDataBuffer(0, 'data')` only reads from the immediate `$input` item 0 of the current node.
- **Solution 1 (No `Crypto` nodes)**: Compute SHA-256 directly in JS inside the `Code` node from the base64 binary payload (`$('Lecture Fichier PDF').first().binary.data.data`), eliminating `n8n-nodes-base.crypto` and `Restauration Binaire` nodes.
- **Solution 2 (Binary Restore before Upload)**: In the `Code` node immediately preceding `Upload PDF Axelor` (`HTTP Request` with `contentType: 'binaryData'`), return `{ json: { ... }, binary: src.binary }` so the upload node receives `binary.data` on its direct input.

### B. Webhook Node Contract (`n8n-axi workflow validate`)
- Every `n8n-nodes-base.webhook` node pushed via API must define a stable `webhookId` parameter alongside `path`, `httpMethod`, and `responseMode: 'responseNode'`. Omitting `webhookId` triggers `MISSING_WEBHOOK_ID` validation warnings and can prevent production webhook registration.

### C. HTTP Request Node Discipline (`neverError: true`)
- Configure `options: { response: { response: { fullResponse: true, neverError: true, responseFormat: 'text' } } }` on Axelor and LLM `HTTP Request` nodes so the downstream `Code` node can deterministically inspect `statusCode` and parse JSON or surface structured `[STAGE:...] HTTP_<status>` errors.

---

## 3. Reliable AI / LLM Extraction Pattern (3-Step Sandwich)

1. **Pre-LLM Readability Guard (`Code`)**:
   - Inspect extracted text (`extractFromFile`) before calling the LLM. Reject empty/scanned PDFs (`text.length < 40` or zero invoice tokens) with `OCR_REQUIRED_UNREADABLE_PDF` to save tokens and route directly to the error/OCR queue.
2. **Strict JSON Contract (`HTTP Request` to LLM)**:
   - Use `temperature: 0`, explicit system prompt with closed enums (`INVOICE | CREDIT_NOTE`, `STANDARD | EXEMPT | REVERSE_CHARGE`), and require raw JSON output without Markdown fences.
3. **Deterministic Post-LLM Accounting Gate (`Code`)**:
   - Never trust LLM arithmetic or ERP IDs blindly.
   - Verify `|exTaxTotal + taxTotal - inTaxTotal| <= 0.05` and `|\u03a3 line.exTaxTotal - totals.exTaxTotal| <= 0.05`.
   - Map accounting codes, tax line IDs, units, and currencies from a deterministic configuration map (`bindings`), never from LLM hallucinations.

---

## 4. Reproducible Build, Validation & Offline Test Pipeline

Never hand-edit complex n8n JSON files directly. Follow this 4-step workflow in `Work_data/`:

1. **Declarative Generator (`build-<workflow>.mjs`)**:
   - Keep environment/pilot IDs in `Work_data/<workflow>-runtime-bindings.json` (never hardcode test IDs in `.agents/`).
   - Emit both compact spec and expanded n8n JSON (`nodes`, `connections`, `settings`).
2. **Static CLI Validation (`n8n-axi.exe workflow validate`)**:
   - Run `n8n-axi.exe workflow validate --file <expanded.json> --strict --json` and enforce `ok === true` and `warnings.length === 0`.
3. **Offline Unit Test Suite (`test-<workflow>.mjs`)**:
   - Compile every `Code` node with `AsyncFunction('$input', '$', '$json', jsCode)` and every `={{ ... }}` expression with `Function`.
   - Simulate fresh creation, idempotent reuse, binary SHA-256 verification, and centralized error handling with **zero external network calls**.
4. **Controlled Deployment (`n8n-axi.exe workflow push`)**:
   - Run `--dry-run --strict` first, then push, then `workflow view <id> --raw` readback to confirm `versionId`, `nodeCount`, and `active` state.
