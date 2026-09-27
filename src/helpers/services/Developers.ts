import developersData from "@/modules/core/app/help/data/developers.json";

export const CACHE_KEY = "dev_avatars_cache";
export const LAST_UPDATE_KEY = "dev_avatars_last_update";
// 7 dias de intervalo para verificação e atualização periódica
export const UPDATE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export interface DevAvatarInfo {
  url: string;
  filename: string;
}

export const getAvatarFilename = (url: string): string => {
  if (!url) return "";
  const clean = url.split("?")[0];
  const parts = clean.split("/");
  const last = parts[parts.length - 1] || "avatar.png";
  if (last.endsWith(".png") || last.endsWith(".jpg") || last.endsWith(".jpeg") || last.endsWith(".webp")) {
    return last;
  }
  return `${last}.png`;
};

export const getAllDevAvatars = (): DevAvatarInfo[] => {
  const list: DevAvatarInfo[] = [];
  const add = (url?: string) => {
    if (url && !list.some(item => item.url === url)) {
      list.push({ url, filename: getAvatarFilename(url) });
    }
  };
  add(developersData.owner?.avatar);
  add(developersData.current_version_maintainer?.avatar);
  if (developersData.developers && Array.isArray(developersData.developers)) {
    developersData.developers.forEach((d: { avatar?: string }) => add(d.avatar));
  }
  return list;
};

export const getAllAvatarUrls = (): string[] => {
  return getAllDevAvatars().map(d => d.url);
};

export const getAllAvatarFilenames = (): string[] => {
  return getAllDevAvatars().map(d => d.filename);
};

export const getAvatarSrc = (url: string): string => {
  if (!url) return "";
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache && cache[url]) {
        return cache[url];
      }
    }
  } catch {
    // fallback
  }
  return "";
};

export const downloadDevAvatar = async (url: string, filename?: string): Promise<boolean> => {
  if (!url) return false;
  const fn = filename || getAvatarFilename(url);
  let downloaded = false;

  // 1. Salva arquivo no disco via Electron em Media/avatars/
  if (window.electronAPI?.downloadMedia) {
    try {
      const ok = await window.electronAPI.downloadMedia(url, "avatars", fn);
      if (ok) downloaded = true;
    } catch (err) {
      console.warn("Erro ao salvar avatar no disco:", fn, err);
    }
  }

  // 2. Obtém e salva em base64 no localStorage para acesso offline e exibição reativa
  try {
    const fetchUrl = url.includes("?") ? url : `${url}?size=160`;
    let base64: string | null = null;

    if (window.electronAPI?.fetchImageBase64) {
      base64 = await window.electronAPI.fetchImageBase64(fetchUrl);
    } else if (navigator.onLine) {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    }

    if (base64) {
      const raw = localStorage.getItem(CACHE_KEY);
      const cache = raw ? JSON.parse(raw) : {};
      cache[url] = base64;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      downloaded = true;
    }
  } catch (e) {
    console.warn("Erro ao salvar avatar em base64:", url, e);
  }

  return downloaded;
};

export const recoverMissingAvatars = async (missingFilenames: string[]): Promise<void> => {
  const devs = getAllDevAvatars();
  for (const fn of missingFilenames) {
    const dev = devs.find(d => d.filename === fn);
    if (dev) {
      await downloadDevAvatar(dev.url, dev.filename);
    }
  }
  try {
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
  } catch {
    // ignore
  }
};

export const shouldUpdateAvatars = (force = false): boolean => {
  if (force) return true;

  // Se o cache ainda não tiver todas as imagens, deve atualizar
  try {
    const rawCache = localStorage.getItem(CACHE_KEY);
    if (!rawCache) return true;
    const cache = JSON.parse(rawCache);
    const devs = getAllDevAvatars();
    for (const d of devs) {
      if (!cache[d.url]) return true;
    }
  } catch {
    return true;
  }

  // Se passou o intervalo periódico de 7 dias, deve atualizar
  const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);
  if (!lastUpdateStr) return true;
  const lastUpdate = parseInt(lastUpdateStr, 10);
  if (isNaN(lastUpdate) || Date.now() - lastUpdate > UPDATE_INTERVAL_MS) {
    return true;
  }

  return false;
};

export const checkAndRecoverAvatars = async (force = false): Promise<boolean> => {
  if (!navigator.onLine && !force) return false;
  if (!shouldUpdateAvatars(force)) return false;

  const devs = getAllDevAvatars();
  let anyUpdated = false;

  for (const dev of devs) {
    const ok = await downloadDevAvatar(dev.url, dev.filename);
    if (ok) anyUpdated = true;
  }

  if (anyUpdated) {
    try {
      localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  }

  return anyUpdated;
};

// Aliases para compatibilidade
export const cacheAvatars = checkAndRecoverAvatars;
export const checkAndRefreshAvatars = checkAndRecoverAvatars;
