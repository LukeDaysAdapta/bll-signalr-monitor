import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, loadProcessUrls } from "./config.js";
import { EventStore } from "./event-store.js";
import { superviseProcess } from "./monitor.js";

const config = loadConfig();
const processes = await loadProcessUrls(config);
const store = new EventStore(config.storageDir);
await store.open();
await mkdir(config.storageDir, { recursive: true, mode: 0o700 });
await writeFile(join(config.storageDir, "monitor.json"), JSON.stringify({
  processCount: processes.length,
  processUrls: processes.map((process) => process.processUrl),
  startedAt: new Date().toISOString()
}, null, 2), { mode: 0o600 });

let stopping = false;
const activeClients = new Set();
process.on("SIGINT", () => {
  stopping = true;
  for (const client of activeClients) client.close();
});
console.log("starting", processes.length, "processes");
await Promise.all(processes.map((process) => superviseProcess({
  process,
  cookie: config.cookie,
  store,
  activeClients,
  isStopping: () => stopping
})));
