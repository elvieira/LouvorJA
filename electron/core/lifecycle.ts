import { app, protocol, net, BrowserWindow, screen } from "electron";
import * as path from "path";
import * as fs from "fs";
import { isDev } from "../config/constants";
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
        const rest = fallbackPath.slice(8); // após /musics/
        if (rest.startsWith("pt/")) {
          const alt = path.join(mediaPath, "musics", rest.slice(3));
          if (fs.existsSync(alt)) resolvedFilePath = alt;
        } else {
          const alt = path.join(mediaPath, "musics", "pt", rest);
          if (fs.existsSync(alt)) resolvedFilePath = alt;
        }
      }

      filePath = resolvedFilePath;

      if (!fs.existsSync(filePath)) {
        const apiUrl = `https://api.louvorja.com.br/file${fallbackPath.replace(/\\/g, "/")}`;
        net.fetch(apiUrl).then(res => {
          if (res.ok) {
            return res.arrayBuffer();
          }
          throw new Error("API request failed");
        }).then(buffer => {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, Buffer.from(buffer));
          callback({ path: filePath });
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
