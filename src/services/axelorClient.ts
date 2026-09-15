import axios, { AxiosInstance } from "axios";
import {
  AxelorActionResponse,
  AxelorApiError,
  AxelorConfig,
  AxelorErrorDetails,
  AxelorResponse,
  AxelorSearchCriteria,
} from "../types/axelor.js";
import { SessionStore } from "./sessionStore.js";

export class AxelorClient {
  private http: AxiosInstance;
  private config: AxelorConfig;
  private authenticated: boolean = false;
  private cookieJar: Map<string, string> = new Map();
  private csrfToken: string | null = null;
  private dynamicCookie: string | null = null;

  constructor(config: AxelorConfig) {
    const diskSession = SessionStore.loadSession();
    const effectiveBaseUrl = config.baseUrl || diskSession?.url || "http://localhost:8080/axelor-erp";
    this.config = { ...config, baseUrl: effectiveBaseUrl };
    const normalizedUrl = effectiveBaseUrl.replace(/\/+$/, "");

    this.http = axios.create({
      baseURL: normalizedUrl,
      withCredentials: true,
      headers: {
        Accept: "application/json",
      },
    });

    this.http.interceptors.response.use((response) => {
      const setCookie = response.headers["set-cookie"];
      if (setCookie) {
        this.updateCookies(setCookie);
      }
      return response;
    });

    this.http.interceptors.request.use((reqConfig) => {
      const diskSession = SessionStore.loadSession();
      const activeCookie = this.dynamicCookie || this.config.cookie || diskSession?.cookie;

      if (activeCookie) {
        reqConfig.headers.Cookie = activeCookie;
      } else if (this.cookieJar.size > 0) {
        const cookies = Array.from(this.cookieJar.entries()).map(([k, v]) => `${k}=${v}`);
        reqConfig.headers.Cookie = cookies.join("; ");
      }
      if (this.csrfToken) {
        reqConfig.headers["X-CSRF-Token"] = this.csrfToken;
      }
      if (this.config.apiKey) {
        reqConfig.headers["X-API-KEY"] = this.config.apiKey;
      }
      return reqConfig;
    });
  }

  setSessionCookie(cookie: string): void {
    this.dynamicCookie = cookie;
    this.authenticated = true;
    SessionStore.saveSession({ cookie, url: this.config.baseUrl });
  }

  private updateCookies(setCookies: string[]): void {
    for (const rawCookie of setCookies) {
      const cookiePart = rawCookie.split(";")[0].trim();
      const eqIdx = cookiePart.indexOf("=");
      if (eqIdx !== -1) {
        const key = cookiePart.substring(0, eqIdx);
        const val = cookiePart.substring(eqIdx + 1);
        this.cookieJar.set(key, val);

        if (key.toUpperCase().includes("CSRF")) {
          this.csrfToken = val;
        }
      }
    }
  }

  async authenticate(): Promise<void> {
    const diskSession = SessionStore.loadSession();
    if (this.config.apiKey || this.config.cookie || this.dynamicCookie || diskSession?.cookie) {
      this.authenticated = true;
      return;
    }

    if (!this.config.username || !this.config.password) {
      throw new Error("Missing Axelor credentials (username/password, session cookie, or apiKey).");
    }

    try {
      await this.http.get("/login.jsp", {
        maxRedirects: 0,
        validateStatus: () => true,
      });

      const params = new URLSearchParams();
      params.append("username", this.config.username);
      params.append("password", this.config.password);

      const response = await this.http.post("/login.jsp", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      if (response.status === 302 || response.status === 303 || response.status === 200) {
        this.authenticated = true;
        return;
      }

      throw new Error(`Unexpected authentication status code: ${response.status}`);
    } catch (error: any) {
      throw new Error(`Axelor login request failed: ${error.message}`);
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.authenticated) {
      await this.authenticate();
    }
  }

  async search<T>(model: string, criteria: AxelorSearchCriteria = {}): Promise<AxelorResponse<T>> {
    await this.ensureAuthenticated();

    const payload: Record<string, unknown> = {
      offset: criteria.offset ?? 0,
      limit: criteria.limit ?? 20,
    };

    if (criteria.fields && criteria.fields.length > 0) {
      payload.fields = criteria.fields;
    }

    if (criteria.sortBy && criteria.sortBy.length > 0) {
      payload.sortBy = criteria.sortBy;
    }

    if (criteria.domain) {
      payload.data = {
        _domain: criteria.domain,
        _domainContext: criteria.domainContext ?? {},
      };
    }

    const endpoint = `/ws/rest/${model}/search`;
    const response = await this.http.post<AxelorResponse<T>>(endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  async fetchById<T>(model: string, id: number, fields?: string[]): Promise<T | null> {
    await this.ensureAuthenticated();

    try {
      const endpoint = `/ws/rest/${model}/${id}`;
      const payload = fields && fields.length > 0 ? { fields } : {};

      const response = await this.http.post<AxelorResponse<T>>(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
    } catch {
      // Fallback
    }

    const searchFallback = await this.search<T>(model, {
      limit: 1,
      fields,
      domain: "self.id = :id",
      domainContext: { id },
    });

    if (searchFallback.data && searchFallback.data.length > 0) {
      return searchFallback.data[0];
    }

    return null;
  }

  async save<T = Record<string, any>>(
    model: string,
    record: Record<string, unknown>
  ): Promise<AxelorResponse<T>> {
    await this.ensureAuthenticated();

    const endpoint = `/ws/rest/${model}`;
    const payload = {
      data: record,
    };

    const response = await this.http.post<AxelorResponse<T>>(endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /**
   * Delete a record by ID and optional version (/ws/rest/{model}/removeAll).
   * Automatically resolves latest live $version if not provided.
   */
  async remove(
    model: string,
    id: number,
    version?: number
  ): Promise<AxelorResponse<unknown>> {
    await this.ensureAuthenticated();

    let targetVersion = version;
    if (targetVersion === undefined) {
      const liveRecord = await this.fetchById<Record<string, any>>(model, id);
      if (!liveRecord) {
        return { status: 0, data: [] };
      }
      targetVersion = liveRecord.version ?? liveRecord.$version ?? 0;
    }

    const endpoint = `/ws/rest/${model}/removeAll`;
    const payload = {
      records: [
        {
          id,
          version: targetVersion,
        },
      ],
    };

    const response = await this.http.post<AxelorResponse<unknown>>(endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.status !== 0) {
      const rawData: any = response.data.data || response.data;
      const errorMsg = rawData?.message || response.data.message || response.data.error || `Failed to delete record ${id} in ${model}`;
      const causeStr = rawData?.causeString || "";
      const title = rawData?.title || response.data.error;

      // Extract referenced table if PostgreSQL foreign key violation
      let targetTable: string | undefined;
      const tableMatch = causeStr.match(/table\s+"([^"]+)"/i) || causeStr.match(/table\s+\\"([^\\"]+)\\"/i);
      if (tableMatch && tableMatch[1]) {
        targetTable = tableMatch[1];
      }

      const details: AxelorErrorDetails = {
        title,
        message: errorMsg,
        causeString: causeStr,
        targetTable,
      };

      throw new AxelorApiError(response.data.status, errorMsg, details);
    }

    return response.data;
  }

  async executeAction(
    action: string,
    model?: string,
    context?: Record<string, unknown>
  ): Promise<AxelorActionResponse> {
    await this.ensureAuthenticated();

    const endpoint = `/ws/action`;
    const payload = {
      action,
      model,
      data: {
        context: context ?? {},
      },
    };

    const response = await this.http.post<AxelorActionResponse>(endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }
}
