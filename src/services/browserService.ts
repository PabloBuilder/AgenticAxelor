import { chromium, type Browser, type BrowserContext, type Page, type Locator } from "playwright";

type BrowserRole = "button" | "link" | "textbox" | "combobox" | "tab" | "checkbox" | "radio" | "spinbutton" | "option" | "dialog" | "alertdialog" | "region" | "group" | "form" | "listbox" | "menu" | "menuitem" | "searchbox" | "heading";
type BrowserMatch = { by: "role" | "label" | "placeholder" | "title" | "text"; name: string; role?: BrowserRole };
type BrowserScope = { role: BrowserRole | "axelor_modal" | "axelor_field"; name?: string; contains?: BrowserMatch };
type BrowserTarget = { by?: BrowserMatch["by"]; scope?: BrowserScope; timeoutMs?: number };
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

  private matchLocator(container: Page | Locator, match: BrowserMatch): Locator {
    const { by, name, role } = match;
    if (by !== "role" && !name.trim()) throw new Error("Texte non vide requis pour cette méthode de ciblage.");
    if (by === "text") return container.getByText(name, { exact: true });
    if (by === "label") return container.getByLabel(name, { exact: true });
    if (by === "placeholder") return container.getByPlaceholder(name, { exact: true });
    if (by === "title") return container.getByTitle(name, { exact: true });
    if (!role) throw new Error("Rôle exact requis pour le ciblage par rôle.");
    return container.getByRole(role, { name, exact: true });
  }

  private async scopeLocator(page: Page, scope?: BrowserScope): Promise<Page | Locator> {
    if (!scope) return page;
    let container: Locator;
    if (scope.role === "axelor_field") {
      if (scope.contains !== undefined) throw new Error("contains interdit pour le scope axelor_field.");
      if (!scope.name?.trim()) throw new Error("Le libellé exact du champ Axelor est requis.");
      const escaped = scope.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Match the label itself (including nested spans), not outer layout containers.
      const label = page.locator('[class*="_title_"] > label:visible').filter({ hasText: new RegExp(`^\\s*${escaped}\\s*$`) });
      container = label.locator('xpath=../..').locator('xpath=self::*[contains(@class, "_container_") and *[contains(@class, "_content_")]]');
    } else if (scope.role === "axelor_modal") {
      if (!scope.name?.trim()) throw new Error("Le titre exact de la modale Axelor est requis.");
      container = page.locator('[class*="_modal-content_"], .modal-content').filter({
        has: page.getByRole("heading", { name: scope.name, exact: true }),
      });
    } else {
      container = scope.name === undefined
        ? page.getByRole(scope.role)
        : page.getByRole(scope.role, { name: scope.name, exact: true });
    }
    if (scope.contains) container = container.filter({ has: this.matchLocator(page, scope.contains) });
    container = container.locator("visible=true");
    if (await container.count() !== 1) throw new Error("Zone introuvable ou ambiguë : observez la page avant de poursuivre.");
    await container.waitFor({ state: "visible", timeout: 10000 });
    if (scope.role === "axelor_field") await this.rejectNestedFields(container);
    return container;
  }

  private async rejectNestedFields(container: Locator): Promise<void> {
    const nested = container.locator('xpath=.//*[contains(@class, "_container_") and *[contains(@class, "_title_") and label] and *[contains(@class, "_content_")]]');
    if (await nested.count()) throw new Error("Champ Axelor imbriqué : scope parent refusé.");
  }

  async observe(scope?: BrowserScope): Promise<{ url: string; title: string; snapshot: string; truncated: boolean }> {
    const page = this.activePage();
    const container = await this.scopeLocator(page, scope);
    const target = scope ? container as Locator : page.locator("body");
    const snapshot = await target.ariaSnapshot({ timeout: 10000 });
    return { url: page.url(), title: await page.title(), snapshot: snapshot.slice(0, 12000), truncated: snapshot.length > 12000 };
  }

  async act(action: "click" | "click_text" | "fill" | "select" | "check" | "uncheck" | "wait_visible" | "wait_hidden" | "press" | "navigate", role?: BrowserRole, name?: string, value?: string, options: BrowserTarget = {}): Promise<{ url: string; warning: string }> {
    if (action === "navigate" && options.scope?.role === "axelor_field") throw new Error("Navigation incompatible avec le scope axelor_field.");
    const page = this.activePage();
    const timeout = options.timeoutMs ?? 10000;
    if (!Number.isInteger(timeout) || timeout < 100 || timeout > 30000) throw new Error("Délai invalide : utiliser 100 à 30000 ms.");
    const failures: number[] = [];
    const onResponse = (response: import("playwright").Response) => {
      if (response.status() >= 400 && new URL(response.url()).origin === this.origin) failures.push(response.status());
    };
    page.on("response", onResponse);
    let attempted = false;
    try {
      if (action === "navigate") {
        if (!value) throw new Error("URL requise pour naviguer.");
        const targetUrl = new URL(value, page.url());
        if (targetUrl.origin !== this.origin) throw new Error("Navigation hors de l'origine Axelor refusée.");
        attempted = true;
        await page.goto(targetUrl.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
      } else {
        if (name === undefined) throw new Error("Nom ou texte exact requis pour cibler un élément (nom vide explicite accepté pour un rôle non nommé).");
        const container = await this.scopeLocator(page, options.scope);
        const by = action === "click_text" ? "text" : options.by ?? "role";
        const target = this.matchLocator(container, { by, name, role });
        if (action === "wait_hidden") {
          if (await target.count() > 1) throw new Error("Élément ambigu : précisez la zone.");
          await target.waitFor({ state: "hidden", timeout });
        } else {
          const visible = target.locator("visible=true");
          if (await visible.count() > 1) throw new Error("Élément ambigu : précisez la zone et observez à nouveau.");
          try { await visible.waitFor({ state: "visible", timeout }); }
          catch { throw new Error("Élément introuvable, non visible ou ambigu : observez à nouveau la page."); }
          if (await visible.count() !== 1) throw new Error("Élément introuvable ou ambigu : observez à nouveau la page.");
          if (action !== "wait_visible") {
            if ((action === "fill" || action === "select") && value === undefined) throw new Error("Valeur requise pour cette action.");
            if (action === "press" && (!value || !["Escape", "Enter", "Tab", "ArrowDown", "ArrowUp", "Home", "End"].includes(value))) throw new Error("Touche non prise en charge.");
            // A fixed handle cannot silently resolve to a replacement node during Playwright retries.
            const handle = options.scope?.role === "axelor_field" ? await visible.elementHandle() : null;
            try {
              if (options.scope?.role === "axelor_field") {
                await this.rejectNestedFields(container as Locator);
                if (!handle || await visible.count() !== 1 || !await visible.evaluate((el, original) => el === original, handle)) throw new Error("Cible modifiée ou ambiguë : observez à nouveau.");
              }
              attempted = true;
              const control = handle ?? visible;
              if (action === "click" || action === "click_text") await control.click({ timeout });
              else if (action === "check") await control.check({ timeout });
              else if (action === "uncheck") await control.uncheck({ timeout });
              else if (action === "fill") await control.fill(value!, { timeout });
              else if (action === "select") await control.selectOption({ label: value! }, { timeout });
              else if (action === "press") await control.press(value!, { timeout });
            } finally { await handle?.dispose(); }
          }
        }
      }
      if (attempted) {
        if (page.isClosed()) throw new Error("La page a été fermée ou remplacée.");
        if (new URL(page.url()).origin !== this.origin) throw new Error("La page a quitté l'origine Axelor.");
        await page.waitForTimeout(300);
        const settled = await page.waitForLoadState("networkidle", { timeout: 5000 }).then(() => true, () => false);
        if (failures.length) throw new Error(`Axelor a répondu HTTP ${failures[0]}.`);
        if (!settled) throw new Error("Le chargement est encore actif après 5 secondes.");
        if (new URL(page.url()).origin !== this.origin) throw new Error("La page a quitté l'origine Axelor.");
        if (/(?:^|\/)login(?:\.jsp)?\/?$/i.test(new URL(page.url()).pathname)) throw new Error("Page de connexion détectée ; vérifiez la session.");
      }
      return { url: page.url(), warning: "L'interaction ne prouve pas la réussite métier ; vérifiez le résultat affiché ou les données." };
    } catch (error) {
      if (attempted) throw new Error(`Action potentiellement effectuée : ne pas répéter sans vérifier l'état. ${error instanceof Error ? error.message : "Erreur navigateur."}`);
      throw error;
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
