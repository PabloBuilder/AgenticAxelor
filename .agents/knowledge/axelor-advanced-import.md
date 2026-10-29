# Import avancé graphique Axelor

## Diagnostic en lecture

1. Confirmer l'instance, la version, la configuration d'import et le fichier réellement utilisé. Inspecter les champs et leur association aux colonnes avant de proposer une modification ; distinguer les lignes associées au fichier des champs ajoutés manuellement.
2. Dans les essais du ticket #5691, `columnTitle` et `isMatchWithFile` permettaient d'identifier l'association à une colonne. Vérifier leur signification et leur état dans la configuration courante : ces observations ne garantissent pas le comportement de toutes les versions.
3. Distinguer association de colonne et expression. Dans le cas étudié, `$` représentait la valeur source ; écrire le nom d'une colonne comme expression n'équivalait pas à l'associer. Certaines variantes n'ont pas été validées isolément : les tester avant toute conclusion générale.
4. Vérifier les critères de recherche : pour une mise à jour, cibler l'identité existante, pas les nouvelles valeurs à appliquer. Dans #5691, rechercher également sur les valeurs futures empêchait de retrouver l'enregistrement tel qu'il était avant modification.
5. Une trace d'historique ou un statut « Validé » ne prouvent pas à eux seuls qu'une action d'import a été exécutée ni que les valeurs ont changé. Examiner les logs disponibles et relire les enregistrements attendus ; si aucune donnée ne change, diagnostiquer la configuration et l'action réellement exécutée avant toute relance.

## Limites et sécurité

Ces constats concernent l'import avancé graphique observé dans #5691 ; ne pas les attribuer à l'import classique CSV/XML. Ne pas modifier une configuration ni lancer ou relancer un import sans autorisation explicite. Vérifier les IDs, l'environnement et le périmètre, y compris les archivés ; tester d'abord sur un petit lot autorisé et comparer les valeurs avant/après. Ne pas présumer qu'une reprise est idempotente ou qu'un retour arrière existe.
