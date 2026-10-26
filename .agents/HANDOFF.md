# Session Handoff: demo01 invoice pilot — resume E2E acceptance

## 1. Goal
- n8n: Drive PDF → extraction → controlled Axelor draft + verified PDF → classification/CSV; no posting/payment. Complete manual synthetic E2E, then anti-duplicate replay. Full architecture still incomplete.

## 2. Key Decisions & Architecture
- User explicitly authorized remote setup/tests/demo01 drafts/Drive writes. Preserve original master; no scheduled activation during acceptance. Never inspect/copy keys/cookies; local Axelor via SessionStore-synced browser session.
- Native n8n tables: treatments/events/exports; durable intents + outbox; unknown writes reconcile, never blindly retry. `serializationVerified:false`; `controlledManualPilot:true` = singleton operator/local lease, NOT distributed locking/unattended readiness. Scope fixed to synthetic Drive ID.
- **OpenAI RESOLVED**: screenshot actual URL `http://192.168.100.148:4000/v1`; existing credential `bKyH19HiTuMp2dYM`; sole advertised model `gpt-5.6-luna`. Public `https://iacost.alter-si.fr/v1` 403 diagnosis was WRONG TARGET, not broken credential. Internal models/extraction succeed. Exact internal HTTP exception only; no key changed.

## 3. Important Files
- `Work_data/Architecture-saisie-factures-n8n.md`, `Work_data/Plan-finalisation-workflow-factures.md`, `Work_data/invoice-completion-matrix.md`: target/plan/gaps; historical statuses superseded by latest runtime contract.
- `Work_data/build-invoice-integrated.mjs`: generator from preserved legacy master + `Work_data/invoice-runtime-bindings.json`; regenerate, never hand-edit candidate.
- `Work_data/build-invoice-{pdf-recovery,recovery-errors,fallback-recovery,outbox,export-state}.mjs`: graph modules; uncertainty/diagnostics/CSV persistence.
- `Work_data/build-invoice-live-pilot.mjs`: isolated webhook copy, no editor/manual/schedule trigger; `Work_data/run-invoice-live-pilot.mjs <unique-label>`: exclusive local lease + immutable run intent, no blind repeat.
- `Work_data/build-invoice-extraction-probe.mjs [models]`, `Work_data/run-invoice-extraction-probe.mjs`: read-only synthetic extraction probe; default extraction, optional models.
- `Work_data/refresh-invoice-pilot.mjs <id> dry-run|push [spec]`: snapshots/version precheck; CLI expands compact JSON before push (direct compact-JSON push fails). Read dry-run changes before push; target must be inactive. Actual CLI lacks `--out`/`--expect-version`/activation dry-run; no `--force`.
- `Work_data/n8n-invoice-tables.mjs rows`: public API fallback (installed CLI lacks tables); sanitized row summaries + local row files, inherited auth only.
- `Work_data/Recette-demo01-facture-pilote.md`, `Work_data/invoice-runtime-contract.md`, `Work_data/Diagnostic-acces-OpenAI.md`: receipts/current corrections. `Work_data/openai-internal-models-result.json`, `Work_data/invoice-extraction-probe.result.json`: live OpenAI success.

## 4. Verified Facts & Completed Work
- All 6 `RECETTE demo01` workflows INACTIVE. Corrected full copy **`ig4W8G2i04D1j0sI`**; extraction probe **`EASsk0Ne8SXWDZM0`**. Original **`2VBBSRBR9qfL42fv`** untouched/inactive. Other inactive probes: `U7isoaKer8ZsGcIu`, `NyRtPuxIuFsfhTcn`, `nP03p0Xcdx475sE0`, `TIKLwQbHmsYuQWwc`.
- Native tables CREATED/schema-readback: treatments **`1atLXJCjbXmUYboi`** (`treatment_id,drive_file_id,state_json`); events **`VaP6u6KX3DJhf8Jx`** (`event_id,event_json`); exports **`o4rtmfLMSdTXZcgt`** (`export_id,state_json`); columns string.
- Synthetic PDF **`1Z5xnQ_IdlAXOZJ4fFpPGlLfFYyhEn2cA`**, reference **`RECETTE-N8N-DEMO01-20261026112328`**. Uploaded source `1AY7PihVHo4hO-kHCz2DIBRyGLAZ21wqb`; real 3 PDFs untouched. Extraction LIVE validated supplier/dates/EUR/quotes/HT10/TVA2/TTC12.
- Demo-only mappings live-read: company1, supplier30 SASAKI Components (`isSupplier:true`), EUR46, purchase account654, unit1, operation1/subtype1/lineType0, STANDARD20 TaxLine13. Other rates NOT mapped; old tax shortcuts disproved. Admin user1 exists; Pablo/Cantini not found. No human-validation node required.
- Full pilot previously stopped pre-ERP; last ERP reference readback **0 invoices**. Treatment persisted **BLOCKED**, error `PRE_CREATION_ERROR`, one error/outbox event; exports empty. This historical state was NOT reset after fixing OpenAI. Recheck current Drive placement before resetting; don't discard audit/outbox.
- Runtime fixes: Crypto drops binaries → explicit binary restore after every hash; n8n Code lacks structuredClone → JSON clone shim; normalize string errors/line suffixes. Recovery checks line IDs/relations/amounts, invoice totals and tax bases; missing tax hydration/partial calculations block.
- Latest tests: `node Work_data/test-invoice-integrated.mjs` **51** + `node Work_data/test-invoice-durability.mjs` **47** = **98 pass**; `node Work_data/validate-invoice-candidate.mjs` passes; corrected full remote copy validates. No E2E/ERP/PDF/classification/CSV success yet.

## 5. Status & Next Action
- **Status**: OpenAI fixed + extraction accepted; corrected full pilot deployed INACTIVE. Existing synthetic BLOCKED row prevents normal creation. Remaining global gaps: true serialization/retention, partial ERP repair/tax hydration, OCR/multi-piece/credit notes/reverse charge, live final acceptance.
- **Next Action**: Read back synthetic reference in demo01, its treatment/outbox and Drive location; if still no ERP write, explicitly requalify ONLY that synthetic treatment for pre-creation retry while preserving history, then run corrected full pilot once and verify actual ERP/PDF/Drive/CSV outputs before replay. Use n8n-axi skill; local `npm run query -- --model ... --domain ... --fields ... --output Work_data/...` fallback works (MCP lookup disabled); never transfer browser cookies to n8n. Leave tests inactive afterward; do not re-ask already granted demo acceptance permission.
