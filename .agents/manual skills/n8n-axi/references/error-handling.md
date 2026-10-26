# n8n error handling

By default an n8n workflow **fails silently**: the first node error halts the whole
execution and nobody is told. That is tolerable while developing interactively; it is
dangerous for anything unattended — a Schedule Trigger job, a webhook integration, a sync.

Two mechanisms prevent it: **per-node error outputs** and a **workflow-level error
workflow**. Any workflow this skill activates should have at least one of them.

Distilled from [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) (MIT).

---

## Self-healing first — retries before branches

Before building any error branch, put retries on every node that touches the network.
Transient 429s and timeouts get absorbed, so the errors that do surface are *real* and
worth alerting on.

```
nodes[1]{name,type,v}:
  HTTP Request,n8n-nodes-base.httpRequest,4.2
attrs:
  HTTP Request:
    retryOnFail: true
    maxTries: 3
    waitBetweenTries: 5000   # ms
```

These are **top-level node keys**, which is why they go in the build spec's `attrs`
block — a sibling of `params`, not an entry inside it.

---

## Per-node error output — the two-step trap

`onError` is a top-level node key with three values:

| Value | Behaviour |
| --- | --- |
| `stopWorkflow` | default — the whole execution halts |
| `continueRegularOutput` | the error item continues down the **normal** output, carrying an `error` field |
| `continueErrorOutput` | the node grows a **second output** carrying only failures |

**The trap:** setting `onError: "continueErrorOutput"` only *creates* the output. You must
also **wire it**. Get one half without the other and:

- `onError` set, nothing wired → errors vanish silently. Worse than no handling.
- wired, `onError` not set → the handler is unreachable dead canvas.

Both halves, every time. The error output is `main` index **1**:

```
nodes[1]{name,type,v}:
  Appel API,n8n-nodes-base.httpRequest,4.2
attrs:
  Appel API:
    onError: continueErrorOutput
edges[2]{from,to,port}:
  Appel API,Suite normale,main       # main[0] — success
  Appel API,Gestion erreur,main:1    # main[1] — failure
```

On the error branch, the item carries `$json.error` with the message, and
`$json.error.httpCode` for HTTP nodes.

`n8n-axi workflow validate` does not check this pairing — verify it by re-reading the
`connections` object before pushing.

---

## Error workflow — the global net

An **Error Trigger** (`n8n-nodes-base.errorTrigger`) starts a dedicated workflow that runs
whenever a monitored workflow fails. Its input item carries:

```json
{
  "execution": { "id": "…", "url": "…", "error": { "message": "…", "stack": "…" },
                 "lastNodeExecuted": "Appel API", "mode": "trigger" },
  "workflow":  { "id": "…", "name": "…" }
}
```

Typical body: format the message → post to Slack / send an email, with the execution URL
so the user can open it directly.

**Limitation:** which error workflow a workflow uses is set in **Workflow Settings →
Error Workflow** in the UI. It is not reliably settable through the public API. So: build
the error workflow with this skill, push it, then **tell the user to attach it in the UI**
— do not claim it is wired up.

---

## Webhook / API workflows — respond, don't just fail

For a webhook that a caller is waiting on, a halted execution means the caller gets a
timeout or a bare 500 with no explanation. The canonical shape:

1. **Validate input upstream**, with an IF node — not via error outputs. A malformed
   request is not an exception, it is an expected case.
2. **Route every failure** to a Respond to Webhook node.
3. **Match the status code to the cause** — 4xx when the caller is wrong (bad payload,
   missing field, unknown id), 5xx when we are (upstream API down, unhandled error).
4. **Set `responseCode` explicitly.** Respond to Webhook defaults to **200** even on an
   error path — an unset code means you return "200 OK" alongside an error body, and the
   caller treats the failure as a success.

```
nodes[1]{name,type,v}:
  Reponse erreur,n8n-nodes-base.respondToWebhook,1.1
params:
  Reponse erreur:
    respondWith: json
    responseCode: 400
    responseBody: ={{ JSON.stringify({ error: $json.error.message }) }}
```

Keep the Webhook node's `responseMode` on `responseNode` so a Respond to Webhook node is
what answers.

---

## Choosing a strategy

| Situation | Strategy |
| --- | --- |
| Transient network flakiness | `retryOnFail` — nothing else |
| One item in a batch may fail, the rest must proceed | `continueErrorOutput` + a collector branch |
| Failure must be visible but must not stop the run | `continueRegularOutput` + downstream IF on `$json.error` |
| Unattended scheduled job | Error Trigger workflow + a notification |
| Webhook with a waiting caller | Upstream validation + Respond to Webhook with a real status code |
| Failure means the data would be corrupted | `stopWorkflow` (default) — halting is correct |

Do not reflexively add `continueRegularOutput` everywhere. Swallowing an error that should
have stopped the run is how corrupt data gets written.

---

## Before activating

- [ ] Every network node has `retryOnFail` set.
- [ ] Every `onError: "continueErrorOutput"` has its `main[1]` edge actually wired.
- [ ] No error branch dead-ends in a node that does nothing.
- [ ] Webhook workflows set `responseCode` explicitly on every error response.
- [ ] The user was told to attach the error workflow in the UI, if one was built.

---

## Related

- [`workflow-patterns.md`](workflow-patterns.md) — the four gates before activation
- [`code-nodes.md`](code-nodes.md) — throwing usefully from a Code node
- [`expressions.md`](expressions.md) — reading `$json.error` on the error branch
- [`node-catalog.md`](node-catalog.md) — exact `type` / `typeVersion`
