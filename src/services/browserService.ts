import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { createHash } from "node:crypto";
import { SessionStore, type SessionData } from "./sessionStore.js";

export class BrowserService {
  constructor(private readonly loadSession: () => SessionData | null = () => SessionStore.loadSession()) {}

  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;
  private fingerprint?: string;
  private origin?: string;

  async open(): Promise<{ url: string; warning: string }> {
    const session = this.loadSession();
    if (!session?.url || !session.cookie) throw new Error("Synchronisez d'abord la session Axelor avec l'extension.");
    const url = new URL(session.url);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("URL Axelor invalide.");
    const cookie = /^JSESSIONID=([^;\s]+)$/.exec(session.cookie.trim());
    if (!cookie) throw new Error("Cookie JSESSIONID invalide ; resynchronisez la session.");
    const fingerprint = createHash("sha256").update(session.url).update("\0").update(session.cookie).update("\0").update(JSON.stringify(session.csrfCookie ?? null)).digest("hex");
    if (this.page && !this.page.isClosed() && this.fingerprint === fingerprint) return { url: this.page.url(), warning: "Session navigateur existante ; authentification à vérifier dans la page." };
    await this.close();
    try {
      const position = process.env.AXELOR_BROWSER_WINDOW_POSITION;
      if (position && !/^-?\d+,-?\d+$/.test(position)) throw new Error("AXELOR_BROWSER_WINDOW_POSITION doit être au format x,y.");
      this.browser = await chromium.launch({ headless: false, args: position ? [`--window-position=${position}`] : [] });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("AXELOR_BROWSER_WINDOW_POSITION")) throw error;
      throw new Error("Chromium n'a pas pu démarrer. Vérifiez l'installation avec npm run browser:install.");
    }
    try {
      this.context = await this.browser.newContext();
      await this.context.addCookies([{ name: "JSESSIONID", value: cookie[1], url: url.toString() }]);
      if (session.csrfCookie) {
        await this.context.addCookies([{ name: "CSRF-TOKEN", value: session.csrfCookie.value, domain: url.hostname, path: session.csrfCookie.path, secure: session.csrfCookie.secure, httpOnly: session.csrfCookie.httpOnly }]);
      }
      this.page = await this.context.newPage();
      const response = await this.page.goto(url.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
      await this.page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => undefined);
      this.origin = url.origin;
      if (!response || response.status() >= 400 || new URL(this.page.url()).origin !== url.origin || /(?:^|\/)login(?:\.jsp)?\/?$/i.test(new URL(this.page.url()).pathname) || await this.page.locator('input[type="password"]:visible').count()) {
        throw new Error("Connexion Axelor non confirmée : vérifiez la session et resynchronisez-la si nécessaire.");
      }
      this.fingerprint = fingerprint;
      return { url: this.page.url(), warning: "Page chargée sans formulaire de connexion détecté ; ce contrôle ne garantit pas l'authentification." };
    } catch (error) {
      await this.close();
      throw error;
    }
  }

  private activePage(): Page {
    const session = this.loadSession();
    if (!session?.url || !session.cookie || createHash("sha256").update(session.url).update("\0").update(session.cookie).update("\0").update(JSON.stringify(session.csrfCookie ?? null)).digest("hex") !== this.fingerprint) throw new Error("Session absente ou modifiée : rouvrez le navigateur.");
    if (!this.page || this.page.isClosed()) throw new Error("Navigateur fermé : ouvrez-le d'abord.");
    if (new URL(this.page.url()).origin !== this.origin) throw new Error("La page a quitté l'origine Axelor ; rouvrez le navigateur.");
    return this.page;
  }

  async observe(): Promise<{ url: string; title: string; snapshot: string; truncated: boolean }> {
    const page = this.activePage();
    const snapshot = await page.locator("body").ariaSnapshot({ timeout: 10000 });
    return { url: page.url(), title: await page.title(), snapshot: snapshot.slice(0, 12000), truncated: snapshot.length > 12000 };
  }

  async act(action: "click" | "click_text" | "fill" | "select" | "check" | "uncheck" | "wait_visible" | "navigate", role?: "button" | "link" | "textbox" | "combobox" | "tab" | "checkbox" | "radio" | "spinbutton" | "option" | "dialog", name?: string, value?: string): Promise<{ url: string }> {
    const page = this.activePage();
    const failures: number[] = [];
    const onResponse = (response: import("playwright").Response) => {
      if (response.status() >= 400 && new URL(response.url()).origin === this.origin) failures.push(response.status());
    };
    page.on("response", onResponse);
    try {
    if (action === "navigate") {
      if (!value) throw new Error("URL requise pour naviguer.");
      const target = new URL(value, page.url());
      if (target.origin !== this.origin) throw new Error("Navigation hors de l'origine Axelor refusée.");
      await page.goto(target.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
    } else if (action === "click_text") {
      if (!name) throw new Error("Texte exact requis pour cibler un élément.");
      const target = page.getByText(name, { exact: true }).locator("visible=true");
      if (await target.count() !== 1) throw new Error("Texte introuvable ou ambigu : observez à nouveau la page.");
      await target.click({ timeout: 10000 });
    } else {
      if (!role || !name) throw new Error("Rôle et nom exact requis pour cibler un élément.");
      const target = page.getByRole(role, { name, exact: true });
      if (action === "wait_visible") {
        await target.waitFor({ state: "visible", timeout: 10000 });
      } else if (await target.count() !== 1) throw new Error("Élément introuvable ou ambigu : observez à nouveau la page.");
      if (action === "click") await target.click({ timeout: 10000 });
      else if (action === "check") await target.check({ timeout: 10000 });
      else if (action === "uncheck") await target.uncheck({ timeout: 10000 });
      else if (action === "wait_visible") { /* Already waited above. */ }
      else if (action === "fill") {
        if (value === undefined) throw new Error("Valeur requise pour la saisie.");
        await target.fill(value, { timeout: 10000 });
      } else {
        if (value === undefined) throw new Error("Valeur requise pour la sélection.");
        await target.selectOption({ label: value }, { timeout: 10000 });
      }
    }
    await page.waitForTimeout(300);
    const settled = await page.waitForLoadState("networkidle", { timeout: 5000 }).then(() => true, () => false);
    if (failures.length) throw new Error(`L'interaction a été effectuée, mais Axelor a répondu HTTP ${failures[0]}. Vérifiez l'état avant toute nouvelle tentative.`);
    if (!settled) throw new Error("Interaction effectuée mais chargement encore actif après 5 secondes : vérifiez l'état avant de poursuivre.");
    return { url: page.url() };
    } finally {
      page.off("response", onResponse);
    }
  }

  async close(): Promise<void> {
    const browser = this.browser;
    this.browser = undefined;
    this.context = undefined;
    this.page = undefined;
    this.fingerprint = undefined;
    this.origin = undefined;
    if (browser) await browser.close();
  }
}
