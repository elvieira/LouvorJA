/* eslint-disable @typescript-eslint/no-explicit-any */
// Serviço central de logs e diagnóstico do frontend

import Telemetry from "./Telemetry";

export interface FrontendLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: "main" | "renderer";
  message: string;
  details?: string;
}

let isGlobalErrorListening = false;

class LoggerService {
  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    if (typeof window === "undefined" || isGlobalErrorListening) return;
    isGlobalErrorListening = true;

    window.addEventListener("error", (event) => {
      const msg = event.message || "Erro de script não identificado";
      const details = event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`;
      this.error(`[UI Error] ${msg}`, details);
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason) || "Promessa rejeitada sem tratamento";
      const details = reason?.stack || undefined;
      this.error(`[UnhandledRejection] ${msg}`, details);
    });
  }

  public log(level: "info" | "warn" | "error" | "debug", message: string, details?: string | any) {
    const formattedDetails = typeof details === "object" ? JSON.stringify(details, null, 2) : (details ? String(details) : undefined);

    if (level === "error") {
      console.error(`[${level.toUpperCase()}]`, message, details || "");
      try {
        Telemetry.trackError(message, formattedDetails);
      } catch {
        // ignora
      }
    } else if (level === "warn") {
      console.warn(`[${level.toUpperCase()}]`, message, details || "");
    } else {
      console.log(`[${level.toUpperCase()}]`, message, details || "");
    }

    if (window.electronAPI?.addLogEntry) {
      window.electronAPI.addLogEntry({
        level,
        message,
        details: formattedDetails,
      }).catch(() => {
        // ignora se falhar
      });
    }
  }

  public info(message: string, details?: string | any) {
    this.log("info", message, details);
  }

  public warn(message: string, details?: string | any) {
    this.log("warn", message, details);
  }

  public error(message: string, details?: string | any) {
    this.log("error", message, details);
  }

  public debug(message: string, details?: string | any) {
    this.log("debug", message, details);
  }

  public async getLogs(filter?: { level?: string; source?: string; search?: string; limit?: number }): Promise<FrontendLogEntry[]> {
    if (window.electronAPI?.getLogs) {
      return ((await window.electronAPI.getLogs(filter)) as FrontendLogEntry[]) || [];
    }
    return [];
  }

  public async clearLogs(): Promise<boolean> {
    if (window.electronAPI?.clearLogs) {
      return await window.electronAPI.clearLogs();
    }
    return true;
  }

  public async getSystemDiagnostics(): Promise<any> {
    if (window.electronAPI?.getSystemDiagnostics) {
      return await window.electronAPI.getSystemDiagnostics();
    }
    return null;
  }

  public async exportLogs(): Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }> {
    if (window.electronAPI?.exportLogs) {
      return await window.electronAPI.exportLogs();
    }
    return { success: false, error: "Ambiente não suportado" };
  }

  public async openLogsFolder(): Promise<boolean> {
    if (window.electronAPI?.openLogsFolder) {
      return await window.electronAPI.openLogsFolder();
    }
    return false;
  }
}

export const Logger = new LoggerService();
export default Logger;
