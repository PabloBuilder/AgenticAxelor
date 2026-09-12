---
name: handoff
description: Generates a concise, high-density session handoff in HANDOFF.md with strict semantic compression for seamless continuation in a fresh session.
---

# Session Handoff Generator

## Invariants
- **Semantic Compression**: Communicate and reason with maximum information density. Telegraphic prose, zero conversational filler, zero chronological narrative, and zero dead ends.
- **Target Output**: Overwrites `HANDOFF.md` at workspace root (and `.agents/HANDOFF.md` if existing).
- **File Links**: Direct, clickable markdown links (`[basename](file:///absolute/path)`).

---

## Required `HANDOFF.md` Structure

```markdown
# Session Handoff: [Project / Feature Scope]

## 1. Goal
- [Telegraphic core intent and primary deliverables]

## 2. Key Decisions & Architecture
- [Architectural choices, topology, and shared contracts established]

## 3. Important Files
- `[basename](file:///path)`: [Dense role description]

## 4. Verified Facts & Completed Work
- [Tested capabilities, validated builds, live API/DOM verifications]

## 5. Unresolved Questions & Exact Next Action
- **Unresolved**: [Pending edge cases or design trade-offs]
- **Exact Next Action**: [Single, scope-confined instruction to execute immediately]
```

---

## Execution Protocol

1. Extract verified state, critical file links, and active execution frontier from the current session.
2. Apply strict semantic compression: cut repeated explanations, obsolete attempts, and chat dialogue history.
3. Write the handoff directly to `HANDOFF.md` via `write_to_file`.
4. Output a 1-line chat confirmation citing the exact next action.
