---
name: redmine-axi
description: Operations de lecture et recherche sur les tickets Redmine Alter-SI via CLI redmine-axi.
---

# Redmine CLI Operations

CLI de consultation et gestion Redmine pour agents. Depuis la racine du dépôt, utiliser `node scripts/redmine-axi.cjs` : aucun lanceur Pi ni modification du PATH n'est nécessaire. La présence du skill ne prouve pas que la connexion est valide.

## Variables d'environnement
- `REDMINE_URL` : Base URL Redmine (defaut: https://redmine.alter-si.fr)
- `REDMINE_API_KEY` : Cle API utilisateur

## Lecture de tickets
```bash
# Voir un ticket complet avec son historique
node scripts/redmine-axi.cjs issue view <id> --notes

# Voir le ticket au format JSON brut
node scripts/redmine-axi.cjs issue view <id> --json

# Lister les tickets recents
node scripts/redmine-axi.cjs issue list --limit 20

# Lister les tickets assignes a soi-meme
node scripts/redmine-axi.cjs issue list --assigned me

# Lister les projets
node scripts/redmine-axi.cjs project list
```

Pour les ecritures, consulter obligatoirement `references/writing.md`.
