# Reprise et rapprochement de données Axelor

## Préparer en lecture seule

1. Définir et confirmer l'instance cible, le compte, les filtres, la date, le périmètre métier et l'inclusion ou non des archivés. Comparer des exports uniquement après avoir vérifié l'équivalence de leur périmètre et de leurs droits d'accès. Des différences entre environnement, compte ou moment peuvent expliquer des écarts sans en prouver la cause.
2. Inspecter les modèles et relations nécessaires. Distinguer ID interne, référence métier et libellé ; ne jamais présumer que les IDs correspondent entre production et recette. Valider la règle métier avant de déduire une association à partir d'une relation technique.
3. Préserver les associations et valeurs existantes sauf instruction explicite contraire. Isoler les clés absentes, les correspondances multiples, les doublons, les données incohérentes et les lignes hors périmètre ; ne pas choisir un candidat ambigu. Éviter d'exporter les lignes inchangées avec une valeur vide susceptible d'écraser l'existant.
4. Préparer les valeurs avant/après, les raisons, les exclusions et les comptages. Vérifier les IDs et références sur la cible ; contrôler les collisions à la fois dans les propositions et parmi les données hors lot, en tenant compte du périmètre des archivés. Signaler toute couverture incomplète.

## Contrôler après import

- Identifier le fichier **réellement importé**, son environnement et son périmètre ; le fichier préparé seul ne prouve pas ce qui a été exécuté.
- Examiner l'historique et les logs disponibles, puis comparer les valeurs attendues aux valeurs relues sur la cible, par identifiant vérifié. Classer chaque ligne en conforme, différente, manquante ou non vérifiable ; contrôler également les champs à préserver et les collisions quand c'est pertinent.
- Un comptage d'exceptions restantes, un statut de succès ou un hash ne prouvent pas à eux seuls la justesse, l'exhaustivité ou l'absence d'effets de bord. Rapporter les preuves et leurs limites, distinguer recette et production.

## Sécurité

La préparation et les lectures n'autorisent ni import ni autre écriture. Exiger une autorisation explicite pour le périmètre et l'environnement avant toute mutation ; relire l'état courant et traiter les changements concurrents. Ne pas supposer qu'une relance est idempotente ni qu'un retour arrière existe ou fonctionne sans test. Les exemples des tâches #4023, #5264 et #5691 sont des observations situées, pas des règles métier universelles.
