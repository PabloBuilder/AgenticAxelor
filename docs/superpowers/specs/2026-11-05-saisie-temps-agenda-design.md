# Saisie des temps depuis l’agenda — conception

## Objectif
Skill partagé, invoqué manuellement par chaque utilisateur du dépôt, pour préparer puis saisir dans le classeur de temps les plages de son agenda portant un numéro de ticket.

## Fonctionnement validé
- Utilisateur courant identifié sans supposer Pablo ; demander confirmation si la correspondance Google, Redmine et nom dans le Sheet est incertaine.
- Semaine courante lundi–dimanche par défaut ; jour ou semaine explicitement demandé possible. Événements déjà terminés uniquement.
- Titres comportant un numéro de ticket, avec nom complet, abréviation de projet ou sans nom. Redmine consulté en lecture seule pour identifier le projet et comprendre le travail de l'utilisateur ; aucune saisie de temps dans Redmine.
- Proposer onglet, type, personne, date, durée, description, ticket et profil. Profil selon la tâche : RDD - admin pour reprise de données, CP pour tâches de chef de projet et diverses sans code, consultant tech pour développement et tâches techniques. Type adapté à la tâche, éventuellement issu du ticket. Ne pas inventer ; demander en cas d'incertitude bloquante. Champs facultatifs incertains vides ; ne jamais remplir le temps à facturer.
- Prévisualiser les propositions et les doutes ; écrire uniquement les lignes explicitement approuvées. Vérifier après écriture.
- Conserver une correspondance fiable événement–ligne ; un second appel ne crée pas de doublon. Signaler les changements d'événement sans modifier la ligne. Signaler les doublons possibles, notamment les lignes saisies manuellement, sans les ajouter automatiquement.

## Approches
1. Suivi persistant des événements et lignes : choisi pour détecter répétitions et modifications.
2. Comparaison avec les seules lignes existantes : écartée, car les plages peuvent partager ticket, date et durée.

## Contraintes et décisions à vérifier
L'onglet lié est Consolidation ; Seenorest possède des onglets de saisie et des lignes contenant des identifiants de temps Redmine. L'origine de ces identifiants, la consolidation, les formules, les lignes préformatées et la sécurité des écritures restent à vérifier. Les accès annoncés par les outils ne prouvent pas les droits effectifs d'écriture. Ne pas écrire si le bon emplacement, la protection contre les doublons ou la récupération après erreur ne sont pas fiables. Aucun changement de feuille, partage ou test d'écriture externe sans autorisation explicite.
