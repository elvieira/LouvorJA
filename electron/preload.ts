import { contextBridge, ipcRenderer, webUtils } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  isWindows: process.platform === "win32",
  isMac: process.platform === "darwin",
  getLocalDb: (filename: string, lang?: string) => ipcRenderer.invoke("get-local-db", filename, lang),
  saveLocalDb: (filename: string, data: unknown) => ipcRenderer.invoke("save-local-db", filename, data),
  getLiturgyData: () => ipcRenderer.invoke("get-liturgy-data"),
  saveLiturgyData: (data: unknown) => ipcRenderer.invoke("save-liturgy-data", data),
  
  downloadMedia: (url: string, destFolderType: string, filename: string) => ipcRenderer.invoke("download-media", url, destFolderType, filename),
  checkMedia: (destFolderType: string, filename: string) => ipcRenderer.invoke("check-media", destFolderType, filename),
  deleteMedia: (destFolderType: string, filename: string) => ipcRenderer.invoke("delete-media", destFolderType, filename),
  
  openFileDialog: (options: Record<string, unknown>) => ipcRenderer.invoke("open-file-dialog", options),
  saveFileDialog: (options: Record<string, unknown>) => ipcRenderer.invoke("save-file-dialog", options),
  readTextFile: (filePath: string) => ipcRenderer.invoke("read-text-file", filePath),
  writeTextFile: (filePath: string, content: string) => ipcRenderer.invoke("write-text-file", filePath, content),
  readFileBase64: (filePath: string) => ipcRenderer.invoke("read-file-base64", filePath),
  writeBase64ToTempFile: (base64: string, suggestedName: string) => ipcRenderer.invoke("write-base64-to-temp-file", base64, suggestedName),
  readAudioFolder: (folderPath: string) => ipcRenderer.invoke("read-audio-folder", folderPath),
  writeSljaZip: (payload: Record<string, unknown>) => ipcRenderer.invoke("write-slja-zip", payload),
  readSljaZip: (filePath: string) => ipcRenderer.invoke("read-slja-zip", filePath),
  checkSljaHasInstrumental: (filePath: string) => ipcRenderer.invoke("check-slja-has-instrumental", filePath),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  getSysDbInfo: () => ipcRenderer.invoke("get-sysdb-info"),
  getAppDataSize: () => ipcRenderer.invoke("get-app-data-size"),
  openPath: (filePath: string) => ipcRenderer.invoke("open-path", filePath),
  clearAllData: () => ipcRenderer.invoke("clear-all-data"),
  clearSysData: (lang?: string) => ipcRenderer.invoke("clear-sys-data", lang),
  extractLocalDb: (lang?: string) => ipcRenderer.invoke("extract-local-db", lang),
  downloadDatabase: (lang?: string, force?: boolean) => ipcRenderer.invoke("download-database", lang, force),
  checkDatabaseExists: (lang?: string) => ipcRenderer.invoke("check-database-exists", lang),
  getDatabaseVersion: (lang?: string) => ipcRenderer.invoke("get-database-version", lang),
  checkOldInstallation: () => ipcRenderer.invoke("check-old-installation"),
  importOldInstallation: () => ipcRenderer.invoke("import-old-installation"),
  checkLegacyInstallation: () => ipcRenderer.invoke("check-legacy-installation"),
  selectLegacyFolder: () => ipcRenderer.invoke("select-legacy-folder"),
  importLegacyMedia: (folderPath?: string) => ipcRenderer.invoke("import-legacy-media", folderPath),
  onImportLegacyProgress: (callback: (data: unknown) => void) => {
    ipcRenderer.on("import-legacy-progress", (_event, data: unknown) => callback(data));
  },
  searchBible: (versionId: number, query: string, mode: string, lang?: string) => ipcRenderer.invoke("search-bible", versionId, query, mode, lang),
  fetchYoutubePlaylist: (playlistId: string) => ipcRenderer.invoke("fetch-youtube-playlist", playlistId),
  
  validateInstallation: (lang?: string, devAvatarFilenames?: string[]) => ipcRenderer.invoke("validate-installation", lang, devAvatarFilenames),
  repairSysdata: (filenames: string[], lang?: string) => ipcRenderer.invoke("repair-sysdata", filenames, lang),
  
  getLoginItemSettings: () => ipcRenderer.invoke("get-login-item-settings"),
  setLoginItemSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke("set-login-item-settings", settings),
  getRememberWindowBounds: () => ipcRenderer.invoke("get-remember-window-bounds"),
  setRememberWindowBounds: (enabled: boolean) => ipcRenderer.invoke("set-remember-window-bounds", enabled),
  
  windowControl: (action: string) => ipcRenderer.invoke("window-control", action),
  closeProjections: (targetMonitorId?: string | number) => ipcRenderer.invoke("close-projections", targetMonitorId),
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
  onCycleModuleGroup: (callback: (groupKey: string) => void) => {
    ipcRenderer.on("cycle-module-group", (_event, groupKey: string) => callback(groupKey));
  },
  onMenuAction: (callback: (action: string, payload?: unknown) => void) => {
    ipcRenderer.on("menu-action", (_event, action: string, payload?: unknown) => callback(action, payload));
  },
  getInitialFileToOpen: () => ipcRenderer.invoke("get-initial-file-to-open"),
  onOpenExternalSong: (callback: (filePath: string) => void) => {
    ipcRenderer.on("open-external-song", (_event, filePath: string) => callback(filePath));
  },
  getPathForFile: (file: File) => {
    try {
      return webUtils.getPathForFile(file);
    } catch {
      return (file as File & { path?: string }).path || "";
    }
  },
  fetchImageBase64: (url: string) => ipcRenderer.invoke("fetch-image-base64", url),
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

  // Streaming Server / OBS / vMix
  streamingGetStatus: () => ipcRenderer.invoke("streaming-get-status"),
  streamingGetInterfaces: () => ipcRenderer.invoke("streaming-get-interfaces"),
  streamingSetConfig: (config?: Record<string, unknown>) => ipcRenderer.invoke("streaming-set-config", config),
  streamingStart: (config?: Record<string, unknown>) => ipcRenderer.invoke("streaming-start", config),
  streamingStop: () => ipcRenderer.invoke("streaming-stop"),
  streamingPushSlide: (data: Record<string, unknown>) => ipcRenderer.invoke("streaming-push-slide", data),
  streamingClearSlide: () => ipcRenderer.invoke("streaming-clear-slide"),
  onStreamingRemoteAction: (callback: (data: { action: string; params: Record<string, string> }) => void) => {
    ipcRenderer.removeAllListeners("streaming-remote-action");
    ipcRenderer.on("streaming-remote-action", (_event, data) => callback(data));
  },

  // Logger & Diagnósticos
  getLogs: (filter?: Record<string, unknown>) => ipcRenderer.invoke("get-logs", filter),
  clearLogs: () => ipcRenderer.invoke("clear-logs"),
  addLogEntry: (payload: { level: string; message: string; details?: string }) => ipcRenderer.invoke("add-log-entry", payload),
  getSystemDiagnostics: () => ipcRenderer.invoke("get-system-diagnostics"),
  openLogsFolder: () => ipcRenderer.invoke("open-logs-folder"),
  exportLogs: () => ipcRenderer.invoke("export-logs"),
  onLogEntryAdded: (callback: (entry: unknown) => void) => {
    ipcRenderer.on("log-entry-added", (_event, entry) => callback(entry));
  },
  removeLogEntryListener: () => {
    ipcRenderer.removeAllListeners("log-entry-added");
  },
});
