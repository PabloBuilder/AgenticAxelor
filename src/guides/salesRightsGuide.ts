import { GuidanceRoute } from "../types/guidance.js";

export const salesRightsGuide: GuidanceRoute = {
  id: "route_sales_rights_level2",
  title: "Configuration Groupe Commerciaux & Restrictions Périmètre (Niveau 2)",
  description: "Exercice Niveau 2 : Duplication & configuration des permissions avec filtres de périmètre (condition 'self.user = :__user__' ou 'mainPartner.user = :__user__'), assignation aux rôles, configuration du Groupe 'Commerciaux' (Menus CRM, Ventes, Achats, Facturation) et affectation utilisateur test.",
  currentStepIndex: 0,
  totalSteps: 12,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Application")), .nav-item:has(span:contains("Application")), a[title*="Application"], span:contains("Application")`,
      label: "1. Menu Application",
      hint: "Étape 1/12 : Cliquez sur 'Application' dans la barre latérale pour accéder aux réglages de sécurité.",
      breadcrumb: ["Application"],
      explanation: "Toute la gestion des permissions, rôles et groupes se fait dans le module Application."
    },
    {
      id: "step_2",
      type: "menu",
      selector: `a:has(span:contains("Permissions")), .nav-item:has(span:contains("Permissions")), a[title*="Permissions"], span:contains("Permissions")`,
      label: "2. Sous-menu Permissions",
      hint: "Étape 2/12 : Cliquez sur 'Permissions' (Application > Utilisateurs > Permissions).",
      breadcrumb: ["Application", "Permissions"],
      explanation: "Nous allons créer/dupliquer les permissions avec les règles de filtrage de périmètre demandées."
    },
    {
      id: "step_3",
      type: "field",
      selector: `.tab-pane.active button:has(i.fa-plus), .tab-pane.active button:contains("Nouveau")`,
      label: "3. Création des Permissions avec Filtres",
      hint: "Étape 3/12 : Créez/dupliquez les 4 permissions suivantes avec leur condition de règle :",
      breadcrumb: ["Permissions", "Création"],
      explanation: "Règles de restriction par utilisateur connecté (:__user__) :",
      fields: [
        { 
          label: "1. Clients Affectés (rwc)", 
          value: "perm.partner.commercial.rwc",
          hint: "Modèle: com.axelor.apps.base.db.Partner | Condition: self.user = :__user__ (Droits: Lire, Écrire, Créer)"
        },
        { 
          label: "2. Commandes Ventes (rwc)", 
          value: "perm.sale.commercial.rwc",
          hint: "Modèle: com.axelor.apps.sale.db.SaleOrder | Condition: self.clientPartner.user = :__user__ (Droits: Lire, Écrire, Créer)"
        },
        { 
          label: "3. Commandes Achats (rwc)", 
          value: "perm.purchase.commercial.rwc",
          hint: "Modèle: com.axelor.apps.purchase.db.PurchaseOrder | Droits: Lire, Écrire, Créer"
        },
        { 
          label: "4. Factures Clients (r)", 
          value: "perm.invoice.commercial.r",
          hint: "Modèle: com.axelor.apps.account.db.Invoice | Condition: self.partner.user = :__user__ (Droit: Lire uniquement, pas de création)"
        }
      ]
    },
    {
      id: "step_4",
      type: "menu",
      selector: `a:has(span:contains("Rôles")), .nav-item:has(span:contains("Rôles")), a[title*="Rôles"], span:contains("Rôles")`,
      label: "4. Sous-menu Rôles",
      hint: "Étape 4/12 : Allez dans 'Application > Utilisateurs > Rôles'.",
      breadcrumb: ["Application", "Rôles"],
      explanation: "Création du profil de rôle commercial qui regroupe ces permissions."
    },
    {
      id: "step_5",
      type: "button",
      selector: `.tab-pane.active button:has(i.fa-plus), .tab-pane.active button:contains("Nouveau")`,
      label: "5. Créer le Rôle 'Commercial'",
      hint: "Étape 5/12 : Cliquez sur (+) Nouveau Rôle.",
      breadcrumb: ["Rôles", "Nouveau"],
      explanation: "Initialisation du rôle."
    },
    {
      id: "step_6",
      type: "field",
      selector: `.tab-pane.active input[name="name"], .tab-pane.active [data-field="name"] input`,
      label: "6. Nommer le Rôle",
      hint: "Étape 6/12 : Saisissez le nom du rôle.",
      breadcrumb: ["Rôles", "Nom"],
      explanation: "Nom du profil rôle métier.",
      fields: [
        { label: "Nom du Rôle", value: "Commercial" }
      ]
    },
    {
      id: "step_7",
      type: "tab",
      selector: `[role="tab"]:contains("Permissions"), .nav-tabs a:contains("Permissions"), a[data-item-key*="permission"]`,
      label: "7. Attacher les Permissions au Rôle",
      hint: "Étape 7/12 : Dans l'onglet 'Permissions', cliquez sur Rechercher (🔍) et ajoutez les 4 permissions créées à l'étape 3. Puis enregistrez le Rôle.",
      breadcrumb: ["Rôle Commercial", "Permissions"],
      explanation: "Attribution des permissions filtrées au rôle Commercial."
    },
    {
      id: "step_8",
      type: "menu",
      selector: `a:has(span:contains("Groupes")), .nav-item:has(span:contains("Groupes")), a[title*="Groupes"], span:contains("Groupes")`,
      label: "8. Menu Groupes",
      hint: "Étape 8/12 : Allez dans 'Application > Groupes'.",
      breadcrumb: ["Application", "Groupes"],
      explanation: "Passage à la configuration du groupe d'utilisateurs."
    },
    {
      id: "step_9",
      type: "button",
      selector: `.tab-pane.active button:has(i.fa-plus), .tab-pane.active button:contains("Nouveau")`,
      label: "9. Créer le Groupe 'Commerciaux'",
      hint: "Étape 9/12 : Cliquez sur (+) Nouveau Groupe et nommez-le 'Commerciaux'.",
      breadcrumb: ["Groupes", "Nouveau"],
      explanation: "Création du groupe cible.",
      fields: [
        { label: "Nom du Groupe", value: "Commerciaux" },
        { label: "Code", value: "COMMERCIAUX" }
      ]
    },
    {
      id: "step_10",
      type: "tab",
      selector: `[role="tab"]:contains("Menus"), .nav-tabs a:contains("Menus"), a[data-item-key*="menu"]`,
      label: "10. Restreindre les Menus du Groupe",
      hint: "Étape 10/12 : Dans l'onglet 'Menus' du groupe 'Commerciaux', ajoutez UNIQUEMENT les 4 modules autorisés en recherchant leurs titres réels en base :",
      breadcrumb: ["Groupe Commerciaux", "Menus"],
      explanation: "Restriction de visibilité aux 4 modules demandés (titres exacts en base Axelor) :",
      fields: [
        { label: "1. Module CRM", value: "CRM" },
        { label: "2. Module Ventes", value: "Sales" },
        { label: "3. Module Achats", value: "Purchases" },
        { label: "4. Module Facturation", value: "Invoicing" }
      ]
    },
    {
      id: "step_11",
      type: "tab",
      selector: `[role="tab"]:contains("Rôles"), .nav-tabs a:contains("Rôles"), a[data-item-key*="role"]`,
      label: "11. Assigner le Rôle au Groupe",
      hint: "Étape 11/12 : Dans l'onglet 'Rôles' du groupe 'Commerciaux', ajoutez le rôle 'Commercial' créé à l'étape 5. Enregistrez le groupe.",
      breadcrumb: ["Groupe Commerciaux", "Rôles"],
      explanation: "Le groupe 'Commerciaux' hérite de toutes les permissions du rôle."
    },
    {
      id: "step_12",
      type: "menu",
      selector: `a:has(span:contains("Utilisateurs")), .nav-item:has(span:contains("Utilisateurs")), a[title*="Utilisateurs"]`,
      label: "12. Affecter l'Utilisateur Test & Vérifier",
      hint: "Étape 12/12 : Allez dans 'Application > Utilisateurs', ouvrez votre utilisateur commercial de test, assignez-lui le groupe 'Commerciaux' (et retirez les autres groupes). Connectez-vous avec son compte pour valider le périmètre restreint (uniquement ses clients, pas de création de factures, commandes ventes/achats OK).",
      breadcrumb: ["Utilisateurs", "Validation Périmètre"],
      explanation: "Vérification finale du respect des contraintes métier du Niveau 2."
    }
  ]
};
