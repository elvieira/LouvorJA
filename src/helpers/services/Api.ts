export const API_PRIMARY = "https://api.louvorja.com.br";
export const API_FALLBACK = "https://api.louvorja.workers.dev";

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
