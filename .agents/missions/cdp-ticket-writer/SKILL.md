---
name: cdp-ticket-writer
description: "Mission CDP : Rédige une spécification allégée contractuelle prête pour les développeurs (règles RG/RC, diagramme Mermaid, scénarios de test et matrice de couverture) à partir de notes d'ateliers ou de demandes clients, en vérifiant le standard AOS local et les métadonnées réelles d'Axelor."
---

# Mission : CDP Specification Orchestrator (ticket-writer)

Ce playbook orchestre l'ensemble des silos contextuels du projet pour transformer une note d'atelier brute en un ticket de spécification fonctionnelle irréprochable et non-ambigu pour les développeurs.

---

## 🧭 Le Workflow en 4 Phases Symbiotiques

```
[Phase 1 : Collecte]  ──►  [Phase 2 : Vérif AOS]  ──►  [Phase 3 : Introspection Live]  ──►  [Phase 4 : Rédaction & Redmine]
  Notes brutes / Drive       Axelor-index.md            standard-index.md                    template-ticket.md + Mermaid
```

### Phase 1 : Collecte & Qualification du Besoin
1. **Source des notes** :
   - Si les notes sont dans Google Drive / Docs, charger [google-workspace-index.md](../../google-workspace-index.md) pour les lire.
   - Si les notes sont collées directement par l'utilisateur dans le chat, extraire le contexte client et le flux visé.
2. **Passer la grille de qualification** :
   - Consulter [references/qualification-guide.md](references/qualification-guide.md).
   - Identifier l'acteur, le résultat mesurable, les exemples chiffrés et les éventuelles incertitudes. Poser les questions de clarification si des données critiques manquent.

### Phase 2 : Vérification du Standard AOS (Anti-Réinvention)
1. **Règle absolue** : On ne re-spécifie jamais ce qu'Axelor fait déjà nativement.
2. **Consultation de l'Open Suite** :
   - Charger [Axelor-index.md](../../Axelor-index.md).
   - Rechercher les fichiers de menus, vues et domaines du module concerné (`reference-sources/axelor-open-suite/axelor-<module>/`).
   - Identifier ce qui relève du standard et isoler le **delta spécifique** exigé par le client.

### Phase 3 : Introspection des Métadonnées Réelles (Précision Technique)
1. **Garantir des noms réels** : Les développeurs ne doivent pas chercher si le champ s'appelle `client`, `customer` ou `partner`.
2. **Interrogation via le connecteur MCP Axelor** :
   - Charger [standard-index.md](../../standard-index.md).
   - Utiliser `inspect_axelor_model` sur le modèle cible pour confirmer les noms exacts des champs techniques et leurs types.
   - Utiliser `inspect_axelor_view` pour vérifier la composition de l'écran cible (ex: `sale-order-form`).
   - Utiliser `inspect_axelor_selections` si le besoin touche à une liste déroulante / enum.

### Phase 4 : Rédaction Contractuelle & Publication
1. **Application stricte du gabarit** :
   - Remplir le modèle [assets/template-ticket.md](assets/template-ticket.md).
   - Intégrer obligatoirement le diagramme **Mermaid** (`flowchart TD`) modélisant le flux utilisateur et les branches de contrôle selon [references/mermaid-rules.md](references/mermaid-rules.md).
   - Rédiger les scénarios de test chiffrés (Nominal S1, Limite S2, Dégradé S3) et la matrice de couverture RG/RC.
2. **Publication / Préparation Redmine (Optionnelle)** :
   - Si l'utilisateur demande la publication directe sur Redmine, charger [redmine-index.md](../../redmine-index.md).
   - Respecter les garde-fous : prévisualiser le corps en chat, ne publier qu'après validation explicite du projet et du tracker.

---

## 🔒 Règles de Rigueur & Compression
- **Pas de jargon technique déplacé** : Le ticket décrit le **pourquoi** (besoin métier) et le **quoi observable** (champs, statuts, erreurs). Le comment technique interne (classes Java, requêtes SQL) reste à la discrétion du développeur.
- **Gestion des sections vides** : Si une section n'a pas d'objet dans l'évolution (ex: « Aucun cas dégradé identifié »), conserver la section avec cette mention explicite. Sa vacuité est une information contractuelle.
