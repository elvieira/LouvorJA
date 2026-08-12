import * as path from "path";
import * as fs from "fs-extra";
import { app } from "electron";
import { encryptData } from "../utils/crypto";
import { SQLiteHelper } from "../utils/sqlite";

export default class DbExtractor {
  private dbPath: string;
  private sysdataDir: string;
  private db: SQLiteHelper | null = null;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.sysdataDir = path.join(app.getPath("userData"), ".sysdata");
  }

  async connect() {
    if (!this.db) {
      this.db = new SQLiteHelper(this.dbPath);
      await this.db.connect();
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async extract(progressCallback: (data: { text: string; progress: number }) => void = () => {}): Promise<void> {
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Database file not found at ${this.dbPath}`);
    }

    fs.ensureDirSync(this.sysdataDir);
    await this.connect();
    
    try {
      const db = this.db!;
      progressCallback({ text: "Extraindo categorias...", progress: 10 });
      this.extractCategories(db);

      progressCallback({ text: "Extraindo álbuns...", progress: 20 });
      this.extractAlbumsAndMusics(db, progressCallback);

      progressCallback({ text: "Extraindo hinários...", progress: 60 });
      this.extractHymnals(db);

      progressCallback({ text: "Indexando todas as músicas...", progress: 65 });
      this.repairAllMusics(db);

      progressCallback({ text: "Extraindo Bíblias...", progress: 70 });
      this.extractBibles(db, progressCallback);

      progressCallback({ text: "Extração concluída", progress: 100 });
    } finally {
      this.close();
    }
  }

  public async repairFile(filename: string): Promise<unknown> {
    if (!fs.existsSync(this.dbPath)) return null;
    fs.ensureDirSync(this.sysdataDir);
    
    const autoClose = !this.db;
    if (autoClose) {
      await this.connect();
    }
    
    try {
      const db = this.db!;
      if (filename.endsWith("_categories")) {
        const lang = filename.split("_")[0];
        return this.repairCategories(db, lang);
      } else if (filename.endsWith("_bible_book")) {
        const lang = filename.split("_")[0];
        return this.repairBibleBooks(db, lang);
      } else if (filename.endsWith("_bible_version")) {
        const lang = filename.split("_")[0];
        return this.repairBibleVersions(db, lang);
      } else if (filename.endsWith("_hymnal") || filename.endsWith("_hymnal_1996")) {
        const lang = filename.split("_")[0];
        let hymnalId = 712;
        if (filename.endsWith("_hymnal_1996")) {
          hymnalId = 629;
        } else if (lang === "es") {
          hymnalId = 713;
        }
        return this.repairHymnal(db, hymnalId, filename, lang);
      } else if (filename.endsWith("_musics")) {
        const lang = filename.split("_")[0];
        return this.repairAllMusics(db, lang);
      } else if (filename.startsWith("bible_")) {
        const parts = filename.split("_");
        if (parts.length === 4) {
          return this.repairBibleChapter(db, parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), filename);
        }
      } else if (filename.startsWith("album_")) {
        const albumId = parseInt(filename.split("_")[1]);
        if (!isNaN(albumId)) return this.repairAlbum(db, albumId);
      } else if (filename.startsWith("music_")) {
        const musicId = parseInt(filename.split("_")[1]);
        if (!isNaN(musicId)) return this.repairMusic(db, musicId);
      }
    } finally {
      if (autoClose) {
        this.close();
      }
    }
    return null;
  }

  private repairCategories(db: SQLiteHelper, requestedLang: string = "pt"): unknown {
    const hasLangCol = this.hasLanguageColumn(db, "categories");
    let targetLang = "pt";
    if (hasLangCol) {
      const hasLang = db.prepare("SELECT 1 FROM categories WHERE id_language = ?").get(requestedLang);
      targetLang = hasLang ? requestedLang : "pt";
    }
    const query = hasLangCol 
      ? "SELECT * FROM categories WHERE id_language = ? ORDER BY `order` ASC"
      : "SELECT * FROM categories ORDER BY `order` ASC";
    
    const categoriesRows = db.prepare(query).all(hasLangCol ? targetLang : []) as Record<string, unknown>[];
    const categories: Record<string, unknown>[] = [];
    for (const cat of categoriesRows) {
      const albumsRows = db.prepare(`
        SELECT ca.id_album, a.name, a.color, f.dir, f.file_name, ca.name as subtitle, ca.\`order\`
        FROM categories_albums ca
        JOIN albums a ON ca.id_album = a.id_album
        LEFT JOIN files f ON a.id_file_image = f.id_file
        WHERE ca.id_category = ?
        ORDER BY ca.\`order\` ASC
      `).all(cat.id_category) as Record<string, unknown>[];

      const albums = albumsRows.map(row => ({
        id_album: row.id_album,
        name: row.name,
        color: row.color,
        url_image: (row.dir && row.file_name) ? `${row.dir}/${row.file_name}` : null,
        subtitle: row.subtitle || "",
        order: row.order,
      }));

      categories.push({
        id_category: cat.id_category,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        albums: albums.length > 0 ? albums : undefined,
      });
    }
    this.saveJson(`${requestedLang}_categories`, categories);
    return categories;
  }

  private repairBibleBooks(db: SQLiteHelper, requestedLang: string = "pt"): unknown {
    const hasLang = db.prepare("SELECT 1 FROM bible_book WHERE id_language = ?").get(requestedLang);
    const targetLang = hasLang ? requestedLang : "pt";
    const books = db.prepare("SELECT * FROM bible_book WHERE id_language = ? ORDER BY book_number ASC").all(targetLang) as Record<string, unknown>[];
    this.saveJson(`${requestedLang}_bible_book`, books);
    return books;
  }

  private repairBibleVersions(db: SQLiteHelper, requestedLang: string = "pt"): unknown {
    const hasLang = db.prepare("SELECT 1 FROM bible_version WHERE id_language = ?").get(requestedLang);
    const targetLang = hasLang ? requestedLang : "pt";
    const versions = db.prepare("SELECT * FROM bible_version WHERE id_language = ?").all(targetLang) as Record<string, unknown>[];
    this.saveJson(`${requestedLang}_bible_version`, versions);
    return versions;
  }

  private repairHymnal(db: SQLiteHelper, albumId: number, filename: string, _requestedLang: string = "pt"): unknown {
    const rows = db.prepare(`
      SELECT am.track, m.id_music, m.name, fim.file_name as im_file, fm.duration
      FROM albums_musics am
      JOIN musics m ON am.id_music = m.id_music
      LEFT JOIN files fm ON m.id_file_music = fm.id_file
      LEFT JOIN files fim ON m.id_file_instrumental_music = fim.id_file
      WHERE am.id_album = ?
      ORDER BY am.track ASC
    `).all(albumId) as Record<string, unknown>[];

    const data = rows.map(r => {
      const lyrics = db.prepare("SELECT lyric FROM lyrics WHERE id_music = ? ORDER BY `order` ASC").all(r.id_music) as Record<string, unknown>[];
      let fullLyric = "";
      for (const l of lyrics) {
        if (typeof l.lyric === "string" && l.lyric.trim() !== "") {
          fullLyric += `${l.lyric} `;
        }
      }
      return {
        id_music: r.id_music,
        name: r.name,
        track: r.track,
        has_instrumental_music: r.im_file ? 1 : 0,
        duration: r.duration,
        lyric: fullLyric,
      };
    });
    this.saveJson(filename, data);
    return data;
  }

  private repairBibleChapter(db: SQLiteHelper, version: number, book: number, ch: number, filename: string): unknown {
    const verses = db.prepare(`
      SELECT verse, text 
      FROM bible_verse 
      WHERE id_bible_version = ? AND id_bible_book = ? AND chapter = ?
      ORDER BY verse ASC
    `).all(version, book, ch) as Record<string, unknown>[];
    
    const versesObj: Record<string, string> = {};
    for (const v of verses) {
      versesObj[v.verse as number] = v.text as string;
    }
    this.saveJson(filename, versesObj);
    return versesObj;
  }

  private repairAlbum(db: SQLiteHelper, albumId: number): unknown {
    const albumRow = db.prepare(`
      SELECT a.id_album, a.name, a.color, f.dir, f.file_name 
      FROM albums a
      LEFT JOIN files f ON a.id_file_image = f.id_file
      WHERE a.id_album = ?
    `).get(albumId) as Record<string, unknown>;
    
    if (!albumRow) return null;

    const categoriesRows = db.prepare(`
      SELECT c.slug, c.id_category 
      FROM categories_albums ca
      JOIN categories c ON ca.id_category = c.id_category
      WHERE ca.id_album = ?
    `).all(albumId) as Record<string, unknown>[];
    
    const categoriesSlugs = categoriesRows.map(c => c.slug);
    
    const albumJson = {
      id_album: albumRow.id_album,
      name: albumRow.name,
      color: albumRow.color || "",
      url_image: (albumRow.dir && albumRow.file_name) ? `${albumRow.dir}/${albumRow.file_name}` : null,
      categories: categoriesSlugs.length > 0 ? categoriesSlugs : undefined,
      musics: [] as Record<string, unknown>[],
    };

    const musicsRows = db.prepare(`
      SELECT m.id_music, m.name, am.track, fm.duration
      FROM albums_musics am
      JOIN musics m ON am.id_music = m.id_music
      LEFT JOIN files fm ON m.id_file_music = fm.id_file
      WHERE am.id_album = ?
      ORDER BY am.track ASC
    `).all(albumId) as Record<string, unknown>[];

    for (const m of musicsRows) {
      albumJson.musics.push({
        id_music: m.id_music,
        name: m.name,
        duration: m.duration,
        track: m.track,
      });
    }

    this.saveJson(`album_${albumId}`, albumJson);
    return albumJson;
  }

  private repairAllMusics(db: SQLiteHelper, requestedLang: string = "pt"): unknown {
    const hasLang = db.prepare("SELECT 1 FROM albums WHERE id_language = ? LIMIT 1").get(requestedLang);
    const targetLang = hasLang ? requestedLang : "pt";

    const rows = db.prepare(`
      SELECT DISTINCT m.id_music, m.name, fim.file_name as im_file, fm.duration
      FROM musics m
      JOIN albums_musics am ON m.id_music = am.id_music
      JOIN albums a ON am.id_album = a.id_album
      LEFT JOIN files fm ON m.id_file_music = fm.id_file
      LEFT JOIN files fim ON m.id_file_instrumental_music = fim.id_file
      WHERE a.id_language = ?
      ORDER BY m.name ASC
    `).all(targetLang) as Record<string, unknown>[];

    const albumsRows = db.prepare(`
      SELECT am.id_music, a.id_album, a.name, am.track, c.slug as type
      FROM albums_musics am
      JOIN albums a ON am.id_album = a.id_album
      LEFT JOIN categories_albums ca ON a.id_album = ca.id_album
      LEFT JOIN categories c ON ca.id_category = c.id_category
      WHERE a.id_language = ?
    `).all(targetLang) as Record<string, unknown>[];

    const musicAlbumsMap: Record<number, Record<string, unknown>[]> = {};
    for (const row of albumsRows) {
      const idMusic = row.id_music as number;
      if (!musicAlbumsMap[idMusic]) musicAlbumsMap[idMusic] = [];
      
      let type = row.type as string;
      if (type === "hymnal_1996") type = "hymnal";

      musicAlbumsMap[idMusic].push({
        id_album: row.id_album,
        name: row.name,
        type,
        pivot: {
          track: row.track,
        },
      });
    }

    const data = rows.map(r => {
      const idMusic = r.id_music as number;
      const lyrics = db.prepare("SELECT lyric FROM lyrics WHERE id_music = ? ORDER BY `order` ASC").all(idMusic) as Record<string, unknown>[];
      let fullLyric = "";
      for (const l of lyrics) {
        if (typeof l.lyric === "string" && l.lyric.trim() !== "") {
          fullLyric += `${l.lyric} `;
        }
      }
      return {
        id_music: idMusic,
        name: r.name,
        has_instrumental_music: r.im_file ? 1 : 0,
        duration: r.duration,
        lyric: fullLyric,
        albums: musicAlbumsMap[idMusic] || [],
      };
    });

    this.saveJson(`${requestedLang}_musics`, data);
    return data;
  }

  private repairMusic(db: SQLiteHelper, musicId: number): unknown {
    const m = db.prepare(`
      SELECT m.id_music, m.name, 
        fm.duration as duration,
        fim.duration as instrumental_duration,
        fm.dir as m_dir, fm.file_name as m_file,
        fim.dir as im_dir, fim.file_name as im_file,
        fi.dir as i_dir, fi.file_name as i_file
      FROM musics m
      LEFT JOIN files fm ON m.id_file_music = fm.id_file
      LEFT JOIN files fim ON m.id_file_instrumental_music = fim.id_file
      LEFT JOIN files fi ON m.id_file_image = fi.id_file
      WHERE m.id_music = ?
    `).get(musicId) as Record<string, unknown>;

    if (!m) return null;

    const lyricsRows = db.prepare(`
      SELECT l.id_lyric, l.lyric, l.aux_lyric, l.time, l.instrumental_time, l.show_slide, l.\`order\`,
              fl.dir, fl.file_name
      FROM lyrics l
      LEFT JOIN files fl ON l.id_file_image = fl.id_file
      WHERE l.id_music = ?
      ORDER BY l.\`order\` ASC
    `).all(musicId) as Record<string, unknown>[];

    const lyricArr = lyricsRows.map(l => ({
      id_lyric: l.id_lyric,
      id_music: m.id_music,
      lyric: l.lyric,
      aux_lyric: l.aux_lyric,
      url_image: (l.dir && l.file_name) ? `${l.dir}/${l.file_name}` : null,
      image_position: null,
      time: l.time,
      instrumental_time: l.instrumental_time,
      show_slide: l.show_slide,
      order: l.order,
    }));

    const musicAlbumsRows = db.prepare(`
      SELECT am.id_album, a.name, am.track, f.dir, f.file_name, ca.\`order\`
      FROM albums_musics am
      JOIN albums a ON am.id_album = a.id_album
      LEFT JOIN files f ON a.id_file_image = f.id_file
      LEFT JOIN categories_albums ca ON ca.id_album = a.id_album
      WHERE am.id_music = ?
    `).all(musicId) as Record<string, unknown>[];

    const musicAlbums = musicAlbumsRows.map(a => ({
      id_album: a.id_album,
      name: a.name,
      track: a.track,
      url_image: (a.dir && a.file_name) ? `${a.dir}/${a.file_name}` : null,
      order: a.order || 0,
    }));

    const musicJson = {
      id_music: m.id_music,
      name: m.name,
      duration: m.duration,
      instrumental_duration: m.instrumental_duration,
      url_image: (m.i_dir && m.i_file) ? `${m.i_dir}/${m.i_file}` : null,
      image_position: null,
      url_music: (m.m_dir && m.m_file) ? `${m.m_dir}/${m.m_file}` : null,
      url_instrumental_music: (m.im_dir && m.im_file) ? `${m.im_dir}/${m.im_file}` : null,
      lyric: lyricArr,
      albums: musicAlbums,
    };

    this.saveJson(`music_${musicId}`, musicJson);
    return musicJson;
  }


  private saveJson(filename: string, data: unknown): void {
    const filePath = path.join(this.sysdataDir, `${filename}.bin`);
    const jsonString = JSON.stringify(data);
    const encryptedContent = encryptData(jsonString);
    if (encryptedContent) {
      fs.writeFileSync(filePath, encryptedContent, "utf8");
    }
  }

  private hasLanguageColumn(db: SQLiteHelper, table: string): boolean {
    try {
      db.prepare(`SELECT id_language FROM ${table} LIMIT 1`).get();
      return true;
    } catch {
      return false;
    }
  }

  private extractCategories(db: SQLiteHelper): void {
    const hasLang = this.hasLanguageColumn(db, "categories");
    const query = hasLang ? "SELECT * FROM categories WHERE id_language = 'pt' ORDER BY `order` ASC" : "SELECT * FROM categories ORDER BY `order` ASC";
    const categoriesRows = db.prepare(query).all() as Record<string, unknown>[];
    const categories: Record<string, unknown>[] = [];

    for (const cat of categoriesRows) {
      const albumsRows = db.prepare(`
        SELECT ca.id_album, a.name, a.color, f.dir, f.file_name, ca.name as subtitle, ca.\`order\`
        FROM categories_albums ca
        JOIN albums a ON ca.id_album = a.id_album
        LEFT JOIN files f ON a.id_file_image = f.id_file
        WHERE ca.id_category = ?
        ORDER BY ca.\`order\` ASC
      `).all(cat.id_category) as Record<string, unknown>[];

      const albums = albumsRows.map(row => ({
        id_album: row.id_album,
        name: row.name,
        color: row.color,
        url_image: (row.dir && row.file_name) ? `${row.dir}/${row.file_name}` : null,
        subtitle: row.subtitle || "",
        order: row.order,
      }));

      categories.push({
        id_category: cat.id_category,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        albums: albums.length > 0 ? albums : undefined,
      });
    }

    this.saveJson("pt_categories", categories);
  }

  private extractAlbumsAndMusics(db: SQLiteHelper, progressCallback: (data: { text: string; progress: number }) => void): void {
    const hasLang = this.hasLanguageColumn(db, "albums");
    const albumsQuery = hasLang 
      ? `
      SELECT a.id_album, a.name, a.color, f.dir, f.file_name 
      FROM albums a
      LEFT JOIN files f ON a.id_file_image = f.id_file
      WHERE a.id_language = 'pt'
      `
      : `
      SELECT a.id_album, a.name, a.color, f.dir, f.file_name 
      FROM albums a
      LEFT JOIN files f ON a.id_file_image = f.id_file
      `;

    const albums = db.prepare(albumsQuery).all() as Record<string, unknown>[];

    let processedAlbums = 0;
    const totalAlbums = albums.length;

    for (const album of albums) {
      const categoriesRows = db.prepare(`
        SELECT c.slug, c.id_category 
        FROM categories_albums ca
        JOIN categories c ON ca.id_category = c.id_category
        WHERE ca.id_album = ?
      `).all(album.id_album) as Record<string, unknown>[];
      
      const categoriesSlugs = categoriesRows.map(c => c.slug);
      
      const albumJson = {
        id_album: album.id_album,
        name: album.name,
        color: album.color || "",
        url_image: (album.dir && album.file_name) ? `${album.dir}/${album.file_name}` : null,
        categories: categoriesSlugs.length > 0 ? categoriesSlugs : undefined,
        musics: [] as Record<string, unknown>[],
      };

      const musicsRows = db.prepare(`
        SELECT m.id_music, m.name, am.track, 
          fm.duration as duration,
          fim.duration as instrumental_duration,
          fm.dir as m_dir, fm.file_name as m_file,
          fim.dir as im_dir, fim.file_name as im_file,
          fi.dir as i_dir, fi.file_name as i_file
        FROM albums_musics am
        JOIN musics m ON am.id_music = m.id_music
        LEFT JOIN files fm ON m.id_file_music = fm.id_file
        LEFT JOIN files fim ON m.id_file_instrumental_music = fim.id_file
        LEFT JOIN files fi ON m.id_file_image = fi.id_file
        WHERE am.id_album = ?
        ORDER BY am.track ASC
      `).all(album.id_album) as Record<string, unknown>[];

      for (const m of musicsRows) {
        albumJson.musics.push({
          id_music: m.id_music,
          name: m.name,
          has_instrumental_music: m.im_file ? 1 : 0,
          duration: m.duration,
          track: m.track,
        });

        const lyricsRows = db.prepare(`
          SELECT l.id_lyric, l.lyric, l.aux_lyric, l.time, l.instrumental_time, l.show_slide, l.\`order\`,
                 fl.dir, fl.file_name
          FROM lyrics l
          LEFT JOIN files fl ON l.id_file_image = fl.id_file
          WHERE l.id_music = ?
          ORDER BY l.\`order\` ASC
        `).all(m.id_music) as Record<string, unknown>[];

        const lyricArr = lyricsRows.map(l => ({
          id_lyric: l.id_lyric,
          id_music: m.id_music,
          lyric: l.lyric,
          aux_lyric: l.aux_lyric,
          url_image: (l.dir && l.file_name) ? `${l.dir}/${l.file_name}` : null,
          image_position: null,
          time: l.time,
          instrumental_time: l.instrumental_time,
          show_slide: l.show_slide,
          order: l.order,
        }));

        const musicAlbumsRows = db.prepare(`
          SELECT am.id_album, a.name, am.track, f.dir, f.file_name, ca.\`order\`
          FROM albums_musics am
          JOIN albums a ON am.id_album = a.id_album
          LEFT JOIN files f ON a.id_file_image = f.id_file
          LEFT JOIN categories_albums ca ON ca.id_album = a.id_album
          WHERE am.id_music = ?
        `).all(m.id_music) as Record<string, unknown>[];

        const musicAlbums = musicAlbumsRows.map(a => ({
          id_album: a.id_album,
          name: a.name,
          track: a.track,
          url_image: (a.dir && a.file_name) ? `${a.dir}/${a.file_name}` : null,
          order: a.order || 0,
        }));

        const musicJson = {
          id_music: m.id_music,
          name: m.name,
          duration: m.duration,
          instrumental_duration: m.instrumental_duration,
          url_image: (m.i_dir && m.i_file) ? `${m.i_dir}/${m.i_file}` : null,
          image_position: null,
          url_music: (m.m_dir && m.m_file) ? `${m.m_dir}/${m.m_file}` : null,
          url_instrumental_music: (m.im_dir && m.im_file) ? `${m.im_dir}/${m.im_file}` : null,
          lyric: lyricArr,
          albums: musicAlbums,
        };

        this.saveJson(`music_${m.id_music}`, musicJson);
      }

      this.saveJson(`album_${album.id_album}`, albumJson);
      
      processedAlbums++;
      if (processedAlbums % 10 === 0) {
        progressCallback({ text: "Extraindo álbuns...", progress: 20 + Math.floor((processedAlbums / totalAlbums) * 40) });
      }
    }
  }

  private extractHymnals(db: SQLiteHelper): void {
    const getHymnalData = (albumId: number) => {
      const rows = db.prepare(`
        SELECT am.track, m.id_music, m.name, fim.file_name as im_file, fm.duration
        FROM albums_musics am
        JOIN musics m ON am.id_music = m.id_music
        LEFT JOIN files fm ON m.id_file_music = fm.id_file
        LEFT JOIN files fim ON m.id_file_instrumental_music = fim.id_file
        WHERE am.id_album = ?
        ORDER BY am.track ASC
      `).all(albumId) as Record<string, unknown>[];

      return rows.map(r => {
        const lyrics = db.prepare("SELECT lyric FROM lyrics WHERE id_music = ? ORDER BY `order` ASC").all(r.id_music) as Record<string, unknown>[];
        let fullLyric = "";
        for (const l of lyrics) {
          if (typeof l.lyric === "string" && l.lyric.trim() !== "") {
            fullLyric += `${l.lyric} `;
          }
        }
        
        return {
          id_music: r.id_music,
          name: r.name,
          track: r.track,
          has_instrumental_music: r.im_file ? 1 : 0,
          duration: r.duration,
          lyric: fullLyric,
        };
      });
    };

    const langRow = db.prepare("SELECT id_language FROM bible_version LIMIT 1").get() as { id_language: string };
    const lang = langRow?.id_language || "pt";
    
    try {
      if (lang === "pt") {
        this.saveJson("pt_hymnal", getHymnalData(712));
        this.saveJson("pt_hymnal_1996", getHymnalData(629));
      } else if (lang === "es") {
        this.saveJson("es_hymnal", getHymnalData(713));
      }
    } catch (e: unknown) {
      console.log("Hinarios ignorados caso não existam:", (e as Error).message);
    }
  }

  private extractBibles(db: SQLiteHelper, progressCallback: (data: { text: string; progress: number }) => void): void {
    const langs = db.prepare("SELECT DISTINCT id_language FROM bible_book").all() as Record<string, unknown>[];
    const books = db.prepare("SELECT * FROM bible_book ORDER BY book_number ASC").all() as Record<string, unknown>[];
    const versions = db.prepare("SELECT * FROM bible_version").all() as Record<string, unknown>[];

    langs.forEach(l => {
      this.saveJson(`${l.id_language}_bible_book`, books.filter(b => b.id_language === l.id_language));
      this.saveJson(`${l.id_language}_bible_version`, versions.filter(v => v.id_language === l.id_language));
    });

    const bibles = db.prepare("SELECT id_bible_version, id_bible_book, chapter FROM bible_verse GROUP BY id_bible_version, id_bible_book, chapter").all() as Record<string, unknown>[];
    const totalChapters = bibles.length;
    let processedChapters = 0;

    for (const b of bibles) {
      const verses = db.prepare(`
        SELECT verse, text 
        FROM bible_verse 
        WHERE id_bible_version = ? AND id_bible_book = ? AND chapter = ?
        ORDER BY verse ASC
      `).all(b.id_bible_version, b.id_bible_book, b.chapter) as Record<string, unknown>[];
      
      const versesObj: Record<string, string> = {};
      for (const v of verses) {
        versesObj[v.verse as number] = v.text as string;
      }
      
      this.saveJson(`bible_${b.id_bible_version}_${b.id_bible_book}_${b.chapter}`, versesObj);
      
      processedChapters++;
      if (processedChapters % 100 === 0) {
        progressCallback({ text: "Extraindo Bíblias...", progress: 70 + Math.floor((processedChapters / totalChapters) * 30) });
      }
    }
  }
}
