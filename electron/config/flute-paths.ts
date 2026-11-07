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
 * Verifica se existem dados de uma instalação anterior no AppData do sistema.
 */
export function hasLegacyData(): boolean {
  try {
    const legacyPath = getLegacyUserDataPath();
    if (!legacyPath || !fs.existsSync(legacyPath)) return false;

    // Verifica se possui .sysconfig.bin
    const legacySysConfig = path.join(legacyPath, ".sysconfig.bin");
    if (fs.existsSync(legacySysConfig)) return true;

    // Ou se possui bancos de dados SQLite ou pastas de dados
    const items = fs.readdirSync(legacyPath);
    return items.some(
      (item) =>
        (item.startsWith("database") && item.endsWith(".db")) ||
        item.startsWith(".sysdata_")
    );
  } catch {
    return false;
  }
}

/**
 * Copia uma pasta recursivamente tolerando erros individuais em arquivos.
 * Permite até maxErrors (padrão 40) antes de interromper.
 */
export function safeCopyDirectory(srcDir: string, dstDir: string, maxErrors = 40): { copied: number; errors: number } {
  let copied = 0;
  let errors = 0;
  if (!fs.existsSync(dstDir)) {
    try {
      fs.mkdirSync(dstDir, { recursive: true });
    } catch {
      return { copied, errors: 1 };
    }
  }
  try {
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcItem = path.join(srcDir, entry.name);
      const dstItem = path.join(dstDir, entry.name);
      if (entry.isDirectory()) {
        const sub = safeCopyDirectory(srcItem, dstItem, maxErrors - errors);
        copied += sub.copied;
        errors += sub.errors;
        if (errors >= maxErrors) break;
      } else {
        try {
          fs.copyFileSync(srcItem, dstItem);
          copied++;
        } catch (copyErr) {
          errors++;
          console.warn(`[flute-paths] Erro ao copiar ${entry.name} (${errors}/${maxErrors}):`, copyErr);
          if (errors >= maxErrors) break;
        }
      }
    }
  } catch (readErr) {
    console.warn(`[flute-paths] Erro ao ler pasta ${srcDir}:`, readErr);
  }
  return { copied, errors };
}

/**
 * Exclui a pasta de instalação padrão da versão anterior:
 *   %LOCALAPPDATA%\Programs\Louvor JA
 * e todos os arquivos/pastas de %APPDATA%\Louvor JA COM EXCEÇÃO da subpasta 'Media'.
 */
export function cleanLegacyInstallationAndData(legacyUserData: string): void {
  // 1. Exclui a pasta de instalação da versão anterior em AppData\Local\Programs\Louvor JA
  try {
    const localPrograms = path.join(
      process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
      "Programs",
      "Louvor JA"
    );
    const fluteBase = getFluteBasePath();
    if (
      fs.existsSync(localPrograms) &&
      path.resolve(localPrograms).toLowerCase() !== path.resolve(fluteBase).toLowerCase()
    ) {
      try {
        fs.rmSync(localPrograms, { recursive: true, force: true });
        console.log("[flute-paths] Pasta da versão anterior em AppData\\Local\\Programs\\Louvor JA removida com sucesso.");
      } catch (rmErr) {
        console.warn("[flute-paths] Falha ao remover pasta anterior completa, tentando arquivo por arquivo:", rmErr);
        try {
          const walk = (d: string) => {
            for (const f of fs.readdirSync(d, { withFileTypes: true })) {
              const p = path.join(d, f.name);
              if (f.isDirectory()) walk(p);
              else { try { fs.rmSync(p, { force: true }); } catch {} }
            }
            try { fs.rmdirSync(d); } catch {}
          };
          walk(localPrograms);
        } catch {}
      }
    }
  } catch (err) {
    console.warn("[flute-paths] Aviso ao tentar remover pasta anterior em Local\\Programs:", err);
  }

  // 2. Exclui todos os arquivos da pasta AppData\Roaming\Louvor JA com EXCEÇÃO de 'Media'
  try {
    if (legacyUserData && fs.existsSync(legacyUserData)) {
      const fluteData = getFluteDataPath();
      if (path.resolve(legacyUserData).toLowerCase() !== path.resolve(fluteData).toLowerCase()) {
        const items = fs.readdirSync(legacyUserData);
        for (const item of items) {
          if (item.toLowerCase() === "media") {
            // PRESERVA a pasta de mídia até a migração de mídia ser concluída
            continue;
          }
          const itemPath = path.join(legacyUserData, item);
          try {
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`[flute-paths] Item legado removido: ${item}`);
          } catch (itemErr) {
            console.warn(`[flute-paths] Não foi possível remover item legado ${item}:`, itemErr);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[flute-paths] Aviso na limpeza de dados legados do Roaming:", err);
  }
}

/**
 * Migra dados pré-existentes de versões antigas (que ficavam soltos em %APPDATA%\Louvor JA)
 * para a nova pasta 'data' e 'system' do Flute.
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
    const systemPath = getFluteSystemPath();
    const avatarsPath = getFluteAvatarsPath();

    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    if (!fs.existsSync(systemPath)) {
      fs.mkdirSync(systemPath, { recursive: true });
    }
    if (!fs.existsSync(avatarsPath)) {
      fs.mkdirSync(avatarsPath, { recursive: true });
    }

    const legacyUserData = getLegacyUserDataPath();
    if (!legacyUserData || !fs.existsSync(legacyUserData)) return;
    if (path.resolve(legacyUserData).toLowerCase() === path.resolve(dataPath).toLowerCase()) return;

    // Se não há dados legados (instalação limpa), não faz nada
    if (!hasLegacyData()) return;

    const migrationMarker = path.join(dataPath, ".legacy_migrated.json");
    const targetSysConfig = path.join(dataPath, ".sysconfig.bin");

    // Se já foi migrado e o .sysconfig.bin de destino existe e tem conteúdo, não precisa refazer
    const alreadyMigrated =
      fs.existsSync(migrationMarker) &&
      fs.existsSync(targetSysConfig) &&
      fs.statSync(targetSysConfig).size > 50;
    if (alreadyMigrated) {
      // Garante a limpeza da instalação antiga e dos dados legados (exceto Media)
      cleanLegacyInstallationAndData(legacyUserData);
      return;
    }

    console.log("[flute-paths] Detectada instalação da versão anterior em:", legacyUserData);
    console.log("[flute-paths] Migrando dados e configurações para o Flute:", dataPath);

    // 1. Migra .sysconfig.bin (copia/sobrescreve para garantir que as configurações legadas sejam carregadas)
    const legacySysConfig = path.join(legacyUserData, ".sysconfig.bin");
    if (fs.existsSync(legacySysConfig)) {
      try {
        fs.copyFileSync(legacySysConfig, targetSysConfig);
        console.log("[flute-paths] .sysconfig.bin copiado com sucesso para", targetSysConfig);
      } catch (err: unknown) {
        console.error("[flute-paths] Não foi possível copiar .sysconfig.bin legado:", err);
      }
    }

    // 2. Migra bancos de dados SQLite (database_pt.db, database_es.db, database.db, etc.) e liturgy.json
    try {
      const legacyItems = fs.readdirSync(legacyUserData);
      for (const item of legacyItems) {
        const src = path.join(legacyUserData, item);
        const dst = path.join(dataPath, item);

        // Bancos SQLite (*.db, *.db-journal, *.db-wal, *.db-shm) e arquivos JSON de configuração/liturgia
        if (
          (item.startsWith("database") && (item.endsWith(".db") || item.includes(".db-"))) ||
          item.toLowerCase().includes("liturg") ||
          (item.endsWith(".db") && !fs.existsSync(dst))
        ) {
          try {
            fs.copyFileSync(src, dst);
            console.log(`[flute-paths] Arquivo ${item} migrado com sucesso.`);
          } catch (err: unknown) {
            console.error(`[flute-paths] Não foi possível copiar ${item}:`, err);
          }
        }

        // 3. Migra pastas de dados de idioma (.sysdata_pt, .sysdata_es, etc.) recursivamente com tolerância
        if (item.startsWith(".sysdata_")) {
          const srcStat = fs.statSync(src);
          if (srcStat.isDirectory()) {
            const res = safeCopyDirectory(src, dst, 40);
            console.log(`[flute-paths] Pasta ${item} migrada (${res.copied} arquivos copiados, ${res.errors} erros tolerados).`);
          }
        }
      }
    } catch (err) {
      console.error("[flute-paths] Erro ao varrer legacyUserData:", err);
    }

    // 4. Migra avatares antigos se existirem em Media/avatars no userData legado
    const legacyAvatars = path.join(legacyUserData, "Media", "avatars");
    if (fs.existsSync(legacyAvatars)) {
      try {
        const avatarFiles = fs.readdirSync(legacyAvatars);
        for (const file of avatarFiles) {
          const src = path.join(legacyAvatars, file);
          const dst = path.join(avatarsPath, file);
          try {
            fs.copyFileSync(src, dst);
          } catch {
            // ignora
          }
        }
        console.log("[flute-paths] Avatares legados copiados com sucesso.");
      } catch {
        // ignora
      }
    }
    const legacyAvatarsAlt = path.join(legacyUserData, "avatars");
    if (fs.existsSync(legacyAvatarsAlt)) {
      try {
        const avatarFiles = fs.readdirSync(legacyAvatarsAlt);
        for (const file of avatarFiles) {
          const src = path.join(legacyAvatarsAlt, file);
          const dst = path.join(avatarsPath, file);
          try {
            fs.copyFileSync(src, dst);
          } catch {
            // ignora
          }
        }
      } catch {
        // ignora
      }
    }

    // 5. Migra Local Storage (preferências do usuário salvas no Chromium: tema, volume, etc.)
    const legacyLocalStorage = path.join(legacyUserData, "Local Storage");
    const targetLocalStorage = path.join(systemPath, "Local Storage");
    if (fs.existsSync(legacyLocalStorage)) {
      const res = safeCopyDirectory(legacyLocalStorage, targetLocalStorage, 40);
      console.log(`[flute-paths] Local Storage migrado (${res.copied} arquivos, ${res.errors} erros).`);
    }

    const legacyUpdaterId = path.join(legacyUserData, ".updaterId");
    const targetUpdaterId = path.join(systemPath, ".updaterId");
    if (fs.existsSync(legacyUpdaterId) && !fs.existsSync(targetUpdaterId)) {
      try {
        fs.copyFileSync(legacyUpdaterId, targetUpdaterId);
      } catch {
        // ignora
      }
    }

    // 6. Grava marcador de migração concluída
    try {
      fs.writeFileSync(
        migrationMarker,
        JSON.stringify(
          {
            migratedAt: new Date().toISOString(),
            source: legacyUserData,
            destination: dataPath,
          },
          null,
          2
        ),
        "utf8"
      );
      console.log("[flute-paths] Marcador de migração gravado com sucesso.");
    } catch (err: unknown) {
      console.error("[flute-paths] Erro ao salvar marcador de migração:", err);
    }

    // 7. Após completo sucesso da migração dos dados, limpa a instalação antiga e dados legados (exceto Media)
    cleanLegacyInstallationAndData(legacyUserData);
  } catch (e: unknown) {
    console.error("[flute-paths] Erro durante migração de dados do Flute:", e);
  }
}
