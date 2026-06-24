const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  // Escuta eventos de navegação do menu nativo
  onNavigateModule: (callback) => {
    ipcRenderer.on('navigate-module', (_event, moduleId) => callback(moduleId));
  },
  onNavigateRoute: (callback) => {
    ipcRenderer.on('navigate-route', (_event, routeName) => callback(routeName));
  },
});
