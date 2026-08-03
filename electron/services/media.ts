import { ipcMain, net } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import { coversPath, musicPath, slidesPath, sysDbPath } from "../config/constants";
import { getFtpParams, useFtpFallback, setUseFtpFallback, resetFtpFallbackTimer, getOrCreateFtpClient, ftpMutex, forceCloseFtpClient } from "../utils/ftp-client";
import { encryptData, decryptData } from "../utils/crypto";

function registerDownloadedMedia(filename: string) {
  try {
    const registryPath = path.join(sysDbPath, "downloaded_media.bin");
    let downloadedFiles: string[] = [];
    if (fs.existsSync(registryPath)) {
      const encryptedContent = fs.readFileSync(registryPath, "utf8");
      const decryptedString = decryptData(encryptedContent);
      if (decryptedString) downloadedFiles = JSON.parse(decryptedString);
    }
    if (!downloadedFiles.includes(filename)) {
      downloadedFiles.push(filename);
      const newEncrypted = encryptData(JSON.stringify(downloadedFiles));
      if (newEncrypted) fs.writeFileSync(registryPath, newEncrypted, "utf8");
    }
  } catch (e) {
    console.error("Erro ao registrar media baixada:", e);
  }
}

function buildApiUrl(destFolderType: string, filename: string): string {
  let urlFolder = "covers";
  if (destFolderType === "music") urlFolder = "musics";
  else if (destFolderType === "slides") urlFolder = "images";

  const cleanFilename = filename.replace(/\\/g, "/");
  return `https://api.louvorja.com.br/file/${urlFolder}/${encodeURIComponent(cleanFilename).replace(/%2F/g, "/")}`;
}

async function downloadMediaViaFtp(destFolderType: string, filename: string, filePath: string, retries = 2) {
  const ftpParams = await getFtpParams();

  let ftpFolder = "config/capas";
  if (destFolderType === "music") ftpFolder = "config/musicas";
  else if (destFolderType === "slides") ftpFolder = "config/imagens";

  let cleanFilename = filename;
  if (cleanFilename.startsWith("pt/") || cleanFilename.startsWith("es/")) {
    cleanFilename = cleanFilename.substring(3);
  }

  const root = ftpParams["root"] || "/";
  const remotePath = `${root + (root.endsWith("/") ? "" : "/")}${ftpFolder}/${cleanFilename}`;

  await ftpMutex.lock();
  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = await getOrCreateFtpClient();
        await client.downloadTo(filePath, remotePath);
        return; 
      } catch (_err: unknown) {
        console.error(`[FTP] ERRO ao baixar ${remotePath}: ${(_err as Error).message}`);
        forceCloseFtpClient();

        if (attempt < retries) {
          const waitTime = 2000 * (attempt + 1); 
          console.warn(`[FTP] Tentativa ${attempt + 1} falhou para ${cleanFilename}, retentando em ${waitTime/1000}s...`);
          await new Promise(r => setTimeout(r, waitTime));
        } else {
          throw _err; 
        }
      }
    }
  } finally {
    ftpMutex.unlock();
  }
}

export function registerMediaHandlers() {
  ipcMain.handle("download-media", async (event, url: string, destFolderType: string, filename: string) => {
    try {
      await getFtpParams().catch(e => console.warn("Não foi possível fazer pre-fetch das credenciais FTP:", e.message));

      let destFolder = coversPath;
      if (destFolderType === "music") destFolder = musicPath;
      else if (destFolderType === "slides") destFolder = slidesPath;

      let decodedFilename = decodeURIComponent(filename);
      if (destFolderType === "music" && decodedFilename.startsWith("/musics/")) {
        decodedFilename = decodedFilename.substring(8); // remove /musics/
      } else if (destFolderType === "slides" && decodedFilename.startsWith("/images/")) {
        decodedFilename = decodedFilename.substring(8); // remove /images/
      }
      
      const filePath = path.join(destFolder, decodedFilename);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      if (useFtpFallback) {
        resetFtpFallbackTimer();
        try {
          await downloadMediaViaFtp(destFolderType, decodedFilename, filePath);
          if (destFolderType !== "covers") registerDownloadedMedia(decodedFilename);
          return true;
        } catch (_ftpError: unknown) {
          console.error("[FTP] Erro no fallback FTP (direto):", (_ftpError as Error).message);
          return false;
        }
      }

      const apiUrl = buildApiUrl(destFolderType, decodedFilename);
      const response = await net.fetch(apiUrl);

      if (response.status === 429) {
        console.warn("[HTTP] Rate limit 429 atingido. Trocando para FTP para todos os downloads...");
        setUseFtpFallback(true);
        resetFtpFallbackTimer();
        try {
          await downloadMediaViaFtp(destFolderType, decodedFilename, filePath);
          if (destFolderType !== "covers") registerDownloadedMedia(decodedFilename);
          return true;
        } catch (_ftpError: unknown) {
          console.error("[FTP] Erro no fallback FTP após 429:", (_ftpError as Error).message);
          return false;
        }
      }

      if (!response || !response.ok) return false;

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      if (destFolderType !== "covers") registerDownloadedMedia(decodedFilename);
      return true;
    } catch (_error: unknown) {
      console.error("[Download] Erro baixando mídia:", (_error as Error).message);
      return false;
    }
  });

  ipcMain.handle("check-media", async (event, destFolderType: string, filename: string) => {
    let destFolder = coversPath;
    if (destFolderType === "music") destFolder = musicPath;
    else if (destFolderType === "slides") destFolder = slidesPath;

    let decodedFilename = decodeURIComponent(filename);
    if (destFolderType === "music" && decodedFilename.startsWith("/musics/")) {
      decodedFilename = decodedFilename.substring(8);
    } else if (destFolderType === "slides" && decodedFilename.startsWith("/images/")) {
      decodedFilename = decodedFilename.substring(8);
    }
    const filePath = path.join(destFolder, decodedFilename);
    if (fs.existsSync(filePath)) {
      const cleanFilename = decodedFilename.replace(/\\/g, "/");
      const mappedType = destFolderType === "slides" ? "images" : destFolderType;
      return `local://media/${mappedType}/${cleanFilename}`;
    }
    return false;
  });

  ipcMain.handle("delete-media", async (event, destFolderType: string, filename: string) => {
    let destFolder = coversPath;
    if (destFolderType === "music") destFolder = musicPath;
    else if (destFolderType === "slides") destFolder = slidesPath;

    let decodedFilename = decodeURIComponent(filename);
    if (destFolderType === "music" && decodedFilename.startsWith("/musics/")) {
      decodedFilename = decodedFilename.substring(8);
    } else if (destFolderType === "slides" && decodedFilename.startsWith("/images/")) {
      decodedFilename = decodedFilename.substring(8);
    }
    const filePath = path.join(destFolder, decodedFilename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch (_e) {
        console.error("Erro ao deletar mídia:", _e);
        return false;
      }
    }
    return true;
  });
}
