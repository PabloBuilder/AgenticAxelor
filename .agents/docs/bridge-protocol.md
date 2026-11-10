# Bridge Server Protocol & Endpoints (`127.0.0.1:3210`)

The Bridge is a separate local process. The shipped extension uses it to synchronize the active Axelor session and manage the local session registry. The MCP server reads the persisted session from the same checkout.

---

## 1. Endpoints Matrix

| Method | Endpoint | Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | None | `{ status, port }` | Healthcheck probe. |
| `POST` | `/api/session/sync` | `{ cookie, url, csrfCookie? }` (JSON) | `{ success, url, updatedAt }` | Validates input and persists the legacy browser session in `.session.json`; does not verify it with Axelor. |
| `GET` | `/api/sessions` | None | `{ success, sessions }` | Lists registered sessions without exposing cookies. |
| `POST` | `/api/sessions` | `{ action, ... }` | `{ success, ... }` | Manages sessions in the registry (save, activate, deactivate, rename, delete). |

The Bridge binds to `127.0.0.1`. `/api/session/sync` requires a non-empty `JSESSIONID` cookie and an absolute HTTP(S) base URL without credentials, query, or fragment; invalid JSON or input returns `400`, persistence failure returns `500`. An optional `csrfCookie` object carries `value`, `path`, `secure`, and `httpOnly` for the browser integration; older session sync clients remain supported. Keep both cookies and `.session.json` private. `GET /api/status` reports bridge status, not Axelor authentication status.
