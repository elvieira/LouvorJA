import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import {
  resolveMediaPath,
  resolveMusicPath,
  resolveImagesPath,
  resolveCoversPath,
  resolveAvatarsPath,
  isMediaPathConfigured,
  needsMediaPathMigration,
  getDefaultSharedMediaPath,
  isMigrationInterrupted,
} from "./media-path";
import {
  getFluteBasePath,
  getFluteDataPath,
  getFluteSystemPath,
  getLegacyUserDataPath,
  migrateLegacyDataToFlute,
} from "./flute-paths";

// Chave estática para ofuscação (não é segurança alta, apenas ofuscação)
export const ENCRYPTION_KEY = Buffer.from("v389s8dkj238910s8a7d3h2j1k9s8d7f", "utf8");
export const IV_LENGTH = 16;

// Força o nome do app
app.setName("Louvor JA Flute");

// Executa migração de configurações legadas (AppData) para Flute/data
migrateLegacyDataToFlute();

// Redireciona userData do Electron para Flute/system para isolar cache/cookies/storage
const fluteSystem = getFluteSystemPath();
if (!fs.existsSync(fluteSystem)) {
  fs.mkdirSync(fluteSystem, { recursive: true });
}
try {
  app.setPath("userData", fluteSystem);
} catch {
  // Ignora se invocado após ready
}

export const userDataPath = fluteSystem;
export const fluteDataPath = getFluteDataPath();

// Garante que a pasta data exista
if (!fs.existsSync(fluteDataPath)) {
  fs.mkdirSync(fluteDataPath, { recursive: true });
}

// Arquivos de dados e configurações do usuário ficam em Flute/data/
export function getSysDbPath(lang = "pt"): string {
  const p = path.join(getFluteDataPath(), `.sysdata_${lang}`);
  if (!fs.existsSync(p) || (fs.existsSync(p) && fs.readdirSync(p).length === 0)) {
    const legacy = path.join(getLegacyUserDataPath(), `.sysdata_${lang}`);
    if (fs.existsSync(legacy) && fs.readdirSync(legacy).length > 0) {
      return legacy;
    }
  }
  return p;
}

export function getDatabasePath(lang = "pt"): string {
  const p = path.join(getFluteDataPath(), `database_${lang}.db`);
  if (!fs.existsSync(p)) {
    const legacy = path.join(getLegacyUserDataPath(), `database_${lang}.db`);
    if (fs.existsSync(legacy)) return legacy;
  }
  return p;
}

export function getLiturgyPath(): string {
  const p = path.join(getFluteDataPath(), "liturgy.json");
  if (!fs.existsSync(p)) {
    const legacy = path.join(getLegacyUserDataPath(), "liturgy.json");
    if (fs.existsSync(legacy)) return legacy;
  }
  return p;
}

export const sysConfigPath = path.join(getFluteDataPath(), ".sysconfig.bin");
export const oldDbPath = path.join(getFluteDataPath(), "database");
export const finalDbPath = path.join(getFluteDataPath(), "database.db");

export const isDev = !app.isPackaged;

// ─── Caminhos de Mídia Dinâmicos com Resolução Inteligente ───────────────────

export function getMediaPath(): string {
  return resolveMediaPath();
}

/**
 * Resolve inteligentemente a pasta de músicas (musicas, musics, ou por áudio)
 */
export function getMusicPath(): string {
  return resolveMusicPath();
}

/**
 * Resolve inteligentemente a pasta de imagens/slides (imagens, images, slides, etc.)
 */
export function getSlidesPath(): string {
  return resolveImagesPath();
}

/**
 * Resolve inteligentemente a pasta de capas (capas, covers, etc.)
 */
export function getCoversPath(): string {
  return resolveCoversPath();
}

/**
 * Avatares específicos do Flute (ficam em Flute/data/avatars/, não em Media)
 */
export function getAvatarsPath(): string {
  return resolveAvatarsPath();
}

// ─── Aliases estáticos (DEPRECATED — usar getters acima) ─────────────────────
/** @deprecated Use getMediaPath() */
export const mediaPath = getMediaPath();
/** @deprecated Use getCoversPath() */
export const coversPath = getCoversPath();
/** @deprecated Use getMusicPath() */
export const musicPath = getMusicPath();
/** @deprecated Use getSlidesPath() */
export const slidesPath = getSlidesPath();
/** @deprecated Use getAvatarsPath() */
export const avatarsPath = getAvatarsPath();

export {
  getFluteBasePath,
  getFluteDataPath,
  getFluteSystemPath,
  getLegacyUserDataPath,
  isMediaPathConfigured,
  needsMediaPathMigration,
  getDefaultSharedMediaPath,
  isMigrationInterrupted,
};
