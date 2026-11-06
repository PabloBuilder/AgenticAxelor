![Capture du graphe contextuel d'AgenticAxelor](.agents/docs/2026-11-06%2013_51_20-.png)

# AgenticAxelor

**Le second cerveau d'Alter-si : un environnement de travail pour les assistants et agents IA.**

AgenticAxelor est un environnement de travail que vous utilisez avec un assistant IA compatible. Il rassemble les connaissances, les méthodes et les connexions utiles aux équipes Alter-si pour vous aider à comprendre une demande, retrouver les bonnes informations et réaliser vos missions.

Imaginez un collègue numérique à qui vous pouvez donner une mission : il dispose de repères sur notre métier, sait où chercher les informations pertinentes et peut, lorsque les outils sont connectés et que vos droits le permettent, travailler avec Axelor, Redmine ou d'autres services. **Vous pouvez aussi enrichir cet environnement pour l'adapter à votre propre quotidien** : lui apporter des connaissances, formaliser une méthode récurrente ou préparer une automatisation.

Ce n'est donc pas seulement un MCP. Un serveur MCP est un connecteur qui donne à l'assistant accès à des outils ; le second cerveau associe ces connexions à un contexte métier, à des méthodes de travail et à vos instructions. Chaque connexion doit être configurée et reste soumise aux droits et autorisations applicables.

## Comment ça fonctionne

Une demande est prise en charge par un assistant compatible qui s'appuie sur les ressources adaptées à la mission :

1. **Les règles et les index** orientent l'assistant vers le contexte pertinent et les précautions à respecter.
2. **Les connaissances** apportent des repères métier et techniques.
3. **Les compétences et les missions** décrivent des méthodes de travail réutilisables.
4. **Les connecteurs** donnent accès aux informations et aux actions disponibles dans les outils reliés.
5. **L'utilisateur garde le contrôle**, notamment pour les actions nécessitant une autorisation ou une confirmation.

Ces ressources forment un graphe contextuel : elles sont liées entre elles et peuvent être mobilisées en fonction de la tâche. Ce graphe est une organisation de fichiers, de références et de règles, pas une mémoire qui apprend automatiquement. Il peut évoluer avec les besoins, les connaissances et les outils d'Alter-si.

La capture en haut de page illustre les relations entre les ressources du projet à un instant donné. Les connexions aux outils externes dépendent de leur configuration et des accès disponibles.

Selon l'assistant utilisé et ses capacités, une mission peut être réalisée par un agent ou déléguée à plusieurs agents. La création et l'orchestration de ces agents dépendent de l'environnement qui les exécute.

## Un second cerveau qui grandit avec vous

Vous n'avez pas besoin de tout construire avant de commencer. Partez d'une tâche que vous réalisez régulièrement et demandez à l'assistant de vous aider à capitaliser ce qui lui manque :

1. **Transmettre vos repères** : documentez, par exemple, le vocabulaire d'un projet, les contrôles à effectuer ou les sources de référence. L'assistant pourra s'y référer lors des missions pertinentes.
2. **Formaliser votre méthode** : transformez une suite d'étapes répétitives en compétence ou en mission réutilisable, par exemple pour préparer un compte rendu ou qualifier un besoin.
3. **Relier vos outils** : configurez les connecteurs nécessaires pour croiser cette méthode avec les informations auxquelles vous avez accès.
4. **Faire évoluer ou automatiser** : testez le résultat, corrigez les instructions et identifiez les étapes qui pourraient être automatisées, par exemple avec n8n. La mise en place et l'exécution d'une automatisation nécessitent les configurations et autorisations appropriées.

Vous pouvez demander à l'assistant de vous accompagner dans ces améliorations : « Aide-moi à créer une méthode réutilisable pour préparer mes comptes rendus à partir de mes notes ». Précisez vos attentes, vérifiez le résultat et décidez de ce qui doit être conservé ou partagé. L'environnement ne retient pas automatiquement chaque échange : les connaissances utiles doivent être enregistrées et reliées aux ressources pertinentes.

### Les skills pour capitaliser et enrichir le cerveau

Un **skill** est une méthode enregistrée dans le projet : il indique à l'assistant quand et comment mener une tâche, quels éléments utiliser et quels contrôles effectuer. Certains peuvent être mobilisés selon la demande ; d'autres doivent être demandés explicitement. Leur disponibilité dépend de votre assistant.

Pour faire progresser votre environnement à partir du travail réalisé, trois skills sont particulièrement utiles :

1. **[Project retrospective](.agents/skills/project-retrospective/SKILL.md) : garder une trace d'une tâche terminée.** Demandez explicitement une rétrospective en fin de travail. L'assistant utilise la discussion et les fichiers liés à la tâche pour créer une archive locale dans `Work_data/Task History/` : démarche réellement suivie, difficultés, enseignements, pièces disponibles et contrôles. Il prépare aussi une feuille de route distincte des pistes d'automatisation, sans les exécuter. Les informations manquantes sont signalées et les secrets exclus de l'archive.
2. **[Context architecture maintainer](.agents/skills/context-architecture-maintainer/SKILL.md) : tirer des enseignements réutilisables.** Demandez-lui d'examiner une expérience ou les sources pertinentes, notamment une archive que vous lui indiquez. Il distingue les faits vérifiés des hypothèses, recherche ce qui existe déjà dans le contexte et propose où placer les connaissances durables : compléter une ressource, améliorer son référencement ou créer une ressource distincte. Il ne transfère pas automatiquement tout l'historique dans le cerveau : les changements proposés nécessitent votre autorisation.
3. **[Skill creator](.agents/skills/skill-creator/SKILL.md) : transformer une méthode en compétence réutilisable.** Si une démarche revient souvent, demandez à l'assistant de vous aider à créer ou améliorer un skill. Celui-ci structure les étapes, les ressources et les vérifications, puis prévoit sa validation. Selon l'environnement, la création ou la modification peut passer par une proposition à appliquer ou par le processus de modification du dépôt.

Par exemple, après un import complexe, demandez : « Fais la rétrospective de cette tâche ». Plus tard, indiquez l'archive à l'assistant : « Analyse cette rétrospective et propose les enseignements à intégrer au contexte ». Après examen et autorisation des changements utiles, vous pouvez lui demander de formaliser la procédure récurrente en skill. **L'historique conserve les faits d'un travail particulier ; le cerveau conserve les connaissances et méthodes pertinentes pour les prochaines missions.**

Les ressources partagées peuvent bénéficier à d'autres membres de l'équipe ; vérifiez leur portée et évitez d'y enregistrer des informations sensibles ou propres à un client sans précaution. Les capacités de personnalisation et de partage dépendent aussi de votre environnement et de vos droits sur les fichiers.

## Exemples d'utilisation

- **Préparer une spécification** : partir de notes d'atelier, qualifier le besoin, consulter les références Axelor pertinentes et préparer un document structuré pour les développeurs. Les vérifications sur l'instance et la publication éventuelle dépendent des connexions et autorisations disponibles.
- **Comprendre un ticket** : retrouver son contexte, son objectif et les actions attendues, à partir de Redmine lorsque le connecteur est disponible.
- **Explorer Axelor** : rechercher un modèle, comprendre un écran, consulter des données ou préparer un export avec le connecteur Axelor.
- **Suivre une intervention** : préparer un compte rendu et un brouillon de réponse, avec validation avant publication lorsque nécessaire.
- **Analyser une automatisation** : s'appuyer sur les connaissances et les outils n8n disponibles pour comprendre un workflow ou diagnostiquer une exécution.
- **Construire votre propre méthode** : expliquer à l'assistant comment vous préparez une intervention, puis formaliser ensemble une trame et des contrôles à réutiliser.

## Les connecteurs

Sans connecteur, un assistant peut utiliser les ressources locales accessibles dans le projet. Il ne peut pas pour autant consulter les systèmes externes ou y agir. Avec les connecteurs configurés et les accès nécessaires, il peut combiner le contexte du projet avec les informations et outils de travail.

| Outil | Utilité | Disponibilité |
| :--- | :--- | :--- |
| Axelor | Explorer les modèles, écrans et données ; produire des exports et documents ; effectuer les actions autorisées. | Serveur MCP inclus dans ce dépôt. Session navigateur à synchroniser. |
| Redmine | Consulter les tickets et préparer ou effectuer les opérations autorisées. | Connecteur externe à configurer dans l'environnement utilisé. |
| Google Workspace | Consulter ou utiliser les services Google disponibles, selon les besoins et les droits. | Serveur MCP externe à configurer et autoriser. |
| n8n | Consulter les workflows et les exécutions, et accompagner les opérations autorisées. | Outil externe à installer et configurer. |

La présence d'une instruction ou d'un connecteur ne garantit ni l'accès à un service ni le droit d'y modifier des données. Les capacités réellement disponibles dépendent de la configuration et des permissions de chaque utilisateur.

## Sécurité et contrôle

- Les actions dans Axelor utilisent la session et les droits de l'utilisateur connecté. Le fichier local `.session.json` contient des données de session sensibles et ne doit pas être partagé.
- Les accès aux autres services dépendent de leurs propres configurations et permissions.
- Les règles du projet demandent de vérifier les informations nécessaires avant une modification et de contrôler le résultat après l'action.
- Les actions sensibles, destructives ou susceptibles de communiquer à l'extérieur nécessitent les autorisations et confirmations applicables.
- Pour les essais à risque, privilégier un environnement de recette lorsque c'est possible.

## Bien démarrer

### 1. Ouvrir l'environnement de travail

Ouvrez le dossier du projet dans votre assistant compatible. Le fichier [`AGENTS.md`](AGENTS.md) et les ressources du dossier [`.agents`](.agents/) orientent l'assistant vers les règles, connaissances et compétences adaptées à la demande.

Les assistants ne prennent pas tous en charge les mêmes mécanismes de contexte, de compétences ou de délégation. Vérifiez la configuration de celui que vous utilisez.

### 2. Connecter les outils utiles à votre activité

Configurez les connecteurs nécessaires dans votre assistant et vérifiez vos accès. Les connecteurs Redmine, Google Workspace et n8n sont externes au serveur MCP Axelor fourni par ce dépôt. Leur disponibilité dépend de votre poste, de votre client et de vos autorisations.

Pour Axelor, suivez les étapes ci-dessous. L'installation du connecteur Axelor ne configure pas automatiquement les autres services.

### 3. Installer le connecteur Axelor

#### Installation guidée avec Goose

1. Téléchargez et décompressez le projet, puis ouvrez son dossier dans Goose.
2. Demandez dans le chat : « Lance le setup du projet » ou utilisez `/setup-assistant` si cette commande est disponible.
3. Suivez les instructions de l'assistant pour préparer l'environnement et démarrer le Bridge local.
4. Chargez l'extension Chrome depuis le dossier `extension/`, puis synchronisez votre session depuis la page Axelor.

L'extension permet d'activer, désactiver ou supprimer les sessions enregistrées. Une session active n'est pas nécessairement encore valide : resynchronisez-la si nécessaire.

Les outils MCP Axelor acceptent un `sessionId`. Utilisez `list_axelor_sessions` pour obtenir les identifiants. Sans identifiant, l'unique session active est sélectionnée ; si aucune ou plusieurs sessions sont actives, la demande est refusée.

### Navigateur expérimental

Pour les cas nécessitant l'interface graphique, les outils navigateur expérimentaux utilisent Chromium. Installez-le une fois avec `npm run browser:install`. Cette installation est facultative pour les autres outils Axelor. Privilégiez les outils Axelor habituels lorsqu'ils répondent au besoin.

Chaque session dispose d'un navigateur isolé. Après modification de son cookie, rouvrez ce navigateur. La position de la fenêtre peut être définie avant le démarrage du serveur MCP avec `AXELOR_BROWSER_WINDOW_POSITION`, au format `x,y`. Les tests navigateur locaux se lancent avec `npm run test:browser`.

Pour les interactions, cibler par rôle et nom exact ou, si nécessaire, par libellé, texte indicatif ou titre. Une zone identifiable par rôle et nom permet de limiter l'observation et l'action à une modale ou à un panneau ; si la cible ou la zone reste ambiguë, l'outil s'arrête. Les listes personnalisées peuvent nécessiter l'ouverture du composant puis un clic sur une option ; `select` concerne les listes HTML natives. En cas d'erreur après une interaction, vérifier l'état avant toute nouvelle tentative : un clic effectué n'établit pas la réussite métier. Certains champs ou panneaux sans repère accessible restent difficiles à cibler.

## Pour aller plus loin

- [Index opérateur Axelor](.agents/standard-index.md) : choix des ressources et précautions pour les opérations ERP.
- [Index développeur](.agents/dev-index.md) : repères pour maintenir et faire évoluer le projet.
- [Architecture du connecteur Axelor](.agents/docs/ARCHITECTURE.md) : serveur MCP, Bridge et extension.
- [Guide développeur et CLI](.agents/docs/DEV_GUIDE.md).
- [Référence API REST Axelor](.agents/docs/axelor-api-cheatsheet.md).
