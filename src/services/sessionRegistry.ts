import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AxelorSessionInput } from "../types/axelor.js";

/** A browser session, identified independently of its changing cookie. */
export interface RegisteredSession extends AxelorSessionInput {
  id: string;
  name: string;
  active: boolean;
  updatedAt: string;
}

export type RegisteredSessionStatus = Pick<RegisteredSession, "id" | "name" | "url" | "active" | "updatedAt">;

interface RegistryData {
  version: 1;
  sessions: RegisteredSession[];
  pendingLegacyId?: string;
}

/** File-lock mutations across processes and atomically replace the registry. */
export class SessionRegistry {
  constructor(private readonly filePath: string) {}

  private read(): RegistryData {
    let raw: string;
    try {
      raw = fs.readFileSync(this.filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { version: 1, sessions: [] };
      throw error;
    }
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || (data as RegistryData).version !== 1 || !Array.isArray((data as RegistryData).sessions)) {
      throw new Error("Invalid session registry.");
    }
    const entries = (data as RegistryData).sessions;
    const ids = new Set<string>();
    for (const entry of entries) {
      if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !entry.id || ids.has(entry.id) ||
          typeof entry.name !== "string" || !entry.name || typeof entry.url !== "string" || !entry.url ||
          typeof entry.cookie !== "string" || !entry.cookie || typeof entry.active !== "boolean" ||
          typeof entry.updatedAt !== "string" || !entry.updatedAt) {
        throw new Error("Invalid session registry.");
      }
      ids.add(entry.id);
    }
    const pending = (data as RegistryData).pendingLegacyId;
    if (pending !== undefined && (typeof pending !== "string" || !ids.has(pending))) {
      throw new Error("Invalid session registry.");
    }
    return data as RegistryData;
  }

  private write(data: RegistryData): void {
    const temporary = path.join(path.dirname(this.filePath), `.${path.basename(this.filePath)}.${randomUUID()}.tmp`);
    try {
      fs.writeFileSync(temporary, JSON.stringify(data, null, 2), { mode: 0o600, flag: "wx" });
      fs.renameSync(temporary, this.filePath);
    } finally {
      try { fs.unlinkSync(temporary); } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  }

  private mutate<T>(change: (data: RegistryData) => T, options: { allowPending?: boolean; afterWrite?: (data: RegistryData) => void } = {}): T {
    const lockPath = `${this.filePath}.lock`;
    let lock: number;
    try {
      lock = fs.openSync(lockPath, "wx", 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        throw new Error("Session registry is locked; retry later.");
      }
      throw error;
    }
    try {
      const data = this.read();
      if (data.pendingLegacyId && !options.allowPending) throw new Error("Legacy synchronization requires recovery.");
      const result = change(data);
      this.write(data);
      if (options.afterWrite) options.afterWrite(data);
      return result;
    } finally {
      fs.closeSync(lock);
      fs.unlinkSync(lockPath);
    }
  }

  /** Import the legacy session only when no registry exists, under the mutation lock. */
  migrateLegacy(load: () => AxelorSessionInput | null): void {
    this.mutate((data) => {
      if (data.sessions.length !== 0 || fs.existsSync(this.filePath)) return;
      const input = load();
      if (!input) return;
      data.sessions.push({ ...input, id: randomUUID(), name: input.url, active: true, updatedAt: new Date().toISOString() });
    }, { allowPending: true });
  }

  /** Legacy sync has no session ID: update only an unambiguous URL match. */
  syncLegacy(input: AxelorSessionInput, apply?: (input: AxelorSessionInput) => void): RegisteredSessionStatus {
    return this.mutate((data) => {
      const matches = data.sessions.filter((session) => session.url === input.url);
      if (matches.length > 1) throw new Error("Ambiguous legacy session URL.");
      const existing = matches[0];
      const session: RegisteredSession = {
        ...input, id: existing?.id ?? randomUUID(), name: existing?.name ?? input.url,
        active: existing?.active ?? true, updatedAt: new Date().toISOString(),
      };
      if (existing) data.sessions[data.sessions.indexOf(existing)] = session;
      else data.sessions.push(session);
      if (apply) data.pendingLegacyId = session.id;
      const { id, name, url, active, updatedAt } = session;
      return { id, name, url, active, updatedAt };
    }, apply ? { afterWrite: (data) => {
      apply(input);
      delete data.pendingLegacyId;
      this.write(data);
    } } : {});
  }

  /** Replay a committed registry update interrupted before the legacy store was updated. */
  recoverLegacy(apply: (input: AxelorSessionInput) => void): void {
    this.mutate((data) => {
      if (!data.pendingLegacyId) return;
      const session = data.sessions.find((item) => item.id === data.pendingLegacyId)!;
      apply({ url: session.url, cookie: session.cookie, ...(session.csrfCookie ? { csrfCookie: session.csrfCookie } : {}) });
      delete data.pendingLegacyId;
    }, { allowPending: true });
  }

  list(): RegisteredSessionStatus[] {
    return this.read().sessions.map(({ id, name, url, active, updatedAt }) => ({ id, name, url, active, updatedAt }));
  }

  get(id: string): RegisteredSession | undefined {
    const data = this.read();
    if (data.pendingLegacyId) throw new Error("Legacy synchronization requires recovery.");
    return data.sessions.find((session) => session.id === id);
  }

  /** Resolve one operation's destination without changing any global selection. */
  resolve(id?: string): RegisteredSession {
    const data = this.read();
    if (data.pendingLegacyId) throw new Error("Legacy synchronization requires recovery.");
    const active = data.sessions.filter((session) => session.active);
    if (id !== undefined) {
      const session = active.find((entry) => entry.id === id);
      if (!session) throw new Error("Session inconnue ou inactive.");
      return session;
    }
    if (active.length === 0) throw new Error("Aucune session active.");
    if (active.length > 1) throw new Error("Destination ambiguë : précisez l’identifiant de session.");
    return active[0];
  }

  save(input: AxelorSessionInput, options: { id?: string; name?: string } = {}): RegisteredSessionStatus {
    return this.mutate((data) => {
    const existing = options.id ? data.sessions.find((session) => session.id === options.id) : undefined;
    if (options.id && !existing) throw new Error("Session not found.");
    const session: RegisteredSession = {
      ...input,
      id: existing?.id ?? randomUUID(),
      name: options.name?.trim() || existing?.name || input.url,
      active: existing?.active ?? true,
      updatedAt: new Date().toISOString(),
    };
    if (existing) data.sessions[data.sessions.indexOf(existing)] = session;
    else data.sessions.push(session);
    const { id, name, url, active, updatedAt } = session;
    return { id, name, url, active, updatedAt };
    });
  }

  setActive(id: string, active: boolean): void {
    this.mutate((data) => {
      const session = data.sessions.find((entry) => entry.id === id);
      if (!session) throw new Error("Session not found.");
      session.active = active;
    });
  }

  remove(id: string): void {
    this.mutate((data) => {
      const index = data.sessions.findIndex((entry) => entry.id === id);
      if (index < 0) throw new Error("Session not found.");
      data.sessions.splice(index, 1);
    });
  }
}
