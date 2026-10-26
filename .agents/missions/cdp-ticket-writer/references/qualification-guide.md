# Guide de Qualification du Besoin (CDP / Solution Architect)

Ce guide définit les questions obligatoires à trancher avant de rédiger une spécification allégée.

## 1. La Grille des 8 Contrôles

Avant toute rédaction finale, passer cette grille en revue face aux notes brutes :

| Axe de contrôle | Question clé | Réflexe Axelor |
| :--- | :--- | :--- |
| **1. Objectif Métier** | Quel est le gain mesurable pour l'utilisateur ? | Distinguer le problème réel du symptôme. |
| **2. Standard vs Spécifique** | Le standard AOS fait-il déjà une partie de la demande ? | Vérifier dans `reference-sources/axelor-open-suite/` via `Axelor-index.md`. Ne jamais re-spécifier ce qu'AOS fait nativement. |
| **3. Vues et Écrans** | Quelles vues sont créées, étendues ou consultées ? | Citer le nom technique exact des vues (ex. `sale-order-form`). |
| **4. Parcours Utilisateur** | Qui fait quoi, dans quel ordre, depuis quel bouton ? | Formuler des actions observables : « L'utilisateur clique sur... ». |
| **5. Exemples Chiffrés** | A-t-on au moins un exemple concret avec des nombres ? | Pas d'abstraction : ex. « Montant HT 100€ + Remise 10% = Net 90€ ». |
| **6. Référentiels & Dépendances** | Quels objets de configuration sont nécessaires ? | Séquences, journaux comptables, taxes, règles de paiement. |
| **7. Annulations & Retours** | Que se passe-t-il si l'utilisateur annule ou modifie ? | Préciser les statuts d'annulation et le retour en arrière. |
| **8. Volumétries** | Combien d'objets traités par jour / mois / batch ? | Détecter si un simple bouton UI suffit ou si un traitement asynchrone est requis. |

## 2. Distinction Standard AOS vs Spécifique

- **Règle absolue** : Ce qu'Axelor fait déjà nativement ne doit **JAMAIS** être re-décrit comme une règle spécifique.
  - Exemples standards : Équilibre débit/crédit, calcul de base TVA, génération de séquence automatique, lettrage.
- Si une règle demandée s'appuie sur le standard avec une légère variante, l'énoncer clairement :
  *« Comportement standard AOS, à l'exception de [l'ajustement demandé] »*.
