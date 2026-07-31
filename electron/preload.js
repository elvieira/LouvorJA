const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getLocalDb: (filename) => ipcRenderer.invoke('get-local-db', filename),
  saveLocalDb: (filename, data) => ipcRenderer.invoke('save-local-db', filename, data),
  
  downloadMedia: (url, destFolderType, filename) => ipcRenderer.invoke('download-media', url, destFolderType, filename),
  checkMedia: (destFolderType, filename) => ipcRenderer.invoke('check-media', destFolderType, filename),
  deleteMedia: (destFolderType, filename) => ipcRenderer.invoke('delete-media', destFolderType, filename),
  
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openPath: (filePath) => ipcRenderer.invoke('open-path', filePath),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  clearSysData: () => ipcRenderer.invoke('clear-sys-data'),
  extractLocalDb: () => ipcRenderer.invoke('extract-local-db'),
  downloadDatabase: () => ipcRenderer.invoke('download-database'),
  checkOldInstallation: () => ipcRenderer.invoke('check-old-installation'),
  importOldInstallation: () => ipcRenderer.invoke('import-old-installation'),
  
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
  onExtractProgress: (callback) => {
    ipcRenderer.on('extract-progress', (_event, data) => callback(data));
  },
  onDownloadDbProgress: (callback) => {
    ipcRenderer.on('download-db-progress', (_event, data) => callback(data));
  },
  
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  identifyDisplays: () => ipcRenderer.invoke('identify-displays'),
  onDisplaysChanged: (callback) => ipcRenderer.on('displays-changed', callback),
  raiseBarWindows: () => ipcRenderer.invoke('raise-bar-windows'),
  
  // Auto-Update
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', (_event, info) => callback(info));
  },
  onUpdateDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (_event, error) => callback(error));
  },
});
