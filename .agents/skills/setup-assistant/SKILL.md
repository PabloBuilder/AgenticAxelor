---
name: setup-assistant
description: Prepare and verify altersi-agent-workspace and its Google Workspace, Redmine and n8n connections, guiding the user through required authorization.
disable-model-invocation: true
---

# Setup Assistant

Prepare the environment in one guided run, targeting Goose by default; adapt to another client only when explicitly identified. Axelor is bundled; Google is an external MCP; Redmine and n8n use CLIs. Attempt all four branches independently and report partial results. Detect and test existing connections before requesting credentials. Do not ask the user to configure n8n MCP for the default setup: its API CLI is sufficient. Do not claim a connector is ready merely because it is installed or configured.

## Safety and execution

- Follow the [router](../../rules/agents.md), [operator index](../../standard-index.md), and relevant connector indexes. Setup does not authorize business writes, workflow execution, sharing or sending messages.
- Never request or display secrets in chat, command arguments, logs, generated config snippets or tool output. Never inspect credential stores, `.env`, registry values or session files. Do not query Bridge ports to retrieve sessions.
- Ask before overwriting client configuration, changing PATH or persistent credential storage, or running an external installer. Explain its source, effects and storage security first. Do not silently replace existing connections. Do not run the n8n no-argument installer implicitly.
- For missing keys, use a verified connector-supported masked interactive setup in a user-controlled terminal whose input and output are not captured by the agent. The user enters secrets there, never in chat. If such a mechanism or storage security cannot be established, stop that branch and explain the blocker; do not improvise secret handling. For browser authorization, use only a verified client/provider flow; never invent an OAuth endpoint.
- Use the available long-running terminal facility for the Bridge. If `rtk` is required but absent, report that prerequisite and follow the host's installation instructions; do not assume it exists. Commands below use `rtk`.

## Local user profile

- Read `.agents/local/user-profile.json` if present. Preserve a valid profile; otherwise ask for first and last name, never infer them, and allow skipping.
- Explain: local unencrypted file, ignored by Git, read via the router; separate per clone, not identity verification. Confirm before creation or replacement.
- Save only `firstName` and `lastName` as Unicode strings in UTF-8 JSON using a serializer. Verify parsing and `git check-ignore`. Change or delete only on request.
- Normal updates preserve ignored files; cleaning, deletion or recloning may remove them. Client loading of the router is not guaranteed.

## 1. Prerequisites and local build

1. Identify OS, project absolute path and the active MCP client; detect its supported configuration and reload procedure without reading secrets. Verify Node and npm with `rtk node -v` and `rtk npm -v`; Node 20+ is recommended. If missing, direct the user to https://nodejs.org/.
2. Run `rtk npm install` and `rtk npm run build`; confirm the build succeeds and `dist/index.js` exists. The lockfile includes an `n8n-axi` package requiring `N8N_MCP_URL` and `N8N_MCP_TOKEN`; it is not interchangeable with the externally supported API CLI using `N8N_BASE_URL` and `N8N_API_KEY`. Installing it does not configure either connection.
3. If a prerequisite or build fails, report the failure and continue other independent branches where possible.

## 2. Axelor MCP and Bridge

1. Using the client's documented format, prepare an entry with `node` and the absolute path to `dist/index.js`, as in the [README](../../../README.md). Do not copy credential environment variables from `mcp-config.example.json`: browser extension synchronization is the authentication source. Preserve existing entries and obtain approval before modifying client settings. If direct configuration is unsupported, provide the exact non-secret snippet and manual instructions. Reload/restart the client as needed.
2. Start `rtk npm run bridge` in a background terminal if not already running. Verify startup using its process output; if the port is occupied, report the conflict instead of starting duplicates or probing for sessions.
3. Ask the user to load `extension/` via `chrome://extensions` → developer mode → load unpacked, sign in to the intended Axelor instance, and click **Synchroniser la session**. Never request the cookie.
4. Discover MCP tools after client reload. Use `list_axelor_sessions` to identify the intended environment; ask if ambiguous. `sync_axelor_session` checks a saved session but does not prove it is still valid. Verify access with a suitable non-mutating Axelor read on the selected instance; if not possible, report session adoption and live access separately.

## 3. Google Workspace

1. Follow [Google Workspace index](../../google-workspace-index.md). Discover and activate current-session tools first. If absent, identify the active client's supported MCP configuration; the index documents a workstation-specific HTTP endpoint, not a universally approved deployment. Confirm the target endpoint with the user when needed.
2. Preserve existing client settings; with approval, configure the documented endpoint in the client-supported format or provide client-specific manual steps if automation is unavailable. Reload and rediscover tools.
3. For Goose, guide the user through its extension settings, or ask them to run [login-google-workspace.cmd](scripts/login-google-workspace.cmd) in their own terminal to open `goose configure`. Configure the validated remote MCP endpoint and use Goose's supported authorization flow if offered; a configuration wizard is not proof that OAuth succeeded. For other clients use their verified flow. Do not inspect tokens or invent a login URL. Reload the client and verify with a minimal permitted read.

## 4. Redmine

1. Follow the [Redmine index](../../redmine-index.md) and router: use the repository's `redmine-axi` skill and check that its CLI is available. Do not silently switch connectors. The repository CLI runs as `rtk proxy node scripts/redmine-axi.cjs` from the project root; it needs no Pi launcher or PATH change. The presence of the skill alone does not prove authentication.
2. On Windows, if authentication is missing, ask the user to run [configurer-redmine.bat](scripts/configurer-redmine.bat) in their own uncaptured terminal. It requests explicit confirmation, takes a masked key, checks a read-only API endpoint, and stores the CLI variables in unencrypted Windows user environment storage only if that check succeeds; it can overwrite existing values. It does not alter PATH or Pi files. Never run it in an agent-captured terminal. Restart Goose and its processes to inherit changes. Once the required route is available, verify with a permitted Redmine read.

## 5. n8n

1. Follow the [n8n index](../../n8n-index.md). Find the supported API CLI, then test existing inherited authentication with a minimal permitted workflow read, without printing credentials or workflow data. If it succeeds, n8n is ready for this setup: do not request another key, prompt about MCP, or modify configuration.
2. If a compatible API CLI is absent, use only a verified, approved installation procedure; otherwise report the blocker. Do not run no-argument setup or change persistent configuration implicitly. The local npm package is a different MCP CLI and is not evidence the required API CLI is installed.
3. Only if the API read fails due to missing or expired credentials, ask the user on Windows to run [configurer-n8n.bat](scripts/configurer-n8n.bat) in their own uncaptured terminal. It requests confirmation, takes a masked key, checks a read-only API endpoint, and stores the variables unencrypted in the Windows user environment only if that check succeeds. It may overwrite existing values, checks the documented workstation CLI and does not install it. Restart Goose, then retry a permitted read. Never execute a workflow as a setup test.
4. Configure n8n MCP only on an explicit separate request. In that case [configurer-n8n-mcp.bat](scripts/configurer-n8n-mcp.bat) and [n8n-mcp.cmd](scripts/n8n-mcp.cmd) support the separate npm MCP CLI; its token is not the API key, and it does not replace the n8n index's API CLI route. Never run an interactive helper in an agent-captured terminal.

## 6. Final report

For each connector report separately: installed, configured, authenticated and live read verified, or the exact remaining blocker/manual action. Mention client reload if required. Do not report full completion until all four requested connections have passed their respective read checks; do not confuse optional or unavailable services with Axelor readiness.
