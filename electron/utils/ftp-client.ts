import * as ftp from "basic-ftp";
import { net } from "electron";

export const globalFtpParams: Record<string, Record<string, string>> = {};
let ftpClient: ftp.Client | null = null;
let ftpCloseTimer: NodeJS.Timeout | null = null;
export let useFtpFallback = false;
let ftpFallbackTimer: NodeJS.Timeout | null = null;

export function resetFtpFallbackTimer() {
  if (ftpFallbackTimer) clearTimeout(ftpFallbackTimer);
  // Se não houver requisições de mídia por 2 minutos, voltamos a tentar HTTP
  ftpFallbackTimer = setTimeout(() => {
    console.log("[FTP] Timeout de inatividade HTTP atingido. Voltando a tentar HTTP...");
    useFtpFallback = false;
  }, 120000);
}

export function setUseFtpFallback(value: boolean) {
  useFtpFallback = value;
}

export function scheduleFtpClose() {
  if (ftpCloseTimer) clearTimeout(ftpCloseTimer);
  // Fecha a conexão FTP se ficar 30s sem uso
  ftpCloseTimer = setTimeout(() => {
    if (ftpClient) {
      console.log("[FTP] Fechando conexão FTP por inatividade...");
      try { ftpClient.close(); } catch (_e) { console.error("FTP close error:", _e); }
      ftpClient = null;
    }
  }, 30000);
}

export async function getFtpParams(lang: string = "pt"): Promise<Record<string, string>> {
  const langKey = lang.toLowerCase();
  if (globalFtpParams[langKey]) return globalFtpParams[langKey];

  const response = await net.fetch("https://api.louvorja.com.br/params?type=env");
  if (!response.ok) throw new Error("Falha ao buscar parâmetros");
  const text = await response.text();
  
  const params: Record<string, string> = {};
  text.split("\n").forEach(line => {
    const idx = line.indexOf("=");
    if (idx > 0) {
      params[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });
  
  const connFtp = params["conn_ftp"];
  if (!connFtp) throw new Error("conn_ftp não encontrado");
  
  const langUpper = langKey.toUpperCase();
  const payload = Buffer.from(`pc_name=Electron&lang=${langUpper}`).toString("base64");
  const ftpUrl = `${connFtp + (connFtp.includes("?") ? "&" : "?")}data=${payload}&lang=${langUpper}`;
  
  const ftpResponse = await net.fetch(ftpUrl);
  if (!ftpResponse.ok) throw new Error("Falha ao autorizar FTP");
  const encodedFtpParams = await ftpResponse.text();
  
  const decodedFtpText = Buffer.from(encodedFtpParams, "base64").toString("utf8");
  const ftpParamsResult: Record<string, string> = {};
  decodedFtpText.split("\n").forEach(line => {
    const idx = line.indexOf("=");
    if (idx > 0) {
      ftpParamsResult[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });

  globalFtpParams[langKey] = ftpParamsResult;
  return ftpParamsResult;
}

export async function getOrCreateFtpClient(lang: string = "pt"): Promise<ftp.Client> {
  if (ftpClient && !ftpClient.closed) {
    scheduleFtpClose();
    return ftpClient;
  }

  const ftpParams = await getFtpParams(lang);
  const client = new ftp.Client();
  client.ftp.verbose = false;

  // Força PASV tradicional (driblando firewalls/NATs que falham no EPSV)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const transfer = require("basic-ftp/dist/transfer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).prepareTransfer = transfer.enterPassiveModeIPv4;

  const host = ftpParams["host"];
  const user = ftpParams["username"];
  const port = parseInt(ftpParams["port"] || "21");
  
  await client.access({
    host,
    user,
    password: ftpParams["password"],
    port,
    secure: false,
  });

  // Ativar TCP KeepAlive para evitar que firewalls corporativos matem a conexão ociosa
  if (client.ftp && client.ftp.socket) {
    client.ftp.socket.setKeepAlive(true, 10000);
    client.ftp.socket.setTimeout(120000);
  }

  ftpClient = client;
  scheduleFtpClose();
  return client;
}

export class Mutex {
  private queue: Array<() => void>;
  private locked: boolean;

  constructor() {
    this.queue = [];
    this.locked = false;
  }

  async lock(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }
    return new Promise(resolve => this.queue.push(resolve));
  }

  unlock(): void {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      if (resolve) resolve();
    } else {
      this.locked = false;
    }
  }
}

export const ftpMutex = new Mutex();

export function forceCloseFtpClient() {
  if (ftpClient) {
    try { ftpClient.close(); } catch (_e) { console.error("FTP close error:", _e); }
    ftpClient = null;
  }
}
