import fs from "node:fs";
import axios from "axios";
import { SessionStore } from "../services/sessionStore.js";

function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        options[key] = next;
        i++;
      } else {
        options[key] = "true";
      }
    }
  }
  return options;
}

async function main() {
  const options = parseArgs();
  const model = options.model || options.m;
  if (!model) {
    console.error("Usage: npx tsx src/cli/query.ts --model <ModelName> [--domain <Domain>] [--fields <f1,f2>] [--limit <N>] [--format <table|json|csv>] [--output <file>]");
    process.exit(1);
  }

  const fullModel = model.includes(".") ? model : `com.axelor.apps.account.db.${model}`;
  const session = SessionStore.loadSession();
  if (!session?.url || !session?.cookie) {
    console.error("Erreur: Aucune session active synchronisée dans .session.json.");
    process.exit(1);
  }

  const api = axios.create({
    baseURL: session.url,
    headers: {
      "Cookie": session.cookie,
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  });

  const fields = options.fields ? options.fields.split(",").map(f => f.trim()) : undefined;
  const domain = options.domain || options.d || undefined;
  const limit = options.limit ? parseInt(options.limit, 10) : 50;
  const sortBy = options.sortBy ? options.sortBy.split(",").map(s => s.trim()) : undefined;
  const format = options.format || "json";

  const payload: any = { limit };
  if (domain) payload.data = { _domain: domain };
  if (fields) payload.fields = fields;
  if (sortBy) payload.sortBy = sortBy;

  try {
    const res = await api.post(`/ws/rest/${fullModel}/search`, payload);
    const data = res.data?.data || [];
    const total = res.data?.total || data.length;

    console.log(`[Axelor Query] Total: ${total} records (fetched ${data.length})`);

    if (options.output) {
      if (format === "csv") {
        if (data.length === 0) {
          fs.writeFileSync(options.output, "", "utf8");
        } else {
          const keys = Object.keys(data[0]);
          const lines = [keys.join(";")];
          for (const item of data) {
            lines.push(keys.map(k => {
              const v = item[k];
              return typeof v === "object" && v !== null ? `"${(v.fullName || v.name || v.id)}"` : `"${v ?? ""}"`;
            }).join(";"));
          }
          fs.writeFileSync(options.output, "\uFEFF" + lines.join("\n"), "utf8");
        }
      } else {
        fs.writeFileSync(options.output, JSON.stringify(data, null, 2), "utf8");
      }
      console.log(`Résultats exportés vers : ${options.output}`);
    } else {
      if (format === "table") {
        console.table(data);
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  } catch (err: any) {
    console.error("Erreur d'exécution Axelor REST :", err.response?.data || err.message);
    process.exit(1);
  }
}

main();
