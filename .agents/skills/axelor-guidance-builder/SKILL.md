---
name: axelor-guidance-builder
description: "Author precise, user-centric step-by-step guidance routes (GuidanceRoute) for the Axelor Copilot HUD extension. Guarantees complete CRUD state-transitions, grouped copyable fields, and clear non-intrusive HUD steps."
---

# Axelor Guidance Builder

## 1. Universal Axelor UX & Execution Protocols

### A. Mandatory Pre-Flight MCP Introspection (CRITICAL HARD GATE)
- **ZERO Speculation / Hallucination**: NEVER write or push a guidance route based on guesses or assumed model/permission names.
- **Mandatory MCP Pre-Check**: Before authoring any step, ALWAYS query live Axelor database via MCP tools or programmatic check:
  1. Inspect existing records (`query_axelor_data` / `com.axelor.auth.db.*`): Check if targeted Groups, Users, or Roles already exist.
  2. Introspect exact technical permission names: Match exact strings in database (e.g. `perm.sale.SaleOrder.r`, `perm.account.Invoice.rwcde`).
  3. Validate exact menu paths & breadcrumbs (`search_axelor_menu`).
- If an entity already exists in database (e.g. Group `Comptabilité` ID 29), target its modification and selection rather than creating duplicates.

### B. Strict Input Typing & Database-Grounded Menu Titles (Zero Noise)
- **`fields[i].value` is ONLY for text/search inputs**: Must contain the exact literal string to type or search (e.g. `value: "perm.sale.SaleOrder.r"`).
- **Exact DB Menu Titles Only (CRITICAL)**: When targeting or listing Menus (`MetaMenu`), NEVER invent or translate names into French (e.g. NEVER write `"Ventes"`, `"Achats"`, `"Facturation"`). You MUST query/use the exact English database `title` stored in Axelor:
  - `CRM` (Title: `CRM`, Name: `crm-root`)
  - `Sales` (Title: `Sales`, Name: `sc-root-sale`)
  - `Purchases` (Title: `Purchases`, Name: `sc-root-purchase`)
  - `Invoicing` (Title: `Invoicing`, Name: `invoice-root`)
  - `Accounting` (Title: `Accounting`, Name: `account-root`)
- **NEVER put interactive controls in `fields`**: Checkboxes, radio buttons, switches, dropdown states, and action verbs belong strictly in `hint` or `explanation`.
- **Zero composite strings**: No prefixes (`"Modèle:"`), no labels, no multi-attribute notes in `value`.

### C. Permissions vs Roles Distinction & Full Technical Spec (CRITICAL)
- **Onglet 'Permissions' (Règles unitaires par modèle)**: Target this tab when assigning granular CRUD access on specific models (`perm.<module>.<Model>.<action>`).
- **Onglet 'Rôles' (Profils métiers groupés)**: Target this tab ONLY when binding pre-packaged Axelor roles (`Sale Read`, `Invoice User`, `Account Manager`).
- **Mandatory Complete Technical Spec on Permission Creation / Duplication**:
  When a step requires creating or duplicating a permission, NEVER provide only a random code. You MUST explicitly provide separate copyable fields and clear instructions for:
  1. **Source / Recherche**: Quel enregistrement ou modèle chercher pour dupliquer.
  2. **Nom / Code** (ex: `perm.partner.commercial.rwc`).
  3. **Objet / Modèle complet (Full Package Class)** (ex: `com.axelor.apps.base.db.Partner`).
  4. **Condition / Filtre** (ex: `self.user = :__user__` ou `self.clientPartner.user = :__user__`).
  5. **Cases à cocher CRUD explicites** :
     - `r` $\rightarrow$ Lecture seule (*Read*)
     - `rwc` $\rightarrow$ Lecture + Écriture + Création (*Read, Write, Create*)
     - `rwcde` $\rightarrow$ Droit complet (*Read, Write, Create, Delete, Export*)

### D. Relational Fields Strategy (Select vs Create)
- **Many-to-One / Many-to-Many Relations**: Always default to **Search/Select (🔍 / Autocomplete)** (`button:has(i.fa-search)`, `input.ax-suggest`) to bind existing catalog/system records and prevent SQL unique constraint violations.
- **One-to-Many Sub-items**: Target **Add `(+)`** ONLY for intrinsic sub-records created on the fly (e.g. Order Line inside a Sale Order, Invoice Line inside an Invoice).

### E. Universal FSM & Nested View Lifecycle
- **Consultation $\rightarrow$ Edit**: If modifying an existing record, always include the step to click **Modifier** (`.btn-edit`, `button:contains("Modifier")`) before attempting to edit fields or sub-tables.
- **Hierarchical Modal Decomposition**: Never flatten a sub-window. Always model:
  1. Modal Header/Inputs $\rightarrow$ 2. Sub-grid actions $\rightarrow$ 3. Modal Save/OK (`.modal button:contains("Ok")`) $\rightarrow$ 4. Parent Form Save (`.btn-save`).
- **Parent Persistence**: Always conclude any creation/edit flow with the parent **Enregistrer/Sauvegarder** step.

### F. Direct Delivery Protocol
1. Perform MCP Pre-Flight audit to extract exact database entities.
2. Write pure typed route in `src/guides/<name>Guide.ts` (exporting `GuidanceRoute`) and register it in `src/guides/index.ts`.
3. Execute injection via runner (`npx tsx src/cli/guidePusher.ts <guide-id>`).
4. Respond in chat with $\le 2$ sentences (file link + HUD injection confirmation). Zero theory/filler.

---

## 2. Schema Contract
```typescript
export interface GuidanceFieldInput { label: string; value: string; hint?: string; }
export interface GuidanceStep {
  id: string;
  type: "menu" | "button" | "field" | "tab" | "row";
  selector: string;
  fallbackSelectors?: string[];
  label: string;
  hint: string;
  breadcrumb?: string[];
  explanation?: string;
  fields?: GuidanceFieldInput[];
  valueHint?: string;
  fieldName?: string;
}
export interface GuidanceRoute {
  id: string;
  title: string;
  description?: string;
  currentStepIndex: number;
  totalSteps: number;
  steps: GuidanceStep[];
  createdAt: string;
}
```

## 3. Reference Guide Module (`src/guides/<name>Guide.ts`)
```typescript
import { GuidanceRoute } from "../types/guidance.js";

export const exampleGuide: GuidanceRoute = {
  id: "route_example",
  title: "Titre du guide",
  description: "Description concise du flux",
  currentStepIndex: 0,
  totalSteps: 2,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Ventes")), .nav-item:has(span:contains("Ventes"))`,
      label: "1. Menu Ventes",
      hint: "Étape 1/2 : Cliquez sur Ventes.",
      breadcrumb: ["Ventes"]
    },
    {
      id: "step_2",
      type: "field",
      selector: `.tab-pane.active input[name="name"]`,
      label: "2. Nom du Partenaire",
      hint: "Étape 2/2 : Saisissez le nom.",
      breadcrumb: ["Partenaires", "Nouveau"],
      fields: [{ label: "Nom", value: "Acme Corp" }]
    }
  ]
};
```
