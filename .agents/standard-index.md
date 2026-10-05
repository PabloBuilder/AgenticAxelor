# Standard Operator & AI Agent Operational Index

Comprehensive routing map, decision trees, and token efficiency guidelines for operating Axelor ERP workflows via the AgenticAxelor MCP server.

---

## 1. Primary References & Setup
- **Onboarding & Setup Assistant**: [Setup Assistant Skill](skills/setup-assistant/SKILL.md)
- **User Documentation & Safety**: [README](../README.md)
- **Axelor REST API Cheatsheet**: [Axelor REST API Cheatsheet](../docs/axelor-api-cheatsheet.md)
- **Architectural Analysis & Critique**: [Read-Only Consultant Skill](skills/read-only-consultant/SKILL.md)
- **Optional Guidance Authoring**: [Axelor Guidance Builder Skill](skills/axelor-guidance-builder/SKILL.md)

---

## 2. Exhaustive MCP Tool Catalog (Categorized by Intent)

### A. Session & Authentication
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `sync_axelor_session` | Verify and adopt active browser session synced from the extension. | `{}` (no arguments) |

### B. Schema, Entity & ERD Introspection (Zero XML Guessing)
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `search_axelor_models` | Find entity models by keyword, table name, or package. | `query`, `packageName`, `limit` |
| `inspect_axelor_model` | Inspect JPA entity schema (fields, types, foreign keys, constraints). | `model`, `relationshipOnly` |
| `inspect_axelor_selections` | Introspect dropdown choices & status enums (`MetaSelect`). | `model`, `field`, `name`, `query` |
| `get_axelor_schema_relations` | Explore ERD dependencies (incoming & outgoing foreign keys). | `model`, `direction`, `relationshipType` |
| `inspect_axelor_custom_fields` | Inspect Studio JSON attributes (`attrs`), custom & transient fields. | `model`, `viewName` |

### C. UI, Views & Navigation
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `search_axelor_menu` | Find Axelor menu tree paths, action views, and breadcrumbs. | `keyword`, `limit` |
| `inspect_axelor_view` | Introspect XML view structures (panels, fields, widgets, buttons). | `viewName`, `model`, `viewType` |

### D. Data Query, Fetch & Extraction
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `query_axelor_data` | Search records with domain queries, sorting, and pagination. | `model`, `fields`, `domain`, `sortBy`, `limit` |
| `fetch_axelor_record` | Retrieve a single record by ID with specific or all fields. | `model`, `id`, `fields` |
| `export_axelor_data` | Bulk extract records with automatic pagination to CSV or JSON. | `model`, `fields`, `domain`, `format`, `outputPath` |

### E. Data Mutation, Calculations & Actions
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `simulate_axelor_onchange` | Dry-run field triggers (compute prices, taxes, UI attrs before save). | `model`, `record`, `field`, `action` |
| `save_axelor_record` | Create or update a single record (persists to database). | `model`, `record` |
| `batch_axelor_operations` | Execute sequential create, update, and delete in a single call. | `operations`, `continueOnError` |
| `delete_axelor_record` | Delete a single record by ID with optimistic lock verification. | `model`, `id`, `version` |
| `execute_axelor_action` | Run Axelor Action (method, attrs, group) via `/ws/action`. | `action`, `model`, `context` |

### F. Audit Trail & Compliance
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `get_axelor_audit_log` | Query historical field modifications, authors, and timestamps. | `model`, `recordId`, `userCode`, `limit` |

### G. GED, Reporting & BPM Workflows
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `get_axelor_attachments` | List DMS attached files and documents linked to a record. | `model`, `recordId`, `limit` |
| `upload_axelor_attachment` | Attach local disk files or inline content to an ERP record. | `model`, `recordId`, `fileName`, `localFilePath` |
| `download_axelor_attachment` | Download binary attachment file directly to disk or base64. | `fileId`, `outputPath`, `includeBase64` |
| `list_axelor_templates` | Discover print templates, BIRT/Jasper reports, and email templates. | `model`, `templateType`, `query` |
| `generate_axelor_report` | Generate and download PDF/Word/Excel reports (BIRT/Jasper). | `model`, `recordId`, `outputPath`, `templateId` |
| `get_axelor_bpm_state` | Introspect active BPMN workflow instances, stages, and tasks. | `model`, `recordId`, `instanceId` |

### H. Local Bridge Guidance (Retained)
| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `guide_axelor_path` | Compute and push navigation route to local Bridge state. | `target`, `mode` |
| `clear_axelor_guide` | Clear active route stored in local Bridge. | `{}` |

---

## 3. Agentic Decision Trees (How to Operate Without Guesswork)

### Workflow 1: Introspecting an Unknown Entity / Feature
```
1. search_axelor_models (find technical entity name, e.g. "SaleOrder")
2. inspect_axelor_model (inspect fields & relationship types)
3. inspect_axelor_selections (resolve dropdown/enum integer values like statusSelect)
4. inspect_axelor_custom_fields (check if dynamic Studio JSON 'attrs' exist)
5. get_axelor_schema_relations (understand foreign keys and child lines)
```

### Workflow 2: Safe Data Mutation & Creation
```
1. query_axelor_data / fetch_axelor_record (gather parent/partner/product context)
2. simulate_axelor_onchange (dry-run onchange actions to auto-calculate taxes, prices, attrs)
3. save_axelor_record OR batch_axelor_operations (commit validated payload to database)
4. get_axelor_audit_log (verify commit and log trace if compliance is required)
```

### Workflow 3: Reporting & Document Generation
```
1. list_axelor_templates (discover active BIRT/Jasper/Print templates for the model)
2. generate_axelor_report (generate PDF/DOC report and save directly to outputPath)
```

---

## 4. Token Economy & Operational Safety Rules

1. **Prefer Disk `outputPath` over `includeBase64`**:
   - Binary files (PDFs, DOCs, attachments) encoded in Base64 consume tens of thousands of LLM context tokens. Always pass `outputPath: "./output.pdf"` when downloading or generating documents.
2. **ERP Relational Deletion Order (LIFO)**:
   - When deleting business entities, delete dependent child records first to satisfy PostgreSQL foreign key constraints:
   - `StockLocationLineHistory` ➔ `StockLocationLine` ➔ `InvoiceLine` ➔ `Invoice` ➔ `StockMoveLine` ➔ `StockMove` ➔ `SaleOrderLine` ➔ `SaleOrder`.
3. **Session Security**:
   - Never paste session cookies into chat or code. Use the extension sync button.
