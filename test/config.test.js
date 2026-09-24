import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig, loadProcessUrls } from "../src/config.js";

const processUrl = "https://bllcompras.com/BatchList?param1=processo&param2=7";

test("requires a runtime cookie instead of reading a credential file", () => {
  assert.throws(() => loadConfig({ PROCESS_URL: processUrl }), /BLL_COOKIE/);
});

test("accepts the single-process BLL URL and runtime credential", async () => {
  const config = loadConfig({ PROCESS_URL: processUrl, BLL_COOKIE: "session=example" });
  assert.equal(config.storageDir, "./storage");
  assert.deepEqual(await loadProcessUrls(config), [{
    baseUrl: "https://bllcompras.com",
    processUrl,
    processId: "processo"
  }]);
});

test("loads a deduplicated list of process URLs from a local file", async () => {
  const config = loadConfig({ PROCESS_URLS_FILE: "processes.txt", BLL_COOKIE: "session=example", MAX_PROCESSES: "3" });
  const processes = await loadProcessUrls(config, async () => `# comentário\n${processUrl}\n${processUrl}\nhttps://bllcompras.com/BatchList?param1=outro&param2=7\n`);
  assert.equal(processes.length, 2);
  assert.deepEqual(processes.map((process) => process.processId), ["processo", "outro"]);
});

test("rejects a process list larger than its explicit connection limit", async () => {
  const config = loadConfig({ PROCESS_URLS_FILE: "processes.txt", BLL_COOKIE: "session=example", MAX_PROCESSES: "1" });
  await assert.rejects(() => loadProcessUrls(config, async () => `${processUrl}\nhttps://bllcompras.com/BatchList?param1=outro&param2=7`), /acima de MAX_PROCESSES/);
});
