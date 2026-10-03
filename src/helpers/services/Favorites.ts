/* eslint-disable @typescript-eslint/no-explicit-any */
import $userdata from "@/helpers/config/UserData";
import $appdata from "@/helpers/config/AppData";
import store from "@/store";
import Modules from "@/helpers/core/Modules";

export const FAVORITES_COLLECTION_ID = "favorites";

export function getFavoritesCollection(): any {
  const collections = store.getters.getData("user_data.modules.custom_collection.list") || $userdata.get("modules.custom_collection.list") || [];
  return collections.find((c: any) => c.id === FAVORITES_COLLECTION_ID || c.is_favorites) || null;
}

export function ensureFavoritesCollection(): any {
  let collections = $userdata.get("modules.custom_collection.list") || [];
  let fav = collections.find((c: any) => c.id === FAVORITES_COLLECTION_ID || c.is_favorites);
  if (!fav) {
    fav = {
      id: FAVORITES_COLLECTION_ID,
      name: "Favoritos",
      coverImage: null,
      songs: [],
      is_favorites: true,
    };
    collections = [fav, ...collections];
    $userdata.set("modules.custom_collection.list", collections);
  } else if (!fav.is_favorites || fav.id !== FAVORITES_COLLECTION_ID) {
    fav.is_favorites = true;
    fav.id = FAVORITES_COLLECTION_ID;
    $userdata.set("modules.custom_collection.list", collections);
  }
  return fav;
}

export function isFavoriteSong(idMusic: number | string | undefined, item?: any): boolean {
  const list = store.getters.getData("user_data.modules.custom_collection.list") || $userdata.get("modules.custom_collection.list") || [];
  const fav = list.find((c: any) => c.id === FAVORITES_COLLECTION_ID || c.is_favorites);
  if (!fav || !Array.isArray(fav.songs)) return false;

  const numId = Number(idMusic);
  if (!isNaN(numId) && numId > 0) {
    return fav.songs.some((s: any) => s.type === "internal" && Number(s.id_music) === numId);
  }

  if (item?.is_external_song && item?.filePathAudio) {
    return fav.songs.some((s: any) => s.type === "external" && s.filePathAudio === item.filePathAudio);
  }

  return false;
}

export function toggleFavoriteSong(idMusic: number | string | undefined, item?: any): boolean {
  let collections = $userdata.get("modules.custom_collection.list") || [];
  let fav = collections.find((c: any) => c.id === FAVORITES_COLLECTION_ID || c.is_favorites);
  if (!fav) {
    fav = {
      id: FAVORITES_COLLECTION_ID,
      name: "Favoritos",
      coverImage: null,
      songs: [],
      is_favorites: true,
    };
    collections = [fav, ...collections];
  }
  if (!Array.isArray(fav.songs)) {
    fav.songs = [];
  }

  const numId = Number(idMusic);
  let isNowFavorite = false;

  if (!isNaN(numId) && numId > 0) {
    const existingIndex = fav.songs.findIndex((s: any) => s.type === "internal" && Number(s.id_music) === numId);
    if (existingIndex >= 0) {
      fav.songs.splice(existingIndex, 1);
      isNowFavorite = false;
    } else {
      fav.songs.push({
        id: crypto.randomUUID(),
        type: "internal",
        id_music: numId,
      });
      isNowFavorite = true;
    }
  } else if (item?.is_external_song && item?.filePathAudio) {
    const existingIndex = fav.songs.findIndex((s: any) => s.type === "external" && s.filePathAudio === item.filePathAudio);
    if (existingIndex >= 0) {
      fav.songs.splice(existingIndex, 1);
      isNowFavorite = false;
    } else {
      fav.songs.push({
        id: crypto.randomUUID(),
        type: "external",
        name: item.name || "Música",
        filePathAudio: item.filePathAudio,
        filePathInstrumental: item.filePathInstrumental || null,
      });
      isNowFavorite = true;
    }
  } else {
    return false;
  }

  $userdata.set("modules.custom_collection.list", [...collections]);
  return isNowFavorite;
}

export function openFavorites(): void {
  ensureFavoritesCollection();
  $appdata.set("modules.custom_collection.openCollectionId", FAVORITES_COLLECTION_ID);
  Modules.open("custom_collection");
  window.dispatchEvent(new CustomEvent("open-favorites-collection"));
}

export default {
  FAVORITES_COLLECTION_ID,
  getFavoritesCollection,
  ensureFavoritesCollection,
  isFavoriteSong,
  toggleFavoriteSong,
  openFavorites,
};
