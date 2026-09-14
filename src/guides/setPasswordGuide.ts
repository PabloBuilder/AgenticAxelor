import { GuidanceRoute } from "../types/guidance.js";

export const setPasswordGuide: GuidanceRoute = {
  id: "route_set_user_pwd",
  title: "Définition Rapide du Mot de Passe Utilisateur",
  description: "Guide pour saisir et enregistrer le mot de passe de test sur la fiche utilisateur dans l'interface.",
  currentStepIndex: 0,
  totalSteps: 5,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Application")), .nav-item:has(span:contains("Application")), a[title*="Application"]`,
      label: "1. Menu Application",
      hint: "Étape 1/5 : Cliquez sur 'Application' dans la barre latérale.",
      breadcrumb: ["Application"],
      explanation: "Accès à la gestion des utilisateurs."
    },
    {
      id: "step_2",
      type: "menu",
      selector: `a:has(span:contains("Utilisateurs")), .nav-item:has(span:contains("Utilisateurs")), a[title*="Utilisateurs"]`,
      label: "2. Sous-menu Utilisateurs",
      hint: "Étape 2/5 : Cliquez sur 'Utilisateurs' pour ouvrir la liste des utilisateurs.",
      breadcrumb: ["Application", "Utilisateurs"],
      explanation: "Affichage de la grille des comptes."
    },
    {
      id: "step_3",
      type: "row",
      selector: `.tab-pane.active .ax-grid-view tbody tr:has(td:contains("compta.test")), .tab-pane.active .ax-grid-view tbody tr:has(td:contains("Test Comptable")), .tab-pane.active table tbody tr:first-child`,
      label: "3. Ouvrir 'Test Comptable' & Modifier",
      hint: "Étape 3/5 : Cliquez sur la ligne de 'Test Comptable' (compta.test), puis cliquez sur le bouton 'Modifier'.",
      breadcrumb: ["Utilisateurs", "Test Comptable"],
      explanation: "Passage en mode édition pour renseigner le mot de passe."
    },
    {
      id: "step_4",
      type: "field",
      selector: `.tab-pane.active input[name="password"], .tab-pane.active input[type="password"], .tab-pane.active [data-field="password"] input`,
      label: "4. Renseigner le Mot de Passe",
      hint: "Étape 4/5 : Saisissez le mot de passe dans le champ mot de passe (il sera automatiquement salé et hashé par Axelor lors de l'enregistrement) :",
      breadcrumb: ["Fiche Utilisateur", "Mot de Passe"],
      explanation: "Valeur copiable :",
      fields: [
        { label: "Mot de passe", value: "Axelor2026!" }
      ]
    },
    {
      id: "step_5",
      type: "button",
      selector: `.tab-pane.active button.btn-primary:has(i.fa-save), .tab-pane.active button:contains("Enregistrer")`,
      label: "5. Enregistrer",
      hint: "Étape 5/5 : Cliquez sur 'Enregistrer'. Vous pouvez maintenant vous connecter immédiatement avec 'compta.test' / 'Axelor2026!'.",
      breadcrumb: ["Fiche Utilisateur", "Enregistrer"],
      explanation: "Le mot de passe est persistant et opérationnel pour les tests."
    }
  ]
};
