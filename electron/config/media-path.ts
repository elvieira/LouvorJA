/**
 * media-path.ts
 *
 * Módulo ISOLADO de resolução do caminho de mídia e de subpastas inteligentes.
 *
 * Subpastas oficiais em Media (português):
 *   - musicas
 *   - imagens
 *   - capas
 *
 * Avatares ficam em: Flute/data/avatars (específico do Flute).
 *
 * Sistema Inteligente:
 * 1. Tenta correspondência por nomes conhecidos (plurais, singulares, inglês, português, acentuados)
 * 2. Se nenhuma for encontrada, faz inspeção profunda por conteúdo (extensões de áudio, imagens)
 * 3. Fallback para nomes oficiais padrão
 */

import * as crypto from "crypto";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { getFluteBasePath, getFluteDataPath, getFluteAvatarsPath, getLegacyUserDataPath } from "./flute-paths";

// Chave estática para ofuscação (mesma de constants.ts sem import para evitar dependência circular)
const ENCRYPTION_KEY = Buffer.from("v389s8dkj238910s8a7d3h2j1k9s8d7f", "utf8");

// Extensões para inspeção inteligente por conteúdo
const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".ogg", ".wav", ".aac", ".flac", ".opus", ".wma"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"]);

// Nomes de subpastas conhecidos ordenados por prioridade (solicitados pelo usuário)
export const KNOWN_MUSIC_SUBDIRS = [
  "musicas", "Musicas", "músicas", "Músicas",
  "musics", "Musics", "music", "Music",
];

export const KNOWN_IMAGE_SUBDIRS = [
  "imagens", "Imagens", "Imagem", "imagem",
  "images", "Images", "Image", "image",
  "slides", "Slides", "Slide", "slide",
];

export const KNOWN_COVER_SUBDIRS = [
  "capas", "Capas", "Capa", "capa",
  "covers", "Covers", "cover", "Cover",
];

function decryptSysConfig(text: string): Record<string, unknown> | null {
  try {
    const textParts = text.split(":");
    if (textParts.length !== 2) return null;
    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = Buffer.from(textParts[1], "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

/**
 * Retorna o caminho do sysconfig.bin.
 * Prioriza Flute/data/.sysconfig.bin; faz fallback para AppData caso exista lá.
 */
export function getSysConfigPath(): string {
  const newPath = path.join(getFluteDataPath(), ".sysconfig.bin");
  if (fs.existsSync(newPath)) return newPath;

  // Fallback: se existir no userData legado
  try {
    const legacyUser = getLegacyUserDataPath();
    if (legacyUser) {
      const legacyPath = path.join(legacyUser, ".sysconfig.bin");
      if (fs.existsSync(legacyPath)) return legacyPath;
    }
  } catch {
    // ignora
  }

  return newPath;
}

/**
 * Lê o caminho de mídia configurado pelo usuário no sysconfig.bin.
 */
function readConfiguredMediaPath(): string | null {
  try {
    const sysConfigPath = getSysConfigPath();
    if (!fs.existsSync(sysConfigPath)) return null;
    const encrypted = fs.readFileSync(sysConfigPath, "utf8");
    const config = decryptSysConfig(encrypted);
    if (config && typeof config["media_path"] === "string" && config["media_path"]) {
      return config["media_path"] as string;
    }
    return null;
  } catch {
    return null;
  }
}

function resolveWindowsDefaultMediaPath(): string {
  try {
    const fluteBase = getFluteBasePath();
    const parentDir = path.dirname(fluteBase);
    if (path.basename(parentDir).toLowerCase() === "louvor ja") {
      return path.join(parentDir, "Media");
    }
  } catch {
    // fallback
  }
  const systemDrive = (process.env.SYSTEMDRIVE || "C:").replace(/\\$/, "");
  return path.join(`${systemDrive}\\`, "Louvor JA", "Media");
}

function resolveUnixDefaultMediaPath(): string {
  return path.join(os.homedir(), "Louvor JA", "Media");
}

/**
 * Retorna o diretório padrão de mídias (Louvor JA/Media).
 * Windows: C:\Louvor JA\Media
 * macOS / Linux: ~/Louvor JA/Media
 */
export function getDefaultSharedMediaPath(): string {
  return process.platform === "win32"
    ? resolveWindowsDefaultMediaPath()
    : resolveUnixDefaultMediaPath();
}

/**
 * Caminho antigo (legado) para retrocompatibilidade.
 */
export function getLegacyMediaPath(): string {
  const legacyUser = getLegacyUserDataPath();
  if (legacyUser) {
    return path.join(legacyUser, "Media");
  }
  return path.join(os.homedir(), "Louvor JA", "Media");
}

/**
 * Indica se o usuário configurou/marcou explicitamente o caminho de mídia no sysconfig.bin.
 */
export function isMediaPathConfigured(): boolean {
  return readConfiguredMediaPath() !== null;
}

/**
 * Resolve o caminho base de mídia.
 * - Se configurado no sysconfig.bin, usa o caminho configurado.
 * - Se não estiver configurado, e o local legado possuir conteúdo de mídia, usa o legado.
 * - Caso contrário, usa o novo diretório padrão compartilhado.
 */
export function resolveMediaPath(): string {
  const configured = readConfiguredMediaPath();
  if (configured) return configured;

  const legacy = getLegacyMediaPath();
  if (hasMediaContent(legacy)) {
    return legacy;
  }

  const newDefault =
    process.platform === "win32"
      ? resolveWindowsDefaultMediaPath()
      : resolveUnixDefaultMediaPath();

  return newDefault;
}

// ─── INSPEÇÃO INTELIGENTE DE SUBPASTAS ─────────────────────────────────────────

function dirContainsAudio(dir: string, depth = 0): boolean {
  if (depth > 2 || !fs.existsSync(dir)) return false;
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) return true;
      } else if (item.isDirectory() && depth < 2) {
        if (dirContainsAudio(path.join(dir, item.name), depth + 1)) return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function dirContainsImages(dir: string, depth = 0): boolean {
  if (depth > 2 || !fs.existsSync(dir)) return false;
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) return true;
      } else if (item.isDirectory() && depth < 1) {
        if (dirContainsImages(path.join(dir, item.name), depth + 1)) return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Inspeciona as subpastas de um diretório base pelo conteúdo real dos arquivos
 * caso nenhuma pasta com nome convencional seja encontrada.
 */
function inspectSubdirectoriesByContent(baseDir: string): {
  musicDir: string | null;
  imagesDir: string | null;
  coversDir: string | null;
} {
  const result: { musicDir: string | null; imagesDir: string | null; coversDir: string | null } = {
    musicDir: null,
    imagesDir: null,
    coversDir: null,
  };

  if (!fs.existsSync(baseDir)) return result;

  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const subdirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const name of subdirs) {
      const full = path.join(baseDir, name);
      const lower = name.toLowerCase();

      // Músicas: contém arquivos de áudio
      if (!result.musicDir && dirContainsAudio(full)) {
        result.musicDir = full;
        continue;
      }

      // Capas: nome sugere capas ou contém imagens
      if (
        !result.coversDir &&
        (lower.includes("capa") || lower.includes("cover") || lower.includes("art")) &&
        dirContainsImages(full)
      ) {
        result.coversDir = full;
        continue;
      }

      // Imagens / Slides: nome sugere slide/imagem ou contém imagens
      if (
        !result.imagesDir &&
        (lower.includes("slide") || lower.includes("image") || lower.includes("fundo") || lower.includes("foto") || lower.includes("tela")) &&
        dirContainsImages(full)
      ) {
        result.imagesDir = full;
        continue;
      }

      // Fallback por presença de imagens
      if (dirContainsImages(full)) {
        if (!result.imagesDir) {
          result.imagesDir = full;
        } else if (!result.coversDir) {
          result.coversDir = full;
        }
      }
    }
  } catch {
    // falha silenciosa
  }

  return result;
}

/**
 * Resolve inteligentemente a pasta de músicas.
 * 1. Nomes conhecidos (musicas, Musicas, músicas, musics, music, etc.)
 * 2. Inspeção de conteúdo
 * 3. Padrão: [baseDir]/musicas
 */
export function resolveMusicPath(baseDir: string = resolveMediaPath()): string {
  for (const name of KNOWN_MUSIC_SUBDIRS) {
    const p = path.join(baseDir, name);
    if (fs.existsSync(p)) return p;
  }

  const inspected = inspectSubdirectoriesByContent(baseDir);
  if (inspected.musicDir) return inspected.musicDir;

  return path.join(baseDir, "musicas");
}

/**
 * Resolve inteligentemente a pasta de imagens/slides.
 * 1. Nomes conhecidos (imagens, Imagens, Imagem, images, slides, etc.)
 * 2. Inspeção de conteúdo
 * 3. Padrão: [baseDir]/imagens
 */
export function resolveImagesPath(baseDir: string = resolveMediaPath()): string {
  for (const name of KNOWN_IMAGE_SUBDIRS) {
    const p = path.join(baseDir, name);
    if (fs.existsSync(p)) return p;
  }

  const inspected = inspectSubdirectoriesByContent(baseDir);
  if (inspected.imagesDir) return inspected.imagesDir;

  return path.join(baseDir, "imagens");
}

/**
 * Resolve inteligentemente a pasta de capas de álbuns.
 * 1. Nomes conhecidos (capas, Capas, Capa, covers, cover, etc.)
 * 2. Inspeção de conteúdo
 * 3. Padrão: [baseDir]/capas
 */
export function resolveCoversPath(baseDir: string = resolveMediaPath()): string {
  for (const name of KNOWN_COVER_SUBDIRS) {
    const p = path.join(baseDir, name);
    if (fs.existsSync(p)) return p;
  }

  const inspected = inspectSubdirectoriesByContent(baseDir);
  if (inspected.coversDir) return inspected.coversDir;

  return path.join(baseDir, "capas");
}

/**
 * Resolve a pasta de avatares dos desenvolvedores/colaboradores.
 * Fica em Flute/data/avatars/ (específica do Flute, não fica na Media compartilhada).
 */
export function resolveAvatarsPath(): string {
  return getFluteAvatarsPath();
}

/**
 * Verifica se o diretório candidato possui mídias (em qualquer subpasta conhecida ou por conteúdo).
 */
function hasMediaContent(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;

  for (const n of KNOWN_MUSIC_SUBDIRS) {
    if (fs.existsSync(path.join(dir, n))) return true;
  }
  for (const n of KNOWN_IMAGE_SUBDIRS) {
    if (fs.existsSync(path.join(dir, n))) return true;
  }
  for (const n of KNOWN_COVER_SUBDIRS) {
    if (fs.existsSync(path.join(dir, n))) return true;
  }

  const inspected = inspectSubdirectoriesByContent(dir);
  return Boolean(inspected.musicDir || inspected.imagesDir || inspected.coversDir);
}

/**
 * Verifica se precisa de migração do caminho de mídia legado.
 */
export function needsMediaPathMigration(): boolean {
  const configured = readConfiguredMediaPath();
  if (configured) return false;

  const legacy = getLegacyMediaPath();
  const suggested = getDefaultSharedMediaPath();
  if (path.resolve(legacy).toLowerCase() === path.resolve(suggested).toLowerCase()) {
    return false;
  }

  return hasMediaContent(legacy);
}

/**
 * Salva o novo caminho de mídia configurado no sysconfig.bin dentro de Flute/data/.
 */
export function saveMediaPath(newMediaPath: string): boolean {
  try {
    const fluteDataDir = getFluteDataPath();
    if (!fs.existsSync(fluteDataDir)) {
      fs.mkdirSync(fluteDataDir, { recursive: true });
    }

    const currentSysConfig = getSysConfigPath();
    let sysConfig: Record<string, unknown> = {};

    if (fs.existsSync(currentSysConfig)) {
      const encrypted = fs.readFileSync(currentSysConfig, "utf8");
      const decrypted = decryptSysConfig(encrypted);
      if (decrypted) sysConfig = decrypted;
    }

    sysConfig["media_path"] = newMediaPath;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(JSON.stringify(sysConfig), "utf8", "hex");
    encrypted += cipher.final("hex");
    const result = `${iv.toString("hex")}:${encrypted}`;

    // Salva sempre no novo destino Flute/data/.sysconfig.bin
    const targetFile = path.join(fluteDataDir, ".sysconfig.bin");
    fs.writeFileSync(targetFile, result, "utf8");
    return true;
  } catch (e: unknown) {
    console.error("[media-path] Erro ao salvar media_path no sysconfig:", e);
    return false;
  }
}

/**
 * Varre todos os discos/volumes em busca de pastas Louvor JA/Media existentes.
 */
export async function scanForExistingMediaPaths(): Promise<string[]> {
  const found: string[] = [];
  const currentMediaPath = resolveMediaPath();

  if (process.platform === "win32") {
    for (let code = 67; code <= 90; code++) { // C a Z
      const letter = String.fromCharCode(code);
      const candidate = path.join(`${letter}:\\`, "Louvor JA", "Media");
      try {
        if (
          fs.existsSync(candidate) &&
          candidate.toLowerCase() !== currentMediaPath.toLowerCase()
        ) {
          if (hasMediaContent(candidate)) found.push(candidate);
        }
      } catch {
        // Unidade não acessível, ignora
      }
    }
  } else if (process.platform === "darwin") {
    const volumesDir = "/Volumes";
    try {
      const volumes = fs.readdirSync(volumesDir, { withFileTypes: true });
      for (const vol of volumes) {
        if (!vol.isDirectory()) continue;
        const candidate = path.join(volumesDir, vol.name, "Louvor JA", "Media");
        try {
          if (fs.existsSync(candidate) && candidate !== currentMediaPath) {
            if (hasMediaContent(candidate)) found.push(candidate);
          }
        } catch { /* ignora */ }
      }
    } catch { /* ignora */ }
  } else {
    const mountRoots = [path.join("/media", os.userInfo().username), "/mnt"];
    for (const root of mountRoots) {
      try {
        if (!fs.existsSync(root)) continue;
        const volumes = fs.readdirSync(root, { withFileTypes: true });
        for (const vol of volumes) {
          if (!vol.isDirectory()) continue;
          const candidate = path.join(root, vol.name, "Louvor JA", "Media");
          try {
            if (fs.existsSync(candidate) && candidate !== currentMediaPath) {
              if (hasMediaContent(candidate)) found.push(candidate);
            }
          } catch { /* ignora */ }
        }
      } catch { /* ignora */ }
    }
  }

  return found;
}

export interface MediaMigrationProgress {
  current: number;
  total: number;
  filename: string;
  percent: number;
}

export interface MediaMigrationResult {
  success: boolean;
  totalCopied: number;
  errorCount?: number;
  error?: string;
  errorCode?: string;
}

function collectFilesRecursively(dir: string, baseDir: string = dir): Array<{ fullPath: string; relPath: string }> {
  let results: Array<{ fullPath: string; relPath: string }> = [];
  if (!fs.existsSync(dir)) return results;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(collectFilesRecursively(fullPath, baseDir));
      } else if (entry.isFile()) {
        const relPath = path.relative(baseDir, fullPath);
        results.push({ fullPath, relPath });
      }
    }
  } catch {
    // Falha silenciosa de leitura de diretório
  }

  return results;
}

/**
 * Migra (copia) arquivos de mídia de uma pasta origem (ex: userData/Media)
 * para a nova pasta de destino compartilhada (ex: C:\Louvor JA\Media).
 *
 * Mapeia inteligentemente:
 *   - musicas/musics -> [targetPath]/musicas
 *   - imagens/images/slides -> [targetPath]/imagens
 *   - capas/covers -> [targetPath]/capas
 *   - avatars -> Flute/data/avatars/
 */
/**
 * Verifica se uma transferência de mídia anterior para o destino foi interrompida antes de concluir.
 */
export function isMigrationInterrupted(targetPath: string): boolean {
  try {
    if (!targetPath) return false;
    const markerFile = path.join(targetPath, ".migration_in_progress");
    if (fs.existsSync(markerFile)) return true;

    const fluteDataDir = getFluteDataPath();
    const lockFile = path.join(fluteDataDir, ".migration_lock.json");
    if (fs.existsSync(lockFile)) {
      const content = fs.readFileSync(lockFile, "utf8");
      const data = JSON.parse(content);
      if (data && data.targetPath && path.resolve(data.targetPath).toLowerCase() === path.resolve(targetPath).toLowerCase()) {
        return true;
      }
    }
  } catch {
    // Falha silenciosa de leitura de marcadores
  }
  return false;
}

const SYSTEM_ERROR_DESCRIPTIONS: Record<string, { reason: string; suggestion: string }> = {
  EACCES: {
    reason: "Sem permissão para criar ou gravar arquivos na pasta de destino.",
    suggestion: "Verifique se o antivírus/Windows Defender não está bloqueando o aplicativo ou escolha outra pasta com permissão de escrita.",
  },
  EPERM: {
    reason: "Acesso negado pelo sistema operacional ao gravar na pasta de destino.",
    suggestion: "Verifique se o antivírus/Windows Defender não está bloqueando o aplicativo ou execute como Administrador / escolha outra pasta.",
  },
  ENOSPC: {
    reason: "Espaço em disco insuficiente na unidade de destino.",
    suggestion: "Libere espaço em disco ou escolha outro disco/pasta para salvar as mídias.",
  },
  EROFS: {
    reason: "A unidade ou pasta de destino está protegida contra gravação (somente leitura).",
    suggestion: "Escolha outro disco ou pasta onde seja possível gravar arquivos.",
  },
  EBUSY: {
    reason: "Arquivos estão em uso por outro programa ou bloqueados temporariamente.",
    suggestion: "Feche outros aplicativos que possam estar acessando as mídias e tente novamente.",
  },
  EAGAIN: {
    reason: "Recurso temporariamente indisponível ao acessar os arquivos.",
    suggestion: "Aguarde alguns instantes e tente novamente.",
  },
  ETXTBSY: {
    reason: "Um ou mais arquivos estão ocupados por outro processo.",
    suggestion: "Feche outros aplicativos abertos e tente novamente.",
  },
  ENOENT: {
    reason: "Pasta ou arquivo de origem/destino não foi encontrado.",
    suggestion: "Verifique se o disco ou pasta selecionada existe e está acessível.",
  },
  ENAMETOOLONG: {
    reason: "O caminho de um ou mais arquivos excedeu o limite suportado pelo sistema.",
    suggestion: "Escolha uma pasta de destino com um caminho mais curto (ex: C:\\Louvor JA\\Media).",
  },
  EIO: {
    reason: "Falha de leitura ou gravação no disco.",
    suggestion: "Verifique se o disco de origem/destino está conectado e funcionando normalmente.",
  },
  ENODEV: {
    reason: "Unidade de armazenamento desconectada ou inacessível.",
    suggestion: "Verifique se o HD externo/pendrive ou pasta em rede está conectado.",
  },
  EMFILE: {
    reason: "Limite de arquivos abertos simultaneamente atingido no sistema.",
    suggestion: "Feche alguns programas em execução e tente novamente.",
  },
  ENFILE: {
    reason: "Limite de arquivos abertos no sistema atingido.",
    suggestion: "Feche alguns programas em execução e tente novamente.",
  },
};

function formatMigrationErrorMessage(
  err: unknown,
  context: {
    errorCount: number;
    maxErrors: number;
    lastCopyError: unknown;
    lastFailedPath?: string;
  },
): { message: string; code: string } {
  const isTooManyErrors = err instanceof Error && err.message === "TOO_MANY_ERRORS";
  const targetErr = isTooManyErrors && context.lastCopyError ? context.lastCopyError : err;

  const errObj = targetErr as NodeJS.ErrnoException | undefined;
  const code = errObj && typeof errObj === "object" && "code" in errObj && errObj.code ? String(errObj.code) : "";
  const rawMessage = targetErr instanceof Error ? targetErr.message : String(targetErr ?? "");
  const cleanRawMessage = rawMessage.replace(/^Error invoking remote method '[^']+':\s*/i, "");

  const known = code ? SYSTEM_ERROR_DESCRIPTIONS[code] : undefined;
  const reason = known ? known.reason : cleanRawMessage || "Erro inesperado ao transferir arquivos.";
  const suggestion = known ? known.suggestion : "Tente novamente ou escolha outra pasta de destino.";

  const lines: string[] = [];
  if (isTooManyErrors) {
    lines.push(`Não foi possível concluir a transferência porque ${context.errorCount} arquivos falharam (limite de ${context.maxErrors}).`);
    lines.push(`Motivo principal: ${reason}`);
  } else {
    lines.push(reason);
  }
  lines.push(suggestion);

  const techParts: string[] = [];
  if (code) techParts.push(`Código: ${code}`);
  if (context.lastFailedPath) techParts.push(`Arquivo: ${context.lastFailedPath}`);
  if (techParts.length > 0) {
    lines.push(techParts.join(" | "));
  }

  return {
    message: lines.join("\n"),
    code: code || (isTooManyErrors ? "TOO_MANY_ERRORS" : "UNKNOWN"),
  };
}

/**
 * Migra (copia) arquivos de mídia de uma pasta origem (ex: userData/Media)
 * para a nova pasta de destino compartilhada (ex: C:\Louvor JA\Media).
 *
 * Mapeia inteligentemente:
 *   - musicas/musics -> [targetPath]/musicas
 *   - imagens/images/slides -> [targetPath]/imagens
 *   - capas/covers -> [targetPath]/capas
 *   - avatars -> Flute/data/avatars/
 */
export async function migrateMediaFiles(
  targetPath: string,
  sourcePath?: string,
  onProgress?: (progress: MediaMigrationProgress) => void,
  deleteSource: boolean = false,
): Promise<MediaMigrationResult> {
  const effectiveSourcePath = sourcePath || (needsMediaPathMigration() ? getLegacyMediaPath() : resolveMediaPath());
  const markerFile = path.join(targetPath, ".migration_in_progress");
  const fluteDataDir = getFluteDataPath();
  const lockFile = path.join(fluteDataDir, ".migration_lock.json");

  const MAX_ALLOWED_ERRORS = 40;
  let totalCopied = 0;
  let errorCount = 0;
  const failedFiles: string[] = [];
  let lastCopyError: unknown = null;
  let lastFailedPath: string | undefined;

  try {
    if (!fs.existsSync(effectiveSourcePath)) {
      saveMediaPath(targetPath);
      return { success: true, totalCopied: 0 };
    }

    if (path.resolve(effectiveSourcePath).toLowerCase() === path.resolve(targetPath).toLowerCase()) {
      saveMediaPath(targetPath);
      return { success: true, totalCopied: 0 };
    }

    // Se uma transferência anterior foi interrompida, apaga totalmente a pasta de destino para começar do zero
    const interrupted = isMigrationInterrupted(targetPath);
    if (interrupted || fs.existsSync(markerFile)) {
      console.log("[media-path] Transferência interrompida detectada. Apagando pasta de destino e reiniciando do zero:", targetPath);
      if (targetPath.length > 5 && path.resolve(targetPath).toLowerCase() !== path.resolve(effectiveSourcePath).toLowerCase()) {
        try {
          fs.rmSync(targetPath, { recursive: true, force: true });
        } catch (rmErr) {
          console.warn("[media-path] Falha ao limpar pasta destino interrompida:", rmErr);
        }
      }
    }

    // Cria a pasta de destino e registra marcador de transferência em andamento
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    try {
      fs.writeFileSync(markerFile, JSON.stringify({ sourcePath: effectiveSourcePath, targetPath, startedAt: new Date().toISOString() }), "utf8");
      if (fs.existsSync(fluteDataDir)) {
        fs.writeFileSync(lockFile, JSON.stringify({ sourcePath: effectiveSourcePath, targetPath, startedAt: new Date().toISOString() }), "utf8");
      }
    } catch (e) {
      console.warn("[media-path] Aviso ao registrar marcador de transferência:", e);
    }

    // Pastas de destino oficiais
    const destMusic = resolveMusicPath(targetPath);
    const destImages = resolveImagesPath(targetPath);
    const destCovers = resolveCoversPath(targetPath);
    const destAvatars = resolveAvatarsPath();

    [destMusic, destImages, destCovers, destAvatars].forEach((d) => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    const files = collectFilesRecursively(effectiveSourcePath);
    const totalFiles = files.length;
    let processed = 0;

    for (const file of files) {
      processed++;
      const normRel = file.relPath.replace(/\\/g, "/");
      const firstSegment = normRel.split("/")[0].toLowerCase();
      const remainingPath = normRel.split("/").slice(1).join(path.sep);

      let targetFileDir = targetPath;
      if (firstSegment.includes("music") || firstSegment.includes("músic")) {
        targetFileDir = destMusic;
      } else if (firstSegment.includes("image") || firstSegment.includes("imagen") || firstSegment.includes("slide")) {
        targetFileDir = destImages;
      } else if (firstSegment.includes("cover") || firstSegment.includes("capa")) {
        targetFileDir = destCovers;
      } else if (firstSegment.includes("avatar")) {
        targetFileDir = destAvatars;
      } else {
        targetFileDir = targetPath;
      }

      const destPath = remainingPath
        ? path.join(targetFileDir, remainingPath)
        : path.join(targetFileDir, path.basename(file.fullPath));

      const destDir = path.dirname(destPath);

      let needsCopy = true;
      if (fs.existsSync(destPath)) {
        try {
          const srcStat = fs.statSync(file.fullPath);
          const dstStat = fs.statSync(destPath);
          if (srcStat.size === dstStat.size && srcStat.size > 0) {
            needsCopy = false;
          }
        } catch {
          needsCopy = true;
        }
      }

      if (needsCopy) {
        try {
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          fs.copyFileSync(file.fullPath, destPath);
          totalCopied++;
        } catch (copyErr) {
          errorCount++;
          lastCopyError = copyErr;
          lastFailedPath = file.relPath;
          failedFiles.push(file.relPath);
          console.warn(`[media-path] Erro ao copiar ${file.relPath} (${errorCount}/${MAX_ALLOWED_ERRORS}):`, copyErr);
          if (errorCount >= MAX_ALLOWED_ERRORS) {
            throw new Error("TOO_MANY_ERRORS");
          }
        }
      }

      if (onProgress && (processed % 5 === 0 || processed === totalFiles)) {
        const percent = totalFiles > 0 ? Math.round((processed / totalFiles) * 100) : 100;
        onProgress({
          current: processed,
          total: totalFiles,
          filename: path.basename(file.fullPath),
          percent,
        });
      }
    }

    if (errorCount > 0) {
      console.warn(`[media-path] Migração concluída com ${errorCount} erros tolerados (arquivos pendentes para recuperação):`, failedFiles);
    }

    // Salva o novo caminho de mídia configurado apenas com a transferência bem-sucedida (dentro do limite de tolerância)
    const saved = saveMediaPath(targetPath);
    if (!saved) {
      throw new Error("Não foi possível salvar a configuração da nova pasta de mídia no arquivo de configuração.");
    }

    // Remove os marcadores de transferência em andamento
    try {
      if (fs.existsSync(markerFile)) fs.rmSync(markerFile, { force: true });
      if (fs.existsSync(lockFile)) fs.rmSync(lockFile, { force: true });
    } catch {
      // Ignora erro ao remover marcadores
    }

    // 1. Exclui a pasta de origem apenas se solicitado (mover/migrar) e após concluir a transferência
    if (deleteSource && fs.existsSync(effectiveSourcePath) && path.resolve(effectiveSourcePath).toLowerCase() !== path.resolve(targetPath).toLowerCase()) {
      try {
        fs.rmSync(effectiveSourcePath, { recursive: true, force: true });
        console.log("[media-path] Pasta antiga removida com sucesso após migração completa:", effectiveSourcePath);
      } catch (rmErr) {
        console.warn("[media-path] Tentativa primária de remoção atômica falhou, limpando arquivo por arquivo:", rmErr);
        try {
          const oldRemaining = collectFilesRecursively(effectiveSourcePath);
          for (const f of oldRemaining) {
            try { fs.rmSync(f.fullPath, { force: true }); } catch { /* ignora arquivo em uso */ }
          }
          fs.rmSync(effectiveSourcePath, { recursive: true, force: true });
        } catch { /* ignora falha parcial na remoção da pasta */ }
      }
    }

    // 2. Se a migração foi com deleteSource (ou de versão anterior), verifica se a pasta AppData\Roaming\Louvor JA ainda existe
    // e apaga ela inteira, pois não há mais nada de útil nela
    try {
      const legacyUser = getLegacyUserDataPath();
      const fluteBase = getFluteBasePath();
      const fluteData = getFluteDataPath();
      if (
        legacyUser &&
        fs.existsSync(legacyUser) &&
        path.resolve(legacyUser).toLowerCase() !== path.resolve(fluteBase).toLowerCase() &&
        path.resolve(legacyUser).toLowerCase() !== path.resolve(fluteData).toLowerCase()
      ) {
        const remaining = fs.readdirSync(legacyUser);
        // Se a pasta Roaming\Louvor JA estiver vazia ou deleteSource foi executado
        if (remaining.length === 0 || deleteSource || remaining.every(r => r.toLowerCase() === "media" || r.startsWith("."))) {
          fs.rmSync(legacyUser, { recursive: true, force: true });
          console.log("[media-path] Pasta legada %APPDATA%\\Louvor JA removida por completo:", legacyUser);
        }
      }
    } catch (e) {
      console.warn("[media-path] Aviso ao tentar remover pasta legada completa:", e);
    }

    return {
      success: true,
      totalCopied,
      errorCount,
    };
  } catch (err: unknown) {
    const formatted = formatMigrationErrorMessage(err, {
      errorCount,
      maxErrors: MAX_ALLOWED_ERRORS,
      lastCopyError,
      lastFailedPath,
    });
    console.error("[media-path] Erro durante migração de mídias:", formatted.message, err);
    // Em caso de falha/interrupção além do limite tolerado, o marcador é mantido
    return {
      success: false,
      totalCopied,
      errorCount,
      error: formatted.message,
      errorCode: formatted.code,
    };
  }
}
