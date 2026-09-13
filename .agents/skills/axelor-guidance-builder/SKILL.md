---
name: axelor-guidance-builder
description: "Author precise, user-centric step-by-step guidance routes (GuidanceRoute) for the Axelor Copilot HUD extension. Guarantees complete CRUD state-transitions, grouped copyable fields, and clear non-intrusive HUD steps."
---

# Axelor Guidance Builder

Expert guidelines and strict architectural rules for constructing deterministic `GuidanceRoute` scenarios executed by the Axelor Copilot Chrome Extension.

---

## 1. Core Principles & User Experience

1. **Clear & Non-Intrusive Guidance**
   - The Copilot HUD assists the user without DOM hijacking or intrusive pulsing halos.
   - Every step must tell the user **exactly what to do** in 1 direct, imperative sentence (`hint`).
   - Technical explanations, context, or business rules must go into `explanation` ("💡 Bon à savoir").

2. **Grouped Input Principle (No Single-Field Fatigue)**
   - When multiple fields belong to the same screen, form, or modal dialog, **group them into a single step** using the `fields` array.
   - Never create 5 consecutive steps just to type First Name, Last Name, Email, Phone, and Address. Group them with copyable values (`fields: [{ label, value }, ...]`).

3. **Strict Axelor Lifecycle & State Transitions (FSM)**
   Axelor views follow strict read-only vs edit-mode constraints. An agent **must never skip state-transition steps**:
   - **Consultation $\rightarrow$ Modification**: If modifying an existing record, you **MUST** include the step to click the "Modifier" button (`.btn-edit`, `i.fa-pencil`, `button:contains("Modifier")`) before attempting to click tabs, edit fields, or add rows to sub-grids.
   - **Sub-Grid / Modal Isolation**: When creating an item in a relation (e.g. adding a contact to a supplier):
     1. Switch parent view to Edit mode if needed.
     2. Navigate to the relevant tab.
     3. Click the add button `(+)` in the sub-table.
     4. Fill the modal dialog fields (`fields: [...]`).
     5. Save and close the modal dialog (`Sauvegarder` / `OK`).
     6. **Save the parent form** (`Enregistrer` / `Sauvegarder` on the main view) to persist changes.

---

## 2. Schema Contract (`GuidanceRoute` & `GuidanceStep`)

```typescript
export interface GuidanceFieldInput {
  label: string; // e.g. "Nom complet", "Email pro"
  value: string; // Exact text to copy/paste
  hint?: string; // Optional context
}

export interface GuidanceStep {
  id: string;
  type: "menu" | "button" | "field" | "tab" | "row";
  selector: string; // Clean CSS selector or resilient fallback
  fallbackSelectors?: string[];
  label: string; // Short UI title (e.g. "Sous-onglet Contacts", "Formulaire Contact")
  hint: string; // Direct action directive: "Étape X/N : Cliquez sur..."
  breadcrumb?: string[]; // e.g. ["Fournisseurs", "Fiche Fournisseur", "Contacts"]
  explanation?: string; // "💡 Bon à savoir" advice, business context, or lifecycle note
  fields?: GuidanceFieldInput[]; // Table of copyable fields (≥ 1 fields)
  valueHint?: string; // Single copyable fallback if fields array omitted
  fieldName?: string; // Technical field identifier (e.g. "contactPartnerSet")
  action?: string; // Action directive
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

---

## 3. Mandatory Step Checklist

When generating a scenario, verify every item on this checklist:

- [ ] **Step 1: Navigation** $\rightarrow$ Starts from main lateral menu or search bar.
- [ ] **Step 2: Grid/Record** $\rightarrow$ Selects row or clicks "Nouveau".
- [ ] **Step 3: State Switch** $\rightarrow$ If modifying an existing record, clicks **Modifier**.
- [ ] **Step 4: Grouped Inputs** $\rightarrow$ All inputs for the active form/modal are grouped in `fields: [...]`.
- [ ] **Step 5: Modal Dismissal** $\rightarrow$ If inside a pop-up / modal, clicks **Sauvegarder** in the modal.
- [ ] **Step 6: Parent Persist** $\rightarrow$ Clicks **Sauvegarder / Enregistrer** in the main toolbar.
- [ ] **Step 7: Verification** $\rightarrow$ Final step confirms creation/update.

---

## 4. Reference Template (Complex Scenario with Sub-Modal)

```typescript
const supplierContactScenario: GuidanceRoute = {
  id: `route_supplier_contact_${Date.now()}`,
  title: "Ajouter un Contact Commercial à un Fournisseur",
  description: "Cycle complet avec bascule en mode édition, ouverture de modale et double sauvegarde.",
  currentStepIndex: 0,
  totalSteps: 7,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Achats")), .nav-item:has(span:contains("Achats"))`,
      label: "Menu Achats",
      hint: "Étape 1/7 : Cliquez sur le menu 'Achats' dans le menu latéral.",
      breadcrumb: ["Achats"],
      explanation: "Regroupe la gestion des fournisseurs, commandes et factures d'achat."
    },
    {
      id: "step_2",
      type: "menu",
      selector: `a:has(span:contains("Fournisseurs")), .nav-item:has(span:contains("Fournisseurs"))`,
      label: "Sous-menu Fournisseurs",
      hint: "Étape 2/7 : Cliquez sur 'Fournisseurs' pour afficher la liste de vos partenaires.",
      breadcrumb: ["Achats", "Fournisseurs"]
    },
    {
      id: "step_3",
      type: "row",
      selector: `.tab-pane.active .ax-grid-view tbody tr:first-child`,
      label: "Sélectionner le Fournisseur",
      hint: "Étape 3/7 : Cliquez sur la ligne du fournisseur à modifier.",
      breadcrumb: ["Fournisseurs", "Fiche Fournisseur"]
    },
    {
      id: "step_4",
      type: "tab",
      selector: `[role="tab"]:contains("Contacts"), .nav-tabs a:contains("Contacts")`,
      label: "Onglet Contacts",
      hint: "Étape 4/7 : Cliquez sur l'onglet 'Contacts' dans la fiche du fournisseur.",
      breadcrumb: ["Fiche Fournisseur", "Contacts"]
    },
    {
      id: "step_5",
      type: "button",
      selector: `[data-field="contactPartnerSet"] button:has(i.fa-plus), .tab-pane.active [data-field*="contact"] button:has(i.fa-plus)`,
      label: "Ajouter un Contact (+)",
      hint: "Étape 5/7 : Cliquez sur le bouton (+) du tableau pour ouvrir la sous-fenêtre de création.",
      breadcrumb: ["Contacts", "Nouveau Contact"],
      explanation: "Ouvre une boîte modale dédiée à la saisie du contact."
    },
    {
      id: "step_6",
      type: "field",
      selector: `.modal.show input[name="fullName"], [role="dialog"] input[name="fullName"]`,
      label: "Formulaire Contact",
      hint: "Étape 6/7 : Dans la sous-fenêtre, renseignez les coordonnées et cliquez sur Sauvegarder.",
      breadcrumb: ["Sous-fenêtre Contact", "Formulaire"],
      fields: [
        { label: "Nom complet", value: "Jean Dupont" },
        { label: "Email pro", value: "jean.dupont@fournisseur.com" },
        { label: "Téléphone", value: "+33 6 12 34 56 78" }
      ],
      explanation: "Utilisez les boutons 📋 pour copier instantanément chaque valeur sans faute."
    },
    {
      id: "step_7",
      type: "button",
      selector: `.tab-pane.active button.btn-save, .main-view.active button:contains("Enregistrer")`,
      label: "Sauvegarde Finale",
      hint: "Étape 7/7 : Cliquez sur 'Sauvegarder' dans la barre d'outils principale pour valider la fiche.",
      breadcrumb: ["Fiche Fournisseur", "Enregistrement"],
      explanation: "La sauvegarde finale est indispensable pour persister l'association dans la base de données."
    }
  ]
};
```
