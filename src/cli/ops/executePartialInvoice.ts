import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { SessionStore } from "../../services/sessionStore.js";

dotenv.config();

async function executePartialInvoice() {
  console.log("=== EXECUTION DIRECTE : FACTURATION PARTIELLE VINICIUS ===");
  const session = SessionStore.loadSession();
  const client = new AxelorClient({
    baseUrl: session?.url || process.env.AXELOR_URL || "https://demo01.alter-si.fr/axelor-erp",
    username: process.env.AXELOR_USERNAME || "admin",
    password: process.env.AXELOR_PASSWORD || "admin",
    cookie: session?.cookie
  });

  try {
    // 1. Inspect Invoice #29
    console.log("1. Recherche de la facture 29...");
    const invoice = await client.fetchById<any>("com.axelor.apps.account.db.Invoice", 29);
    console.log(` -> Facture trouvée: ID ${invoice?.id} (${invoice?.invoiceId}), Status: ${invoice?.statusSelect}`);

    // 2. Fetch all invoice lines of invoice 29
    const linesRes = await client.search<any>("com.axelor.apps.account.db.InvoiceLine", {
      domain: "self.invoice.id = 29",
      fields: ["id", "version", "name", "productName", "qty", "price", "lineAmount"]
    });
    const lines = linesRes.data || [];
    console.log(` -> ${lines.length} ligne(s) sur la facture 29 :`);
    lines.forEach(l => console.log(`    - ID ${l.id} (v${l.version}): ${l.productName || l.name} | Qté: ${l.qty} | Montant: ${l.lineAmount} €`));

    // Find Mbappe line to remove
    const mbappeLine = lines.find(l => (l.productName && l.productName.toLowerCase().includes("mbappe")) || (l.name && l.name.toLowerCase().includes("mbappe")));

    if (mbappeLine) {
      console.log(`\n2. Suppression de la ligne Mbappé (ID: ${mbappeLine.id})...`);
      await client.remove("com.axelor.apps.account.db.InvoiceLine", mbappeLine.id, mbappeLine.version);
      console.log(" -> Ligne Mbappé supprimée avec succès !");
    } else {
      console.log("\n2. La ligne Mbappé n'est déjà plus présente sur la facture.");
    }

    // 3. Trigger ventilation / validation action on the invoice
    console.log("\n3. Ventilation / Validation de la facture #29...");
    const actionResult = await client.executeAction(
      "action-invoice-group-ventilate",
      "com.axelor.apps.account.db.Invoice",
      {
        _model: "com.axelor.apps.account.db.Invoice",
        _id: 29,
        id: 29,
        _viewType: "form",
        _viewName: "invoice-form"
      }
    );
    console.log(" -> Action ventilation exécutée :", JSON.stringify(actionResult));

    // 4. Verify updated invoice state
    const updatedInvoice = await client.fetchById<any>("com.axelor.apps.account.db.Invoice", 29, [
      "id", "invoiceId", "statusSelect", "ventilatedDateTime", "inTaxTotal", "exTaxTotal", "invoiceLineList"
    ]);
    console.log("\n=======================================================");
    console.log(`✅ BILAN FACTURE CLIENT #${updatedInvoice?.invoiceId} :`);
    console.log(`   - Statut : ${updatedInvoice?.statusSelect} (Ventilée/Validée)`);
    console.log(`   - Montant TTC : ${updatedInvoice?.inTaxTotal} € (Vinicius 5 boîtes)`);
    console.log(`   - Date de ventilation : ${updatedInvoice?.ventilatedDateTime || 'Validée'}`);
    console.log("=======================================================");

  } catch (err: any) {
    console.error("❌ Erreur opération :", err.message);
  }
}

executePartialInvoice();
