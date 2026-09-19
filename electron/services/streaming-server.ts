import * as http from "http";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";

export interface StreamingSlideData {
  type: "media" | "bible" | "idle";
  title?: string;
  subtitle?: string;
  author?: string;
  slideIndex?: number;
  totalSlides?: number;
  isCover?: boolean;
  currentLyric?: string;
  auxLyric?: string;
  nextLyric?: string;
  bibleText?: string;
  bibleReference?: string;
  bibleVersion?: string;
  updatedAt: number;
}

export interface NetworkInterfaceInfo {
  name: string;
  ip: string;
  isLocal: boolean;
}

export interface StreamingServerConfig {
  port: number;
  host: string;
  token?: string;
  autoStart?: boolean;
}

export interface StreamingServerStatus {
  running: boolean;
  port: number;
  host: string;
  token: string;
  urls: {
    overlay: string;
    overlayFullscreen: string;
    stage: string;
    remote: string;
    music: string;
    bible: string;
  };
}

export type ActionHandler = (action: string, params: Record<string, string>) => Promise<unknown> | unknown;

class StreamingServerService {
  private server: http.Server | null = null;
  private sseClients: Set<http.ServerResponse> = new Set();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private currentConfig: StreamingServerConfig = {
    port: 7070,
    host: "0.0.0.0",
    token: "",
  };

  private currentData: StreamingSlideData = {
    type: "idle",
    updatedAt: Date.now(),
  };

  private actionHandler: ActionHandler | null = null;

  public setActionHandler(handler: ActionHandler) {
    this.actionHandler = handler;
  }

  public getNetworkInterfaces(): NetworkInterfaceInfo[] {
    const interfaces = os.networkInterfaces();
    const result: NetworkInterfaceInfo[] = [
      { name: "Localhost (Apenas este computador)", ip: "127.0.0.1", isLocal: true },
    ];

    for (const [name, netList] of Object.entries(interfaces)) {
      if (!netList) continue;
      for (const net of netList) {
        if (net.family === "IPv4" && !net.internal) {
          result.push({
            name: `${name} (${net.address})`,
            ip: net.address,
            isLocal: false,
          });
        }
      }
    }
    return result;
  }

  public getPrimaryIp(): string {
    const ifaces = this.getNetworkInterfaces();
    const external = ifaces.find((i) => !i.isLocal);
    return external ? external.ip : "127.0.0.1";
  }

  public getStatus(): StreamingServerStatus {
    const ip = this.currentConfig.host === "0.0.0.0" ? this.getPrimaryIp() : this.currentConfig.host;
    const port = this.currentConfig.port;
    const baseUrl = `http://${ip}:${port}`;
    const tokenParam = this.currentConfig.token ? `?token=${encodeURIComponent(this.currentConfig.token)}` : "";

    return {
      running: this.isRunning,
      port: this.currentConfig.port,
      host: this.currentConfig.host,
      token: this.currentConfig.token || "",
      urls: {
        overlay: `${baseUrl}/overlay`,
        overlayFullscreen: `${baseUrl}/overlay?mode=fullscreen`,
        stage: `${baseUrl}/stage${tokenParam}`,
        remote: `${baseUrl}/remote${tokenParam}`,
        music: `${baseUrl}/musica`,
        bible: `${baseUrl}/biblia`,
      },
    };
  }

  public updateSlideData(data: Partial<StreamingSlideData>) {
    this.currentData = {
      ...this.currentData,
      ...data,
      updatedAt: Date.now(),
    };
    this.broadcastState();
  }

  public clearSlideData() {
    this.currentData = {
      type: "idle",
      title: "",
      subtitle: "",
      author: "",
      currentLyric: "",
      auxLyric: "",
      nextLyric: "",
      bibleText: "",
      bibleReference: "",
      bibleVersion: "",
      slideIndex: 0,
      totalSlides: 0,
      isCover: false,
      updatedAt: Date.now(),
    };
    this.broadcastState();
  }

  private broadcastState() {
    const payload = `event: state\ndata: ${JSON.stringify(this.currentData)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  public start(config: Partial<StreamingServerConfig> = {}): Promise<StreamingServerStatus> {
    return new Promise((resolve, reject) => {
      if (this.isRunning && this.server) {
        return resolve(this.getStatus());
      }

      this.currentConfig = {
        port: config.port && config.port > 0 ? config.port : 7070,
        host: config.host || "0.0.0.0",
        token: config.token || "",
      };

      this.server = http.createServer((req, res) => this.handleHttpRequest(req, res));

      this.server.on("error", (error: unknown) => {
        console.error("[StreamingServer] Server error:", error);
        this.isRunning = false;
        reject(error);
      });

      this.server.listen(this.currentConfig.port, this.currentConfig.host, () => {
        this.isRunning = true;
        console.log(`[StreamingServer] Servidor rodando em http://${this.currentConfig.host}:${this.currentConfig.port}`);

        // Timer de heartbeat para SSE a cada 15 segundos
        this.heartbeatTimer = setInterval(() => {
          for (const client of this.sseClients) {
            try {
              client.write(": heartbeat\n\n");
            } catch {
              this.sseClients.delete(client);
            }
          }
        }, 15000);

        resolve(this.getStatus());
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      for (const client of this.sseClients) {
        try {
          client.end();
        } catch {
          // Ignora erro ao fechar conexão
        }
      }
      this.sseClients.clear();

      if (this.server && this.isRunning) {
        this.server.close(() => {
          this.isRunning = false;
          this.server = null;
          console.log("[StreamingServer] Servidor finalizado com sucesso.");
          resolve();
        });
      } else {
        this.isRunning = false;
        this.server = null;
        resolve();
      }
    });
  }

  private setCorsHeaders(res: http.ServerResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, api-token, Authorization");
  }

  private getStaticBaseDir(): string {
    // Procura na pasta public/server (em desenvolvimento) ou dist/server (em produção empacotada)
    const possiblePaths = [
      path.join(process.cwd(), "public", "server"),
      path.join(__dirname, "../public/server"),
      path.join(__dirname, "../dist/server"),
      path.join(app.getAppPath(), "public", "server"),
      path.join(app.getAppPath(), "dist", "server"),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return possiblePaths[0];
  }

  private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    this.setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname.replace(/\/+$/, "") || "/";
    const isLocalRequest = req.socket.remoteAddress === "127.0.0.1" || req.socket.remoteAddress === "::1" || req.socket.remoteAddress === "::ffff:127.0.0.1";

    // 1. Validação de token em endpoints protegidos (se configurado token e acesso for remoto)
    const tokenRequired = this.currentConfig.token && this.currentConfig.token.trim() !== "";
    const clientToken = parsedUrl.searchParams.get("token") || req.headers["api-token"];

    // 2. Stream de Server-Sent Events (SSE)
    if (pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      res.write(`event: state\ndata: ${JSON.stringify(this.currentData)}\n\n`);
      this.sseClients.add(res);

      req.on("close", () => {
        this.sseClients.delete(res);
      });
      return;
    }

    // 3. Health check
    if (pathname === "/api/ping") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ status: "ok", app: "LouvorJA", running: this.isRunning }));
      return;
    }

    // 4. Status completo
    if (pathname === "/api/status") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ status: "ok", data: this.currentData }));
      return;
    }

    // 5. Relógio
    if (pathname === "/api/clock") {
      const now = new Date();
      const hour = now.toLocaleTimeString("pt-BR", { hour12: false });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ status: "ok", hour }));
      return;
    }

    // 6. Compatibilidade Legada: /file/file.ja (Arquivo INI)
    if (pathname === "/file/file.ja") {
      let iniContent = "";
      if (this.currentData.type === "media") {
        const letra = (this.currentData.currentLyric || "").replace(/\r?\n/g, "|");
        const prox = (this.currentData.nextLyric || "").replace(/\r?\n/g, "|");
        const classe = this.currentData.isCover ? "capa" : "letra";
        iniContent = `[MUSICA]\nletra=${letra}\nclass=${classe}\nletra_prox=${prox}\n`;
      } else if (this.currentData.type === "bible") {
        const texto = (this.currentData.bibleText || "").replace(/\r?\n/g, "|");
        const info = (this.currentData.bibleReference || "").replace(/\r?\n/g, "|");
        iniContent = `[BIBLIA]\ntexto=${texto}\ninfo=${info}\n`;
      }
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(iniContent);
      return;
    }

    // Validação de segurança para endpoints de controle /api/
    if (pathname.startsWith("/api/")) {
      if (!isLocalRequest && tokenRequired && clientToken !== this.currentConfig.token) {
        res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ status: "error", message: "Token inválido", code: "INVALID_TOKEN" }));
        return;
      }
    }

    // 7. Endpoints de ação (navegação de slides, controle, busca)
    if (pathname === "/api/song-slides") {
      const action = parsedUrl.searchParams.get("action") || "";
      const slide = parsedUrl.searchParams.get("slide") || "current";

      if (action === "get-slide") {
        const msg = slide === "next" ? this.currentData.nextLyric || "" : this.currentData.currentLyric || "";
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ status: "ok", message: msg, code: this.currentData.type !== "idle" ? "SONG_PLAYING" : "NO_SONG_PLAYING" }));
        return;
      }

      if (this.actionHandler) {
        const result = await this.actionHandler("song-slides", { action, slide });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result || { status: "ok", action }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ status: "ok", action }));
      }
      return;
    }

    if (pathname === "/api/keyboard") {
      const key = parsedUrl.searchParams.get("key") || "";
      if (this.actionHandler) {
        const result = await this.actionHandler("keyboard", { key });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result || { status: "ok", key }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ status: "ok", key }));
      }
      return;
    }

    if (pathname === "/api/search-songs") {
      const q = parsedUrl.searchParams.get("q") || "";
      if (this.actionHandler) {
        const result = await this.actionHandler("search-songs", { q });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result || { status: "ok", musicas: [] }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ status: "ok", musicas: [] }));
      }
      return;
    }

    if (pathname === "/api/open-song") {
      const id = parsedUrl.searchParams.get("id") || "";
      const tag = parsedUrl.searchParams.get("tag") || "1";
      if (this.actionHandler) {
        const result = await this.actionHandler("open-song", { id, tag });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result || { status: "ok", action: "open-song", id }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ status: "ok", action: "open-song", id }));
      }
      return;
    }

    // 8. Servir arquivos estáticos (páginas HTML, CSS, JS)
    this.serveStaticFile(pathname, res);
  }

  private serveStaticFile(reqPath: string, res: http.ServerResponse) {
    const baseDir = this.getStaticBaseDir();

    let targetFile = reqPath;
    if (targetFile === "/" || targetFile === "/remote") {
      targetFile = "/remote.html";
    } else if (targetFile === "/overlay" || targetFile === "/musica" || targetFile === "/biblia") {
      targetFile = "/overlay.html";
    } else if (targetFile === "/stage" || targetFile === "/retorno") {
      targetFile = "/stage.html";
    }

    const safeFilePath = path.normalize(path.join(baseDir, targetFile));

    if (!safeFilePath.startsWith(baseDir)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Acesso negado");
      return;
    }

    if (!fs.existsSync(safeFilePath) || fs.statSync(safeFilePath).isDirectory()) {
      // Se não encontrar o arquivo específico, tenta o fallback
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - Página não encontrada</h1><p>LouvorJA Streaming Server</p>");
      return;
    }

    const ext = path.extname(safeFilePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    const stream = fs.createReadStream(safeFilePath);
    stream.pipe(res);
  }
}

export const streamingServer = new StreamingServerService();
