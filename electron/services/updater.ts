import { ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

export function setupUpdater() {
  const mainWin = BrowserWindow.getAllWindows()[0];
  if (!mainWin) return;

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);
    mainWin.webContents.send("update-available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("No update available. Current version is up-to-date.");
    mainWin.webContents.send("update-not-available", {
      version: info.version,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWin.webContents.send("update-download-progress", {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info.version);
    mainWin.webContents.send("update-downloaded", {
      version: info.version,
    });
  });

  autoUpdater.on("error", (error) => {
    console.error("Auto-updater error:", error.message);
    mainWin.webContents.send("update-error", {
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
      return null;
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
