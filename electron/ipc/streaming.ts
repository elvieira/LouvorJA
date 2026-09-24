import { ipcMain, BrowserWindow } from "electron";
import { streamingServer, StreamingSlideData, StreamingServerConfig } from "../services/streaming-server";
import { searchMusics } from "../services/database";

export function registerStreamingIpcHandlers() {
  // Configura o handler de ações vindas das requisições HTTP da API (controle remoto, bitfocus companion, etc.)
  streamingServer.setActionHandler(async (action: string, params: Record<string, string>) => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length === 0) {
      return { status: "error", message: "Aplicação principal indisponível" };
    }

    for (const win of allWindows) {
      if (!win.isDestroyed()) {
        win.webContents.send("streaming-remote-action", { action, params });
      }
    }

    if (action === "song-slides") {
      return { status: "ok", action: params.action || "slide" };
    }

    if (action === "keyboard") {
      return { status: "ok", key: params.key };
    }

    if (action === "close-media") {
      return { status: "ok", action: "close-media" };
    }

    if (action === "play-pause") {
      return { status: "ok", action: "play-pause" };
    }

    if (action === "volume") {
      return { status: "ok", action: params.action || "volume" };
    }

    if (action === "open-song") {
      return { status: "ok", action: "open-song", id: params.id };
    }

    if (action === "search-songs") {
      const results = await searchMusics(params.q || "");
      return { status: "ok", musicas: results, results };
    }

    return { status: "ok" };
  });

  ipcMain.handle("streaming-get-status", () => {
    return streamingServer.getStatus();
  });

  ipcMain.handle("streaming-get-interfaces", () => {
    return streamingServer.getNetworkInterfaces();
  });

  ipcMain.handle("streaming-set-config", (_event, config: Partial<StreamingServerConfig>) => {
    streamingServer.setConfig(config);
    return streamingServer.getStatus();
  });

  ipcMain.handle("streaming-start", async (_event, config: Partial<StreamingServerConfig>) => {
    try {
      return await streamingServer.start(config);
    } catch (error: unknown) {
      console.error("[StreamingIPC] Erro ao iniciar servidor:", error);
      throw error;
    }
  });

  ipcMain.handle("streaming-stop", async () => {
    try {
      await streamingServer.stop();
      return streamingServer.getStatus();
    } catch (error: unknown) {
      console.error("[StreamingIPC] Erro ao parar servidor:", error);
      throw error;
    }
  });

  ipcMain.handle("streaming-push-slide", (_event, data: Partial<StreamingSlideData>) => {
    streamingServer.updateSlideData(data);
    return true;
  });

  ipcMain.handle("streaming-clear-slide", () => {
    streamingServer.clearSlideData();
    return true;
  });
}
