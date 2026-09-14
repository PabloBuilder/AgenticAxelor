import http from "http";
import { GuidanceRoute } from "../types/guidance.js";
import { SessionStore } from "./sessionStore.js";

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

  constructor(port: number = 3210) {
    this.port = port;
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        // Enable CORS for browser extension communication
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
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
            try {
              const data = JSON.parse(body);
              SessionStore.saveSession(data);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
      });

      this.server.listen(this.port, () => {
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
