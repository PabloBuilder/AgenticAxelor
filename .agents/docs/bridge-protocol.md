# Bridge Server Protocol & Endpoints (`localhost:3210`)

Low-level specification for the AgenticAxelor local HTTP / SSE synchronization bridge.

---

## 1. Endpoints Matrix

| Method | Endpoint | Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | None | `{ status, port, hasActiveRoute, clientsConnected }` | Healthcheck & connection probe. |
| `GET` | `/api/guide/current` | None | `{ currentRoute, activeStepIndex, isCompleted }` | State snapshot consumed by polling clients. |
| `POST` | `/api/guide/push` | `GuidanceRoute` (JSON) | `{ success, route }` | Injects a new guidance roadmap (resets step to 0). |
| `POST` | `/api/guide/advance` | None | `{ success, activeStepIndex }` | Increments current step index by 1. |
| `POST` | `/api/guide/previous` | None | `{ success, activeStepIndex }` | Decrements current step index by 1 (down to 0). |
| `POST` | `/api/guide/reset` | None | `{ success, activeStepIndex: 0 }` | Rolls back active route to initial step (0). |
| `POST` | `/api/guide/clear` | None | `{ success, message }` | Purges active route from memory. |
| `GET` | `/api/guide/stream` | None | `text/event-stream` (SSE) | Real-time broadcast for `INIT`, `ROUTE_SET`, `STEP_ADVANCED`, `STEP_PREVIOUS`, `ROUTE_CLEARED`. |

---

## 2. Event Types (SSE)
- `INIT`: Broadcast initial state upon connection.
- `ROUTE_SET`: Triggered when a new `GuidanceRoute` is pushed via MCP.
- `STEP_ADVANCED`: Fired when operator or MCP moves to next step.
- `STEP_PREVIOUS`: Fired when rolling back to prior step.
- `ROUTE_CLEARED`: Fired when HUD is dismissed.
