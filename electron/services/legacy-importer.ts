import { BrowserWindow, dialog, WebContents } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import { musicPath, slidesPath, sysConfigPath } from "../config/constants";
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
 * Verifica se a instalação padrão do Louvor JA clássico existe no sistema.
 */
export function checkLegacyInstallation(targetDir: string = DEFAULT_LEGACY_INSTALL_PATH): LegacyCheckResult {
  if (process.platform !== "win32") {
    return { exists: false, path: targetDir, hasMusic: false, hasImages: false };
  }

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
