import developersData from "@/modules/core/app/help/data/developers.json";

export const cacheAvatars = async () => {
  if (!navigator.onLine) return;
  const CACHE_KEY = "dev_avatars_cache";
  
  let currentCache: Record<string, string> = {};
  try {
    currentCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    // ignorar parse error
  }

  const newCache = { ...currentCache };
  let updated = false;

  const urls: string[] = [];
  if (developersData.owner?.avatar) urls.push(developersData.owner.avatar);
  if (developersData.current_version_maintainer?.avatar) urls.push(developersData.current_version_maintainer.avatar);
  
  if (developersData.developers && Array.isArray(developersData.developers)) {
    developersData.developers.forEach((d: { avatar?: string }) => {
      if (d.avatar) urls.push(d.avatar);
    });
  }

  for (const url of urls) {
    try {
      const fetchUrl = url.includes("?") ? url : `${url}?size=80`;
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        if (newCache[url] !== base64) {
          newCache[url] = base64;
          updated = true;
        }
      }
    } catch {
      console.warn("Failed to cache avatar:", url);
    }
  }

  if (updated) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
  }
};
