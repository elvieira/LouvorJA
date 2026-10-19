import { ipcMain, net } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import { coversPath, musicPath, slidesPath, avatarsPath, sysConfigPath } from "../config/constants";
import { encryptData, decryptData } from "../utils/crypto";
import { URL_FILES, API_FALLBACK } from "../utils/api-fallback";

function registerDownloadedMedia(filename: string) {
  try {
    let sysConfig: Record<string, unknown> = {};
    if (fs.existsSync(sysConfigPath)) {
      const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
      const configDecrypted = decryptData(configEncrypted);
      if (configDecrypted) sysConfig = JSON.parse(configDecrypted);
    }
    
    const downloadedFiles = (sysConfig["dlm"] as string[]) || [];
    if (!downloadedFiles.includes(filename)) {
      downloadedFiles.push(filename);
      sysConfig["dlm"] = downloadedFiles;
      
      const newEncrypted = encryptData(JSON.stringify(sysConfig));
      if (newEncrypted) fs.writeFileSync(sysConfigPath, newEncrypted, "utf8");
    }
  } catch (e) {
    console.error("Erro ao registrar media baixada:", e);
  }
}

function unregisterDownloadedMedia(filename: string) {
  try {
    let sysConfig: Record<string, unknown> = {};
    if (fs.existsSync(sysConfigPath)) {
      const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
      const configDecrypted = decryptData(configEncrypted);
      if (configDecrypted) sysConfig = JSON.parse(configDecrypted);
    }
    
    let downloadedFiles = (sysConfig["dlm"] as string[]) || [];
    if (downloadedFiles.includes(filename)) {
      downloadedFiles = downloadedFiles.filter(f => f !== filename);
      sysConfig["dlm"] = downloadedFiles;
      
      const newEncrypted = encryptData(JSON.stringify(sysConfig));
      if (newEncrypted) fs.writeFileSync(sysConfigPath, newEncrypted, "utf8");
    }
  } catch (e) {
    console.error("Erro ao remover media do registro:", e);
  }
}

function cleanRelativeMediaFilename(raw: string): string {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  decoded = decoded.replace(/^https?:\/\/[^/]+\//i, "");
  decoded = decoded.replace(/^local:\/\/media\//i, "");
  decoded = decoded.replace(/^\/?(musics|images|covers|avatars)\//i, "");
  return decoded;
}

function buildApiUrl(destFolderType: string, filename: string, useFallback: boolean = false): string {
  let urlFolder = "covers";
  if (destFolderType === "music") urlFolder = "musics";
  else if (destFolderType === "slides") urlFolder = "images";

  const cleanFilename = cleanRelativeMediaFilename(filename).replace(/\\/g, "/");
  const encodedParts = cleanFilename.split("/").map(part => encodeURIComponent(part)).join("/");
  if (!useFallback) {
    return `${URL_FILES}/${urlFolder}/${encodedParts}`;
  }
  return `${API_FALLBACK}/file/${urlFolder}/${encodedParts}`;
}

export function registerMediaHandlers() {
  ipcMain.handle("download-media", async (event, url: string, destFolderType: string, filename: string) => {
    try {
      let destFolder = coversPath;
      if (destFolderType === "music") destFolder = musicPath;
      else if (destFolderType === "slides") destFolder = slidesPath;
      else if (destFolderType === "avatars") destFolder = avatarsPath;

      const decodedFilename = cleanRelativeMediaFilename(filename);
      const filePath = path.join(destFolder, decodedFilename);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      if (destFolderType === "avatars") {
        const fetchUrl = url || (decodedFilename.startsWith("http") ? decodedFilename : `https://github.com/${decodedFilename}`);
        const response = await net.fetch(fetchUrl, { redirect: "follow" });
        if (!response || !response.ok) return false;
        const arrayBuffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
        return true;
      }

      // Prepara lista de tentativas (URLs e nomes de arquivo de destino)
      interface DownloadCandidate {
        url: string;
        targetFilename: string;
      }

      const candidates: DownloadCandidate[] = [];

      // URL primária base
      let primaryUrl = "";
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        primaryUrl = url;
      } else {
        primaryUrl = buildApiUrl(destFolderType, decodedFilename, false);
      }
      candidates.push({ url: primaryUrl, targetFilename: decodedFilename });

      // Se for áudio, adiciona alternativa .opus <-> .mp3 para compatibilidade com CDN e DB legado
      const isAudio = destFolderType === "music" || 
                      decodedFilename.toLowerCase().endsWith(".mp3") || 
                      decodedFilename.toLowerCase().endsWith(".opus");

      if (isAudio) {
        const isMp3 = decodedFilename.toLowerCase().endsWith(".mp3");
        const altExt = isMp3 ? ".opus" : ".mp3";
        const altFilename = decodedFilename.replace(/\.(mp3|opus)$/i, altExt);

        let altPrimaryUrl = "";
        if (primaryUrl.match(/\.(mp3|opus)(\?.*)?$/i)) {
          altPrimaryUrl = primaryUrl.replace(/\.(mp3|opus)(\?.*)?$/i, `${altExt}$2`);
        } else {
          altPrimaryUrl = buildApiUrl(destFolderType, altFilename, false);
        }

        candidates.push({ url: altPrimaryUrl, targetFilename: altFilename });
        // Fallback Workers com extensão original e alternativa
        candidates.push({ url: buildApiUrl(destFolderType, decodedFilename, true), targetFilename: decodedFilename });
        candidates.push({ url: buildApiUrl(destFolderType, altFilename, true), targetFilename: altFilename });
      } else {
        // Fallback Workers para imagens e capas
        candidates.push({ url: buildApiUrl(destFolderType, decodedFilename, true), targetFilename: decodedFilename });
      }

      let response;
      let matchedCandidate: DownloadCandidate | null = null;

      for (const candidate of candidates) {
        try {
          const res = await net.fetch(candidate.url);
          if (res && res.ok) {
            response = res;
            matchedCandidate = candidate;
            break;
          }
        } catch {
          // Tenta próximo candidato
        }
      }

      if (!response || !response.ok || !matchedCandidate) return false;

      const finalFilePath = path.join(destFolder, matchedCandidate.targetFilename);
      const finalDir = path.dirname(finalFilePath);
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(finalFilePath, buffer);

      if (destFolderType !== "covers") {
        registerDownloadedMedia(matchedCandidate.targetFilename);
        if (matchedCandidate.targetFilename !== decodedFilename) {
          registerDownloadedMedia(decodedFilename);
        }
      }
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
    else if (destFolderType === "avatars") destFolder = avatarsPath;

    let decodedFilename = cleanRelativeMediaFilename(filename);
    let filePath = path.join(destFolder, decodedFilename);

    if (!fs.existsSync(filePath) && destFolderType === "music") {
      if (decodedFilename.startsWith("pt/")) {
        const alt = path.join(destFolder, decodedFilename.slice(3));
        if (fs.existsSync(alt)) {
          filePath = alt;
          decodedFilename = decodedFilename.slice(3);
        }
      } else {
        const alt = path.join(destFolder, "pt", decodedFilename);
        if (fs.existsSync(alt)) {
          filePath = alt;
          decodedFilename = `pt/${decodedFilename}`;
        }
      }
    }

    // Compatibilidade reversa entre .opus e .mp3 caso ainda não tenha sido encontrado
    if (!fs.existsSync(filePath) && destFolderType === "music") {
      const checkExtAlt = (baseP: string, baseFn: string) => {
        if (baseFn.toLowerCase().endsWith(".opus")) {
          const altP = baseP.replace(/\.opus$/i, ".mp3");
          if (fs.existsSync(altP)) return { p: altP, fn: baseFn.replace(/\.opus$/i, ".mp3") };
        } else if (baseFn.toLowerCase().endsWith(".mp3")) {
          const altP = baseP.replace(/\.mp3$/i, ".opus");
          if (fs.existsSync(altP)) return { p: altP, fn: baseFn.replace(/\.mp3$/i, ".opus") };
        }
        return null;
      };

      const altRes = checkExtAlt(filePath, decodedFilename);
      if (altRes) {
        filePath = altRes.p;
        decodedFilename = altRes.fn;
      } else if (decodedFilename.startsWith("pt/")) {
        const altPt = path.join(destFolder, decodedFilename.slice(3));
        const altPtRes = checkExtAlt(altPt, decodedFilename.slice(3));
        if (altPtRes) {
          filePath = altPtRes.p;
          decodedFilename = altPtRes.fn;
        }
      } else {
        const altPt = path.join(destFolder, "pt", decodedFilename);
        const altPtRes = checkExtAlt(altPt, `pt/${decodedFilename}`);
        if (altPtRes) {
          filePath = altPtRes.p;
          decodedFilename = altPtRes.fn;
        }
      }
    }

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
    else if (destFolderType === "avatars") destFolder = avatarsPath;

    let decodedFilename = cleanRelativeMediaFilename(filename);
    let filePath = path.join(destFolder, decodedFilename);

    if (!fs.existsSync(filePath) && destFolderType === "music") {
      if (decodedFilename.startsWith("pt/")) {
        const alt = path.join(destFolder, decodedFilename.slice(3));
        if (fs.existsSync(alt)) {
          filePath = alt;
          decodedFilename = decodedFilename.slice(3);
        }
      } else {
        const alt = path.join(destFolder, "pt", decodedFilename);
        if (fs.existsSync(alt)) {
          filePath = alt;
          decodedFilename = `pt/${decodedFilename}`;
        }
      }

      if (!fs.existsSync(filePath)) {
        if (decodedFilename.toLowerCase().endsWith(".opus")) {
          const alt = path.join(destFolder, decodedFilename.replace(/\.opus$/i, ".mp3"));
          if (fs.existsSync(alt)) {
            filePath = alt;
            decodedFilename = decodedFilename.replace(/\.opus$/i, ".mp3");
          }
        } else if (decodedFilename.toLowerCase().endsWith(".mp3")) {
          const alt = path.join(destFolder, decodedFilename.replace(/\.mp3$/i, ".opus"));
          if (fs.existsSync(alt)) {
            filePath = alt;
            decodedFilename = decodedFilename.replace(/\.mp3$/i, ".opus");
          }
        }
      }
    }

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        if (destFolderType !== "covers" && destFolderType !== "avatars") {
          unregisterDownloadedMedia(decodedFilename);
          unregisterDownloadedMedia(decodedFilename.replace(/\.opus$/i, ".mp3"));
          unregisterDownloadedMedia(decodedFilename.replace(/\.mp3$/i, ".opus"));
        }
        return true;
      } catch (_e) {
        console.error("Erro ao deletar mídia:", _e);
        return false;
      }
    }
    return true;
  });
}
