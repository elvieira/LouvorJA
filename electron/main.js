const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

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

  if (isDev) {
    // Em desenvolvimento, carrega o servidor Vite
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carrega o build estático
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.setName('Louvor JA');

app.whenReady().then(() => {
  createWindow();

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
