import { app } from "electron";
import * as path from "path";

// Chave estática para ofuscação (não é segurança alta, apenas ofuscação)
export const ENCRYPTION_KEY = Buffer.from("v389s8dkj238910s8a7d3h2j1k9s8d7f", "utf8");
export const IV_LENGTH = 16;

// Força o nome do app ANTES de pegar o userData, para que o modo dev e o build usem a mesma pasta "Louvor JA"
app.setName("Louvor JA");
export const userDataPath = app.getPath("userData");
export const sysDbPath = path.join(userDataPath, ".sysdata");
export const oldDbPath = path.join(userDataPath, "database");
export const mediaPath = path.join(userDataPath, "Media");
export const coversPath = path.join(mediaPath, "covers");
export const musicPath = path.join(mediaPath, "musics");
export const slidesPath = path.join(mediaPath, "images");
export const finalDbPath = path.join(userDataPath, "database.db");
export const flagPath = path.join(userDataPath, "db_download_complete.flag");

export const isDev = !app.isPackaged;
