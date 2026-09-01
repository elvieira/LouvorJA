import { ipcMain, app } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import DbExtractor from "./db-extractor";
import { encryptData, decryptData } from "../utils/crypto";
import { getFtpParams } from "../utils/ftp-client";
import { SQLiteHelper } from "../utils/sqlite";
import { getSysDbPath, sysConfigPath, finalDbPath } from "../config/constants";
import * as ftp from "basic-ftp";

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
      console.log(`[searchBible] Searching in ${dbPath} for '${query}' (versionId: ${versionId}, mode: ${mode})`);
      if (!fs.existsSync(dbPath)) {
        console.error(`[searchBible] ERROR: File not found at ${dbPath}`);
        return [];
      }

      const db = new SQLiteHelper(dbPath);
      await db.connect();

      try {
        if (mode === "text") {
          // Busca textual simples com LIKE (sql.js não suporta MATCH facilmente sem FTS configurado no banco original)
          // Mas podemos dividir as palavras da query
          const cleanQuery = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          if (!cleanQuery) return [];
          
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
          
          sqlQuery += " LIMIT 100"; // Limitar resultados para não travar
          
          const results = db.prepare(sqlQuery).all(...params);
          console.log(`[searchBible] Query successful, found ${results.length} results.`);
          return results;
        }
      } finally {
        db.close();
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
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Arquivo não encontrado em: ${dbPath}`);
      }
      
      const extractor = new DbExtractor(dbPath, lang);
      await extractor.extract((data) => {
        event.sender.send("extract-progress", data);
      });
      
      return true;
    } catch (error) {
      console.error("Erro na extração do banco:", error);
      throw error;
    }
  });

  ipcMain.handle("download-database", async (event, lang: string = "pt", force: boolean = false) => {
    const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
    if (fs.existsSync(dbPath) && force) {
      try { 
        fs.unlinkSync(dbPath); 
      } catch (e) { 
        console.error("Erro ao deletar banco de dados local:", e); 
      }
    }

    const ftpParams = await getFtpParams(lang);
    const langPrefix = (ftpParams["lang"] || lang).toLowerCase();
    const remoteFilename = `${langPrefix}_database.db`;
    const remotePath = `${(ftpParams["root"] || "/") + (ftpParams["root"]?.endsWith("/") ? "" : "/")}config/${remoteFilename}`;
    const port = parseInt(ftpParams["port"] || "21");

    // Estratégias de conexão: tenta FTP normal primeiro, depois FTPS como fallback
    const strategies = [
      { name: "FTP", secure: false },
      { name: "FTP (retry)", secure: false },
      { name: "FTPS (TLS)", secure: true },
    ];

    let lastError: unknown = null;

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      const client = new ftp.Client();
      client.ftp.verbose = false;

      // Força PASV tradicional (driblando firewalls/NATs que falham no EPSV)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const transfer = require("basic-ftp/dist/transfer");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).prepareTransfer = transfer.enterPassiveModeIPv4;

      try {
        console.log(`[download-database] Tentativa ${i + 1}/${strategies.length} via ${strategy.name}...`);

        const accessOpts: ftp.AccessOptions = {
          host: ftpParams["host"],
          user: ftpParams["username"],
          password: ftpParams["password"],
          port,
          secure: strategy.secure,
          ...(strategy.secure ? { secureOptions: { rejectUnauthorized: false } } : {}),
        };

        await client.access(accessOpts);

        // Ativar TCP KeepAlive
        if (client.ftp && client.ftp.socket) {
          client.ftp.socket.setKeepAlive(true, 10000); // ping a cada 10s
          client.ftp.socket.setTimeout(120000); // timeout de 2min
        }

        let size = 0;
        try {
          size = await client.size(remotePath);
        } catch (e: unknown) {
          console.warn("Não foi possível obter o tamanho do arquivo via FTP:", (e as Error).message);
        }
        
        // Se já existe localmente com tamanho correto (e não forçamos), marca como completo
        if (size > 0 && fs.existsSync(dbPath) && !force) {
          const localStat = fs.statSync(dbPath);
          if (localStat.size === size) {
            console.log("Banco de dados local já existe e está completo. Pulando download.");
            client.close();
            return true;
          }
        }
        
        client.trackProgress(info => {
          if (size > 0) {
            const percent = Math.floor((info.bytesOverall / size) * 100);
            event.sender.send("download-db-progress", { progress: percent });
          }
        });

        // Baixar para arquivo temporário para evitar corrupção em caso de falha
        const tempPath = `${dbPath}.downloading`;
        await client.downloadTo(tempPath, remotePath);
        client.close();

        // Download completo: mover temp → final
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
        }
        fs.renameSync(tempPath, dbPath);
        
        console.log(`[download-database] Download concluído com sucesso via ${strategy.name}`);
        return true;

      } catch (error: unknown) {
        lastError = error;
        console.error(`[download-database] Falha via ${strategy.name}: ${(error as Error).message}`);
        try { client.close(); } catch { console.error("FTP close error"); }

        // Limpar arquivo temporário corrompido
        const tempPath = `${finalDbPath}.downloading`;
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch { console.error("Unlink error"); }
        }

        // Aguardar antes da próxima tentativa (backoff exponencial)
        if (i < strategies.length - 1) {
          const waitTime = 3000 * (i + 1); // 3s, 6s
          console.log(`[download-database] Aguardando ${waitTime / 1000}s antes da próxima tentativa...`);
          await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }

    // Todas as estratégias falharam
    console.error("Erro no download do banco: Todas as estratégias falharam.", lastError);
    throw lastError;
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
    return fs.existsSync(dbPath);
  });
}
