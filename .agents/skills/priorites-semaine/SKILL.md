---
name: priorites-semaine
description: "Générer de manière autonome le message des priorités de la semaine en croisant Redmine, Google Calendar, Google Chat et les échanges récents. Invocation manuelle uniquement."
disable-model-invocation: true
---

# Priorités de la semaine

## Objectif

Générer de façon autonome, fiable et concise le message hebdomadaire des **priorités de la semaine**, destiné à être partagé à l'équipe sur le canal Google Chat dédié (ex: *Priorités de la semaine*).

Le message doit refléter fidèlement le travail réel de la semaine sans inventer de statut, en recoupant les engagements pris dans les conversations, l'agenda, les tickets Redmine et les contraintes de disponibilité.

---

## 1. Collecte multi-sources

L'agent doit inspecter de manière autonome les sources suivantes :

### A. Identité et calendrier de l'utilisateur
1. **Identifier l'utilisateur** :
   * Consulter l'identité via `node scripts/redmine-axi.cjs user me` et le compte Google authentifié.
2. **Analyser la période sur Google Agenda (`mcp__google_alter_si__get_events`)** :
   * Interroger les événements de la semaine en cours (du lundi au dimanche) et ceux du début de semaine suivante.
   * Repérer les **indisponibilités et contraintes** :
     * Jours fériés (ex: 11 novembre, 1er mai...).
     * Périodes d'école / alternance (ex: mention « École » sur une semaine complète).
     * Congés posés, RTT ou absences.
   * Repérer les **réunions clés et échéances** :
     * Réunions de démo / avant-vente (ex: *Pablo / Marine : aide prépa SNEC*).
     * Points de restitution ou livraisons (ex: *WF enregistrement factures fournisseurs* avec horaire fixe).
     * Points managériaux et alternance (ex: *Point de suivi alternance*, *Point sur les tâches*).

### B. Échanges récents sur Google Chat (`mcp__google_alter_si__search_messages` / `get_messages`)
1. **Direct Messages (DMs)** :
   * Inspecter les messages reçus depuis la fin de semaine précédente jusqu'au lundi matin de la part des managers, chefs de projets et collègues proches.
   * Identifier les **demandes concrètes et consignes directes** :
     * Demandes de tests / recettes (ex: Thomas demandant des vérifications sur `demo04`).
     * Retours de relecture ou revues en cours (ex: ajuster des slides, reformuler un support).
     * Demandes d'aide ponctuelles en PROD ou DEV.
2. **Salons projets et salon des priorités** :
   * Consulter les messages récents dans le canal *Priorités de la semaine* pour observer le format et le niveau de détail attendu par l'équipe.
   * Vérifier les canaux projets actifs (ex: *Seenorest Projet*, *Gestion ERP*, *IA fonctionnel*).

### C. Redmine (via CLI `node scripts/redmine-axi.cjs`)
1. **Tickets assignés** :
   * Exécuter `node scripts/redmine-axi.cjs issue list --assigned me`.
2. **Tickets récemment commentés ou modifiés** :
   * Rechercher les tickets mentionnant l'utilisateur ou mis à jour dans les 7 derniers jours.
3. **Vérification de l'état réel de chaque ticket** :
   * Consulter l'historique complet avec `node scripts/redmine-axi.cjs issue view <id> --notes`.
   * Identifier le statut réel :
     * Si un développeur vient de livrer sur DEV : l'action est *« Derniers tests DEV / validation PPROD »*.
     * Si l'utilisateur a soumis un livrable et attend un retour : l'action est *« en cours »* ou *« en attente de retour »*.
     * **Règle d'or** : Ne jamais prétendre qu'un sujet est « quasiment fini » ou « terminé » sans validation explicite dans l'historique ou confirmation de l'utilisateur.

---

## 2. Démêlage et croisement sémantique

Ne pas recopier brute une note sans comprendre. L'agent doit lever les ambiguïtés :
* **Distinguer l'interne du client** : Une demande sur les « factures fournisseurs » peut désigner un workflow n8n interne pour Alter SI, tandis qu'une note compta peut correspondre à un ticket de rapprochement bancaire chez un client (ex: Optimum #5576).
* **Rattacher les demandes non taguées** : Si une consigne mentionne « devis -> commande -> facture » et « NDF », identifier le projet ou l'environnement concerné grâce aux messages privés récents (ex: tests sur l'environnement de démo *demo04*).
* **Considérer les jalons futurs** : Si une date future est citée (ex: 16/11 pour une démo), vérifier si l'utilisateur est présent à cette date. S'il est en école ou absent le 16/11, l'action de la semaine est l'appui à la préparation en amont avec le porteur du sujet.

---

## 3. Structure standard du message

Le message doit être **très concis**, orienté livrables, sans verbiage, structuré par catégories :

```text
Bonjour à tous ! Voici mes priorités de la semaine :

CP / Support :
• [Client] (#[Ticket]) : [Action concise : recette, tests DEV/PPROD, suivi]
• [Client] (#[Ticket]) : [Livrable en cours : ex. Support de présentation X (en cours)]
• [Client] (#[Ticket]) : [Nettoyage de données / assistance ponctuelle]

Avant-Vente & Démos :
• [Environnement/Prospect] : [Tests de flux, préparation de jeu de données]
• [Démo / Sujet] : [Aide à la préparation avec X]

Interne :
• [Domaine/Outil] : [Livrable concret, workflow n8n, documentation, réunion clé]

Contraintes :
• [Jour férié éventuel]
• [Semaine école / congés / absence à venir ou en cours]
Charge : OK / Normale / Élevée
```

---

## 4. Règles de rédaction

1. **Concision absolue** : Une ligne par sujet, puces courtes, style télégraphique compréhensible par tous.
2. **Statut modeste et vérifié** :
   * Éviter « quasiment fini », « presque terminé » ; préférer la tâche précise restante : *« Derniers tests DEV/PPROD »* ou la mention sobre *« (en cours) »*.
3. **Transparence sur les contraintes** :
   * Toujours mentionner les semaines courtes (jours fériés) et les périodes d'école/congés imminentes pour que l'équipe anticipe l'indisponibilité.
4. **Validation avant diffusion** :
   * Présenter d'abord la synthèse et le projet de message à l'utilisateur dans la conversation.
   * Fournir le texte prêt à copier-coller.
   * Ne jamais poster automatiquement dans Google Chat sans confirmation explicite de l'utilisateur.
