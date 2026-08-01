import { app, protocol, net, BrowserWindow, screen } from "electron";
import * as path from "path";
import * as fs from "fs";
import { isDev } from "../config/constants";
import { createWindow } from "./window";

export function setupLifecycle(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: "local", privileges: { standard: true, bypassCSP: true, supportFetchAPI: true, secure: true, corsEnabled: true, stream: true } },
  ]);

  app.whenReady().then(() => {
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

      const userDataPath = app.getPath("userData");
      const mediaPath = path.join(userDataPath, "Media");
      filePath = path.join(mediaPath, fallbackPath);

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
