import http from "http";
import { AxelorSessionInput } from "../types/axelor.js";
import { GuidanceRoute } from "../types/guidance.js";
import { SessionStore } from "./sessionStore.js";

const CHROME_EXTENSION_ORIGIN = /^chrome-extension:\/\/([a-p]{32})$/;

function isAllowedExtensionOrigin(origin: string): boolean {
  const match = CHROME_EXTENSION_ORIGIN.exec(origin);
  if (!match) return false;

  const allowedExtensionId = process.env.BRIDGE_EXTENSION_ID?.trim();
  return !allowedExtensionId || match[1] === allowedExtensionId;
}

export function validateSessionInput(data: unknown): AxelorSessionInput {
  if (!data || typeof data !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const input = data as Record<string, unknown>;
  if (typeof input.cookie !== "string" || /[\r\n]/.test(input.cookie)) {
    throw new Error("A valid JSESSIONID cookie is required.");
  }

  const cookie = input.cookie.trim();
  const hasJSessionId = cookie.split(";").some((part) => {
    const separator = part.indexOf("=");
    return separator > 0 &&
      part.slice(0, separator).trim() === "JSESSIONID" &&
      part.slice(separator + 1).trim().length > 0;
  });
  if (!hasJSessionId) {
    throw new Error("Cookie must contain a non-empty JSESSIONID.");
  }

  if (typeof input.url !== "string" || !input.url.trim()) {
    throw new Error("An absolute HTTP(S) Axelor URL is required.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.url.trim());
  } catch {
    throw new Error("An absolute HTTP(S) Axelor URL is required.");
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    !parsedUrl.hostname ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error("URL must be an HTTP(S) Axelor base URL without credentials, query, or fragment.");
  }

  return { cookie, url: input.url.trim() };
}

export interface BridgeState {
  currentRoute: GuidanceRoute | null;
  activeStepIndex: number;
}

export class BridgeServer {
  private server: http.Server | null = null;
  private port: number;
  private state: BridgeState = {
    currentRoute: null,
    activeStepIndex: 0,
  };
  private sseClients: Set<http.ServerResponse> = new Set();
  private applySession: (session: AxelorSessionInput) => void;

  constructor(applySession: (session: AxelorSessionInput) => void, port: number = 3210) {
    this.port = port;
    this.applySession = applySession;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const origin = req.headers.origin;
        if (origin && !isAllowedExtensionOrigin(origin)) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Origin not allowed." }));
          return;
        }

        if (origin) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.setHeader("Vary", "Origin");
        }

        if (req.method === "OPTIONS") {
          if (!origin) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Extension origin required." }));
            return;
          }
          res.writeHead(204);
          res.end();
          return;
        }

        const url = new URL(req.url || "/", `http://localhost:${this.port}`);

        // SSE stream for real-time guidance updates
        if (url.pathname === "/api/guide/stream") {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });

          this.sseClients.add(res);

          // Send current state immediately on connection
          res.write(
            `data: ${JSON.stringify({ event: "INIT", payload: this.getState() })}\n\n`
          );

          req.on("close", () => {
            this.sseClients.delete(res);
          });
          return;
        }

        // Get current route & status
        if (url.pathname === "/api/guide/current" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(this.getState()));
          return;
        }

        // Push a route directly via HTTP POST
        if (url.pathname === "/api/guide/push" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            try {
              const route = JSON.parse(body);
              this.setRoute(route);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true, route }));
            } catch (err: any) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Advance to next step
        if (url.pathname === "/api/guide/advance" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            const nextIndex = this.advanceStep();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, activeStepIndex: nextIndex }));
          });
          return;
        }

        // Previous step
        if (url.pathname === "/api/guide/previous" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            const prevIndex = this.previousStep();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, activeStepIndex: prevIndex }));
          });
          return;
        }

        // Reset / Rollback to first step (0)
        if (url.pathname === "/api/guide/reset" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            const resetIndex = this.resetStep();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, activeStepIndex: resetIndex }));
          });
          return;
        }

        // Clear active guide
        if (url.pathname === "/api/guide/clear" && req.method === "POST") {
          this.clearRoute();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Guide cleared." }));
          return;
        }

        // Status check
        if (url.pathname === "/api/status" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "running",
              port: this.port,
              hasActiveRoute: !!this.state.currentRoute,
              clientsConnected: this.sseClients.size,
            })
          );
          return;
        }

        // Sync session cookie from browser extension
        if (url.pathname === "/api/session/sync" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            let sessionInput: AxelorSessionInput;
            try {
              sessionInput = validateSessionInput(JSON.parse(body));
            } catch (err: any) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: err.message || "Invalid session data." }));
              return;
            }

            try {
              this.applySession(sessionInput);
              const savedSession = SessionStore.loadSession();
              if (!savedSession || savedSession.cookie !== sessionInput.cookie || savedSession.url !== sessionInput.url) {
                throw new Error("Session was not persisted.");
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({
                success: true,
                url: savedSession.url,
                updatedAt: savedSession.updatedAt,
              }));
            } catch (err: any) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: err.message || "Session synchronization failed." }));
            }
          });
          return;
        }

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
      });

      this.server.once("error", reject);
      this.server.listen(this.port, "127.0.0.1", () => {
        resolve();
      });
    });
  }

  setRoute(route: GuidanceRoute) {
    this.state.currentRoute = route;
    this.state.activeStepIndex = 0;
    this.broadcast("ROUTE_SET", this.getState());
  }

  advanceStep(): number {
    if (
      this.state.currentRoute &&
      this.state.activeStepIndex < this.state.currentRoute.steps.length - 1
    ) {
      this.state.activeStepIndex += 1;
      this.state.currentRoute.currentStepIndex = this.state.activeStepIndex;
    } else if (
      this.state.currentRoute &&
      this.state.activeStepIndex >= this.state.currentRoute.steps.length - 1
    ) {
      this.state.activeStepIndex = this.state.currentRoute.steps.length; // Completed
    }
    this.broadcast("STEP_ADVANCED", this.getState());
    return this.state.activeStepIndex;
  }

  previousStep(): number {
    if (this.state.currentRoute && this.state.activeStepIndex > 0) {
      this.state.activeStepIndex -= 1;
      this.state.currentRoute.currentStepIndex = this.state.activeStepIndex;
    }
    this.broadcast("STEP_ADVANCED", this.getState());
    return this.state.activeStepIndex;
  }

  resetStep(): number {
    this.state.activeStepIndex = 0;
    if (this.state.currentRoute) {
      this.state.currentRoute.currentStepIndex = 0;
    }
    this.broadcast("STEP_ADVANCED", this.getState());
    return 0;
  }

  clearRoute() {
    this.state.currentRoute = null;
    this.state.activeStepIndex = 0;
    this.broadcast("ROUTE_CLEARED", this.getState());
  }

  getState() {
    return {
      currentRoute: this.state.currentRoute,
      activeStepIndex: this.state.activeStepIndex,
      isCompleted:
        this.state.currentRoute !== null &&
        this.state.activeStepIndex >= this.state.currentRoute.steps.length,
    };
  }

  private broadcast(event: string, payload: any) {
    const message = `data: ${JSON.stringify({ event, payload })}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(message);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}
