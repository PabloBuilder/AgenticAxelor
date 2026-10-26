# n8n Operational Index

Use the installed external n8n CLI for workflows and execution diagnosis. It is not an MCP server and does not use the Axelor Bridge.

## 1. Local Availability & Authentication

- Verified workstation executable: `%LOCALAPPDATA%/Alter-si/connectors/n8n-axi/0.1.0/n8n-axi-0.1.0-win-x64/n8n-axi.exe`. In PowerShell invoke it with `& "$env:LOCALAPPDATA\Alter-si\connectors\n8n-axi\0.1.0\n8n-axi-0.1.0-win-x64\n8n-axi.exe"` followed by command arguments.
- This versioned path is a workstation setting, not a repository prerequisite or proof of current access/write permissions.
- The process inherits `N8N_BASE_URL` and `N8N_API_KEY`; accepted user-level Windows storage is local and non-encrypted. Use inherited authentication without reading, printing, or dumping variable values, registry entries, credential files, or `.env`.
- Verify the executable exists and use the requested read to check access. If credentials are missing/expired, user enters them directly through the agreed masked terminal procedure, not chat. Do not run the no-argument installer/setup or change Goose, PATH, or persistent storage implicitly.
- Removing local configuration does not revoke the server-side key. User revokes keys through n8n API-key management; instance-specific controls must be verified before claiming revocation.

## 2. Read & Diagnose

- Verified help families include `workflow list`, `workflow search`, `workflow view <id>`, `execution list`, `execution view <id>`, and `execution last <workflow>`. Consult command-specific `--help` for exact flags; do not invent syntax. Help may require configured credentials.
- Resolve exact workflow/execution IDs. Read current workflow state and relevant failing nodes before diagnosing or editing; listing metadata alone is not full workflow inspection.
- Filter and paginate where supported. Prefer supported output to local `Work_data/` files for large payloads; do not dump raw executions, credentials, or sensitive node data into chat.
- For required mixed work only, use [Axelor](standard-index.md), [Redmine](redmine-index.md), or [Google](google-workspace-index.md) indexes under the router's conditional-loading and untrusted-content rules.

## 3. Validate & Mutate

- Use command-specific help for scaffold/build, push/patch, validate, activate/deactivate, tag, archive/delete, or execution deletion/pruning; advertised commands do not establish permission or operation success.
- Consult help before mutations and preserve the existing workflow representation needed for recovery without exposing secrets. Read-before-edit; distinguish offline spec construction/validation from remote creation, replacement, and validation against live state.
- Help states `workflow build ... --push` creates a new workflow, whereas `workflow push <id>` replaces an existing workflow. Never confuse these operations.
- Validate the proposed changes using documented non-mutating validation before activation; validation is not permission to activate or execute a workflow.
- Confirm activation, execution triggers, deletion, bulk changes, and potentially externally communicating operations. Do not mutate or trigger workflows as arbitrary setup tests.
- Standing approval in `rules/agents.md` covers local preparation and creation of separate manual inactive Axelor demo test workflows; do not ask again for that preparation scope. Preserve existing workflows and execution-data protections. Execution, activation, existing-workflow changes and ERP writes remain separately approval-gated.
- Read back changed state and report partial failures. Do not blindly repeat non-idempotent writes or claim a successful execution from activation alone.