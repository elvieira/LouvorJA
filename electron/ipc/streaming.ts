import { ipcMain, BrowserWindow } from "electron";
import { streamingServer, StreamingSlideData, StreamingServerConfig } from "../services/streaming-server";

export function registerStreamingIpcHandlers() {
  // Configura o handler de ações vindas das requisições HTTP da API (controle remoto, bitfocus companion, etc.)
  streamingServer.setActionHandler(async (action: string, params: Record<string, string>) => {
    const mainWindow = BrowserWindow.getAllWindows().find((w) => w.id === 1) || BrowserWindow.getAllWindows()[0];
    if (!mainWindow || mainWindow.isDestroyed()) {
      return { status: "error", message: "Aplicação principal indisponível" };
    }

    if (action === "song-slides") {
      mainWindow.webContents.send("streaming-remote-action", { action: "song-slides", params });
      return { status: "ok", action: params.action || "slide" };
    }

    if (action === "keyboard") {
      mainWindow.webContents.send("streaming-remote-action", { action: "keyboard", params });
      return { status: "ok", key: params.key };
    }

    if (action === "open-song") {
      mainWindow.webContents.send("streaming-remote-action", { action: "open-song", params });
      return { status: "ok", action: "open-song", id: params.id };
    }

    if (action === "search-songs") {
      // Solicita busca para a janela principal via canal bidirecional síncrono/assíncrono ou envia o evento
      mainWindow.webContents.send("streaming-remote-action", { action: "search-songs", params });
      return { status: "ok", message: "Buscando..." };
    }

    return { status: "ok" };
  });

  ipcMain.handle("streaming-get-status", () => {
    return streamingServer.getStatus();
  });

  ipcMain.handle("streaming-get-interfaces", () => {
    return streamingServer.getNetworkInterfaces();
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
