import { BrowserWindow, Menu, screen, MenuItemConstructorOptions, BrowserWindowConstructorOptions, Display } from "electron";
import * as path from "path";
import { isDev } from "../config/constants";

export function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    minWidth: 920,
    minHeight: 760,
    title: "Louvor JA",
    icon: path.join(__dirname, "../public/ico/favicon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
    frame: false,
  });

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-maximized-state", true);
  });
  
  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-maximized-state", false);
  });

  // Menu nativo personalizado
  const menuTemplate = [
    ...(process.platform === "darwin" ? [{
      label: "Louvor JA",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    }] as MenuItemConstructorOptions[] : []),
    {
      label: "Página Inicial",
      submenu: [
        {
          label: "Ir para Página Inicial",
          accelerator: "CmdOrCtrl+H",
          click: () => {
            mainWindow.webContents.send("navigate-module", "home");
          },
        },
      ],
    },
    {
      label: "Álbuns e Coletâneas",
      submenu: [
        {
          label: "Hinário Adventista",
          click: () => {
            mainWindow.webContents.send("navigate-module", "hymnal");
          },
        },
        {
          label: "Hinário Adventista - 1996",
          click: () => {
            mainWindow.webContents.send("navigate-module", "hymnal_1996");
          },
        },
        {
          label: "Álbuns",
          click: () => {
            mainWindow.webContents.send("navigate-module", "collections");
          },
        },
      ],
    },
    {
      label: "Bíblia",
      submenu: [
        {
          label: "Abrir Bíblia",
          accelerator: "CmdOrCtrl+B",
          click: () => {
            mainWindow.webContents.send("navigate-module", "bible");
          },
        },
      ],
    },
    {
      label: "Utilitários",
      submenu: [
        {
          label: "Módulos utilitários",
          enabled: false,
        },
      ],
    },
    {
      label: "Biblioteca Local",
      submenu: [
        {
          label: "Abrir Biblioteca",
          accelerator: "CmdOrCtrl+L",
          click: () => {
            mainWindow.webContents.send("navigate-module", "sync");
          },
        },
      ],
    },
    {
      label: "Configurações",
      submenu: [
        {
          label: "Abrir Configurações",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow.webContents.send("navigate-module", "config");
          },
        },
      ],
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Ajuda e Sobre",
          click: () => {
            mainWindow.webContents.send("navigate-route", "help");
          },
        },
      ],
    },
  ] as MenuItemConstructorOptions[];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.on("context-menu", (event: Electron.Event, params: Electron.ContextMenuParams) => {
    const template: MenuItemConstructorOptions[] = [];
    if (params.isEditable) {
      template.push({ role: "undo", label: "Desfazer" });
      template.push({ role: "redo", label: "Refazer" });
      template.push({ type: "separator" });
      template.push({ role: "cut", label: "Recortar" });
      template.push({ role: "copy", label: "Copiar" });
      template.push({ role: "paste", label: "Colar" });
      template.push({ role: "selectAll", label: "Selecionar Tudo" });
    } else if (params.selectionText) {
      template.push({ role: "copy", label: "Copiar" });
    }
    if (template.length > 0) {
      Menu.buildFromTemplate(template).popup({ window: mainWindow });
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ features }) => {
    const isFullscreen = features.includes("fullscreen=yes");
    const displays = screen.getAllDisplays();

    const windowConfig: BrowserWindowConstructorOptions = {
      title: "LouvorJA",
      width: 800,
      height: 600,
      backgroundColor: "#000000",
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    };

    const monitorMatch = features.match(/monitor=(\d+)/);
    const targetMonitorId = monitorMatch ? parseInt(monitorMatch[1]) : null;

    if (isFullscreen) {
      let targetDisplay = null;
      if (targetMonitorId) {
        targetDisplay = displays.find((d: Display) => d.id === targetMonitorId);
      }

      if (!targetDisplay && displays.length > 1) {
        const primary = screen.getPrimaryDisplay();
        targetDisplay = displays.find((d: Display) => d.id !== primary.id);
      }

      if (!targetDisplay) {
        targetDisplay = screen.getPrimaryDisplay();
      }

      windowConfig.x = targetDisplay.bounds.x;
      windowConfig.y = targetDisplay.bounds.y;
      windowConfig.width = targetDisplay.bounds.width;
      windowConfig.height = targetDisplay.bounds.height;
      windowConfig.resizable = false;
      windowConfig.frame = false;
      windowConfig.thickFrame = false;
      windowConfig.hasShadow = false;
      windowConfig.autoHideMenuBar = true;
      windowConfig.skipTaskbar = true;
      windowConfig.focusable = false;
    }

    return {
      action: "allow",
      overrideBrowserWindowOptions: windowConfig,
    };
  });

  mainWindow.webContents.on("did-create-window", (childWindow) => {
    if (!childWindow.isResizable()) {
      childWindow.setOpacity(0);
      
      childWindow.once("ready-to-show", () => {
        const bounds = childWindow.getBounds();
        const display = screen.getDisplayMatching(bounds);

        childWindow.setFullScreen(false);
        childWindow.setBounds(display.bounds);
        
        if (process.platform === "darwin" || process.platform === "win32") {
          childWindow.setAlwaysOnTop(true, "screen-saver");
        } else {
          childWindow.setAlwaysOnTop(true, "normal");
        }

        if (childWindow.showInactive) {
          childWindow.showInactive();
        } else {
          childWindow.show();
        }

        let opacity = 0;
        const fadeIn = setInterval(() => {
          if (childWindow.isDestroyed()) {
            clearInterval(fadeIn);
            return;
          }
          if (opacity >= 1) {
            clearInterval(fadeIn);
            childWindow.setOpacity(1);
          } else {
            opacity += 0.05;
            childWindow.setOpacity(opacity);
          }
        }, 16);
      });

      childWindow.on("close", (e) => {
        if (!childWindow.isDestroyed() && childWindow.getOpacity() > 0) {
          e.preventDefault();
          let opacity = 1;
          const fadeOut = setInterval(() => {
            if (childWindow.isDestroyed()) {
              clearInterval(fadeOut);
              return;
            }
            if (opacity <= 0) {
              clearInterval(fadeOut);
              childWindow.setOpacity(0);
              childWindow.destroy();
            } else {
              opacity -= 0.05;
              childWindow.setOpacity(opacity);
            }
          }, 16);
        }
      });
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("close", (e) => {
    if (!(global as unknown as Record<string, boolean>).isQuitting) {
      e.preventDefault();
      mainWindow.webContents.send("request-close-app");
    }
  });
}
