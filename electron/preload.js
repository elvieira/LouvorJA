const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  // Banco de Dados Local
  getLocalDb: (filename) => ipcRenderer.invoke('get-local-db', filename),
  saveLocalDb: (filename, data) => ipcRenderer.invoke('save-local-db', filename, data),
  
  // Mídia Offline
  downloadMedia: (url, destFolderType, filename) => ipcRenderer.invoke('download-media', url, destFolderType, filename),
  checkMedia: (destFolderType, filename) => ipcRenderer.invoke('check-media', destFolderType, filename),
  deleteMedia: (destFolderType, filename) => ipcRenderer.invoke('delete-media', destFolderType, filename),
  
  // Limpar dados locais
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  
  // Controles de Janela Customizados
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  onWindowMaximizedState: (callback) => {
    ipcRenderer.on('window-maximized-state', (_event, isMaximized) => callback(isMaximized));
  },
  
  // Escuta eventos de navegação do menu nativo
  onNavigateModule: (callback) => {
    ipcRenderer.on('navigate-module', (_event, moduleId) => callback(moduleId));
  },
  onNavigateRoute: (callback) => {
    ipcRenderer.on('navigate-route', (_event, routeName) => callback(routeName));
  },
  
  // Informações de Tela (Monitores)
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  identifyDisplays: () => ipcRenderer.invoke('identify-displays'),
  onDisplaysChanged: (callback) => ipcRenderer.on('displays-changed', callback),
});
