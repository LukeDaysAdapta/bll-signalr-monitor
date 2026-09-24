import test from "node:test";
import assert from "node:assert/strict";
import { describeHubConfig, extractHubQuery, signalrEventFromFrame } from "../src/page-config.js";

test("extractHubQuery reads Pid and Uid from the page configuration", () => {
  const query = extractHubQuery(`<script>$.connection.hub.qs = "Pid=processo&amp;Uid=usuario";</script>`);
  assert.deepEqual(query, { processId: "processo", userId: "usuario" });
});

test("signalrEventFromFrame retains only batchScreenHub events", () => {
  const events = signalrEventFromFrame({ M: [
    { H: "batchScreenHub", M: "newProcessMsg", A: [] },
    { H: "otherHub", M: "ignore", A: [] }
  ] });
  assert.deepEqual(events, [{ hub: "batchScreenHub", name: "newProcessMsg", args: [] }]);
});

test("describeHubConfig does not expose hub parameter values", () => {
  const diagnostics = describeHubConfig(`<title>Login</title><script>$.connection.hub.qs = "Pid=segredo-processo";</script>`);
  assert.deepEqual(diagnostics, {
    title: "Login",
    hubQueryFound: true,
    hubQueryFields: ["Pid"],
    batchScreenHubFound: false
  });
});

test("describeHubConfig reports absent hub configuration without throwing", () => {
  assert.deepEqual(describeHubConfig(`<title>Entrar</title>`), {
    title: "Entrar",
    hubQueryFound: false,
    hubQueryFields: [],
    batchScreenHubFound: false
  });
});
