# Documents, OCR and extraction evidence

Use when extracting information from PDF, OCR or AI, especially financial documents.

- Check every page for presence, order and readability. Nonempty combined text or `complete: true` does not prove every page or pixel was understood; missing, blank, duplicated or reordered pages require OCR or review. Adapter grammars are limited, not universal supplier detectors.
- Distinguish source document, OCR transcription, model extraction and accounting projection. A valid JSON or compliant prompt is not source proof. Independently validate identity roles, reference citations, real dates, line inventory including zero lines, amounts and tax evidence. Preserve unknown source values as unknown.
- One PDF may contain a letter, credit note and notice: a page is not automatically an accounting document. Do not silently net a credit against an invoice or mark the whole file DONE while a financial piece remains in review/error. The documented multi-piece recovery scenario is not yet proven end to end.
- Distinguish an actual model call, a parsed response and successful validation. A failed or ambiguous call may have incurred cost; do not automatically retry. Token limits are not monetary limits. The observed real PDF transport and OCR acceptance covered one scanned single-page notice, not all PDFs.
- When source tax information is unknown, preserve that fact and distinguish it from any ERP projection based on explicit policy. A deterministic parser of an adequate transcription can avoid an unnecessary second model call. Unsupported layouts or ambiguity go to review.

Source and limits: [lessons learned §§8–12](../../../docs/retour-experience-axelor-n8n-factures.md). See [Axelor invoices](axelor-invoices.md) for accounting and [files and Drive](files-drive.md) for original bytes and storage.
