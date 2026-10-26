---
name: n8n-axi
description: "n8n workflows and automations on automation.alter-si.fr — list, read, search, author, patch, activate, tag, and debug a failed run down to the node that broke. Covers webhooks, triggers, schedules, node types and typeVersions, parameters and credentials. Triggers in French too: automatisation, exécution, workflow planté, déclencheur, nœud, « pourquoi ça a échoué », « combien tournent ». Prefer this over the n8n MCP connector, over ad-hoc curl, and over reading node-index.json by hand."
---

# n8n-axi

n8n from the command line, shaped for agents. Compact TOON output by default;
`--json` for machine parsing; `--raw` for untouched n8n JSON.

## Non-negotiable rules

1. **Never push a workflow that failed validation.** `build`, `push` and `patch`
   validate first and exit `4` with the issue list. That is a hard gate, not a
   suggestion. `--force` exists and prints every issue it overrides — read them.
   Validation also **warns** when a node type is not one this n8n ships, when a
   `typeVersion` exceeds anything n8n declares, or when a parameter name is not
   declared for that node — each with the nearest real name. Warnings do not
   block; `--strict` makes them block. Read them: they are how a fabricated
   type or a typo'd parameter is caught before it reaches the instance.
2. **Never invent a node `type`, a `typeVersion`, or a credential id.**
   Cross-check with `n8n-axi node <type>`, which answers from every node type
   this n8n ships and carries the version it actually declares. If it is not
   there, read the exact shape off the instance
   (`workflow view <id> --node <name>`) or ask. A fabricated value saves
   cleanly and then fails at runtime.
3. **`push` is a full replacement, not a patch.** It sends only the writable
   fields. Never hand-write a partial payload — use `patch` for a
   single-parameter change.
4. **Confirm before destructive calls.** `delete` and `prune` require `--yes`;
   ask the user first. Ask before `activate` when the workflow has side effects.
5. **Credentials cannot be created through the API.** `credential schema <type>`
   tells you what fields a type needs; a node may only reference an id that
   already exists in the instance.
6. **Read `n8n-axi guide expressions` before writing a single expression or Code
   node.** Two rules there cause most runtime failures: webhook data lives under
   `$json.body`, not at the root; and Code nodes use direct access, never
   `{{ }}`. Both produce a workflow that validates, saves, and returns
   `undefined`.

## Reading

    n8n-axi workflow list                    # node counts, never the nodes
    n8n-axi workflow list --active --tag Production
    n8n-axi workflow search --node httpRequestTool   # which workflows use it
    n8n-axi workflow search --name marketplace
    n8n-axi workflow view <id>               # node + edge tables
    n8n-axi workflow view <id> --node "HTTP Request"   # one node's parameters
    n8n-axi workflow view <id> --node A --node B      # several, in ONE call
    n8n-axi workflow view <id> --runs 5      # + recent executions, one call
    n8n-axi execution list --workflow <id> --status error
    n8n-axi execution view <id>              # failing node by default
    n8n-axi execution last <workflow> --status error   # the debugging composite

The node table abbreviates n8n's two own prefixes to keep it short: `base.` is
`n8n-nodes-base.` and `lc.` is `@n8n/n8n-nodes-langchain.`. **They are display
only — n8n has no such types.** Write the full type into a spec; `workflow
validate` refuses an abbreviated one and names the expansion.

The edge table carries a `label` column when a node's branches mean something —
a Switch's `outputKey`s and its renamed fallback, `true`/`false` for an IF — so
"which branch does what" is answerable from the default view rather than
needing the node's parameters.

**To find what is wrong with an existing workflow, run
`n8n-axi workflow validate <id>`.** It reports dead output ports, orphans,
fabricated typeVersions and undeclared parameters — the defects that save
cleanly and then fail at runtime. Reading the graph by eye misses them.

**A list that reports `hasMore: true` is not the whole set.** The default limit
is 25 and there is no auto-paging; counting what you were given and answering
is how you produce a confident wrong answer. Re-run with `--all` before drawing
any conclusion about the instance as a whole.

**To find workflows by what they contain, use `workflow search`**, not a list
followed by a view per workflow. It scans everything in one pass and reports
ids, because two workflows can share a name.

**In an execution's node table, `ms` is the TOTAL across runs**, and a `runs`
column appears when a node ran more than once — a node inside a loop is not
described by its first iteration.

**Use `--node NAME`, not `--params`.** The default view is names, types and
connection shape; `--node` adds one node's parameter blob. `--params` adds every
node's and reports its own byte count — it is an escape hatch, not a default.

**`--node` is repeatable — reading several nodes is one call, not one call
each.** The identity block and the node and edge tables come back every time
and are a large share of a one-node reply; several separate lookups on a wide
workflow cost far more than the same nodes in one
`--node A --node B --node C --node D`.

**`execution view` never emits `workflowData`.** That is a full workflow
snapshot n8n re-sends on every run and is the bulk of the raw payload. Read the
workflow separately, once. On a failed run the default is the failing node, its
error, and its first three input items; page further with
`--node NAME --page N --items M`.

## Authoring

**Do not write a spec from scratch.** Two commands remove the guessing:

    n8n-axi workflow scaffold webhook-router      # a correct starting point
    n8n-axi workflow view <id> --as-spec          # dump an existing one to edit

`scaffold` emits a validated spec for a common shape — `schedule`, `webhook`,
`webhook-router`, `sub-workflow` — with node versions taken from the generated
index, so it cannot be stale.

**To EDIT an existing workflow, dump it, change it, and push it back to the
same id:**

    n8n-axi workflow view <id> --as-spec > wf.toon
    # edit wf.toon
    n8n-axi workflow push <id> --file wf.toon

`push <id>` reads either format — the spec from `--as-spec` or the JSON from
`--raw` — and replaces that workflow **in place**. The round trip is faithful:
parameters, credentials, error handling, retries, notes and every connection
survive it; only node ids and canvas positions are regenerated.

**`workflow build --push` CREATES A NEW workflow. It never edits one.** Reach
for it only when you want a workflow that does not exist yet — if you use it to
"edit", you get a second copy and the original is untouched:

    n8n-axi workflow scaffold schedule | n8n-axi workflow build - --push

`workflow build -` takes a compact spec on stdin and expands it — ids, grid
positions and the `connections` structure are supplied for you.

    n8n-axi workflow build - <<'EOF'
    name: Daily items sync
    nodes[2]{name,type,v}:
      Schedule,n8n-nodes-base.scheduleTrigger,1.2
      Fetch,n8n-nodes-base.httpRequest,4.2
    params:
      Schedule:
        rule:
          interval[1]{field,hoursInterval}:
            hours,6
      Fetch:
        method: GET
        url: https://api.example.com/v1/items
        options:
    edges[1]{from,to}:
      Schedule,Fetch
    EOF

- `edges` takes two optional columns:
  - `port` — `main` (default), `main:1` for an IF node's false branch,
    `ai_tool` / `ai_languageModel` for LangChain sub-nodes.
  - `in` — the **target's** input slot, default `0`. A Merge node has `0` and
    `1`; without it both branches land on input 0, which saves cleanly and then
    behaves wrongly.

        edges[2]{from,to,port,in}:
          Notify,Combine,main,0
          Queue,Combine,main,1
- **`attrs` carries a node's non-parameter fields**, keyed by node name:
  `credentials`, and the whole Settings tab — `onError`, `retryOnFail`,
  `maxTries`, `waitBetweenTries`, `continueOnFail`, `alwaysOutputData`,
  `executeOnce`, `notes` — plus `webhookId`. `--as-spec` fills it for you.
  A node written without its `credentials` saves cleanly and then cannot
  authenticate, and `validate` cannot see the difference.

        attrs:
          Fetch:
            credentials:
              httpHeaderAuth:
                id: X5tuIKuDjLA8lus1
                name: My API token
            onError: continueRegularOutput
- **An empty object is a bare key** — `options:` with nothing after the colon.
  Writing `options: {}` produces the *string* `"{}"`, which would save and then
  fail at runtime, so `build` rejects it by name. An empty array is `[]`.
- `--json-input` reads JSON on stdin instead, for parameters where TOON is
  awkward.
- `--push` creates it; `--activate` activates it afterwards; `--dry-run` prints
  the payload and sends nothing.

## Writing

    n8n-axi workflow patch <id> --node Fetch --set url=https://api/v2/items
    n8n-axi workflow patch <id> --node Fetch --set options.timeout=5000
    n8n-axi workflow patch <id> --rm-node "Old Step"
    n8n-axi workflow push <id> --file wf.json    # or wf.toon from --as-spec
    n8n-axi workflow activate <id>
    n8n-axi workflow tag <id> --add Production

- **Every write accepts `--dry-run`.** Use it when the change is not trivially
  reversible.
- **Activation is a dedicated endpoint.** Setting `"active": true` in the JSON
  does nothing; `push` will say so if it sees the attempt.
- **`description`, `tags` and `active` are not updatable through the workflow
  payload.** They keep their stored value. Tags have `workflow tag`.

## Destructive

    n8n-axi workflow delete <id> --yes       # --force as well if it is active
    n8n-axi workflow archive <id>
    n8n-axi execution delete <id> --yes
    n8n-axi execution prune --workflow W --before YYYY-MM-DD --yes

`prune` destroys audit history irreversibly. `--workflow`, `--before` and
`--yes` are all mandatory; there is no prune-everything form. Run it with
`--dry-run` first — it reports the exact count and id range.

## Looking a node up

    n8n-axi node switch                  # type, typeVersion, parameter names
    n8n-axi node n8n-nodes-base.gmail    # full type works too
    n8n-axi node search google           # find a type without knowing its name

**Use this before authoring a node you have not used before.** It answers from
an index of every node type this n8n ships, so a node is answerable even when
nobody on the instance has used it yet — which is exactly when guessing goes
wrong. Never invent a `type` or a `typeVersion`; look it up.

Where the two sources disagree, **`n8n-axi node <type>` wins.** It is
harvested from this instance's own node definitions; `guide node-catalog`
records only what existing workflows happened to be built with, which is why
it lags. Do not open the catalogue to check a `typeVersion` — it is a large
document and it is the older number.

## Domain references

    n8n-axi guide                    # list the topics
    n8n-axi guide expressions        # read a value from another node; the .body trap
    n8n-axi guide node-catalog       # worked examples per node (for typeVersions
                                      # use `node <type>` instead)
    n8n-axi guide workflow-patterns  # which graph shape; which output index to wire
    n8n-axi guide code-nodes         # which mode; what to return; why {{ }} is inert
    n8n-axi guide error-handling     # retries, error outputs, error workflow

Read `expressions` on every authoring task. Read the others when the task
touches their subject.

## Maintenance

    n8n-axi doctor                   # config, reachability, key validity
    n8n-axi catalog drift            # catalog vs what the instance actually runs
    n8n-axi catalog build            # regenerate the catalog from the instance
    n8n-axi catalog build --login    # bootstrap: read n8n's own definitions

**The node catalog's typeVersions come from the instance itself**, generated by
`catalog build` from the workflows actually running there. That section is
marked as generated — do not edit it by hand; regenerate it. Curated guidance
outside the marked block is preserved across regeneration.

`catalog drift` reports without writing. Observed usage is evidence of what this
instance runs, not of what n8n's latest release supports — a type listed as
`unverified` is simply unused here, not wrong.

`catalog build` refuses to write an empty or degenerate catalog. On a fresh
instance there are no workflows to learn from, and an empty catalog is worse
than none — every authoring task would then guess. In that case use
`catalog build --login`, which reads n8n's own node definitions. It prompts for
your n8n password once, uses it for that single request, and stores nothing.
It is never automatic.

## Exit codes

`0` ok, `1` usage/argument error, `2` n8n error, `3` config missing
(no `N8N_BASE_URL`/`N8N_API_KEY` or `~/.config/n8n/config`), `4` the workflow
was rejected by n8n-axi's own validator — fix the graph, do not retry.
