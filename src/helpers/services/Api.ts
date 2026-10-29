export const API_PRIMARY = (() => {
  try {
    const dbUrl = import.meta.env.VITE_URL_DATABASE;
    if (dbUrl) {
      return new URL(dbUrl).origin;
    }
  } catch { /* ignore */ }
  return "";
})();

export const API_FALLBACK = import.meta.env.VITE_URL_FALLBACK || "";

/**
 * Executa uma requisição com timeout e fallback automático para a API secundária (Cloudflare Worker/R2).
 */
export async function fetchWithFallback(
  endpointOrUrl: string,
  options: RequestInit = {},
  timeoutMs: number = 3500,
): Promise<Response> {
  let endpoint = endpointOrUrl;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    try {
      const u = new URL(endpointOrUrl);
      endpoint = u.pathname + u.search;
    } catch {
      // Mantém como está se URL inválida
    }
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // 1. Tenta a API primária com timeout curto
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${API_PRIMARY}${cleanEndpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.ok) {
      return response;
    }
    console.warn(`[API] Primária retornou status ${response.status} para ${cleanEndpoint}. Tentando fallback...`);
  } catch (err: unknown) {
    console.warn(`[API] Falha/Timeout na primária para ${cleanEndpoint} (${(err as Error).name || err}). Tentando fallback...`);
  }

  // 2. Tenta a API de fallback (Cloudflare Worker)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_FALLBACK}${cleanEndpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    console.error(`[API] Falha também no fallback para ${cleanEndpoint}:`, err);
    throw err;
  }
}

/**
 * Extrai a versão remota do banco de dados a partir da resposta de /params?type=env.
 * Prioriza `https_db_version` (usado para os bancos SQLite HTTPS modernos no desktop) e
 * mantém fallback para `db_version` caso https_db_version não esteja presente.
 */
export function parseDbVersionFromEnv(text: string): number {
  if (!text) return 0;
  const httpsMatch = text.match(/https_db_version\s*=\s*(\d+)/i);
  if (httpsMatch && httpsMatch[1]) {
    return parseInt(httpsMatch[1], 10);
  }
  const dbMatch = text.match(/^db_version\s*=\s*(\d+)/mi) || text.match(/db_version\s*=\s*(\d+)/i);
  if (dbMatch && dbMatch[1]) {
    return parseInt(dbMatch[1], 10);
  }
  return 0;
}
