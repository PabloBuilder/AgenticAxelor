# Context Freshness Register

This register maps active context documents to the small set of files whose behavior they describe. A Git change is a reason to review a claim, not proof that the claim is wrong. Matching timestamps or an unchanged commit is not proof that a document is accurate.

Paths below are repository-relative, explicit files; do not replace them with recursive directory scans. Each document starts `unverified` because this checkout has local changes and an untracked Bridge entry point. `-` means no reviewed commit has been established. Do not substitute the current `HEAD` for a review.

| Document | Watched paths | Last reviewed commit | Review state |
| :--- | :--- | :--- | :--- |
| `README.md` | `package.json`, `mcp-config.example.json`, `.env.example`, `start-bridge.bat`, `.github/workflows/ci.yml`, `src/index.ts`, `src/bridge.ts`, `src/services/bridgeServer.ts`, `src/services/sessionStore.ts`, `src/services/axelorClient.ts`, `extension/manifest.json`, `extension/popup.js`, `extension/background.js` | `-` | `unverified` |
| `.agents/docs/ARCHITECTURE.md` | `README.md`, `src/index.ts`, `src/bridge.ts`, `src/services/bridgeServer.ts`, `src/services/bridgeClient.ts`, `src/services/sessionStore.ts`, `src/services/axelorClient.ts`, `src/services/guidanceService.ts`, `src/types/guidance.ts`, `extension/manifest.json`, `extension/popup.js`, `extension/background.js` | `-` | `unverified` |
| `.agents/docs/bridge-protocol.md` | `src/bridge.ts`, `src/services/bridgeServer.ts`, `src/services/sessionStore.ts`, `src/types/axelor.ts`, `extension/background.js` | `-` | `unverified` |
| `.agents/docs/DEV_GUIDE.md` | `README.md`, `package.json`, `src/index.ts`, `src/bridge.ts`, `src/cli/guidePusher.ts`, `src/guides/index.ts`, `extension/manifest.json`, `extension/popup.html`, `extension/popup.js`, `extension/background.js` | `-` | `unverified` |
| `.agents/standard-index.md` | `README.md`, `src/index.ts`, `src/types/guidance.ts`, `.agents/skills/axelor-guidance-builder/SKILL.md`, `extension/manifest.json` | `-` | `unverified` |
| `.agents/dev-index.md` | `README.md`, `.agents/docs/ARCHITECTURE.md`, `.agents/docs/bridge-protocol.md`, `.agents/docs/DEV_GUIDE.md`, `.agents/Axelor-index.md`, `src/index.ts`, `src/bridge.ts`, `src/services/bridgeServer.ts`, `src/services/sessionStore.ts`, `src/guides/index.ts`, `src/cli/guidePusher.ts`, `extension/manifest.json`, `extension/popup.js`, `extension/background.js` | `-` | `unverified` |

## Review States

- `unverified`: No evidence-based review has established a baseline. Inspect current claims against their watched sources, including local changes, before making any freshness claim.
- `reviewed-clean`: The document and its watched sources were checked against a recorded, reachable commit and are clean of relevant local changes. A matching Git reference is still only a change-detection shortcut.
- `pending-local-changes`: Review found relevant modified, staged, deleted, or untracked files; keep the finding visible until the state can be reconciled. Never advance the reviewed commit over these changes.
- `needs-plan`: The review found uncertain or cross-document changes requiring a separate plan; record the discrepancy without declaring freshness.

After a verified review, record a reachable commit only when the document and its watched sources are committed and clean. Otherwise keep the baseline unchanged and use `pending-local-changes` or `needs-plan`. A review date may be noted for people, but never used as a pass/fail signal.

When a new runtime component replaces or adds an entry point, inspect the affected document claims, add the specific new file to the relevant rows, and retire obsolete paths only after verifying their absence or historical role. Do not mark those rows clean until the new dependency has been reviewed. Exclude the historical HUD documentation, `.agents/HANDOFF.md`, secrets such as `.session.json` and `.env`, generated output, and `reference-sources/` from routine freshness checks.