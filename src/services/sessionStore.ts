import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { AxelorSessionInput } from "../types/axelor.js";

export interface SessionData {
  cookie: string;
  url?: string;
  updatedAt?: string;
  csrfCookie?: AxelorSessionInput["csrfCookie"];
}

export interface SessionStatus {
  url: string;
  updatedAt?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const sessionFilePath = path.resolve(projectRoot, ".session.json");

export class SessionStore {
  static getSessionPath(): string {
    return sessionFilePath;
  }

  static loadSession(): SessionData | null {
    try {
      if (fs.existsSync(sessionFilePath)) {
        const content = fs.readFileSync(sessionFilePath, "utf8");
        return JSON.parse(content) as SessionData;
      }
    } catch {
      // Ignore reading errors, fallback to default
    }
    return null;
  }

  static loadSessionStatus(): SessionStatus | null {
    const session = this.loadSession();
    if (
      typeof session?.cookie !== "string" ||
      !session.cookie.trim() ||
      typeof session.url !== "string" ||
      !session.url.trim()
    ) {
      return null;
    }

    return {
      url: session.url,
      updatedAt: session.updatedAt,
    };
  }

  static saveSession(data: AxelorSessionInput): SessionData & AxelorSessionInput {
    const session: SessionData & AxelorSessionInput = {
      cookie: data.cookie,
      url: data.url,
      ...(data.csrfCookie ? { csrfCookie: data.csrfCookie } : {}),
      updatedAt: new Date().toISOString(),
    };

    const temporary = path.join(path.dirname(sessionFilePath), `.${path.basename(sessionFilePath)}.${randomUUID()}.tmp`);
    try {
      fs.writeFileSync(temporary, JSON.stringify(session, null, 2), { encoding: "utf8", mode: 0o600, flag: "wx" });
      fs.renameSync(temporary, sessionFilePath);
    } finally {
      try { fs.unlinkSync(temporary); } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    return session;
  }
}
