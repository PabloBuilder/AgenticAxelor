# Saisie des temps depuis l’agenda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un skill partagé qui prépare et enregistre, après validation, les temps issus de l’agenda sans doublons silencieux.

**Architecture:** Le skill orchestre les outils Google Workspace et la CLI Redmine existants. Une trace persistante locale par utilisateur relie événement et ligne ; elle ne constitue pas une garantie entre postes : en cas d'absence ou d'incertitude de trace, rapprocher les lignes existantes et bloquer les cas douteux. Les règles d'écriture effective sont conditionnées à la vérification de la structure réelle du classeur.

**Tech Stack:** Instructions de skill Markdown, MCP Google Workspace, CLI redmine-axi, tests de scénarios du dépôt.

**Spec:** `docs/superpowers/specs/2026-11-05-saisie-temps-agenda-design.md`

## Global Constraints
- Lecture seule pour Redmine et Agenda ; aucune écriture Sheets avant validation explicite des lignes.
- Temps à facturer toujours laissé intact ; ne jamais inventer une information.
- Ne pas modifier les fichiers préexistants sans rapport ; aucune donnée personnelle ni identifiant d’événement dans Git.
- Ne pas réaliser d'écriture de test sur un service externe sans autorisation distincte.
- Si identification, accès, pagination, ciblage ou suivi ne sont pas suffisamment fiables, signaler le blocage et ne pas écrire les cas concernés.

## Review Focus
- Événement récurrent : identifier l'occurrence, pas seulement la série ; tester deux occurrences distinctes.
- Deux plages identiques le même jour : ne pas les fusionner ; tester et signaler le rapprochement ambigu.
- Modification après import : signaler sans réécrire ; tester titre et horaires modifiés.
- Échec ou interruption après écriture : ne pas relancer aveuglément ; tester réconciliation avec une écriture au résultat inconnu.
- Événements nombreux, changement d'heure et calendrier non primaire : garantir la complétude, le fuseau et le calendrier confirmé, sinon bloquer ; tester ces trois cas.

---

### Task 1: Établir le contrat opérationnel réel

**Files:**
- Create: `.agents/skills/saisie-temps-agenda/references/verification.md`
- Test: `.agents/skills/saisie-temps-agenda/tests/scenarios.md`

**Interfaces:**
- Consumes: spécification ; `.agents/google-workspace-index.md` ; skill Redmine ; schémas MCP découverts à l'exécution.
- Produces: tableau documenté des capacités vérifiées, contraintes et blocages ; aucun accès supposé.

- [ ] **Step 1:** Définir des scénarios de vérification en lecture seule : identité, liste complète d'événements, identifiants et fuseau, onglets et en-têtes, formules et zones préremplies, lignes existantes et rôle des identifiants Redmine.
- [ ] **Step 2:** Vérifier les capacités réellement disponibles sans lire de secrets ni effectuer d'écriture externe ; noter les commandes ou outils et les résultats observés dans `verification.md`. Vérifier notamment si `get_events` permet de récupérer tous les résultats ; ne pas déduire une pagination non exposée.
- [ ] **Step 3:** Identifier une règle d'emplacement et de lecture des lignes prouvée pour les onglets concernés. Si consolidation ou synchronisation ne peuvent être établies en lecture seule, documenter le blocage et interdire les écritures pour ces cas.
- [ ] **Step 4:** Exécuter les scénarios de lecture seule et vérifier que chaque affirmation de capacité est sourcée ; les accès d'écriture restent non vérifiés sans test autorisé.

### Task 2: Définir le suivi et les scénarios de sécurité

**Files:**
- Create: `.agents/skills/saisie-temps-agenda/references/suivi.md`
- Modify: `.agents/skills/saisie-temps-agenda/tests/scenarios.md`

**Interfaces:**
- Consumes: contrat de Task 1, identité utilisateur et calendrier confirmés, occurrence, instantanés de l'événement et résultat d'écriture.
- Produces: contrat du registre local privé, hors dépôt : clé compte + calendrier + identifiant d'occurrence ; empreinte des champs pertinents ; feuille, repère de ligne, contenu écrit et état de réconciliation.

- [ ] **Step 1:** Ajouter les scénarios : deuxième lancement, occurrences récurrentes, deux plages semblables, modification de titre ou d'horaires, ligne manuelle semblable, registre manquant, autre poste, écriture réussie mais réponse perdue, déplacement de ligne et accès concurrent.
- [ ] **Step 2:** Documenter le stockage local privé hors dépôt et les étapes préparé → écriture → vérification → enregistré. Une interruption ou un conflit impose une réconciliation manuelle ; ne jamais marquer une écriture comme certaine avant relecture.
- [ ] **Step 3:** Préciser qu'un registre local ne synchronise pas les postes et ne verrouille pas les collaborateurs : en l'absence de preuve de non-doublon ou en cas d'écritures concurrentes, suspendre la ligne et informer l'utilisateur.
- [ ] **Step 4:** Vérifier que chaque scénario aboutit à un résultat explicite (ajout unique, signalement ou arrêt sûr) sans se reposer sur le seul numéro de ligne.

### Task 3: Rédiger le skill et valider ses scénarios

**Files:**
- Create: `.agents/skills/saisie-temps-agenda/SKILL.md`
- Modify: `.agents/skills/saisie-temps-agenda/tests/scenarios.md`

**Interfaces:**
- Consumes: documents des Tasks 1–2 et spécification.
- Produces: skill invocable manuellement, avec routage vers les index Google Workspace et Redmine et découverte des outils en session.

- [ ] **Step 1:** Définir les scénarios de sélection : semaine courante, jour ou semaine demandé, plages finies seulement, titres avec numéro seul ou préfixe projet, nombres ambigus, événement sans heure, deux occurrences, pagination incomplète et changement d'heure.
- [ ] **Step 2:** Rédiger `SKILL.md` : identification utilisateur, sélection, consultation Redmine limitée, classification fondée sur les éléments, prévisualisation détaillée, validation explicite, contrôle des doublons, écriture ciblée et relecture. Appliquer les blocages de Tasks 1–2.
- [ ] **Step 3:** Ajouter les scénarios de profil CP/RDD/tech, type adaptable, tâche non documentée, champ facultatif inconnu, temps à facturer intact, refus de validation et droits refusés.
- [ ] **Step 4:** Exécuter les scénarios sur des données fictives, vérifier les liens relatifs et le frontmatter, puis noter les résultats réels. Ne pas prétendre qu'un test fictif vérifie les accès Google ou Redmine.
- [ ] **Step 5:** Faire relire l'ensemble par un reviewer indépendant et corriger les défauts actionnables. Ne pas effectuer de commit sans vérifier que seuls les fichiers de cette fonctionnalité sont inclus.
