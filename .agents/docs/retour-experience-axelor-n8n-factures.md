# Retour d’expérience — Axelor, n8n, OCR et factures fournisseurs

**Consolidé le 3 novembre 2026.** Connaissances acquises ou confirmées pendant le chantier « lot 2 ». Ce document remplace les tâtonnements par des réflexes reproductibles ; ce n’est ni une autorisation d’écriture, ni une configuration de production.

## 1. À lire avant de reprendre ce chantier

1. Lire le routeur et l’index du domaine concerné ; utiliser les schémas réels des outils et l’aide de la CLI.
2. Identifier l’environnement et le workflow effectivement ciblés. Une synchronisation navigateur, un nom de workflow ou un numéro de société ne suffisent pas isolément.
3. Relire les preuves et l’état réel avant une reprise. **Ne pas rejouer un essai déjà terminé pour « vérifier ».**
4. Partir du **V3 commun existant**, pas d’un nouveau workflow par fournisseur. Les anciennes recettes sont des bancs d’essai historiques.
5. Ne pas consulter/modifier le HANDOFF pour ce chantier : l’opérateur a signalé qu’il appartient désormais à un autre projet.
6. Ne jamais déduire « prêt pour la production » d’un test DEMO, « exécution réussie » d’un écran n8n vert, ni « 95 % de couverture » de deux familles réussies.

### Nature des preuves

- **Observé en réel** : lecture ERP, réponse de modèle, téléchargement, métadonnées Drive ou exécution opérateur effectivement contrôlés.
- **Testé localement** : Code généré, réponses simulées, compilateur d’expressions local. Ce n’est pas une acceptation serveur.
- **Hypothèse/documentation publique** : mécanisme à confirmer sur l’installation ; ne pas lui attribuer automatiquement la version du serveur.
- **Limite** : comportement non implémenté, non raccordé ou non validé de bout en bout.

Les nombres de tests historiques ne s’additionnent pas pour certifier la version courante. La dernière suite V3 ciblée comporte **24 contrôles locaux** ; les anciennes batteries concernaient d’autres états du code.

## 2. État acquis à la fin de ce chat — et limites

### Réussites réelles

- **Upcoop** : facture à lignes exonérée et 20 %, brouillon réutilisé, montants et PDF vérifiés, copie classée DONE.
- **HUBIN, avis trimestriel scanné** : PDF accepté par le relais/modèle, champs essentiels contrôlés visuellement ; avis transformé selon une politique comptable explicite ; brouillon unique, échéance corrigée, PDF original joint et vérifié, copie DONE, mutex libéré.
- **IONOS** : extraction réelle acceptée, sept lignes dont quatre gratuites conservées, mention d’autoliquidation et échéance explicite contrôlées. Ce n’est **pas** une validation de sa comptabilisation complète dans le V3.

### Ne pas surestimer ces résultats

- Upcoop et HUBIN ont abouti **après des corrections et des reprises**. Une nouvelle facture intégralement créée sans intervention après toutes les corrections reste à tester.
- HUBIN validé ici = **un avis mono-page**, pas le PDF multi-pièce lettre/avoir/avis.
- Avoirs, remises, plusieurs taux et règles comptables ont une couverture locale partielle ; toutes ces variantes n’ont pas une acceptation ERP réelle.
- Les bindings des autres familles restent incomplets ; certains régimes, dont l’autoliquidation IONOS, restent à finaliser.
- Le mutex V3 ne protège pas contre un autre programme ou un humain créant directement la même facture.
- Une mise en revue justifiée est un résultat sûr, pas une saisie automatique réussie.
- Aucun pourcentage de couverture n’est établi. Il faut un corpus représentatif et compter séparément succès sans intervention, revues justifiées et erreurs.

Preuves courantes : `Work_data/lot2/Bilan-integration-V3.md`, `Work_data/lot2/v3-hubin-autosaisie.json`, `Work_data/lot2/v3-upcoop-test-selection.json`, `Work_data/lot2/v3-ocr-scan-test.json`. Les versions, identifiants et emplacements opérationnels restent dans `Work_data/`, pas dans ce document générique. S’ils sont absents ou anciens, les résoudre à nouveau par lecture ; ne pas les inventer de mémoire.

## 3. Connecteurs : trois canaux, trois authentifications distinctes

| Canal | Ce qui a été établi | Réflexe |
|---|---|---|
| Axelor MCP / Bridge | Session navigateur synchronisée par l’extension ; client adossé au SessionStore. | Synchroniser puis vérifier la session cible ; ne jamais chercher des cookies ou mots de passe ailleurs. |
| n8n | CLI externe `n8n-axi`, pas un MCP Axelor et pas le Bridge. Authentification héritée du processus. | Lire `--help` ; utiliser les credentials hérités sans imprimer leurs valeurs. |
| Google Workspace | Outils MCP propres à Drive et aux autres services Google. | Découvrir leur schéma ; distinguer métadonnées, téléchargement, copie, déplacement et partage. |
| HTTP exécuté par n8n | Credentials n8n protégés ; authentification ERP propre à cette exécution. | Ne pas transférer les cookies du poste vers le workflow. Une réussite via MCP ne prouve pas l’accès du credential n8n. |

### Axelor et plusieurs sessions

- En contexte DEMO + production, passer **explicitement `sessionId`** aux appels qui l’exposent. Une session inactive peut refuser les lectures même si son URL est connue.
- Vérifier l’URL cible avant toute écriture. Le même identifiant numérique de société a désigné deux sociétés différentes dans DEMO et production.
- Il a existé un décalage entre la synchronisation historique et la liste des sessions actives. Ne pas interpréter un ancien message de synchronisation comme preuve d’une session multisession utilisable.
- Le chemin de repli documenté `npm run query` a fonctionné pour des lectures lorsque le MCP ne présentait pas de session active. Il utilise le client synchronisé ; ce n’est pas une permission de scanner l’environnement.
- Les outils changent : `query_axelor_data` n’est pas un hypothétique `query_axelor`, `inspect_axelor_view` n’est pas un hypothétique `get_axelor_view`. **Découvrir, décrire, appeler** ; ne pas reconstruire leur API de mémoire.
- `save_axelor_record` : sans `id`, création ; avec `id` et version, mise à jour. Une tentative ambiguë ne doit pas être répétée aveuglément.
- `simulate_axelor_onchange` calcule des valeurs/action UI ; sa réponse ne prouve pas une sauvegarde. Certaines actions techniques peuvent écrire : vérifier leur contrat avant de les appeler.

### Sécurité constante

Jamais de scan `.env`, de lecture de secrets hérités, d’extraction de session par ports Bridge, de cookies dans le chat ou de mots de passe dans des fichiers. Préférer les credentials protégés et les sorties locales sans base64. Ne pas conserver les en-têtes sensibles de réponses réelles pour faire un diagnostic.

## 4. Axelor : découvrir l’installation au lieu de supposer le schéma

### Champs qui nous ont effectivement piégés

- Sur l’installation examinée, Partner expose **`taxNbr` et `siren`**, pas les anciens champs supposés `taxRegistrationId` / `siret`.
- Ne pas transformer automatiquement un SIRET à 14 chiffres en SIREN à 9 chiffres ; ce serait une inférence supplémentaire à justifier.
- Les lignes ERP enregistrées exposent **`taxLineSet`** ; la relation singulière `taxLine` supposée sur InvoiceLine n’était pas le bon contrat. InvoiceLineTax expose, elle, `taxLine`.
- **PaymentCondition appartient à `com.axelor.apps.account.db`**, pas au package `base`. La mauvaise supposition a produit `ClassNotFoundException`. Résoudre le modèle cible depuis les métadonnées de relation.
- Un outil de sélection a renvoyé des listes sans rapport avec le champ demandé. Ne pas les utiliser comme preuve d’un enum. Vérifier modèle, champ, vue et valeurs observées.
- Un produit existant peut avoir l’unité « Mois ». Il n’est pas interchangeable avec une ligne source en unité ou une quantité arbitraire.
- Fournisseur, Product, ProductCompany, AccountingSituation et AccountManagement sont des objets distincts ; certains ont été créés automatiquement par l’ERP. Les relire avant d’en créer d’autres.

### Les relations abrégées ne sont pas les données complètes

Une lecture de facture peut renvoyer `invoiceLineList` et `invoiceLineTaxList` sous forme d’identifiants et versions seulement. Cela ne prouve ni le bon compte ni les bonnes bases de taxe.

Pour décider REUSE et vérifier après écriture :

1. Lire l’en-tête.
2. Lire séparément les InvoiceLine et InvoiceLineTax rattachées aux factures candidates.
3. Vérifier la complétude/pagination ; ne pas traiter une réponse partielle comme un ensemble complet.
4. Comparer des multiensembles de lignes, pas seulement l’ordre ou le total.

La réutilisation stricte compare notamment fournisseur/société/type/référence/devise/dates/régime, produit/compte/unité, quantités/prix/remises, taxes/équivalences et résumé des bases/TVA. **Même TTC ≠ même facture.** Une ancienne consigne limitée aux trois totaux est insuffisante.

## 5. Axelor : sauvegarde, version et erreurs métier

### Relire la version réellement persistée

Des créations/sauvegardes ont renvoyé une version différente de celle relue juste après. Les hooks ERP peuvent modifier le document au cours de la sauvegarde.

- Avant compute ou une nouvelle écriture, faire une lecture fraîche avec `id`/`version`.
- Ne pas réutiliser la version de la réponse de création par commodité.
- Conserver les contrôles de brouillon et de société avant une écriture.

### HTTP 200 et `status: 0` ne suffisent pas

Le calcul de taxes a répondu HTTP 200 et statut applicatif global de succès **tout en plaçant une erreur dans `data[0].error`**.

Erreur réelle déterminante :

> La/les ligne(s) de taxe n'ont pas pu être générées du fait du champ régime TVA qui n'est pas renseigné pour le compte comptable 647000.

Conséquences : les lignes existaient mais les totaux d’en-tête étaient nuls. Il ne fallait ni recréer la facture, ni sauvegarder des « résultats » absents.

**Règle** : contrôler le statut HTTP, le statut applicatif, les erreurs imbriquées et la présence des valeurs requises. `INVOICE_COMPUTE_BUSINESS_ERROR` distingue désormais ce cas.

### Régime TVA du compte ≠ taux de la ligne

Le compte DEMO utilisé pour Upcoop avait `vatSystemSelect = 0`, alors que le compte correspondant en production avait une valeur renseignée. C’était un paramétrage du **compte**, pas du profil utilisateur ni un défaut de calcul de l’IA.

La correction a porté sur le compte DEMO après comparaison autorisée en lecture avec la production. Ne pas généraliser la valeur numérique observée à tous les comptes : inspecter et vérifier le contexte.

## 6. Découverte majeure : l’échéance dépend de l’échéancier

### Symptôme et fausses pistes

Pour HUBIN, le PDF indique le 16 juillet ; l’ERP persistait le 1er juillet.

- Écrire seulement `Invoice.dueDate` ne suffisait pas : la valeur était remplacée à la sauvegarde.
- Affecter temporairement une condition de règlement `isFree = true` ne suffisait pas non plus.
- La vue rend bien l’échéance éditable pour une condition libre, mais **éditabilité UI et persistance métier sont deux contrats différents**.

### Mécanisme et correction vérifiée

L’enregistrement avait un `invoiceTermList` vide. La sauvegarde recalcule l’échéance depuis les InvoiceTerm, sinon une date par défaut.

Le code public `InvoiceManagementRepository.save` et `InvoiceTermServiceImpl.getDueDate` a expliqué le mécanisme ; le serveur réel l’a confirmé par les lectures après sauvegarde. Le code public consulté ne constitue pas une preuve de la version installée.

Correction réelle : un **InvoiceTerm personnalisé unique**, 100 % du montant, date explicite du PDF, `isCustomized = true`, lié au même brouillon. Après sauvegarde, date d’en-tête et échéancier concordaient. La condition de règlement temporaire a été remise à son état initial.

Dans le générateur V3, `withExplicitDueDateTerm(draft, piece, cfg)` prépare cet échéancier pour les nouvelles écritures admissibles avec date explicite :

- pas de date inventée lorsque la source n’en porte pas ;
- pas d’écrasement d’un échéancier existant ;
- contrôles de date, montant et périmètre DEMO/devise ;
- conservation des contrôles de relecture après sauvegarde.

**Attention** : ce traitement à une échéance ne signifie pas que les factures à plusieurs échéances ou autres devises sont couvertes.

### Date source absente : ne pas falsifier l’extraction

Upcoop ne portait pas d’échéance explicitement exploitable. L’ERP a néanmoins ajouté une date par défaut.

Conserver séparément `extractedDueDate = null` et `erpDueDate` effectivement observée. Pour une reprise, cette tolérance doit être liée à un reçu vérifié de même facture/clé/SHA. Une date source explicite ne doit jamais être remplacée par cette tolérance.

## 7. Production comme référence métier, pas comme fichier de configuration DEMO

### Ce qui a été utile

Les écritures existantes ont permis de retrouver les catégories, comptes et codes de taxes réellement utilisés. L’opérateur a choisi d’en faire le référentiel métier par défaut ; il ne faut pas lui refaire approuver à chaque étape les mêmes choix déjà étudiés.

Mais :

- les IDs d’objets ne sont pas portables entre environnements ;
- les codes de produits production n’existaient pas tous dans DEMO ;
- les équivalences fiscales et le contexte fournisseur comptent ;
- le défaut de taxe d’une catégorie ne reproduit pas nécessairement la taxe de la facture observée.

Deux couches ont donc été séparées :

- `Work_data/lot2/accounting-choices.reference.json` : choix métier et provenance, pas une configuration exécutable production ;
- `Work_data/lot2/accounting-policy.demo.json` : bindings DEMO effectivement retrouvés/créés et approuvés dans le périmètre autorisé.

Un futur passage en production n’est **pas** un remplacement d’URL ou une copie des IDs DEMO.

### Anomalies historiques qu’il ne fallait pas reproduire

- Des dates de saisie et échéances HUBIN ne correspondaient pas au PDF.
- Deux avoirs portaient la même référence : alerte de doublon potentiel, pas règle pour créer deux avoirs.
- Le nom du fournisseur IONOS comportait une variante/erreur ; son numéro de TVA n’était pas renseigné dans la fiche.
- Plusieurs factures d’une même famille n’avaient pas exactement le même code de taxe.
- Les mouvements consultés étaient au journal/brouillard, pas la preuve d’une comptabilisation finale.
- La mention source « Autoliquidation » et un code ERP à taux zéro ne prouvent pas que les écritures d’autoliquidation sont correctement produites. Les mouvements examinés ne comportaient pas les lignes correspondantes.

Les comptes « 613200 », « 647000 », etc. sont des **codes comptables**, pas des montants en euros. Employer des mots simples dans les échanges opérateur.

## 8. Extraction : un JSON valide n’est pas une facture prouvée

### Erreurs réellement observées du modèle

- Date optionnelle rendue sous forme de chaîne vide au lieu de `null`.
- Échéance explicite omise parce qu’elle était identique à la date de facture.
- SIRET du destinataire attribué au fournisseur, y compris après une première consigne corrective.
- Citation de référence contenant le libellé « Facture n° », alors que le contrat attendait uniquement la référence.

Les prompts ont été précisés, mais la sécurité ne repose pas sur leur obéissance : **recalculer les preuves à partir de la source avant toute recherche fournisseur ou décision ERP**.

### Pourquoi l’identité fournisseur est critique

Le SIRET fourni par le modèle était effectivement utilisé par l’ancien code pour rechercher et prioriser un partenaire. Ce n’était pas une métadonnée inutilisée. Le laisser passer aurait pu sélectionner un mauvais tiers.

`collectSupplierIdentity` / `validateSupplierIdentity` attribuent les rôles depuis des zones reconnues et valident les identifiants admissibles. Si un identifiant fournisseur n’est pas disponible dans ces zones, le laisser vide ; ne pas récupérer celui du client ni injecter un oracle visuel dans l’extraction.

### Contrôles indépendants nécessaires

- Dates ISO et calendrier réel : rejeter par exemple un 30 février.
- Référence ancrée dans une citation et aux bonnes limites de mots ; normalisation contrôlée des espaces/tirets, pas acceptation de suffixes arbitraires.
- Inventaire indépendant des lignes, y compris celles à zéro.
- Bijection entre identifiants de lignes source et lignes extraites.
- Quantités/prix/montants/taux cohérents avec les preuves numériques.
- Citation fiscale obligatoire pour une exonération ou autoliquidation présentée comme imprimée.
- Revalidation du cache avec la source actuelle ; un ancien objet extrait ne doit pas contourner les gardes.
- Recalcul indépendant de la date d’échéance explicite : ne pas faire confiance à un champ préparé/modèle modifiable.

IONOS a prouvé l’importance des petites décimales de prix et des quatre lignes gratuites : enlever ces lignes conservait le total mais perdait de l’information.

## 9. PDF natif : pages complètes et limites des adaptateurs

- Avec le contrat n8n examiné, `joinPages: false` renvoie du texte par page ; `keepSource: 'both'` conserve les données utiles. Vérifier le moteur installé plutôt que supposer son identité avec une bibliothèque locale.
- Ne pas passer aveuglément `maxPages: 0` : sur le code amont examiné, cela pouvait empêcher l’extraction. L’option a été omise.
- Une chaîne globale non vide ne prouve pas que toutes les pages ont été lues. EDF avait une dernière page sans texte ; HUBIN était scanné.
- Des pages absentes, vides, répétées ou réordonnées doivent bloquer ou demander l’OCR.
- PyMuPDF et pdfjs peuvent restituer des ordres de texte différents. Une fixture fabriquée avec l’un ne prouve pas le comportement de l’autre.
- Le lecteur local a reproduit le parcours des items de texte du parseur étudié ; ce n’était pas une preuve de version du serveur n8n.
- Un caractère de police peut altérer la référence ou les séparateurs. Upcoop a nécessité une normalisation contrôlée ; ne pas inventer une information absente pour « réparer » tous les documents.

Les adaptateurs de lignes sont des **grammaires fermées de mise en page**, pas des détecteurs universels de fournisseurs. Une mise en page lisible mais non reconnue reste en revue. `complete: true` signifie que les pages ont été parcourues, pas que chaque pixel a été compris.

## 10. OCR : séparer le moteur, le transport, la transcription et la comptabilisation

### Ce que nous avions initialement surestimé

Le premier banc HUBIN n8n rejouait un OCR réalisé sur le poste. Il ne faisait **pas** tourner l’OCR sur le serveur. Une réponse du worker en boucle locale ne prouvait pas non plus son accessibilité depuis n8n.

Un worker privé RapidOCR a été exploré puis **supplanté par le choix opérateur d’utiliser le même modèle/relais que la recette d’extraction**. Ses fichiers restent historiques ; ne pas recommencer à l’héberger comme si cette décision était encore ouverte.

### Ce qui a été vérifié ensuite

- Le V3 a envoyé le vrai PDF scanné au modèle existant via un contenu fichier PDF en base64.
- Le modèle et son credential ont été lus dans la recette réelle, pas renommés d’après un souvenir de conversation.
- La compatibilité de ce transport a été confirmée par un appel réel pour l’avis HUBIN mono-page.
- La réponse a été contrôlée : HTTP, JSON, `finish_reason`, absence de refus, nombre/ordre des pages, indicateur de lisibilité, tailles et texte non vide.
- Les champs essentiels ont été comparés visuellement à l’image d’origine.

Ce succès n’établit ni une précision OCR générale, ni le support de tous les PDF ou de toutes les pages d’un dossier.

### Coûts et diagnostic

Un plafond de tokens n’est pas un plafond monétaire. Un en-tête de coût du relais n’est pas une facture indépendamment vérifiée. Un échec après l’appel peut avoir été facturé ; ne pas relancer automatiquement.

Ne pas confondre `llmCalled` et `llmValidationSucceeded` : un échec de validation après une réponse parsée prouve un appel, même si le résultat est refusé. Si le transport échoue sans preuve suffisante, conserver l’incertitude, pas un faux `false`.

## 11. Cas HUBIN : source inconnue et dérivation comptable doivent rester distinctes

Le PDF d’avis porte un loyer, des charges et un montant demandé, **pas une preuve imprimée d’exonération ni un HT/TVA détaillé**.

Le module `rent-notice-adapter.mjs` sépare :

1. **Source** : `RENT_DUE_NOTICE`, émetteur/destinataire, référence, dates/période, postes et total imprimés ; TVA/HT source inconnus.
2. **Projection comptable** : politique explicitement configurée d’après le référentiel production, catégorie/compte/taxe DEMO vérifiés, opération d’achat en brouillon.

La quantité comptable de 1 par poste de période est une normalisation dérivée, pas une quantité prétendument imprimée. Le taux ERP zéro est une décision de configuration, pas une citation fiscale fabriquée. Le document comptable peut être projeté en INVOICE tout en conservant `sourceDocumentType = RENT_DUE_NOTICE` et l’origine de la dérivation.

La grammaire est volontairement limitée : avis français mono-page, référence et dates explicites, deux postes positifs loyer/provision, total exact, rôles non ambigus. Titres d’avoir, négatifs, remises, TVA imprimée, postes supplémentaires, ambiguïtés et multi-pages non pris en charge bloquent.

Pour cette grammaire déterministe, une transcription OCR conforme suffit à préparer la projection : pas besoin d’un **second appel LLM** pour réextraire les mêmes champs. Le validateur reparse la source indépendamment avant la prise du mutex.

## 12. Multi-pièces, avoirs, remises et arrondis : les pièges à conserver en mémoire

### PDF multi-pièces HUBIN

Trois pages ne signifiaient pas trois factures : lettre justificative, avoir, avis d’échéance. La lettre est un support, pas une troisième pièce comptable.

- Ne pas compenser implicitement l’avoir et le loyer en un seul net à payer.
- Un montant imprimé positif sur un avoir correspond à une diminution économique de dette. Le type de document commande la logique ; un libellé générique « Total à payer » ne doit pas inverser l’avoir.
- La lettre rapprochait un crédit, mais ne prouvait pas la référence de la facture d’origine requise pour son rattachement.
- Aucun DONE global si une pièce financière reste en erreur ou en revue.
- Les clés de diagnostic de pages ne sont pas un mécanisme persistant de reprise par pièce. Le scénario complet R1/R2 n’est pas acquis.
- L’échéance du second avis HUBIN a été corrigée après lecture du pied de page : la date d’émission n’était pas sa date d’échéance. Préserver l’audit de correction ; ne pas remettre une ancienne valeur pour satisfaire une fixture.

### Remises et précision

- Exemple observé : prix 2250, remise 5 %, net 2137,50. Le net ne doit pas être confondu avec un prix brut sans remise.
- Le modèle ne doit ni omettre ni inventer une remise sans preuve indépendante.
- Les décimales de prix/quantité peuvent dépasser deux chiffres ; les montants comptables restent arrondis selon le contrat convenu.
- Les helpers locaux utilisent une arithmétique entière et des limites de précision explicites. Cela n’établit pas encore l’équivalence à tous les arrondis ERP réels.
- Des taux différents peuvent coexister sur une même facture ; un compte ou `taxCode` unique forcé pour toutes les lignes est incorrect.

## 13. n8n : le vert technique n’est pas le succès métier

### Erreur fondamentale de diagnostic

La branche d’erreur centralisée peut se terminer normalement. L’interface n8n affiche alors une exécution verte alors que le document est refusé ou incomplet.

**Lire le résultat métier final**, puis vérifier indépendamment ERP, PDF, mutex et Drive. `ok: true`, `recipePassed`, `DONE` et « brouillon conforme » ont des sens différents suivant la recette ; ne pas les interchanger.

### Tests webhook : le bouton compte

- « Listen for test event » sur le seul nœud webhook peut ne capturer que ce nœud.
- Pour la chaîne complète : rafraîchir après une publication, puis bouton **global Execute workflow / Exécuter le workflow** ; pour un webhook de test, attendre le message d’attente de l’URL.
- Une URL `/webhook-test/` suppose un listener actif et un essai contrôlé ; ne pas utiliser une URL de production pour contourner son absence.
- Le workflow peut rester **inactif** pour un test manuel. Ne pas activer/publier automatiquement pour « essayer ».
- Un test ne doit être envoyé qu’une fois. Après timeout ou réponse ambiguë, vérifier l’état avant toute relance.

### Rétention désactivée

La CLI `execution last` a renvoyé `error: no execution found for workflow ...` malgré des essais manuels connus. La rétention volontairement désactivée expliquait l’absence de trace récupérable.

Ne pas inventer d’endpoint privé d’exécution, ni activer la conservation de payloads sensibles pour faciliter le diagnostic. Demander la sortie terminale ou le nœud précisément identifié ; éviter une longue chasse visuelle où l’opérateur copie seulement une recherche réussie.

Un événement générique `SYSTEM_ERROR:ERROR:1` peut être mis à jour : son `createdAt` de ligne n’est pas nécessairement l’heure de l’essai courant. Comparer `event_json`, `updatedAt`, propriétaire du mutex et état ERP.

## 14. Expressions n8n : validation statique ≠ compilation réelle

### Défaut reproduit

Plusieurs expressions pourtant passées par la validation CLI ont échoué au compilateur local compatible n8n :

- `Line 1: Unexpected token )`
- `Line 1: Unexpected end of input`
- `null does not match type Pattern`

Les JSON/objets compacts comportant des accolades fermantes adjacentes pouvaient fermer prématurément le délimiteur `}}`. Des parenthèses seules n’ont pas corrigé le problème. Un helper embarqué avec `catch` optionnel a également échoué dans ce contexte.

### Correction et règle pratique

- Sérialiser proprement les JSON statiques avec des retours à la ligne.
- Dans le formateur testé, séparer **toutes** les accolades adjacentes avec `.replace(/}(?=})/g, '} ')` ; un simple remplacement par paires laissait des triples accolades problématiques.
- Éviter d’injecter de gros helpers et des syntaxes non vérifiées dans une expression HTTP ; privilégier une expression simple et un contrôle explicite.
- Compiler les expressions et exécuter les Code générés avec une entrée représentative, en plus de `workflow validate --strict`.
- Dans un contexte de test Tournament construit manuellement, fournir les globals standards nécessaires. Une erreur `JSON` absent dans le mock n’est pas automatiquement une erreur du workflow serveur.

Le Tournament local épinglé a reproduit les anciens défauts. Ce n’est pas une identification de la version exacte installée sur n8n.

## 15. Publication CLI : ne pas confondre création, remplacement et exécution

- `workflow build ... --push` **crée un nouveau workflow**.
- `workflow push <id> --file ...` **remplace un workflow existant**.
- Validation, dry-run, publication, activation et déclenchement sont des actes distincts, avec des permissions distinctes.
- Les commandes d’exécution disponibles ne permettaient pas un lancement manuel par la CLI utilisée. Ne pas inventer une commande ou un endpoint pour remplacer le clic opérateur.
- La forme du dry-run dépend de la commande : le build observé renvoyait `workflow`, le push `payload`. Inspecter l’enveloppe au lieu de supposer.

### Séquence de publication fiable

1. Lire le workflow distant et sa version ; conserver un rollback.
2. Comparer la logique critique à la base attendue, pas à une ancienne copie dont on ignore les changements.
3. Générer localement, tester, valider strictement, dry-run.
4. Fusionner seulement les nœuds/paramètres autorisés dans la représentation distante actuelle.
5. Recontrôler la version juste avant l’unique écriture ; conserver un marqueur d’intention avant une opération non idempotente.
6. Relire et comparer nœuds, paramètres, connexions, settings, credentials par type/ID, statut inactif ; vérifier les workflows hors périmètre.

### Normalisations qui ont produit de faux écarts

- L’API enrichit parfois un credential de son nom : comparer son identité/type, pas seulement la forme complète d’un ancien dictionnaire.
- Des sauvegardes UI ont ajouté des paramètres par défaut sans changer la logique.
- Le dry-run CLI a omis le setting serveur `binaryMode`, alors que la lecture distante le présentait. Il a fallu distinguer cette omission de représentation et **exiger sa conservation effective au readback**, pas ignorer toutes les différences de settings.
- Des helpers incorporés dans plusieurs expressions peuvent différer sans être appelés à cet endroit. Inspecter la différence ; ne pas remplacer tous les nœuds pour synchroniser du texte inutilisé.

## 16. Idempotence : un contrôle préalable de doublons n’est pas un verrou

Deux exécutions peuvent toutes deux constater « absent », puis créer deux documents. Les probes locaux l’ont démontré. Un flag `allowCreate` ne fournit aucune garantie atomique.

### Parcours du chantier

- Le générateur commun a d’abord bloqué les nouvelles créations avec `NEW_DOCUMENT_REQUIRES_ATOMIC_RESERVATION`.
- Un prototype à brouillon réservé a permis d’étudier la mise à jour contrôlée par ID/version, sans prétendre résoudre la création générique.
- Le V3 DEMO a ensuite acquis un mutex ERP technique fondé sur un enregistrement versionné et un journal durable.

### Ce qui a réellement été prouvé

Deux sauvegardes concurrentes sur la **même version** du record technique : une réussissait, l’autre était refusée. Cela prouve le verrouillage optimiste de cet objet avec le client testé, pas à lui seul toutes les races possibles d’une facture.

La création du record technique a aussi nécessité un MetaJsonModel valable : une création de record sans `jsonModel` et une première définition de modèle trop ambitieuse ont échoué. Les requêtes de contrôle ont confirmé l’absence avant une nouvelle tentative minimale. Les contrats actuellement utiles sont documentés par `Work_data/lot2/v3-creation-gate.json` et le générateur, pas par une supposition sur MetaJsonRecord.

### Invariants du mutex V3

- Scope DEMO, société, nom/modèle/ID technique vérifiés.
- Acquisition CAS par `id` + version ; propriétaire lié à l’exécution et au SHA source.
- Recherche de doublons fraîche **après** possession confirmée.
- Clé métier conservée société/fournisseur/opération/référence normalisée. Ne pas ajouter le type source de l’avis pour autoriser accidentellement un doublon de facture.
- Journal COMPLETE empêchant une recréation même si une recherche ultérieure omet le document.
- Pas de prise de contrôle automatique par TTL ; pas de nettoyage aveugle de BUSY.
- Un concurrent perdant ne déplace pas le PDF et n’écrase pas le statut du gagnant.
- Libération CAS et reçu relu avant DONE ; ne pas s’arrêter à la réponse de sauvegarde.

Ce mutex reste limité aux participants V3 qui l’utilisent. Le journal est borné ; ne pas annoncer une reprise ou une capacité infinie.

## 17. Reprise sûre d’un échec partiel

**Ne pas remettre à zéro le registre, supprimer le brouillon, vider le journal ou recopier le PDF pour contourner un échec.**

Séquence appliquée avec succès :

1. Obtenir une preuve que l’exécution concernée est terminale.
2. Identifier son propriétaire de mutex et son SHA ; lire les documents et pièces déjà créés.
3. Corriger le défaut sur le **même brouillon**, avec intention d’écriture conservée et version fraîche.
4. Relire strictement en-tête, lignes, taxes, échéancier et unicité ; contrôler le PDF s’il existe.
5. Réconcilier seulement cette entrée PENDING en **RECONCILED**, pas COMPLETE, puis libérer par CAS.
6. Garder la piste d’audit et les dates source/ERP ; ne pas déclarer un succès tant que la chaîne n’est pas terminée.
7. La prochaine exécution rejoint le chemin commun REUSE, vérifie ou réutilise la pièce puis termine les étapes restantes.

Un contrôle local a faussement déclaré le readback du mutex différent parce que les clés JSON avaient été réordonnées côté ERP. La correction était une **comparaison sémantique canonique**, pas une seconde écriture. Toujours distinguer échec de mutation et échec de vérification locale après mutation.

## 18. Pièces jointes : une relation n’est pas une preuve de contenu

### Ce qui était insuffisant

La présence d’une MetaAttachment et d’une MetaFile ne prouvait pas que le PDF joint était le bon. Une valeur `verified: true` fournie par un appelant ou un hash du fichier local ne prouve pas le contenu distant.

### Chaîne vérifiée

- Calculer le SHA-256 sur les octets du PDF original, pas sur le texte ou un extrait de page.
- Conserver ce lien jusqu’à l’upload et au rattachement.
- Vérifier la portée de la relation, l’unicité et la complétude de la recherche.
- Télécharger la MetaFile réellement rattachée et comparer son SHA aux octets d’origine avant DONE.
- Une pièce existante conforme se réutilise ; ne pas réuploader à chaque reprise.

Chemin observé : `/ws/rest/com.axelor.meta.db.MetaFile/{id}/content/download`.

### Piège HTTP concret

`Accept: application/pdf` a renvoyé **406 avec un corps vide** sur cette installation. Le client Axelor existant utilisait `Accept: */*` ; cette valeur a permis le téléchargement.

Contrôler le HTTP **avant** de lire/hacher le corps : `REMOTE_PDF_DOWNLOAD_HTTP_406` n’est pas `REMOTE_PDF_HASH_MISMATCH`. Une ancienne fiche recommandant `application/pdf` ne doit pas prévaloir sur ce résultat réel.

### Binaire n8n

Selon le mode de stockage, `binary.data` peut être une référence filesystem plutôt que les octets base64. Utiliser `this.helpers.getBinaryDataBuffer` lorsque nécessaire. Restaurer le binaire original immédiatement avant l’upload ; vérifier le téléchargement à partir de son entrée effective, pas d’un binaire ancien resté dans le contexte.

## 19. Drive : sélectionner le bon PDF et ne pas toucher à l’original

- Un ancien `pilotDriveFileId` pointait sur une facture fictive déjà dans DONE. Ne pas croire un nom de configuration : lire les métadonnées et, si nécessaire, le contenu.
- Le code initial n’appliquait pas réellement ce pilot ID ; il pouvait choisir le premier fichier admissible ou un fallback de reprise. Modifier uniquement la valeur de configuration n’aurait pas forcé le bon test.
- Le pilotage contrôlé doit refuser un autre ID fourni par webhook et bloquer si la copie sélectionnée manque ; pas de sélection arbitraire de secours.
- Copier le PDF réel dans un sandbox autorisé, garder l’original intact, distinguer une copie OCR de preuve et une copie d’essai comptable.
- Vérifier après exécution le parent réel de la copie, pas seulement un événement annonçant DONE.
- Un premier `list` de 100 éléments ne constitue pas l’inventaire complet d’un dossier : pagination à poursuivre si l’objectif l’exige.
- Une URL de téléchargement temporaire n’est pas un emplacement durable.
- Un avertissement de l’outil disant que le fichier n’est pas public n’impose **aucun changement de partage** pour ce chantier authentifié. Ne jamais rendre public un PDF pour faire disparaître ce message.

## 20. Méthode de travail : ce que nous devons faire plus simplement

### Les détours à ne pas reproduire

- Multiplier les prototypes, scripts et fichiers a retardé l’objectif opérateur. Isoler un risque est utile, mais il fallait revenir plus tôt au V3 commun.
- Créer un worker OCR alors que l’opérateur souhaitait réutiliser le modèle existant a ajouté un hébergement inutile. Clarifier le choix avant de construire une infrastructure.
- Insister sur le prompt sans verrou source a reproduit l’erreur d’identité du fournisseur.
- Guider l’opérateur de panneau en panneau sans savoir quel nœud avait échoué a fait perdre du temps.
- Demander à nouveau la validation de choix comptables déjà examinés a confondu décision métier et raccordement technique des IDs DEMO.
- Un niveau de sécurité pertinent ne justifie pas des branches de reprise par nœud, des workflows par fournisseur ou une batterie complète après chaque petite correction.

### Routine minimale recommandée

- Une question ou un défaut précis → lecture ciblée → correction locale commune → test ciblé existant → validation stricte → publication ciblée autorisée → un essai manuel → relecture indépendante.
- Réutiliser les scripts et tests existants ; ajouter un fichier seulement si une responsabilité nouvelle ou une preuve durable le justifie.
- Conserver un pipeline, l’alternance I/O–Code–I/O sur le main, un corridor d’erreur central et peu d’écritures Data Table.
- Donner une consigne opérateur concrète et unique ; expliquer clairement ce qui est créé, corrigé ou encore bloqué.

### Pièges du poste Windows

- Préfixer les commandes shell par `rtk` ; utiliser `rtk proxy` si une commande n’est pas supportée ou si sa sortie doit rester brute.
- `Work_data` est ignoré par Git et souvent par les recherches respectant `.gitignore`. Une absence de résultat n’est pas une absence de fichier.
- `rtk ls` a échoué sur ce poste faute d’exécutable `ls`. Utiliser le canal adapté, pas répéter la commande.
- Les chaînes imbriquées PowerShell/Python/JS et les `$` sont fragiles. Éviter les montages à plusieurs niveaux ; employer les outils de lecture/édition ou un appel simple.
- Forcer UTF-8 pour lire/écrire les JSON et, si nécessaire, pour stdout Python : cp1252 a provoqué des `UnicodeEncodeError` et une transmission shell a transformé du texte OCR en `?`.
- Ne pas réparer une donnée source corrompue en ajustant l’oracle : restaurer les caractères depuis la source vérifiée.
- Une lecture d’outil peut être tronquée. Ne pas tenter `JSON.parse` sur la sortie tronquée d’un gros workflow ; parser le fichier complet localement et sortir seulement les champs utiles.
- Une modification exacte qui échoue n’autorise pas à supposer qu’elle est appliquée ; vérifier le bloc ciblé et réessayer proprement.

## 21. Checklist pour la prochaine facture réelle

### Avant

- [ ] Environnement/session explicitement confirmés ; autorisation dans le bon périmètre.
- [ ] PDF exact et copie de test contrôlée, pas un ancien pilot ou une source déjà DONE.
- [ ] Politique métier conservée et bindings de cet environnement vérifiés.
- [ ] Verrou IDLE ; sinon investigation de l’exécution propriétaire, pas de reset.
- [ ] Recherche complète et normalisée des doublons ; brouillon existant inspecté.
- [ ] Régime TVA du compte et taxes compatibles ; échéancier prévu si date source explicite.
- [ ] Diff ciblé, tests adaptés, expressions compilées, validation stricte et readback.

### Après

- [ ] Résultat métier terminal, pas seulement interface verte.
- [ ] Un seul document, bon fournisseur/société/type, encore brouillon si prévu.
- [ ] Lignes, comptes, produits, remises, taxes, totaux et dates conformes ; relations intégralement relues.
- [ ] Date source et éventuel défaut ERP non confondus ; échéancier cohérent.
- [ ] Une seule pièce pertinente, contenu distant haché et identique à l’original.
- [ ] Reçu de mutex COMPLETE et IDLE ; copie réellement dans DONE.
- [ ] Preuves sauvegardées sans secrets ; limites explicitement annoncées.

## 22. Carte des preuves et fonctions à retrouver, sans réexplorer tout le dépôt

| Sujet | Référence ciblée |
|---|---|
| État réel et limites V3 | `Work_data/lot2/Bilan-integration-V3.md` |
| Génération commune V3, mutex, branches OCR, échéancier | `Work_data/lot2/build-v3-integrated.mjs` — `buildV3`, `applyDemoCreation`, `creationGateRow`, `planDemoCreationClaim`, `heldDemoCreation`, `permitDemoCreation`, `demoExpectedPiece`, `planDemoCreationRelease`, `withExplicitDueDateTerm`, `selectControlledPilot`, `readModelTranscription` |
| Derniers contrôles ciblés | `Work_data/lot2/test-v3-integrated.mjs`, `Work_data/lot2/v3-integration-test-results.json` |
| Source d’avis vs projection ERP | `Work_data/lot2/rent-notice-adapter.mjs` — `collectRentNotice`, `projectRentNotice` |
| Politique comptable, prix/remises, recherches et réutilisation | `Work_data/lot2/accounting-policy.mjs` — `discountedLine`, `resolveAccountingLines`, `buildAccountingDraft`, `buildAccountingSearchBodies`, `verifyReusableInvoice`, `decideAccounting` |
| Source documentaire et valeurs | `Work_data/lot2/document-guards.mjs` — `prepareDocumentEvidence`, `validateInvoiceEvidence` |
| Inventaire natif | `Work_data/lot2/native-evidence-adapter.mjs` — `buildNativeEvidence` |
| Rôles fournisseur/client | `Work_data/lot2/supplier-identity-guards.mjs` — `collectSupplierIdentity`, `validateSupplierIdentity` |
| Échéance source explicite | `Work_data/lot2/due-date-guards.mjs` — `collectExplicitDueDate`, `validateExplicitDueDate` |
| Corpus et corrections documentaires | `Work_data/lot2/reference-cases.json`, `Work_data/lot2/Cas-reference-lot2.md`, `Work_data/lot2/hubin-reference-correction.json` |
| Métier conservé / IDs DEMO | `Work_data/lot2/accounting-choices.reference.json`, `Work_data/lot2/accounting-policy.demo.json`, `Work_data/lot2/Bilan-raccordement-demo.md` |
| OCR réel et copie choisie | `Work_data/lot2/v3-ocr-scan-test.json`, `Work_data/lot2/v3-hubin-autosaisie.json` |
| Création du verrou et preuve CAS | `Work_data/lot2/v3-creation-gate.json` |
| Correction régime TVA du compte | `Work_data/lot2/v3-demo-vat-account-correction.json` |
| Dernière publication de correction d’échéancier | `Work_data/lot2/v3-hubin-term-fix-readback.json`, `Work_data/lot2/v3-hubin-autosaisie.json` |
| PDF ERP indépendamment téléchargés | `Work_data/lot2/real-recipes/` — ne pas les confondre avec un binaire simulé de test |
| Contrat du client HTTP Axelor | `src/services/axelorClient.ts` — `save`, `downloadFile` |
| Service de données et actions | `src/services/dataService.ts` — `saveRecord`, `runAction` |

**Règle finale : conserver la connaissance, pas la présomption.** Une preuve historique évite de refaire une erreur ; elle ne remplace pas la vérification de l’état courant et ne donne aucune permission nouvelle.
