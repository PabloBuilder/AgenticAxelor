---
name: stepwise-planner
description: Generates a code-grounded implementation plan in dynamic atomic steps (1-7), saved to session artifact plan.md with chat silence.
---

# Stepwise Planner

## Invariants
- **Language**: English strictly.
- **Silence**: Chat response MUST be a 1-line confirmation only. Never dump plan text in chat.
- **Output Target**: `<appDataDir>\brain\<conversation-id>/plan.md` (Temporary artifact).
- **No Overhead**: Zero compilation/build tests and zero walkthrough artifacts unless requested.

## Sizing & Granularity (1-7 Steps)
- **Scale to Reality**: 1-2 steps for isolated edits; 3-6 for cross-cutting features. Never pad steps.
- **1 Step Boundary**: 1 layer (Contracts $\rightarrow$ Logic $\rightarrow$ UI) OR 1-3 tightly coupled files OR $\le 50$ modified lines.

---

## `plan.md` Template

```markdown
# Implementation Plan: [Title]

## Overview
- **Complexity**: [Brief sizing rationale]
- **Architecture**: [Impacted boundaries]

---

## Step Breakdown

### [ ] Step [N]/[Total]: [Title]
- **Target Files**: `[basename](file:///absolute/path)`
- **Contract Signatures**: Exact types/schemas created or consumed.
- **Code Changes**: Semantic anchors (functions/hooks), not fragile line numbers.
- **Definition of Done**: Verifiable completion criteria.
- **Execution Prompt**:
  \`\`\`text
  Execute Step [N] strictly based on plan.md: [Scope-confined directive]
  \`\`\`
```

---

## Execution Protocols

### Plan Generation
1. Investigate codebase using targeted lookups.
2. Write initial artifact to `<appDataDir>\brain\<conversation-id>/plan.md` (steps marked `[ ]`).
3. Output 1-line confirmation in chat: `Implementation plan generated in plan.md. Awaiting confirmation for Step 1.`

### Step Execution (When Step [N] Triggered)
1. **Targeted Read**: Inspect ONLY the step's `Target Files`. No broad codebase scans.
2. **Strict Scope**: Apply code changes defined in `plan.md`. Never exceed step boundary.
3. **Pivot Trigger**: If blocked or facing contradictory code after 2 attempts, HARD STOP and report discrepancy.
4. **Validation & State Tracking**: Verify Definition of Done, mark step `[x]` in `plan.md` via `replace_file_content`.
5. **Confirmation**:
   - *Intermediate Steps*: Output 1-line status with modified files, ready for next step.
   - *Final Step*: Output a concise, 2-6 line high-level summary vulgarizing the completed implementation without technical clutter.
