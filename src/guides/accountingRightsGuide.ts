import { GuidanceRoute } from "../types/guidance.js";

export const accountingRightsGuide: GuidanceRoute = {
  id: "route_accounting_rights_canonical",
  title: "Gestion des Droits : Chaîne Canonique (Rôle > Permissions > Groupe > User)",
  description: "Exercice Niveau 1 : Création/configuration du Rôle avec ses 3 permissions (SaleOrder 'r', Invoice 'rwcde', Payment 'rwcde'), assignation du Rôle au Groupe Comptabilité, et affectation à l'utilisateur test.",
  currentStepIndex: 0,
  totalSteps: 11,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Application")), .nav-item:has(span:contains("Application")), a[title*="Application"], span:contains("Application")`,
      label: "1. Menu Application",
      hint: "Étape 1/11 : Cliquez sur 'Application' dans la barre latérale pour accéder aux réglages de sécurité.",
      breadcrumb: ["Application"],
      explanation: "La hiérarchie des droits (Rôles, Groupes, Utilisateurs) se configure dans le module Application."
    },
    {
      id: "step_2",
      type: "menu",
      selector: `a:has(span:contains("Rôles")), .nav-item:has(span:contains("Rôles")), a[title*="Rôles"], span:contains("Rôles")`,
      label: "2. Sous-menu Rôles",
      hint: "Étape 2/11 : Cliquez sur 'Rôles' (dans Application > Utilisateurs > Rôles).",
      breadcrumb: ["Application", "Rôles"],
      explanation: "Dans Axelor, ce sont les RÔLES qui portent les permissions unitaires sur les modèles techniques."
    },
    {
      id: "step_3",
      type: "button",
      selector: `.tab-pane.active button:has(i.fa-plus), .tab-pane.active button:contains("Nouveau"), .main-view.active button:has(i.fa-plus)`,
      label: "3. Créer un Rôle (+)",
      hint: "Étape 3/11 : Cliquez sur (+) 'Nouveau' pour créer le profil de rôle comptable (ou ouvrez le rôle existant 'utilisateur comptable').",
      breadcrumb: ["Rôles", "Nouveau Rôle"],
      explanation: "Initialisation du rôle regroupant les règles d'accès demandées."
    },
    {
      id: "step_4",
      type: "field",
      selector: `.tab-pane.active input[name="name"], .tab-pane.active [data-field="name"] input`,
      label: "4. Nom du Rôle",
      hint: "Étape 4/11 : Nommez le rôle 'Comptable'.",
      breadcrumb: ["Rôles", "Fiche Rôle"],
      explanation: "Le nom du rôle permettra de l'identifier facilement lors de l'assignation au groupe.",
      fields: [
        { label: "Nom", value: "Comptable" }
      ]
    },
    {
      id: "step_5",
      type: "tab",
      selector: `[role="tab"]:contains("Permissions"), .nav-tabs a:contains("Permissions"), a[data-item-key*="permission"]`,
      label: "5. Onglet Permissions du Rôle",
      hint: "Étape 5/11 : Rendez-vous dans l'onglet 'Permissions' de la fiche Rôle.",
      breadcrumb: ["Fiche Rôle", "Permissions"],
      explanation: "C'est ici qu'on attache les règles sur SalesOrder, Invoice et Payment au Rôle."
    },
    {
      id: "step_6",
      type: "button",
      selector: `[data-field*="permission"] button:has(i.fa-search), [data-field*="permission"] button:has(i.fa-plus), .tab-pane.active [data-field*="permission"] button`,
      label: "6. Assigner les 3 Permissions au Rôle",
      hint: "Étape 6/11 : Cliquez sur Rechercher (🔍) dans la table des permissions et sélectionnez les 3 règles canoniques :",
      breadcrumb: ["Fiche Rôle", "3 Permissions"],
      explanation: "1 permission lecture seule (r) pour la vente + 2 permissions complètes (rwcde) pour la facturation et les paiements :",
      fields: [
        { label: "1. Vente (Lecture seule 'r')", value: "perm.sale.SaleOrder.r" },
        { label: "2. Factures (Droit complet 'rwcde')", value: "perm.account.Invoice.rwcde" },
        { label: "3. Paiements (Droit complet 'rwcde')", value: "perm.account.InvoicePayment.rwcde" }
      ]
    },
    {
      id: "step_7",
      type: "button",
      selector: `.tab-pane.active button.btn-primary:has(i.fa-save), .tab-pane.active button:contains("Enregistrer")`,
      label: "7. Enregistrer le Rôle",
      hint: "Étape 7/11 : Enregistrez la fiche Rôle.",
      breadcrumb: ["Fiche Rôle", "Enregistrer"],
      explanation: "Le rôle 'Comptable' contient maintenant ses 3 règles de sécurité."
    },
    {
      id: "step_8",
      type: "menu",
      selector: `a:has(span:contains("Groupes")), .nav-item:has(span:contains("Groupes")), a[title*="Groupes"], span:contains("Groupes")`,
      label: "8. Menu Groupes",
      hint: "Étape 8/11 : Rendez-vous dans 'Application > Groupes'.",
      breadcrumb: ["Application", "Groupes"],
      explanation: "On passe maintenant à l'étage Groupe d'utilisateurs."
    },
    {
      id: "step_9",
      type: "row",
      selector: `.tab-pane.active .ax-grid-view tbody tr:has(td:contains("Comptabilité")), .tab-pane.active table tbody tr:first-child`,
      label: "9. Assigner le Rôle au Groupe 'Comptabilité'",
      hint: "Étape 9/11 : Ouvrez le groupe 'Comptabilité' (ID 29), cliquez sur 'Modifier', allez dans l'onglet 'Rôles' et ajoutez le rôle 'Comptable' (ou 'utilisateur comptable'). Enregistrez.",
      breadcrumb: ["Groupes", "Assignation Rôle"],
      explanation: "Le groupe Comptabilité hérite des permissions définies dans le rôle."
    },
    {
      id: "step_10",
      type: "menu",
      selector: `a:has(span:contains("Utilisateurs")), .nav-item:has(span:contains("Utilisateurs")), a[title*="Utilisateurs"]`,
      label: "10. Menu Utilisateurs",
      hint: "Étape 10/11 : Allez dans 'Application > Utilisateurs' pour vérifier l'utilisateur test.",
      breadcrumb: ["Application", "Utilisateurs"],
      explanation: "Contrôle de l'affectation du groupe à l'utilisateur."
    },
    {
      id: "step_11",
      type: "row",
      selector: `.tab-pane.active .ax-grid-view tbody tr:has(td:contains("Tester Exo3")), .tab-pane.active table tbody tr:first-child`,
      label: "11. Contrôle des Accès (Utilisateur Test)",
      hint: "Étape 11/11 : Vérifiez que 'Tester Exo3' (exo.3) a bien le groupe 'Comptabilité'. Connectez-vous avec son compte et testez : 1. Ventes visibles mais création/modif bloquée, 2. Facturation client active, 3. Paiements enregistrables.",
      breadcrumb: ["Utilisateurs", "Vérification Finale"],
      explanation: "Fin de l'exercice Niveau 1 respectant 100% de l'architecture standard Axelor."
    }
  ]
};
