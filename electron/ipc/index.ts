import { ipcMain, BrowserWindow, dialog, shell, app, screen, Display } from "electron";
import * as fs from "fs-extra";
import * as path from "path";
import AdmZip from "adm-zip";
import { getSysDbPath, mediaPath, coversPath, musicPath, slidesPath, userDataPath, sysConfigPath } from "../config/constants";
import { encryptData, decryptData } from "../utils/crypto";
import { registerDatabaseHandlers } from "../services/database";
import { registerMediaHandlers } from "../services/media";
import { registerUpdaterHandlers } from "../services/updater";
import { registerValidatorHandlers } from "../services/validator";

interface SljaSlideInput {
  tipo: string;
  letra: string;
  letraAux: string;
  fundoLetra: number;
  tamanhoLetra: number;
  corLetra: string;
  corFundo: string;
  tamanhoLetraAux: number;
  corLetraAux: string;
  imagemSourcePath: string | null;
  imagemPosicao: number;
  tempo: number;
}

function buildSljaIni(slides: Array<SljaSlideInput & { imagemRelPath: string }>, audioRelPath: string, instrumentalRelPath: string): string {
  const lines: string[] = [];
  lines.push("[Geral]");
  lines.push(`slides=${slides.length}`);
  lines.push(`versao=${app.getVersion()}`);
  lines.push(`url_musica=${audioRelPath}`);
  if (instrumentalRelPath) {
    lines.push(`url_musica_instrumental=${instrumentalRelPath}`);
  }
  lines.push(`audio=${audioRelPath ? 1 : 0}`);
  lines.push("");
  slides.forEach((s, i) => {
    lines.push(`[Slide:${i + 1}]`);
    lines.push(`tipo=${s.tipo}`);
    lines.push(`letra=${s.letra}`);
    if (s.letraAux) lines.push(`letra_aux=${s.letraAux}`);
    lines.push(`fundo_letra=${s.fundoLetra}`);
    lines.push(`tamanho_letra=${s.tamanhoLetra}`);
    lines.push(`cor_letra=${s.corLetra}`);
    lines.push(`cor_fundo=${s.corFundo}`);
    lines.push(`tamanho_letra_aux=${s.tamanhoLetraAux}`);
    lines.push(`cor_letra_aux=${s.corLetraAux}`);
    if (s.imagemRelPath) lines.push(`imagem=${s.imagemRelPath}`);
    lines.push(`imagem_posicao=${s.imagemPosicao}`);
    lines.push(`tempo=${s.tempo}`);
    lines.push("");
  });
  return lines.join("\r\n");
}

function parseSljaIni(text: string): { geral: Record<string, string>; slides: Record<string, string>[] } {
  const geral: Record<string, string> = {};
  const slidesMap = new Map<number, Record<string, string>>();
  let currentSection: "geral" | number | null = null;

  text.split(/\r\n|\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      const name = sectionMatch[1];
      if (name.toLowerCase() === "geral") {
        currentSection = "geral";
      } else {
        const slideMatch = name.match(/^Slide:(\d+)$/i);
        if (slideMatch) {
          const idx = parseInt(slideMatch[1], 10);
          if (!slidesMap.has(idx)) slidesMap.set(idx, {});
          currentSection = idx;
        } else {
          currentSection = null;
        }
      }
      return;
    }
    if (currentSection === null) return;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) return;
    const key = line.slice(0, eqIdx);
    const value = line.slice(eqIdx + 1);
    if (currentSection === "geral") {
      geral[key] = value;
    } else {
      (slidesMap.get(currentSection) as Record<string, string>)[key] = value;
    }
  });

  const orderedSlides = Array.from(slidesMap.keys())
    .sort((a, b) => a - b)
    .map((k) => slidesMap.get(k) as Record<string, string>);
  return { geral, slides: orderedSlides };
}

export function registerIpcHandlers() {
  registerDatabaseHandlers();
  registerMediaHandlers();
  registerUpdaterHandlers();
  registerValidatorHandlers();

  const getFolderSize = async (dirPath: string): Promise<number> => {
    let totalSize = 0;
    try {
      if (!fs.existsSync(dirPath)) return 0;
      const stats = await fs.stat(dirPath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          totalSize += await getFolderSize(path.join(dirPath, file));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return totalSize;
  };

  ipcMain.handle("get-app-data-size", async () => {
    try {
      const bytes = await getFolderSize(userDataPath);
      return bytes;
    } catch {
      return 0;
    }
  });

  ipcMain.handle("get-folder-size", async (event, dirType: string) => {
    try {
      let targetPath = "";
      switch (dirType) {
        case "database": targetPath = getSysDbPath("pt"); break; // Retorna o tamanho aproximado
        case "covers": targetPath = coversPath; break;
        case "music": targetPath = musicPath; break;
        case "slides": targetPath = slidesPath; break;
      }
      if (targetPath) {
        const size = await getFolderSize(targetPath);
        return size;
      }
      return 0;
    } catch (error) {
      console.error("Erro ao calcular tamanho da pasta:", error);
      return 0;
    }
  });

  ipcMain.handle("open-file-dialog", async (event, options: Electron.OpenDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      title: options?.title || "Selecionar Arquivo",
      filters: options?.filters || [
        { name: "Vídeos", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "webm"] },
      ],
      properties: options?.properties || ["openFile"],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("save-file-dialog", async (event, options: Electron.SaveDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;
    const result = await dialog.showSaveDialog(win, {
      title: options?.title || "Salvar Arquivo",
      defaultPath: options?.defaultPath,
      filters: options?.filters || [{ name: "Todos", extensions: ["*"] }],
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });

  ipcMain.handle("read-text-file", async (_event, filePath: string) => {
    try {
      if (!filePath || !fs.existsSync(filePath)) return null;
      return await fs.readFile(filePath, "utf8");
    } catch (e) {
      console.error("Erro ao ler arquivo:", e);
      return null;
    }
  });

  ipcMain.handle("write-text-file", async (_event, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, "utf8");
      return true;
    } catch (e) {
      console.error("Erro ao salvar arquivo:", e);
      return false;
    }
  });

  ipcMain.handle("read-file-base64", async (_event, filePath: string) => {
    try {
      if (!filePath || !fs.existsSync(filePath)) return null;
      const buffer = await fs.readFile(filePath);
      return buffer.toString("base64");
    } catch (e) {
      console.error("Erro ao ler arquivo binário:", e);
      return null;
    }
  });

  ipcMain.handle("write-base64-to-temp-file", async (_event, base64: string, suggestedName: string) => {
    try {
      const tempDir = path.join(app.getPath("temp"), "louvorja-slja");
      await fs.ensureDir(tempDir);
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${path.basename(suggestedName)}`;
      const filePath = path.join(tempDir, safeName);
      await fs.writeFile(filePath, Buffer.from(base64, "base64"));
      return filePath;
    } catch (e) {
      console.error("Erro ao materializar arquivo do pacote:", e);
      return null;
    }
  });

  ipcMain.handle("write-slja-zip", async (_event, payload: {
    filePath: string;
    slides: SljaSlideInput[];
    audioSourcePath: string | null;
    instrumentalSourcePath: string | null;
  }) => {
    try {
      const zip = new AdmZip();

      let audioRelPath = "";
      if (payload.audioSourcePath && fs.existsSync(payload.audioSourcePath)) {
        const audioName = path.basename(payload.audioSourcePath);
        zip.addLocalFile(payload.audioSourcePath, "audio", audioName);
        audioRelPath = `audio\\${audioName}`;
      }

      let instrumentalRelPath = "";
      if (payload.instrumentalSourcePath && fs.existsSync(payload.instrumentalSourcePath)) {
        const instrumentalName = path.basename(payload.instrumentalSourcePath);
        zip.addLocalFile(payload.instrumentalSourcePath, "audio", instrumentalName);
        instrumentalRelPath = `audio\\${instrumentalName}`;
      }

      const imageRelPathBySource = new Map<string, string>();
      const usedImageNames = new Set<string>();

      const resolvedSlides = payload.slides.map((s) => {
        let imagemRelPath = "";
        if (s.imagemSourcePath && fs.existsSync(s.imagemSourcePath)) {
          const cached = imageRelPathBySource.get(s.imagemSourcePath);
          if (cached) {
            imagemRelPath = cached;
          } else {
            const baseName = path.basename(s.imagemSourcePath);
            const ext = path.extname(baseName);
            const stem = path.basename(baseName, ext);
            let finalName = baseName;
            let counter = 1;
            while (usedImageNames.has(finalName)) {
              finalName = `${stem}_${counter}${ext}`;
              counter++;
            }
            usedImageNames.add(finalName);
            zip.addLocalFile(s.imagemSourcePath, "imagens", finalName);
            imagemRelPath = `imagens\\${finalName}`;
            imageRelPathBySource.set(s.imagemSourcePath, imagemRelPath);
          }
        }
        return { ...s, imagemRelPath };
      });

      const iniText = buildSljaIni(resolvedSlides, audioRelPath, instrumentalRelPath);
      zip.addFile("slides.lja", Buffer.from(iniText, "latin1"));

      zip.writeZip(payload.filePath);
      return true;
    } catch (e) {
      console.error("Erro ao salvar .slja:", e);
      return false;
    }
  });

  ipcMain.handle("read-slja-zip", async (_event, filePath: string) => {
    try {
      if (!filePath || !fs.existsSync(filePath)) return null;

      let iniText = "";
      let entries: Array<{ entryName: string; getData: () => Buffer }> = [];
      let tempDir = "";
      let isZip = false;

      try {
        const zip = new AdmZip(filePath);
        entries = zip.getEntries();
        const iniEntry = entries.find((e) => e.entryName.toLowerCase() === "slides.lja");
        if (iniEntry) {
          iniText = iniEntry.getData().toString("latin1");
          isZip = true;
        }
      } catch {
        // Fallback for unzipped/raw .lja or legacy .slja text files
        iniText = fs.readFileSync(filePath, "latin1");
        isZip = false;
      }

      if (!iniText) return null;

      const { geral, slides } = parseSljaIni(iniText);

      tempDir = path.join(app.getPath("temp"), "louvorja-slja");
      await fs.ensureDir(tempDir);

      const extractEntry = (relPath: string): string | null => {
        if (!isZip || !relPath) return null;
        const normalized = relPath.replace(/\\/g, "/").toLowerCase();
        const entry = entries.find((e) => e.entryName.replace(/\\/g, "/").toLowerCase() === normalized);
        if (!entry) return null;
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${path.basename(relPath)}`;
        const outPath = path.join(tempDir, safeName);
        fs.writeFileSync(outPath, entry.getData());
        return outPath;
      };

      const audioPath = extractEntry(geral.url_musica || "");
      const instrumentalPath = extractEntry(geral.url_musica_instrumental || "");

      const imagePathByRel = new Map<string, string | null>();
      const resolvedSlides = slides.map((s) => {
        const imgRel = s.imagem || "";
        let imagePath: string | null = null;
        if (imgRel) {
          if (imagePathByRel.has(imgRel)) {
            imagePath = imagePathByRel.get(imgRel) as string | null;
          } else {
            imagePath = extractEntry(imgRel);
            imagePathByRel.set(imgRel, imagePath);
          }
        }
        const tempoUs = parseInt(s.tempo, 10);
        return {
          text: (s.letra || "").split("|").join("\n"),
          auxText: (s.letra_aux || "").split("|").join("\n"),
          image: imagePath,
          fontSize: parseInt(s.tamanho_letra, 10) || 18,
          fontColor: s.cor_letra || "#ffffff",
          auxFontSize: parseInt(s.tamanho_letra_aux, 10) || 10,
          auxFontColor: s.cor_letra_aux || "#ffffff",
          time: isNaN(tempoUs) ? null : tempoUs / 1000000,
        };
      });

      return {
        name: path.basename(filePath, path.extname(filePath)),
        audioPath,
        instrumentalPath,
        slides: resolvedSlides,
      };
    } catch (e) {
      console.error("Erro ao abrir .slja:", e);
      return null;
    }
  });

  ipcMain.handle("read-audio-folder", async (_event, folderPath: string) => {
    const mediaExtensions = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "mp4", "mkv", "avi", "mov", "wmv", "webm", "slja"];
    try {
      if (!folderPath || !fs.existsSync(folderPath)) return [];
      const entries = await fs.readdir(folderPath);
      return entries
        .filter((entry) => mediaExtensions.includes(path.extname(entry).slice(1).toLowerCase()))
        .map((entry) => ({
          name: path.basename(entry, path.extname(entry)),
          filePath: path.join(folderPath, entry),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error("Erro ao ler pasta de áudio:", e);
      return [];
    }
  });

  ipcMain.handle("open-external", async (event, url: string) => {
    if (url) await shell.openExternal(url);
  });

  ipcMain.handle("open-path", async (event, filePath: string) => {
    if (filePath) await shell.openPath(filePath);
  });

  ipcMain.handle("clear-all-data", async () => {
    try {
      // Deleta todos os diretórios com prefixo .sysdata_
      const files = fs.readdirSync(userDataPath);
      for (const file of files) {
        if (file.startsWith(".sysdata_")) {
          const p = path.join(userDataPath, file);
          fs.emptyDirSync(p);
        }
      }
      if (fs.existsSync(mediaPath)) fs.emptyDirSync(mediaPath);
      
      [getSysDbPath("pt"), getSysDbPath("es"), mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });
      return true;
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      return false;
    }
  });

  ipcMain.handle("clear-sys-data", async (event, lang: string = "pt") => {
    try {
      const sysDbPath = getSysDbPath(lang);
      if (fs.existsSync(sysDbPath)) fs.emptyDirSync(sysDbPath);
      if (!fs.existsSync(sysDbPath)) fs.mkdirSync(sysDbPath, { recursive: true });
      
      if (fs.existsSync(sysConfigPath)) {
        const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
        const configDecrypted = decryptData(configEncrypted);
        if (configDecrypted) {
          const sysConfig = JSON.parse(configDecrypted);
          const sfbcKey = `sfbc_${lang}`;
          if (sysConfig[sfbcKey]) {
            delete sysConfig[sfbcKey];
            const encryptedContent = encryptData(JSON.stringify(sysConfig));
            if (encryptedContent) {
              fs.writeFileSync(sysConfigPath, encryptedContent, "utf8");
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Erro ao limpar sysdata:", error);
      return false;
    }
  });

  ipcMain.handle("get-displays", () => {
    return screen.getAllDisplays().map((d: Display) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === screen.getPrimaryDisplay().id,
    }));
  });

  ipcMain.handle("identify-displays", () => {
    const displays = screen.getAllDisplays();

    displays.forEach((display: Display, index: number) => {
      const win = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        focusable: false,
        hasShadow: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
      });

      win.setIgnoreMouseEvents(true);

      const html = `
        <html>
          <body style="margin:0; overflow:hidden; display:flex; align-items:center; justify-content:center; height:100vh; background-color: rgba(0,0,0,0.6);">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 30vw; font-weight: bold; color: white; text-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              ${index + 1}
            </div>
          </body>
        </html>
      `;

      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      setTimeout(() => {
        if (win && !win.isDestroyed()) {
          win.close();
        }
      }, 3000);
    });
    return true;
  });

  ipcMain.handle("window-control", (event, action: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === "minimize") {
      win.minimize();
    } else if (action === "maximize") {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (action === "close") {
      if (win.id === 1) { 
        win.webContents.send("request-close-app");
      } else {
        win.close();
      }
    } else if (action === "is-maximized") {
      return win.isMaximized();
    }
  });

  ipcMain.handle("force-quit-app", () => {
    (global as unknown as Record<string, boolean>).isQuitting = true;
    app.quit();
  });

  ipcMain.handle("get-login-item-settings", () => {
    return app.getLoginItemSettings();
  });

  ipcMain.handle("set-login-item-settings", (event, settings: Electron.Settings) => {
    app.setLoginItemSettings(settings);
    return app.getLoginItemSettings();
  });
}
