# Node catalog — nodes we actually use

Only the node types used by Alter-SI n8n workflows are documented here, **not** the full
n8n node library. If a workflow needs a node absent from this catalog, look up its exact
`type` / `typeVersion` in the target n8n instance (open the node in the editor → `…` →
*Copy* pastes the node JSON) before using it. **Never guess a node type or a
typeVersion.**

`typeVersion` values below reflect n8n 1.x (roughly 1.40+). n8n keeps older
typeVersions working forever, so a slightly-old value is safe; a value *newer* than the
target instance supports is not. Values marked `⚠ À valider` should be confirmed against
the actual instance before a production push.

## Keeping this current

This file is hand-curated and drifts on every n8n upgrade. To check it against the live
instance:

```bash
n8n-axi catalog drift
```

It samples every workflow on the instance and reports three deltas — `STALE` (catalog
version lower than what the instance runs), `UNCOVERED` (node used on the instance but
missing here), `UNVERIFIED` (documented here but used by no workflow, so this instance
cannot confirm it) — without writing anything (`n8n-axi guide` → "Maintenance").

`n8n-axi catalog build` regenerates the CLI's own catalog from the instance; a typeVersion
in this hand-curated file is only updated here after a human confirms it against `catalog
drift`'s report. Note that `UNVERIFIED` is *not* evidence a value is wrong — it only means
the instance offers no proof either way.

## Common node shape

Every node in `workflow["nodes"]` has this envelope:

```json
{
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [460, 300],
  "parameters": {}
}
```

- `name` — unique within the workflow. Connections are keyed **by name**, so renaming a
  node means rewriting its edges.
- `position` — `[x, y]`. `n8n-axi workflow build` assigns grid positions for you; do not
  hand-write it.
- `parameters` — node-specific; the sections below give a minimal working shape.

---

## Schedule Trigger

Runs the workflow on an interval. This is the usual trigger for our scheduled jobs.

- **type**: `n8n-nodes-base.scheduleTrigger`
- **typeVersion**: `1.2`

```json
{
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "parameters": {
    "rule": {
      "interval": [
        { "field": "hours", "hoursInterval": 6 }
      ]
    }
  }
}
```

`field` accepts `seconds` / `minutes` / `hours` / `days` / `weeks` / `months`, each with
its matching `<field>Interval` key. For a cron expression instead:

```json
{
  "rule": {
    "interval": [
      { "field": "cronExpression", "expression": "0 7 * * 1-5" }
    ]
  }
}
```

## Webhook

Exposes an HTTP endpoint that starts the workflow.

- **type**: `n8n-nodes-base.webhook`
- **typeVersion**: `2.1` *(confirmed in use on `automation.alter-si.fr`)*

```json
{
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2.1,
  "parameters": {
    "httpMethod": "POST",
    "path": "inbound-example",
    "responseMode": "onReceived"
  }
}
```

- `path` must be unique across the instance — a collision makes activation fail. The
  editor generates a UUID for it by default (`"path": "b31dbc77-…"`), which is why an
  exported webhook often shows a UUID rather than a readable path.
- `responseMode`: `onReceived` (respond immediately), `lastNode` (respond with the last
  node's output), or `responseNode` (a *Respond to Webhook* node handles the reply).
- The node also carries a `webhookId` (a UUID) when exported from the editor. It is
  optional on create — n8n generates one.

## HTTP Request

The workhorse for calling external APIs.

- **type**: `n8n-nodes-base.httpRequest`
- **typeVersion**: `4.2`

```json
{
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/v1/items",
    "options": {}
  }
}
```

With query parameters and a JSON body:

```json
{
  "method": "POST",
  "url": "https://api.example.com/v1/items",
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      { "name": "limit", "value": "100" }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "={{ JSON.stringify($json) }}",
  "options": {}
}
```

- `method` defaults to `GET` and is omitted from the editor export when it is `GET`.
- A leading `=` on a string value marks it as an **expression** (`={{ ... }}`). Without
  the `=`, the value is a literal.
- For authenticated calls, set `authentication` and attach a credential — see
  [Credentials](#credentials) below.

## Code

Arbitrary JavaScript (or Python) over the incoming items.

- **type**: `n8n-nodes-base.code`
- **typeVersion**: `2`

```json
{
  "name": "Code",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "return items.map(item => ({ json: { id: item.json.id } }));"
  }
}
```

- `mode`: `runOnceForAllItems` (default, `items` in scope) or `runOnceForEachItem`
  (`$input.item` in scope, return a single `{json: …}`).
- The code **must** return items in `[{json: {...}}, ...]` shape.
- For Python: `"language": "python"` plus `pythonCode` instead of `jsCode`.

## Set (Edit Fields)

Builds or reshapes the item payload. Named *Edit Fields* in the editor UI, but the type
string is still `set`.

- **type**: `n8n-nodes-base.set`
- **typeVersion**: `3.4`

```json
{
  "name": "Edit Fields",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "parameters": {
    "mode": "manual",
    "assignments": {
      "assignments": [
        {
          "id": "a1",
          "name": "orderId",
          "value": "={{ $json.id }}",
          "type": "string"
        }
      ]
    },
    "includeOtherFields": false,
    "options": {}
  }
}
```

- The doubly-nested `assignments.assignments` is correct, not a typo.
- `id` is any unique string within the node; the editor uses a UUID.
- `type`: `string` / `number` / `boolean` / `array` / `object`.
- typeVersion 3.x uses `assignments`; **1.x/2.x used a completely different `values`
  shape** — do not mix them.

## IF

Two-way branch. Output `0` is the **true** branch, output `1` the **false** branch.

- **type**: `n8n-nodes-base.if`
- **typeVersion**: `2.2`

```json
{
  "name": "IF",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.2,
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict",
        "version": 2
      },
      "conditions": [
        {
          "id": "c1",
          "leftValue": "={{ $json.status }}",
          "rightValue": "paid",
          "operator": { "type": "string", "operation": "equals" }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  }
}
```

- Wire the branches with the build spec's `edges` `port` column:

      edges[2]{from,to,port}:
        IF,Paid path,main
        IF,Unpaid path,main:1
- `combinator`: `and` or `or`.
- Common `operator.operation` values: `equals`, `notEquals`, `contains`, `exists`,
  `notExists`, `gt`, `lt`, `gte`, `lte` (with `operator.type` = `string` / `number` /
  `boolean` / `dateTime` / `array` / `object`).

## Merge

Joins two (or more) branches back together.

- **type**: `n8n-nodes-base.merge`
- **typeVersion**: `3`

```json
{
  "name": "Merge",
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "parameters": {
    "mode": "append",
    "numberInputs": 2
  }
}
```

- `mode`: `append` (concatenate), `combine` (join on a field / by position / all
  combinations), `chooseBranch` (pass one branch through).
- Merge is the one node with **multiple inputs**: target them with the `edges` `in`
  column:

      edges[2]{from,to,in}:
        Branch A,Merge,0
        Branch B,Merge,1
- For `combine` by field:
  `{"mode": "combine", "fieldsToMatchString": "id", "options": {}}`.

## Shopify

- **type**: `n8n-nodes-base.shopify`
- **typeVersion**: `1`

```json
{
  "name": "Shopify",
  "type": "n8n-nodes-base.shopify",
  "typeVersion": 1,
  "parameters": {
    "authentication": "accessToken",
    "resource": "order",
    "operation": "getAll",
    "returnAll": false,
    "limit": 50,
    "options": {}
  },
  "credentials": {
    "shopifyAccessTokenApi": {
      "id": "17",
      "name": "Shopify account"
    }
  }
}
```

- `authentication` drives which credential type is required:
  - `accessToken` → `shopifyAccessTokenApi`
  - `apiKey` → `shopifyApi`
  - `oAuth2` → `shopifyOAuth2Api`
- `resource`: `order`, `product`, `customer`.
- `operation`: `create`, `delete`, `get`, `getAll`, `update`.
- ⚠ À valider — confirm the credential **id** against the target instance; ids differ
  between the dev and production n8n instances.

## Anthropic (LangChain)

Observed in use on `automation.alter-si.fr`. Ships with the bundled
`@n8n/n8n-nodes-langchain` package, **not** with `n8n-nodes-base`.

- **type**: `@n8n/n8n-nodes-langchain.anthropic`
- **typeVersion**: `1`

```json
{
  "name": "Generate a prompt",
  "type": "@n8n/n8n-nodes-langchain.anthropic",
  "typeVersion": 1,
  "parameters": {
    "resource": "prompt"
  }
}
```

⚠ À valider — only the `resource: "prompt"` shape has been observed here. The other
resources and their parameters are **not** documented: read them off a real node in the
editor before use rather than guessing.

Other `@n8n/n8n-nodes-langchain.*` nodes (agents, chat models, vector stores) are **not
covered by this catalog**. They use sub-node connection types (`ai_languageModel`,
`ai_tool`, `ai_memory`) rather than plain `main` connections, so the build spec's
`edges` `port` column — which defaults to `main` — is wrong for them: set it
explicitly (`ai_tool`, `ai_languageModel`, `ai_memory`) instead of leaving it at the
default.

---

## Credentials

**Credentials cannot be created or modified through the n8n public API.** A node may only
**reference a credential that already exists** in the target instance. The skill never
attempts to create, update, or read credential secrets.

Generic reference shape, valid for any node:

```json
{
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/v1/items",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "options": {}
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "42",
      "name": "Example API key"
    }
  }
}
```

The `credentials` map is keyed by **credential type name** (`httpHeaderAuth`,
`shopifyAccessTokenApi`, `httpBasicAuth`, …), and each entry holds the `id` and the
display `name` of an existing credential.

### Finding a credential id

There is no public `GET /credentials` list endpoint. Get the id either by:

1. Opening the credential in the n8n UI — the id is the last path segment of the URL
   (`/home/credentials/42`); or
2. Exporting an existing workflow that already uses it
   (`n8n-axi workflow view <id> --node "<name>"`) and copying the `credentials`
   block verbatim.

`GET /credentials/schema/{credentialTypeName}` is available and returns the *shape* of a
credential type, but never a secret and never an id.

**If a credential id is unknown, ask — do not invent one.** A fabricated id produces a
workflow that saves cleanly and then fails at runtime.
# >>> n8n-axi-observed >>>
## Observed on this instance

Generated by `n8n-axi catalog build` on 2026-08-23 from 32 node type(s)
in use across the instance's workflows. **Do not edit by hand** — regenerate.

These typeVersions are what the instance actually runs, so they are the ones
to use when authoring. Parameter keys are those observed in production, which
is evidence of what works, not a complete schema.

### agent — 8 uses

- **type**: `@n8n/n8n-nodes-langchain.agent`
- **typeVersion**: `3.1`
- **parameters observed**: `agent`, `aiAgentStarterCallout`, `binaryPropertyName`, `credentials`, `dataSource`, `deprecated`, `fallbackNotice`, `hasOutputParser`, `input`, `needsFallback`, `notice`, `options`, `promptType`, `sqLiteFileNotice`, `text`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### anthropic — 1 use

- **type**: `@n8n/n8n-nodes-langchain.anthropic`
- **typeVersion**: `1`
- **parameters observed**: `addAttachments`, `attachmentsInputType`, `attachmentsUrls`, `binaryPropertyName`, `documentUrls`, `experimentalNotice`, `fileId`, `fileUrl`, `imageUrls`, `inputType`, `limit`, `messages`, `modelId`, `operation`, `options`, `resource`, `returnAll`, `simplify`, `task`, `text`
- **example workflow**: My workflow 4

### lmChatAnthropic — 6 uses

- **type**: `@n8n/n8n-nodes-langchain.lmChatAnthropic`
- **typeVersion**: `1.5`
- **parameters observed**: `model`, `notice`, `options`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### mcpTrigger — 4 uses

- **type**: `@n8n/n8n-nodes-langchain.mcpTrigger`
- **typeVersion**: `2`
- **parameters observed**: `authentication`, `path`, `requireExecuteAccess`
- **example workflow**: Redmine – Priorisation (Serveur MCP)

### outputParserStructured — 8 uses

- **type**: `@n8n/n8n-nodes-langchain.outputParserStructured`
- **typeVersion**: `1.3`
- **parameters observed**: `autoFix`, `customizeRetryPrompt`, `inputSchema`, `jsonSchema`, `jsonSchemaExample`, `notice`, `prompt`, `schemaType`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### toolWorkflow — 4 uses

- **type**: `@n8n/n8n-nodes-langchain.toolWorkflow`
- **typeVersion**: `2.2`
- **parameters observed**: `description`, `executeNotice`, `fields`, `inputSchema`, `jsonSchemaExample`, `name`, `notice`, `noticeTemplateExample`, `responsePropertyName`, `schemaType`, `source`, `specifyInputSchema`, `workflowId`, `workflowInputs`, `workflowJson`
- **example workflow**: Redmine – Priorisation (Serveur MCP)

### code — 38 uses

- **type**: `n8n-nodes-base.code`
- **typeVersion**: `2`
- **parameters observed**: `jsCode`, `language`, `mode`, `notice`, `pythonCode`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### dataTable — 11 uses

- **type**: `n8n-nodes-base.dataTable`
- **typeVersion**: `1.1`
- **parameters observed**: `clearWarning`, `columns`, `dataTableId`, `deleteWarning`, `filters`, `limit`, `matchType`, `newName`, `operation`, `options`, `orderBy`, `orderByColumn`, `orderByDirection`, `resource`, `returnAll`, `tableName`
- **example workflow**: Redmine – Priorité & Échéance (agent, sous-workflow)

### executeCommand — 1 use

- **type**: `n8n-nodes-base.executeCommand`
- **typeVersion**: `1`
- **parameters observed**: `command`, `executeOnce`
- **example workflow**: TMP – Recon headless

### executeWorkflow — 3 uses

- **type**: `n8n-nodes-base.executeWorkflow`
- **typeVersion**: `1.3`
- **parameters observed**: `eachModeDeprecationNotice`, `executeWorkflowNotice`, `mode`, `operation`, `options`, `outdatedVersionWarning`, `source`, `sourceDeprecationNotice`, `workflowId`, `workflowInputs`, `workflowJson`, `workflowPath`, `workflowUrl`
- **example workflow**: Priorisation auto – nouveaux tickets Support

### executeWorkflowTrigger — 7 uses

- **type**: `n8n-nodes-base.executeWorkflowTrigger`
- **typeVersion**: `1.2`
- **parameters observed**: `events`, `inputSource`, `jsonExample`, `jsonExample_notice`, `notice`, `outdatedVersionWarning`, `returnOutput`, `workflowInputs`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### extractFromFile — 2 uses

- **type**: `n8n-nodes-base.extractFromFile`
- **typeVersion**: `1`
- **parameters observed**: `binaryPropertyName`, `destinationKey`, `operation`, `options`
- **example workflow**: Prospection - Nouveau lead KaLeads (Gmail -> Drive + Axelor)

### form — 2 uses

- **type**: `n8n-nodes-base.form`
- **typeVersion**: `2.5`
- **parameters observed**: `completionMessage`, `completionTitle`, `defineForm`, `formFields`, `inputDataFieldName`, `jsonOutput`, `limitType`, `limitWaitTime`, `maxDateAndTime`, `operation`, `options`, `redirectUrl`, `respondWith`, `responseText`, `resumeAmount`, `resumeUnit`, `triggerNotice`
- **example workflow**: Tactique hebdo – Saisie (formulaire)

### formTrigger — 1 use

- **type**: `n8n-nodes-base.formTrigger`
- **typeVersion**: `2.6`
- **parameters observed**: `addFormPage`, `authentication`, `formDescription`, `formFields`, `formNotice`, `formTitle`, `options`, `path`, `requireExecuteAccess`, `responseMode`
- **example workflow**: Tactique hebdo – Saisie (formulaire)

### gitlab — 1 use

- **type**: `n8n-nodes-base.gitlab`
- **typeVersion**: `1`
- **parameters observed**: `additionalFields`, `additionalParameters`, `asBinaryProperty`, `assignee_ids`, `authentication`, `binaryData`, `binaryPropertyName`, `body`, `branch`, `commitMessage`, `due_date`, `editFields`, `fileContent`, `filePath`, `getRepositoryIssuesFilters`, `issueNumber`, `labels`, `limit`, `lockReason`, `operation`, `owner`, `page`, `projectId`, `releaseTag`, `repository`, `resource`, `returnAll`, `tag_name`, `title`
- **example workflow**: TEMP - GitLab Project Discovery

### gmail — 3 uses

- **type**: `n8n-nodes-base.gmail`
- **typeVersion**: `2.1`
- **parameters observed**: `additionalFields`, `approvalOptions`, `authentication`, `defineForm`, `emailType`, `filters`, `filtersNotice`, `formFields`, `htmlMessage`, `includeHtml`, `jsonOutput`, `labelId`, `labelIds`, `labelListVisibility`, `limit`, `message`, `messageId`, `messageListVisibility`, `name`, `oldVersionNotice`, `operation`, `options`, `resource`, `responseType`, `returnAll`, `sendTo`, `simple`, `simplifyMemoryNotice`, `subject`, `threadId`, `threadNotice`, `toList`
- **example workflow**: Tri automatique des emails par rôle (IA) — ⚠ types Gmail/Drive à valider

### gmailTrigger — 2 uses

- **type**: `n8n-nodes-base.gmailTrigger`
- **typeVersion**: `1.2`
- **parameters observed**: `authentication`, `event`, `filters`, `maxResults`, `options`, `pollTimes`, `simple`, `simplifyMemoryNotice`
- **example workflow**: Prospection - Nouveau lead KaLeads (Gmail -> Drive + Axelor)

### googleDrive — 2 uses

- **type**: `n8n-nodes-base.googleDrive`
- **typeVersion**: `3`
- **parameters observed**: `authentication`, `binaryData`, `binaryPropertyName`, `changeFileContent`, `content`, `driveId`, `fileContent`, `fileId`, `filter`, `folderId`, `folderNoRootId`, `inputDataFieldName`, `limit`, `name`, `newUpdatedFileName`, `oldVersionNotice`, `operation`, `options`, `parents`, `permissionsUi`, `queryFilters`, `queryString`, `resolveData`, `resource`, `returnAll`, `sameFolder`, `searchMethod`, `updateFields`, `useQueryString`
- **example workflow**: Veille - Traitement actions CEO

### googleSheets — 1 use

- **type**: `n8n-nodes-base.googleSheets`
- **typeVersion**: `4.5`
- **parameters observed**: `authentication`, `autoMapNotice`, `clear`, `columnToMatchOn`, `columns`, `columnsToDelete`, `combineFilters`, `dataMode`, `dataProperty`, `dataStartRow`, `documentId`, `fieldsUi`, `filtersUI`, `id`, `keepFirstRow`, `key`, `keyRow`, `lookupColumn`, `lookupValue`, `numberToDelete`, `oldVersionNotice`, `operation`, `options`, `range`, `rawData`, `resource`, `rowsToDelete`, `sheetId`, `sheetName`, `sheetsUi`, `simple`, `startIndex`, `title`, `toDelete`, `valueToMatchOn`
- **example workflow**: Veille - Ingestion & Scoring IA

### googleTasks — 1 use

- **type**: `n8n-nodes-base.googleTasks`
- **typeVersion**: `1`
- **parameters observed**: `additionalFields`, `limit`, `operation`, `resource`, `returnAll`, `task`, `taskId`, `title`, `updateFields`
- **example workflow**: Veille - Traitement actions CEO

### httpRequest — 47 uses

- **type**: `n8n-nodes-base.httpRequest`
- **typeVersion**: `4.4`
- **parameters observed**: `allowUnauthorizedCerts`, `authentication`, `binaryPropertyName`, `body`, `bodyParameters`, `bodyParametersJson`, `bodyParametersUi`, `contentType`, `credentials`, `cssSelector`, `curlImport`, `dataField`, `dataPropertyName`, `elementsToOmit`, `fields`, `fieldsToInclude`, `genericAuthType`, `googleApiWarning`, `headerParameters`, `headerParametersJson`, `headerParametersUi`, `infoMessage`, `inputDataFieldName`, `jsonBody`, `jsonHeaders`, `jsonParameters`, `jsonQuery`, `maxLength`, `method`, `nodeCredentialType`, `onlyContent`, `optimizeResponse`, `options`, `provideSslCertificates`, `provideSslCertificatesNotice`, `queryParameters`, `queryParametersJson`, `queryParametersUi`, `rawContentType`, `requestMethod`, `responseFormat`, `responseType`, `sendBinaryData`, `sendBody`, `sendHeaders`, `sendQuery`, `specifyBody`, `specifyHeaders`, `specifyQuery`, `sslCertificate`, `truncateResponse`, `url`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### httpRequestTool — 12 uses

- **type**: `n8n-nodes-base.httpRequestTool`
- **typeVersion**: `4.4`
- **parameters observed**: `authentication`, `body`, `bodyParameters`, `contentType`, `cssSelector`, `curlImport`, `dataField`, `elementsToOmit`, `fields`, `fieldsToInclude`, `genericAuthType`, `googleApiWarning`, `headerParameters`, `infoMessage`, `inputDataFieldName`, `jsonBody`, `jsonHeaders`, `jsonQuery`, `maxLength`, `method`, `nodeCredentialType`, `onlyContent`, `optimizeResponse`, `options`, `provideSslCertificates`, `provideSslCertificatesNotice`, `queryParameters`, `rawContentType`, `responseType`, `sendBody`, `sendHeaders`, `sendQuery`, `specifyBody`, `specifyHeaders`, `specifyQuery`, `sslCertificate`, `toolDescription`, `truncateResponse`, `url`
- **example workflow**: MCP redmine

### if — 8 uses

- **type**: `n8n-nodes-base.if`
- **typeVersion**: `2.3`
- **parameters observed**: `combineOperation`, `conditions`, `looseTypeValidation`, `options`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### inoreader — 6 uses

- **type**: `n8n-nodes-base.inoreader`
- **typeVersion**: `1`
- **parameters observed**: `articleContent`, `articleId`, `articleTitle`, `articleUrl`, `limit`, `operation`, `resource`, `returnAll`, `tagId`
- **example workflow**: Veille - Ingestion & Scoring IA

### inoreaderTrigger — 1 use

- **type**: `n8n-nodes-base.inoreaderTrigger`
- **typeVersion**: `1`
- **parameters observed**: `folderId`, `pollTimes`, `triggerType`
- **example workflow**: Veille - Ingestion & Scoring IA

### manualTrigger — 9 uses

- **type**: `n8n-nodes-base.manualTrigger`
- **typeVersion**: `1`
- **parameters observed**: `notice`
- **example workflow**: TEMPORAIRE - verif mapping projet-depot

### noOp — 1 use

- **type**: `n8n-nodes-base.noOp`
- **typeVersion**: `1`
- **parameters observed**: none
- **example workflow**: Veille - Ingestion & Scoring IA

### scheduleTrigger — 4 uses

- **type**: `n8n-nodes-base.scheduleTrigger`
- **typeVersion**: `1.3`
- **parameters observed**: `notice`, `rule`, `skipDurableScheduler`
- **example workflow**: Test workflow (Claude)

### set — 13 uses

- **type**: `n8n-nodes-base.set`
- **typeVersion**: `3.4`
- **parameters observed**: `assignments`, `duplicateCount`, `duplicateItem`, `duplicateWarning`, `excludeFields`, `fields`, `include`, `includeFields`, `includeOtherFields`, `jsonOutput`, `keepOnlySet`, `mode`, `options`, `values`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### ssh — 1 use

- **type**: `n8n-nodes-base.ssh`
- **typeVersion**: `1`
- **parameters observed**: `authentication`, `binaryPropertyName`, `command`, `cwd`, `operation`, `options`, `path`, `resource`
- **example workflow**: Skill priorisation – appel headless (sous-workflow)

### switch — 1 use

- **type**: `n8n-nodes-base.switch`
- **typeVersion**: `3.4`
- **parameters observed**: `dataType`, `fallbackOutput`, `looseTypeValidation`, `mode`, `numberOutputs`, `options`, `output`, `outputsAmount`, `rules`, `value1`
- **example workflow**: Redmine – Analyse fonctionnelle & technique (passe 2)

### webhook — 1 use

- **type**: `n8n-nodes-base.webhook`
- **typeVersion**: `2.1`
- **parameters observed**: `authentication`, `contentTypeNotice`, `httpMethod`, `multipleMethods`, `options`, `path`, `requireExecuteAccess`, `responseBinaryPropertyName`, `responseCode`, `responseData`, `responseMode`, `webhookNotice`, `webhookStreamingNotice`
- **example workflow**: My workflow 4
# <<< n8n-axi-observed <<<
