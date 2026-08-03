import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getLocalDb: (filename: string) => ipcRenderer.invoke("get-local-db", filename),
  saveLocalDb: (filename: string, data: unknown) => ipcRenderer.invoke("save-local-db", filename, data),
  
  downloadMedia: (url: string, destFolderType: string, filename: string) => ipcRenderer.invoke("download-media", url, destFolderType, filename),
  checkMedia: (destFolderType: string, filename: string) => ipcRenderer.invoke("check-media", destFolderType, filename),
  deleteMedia: (destFolderType: string, filename: string) => ipcRenderer.invoke("delete-media", destFolderType, filename),
  
  openFileDialog: (options: Record<string, unknown>) => ipcRenderer.invoke("open-file-dialog", options),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  openPath: (filePath: string) => ipcRenderer.invoke("open-path", filePath),
  clearAllData: () => ipcRenderer.invoke("clear-all-data"),
  clearSysData: () => ipcRenderer.invoke("clear-sys-data"),
  extractLocalDb: () => ipcRenderer.invoke("extract-local-db"),
  downloadDatabase: () => ipcRenderer.invoke("download-database"),
  checkOldInstallation: () => ipcRenderer.invoke("check-old-installation"),
  importOldInstallation: () => ipcRenderer.invoke("import-old-installation"),
  
  validateInstallation: () => ipcRenderer.invoke("validate-installation"),
  repairSysdata: (filenames: string[]) => ipcRenderer.invoke("repair-sysdata", filenames),
  
  windowControl: (action: string) => ipcRenderer.invoke("window-control", action),
  onWindowMaximizedState: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on("window-maximized-state", (_event, isMaximized: boolean) => callback(isMaximized));
  },
  onRequestCloseApp: (callback: () => void) => {
    ipcRenderer.on("request-close-app", () => callback());
  },
  forceQuitApp: () => ipcRenderer.invoke("force-quit-app"),
  
  onNavigateModule: (callback: (moduleId: string) => void) => {
    ipcRenderer.on("navigate-module", (_event, moduleId: string) => callback(moduleId));
  },
  onNavigateRoute: (callback: (routeName: string) => void) => {
    ipcRenderer.on("navigate-route", (_event, routeName: string) => callback(routeName));
  },
  onExtractProgress: (callback: (data: unknown) => void) => {
    ipcRenderer.on("extract-progress", (_event, data: unknown) => callback(data));
  },
  onDownloadDbProgress: (callback: (data: unknown) => void) => {
    ipcRenderer.on("download-db-progress", (_event, data: unknown) => callback(data));
  },
  
  getDisplays: () => ipcRenderer.invoke("get-displays"),
  identifyDisplays: () => ipcRenderer.invoke("identify-displays"),
  onDisplaysChanged: (callback: (...args: unknown[]) => void) => ipcRenderer.on("displays-changed", callback),
  
  // Auto-Update
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),
  onUpdateAvailable: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update-available", (_event, info: unknown) => callback(info));
  },
  onUpdateNotAvailable: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update-not-available", (_event, info: unknown) => callback(info));
  },
  onUpdateDownloadProgress: (callback: (progress: unknown) => void) => {
    ipcRenderer.on("update-download-progress", (_event, progress: unknown) => callback(progress));
  },
  onUpdateDownloaded: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update-downloaded", (_event, info: unknown) => callback(info));
  },
  onUpdateError: (callback: (error: unknown) => void) => {
    ipcRenderer.on("update-error", (_event, error: unknown) => callback(error));
  },
});
