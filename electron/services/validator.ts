import { ipcMain, app } from "electron";
import * as fs from "fs-extra";
import * as path from "path";
import { sysDbPath, coversPath, musicPath, slidesPath } from "../config/constants";
import DbExtractor from "./db-extractor";
import { SQLiteHelper } from "../utils/sqlite";
import { decryptData } from "../utils/crypto";

export function registerValidatorHandlers() {
  ipcMain.handle("validate-installation", async (event, lang: string = "pt") => {
    try {
      const dbPath = path.join(app.getPath("userData"), `database_${lang}.db`);
      if (!fs.existsSync(dbPath)) {
        return { missingCovers: [], missingMusic: [], missingImages: [], missingBins: [], totalMissing: 0 };
      }

      const db = new SQLiteHelper(dbPath);
      await db.connect();
      
      let downloadedMedia: string[] = [];
      const localMediaDbPath = path.join(sysDbPath, "dlm.bin");
      if (fs.existsSync(localMediaDbPath)) {
        try {
          const encryptedContent = fs.readFileSync(localMediaDbPath, "utf8");
          const decryptedString = decryptData(encryptedContent);
          if (decryptedString) downloadedMedia = JSON.parse(decryptedString);
        } catch (e) {
          console.error("Erro lendo dlm.bin:", e);
        }
      }
      
      // Valida TODAS as covers (são poucas, ~70, muito rápido)
      const coverFiles = new Set(db.prepare("SELECT file_name FROM files WHERE dir = '/covers'").all().map((r: Record<string, unknown>) => r.file_name as string));
      
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

      const actualCovers = new Set(fs.existsSync(coversPath) ? fs.readdirSync(coversPath) : []);
      const actualBins = new Set(fs.existsSync(sysDbPath) ? fs.readdirSync(sysDbPath) : []);

      const missingCovers = [...coverFiles].filter(x => x && !actualCovers.has(x));
      
      // Validação baseada no fs.existsSync diretamente usando musicPath
      const missingMusic = [...musicFiles].filter(x => x && !fs.existsSync(path.join(musicPath, x)));
      const missingImages = [...imageFiles].filter(x => x && !fs.existsSync(path.join(slidesPath, x)));
      
      const missingBins = [...binFiles].filter(x => x && !actualBins.has(x));

      return {
        missingCovers,
        missingMusic,
        missingImages,
        missingBins,
        totalMissing: missingCovers.length + missingMusic.length + missingImages.length + missingBins.length,
      };
    } catch (error) {
      console.error("Erro ao validar instalação:", error);
      return { missingCovers: [], missingMusic: [], missingImages: [], missingBins: [], totalMissing: 0 };
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
