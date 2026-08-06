import { ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

export function setupUpdater() {
  const notifyWindows = (channel: string, data: unknown) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    });
  };

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);
    notifyWindows("update-available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("No update available. Current version is up-to-date.");
    notifyWindows("update-not-available", {
      version: info.version,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    notifyWindows("update-download-progress", {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info.version);
    notifyWindows("update-downloaded", {
      version: info.version,
    });
  });

  autoUpdater.on("error", (error) => {
    console.error("Auto-updater error:", error.message);
    notifyWindows("update-error", {
      message: error.message,
    });
  });

  // Verifica atualizações 5 segundos após iniciar
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err: Error) => {
      console.log("Check for updates failed:", err.message);
    });
  }, 5000);
}

export function registerUpdaterHandlers() {
  ipcMain.handle("check-for-updates", async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return result;
    } catch (error: unknown) {
      console.error("Check for updates error:", (error as Error).message);
      throw error;
    }
  });

  ipcMain.handle("download-update", async () => {
    try {
      await autoUpdater.downloadUpdate();
      return true;
    } catch (error: unknown) {
      console.error("Download update error:", (error as Error).message);
      return false;
    }
  });

  ipcMain.handle("quit-and-install", () => {
    (global as unknown as Record<string, boolean>).isQuitting = true;
    autoUpdater.quitAndInstall(true, true);
  });
}
