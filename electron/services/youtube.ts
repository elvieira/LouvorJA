import { ipcMain } from "electron";

interface YoutubePlaylistVideo {
  videoId: string;
  title: string;
}

interface YoutubePlaylistResult {
  playlistId: string;
  title: string;
  videos: YoutubePlaylistVideo[];
}

function extractJsonAfter(html: string, marker: string): any | null {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return null;
  const start = html.indexOf("{", markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function findAll(obj: any, key: string, results: any[], depth = 0) {
  if (depth > 60 || !obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) findAll(item, key, results, depth + 1);
    return;
  }
  for (const k of Object.keys(obj)) {
    if (k === key) results.push(obj[k]);
    else findAll(obj[k], key, results, depth + 1);
  }
}

export function extractPlaylistId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

export function registerYoutubeHandlers() {
  ipcMain.handle("fetch-youtube-playlist", async (_event, playlistId: string): Promise<YoutubePlaylistResult | null> => {
    const id = extractPlaylistId(playlistId || "");
    if (!id) return null;
    try {
      const response = await fetch(`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}&hl=pt`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });
      if (!response.ok) return null;
      const html = await response.text();

      const data = extractJsonAfter(html, "var ytInitialData");
      if (!data) return null;

      const titleHolders: any[] = [];
      findAll(data, "playlistMetadataRenderer", titleHolders, 0);
      const playlistTitle = titleHolders[0]?.title || "";

      const seen = new Set<string>();
      const videos: YoutubePlaylistVideo[] = [];

      const lockups: any[] = [];
      findAll(data, "lockupViewModel", lockups, 0);
      for (const lockup of lockups) {
        if (lockup?.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO") continue;
        const videoId = lockup.contentId;
        const title = lockup.metadata?.lockupMetadataViewModel?.title?.content;
        if (!videoId || !title || seen.has(videoId)) continue;
        seen.add(videoId);
        videos.push({ videoId, title });
      }

      // Formato legado do YouTube (caso a página ainda use o layout antigo).
      if (videos.length === 0) {
        const legacyRenderers: any[] = [];
        findAll(data, "playlistVideoRenderer", legacyRenderers, 0);
        for (const renderer of legacyRenderers) {
          const videoId = renderer?.videoId;
          const title = renderer?.title?.runs?.[0]?.text;
          if (!videoId || !title || seen.has(videoId)) continue;
          seen.add(videoId);
          videos.push({ videoId, title });
        }
      }

      if (videos.length === 0) return null;

      return { playlistId: id, title: playlistTitle, videos };
    } catch (error) {
      console.error("Erro ao buscar playlist do YouTube:", error);
      return null;
    }
  });
}
