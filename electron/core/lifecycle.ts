import { app, protocol, net, BrowserWindow, screen, session } from "electron";
import * as path from "path";
import * as fs from "fs";
import { isDev } from "../config/constants";
import { URL_FILES, API_FALLBACK } from "../utils/api-fallback";
import { createWindow, getMainWindow } from "./window";

let pendingFilePathToOpen: string | null = null;

export function getPendingFilePathToOpen(): string | null {
  const file = pendingFilePathToOpen;
  pendingFilePathToOpen = null;
  return file;
}

export function extractSongFileFromArgv(argv: string[]): string | null {
  if (!argv || !Array.isArray(argv)) return null;
  for (const rawArg of argv) {
    if (typeof rawArg !== "string") continue;
    const arg = rawArg.replace(/^["']|["']$/g, "").trim();
    if (arg.toLowerCase().match(/\.(slja|sja|lja)$/i)) {
      try {
        if (fs.existsSync(arg)) {
          return path.resolve(arg);
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

export function setupLifecycle(): void {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on("second-instance", (_event, commandLine) => {
    const mainWindow = getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      const filePath = extractSongFileFromArgv(commandLine);
      if (filePath) {
        mainWindow.webContents.send("open-external-song", filePath);
      }
    }
  });

  app.on("open-file", (event, filePath) => {
    event.preventDefault();
    const mainWindow = getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once("did-finish-load", () => {
          mainWindow.webContents.send("open-external-song", filePath);
        });
      } else {
        mainWindow.webContents.send("open-external-song", filePath);
      }
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      pendingFilePathToOpen = filePath;
    }
  });

  protocol.registerSchemesAsPrivileged([
    { scheme: "local", privileges: { standard: true, bypassCSP: true, supportFetchAPI: true, secure: true, corsEnabled: true, stream: true } },
  ]);

  app.whenReady().then(() => {
    // Ajusta User-Agent removendo marcas do Electron/LouvorJA que o YouTube bloqueia
    const defaultUA = session.defaultSession.getUserAgent();
    const cleanUA = defaultUA
      .replace(/Electron\/\S+\s?/, "")
      .replace(/LouvorJA\/\S+\s?/, "");
    session.defaultSession.setUserAgent(cleanUA);

    // Intercepta cabeçalhos do frame de embed do YouTube para definir origem válida (evita Erro 152 / 153)
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ["*://*.youtube.com/embed/*", "*://*.youtube-nocookie.com/embed/*"] },
      (details, callback) => {
        details.requestHeaders["Referer"] = "https://louvorja.com.br/";
        details.requestHeaders["Origin"] = "https://louvorja.com.br";
        callback({ requestHeaders: details.requestHeaders });
      },
    );

    if (!pendingFilePathToOpen) {
      const startupFile = extractSongFileFromArgv(process.argv);
      if (startupFile) {
        pendingFilePathToOpen = startupFile;
      }
    }
    if (!isDev) {
      app.on("browser-window-created", (event, window) => {
        window.webContents.on("before-input-event", (event, input) => {
          const isReload = (input.control && input.key.toLowerCase() === "r") || input.key === "F5";
          const isDevTools = (input.control && input.shift && input.key.toLowerCase() === "i") || input.key === "F12";
          if (isReload || isDevTools) {
            event.preventDefault();
          }
        });
        window.webContents.on("devtools-opened", () => {
          window.webContents.closeDevTools();
        });
      });
    }

    protocol.registerFileProtocol("local", (request, callback) => {
      let url;
      try {
        url = new URL(request.url);
      } catch {
        return callback({ error: -2 }); // net::ERR_FAILED
      }
      
      let filePath = decodeURIComponent(url.pathname);
      const host = url.host;

      if (host === "app") {
        if (process.platform === "win32" && filePath.match(/^\/[a-zA-Z]:\//)) {
          filePath = filePath.slice(1);
        }
        if (fs.existsSync(filePath)) {
          try {
            filePath = fs.realpathSync(filePath);
          } catch (e) {
            console.warn("Erro ao resolver caminho real:", e);
          }
        }
        return callback({ path: filePath });
      }

      let fallbackPath = "";
      if (host === "media") {
        fallbackPath = filePath;
      } else if (host) {
        fallbackPath = `/${host}${filePath}`;
      } else {
        fallbackPath = filePath;
      }

      if (fallbackPath.startsWith("/music/")) {
        fallbackPath = `/musics/${fallbackPath.slice(7)}`;
      }

      const userDataPath = app.getPath("userData");
      const mediaPath = path.join(userDataPath, "Media");
      let resolvedFilePath = path.join(mediaPath, fallbackPath);

      if (!fs.existsSync(resolvedFilePath) && fallbackPath.startsWith("/musics/")) {
        const checkAudioExt = (p: string) => {
          if (p.toLowerCase().endsWith(".opus")) {
            const alt = p.replace(/\.opus$/i, ".mp3");
            if (fs.existsSync(alt)) return alt;
          } else if (p.toLowerCase().endsWith(".mp3")) {
            const alt = p.replace(/\.mp3$/i, ".opus");
            if (fs.existsSync(alt)) return alt;
          }
          return null;
        };

        const altExt = checkAudioExt(resolvedFilePath);
        if (altExt) {
          resolvedFilePath = altExt;
        } else {
          const rest = fallbackPath.slice(8); // após /musics/
          if (rest.startsWith("pt/")) {
            const alt = path.join(mediaPath, "musics", rest.slice(3));
            if (fs.existsSync(alt)) {
              resolvedFilePath = alt;
            } else {
              const altExtPt = checkAudioExt(alt);
              if (altExtPt) resolvedFilePath = altExtPt;
            }
          } else {
            const alt = path.join(mediaPath, "musics", "pt", rest);
            if (fs.existsSync(alt)) {
              resolvedFilePath = alt;
            } else {
              const altExtPt = checkAudioExt(alt);
              if (altExtPt) resolvedFilePath = altExtPt;
            }
          }
        }
      }

      filePath = resolvedFilePath;

      if (!fs.existsSync(filePath)) {
        if (fallbackPath.startsWith("/avatars/")) {
          return callback({ error: -6 });
        }
        const cleanPath = fallbackPath.replace(/\\/g, "/");
        const cleanPathNoLead = cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath;
        const apiUrlPrimary = `${URL_FILES}/${cleanPathNoLead}`;
        const apiUrlFallback = `${API_FALLBACK}/file/${cleanPathNoLead}`;

        const isAudio = fallbackPath.startsWith("/musics/") && (fallbackPath.endsWith(".mp3") || fallbackPath.endsWith(".opus"));
        const altExt = fallbackPath.endsWith(".mp3") ? ".opus" : ".mp3";
        const altPathNoLead = isAudio ? cleanPathNoLead.replace(/\.(mp3|opus)$/i, altExt) : "";

        const fetchFromApi = async () => {
          const urlsToTry: string[] = [apiUrlPrimary];
          if (isAudio && altPathNoLead) {
            urlsToTry.push(`${URL_FILES}/${altPathNoLead}`);
          }
          urlsToTry.push(apiUrlFallback);
          if (isAudio && altPathNoLead) {
            urlsToTry.push(`${API_FALLBACK}/file/${altPathNoLead}`);
          }

          for (const u of urlsToTry) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 4000);
              const res = await net.fetch(u, { signal: controller.signal });
              clearTimeout(timer);
              if (res.ok) {
                const targetPath = (isAudio && u.includes(altPathNoLead)) 
                  ? path.join(path.dirname(filePath), path.basename(altPathNoLead))
                  : filePath;
                return { buffer: await res.arrayBuffer(), finalPath: targetPath };
              }
            } catch {
              // tenta próxima URL
            }
          }
          throw new Error("Todas as tentativas de download falharam");
        };

        fetchFromApi().then(({ buffer, finalPath }) => {
          fs.mkdirSync(path.dirname(finalPath), { recursive: true });
          fs.writeFileSync(finalPath, Buffer.from(buffer));
          callback({ path: finalPath });
        }).catch(err => {
          console.error("Fallback download error:", err);
          callback({ error: -6 }); 
        });
        return;
      }

      callback({ path: filePath });
    });

    createWindow();

    const notifyDisplaysChanged = () => {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send("displays-changed");
        }
      });
    };

    screen.on("display-added", notifyDisplaysChanged);
    screen.on("display-removed", notifyDisplaysChanged);
    screen.on("display-metrics-changed", notifyDisplaysChanged);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
