---
name: reponse-redmine
description: "Rédiger un brouillon de réponse adapté à l'état d'une tâche ou à la conversation d'un ticket : avancement, recette, problème, question ou résultat. Invocation manuelle uniquement."
disable-model-invocation: true
---

# Réponse adaptée à une tâche ou à un ticket

## Objectif

Rédiger un message directement réutilisable dans un ticket ou un échange professionnel, adapté à la situation : réponse dans une discussion en cours, résultat de recette, problème rencontré, question, suivi d'avancement ou fin de tâche. Ne pas présumer que la tâche est terminée ni qu'une correction a réussi.

## Style

- Français professionnel, simple et naturel.
- Pour les environnements, utiliser « prod » et « pprod » plutôt que « production » et « préproduction », sauf si une citation ou une dénomination exacte doit être conservée.
- Tutoiement par défaut, sauf demande explicite de vouvoiement ou contexte l'imposant.
- Répondre à la personne à l'origine de la demande ou de la dernière intervention pertinente dans le ticket ; si l'identité du destinataire est ambiguë, demander une précision plutôt que la deviner. Lire le ticket et son historique si nécessaire.
- Adapter la salutation au fil : dans une discussion déjà engagée, aller directement au point sans répéter « Salut » ou « Bonjour » ; pour un premier contact ou lorsque le contexte le justifie, utiliser une salutation adaptée et naturelle.
- Dans un ticket ou un outil prenant en charge les mentions, mentionner le destinataire avec son identifiant exact lorsqu'il est connu et que la mention est pertinente, avec ou sans salutation selon le fil. Pour identifier une mention, consulter au besoin [l'annuaire Redmine](../../knowledge/redmine-mentions.md) ; si l'entrée manque, est ambiguë ou semble dépassée, vérifier dans Redmine. Ne pas inventer d'identifiant ni garantir une notification sans preuve ; demander une précision si nécessaire.
- Adapter librement la longueur et la présentation au sujet : paragraphes courts ou puces pertinentes pour distinguer résultats, problèmes et questions. Les propositions de structure et de longueur sont indicatives, pas des contraintes.
- Privilégier des formulations naturelles et claires, sans jargon inutile ni historique superflu.
- Ne pas utiliser de gras dans le brouillon.
- Livrer uniquement le brouillon, sans préambule.

## Contenu à adapter

Identifier l'objectif immédiat et le destinataire, puis sélectionner uniquement les informations utiles : résultat et environnement, contrôles et limites, anomalie observée, impact, question ou action attendue. Dans une discussion en cours, éviter de répéter les éléments déjà connus sauf s'ils facilitent le diagnostic. Pour une réponse après retest, décrire ce qui a réellement été observé sans annoncer de correction ou de validation inexistante. Utiliser l'ordre et la présentation les plus clairs ; mentionner une étape suivante seulement si elle est réellement prévue.

## Rigueur factuelle

- S'appuyer sur les faits établis dans la conversation ou les sources désignées. Ne pas inventer de chiffres, de contrôles, d'accord client ou de date de livraison.
- Distinguer préparation, exécution et validation. Une tâche préparée n'est pas une tâche exécutée ; une intervention en recette n'est pas une livraison en prod.
- Mentionner l'environnement pour toute intervention ERP lorsque cette distinction est pertinente.
- Dire « aucun écart » uniquement si un contrôle correspondant a été effectué. Un import techniquement réussi ne prouve pas à lui seul la conformité métier.
- Adapter la portée du contrôle : test limité, échantillon ou contrôle global. Ne pas généraliser un test unitaire à tout le lot.
- Si une étape reste bloquée ou partiellement terminée, le signaler brièvement plutôt que présenter la tâche comme finalisée.
- Si l'utilisateur prévoit une pièce jointe, le brouillon peut dire « Le CSV importé est joint pour traçabilité ». Cela décrit le message à envoyer, pas une action déjà réalisée par l'agent. Si l'envoi de la pièce n'est pas prévu ou établi, ne pas l'inventer.
- Ne pas affirmer que le client a validé : solliciter sa validation si elle est encore attendue.
- Ne pas annoncer automatiquement un passage en prod ou une clôture de ticket ; les mentionner seulement si cette suite est prévue et reste soumise à la validation nécessaire.
- Ne jamais exposer de secret, cookie, identifiant de session ou information interne sans utilité pour le destinataire.

## Exemple de référence

Cet exemple illustre le ton et la structure ; ses chiffres et faits ne doivent jamais être réutilisés automatiquement :

> Bonjour Laurence,
> La correction a été importée en recette sur 3 174 affaires, archivées incluses : reprise du type d'affaire depuis le modèle, mise à jour du préfixe du code et du nom complet.
>
> Le contrôle global n'a relevé aucun écart. Le CSV importé est joint pour traçabilité.
>
> Peux-tu vérifier de ton côté et confirmer que le résultat te convient avant le passage en prod ?

## Livraison et limites

- Produire un brouillon uniquement. Ne pas publier dans Redmine, envoyer de message, joindre un fichier, modifier un statut ou clôturer un ticket sans autorisation spécifique.
- La lecture d'un ticket n'est nécessaire que si les faits utiles manquent ; dans ce cas suivre le routage opérationnel Redmine du projet et les outils disponibles.
- Si un élément essentiel manque, poser une question ciblée ou omettre le détail non établi plutôt que le deviner.
- Si l'utilisateur demande une révision, conserver la concision et ne modifier que les éléments concernés.
- Créer un fichier uniquement si demandé ; ne pas générer de walkthrough ni de walkthrough.md.
