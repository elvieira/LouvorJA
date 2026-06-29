import $storage from "@/helpers/Storage";
import $appdata from "@/helpers/AppData";

const RECENT_COLLECTIONS_KEY = "history_recent_collections";
const TOP_SONGS_KEY = "history_top_songs";
const MAX_RECENT_COLLECTIONS = 7;
const MAX_TOP_SONGS = 20;

// Inicializa o estado reativo
setTimeout(() => {
  if (!$appdata.exists(RECENT_COLLECTIONS_KEY)) {
    $appdata.set(RECENT_COLLECTIONS_KEY, $storage.get(RECENT_COLLECTIONS_KEY, []));
  }
  if (!$appdata.exists(TOP_SONGS_KEY)) {
    $appdata.set(TOP_SONGS_KEY, $storage.get(TOP_SONGS_KEY, {}));
  }
}, 0);

export default {
  /**
   * Adiciona uma coletânea/módulo ao histórico de recentes.
   * @param {Object} data - { id, type, name, icon }
   */
  addRecentCollection(data) {
    if (!data || !data.id) return;

    // Use storage to get the fresh list just in case
    let collections = $storage.get(RECENT_COLLECTIONS_KEY, []);

    const filtered = collections.filter(
      (item) => !(item.id === data.id && item.type === data.type),
    );

    filtered.unshift({
      id: data.id,
      type: data.type || "module",
      name: data.name || "",
      icon: data.icon || "mdi-music",
      timestamp: Date.now(),
      url_image: data.url_image || null,
    });

    const trimmed = filtered.slice(0, MAX_RECENT_COLLECTIONS);

    $storage.set(RECENT_COLLECTIONS_KEY, trimmed);
    $appdata.set(RECENT_COLLECTIONS_KEY, trimmed);
  },

  /**
   * Retorna as últimas coletâneas/módulos abertos (reativo).
   * @returns {Array}
   */
  getRecentCollections() {
    return $appdata.get(RECENT_COLLECTIONS_KEY, $storage.get(RECENT_COLLECTIONS_KEY, []));
  },

  /**
   * Incrementa o contador de reprodução de uma música.
   */
  addSongPlay(data) {
    if (!data || !data.id_music) return;

    const songs = this._getAllSongPlays();
    const key = String(data.id_music);

    if (songs[key]) {
      songs[key].play_count += 1;
      songs[key].name = data.name || songs[key].name;
      songs[key].album_name = data.album_name || songs[key].album_name;
      songs[key].duration = data.duration || songs[key].duration;
      songs[key].last_played = Date.now();
    } else {
      songs[key] = {
        id_music: data.id_music,
        name: data.name || "",
        album_name: data.album_name || "",
        duration: data.duration || "0:00",
        play_count: 1,
        last_played: Date.now(),
      };
    }

    $storage.set(TOP_SONGS_KEY, songs);
    $appdata.set(TOP_SONGS_KEY, songs);
  },

  /**
   * Retorna as músicas mais tocadas (reativo).
   */
  getTopSongs(limit = MAX_TOP_SONGS) {
    const songs = $appdata.get(TOP_SONGS_KEY, $storage.get(TOP_SONGS_KEY, {}));
    return Object.values(songs)
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, limit);
  },

  _getAllSongPlays() {
    return $storage.get(TOP_SONGS_KEY, {});
  },

  clearAll() {
    $storage.set(RECENT_COLLECTIONS_KEY, []);
    $storage.set(TOP_SONGS_KEY, {});
    $appdata.set(RECENT_COLLECTIONS_KEY, []);
    $appdata.set(TOP_SONGS_KEY, {});
  },
};
