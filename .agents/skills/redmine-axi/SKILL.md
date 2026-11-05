---
name: redmine-axi
description: Operations de lecture et recherche sur les tickets Redmine Alter-SI via CLI redmine-axi.
---

# Redmine CLI Operations

CLI de consultation et gestion Redmine pour agents.

## Variables d'environnement
- `REDMINE_URL` : Base URL Redmine (defaut: https://redmine.alter-si.fr)
- `REDMINE_API_KEY` : Cle API utilisateur

## Lecture de tickets
```bash
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
```

Pour les ecritures, consulter obligatoirement `references/writing.md`.
