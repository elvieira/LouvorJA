import $storage from "@/helpers/services/Storage";
import $appdata from "@/helpers/config/AppData";
import $userdata from "@/helpers/config/UserData";

const RECENT_COLLECTIONS_KEY = "history_recent_collections";
const TOP_SONGS_KEY = "history_top_songs";
const MAX_RECENT_COLLECTIONS = 7;
const MAX_TOP_SONGS = 50;

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
  is_external_song?: boolean;
  filePathAudio?: string | null;
  filePathInstrumental?: string | null;
  has_instrumental_music?: boolean | number;
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
      if (data.duration && data.duration !== "0:00" && data.duration !== "00:00") {
        songs[key].duration = data.duration;
      }
      if (data.is_external_song !== undefined) songs[key].is_external_song = data.is_external_song;
      if (data.filePathAudio) songs[key].filePathAudio = data.filePathAudio;
      if (data.filePathInstrumental) songs[key].filePathInstrumental = data.filePathInstrumental;
      if (data.has_instrumental_music !== undefined) songs[key].has_instrumental_music = data.has_instrumental_music;
      songs[key].last_played = Date.now();
    } else {
      songs[key] = {
        id_music: data.id_music,
        name: data.name || "",
        album_name: data.album_name || "",
        duration: data.duration || "0:00",
        play_count: 1,
        last_played: Date.now(),
        is_external_song: data.is_external_song,
        filePathAudio: data.filePathAudio,
        filePathInstrumental: data.filePathInstrumental,
        has_instrumental_music: data.has_instrumental_music,
      };
    }

    const topKey = getHistoryKey(TOP_SONGS_KEY);
    $storage.set(topKey, songs);
    $appdata.set(topKey, songs);
  },

  updateSongDuration(id_music: string | number, duration: string, force = false) {
    if (!id_music || !duration || duration === "0:00" || duration === "00:00") return;

    const songs = this._getAllSongPlays();
    const rawKey = String(id_music);
    const cleanKey = rawKey.replace(/^(slja:|ext:)/, "");

    let foundKey = songs[rawKey] ? rawKey : null;
    if (!foundKey) {
      for (const k of Object.keys(songs)) {
        if (k === rawKey || k.replace(/^(slja:|ext:)/, "") === cleanKey) {
          foundKey = k;
          break;
        }
      }
    }

    if (foundKey && songs[foundKey]) {
      const curDur = songs[foundKey].duration;
      const isBadDuration =
        !curDur ||
        curDur === "0:00" ||
        curDur === "00:00" ||
        (curDur.includes(":00") && curDur !== "0:00" && (curDur.split(":").map(Number)[0] || 0) >= 60);

      if (force || isBadDuration) {
        songs[foundKey].duration = duration;
        const topKey = getHistoryKey(TOP_SONGS_KEY);
        $storage.set(topKey, songs);
        $appdata.set(topKey, { ...songs });
      }
    }
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
