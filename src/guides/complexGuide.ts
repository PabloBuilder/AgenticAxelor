import { GuidanceRoute } from "../types/guidance.js";

export const complexGuide: GuidanceRoute = {
  id: "route_complex_customer",
  title: "Création complète d'un Client (Partenaire)",
  description: "Parcours guidé étape par étape de la navigation jusqu'aux champs du formulaire",
  currentStepIndex: 0,
  totalSteps: 5,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Ventes")), .nav-item:has(span:contains("Ventes")), a[title*="Ventes"]`,
      label: "Ventes",
      hint: "Cliquez pour déplier le menu principal Ventes.",
      breadcrumb: ["Ventes"],
    },
    {
      id: "step_2",
      type: "menu",
      selector: `a:has(span:contains("Clients")), .nav-item:has(span:contains("Clients")), a[title*="Clients"]`,
      label: "Clients",
      hint: "Cliquez sur Clients pour ouvrir la vue liste.",
      breadcrumb: ["Ventes", "Clients"],
    },
    {
      id: "step_3",
      type: "button",
      selector: `button[name="new"], button.btn-new, button:has(i.fa-plus), button:contains("Nouveau")`,
      fallbackSelectors: [
        `.btn-primary:has(i.fa-plus)`,
        `button[title*="Nouveau"]`,
      ],
      label: "Nouveau (+)",
      hint: "Cliquez sur le bouton Nouveau pour créer un nouveau client.",
    },
    {
      id: "step_4",
      type: "field",
      selector: `[name="name"], [data-field="name"], input[ng-model*="name"], #name`,
      fallbackSelectors: [
        `[data-field-name="name"] input`,
        `input[name="name"]`,
      ],
      label: "Nom du client",
      hint: "Saisissez la raison sociale ou le nom du client.",
    },
    {
      id: "step_5",
      type: "field",
      selector: `[name="isCustomer"], [data-field="isCustomer"], input[ng-model*="isCustomer"]`,
      fallbackSelectors: [
        `input[type="checkbox"][name="isCustomer"]`,
        `label:contains("Client") input`,
      ],
      label: "Est un client",
      hint: "Cochez la case pour valider le statut de client.",
    },
  ],
};
