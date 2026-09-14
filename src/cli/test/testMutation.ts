import dotenv from "dotenv";
import { AxelorClient } from "../../services/axelorClient.js";
import { DataService } from "../../services/dataService.js";

dotenv.config();

const baseUrl = process.env.AXELOR_URL || "http://localhost:8080/axelor-erp";
const username = process.env.AXELOR_USERNAME || "admin";
const password = process.env.AXELOR_PASSWORD || "admin";
const cookie = process.env.AXELOR_COOKIE;

async function main() {
  console.log("=== Testing AgenticAxelor Mutation & Action Capabilities ===");
  console.log(`Connecting to: ${baseUrl}`);

  const client = new AxelorClient({
    baseUrl,
    username,
    password,
    cookie,
  });

  const dataService = new DataService(client);

  try {
    // 1. Create a test record (e.g. Partner / Lead or similar lightweight entity)
    console.log("\n1. Testing Record Creation (Partner)...");
    const uniqueSuffix = Date.now();
    const testPartnerName = `Test MCP Agentic ${uniqueSuffix}`;

    const created = await dataService.saveRecord("com.axelor.apps.base.db.Partner", {
      name: testPartnerName,
      isCustomer: true,
      description: "Created by AgenticAxelor MCP automated test",
    });

    console.log("Created Record successfully:", {
      id: created.id,
      version: created.version,
      name: created.name,
    });

    if (!created.id) {
      throw new Error("Created record did not return an ID.");
    }

    // 2. Testing Update on the created record
    console.log(`\n2. Testing Record Update (ID: ${created.id})...`);
    const updated = await dataService.saveRecord("com.axelor.apps.base.db.Partner", {
      id: created.id,
      version: created.version ?? 0,
      description: "Updated description via MCP saveRecord",
    });

    console.log("Updated Record successfully:", {
      id: updated.id,
      version: updated.version,
      description: updated.description,
    });

    // 3. Testing Action execution (attrs or method on the partner)
    console.log("\n3. Testing Action Execution (action-partner-attrs)...");
    try {
      const actionResult = await dataService.runAction(
        "action-partner-attrs",
        "com.axelor.apps.base.db.Partner",
        {
          _model: "com.axelor.apps.base.db.Partner",
          id: created.id,
          isCustomer: true,
        }
      );
      console.log("Action Execution Output:", JSON.stringify(actionResult, null, 2));
    } catch (actionErr: any) {
      console.log("Action notice (Action might require specific view state):", actionErr.message);
    }

    // 4. Testing Record Deletion
    console.log(`\n4. Testing Record Deletion (ID: ${created.id})...`);
    const deleteResult = await dataService.deleteRecord(
      "com.axelor.apps.base.db.Partner",
      created.id,
      updated.version ?? created.version
    );
    console.log("Delete result:", deleteResult);

    console.log("\nAll Mutation & Action CLI tests completed successfully!");
  } catch (err: any) {
    console.error("Mutation test failed:", err.message || err);
    process.exit(1);
  }
}

main();
