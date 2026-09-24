import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventStore } from "../src/event-store.js";

test("records repeated SignalR events that have no payload", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bll-monitor-test-"));
  try {
    const store = new EventStore(directory);
    await store.open();
    const event = { processId: "processo", name: "newProcessMsg", args: [], at: "2026-09-09T00:00:00.000Z" };
    assert.equal(await store.record(event), true);
    assert.equal(await store.record({ ...event, at: "2026-09-09T00:01:00.000Z" }), true);
    const lines = (await readFile(join(directory, "events.jsonl"), "utf8")).trim().split("\n");
    assert.equal(lines.length, 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("serializes simultaneous writes from multiple monitored processes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bll-monitor-test-"));
  try {
    const store = new EventStore(directory);
    await store.open();
    await Promise.all(Array.from({ length: 10 }, (_, index) => store.record({
      processId: `processo-${index}`,
      name: "newProcessMsg",
      args: [],
      at: new Date(1_000 * index).toISOString()
    })));
    const lines = (await readFile(join(directory, "events.jsonl"), "utf8")).trim().split("\n");
    assert.equal(lines.length, 10);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
