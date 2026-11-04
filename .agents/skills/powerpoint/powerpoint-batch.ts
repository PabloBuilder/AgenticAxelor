#!/usr/bin/env bun
/**
 * Batch runner for powerpoint-cli.
 *
 * Keeps a single MCP server session alive across multiple commands,
 * so stateful workflows (create → add slides → save) work correctly.
 *
 * NOTE: The upstream MCP server has a bug where create_presentation doesn't
 * set the current presentation ID. This runner works around it by
 * auto-injecting presentation_id into subsequent commands when a
 * create/open command returns one.
 *
 * Usage:
 *   echo '<json>' | bun powerpoint-batch.ts
 *   bun powerpoint-batch.ts recipe.json
 *   bun powerpoint-batch.ts --recipe '<json>'
 *
 * Input format:
 *   { "commands": [ { "tool": "create_presentation", "args": {} }, ... ] }
 *
 * Output: JSON array of results, one per command.
 */

import { createRuntime } from "mcporter";

interface Command {
  tool: string;
  args?: Record<string, unknown>;
}

interface Recipe {
  commands: Command[];
}

const embeddedServer = {
  name: "powerpoint",
  command: {
    kind: "stdio" as const,
    command: "uvx",
    args: ["--from", "office-powerpoint-mcp-server", "ppt_mcp_server"],
  },
  source: { kind: "local" as const, path: "<adhoc>" },
  description: "ppt-mcp-server",
};

function normalizeServer(server: typeof embeddedServer) {
  return {
    ...server,
    command: {
      ...(server.command as Record<string, unknown>),
      args: [...server.command.args],
    },
  };
}

async function readInput(): Promise<string> {
  const args = process.argv.slice(2);

  // --recipe '<json>' flag
  const recipeIdx = args.indexOf("--recipe");
  if (recipeIdx !== -1 && args[recipeIdx + 1]) {
    return args[recipeIdx + 1];
  }

  // File argument
  if (args.length > 0 && !args[0].startsWith("-")) {
    const file = Bun.file(args[0]);
    return await file.text();
  }

  // Stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// Normalise tool name to snake_case for MCP call
function toSnakeCase(name: string): string {
  return name.replace(/-/g, "_");
}

async function main() {
  const input = await readInput();
  let recipe: Recipe;

  try {
    recipe = JSON.parse(input.trim());
  } catch {
    console.error(
      'Error: Invalid JSON input\nExpected: { "commands": [ { "tool": "create_presentation", "args": {} }, ... ] }'
    );
    process.exit(1);
  }

  if (!recipe.commands || !Array.isArray(recipe.commands)) {
    console.error('Error: Input must have a "commands" array');
    process.exit(1);
  }

  const runtime = await createRuntime({
    servers: [normalizeServer(embeddedServer)],
  });

  const ctx = await runtime.connect("powerpoint");
  const client = ctx.client;
  const results: unknown[] = [];

  // Track current presentation_id to auto-inject (works around upstream bug)
  let currentPresentationId: string | null = null;

  try {
    for (const cmd of recipe.commands) {
      const toolName = toSnakeCase(cmd.tool);
      const args: Record<string, unknown> = { ...(cmd.args || {}) };

      // Auto-inject presentation_id if we have one and the command doesn't specify it
      if (
        currentPresentationId &&
        args.presentation_id === undefined &&
        toolName !== "create_presentation" &&
        toolName !== "create_presentation_from_template" &&
        toolName !== "open_presentation" &&
        toolName !== "list_presentations" &&
        toolName !== "list_slide_templates" &&
        toolName !== "get_template_info" &&
        toolName !== "get_server_info"
      ) {
        args.presentation_id = currentPresentationId;
      }

      try {
        const result = await client.callTool({
          name: toolName,
          arguments: args,
        });

        // Parse the text content
        let output: unknown;
        const textContent = result.content?.find(
          (c: any) => c.type === "text"
        );
        if (textContent) {
          try {
            output = JSON.parse((textContent as any).text);
          } catch {
            output = (textContent as any).text;
          }
        } else {
          output = result.content;
        }

        // Track presentation_id from create/open commands
        if (
          output &&
          typeof output === "object" &&
          "presentation_id" in (output as any)
        ) {
          currentPresentationId = (output as any).presentation_id;
        }

        results.push({ tool: cmd.tool, result: output });
      } catch (err: any) {
        results.push({
          tool: cmd.tool,
          error: err.message || String(err),
        });
      }
    }
  } finally {
    await runtime.close("powerpoint").catch(() => {});
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
