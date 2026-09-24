import { describeHubConfig, extractHubQuery } from "./page-config.js";
import { SignalRBatchClient } from "./signalr-v2.js";

const MESSAGE_EVENTS = new Set(["newProcessMsg", "newBatchMsg"]);

export async function createBatchClient(process, cookie, fetchImpl = fetch) {
  const response = await fetchImpl(process.processUrl, {
    headers: { Cookie: cookie, "User-Agent": "BLL SignalR monitor/0.1" }
  });
  if (!response.ok) throw new Error(`Não foi possível abrir o processo: HTTP ${response.status}.`);
  const pageHtml = await response.text();
  let hubQuery;
  try {
    hubQuery = extractHubQuery(pageHtml);
  } catch (error) {
    const diagnostics = describeHubConfig(pageHtml);
    throw new Error(`${error.message} Diagnóstico seguro: URL final=${response.url}; título=${diagnostics.title}; configuração encontrada=${diagnostics.hubQueryFound}; campos=${diagnostics.hubQueryFields.join(", ") || "nenhum"}; batchScreenHub=${diagnostics.batchScreenHubFound}.`);
  }
  return new SignalRBatchClient({ baseUrl: process.baseUrl, cookie, hubQuery });
}

export async function superviseProcess({ process, cookie, store, activeClients, isStopping, log = console }) {
  let attempt = 0;
  while (!isStopping()) {
    let client;
    try {
      client = await createBatchClient(process, cookie);
      activeClients.add(client);
      const ended = new Promise((resolve) => {
        client.once("disconnected", resolve);
        client.once("error", (error) => {
          log.error("signalr-error", process.processId, error.message);
          client.close();
          resolve({ code: "error" });
        });
      });
      client.on("event", async (event) => {
        if (!MESSAGE_EVENTS.has(event.name)) return;
        const record = { ...event, processId: process.processId, processUrl: process.processUrl, at: new Date().toISOString() };
        if (await store.record(record)) log.log("new-message", process.processId, record.name, record.at);
      });
      await client.connect();
      attempt = 0;
      log.log("connected", process.processId);
      await ended;
    } catch (error) {
      log.error("connection-failed", process.processId, error.message);
    } finally {
      if (client) {
        activeClients.delete(client);
        client.close();
      }
    }
    if (!isStopping()) {
      const delay = Math.min(30_000, 1_000 * 2 ** Math.min(attempt++, 5));
      log.error("reconnecting", process.processId, `in ${delay / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
