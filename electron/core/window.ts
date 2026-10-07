import { BrowserWindow, Menu, screen, MenuItemConstructorOptions, BrowserWindowConstructorOptions, Display, shell } from "electron";
import * as path from "path";
import { isDev } from "../config/constants";
import { loadWindowState, isPositionVisible, setupWindowStateTracker, getDefaultWindowDimensions } from "../services/window-state";

let mainWindowInstance: BrowserWindow | null = null;
const activeProjectionWindows = new Set<BrowserWindow>();

export function getMainWindow(): BrowserWindow | null {
  return mainWindowInstance;
}

export function closeProjections(targetMonitorId?: string | number): void {
  activeProjectionWindows.forEach((win) => {
    if (!win.isDestroyed()) {
      if (targetMonitorId === undefined || targetMonitorId === null) {
        win.close();
      } else {
        const monId = (win as unknown as { projectionMonitorId?: string | number }).projectionMonitorId;
        if (monId !== undefined && String(monId) === String(targetMonitorId)) {
          win.close();
        }
      }
    }
  });
}

export function createWindow(): void {
  const windowState = loadWindowState();
  const defaultDimensions = getDefaultWindowDimensions();

  const windowOptions: BrowserWindowConstructorOptions = {
    width: windowState.enabled ? windowState.width : defaultDimensions.width,
    height: windowState.enabled ? windowState.height : defaultDimensions.height,
    minWidth: 920,
    minHeight: 600,
    title: "Louvor JA",
    icon: path.join(__dirname, "../public/ico/favicon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
    frame: false,
  };

  if (
    windowState.enabled &&
    windowState.x !== undefined &&
    windowState.y !== undefined &&
    isPositionVisible(windowState.x, windowState.y, windowState.width, windowState.height)
  ) {
    windowOptions.x = windowState.x;
    windowOptions.y = windowState.y;
  }

  const mainWindow = new BrowserWindow(windowOptions);
  mainWindowInstance = mainWindow;

  mainWindow.on("closed", () => {
    if (mainWindowInstance === mainWindow) {
      mainWindowInstance = null;
    }
  });

  setupWindowStateTracker(mainWindow);

  if (windowState.enabled && windowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-maximized-state", true);
  });
  
  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-maximized-state", false);
  });

  // Menu nativo personalizado para macOS e Desktop
  const isMac = process.platform === "darwin";

  const menuTemplate: MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: "Louvor JA",
      submenu: [
        {
          label: "Sobre o Louvor JA",
          click: () => {
            mainWindow.webContents.send("navigate-route", "about");
          },
        },
        { type: "separator" },
        {
          label: "Configurações...",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow.webContents.send("navigate-module", "config");
          },
        },
        { type: "separator" },
        { role: "services", label: "Serviços" },
        { type: "separator" },
        { role: "hide", label: "Ocultar Louvor JA" },
        { role: "hideOthers", label: "Ocultar Outros" },
        { role: "unhide", label: "Mostrar Tudo" },
        { type: "separator" },
        { role: "quit", label: "Encerrar Louvor JA", accelerator: "CmdOrCtrl+Q" },
      ],
    }] as MenuItemConstructorOptions[] : []),
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Nova Música no Editor...",
          click: () => {
            mainWindow.webContents.send("navigate-module", "personalized");
          },
        },
        {
          label: "Biblioteca Local (Arquivos Baixados)",
          accelerator: "CmdOrCtrl+L",
          click: () => {
            mainWindow.webContents.send("navigate-module", "sync");
          },
        },
        { type: "separator" },
        ...(isMac ? [
          { role: "close", label: "Fechar Janela" } as MenuItemConstructorOptions,
        ] : [
          { role: "quit", label: "Sair" } as MenuItemConstructorOptions,
        ]),
      ],
    },
    {
      label: "Editar",
      submenu: [
        { role: "undo", label: "Desfazer" },
        { role: "redo", label: "Refazer" },
        { type: "separator" },
        { role: "cut", label: "Recortar" },
        { role: "copy", label: "Copiar" },
        { role: "paste", label: "Colar" },
        { role: "selectAll", label: "Selecionar Tudo" },
        { type: "separator" },
        {
          label: "Buscar Músicas...",
          accelerator: "CmdOrCtrl+F",
          click: () => {
            mainWindow.webContents.send("navigate-route", "quick-search");
          },
        },
        {
          label: "Buscar na Bíblia...",
          accelerator: "CmdOrCtrl+B",
          click: () => {
            mainWindow.webContents.send("navigate-route", "bible-search");
          },
        },
      ],
    },
    {
      label: "Módulos",
      submenu: [
        {
          label: "Página Inicial",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            mainWindow.webContents.send("navigate-module", "home");
          },
        },
        {
          label: "Álbuns e Hinários",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            mainWindow.webContents.send("cycle-module-group", "musics");
          },
        },
        {
          label: "Bíblia Sagrada",
          accelerator: "CmdOrCtrl+3",
          click: () => {
            mainWindow.webContents.send("navigate-module", "bible");
          },
        },
        {
          label: "Utilitários",
          accelerator: "CmdOrCtrl+4",
          click: () => {
            mainWindow.webContents.send("cycle-module-group", "utilities");
          },
        },
        {
          label: "Coletâneas Online",
          accelerator: "CmdOrCtrl+5",
          click: () => {
            mainWindow.webContents.send("cycle-module-group", "online_collection");
          },
        },
        {
          label: "Coletâneas Personalizadas / Editor",
          accelerator: "CmdOrCtrl+6",
          click: () => {
            mainWindow.webContents.send("cycle-module-group", "personalized");
          },
        },
        {
          label: "Liturgia",
          accelerator: "CmdOrCtrl+7",
          click: () => {
            mainWindow.webContents.send("navigate-module", "liturgy");
          },
        },
      ],
    },
    {
      label: "Apresentação",
      submenu: [
        {
          label: "Reproduzir / Pausar",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            mainWindow.webContents.send("menu-action", "play-pause");
          },
        },
        {
          label: "Próximo Slide",
          click: () => {
            mainWindow.webContents.send("menu-action", "next-slide");
          },
        },
        {
          label: "Slide Anterior",
          click: () => {
            mainWindow.webContents.send("menu-action", "prev-slide");
          },
        },
        {
          label: "Primeiro Slide",
          click: () => {
            mainWindow.webContents.send("menu-action", "first-slide");
          },
        },
        {
          label: "Último Slide",
          click: () => {
            mainWindow.webContents.send("menu-action", "last-slide");
          },
        },
        { type: "separator" },
        {
          label: "Alternar Projeção no Telão",
          accelerator: "CmdOrCtrl+Enter",
          click: () => {
            mainWindow.webContents.send("menu-action", "toggle-projection");
          },
        },
        {
          label: "Ocultar Projeção (Blackout)",
          accelerator: "CmdOrCtrl+.",
          click: () => {
            mainWindow.webContents.send("menu-action", "toggle-blackout");
          },
        },
        {
          label: "Alternar Áudio (Cantado / Instrumental)",
          accelerator: "CmdOrCtrl+T",
          click: () => {
            mainWindow.webContents.send("menu-action", "toggle-audio-mode");
          },
        },
        {
          label: "Silenciar Áudio",
          click: () => {
            mainWindow.webContents.send("menu-action", "toggle-mute");
          },
        },
        {
          label: "Fila de Reprodução",
          click: () => {
            mainWindow.webContents.send("menu-action", "toggle-queue");
          },
        },
      ],
    },
    {
      label: "Janela",
      submenu: [
        { role: "minimize", label: "Minimizar" },
        { role: "zoom", label: "Zoom" },
        ...(isMac ? [
          { type: "separator" },
          { role: "front", label: "Trazer Todas para a Frente" },
        ] as MenuItemConstructorOptions[] : []),
      ],
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Manual de Uso",
          accelerator: "F1",
          click: () => {
            mainWindow.webContents.send("navigate-route", "manual");
          },
        },
        {
          label: "Ajuda e Sobre o Louvor JA",
          click: () => {
            mainWindow.webContents.send("navigate-route", "about");
          },
        },
      ],
    },
  ];

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

  interface ProjectionWindowConfig {
    isProjection: boolean;
    isFullscreen: boolean;
    targetDisplay: Display;
  }
  const pendingProjectionWindows: ProjectionWindowConfig[] = [];

  mainWindow.webContents.setWindowOpenHandler(({ url, frameName, features }) => {
    const isProjection =
      url.includes("popup") ||
      url.includes("stage-monitor") ||
      frameName.startsWith("PopupWindow") ||
      frameName.startsWith("StageMonitor") ||
      features.includes("fullscreen=yes") ||
      features.includes("monitor=");

    if (!isProjection) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        shell.openExternal(url);
        return { action: "deny" };
      }
      return { action: "allow" };
    }

    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    const monitorMatch = features.match(/monitor=(\d+)/) || url.match(/[?&]monitor=(\d+)/) || frameName.match(/_(\d+)_/);
    const targetMonitorId = monitorMatch ? parseInt(monitorMatch[1]) : null;

    const isExplicitNoFullscreen = features.includes("fullscreen=no") || url.includes("fullscreen=0");
    const isFullscreen = !isExplicitNoFullscreen;

    let targetDisplay: Display | null = null;
    if (targetMonitorId) {
      targetDisplay = displays.find((d: Display) => d.id === targetMonitorId) || null;
    }
    if (!targetDisplay && displays.length > 1) {
      targetDisplay = displays.find((d: Display) => d.id !== primaryDisplay.id) || null;
    }
    if (!targetDisplay) {
      targetDisplay = primaryDisplay;
    }

    const windowConfig: BrowserWindowConstructorOptions = {
      title: "LouvorJA",
      type: process.platform === "darwin" && isFullscreen ? "panel" : "window",
      width: isFullscreen ? targetDisplay.bounds.width : 800,
      height: isFullscreen ? targetDisplay.bounds.height : 600,
      x: isFullscreen ? targetDisplay.bounds.x : targetDisplay.bounds.x + Math.round((targetDisplay.bounds.width - 800) / 2),
      y: isFullscreen ? targetDisplay.bounds.y : targetDisplay.bounds.y + Math.round((targetDisplay.bounds.height - 600) / 2),
      backgroundColor: "#000000",
      show: false,
      resizable: !isFullscreen,
      frame: !isFullscreen,
      thickFrame: false,
      hasShadow: false,
      autoHideMenuBar: true,
      skipTaskbar: isFullscreen,
      focusable: false,
      enableLargerThanScreen: true,
      roundedCorners: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    };

    pendingProjectionWindows.push({
      isProjection: true,
      isFullscreen,
      targetDisplay,
    });

    return {
      action: "allow",
      overrideBrowserWindowOptions: windowConfig,
    };
  });

  mainWindow.webContents.on("did-create-window", (childWindow) => {
    const config = pendingProjectionWindows.shift();
    const isProjection = Boolean(config?.isProjection || !childWindow.isResizable());

    if (isProjection) {
      activeProjectionWindows.add(childWindow);
      if (config?.targetDisplay) {
        (childWindow as unknown as { projectionMonitorId?: string | number }).projectionMonitorId = config.targetDisplay.id;
      }

      childWindow.once("closed", () => {
        activeProjectionWindows.delete(childWindow);
      });

      childWindow.setOpacity(0);

      let fadeInInterval: NodeJS.Timeout | null = null;
      let fadeOutInterval: NodeJS.Timeout | null = null;
      let isClosingOrFadingOut = false;
      let currentOpacity = 0;

      const triggerFadeIn = () => {
        if (childWindow.isDestroyed() || isClosingOrFadingOut) return;

        const bounds = childWindow.getBounds();
        const display = config?.targetDisplay || screen.getDisplayMatching(bounds);

        if (config?.isFullscreen ?? !childWindow.isResizable()) {
          childWindow.setFullScreen(false);
          childWindow.setBounds(display.bounds);

          if (process.platform === "darwin") {
            try {
              childWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
            } catch {
              // Fallback
            }
            childWindow.setAlwaysOnTop(true, "screen-saver", 1);
          } else if (process.platform === "win32") {
            childWindow.setAlwaysOnTop(true, "screen-saver");
          } else {
            childWindow.setAlwaysOnTop(true, "normal");
          }
        }

        if (childWindow.showInactive) {
          childWindow.showInactive();
        } else {
          childWindow.show();
        }

        currentOpacity = 0;
        childWindow.setOpacity(0);
        if (fadeInInterval) clearInterval(fadeInInterval);

        fadeInInterval = setInterval(() => {
          if (childWindow.isDestroyed()) {
            if (fadeInInterval) clearInterval(fadeInInterval);
            return;
          }
          if (isClosingOrFadingOut) {
            if (fadeInInterval) clearInterval(fadeInInterval);
            return;
          }
          currentOpacity += 0.05;
          if (currentOpacity >= 1) {
            if (fadeInInterval) clearInterval(fadeInInterval);
            currentOpacity = 1;
            childWindow.setOpacity(1);
          } else {
            childWindow.setOpacity(Math.min(1, currentOpacity));
          }
        }, 16);
      };

      if (childWindow.isVisible()) {
        triggerFadeIn();
      } else {
        childWindow.once("ready-to-show", triggerFadeIn);
      }

      childWindow.on("close", (e) => {
        if (isClosingOrFadingOut) {
          e.preventDefault();
          return;
        }

        if (!childWindow.isDestroyed()) {
          e.preventDefault();
          isClosingOrFadingOut = true;

          if (fadeInInterval) {
            clearInterval(fadeInInterval);
            fadeInInterval = null;
          }

          let opacity = currentOpacity > 0 ? currentOpacity : 1;
          try {
            const elOpacity = childWindow.getOpacity();
            if (typeof elOpacity === "number" && elOpacity > 0) {
              opacity = elOpacity;
            }
          } catch {
            // Mantém fallback de opacity
          }

          if (fadeOutInterval) clearInterval(fadeOutInterval);

          fadeOutInterval = setInterval(() => {
            if (childWindow.isDestroyed()) {
              if (fadeOutInterval) clearInterval(fadeOutInterval);
              return;
            }
            opacity -= 0.05;
            if (opacity <= 0) {
              if (fadeOutInterval) clearInterval(fadeOutInterval);
              childWindow.setOpacity(0);
              try {
                if (typeof (childWindow as unknown as { setSimpleFullScreen?: (flag: boolean) => void }).setSimpleFullScreen === "function") {
                  (childWindow as unknown as { setSimpleFullScreen: (flag: boolean) => void }).setSimpleFullScreen(false);
                }
              } catch {
                // Ignora
              }
              childWindow.destroy();
            } else {
              childWindow.setOpacity(Math.max(0, opacity));
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
