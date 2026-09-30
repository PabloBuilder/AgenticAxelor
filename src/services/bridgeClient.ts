import { GuidanceRoute } from "../types/guidance.js";

export class BridgeClient {
  private baseUrl: string;

  constructor(port: number = 3210) {
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async pushRoute(route: GuidanceRoute): Promise<void> {
    await this.post("/api/guide/push", route);
  }

  async clearRoute(): Promise<void> {
    await this.post("/api/guide/clear", {});
  }

  private async post(path: string, payload: unknown): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(`AgenticAxelor Bridge is unavailable at ${this.baseUrl}. Start it with start-bridge.bat.`);
    }

    const result = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      throw new Error(result?.error || `Bridge request failed with HTTP ${response.status}.`);
    }
  }
}