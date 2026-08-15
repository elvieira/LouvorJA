import { ipcMain, BrowserWindow, dialog, shell, app, screen, Display } from "electron";
import * as fs from "fs-extra";
import * as path from "path";
import { getSysDbPath, mediaPath, coversPath, musicPath, slidesPath, userDataPath, sysConfigPath } from "../config/constants";
import { encryptData, decryptData } from "../utils/crypto";
import { registerDatabaseHandlers } from "../services/database";
import { registerMediaHandlers } from "../services/media";
import { registerUpdaterHandlers } from "../services/updater";
import { registerValidatorHandlers } from "../services/validator";

export function registerIpcHandlers() {
  registerDatabaseHandlers();
  registerMediaHandlers();
  registerUpdaterHandlers();
  registerValidatorHandlers();

  const getFolderSize = async (dirPath: string): Promise<number> => {
    let totalSize = 0;
    try {
      if (!fs.existsSync(dirPath)) return 0;
      const stats = await fs.stat(dirPath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          totalSize += await getFolderSize(path.join(dirPath, file));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return totalSize;
  };

  ipcMain.handle("get-app-data-size", async () => {
    try {
      const bytes = await getFolderSize(userDataPath);
      return bytes;
    } catch {
      return 0;
    }
  });

  ipcMain.handle("get-folder-size", async (event, dirType: string) => {
    try {
      let targetPath = "";
      switch (dirType) {
        case "database": targetPath = getSysDbPath("pt"); break; // Retorna o tamanho aproximado
        case "covers": targetPath = coversPath; break;
        case "music": targetPath = musicPath; break;
        case "slides": targetPath = slidesPath; break;
      }
      if (targetPath) {
        const size = await getFolderSize(targetPath);
        return size;
      }
      return 0;
    } catch (error) {
      console.error("Erro ao calcular tamanho da pasta:", error);
      return 0;
    }
  });

  ipcMain.handle("open-file-dialog", async (event, options: Electron.OpenDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      title: options?.title || "Selecionar Arquivo",
      filters: options?.filters || [
        { name: "Vídeos", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "webm"] },
      ],
      properties: options?.properties || ["openFile"],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("open-external", async (event, url: string) => {
    if (url) await shell.openExternal(url);
  });

  ipcMain.handle("open-path", async (event, filePath: string) => {
    if (filePath) await shell.openPath(filePath);
  });

  ipcMain.handle("clear-all-data", async () => {
    try {
      // Deleta todos os diretórios com prefixo .sysdata_
      const files = fs.readdirSync(userDataPath);
      for (const file of files) {
        if (file.startsWith(".sysdata_")) {
          const p = path.join(userDataPath, file);
          fs.emptyDirSync(p);
        }
      }
      if (fs.existsSync(mediaPath)) fs.emptyDirSync(mediaPath);
      
      [getSysDbPath("pt"), getSysDbPath("es"), mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });
      return true;
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      return false;
    }
  });

  ipcMain.handle("clear-sys-data", async (event, lang: string = "pt") => {
    try {
      const sysDbPath = getSysDbPath(lang);
      if (fs.existsSync(sysDbPath)) fs.emptyDirSync(sysDbPath);
      if (!fs.existsSync(sysDbPath)) fs.mkdirSync(sysDbPath, { recursive: true });
      
      if (fs.existsSync(sysConfigPath)) {
        const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
        const configDecrypted = decryptData(configEncrypted);
        if (configDecrypted) {
          const sysConfig = JSON.parse(configDecrypted);
          const sfbcKey = `sfbc_${lang}`;
          if (sysConfig[sfbcKey]) {
            delete sysConfig[sfbcKey];
            const encryptedContent = encryptData(JSON.stringify(sysConfig));
            if (encryptedContent) {
              fs.writeFileSync(sysConfigPath, encryptedContent, "utf8");
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Erro ao limpar sysdata:", error);
      return false;
    }
  });

  ipcMain.handle("get-displays", () => {
    return screen.getAllDisplays().map((d: Display) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === screen.getPrimaryDisplay().id,
    }));
  });

  ipcMain.handle("identify-displays", () => {
    const displays = screen.getAllDisplays();

    displays.forEach((display: Display, index: number) => {
      const win = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        focusable: false,
        hasShadow: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
      });

      win.setIgnoreMouseEvents(true);

      const html = `
        <html>
          <body style="margin:0; overflow:hidden; display:flex; align-items:center; justify-content:center; height:100vh; background-color: rgba(0,0,0,0.6);">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 30vw; font-weight: bold; color: white; text-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              ${index + 1}
            </div>
          </body>
        </html>
      `;

      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      setTimeout(() => {
        if (win && !win.isDestroyed()) {
          win.close();
        }
      }, 3000);
    });
    return true;
  });

  ipcMain.handle("window-control", (event, action: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === "minimize") {
      win.minimize();
    } else if (action === "maximize") {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (action === "close") {
      if (win.id === 1) { 
        win.webContents.send("request-close-app");
      } else {
        win.close();
      }
    } else if (action === "is-maximized") {
      return win.isMaximized();
    }
  });

  ipcMain.handle("force-quit-app", () => {
    (global as unknown as Record<string, boolean>).isQuitting = true;
    app.quit();
  });

  ipcMain.handle("get-login-item-settings", () => {
    return app.getLoginItemSettings();
  });

  ipcMain.handle("set-login-item-settings", (event, settings: Electron.Settings) => {
    app.setLoginItemSettings(settings);
    return app.getLoginItemSettings();
  });
}
