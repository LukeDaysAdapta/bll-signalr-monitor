import { EventStore } from "./event-store.js";

const storageDir = process.env.STORAGE_DIR || "./storage";
const store = new EventStore(storageDir);
await store.open();
const event = {
  simulated: true,
  processId: "local-self-test",
  name: "newProcessMsg",
  args: [],
  at: new Date().toISOString()
};

await store.record(event);
console.log(`synthetic-event recorded at ${event.at}`);
