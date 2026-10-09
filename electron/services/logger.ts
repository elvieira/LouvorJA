import { app, BrowserWindow, dialog, shell, screen, net, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import * as os from "os";
import * as si from "systeminformation";
import { userDataPath, isDev, getSysDbPath, sysConfigPath } from "../config/constants";
import { decryptData } from "../utils/crypto";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: "main" | "renderer";
  message: string;
  details?: string;
}

export interface SystemDiagnostics {
  app: {
    name: string;
    version: string;
    isPackaged: boolean;
    appPath: string;
    userDataPath: string;
    logsPath: string;
  };
  versions: {
    electron: string;
    chrome: string;
    node: string;
    v8: string;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
    hostname: string;
    uptime: number;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speed: number;
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usedPercentage: number;
  };
  storage: {
    appDataSizeBytes: number;
    databases: {
      pt: { exists: boolean; sizeBytes: number; version: string | number | null };
      es: { exists: boolean; sizeBytes: number; version: string | number | null };
    };
  };
  displays: Array<{
    id: number | string;
    label: string;
    bounds: { width: number; height: number; x: number; y: number };
    isPrimary: boolean;
    scaleFactor: number;
  }>;
  network: {
    online: boolean;
    primaryApiStatus: "online" | "offline";
    fallbackApiStatus: "online" | "offline";
  };
  battery?: {
    hasBattery: boolean;
    isCharging: boolean;
    percent: number;
  };
  generatedAt: string;
}

const MAX_MEMORY_LOGS = 1000;
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const logBuffer: LogEntry[] = [];
let logsDirectory = "";
let currentLogFilePath = "";
let isInitialized = false;

function formatArg(arg: unknown): string {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (arg instanceof Error) {
    return `${arg.message}\n${arg.stack || ""}`;
  }
  if (typeof arg === "object") {
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

function formatArgs(args: unknown[]): string {
  return args.map(formatArg).join(" ");
}

export function getLogsDir(): string {
  if (!logsDirectory) {
    logsDirectory = path.join(userDataPath, "logs");
  }
  return logsDirectory;
}

export function getLogFilePath(): string {
  if (!currentLogFilePath) {
    currentLogFilePath = path.join(getLogsDir(), "louvorja.log");
  }
  return currentLogFilePath;
}

function rotateLogFileIfNeeded(): void {
  try {
    const filePath = getLogFilePath();
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_LOG_FILE_SIZE) {
        const oldPath = path.join(getLogsDir(), "louvorja.old.log");
        if (fs.existsSync(oldPath)) {
          fs.removeSync(oldPath);
        }
        fs.renameSync(filePath, oldPath);
      }
    }
  } catch {
    // ignora erro de rotação
  }
}

export function addLog(
  level: "info" | "warn" | "error" | "debug",
  source: "main" | "renderer",
  message: string,
  details?: string,
): LogEntry {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    details,
  };

  logBuffer.push(entry);
  if (logBuffer.length > MAX_MEMORY_LOGS) {
    logBuffer.shift();
  }

  // Escreve de forma assíncrona no arquivo de log
  try {
    const filePath = getLogFilePath();
    const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.source.toUpperCase()}] ${entry.message}${entry.details ? ` | ${entry.details}` : ""}\n`;
    rotateLogFileIfNeeded();
    fs.appendFile(filePath, logLine, () => {
      // callback silencioso
    });
  } catch {
    // ignora falha de gravação no arquivo
  }

  // Notifica janelas abertas caso queiram atualizar em tempo real
  try {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed() && win.webContents) {
        win.webContents.send("log-entry-added", entry);
      }
    }
  } catch {
    // ignore
  }

  return entry;
}

export function getLogs(filter?: {
  level?: string;
  source?: string;
  search?: string;
  limit?: number;
}): LogEntry[] {
  let result = [...logBuffer];

  if (filter?.level && filter.level !== "all") {
    result = result.filter((item) => item.level === filter.level);
  }

  if (filter?.source && filter.source !== "all") {
    result = result.filter((item) => item.source === filter.source);
  }

  if (filter?.search && filter.search.trim()) {
    const term = filter.search.trim().toLowerCase();
    result = result.filter((item) =>
      item.message.toLowerCase().includes(term) ||
      (item.details && item.details.toLowerCase().includes(term)),
    );
  }

  if (filter?.limit && filter.limit > 0) {
    result = result.slice(-filter.limit);
  }

  return result;
}

export function clearLogs(): boolean {
  logBuffer.length = 0;
  try {
    const filePath = getLogFilePath();
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "");
    }
    const oldPath = path.join(getLogsDir(), "louvorja.old.log");
    if (fs.existsSync(oldPath)) {
      fs.removeSync(oldPath);
    }
    return true;
  } catch (error) {
    addLog("error", "main", "Falha ao limpar arquivo de log", String(error));
    return false;
  }
}

async function getFolderSize(dirPath: string): Promise<number> {
  let totalSize = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          totalSize += await getFolderSize(fullPath);
        } else {
          totalSize += stats.size;
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return totalSize;
}

function getDatabaseVersion(lang: string = "pt"): string | number | null {
  try {
    if (fs.existsSync(sysConfigPath)) {
      const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
      const configDecrypted = decryptData(configEncrypted);
      if (configDecrypted) {
        const sysConfig = JSON.parse(configDecrypted);
        if (sysConfig["config"]?.version_number) {
          return sysConfig["config"].version_number;
        }
        if (typeof sysConfig["db_version"] === "number") {
          return sysConfig["db_version"];
        }
      }
    }
    const dbPath = path.join(userDataPath, `database_${lang}.db`);
    if (fs.existsSync(dbPath)) {
      return "SQLite (Local)";
    }
  } catch {
    // ignore
  }
  return null;
}

async function testEndpointStatus(url: string, timeoutMs = 2500): Promise<"online" | "offline"> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await net.fetch(url, { signal: controller.signal, method: "HEAD" });
    clearTimeout(timer);
    return res.ok || res.status === 404 ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export async function getSystemDiagnostics(): Promise<SystemDiagnostics> {
  // Coleta dados de hardware com systeminformation ou fallback com os
  let osData: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
    hostname: string;
    uptime: number;
  } = {
    platform: os.platform(),
    distro: os.type(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: os.uptime(),
  };

  let cpuData = {
    manufacturer: "Desconhecido",
    brand: os.cpus()[0]?.model || "CPU",
    cores: os.cpus().length,
    physicalCores: os.cpus().length,
    speed: os.cpus()[0]?.speed || 0,
  };

  let memData = {
    totalBytes: os.totalmem(),
    freeBytes: os.freemem(),
    usedBytes: os.totalmem() - os.freemem(),
    usedPercentage: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
  };

  let batteryData: { hasBattery: boolean; isCharging: boolean; percent: number } | undefined;

  try {
    const [siOs, siCpu, siMem, siBat] = await Promise.allSettled([
      si.osInfo(),
      si.cpu(),
      si.mem(),
      si.battery(),
    ]);

    if (siOs.status === "fulfilled") {
      osData = {
        platform: siOs.value.platform,
        distro: siOs.value.distro,
        release: siOs.value.release,
        arch: siOs.value.arch,
        hostname: siOs.value.hostname,
        uptime: os.uptime(),
      };
    }

    if (siCpu.status === "fulfilled") {
      cpuData = {
        manufacturer: siCpu.value.manufacturer,
        brand: siCpu.value.brand,
        cores: siCpu.value.cores,
        physicalCores: siCpu.value.physicalCores || siCpu.value.cores,
        speed: siCpu.value.speed,
      };
    }

    if (siMem.status === "fulfilled") {
      const total = siMem.value.total;
      // Em macOS e Linux, 'available' representa a memória realmente disponível (livre + cache recuperável).
      // 'used' direto de siMem ou os.freemem() conta cache de disco do sistema operacional como usado, gerando falsos 99-100%.
      const available = (siMem.value.available && siMem.value.available > 0)
        ? siMem.value.available
        : (siMem.value.free + (siMem.value.cached || 0) + (siMem.value.buffcache || 0));

      const actualUsed = Math.max(0, total - (available > 0 ? available : siMem.value.free));
      const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((actualUsed / total) * 100))) : 0;

      memData = {
        totalBytes: total,
        freeBytes: available > 0 ? available : siMem.value.free,
        usedBytes: actualUsed,
        usedPercentage: percentage,
      };
    }

    if (siBat.status === "fulfilled" && siBat.value.hasBattery) {
      batteryData = {
        hasBattery: siBat.value.hasBattery,
        isCharging: siBat.value.isCharging,
        percent: siBat.value.percent,
      };
    }
  } catch {
    // fallback seguro mantido
  }

  // Tamanho dos dados de armazenamento
  let appDataSize = 0;
  try {
    appDataSize = await getFolderSize(userDataPath);
  } catch {
    // ignore
  }

  const dbPtPath = path.join(userDataPath, "database_pt.db");
  const dbEsPath = path.join(userDataPath, "database_es.db");
  let dbPtSize = 0;
  let dbEsSize = 0;
  try {
    if (fs.existsSync(dbPtPath)) dbPtSize = fs.statSync(dbPtPath).size;
    if (fs.existsSync(dbEsPath)) dbEsSize = fs.statSync(dbEsPath).size;
  } catch {
    // ignore
  }

  // Telas conectadas
  let displaysInfo: Array<{
    id: number | string;
    label: string;
    bounds: { width: number; height: number; x: number; y: number };
    isPrimary: boolean;
    scaleFactor: number;
  }> = [];

  try {
    const primaryId = screen.getPrimaryDisplay()?.id;
    displaysInfo = screen.getAllDisplays().map((d, index) => ({
      id: d.id,
      label: d.label || `Monitor ${index + 1} (${d.bounds.width}x${d.bounds.height})`,
      bounds: d.bounds,
      isPrimary: d.id === primaryId,
      scaleFactor: d.scaleFactor,
    }));
  } catch {
    // ignore
  }

  // Teste de conectividade com APIs
  const [primaryApi, fallbackApi] = await Promise.all([
    testEndpointStatus("https://api.louvorja.com.br/health"),
    testEndpointStatus("https://api.louvorja.workers.dev/ping"),
  ]);

  return {
    app: {
      name: app.getName(),
      version: app.getVersion(),
      isPackaged: app.isPackaged,
      appPath: app.getAppPath(),
      userDataPath,
      logsPath: getLogsDir(),
    },
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      v8: process.versions.v8,
    },
    os: osData,
    cpu: cpuData,
    memory: memData,
    storage: {
      appDataSizeBytes: appDataSize,
      databases: {
        pt: {
          exists: fs.existsSync(dbPtPath) || fs.existsSync(getSysDbPath("pt")),
          sizeBytes: dbPtSize,
          version: getDatabaseVersion("pt"),
        },
        es: {
          exists: fs.existsSync(dbEsPath) || fs.existsSync(getSysDbPath("es")),
          sizeBytes: dbEsSize,
          version: getDatabaseVersion("es"),
        },
      },
    },
    displays: displaysInfo,
    network: {
      online: primaryApi === "online" || fallbackApi === "online",
      primaryApiStatus: primaryApi,
      fallbackApiStatus: fallbackApi,
    },
    battery: batteryData,
    generatedAt: new Date().toISOString(),
  };
}

export function initLogger(): void {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const dir = getLogsDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // ignore
  }

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    originalLog(...args);
    addLog("info", "main", formatArgs(args));
  };

  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    addLog("warn", "main", formatArgs(args));
  };

  console.error = (...args: unknown[]) => {
    originalError(...args);
    addLog("error", "main", formatArgs(args));
  };

  process.on("uncaughtException", (error) => {
    originalError("[UncaughtException]", error);
    addLog("error", "main", `UncaughtException: ${error?.message || error}`, error?.stack);
  });

  process.on("unhandledRejection", (reason) => {
    originalError("[UnhandledRejection]", reason);
    addLog("error", "main", `UnhandledRejection: ${String(reason)}`);
  });

  addLog("info", "main", `Iniciando ${app.getName()} v${app.getVersion()} (Ambiente: ${isDev ? "Desenvolvimento" : "Produção"})`);
}

export function registerLoggerHandlers(): void {
  ipcMain.handle("get-logs", (_event, filter?: { level?: string; source?: string; search?: string; limit?: number }) => {
    return getLogs(filter);
  });

  ipcMain.handle("clear-logs", () => {
    return clearLogs();
  });

  ipcMain.handle("add-log-entry", (_event, payload: { level: "info" | "warn" | "error" | "debug"; message: string; details?: string }) => {
    if (!payload || !payload.message) return null;
    return addLog(payload.level || "info", "renderer", payload.message, payload.details);
  });

  ipcMain.handle("get-system-diagnostics", async () => {
    return await getSystemDiagnostics();
  });

  ipcMain.handle("open-logs-folder", async () => {
    const dir = getLogsDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await shell.openPath(dir);
    return true;
  });

  ipcMain.handle("export-logs", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const saveResult = await dialog.showSaveDialog(win || BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      title: "Exportar Logs do Louvor JA",
      defaultPath: path.join(app.getPath("documents"), `louvorja-diagnostico-${Date.now()}.log`),
      filters: [{ name: "Arquivo de Log", extensions: ["log", "txt"] }],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      return { success: false, canceled: true };
    }

    try {
      const srcLog = getLogFilePath();
      if (fs.existsSync(srcLog)) {
        fs.copyFileSync(srcLog, saveResult.filePath);
      } else {
        // Gera a partir do buffer atual se o arquivo não existir
        const lines = logBuffer.map(
          (e) => `[${e.timestamp}] [${e.level.toUpperCase()}] [${e.source.toUpperCase()}] ${e.message}${e.details ? ` | ${e.details}` : ""}`,
        );
        fs.writeFileSync(saveResult.filePath, lines.join("\n"), "utf8");
      }
      return { success: true, filePath: saveResult.filePath };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });
}
