import { ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import DbExtractor from "./db-extractor";
import { encryptData, decryptData } from "../utils/crypto";
import { getFtpParams } from "../utils/ftp-client";
import { sysDbPath, finalDbPath, flagPath } from "../config/constants";
import * as ftp from "basic-ftp";

export function registerDatabaseHandlers() {
  ipcMain.handle("get-local-db", async (event, filename: string) => {
    try {
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
      
      // Self-Healing Fallback: se o arquivo não existir fisicamente, tentamos recriá-lo a partir do database.db
      if (fs.existsSync(finalDbPath)) {
        console.log(`[self-healing] Arquivo ${filename} ausente. Tentando restaurar a partir do banco de dados...`);
        const extractor = new DbExtractor(finalDbPath);
        const data = await extractor.repairFile(filename);
        if (data) {
          console.log(`[self-healing] Arquivo ${filename} restaurado com sucesso.`);
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao carregar ou reparar o arquivo local ${filename}:`, error);
      return null;
    }
  });

  ipcMain.handle("save-local-db", async (event, filename: string, data: unknown) => {
    try {
      const filePath = path.join(sysDbPath, `${filename}.bin`);
      const jsonString = JSON.stringify(data);
      const encryptedContent = encryptData(jsonString);
      if (encryptedContent) {
        fs.writeFileSync(filePath, encryptedContent, "utf8");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  ipcMain.handle("extract-local-db", async (event) => {
    try {
      if (!fs.existsSync(finalDbPath)) {
        throw new Error(`Arquivo não encontrado em: ${finalDbPath}`);
      }
      
      const extractor = new DbExtractor(finalDbPath);
      await extractor.extract((data) => {
        event.sender.send("extract-progress", data);
      });
      
      // Arquivo database.db e flag mantidos como backup permanente para restauração automática (self-healing)
      
      return true;
    } catch (error) {
      console.error("Erro na extração do banco:", error);
      throw error;
    }
  });

  ipcMain.handle("download-database", async (event) => {
    if (fs.existsSync(flagPath) && fs.existsSync(finalDbPath)) {
      console.log("Banco de dados já foi baixado completamente. Pulando FTP.");
      return true;
    }

    const ftpParams = await getFtpParams();
    const langPrefix = (ftpParams["lang"] || "pt").toLowerCase();
    const remotePath = `${(ftpParams["root"] || "/") + (ftpParams["root"]?.endsWith("/") ? "" : "/")}config/${langPrefix}_database.db`;
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
        
        // Se já existe localmente com tamanho correto, marca como completo
        if (size > 0 && fs.existsSync(finalDbPath)) {
          const localStat = fs.statSync(finalDbPath);
          if (localStat.size === size) {
            console.log("Banco de dados local já existe e está completo. Pulando download e definindo flag.");
            fs.writeFileSync(flagPath, "1");
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
        const tempPath = `${finalDbPath}.downloading`;
        await client.downloadTo(tempPath, remotePath);
        client.close();

        // Download completo: mover temp → final
        if (fs.existsSync(finalDbPath)) {
          fs.unlinkSync(finalDbPath);
        }
        fs.renameSync(tempPath, finalDbPath);
        fs.writeFileSync(flagPath, "1");
        
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
      fs.copyFileSync(oldPath, finalDbPath);
      fs.writeFileSync(flagPath, "1");
      return true;
    } catch (error) {
      console.error("Erro ao importar versão antiga:", error);
      return false;
    }
  });
}
