import WebSocket from "ws";
import { EventEmitter } from "node:events";
import { signalrEventFromFrame } from "./page-config.js";

const HUB_NAME = "batchscreenhub";

function requestQuery(connectionData, hubQuery, extra = {}) {
  return new URLSearchParams({
    clientProtocol: "1.5",
    connectionData,
    Pid: hubQuery.processId,
    Uid: hubQuery.userId,
    ...extra
  });
}

export class SignalRBatchClient extends EventEmitter {
  constructor({ baseUrl, cookie, hubQuery, fetchImpl = fetch, webSocketFactory = (url, options) => new WebSocket(url, options) }) {
    super();
    this.baseUrl = baseUrl;
    this.cookie = cookie;
    this.hubQuery = hubQuery;
    this.fetchImpl = fetchImpl;
    this.webSocketFactory = webSocketFactory;
    this.socket = undefined;
  }

  headers() {
    return { Cookie: this.cookie, Origin: this.baseUrl, "User-Agent": "BLL SignalR monitor/0.1" };
  }

  async connect() {
    const connectionData = JSON.stringify([{ name: HUB_NAME }]);
    const negotiateQuery = requestQuery(connectionData, this.hubQuery);
    const negotiate = await this.fetchImpl(`${this.baseUrl}/signalr/negotiate?${negotiateQuery}`, {
      method: "GET",
      headers: this.headers()
    });
    if (!negotiate.ok) throw new Error(`SignalR negotiate falhou: HTTP ${negotiate.status}.`);
    const details = await negotiate.json();
    if (!details.ConnectionToken || details.TryWebSockets === false) {
      throw new Error("A BLL não liberou WebSocket para esta sessão.");
    }

    const socketQuery = requestQuery(connectionData, this.hubQuery, {
      transport: "webSockets",
      connectionToken: details.ConnectionToken,
      tid: String(Math.floor(Math.random() * 11))
    });
    const websocketUrl = `${this.baseUrl.replace(/^https/, "wss")}/signalr/connect?${socketQuery}`;
    this.socket = this.webSocketFactory(websocketUrl, { headers: this.headers() });
    this.socket.on("message", (body) => this.handleFrame(body.toString()));
    this.socket.on("error", (error) => this.emit("error", error));
    this.socket.on("close", (code) => this.emit("disconnected", { code }));
    await new Promise((resolve, reject) => {
      this.socket.once("open", resolve);
      this.socket.once("error", reject);
    });

    const startQuery = requestQuery(connectionData, this.hubQuery, {
      transport: "webSockets",
      connectionToken: details.ConnectionToken
    });
    const start = await this.fetchImpl(`${this.baseUrl}/signalr/start?${startQuery}`, { headers: this.headers() });
    if (!start.ok) throw new Error(`SignalR start falhou: HTTP ${start.status}.`);
    this.emit("connected");
  }

  handleFrame(raw) {
    let frame;
    try {
      frame = JSON.parse(raw);
    } catch {
      return;
    }
    for (const event of signalrEventFromFrame(frame)) this.emit("event", event);
  }

  close() {
    this.socket?.close();
  }
}
