# AgenticAxelor

> Le connecteur MCP officiel pour accélérer le travail quotidien des équipes (Chefs de Projet, Développeurs, Consultants) sur l'ERP Axelor.

AgenticAxelor connecte directement votre assistant d’IA (Cursor, Claude Desktop, Goose, Pi, Claude Code, etc.) à votre instance Axelor en temps réel en exploitant votre session de travail active, de manière sécurisée et sans configuration complexe.

---

## Pourquoi AgenticAxelor au Quotidien ?

Conçu pour faire gagner un temps précieux aux **chefs de projet**, et **développeurs**, AgenticAxelor transforme votre IDE ou client IA en copilote ERP opérationnel :

1. **Introspection & Documentation Instantanée** :
   - Plus besoin de chercher dans le code source ou la console SQL : l'agent inspecte en 2 secondes les entités JPA, les listes de sélection (`MetaSelect`), les relations de clés étrangères (ERD) et les champs personnalisés créés dans le **Studio Axelor** (`attrs`).
2. **Moteur de Calcul en Temps Réel (Simulation `onChange`)** :
   - Testez et simulez les règles métier complexes (calcul des taxes, remises, devises, conditions de règlement) en direct avant toute validation ou enregistrement réel.
3. **GED & Génération de Documents Directs** :
   - Dépôt, listing et téléchargement de pièces jointes (DMS). Génération et enregistrement immédiat des devis, factures ou états de stocks aux formats **PDF, Word ou Excel** (BIRT / Jasper).
4. **Gain de Productivité & Diagnostics Rapides** :
   - Extraction de données à la volée (CSV/JSON), audit des modifications de champs (`get_axelor_audit_log`) et diagnostic de l'état des workflows BPMN sans navigation manuelle fastidieuse.

---

## Cas d'Usage Quotidiens par Profil

### Pour le Chef de Projet / Consultant Fonctionnel
- **Vérification de paramétrage** : Identifier rapidement les champs obligatoires d'un formulaire, les listes de choix actives ou l'arborescence des menus.
- **Assistance à la recette** : Créer des jeux de données de test cohérents avec simulation des règles de calcul en une seule demande.
- **Extraction ad-hoc** : Exporter en CSV les enregistrements filtrés pour les réunions de cadrage ou le reporting client.

### Pour le Développeur
- **Exploration du modèle de données** : Comprendre instantanément les clés étrangères et les relations parent/enfant sans ouvrir pgAdmin.
- **Inspection des vues & Studio** : Analyser la structure XML des formulaires, les grilles et les champs dynamiques Studio.
- **Tests d'actions & Mutations** : Déclencher des actions métier (`action-method`, `action-record`) et valider les flux de données directement depuis l'IDE.

---

## Capacités & Outils MCP (18 Fonctions Métier)

AgenticAxelor met à disposition de vos agents un jeu complet de 18 outils couvrant l'ensemble du cycle de vie ERP, sans restriction de module :

| Capacité Métier | Outils Inclus | Portée & Flexibilité Transverse |
| :--- | :--- | :--- |
| **Authentification & Session** | `sync_axelor_session` | Adopte de façon sécurisée la session connectée dans votre navigateur avec l'ensemble de vos habilitations métier. |
| **Introspection & Studio** | `search_axelor_models`<br>`inspect_axelor_model`<br>`inspect_axelor_selections`<br>`get_axelor_schema_relations`<br>`inspect_axelor_custom_fields` | Découverte dynamique de la base de données : entités JPA, dictionnaires de sélection (`MetaSelect`), graphe relationnel (ERD) et champs dynamiques configurés via le Studio Axelor (`attrs`). |
| **Navigation & Ergonomie** | `search_axelor_menu`<br>`inspect_axelor_view` | Exploration de l'arborescence des menus ERP et compréhension de la structure des vues (formulaires, grilles, onglets). |
| **Données & Extraction** | `query_axelor_data`<br>`fetch_axelor_record`<br>`export_axelor_data` | Recherche multicritère, pagination, tris, consultation ciblée d'enregistrements et exports volumineux au format CSV ou JSON. |
| **Règles Métier & Mutations** | `simulate_axelor_onchange`<br>`save_axelor_record`<br>`batch_axelor_operations`<br>`delete_axelor_record`<br>`execute_axelor_action`<br>`get_axelor_audit_log` | Simulation en temps réel des règles d'interface (`onChange`), exécution transactionnelle unitaire ou par lot (batch), déclenchement d'actions/boutons et traçabilité d'audit. |
| **GED, Rapports & Processus** | `get_axelor_attachments`<br>`upload_axelor_attachment`<br>`download_axelor_attachment`<br>`list_axelor_templates`<br>`generate_axelor_report`<br>`get_axelor_bpm_state` | Gestion documentaire (DMS), génération et téléchargement de rapports (PDF, Word, Excel via BIRT/Jasper) et diagnostic des workflows BPMN. |

---

## Sécurité & Bonnes Pratiques

> [!WARNING]
> **Sécurité des Données & Responsabilité** :
> - **Héritage des droits utilisateur** : L'agent utilise votre session et dispose de **l'ensemble de vos permissions**. Si vous êtes administrateur, il dispose des droits de création, modification et suppression.
> - **Simulation préalable** : Privilégiez les simulations (`simulate_axelor_onchange`) ou les requêtes de lecture avant d'exécuter des modifications en masse.
> - **Environnement recommandé** : Utilisez prioritairement une instance de **test / recette / staging** avant tout usage en environnement de production.
> - **Confidentialité de session** : Le fichier local `.session.json` contient votre cookie de session temporaire et ne doit pas être partagé. Il est exclu du versionnement Git par défaut.

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

## Usage Avancé : Workflows Multi-MCP & Agents Autonomes

En plus de l'usage interactif au quotidien, AgenticAxelor respecte le standard ouvert **Model Context Protocol (MCP)** et peut s'intégrer dans des chaînes de traitement automatisées :

```mermaid
graph TD
    User["Utilisateur / Pipeline d'Automatisation"] --> Orchestrator["Agent / Orchestrateur (Claude Code / LangGraph / Cursor)"]
    
    Orchestrator -->|Introspection & Données ERP| MCP_Axelor["MCP AgenticAxelor\n(Devis, Factures, Stocks, GED)"]
    Orchestrator -->|Gestion de tickets & Projets| MCP_Redmine["MCP Gestion de Projet\n(Redmine)"]
    Orchestrator -->|Bureautique & Stockage Cloud| MCP_Google["MCP Espace Collaboratif\n(Drive, Gmail, Docs, Sheets)"]
```

- **Scénarios transverses** : Rapprochement automatique de temps passés (Redmine), synchronisation de tableaux de bord Cloud, traitement automatisé de pièces jointes.
- **Frameworks compatibles** : *LangGraph*, *CrewAI*, *AutoGen*, *LlamaIndex*, *n8n* ou scripts autonomes en Python / TypeScript.

---

## Documentation Technique
- [Guide Développeur & CLI](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/docs/DEV_GUIDE.md)
- [Architecture & Protocoles](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/docs/ARCHITECTURE.md)
- [Arbres de Décision Opérateur](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/standard-index.md)
- [Cheatsheet API REST Axelor](file:///c:/Users/Pablo/Documents/Alter-si/AgenticAxelor/.agents/docs/axelor-api-cheatsheet.md)