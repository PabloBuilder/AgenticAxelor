# File selection, Drive and attachments

Use when a workflow selects, moves, uploads or verifies documents in Drive or Axelor.

- Verify the actual selected file's metadata and, when needed, contents. An old pilot ID or configuration label is not proof of selection; inspect the selection logic, reject unauthorized IDs and avoid arbitrary fallback. Use authorized sandbox copies and preserve the original.
- Paginate Drive and attachment searches where completeness matters. After processing, verify the copy's actual parent rather than trusting a DONE event. A temporary download URL is not durable storage. A non-public-file warning is not permission or a reason to make a PDF public.
- n8n binary data may be a filesystem reference, not base64. Preserve the original bytes, use `this.helpers.getBinaryDataBuffer` where necessary and restore the correct binary at the upload input.
- Hash the original PDF bytes. Verify the actual target attachment relation, scope, uniqueness and search completeness; download the linked MetaFile, check HTTP first, then compare its SHA-256 with the original. A local hash, relation or caller-supplied verified flag is insufficient.
- On the examined Axelor installation `Accept: application/pdf` returned 406 with an empty body while `Accept: */*` worked. Verify the target installation; distinguish HTTP download failure from a genuine hash mismatch.
- An existing attachment search helps reuse but cannot alone prevent concurrent duplicate uploads. See [recovery and idempotence](recovery-idempotence.md).

Sources: [lessons learned §§18–19](../../../docs/retour-experience-axelor-n8n-factures.md); [Axelor API cheatsheet](../../../docs/axelor-api-cheatsheet.md). For document interpretation see [documents and OCR](documents-ocr.md).
