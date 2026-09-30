---
name: handoff
description: Generates a concise, high-density session handoff in HANDOFF.md with strict semantic compression for seamless continuation in a fresh session.
---

# Session Handoff Generator

## Invariants
- **Semantic Compression**: Communicate and reason with maximum information density. Telegraphic prose, zero conversational filler, zero chronological narrative, and zero dead ends.
- **Target Output**: Overwrites `.agents/HANDOFF.md`.
- **File Paths**: Relative workspace path (e.g. `src/components/MyComponent.tsx`).

---

## Required `.agents/HANDOFF.md` Structure

```markdown
# Session Handoff: [Project / Feature Scope]

## 1. Goal
- [Telegraphic core intent and primary deliverables]

## 2. Key Decisions & Architecture
- [Architectural choices, topology, and shared contracts established]

## 3. Important Files
- `relative/path/to/file.ext`: [Dense role description]

## 4. Verified Facts & Completed Work
- [Tested capabilities, validated builds, live API/DOM verifications]

## 5. Status & Next Action
- **Status**: [Operational state of the system]
- **Next Action**: [Single, scope-confined instruction to execute immediately]
```

---

## Execution Protocol

1. Extract verified state, critical file links, and active execution frontier from the current session.
2. Apply strict semantic compression: cut repeated explanations, obsolete attempts, and chat dialogue history.
3. Write the handoff directly to `.agents/HANDOFF.md` via `write_to_file`.
4. Output a 1-line chat confirmation citing the exact next action.
