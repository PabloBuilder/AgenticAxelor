# Session Handoff: Refonte V2 & Demo01 Invoice 38 E2E Completed

## 1. Goal
- Refactor the 299-node invoice workflow into a clean, 3-corridor workflow (`PILOTE demo01 - Saisie Factures Fournisseurs (Refonte V2)`, `08B4U0Ey1SWRV4vg`) and complete the end-to-end recovery of Demo01 Draft Invoice 38 (`1Z5xnQ_IdlAXOZJ4fFpPGlLfFYyhEn2cA`) without creating duplicates, posting, or paying. **COMPLETED.**

## 2. Key Decisions & Architecture
- **1A/2A/5A/6A/7A**: Single workflow compacted from **299 nodes to 186 nodes (-113 nodes, 0 warnings)** organized in 3 swimlanes (*Saisie*, *Reprise & Réconciliation*, *Classement/Fallback/Journal/Exports*), with `Manual Trigger` + `Webhook` + disabled `Schedule Trigger`, and direct `main:1` error routing to 3 central collectors (zero per-node `Capture Echec` / `Diagnostic Pilote` wrappers).
- **Live Axelor DMS & Search Contract Fixes**:
  - `Decision Association Reprise PDF` & `Garde Recherche Reprise ERP` accept omitted `data` (`undefined`) when `total === 0`.
  - `Upload Reprise PDF` sends raw binary (`contentType: "binaryData"`, `Content-Type: application/octet-stream`) with `X-File-Size` header, and `Intention Rattachement Reprise PDF` parses both direct `MetaFile` objects (`{ id }`) and `{ status: 0, data: [{ id }] }`.
  - `Telechargement Reprise PDF` & `Telechargement PDF Axelor` send `Accept: */*` (fixing JAX-RS HTTP 406 on `Accept: application/json`).
  - `Restauration Binaire - Empreinte ...` nodes kept separate before `this.helpers.getBinaryDataBuffer(0, ...)` after `Crypto` nodes.

## 3. Important Files
- `Work_data/Matrice-refonte-workflow-factures.md`: Phase 1 & 2 refactoring matrix and target architecture.
- `Work_data/build-invoice-refonte.mjs`: Refonte V2 generator, code-chain merger, and 3-corridor layout engine.
- `Work_data/n8n-workflow-refonte-v2.json`, `Work_data/n8n-workflow-refonte-v2.expanded.json`: Generated & CLI-validated workflow spec (`ok: true, warnings: 0`).
- `Work_data/test-invoice-refonte.mjs`, `Work_data/test-invoice-integrated.mjs`, `Work_data/test-invoice-durability.mjs`: 131 passing offline checks (66 + 51 + 14).
- `Work_data/invoice-treatments-rows.json`, `Work_data/invoice-events-rows.json`, `Work_data/invoice-exports-rows.json`: Final verified Data Table snapshots.

## 4. Verified End-to-End Results on Demo01 (Invoice 38)
- **n8n Workflow**: `08B4U0Ey1SWRV4vg` (`versionId: 3b77cc01-263e-4faa-9d63-ad05f8b0f561`), executed once and immediately deactivated (`active: false`). Legacy 299-node workflow `ig4W8G2i04D1j0sI` preserved inactive.
- **Axelor ERP (`demo01`)**:
  - Draft Invoice **38** (`RECETTE-N8N-DEMO01-20261026112328`, partner 30 `SASAKI Components`, version 3, `statusSelect: 1`, HT 10 / TVA 2 / TTC 12 EUR, line `69`, tax `71`) reconciled with **zero duplicate invoices** created.
  - `MetaFile` **501** (`invoice-1Z5xnQ_IdlAXOZJ4fFpPGlLfFYyhEn2cA.pdf`, `1096` bytes, `application/pdf`) uploaded and linked via `MetaAttachment` **114** (`objectId: 38`).
  - Independent download of `MetaFile 501` verified: `%PDF-1.4` magic bytes and exact SHA-256 `5aad1dd0112f286c2576bf97d2abb0eda8fec9c6a1eb1ecf56aeccf824d38ebb`.
- **Google Drive & Native Data Tables**:
  - Source PDF `1Z5xnQ_IdlAXOZJ4fFpPGlLfFYyhEn2cA` moved to `Factures saisies` (`1PT5m54VBPpMYrwsj7i8e_JPlKgl9iCJP`) and parent verified.
  - Treatment `1Z5xnQ_IdlAXOZJ4fFpPGlLfFYyhEn2cA`: `stage: "DONE"`, `lastError: null`, `verified: true`, `writeOutcome: "CONFIRMED"`.
  - Journal `invoice-events` (`VaP6u6KX3DJhf8Jx`): 19 rows including `CLASSIFICATION_VERIFIED` + all historical events preserved.
  - Monthly CSV Exports (`invoice-exports` `o4rtmfLMSdTXZcgt`): `2026-10:ALL` (`1rx4TYsvviiGGudOaeKwJVHcJoSjJneXe`, 24 events) and `2026-10:ERRORS` (`107GwLabhRSz48e_d-cSuf02uy6XMO-Py`, 18 events) both `CONFIRMED` after UTF-8 readback verification.

## 5. Status & Next Action
- **Status**: Pilot Invoice 38 E2E 100% completed (`DONE`) on Refonte V2 workflow (`08B4U0Ey1SWRV4vg`, inactive).
- **Next Action**: Proceed to Lot 2 edge cases (OCR adapter, multi-piece/credit notes HUBIN, reverse-charge VAT IONOS, mixed/exempt VAT Upcoop) when requested by user.
