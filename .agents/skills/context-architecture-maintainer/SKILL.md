---
disable-model-invocation: true
name: context-architecture-maintainer
description: "Review conversation learnings against the contextual architecture, propose durable knowledge and routing improvements, or audit the freshness of selected context documents against their sources."
---

# Context Architecture Maintainer

Use this skill on request to review knowledge gained during a conversation or to audit selected context documents. Reading or discussing context does not authorize edits. Respect the active read-only mode and applicable authorization boundaries.

Write context documentation and map updates in English. Use semantic compression optimized for AI-agent token efficiency.

## 1. Select the task and establish scope

- For a conversation review, identify the relevant conversation, its goal, and the knowledge needed beyond the immediate case. If prior conversation is unavailable or compressed beyond useful detail, state the limitation; do not invent evidence.
- For a freshness audit, identify the requested documents or affected subject and consult the relevant rows of [the context register](../../docs/context-freshness.md).
- Discover the context structure through the applicable entry points: [agent router](../../rules/agents.md), [operator index](../../standard-index.md), and [developer index](../../dev-index.md). Consult [the context map](../../context-map.md) as a navigation aid, not as proof. Follow only relevant branches and inspect actual candidate files before deciding. An unlisted file is not evidence of absence.
- Done when the task, evidence available, relevant branches, and scope limitations are explicit.

## 2. Conversation review and knowledge placement

1. Extract potentially reusable facts, verified procedures, corrections, unresolved questions, and information that would have helped earlier. Record their supporting conversation evidence and distinguish observation, inference, hypothesis, and decision.
2. Filter for durable relevance. Preserve instance, version, customer, date, and other limits when material. Exclude secrets, unnecessary personal or confidential information, one-off details, and unsupported generalizations. It is valid to propose no addition.
3. Compare candidates with the relevant indexes, skills, knowledge and references. Check whether the knowledge already exists, conflicts, is incomplete, or is present but hard to discover. Check the destination and its direct routing before recommending a change.
4. For each retained candidate, recommend one of: no change, correct or extend an existing node, improve an index or route, create a distinct node and connect it, or defer pending verification. Explain why, cite evidence and target paths, describe the proposed content and navigation impact, and state uncertainty. Never create a node merely because a fact was learned.
5. Present the proposed changes and apply only those specifically authorized and compatible with the active mode. After authorized changes, verify affected links and routes, revisit the context map if one exists, and report applied and outstanding work.
- Done when each candidate has a reasoned disposition, evidence and scope, with changes verified or clearly left as proposals.

## 3. Focused freshness audit

1. Use the selected register rows to identify documents and sources to inspect. Compare each relevant concrete claim with current source evidence; classify it as supported, incorrect, or uncertain. A map, date, or register entry alone does not establish correctness.
2. Check applicable relative links, tool or process references, and security claims. Identify missing evidence and newly relevant sources. Do not infer runtime behavior solely from documentation.
3. Report affected paths, evidence, discrepancies, uncertainty and recommended corrections. Apply only specifically authorized, appropriately scoped changes; otherwise leave recommendations for review. Where applicable, update the register and any context map only after the corresponding claims have been checked, preserving uncertainty and recording pending work honestly.
4. Verify authorized edits against their sources and check affected links. Escalate cross-document decisions or unresolved evidence rather than guessing.
- Done when every selected claim has a supported, incorrect, or uncertain disposition and any authorized changes are verified.
