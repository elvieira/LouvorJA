const { app, BrowserWindow, Menu, ipcMain, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');

// Configuração dos diretórios locais
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database');
const mediaPath = path.join(userDataPath, 'media');
const coversPath = path.join(mediaPath, 'covers');
const musicPath = path.join(mediaPath, 'music');
const slidesPath = path.join(mediaPath, 'slides');

// Garantir que as pastas existam
[dbPath, mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// IPC Handlers: Textos (JSON)
ipcMain.handle('clear-all-data', async () => {
  try {
    const fsExtra = require('fs-extra');
    if (fsExtra.existsSync(dbPath)) fsExtra.emptyDirSync(dbPath);
    if (fsExtra.existsSync(mediaPath)) fsExtra.emptyDirSync(mediaPath);
    // Recria as pastas vazias caso o emptyDir tenha falhado em recriar a raiz do mediaPath
    [dbPath, mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    return true;
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return false;
  }
});

ipcMain.handle('get-local-db', async (event, filename) => {
  try {
    const filePath = path.join(dbPath, `${filename}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('save-local-db', async (event, filename, data) => {
  try {
    const filePath = path.join(dbPath, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
});

// IPC Handlers: Mídia Binária (Imagens e Áudios)
ipcMain.handle('download-media', async (event, url, destFolderType, filename) => {
  try {
    let destFolder = coversPath; // default
    if (destFolderType === 'music') destFolder = musicPath;
    else if (destFolderType === 'slides') destFolder = slidesPath;

    const decodedFilename = decodeURIComponent(filename);
    const filePath = path.join(destFolder, decodedFilename);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    const response = await net.fetch(url);
    if (!response.ok) return false;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (error) {
    console.error('Erro baixando mídia:', error);
    return false;
  }
});

ipcMain.handle('check-media', async (event, destFolderType, filename) => {
  let destFolder = coversPath;
  if (destFolderType === 'music') destFolder = musicPath;
  else if (destFolderType === 'slides') destFolder = slidesPath;

  const decodedFilename = decodeURIComponent(filename);
  const filePath = path.join(destFolder, decodedFilename);
  if (fs.existsSync(filePath)) {
    return `local://${filePath}`;
  }
  return false;
});

ipcMain.handle('delete-media', async (event, destFolderType, filename) => {
  let destFolder = coversPath;
  if (destFolderType === 'music') destFolder = musicPath;
  else if (destFolderType === 'slides') destFolder = slidesPath;

  const decodedFilename = decodeURIComponent(filename);
  const filePath = path.join(destFolder, decodedFilename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (e) {
      console.error('Erro ao deletar mídia:', e);
      return false;
    }
  }
  return true; // Already deleted
});

// IPC Handlers: Informações de Tela (Monitores)
ipcMain.handle('get-displays', () => {
  const { screen } = require('electron');
  return screen.getAllDisplays().map(d => ({
    id: d.id,
    bounds: d.bounds,
    workArea: d.workArea,
    scaleFactor: d.scaleFactor,
    isPrimary: d.id === screen.getPrimaryDisplay().id
  }));
});

ipcMain.handle('identify-displays', () => {
  const { screen } = require('electron');
  const displays = screen.getAllDisplays();

  displays.forEach((display, index) => {
    let win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      focusable: false,
      hasShadow: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
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

    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

    setTimeout(() => {
      if (win && !win.isDestroyed()) {
        win.close();
      }
    }, 3000);
  });
  return true;
});

// Determine se está em modo de desenvolvimento
const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 920,
    minHeight: 760,
    title: 'Louvor JA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Garante que o título não seja sobrescrito pelo HTML
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  // Menu nativo personalizado
  const menuTemplate = [
    // macOS: menu com nome do app
    ...(process.platform === 'darwin' ? [{
      label: 'Louvor JA',
      submenu: [
        { role: 'about', label: 'Sobre o Louvor JA' },
        { type: 'separator' },
        { role: 'services', label: 'Serviços' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar Louvor JA' },
        { role: 'hideOthers', label: 'Ocultar Outros' },
        { role: 'unhide', label: 'Mostrar Tudo' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair do Louvor JA' },
      ],
    }] : []),
    {
      label: 'Navegação',
      submenu: [
        {
          label: 'Página Inicial',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'home');
          },
        },
        { type: 'separator' },
        {
          label: 'Álbuns e Coletâneas',
          submenu: [
            {
              label: 'Hinário Adventista',
              click: () => {
                mainWindow.webContents.send('navigate-module', 'hymnal');
              },
            },
            {
              label: 'Hinário Adventista - 1996',
              click: () => {
                mainWindow.webContents.send('navigate-module', 'hymnal_1996');
              },
            },
            {
              label: 'Álbuns',
              click: () => {
                mainWindow.webContents.send('navigate-module', 'collections');
              },
            },
          ],
        },
        {
          label: 'Bíblia',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'bible');
          },
        },
        { type: 'separator' },
        {
          label: 'Ajuda e Sobre',
          click: () => {
            mainWindow.webContents.send('navigate-route', 'help');
          },
        },
        {
          label: 'Configurações',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'theme');
          },
        },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar Tudo' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'Ferramentas do Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Padrão' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' },
      ],
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'zoom', label: 'Zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front', label: 'Trazer para Frente' },
        ] : [
          { role: 'close', label: 'Fechar' },
        ]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Interceptar aberturas de janelas para projetar no segundo monitor se necessário
  mainWindow.webContents.setWindowOpenHandler(({ url, features }) => {
    const isFullscreen = features.includes('fullscreen=yes');
    const { screen } = require('electron');
    const displays = screen.getAllDisplays();

    let windowConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      }
    };

    const monitorMatch = features.match(/monitor=(\d+)/);
    const targetMonitorId = monitorMatch ? parseInt(monitorMatch[1]) : null;

    if (isFullscreen && displays.length > 1) {
      let targetDisplay = null;
      if (targetMonitorId) {
        targetDisplay = displays.find(d => d.id === targetMonitorId);
      }

      if (!targetDisplay) {
        const primary = screen.getPrimaryDisplay();
        targetDisplay = displays.find(d => d.id !== primary.id && (d.bounds.x !== primary.bounds.x || d.bounds.y !== primary.bounds.y));
      }

      if (targetDisplay) {
        windowConfig.x = targetDisplay.bounds.x;
        windowConfig.y = targetDisplay.bounds.y;
        windowConfig.width = targetDisplay.bounds.width;
        windowConfig.height = targetDisplay.bounds.height;
        windowConfig.fullscreen = true;
        windowConfig.resizable = false;
        windowConfig.frame = false;
      }
    }

    return {
      action: 'allow',
      overrideBrowserWindowOptions: windowConfig
    };
  });

  if (isDev) {
    // Em desenvolvimento, carrega o servidor Vite
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Removido a pedido para não abrir automaticamente
  } else {
    // Em produção, carrega o build estático
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.setName('Louvor JA');

// Registra o protocolo customizado como privilegiado ANTES do app estar pronto (Ignora CORS e permite Fetch)
protocol.registerSchemesAsPrivileged([
  { scheme: 'local', privileges: { bypassCSP: true, supportFetchAPI: true, secure: true, corsEnabled: true, stream: true } }
]);

app.whenReady().then(() => {
  // Protocolo customizado para carregar mídia local offline com suporte robusto a Range
  protocol.handle('local', (request) => {
    const filePath = decodeURIComponent(request.url.slice('local://'.length));
    const fs = require('fs');

    try {
      if (!fs.existsSync(filePath)) {
        return new Response("Not Found", { status: 404 });
      }

      const stat = fs.statSync(filePath);
      const total = stat.size;
      const range = request.headers.get('range');

      let mimeType = 'application/octet-stream';
      if (filePath.endsWith('.mp3')) mimeType = 'audio/mpeg';
      else if (filePath.endsWith('.mp4')) mimeType = 'video/mp4';
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (filePath.endsWith('.png')) mimeType = 'image/png';

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const partialstart = parts[0];
        const partialend = parts[1];

        const start = parseInt(partialstart, 10);
        let end = partialend ? parseInt(partialend, 10) : total - 1;

        // Limita o chunk para evitar estouro de memória (Max 10MB por requisição)
        const MAX_CHUNK = 10 * 1024 * 1024;
        if ((end - start) + 1 > MAX_CHUNK) {
          end = start + MAX_CHUNK - 1;
        }
        
        const chunksize = (end - start) + 1;

        // Lê exatamente o bloco necessário direto para a RAM e fecha o arquivo IMEDIATAMENTE
        const buffer = Buffer.alloc(chunksize);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, chunksize, start);
        fs.closeSync(fd);

        return new Response(buffer, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimeType
          }
        });
      } else {
        // Sem range, lemos de uma vez
        const buffer = fs.readFileSync(filePath);
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Length': total,
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes'
          }
        });
      }
    } catch (e) {
      console.error("Local protocol error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  });

  createWindow();

  const { screen } = require('electron');
  const notifyDisplaysChanged = () => {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('displays-changed');
      }
    });
  };

  screen.on('display-added', notifyDisplaysChanged);
  screen.on('display-removed', notifyDisplaysChanged);
  screen.on('display-metrics-changed', notifyDisplaysChanged);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
