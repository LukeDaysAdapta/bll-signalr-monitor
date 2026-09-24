import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { SignalRBatchClient } from "../src/signalr-v2.js";

test("uses GET for the legacy SignalR negotiate request", async () => {
  const requests = [];
  const socket = new EventEmitter();
  socket.close = () => {};
  const client = new SignalRBatchClient({
    baseUrl: "https://bllcompras.com",
    cookie: "session=example",
    hubQuery: { processId: "process", userId: "user" },
    fetchImpl: async (url, options = {}) => {
      requests.push({ url, options });
      if (url.includes("/negotiate")) return { ok: true, json: async () => ({ ConnectionToken: "token", TryWebSockets: true }) };
      return { ok: true };
    },
    webSocketFactory: () => {
      queueMicrotask(() => socket.emit("open"));
      return socket;
    }
  });

  await client.connect();
  assert.equal(requests[0].options.method, "GET");
  client.close();
});
