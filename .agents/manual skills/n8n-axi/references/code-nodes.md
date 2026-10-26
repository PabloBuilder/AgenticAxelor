# n8n Code nodes — JavaScript, Python, and Code Tool

Reach for a Code node **last**, not first: walk the transform gatekeeper in
[`expressions.md`](expressions.md) before writing one. When a Code node is genuinely
warranted, this file is the contract.

Distilled from [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) (MIT).

---

## Rule zero — no `{{ }}` inside a Code node

Expressions are a field-level feature. A Code node is plain JavaScript or Python with the
n8n variables already in scope.

```javascript
// ❌ WRONG — this is a string containing braces, not a value
const email = '={{ $json.body.email }}';

// ✅ CORRECT
const email = $json.body.email;
```

`n8n-axi workflow validate` flags `{{` inside `jsCode` / `pythonCode` as
`expr_in_code_node`.

And the webhook rule still applies: `$json.body.x`, never `$json.x`.

---

## Execution modes

Set with the `mode` parameter on `n8n-nodes-base.code`.

| Mode | `mode` value | Runs | Cost |
| --- | --- | --- | --- |
| **Run Once for All Items** | `runOnceForAllItems` (default) | once, whatever the item count | ~0.02 ms/item |
| **Run Once for Each Item** | `runOnceForEachItem` | once per input item | ~0.6 ms/item |

**Use *All Items* for roughly 95% of cases.** It is 25–30× cheaper because it crosses the
per-item execution boundary once instead of N times. Array methods (`map`, `filter`,
`reduce`) inside a single All-Items run beat looping across per-item boundaries every
time.

*Each Item* earns its place only when the logic is genuinely per-item **and** you want
n8n's automatic item pairing and per-item error isolation.

---

## Data access

| In *All Items* mode | Meaning |
| --- | --- |
| `$input.all()` | array of all input items — each is `{ json: {...}, binary: {...} }` |
| `$input.first()` / `$input.last()` | first / last item |
| `$('Node Name').all()` | all items from a named upstream node |
| `$('Node Name').first().json.x` | one field from a named node |

| In *Each Item* mode | Meaning |
| --- | --- |
| `$input.item` | the current item |
| `$json` | shorthand for `$input.item.json` |
| `$('Node Name').item.json.x` | paired item from a named node |

Always go through `.json` to reach fields — `$input.all()[0].name` is `undefined`,
`$input.all()[0].json.name` is the value.

---

## Return contract

The canonical return is an **array of items**:

```javascript
return [
  { json: { id: 1, name: 'A' } },
  { json: { id: 2, name: 'B' } },
];
```

In *All Items* mode n8n auto-wraps looser shapes (a bare object, an array of plain
objects). What genuinely fails: returning a primitive (string, number), returning `null`,
or returning nothing.

In *Each Item* mode return a **single item object**, not an array:

```javascript
return { json: { ...$json, total: $json.price * $json.qty } };
```

**`pairedItem`.** When an All-Items run emits items that do not map 1:1 onto the inputs
(a fan-out, an aggregation), set `pairedItem` so downstream `$('Node').item` references
still resolve:

```javascript
return $input.all().flatMap((item, i) =>
  item.json.lines.map(line => ({ json: line, pairedItem: i }))
);
```

Without it, downstream item-paired expressions fail with a "cannot determine paired item"
error.

---

## Built-ins

| Available | Notes |
| --- | --- |
| `DateTime`, `Duration`, `Interval` | Luxon, for all date work |
| `$jmespath(obj, 'expression')` | querying deep JSON |
| `this.helpers.httpRequest({...})` | HTTP from inside code — **unauthenticated only** |
| `$getWorkflowStaticData('global')` | state that survives across executions |
| `$workflow`, `$execution` | workflow/execution metadata |

Not available or instance-dependent: `require` of arbitrary npm packages (only what
`NODES_EXCLUDE`/`NODE_FUNCTION_ALLOW_EXTERNAL` permits), `$env` (often blocked — see
[`expressions.md`](expressions.md)), authenticated HTTP helpers.

Prefer a real **HTTP Request node** over `this.helpers.httpRequest` — it gets credentials,
retries, and error outputs for free.

### Static data — the persistence escape hatch

```javascript
const store = $getWorkflowStaticData('global');
store.lastSyncedAt = store.lastSyncedAt || null;
const since = store.lastSyncedAt;
store.lastSyncedAt = new Date().toISOString();
return [{ json: { since } }];
```

Persisted only on **active** workflows — a manual test run does not save it. Use it for
watermarks (last synced id/date) and for accumulating across SplitInBatches iterations.

---

## Python Code nodes

`language: "python"` on the Code node. n8n runs Pyodide.

- **Standard library only** — no `pip install`. Same constraint as this repo's scripts.
- Variables are prefixed the same way but accessed as `_input`, `_json`, `_` helpers:
  `_input.all()`, `items = _input.all()`, `item.json.x` becomes `item["json"]["x"]`.
- Slower to start than JavaScript (the Pyodide runtime boots per execution).

**Default to JavaScript** unless the user specifically wants Python. There is no
capability here that JavaScript lacks, and the startup cost is real.

---

## Code Tool — a different contract

`@n8n/n8n-nodes-langchain.toolCode` is a Code node exposed to an **AI Agent** as a
callable tool. It is not a pipeline node and does not follow the rules above.

- Input arrives as the tool **query** (`query` variable), not as `$input.all()`.
- It must return a **string** — the agent reads it as text. Returning an object gets
  stringified unpredictably.
- Give it a precise `description`: that text is the only thing the model uses to decide
  when to call it.
- It is invoked zero-to-many times per agent run, at the model's discretion.

Wire it to the agent on the `ai_tool` connection type, not `main` — the build spec's
`edges` `port` column:

```
edges[1]{from,to,port}:
  My Code Tool,AI Agent,ai_tool
```

---

## Practices worth keeping

- **Validate inputs.** Guard on shape before transforming; a missing field should raise a
  clear `throw new Error('champ X absent')`, not produce `undefined` three nodes later.
- **`try`/`catch` around risky parsing**, and let the error surface — see
  [`error-handling.md`](error-handling.md) for routing it.
- **Filter early**, before expensive transforms.
- **Do not put field mapping or simple filtering in a Code node.** Set / Filter nodes are
  clearer and cheaper. Code is for multi-step logic that has no node equivalent.

---

## Related

- [`expressions.md`](expressions.md) — the gatekeeper; why Code is a last resort
- [`workflow-patterns.md`](workflow-patterns.md) — batching and per-item costs
- [`error-handling.md`](error-handling.md) — routing what a Code node throws
- [`node-catalog.md`](node-catalog.md) — exact `type` / `typeVersion`
