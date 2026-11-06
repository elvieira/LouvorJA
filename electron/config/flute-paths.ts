/**
 * flute-paths.ts
 *
 * Módulo de gerenciamento dos diretórios da versão Flute.
 * Organiza os arquivos em:
 *   [Flute]/data   -> database.db, .sysconfig.bin, .sysdata_*, avatars/
 *   [Flute]/system -> Arquivos gerados pelo Electron/Chromium (Cache, Cookies, Local Storage, etc.)
 *
 * Todos os nomes de pastas dentro de Flute são em minúsculo.
 */

import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { app } from "electron";

/**
 * Retorna o diretório base da versão Flute.
 * Em produção no Windows: pasta onde o executável reside (ex: C:\Louvor JA\Flute)
 * Em dev ou macOS/Linux: ~/Louvor JA/Flute (ou drive do sistema no Windows)
 */
export function getFluteBasePath(): string {
  if (app.isPackaged) {
    return path.dirname(process.execPath);
  }

  if (process.platform === "win32") {
    const systemDrive = (process.env.SYSTEMDRIVE || "C:").replace(/\\$/, "");
    return path.join(`${systemDrive}\\`, "Louvor JA", "Flute");
  }

  return path.join(os.homedir(), "Louvor JA", "Flute");
}

/**
 * Pasta 'data' dentro de Flute (minúsculo).
 * Contém database.db, .sysconfig.bin, .sysdata_* e avatars/.
 */
export function getFluteDataPath(): string {
  const basePath = getFluteBasePath();
  const newPath = path.join(basePath, "data");
  const oldPath = path.join(basePath, "dados");
  if (fs.existsSync(oldPath)) {
    if (!fs.existsSync(newPath)) {
      try {
        fs.renameSync(oldPath, newPath);
      } catch {
        try {
          fs.cpSync(oldPath, newPath, { recursive: true });
          fs.rmSync(oldPath, { recursive: true, force: true });
        } catch {
          // fallback
        }
      }
    } else {
      try {
        fs.cpSync(oldPath, newPath, { recursive: true });
        fs.rmSync(oldPath, { recursive: true, force: true });
      } catch {
        // fallback
      }
    }
  }
  return newPath;
}

/**
 * Pasta 'system' dentro de Flute (minúsculo).
 * Onde o Electron/Chromium armazena cache, cookies, GPUCache e arquivos gerados automaticamente.
 */
export function getFluteSystemPath(): string {
  const basePath = getFluteBasePath();
  const newPath = path.join(basePath, "system");
  const oldPath = path.join(basePath, "sistema");
  if (fs.existsSync(oldPath)) {
    if (!fs.existsSync(newPath)) {
      try {
        fs.renameSync(oldPath, newPath);
      } catch {
        try {
          fs.cpSync(oldPath, newPath, { recursive: true });
          fs.rmSync(oldPath, { recursive: true, force: true });
        } catch {
          // fallback
        }
      }
    } else {
      try {
        fs.cpSync(oldPath, newPath, { recursive: true });
        fs.rmSync(oldPath, { recursive: true, force: true });
      } catch {
        // fallback
      }
    }
  }
  return newPath;
}

/**
 * Pasta de avatares dos desenvolvedores e colaboradores (específica do Flute).
 * Fica em Flute/data/avatars/ (não na pasta de mídia compartilhada).
 */
export function getFluteAvatarsPath(): string {
  const dataPath = getFluteDataPath();
  const newAvatars = path.join(dataPath, "avatars");
  const oldAvatars = path.join(dataPath, "avatares");
  if (fs.existsSync(oldAvatars)) {
    if (!fs.existsSync(newAvatars)) {
      try {
        fs.renameSync(oldAvatars, newAvatars);
      } catch {
        try {
          fs.cpSync(oldAvatars, newAvatars, { recursive: true });
          fs.rmSync(oldAvatars, { recursive: true, force: true });
        } catch {
          // fallback
        }
      }
    } else {
      try {
        fs.cpSync(oldAvatars, newAvatars, { recursive: true });
        fs.rmSync(oldAvatars, { recursive: true, force: true });
      } catch {
        // fallback
      }
    }
  }
  return newAvatars;
}

/**
 * Retorna o caminho do userData legado do sistema operacional.
 */
export function getLegacyUserDataPath(): string {
  try {
    if (process.platform === "win32") {
      const appData = process.env.APPDATA || "";
      if (appData) return path.join(appData, "Louvor JA");
    } else if (process.platform === "darwin") {
      return path.join(os.homedir(), "Library", "Application Support", "Louvor JA");
    } else {
      return path.join(os.homedir(), ".config", "Louvor JA");
    }
  } catch {
    return "";
  }
  return "";
}

/**
 * Migra dados pré-existentes de versões antigas (que ficavam soltos em %APPDATA%\Louvor JA)
 * para a nova pasta 'data' do Flute.
 */
export function migrateLegacyDataToFlute(): void {
  try {
    // 0. Migra pastas da transição anterior (Flute/dados -> Flute/data e Flute/sistema -> Flute/system)
    const basePath = getFluteBasePath();
    const oldData = path.join(basePath, "dados");
    const newData = path.join(basePath, "data");
    if (fs.existsSync(oldData)) {
      if (!fs.existsSync(newData)) {
        try {
          fs.renameSync(oldData, newData);
        } catch {
          fs.cpSync(oldData, newData, { recursive: true });
          fs.rmSync(oldData, { recursive: true, force: true });
        }
      } else {
        try {
          fs.cpSync(oldData, newData, { recursive: true });
          fs.rmSync(oldData, { recursive: true, force: true });
        } catch {
          // ignora
        }
      }
    }

    const oldSystem = path.join(basePath, "sistema");
    const newSystem = path.join(basePath, "system");
    if (fs.existsSync(oldSystem)) {
      if (!fs.existsSync(newSystem)) {
        try {
          fs.renameSync(oldSystem, newSystem);
        } catch {
          fs.cpSync(oldSystem, newSystem, { recursive: true });
          fs.rmSync(oldSystem, { recursive: true, force: true });
        }
      } else {
        try {
          fs.cpSync(oldSystem, newSystem, { recursive: true });
          fs.rmSync(oldSystem, { recursive: true, force: true });
        } catch {
          // ignora
        }
      }
    }

    const dataPath = getFluteDataPath();
    const avatarsPath = getFluteAvatarsPath();

    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    if (!fs.existsSync(avatarsPath)) {
      fs.mkdirSync(avatarsPath, { recursive: true });
    }

    const legacyUserData = getLegacyUserDataPath();
    if (!legacyUserData || !fs.existsSync(legacyUserData)) return;
    if (path.resolve(legacyUserData).toLowerCase() === path.resolve(dataPath).toLowerCase()) return;

    // 1. Migra .sysconfig.bin se não existir em data/
    const legacySysConfig = path.join(legacyUserData, ".sysconfig.bin");
    const targetSysConfig = path.join(dataPath, ".sysconfig.bin");
    if (fs.existsSync(legacySysConfig) && !fs.existsSync(targetSysConfig)) {
      try {
        fs.copyFileSync(legacySysConfig, targetSysConfig);
      } catch (err: unknown) {
        console.warn("[flute-paths] Não foi possível copiar .sysconfig.bin legado:", err);
      }
    }

    // 2. Migra bancos de dados SQLite (database_pt.db, database_es.db, database.db) e liturgy.json
    try {
      const legacyItems = fs.readdirSync(legacyUserData);
      for (const item of legacyItems) {
        const src = path.join(legacyUserData, item);
        const dst = path.join(dataPath, item);

        // Bancos SQLite e arquivos JSON de configuração/liturgia
        if (
          (item.startsWith("database") && item.endsWith(".db")) ||
          item === "liturgy.json"
        ) {
          if (fs.existsSync(src) && !fs.existsSync(dst)) {
            try {
              fs.copyFileSync(src, dst);
            } catch (err: unknown) {
              console.warn(`[flute-paths] Não foi possível copiar ${item}:`, err);
            }
          }
        }

        // 3. Migra pastas de dados de idioma (.sysdata_pt, .sysdata_es, etc.) recursivamente
        if (item.startsWith(".sysdata_")) {
          const srcStat = fs.statSync(src);
          if (srcStat.isDirectory()) {
            const srcFiles = fs.readdirSync(src);
            const dstFiles = fs.existsSync(dst) ? fs.readdirSync(dst) : [];
            // Se destino não existir ou estiver vazio e origem contiver dados
            if (srcFiles.length > 0 && dstFiles.length === 0) {
              try {
                fs.cpSync(src, dst, { recursive: true, force: true });
              } catch (err: unknown) {
                console.warn(`[flute-paths] Não foi possível copiar diretório ${item}:`, err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("[flute-paths] Erro ao varrer legacyUserData:", err);
    }

    // 4. Migra avatares antigos se existirem em Media/avatars no userData legado
    const legacyAvatars = path.join(legacyUserData, "Media", "avatars");
    if (fs.existsSync(legacyAvatars)) {
      try {
        const avatarFiles = fs.readdirSync(legacyAvatars);
        for (const file of avatarFiles) {
          const src = path.join(legacyAvatars, file);
          const dst = path.join(avatarsPath, file);
          if (fs.existsSync(src) && !fs.existsSync(dst)) {
            fs.copyFileSync(src, dst);
          }
        }
      } catch {
        // ignora
      }
    }
  } catch (e: unknown) {
    console.error("[flute-paths] Erro durante migração de dados do Flute:", e);
  }
}
