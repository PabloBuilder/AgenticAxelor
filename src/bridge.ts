import dotenv from "dotenv";
import { BridgeServer, validateSessionInput } from "./services/bridgeServer.js";
import { SessionStore } from "./services/sessionStore.js";

dotenv.config();

const configuredPort = Number.parseInt(process.env.BRIDGE_PORT || "3210", 10);
if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
  throw new Error("BRIDGE_PORT must be an integer between 1 and 65535.");
}

const bridgeServer = new BridgeServer((session) => {
  SessionStore.saveSession(validateSessionInput(session));
}, configuredPort);

bridgeServer.start().then(() => {
  console.log(`AgenticAxelor Bridge listening on http://127.0.0.1:${configuredPort}`);
}).catch((error: unknown) => {
  console.error("Failed to start AgenticAxelor Bridge:", error);
  process.exitCode = 1;
});

process.on("SIGINT", () => bridgeServer.stop());
process.on("SIGTERM", () => bridgeServer.stop());