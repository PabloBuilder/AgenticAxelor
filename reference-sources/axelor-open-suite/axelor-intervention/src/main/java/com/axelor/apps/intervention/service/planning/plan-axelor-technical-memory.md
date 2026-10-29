# Implementation Plan: Routed Axelor Technical Memory Skills

## Overview
- **Complexity**: Five focused steps covering four task-specific skills and explicit agentic routing.
- **Architecture**: `.agents/rules/agents.md` routes Axelor operations through `.agents/standard-index.md`. The index selects only the skill applicable to the task; each skill is marked `disable-model-invocation: true` and read as directed by the routing instructions without requiring the user to invoke it. This is instruction-based routing, not guaranteed technical enforcement.
- **Scope**: Persistent technical memory only; no workflow automation, ERP writes, or changes to archived evidence. Existing XML skill remains the classic-import owner; advanced graphical import has a separate skill. Observations are scoped to the recorded environment and version.

---

## Step Breakdown

### [x] Step 1/5: Create the routed data-reconciliation skill
- **Target Files**: `.agents/skills/axelor-data-reconciliation/SKILL.md`, `.agents/standard-index.md`
- **Contract Signatures**: Skill frontmatter `name: axelor-data-reconciliation` and `disable-model-invocation: true`; operator index routes data migrations, reconciliation and post-import verification to the skill.
- **Code Changes**: Base technical memory on task histories #4023, #5264 and #5691: approved business rules, instance and archived scope, ID versus business reference, unique matching, preservation of existing values, exceptions, collision checks inside and outside the lot, and reconciliation against the actually imported file. Keep reading and writing permissions distinct.
- **Definition of Done**: For a matching request the operator index explicitly instructs the agent to read this skill; ordinary Axelor tasks do not load it. No cross-environment ID assumption, unverified rollback claim or automatic import authorization. Links resolve.
- **Execution Prompt**:
  ```text
  Execute Step 1 strictly based on plan-axelor-technical-memory.md: create the manual reconciliation skill and its conditional agentic route only.
  ```

### [x] Step 2/5: Route and enrich the classic XML import skill
- **Target Files**: `.agents/skills/axelor-xml-data-import/SKILL.md`, `.agents/standard-index.md`
- **Contract Signatures**: Preserve `name: axelor-xml-data-import` and `disable-model-invocation: true`; route classic CSV/XML import tasks to this skill.
- **Code Changes**: Add target-ID prechecks, version-dependent auto-binding, archived scope, technical import history and logs alongside post-import value verification, and untested missing-ID or retry behavior. Preserve existing XML guidance; do not attribute advanced-import problems to classic imports.
- **Definition of Done**: The index directs classic XML import tasks to the existing skill; classic logs are acknowledged and unsupported guarantees are excluded. Link resolves.
- **Execution Prompt**:
  ```text
  Execute Step 2 strictly based on plan-axelor-technical-memory.md: enrich the classic XML skill and add its conditional agentic route only.
  ```

### [x] Step 3/5: Create a separate advanced-import diagnostic skill
- **Target Files**: `.agents/skills/axelor-advanced-import/SKILL.md`, `.agents/standard-index.md`
- **Contract Signatures**: Skill frontmatter `name: axelor-advanced-import` and `disable-model-invocation: true`; route graphical advanced-import configuration and diagnosis to this skill.
- **Code Changes**: Record #5691 observations about `columnTitle`, `isMatchWithFile`, source expressions, search criteria, history entries and unchanged records. Distinguish the observed configuration from universal behavior; require current version and instance verification.
- **Definition of Done**: The route selects advanced import independently from classic XML import, without automatic ERP modifications or unverified claims. Link resolves.
- **Execution Prompt**:
  ```text
  Execute Step 3 strictly based on plan-axelor-technical-memory.md: create the advanced-import skill and its conditional agentic route only.
  ```

### [x] Step 4/5: Create the functional-test skill
- **Target Files**: `.agents/skills/axelor-functional-testing/SKILL.md`, `.agents/standard-index.md`
- **Contract Signatures**: Skill frontmatter `name: axelor-functional-testing` and `disable-model-invocation: true`; route relevant Axelor functional-test preparation and analysis to the skill.
- **Code Changes**: Capture #3637 lessons: distinguish defaults from changed values, include empty and deliberately different cases, inspect actual views and selections, distinguish simulation from persistence, and read values before and after actions. Mark address-reset behavior as a scoped observation.
- **Definition of Done**: Route is conditional, safeguards remain intact, and no test action or mutation is authorized merely by loading the skill. Link resolves.
- **Execution Prompt**:
  ```text
  Execute Step 4 strictly based on plan-axelor-technical-memory.md: create the functional-test skill and its conditional agentic route only.
  ```

### [x] Step 5/5: Create the read-only permissions-audit skill
- **Target Files**: `.agents/skills/axelor-permissions-audit/SKILL.md`, `.agents/standard-index.md`
- **Contract Signatures**: Skill frontmatter `name: axelor-permissions-audit` and `disable-model-invocation: true`; route Axelor access-rights audits to the skill.
- **Code Changes**: Capture the Interservices audit approach: parent versus related records, attachment metadata versus content, known positive controls, absence versus denied access, evidence minimization, and limits of selected transcripts. Require authorization for sensitive document downloads and account-specific tests.
- **Definition of Done**: Skill is read-only, avoids unsupported general conclusions, preserves safeguards, and is loaded only for relevant audit tasks. Link resolves.
- **Execution Prompt**:
  ```text
  Execute Step 5 strictly based on plan-axelor-technical-memory.md: create the read-only permissions-audit skill and its conditional agentic route only.
  ```
