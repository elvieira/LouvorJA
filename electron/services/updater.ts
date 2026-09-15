import { ipcMain, BrowserWindow } from "electron";
import { autoUpdater, UpdateCheckResult } from "electron-updater";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function parseSemver(v: string): number[] {
  const clean = v.replace(/^v/, "").split("-")[0];
  return clean.split(".").map((part) => parseInt(part, 10) || 0);
}

function isVersionGreater(v1: string, v2: string): boolean {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  return false;
}

const notifyWindows = (channel: string, data: unknown) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, data);
    }
  });
};

let isCheckingMultiRepo = false;
let checkPromise: Promise<UpdateCheckResult | null> | null = null;

export async function checkForUpdatesMultiRepo(): Promise<UpdateCheckResult | null> {
  if (checkPromise) {
    return checkPromise;
  }
  checkPromise = doCheckForUpdatesMultiRepo().finally(() => {
    checkPromise = null;
  });
  return checkPromise;
}

async function doCheckForUpdatesMultiRepo(): Promise<UpdateCheckResult | null> {
  isCheckingMultiRepo = true;
  let winningResult: UpdateCheckResult | null = null;
  let fluteResult: UpdateCheckResult | null = null;
  let fluteError: Error | null = null;
  let louvorResult: UpdateCheckResult | null = null;
  let louvorError: Error | null = null;

  try {
    // 1. Tenta o repositório da futura migração (louvorja/flute-app)
    try {
      console.log("[Updater] Verificando repositório de migração: louvorja/flute-app");
      autoUpdater.setFeedURL({ provider: "github", owner: "louvorja", repo: "flute-app" });
      fluteResult = await autoUpdater.checkForUpdates();
    } catch (err) {
      fluteError = err as Error;
      console.log("[Updater] Falha ao verificar louvorja/flute-app (pode não ter releases ainda):", fluteError.message);
    }

    // 2. Se o flute-app tiver atualização disponível:
    if (fluteResult && fluteResult.isUpdateAvailable) {
      // Verifica também o repositório legado (elvieira/LouvorJA) para garantir que pegamos a versão mais recente
      try {
        console.log("[Updater] Verificando repositório elvieira/LouvorJA para comparação");
        autoUpdater.setFeedURL({ provider: "github", owner: "elvieira", repo: "LouvorJA" });
        louvorResult = await autoUpdater.checkForUpdates();
      } catch (err) {
        louvorError = err as Error;
        console.log("[Updater] Falha ao verificar elvieira/LouvorJA para comparação:", louvorError.message);
      }

      if (
        louvorResult &&
        louvorResult.isUpdateAvailable &&
        isVersionGreater(louvorResult.updateInfo.version, fluteResult.updateInfo.version)
      ) {
        console.log(
          `[Updater] elvieira/LouvorJA possui versão superior (${louvorResult.updateInfo.version} > ${fluteResult.updateInfo.version})`,
        );
        winningResult = louvorResult;
      } else {
        // flute-app é prioritário (ou tem versão igual/superior)
        console.log(`[Updater] louvorja/flute-app selecionado com versão ${fluteResult.updateInfo.version}`);
        if (louvorResult) {
          // Re-aponta o feed para o flute-app para garantir que o downloadUpdate baixe dele
          autoUpdater.setFeedURL({ provider: "github", owner: "louvorja", repo: "flute-app" });
          winningResult = await autoUpdater.checkForUpdates();
        } else {
          winningResult = fluteResult;
        }
      }
    } else {
      // 3. Se flute-app não tem atualização (não lançado, erro 404 ou versão já atualizada), verifica elvieira/LouvorJA
      try {
        console.log("[Updater] Verificando repositório legado: elvieira/LouvorJA");
        autoUpdater.setFeedURL({ provider: "github", owner: "elvieira", repo: "LouvorJA" });
        louvorResult = await autoUpdater.checkForUpdates();
        winningResult = louvorResult;
      } catch (err) {
        louvorError = err as Error;
        console.log("[Updater] Falha ao verificar elvieira/LouvorJA:", louvorError.message);
      }
    }

    // Avalia o resultado final
    if (winningResult && winningResult.isUpdateAvailable) {
      console.log("[Updater] Atualização disponível encontrada:", winningResult.updateInfo.version);
      notifyWindows("update-available", {
        version: winningResult.updateInfo.version,
        releaseDate: winningResult.updateInfo.releaseDate,
        releaseNotes: winningResult.updateInfo.releaseNotes,
      });
      return winningResult;
    }

    // Se pelo menos um repositório respondeu com sucesso (mas sem nova versão disponível)
    if (louvorResult || fluteResult) {
      const versionInfo = (winningResult || louvorResult || fluteResult)?.updateInfo?.version || autoUpdater.currentVersion?.format() || "";
      console.log("[Updater] Nenhuma atualização disponível. Versão atual é a mais recente:", versionInfo);
      notifyWindows("update-not-available", {
        version: versionInfo,
      });
      return winningResult || louvorResult || fluteResult;
    }

    // Se ambos falharam com erro (ex: offline)
    if (fluteError && louvorError) {
      const finalError = louvorError || fluteError;
      console.error("[Updater] Todos os repositórios falharam ao verificar atualizações:", finalError.message);
      notifyWindows("update-error", {
        message: finalError.message,
      });
      throw finalError;
    }

    // Caso de dev mode (quando checkForUpdates retorna null porque app não está empacotado)
    console.log("[Updater] Modo de desenvolvimento ou nenhum resultado retornado.");
    return null;
  } finally {
    isCheckingMultiRepo = false;
  }
}

export function setupUpdater() {
  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);
    if (!isCheckingMultiRepo) {
      notifyWindows("update-available", {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("No update available. Current version is up-to-date.");
    if (!isCheckingMultiRepo) {
      notifyWindows("update-not-available", {
        version: info.version,
      });
    }
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
    if (!isCheckingMultiRepo) {
      notifyWindows("update-error", {
        message: error.message,
      });
    }
  });

  // Verifica atualizações 5 segundos após iniciar
  setTimeout(() => {
    checkForUpdatesMultiRepo().catch((err: Error) => {
      console.log("Check for updates failed:", err.message);
    });
  }, 5000);
}

export function registerUpdaterHandlers() {
  ipcMain.handle("check-for-updates", async () => {
    try {
      const result = await checkForUpdatesMultiRepo();
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
