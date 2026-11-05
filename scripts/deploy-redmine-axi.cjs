const fs = require('fs');
const path = require('path');
const os = require('os');

const homeDir = os.homedir();
const binDir = path.join(homeDir, '.pi', 'agent', 'bin');
const skillDir = path.join(homeDir, '.pi', 'agent', 'skills', 'redmine-axi');
const skillRefDir = path.join(skillDir, 'references');

// 1. Ensure directories exist
fs.mkdirSync(binDir, { recursive: true });
fs.mkdirSync(skillRefDir, { recursive: true });

// 2. Deploy binary files
const sourceJs = path.join(__dirname, 'redmine-axi.cjs');
const targetJs = path.join(binDir, 'redmine-axi.cjs');
const targetCmd = path.join(binDir, 'redmine-axi.cmd');
const targetSh = path.join(binDir, 'redmine-axi');

fs.copyFileSync(sourceJs, targetJs);

const cmdContent = `@echo off\r\nnode "%~dp0redmine-axi.cjs" %*\r\n`;
fs.writeFileSync(targetCmd, cmdContent, 'utf8');

const shContent = `#!/bin/sh\nexec node "$(dirname "$0")/redmine-axi.cjs" "$@"\n`;
fs.writeFileSync(targetSh, shContent, { encoding: 'utf8', mode: 0o755 });

console.log(`[OK] Binaire CLI installe dans ${binDir}`);

// 3. Deploy skill documentation
const skillMdContent = `---
name: redmine-axi
description: Operations de lecture et recherche sur les tickets Redmine Alter-SI via CLI redmine-axi.
---

# Redmine CLI Operations

CLI de consultation et gestion Redmine pour agents.

## Variables d'environnement
- \`REDMINE_URL\` : Base URL Redmine (defaut: https://redmine.alter-si.fr)
- \`REDMINE_API_KEY\` : Cle API utilisateur

## Lecture de tickets
\`\`\`bash
# Voir un ticket complet avec son historique
redmine-axi issue view <id> --notes

# Voir le ticket au format JSON brut
redmine-axi issue view <id> --json

# Lister les tickets recents
redmine-axi issue list --limit 20

# Lister les tickets assignes a soi-meme
redmine-axi issue list --assigned me

# Lister les projets
redmine-axi project list
\`\`\`

Pour les ecritures, consulter obligatoirement \`references/writing.md\`.
`;

fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent, 'utf8');

const writingMdContent = `# Redmine Writing Operations

Regles strictes pour les ecritures dans Redmine :

1. Ne jamais modifier un ticket sans autorisation explicite de l'utilisateur.
2. Toujours relire le ticket avant modification (\`redmine-axi issue view <id>\`).
3. Appliquer uniquement les modifications demandees.

\`\`\`bash
# Ajouter une note / commentaire
redmine-axi issue update <id> --notes "Texte du commentaire"

# Changer le statut
redmine-axi issue update <id> --status <status_id>
\`\`\`
`;

fs.writeFileSync(path.join(skillRefDir, 'writing.md'), writingMdContent, 'utf8');

console.log(`[OK] Skill installe dans ${skillDir}`);
