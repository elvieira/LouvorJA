const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');

// Windows-only: Registry reader (lazy require — não carrega em Linux/macOS)
let readRegistryKey = null;
try {
  readRegistryKey = require('winreg-native')?.readValue;
} catch {
  // winreg-native não disponível — fallback para paths hardcoded
}

/**
 * LegacyImporter — Detecta e importa database.db do LouvorJA Delphi Desktop.
 *
 * Fluxo:
 *   1. scan() — Procura database.db nos paths do Delphi (Windows)
 *   2. import() — Copia para temp, extrai via DbExtractor, faz merge
 */
class LegacyImporter {
  constructor() {
    this.userDataPath = app.getPath('userData');
    this.sysdataDir = path.join(this.userDataPath, '.sysdata');
    this.tempDir = path.join(this.userDataPath, 'temp-legacy-import');
  }

  /**
   * Scan dos paths onde o Delphi pode ter instalado o database.db.
   * Baseado em fmIniciando.pas:112-114: {pasta_do_executavel}\config\database.db
   *
   * Retorna o path encontrado ou null.
   */
  scan() {
    if (process.platform !== 'win32') {
      console.log('[LegacyImporter] Plataforma não é Windows. Scan ignorado.');
      return null;
    }

    // 1. Registry key (se o Delphi gravou)
    const registryPaths = this._scanRegistry();
    for (const regPath of registryPaths) {
      const dbPath = path.join(regPath, 'config', 'database.db');
      if (fs.existsSync(dbPath)) {
        console.log(`[LegacyImporter] Encontrado via registry: ${dbPath}`);
        return dbPath;
      }
    }

    // 2. Paths comuns
    const commonPaths = [
      'C:\\LouvorJA',
      'C:\\Program Files\\LouvorJA',
      'C:\\Program Files (x86)\\LouvorJA',
      'D:\\LouvorJA',
      'E:\\LouvorJA',
      path.join(process.env.LOCALAPPDATA || '', 'LouvorJA'),
      path.join(process.env.APPDATA || '', 'LouvorJA'),
    ];

    for (const base of commonPaths) {
      const dbPath = path.join(base, 'config', 'database.db');
      if (fs.existsSync(dbPath)) {
        console.log(`[LegacyImporter] Encontrado em path comum: ${dbPath}`);
        return dbPath;
      }
    }

    // 3. Busca no diretório do proprio Electron (se o user instalou o Delphi na mesma pasta)
    const exeDir = path.dirname(app.getPath('exe'));
    const exeDbPath = path.join(exeDir, 'config', 'database.db');
    if (fs.existsSync(exeDbPath)) {
      console.log(`[LegacyImporter] Encontrado ao lado do executável: ${exeDbPath}`);
      return exeDbPath;
    }

    console.log('[LegacyImporter] Nenhum database.db do Delphi encontrado.');
    return null;
  }

  /**
   * Tenta ler InstallPath do registry do Windows.
   * HKLM\Software\LouvorJA → InstallPath
   * HKCU\Software\LouvorJA → InstallPath
   */
  _scanRegistry() {
    const paths = [];
    if (!readRegistryKey) return paths;

    const hives = ['HKLM', 'HKCU'];
    for (const hive of hives) {
      try {
        const result = readRegistryKey(hive, '\\Software\\LouvorJA', 'InstallPath');
        if (result && result.value) {
          paths.push(result.value);
        }
      } catch {
        // Chave não existe — ignorar
      }
    }

    return paths;
  }

  /**
   * Lê a versão do DB legado (VERSAO_BD) sem extrair nada.
   * Retorna number ou null.
   */
  static readLegacyDbVersion(dbPath) {
    if (!fs.existsSync(dbPath)) return null;
    try {
      const Database = require('better-sqlite3');
      const db = new Database(dbPath, { readonly: true });
      const row = db.prepare("SELECT VERSAO_BD FROM VERSAO LIMIT 1").get();
      db.close();
      return row ? row.VERSAO_BD : null;
    } catch (e) {
      console.error('[LegacyImporter] Erro ao ler versão do DB legado:', e.message);
      return null;
    }
  }
}

module.exports = LegacyImporter;
