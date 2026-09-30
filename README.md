# AgenticAxelor

AgenticAxelor connecte un client compatible MCP à Axelor. Le serveur MCP fournit des outils pour explorer les menus et vues, consulter ou modifier des données et lancer des actions Axelor.

Le projet comprend trois éléments :

- un serveur MCP lancé par votre application d’IA ;
- un Bridge local sur `127.0.0.1:3210` ;
- une extension Chrome qui synchronise la session Axelor du navigateur avec le Bridge.

> L’extension synchronise uniquement la session : elle n’affiche pas de HUD dans les pages Axelor.

## Prérequis

- Node.js 22 et npm ;
- Chrome ou un navigateur Chromium ;
- un compte Axelor et un client compatible MCP.

## Installation

Clonez le dépôt avec son URL GitHub, puis installez les dépendances :

```bash
git clone https://github.com/<OWNER>/<REPOSITORY>.git
cd <REPOSITORY>
npm ci
```

Remplacez les valeurs entre chevrons par l’URL et le nom réels du dépôt.

## Configurer le serveur MCP

Copiez [mcp-config.example.json](mcp-config.example.json) dans la configuration de votre client MCP. Gardez une seule des deux entrées :

- `agentic-axelor` lance la version compilée ; construisez-la avec `npm run build` ;
- `agentic-axelor-dev` lance directement le code TypeScript.

Dans l’entrée conservée, remplacez `<ABSOLUTE_PATH_TO_PROJECT>` par le chemin absolu du projet et supprimez les variables d’identifiants Axelor si vous utilisez la session de l’extension. Sous Windows, utilisez `/` dans le chemin JSON, par exemple `C:/projets/AgenticAxelor`.

## Démarrer et synchroniser

1. Démarrez le Bridge depuis le dossier du projet et laissez-le ouvert :

   ```bash
   npm run bridge
   ```

   Sous Windows, vous pouvez aussi lancer `start-bridge.bat`.

2. Dans Chrome, ouvrez `chrome://extensions`, activez le **Mode développeur**, puis choisissez **Charger l’extension non empaquetée** et sélectionnez le dossier [`extension/`](extension/).
3. Connectez-vous à Axelor et rendez son onglet actif.
4. Ouvrez la popup AgenticAxelor, vérifiez le site affiché, puis cliquez sur **Synchroniser la session** et autorisez l’accès aux cookies si Chrome le demande.
5. Redémarrez ou rechargez la configuration MCP de votre client si nécessaire.

L’URL et le cookie de session sont transmis par l’extension puis enregistrés dans `.session.json`. Il n’est pas nécessaire de configurer `AXELOR_URL`, un nom d’utilisateur ou un mot de passe pour ce parcours. Ne partagez jamais le cookie ni le fichier `.session.json`.

L’extension utilise le port `3210`. Gardez cette valeur pour que le Bridge et l’extension puissent communiquer. Le fichier [`.env.example`](.env.example) ne sert qu’à configurer le port du Bridge ; en général, il n’est pas nécessaire de créer `.env`.

## Outils et précautions

Le serveur MCP propose des outils pour rechercher des menus, inspecter des vues, consulter des enregistrements, créer ou modifier des données, supprimer des enregistrements, lancer des actions et vérifier l’état de la session. Les outils de création, modification, suppression et exécution d’actions peuvent changer les données Axelor : utilisez-les avec un compte adapté.

La session enregistrée n’est pas validée auprès d’Axelor au moment de la synchronisation. Si Axelor la rejette, reconnectez-vous dans le navigateur et synchronisez-la à nouveau.

## Développement

```bash
npm ci
npm run build
```

Les autres commandes sont listées dans [package.json](package.json). Certaines exécutent des opérations Axelor ; vérifiez-les avant de les lancer. La CI vérifie l’installation, la compilation et les fichiers JSON sans se connecter à Axelor.

Documentation complémentaire : [guide développeur](.agents/docs/DEV_GUIDE.md), [architecture](.agents/docs/ARCHITECTURE.md), [API Axelor](.agents/docs/axelor-api-cheatsheet.md).