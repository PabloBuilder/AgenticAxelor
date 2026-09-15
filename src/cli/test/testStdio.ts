import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
const serverPath = path.resolve(projectRoot, "dist/index.js");

console.log("=== Testing AgenticAxelor MCP Stdio Handshake ===");
console.log(`Server entrypoint: ${serverPath}`);

const child = spawn("node", [serverPath], {
  cwd: projectRoot,
  env: process.env,
  stdio: ["pipe", "pipe", "pipe"],
});

let stdoutBuffer = "";
let stderrBuffer = "";

child.stdout.setEncoding("utf8");
child.stdout.on("data", (data) => {
  stdoutBuffer += data;
  const lines = stdoutBuffer.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const message = JSON.parse(line);
      console.log("\n[STDOUT JSON-RPC Received]:", JSON.stringify(message, null, 2));

      if (message.id === 1 && message.result?.serverInfo) {
        console.log("\nInitialization SUCCESSFUL!");
        console.log(`Server: ${message.result.serverInfo.name} v${message.result.serverInfo.version}`);
        console.log(`Protocol Version: ${message.result.protocolVersion}`);

        const listToolsRequest = {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        };
        console.log("\n[STDIN Sending]: tools/list");
        child.stdin.write(JSON.stringify(listToolsRequest) + "\n");
      } else if (message.id === 2 && message.result?.tools) {
        console.log(`\nDiscovered ${message.result.tools.length} Tools:`);
        for (const tool of message.result.tools) {
          console.log(` - ${tool.name}: ${tool.description.split("\n")[0]}`);
        }
        console.log("\nAll stdio tests passed cleanly! Terminating subprocess...");
        child.kill("SIGTERM");
        process.exit(0);
      }
    } catch {
      // Line might not be complete or might be non-JSON output
    }
  }
  stdoutBuffer = lines[lines.length - 1];
});

child.stderr.setEncoding("utf8");
child.stderr.on("data", (data) => {
  stderrBuffer += data;
  process.stderr.write(`[STDERR LOG]: ${data}`);
});

child.on("error", (err) => {
  console.error("Child process error:", err);
  process.exit(1);
});

child.on("close", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Subprocess closed with code ${code}`);
    process.exit(code);
  }
});

// Send MCP initialize request
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-stdio-client",
      version: "1.0.0",
    },
  },
};

console.log("\n[STDIN Sending]: initialize");
child.stdin.write(JSON.stringify(initRequest) + "\n");
