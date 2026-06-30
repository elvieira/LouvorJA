const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getLocalDb: (filename) => ipcRenderer.invoke('get-local-db', filename),
  saveLocalDb: (filename, data) => ipcRenderer.invoke('save-local-db', filename, data),
  
  downloadMedia: (url, destFolderType, filename) => ipcRenderer.invoke('download-media', url, destFolderType, filename),
  checkMedia: (destFolderType, filename) => ipcRenderer.invoke('check-media', destFolderType, filename),
  deleteMedia: (destFolderType, filename) => ipcRenderer.invoke('delete-media', destFolderType, filename),
  
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  onWindowMaximizedState: (callback) => {
    ipcRenderer.on('window-maximized-state', (_event, isMaximized) => callback(isMaximized));
  },
  onRequestCloseApp: (callback) => {
    ipcRenderer.on('request-close-app', () => callback());
  },
  forceQuitApp: () => ipcRenderer.invoke('force-quit-app'),
  
  onNavigateModule: (callback) => {
    ipcRenderer.on('navigate-module', (_event, moduleId) => callback(moduleId));
  },
  onNavigateRoute: (callback) => {
    ipcRenderer.on('navigate-route', (_event, routeName) => callback(routeName));
  },
  
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  identifyDisplays: () => ipcRenderer.invoke('identify-displays'),
  onDisplaysChanged: (callback) => ipcRenderer.on('displays-changed', callback),
});
