const { app, BrowserWindow, Menu, ipcMain, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { autoUpdater } = require('electron-updater');

// Chave estática para ofuscação (não é segurança alta, apenas ofuscação)
const ENCRYPTION_KEY = Buffer.from('v389s8dkj238910s8a7d3h2j1k9s8d7f', 'utf8');
const IV_LENGTH = 16;

function encryptData(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (e) {
    console.error('Erro ao ofuscar dados', e);
    return null;
  }
}

function decryptData(text) {
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return null;
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('Erro ao desofuscar dados', e);
    return null;
  }
}

app.setName('Louvor JA');

const userDataPath = app.getPath('userData');
const sysDbPath = path.join(userDataPath, '.sysdata');
const oldDbPath = path.join(userDataPath, 'database');
const mediaPath = path.join(userDataPath, 'Media');
const coversPath = path.join(mediaPath, 'covers');
const musicPath = path.join(mediaPath, 'music');
const slidesPath = path.join(mediaPath, 'slides');

if (fs.existsSync(oldDbPath)) {
  try {
    const fsExtra = require('fs-extra');
    fsExtra.removeSync(oldDbPath);
  } catch (e) { }
}

[sysDbPath, mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

ipcMain.handle('clear-all-data', async () => {
  try {
    const fsExtra = require('fs-extra');
    if (fsExtra.existsSync(sysDbPath)) fsExtra.emptyDirSync(sysDbPath);
    if (fsExtra.existsSync(mediaPath)) fsExtra.emptyDirSync(mediaPath);
    [sysDbPath, mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
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
    const filePath = path.join(sysDbPath, `${filename}.bin`);
    if (fs.existsSync(filePath)) {
      const encryptedContent = fs.readFileSync(filePath, 'utf8');
      const decryptedString = decryptData(encryptedContent);
      if (decryptedString) {
        return JSON.parse(decryptedString);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('save-local-db', async (event, filename, data) => {
  try {
    const filePath = path.join(sysDbPath, `${filename}.bin`);
    const jsonString = JSON.stringify(data);
    const encryptedContent = encryptData(jsonString);
    if (encryptedContent) {
      fs.writeFileSync(filePath, encryptedContent, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('download-media', async (event, url, destFolderType, filename) => {
  try {
    let destFolder = coversPath;
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
    const cleanFilename = decodedFilename.replace(/\\/g, '/');
    return `local://media/${destFolderType === 'covers' ? 'covers' : destFolderType}/${cleanFilename}`;
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
  return true;
});

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

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    minWidth: 920,
    minHeight: 760,
    title: 'Louvor JA',
    icon: path.join(__dirname, '../public/ico/favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false
  });

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized-state', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized-state', false);
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
      label: 'Página Inicial',
      submenu: [
        {
          label: 'Ir para Página Inicial',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'home');
          },
        }
      ]
    },
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
      submenu: [
        {
          label: 'Abrir Bíblia',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'bible');
          },
        }
      ]
    },
    {
      label: 'Utilitários',
      submenu: [
        {
          label: 'Módulos utilitários',
          enabled: false
        }
      ]
    },
    {
      label: 'Biblioteca Local',
      submenu: [
        {
          label: 'Abrir Biblioteca',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'sync');
          },
        }
      ]
    },
    {
      label: 'Configurações',
      submenu: [
        {
          label: 'Abrir Configurações',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate-module', 'config');
          },
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Ajuda e Sobre',
          click: () => {
            mainWindow.webContents.send('navigate-route', 'help');
          },
        }
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

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

    if (isFullscreen) {
      let targetDisplay = null;
      if (targetMonitorId) {
        targetDisplay = displays.find(d => d.id === targetMonitorId);
      }

      if (!targetDisplay && displays.length > 1) {
        const primary = screen.getPrimaryDisplay();
        targetDisplay = displays.find(d => d.id !== primary.id);
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
      // O fullscreen puro não é ativado na criação no Windows para evitar o bug 
    }

    return {
      action: 'allow',
      overrideBrowserWindowOptions: windowConfig
    };
  });

  mainWindow.webContents.on('did-create-window', (childWindow) => {
    if (!childWindow.isResizable()) {
      childWindow.once('ready-to-show', () => {
        if (process.platform === 'win32') {
          const { screen } = require('electron');
          const bounds = childWindow.getBounds();
          const display = screen.getDisplayMatching(bounds);

          childWindow.setFullScreen(false);
          childWindow.setBounds(display.bounds);
          childWindow.setAlwaysOnTop(true, 'screen-saver');
        } else {
          childWindow.setFullScreen(true);
        }
      });
    }
  });

  if (isDev) {
    // Em desenvolvimento, carrega o servidor Vite
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carrega o build estático
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Intercepta o evento de fechar para perguntar ao usuário
  mainWindow.on('close', (e) => {
    if (!global.isQuitting) {
      e.preventDefault();
      mainWindow.webContents.send('request-close-app');
    }
  });
}



// Registra o protocolo customizado como privilegiado ANTES do app estar pronto (Ignora CORS e permite Fetch)
protocol.registerSchemesAsPrivileged([
  { scheme: 'local', privileges: { bypassCSP: true, supportFetchAPI: true, secure: true, corsEnabled: true, stream: true } }
]);

app.whenReady().then(() => {
  // Bloqueios de Segurança para Produção (Impede DevTools e Reload)
  if (!isDev) {
    app.on('browser-window-created', (event, window) => {
      window.webContents.on('before-input-event', (event, input) => {
        const isReload = (input.control && input.key.toLowerCase() === 'r') || input.key === 'F5';
        const isDevTools = (input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12';
        if (isReload || isDevTools) {
          event.preventDefault();
        }
      });
      window.webContents.on('devtools-opened', () => {
        window.webContents.closeDevTools();
      });
    });
  }

  // Protocolo customizado para carregar mídia local offline com suporte robusto a Range
  protocol.handle('local', async (request) => {
    let filePath = decodeURIComponent(request.url.slice('local://'.length));

    // O Chromium as vezes insere uma barra extra logo após o protocolo, tornando /media/
    if (filePath.startsWith('/media/')) {
      filePath = filePath.slice(1);
    }

    let isMediaFallback = false;
    let fallbackPath = '';

    if (filePath.startsWith('media/')) {
      fallbackPath = filePath.slice('media'.length); // ex: /covers/1995.bmp
      const userDataPath = app.getPath('userData');
      const mediaPath = path.join(userDataPath, 'Media'); // A pasta no disco tem M maiúsculo
      filePath = path.join(mediaPath, fallbackPath);
      isMediaFallback = true;
    } else if (process.platform === 'win32' && filePath.match(/^\/[a-zA-Z]:\//)) {
      filePath = filePath.slice(1); // Remove a barra inicial extra no Windows
    }

    const fs = require('fs');

    try {
      if (!fs.existsSync(filePath)) {
        if (isMediaFallback) {
          const apiUrl = `https://api.louvorja.com.br/file${fallbackPath.replace(/\\/g, '/')}`;
          return await net.fetch(apiUrl);
        }
        return new Response("Not Found", { status: 404 });
      }

      const stat = fs.statSync(filePath);
      const total = stat.size;
      const range = request.headers.get('range');

      let mimeType = 'application/octet-stream';
      const lowerPath = filePath.toLowerCase();
      if (lowerPath.endsWith('.mp3')) mimeType = 'audio/mpeg';
      else if (lowerPath.endsWith('.mp4')) mimeType = 'video/mp4';
      else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (lowerPath.endsWith('.png')) mimeType = 'image/png';
      else if (lowerPath.endsWith('.bmp')) mimeType = 'image/bmp';
      else if (lowerPath.endsWith('.webp')) mimeType = 'image/webp';
      else if (lowerPath.endsWith('.gif')) mimeType = 'image/gif';
      else if (lowerPath.endsWith('.svg')) mimeType = 'image/svg+xml';

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

// Controle customizado da barra de título
ipcMain.handle('window-control', (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (action === 'minimize') {
    win.minimize();
  } else if (action === 'maximize') {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  } else if (action === 'close') {
    // Em vez de fechar direto, pede confirmação
    if (win === BrowserWindow.getAllWindows()[0] || win.id === 1) { // mainWindow
      win.webContents.send('request-close-app');
    } else {
      win.close();
    }
  } else if (action === 'is-maximized') {
    return win.isMaximized();
  }
});

// Encerra o aplicativo inteiro à força após confirmação do usuário
ipcMain.handle('force-quit-app', () => {
  global.isQuitting = true;
  app.quit();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==========================================
// Auto-Updater
// ==========================================
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  const mainWin = BrowserWindow.getAllWindows()[0];
  if (!mainWin) return;

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    mainWin.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('No update available. Current version is up-to-date.');
    mainWin.webContents.send('update-not-available', {
      version: info.version,
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWin.webContents.send('update-download-progress', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    mainWin.webContents.send('update-downloaded', {
      version: info.version,
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error.message);
    mainWin.webContents.send('update-error', {
      message: error.message,
    });
  });

  // Verifica atualizações 5 segundos após iniciar
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.log('Check for updates failed:', err.message);
    });
  }, 5000);
}

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return result;
  } catch (error) {
    console.error('Check for updates error:', error.message);
    return null;
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return true;
  } catch (error) {
    console.error('Download update error:', error.message);
    return false;
  }
});

ipcMain.handle('quit-and-install', () => {
  global.isQuitting = true;
  autoUpdater.quitAndInstall(false, true);
});

// Configura o auto-updater quando o app estiver pronto
app.whenReady().then(() => {
  setupAutoUpdater();
});
