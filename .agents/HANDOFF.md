# Session Handoff

## 1. High-Level Summary
- Restructured flat `src/cli/` (34 scripts) into a clean domain architecture:
  - `src/guides/`: Pure, typed `GuidanceRoute` scenario definitions and central `GUIDE_REGISTRY`.
  - `src/cli/guidePusher.ts`: Universal CLI runner supporting both pre-packaged guide IDs and dynamic menu resolution.
  - `src/cli/inspect/`: Metadata, schema, role, and permission diagnostic tools.
  - `src/cli/ops/`: Axelor database maintenance and user operations.
  - `src/cli/test/`: Integration and smoke tests (MCP, View, Menu).
- Synchronized all context documentation ([`DEV_GUIDE.md`](.agents/docs/DEV_GUIDE.md), [`dev-index.md`](.agents/dev-index.md), [`axelor-guidance-builder/SKILL.md`](.agents/skills/axelor-guidance-builder/SKILL.md), [`package.json`](package.json)).
- Verified TypeScript compilation (`tsc`) with 0 errors.

## 2. Workspace Layout
- `src/guides/` -> `salesRightsGuide.ts`, `accountingRightsGuide.ts`, `subWindowGuide.ts`, `complexGuide.ts`, `setPasswordGuide.ts`, `index.ts`.
- `src/cli/` -> `guidePusher.ts`, `inspect/`, `ops/`, `test/`.

## 3. Quick Run Commands
```bash
# Push pre-packaged guide to Chrome HUD
npm run guide:push -- sales-rights
npm run guide:push -- accounting-rights

# Push dynamic menu guide
npm run guide:push -- "Sequences"

# Run smoke tests
npm run test:menu
npm run test:view
```
