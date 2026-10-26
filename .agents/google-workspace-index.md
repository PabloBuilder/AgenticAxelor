# Google Workspace Operational Index

Use for Google Workspace operations through the external MCP server, not the Axelor Bridge.

## 1. Availability & Authentication

- Discover tools in the current session; use tool-category activation when available before declaring them unavailable. Follow actual schemas, not guessed names or fixed client prefixes.
- Local workstation configuration uses alias `google-workspace` and HTTP endpoint `https://google-mcp.alter-si.com/mcp`. These are local settings, not repository-guaranteed prerequisites.
- Configuration, discovery, authentication and operation success are distinct; none proves current access to other services or write permission.
- Verify current access through the requested read. If unavailable, report the actual blocker and ask the user to enable/start the MCP or authorize directly in the client/browser. Respect administrator restrictions; do not invent an OAuth proxy.
- Never inspect tokens, credential stores, or `.env`, request secrets in chat, or expose authentication details in diagnostics. Local disconnection does not revoke Google-side access.

## 2. Read & Investigate

1. Resolve the exact file/document/spreadsheet, sheet or range, calendar, thread, or recipient using supplied IDs and available discovery tools. Clarify ambiguity rather than guessing.
2. Read only information needed for the request; metadata discovery does not count as reading document contents.
3. Report verified facts and access limitations. Use pagination and local files under `Work_data/` for large supported exports rather than dumping payloads or base64 into chat.
4. Load [Axelor operations](standard-index.md), [Redmine operations](redmine-index.md), or [n8n operations](n8n-index.md) only for relevant mixed work.

## 3. Writes & Verification

- Retain supported read/write tools within account permissions; advertised service coverage is not proof of available tools or authorization.
- Read existing state before editing. Confirm the exact target, recipients, range, and requested change; never infer mutation permission from mere access or a setup request.
- Confirm sensitive operations before execution: message sending, external sharing, permission changes, destructive or bulk edits/deletions, and automation triggers.
- Perform only specifically requested writes. Do not create, send, share, or delete objects as arbitrary installation tests.
- Read back affected state using available tools and report partial failures. Do not claim untested services or write access succeeded.