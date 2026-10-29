---
name: axelor-xml-data-import
description: "Author and validate Axelor ERP XML binding files for CSV imports: bindings, adapters, repo lookups, M2M, sequences, attrs, checks, and Excel helpers."
disable-model-invocation: true
---

# Axelor XML Data Import & Binding Builder

Génération et validation strictes des fichiers XML de liaison CSV Axelor ERP.

## 0. Auto-Binding & Minimalist XML (Zero-Bloat Rule)

Pour l'import classique CSV/XML, l'auto-binding ci-dessous a été observé notamment dans les tâches #4023 et #5691. Vérifier le comportement sur la version et l'instance cibles avant de le généraliser :

1. **Auto-binding direct (`column = field`)** : Une colonne correspondant au champ Java peut être mappée sans `bind` explicite.
2. **Dot-notation ManyToOne (`rel.field`)** : Des colonnes telles que `status.id` et `businessProjectType.id` ont permis de retrouver et associer des entités liées sans `bind` explicite dans les cas observés.
3. **Paramètre de recherche (`:nom_colonne`)** : `search="self.id = :id"` a utilisé la colonne CSV `id` dans les cas observés ; vérifier les correspondances et le comportement sur la cible.
4. **Pattern Minimaliste Ultra-Court (Self-Closing)** :
   ```xml
   <!-- Exemple d'import/mise à jour : vérifier sur la version cible -->
   <input file="update_tasks.csv" separator=";" type="com.axelor.apps.project.db.ProjectTask" search="self.id = :id" update="true"/>
   ```

> ⚠️ **Règle d'or :** N'utiliser les balises `<bind>` que si nécessaire (transformation Groovy `eval`, adaptateur `adapter="LocalDate"`, split ManyToMany `\|`, ou alias de colonne différent du modèle).

## Contrôles de l'import classique CSV/XML

- Confirmer l'instance cible, le périmètre et le traitement des archivés ; vérifier l'existence et l'unicité des IDs cibles et des références avant toute mise à jour. Les IDs ne sont pas supposés identiques entre environnements.
- `search` et `update="true"` ne démontrent pas à eux seuls qu'un ID absent ne créera jamais d'enregistrement : tester ce comportement sur la version cible avant de s'y fier. Ne pas présumer qu'un champ dérivé tel que `fullName` sera recalculé.
- Préparer et vérifier le lot en lecture seule ; toute exécution exige une autorisation explicite. Tester sur un petit périmètre autorisé avant le lot complet ; conserver l'état avant si un retour arrière est requis, sans prétendre qu'il est disponible ou testé.
- Consulter l'historique et les logs de l'import classique pour les réussites et anomalies, puis comparer les valeurs métier attendues au fichier réellement importé et aux données relues sur la cible. Un succès technique ne remplace pas ce contrôle.
- Ne pas relancer à l'aveugle après une erreur ou supposer qu'une réexécution est idempotente ; diagnostiquer l'état actuel et tester le comportement de reprise.

## 1. Schema & Adapters Blueprint

```xml
<?xml version="1.0" encoding="UTF-8"?>
<csv-inputs xmlns="http://axelor.com/xml/ns/data-import"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://axelor.com/xml/ns/data-import http://axelor.com/xml/ns/data-import/data-import_5.4.xsd">

  <adapter name="LocalDate" type="com.axelor.data.adapter.JavaTimeAdapter"><option name="type" value="LocalDate"/><option name="format" value="dd/MM/yyyy"/></adapter>
  <adapter name="LocalTime" type="com.axelor.data.adapter.JavaTimeAdapter"><option name="type" value="LocalTime"/><option name="format" value="HH:mm"/></adapter>
  <adapter name="LocalDateTime" type="com.axelor.data.adapter.JavaTimeAdapter"><option name="type" value="LocalDateTime"/><option name="format" value="dd/MM/yyyy HH:mm"/></adapter>
  <adapter name="DateTime" type="com.axelor.data.adapter.JavaTimeAdapter"><option name="type" value="DateTime"/><option name="format" value="dd/MM/yyyy HH:mm"/></adapter>

  <input file="data.csv" separator=";" type="com.axelor.apps.base.db.TargetModel" search="self.importId = :importId" update="true">
    <!-- Bindings -->
  </input>
</csv-inputs>
```

## 2. Binding Patterns

| Pattern | XML Binding | Notes / Constraints |
| :--- | :--- | :--- |
| **M2M pipe `\|`** | `<bind column="col" to="rel" search="self.code in :col" eval="col?.split('\\|') as List"/>` | Double échappement `\\|` requis |
| **Date/Time** | `<bind to="fieldDate" column="colDate" adapter="LocalDate"/>` | Adapters: `LocalDate`, `LocalTime`, `LocalDateTime`, `DateTime` |
| **Sanitize Decimals** | `<bind column="price" eval="price ? price.replace(',', '.') : null" to="price"/>` | Groovy inline replacement |
| **Repo Lookup (Root)** | `<bind to="companyBankDetails" eval="__repo__(Company).all().fetchOne()?.defaultBankDetails"/>` | Sans filtre |
| **Repo Lookup (Param)** | `<bind to="tax" eval="__repo__(Partner).all().filter('self.partnerSeq = ?', partner).fetchOne()?.taxNbr"/>` | Paramétré depuis colonne `partner` |
| **Case Insensitive** | `<bind column="cityName" to="city" search="UPPER(self.name) = UPPER(:cityName)" update="true"/>` | `UPPER(self.field)` dans le `search` |
| **Composite Search** | `<input file="f.csv" separator=";" search="self.project.code = :pCode AND self.name = :name" type="..." update="true"/>` | Définir sur l'élément `<input>` |
| **Studio Field (`$attrs`)** | `<bind to="$attrs.seller" search="self.importId = :sellerId" update="true"/>` | `update="true"` évite l'échec si cellule vide |
| **Studio MetaJsonRecord** | `<input file="f.csv" separator=";" type="com.axelor.meta.db.MetaJsonRecord" search="self.importId = :importId"/>` | CSV: `importId;name;jsonModel;attrs` |

## 3. Sequences

```xml
<!-- Via SequenceService (Document / Company / MetaModel) -->
<bind to="saleOrderSeq" eval="call:com.axelor.apps.base.service.administration.SequenceService:getSequenceNumber('saleOrder', __repo__(Company).all().filter('self.code = ?1', 'SNE').fetchOne(), SaleOrder.class, 'saleOrderSeq', __repo__(MetaModel).findByName('com.axelor.apps.sale.db.SaleOrder'))"/>

<!-- Via Repo Constant -->
<bind to="partnerSeq" eval="call:com.axelor.apps.base.service.administration.SequenceService:getSequenceNumber(com.axelor.apps.base.db.repo.SequenceRepository.PARTNER, com.axelor.apps.base.db.Partner, 'partnerSeq')"/>
```

## 4. Integrity Checks & Anomaly Logging

```xml
<!-- Mode 1: Standard check + message -->
<bind to="account" column="acc_code" check="account != null" check-message="Account :acc_code not found"/>

<!-- Mode 2: Direct Groovy ValidationException in check (logged as import anomaly) -->
<bind to="account" column="acc_code" check="account != null || { throw new javax.validation.ValidationException('Le compte ' + acc_code + ' nexiste pas') }()"/>

<bind to="saleProduct" 
      eval="__repo__(Product).all().filter('self.callCode = ?1 AND self.brand.code = ?2', Ref_fournisseur.toString().trim(), Code_marque.toString().trim()).fetchOne()" 
      check="__repo__(Product).all().filter('self.callCode = ?1 AND self.brand.code = ?2', Ref_fournisseur.toString().trim(), Code_marque.toString().trim()).fetchOne()?.id != null || { throw new javax.validation.ValidationException('Produit introuvable : ' + Ref_fournisseur + ' / ' + Code_marque) }()"/>
```

## 5. CSV Preparation (Excel 365/2021 M2M)

- Unique keys: `=UNIQUE(FILTRE(Tableau1[id]; Tableau1[id]<>""))`
- Concat with `|`: `=TEXTJOIN("|"; VRAI; UNIQUE(FILTRE(Tableau1[rel_code]; Tableau1[id]=A2)))`

## 6. Strict Rules
- Échappement XML obligatoire: `&` $\rightarrow$ `&amp;`, `<` $\rightarrow$ `&lt;`.
- `update="true"` obligatoire sur les bindings ou inputs pouvant contenir des valeurs nulles/vides.
- Utiliser `self.` pour tout ciblage de champ dans les requêtes HQL/JPQL (`search`, `filter`).
