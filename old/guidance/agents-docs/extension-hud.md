# Historical Chrome Extension HUD Specification

**Legacy reference only.** These notes describe the former overlay design, not the Chrome extension shipped in [`extension/`](../../extension/). The current [manifest](../../extension/manifest.json) registers no content script; the [background worker](../../extension/background.js) only synchronizes the active Axelor session with the Bridge. No HUD is displayed. See the [current architecture](ARCHITECTURE.md) for the supported flow and [`old/extension-v0.3/`](../../old/extension-v0.3/) for archived implementation files.

## Former Perimeter Detection Design

The former `content.js` design checked the site hostname against stored domains and Axelor keywords, then inspected DOM and framework markers before polling for guidance. Non-Axelor pages were intended to suppress the overlay. This behavior is not present in the shipped extension.

## Former HUD Design

The former `spotlightEngine.js` design described a collapsed step indicator and an expanded card with instructions, copyable fields, explanations, breadcrumbs, and previous/reset/next controls. A render cache was intended to avoid flicker during polling. The HUD was designed to remain separate from Axelor's own DOM interactions.

Bridge guidance endpoints and MCP guide tools still exist, but the current extension does not consume or display their routes. Do not use this document as an implementation contract for the shipped extension.
