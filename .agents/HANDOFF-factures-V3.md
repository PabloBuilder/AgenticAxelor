# Session Handoff : V3 factures fournisseurs — prototype DEMO et robustification

## 0. Actualisation — 2026-11-09

- La V3 Gestion DEV `VlJlnojP4vxT3aAs` a été relue inactive, version `ede55780-cc0e-4f96-86e0-42a340b7637e`, 59 nœuds, `binaryMode: separate`. Confirmer l'état réel avant toute action ; la lecture souple et l'écriture Sheet sont raccordées, pas validées ensemble de bout en bout.
- Deux brouillons AXELOR DEV ont été vérifiés : 2604 et 2605. La copie du document 109 reste en revue après `LINE_ROWS_UNPARSED` ; ne pas déplacer ni effacer son état pour forcer le traitement. La reprise automatique après interruption est mise de côté.
- Dernière anomalie observée : la Sheet DEV a reçu une proposition pour `AXFI261000023` avec `SYSTEM_ERROR` et sans identifiant Drive ; la copie demeure en source et l'état du fichier n'est pas enregistré sous son ID. Ne pas relancer avant diagnostic. L'exécution manuelle n'a pas été conservée ; ne pas déduire sa cause sans preuve.
- Les fichiers de travail ont été regroupés dans `Work_data/Task History/Historique-workflow-factures/` ; le dossier `lot2/reprise-automatique-a-reprendre/` y est conservé. Les dépendances Node temporaires des bancs de test ont été supprimées, leurs manifests et verrous sont conservés pour réinstallation. Les PDF source des autres dossiers n'ont pas été déplacés.
- Les points ci-dessous sont historiques et peuvent être dépassés, notamment ceux sur l'exécution du lot de 12, les réglages ou le nombre de nœuds. Les anciens workflows DEMO ne doivent pas être exécutés avec les credentials réaffectés à Gestion DEV.

## 0 bis. Session historique — 2026-11-06

- **Current goal:** manual, inactive batch recipe of 12 copied PDFs in Gestion DEV only; goal remains blocked pending operator execution of the separately published batch workflow. IDs, versions, file mappings and expectations: `Work_data/Task History/Historique-workflow-factures/lot2/lot12-reference.json`; the human-facing sheet currently says **Non testé**. No batch run or 12-document success has been reported.
- **Observed Gestion DEV acceptance:** a new AXELOR supplier invoice completed autonomously as one draft; independent readback verified dates, lines, totals, downloaded PDF SHA-256, Drive classification and IDLE mutex with COMPLETE receipt. A same-file rerun returned `ALREADY_DONE` and independent readback showed one invoice and attachment. Evidence: `Work_data/Task History/Historique-workflow-factures/lot2/gestion-dev-axelor-real-acceptance.json`. Partial-failure recovery was not tested in this DEV run.
- **Concurrency:** DEV technical mutex created and tested: two concurrent saves of one version produced one winner and one rejection; IDLE restored. This protects participating workflows only. Binding and evidence: `Work_data/Task History/Historique-workflow-factures/lot2/v3-gestion-dev-creation-gate.json`.
- **Batch candidate:** existing V3 remains inactive and separate from the inactive 12-file recipe workflow. Published batch readback and source: `Work_data/Task History/Historique-workflow-factures/lot2/workflow-v3-gestion-dev-lot12-readback.json` and `Work_data/Task History/Historique-workflow-factures/lot2/build-v3-gestion-dev-lot12.mjs`. Compare with live state before any mutation. The workflow selects only the 12 sandbox copies, processes one at a time and stops on uncertain gate state. A fake branch test proved prior-iteration `.first()` data can remain visible; a second fake test rejected it using current-item identity. This is not full batch acceptance.
- **Settings caveat:** CLI 0.1.0 strips `binaryMode` from push dry-run; the new batch readback lacks the V3's `binaryMode: separate`. A separate read-only PDF test succeeded in inline mode, verifying one file's signature and size only; full batch binary/attachment behavior remains unproven. Do not claim the settings match or infer production readiness.
- **Next:** if the operator has run the batch, obtain only the sanitized `Resultat Lot` or failing stage; inspect actual workflow/execution, DEV mutex, per-document ERP/attachment and Drive state before any repeat. Never rerun blindly. If not yet run, operator can execute the inactive batch once after reconfirming current scope and state. The CSV/Sheet remains a human-readable test view, not a durable registry.
- **Auth:** browser/MCP and n8n credentials are separate. The existing shared n8n credential was changed by the operator to Gestion DEV; old DEMO workflows still point to DEMO and must not be executed with that credential. No secrets or browser cookies should be copied or disclosed.

The following sections are historical DEMO context. Their “next action” and inactivation statements do not override this update.

## 1. Goal

- Passer d’un PDF Drive, natif ou scanné, à un **brouillon fournisseur unique et contrôlé dans Axelor**, avec PDF original joint, puis classement DONE seulement après vérifications.
- Cible actuelle : **DEMO01**. Production = référence métier observée, pas environnement d’écriture autorisé pour ce chantier.
- Objectif suivant : outil exploitable sur un **périmètre explicite**, les cas inconnus partant en revue ; pas traitement universel ni refonte d’infrastructure.
- Ce handoff est séparé : **ne pas lire/écraser `.agents/HANDOFF.md`**, réservé à un autre projet. Lire le routeur et les index applicables.

## 2. Key Decisions & Architecture

- **Un seul V3 existant**, pas de workflow par fournisseur. Anciennes recettes conservées comme bancs historiques ; ne pas les republier/rejouer par défaut.
- Dernier état publié connu : **inactif, 51 nœuds**. Identifiants/versions/bindings dans les manifests `Work_data/Task History/Historique-workflow-factures/lot2/`, à relire avant toute mutation ; pas de valeurs opérationnelles à reconstruire depuis ce handoff.
- Chaîne : sélection Drive contrôlée → PDF/SHA → texte natif ou transcription PDF par le même modèle/relais que la recette → preuves documentaires/politique comptable → authentification ERP → mutex → recherche fraîche des doublons → création ou réutilisation stricte → calcul ERP → relecture en-tête/lignes/taxes → pièce jointe téléchargée et hachée → reçu/libération du mutex → Drive DONE et journal.
- OCR : transport PDF réel du modèle vérifié sur un scan HUBIN. **Pas de worker OCR à déployer.** Ne pas relancer l’ancienne piste RapidOCR/serveur privé.
- Avis de loyer : grammaire mono-page fermée, loyer + provision, dates/période explicites. Source `RENT_DUE_NOTICE`, HT/TVA source inconnus ; projection INVOICE avec traitement ERP explicitement configuré, jamais présentée comme exonération imprimée. Pas de second appel LLM inutile pour cette grammaire.
- Référentiel métier production conservé séparément des IDs DEMO. Pas de bascule production par simple remplacement d’URL.
- Mutex ERP technique versionné : CAS, propriétaire d’exécution, SHA, clé métier et reçus. Contrôle de doublons après acquisition. **Pas de TTL/reprise aveugle** ; un BUSY exige rapprochement de l’exécution terminale et de l’état ERP. Protection limitée à ce V3, pas aux saisies externes.
- Réutilisation : comparer identité/dates/devise/type, lignes complètes, produits/comptes/unités/remises/taxes et bases ; mêmes totaux seuls insuffisants.
- Architecture sobre : conserver l’alternance I/O–Code–I/O, le corridor d’erreur central et peu d’écritures de registre ; réutiliser générateur/tests existants.

## 3. Important Files

- `.agents/docs/retour-experience-axelor-n8n-factures.md` : **lecture prioritaire avant correction** ; 22 sections de constats, pièges, procédures, limites et preuves. Référencé dans `.agents/n8n-index.md`.
- `Work_data/Task History/Historique-workflow-factures/lot2/build-v3-integrated.mjs` : générateur V3, routage OCR, mutex, création/réutilisation, vérifications et échéancier explicite (`withExplicitDueDateTerm`).
- `Work_data/Task History/Historique-workflow-factures/lot2/workflow-v3-integrated.expanded.json` : candidat généré ; ne pas présumer qu’une régénération remplace correctement les normalisations UI distantes.
- `Work_data/Task History/Historique-workflow-factures/lot2/test-v3-integrated.mjs`, `Work_data/Task History/Historique-workflow-factures/lot2/v3-integration-test-results.json` : dernière suite ciblée, **24 contrôles locaux PASS** ; simulation ERP ≠ acceptation réelle.
- `Work_data/Task History/Historique-workflow-factures/lot2/rent-notice-adapter.mjs` : collecte source et projection comptable d’avis de loyer.
- `Work_data/Task History/Historique-workflow-factures/lot2/accounting-policy.mjs` : résolution catégories/taxes, remises, recherches et réutilisation stricte ; garde générale de création distincte du raccordement V3.
- `Work_data/Task History/Historique-workflow-factures/lot2/accounting-choices.reference.json` : choix métier/provenance, non exécutable en production.
- `Work_data/Task History/Historique-workflow-factures/lot2/accounting-policy.demo.json` : bindings DEMO effectivement approuvés ; couverture des autres familles incomplète.
- `Work_data/Task History/Historique-workflow-factures/lot2/document-guards.mjs`, `Work_data/Task History/Historique-workflow-factures/lot2/native-evidence-adapter.mjs`, `Work_data/Task History/Historique-workflow-factures/lot2/supplier-identity-guards.mjs`, `Work_data/Task History/Historique-workflow-factures/lot2/due-date-guards.mjs` : preuves source, inventaire des lignes, rôles émetteur/destinataire et échéance explicite.
- `Work_data/Task History/Historique-workflow-factures/lot2/v3-hubin-autosaisie.json` : état final HUBIN, écritures autorisées, correction échéancier, publication, réconciliation et acceptation ; phase `REAL_HUBIN_REUSE_PDF_VERIFIED_DONE`.
- `Work_data/Task History/Historique-workflow-factures/lot2/v3-hubin-term-fix-readback.json` : dernier readback de publication connu du V3.
- `Work_data/Task History/Historique-workflow-factures/lot2/v3-creation-gate.json` : configuration du mutex et preuve réelle de concurrence optimiste sur l’objet technique.
- `Work_data/Task History/Historique-workflow-factures/lot2/real-recipes/` : preuves d’exécution et PDF ERP téléchargés indépendamment ; fichiers sensibles, pas des fixtures publiques.
- `Work_data/Task History/Historique-workflow-factures/lot2/Bilan-integration-V3.md` : résultats détaillés ; **son sommet est actuel, les consignes de ses sections historiques sont dépassées**. Ne pas relancer un ancien test parce qu’un paragraphe ancien dit « à faire ».

## 4. Verified Facts & Completed Work

### Acceptations réelles

- **Upcoop** : brouillon unique, exonération + 20 %, HT 10 755,00 / TVA 10,20 / TTC 10 765,20 ; pièce unique/hash conforme, copie DONE, mutex libéré. Succès après correction du régime TVA du compte DEMO et reprise du brouillon.
- **HUBIN avis scanné** : transcription réelle contrôlée visuellement ; avis du 01/07/2026, échéance 16/07/2026, loyer 12 642,63 + charges 2 309,00 = 14 951,63. Brouillon unique, échéancier personnalisé conforme, PDF distant identique à l’original, copie DONE, mutex IDLE/reçu COMPLETE. Succès après correction et réutilisation, pas création initiale sans intervention.
- **IONOS** : extraction réelle acceptée, sept lignes dont quatre gratuites, échéance explicite conservée. Comptabilisation complète/autoliquidation non validée dans le V3.
- Brouillons finaux **ni validés ni payés** ; pas de modification de la production.
- Dernière correction locale/publiée : 24 contrôles ciblés PASS, expressions/Code compilés, validation CLI stricte, dry-run, publication ciblée et readback ; autres workflows préservés. Ne pas additionner d’anciens nombres de tests pour certifier le code actuel.

### Pièges déjà résolus — ne pas refaire l’investigation

- **Échéance** : `Invoice.dueDate` seule est remplacée quand l’échéancier est vide ; une condition de règlement libre seule ne suffit pas. Une date source explicite nécessite ici un InvoiceTerm personnalisé à 100 % ; ne pas écraser un échéancier existant. Date source absente = null, défaut ERP conservé séparément.
- **Taxes** : le compte peut manquer de régime TVA ; erreur métier imbriquée malgré HTTP 200 et statut global de succès. Contrôler `data[].error` et relire les résultats, pas seulement le transport.
- **Pièce jointe** : présence de MetaAttachment/MetaFile insuffisante ; télécharger et hacher le contenu. Sur l’installation testée, `Accept: application/pdf` produisait 406 ; `Accept: */*` fonctionne. Distinguer erreur HTTP et hash différent.
- **Schéma** : Partner `taxNbr`/`siren`, InvoiceLine `taxLineSet`, PaymentCondition dans le package `account`. Inspecter avant de supposer ; ne pas inventer des conversions SIRET→SIREN.
- **Relations** : en-tête facture souvent limité aux IDs de lignes/taxes ; lectures séparées complètes nécessaires avant REUSE et après sauvegarde. Relire la version persistée avant compute/save.
- **Identité IA** : SIRET client attribué au fournisseur même après correction de prompt ; garde source obligatoire avant recherche partenaire. Référence/dates/lignes gratuites/cache doivent aussi être validés indépendamment.
- **n8n** : vert technique peut signifier erreur métier absorbée ; lire résultat terminal + état indépendant. Rétention désactivée : absence d’exécution récupérable par CLI ne prouve pas absence d’essai.
- **Expressions** : objets compacts/`}}` et helpers embarqués ont passé la validation CLI mais échoué à la compilation ; conserver le formateur et les tests ciblés.
- **Pilotage** : une valeur pilot ID n’imposait pas la sélection ; garde explicite ajoutée. Les copies de tests réussis sont déjà DONE : ne pas les réexécuter.
- **Reprise** : terminal confirmé → relecture stricte du même brouillon → correction autorisée → journal RECONCILED et libération CAS → reprise commune ; jamais reset global ni faux COMPLETE.
- **Connecteurs** : Axelor via session navigateur/Bridge ; n8n via CLI/credentials propres ; Google via son MCP. En multisession, cible explicite. Aucun scan de secrets/cookies ni transfert de session du poste à n8n.

## 5. Status & Next Action

**Status : prototype DEMO fonctionnel sur deux familles après reprises, pas outil de production validé.** Aucun taux de couverture de 95 % démontré. Aucun nouveau déclenchement, activation, écriture production ou élargissement de périmètre autorisé par ce document.

### Prochaine action unique, à faire approuver avant exécution

Préparer **une nouvelle facture représentative du périmètre déjà raccordé** et une copie sandbox explicitement sélectionnée ; vérifier configuration et verrou, puis faire un seul essai manuel complet **sans correction intermédiaire**. Mesurer : création unique, bonnes dates/échéancier/lignes/taxes, PDF conforme, reçu/libération, classement. Ne pas réutiliser un ancien PDF DONE pour prétendre tester une nouvelle création.

### Trajectoire de robustification, par petits lots

1. **Confirmer le socle, sans ajouter de fonctionnalité.** Essai neuf ci-dessus, puis relance contrôlée du même document et un échec ciblé/reprise. Attendus : aucun doublon, aucun faux DONE, erreur compréhensible, reprise sur l’existant. Conserver une petite matrice de preuves, pas une nouvelle batterie de scripts.
2. **Fermer le périmètre utile.** Sélectionner avec l’opérateur un petit corpus représentatif de ses volumes ; compléter seulement les bindings/règles qui manquent dans ce périmètre. Compter succès autonomes, revues justifiées, erreurs, temps/coût. IONOS/autoliquidation, avoirs, remises, taux multiples et multi-pièces ne sont « couverts » qu’après leur propre preuve ; les laisser en revue si non indispensables au premier déploiement.
3. **Rendre le socle transportable et exploitable.** Sortir les sources/tests/configurations non secrètes utiles de la dépendance à `Work_data` ignoré par Git, sans versionner PDF, dumps sensibles ni secrets. Un générateur, une commande de validation/export et des bindings explicites par environnement ; vérifier les prérequis ERP, comptes/taxes, devise/échéanciers et accès du relais/credentials avant de publier. Ne pas rendre toutes les devises/règles paramétrables avant besoin.
4. **Préparer une exploitation légère, puis un pilote production borné.** Résultat terminal lisible avec exécution/document/étape/code/facture, courte procédure revue/reprise d’un BUSY, rollback de publication, sauvegarde et gestion du journal borné. Vérifier authentification n8n durable/autorisée, accès réseau, coûts et traitement des données transmises au modèle. Refaire les bindings production et comparer les règles sans recopier les IDs DEMO ; autorisation séparée, petit périmètre, brouillons seulement au départ.

### Ne pas surcomplexifier

- Ne pas ajouter de worker OCR, broker, microservice de verrou, orchestrateur ou workflow fournisseur pour ce déploiement.
- Ne pas construire maintenant de GUI d’administration, d’état par nœud ou de reprise automatique à expiration ; commencer par une procédure opérateur courte.
- Garder le mutex actuel pour un pilote à faible volume ; envisager une vraie unicité/transaction côté ERP seulement si plusieurs producteurs ou la concurrence réelle le nécessitent.
- Ne pas supprimer/archiver les anciens essais sans accord ; les déclarer historiques et travailler uniquement sur le chemin commun.
- Le critère de déploiement est un périmètre annoncé, une création autonome prouvée et un échec sûr/reprenable — **pas “tout passe” ni un chiffre de couverture supposé**.
