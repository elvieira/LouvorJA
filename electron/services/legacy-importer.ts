import { BrowserWindow, dialog, WebContents } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import { getMusicPath, getSlidesPath, sysConfigPath } from "../config/constants";
import { encryptData, decryptData } from "../utils/crypto";

export const DEFAULT_LEGACY_INSTALL_PATH = "C:\\Program Files (x86)\\Louvor JA";

export interface LegacyCheckResult {
  exists: boolean;
  path: string;
  hasMusic: boolean;
  hasImages: boolean;
}

export interface LegacyImportResult {
  success: boolean;
  copiedMusic: number;
  copiedImages: number;
  totalCopied: number;
  error?: string;
}

/**
 * Resolve onde fica a pasta config ou onde estão as pastas musicas/imagens.
 */
function resolveConfigDir(baseDir: string): string | null {
  if (!fs.existsSync(baseDir)) return null;

  const configPath = path.join(baseDir, "config");
  const hasConfigMusicas = fs.existsSync(path.join(configPath, "musicas"));
  const hasConfigImagens = fs.existsSync(path.join(configPath, "imagens"));

  if (hasConfigMusicas || hasConfigImagens) {
    return configPath;
  }

  const hasMusicas = fs.existsSync(path.join(baseDir, "musicas"));
  const hasImagens = fs.existsSync(path.join(baseDir, "imagens"));

  if (hasMusicas || hasImagens) {
    return baseDir;
  }

  return null;
}

/**
 * Retorna os caminhos candidatos mais comuns onde o Louvor JA Clássico costuma estar instalado.
 * No Windows, varre letras de unidade de C: a Z:.
 * No macOS/Linux, varre /Volumes ou /media para suportar discos externos/backups.
 */
export function getCandidateLegacyPaths(): string[] {
  const candidates: string[] = [DEFAULT_LEGACY_INSTALL_PATH];

  if (process.platform === "win32") {
    for (let code = 67; code <= 90; code++) { // C a Z
      const letter = String.fromCharCode(code);
      candidates.push(
        `${letter}:\\Program Files (x86)\\Louvor JA`,
        `${letter}:\\Program Files\\Louvor JA`,
        `${letter}:\\Louvor JA`,
        `${letter}:\\Arquivos de Programas (x86)\\Louvor JA`,
        `${letter}:\\Arquivos de Programas\\Louvor JA`,
      );
    }
  } else if (process.platform === "darwin") {
    const volumesDir = "/Volumes";
    try {
      if (fs.existsSync(volumesDir)) {
        const vols = fs.readdirSync(volumesDir, { withFileTypes: true });
        for (const vol of vols) {
          if (!vol.isDirectory()) continue;
          candidates.push(
            path.join(volumesDir, vol.name, "Louvor JA"),
            path.join(volumesDir, vol.name, "Program Files (x86)", "Louvor JA"),
          );
        }
      }
    } catch {
      // Ignora falhas de leitura em volumes
    }
  }

  // Remove duplicatas preservando a ordem
  return Array.from(new Set(candidates));
}

/**
 * Encontra todas as instalações válidas do Louvor JA Clássico existentes nas unidades do sistema.
 */
export function findAllLegacyInstallations(): string[] {
  const found: string[] = [];
  const candidates = getCandidateLegacyPaths();

  for (const candidate of candidates) {
    try {
      const configDir = resolveConfigDir(candidate);
      if (!configDir) continue;

      const hasMusic = fs.existsSync(path.join(configDir, "musicas"));
      const hasImages = fs.existsSync(path.join(configDir, "imagens"));

      if (hasMusic || hasImages) {
        found.push(candidate);
      }
    } catch {
      // Unidade inacessível ou sem permissão
    }
  }

  return found;
}

/**
 * Verifica se uma instalação do Louvor JA clássico existe no sistema.
 * Se nenhum caminho for especificado (ou for o padrão), realiza varredura automática
 * em múltiplos discos (C: a Z:) para localizar a pasta clássica automaticamente.
 */
export function checkLegacyInstallation(targetDir: string = DEFAULT_LEGACY_INSTALL_PATH): LegacyCheckResult {
  // Se o usuário passou um diretório específico diferente do padrão, testa ele diretamente
  if (targetDir && targetDir !== DEFAULT_LEGACY_INSTALL_PATH) {
    const configDir = resolveConfigDir(targetDir);
    if (!configDir) {
      return { exists: false, path: targetDir, hasMusic: false, hasImages: false };
    }
    const hasMusic = fs.existsSync(path.join(configDir, "musicas"));
    const hasImages = fs.existsSync(path.join(configDir, "imagens"));
    return {
      exists: hasMusic || hasImages,
      path: targetDir,
      hasMusic,
      hasImages,
    };
  }

  // Caso padrão: testa primeiro o padrão C:\Program Files (x86)\Louvor JA
  const defaultConfigDir = resolveConfigDir(DEFAULT_LEGACY_INSTALL_PATH);
  if (defaultConfigDir) {
    const hasMusic = fs.existsSync(path.join(defaultConfigDir, "musicas"));
    const hasImages = fs.existsSync(path.join(defaultConfigDir, "imagens"));
    if (hasMusic || hasImages) {
      return {
        exists: true,
        path: DEFAULT_LEGACY_INSTALL_PATH,
        hasMusic,
        hasImages,
      };
    }
  }

  // Varredura automática em outros discos (D:\, E:\, etc.)
  const allFound = findAllLegacyInstallations();
  if (allFound.length > 0) {
    const bestMatch = allFound[0];
    const configDir = resolveConfigDir(bestMatch);
    const hasMusic = configDir ? fs.existsSync(path.join(configDir, "musicas")) : false;
    const hasImages = configDir ? fs.existsSync(path.join(configDir, "imagens")) : false;
    return {
      exists: true,
      path: bestMatch,
      hasMusic,
      hasImages,
    };
  }

  return {
    exists: false,
    path: DEFAULT_LEGACY_INSTALL_PATH,
    hasMusic: false,
    hasImages: false,
  };
}

/**
 * Abre o seletor nativo de diretórios do Windows para o usuário escolher manualmente.
 */
export async function selectLegacyFolder(win?: BrowserWindow | null): Promise<{ canceled: boolean; path?: string; valid?: boolean }> {
  if (process.platform !== "win32") {
    return { canceled: true };
  }

  const dialogOptions = {
    title: "Selecione a pasta do Louvor JA Clássico",
    properties: ["openDirectory" as const],
  };

  const result = win
    ? await dialog.showOpenDialog(win, dialogOptions)
    : await dialog.showOpenDialog(dialogOptions);

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  const selectedPath = result.filePaths[0];
  const configDir = resolveConfigDir(selectedPath);

  return {
    canceled: false,
    path: selectedPath,
    valid: !!configDir,
  };
}

/**
 * Lista todos os arquivos de um diretório recursivamente com seu caminho relativo.
 */
function getAllFilesRecursive(dir: string, baseDir: string = dir): Array<{ fullPath: string; relPath: string }> {
  let results: Array<{ fullPath: string; relPath: string }> = [];
  if (!fs.existsSync(dir)) return results;

  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(getAllFilesRecursive(fullPath, baseDir));
      } else if (item.isFile()) {
        const relPath = path.relative(baseDir, fullPath);
        results.push({ fullPath, relPath });
      }
    }
  } catch (err) {
    console.error(`Erro ao ler pasta recursiva: ${dir}`, err);
  }

  return results;
}

/**
 * Importa os arquivos de música e imagem da instalação clássica para o novo Louvor JA.
 */
export async function importLegacyMedia(
  targetDir: string = DEFAULT_LEGACY_INSTALL_PATH,
  sender?: WebContents,
): Promise<LegacyImportResult> {
  if (process.platform !== "win32") {
    return { success: false, copiedMusic: 0, copiedImages: 0, totalCopied: 0, error: "Apenas disponível no Windows." };
  }

  const configDir = resolveConfigDir(targetDir);
  if (!configDir) {
    return {
      success: false,
      copiedMusic: 0,
      copiedImages: 0,
      totalCopied: 0,
      error: "As pastas 'musicas' ou 'imagens' não foram encontradas no diretório especificado.",
    };
  }

  const legacyMusicasDir = path.join(configDir, "musicas");
  const legacyImagensDir = path.join(configDir, "imagens");

  const musicPath = getMusicPath();
  const slidesPath = getSlidesPath();

  // Destino das músicas:
  // Se a pasta legada já contiver a subpasta 'pt', copiamos mantendo a hierarquia para musicPath.
  // Caso contrário, copiamos para musicPath/pt para coincidir com as URLs do banco (/musics/pt/...).
  const hasPtFolder = fs.existsSync(path.join(legacyMusicasDir, "pt"));
  const destMusicBase = hasPtFolder ? musicPath : path.join(musicPath, "pt");

  const musicFiles = fs.existsSync(legacyMusicasDir)
    ? getAllFilesRecursive(legacyMusicasDir)
    : [];

  const imageFiles = fs.existsSync(legacyImagensDir)
    ? getAllFilesRecursive(legacyImagensDir)
    : [];

  const totalFiles = musicFiles.length + imageFiles.length;
  if (totalFiles === 0) {
    return {
      success: true,
      copiedMusic: 0,
      copiedImages: 0,
      totalCopied: 0,
      error: "Nenhum arquivo de mídia encontrado para importar.",
    };
  }

  await fs.ensureDir(musicPath);
  await fs.ensureDir(slidesPath);
  await fs.ensureDir(destMusicBase);

  let copiedMusic = 0;
  let copiedImages = 0;
  let processed = 0;
  const importedFileNames: string[] = [];

  // Importar músicas
  for (const item of musicFiles) {
    processed++;
    const destPath = path.join(destMusicBase, item.relPath);
    const destDir = path.dirname(destPath);
    await fs.ensureDir(destDir);

    let needsCopy = true;
    if (fs.existsSync(destPath)) {
      try {
        const srcStat = fs.statSync(item.fullPath);
        const dstStat = fs.statSync(destPath);
        if (srcStat.size === dstStat.size) {
          needsCopy = false;
        }
      } catch {
        needsCopy = true;
      }
    }

    if (needsCopy) {
      await fs.copyFile(item.fullPath, destPath);
    }

    copiedMusic++;

    // Salva o caminho relativo formatado para o dlm
    const relDlmPath = hasPtFolder
      ? item.relPath.replace(/\\/g, "/")
      : `pt/${item.relPath.replace(/\\/g, "/")}`;
    importedFileNames.push(relDlmPath);

    if (sender && (processed % 10 === 0 || processed === totalFiles)) {
      sender.send("import-legacy-progress", {
        current: processed,
        total: totalFiles,
        filename: path.basename(item.fullPath),
      });
    }
  }

  // Importar imagens
  for (const item of imageFiles) {
    processed++;
    const destPath = path.join(slidesPath, item.relPath);
    const destDir = path.dirname(destPath);
    await fs.ensureDir(destDir);

    let needsCopy = true;
    if (fs.existsSync(destPath)) {
      try {
        const srcStat = fs.statSync(item.fullPath);
        const dstStat = fs.statSync(destPath);
        if (srcStat.size === dstStat.size) {
          needsCopy = false;
        }
      } catch {
        needsCopy = true;
      }
    }

    if (needsCopy) {
      await fs.copyFile(item.fullPath, destPath);
    }

    copiedImages++;
    importedFileNames.push(item.relPath.replace(/\\/g, "/"));

    if (sender && (processed % 10 === 0 || processed === totalFiles)) {
      sender.send("import-legacy-progress", {
        current: processed,
        total: totalFiles,
        filename: path.basename(item.fullPath),
      });
    }
  }

  // Registra as mídias importadas no sysConfig ("dlm")
  try {
    let sysConfig: Record<string, unknown> = {};
    if (fs.existsSync(sysConfigPath)) {
      const configEncrypted = fs.readFileSync(sysConfigPath, "utf8");
      const configDecrypted = decryptData(configEncrypted);
      if (configDecrypted) sysConfig = JSON.parse(configDecrypted);
    }

    const currentDlm = new Set<string>((sysConfig["dlm"] as string[]) || []);
    for (const f of importedFileNames) {
      currentDlm.add(f);
    }

    sysConfig["dlm"] = Array.from(currentDlm);
    const newEncrypted = encryptData(JSON.stringify(sysConfig));
    if (newEncrypted) {
      fs.writeFileSync(sysConfigPath, newEncrypted, "utf8");
    }
  } catch (e) {
    console.error("Erro ao registrar mídias legadas importadas no sysConfig:", e);
  }

  return {
    success: true,
    copiedMusic,
    copiedImages,
    totalCopied: copiedMusic + copiedImages,
  };
}
