---
name: reponse-fin-de-tache
description: "Rédiger un brouillon court de réponse client après traitement d'une tâche ou d'un ticket : correction réalisée, environnement, contrôles, pièces jointes et demande de vérification. Style français naturel avec tutoiement par défaut."
disable-model-invocation: true
---

# Réponse courte après traitement d'une tâche

## Objectif

Rédiger un message directement réutilisable dans un ticket Redmine ou un échange client après une intervention. Résumer le résultat et indiquer clairement ce qui est attendu du destinataire, sans raconter toute la procédure.

## Style

- Français professionnel, simple et naturel.
- Tutoiement par défaut, sauf demande explicite de vouvoiement ou contexte l'imposant.
- Répondre à la personne à l'origine de la demande ou de la dernière intervention pertinente dans le ticket ; si l'identité du destinataire est ambiguë, demander une précision plutôt que la deviner. Lire le ticket et son historique si nécessaire.
- Si le destinataire est identifié comme membre de l'entreprise, adopter un ton naturel et moins formel, par exemple « Salut [prénom], » ou « Hello [prénom], ». Sinon, commencer par « Bonjour [prénom], » si le prénom est connu, ou « Bonjour, ».
- Placer le début du texte immédiatement à la ligne suivant la salutation, sans ligne vide entre les deux. Les paragraphes suivants peuvent être séparés par une ligne vide.
- En général 3 courts paragraphes après la salutation, environ 60 à 110 mots. Raccourcir si le sujet est simple.
- Utiliser des formulations neutres et impersonnelles, par exemple « La correction a été importée… ». Ne jamais employer les pronoms « on » ou « nous », ni leurs formes associées comme « notre » ou « nos ».
- Pas de tableau, liste détaillée, emojis, code, jargon inutile, historique des tentatives ou formule de clôture longue.
- Gras facultatif, réservé au volume ou à l'environnement important.
- Livrer uniquement le brouillon, sans préambule.

## Structure

1. **Résultat** : intervention effectuée, périmètre utile et environnement exact.
2. **Contrôle et traçabilité** : résultat des vérifications connues et pièce jointe prévue ou disponible, si pertinente.
3. **Action attendue** : demander au destinataire de vérifier et de confirmer ; mentionner l'étape suivante uniquement si elle est réellement prévue.

## Rigueur factuelle

- S'appuyer sur les faits établis dans la conversation ou les sources désignées. Ne pas inventer de chiffres, de contrôles, d'accord client ou de date de livraison.
- Distinguer préparation, exécution et validation. Une tâche préparée n'est pas une tâche exécutée ; une intervention en recette n'est pas une livraison en production.
- Mentionner l'environnement pour toute intervention ERP lorsque cette distinction est pertinente.
- Dire « aucun écart » uniquement si un contrôle correspondant a été effectué. Un import techniquement réussi ne prouve pas à lui seul la conformité métier.
- Adapter la portée du contrôle : test limité, échantillon ou contrôle global. Ne pas généraliser un test unitaire à tout le lot.
- Si une étape reste bloquée ou partiellement terminée, le signaler brièvement plutôt que présenter la tâche comme finalisée.
- Si l'utilisateur prévoit une pièce jointe, le brouillon peut dire « Le CSV importé est joint pour traçabilité ». Cela décrit le message à envoyer, pas une action déjà réalisée par l'agent. Si l'envoi de la pièce n'est pas prévu ou établi, ne pas l'inventer.
- Ne pas affirmer que le client a validé : solliciter sa validation si elle est encore attendue.
- Ne pas annoncer automatiquement un passage en production ou une clôture de ticket ; les mentionner seulement si cette suite est prévue et reste soumise à la validation nécessaire.
- Ne jamais exposer de secret, cookie, identifiant de session ou information interne sans utilité pour le destinataire.

## Exemple de référence

Cet exemple illustre le ton et la structure ; ses chiffres et faits ne doivent jamais être réutilisés automatiquement :

> Bonjour Laurence,
> La correction a été importée en recette sur **3 174 affaires, archivées incluses** : reprise du type d'affaire depuis le modèle, mise à jour du préfixe du code et du nom complet.
>
> Le contrôle global n'a relevé aucun écart. Le CSV importé est joint pour traçabilité.
>
> Peux-tu vérifier de ton côté et confirmer que le résultat te convient avant le passage en production ?

## Livraison et limites

- Produire un brouillon uniquement. Ne pas publier dans Redmine, envoyer de message, joindre un fichier, modifier un statut ou clôturer un ticket sans autorisation spécifique.
- La lecture d'un ticket n'est nécessaire que si les faits utiles manquent ; dans ce cas suivre le routage opérationnel Redmine du projet et les outils disponibles.
- Si un élément essentiel manque, poser une question ciblée ou omettre le détail non établi plutôt que le deviner.
- Si l'utilisateur demande une révision, conserver la concision et ne modifier que les éléments concernés.
- Créer un fichier uniquement si demandé ; ne pas générer de walkthrough ni de walkthrough.md.
