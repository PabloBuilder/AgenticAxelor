# Axelor REST API Cheatsheet

Reference guide for MCP tools, n8n workflows, and AI agents interacting with Axelor Open Suite REST & DMS endpoints.

---

## 1. Authentication & Security

### A. Browser / MCP Bridge Session (Interactive Mode)
- Authentication is synced from the Chrome extension into `.session.json` (`JSESSIONID`).
- Standard JSON headers: `Accept: application/json`, `Content-Type: application/json`.

### B. Direct API / n8n Stateless Login (`POST /callback`)
- For external automations (n8n `HTTP Request`), authenticate via `POST {baseUrl}/callback`:
  - Body (`application/json`): `{ "username": "...", "password": "..." }`
  - Response header `set-cookie` contains `JSESSIONID=...` (extract `[Cookie.split(';')[0]]` and pass as `Cookie` header on subsequent calls).

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

---

## 3. Transactional Record Creation & Server-Side Compute (`POST /ws/action`)

Instead of chaining per-line `onchange` calls (which causes node bloat), create complex transactional documents (e.g., `com.axelor.apps.account.db.Invoice`) in **3 REST calls**:

1. **Create Draft with Pre-Populated Lines (`POST /ws/rest/{model}`)**:
   - Pass header fields (`company`, `partner`, `currency`, `operationTypeSelect`, `operationSubTypeSelect`, `invoiceDate`, `dueDate`, `supplierInvoiceNb`) and `invoiceLineList` with complete line fields (`product`, `account`, `description`, `qty`, `unit`, `price`, `priceDiscounted`, `taxLine`, `taxLineSet`, `taxCode`, `taxRate`, `exTaxTotal`, `inTaxTotal`, `companyExTaxTotal`, `companyInTaxTotal`).
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
   - Returns `data: [{ values: { exTaxTotal, taxTotal, inTaxTotal, invoiceLineTaxList, ... } }]`.
3. **Persist Computed Totals & Tax Lines (`POST /ws/rest/{model}`)**:
   - Re-read or pass current `id` + `version`, attach `values.invoiceLineTaxList` and computed totals (`exTaxTotal`, `taxTotal`, `inTaxTotal`, `amountRemaining`).

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
- **Idempotence Check**: Query `POST /ws/rest/com.axelor.meta.db.MetaAttachment/search` with `_domain: "self.objectId = :invoiceId and self.modelName = :modelName"` before uploading to avoid duplicate attachments on retry.

### Step 3: Download Binary Content (`GET /ws/rest/com.axelor.meta.db.MetaFile/{id}/content/download`)
- **Critical Header**: Must send `Accept: */*` (or `Accept: application/pdf`). Sending `Accept: application/json` triggers **HTTP 406 Not Acceptable**.

---

## 5. Menu & View Metadata (`MetaMenu` & `MetaView`)
- **`com.axelor.meta.db.MetaMenu`**: Fields `id`, `name`, `title`, `parent`, `action`, `order`. Traverse recursively from leaf menu (`parent != null`) to root to reconstruct UI breadcrumbs.
- **`com.axelor.meta.db.MetaView`**: Fields `id`, `name`, `title`, `type` (`form`, `grid`), `model`, `xml`.
