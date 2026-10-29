---
name: suivi-fin-de-tache
description: "Préparer le suivi d'une tâche terminée : créer un compte rendu Google Docs, rédiger un brouillon de réponse Redmine avec son lien, puis publier une note privée seulement après validation explicite."
disable-model-invocation: true
---

# Suivi de fin de tâche

## Objectif

Coordonner les skills de compte rendu de procédure et de réponse de fin de tâche, sans confondre la création d'un document, la préparation d'un brouillon et la publication d'une note privée.

## Déroulement

1. Identifier le ticket, les opérations réalisées, leur environnement et le destinataire pertinent. Si des faits essentiels ou le ticket sont ambigus, les vérifier ou demander une précision. Suivre les instructions opérationnelles Redmine et Google Workspace applicables.
2. Lire et appliquer le skill voisin `../compte-rendu-procedure/SKILL.md` pour rédiger le compte rendu et créer le document Google Docs selon son modèle. Suivre les règles applicables aux permissions, notamment la confirmation requise avant leur modification. Vérifier le contenu et l'accès, et signaler toute création ou tout partage partiel.
3. Lire et appliquer le skill voisin `../reponse-fin-de-tache/SKILL.md` pour rédiger une réponse adaptée au destinataire. Inclure le lien du document accompagné d'une courte mention, par exemple « Le compte rendu est disponible ici : ». Ne pas prétendre qu'une pièce jointe a été ajoutée : un lien Google Docs n'est pas une pièce jointe Redmine.
4. Présenter dans le chat uniquement le brouillon destiné à Redmine et le lien Drive, sans publier de note ni changer le statut du ticket. Si le document n'a pas pu être créé ou partagé, signaler clairement la limite et ne pas inventer de lien ou de droits d'accès.
5. Attendre une validation explicite de l'utilisateur pour publier ce brouillon. Une validation du texte seul ne vaut pas autorisation d'envoi si l'intention est ambiguë. Avant l'envoi, confirmer que le ticket et le contenu correspondent à la demande, puis ajouter une note privée au ticket. Utiliser le skill Redmine applicable et une clé d'idempotence pour éviter les doublons en cas de nouvel essai. Ne pas modifier le statut, l'assignation ou d'autres champs sans autorisation distincte.
6. Relire le ticket après publication afin de vérifier le contenu et le caractère privé de la note. Confirmer le résultat, ou indiquer précisément toute incertitude ou erreur.

## Contraintes

- Ne pas exposer de secrets ou de données d'authentification.
- Ne pas annoncer de validation ou de mise en production non établie.
- Ne pas créer de fichier local sauf demande explicite, ni de walkthrough.
