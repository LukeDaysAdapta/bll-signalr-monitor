import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export class EventStore {
  constructor(storageDir) {
    this.statePath = join(storageDir, "state.json");
    this.eventsPath = join(storageDir, "events.jsonl");
    this.state = { seen: {} };
    this.writeQueue = Promise.resolve();
  }

  async open() {
    await mkdir(dirname(this.statePath), { recursive: true, mode: 0o700 });
    try {
      this.state = JSON.parse(await readFile(this.statePath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  async record(event) {
    const operation = this.writeQueue.then(() => this.recordOne(event));
    this.writeQueue = operation.catch(() => undefined);
    return operation;
  }

  async recordOne(event) {
    // newProcessMsg is a notification-only callback and its SignalR frame has A: [].
    // Without an event id or payload, suppressing a repeated frame would suppress a
    // legitimate later message, so only payload-bearing events are deduplicated.
    const key = Array.isArray(event.args) && event.args.length > 0
      ? `${event.processId}:${event.name}:${JSON.stringify(event.args)}`
      : undefined;
    if (key && this.state.seen[key]) return false;

    if (key) this.state.seen[key] = event.at;
    await appendFile(this.eventsPath, `${JSON.stringify(event)}\n`, { mode: 0o600 });
    const temporary = `${this.statePath}.tmp`;
    await writeFile(temporary, JSON.stringify(this.state, null, 2), { mode: 0o600 });
    await rename(temporary, this.statePath);
    return true;
  }
}
