![Capture du graphe contextuel d'AgenticAxelor](.agents/docs/2026-11-06%2013_51_20-.png)

# AgenticAxelor

**Le second cerveau d'Alter-si : un environnement de travail augmenté pour les assistants IA.**

AgenticAxelor transforme votre assistant IA compatible (Claude, Goose, Cursor, Pi) en un collaborateur numérique opérationnel. Il réunit le contexte métier de notre entreprise, des méthodes de travail éprouvées et des connexions directes vers nos logiciels quotidiens (ERP, gestion de tickets, automatisation, bureautique).

Ce projet ne se résume pas à un ensemble de skills et de connecteurs. Les skills et les connecteurs fournissent uniquement des outils et des actions ; AgenticAxelor apporte le cadre d'analyse, les règles de sécurité, le contexte métier et la mémoire d'apprentissage nécessaires pour comprendre une demande complexe, fiabiliser les interventions et accomplir vos missions sans réinventer la roue ni inventer de règles.

---

## Un second cerveau personnalisé qui apprend avec vous

Contrairement aux assistants génériques qui oublient tout à chaque nouvelle session, AgenticAxelor a été conçu pour grandir et se spécialiser au fil de vos tâches réelles.

Imaginez un collègue qui vous assiste au quotidien :
- Au départ, il dispose du socle commun d'Alter-si : il connaît nos outils, nos conventions et nos méthodes officielles.
- Au fil des semaines, il apprend de vos interventions : chaque difficulté résolue, chaque anomalie contournée et chaque règle d'arbitrage sur un dossier client est mémorisée.
- Dès la tâche suivante, il vous alerte en amont : *"Attention, sur ce modèle ou ce client précis, nous avions rencontré telle anomalie ; voici la procédure validée."*

### Le socle partagé et la mémoire individuelle

Pour permettre à chaque collaborateur de développer son propre cerveau spécialisé sans perturber le reste de l'équipe, le système repose sur une distinction claire :

1. **Le socle commun d'entreprise (partagé)** : Il contient les connecteurs logiciels, les règles de sécurité fondamentales, les guides de référence et les grands playbooks de mission validés. Tout le monde en bénéficie au sein de l'entreprise.
2. **La mémoire d'apprentissage locale (personnelle et privée)** : L'historique de vos tâches, les pièges rencontrés sur vos clients assignés et vos préférences de travail sont enregistrés exclusivement en local sur votre machine (`Work_data/`). Ils ne sont jamais partagés sur le dépôt commun, évitant ainsi tout conflit de version et garantissant la stricte confidentialité des données clients.

Votre assistant devient ainsi un expert dédié à votre activité propre, tout en restant ancré dans les standards de l'entreprise.

---

## Organisation du Système

L'environnement s'articule autour de quatre composantes interconnectées :

1. **Règles et orientation sémantique** (`.agents/rules/` et index de domaine) : Dirigent l'assistant vers les sources documentaires fiables et imposent les garde-fous opérationnels (vérification avant action, absence d'extrapolation, interdiction des écritures non autorisées).
2. **Connecteurs opérationnels** : Donnent à l'assistant la capacité d'interroger et d'agir sur nos systèmes d'information, avec vos droits effectifs.
3. **Compétences et missions** (`.agents/skills/` et `.agents/missions/`) : Formalisent des procédures de travail réutilisables, de la simple manipulation de données à des orchestrations complètes de bout en bout (cadrage de besoin, spécification fonctionnelle, recette, reprise de données).
4. **Mémoire synaptique locale** : Boucle fermée qui enregistre les leçons concrètes de chaque intervention terminée pour les réinjecter automatiquement dès la prochaine étape de cadrage.

---

## Les Connecteurs Disponibles

Sans connecteur, l'assistant raisonne uniquement sur les règles et les connaissances locales du dépôt. Lorsqu'ils sont activés, les connecteurs lui permettent de croiser ce contexte avec les données réelles de l'entreprise :

| Système | Rôle et Utilité | Modalité Technique |
| :--- | :--- | :--- |
| **Axelor ERP** | Exploration des modèles, vues, données, imports et exécution d'actions métier autorisées. | Serveur MCP inclus dans ce dépôt. Authentification via session navigateur synchronisée. |
| **Redmine** | Consultation des tickets, suivi des projets, préparation de comptes rendus et rédaction de notes. | Connecteur CLI dédié (`redmine-axi`). |
| **Google Workspace** | Lecture et création de documents, classeurs de travail et dossiers partagés (Docs, Sheets, Drive). | Serveur MCP Google Workspace externe. |
| **n8n** | Consultation des workflows, diagnostic d'exécutions en erreur et accompagnement sur les automatisations. | Outil CLI dédié (`n8n-axi`). |

L'accès à chaque outil dépend des permissions et des identifiants propres à chaque utilisateur. La présence d'une consigne ou d'un connecteur ne confère aucun droit supplémentaire sur les systèmes distants.

---

## Comment le Cerveau Apprend au Quotidien

L'apprentissage ne repose pas sur une boîte noire incontrôlée, mais sur un cycle méthodique et traçable en quatre temps :

```
[ Étape 1 : Le Cadrage ]
L'assistant prend connaissance de votre demande ou d'un ticket Redmine.
Il interroge d'abord sa mémoire locale d'antécédents pour vérifier si un cas similaire a déjà été résolu.
Si un piège est connu sur ce périmètre, il vous en informe immédiatement.
       │
       ▼
[ Étape 2 : L'Intervention ]
Vous travaillez avec l'assistant en vous appuyant sur les connecteurs réels et les méthodes du projet.
Les actions sensibles nécessitent systématiquement votre validation explicite.
       │
       ▼
[ Étape 3 : La Capitalisation Locale ]
En fin de travail, vous demandez à l'assistant de réaliser la rétrospective de la tâche.
Il produit votre compte rendu et génère une micro-fiche de mémoire locale (le problème exact, le piège évité, la solution validée).
Cette fiche est indexée sur votre poste et prête pour vos prochaines interventions.
       │
       ▼
[ Étape 4 : L'Élévation vers le Socle Commun ]
Lorsque des interventions répétées font émerger une méthode robuste ou un piège récurrent, l'assistant vous aide à consolider ces acquis.
Les enseignements d'intérêt général sont alors promus dans le socle partagé (nouvelle règle de connaissance, skill ou mission) : ce que vous avez appris sur le terrain bénéficie immédiatement à toute l'équipe.
```

---

## Démarrage et Installation

L'installation et la configuration de l'environnement sont entièrement assistées. Vous n'avez pas besoin de manipuler manuellement les fichiers de configuration ou les scripts d'arrière-plan.

Pour démarrer, ouvrez ce dossier dans votre assistant IA (Goose, Claude Desktop, Cursor, etc.) et demandez simplement dans le chat :

> **« Lance le setup du projet »** (ou invoquez directement le skill `/setup-assistant`).

L'assistant prendra en charge les opérations suivantes :
1. Contrôle des prérequis de votre poste (Node.js, compilation locale du serveur).
2. Démarrage du Bridge local de communication.
3. Guidage pas-à-pas pour installer l'extension de session navigateur.
4. Vérification et connexion des accès aux différents services (Axelor, Redmine, Google Workspace, n8n).
5. Initialisation de votre profil utilisateur local.

---

## Sécurité et Maîtrise des Données

- **Principe du moindre privilège** : L'assistant n'agit qu'avec les droits de votre propre compte sur chaque plateforme.
- **Contrôle humain strict** : Aucune modification en base de données, publication Redmine ou modification de fichier critique n'est effectuée sans votre accord explicite.
- **Étanchéité des mémoires** : Vos historiques de travail, pièces traitées et fiches d'apprentissage restent cantonnés à votre poste de travail. Rien ne transite par le dépôt partagé sans décision volontaire de capitalisation d'équipe.
- **Environnements de test** : Pour toute opération à risque ou volumineuse, les environnements de recette ou de préproduction doivent être privilégiés.

---

## Ressources Complémentaires

Pour approfondir les règles et le fonctionnement technique selon votre profil :

- [Index Opérateur Axelor](.agents/standard-index.md) : Règles de navigation, de requêtage et de validation ERP.
- [Index des Missions](.agents/missions-index.md) : Catalogue des playbooks d'orchestration métier de bout en bout.
- [Index Développeur](.agents/dev-index.md) : Architecture logicielle, protocoles internes et directives d'ingénierie.
- [Architecture du Connecteur](.agents/docs/ARCHITECTURE.md) : Schéma des flux de session entre le Bridge, l'extension et le serveur MCP.
