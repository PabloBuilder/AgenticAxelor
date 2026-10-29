# n8n expressions — syntax and traps

Read this **before writing any expression or Code node**. Expressions are how data moves
between nodes; getting the syntax wrong is the single largest source of workflows that
save cleanly and then fail at runtime — exactly the failure mode the structural
checks cannot catch.

Distilled from [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) (MIT),
adapted to the `n8n-axi` REST + `workflow build` path.

---

## Trap #1 — Webhook data lives under `.body`

This is the most frequent mistake in n8n, by a wide margin. A Webhook node does **not**
emit the caller's payload at the root. It emits:

```json
{
  "headers": { "content-type": "application/json", "…": "…" },
  "params":  { },
  "query":   { },
  "body":    { "name": "John", "email": "john@example.com" }
}
```

```
❌ {{ $json.email }}          → undefined
✅ {{ $json.body.email }}
✅ {{ $('Webhook').item.json.body.email }}
```

Same rule inside a Code node: `$json.body.email`, not `$json.email`.

Query-string params are under `.query`, URL path params under `.params`, headers under
`.headers`. Only `.body` holds the posted payload.

---

## Format

All dynamic content is wrapped in **double** curly braces:

```
✅ {{ $json.email }}
❌ $json.email       → treated as literal text, ships to the API as the string "$json.email"
❌ { $json.email }   → invalid
❌ {{{ $json.email }}}  → invalid, no nesting
```

In an n8n JSON payload a parameter whose whole value is an expression is conventionally
prefixed with `=`:

```json
{ "url": "=https://api.example.com/users/{{ $json.body.user_id }}" }
```

When building via `n8n-axi workflow build`, write that `=` prefix yourself — nothing adds it
for you.

---

## Variables

| Variable | Use |
| --- | --- |
| `$json` | output of the **immediately upstream** node |
| `$('Node Name').item.json.x` | value from a named node, paired to the current item — **preferred** |
| `$('Node Name').all()` | all items from a named node |
| `$node["Node Name"].json.x` | older syntax, same idea; still valid |
| `$now` | current DateTime (Luxon) |
| `$today` | current date at midnight (Luxon) |
| `$env.VAR` | environment variable — see caveat below |
| `$itemMatching(i)`, `$input` | item pairing helpers |
| `$getWorkflowStaticData('global')` | state persisted across executions |

**`$env` caveat.** Many instances run with `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`, which
makes `$env` throw. Do not design a workflow around `$env` without confirming with the
user. Alternatives: an n8n credential, a Set node with the value entered once, or a
webhook query parameter.

### Prefer `$('Node').item.json` over deep `$json`

`$json` means "whatever the previous node emitted" — it silently changes meaning the
moment someone inserts a node upstream, or when an intermediate node clears item context
(Aggregate, a Code node in *Run Once for All Items* mode, a branch merge). The failure is
silent: downstream gets the wrong data with no error.

A node-name reference is unambiguous no matter what sits in between. Use it in any
workflow with more than a straight line of nodes.

---

## Bracket notation — mandatory for spaces and accents

```
❌ {{ $json.field name }}
✅ {{ $json['field name'] }}

❌ {{ $node.HTTP Request.json }}
✅ {{ $node["HTTP Request"].json }}
```

**This matters here:** our field labels are French and therefore accented. Dot notation
breaks on them.

```
✅ {{ $json['Prix brut'] }}
✅ {{ $json['Référence société'] }}
✅ {{ $json['Montant TTC €'] }}
```

Node names are **case-sensitive** and must match the workflow exactly:

```
❌ {{ $node["http request"].json }}
✅ {{ $node["HTTP Request"].json }}
```

Connections in a build spec are keyed by node name too — so renaming a node breaks
both its edges *and* every expression referencing it. Rename deliberately.

---

## Where expressions do NOT apply

### Code nodes — plain JavaScript/Python, no braces

```javascript
// ❌ WRONG inside a Code node
const email = '={{ $json.body.email }}';

// ✅ CORRECT
const email = $json.body.email;
const all   = $input.all();
```

See [`code-nodes.md`](code-nodes.md).

### Webhook paths — static only

```
❌ path: "{{ $json.user_id }}/hook"
✅ path: "commande-recue"
```

### Credential fields — use the credential system

```
❌ apiKey: "={{ $env.API_KEY }}"
✅ reference an existing credential id (see the no-fabrication rule in SKILL.md)
```

---

## The transform gatekeeper

Before adding a node — or writing any code — to reshape data, walk this order and **stop
at the first that fits**:

1. **Expression in the consuming field.** Property access, `.map().filter().join()`,
   ternaries, string building, Luxon date math. If it is "take A, produce B" with no
   intermediate variables, it is an expression. This covers most cases.

2. **Arrow-function IIFE inside an Edit Fields (Set) field.** When the logic needs
   intermediate variables, branching or comments but still works on one item:

   ```
   ={{ (() => {
       const lines    = $json.line_items;
       const subtotal = lines.reduce((s, it) => s + it.price * it.qty, 0);
       const tva      = subtotal * 0.20;
       return (subtotal + tva).toFixed(2);
   })() }}
   ```

   The outer `(...)` brackets the function, the trailing `()` invokes it — drop either and
   n8n refuses to run. Inside you get the full expression scope (`$json`, `$('Node')`,
   `$now`, Luxon) plus `const`/`let`, `if`/`switch`, `try`/`catch`, regex. No `require`,
   no `await`.

3. **Code node — last resort.** Only for multi-item aggregation across the whole dataset
   (`$input.all()`), an allowlisted library, or async work.

**Why the order.** A Code node runs in a sandboxed VM with per-invocation setup and value
marshalling — a cold start reaching several hundred milliseconds. The same logic as an
expression or an Edit Fields IIFE runs in-process in single-digit milliseconds. For
single-item shaping that is a large gap for zero functional difference, and it compounds
on hot paths such as per-request webhooks. The expression also stays visible in the field
that uses it instead of hiding in an upstream node someone has to open.

**Expression complexity itself is nearly free.** Roughly 90% of the ~0.2 ms/item cost is
n8n building the per-item evaluation context, not running your expression. So never split
one working expression into a chain of nodes "for speed" — each extra node re-evaluates
per item *and* re-copies every item. One node with one richer expression wins.

---

## Antipattern — the single-consumer Set node

A Set / Edit Fields node whose only job is to extract a value and hand it to **one**
downstream node is dead weight. Inline the expression at the consumer.

```
❌  Webhook → Set { customer_id: {{ $json.body.customer_id }} } → Postgres: WHERE id = {{ $json.customer_id }}

✅  Webhook → Postgres: WHERE id = {{ $('Webhook').item.json.body.customer_id }}
```

**Test:** count the downstream nodes reading each field the Set produces.
**0 or 1** → delete it and inline. **2+** → it may earn its place.

To remove one: `n8n-axi workflow patch <id> --rm-node "Set"` (it prunes edges both
ways), then reconnect the source directly to the consumer and fix the consumer's
expression — dump, edit, push:

    n8n-axi workflow view <id> --as-spec > wf.toon
    # in wf.toon: add an edges row from the source straight to the consumer, and
    # rewrite the consumer's expression to reference the original source by name
    n8n-axi workflow push <id> --file wf.toon

**Legitimate exceptions — keep the Set when:**
- 2+ consumers read the same non-trivial derived value (name it, compute it once);
- it is a sub-workflow's final Return node shaping the output contract — with
  *Include Other Fields: false* it whitelists the output shape so scratch fields do not
  leak;
- you are renaming or whitelisting fields and want that visible in one place.

---

## Branch convergence — anchor with a NoOp

Where branches converge (after IF / Switch / Merge), `$json` becomes "whichever branch
fired last" — non-deterministic, and a silent source of wrong data.

Insert a **NoOp** node at the convergence, give it a descriptive name, and have downstream
nodes reference it by name:

```
Branche A ──┐
            ├─→ [NoOp: Donnees consolidees] ──→ {{ $('Donnees consolidees').item.json.x }}
Branche B ──┘
```

The NoOp survives refactors: inserting a transform later between it and the consumer does
not break the reference. If the branches emit *different shapes*, use a Set node instead
of a NoOp, to normalise both into one shape.

---

## Common patterns

```javascript
// Nested / arrays
{{ $json.user.email }}
{{ $json.data[0].name }}
{{ $json.users.length }}

// Conditionals and defaults
{{ $json.status === 'active' ? 'Actif' : 'Inactif' }}
{{ $json.email || 'sans-email@example.com' }}

// Dates (Luxon)
{{ $now.toFormat('dd/MM/yyyy') }}
{{ $now.plus({ days: 7 }).toISO() }}
{{ DateTime.fromISO($json.date).toFormat('dd MMMM yyyy') }}

// Strings and numbers
{{ $json.email.toLowerCase() }}
{{ $json.tags.split(',').join(', ') }}
{{ ($json.price * 1.20).toFixed(2) }}

// Interpolation in a URL
=https://api.example.com/v1/orders/{{ $json.body.order_id }}
```

---

## Quick fixes

| Symptom | Fix |
| --- | --- |
| Field shows the literal text `$json.x` | Wrap in `{{ }}` |
| `undefined` on a webhook field | Data is under `.body` → `{{ $json.body.x }}` |
| `Cannot read property 'x' of undefined` | Parent object missing — check the actual upstream shape with `get-workflow` / an execution |
| `{{ $json.field name }}` | Bracket notation: `{{ $json['field name'] }}` |
| Accented field returns nothing | Bracket notation: `{{ $json['Référence'] }}` |
| `{{ $node.HTTP Request }}` | `{{ $node["HTTP Request"] }}` |
| `{{{ $json.x }}}` | Single wrap: `{{ $json.x }}` |
| Expression string inside a Code node | Direct access: `$json.x` |
| Value correct in dev, wrong after adding a node | Deep `$json` — switch to `$('Node').item.json.x` |
| Wrong data after an IF/Merge | Branch convergence — anchor with a NoOp |

---

## Related

- [`code-nodes.md`](code-nodes.md) — Code node API, modes, no-braces rule
- [`workflow-patterns.md`](workflow-patterns.md) — where these expressions sit in a graph
- [`error-handling.md`](error-handling.md) — error branches and retries
- [`node-catalog.md`](node-catalog.md) — exact `type` / `typeVersion` per node
