# Axelor REST API Cheatsheet

Reference guide for MCP tools and AI agents querying Axelor Open Suite.

---

## 1. Authentication & Security
- **Login**: `POST /login.jsp` with `username` and `password` (`application/x-www-form-urlencoded`).
- **Session**: Retain `JSESSIONID` cookie across requests.
- **CSRF**: Read `CSRF-TOKEN` cookie and send back via `X-CSRF-Token` header.
- **Mandatory Headers**:
  - `Accept: application/json`
  - `Content-Type: application/json`

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

### Sample Response:
```json
{
  "status": 0,
  "total": 1,
  "data": [
    { "id": 12, "name": "crm.lead", "title": "Leads" }
  ]
}
```

---

## 3. Menu Tree Metadata (`com.axelor.meta.db.MetaMenu`)
- **Key Fields**: `id`, `name`, `title`, `parent`, `action`, `order`.
- **Breadcrumb Resolution**: Traverse recursively from leaf menu (`parent != null`) to root parent to reconstruct UI navigation paths.

---

## 4. View & Form Metadata (`com.axelor.meta.db.MetaView`)
- **Key Fields**: `id`, `name`, `title`, `type` (`form`, `grid`), `model`, `xml`.
- **Usage**: Parse XML definitions to extract `<field name="...">` tags and associated human labels (`title="..."`).
