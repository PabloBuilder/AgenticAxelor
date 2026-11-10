import http from "http";
import path from "node:path";
import fs from "node:fs";
import { SessionRegistry } from "./sessionRegistry.js";
import { AxelorSessionInput } from "../types/axelor.js";
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

  let csrfCookie: AxelorSessionInput["csrfCookie"];
  if (input.csrfCookie !== undefined) {
    if (!input.csrfCookie || typeof input.csrfCookie !== "object") throw new Error("Invalid CSRF cookie.");
    const csrf = input.csrfCookie as Record<string, unknown>;
    if (typeof csrf.value !== "string" || !csrf.value || /[;\s]/.test(csrf.value) ||
        typeof csrf.path !== "string" || !csrf.path.startsWith("/") || /[\r\n;]/.test(csrf.path) ||
        typeof csrf.secure !== "boolean" || typeof csrf.httpOnly !== "boolean") throw new Error("Invalid CSRF cookie.");
    csrfCookie = { value: csrf.value, path: csrf.path, secure: csrf.secure, httpOnly: csrf.httpOnly };
  }
  return { cookie, url: input.url.trim(), ...(csrfCookie ? { csrfCookie } : {}) };
}

export class BridgeServer {
  private server: http.Server | null = null;
  private port: number;
  private applySession: (session: AxelorSessionInput) => void;
  private readonly registry: SessionRegistry;
  private readonly migrateExistingSession: boolean;

  constructor(applySession: (session: AxelorSessionInput) => void, port: number = 3210, registry?: SessionRegistry) {
    this.port = port;
    this.applySession = applySession;
    this.registry = registry ?? new SessionRegistry(path.join(path.dirname(SessionStore.getSessionPath()), ".sessions.json"));
    this.migrateExistingSession = registry === undefined;
  }

  private applyAndVerifySession(session: AxelorSessionInput): void {
    this.applySession(session);
    const saved = SessionStore.loadSession();
    if (!saved || saved.cookie !== session.cookie || saved.url !== session.url ||
        JSON.stringify(saved.csrfCookie ?? null) !== JSON.stringify(session.csrfCookie ?? null)) {
      throw new Error("Session was not persisted.");
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.migrateExistingSession) {
          this.registry.migrateLegacy(() => {
            let raw: string;
            try { raw = fs.readFileSync(SessionStore.getSessionPath(), "utf8"); }
            catch (error) {
              if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
              throw error;
            }
            return validateSessionInput(JSON.parse(raw));
          });
          this.registry.recoverLegacy((session) => this.applyAndVerifySession(session));
        }
      } catch {
        reject(new Error("Unable to migrate legacy session safely."));
        return;
      }
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

        // Status check
        if (url.pathname === "/api/status" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "running",
              port: this.port,
            })
          );
          return;
        }

        // The multi-session API never returns session credentials.
        if (url.pathname === "/api/sessions" && req.method === "GET") {
          try {
            const sessions = this.registry.list();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, sessions }));
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Unable to read session registry." }));
          }
          return;
        }

        if (url.pathname === "/api/sessions" && req.method === "POST") {
          if (!origin || !isAllowedExtensionOrigin(origin) || !/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] || "")) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Extension origin and JSON content required." }));
            return;
          }
          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
            if (body.length > 32768) req.destroy();
          });
          req.on("end", () => {
            try {
              const input: unknown = JSON.parse(body);
              if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid request.");
              const request = input as Record<string, unknown>;
              let session;
              if (request.action === "save") {
                if (request.id !== undefined && (typeof request.id !== "string" || !request.id)) throw new Error("Invalid session identifier.");
                if (request.name !== undefined && (typeof request.name !== "string" || request.name.length > 200)) throw new Error("Invalid session name.");
                session = this.registry.save(validateSessionInput(request), { id: request.id as string | undefined, name: request.name as string | undefined });
              } else if (request.action === "activate" || request.action === "deactivate" || request.action === "delete") {
                if (typeof request.id !== "string" || !request.id) throw new Error("Invalid session identifier.");
                if (request.action === "delete") this.registry.remove(request.id);
                else this.registry.setActive(request.id, request.action === "activate");
              } else {
                throw new Error("Invalid action.");
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true, ...(session ? { session } : {}) }));
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Session operation failed; check request or retry." }));
            }
          });
          return;
        }

        // Sync session cookie from browser extension
        if (url.pathname === "/api/session/sync" && req.method === "POST") {
          if (!origin || !isAllowedExtensionOrigin(origin) || !/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] || "")) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Extension origin and JSON content required." }));
            return;
          }
          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
            if (body.length > 32768) req.destroy();
          });
          req.on("end", () => {
            let sessionInput: AxelorSessionInput;
            try {
              sessionInput = validateSessionInput(JSON.parse(body));
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Invalid session data." }));
              return;
            }

            try {
              this.registry.recoverLegacy((session) => this.applyAndVerifySession(session));
              this.registry.syncLegacy(sessionInput, (session) => this.applyAndVerifySession(session));
              const savedSession = SessionStore.loadSession()!;
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({
                success: true,
                url: savedSession.url,
                updatedAt: savedSession.updatedAt,
              }));
            } catch (err: any) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Session synchronization failed; retry after checking local storage." }));
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

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}
