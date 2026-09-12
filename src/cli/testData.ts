import dotenv from "dotenv";
import { AxelorClient } from "../services/axelorClient.js";
import { DataService } from "../services/dataService.js";

dotenv.config();

const baseUrl = process.env.AXELOR_URL || "http://localhost:8080/axelor-erp";
const username = process.env.AXELOR_USERNAME || "admin";
const password = process.env.AXELOR_PASSWORD || "admin";
const apiKey = process.env.AXELOR_API_KEY;
const cookie = process.env.AXELOR_COOKIE;

const model = process.argv[2] || "com.axelor.apps.base.db.Partner";
const limit = parseInt(process.argv[3] || "5", 10);

async function main() {
  console.log(`[TestData] Connecting to Axelor at ${baseUrl}...`);

  const client = new AxelorClient({
    baseUrl,
    username,
    password,
    apiKey,
    cookie,
  });

  const dataService = new DataService(client);

  console.log(`[TestData] Querying model: "${model}" (limit: ${limit})...\n`);

  try {
    const result = await dataService.queryData({
      model,
      limit,
    });

    console.log(`[TestData] Query completed. Total records reported: ${result.total}`);
    console.log(`[TestData] Retrieved ${result.records.length} record(s):\n`);

    result.records.forEach((record, index) => {
      const displayTitle = record.fullName || record.name || record.title || record.code || `Record #${record.id}`;
      console.log(`${index + 1}. [ID: ${record.id}] ${displayTitle}`);
      console.log(`   Data Keys: ${Object.keys(record).join(", ")}`);
      console.log(`   Sample:`, JSON.stringify(record, null, 2));
      console.log("");
    });

    if (result.records.length > 0) {
      const firstId = result.records[0].id;
      console.log(`[TestData] Testing single record fetch for ID: ${firstId}...`);
      const single = await dataService.fetchRecord(model, firstId);
      console.log(`[TestData] Single fetch success:`, single ? `Found (ID: ${single.id})` : "Not found");
    }
  } catch (error: any) {
    console.error(`[TestData] Error querying data:`, error.message || error);
    process.exit(1);
  }
}

main();
