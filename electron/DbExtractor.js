const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');
const { app } = require('electron');
const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from('v389s8dkj238910s8a7d3h2j1k9s8d7f', 'utf8');
const IV_LENGTH = 16;

function encryptData(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (e) {
    console.error('Erro ao ofuscar dados', e);
    return null;
  }
}

class DbExtractor {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.sysdataDir = path.join(app.getPath('userData'), '.sysdata');
  }

  async extract(progressCallback = () => {}) {
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Database file not found at ${this.dbPath}`);
    }

    fs.ensureDirSync(this.sysdataDir);
    const db = new Database(this.dbPath, { readonly: true });
    
    try {
      progressCallback({ text: 'Extraindo categorias...', progress: 10 });
      this.extractCategories(db);

      progressCallback({ text: 'Extraindo álbuns...', progress: 20 });
      this.extractAlbumsAndMusics(db, progressCallback);

      progressCallback({ text: 'Extraindo hinários...', progress: 60 });
      this.extractHymnals(db);

      progressCallback({ text: 'Extraindo Bíblias...', progress: 70 });
      this.extractBibles(db, progressCallback);

      progressCallback({ text: 'Extração concluída', progress: 100 });
    } finally {
      db.close();
    }
  }

  saveJson(filename, data) {
    const filePath = path.join(this.sysdataDir, `${filename}.bin`);
    const jsonString = JSON.stringify(data);
    const encryptedContent = encryptData(jsonString);
    if (encryptedContent) {
      fs.writeFileSync(filePath, encryptedContent, 'utf8');
    }
  }

  extractCategories(db) {
    // pt_categories.json
    const categoriesRows = db.prepare(`SELECT * FROM categories WHERE id_language = 'pt' ORDER BY \`order\` ASC`).all();
    const categories = [];

    for (const cat of categoriesRows) {
      const albumsRows = db.prepare(`
        SELECT ca.id_album, a.name, a.color, f.dir, f.file_name, ca.name as subtitle, ca.\`order\`
        FROM categories_albums ca
        JOIN albums a ON ca.id_album = a.id_album
        LEFT JOIN files f ON a.id_file_image = f.id_file
        WHERE ca.id_category = ?
        ORDER BY ca.\`order\` ASC
      `).all(cat.id_category);

      const albums = albumsRows.map(row => ({
        id_album: row.id_album,
        name: row.name,
        color: row.color,
        url_image: (row.dir && row.file_name) ? `${row.dir}/${row.file_name}` : null,
        subtitle: row.subtitle || '',
        order: row.order
      }));

      categories.push({
        id_category: cat.id_category,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        albums: albums.length > 0 ? albums : undefined
      });
    }

    this.saveJson('pt_categories', categories);
  }

  extractAlbumsAndMusics(db, progressCallback) {
    const albums = db.prepare(`
      SELECT a.id_album, a.name, a.color, f.dir, f.file_name 
      FROM albums a
      LEFT JOIN files f ON a.id_file_image = f.id_file
      WHERE a.id_language = 'pt'
    `).all();

    let processedAlbums = 0;
    const totalAlbums = albums.length;

    for (const album of albums) {
      const categoriesRows = db.prepare(`
        SELECT c.slug, c.id_category 
        FROM categories_albums ca
        JOIN categories c ON ca.id_category = c.id_category
        WHERE ca.id_album = ?
      `).all(album.id_album);
      
      const categoriesSlugs = categoriesRows.map(c => c.slug);
      
      const albumJson = {
        id_album: album.id_album,
        name: album.name,
        color: album.color || '',
        url_image: (album.dir && album.file_name) ? `${album.dir}/${album.file_name}` : null,
        categories: categoriesSlugs.length > 0 ? categoriesSlugs : undefined,
        musics: []
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
      `).all(album.id_album);

      for (const m of musicsRows) {
        albumJson.musics.push({
          id_music: m.id_music,
          name: m.name,
          has_instrumental_music: m.im_file ? 1 : 0,
          duration: m.duration,
          track: m.track
        });

        const lyricsRows = db.prepare(`
          SELECT l.id_lyric, l.lyric, l.aux_lyric, l.time, l.instrumental_time, l.show_slide, l.\`order\`,
                 fl.dir, fl.file_name
          FROM lyrics l
          LEFT JOIN files fl ON l.id_file_image = fl.id_file
          WHERE l.id_music = ?
          ORDER BY l.\`order\` ASC
        `).all(m.id_music);

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
          order: l.order
        }));

        const musicAlbumsRows = db.prepare(`
          SELECT am.id_album, a.name, am.track, f.dir, f.file_name, ca.\`order\`
          FROM albums_musics am
          JOIN albums a ON am.id_album = a.id_album
          LEFT JOIN files f ON a.id_file_image = f.id_file
          LEFT JOIN categories_albums ca ON ca.id_album = a.id_album
          WHERE am.id_music = ?
        `).all(m.id_music);

        const musicAlbums = musicAlbumsRows.map(a => ({
          id_album: a.id_album,
          name: a.name,
          track: a.track,
          url_image: (a.dir && a.file_name) ? `${a.dir}/${a.file_name}` : null,
          order: a.order || 0
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
          albums: musicAlbums
        };

        this.saveJson(`music_${m.id_music}`, musicJson);
      }

      this.saveJson(`album_${album.id_album}`, albumJson);
      
      processedAlbums++;
      if (processedAlbums % 10 === 0) {
        progressCallback({ text: 'Extraindo álbuns...', progress: 20 + Math.floor((processedAlbums / totalAlbums) * 40) });
      }
    }
  }

  extractHymnals(db) {
    const getHymnalData = (albumId) => {
      const rows = db.prepare(`
        SELECT am.track, m.id_music, m.name, fim.file_name as im_file, fm.duration
        FROM albums_musics am
        JOIN musics m ON am.id_music = m.id_music
        LEFT JOIN files fm ON m.id_file_music = fm.id_file
        LEFT JOIN files fim ON m.id_file_instrumental_music = fim.id_file
        WHERE am.id_album = ?
        ORDER BY am.track ASC
      `).all(albumId);

      return rows.map(r => {
        const lyrics = db.prepare(`SELECT lyric FROM lyrics WHERE id_music = ? ORDER BY \`order\` ASC`).all(r.id_music);
        let fullLyric = '';
        for (const l of lyrics) {
          if (l.lyric.trim() !== '') {
            fullLyric += l.lyric + " ";
          }
        }
        
        return {
          id_music: r.id_music,
          name: r.name,
          track: r.track,
          has_instrumental_music: r.im_file ? 1 : 0,
          duration: r.duration,
          lyric: fullLyric
        };
      });
    };

    const hymnalId = 712;
    const hymnal1996Id = 629;
    
    try {
      this.saveJson('pt_hymnal', getHymnalData(hymnalId));
      this.saveJson('pt_hymnal_1996', getHymnalData(hymnal1996Id));
    } catch (e) {
      console.log("Hinarios ignorados caso não existam:", e.message);
    }
  }

  extractBibles(db, progressCallback) {
    const books = db.prepare(`SELECT * FROM bible_book WHERE id_language = 'pt' ORDER BY book_number ASC`).all();
    this.saveJson('pt_bible_book', books);

    const versions = db.prepare(`SELECT * FROM bible_version WHERE id_language = 'pt'`).all();
    this.saveJson('pt_bible_version', versions);

    let processedChapters = 0;
    const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0) * versions.length;

    for (const version of versions) {
      for (const book of books) {
        for (let ch = 1; ch <= book.chapters; ch++) {
          const verses = db.prepare(`
            SELECT verse, text 
            FROM bible_verse 
            WHERE id_bible_version = ? AND id_bible_book = ? AND chapter = ?
            ORDER BY verse ASC
          `).all(version.id_bible_version, book.id_bible_book, ch);
          
          this.saveJson(`bible_${version.id_bible_version}_${book.id_bible_book}_${ch}`, {
            data: verses.map(v => ({ verse: v.verse, text: v.text }))
          });
          
          processedChapters++;
          if (processedChapters % 100 === 0) {
            progressCallback({ text: 'Extraindo Bíblias...', progress: 70 + Math.floor((processedChapters / totalChapters) * 30) });
          }
        }
      }
    }
  }
}

module.exports = DbExtractor;
