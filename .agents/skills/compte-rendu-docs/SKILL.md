---
name: compte-rendu-docs
description: "Rédiger ou mettre à jour un bref compte rendu de procédure en français : récit chronologique au passé avec « on », préparation des données, traitement, import, contrôles et niveau de validation factuel. Utiliser pour documenter une reprise, une correction ou une intervention ERP à partir des opérations réellement réalisées."
disable-model-invocation: true
---

# Compte rendu de procédure

## Objectif

Produire un texte directement réutilisable dans un ticket, un document ou un message de suivi. Expliquer ce qui a été fait, pourquoi et comment le résultat a été contrôlé. Ce compte rendu rétrospectif n'est ni un tutoriel ni une procédure à exécuter.

## Style et structure

- Un titre : « Procédure de [opération métier] pour le ticket #[ticket] », sans numéro de ticket s'il n'est pas connu.
- En général 5 à 8 paragraphes courts, adaptés à la complexité réelle, environ 250 à 400 mots au maximum sauf demande contraire.
- Français naturel, professionnel et accessible, proche du langage de l'utilisateur.
- Narration chronologique au passé composé avec « on » : « On a commencé par… », « On a ensuite… », « Une fois… », « Pour contrôler le résultat… ».
- Le compte rendu est rédigé du point de vue de l'utilisateur : désigner ses actions par « on », jamais par son prénom à la troisième personne, sauf demande explicite. Préserver la distinction entre ses déclarations et les contrôles indépendants sans le nommer, et ne pas inventer de résultats.
- Un paragraphe par phase. Pas de tableaux, listes de champs exhaustives, emojis ou introduction conversationnelle. Dans Google Docs, les phases peuvent être numérotées comme dans le modèle de référence.
- Nommer les objets métier et donner les références exactes utiles lorsqu'elles sont connues : identifiants, noms, valeurs et environnement. Expliquer simplement les rapprochements et règles ; éviter le jargon et le code.
- Ne pas mentionner l'API, Agentic Axelor ou les moyens techniques de vérification si l'utilisateur ne le souhaite pas. Ne pas pour autant attribuer un contrôle à l'interface ou à une personne sans preuve ; conserver les limites du résultat.
- Dans le chat, employer du texte brut sans gras, italique ou formatage Markdown. Dans Google Docs, appliquer la mise en forme du modèle de référence, y compris son titre et ses points numérotés.
- Ne jamais utiliser le tiret cadratin « — » dans le texte ou le titre. Préférer une phrase, une virgule ou deux points.
- Ne pas raconter tous les essais infructueux. Mentionner une difficulté seulement si elle explique la méthode finale, une limite ou un risque restant ; respecter les éléments que l'utilisateur ne souhaite pas communiquer.
- Placer chaque question, réserve ou suggestion dans le paragraphe correspondant, plutôt que de la répéter automatiquement en conclusion. Terminer naturellement et brièvement, sans formules mécaniques, tout en respectant le niveau de validation établi.

### Ordre narratif attendu

1. **Sources et périmètre** : environnement d'origine, exports, champs utiles, archivés inclus ou non si connu.
2. **Sélection** : critères de filtrage ou de rapprochement et cas exclus ou laissés sans modification.
3. **Traitement** : règle métier appliquée, formules décrites en langage naturel, conservation des anciennes valeurs, contrôles préparatoires effectivement réalisés.
4. **Préparation de l'import** : résultats figés en valeurs, fichier final, identifiant de rapprochement et mécanisme d'import retenu.
5. **Test et exécution** : environnement exact, test limité, puis lot complet uniquement s'il a réellement été exécuté.
6. **Contrôle du résultat** : source des valeurs attendues, comparaison avec les données après traitement, champs vérifiés, volumes, anomalies et cas restants.
7. **Conclusion** : niveau de validation strictement établi et environnement concerné.

Fusionner les phases courtes ; omettre celles qui ne s'appliquent pas. Ne jamais inventer une étape pour remplir la structure.

## Ancrage factuel obligatoire

- Extraire les faits de la conversation, des fichiers désignés et des contrôles disponibles. Lire uniquement les éléments nécessaires ; ne pas relancer d'opérations métier pour rédiger un compte rendu.
- Pour chaque scénario pertinent, préciser ce qui a été testé, les conditions importantes, le résultat observé et, si connu, ce qui a été validé, signalé ou reste à clarifier. Ne pas se limiter à une liste d'actions.
- Distinguer les scénarios aux conditions différentes, sans généraliser un résultat à tous les cas. Distinguer ce qui est proposé, préparé, exécuté, déclaré par l'utilisateur et vérifié indépendamment ; ne pas inventer une validation ou une origine d'observation.
- Vérifier la cohérence des volumes : lignes de données versus en-tête, fichiers filtrés versus exports complets, archivés versus non archivés.
- Ne pas reprendre un ancien chiffre si un contrôle plus récent l'a remplacé.
- Distinguer environnement source et environnement d'import. Un résultat en recette ne prouve jamais une mise en production.
- Un journal « import réussi » n'établit pas à lui seul la conformité des données. Préciser séparément le succès technique et les contrôles après import.
- Un test sur une affaire valide ce cas seulement ; un contrôle global exige une comparaison de tout le périmètre annoncé.
- Ne pas affirmer « aucun doublon », « aucune création », « état archivé conservé » ou « aucune anomalie » au-delà des vérifications réellement réalisées. Préciser la portée : doublons du fichier, collisions dans la base, erreurs du journal ou écarts de valeurs.
- En cas d'information essentielle manquante, poser une question ciblée ou formuler une limite explicite, sans prétendre à une validation complète.
- Ne jamais inclure de cookies, secrets ou détails d'authentification.

## Formulations de validation

Choisir la conclusion correspondant aux preuves :

- Préparation seule : « Le fichier de correction est prêt ; l'import et le contrôle du résultat restent à réaliser. »
- Test limité : « Ce test confirme le fonctionnement de la mise à jour sur ce cas. Le lot complet reste à importer et à contrôler. »
- Import effectué, contrôle manquant : « L'import du lot a été effectué ; le contrôle global des valeurs reste à réaliser. »
- Contrôle partiel : « Les cas contrôlés sont conformes ; la vérification du reste du lot reste à effectuer. »
- Contrôle global : « Le contrôle global ne relève aucun écart sur les champs vérifiés : la correction du lot est validée en recette. » Adapter l'environnement et mentionner tout écart constaté.

## Trame de rédaction

Utiliser cette trame comme guide, sans conserver les crochets ni ajouter de faits non établis :

> Procédure de [opération] pour le ticket #[ticket]
>
> On a commencé par exporter [objets et informations utiles] depuis [environnement], [périmètre connu]. On a conservé les données d'origine pour garder une référence avant correction.
>
> Dans [outil], on a ensuite retenu [critères]. [Cas laissés sans modification, si applicable.]
>
> On a préparé [corrections] en appliquant [règle métier]. [Contrôles préparatoires réellement réalisés.]
>
> Une fois le traitement terminé, on a copié les résultats en valeurs, sans les formules. On a préparé [fichier et champs utiles] pour retrouver les enregistrements existants par [clé].
>
> On a testé [méthode] sur [périmètre] dans [environnement]. [Résultat vérifié.] [Import complet, seulement si exécuté.]
>
> Pour contrôler le résultat, on a comparé [référence attendue] avec [données après traitement]. [Volumes, champs vérifiés et résultats exacts.]
>
> [Conclusion proportionnée aux preuves.]

## Livraison et mises à jour

- Lorsqu'un compte rendu est demandé via ce skill, créer directement un Google Doc et fournir son lien, sauf si l'utilisateur demande d'abord un brouillon dans le chat. Dans ce cas, présenter le brouillon sans modifier ni créer de document jusqu'à sa demande. Charger et respecter l'index Google Workspace et ses règles de confirmation avant toute modification des permissions.
- Avant création, consulter [l'index de navigation Drive des projets](../../knowledge/drive-projets-index.md) pour rechercher le projet et choisir la zone selon l'intervention. Réutiliser un dossier de ticket adapté ou créer, si nécessaire et autorisé, un sous-dossier au nom explicite ; copier le modèle directement dans la destination retenue. Vérifier les accès hérités et le résultat, puis indiquer le chemin et le lien. Ne pas demander systématiquement le classement quand les éléments suffisent ; ne pas deviner si le projet ou la destination reste impossible à établir, et respecter les confirmations requises pour les permissions.
- Utiliser comme modèle visuel le document https://docs.google.com/document/d/1oSDzf1d11ob3OtbxnsFJ7ny51ioAfwYBxF0V_pYFbEQ/edit : reproduire exactement la police, les tailles, le style du titre, les espacements et la numérotation des étapes. Inspecter le modèle ; si possible en créer une copie, puis remplacer entièrement son contenu par le nouveau compte rendu en préservant les styles. Adapter le nombre de points aux faits et vérifier qu'aucun texte du modèle ne subsiste par erreur. Ne jamais modifier le document modèle.
- Rendre le document accessible et modifiable par le domaine de l'entreprise alter-si.fr uniquement, jamais par toute personne disposant du lien. Vérifier les permissions existantes, demander la confirmation requise avant de les modifier, puis vérifier l'accès et le contenu. Si le partage ou la création échoue, signaler précisément le résultat partiel.
- Après création ou mise à jour, inspecter la structure des paragraphes et relire le contenu. Vérifier que la numérotation est continue, qu'aucun élément de liste vide ne subsiste et que tous les points ont une séparation visuelle régulière, équivalente à un saut de ligne, sauf préférence contraire de l'utilisateur. Ne pas se fier uniquement à l'export Markdown, qui peut masquer les paragraphes vides et les écarts d'espacement.
- Lors du remplacement de texte dans une liste numérotée, éviter les doubles retours à la ligne qui créent des paragraphes numérotés vides. Séparer les points par des paragraphes non vides et régler uniformément l'espace vertical entre eux, sans insérer d'éléments de liste vides. Dans Google Docs, un espacement de paragraphe peut être réduit entre éléments de liste : si nécessaire, utiliser le mode `NEVER_COLLAPSE` en plus de l'espacement. Vérifier le rendu visuel lorsque possible, ou demander confirmation à l'utilisateur ; un succès de l'API ou un export Markdown ne prouvent pas que l'espace est visible. Si nécessaire, supprimer les paragraphes vides concernés et relire la numérotation et la structure après correction, sans modifier le texte.
- Si l'utilisateur demande une mise à jour, conserver le style, corriger les faits obsolètes et ajuster la conclusion aux nouvelles preuves.
- Ne pas publier automatiquement dans Redmine ou un autre service, ni créer de walkthrough ou de fichier walkthrough.md.
