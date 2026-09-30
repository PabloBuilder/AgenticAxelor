# Bridge Server Protocol & Endpoints (`127.0.0.1:3210`)

The Bridge is a separate local process. The shipped extension uses it only to synchronize the active Axelor session; no content script consumes guidance routes or SSE. The MCP server reads the persisted session from the same checkout.

---

## 1. Endpoints Matrix

| Method | Endpoint | Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | None | `{ status, port, hasActiveRoute, clientsConnected }` | Healthcheck & connection probe. |
| `POST` | `/api/session/sync` | `{ cookie, url }` (JSON) | `{ success, url, updatedAt }` | Validates input and persists the browser session in `.session.json`; does not verify it with Axelor. |
| `GET` | `/api/guide/current` | None | `{ currentRoute, activeStepIndex, isCompleted }` | Retained in-memory route snapshot; the current extension does not poll it. |
| `POST` | `/api/guide/push` | `GuidanceRoute` (JSON) | `{ success, route }` | Stores a route and resets its step to 0; no browser display. |
| `POST` | `/api/guide/advance` | None | `{ success, activeStepIndex }` | Increments current step index by 1. |
| `POST` | `/api/guide/previous` | None | `{ success, activeStepIndex }` | Decrements current step index by 1 (down to 0). |
| `POST` | `/api/guide/reset` | None | `{ success, activeStepIndex: 0 }` | Rolls back active route to initial step (0). |
| `POST` | `/api/guide/clear` | None | `{ success, message }` | Purges active route from memory. |
| `GET` | `/api/guide/stream` | None | `text/event-stream` (SSE) | Retained stream with `INIT`, `ROUTE_SET`, `STEP_ADVANCED`, `ROUTE_CLEARED`; no consumer in the shipped extension. |

The Bridge binds to `127.0.0.1`. `/api/session/sync` requires a non-empty `JSESSIONID` cookie and an absolute HTTP(S) base URL without credentials, query, or fragment; invalid JSON or input returns `400`, persistence failure returns `500`. Keep the cookie and `.session.json` private. `GET /api/status` reports guide state and SSE client count, not Axelor authentication status.

---

## 2. Event Types (SSE)
- `INIT`: Sent with the current route state on stream connection.
- `ROUTE_SET`: Broadcast when a route is pushed through the Bridge (MCP or CLI).
- `STEP_ADVANCED`: Broadcast for advance, previous, and reset requests (despite the event name).
- `ROUTE_CLEARED`: Broadcast when stored route state is cleared.
