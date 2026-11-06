# Redmine Writing Operations

Regles strictes pour les ecritures dans Redmine :

1. Ne jamais modifier un ticket sans autorisation explicite de l'utilisateur.
2. Toujours relire le ticket avant modification (`node scripts/redmine-axi.cjs issue view <id>`).
3. Appliquer uniquement les modifications demandees.

```bash
# Ajouter une note / commentaire
node scripts/redmine-axi.cjs issue update <id> --notes "Texte du commentaire"

# Changer le statut
node scripts/redmine-axi.cjs issue update <id> --status <status_id>
```
