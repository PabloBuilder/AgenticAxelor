# Axelor Dedicated Nodes Contract

Technical reference for the native Axelor community node suite. Upstream: [`@axelor/n8n-nodes-axelor`](https://github.com/axelor/n8n-nodes-axelor).

---

## 1. Node Types & Capabilities

Declared under prefix `n8n-nodes-axelor-connect` in `n8n-axi` and target instance:

| Node Type | v | Core Purpose |
|---|:---:|---|
| `n8n-nodes-axelor-connect.axelor` | `1` | Action node: Record CRUD, DMS files/attachments, Run Action, Business Service Call, Make API Call |
| `n8n-nodes-axelor-connect.axelorPollTrigger` | `1` | Polling trigger on model `createdOn`/`updatedOn` |
| `n8n-nodes-axelor-connect.axelorTrigger` | `1` | Webhook trigger on record deletion (`com.axelor.connect.db.Webhook`) |
| `n8n-nodes-axelor-connect.axelorTool` | `1` | LangChain / AI Agent tool variant |

---

## 2. Authentication Boundary

- **Credential Type**: `axelorApi` (`baseUrl`, `username`, `password`).
- **Protocol**: HTTP Basic Auth against ERP instance (tested on `POST /callback`).
- **Invariant**: Strictly isolated from browser/Bridge `.session.json`. Never inject or extract workstation cookies into n8n nodes. MCP session success does not prove `axelorApi` validity.

---

## 3. Tool Routing: Dedicated Node vs Fallback

```
                    [Axelor I/O Need]
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
[Single / Flat Operation]             [Composite / OneToMany]
- Simple Record CRUD                  - Invoices + Lines
- DMS Upload / Download               - Orders + Lines
- Run Named Action                    - Complex Tree Mutations
       │                                       │
       ▼                                       ▼
`n8n-nodes-axelor-connect.axelor`      Fallback:
                                       1. `axelor` -> `Make API Call` OR
                                       2. `n8n-nodes-base.httpRequest`
```

- **Critical Constraint**: Dedicated node does **not** support `OneToMany` relations on record create/update.
- **Remedy**: Chain sequential child creates OR use `Make API Call` / raw `httpRequest` with nested JSON payload and compute triggers.

---

## 4. Operational Spec Patterns (n8n-axi TOON / JSON)

Exact parameter signatures for authoring `n8n-nodes-axelor-connect.axelor` nodes in specs:

### A. Search Records (`resource: record`, `operation: search`)
```yaml
params:
  SearchPartner:
    resource: record
    operation: search
    model: com.axelor.apps.base.db.Partner
    query: "self.isSupplier = true AND self.siren = :siren"
    returnAll: false
    limit: 1
    options:
      context:
        parameters[1]{key,value}:
          siren,={{ $json.extractedSiren }}
attrs:
  SearchPartner:
    credentials:
      axelorApi:
        id: <CREDENTIAL_ID>
        name: Axelor API
```

### B. DMS File Upload & Link (`resource: dms`)
```yaml
# Step 1: Upload binary buffer to DMS
params:
  UploadInvoicePDF:
    resource: dms
    operation: uploadFile
    inputDataFieldName: data # binary property name
    fileName: ={{ $json.fileName }}

# Step 2: Attach uploaded file to target record
params:
  AttachToInvoice:
    resource: dms
    operation: addAttachments
    model: com.axelor.apps.account.db.Invoice
    recordId: ={{ $json.invoiceId }}
    uploadIds: ={{ $json.fileId }}
```

### C. Generic REST Call (`resource: generic`, `operation: makeApiCall`)
Bypasses `OneToMany` limitation while keeping automated `axelorApi` authentication:
```yaml
params:
  CreateInvoiceTree:
    resource: generic
    operation: makeApiCall
    url: /ws/rest/com.axelor.apps.account.db.Invoice
    method: POST
    body: ={{ JSON.stringify({ data: $json.invoiceTreePayload }) }}
```

### D. Execute Axelor Action (`resource: generic`, `operation: runAction`)
```yaml
params:
  ValidateInvoice:
    resource: generic
    operation: runAction
    action: action-account-invoice-method-validate
    model: com.axelor.apps.account.db.Invoice
    context: ={{ { _model: 'com.axelor.apps.account.db.Invoice', id: $json.invoiceId, version: $json.version } }}
```

---

## 5. Integrity & Error Discipline

1. **Business Invariants Unchanged**: Dedicated node provides zero accounting guards, zero concurrency locks, and zero idempotency. Upstream checks (`IF Record Exists`, total reconciliations, mutex) remain mandatory.
2. **Error Trapping**: Set node `Settings > On Error > Continue (Using Error Output)` (`main:1`) to route Axelor API errors (`status: -1`) to central 4-node error collector without failing workflow silently.
