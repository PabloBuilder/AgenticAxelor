import { AxelorClient } from "./axelorClient.js";
import { MetaMenuRecord } from "../types/axelor.js";

export interface MenuSearchResult {
  id: number;
  name: string;
  title: string;
  breadcrumb: string;
  action?: string;
  order?: number;
}

export class MenuService {
  private client: AxelorClient;
  private menuCache: Map<number, MetaMenuRecord> = new Map();

  constructor(client: AxelorClient) {
    this.client = client;
  }

  async searchMenu(keyword: string, limit: number = 20): Promise<MenuSearchResult[]> {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return [];
    }

    const domain = "self.name like :keyword or self.title like :keyword";
    const domainContext = { keyword: `%${trimmed}%` };

    const searchRes = await this.client.search<MetaMenuRecord>("com.axelor.meta.db.MetaMenu", {
      fields: ["id", "name", "title", "parent", "action", "order"],
      domain,
      domainContext,
      limit,
      sortBy: ["order", "name"],
    });

    const records = searchRes.data || [];
    for (const record of records) {
      this.menuCache.set(record.id, record);
    }

    const results: MenuSearchResult[] = [];
    for (const record of records) {
      const breadcrumb = await this.resolveBreadcrumb(record);
      results.push({
        id: record.id,
        name: record.name,
        title: record.title || record.name,
        breadcrumb,
        action: record.action,
        order: record.order,
      });
    }

    return results;
  }

  private async fetchMenuRecord(id: number): Promise<MetaMenuRecord | null> {
    if (this.menuCache.has(id)) {
      return this.menuCache.get(id)!;
    }

    const record = await this.client.fetchById<MetaMenuRecord>(
      "com.axelor.meta.db.MetaMenu",
      id,
      ["id", "name", "title", "parent", "action", "order"]
    );

    if (record) {
      this.menuCache.set(record.id, record);
    }
    return record;
  }

  async resolveBreadcrumb(menu: MetaMenuRecord | number): Promise<string> {
    const visited = new Set<number>();
    const chain: string[] = [];

    let current: MetaMenuRecord | null =
      typeof menu === "number" ? await this.fetchMenuRecord(menu) : menu;

    while (current) {
      if (visited.has(current.id)) {
        break;
      }
      visited.add(current.id);

      const label = current.title || current.name;
      chain.unshift(label);

      if (current.parent && current.parent.id) {
        current = await this.fetchMenuRecord(current.parent.id);
      } else {
        current = null;
      }
    }

    return chain.join(" > ");
  }
}
