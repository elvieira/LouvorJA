import { app, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import { coversPath, musicPath, slidesPath, avatarsPath, getSysDbPath, sysConfigPath } from "../config/constants";
import { SQLiteHelper } from "../utils/sqlite";
import DbExtractor from "./db-extractor";
import { decryptData } from "../utils/crypto";

export function registerValidatorHandlers() {
  ipcMain.handle("validate-installation", async (event, lang: string = "pt", devAvatarFilenames: string[] = []) => {
    try {
      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      if (!fs.existsSync(dbPath)) {
        const coverFiles = new Set<string>();
        const sysDbPath = getSysDbPath(lang);
        let categories: Array<{ albums?: Array<{ url_image?: string }> }> = [];
        const catBin = path.join(sysDbPath, `${lang}_categories.bin`);
        const catJson = path.join(sysDbPath, `${lang}_categories.json`);
        if (fs.existsSync(catBin)) {
          const dec = decryptData(fs.readFileSync(catBin, "utf8"));
          if (dec) categories = JSON.parse(dec);
        } else if (fs.existsSync(catJson)) {
          try {
            categories = JSON.parse(fs.readFileSync(catJson, "utf8"));
          } catch {
            // ignore
          }
        }
        for (const cat of categories) {
          if (cat.albums) {
            for (const alb of cat.albums) {
              if (alb.url_image && alb.url_image.startsWith("/covers/")) {
                coverFiles.add(alb.url_image.replace("/covers/", ""));
              }
            }
          }
        }
        const actualCovers = new Set<string>(fs.existsSync(coversPath) ? fs.readdirSync(coversPath) : []);
        const missingCovers = [...coverFiles].filter(x => x && !actualCovers.has(x));
        const actualAvatars = new Set<string>(fs.existsSync(avatarsPath) ? fs.readdirSync(avatarsPath) : []);
        const missingAvatars = (devAvatarFilenames || []).filter(x => x && !actualAvatars.has(x));
        return { missingCovers, missingMusic: [], missingImages: [], missingBins: [], missingAvatars, totalMissing: missingCovers.length + missingAvatars.length };
      }

      const db = new SQLiteHelper(dbPath);
      await db.connect();
      
      let downloadedMedia: string[] = [];
      if (fs.existsSync(sysConfigPath)) {
        try {
          const encryptedContent = fs.readFileSync(sysConfigPath, "utf8");
          const decryptedString = decryptData(encryptedContent);
          if (decryptedString) {
            const sysConfig = JSON.parse(decryptedString);
            downloadedMedia = (sysConfig["dlm"] as string[]) || [];
          }
        } catch (e) {
          console.error("Erro lendo sysconfig para dlm:", e);
        }
      }
      
      // Limpa dlm.bin legado se existir
      const legacyDlm = path.join(getSysDbPath(lang), "dlm.bin");
      if (fs.existsSync(legacyDlm)) {
        try {
          fs.unlinkSync(legacyDlm);
        } catch {
          // ignore
        }
      }
      
      // Valida TODAS as covers (são poucas, ~70, muito rápido)
      const coverFiles = new Set<string>(db.prepare("SELECT file_name FROM files WHERE dir = '/covers'").all().map((r: Record<string, unknown>) => r.file_name as string));
      
      // Músicas e imagens agora baseiam-se SOMENTE no que o programa realmente baixou (dlm.bin)
      const musicFiles = new Set<string>();
      const imageFiles = new Set<string>();
      
      for (const file of downloadedMedia) {
        if (file.toLowerCase().endsWith(".mp3")) {
          musicFiles.add(file);
        } else if (file.toLowerCase().endsWith(".jpg") || file.toLowerCase().endsWith(".png")) {
          imageFiles.add(file);
        }
      }
      
      const binFiles = new Set([
        "pt_categories.bin", "pt_hymnal.bin", "pt_hymnal_1996.bin", "pt_musics.bin",
      ]);

      const langs = db.prepare("SELECT DISTINCT id_language FROM bible_book").all() as Record<string, unknown>[];
      langs.forEach(l => {
        binFiles.add(`${l.id_language}_bible_book.bin`);
        binFiles.add(`${l.id_language}_bible_version.bin`);
      });
      
      const albums = db.prepare("SELECT id_album FROM albums").all() as Record<string, unknown>[];
      albums.forEach(a => binFiles.add(`album_${a.id_album}.bin`));
      
      const musics = db.prepare("SELECT id_music FROM musics").all() as Record<string, unknown>[];
      musics.forEach(m => binFiles.add(`music_${m.id_music}.bin`));
      
      const bibles = db.prepare("SELECT id_bible_version, id_bible_book, chapter FROM bible_verse GROUP BY id_bible_version, id_bible_book, chapter").all() as Record<string, unknown>[];
      bibles.forEach(b => binFiles.add(`bible_${b.id_bible_version}_${b.id_bible_book}_${b.chapter}.bin`));
      
      db.close();

      const actualCovers = new Set<string>(fs.existsSync(coversPath) ? fs.readdirSync(coversPath) : []);
      const currentSysDbPath = getSysDbPath(lang);
      const actualBins = new Set<string>(fs.existsSync(currentSysDbPath) ? fs.readdirSync(currentSysDbPath) : []);

      const missingCovers = [...coverFiles].filter(x => x && !actualCovers.has(x));
      
      // Validação baseada no fs.existsSync diretamente usando musicPath
      const missingMusic = [...musicFiles].filter(x => x && !fs.existsSync(path.join(musicPath, x)));
      const missingImages = [...imageFiles].filter(x => x && !fs.existsSync(path.join(slidesPath, x)));
      
      const missingBins = [...binFiles].filter(x => x && !actualBins.has(x));

      const actualAvatars = new Set<string>(fs.existsSync(avatarsPath) ? fs.readdirSync(avatarsPath) : []);
      const missingAvatars = (devAvatarFilenames || []).filter(x => x && !actualAvatars.has(x));

      return {
        missingCovers,
        missingMusic,
        missingImages,
        missingBins,
        missingAvatars,
        totalMissing: missingCovers.length + missingMusic.length + missingImages.length + missingBins.length + missingAvatars.length,
      };
    } catch (error) {
      console.error("Erro ao validar instalação:", error);
      return { missingCovers: [], missingMusic: [], missingImages: [], missingBins: [], missingAvatars: [], totalMissing: 0 };
    }
  });

  ipcMain.handle("repair-sysdata", async (event, filenames: string[], lang: string = "pt") => {
    try {
      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      if (!fs.existsSync(dbPath)) return false;
      const extractor = new DbExtractor(dbPath);
      await extractor.connect();
      
      for (const file of filenames) {
        const basename = file.replace(".bin", "");
        await extractor.repairFile(basename);
      }
      
      extractor.close();
      return true;
    } catch (error) {
      console.error("Erro ao reparar sysdata:", error);
      return false;
    }
  });
}
