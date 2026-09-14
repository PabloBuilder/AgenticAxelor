import { GuidanceRoute } from "../types/guidance.js";

export const subWindowGuide: GuidanceRoute = {
  id: "route_supplier_contact",
  title: "Cas Réel : Ajouter un Contact Commercial à un Fournisseur",
  description: "Guide pas à pas pour ouvrir un fournisseur existant, accéder à son sous-onglet Contacts, et créer un nouveau contact dans la sous-fenêtre modale.",
  currentStepIndex: 0,
  totalSteps: 7,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Achats")), .nav-item:has(span:contains("Achats")), a[title*="Achats"], span:contains("Achats")`,
      label: "Menu Achats",
      hint: "Étape 1/7 : Cliquez sur le menu 'Achats' dans la barre latérale pour dérouler la section.",
      breadcrumb: ["Achats"],
      explanation: "Le menu Achats regroupe les fournisseurs, commandes, réceptions et factures fournisseurs."
    },
    {
      id: "step_2",
      type: "menu",
      selector: `a:has(span:contains("Fournisseurs")), .nav-item:has(span:contains("Fournisseurs")), a[title*="Fournisseurs"], span:contains("Fournisseurs")`,
      label: "Sous-menu Fournisseurs",
      hint: "Étape 2/7 : Cliquez sur 'Fournisseurs' pour afficher la liste de tous vos fournisseurs.",
      breadcrumb: ["Achats", "Fournisseurs"],
      explanation: "Les tiers fournisseurs sont synchronisés avec la gestion comptable et commerciale."
    },
    {
      id: "step_3",
      type: "row",
      selector: `.tab-pane.active .ax-grid-view tbody tr:first-child, .tab-pane.active table tbody tr:first-child td:first-child, .main-view.active tbody tr:first-child`,
      label: "Sélectionner un Fournisseur",
      hint: "Étape 3/7 : Cliquez sur le premier fournisseur de la liste pour ouvrir sa fiche détaillée.",
      breadcrumb: ["Fournisseurs", "Fiche Fournisseur"],
      explanation: "Un simple clic sur la ligne ouvre la vue formulaire complète du partenaire."
    },
    {
      id: "step_4",
      type: "tab",
      selector: `[role="tab"]:contains("Contacts"), .nav-tabs a:contains("Contacts"), a[data-item-key*="contact"], button:contains("Contacts")`,
      label: "Sous-onglet 'Contacts'",
      hint: "Étape 4/7 : Dans la fiche du fournisseur, cliquez sur le sous-onglet 'Contacts' pour afficher ses relations.",
      breadcrumb: ["Fiche Fournisseur", "Contacts"],
      explanation: "Ce sous-onglet répertorie tous les interlocuteurs et contacts commerciaux associés."
    },
    {
      id: "step_5",
      type: "button",
      fieldName: "contactPartnerSet",
      selector: `[data-field="contactPartnerSet"] button:has(i.fa-plus), [data-field="contactPartnerSet"] button:has(span:contains("add")), .tab-pane.active [data-field*="contact"] button:has(i.fa-plus), .tab-pane.active .ax-grid-view button:has(i.fa-plus)`,
      label: "Bouton Ajouter Contact (+)",
      hint: "Étape 5/7 : Cliquez sur le bouton (+) situé dans le tableau des contacts pour ouvrir la sous-fenêtre d'ajout.",
      breadcrumb: ["Contacts", "Nouveau Contact"],
      explanation: "Une boîte de dialogue modale isolée s'ouvre pour configurer la nouvelle relation sans quitter la fiche."
    },
    {
      id: "step_6",
      type: "field",
      selector: `.modal.show input[name="fullName"], [role="dialog"] input[name="fullName"], .modal.show [data-field="fullName"] input, [role="dialog"] input[name="name"], .modal.show input:not([type="hidden"])`,
      label: "Sous-fenêtre : Formulaire Contact",
      hint: "Étape 6/7 : Dans la sous-fenêtre qui vient de s'ouvrir, renseignez les coordonnées du contact.",
      breadcrumb: ["Sous-fenêtre Contact", "Formulaire"],
      explanation: "Utilisez les boutons copier 📋 pour remplir rapidement chaque champ sans faute de frappe.",
      fields: [
        { label: "Nom complet", value: "Jean Dupont" },
        { label: "Email pro", value: "jean.dupont@fournisseur-pro.com" },
        { label: "Téléphone", value: "+33 6 12 34 56 78" }
      ]
    },
    {
      id: "step_7",
      type: "button",
      selector: `.modal.show button.btn-primary, [role="dialog"] button.btn-primary, .modal.show button:contains("Sauvegarder"), [role="dialog"] button:contains("OK"), .modal.show button:has(i.fa-check)`,
      label: "Sous-fenêtre : Valider et Sauvegarder",
      hint: "Étape 7/7 : Cliquez sur 'Sauvegarder' dans la sous-fenêtre pour enregistrer le contact.",
      breadcrumb: ["Sous-fenêtre Contact", "Valider"],
      explanation: "La sauvegarde ferme la modale et actualise instantanément le tableau des contacts."
    }
  ]
};
