import { net } from "electron";

export const API_PRIMARY = "https://api.louvorja.com.br";
export const API_FALLBACK = "https://api.louvorja.workers.dev";

/**
 * Executa uma requisição HTTP via Electron net.fetch com fallback automático
 * para a réplica Cloudflare Workers/R2 se a API primária falhar ou expirar.
 */
export async function netFetchWithFallback(
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
    const response = await net.fetch(`${API_PRIMARY}${cleanEndpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.ok) {
      return response;
    }
    console.warn(`[netFetch] Primária retornou status ${response.status} para ${cleanEndpoint}. Tentando fallback...`);
  } catch (err: unknown) {
    console.warn(`[netFetch] Falha/Timeout na primária para ${cleanEndpoint} (${(err as Error).name || err}). Tentando fallback...`);
  }

  // 2. Tenta a réplica (Cloudflare Worker)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await net.fetch(`${API_FALLBACK}${cleanEndpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    console.error(`[netFetch] Falha também no fallback para ${cleanEndpoint}:`, err);
    throw err;
  }
}

/**
 * Retorna uma URL para download/stream de arquivos com suporte a fallback.
 */
export function getMediaFileUrl(relativePath: string, useFallback: boolean = false): string {
  const cleanPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  const base = useFallback ? API_FALLBACK : API_PRIMARY;
  return `${base}/file/${cleanPath}`;
}
