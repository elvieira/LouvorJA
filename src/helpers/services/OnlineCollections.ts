/* eslint-disable @typescript-eslint/no-explicit-any */
// Cliente para a API de "Coletâneas Online" (canais/playlists/vídeos do YouTube),
// o mesmo backend usado pelo aplicativo Delphi legado (endpoint retorna comandos
// SQL crus, separados por "|", que aqui só são interpretados para extrair os campos).

const API_URL = "https://api.louvorja.com.br/onlinevideos";
const API_TOKEN = "02@v2nFB2Dc";

export interface OnlineChannel {
  id: string;
  name: string;
  image: string;
}

export interface OnlinePlaylist {
  id: string;
  channelId: string;
  name: string;
  image: string;
}

export interface OnlineVideo {
  id: string;
  playlistId: string;
  name: string;
  position: number;
  image: string;
}

// Faz o parsing de uma tupla "VALUES (...)" de SQL, respeitando aspas simples e
// o escape de aspas ('') dentro dos valores — sem isso, vírgulas dentro de um
// título de vídeo (ex.: "Louvor, Adoração e Gratidão") quebrariam um split ingênuo.
function parseSqlValues(raw: string): string[] {
  const values: string[] = [];
  let i = 0;
  const len = raw.length;

  while (i < len) {
    while (i < len && (raw[i] === " " || raw[i] === ",")) i++;
    if (i >= len) break;

    if (raw[i] === "'") {
      i++;
      let value = "";
      while (i < len) {
        if (raw[i] === "'" && raw[i + 1] === "'") {
          value += "'";
          i += 2;
        } else if (raw[i] === "'") {
          i++;
          break;
        } else {
          value += raw[i];
          i++;
        }
      }
      values.push(value);
    } else {
      const start = i;
      while (i < len && raw[i] !== ",") i++;
      values.push(raw.slice(start, i).trim());
    }
  }

  return values;
}

function parseInsertRows(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const statements = text.split("|");

  for (const statement of statements) {
    const trimmed = statement.trim();
    const match = trimmed.match(/^INSERT INTO \w+\s*\(([^)]+)\)\s*VALUES\s*\((.+)\)$/i);
    if (!match) continue;

    const columns = match[1].split(",").map((c) => c.trim());
    const values = parseSqlValues(match[2]);

    const row: Record<string, string> = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

async function fetchRows(tipo: "canais" | "playlists" | "videos", id: string, lang: string): Promise<Record<string, string>[]> {
  const url = `${API_URL}?tipo=${tipo}&id=${encodeURIComponent(id)}&atualiza_playlist=1&lang=${lang}`;
  const response = await fetch(url, { headers: { "Api-Token": API_TOKEN } });
  if (!response.ok) {
    throw new Error(`Falha ao consultar coletâneas online (HTTP ${response.status})`);
  }
  const text = await response.text();
  return parseInsertRows(text);
}

export default {
  async getChannels(lang = "pt"): Promise<OnlineChannel[]> {
    const rows = await fetchRows("canais", "", lang);
    return rows
      .filter((r) => r.CANAL_ID)
      .map((r) => ({ id: r.CANAL_ID, name: r.NOME, image: r.IMAGEM }));
  },

  async getPlaylists(channelId: string, lang = "pt"): Promise<OnlinePlaylist[]> {
    const rows = await fetchRows("playlists", channelId, lang);
    return rows
      .filter((r) => r.PLAYLIST_ID)
      .map((r) => ({ id: r.PLAYLIST_ID, channelId: r.CANAL_ID, name: r.NOME, image: r.IMAGEM }));
  },

  async getVideos(playlistId: string, lang = "pt"): Promise<OnlineVideo[]> {
    const rows = await fetchRows("videos", playlistId, lang);
    return rows
      .filter((r) => r.VIDEO_ID)
      .map((r) => ({
        id: r.VIDEO_ID,
        playlistId: r.PLAYLIST_ID,
        name: r.NOME,
        position: parseInt(r.POSICAO, 10) || 0,
        image: r.IMAGEM,
      }))
      .sort((a, b) => a.position - b.position);
  },
};
