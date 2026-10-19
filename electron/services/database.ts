import { ipcMain, app, net } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import AdmZip from "adm-zip";
import DbExtractor, { updateSysConfig } from "./db-extractor";
import { encryptData, decryptData } from "../utils/crypto";
import { SQLiteHelper } from "../utils/sqlite";
import { getSysDbPath, sysConfigPath, mediaPath } from "../config/constants";
import { URL_FILES, API_PRIMARY, API_FALLBACK, netFetchWithFallback } from "../utils/api-fallback";

async function downloadStreamToFile(
  url: string,
  targetPath: string,
  onProgress?: (percent: number) => void,
  defaultTotalBytes: number = 0,
): Promise<void> {
  const response = await net.fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Falha na requisição: HTTP ${response.status} para ${url}`);
  }
  const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
  const totalBytes = contentLength > 0 ? contentLength : defaultTotalBytes;

  if (!response.body) {
    throw new Error("Resposta sem corpo");
  }

  const reader = response.body.getReader();
  let receivedBytes = 0;
  const fileStream = fs.createWriteStream(targetPath);

  try {
    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        break;
      }
      if (value) {
        const buffer = Buffer.from(value);
        receivedBytes += buffer.length;
        fileStream.write(buffer);
        if (onProgress && totalBytes > 0) {
          const percent = Math.min(100, Math.floor((receivedBytes / totalBytes) * 100));
          onProgress(percent);
        }
      }
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      fileStream.end((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export function registerDatabaseHandlers() {
  ipcMain.handle("get-local-db", async (event, filename: string, lang: string = "pt") => {
    try {
      // 1. Tenta ler do cofre unificado (.sysconfig.bin)
      if (fs.existsSync(sysConfigPath)) {
        const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
        const configDecrypted = decryptData(configEncrypted);
        if (configDecrypted) {
          const sysConfig = JSON.parse(configDecrypted);
          if (sysConfig[filename] !== undefined) {
            return sysConfig[filename];
          }
        }
      }

      // Se for "config" ou "db_version", busca e recupera a partir do sysconfig, config.json ou SQLite
      if (filename === "config" || filename === "db_version") {
        const sysDbPath = getSysDbPath(lang);
        const jsonConfigPath = path.join(sysDbPath, "config.json");
        if (fs.existsSync(jsonConfigPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(jsonConfigPath, "utf8"));
            const cfg = {
              version_number: data.version_number ?? 0,
              db_version: data.version_number ?? 0,
              ...data,
            };
            updateSysConfig("config", cfg);
            updateSysConfig("db_version", cfg.version_number);
            return filename === "config" ? cfg : cfg.version_number;
          } catch (e) {
            console.error("Erro ao ler config.json:", e);
          }
        }

        const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
        if (fs.existsSync(dbPath)) {
          const extractor = new DbExtractor(dbPath, lang);
          const data = await extractor.repairFile(filename);
          if (data) {
            return data;
          }
        }
        return filename === "config" ? { version_number: 0, db_version: 0 } : 0;
      }

      // 2. Fallback: procura em arquivos individuais na sysDbPath (extraídos do BD)

      const sysDbPath = getSysDbPath(lang);
      const filePath = path.join(sysDbPath, `${filename}.bin`);
      if (fs.existsSync(filePath)) {
        const encryptedContent = fs.readFileSync(filePath, "utf8");
        const decryptedString = decryptData(encryptedContent);
        if (decryptedString) {
          return JSON.parse(decryptedString);
        }
      }

      // 3. Procura versão .json (extraída do bundle.zip de fallback)
      const jsonFilePath = path.join(sysDbPath, `${filename}.json`);
      if (fs.existsSync(jsonFilePath)) {
        const content = fs.readFileSync(jsonFilePath, "utf8");
        return JSON.parse(content);
      }
      
      // Fallback: busca versão não criptografada/sem extensão (ex: do DbExtractor)
      const plainFilePath = path.join(sysDbPath, filename);
      if (fs.existsSync(plainFilePath)) {
        const content = fs.readFileSync(plainFilePath, "utf8");
        const data = JSON.parse(content);
        
        // Converte para o novo formato criptografado em background
        try {
          const encryptedContent = encryptData(content);
          if (encryptedContent) {
            fs.writeFileSync(filePath, encryptedContent, "utf8");
            fs.unlinkSync(plainFilePath);
          }
        } catch (e) {
          console.error("Erro ao converter BD legado:", e);
        }
        
        return data;
      }
      
      // Self-Healing Fallback: se o arquivo não existir fisicamente, tentamos recriá-lo a partir do database_${lang}.db
      const canSelfHeal = filename.endsWith("_categories") || 
                          filename.endsWith("_bible_book") || 
                          filename.endsWith("_bible_version") || 
                          filename.endsWith("_hymnal") || 
                          filename.endsWith("_hymnal_1996") || 
                          filename.endsWith("_musics") || 
                          filename.startsWith("bible_") || 
                          filename.startsWith("album_") || 
                          filename.startsWith("music_");

      if (canSelfHeal) {
        const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
        if (fs.existsSync(dbPath)) {
          console.log(`[self-healing] Arquivo ${filename} ausente. Tentando restaurar a partir do banco de dados (${lang})...`);
          const extractor = new DbExtractor(dbPath, lang);
          const data = await extractor.repairFile(filename);
          if (data) {
            console.log(`[self-healing] Arquivo ${filename} restaurado com sucesso.`);
            return data;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao carregar ou reparar o arquivo local ${filename}:`, error);
      return null;
    }
  });

  ipcMain.handle("search-bible", async (event, versionId: number, query: string, mode: "text" | "reference", lang: string = "pt") => {
    try {
      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      const cleanQuery = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (!cleanQuery) return [];

      if (fs.existsSync(dbPath)) {
        console.log(`[searchBible] Searching in ${dbPath} for '${query}' (versionId: ${versionId}, mode: ${mode})`);
        const db = new SQLiteHelper(dbPath);
        await db.connect();

        try {
          if (mode === "text") {
            db.create_function("remove_diacritics", (str: unknown) => {
              if (typeof str !== "string") return str;
              return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            });

            let sqlQuery = `
              SELECT v.id_bible_book, v.chapter, v.verse, v.text, b.name as book_name, b.abbreviation as book_abbrev
              FROM bible_verse v
              JOIN bible_book b ON v.id_bible_book = b.id_bible_book
              WHERE v.id_bible_version = ?
            `;
            const params: unknown[] = [versionId];
            
            sqlQuery += " AND remove_diacritics(v.text) LIKE ?";
            params.push(`%${cleanQuery}%`);
            
            sqlQuery += " LIMIT 100";
            
            const results = db.prepare(sqlQuery).all(...params);
            console.log(`[searchBible] Query successful, found ${results.length} results.`);
            return results;
          }
        } finally {
          db.close();
        }
        return [];
      }

      // Fallback para arquivos JSON da Bíblia quando o SQLite não estiver presente
      const sysDbPath = getSysDbPath(lang);
      if (fs.existsSync(sysDbPath) && mode === "text") {
        let books: Array<{ id_bible_book: number; name: string; abbreviation: string }> = [];
        const booksFileBin = path.join(sysDbPath, `${lang}_bible_book.bin`);
        const booksFileJson = path.join(sysDbPath, `${lang}_bible_book.json`);
        if (fs.existsSync(booksFileBin)) {
          const dec = decryptData(fs.readFileSync(booksFileBin, "utf8"));
          if (dec) books = JSON.parse(dec);
        } else if (fs.existsSync(booksFileJson)) {
          books = JSON.parse(fs.readFileSync(booksFileJson, "utf8"));
        }

        const bookMap = new Map<number, { name: string; abbrev: string }>();
        for (const b of books) {
          bookMap.set(b.id_bible_book, { name: b.name, abbrev: b.abbreviation });
        }

        const results: Array<{
          id_bible_book: number;
          chapter: number;
          verse: number;
          text: string;
          book_name: string;
          book_abbrev: string;
        }> = [];

        const files = await fs.readdir(sysDbPath);
        const prefix = `bible_${versionId}_`;
        for (const file of files) {
          if (!file.startsWith(prefix) || !file.endsWith(".json")) continue;
          const parts = file.replace(".json", "").split("_");
          if (parts.length !== 4) continue;
          const bookId = parseInt(parts[2], 10);
          const chapter = parseInt(parts[3], 10);
          const bookInfo = bookMap.get(bookId) || { name: "", abbrev: "" };

          try {
            const content = await fs.readJson(path.join(sysDbPath, file));
            for (const [verseStr, text] of Object.entries(content)) {
              if (typeof text === "string") {
                const normText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                if (normText.includes(cleanQuery)) {
                  results.push({
                    id_bible_book: bookId,
                    chapter,
                    verse: parseInt(verseStr, 10),
                    text,
                    book_name: bookInfo.name,
                    book_abbrev: bookInfo.abbrev,
                  });
                  if (results.length >= 100) return results;
                }
              }
            }
          } catch {
            // Ignora arquivo corrompido
          }
        }
        return results;
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar na bíblia:", error);
      return [];
    }
  });

  ipcMain.handle("save-local-db", async (event, filename: string, data: unknown) => {
    try {
      let sysConfig: Record<string, unknown> = {};
      
      // Lê o cofre unificado se existir
      if (fs.existsSync(sysConfigPath)) {
        const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
        const configDecrypted = decryptData(configEncrypted);
        if (configDecrypted) {
          sysConfig = JSON.parse(configDecrypted);
        }
      }

      // Atualiza a chave solicitada
      sysConfig[filename] = data;

      // Salva de volta
      const jsonString = JSON.stringify(sysConfig);
      const encryptedContent = encryptData(jsonString);
      if (encryptedContent) {
        fs.writeFileSync(sysConfigPath, encryptedContent, "utf8");
        
        // Remove a versão antiga avulsa se existir, para limpar o disco
        const legacyPathPt = path.join(getSysDbPath("pt"), `${filename}.bin`);
        if (fs.existsSync(legacyPathPt)) fs.unlinkSync(legacyPathPt);
        
        const legacyPathEs = path.join(getSysDbPath("es"), `${filename}.bin`);
        if (fs.existsSync(legacyPathEs)) fs.unlinkSync(legacyPathEs);
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  ipcMain.handle("get-liturgy-data", async () => {
    try {
      const liturgyPath = path.join(app.getPath("userData"), "liturgy.json");
      if (fs.existsSync(liturgyPath)) {
        const content = fs.readFileSync(liturgyPath, "utf8");
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      console.error("Erro ao ler liturgy.json:", error);
      return null;
    }
  });

  ipcMain.handle("save-liturgy-data", async (event, data: unknown) => {
    try {
      const liturgyPath = path.join(app.getPath("userData"), "liturgy.json");
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(liturgyPath, jsonString, "utf8");
      return true;
    } catch (error) {
      console.error("Erro ao salvar liturgy.json:", error);
      return false;
    }
  });

  ipcMain.handle("extract-local-db", async (event, lang: string = "pt") => {
    try {
      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      const bundlePath = path.join(app.getPath("userData"), `bundle_${lang}.zip`);

      // Se o banco SQLite oficial existe, extrai com o DbExtractor
      if (fs.existsSync(dbPath)) {
        const extractor = new DbExtractor(dbPath, lang);
        await extractor.extract((data) => {
          event.sender.send("extract-progress", data);
        });
        if (fs.existsSync(bundlePath)) {
          try { fs.unlinkSync(bundlePath); } catch { /* ignore */ }
        }
        return true;
      }

      // Se o bundle.zip do fallback existe, extrai os JSONs diretamente
      if (fs.existsSync(bundlePath)) {
        console.log(`[extract-local-db] Extraindo banco de dados fallback (${bundlePath})...`);
        const sysDbPath = getSysDbPath(lang);
        if (fs.existsSync(sysDbPath)) {
          await fs.emptyDir(sysDbPath);
        }
        await fs.ensureDir(sysDbPath);

        event.sender.send("extract-progress", { text: "Extraindo banco de dados...", progress: 20 });

        const zip = new AdmZip(bundlePath);
        zip.extractAllTo(sysDbPath, true);

        event.sender.send("extract-progress", { text: "Configurando banco de dados...", progress: 85 });

        // Lê config.json do bundle e armazena em sysconfig
        const configJsonPath = path.join(sysDbPath, "config.json");
        if (fs.existsSync(configJsonPath)) {
          try {
            const configContent = fs.readFileSync(configJsonPath, "utf8");
            const configData = JSON.parse(configContent);
            const ver = configData.version_number ?? configData.version ?? 0;
            updateSysConfig("config", {
              version_number: ver,
              db_version: ver,
              ...configData,
            });
            updateSysConfig("db_version", ver);
          } catch (e) {
            console.error("Erro ao processar config.json do bundle:", e);
          }
        }

        try {
          fs.unlinkSync(bundlePath);
        } catch { /* ignore */ }

        event.sender.send("extract-progress", { text: "Concluído!", progress: 100 });
        return true;
      }

      throw new Error(`Nenhum arquivo de banco de dados encontrado em: ${dbPath} ou ${bundlePath}`);
    } catch (error) {
      console.error("Erro na extração do banco:", error);
      throw error;
    }
  });

  ipcMain.handle("download-database", async (event, lang: string = "pt", force: boolean = false) => {
    const langKey = (lang || "pt").toLowerCase();
    const dbPath = path.join(app.getPath("userData"), `database_${langKey}.db`);
    const bundlePath = path.join(app.getPath("userData"), `bundle_${langKey}.zip`);

    if (fs.existsSync(dbPath) && force) {
      try { 
        fs.unlinkSync(dbPath); 
      } catch (e) { 
        console.error("Erro ao deletar banco de dados local:", e); 
      }
    }

    if (fs.existsSync(bundlePath) && force) {
      try {
        fs.unlinkSync(bundlePath);
      } catch (e) {
        console.error("Erro ao deletar bundle local:", e);
      }
    }

    // 1. Tenta obter a URL direta HTTPS para o banco SQLite a partir de /params?type=env
    let dbDownloadUrl = `${URL_FILES}/config/${langKey}_database.db`;
    try {
      const envRes = await netFetchWithFallback("/params?type=env");
      if (envRes.ok) {
        const text = await envRes.text();
        const paramKey = `https_db_${langKey}`;
        const match = text.match(new RegExp(`^${paramKey}\\s*=\\s*(.+)$`, "m"));
        if (match && match[1]) {
          dbDownloadUrl = match[1].trim();
        }
      }
    } catch (e) {
      console.warn("[download-database] Não foi possível consultar /params?type=env, usando URL padrão:", (e as Error).message);
    }

    // 2. Download direto do arquivo SQLite via HTTPS (Cloudflare R2 / CDN)
    const tempDbDownloading = `${dbPath}.downloading`;
    if (fs.existsSync(tempDbDownloading)) {
      try { fs.unlinkSync(tempDbDownloading); } catch { /* ignore */ }
    }

    try {
      console.log(`[download-database] Baixando banco SQLite via HTTPS: ${dbDownloadUrl}...`);
      await downloadStreamToFile(dbDownloadUrl, tempDbDownloading, (percent) => {
        event.sender.send("download-db-progress", { progress: percent });
      }, 99000000);

      if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); } catch { /* ignore */ }
      }
      fs.renameSync(tempDbDownloading, dbPath);
      console.log("[download-database] Download do banco de dados SQLite concluído com sucesso via HTTPS!");
      return true;
    } catch (dbError) {
      console.warn(`[download-database] Falha no download do SQLite direto via HTTPS (${(dbError as Error).message}). Tentando fallback (/db/bundle)...`);
      if (fs.existsSync(tempDbDownloading)) {
        try { fs.unlinkSync(tempDbDownloading); } catch { /* ignore */ }
      }
    }

    // 3. Fallback via HTTPS (/db/bundle): tenta primeiro na API primária e depois na API de fallback
    const tempBundleDownloading = `${bundlePath}.downloading`;
    if (fs.existsSync(tempBundleDownloading)) {
      try { fs.unlinkSync(tempBundleDownloading); } catch { /* ignore */ }
    }

    const bundleUrls = [
      `${API_PRIMARY}/db/bundle`,
      `${API_FALLBACK}/db/bundle`,
    ];

    let bundleDownloaded = false;
    let lastBundleError: unknown = null;

    for (const bundleUrl of bundleUrls) {
      try {
        console.log(`[download-database] Tentando baixar bundle via HTTPS (${bundleUrl})...`);
        if (fs.existsSync(tempBundleDownloading)) {
          try { fs.unlinkSync(tempBundleDownloading); } catch { /* ignore */ }
        }

        await downloadStreamToFile(bundleUrl, tempBundleDownloading, (percent) => {
          event.sender.send("download-db-progress", { progress: percent });
        }, 30570479);

        if (fs.existsSync(bundlePath)) {
          try { fs.unlinkSync(bundlePath); } catch { /* ignore */ }
        }
        fs.renameSync(tempBundleDownloading, bundlePath);
        console.log(`[download-database] Download do bundle concluído com sucesso via ${bundleUrl}!`);
        bundleDownloaded = true;
        break;
      } catch (err) {
        lastBundleError = err;
        console.warn(`[download-database] Falha ao baixar bundle de ${bundleUrl} (${(err as Error).message}). Tentando próximo...`);
      }
    }

    if (bundleDownloaded) {
      return true;
    }

    if (fs.existsSync(tempBundleDownloading)) {
      try { fs.unlinkSync(tempBundleDownloading); } catch { /* ignore */ }
    }

    console.error("[download-database] Falha ao baixar bundle em todos os endpoints:", lastBundleError);
    throw lastBundleError;
  });

  ipcMain.handle("check-old-installation", async () => {
    if (process.platform !== "win32") return false;
    const oldPath = "C:\\Program Files (x86)\\Louvor JA\\config\\database.db";
    return fs.existsSync(oldPath);
  });

  ipcMain.handle("import-old-installation", async () => {
    try {
      const oldPath = "C:\\Program Files (x86)\\Louvor JA\\config\\database.db";
      const dbPath = path.join(app.getPath("userData"), "database_pt.db");
      fs.copyFileSync(oldPath, dbPath);
      return true;
    } catch (error) {
      console.error("Erro ao importar versão antiga:", error);
      return false;
    }
  });
  ipcMain.handle("check-database-exists", async (event, lang: string = "pt") => {
    const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
    if (fs.existsSync(dbPath)) return true;
    const sysDbPath = getSysDbPath(lang);
    return fs.existsSync(path.join(sysDbPath, `${lang}_categories.bin`)) ||
           fs.existsSync(path.join(sysDbPath, `${lang}_categories.json`)) ||
           fs.existsSync(path.join(sysDbPath, `${lang}_categories`));
  });
  ipcMain.handle("get-database-version", async (event, lang: string = "pt") => {
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

      const sysDbPath = getSysDbPath(lang);
      const jsonConfigPath = path.join(sysDbPath, "config.json");
      if (fs.existsSync(jsonConfigPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(jsonConfigPath, "utf8"));
          if (typeof data.version_number === "number") {
            return data.version_number;
          }
        } catch {
          // ignore
        }
      }

      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      if (fs.existsSync(dbPath)) {
        const extractor = new DbExtractor(dbPath, lang);
        return await extractor.getVersion();
      }
      return 0;
    } catch {
      return 0;
    }
  });

  ipcMain.handle("get-albums-details", async (event, lang: string = "pt") => {
    try {
      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      if (!fs.existsSync(dbPath)) return {};

      const sqlite = new SQLiteHelper(dbPath);
      await sqlite.connect();

      const query = `
        WITH album_files AS (
          SELECT am.id_album, m.id_file_music as id_file
          FROM albums_musics am
          JOIN musics m ON am.id_music = m.id_music
          WHERE m.id_file_music IS NOT NULL
          
          UNION
          
          SELECT am.id_album, m.id_file_instrumental_music as id_file
          FROM albums_musics am
          JOIN musics m ON am.id_music = m.id_music
          WHERE m.id_file_instrumental_music IS NOT NULL
          
          UNION
          
          SELECT am.id_album, m.id_file_image as id_file
          FROM albums_musics am
          JOIN musics m ON am.id_music = m.id_music
          WHERE m.id_file_image IS NOT NULL
          
          UNION
          
          SELECT am.id_album, l.id_file_image as id_file
          FROM albums_musics am
          JOIN musics m ON am.id_music = m.id_music
          JOIN lyrics l ON m.id_music = l.id_music
          WHERE l.id_file_image IS NOT NULL

          UNION

          SELECT a.id_album, a.id_file_image as id_file
          FROM albums a
          WHERE a.id_file_image IS NOT NULL
        )
        SELECT af.id_album, SUM(f.size) as total_size
        FROM album_files af
        JOIN files f ON af.id_file = f.id_file
        GROUP BY af.id_album
      `;

      const rows = sqlite.prepare(query).all() as { id_album: number; total_size: number }[];

      let sysConfig: Record<string, unknown> = {};
      if (fs.existsSync(sysConfigPath)) {
        const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
        const configDecrypted = decryptData(configEncrypted);
        if (configDecrypted) sysConfig = JSON.parse(configDecrypted);
      }
      const downloadedManifest = (sysConfig["dla"] as (string | number)[]) || [];
      const dlaDates = (sysConfig["dla_dates"] as Record<string, string>) || {};
      let dlaDatesModified = false;

      const sampleMusicRows = sqlite.prepare(`
        SELECT am.id_album, fm.dir, fm.file_name
        FROM albums_musics am
        JOIN musics m ON am.id_music = m.id_music
        JOIN files fm ON fm.id_file = COALESCE(m.id_file_music, m.id_file_instrumental_music)
        GROUP BY am.id_album
      `).all() as { id_album: number; dir: string; file_name: string }[];

      const sampleMusicMap = new Map<number, { dir: string; file_name: string }>();
      for (const row of sampleMusicRows) {
        sampleMusicMap.set(row.id_album, { dir: row.dir, file_name: row.file_name });
      }

      sqlite.close();

      const formatSize = (bytes: number): string => {
        if (!bytes || bytes <= 0) return "---";
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        if (i >= 3) {
          const gb = bytes / Math.pow(k, i);
          return `${gb >= 10 ? gb.toFixed(0) : gb.toFixed(1)} GB`;
        }
        if (i === 2) {
          const mb = Math.round(bytes / Math.pow(k, i));
          return `${mb} MB`;
        }
        return `${Math.round(bytes / Math.pow(k, i))} KB`;
      };

      const result: Record<string, { sizeBytes: number; formattedSize: string; addedAt?: string; folderPath?: string }> = {};

      const resolveFolderForAlbum = (sqliteId: number): string | undefined => {
        const sample = sampleMusicMap.get(sqliteId);
        if (sample && sample.dir) {
          const relativeClean = sample.dir.replace(/^\//, "");
          return path.join(mediaPath, relativeClean);
        }
        return undefined;
      };

      const resolveDateForAlbum = (albumKey: string | number, sqliteId: number): string | undefined => {
        const keyStr = String(albumKey);
        if (dlaDates[keyStr]) return dlaDates[keyStr];

        const isDownloaded = downloadedManifest.some(d => String(d) === keyStr);
        if (!isDownloaded) return undefined;

        let dateStr: string | undefined;
        const sample = sampleMusicMap.get(sqliteId);
        if (sample && sample.dir) {
          const relativeClean = sample.dir.replace(/^\//, "");
          const filePath = sample.file_name ? path.join(mediaPath, relativeClean, sample.file_name) : "";
          const dirPath = path.join(mediaPath, relativeClean);
          if (filePath && fs.existsSync(filePath)) {
            try {
              const stat = fs.statSync(filePath);
              const d = stat.birthtime && stat.birthtime.getFullYear() > 2000 ? stat.birthtime : stat.mtime;
              dateStr = d.toLocaleDateString("pt-BR");
            } catch {
              // ignore
            }
          } else if (fs.existsSync(dirPath)) {
            try {
              const stat = fs.statSync(dirPath);
              const d = stat.birthtime && stat.birthtime.getFullYear() > 2000 ? stat.birthtime : stat.mtime;
              dateStr = d.toLocaleDateString("pt-BR");
            } catch {
              // ignore
            }
          }
        }

        if (!dateStr) {
          dateStr = new Date().toLocaleDateString("pt-BR");
        }

        dlaDates[keyStr] = dateStr;
        dlaDatesModified = true;
        return dateStr;
      };

      for (const row of rows) {
        const sizeBytes = Number(row.total_size) || 0;
        const formattedSize = formatSize(sizeBytes);

        if (row.id_album === 712) {
          const addedAt = resolveDateForAlbum(`hymnal_${lang}`, 712) || resolveDateForAlbum("hymnal", 712);
          const folderPath = resolveFolderForAlbum(712);
          result["hymnal"] = { sizeBytes, formattedSize, addedAt, folderPath };
          result[`hymnal_${lang}`] = { sizeBytes, formattedSize, addedAt, folderPath };
        } else if (row.id_album === 629) {
          const addedAt = resolveDateForAlbum(`hymnal_1996_${lang}`, 629) || resolveDateForAlbum("hymnal_1996", 629);
          const folderPath = resolveFolderForAlbum(629);
          result["hymnal_1996"] = { sizeBytes, formattedSize, addedAt, folderPath };
          result[`hymnal_1996_${lang}`] = { sizeBytes, formattedSize, addedAt, folderPath };
        } else if (row.id_album === 713) {
          const addedAt = resolveDateForAlbum("hymnal_es", 713) || resolveDateForAlbum("hymnal", 713);
          const folderPath = resolveFolderForAlbum(713);
          result["hymnal_es"] = { sizeBytes, formattedSize, addedAt, folderPath };
        } else {
          const addedAt = resolveDateForAlbum(row.id_album, row.id_album);
          const folderPath = resolveFolderForAlbum(row.id_album);
          result[String(row.id_album)] = { sizeBytes, formattedSize, addedAt, folderPath };
        }
      }

      if (dlaDatesModified) {
        sysConfig["dla_dates"] = dlaDates;
        const newEncrypted = encryptData(JSON.stringify(sysConfig));
        if (newEncrypted) {
          fs.writeFileSync(sysConfigPath, newEncrypted, "utf8");
        }
      }

      return result;
    } catch (error) {
      console.error("Erro ao calcular detalhes dos álbuns:", error);
      return {};
    }
  });
}

interface MusicItem {
  id_music: number;
  name: string;
  has_instrumental_music?: number;
  duration?: number;
  lyric?: string;
  albums?: Array<{ id_album?: number; name?: string; type?: string; pivot?: { track?: number } }>;
}

export interface SearchResultMusic {
  id_music: number;
  name: string;
  artist: string;
  hymnal_track: number | null;
  has_instrumental: boolean;
  score?: number;
}

const cachedMusics: Record<string, MusicItem[]> = {};
const cachedTime: Record<string, number> = {};

export async function searchMusics(query: string, lang = "pt", limit = 40): Promise<SearchResultMusic[]> {
  const q = (query || "").trim();
  if (!q) return [];

  const now = Date.now();
  let musics = cachedMusics[lang];
  if (!musics || now - (cachedTime[lang] || 0) > 60000) {
    try {
      const sysDbPath = getSysDbPath(lang);
      const binFile = path.join(sysDbPath, `${lang}_musics.bin`);
      const jsonFile = path.join(sysDbPath, `${lang}_musics.json`);
      const plainFile = path.join(sysDbPath, `${lang}_musics`);
      if (fs.existsSync(binFile)) {
        const encrypted = fs.readFileSync(binFile, "utf8");
        const dec = decryptData(encrypted);
        if (dec) musics = JSON.parse(dec) as MusicItem[];
      } else if (fs.existsSync(jsonFile)) {
        const jsonContent = fs.readFileSync(jsonFile, "utf8");
        musics = JSON.parse(jsonContent) as MusicItem[];
      } else if (fs.existsSync(plainFile)) {
        const plain = fs.readFileSync(plainFile, "utf8");
        musics = JSON.parse(plain) as MusicItem[];
      }

      if (!musics) {
        const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
        if (fs.existsSync(dbPath)) {
          const extractor = new DbExtractor(dbPath, lang);
          musics = (await extractor.repairFile(`${lang}_musics`)) as MusicItem[];
        }
      }

      if (musics && Array.isArray(musics)) {
        cachedMusics[lang] = musics;
        cachedTime[lang] = now;
      }
    } catch (e) {
      console.error("[searchMusics] Erro ao carregar músicas:", e);
    }
  }

  if (!musics || !Array.isArray(musics)) return [];

  const normalize = (str: string) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const normQ = normalize(q);
  const isNum = /^\d+$/.test(q);
  const numVal = isNum ? parseInt(q, 10) : null;

  const results: SearchResultMusic[] = [];

  for (const m of musics) {
    let matched = false;
    let score = 0;
    let hymnalTrack: number | null = null;

    if (m.albums && Array.isArray(m.albums)) {
      for (const al of m.albums) {
        if (al.type === "hymnal" && al.pivot?.track) {
          hymnalTrack = al.pivot.track;
          if (isNum && hymnalTrack === numVal) {
            matched = true;
            score += 100;
          }
        }
      }
    }

    const normName = normalize(m.name);
    if (normName === normQ) {
      matched = true;
      score += 90;
    } else if (normName.startsWith(normQ)) {
      matched = true;
      score += 70;
    } else if (normName.includes(normQ)) {
      matched = true;
      score += 50;
    }

    if (!matched && m.albums && Array.isArray(m.albums)) {
      for (const al of m.albums) {
        const normAl = normalize(al.name || "");
        if (normAl.includes(normQ)) {
          matched = true;
          score += 30;
          break;
        }
      }
    }

    if (!matched && normQ.length >= 3 && m.lyric) {
      const normLyric = normalize(m.lyric);
      if (normLyric.includes(normQ)) {
        matched = true;
        score += 10;
      }
    }

    if (matched) {
      results.push({
        id_music: m.id_music,
        name: m.name,
        artist: m.albums?.[0]?.name || "",
        hymnal_track: hymnalTrack,
        has_instrumental: Boolean(m.has_instrumental_music),
        score,
      });
    }
  }

  results.sort((a, b) => (b.score || 0) - (a.score || 0));
  return results.slice(0, limit);
}

