# Ciblage Axelor MCP

- Identifie la destination depuis la demande et le contexte ; si sa correspondance est inconnue, consulte `list_axelor_sessions` (noms et URL). Ne suppose pas que l'unique session active est la bonne.
- Destination ambiguë : demande une précision. Session absente ou inactive : demande sa synchronisation ou son activation dans l'extension.
- Passe explicitement `sessionId` à chaque outil ciblé, navigateur inclus. Conserve la cible pendant la tâche ; revalide si elle ou le contexte change.
- Session active ≠ session valide ≠ autorisation d'écrire : applique les règles de validation et d'autorisation de l'index opérateur.
- Le serveur accepte l'unique session active sans identifiant par compatibilité ; plusieurs sessions actives sans cible sont refusées. `sync_axelor_session` est historique et non ciblé : il ne sélectionne pas la destination des appels suivants.
- Ne divulgue jamais les cookies dans le chat ou la configuration.
- A browser-synchronized MCP session and an n8n credential are separate authentication channels: MCP admin access does not prove n8n access. Test n8n-to-target access using an authorized inactive read-only workflow and a sanitized result; never transfer the workstation session cookie.
- An n8n credential may be shared by several workflows: updating its contents changes their effective authentication without retargeting their URLs. Inspect referencing workflows and domains before changing it; use a separate credential per environment when possible. A credential-reference name or successful MCP login is not proof of valid n8n authentication.
