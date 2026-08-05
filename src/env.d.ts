/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module "*.json" {
  const value: unknown;
  export default value;
}

// Tipos do electronAPI expostos via preload
interface ElectronAPI {
  isElectron: boolean

  saveLocalDb: (filename: string, data: unknown) => Promise<void>
  downloadMedia: (url: string, destFolderType: string, filename: string) => Promise<boolean>
  checkMedia: (destFolderType: string, filename: string) => Promise<string | false>
  deleteMedia: (destFolderType: string, filename: string) => Promise<boolean>
  openFileDialog: (options: Record<string, unknown>) => Promise<unknown>
  openExternal: (url: string) => Promise<void>
  openPath: (filePath: string) => Promise<void>
  clearAllData: () => Promise<void>
  clearSysData: () => Promise<void>
  getLocalDb: (filename: string, lang?: string) => Promise<unknown | null>
  extractLocalDb: (lang?: string) => Promise<boolean>
  downloadDatabase: (lang?: string) => Promise<unknown>
  checkDatabaseExists: (lang?: string) => Promise<boolean>
  checkOldInstallation: () => Promise<boolean>
  importOldInstallation: () => Promise<boolean>
  validateInstallation: (lang?: string) => Promise<{ missingCovers: string[], missingMusic: string[], missingImages: string[], missingBins: string[], totalMissing: number }>
  repairSysdata: (filenames: string[], lang?: string) => Promise<boolean>
  windowControl: (action: string) => Promise<void>
  onWindowMaximizedState: (callback: (isMaximized: boolean) => void) => void
  onRequestCloseApp: (callback: () => void) => void
  forceQuitApp: () => Promise<void>
  onNavigateModule: (callback: (moduleId: string) => void) => void
  onNavigateRoute: (callback: (routeName: string) => void) => void
  onExtractProgress: (callback: (data: unknown) => void) => void
  onDownloadDbProgress: (callback: (data: unknown) => void) => void
  getDisplays: () => Promise<unknown[]>
  identifyDisplays: () => Promise<void>
  onDisplaysChanged: (callback: (...args: unknown[]) => void) => void
  checkForUpdates: () => Promise<unknown>
  downloadUpdate: () => Promise<void>
  quitAndInstall: () => Promise<void>
  onUpdateAvailable: (callback: (info: unknown) => void) => void
  onUpdateNotAvailable: (callback: (info: unknown) => void) => void
  onUpdateDownloadProgress: (callback: (progress: unknown) => void) => void
  onUpdateDownloaded: (callback: (info: unknown) => void) => void
  onUpdateError: (callback: (error: unknown) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {};

declare module "@vue/runtime-core" {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  interface ComponentCustomProperties {
    $media: any;
    $modules: any;
    $t: any;
    $alert: any;
    $db: any;
    $router: any;
    $path: any;
    $theme: any;
    $datetime: any;
    $appdata: any;
    $userdata: any;
    $string: any;
    $database: any;
  }
}
