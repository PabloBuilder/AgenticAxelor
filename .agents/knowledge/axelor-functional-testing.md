# Recette fonctionnelle Axelor

1. Identifier l'instance, l'objectif, la règle à vérifier, les préconditions et les résultats attendus. Séparer les exigences confirmées des hypothèses ; faire valider les ambiguïtés métier avant de conclure.
2. Construire une matrice de cas discriminants : valeur renseignée, valeur vide et valeur différente de la valeur par défaut quand cela permet d'identifier la source. Si deux sources ont la même valeur, observer cette valeur dans le résultat ne prouve pas laquelle a été utilisée.
3. Identifier les données de test par référence métier et ID technique, sans les confondre. Inspecter la vue, les champs, les sélections et les conditions nécessaires avant d'indiquer une action ou un libellé. Ne pas supposer qu'un enregistrement ou une action est modifiable dans un statut donné.
4. Si utile et disponible, simuler les changements dépendants pour comprendre les valeurs calculées. Une simulation n'est ni une sauvegarde ni une preuve de l'état final. Dans le cas #3637, un changement de tiers livré pouvait réinitialiser l'adresse : vérifier les dépendances et l'ordre des actions sur l'instance cible, sans généraliser ce comportement.
5. Pour une action explicitement autorisée, relever les valeurs pertinentes immédiatement avant son exécution, puis relire le résultat et comparer aux attentes. Distinguer les tests effectivement observés, ceux rapportés par l'utilisateur et ceux non vérifiables ; ne pas déduire une validation en production d'un test en recette.

La préparation et la simulation ne donnent pas permission de modifier, créer ou supprimer des données. Toute action sensible ou écriture exige l'autorisation appropriée ; prévoir les effets de bord et les possibilités de retour arrière sans les présumer.
