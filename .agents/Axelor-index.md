# AXELOR OPEN SUITE INDEX

## Search Globs & Resource Structure
Never search Java code for UI/fields. Direct all queries to XML resources:
- **Menus & Navigation**: `axelor-open-suite/axelor-*/src/main/resources/views/*-menu.xml`
- **Actions & Workflows**: `axelor-open-suite/axelor-*/src/main/resources/views/*-action.xml` (or inside views)
- **Forms / Screens**: `axelor-open-suite/axelor-*/src/main/resources/views/*-form.xml`
- **Grids / Lists**: `axelor-open-suite/axelor-*/src/main/resources/views/*-grid.xml`
- **Domain Models & Fields**: `axelor-open-suite/axelor-*/src/main/resources/domains/*-domain.xml`
- **Selection Enums**: `axelor-open-suite/axelor-*/src/main/resources/views/*-selection.xml`
- **Custom Views (Kanban/Cards/Trees)**: `axelor-open-suite/axelor-*/src/main/resources/views/*-*.xml`

## Core Module Matrix

| Module Directory | Primary Domain / Functional Scope |
| :--- | :--- |
| `axelor-base` | Core system parameters, companies, partners/contacts, base configurations |
| `axelor-account` | General ledger, fiscal years, invoicing, tax rules, journal entries |
| `axelor-bank-payment` | Bank accounts, direct debit, payment orders, bank reconciliation |
| `axelor-cash-management` | Cash registers, cash entries, petty cash management |
| `axelor-budget` | Financial budgeting, budget distribution, line tracking |
| `axelor-sale` | Quotations, sales orders, customer pricing/discounts, sales reporting |
| `axelor-purchase` | Supplier requests, purchase orders, vendor pricing, receipts |
| `axelor-stock` | Inventories, stock moves, warehouses, batch/serial tracking, picking |
| `axelor-supplychain` | Stock forecasting, replenishment rules, cross-module supply chain logic |
| `axelor-production` | Manufacturing orders, bills of materials (BOM), work centers, routing |
| `axelor-project` | Project management, task tracking, timesheets, project billing |
| `axelor-contract` | Customer/supplier recurring contracts, renewals, automatic invoicing |
| `axelor-crm` | Leads, sales opportunities, customer events, pipeline analytics |
| `axelor-helpdesk` | Support tickets, SLA tracking, issue resolution workflows |
| `axelor-maintenance` | Maintenance equipment, work orders, preventive/corrective plans |
| `axelor-quality` | Quality control points, non-conformities, inspection sheets |
| `axelor-fleet` | Vehicle fleet management, vehicle logs, fuel, maintenance costs |
| `axelor-human-resource` | Employees, leave management, expense reports, HR settings |
| `axelor-talent` | Recruitment, skills matrix, career evaluations, training |
| `axelor-marketing` | Campaigns, mailing lists, newsletters, marketing segments |
| `axelor-gdpr` | Data privacy, subject consent, data erasure management |
| `axelor-client-portal` | External customer web portal views and endpoints |
| `axelor-supplier-portal` | External supplier web portal views and endpoints |
| `axelor-supplier-management` | Supplier onboarding, qualification, performance metrics |
| `axelor-intervention` | Field service, technician interventions, on-site planning |
| `axelor-mobile-settings` | Mobile client synchronization, UI overrides, offline profiles |

## Tracing Flow
```
User Label/Query
   │
   ▼
[*-menu.xml] ──(parent chain)──> Breadcrumb (App > Group > Menu)
   │
   └──(action="...")
         │
         ▼
   [*-action.xml / Action View]
         │
         └──(view name="...")
               │
               ▼
         [*-form.xml / *-grid.xml] ──> Technical UI Fields / Toggles
               │
               ▼
         [*-domain.xml] ─────────────> Database Columns, Types & Relations
```
