---
name: axelor-guidance-builder
description: "Author precise, user-centric step-by-step guidance routes (GuidanceRoute) for the Axelor Copilot HUD extension. Guarantees complete CRUD state-transitions, grouped copyable fields, and clear non-intrusive HUD steps."
---

# Axelor Guidance Builder

## 1. Universal Axelor UX & Execution Protocols

### A. Mandatory Pre-Flight MCP & View Introspection (CRITICAL HARD GATE)
- **ZERO Speculation / Hallucination**: NEVER write or push a guidance route based on guesses, assumed model names, or unverified UI fields.
- **Mandatory MCP Pre-Check**: Before authoring any step, ALWAYS query live Axelor database via MCP tools:
  1. **View & Panels Layout** (`inspect_axelor_view`): Audit the exact form hierarchy (which fields belong to `panel`, `panel-tabs`, accordion panels).
  2. **Live Records** (`query_axelor_data` / `com.axelor.*`): Check existing records to target modification instead of duplicate creation.
  3. **Exact Menu Paths** (`search_axelor_menu`): Match exact breadcrumbs and database menu titles.

### B. Visual Form Grounding (VFG) & Zero Floating Field Law
- **Complete Visual Pathing Required**: Every field action MUST follow the invariant syntax:
  `[Onglet / Panneau hôte] ➔ [Nom du Champ visible] ➔ [Valeur / Action]`
- **Zero Floating Fields**: NEVER provide a field value without specifying its host container when it is outside the main top-level form (e.g. NEVER write `{ label: "Opportunité", value: "Djelel" }` on an Event form; ALWAYS write *"Panneau 'Références' > Champ 'Lié à' = 'Opportunité' > Chercher 'Djelel'"*).
- **Context-First Parent Creation**: Whenever creating child/relational records (Events, Tasks, Order lines, Sub-contacts), ALWAYS instruct creation from the **Parent Record's dedicated Tab** (`Opportunité > Onglet 'Événements' > (+) Nouveau`) rather than navigating through global menus. This auto-binds relations with zero user search friction.
- **Strict Input Typing (Zero Noise)**:
  - `fields[i].value` is strictly for copyable literal text/search inputs.
  - Interactive toggles (checkboxes, radio buttons, dropdown state choices) belong strictly in `hint` or `explanation`.
  - Zero composite strings (no `"Modèle:"` prefixes in `value`).

### C. Permissions vs Roles Distinction & Full Technical Spec (CRITICAL)
- **Onglet 'Permissions' (Règles unitaires par modèle)**: Target this tab when assigning granular CRUD access on specific models (`perm.<module>.<Model>.<action>`).
- **Onglet 'Rôles' (Profils métiers groupés)**: Target this tab ONLY when binding pre-packaged Axelor roles (`Sale Read`, `Invoice User`, `Account Manager`).
- **Mandatory Complete Technical Spec on Permission Creation / Duplication**:
  When a step requires creating or duplicating a permission, explicitly provide separate copyable fields and clear instructions for:
  1. **Source / Recherche**: Quel enregistrement ou modèle chercher pour dupliquer.
  2. **Nom / Code** (ex: `perm.partner.commercial.rwc`).
  3. **Objet / Modèle complet (Full Package Class)** (ex: `com.axelor.apps.base.db.Partner`).
  4. **Condition / Filtre** (ex: `self.user = :__user__` ou `self.clientPartner.user = :__user__`).
  5. **Cases à cocher CRUD explicites** : `r` (Read), `rwc` (Read/Write/Create), `rwcde` (Full CRUD + Export).

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
