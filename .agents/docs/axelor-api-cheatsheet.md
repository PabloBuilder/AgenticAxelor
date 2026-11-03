# Axelor REST API Cheatsheet

Reference guide for MCP tools, n8n workflows, and AI agents interacting with Axelor Open Suite REST & DMS endpoints. Verify models, fields, authentication, and behavior on the target installation; examples are not production configuration or authorization to write. For invoice and n8n evidence and its limits, see [the lessons learned](retour-experience-axelor-n8n-factures.md).

---

## 1. Authentication & Security

### A. Browser / MCP Bridge Session (Interactive Mode)
- Authentication is synced from the Chrome extension into `.session.json` (`JSESSIONID`).
- Standard JSON headers: `Accept: application/json`, `Content-Type: application/json`.

### B. Direct API / n8n authentication
- n8n HTTP requests use their own protected credentials and ERP authentication; a successful MCP request does not prove that n8n can authenticate. Verify the target installation and credential compatibility before execution.
- A `POST {baseUrl}/callback` login is a possible installation-specific mechanism, not a universal or preapproved configuration. Never transfer the workstation's browser cookie to a workflow, print secrets, or store passwords in repository files. Use protected credentials and verify the actual authentication contract.

---

## 2. Generic Entity Query (`POST /ws/rest/{model}/search`)

Primary endpoint for searching business records and metadata tables.

### Sample Request:
```json
{
  "offset": 0,
  "limit": 20,
  "fields": ["id", "name", "title"],
  "sortBy": ["name"],
  "data": {
    "_domain": "self.name like :keyword or self.title like :keyword",
    "_domainContext": {
      "keyword": "%Sale%"
    }
  }
}
```

### Critical Contract Rules:
- **Empty Search Pitfall (`total === 0`)**: When no record matches, Axelor returns `{ "status": 0, "total": 0 }` **without a `data` array** (`res.data` is `undefined`, not `[]`). Always normalize:
  ```js
  const rows = Array.isArray(res?.data) ? res.data : (Number(res?.total ?? -1) === 0 ? [] : null);
  ```
- **Supported Operators**: Prefer simple JPQL predicates in `_domain` (`=`, `like`, `in`, `and`, `or`). Avoid unsupported SQL functions in `_domain` when a deterministic post-filter in code is safer.
- **Completeness and schema**: Resolve models and fields from the target installation, and paginate when a complete result is needed. A related list may contain only IDs and versions; read related records separately before comparing invoice lines or taxes. IDs and numeric selections are not portable between environments.

---

## 3. Transactional Record Creation & Server-Side Compute (`POST /ws/action`)

A possible pattern for transactional documents (e.g., `com.axelor.apps.account.db.Invoice`) is draft creation, server-side compute, then persistence. It is not a complete three-call safety procedure: discover the installed schema, obtain authorization, check existing records and concurrency, and perform the fresh reads and verification below. Do not blindly retry an ambiguous creation.

1. **Create Draft with Pre-Populated Lines (`POST /ws/rest/{model}`)**:
   - Resolve applicable header and line fields from the installed schema and business policy. On the examined installation, persisted invoice lines exposed `taxLineSet`; do not assume a singular `taxLine` is the InvoiceLine contract. Validate product, account, unit, discounts and taxes in context.
   - Re-read the persisted draft and its current `id` and `version` before compute: hooks may change the version during save.
2. **Execute Server-Side Compute (`POST /ws/action`)**:
   ```json
   {
     "action": "action-invoice-method-compute",
     "model": "com.axelor.apps.account.db.Invoice",
     "data": {
       "context": {
         "_model": "com.axelor.apps.account.db.Invoice",
         "id": 38,
         "version": 0
       }
     }
   }
   ```
   - A successful result may contain `data: [{ values: { exTaxTotal, taxTotal, inTaxTotal, invoiceLineTaxList, ... } }]`. Check HTTP status, application status, nested errors such as `data[0].error`, and required values before using them: HTTP 200 and `status: 0` alone are not proof of a successful compute.
3. **Persist Computed Totals & Tax Lines (`POST /ws/rest/{model}`)**:
   - Re-read the current persisted `id` and `version` immediately before the write. Persist only validated compute results, then independently re-read the draft, complete lines, taxes and totals.

**Due dates:** writing `Invoice.dueDate` alone did not persist the explicit source date on the examined installation: save recalculated it from `InvoiceTerm` or a default. A customized single 100% term was verified for the V3's restricted case; do not extrapolate it to multiple terms or currencies. Preserve source and ERP dates separately, do not invent a source date, and re-read the saved schedule. See [lessons learned, §6](retour-experience-axelor-n8n-factures.md#6-découverte-majeure--léchéance-dépend-de-léchéancier).

**Concurrency and reuse:** a search before creation is not an atomic lock. The V3 mutex applies only to participating workflows in its stated DEMO scope; it does not protect against humans or other programs. For reuse, compare the full relevant invoice, lines and taxes, not only totals. See [§16–17](retour-experience-axelor-n8n-factures.md#16-idempotence--un-contrôle-préalable-de-doublons-nest-pas-un-verrou).

---

## 4. Document Management System (DMS: `MetaFile` & `MetaAttachment`)

Attaching a binary file (PDF, image, etc.) to any Axelor business entity requires a 2-step sequence:

### Step 1: Upload Raw Binary (`POST /ws/files/upload`)
- **Payload**: Raw binary stream (`contentType: 'binaryData'`, `Content-Type: application/octet-stream`). Never wrap in JSON.
- **Mandatory Headers**:
  - `Cookie`: `JSESSIONID=...`
  - `Content-Type`: `application/octet-stream`
  - `X-File-Name`: `<filename.pdf>`
  - `X-File-Size`: `String(byteLength)` *(mandatory — upload fails without exact byte size)*
  - `X-File-Type`: `application/pdf`
  - `X-File-Offset`: `0`
- **Response Parsing**: May return either a direct `MetaFile` object `{ "id": 501, "fileName": "..." }` or `{ "status": 0, "data": [{ "id": 501 }] }`. Handle both shapes:
  ```js
  const metaFile = Array.isArray(res?.data) ? res.data[0] : (res?.id ? res : null);
  ```

### Step 2: Link `MetaFile` to Target Record (`POST /ws/rest/com.axelor.meta.db.MetaAttachment`)
```json
{
  "data": {
    "metaFile": { "id": 501 },
    "modelName": "com.axelor.apps.account.db.Invoice",
    "objectId": 38
  }
}
```
- **Reuse check**: Search `POST /ws/rest/com.axelor.meta.db.MetaAttachment/search` using the target object and model before upload; verify scope, completeness, uniqueness and actual content before reusing. This search alone neither prevents concurrent duplicate uploads nor proves the attachment contains the correct PDF.

### Step 3: Download Binary Content (`GET /ws/rest/com.axelor.meta.db.MetaFile/{id}/content/download`)
- On the examined installation, `Accept: application/pdf` returned HTTP 406 with an empty body; `Accept: */*` worked. Verify behavior on the target installation rather than assuming a universal header contract.
- Check HTTP success before reading or hashing the response. Download the actually linked MetaFile and compare its SHA-256 with the original PDF bytes before declaring the attachment verified; a link, local hash or caller-supplied flag alone is insufficient.
- In n8n, binary data may be a filesystem reference rather than base64 bytes. Use `this.helpers.getBinaryDataBuffer` where needed and ensure the original binary reaches the upload node. See [lessons learned, §18](retour-experience-axelor-n8n-factures.md#18-pièces-jointes--une-relation-nest-pas-une-preuve-de-contenu).

---

## 5. Menu & View Metadata (`MetaMenu` & `MetaView`)
- **`com.axelor.meta.db.MetaMenu`**: Fields `id`, `name`, `title`, `parent`, `action`, `order`. Traverse recursively from leaf menu (`parent != null`) to root to reconstruct UI breadcrumbs.
- **`com.axelor.meta.db.MetaView`**: Fields `id`, `name`, `title`, `type` (`form`, `grid`), `model`, `xml`.
