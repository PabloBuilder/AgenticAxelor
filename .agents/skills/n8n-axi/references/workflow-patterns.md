# n8n workflow patterns

Which shape to reach for, and the wiring traps in each. Read this before assembling a
graph with `n8n-axi workflow build`, so the node list and the edges are decided before any
code is written.

Distilled from [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) (MIT).

---

## Choosing a pattern

Pick on **trigger × primary action**.

| Pattern | Use when | Skeleton |
| --- | --- | --- |
| **Webhook** | react instantly to an external event (form, GitLab/Redmine hook, Slack command) | Webhook → transform → action → Respond to Webhook |
| **HTTP API** | pull from a third-party REST API into a pipeline | Trigger → HTTP Request → transform → sink |
| **Database** | sync, scheduled queries, ETL | Schedule → query → IF → insert/update |
| **Scheduled** | periodic report, maintenance, digest | Schedule Trigger → gather → format → send |
| **Batch** | dataset larger than one API page or over a rate limit | prepare → SplitInBatches → process → loop |
| **AI agent** | conversational / multi-step reasoning with tools | Trigger → AI Agent (+ model, tools, memory) → output |

Most real workflows are one of these with a couple of nodes bolted on. Start with the
simplest that fits.

---

## Flow architectures

- **Linear** — trigger → transform → action. Default; prefer it.
- **Branching** — IF / Switch. In the build spec's `edges`, port `main` (default) is IF
  *true*, `main:1` is IF *false*. Switch outputs are `main`, `main:1`, `main:2`… in the
  order the rules are declared.
- **Parallel + Merge** — two independent branches converging. Merge has **two inputs**:
  target them with the `edges` `in` column — `edges[2]{from,to,in}: A,Merge,0` /
  `B,Merge,1`.
- **Loop** — SplitInBatches (see below).
- **Error** — a second output on a node, or a separate error workflow. See
  [`error-handling.md`](error-handling.md).

Where any of these converge, read the branch-convergence section of
[`expressions.md`](expressions.md) — `$json` becomes non-deterministic at a merge point.

---

## SplitInBatches — the output indices are backwards from intuition

`n8n-nodes-base.splitInBatches` has **two main outputs**, and they are not in the order
most people assume:

| Output | Fires | Wire it to |
| --- | --- | --- |
| `main[0]` — *done* | **once**, after every batch has been processed | the post-loop step (aggregate, report, notify) |
| `main[1]` — *loop* | **once per batch** | the loop body |

```
nodes[1]{name,type,v}:
  Loop Over Items,n8n-nodes-base.splitInBatches,3
params:
  Loop Over Items:
    batchSize: 100
    options:
edges[3]{from,to,port}:
  Loop Over Items,Process Batch,main:1   # loop body
  Process Batch,Loop Over Items,main     # close the loop
  Loop Over Items,Aggregate,main         # after all batches
```

Wiring the loop body to port `main` (the default) instead of `main:1` is the classic
bug: the body runs once, at the end, on the last batch only — and nothing errors.

**`batchSize`.** Pick the largest your constraint allows (API page size, rate limit,
memory). Iterations are the cost driver, so bigger batches = fewer iterations = less
overhead. Avoid `batchSize: 1` unless you genuinely need item-by-item control.

**Cross-iteration data.** After the loop, `$('Process Batch').all()` returns only the
**last** batch — earlier ones are gone. To accumulate across iterations, push into
`$getWorkflowStaticData('global')` from inside the loop body.

---

## Execution order

`n8n-axi workflow build` sets `settings: {"executionOrder": "v1"}` on every workflow it
creates — connection-based ordering, which is what you want. `v0` (legacy, top-to-bottom
by canvas position) makes execution depend on node coordinates, so `build`'s automatic
grid placement could change behaviour on a `v0` workflow. If a fetched workflow shows
`v0` and behaves oddly, that is the first thing to check; do not flip it without telling
the user, as it can change results on an existing workflow.

---

## Performance on high-volume paths

Only matters at thousands of items — below that everything here is sub-100 ms, and most
production workflows are I/O-bound anyway (sequential HTTP/DB calls at hundreds of ms
each dwarf all of this).

- **Consolidate hot-path nodes.** Every hop re-copies all items. Six chained Code/Set
  nodes cost roughly 7× one All-Items Code node doing the same steps.
- **Use *Run Once for All Items*** in Code nodes (~0.02 ms/item) rather than *Each Item*
  (~0.6 ms/item) — a 25–30× penalty.
- **Maximise `batchSize`** in loops.
- **Do not micro-optimise expressions.** Node count and iteration count are what cost;
  expression complexity is nearly free.

---

## Four gates before activating

1. **Validate** — `n8n-axi workflow validate --file wf.json`, exit 0. Hard gate
   (exit 4 means the graph was rejected here, not by n8n).
2. **Verify the wiring** — validation proves the graph is not *broken*, not that it is
   *correct*. Re-read the `connections` object and confirm every branch index
   (IF true/false, SplitInBatches done/loop, Merge input 0/1) is what you intended.
3. **Test** — run it once and inspect the output. Remember real side effects fire: writes
   commit, messages send. Ask the user before testing anything with external effects.
4. **Activate** — `n8n-axi workflow activate <id>`, a dedicated endpoint. Setting
   `"active": true` in the payload does nothing.

**Validation passing is necessary, not sufficient.**

---

## Common gotchas

| Problem | Cause / fix |
| --- | --- |
| Webhook payload unreachable | It is under `{{ $json.body.x }}` — see [`expressions.md`](expressions.md) |
| Expressions render as literal text | Missing `{{ }}`, or missing the `=` prefix on the parameter value |
| Node runs per item, you wanted once | *Execute Once* in node settings, or aggregate upstream |
| 401 / 403 on an API node | Credential missing or wrong. Credentials **cannot** be created through the API — the id must already exist in the instance |
| Loop body runs only once | SplitInBatches wired to `main[0]` instead of `main[1]` |
| Data lost after the loop | `.all()` only returns the last batch — accumulate via `$getWorkflowStaticData('global')` |
| Wrong branch data after a Merge | Anchor the convergence with a named NoOp |
| Node order looks random | `executionOrder: v0` — should be `v1` |

---

## Integration notes

**Google Sheets** — never `append` onto a column holding formulas; it breaks them (use
the Sheets API through an HTTP Request node instead). Write numbers as numbers, not
strings, for any column a formula reads.

**Google Drive** — `convertToGoogleDocument: true` produces a Google **Doc**, not a Sheet.
CSV direct download: `https://drive.google.com/uc?id=<fileId>&export=download`.

**Threshold checks** — when watching a metric for anomalies, test both directions
(`Math.abs(diff) > threshold`), otherwise a collapse passes unnoticed while only spikes
alert.

---

## Related

- [`expressions.md`](expressions.md) — expression syntax, webhook `.body`, convergence
- [`code-nodes.md`](code-nodes.md) — Code node modes and API
- [`error-handling.md`](error-handling.md) — error outputs, retries, error workflows
- [`node-catalog.md`](node-catalog.md) — exact `type` / `typeVersion` per node
