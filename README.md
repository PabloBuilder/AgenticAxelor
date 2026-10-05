# AgenticAxelor

> Le connecteur standardisé (Model Context Protocol - MCP) entre les agents d'IA autonomes et l'ERP Axelor.

AgenticAxelor connecte directement votre assistant d’IA (Claude Desktop, Cursor, Goose, Pi, Claude Code, etc.) à votre instance Axelor en temps réel en exploitant votre session de travail active, de manière sécurisée et sans configuration complexe.

---

## Pourquoi AgenticAxelor ? (Valeur Métier en 4 Piliers)

Conçu pour les **consultants fonctionnels**, **chefs de projet** et **développeurs**, AgenticAxelor transforme votre agent IA en spécialiste opérationnel de votre ERP :

1. **Introspection Métier Approfondie** :
   - L'IA explore fidèlement les entités JPA, les dictionnaires de sélection (`MetaSelect`), les relations de clé étrangère (ERD) et les champs personnalisés dynamiques créés via le **Studio Axelor** (`attrs`).
2. **Moteur de Calcul en Temps Réel (Simulation `onChange`)** :
   - Lors de la préparation d'un devis ou d'une facture, l'IA simule les règles d'interface : Axelor recalcule automatiquement les prix, taxes, remises, devises et conditions de règlement avant toute validation.
3. **Gestion Documentaire (GED) & Rapports Métier** :
   - Consultation, dépôt et téléchargement de pièces jointes (DMS). Génération et enregistrement direct des devis et factures aux formats **PDF, Word ou Excel** (moteurs BIRT / Jasper).
4. **Interopérabilité Multi-MCP & Agents Autonomes** :
   - Capacité d'orchestrer des processus transverses en reliant Axelor à d'autres serveurs MCP (gestion de projet, bureautique, communication, bases SQL) ou via des scripts d'automatisation.

---

## Interopérabilité Multi-MCP & Workflows

AgenticAxelor implémente le standard ouvert **Model Context Protocol (MCP)**. Il est conçu pour être **associé à d'autres connecteurs MCP** dans vos clients d'IA (Cursor, Claude Desktop, Goose) ou dans des pipelines agentiques autonomes en **Python / TypeScript** (*LangGraph*, *CrewAI*, *AutoGen*, *LlamaIndex*, *n8n*).

```mermaid
graph TD
    User["Utilisateur / Pipeline d'Automatisation"] --> Orchestrator["Agent / Orchestrateur (Claude Code / LangGraph / Cursor)"]
    
    Orchestrator -->|Introspection & Données ERP| MCP_Axelor["MCP AgenticAxelor\n(Devis, Factures, Stocks, GED)"]
    Orchestrator -->|Gestion de tickets & Projets| MCP_Redmine["MCP Gestion de Projet\n(ex: Redmine, Jira)"]
    Orchestrator -->|Bureautique & Stockage Cloud| MCP_Google["MCP Espace Collaboratif\n(Drive, Gmail, Docs, Sheets)"]
```

### Cas d'usage et scénarios transverses :

- **Gestion de Projet ⟷ ERP (ex: Redmine, Jira)** : Rapprochement entre les tickets, les temps passés par les équipes et la facturation ou le suivi d'avancement dans Axelor.
- **Bureautique & Stockage Cloud (ex: Google Drive, OneDrive)** : Génération automatisée de bilans, synchronisation de tableaux de bord et archivage documentaire sans manipulation manuelle.
- **Communication & Traitement de Flux (ex: Gmail, Outlook, Slack)** : Détection d'événements entrants (pièces jointes, demandes clients), imputation dans l'ERP et notification des parties prenantes.
- **Pipelines d'Automatisation (Scripts Python, LangGraph, n8n)** : Exécution de scénarios récurrents ou de tâches de fond sur Axelor avec validation intermédiaire.

---

### Exemple de séquence exécutée par l'agent :
> *"Consulte les commandes du client Alter-SI, prépare un devis pour les articles sélectionnés, applique les conditions tarifaires exactes, enregistre la commande et télécharge le bon de commande en PDF."*

L'agent enchaîne les étapes de manière autonome :
1. `search_axelor_models` + `inspect_axelor_model` (découverte du modèle `SaleOrder`).
2. `simulate_axelor_onchange` (dry-run du client pour récupérer le commercial et les conditions de paiement).
3. `batch_axelor_operations` (création atomique de la commande et de ses lignes).
4. `generate_axelor_report` (génération BIRT/Jasper et téléchargement direct du document).

---

## Sécurité & Bonnes Pratiques

> [!WARNING]
> **Sécurité des Données & Responsabilité** :
> - **Héritage des droits utilisateur** : L'agent utilise votre session et dispose de **l'ensemble de vos permissions**. Si vous êtes administrateur, il dispose des droits de création, modification et suppression.
> - **Simulation préalable** : Privilégiez les simulations (`simulate_axelor_onchange`) ou les requêtes de lecture avant d'exécuter des modifications en masse.
> - **Environnement recommandé** : Utilisez prioritairement une instance de **test / recette / staging** avant tout usage en environnement de production.
> - **Confidentialité de session** : Le fichier local `.session.json` contient votre cookie de session temporaire et ne doit pas être partagé. Il est exclu du versionnement Git par défaut.

---

## Outils MCP Disponibles (18 Fonctions Métier)

| Domaine | Outil MCP | Description Fonctionnelle | Exemple d'Instruction |
| :--- | :--- | :--- | :--- |
| **Authentification** | `sync_axelor_session` | Adopte la session connectée dans votre navigateur | *"Vérifie ma connexion Axelor"* |
| **Schéma & Modèles** | `search_axelor_models` | Recherche les entités et tables de la base | *"Trouve le nom technique du modèle Facture"* |
| | `inspect_axelor_model` | Détaille tous les champs, types et relations d'une entité | *"Quels sont les champs obligatoires sur SaleOrder ?"* |
| | `inspect_axelor_selections` | Traduit les listes déroulantes et codes de statuts | *"Que signifie statusSelect = 3 sur un devis ?"* |
| | `get_axelor_schema_relations`| Explore les clés étrangères entrantes et sortantes | *"Quels modèles référencent le modèle Partner ?"* |
| | `inspect_axelor_custom_fields` | Détecte les champs personnalisés Studio (`attrs`) | *"Y a-t-il des champs custom sur les clients ?"* |
| **Navigation & Vues** | `search_axelor_menu` | Retrouve le chemin d'un menu et son fil d'Ariane | *"Où se trouve le menu Gestion des Stocks ?"* |
| | `inspect_axelor_view` | Inspecte l'organisation d'une vue formulaire ou grille | *"Quels sont les onglets du formulaire contact ?"* |
| **Données & Requêtes** | `query_axelor_data` | Recherche avec filtres et tris | *"Liste les 10 derniers devis confirmés"* |
| | `fetch_axelor_record` | Récupère un enregistrement précis par son ID | *"Donne-moi le détail complet du client #42"* |
| | `export_axelor_data` | Exporte de gros volumes en CSV ou JSON | *"Exporte tous les clients actifs dans un fichier CSV"* |
| **Actions & Calculs** | `simulate_axelor_onchange` | Calcule les montants, taxes et règles sans sauvegarder | *"Simule l'ajout du client X sur ce devis"* |
| | `save_axelor_record` | Crée ou met à jour un enregistrement | *"Crée un prospect avec le nom Dupont SARL"* |
| | `batch_axelor_operations` | Exécute plusieurs créations/mises à jour en un appel | *"Mets à jour ces 5 articles en une seule fois"* |
| | `delete_axelor_record` | Supprime un enregistrement | *"Supprime la ligne de commande #108"* |
| | `execute_axelor_action` | Déclenche un bouton ou une action métier | *"Valide la commande client #19"* |
| **Audit & Historique**| `get_axelor_audit_log` | Affiche l'historique des modifications d'un champ | *"Qui a modifié le prix de cet article et quand ?"* |
| **GED & Documents** | `get_axelor_attachments` | Liste les fichiers attachés à un enregistrement | *"Quelles sont les pièces jointes de la facture #1 ?"* |
| | `upload_axelor_attachment` | Dépose un fichier local sur une fiche Axelor | *"Attache ce contrat PDF sur la fiche client"* |
| | `download_axelor_attachment` | Télécharge un fichier attaché sur votre ordinateur | *"Télécharge la pièce jointe #14 sur mon bureau"* |
| | `list_axelor_templates` | Découvre les modèles d'impression BIRT/Jasper/Email | *"Quels modèles d'impression existent pour les devis ?"* |
| | `generate_axelor_report` | Génère et télécharge un rapport PDF/Word/Excel | *"Génère le PDF de la facture #123 sur mon bureau"* |
| | `get_axelor_bpm_state` | Diagnostic des workflows BPMN et tâches actives | *"Quel est l'état du workflow de validation sur ce devis ?"* |

---

## Guide d'Installation

### Option A : Installation Assistée par l'IA (Recommandé)
Si vous ouvrez ce projet dans un IDE assisté (Cursor, Goose, Pi, Claude Code...) :
1. Téléchargez et décompressez le projet.
2. Indiquez à votre agent :
   > **"Lance le setup du projet"** (ou `/setup-assistant`)
3. L'agent configure l'environnement, compile et démarre le Bridge local.

---

### Option B : Installation Manuelle

#### 1. Prérequis & Compilation
- [Node.js](https://nodejs.org/) (v18+ ou v22 recommandée).
- Dans le répertoire du projet :
  ```bash
  npm install
  npm run build
  ```

#### 2. Déclaration dans le Client MCP
Ajoutez la configuration suivante dans votre client MCP (Cursor, Claude Desktop, etc.) :
```json
{
  "mcpServers": {
    "agentic-axelor": {
      "command": "node",
      "args": ["<CHEMIN_ABSOLU_DU_PROJET>/dist/index.js"]
    }
  }
}
```

#### 3. Démarrage du Bridge de Session
- **Sous Windows** : Exécutez **`start-bridge.bat`**.
- **Sous macOS / Linux** : Lancez `npm run bridge`.

#### 4. Synchronisation via l'Extension Navigateur
1. Dans Google Chrome (`chrome://extensions`), activez le **Mode développeur** et chargez le dossier [`extension/`](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/extension).
2. Connectez-vous à votre ERP Axelor.
3. Cliquez sur l'icône de l'extension puis sur **Synchroniser la session**.

Votre agent IA est immédiatement connecté à votre instance Axelor.

---

## Documentation Technique
- [Guide Développeur & CLI](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/docs/DEV_GUIDE.md)
- [Architecture & Protocoles](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/docs/ARCHITECTURE.md)
- [Arbres de Décision Opérateur](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/standard-index.md)
- [Cheatsheet API REST Axelor](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/docs/axelor-api-cheatsheet.md)