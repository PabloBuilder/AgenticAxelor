# Session Handoff: Refonte V2 (34 Nodes) & Demo01 Invoice 38 E2E Completed

## 1. Goal
- Complete the E2E recovery of Demo01 Draft Invoice 38 (`1Z5xnQ_IdlAXOZJ4fFpPGlLfFYyhEn2cA`) and eliminate the "usine à gaz" node bloat by refactoring the 299-node workflow into a clean, unified, idempotent **34-node** workflow (`08B4U0Ey1SWRV4vg`). **COMPLETED.**

## 2. Key Decisions & Architecture (34 Nodes vs 299 Nodes = -88.6%)
- **Unified Idempotent Flow (0 duplicated recovery corridor)**:
  - **Couloir 1 (`Y = 180`, 11 nodes)**: Triggers (`Test Manuel Master`, `Entree Pilote Controle`, disabled `Scan Planifie Factures`) → `Recherche PDF Source Drive` → `Lecture Registre Traitements` → `Selection Facture A Traiter` → `IF Facture Eligible` → `Lecture Fichier PDF` → `Extraction Texte PDF` → `Preparation Prompt & Garde Lecture` → `Extraction IA Facture`.
  - **Couloir 2 (`Y = 540`, 14 nodes)**: `Validation Extraction & Preparation Axelor` → `Connexion Axelor ERP` → `Recherche Fournisseur Axelor` → `Recherche Facture Existante Axelor` → `Resolution Comptable & Decision Facture` → `IF Facture Deja Creee` (`REUSE` skips creation; `CREATE` runs `Creation Brouillon Facture` → `Calcul Taxes Facture` → `Sauvegarde Totaux & Taxes`) → `Recherche Piece Jointe PDF` → `Decision Piece Jointe & Restauration PDF` (includes pure-JS SHA-256) → `IF PDF Deja Attache` (`false` runs `Upload PDF Axelor` → `Rattachement Piece Jointe Axelor`).
  - **Couloir 3 (`Y = 880` & `Y = 1140`, 9 nodes)**:
    - **Succès**: `Preparation Classement Succes` → `Deplacement PDF Succes Drive` → `Enregistrement Statut DONE` → `Enregistrement Journal Succes` → `Retour Pilote`.
    - **Erreur centralisée**: `Diagnostic & Preparation Erreur` → `Deplacement PDF Erreur Drive` → `Enregistrement Statut ERROR` → `Enregistrement Journal Erreur` → `Retour Pilote`.

## 3. Important Files
- `Work_data/build-invoice-refonte.mjs`: Generator for the 34-node Refonte V2 workflow (`ok: true, warnings: 0`).
- `Work_data/n8n-workflow-refonte-v2.json`, `Work_data/n8n-workflow-refonte-v2.expanded.json`: Generated & CLI-validated specs.
- `Work_data/test-invoice-refonte.mjs`: 8/8 passing offline checks covering structure, compilation, fresh creation, idempotent reuse (Invoice 38), pure-JS SHA-256, and centralized error handling.
- `Work_data/Matrice-refonte-workflow-factures.md`: Complete architecture documentation and node mapping.

## 4. Live State on Demo01 & n8n
- **n8n Workflow**: `08B4U0Ey1SWRV4vg` (`PILOTE demo01 - Saisie Factures Fournisseurs (Refonte V2)`), `versionId: d023dd29-6bce-44a5-9a83-b8e37bdd861d`, **34 nodes**, `active: false`.
- **Demo01 Invoice 38**: Reconciled in draft (`statusSelect: 1`, `version: 3`), `MetaFile 501` + `MetaAttachment 114` verified (`SHA-256: 5aad1dd0112f286c2576bf97d2abb0eda8fec9c6a1eb1ecf56aeccf824d38ebb`), PDF classified in `Factures saisies`, `invoice-treatments` stage `DONE`.

## 5. Next Action
- Ready for Lot 2 business edge cases (Upcoop mixed/exempt VAT, IONOS reverse-charge VAT, HUBIN multi-piece/credit notes, OCR adapter) on top of the clean 34-node foundation.
