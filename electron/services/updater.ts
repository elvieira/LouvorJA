import { ipcMain, BrowserWindow, app, net } from "electron";
import { autoUpdater, UpdateCheckResult } from "electron-updater";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.fullChangelog = true;

export interface AppReleaseInfo {
  version: string;
  publishedAt?: string;
  title?: string;
  notes: string;
}

function parseSemver(v: string): number[] {
  const clean = v.replace(/^v/, "").split("-")[0];
  return clean.split(".").map((part) => parseInt(part, 10) || 0);
}

export function compareSemver(v1: string, v2: string): number {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function isVersionGreater(v1: string, v2: string): boolean {
  return compareSemver(v1, v2) > 0;
}

export async function fetchReleasesFromGitHub(
  fromVersion?: string,
  toVersion?: string,
): Promise<AppReleaseInfo[]> {
  const repos = [
    { owner: "louvorja", repo: "flute-app" },
    { owner: "elvieira", repo: "LouvorJA" },
  ];

  const allReleasesMap = new Map<string, AppReleaseInfo>();

  for (const { owner, repo } of repos) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=30`;
      const res = await net.fetch(url, {
        headers: {
          "User-Agent": "LouvorJA-App",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!res.ok) {
        continue;
      }

      const list = (await res.json()) as Array<Record<string, unknown>>;
      if (!Array.isArray(list)) continue;

      for (const item of list) {
        if (item.draft) continue;
        const rawTag = String(item.tag_name || "").replace(/^v/, "").trim();
        if (!rawTag) continue;

        if (fromVersion && compareSemver(rawTag, fromVersion) <= 0) {
          continue;
        }

        if (toVersion && compareSemver(rawTag, toVersion) > 0) {
          continue;
        }

        if (!allReleasesMap.has(rawTag)) {
          allReleasesMap.set(rawTag, {
            version: rawTag,
            publishedAt: item.published_at ? String(item.published_at) : undefined,
            title: item.name ? String(item.name) : `v${rawTag}`,
            notes: item.body ? String(item.body) : "",
          });
        }
      }
    } catch (e) {
      console.warn(`[Updater] Não foi possível buscar releases de ${owner}/${repo}:`, (e as Error).message);
    }
  }

  return Array.from(allReleasesMap.values()).sort((a, b) => compareSemver(b.version, a.version));
}

async function buildReleasesList(
  currentVer: string,
  targetVer: string,
  rawReleaseNotes?: unknown,
  releaseDate?: string,
  releaseName?: string | null,
): Promise<AppReleaseInfo[]> {
  let releases = await fetchReleasesFromGitHub(currentVer, targetVer);
  if (releases.length === 0 && rawReleaseNotes) {
    if (Array.isArray(rawReleaseNotes)) {
      releases = rawReleaseNotes.map((item: Record<string, unknown>) => ({
        version: String(item.version || ""),
        publishedAt: releaseDate,
        title: `v${item.version}`,
        notes: (item.note as string) || "",
      }));
    } else if (typeof rawReleaseNotes === "string") {
      releases = [
        {
          version: targetVer,
          publishedAt: releaseDate,
          title: releaseName || `v${targetVer}`,
          notes: rawReleaseNotes,
        },
      ];
    }
  }
  return releases;
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
      const currentVer = app.getVersion();
      const targetVer = winningResult.updateInfo.version;
      const releases = await buildReleasesList(
        currentVer,
        targetVer,
        winningResult.updateInfo.releaseNotes,
        winningResult.updateInfo.releaseDate,
        winningResult.updateInfo.releaseName,
      );

      notifyWindows("update-available", {
        version: targetVer,
        currentVersion: currentVer,
        releaseDate: winningResult.updateInfo.releaseDate,
        releaseNotes: winningResult.updateInfo.releaseNotes,
        releases,
      });
      return winningResult;
    }

    // Se pelo menos um repositório respondeu com sucesso (mas sem nova versão disponível)
    if (louvorResult || fluteResult) {
      const versionInfo = (winningResult || louvorResult || fluteResult)?.updateInfo?.version || autoUpdater.currentVersion?.format() || "";
      console.log("[Updater] Nenhuma atualização disponível. Versão atual é a mais recente:", versionInfo);
      notifyWindows("update-not-available", {
        version: versionInfo,
        currentVersion: app.getVersion(),
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

    // Se estiver em modo de desenvolvimento (!app.isPackaged), o electron-updater não verifica por padrão.
    // Consultamos diretamente as releases do GitHub para detectar atualizações reais e alimentar a interface:
    if (!app.isPackaged) {
      console.log("[Updater] Modo de desenvolvimento: buscando releases reais no GitHub...");
      const currentVer = app.getVersion();
      const releases = await fetchReleasesFromGitHub(currentVer);

      if (releases.length > 0 && compareSemver(releases[0].version, currentVer) > 0) {
        const latest = releases[0];
        const targetVer = latest.version;
        console.log(`[Updater] [Dev] Atualização encontrada no GitHub: ${currentVer} -> ${targetVer}`);

        notifyWindows("update-available", {
          version: targetVer,
          currentVersion: currentVer,
          releaseDate: latest.publishedAt || new Date().toISOString(),
          releaseNotes: latest.notes || "",
          releases,
        });

        return {
          isUpdateAvailable: true,
          updateInfo: {
            version: targetVer,
            releaseDate: latest.publishedAt || new Date().toISOString(),
            releaseNotes: latest.notes || "",
          },
        } as unknown as UpdateCheckResult;
      } 
      console.log(`[Updater] [Dev] Nenhuma versão superior a ${currentVer} encontrada no GitHub.`);
      notifyWindows("update-not-available", {
        version: currentVer,
        currentVersion: currentVer,
      });
      return {
        isUpdateAvailable: false,
        updateInfo: {
          version: currentVer,
        },
      } as unknown as UpdateCheckResult;
      
    }

    console.log("[Updater] Nenhum resultado retornado.");
    return null;
  } finally {
    isCheckingMultiRepo = false;
  }
}

export function setupUpdater() {
  autoUpdater.on("update-available", async (info) => {
    console.log("Update available:", info.version);
    if (!isCheckingMultiRepo) {
      const currentVer = app.getVersion();
      const targetVer = info.version;
      const releases = await buildReleasesList(
        currentVer,
        targetVer,
        info.releaseNotes,
        info.releaseDate,
        info.releaseName,
      );

      notifyWindows("update-available", {
        version: targetVer,
        currentVersion: currentVer,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
        releases,
      });
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("No update available. Current version is up-to-date.");
    if (!isCheckingMultiRepo) {
      notifyWindows("update-not-available", {
        version: info.version,
        currentVersion: app.getVersion(),
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
      currentVersion: app.getVersion(),
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
      if (!app.isPackaged) {
        console.log("[Updater] Modo dev: simulando download de atualização para teste de UI...");
        for (let p = 15; p <= 100; p += 20) {
          await new Promise((r) => setTimeout(r, 400));
          notifyWindows("update-download-progress", {
            percent: Math.min(p, 100),
            bytesPerSecond: 2.5 * 1024 * 1024,
            transferred: (Math.min(p, 100) / 100) * 50000000,
            total: 50000000,
          });
        }
        notifyWindows("update-downloaded", {
          version: "dev-update",
          currentVersion: app.getVersion(),
        });
        return true;
      }
      await autoUpdater.downloadUpdate();
      return true;
    } catch (error: unknown) {
      console.error("Download update error:", (error as Error).message);
      return false;
    }
  });

  ipcMain.handle("quit-and-install", () => {
    (global as unknown as Record<string, boolean>).isQuitting = true;
    if (!app.isPackaged) {
      console.log("[Updater] Modo dev: quit-and-install acionado.");
      return;
    }
    autoUpdater.quitAndInstall(true, true);
  });

  ipcMain.handle("get-app-releases", async (_event, fromVersion?: string, toVersion?: string) => {
    try {
      const current = fromVersion || app.getVersion();
      return await fetchReleasesFromGitHub(current, toVersion);
    } catch (err: unknown) {
      console.error("[Updater] Erro ao buscar releases:", (err as Error).message);
      return [];
    }
  });

  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });
}

