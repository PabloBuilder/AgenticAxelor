# Axelor supplier invoices

Use for supplier-invoice design, diagnosis or recovery; discover the target installation and verify current state before any authorized write.

- Verify supplier identifiers from recognized supplier zones before searching Axelor; a customer's SIRET is not the supplier's. Discover actual fields and relation models rather than guessing. Do not convert SIRET to SIREN without justified policy.
- Separate business choices and provenance from environment-specific bindings; IDs are not portable from production to DEMO. Historical production records can be wrong. A zero tax rate or printed reverse-charge mention alone does not prove correct reverse-charge accounting.
- Re-read the saved `id`/`version` before compute and subsequent writes. Check HTTP, application status, nested `data[0].error` and required results. Account VAT configuration and invoice-line tax rate are different concerns.
- Read invoice lines and taxes separately if relations are abbreviated; verify pagination. Reuse requires full relevant header, lines, discounts, units, accounts and taxes, not just matching totals. Preserve zero lines and source precision; use explicit rounding rules.
- An explicit source due date may require an InvoiceTerm: on the tested installation, saving the header alone recalculated the date. A verified single-term solution is not proof for multiple installments or other currencies. Keep extracted due date and ERP default distinct; never invent a source date.
- Success on a few documents, especially after manual corrections, does not establish unattended end-to-end reliability or general coverage. Test credit notes, multi-piece documents and each tax regime independently; do not infer production readiness from extraction alone.

Sources: [lessons learned §§2, 4–8 and 11–12](../../../docs/retour-experience-axelor-n8n-factures.md); [Axelor API cheatsheet](../../../docs/axelor-api-cheatsheet.md). See [documents and OCR](documents-ocr.md), [recovery and idempotence](recovery-idempotence.md), and [files and Drive](files-drive.md).
