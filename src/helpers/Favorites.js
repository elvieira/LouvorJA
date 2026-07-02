import $storage from "@/helpers/Storage";
import $appdata from "@/helpers/AppData";

const FAVORITES_KEY = "favorites";

setTimeout(() => {
  if (!$appdata.exists(FAVORITES_KEY)) {
    $appdata.set(FAVORITES_KEY, $storage.get(FAVORITES_KEY, []));
  }
}, 0);

export default {
  toggle(id_music, data) {
    if (!id_music) return;
    data = data || {};
    var favorites = this.getFavorites();
    var index = favorites.findIndex(function(f) { return f.id_music === id_music; });
    if (index !== -1) {
      favorites.splice(index, 1);
    } else {
      favorites.unshift({
        id_music: id_music,
        name: data.name || "",
        album_name: data.album_name || "",
        duration: data.duration || "0:00",
        added_at: Date.now(),
      });
    }
    $storage.set(FAVORITES_KEY, favorites);
    $appdata.set(FAVORITES_KEY, favorites);
  },

  isFavorite(id_music) {
    if (!id_music) return false;
    var favorites = this.getFavorites();
    return favorites.some(function(f) { return f.id_music === id_music; });
  },

  getFavorites() {
    return $appdata.get(FAVORITES_KEY, $storage.get(FAVORITES_KEY, []));
  },

  clearAll() {
    $storage.set(FAVORITES_KEY, []);
    $appdata.set(FAVORITES_KEY, []);
  },
};
