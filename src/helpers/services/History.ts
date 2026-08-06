import $storage from "@/helpers/services/Storage";
import $appdata from "@/helpers/config/AppData";
import $userdata from "@/helpers/config/UserData";

const RECENT_COLLECTIONS_KEY = "history_recent_collections";
const TOP_SONGS_KEY = "history_top_songs";
const MAX_RECENT_COLLECTIONS = 7;
const MAX_TOP_SONGS = 20;

export interface RecentCollection {
  id: string | number;
  type?: string;
  name?: string;
  icon?: string;
  timestamp?: number;
  url_image?: string | null;
}

export interface SongPlay {
  id_music: string | number;
  name?: string;
  album_name?: string;
  duration?: string;
  play_count?: number;
  last_played?: number;
}

const getHistoryKey = (base: string) => {
  const loc = $userdata.get("language") || "pt";
  return loc === "pt" ? base : `${base}_${loc}`;
};

setTimeout(() => {
  const recentKey = getHistoryKey(RECENT_COLLECTIONS_KEY);
  const topKey = getHistoryKey(TOP_SONGS_KEY);
  if (!$appdata.exists(recentKey)) {
    $appdata.set(recentKey, $storage.get(recentKey, []));
  }
  if (!$appdata.exists(topKey)) {
    $appdata.set(topKey, $storage.get(topKey, {}));
  }
}, 0);

export default {
  /**
   * Adiciona uma coletânea/módulo ao histórico de recentes.
   */
  addRecentCollection(data: RecentCollection) {
    if (!data || !data.id) return;

    const recentKey = getHistoryKey(RECENT_COLLECTIONS_KEY);
    const collections = $storage.get(recentKey, []) as RecentCollection[];

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

    $storage.set(recentKey, trimmed);
    $appdata.set(recentKey, trimmed);
  },

  /**
   * Retorna as últimas coletâneas/módulos abertos (reativo).
   */
  getRecentCollections(): RecentCollection[] {
    const recentKey = getHistoryKey(RECENT_COLLECTIONS_KEY);
    return $appdata.get(recentKey, $storage.get(recentKey, [])) as RecentCollection[];
  },

  addSongPlay(data: SongPlay) {
    if (!data || !data.id_music) return;

    const songs = this._getAllSongPlays();
    const key = String(data.id_music);

    if (songs[key]) {
      songs[key].play_count = (songs[key].play_count || 0) + 1;
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

    const topKey = getHistoryKey(TOP_SONGS_KEY);
    $storage.set(topKey, songs);
    $appdata.set(topKey, songs);
  },

  getTopSongs(limit = MAX_TOP_SONGS): SongPlay[] {
    const topKey = getHistoryKey(TOP_SONGS_KEY);
    const songs = $appdata.get(topKey, $storage.get(topKey, {}));
    return Object.values(songs as Record<string, SongPlay>)
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, limit);
  },

  _getAllSongPlays(): Record<string, SongPlay> {
    const topKey = getHistoryKey(TOP_SONGS_KEY);
    return $storage.get(topKey, {}) as Record<string, SongPlay>;
  },

  clearAll() {
    const recentKey = getHistoryKey(RECENT_COLLECTIONS_KEY);
    const topKey = getHistoryKey(TOP_SONGS_KEY);
    $storage.set(recentKey, []);
    $storage.set(topKey, {});
    $appdata.set(recentKey, []);
    $appdata.set(topKey, {});
  },
};
