---
disable-model-invocation: true
name: skill-creator
description: "Author or review AgentSkills and Missions: create, repair, validate, restructure SKILL.md files, and enforce synaptic wiring into domain indexes and the contextual architecture."
---

# Skill & Mission Creator

Comprehensive lifecycle playbook for authoring and restructuring AgentSkills and Missions. Combines procedural authoring with contextual architecture governance to guarantee zero orphan skills, strict Layer 0 invariance, and active freshness tracking.

---

## Workflow

### 1. Establish the Capability Contract & Topology
- **Differentiate Scope**:
  - **Skill (`.agents/skills/<name>/`)**: Atomic or domain-specific capability (e.g., spreadsheet manipulation, report generation, API mutation).
  - **Mission (`.agents/missions/<name>/`)**: End-to-end multi-system business orchestration (e.g., workshop notes to ticket, acceptance testing, data migration).
- **Topology Compliance Check (Mandatory)**:
  - Adhere to the 3 architectural rules from `context-architecture-maintainer`:
    1. *Layer 0 Invariance*: Never add leaf skill or mission routes into `agents.md`.
    2. *Structural Symmetry*: Identify the target Layer 1 Domain Index (`standard-index.md`, `n8n-index.md`, `missions-index.md`, `dev-index.md`, `google-workspace-index.md`) that will host the trigger.
    3. *50-Item Stress Test*: Ensure the capability belongs in a scalable domain index rather than polluting high-level entry points.
- **Done when:** Domain owner (Skill vs Mission), target L1 index, triggers, and completion criteria are explicitly defined.

### 2. Choose Invocation & Frontmatter
- **Model-discoverable**: Write a concise, trigger-rich, third-person `description`; omit `disable-model-invocation`.
- **Manual-only**: Set `disable-model-invocation: true`; write a clear human-facing summary in `description`.
- **User-invocable**: Set `user-invocable: true` if the skill should appear in user slash-command palettes.
- **Frontmatter Fields**: Required: `name`, `description`. Supported: `disable-model-invocation`, `user-invocable`, `argument-hint`, `allowed-tools`. Add optional fields only when they alter runtime discovery or behavior.
- **Done when:** Frontmatter matches the actual execution pathway without unnecessary tags.

### 3. Structure the Procedure (Progressive Disclosure)
- **Lean Core (`SKILL.md`)**:
  - Keep under 150 lines. Focus strictly on the primary operational sequence.
  - End every major step with a checkable completion criterion.
  - End the procedure with a factual verification step.
- **Sub-resources**:
  - `references/`: Detailed domain rules, API payload shapes, or branching logic (loaded only during relevant steps).
  - `assets/`: Output templates, starter files, or boilerplate formats.
  - `scripts/`: Deterministic code or CLI helpers with focused test suites.
- **Done when:** Every planned resource has a single responsibility and a direct pointer from `SKILL.md`.

### 4. Draft, Test, and Validate
- **Draft files**: Use clear, concise markdown with high semantic density.
- **Syntax & Schema Validation**:
  - Run `python {baseDir}/scripts/quick_validate.py <skill-directory>` to verify frontmatter, schema, and local relative link integrity.
  - Execute focused tests for any bundled scripts in `scripts/`.
- **Done when:** `quick_validate.py` passes with zero errors and bundled scripts execute successfully.

### 5. Synaptic Wiring into the Contextual Graph (Crucial)
Never leave a newly created skill as an orphan. Wire it directly into the repository's context architecture:
1. **L1 Domain Index Registration**:
   - Edit the matching Layer 1 index (e.g., `missions-index.md` for missions, `standard-index.md` for Axelor skills, `n8n-index.md` for n8n skills).
   - Add a concise trigger row or conditional route pointing to the new `SKILL.md`.
2. **Context Navigation Map (`.agents/context-map.md`)**:
   - Add the new capability under the appropriate table (`Skills`, `Missions`, or `Operational Knowledge`) with its role and invocation bounds.
3. **Freshness Register (`.agents/docs/context-freshness.md`)**:
   - Register the new skill or mission row with its watched source dependencies and baseline review state (`reviewed-clean`).
4. **Done when:** The capability is discoverable via the domain index, mapped in `context-map.md`, and tracked in `context-freshness.md`.

---

## Anti-Pattern Checklist

-  **Never** list the new skill directly in `agents.md` (violates Layer 0 invariance).
-  **Never** dump massive reference documentation into `SKILL.md` (use `references/` for progressive disclosure).
-  **Never** leave a skill without completion criteria or local link validation.
-  **Never** finish without wiring the skill into its Layer 1 Domain Index and `context-map.md`.
