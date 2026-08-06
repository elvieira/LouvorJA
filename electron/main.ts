import { app } from "electron";
import * as fs from "fs-extra";
import { setupLifecycle } from "./core/lifecycle";
import { registerIpcHandlers } from "./ipc";
import { sysDbPath, mediaPath, coversPath, musicPath, slidesPath, oldDbPath } from "./config/constants";
import { setupUpdater } from "./services/updater";

// Migração de banco de dados legado
if (fs.existsSync(oldDbPath)) {
  try {
    fs.removeSync(oldDbPath);
  } catch (_e) { console.error("Remove old db legacy error:", _e); }
}

// Migração da pasta antiga 'music' para 'musics'
const oldMusicPath = require("path").join(mediaPath, "music");
if (fs.existsSync(oldMusicPath) && !fs.existsSync(musicPath)) {
  try {
    fs.renameSync(oldMusicPath, musicPath);
  } catch (_e) { console.error("Rename old music folder error:", _e); }
}

// Garante que todas as pastas essenciais existam ao inicializar
[sysDbPath, mediaPath, coversPath, musicPath, slidesPath].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Registra todos os handlers do IPC
registerIpcHandlers();

// Inicia os serviços de Updater e Lifecycle da aplicação
app.whenReady().then(() => {
  setupUpdater();
});

setupLifecycle();
