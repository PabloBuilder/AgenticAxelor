# n8n publication, tests and diagnosis

Use when publishing, testing or diagnosing an n8n workflow. Check current CLI help; reading, validation, publication, activation and execution are distinct actions with distinct permissions.

- `workflow build --push` creates a workflow; `workflow push <id>` replaces one. Read the current remote version, preserve rollback, compare critical logic, validate strictly, run the appropriate dry-run and recheck version before an authorized write. Dry-run envelopes can differ. Read back nodes, parameters, connections, settings, credential type/ID and active state; inspect API normalization rather than ignoring all differences.
- Strict static validation alone does not prove expression compilation. Compile with an n8n-compatible compiler and execute generated Code with representative inputs. Adjacent closing braces and embedded helpers produced real local compilation failures; prefer simple expressions. Local compatibility is not proof of installed server version.
- A green execution can end on a normal error branch. Read the terminal business outcome and independently check relevant external effects. `ok`, recipe success and business DONE are not interchangeable.
- For a full manual webhook test, use the global Execute workflow listener, wait for the test URL listener, and send once. An inactive workflow may be tested manually. After timeout or ambiguity, inspect state before retrying; do not use a production URL to bypass an absent listener.
- An empty execution history can result from disabled retention, not absence of a run. Do not invent private endpoints or enable retention of sensitive payloads for diagnosis. Ask for the relevant node or safe terminal output; compare event content and update time rather than assuming creation time identifies the current attempt.

Source and evidence limits: [lessons learned §§13–15](../../../docs/retour-experience-axelor-n8n-factures.md). See [recovery and idempotence](recovery-idempotence.md) for ambiguous side effects and [expressions](expressions.md) for authoring.
