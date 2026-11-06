import "dotenv/config";
import { app } from "electron";

// Define o nome oficial da aplicação para o menu do macOS e processos do sistema
app.name = "Louvor JA";
import * as fs from "fs-extra";
import { initLogger } from "./services/logger";
import { setupLifecycle } from "./core/lifecycle";
import { registerIpcHandlers } from "./ipc";
import {
  getSysDbPath,
  getMediaPath,
  getCoversPath,
  getMusicPath,
  getSlidesPath,
  getAvatarsPath,
  getFluteDataPath,
  getFluteSystemPath,
  oldDbPath,
} from "./config/constants";
import { setupUpdater } from "./services/updater";

// Inicializa o serviço de logging central
initLogger();

// Otimizações de GPU (Hardware Acceleration) para evitar travamentos em vídeos pesados e projetor
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("enable-hardware-overlays");
// Migração de banco de dados legado
if (fs.existsSync(oldDbPath)) {
  try {
    fs.removeSync(oldDbPath);
  } catch (_e) { console.error("Remove old db legacy error:", _e); }
}

// Garante que todas as pastas essenciais existam ao inicializar
const essentialDirs = [
  getFluteDataPath(),
  getFluteSystemPath(),
  getAvatarsPath(),
  getSysDbPath("pt"),
  getSysDbPath("es"),
  getMediaPath(),
  getMusicPath(),
  getSlidesPath(),
  getCoversPath(),
];
essentialDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Registra todos os handlers do IPC
registerIpcHandlers();

// Inicia os serviços de Updater e Lifecycle da aplicação
app.whenReady().then(() => {
  setupUpdater();
});

setupLifecycle();
