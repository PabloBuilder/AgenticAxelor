import { GuidanceRoute } from "../types/guidance.js";

export const tradingCardsExerciseGuide: GuidanceRoute = {
  id: "route_panini_cards_exercise",
  title: "Exercice Complet : Cycle Commercial & Logistique Panini (Djelel)",
  description: "Cycle complet de bout en bout : Création 2 articles (Boîtes de 10), Client Djelel, Opportunité CRM (montant estimé 20,50 €), 2 Événements Réunion avec Catégories ('Rdv Client' & 'Démonstration'), Devis lié avec les 2 lignes d'articles, Facturation partielle Vinicius validée, Nouvel entrepôt 'Mon stock de carte', Commande achat approvisionnement, Réception conforme, Livraison client et Facturation du solde Mbappé validée.",
  currentStepIndex: 0,
  totalSteps: 15,
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      type: "menu",
      selector: `a:has(span:contains("Produits")), a:has(span:contains("Products & services")), .nav-item:has(span:contains("Products")), a[title*="Product"]`,
      label: "1. Créer le Produit Mbappé (1,00 €)",
      hint: "Étape 1/15 : Allez dans 'Ventes > Produits & services', cliquez sur (+) Nouveau. Créez 'Autocollant Panini Mbappe' au prix de 1,00 € avec l'unité de vente 'Boite de 10 ' (ou sélectionnez l'unité de conditionnement correspondante). Enregistrez.",
      breadcrumb: ["Ventes", "Produits & services", "Nouveau Produit 1"],
      explanation: "Article 1 : Prix unitaire 1,00 € par boîte de 10.",
      fields: [
        { label: "Nom du produit", value: "Autocollant Panini Mbappe" },
        { label: "Code article", value: "PANINI-MBAPPE" },
        { label: "Prix de vente unitaire", value: "1.00", hint: "Champ 'Prix de vente' = 1,00 €" },
        { label: "Unité de vente", value: "Boite de 10", hint: "Sélectionnez ou créez l'unité de vente 'Boite de 10 '" }
      ]
    },
    {
      id: "step_2",
      type: "button",
      selector: `.tab-pane.active button:has(i.fa-plus), .tab-pane.active button:contains("Nouveau")`,
      label: "2. Créer le Produit Vinicius (0,10 €)",
      hint: "Étape 2/15 : Cliquez sur (+) Nouveau. Créez 'Autocollant Panini Vinicius' au prix de 0,10 € avec l'unité de vente 'Boite de 10 '. Enregistrez.",
      breadcrumb: ["Ventes", "Produits & services", "Nouveau Produit 2"],
      explanation: "Article 2 : Prix unitaire 0,10 € par boîte de 10.",
      fields: [
        { label: "Nom du produit", value: "Autocollant Panini Vinicius" },
        { label: "Code article", value: "PANINI-VINI" },
        { label: "Prix de vente unitaire", value: "0.10", hint: "Champ 'Prix de vente' = 0,10 €" },
        { label: "Unité de vente", value: "Boite de 10", hint: "Sélectionnez l'unité de vente 'Boite de 10 '" }
      ]
    },
    {
      id: "step_3",
      type: "menu",
      selector: `a:has(span:contains("Clients")), a:has(span:contains("Customers")), .nav-item:has(span:contains("Customers")), a[title*="Customer"]`,
      label: "3. Créer le Client Djelel",
      hint: "Étape 3/15 : Allez dans 'Ventes > Clients', cliquez sur (+) Nouveau, nommez le client 'Djelel' et cochez la case Client. Enregistrez.",
      breadcrumb: ["Ventes", "Clients", "Nouveau Client"],
      explanation: "Création de la fiche partenaire pour Djelel.",
      fields: [
        { label: "Nom du Partenaire", value: "Djelel" }
      ]
    },
    {
      id: "step_4",
      type: "menu",
      selector: `a:has(span:contains("Opportunités")), a:has(span:contains("Opportunities")), .nav-item:has(span:contains("Opportunities")), a[title*="Opportunit"]`,
      label: "4. Créer l'Opportunité CRM (Djelel)",
      hint: "Étape 4/15 : Allez dans 'CRM > Opportunités', cliquez sur (+) Nouveau. Sélectionnez le client 'Djelel', titrez l'opportunité, et renseignez le montant estimé (20,50 € = 20x1€ + 5x0,10€). Dans la description, notez '20 boîtes Mbappé + 5 boîtes Vinicius'. Enregistrez.",
      breadcrumb: ["CRM", "Opportunités", "Nouvelle Opportunité"],
      explanation: "L'opportunité porte le montant estimé global. Les lignes d'articles physiques s'ajoutent à l'étape suivante dans le Devis.",
      fields: [
        { label: "Titre de l'opportunité", value: "Vente cartes Panini Djelel" },
        { label: "Client Partenaire", value: "Djelel" },
        { label: "Montant estimé (€)", value: "20.50", hint: "Total calculé des 20 boîtes Mbappé + 5 boîtes Vinicius" },
        { label: "Description", value: "20 boîtes Mbappé (20€) + 5 boîtes Vinicius (0,50€)" }
      ]
    },
    {
      id: "step_5",
      type: "menu",
      selector: `a:has(span:contains("Événements")), a:has(span:contains("Events")), .nav-item:has(span:contains("Events")), a[title*="Event"]`,
      label: "5. Événement 1 : Réunion 'Rdv Client'",
      hint: "Étape 5/15 : Allez dans 'CRM > Événements' (ou depuis le sous-onglet Événements de l'opportunité). Créez le 1er événement : Type 'Réunion', Catégorie 'Rdv Client', lié à l'opportunité 'Vente cartes Panini Djelel' et au client Djelel.",
      breadcrumb: ["CRM", "Événements", "Événement 1 - Rdv Client"],
      explanation: "1er échange de négociation : Type Réunion avec Catégorie obligatoire 'Rdv Client'.",
      fields: [
        { label: "Sujet / Titre", value: "Rdv de négociation cartes Panini" },
        { label: "Type d'événement", value: "Meeting", hint: "Type Réunion" },
        { label: "Catégorie d'événement", value: "Rdv Client", hint: "Sélectionnez ou renseignez la catégorie 'Rdv Client'" },
        { label: "Opportunité liée", value: "Vente cartes Panini Djelel" },
        { label: "Contact / Tiers", value: "Djelel" }
      ]
    },
    {
      id: "step_6",
      type: "button",
      selector: `.tab-pane.active button:has(i.fa-plus), .tab-pane.active button:contains("Nouveau")`,
      label: "6. Événement 2 : Réunion 'Démonstration'",
      hint: "Étape 6/15 : Cliquez sur (+) Nouveau pour créer le 2e événement : Type 'Réunion', Catégorie 'Démonstration', également lié à l'opportunité 'Vente cartes Panini Djelel'. Enregistrez.",
      breadcrumb: ["CRM", "Événements", "Événement 2 - Démonstration"],
      explanation: "2e échange pour convaincre Djelel : Type Réunion avec Catégorie obligatoire 'Démonstration'.",
      fields: [
        { label: "Sujet / Titre", value: "Démonstration échantillons cartes Panini" },
        { label: "Type d'événement", value: "Meeting", hint: "Type Réunion" },
        { label: "Catégorie d'événement", value: "Démonstration", hint: "Sélectionnez ou renseignez la catégorie 'Démonstration'" },
        { label: "Opportunité liée", value: "Vente cartes Panini Djelel" },
        { label: "Contact / Tiers", value: "Djelel" }
      ]
    },
    {
      id: "step_7",
      type: "menu",
      selector: `a:has(span:contains("Devis")), a:has(span:contains("Sale quotations")), .nav-item:has(span:contains("Sale quotations")), a[title*="quotation"]`,
      label: "7. Créer le Devis (Devis / Commandes client)",
      hint: "Étape 7/15 : Allez dans 'Ventes > Devis' (ou depuis l'onglet 'Devis / Commandes client' de l'Opportunité > Générer devis). Renseignez le client 'Djelel', liez le champ 'Opportunité', puis dans le tableau des lignes, ajoutez les 2 articles : 20 boîtes Mbappé et 5 boîtes Vinicius.",
      breadcrumb: ["Ventes", "Devis", "Nouveau Devis"],
      explanation: "C'est dans ce formulaire Devis que les 2 lignes d'articles sont officiellement saisies et chiffrées.",
      fields: [
        { label: "Client", value: "Djelel" },
        { label: "Opportunité liée", value: "Vente cartes Panini Djelel", hint: "Lien obligatoire vers l'opportunité" },
        { label: "Ligne 1 - Article", value: "Autocollant Panini Mbappe", hint: "Quantité: 20 boîtes (Total: 20,00 €)" },
        { label: "Ligne 2 - Article", value: "Autocollant Panini Vinicius", hint: "Quantité: 5 boîtes (Total: 0,50 €)" }
      ]
    },
    {
      id: "step_8",
      type: "button",
      selector: `.tab-pane.active button:contains("Finaliser"), .tab-pane.active button:contains("Valider"), button[name="btnValidateQuotation"]`,
      label: "8. Accepter / Valider la Commande de Vente",
      hint: "Étape 8/15 : Djelel accepte le devis. Cliquez sur le bouton 'Finaliser' ou 'Valider la commande' pour transformer le devis en Commande de Vente confirmée.",
      breadcrumb: ["Ventes", "Commandes de vente", "Validation Commande"],
      explanation: "Transformation du devis accepté en commande de vente ferme."
    },
    {
      id: "step_9",
      type: "button",
      selector: `.tab-pane.active button:contains("Facturer"), .tab-pane.active button:contains("Créer facture"), button[name="btnCreateInvoice"]`,
      label: "9. Facturer UNIQUEMENT les Vinicius & Valider",
      hint: "Étape 9/15 : Depuis la commande, cliquez sur 'Facturer'. Dans la facture client générée, supprimez la ligne Mbappé pour ne conserver QUE la ligne Vinicius (5 boîtes = 0,50 €). Cliquez ensuite sur 'Valider / Ventiler' pour finaliser et comptabiliser la facture.",
      breadcrumb: ["Facturation", "Factures clients", "Facture Partielle Vinicius"],
      explanation: "Facturation partielle stricte : seule la ligne Vinicius doit être validée et ventilée à cette étape.",
      fields: [
        { label: "Ligne conservée", value: "Autocollant Panini Vinicius", hint: "Quantité: 5 boîtes | Supprimer la ligne Mbappé" }
      ]
    },
    {
      id: "step_10",
      type: "menu",
      selector: `a:has(span:contains("Emplacements")), a:has(span:contains("Stock Locations")), .nav-item:has(span:contains("Stock Locations")), a[title*="Stock Locations"]`,
      label: "10. Créer l'Entrepôt 'Mon stock de carte'",
      hint: "Étape 10/15 : Allez dans 'Gestion des stocks > Emplacements de stock', cliquez sur (+) Nouveau. Créez un emplacement interne nommé 'Mon stock de carte' (Type: Emplacement interne). Enregistrez.",
      breadcrumb: ["Gestion des stocks", "Emplacements de stock", "Nouvel Entrepôt"],
      explanation: "Création du nouvel entrepôt de stockage interne où seront réceptionnées les cartes commandées.",
      fields: [
        { label: "Nom de l'emplacement", value: "Mon stock de carte" },
        { label: "Code emplacement", value: "STOCK_CARTE" },
        { label: "Type", value: "Internal", hint: "Sélectionnez 'Interne'" }
      ]
    },
    {
      id: "step_11",
      type: "menu",
      selector: `a:has(span:contains("Commandes d'achat")), a:has(span:contains("Purchase orders")), .nav-item:has(span:contains("Purchase orders")), a[title*="Purchase"]`,
      label: "11. Commande d'Achat Fournisseur (Vers 'Mon stock de carte')",
      hint: "Étape 11/15 : Allez dans 'Achats > Commandes d'achat', cliquez sur (+) Nouveau. Sélectionnez un fournisseur, définissez l'entrepôt de livraison / destination sur 'Mon stock de carte', ajoutez les quantités nécessaires (au moins 20 Mbappé et 5 Vinicius) et validez la commande d'achat.",
      breadcrumb: ["Achats", "Commandes d'achat", "Nouvelle Commande Achat"],
      explanation: "Approvisionnement des cartes vers le nouvel entrepôt de stockage.",
      fields: [
        { label: "Entrepôt de livraison", value: "Mon stock de carte", hint: "Emplacement de réception cible" },
        { label: "Article 1 à commander", value: "Autocollant Panini Mbappe", hint: "Quantité: >= 20 boîtes" },
        { label: "Article 2 à commander", value: "Autocollant Panini Vinicius", hint: "Quantité: >= 5 boîtes" }
      ]
    },
    {
      id: "step_12",
      type: "menu",
      selector: `a:has(span:contains("Réceptions fournisseurs")), a:has(span:contains("Supplier arrivals")), .nav-item:has(span:contains("Arrivals")), a[title*="Arrival"]`,
      label: "12. Réceptionner & Valider 'Conforme'",
      hint: "Étape 12/15 : Allez dans 'Gestion des stocks > Réceptions fournisseurs' (ou depuis la commande d'achat). Ouvrez le bon de réception, cochez ou indiquez 'Conforme' sur le contrôle, puis cliquez sur 'Réaliser / Valider la réception'.",
      breadcrumb: ["Gestion des stocks", "Réceptions fournisseurs", "Réception Conforme"],
      explanation: "Entrée physique des marchandises en stock avec attestation de conformité."
    },
    {
      id: "step_13",
      type: "menu",
      selector: `a:has(span:contains("Livraisons clients")), a:has(span:contains("Customer deliveries")), .nav-item:has(span:contains("Deliveries")), a[title*="Deliver"]`,
      label: "13. Livrer Djelel (Bon de Livraison Client)",
      hint: "Étape 13/15 : Les cartes étant désormais en stock, allez dans 'Gestion des stocks > Livraisons clients' (ou depuis la commande de vente). Ouvrez le bon de livraison pour Djelel et cliquez sur 'Réaliser / Valider l'expédition'.",
      breadcrumb: ["Gestion des stocks", "Livraisons clients", "Livraison Client Djelel"],
      explanation: "Expédition complète des 20 boîtes Mbappé et 5 boîtes Vinicius chez Djelel."
    },
    {
      id: "step_14",
      type: "menu",
      selector: `a:has(span:contains("Commandes de vente")), a:has(span:contains("Sale orders")), .nav-item:has(span:contains("Sale orders"))`,
      label: "14. Facturer le Solde Restant (Mbappé)",
      hint: "Étape 14/15 : Retournez sur la commande de vente de Djelel ('Ventes > Commandes de vente'). Cliquez à nouveau sur 'Facturer' pour générer la facture du solde (les 20 boîtes de Mbappé restantes).",
      breadcrumb: ["Ventes", "Commandes de vente", "Génération Facture Solde"],
      explanation: "Génération de la facture complémentaire pour les 20 boîtes de Mbappé (20,00 €)."
    },
    {
      id: "step_15",
      type: "button",
      selector: `.tab-pane.active button:contains("Valider"), .tab-pane.active button:contains("Ventiler"), button[name="btnVentilate"]`,
      label: "15. Valider / Ventiler la Facture du Solde",
      hint: "Étape 15/15 : Ouvrez la facture client du solde (20 boîtes Mbappé) et cliquez sur 'Valider / Ventiler'. Le cycle complet de vente, négociation, approvisionnement, livraison et facturation est clôturé avec succès !",
      breadcrumb: ["Facturation", "Factures clients", "Validation Facture Solde"],
      explanation: "Clôture définitive du cycle commercial et logistique Panini."
    }
  ]
};
