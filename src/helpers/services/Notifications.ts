import { reactive, computed } from "vue";
import Telemetry from "@/helpers/services/Telemetry";

export type NotificationType = "update" | "feature" | "alert" | "info";
export type NotificationPriority = "normal" | "high" | "urgent";
export type NotificationAudience = "all" | "windows" | "mac" | "linux";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  target_audience?: NotificationAudience;
  link_url?: string | null;
  link_label?: string | null;
  is_active: boolean;
  created_at: string;
  expires_at?: string | null;
  author_email?: string | null;
}

const STORAGE_READ_KEY = "louvorja_read_notifications";
const STORAGE_VIEWED_KEY = "louvorja_viewed_notifications";
const STORAGE_TRACKED_READ_KEY = "louvorja_tracked_read_notifications";
const SUPABASE_URL = (import.meta.env.VITE_CLOUD_ENDPOINT as string) || "https://vktovorubdurbkpssgty.supabase.co";
const SUPABASE_KEY = (import.meta.env.VITE_CLOUD_TOKEN as string) || "";

/**
 * Lê os IDs de notificações já visualizadas gravados no localStorage
 */
export function getViewedNotificationIds(): number[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Salva a lista de IDs visualizados no localStorage
 */
function saveViewedNotificationIds(ids: number[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_VIEWED_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("[Notifications] Falha ao salvar visualizadas no localStorage:", err);
  }
}

/**
 * Lê os IDs de notificações cujo evento 'notification_read' já foi enviado à telemetria
 */
export function getTrackedReadNotificationIds(): number[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_TRACKED_READ_KEY);
    if (raw) return JSON.parse(raw);
    // Inicializa com as que já constavam como lidas no localStorage para evitar envio duplicado
    const existingRead = getReadNotificationIds();
    if (existingRead.length > 0) {
      saveTrackedReadNotificationIds(existingRead);
    }
    return existingRead;
  } catch {
    return [];
  }
}

/**
 * Salva a lista de IDs com telemetria 'notification_read' já enviada no localStorage
 */
function saveTrackedReadNotificationIds(ids: number[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_TRACKED_READ_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("[Notifications] Falha ao salvar rastreadas como lidas no localStorage:", err);
  }
}

/**
 * Envia para o Supabase (Telemetria) que o usuário viu as notificações ativas no app.
 * Garante estritamente que cada notificação envia 'notification_viewed' apenas UMA VEZ
 * por instalação do aplicativo.
 */
export function trackNotificationsViewed(items: AppNotification[]): void {
  if (!items || items.length === 0) return;

  const viewedIds = new Set<number>(getViewedNotificationIds());
  let changed = false;

  for (const item of items) {
    if (!viewedIds.has(item.id)) {
      viewedIds.add(item.id);
      changed = true;
      Telemetry.track("notification_viewed", {
        notification_id: item.id,
        title: item.title,
        type: item.type,
      });
    }
  }

  if (changed) {
    saveViewedNotificationIds(Array.from(viewedIds));
  }
}

/**
 * Detecta a plataforma atual do usuário
 */
export function getCurrentPlatform(): "mac" | "windows" | "linux" {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "linux";
}

/**
 * Lê os IDs de notificações já lidas gravados no localStorage
 */
export function getReadNotificationIds(): number[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Salva a lista de IDs lidos no localStorage
 */
function saveReadNotificationIds(ids: number[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("[Notifications] Falha ao salvar lidas no localStorage:", err);
  }
}

/**
 * Estado reativo compartilhado por todo o aplicativo
 */
export const notificationsState = reactive({
  items: [] as AppNotification[],
  readIds: getReadNotificationIds(),
  loading: false,
  isOpen: false,
  lastFetched: 0,
});

/**
 * Quantidade de notificações não lidas
 */
export const unreadCount = computed(() => {
  return notificationsState.items.filter(
    (item) => !notificationsState.readIds.includes(item.id),
  ).length;
});

/**
 * Se existem notificações não lidas
 */
export const hasUnread = computed(() => unreadCount.value > 0);

/**
 * Marca uma ou mais notificações como lidas.
 * Garante que o evento 'notification_read' só é enviado para o Supabase
 * UMA ÚNICA VEZ por notificação para esta instalação.
 */
export function markNotificationsAsRead(ids: number[]): void {
  if (!ids || ids.length === 0) return;
  const currentReadSet = new Set(notificationsState.readIds);
  const trackedReadSet = new Set(getTrackedReadNotificationIds());
  let readChanged = false;
  let trackedChanged = false;
  const newlyReadItems: AppNotification[] = [];

  for (const id of ids) {
    if (!currentReadSet.has(id)) {
      currentReadSet.add(id);
      readChanged = true;
    }

    if (!trackedReadSet.has(id)) {
      trackedReadSet.add(id);
      trackedChanged = true;
      const found = notificationsState.items.find((item) => item.id === id);
      if (found) {
        newlyReadItems.push(found);
      }
    }
  }

  if (readChanged) {
    const updated = Array.from(currentReadSet);
    notificationsState.readIds = updated;
    saveReadNotificationIds(updated);
  }

  if (trackedChanged) {
    saveTrackedReadNotificationIds(Array.from(trackedReadSet));

    // Envia ao Supabase que o usuário leu cada uma das notificações (apenas 1 vez por notificação)
    for (const item of newlyReadItems) {
      Telemetry.track("notification_read", {
        notification_id: item.id,
        title: item.title,
        type: item.type,
      });
    }
  }
}

/**
 * Marca todas as notificações ativas atuais como lidas
 */
export function markAllNotificationsAsRead(): void {
  const allIds = notificationsState.items.map((n) => n.id);
  markNotificationsAsRead(allIds);
}

/**
 * Abre ou fecha o modal/painel de notificações
 */
export function toggleNotificationsPanel(open?: boolean): void {
  if (typeof open === "boolean") {
    notificationsState.isOpen = open;
  } else {
    notificationsState.isOpen = !notificationsState.isOpen;
  }

  if (notificationsState.isOpen && notificationsState.items.length > 0) {
    trackNotificationsViewed(notificationsState.items);
  }
}

/**
 * Abre um link externo com segurança
 */
export function openNotificationLink(url: string | null | undefined): void {
  if (!url) return;
  try {
    if (window.electronAPI && typeof window.electronAPI.openExternal === "function") {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    console.error("[Notifications] Erro ao abrir link externo:", err);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * Formata a data de criação em tempo relativo amigável
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return "agora";
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

/**
 * Busca as notificações ativas no Supabase
 */
export async function fetchActiveNotifications(): Promise<AppNotification[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[Notifications] SUPABASE_URL ou SUPABASE_KEY não configuradas");
    return [];
  }

  notificationsState.loading = true;
  try {
    const url = `${SUPABASE_URL}/rest/v1/app_notifications?is_active=eq.true&order=created_at.desc&limit=30`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn(`[Notifications] Falha na consulta (${res.status}):`, await res.text());
      return [];
    }

    const data: AppNotification[] = await res.json();
    const currentPlatform = getCurrentPlatform();
    const now = Date.now();

    // Filtra sistema operacional e expiração
    const filtered = data.filter((item) => {
      // Expiração
      if (item.expires_at) {
        const expTime = new Date(item.expires_at).getTime();
        if (!isNaN(expTime) && expTime <= now) {
          return false;
        }
      }

      // Sistema operacional
      if (item.target_audience && item.target_audience !== "all") {
        if (item.target_audience !== currentPlatform) {
          return false;
        }
      }

      return true;
    });

    notificationsState.items = filtered;
    notificationsState.lastFetched = Date.now();

    // Envia ao Supabase que o usuário viu as notificações ativas no app
    if (filtered.length > 0) {
      trackNotificationsViewed(filtered);
    }

    return filtered;
  } catch (error) {
    console.warn("[Notifications] Erro ao carregar comunicados:", error);
    return [];
  } finally {
    notificationsState.loading = false;
  }
}

let checkInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Inicializa o serviço de notificações (chamado no boot do app)
 */
export function initNotificationsService(): void {
  // Sincroniza os IDs lidos do localStorage
  notificationsState.readIds = getReadNotificationIds();

  // Executa a primeira busca
  fetchActiveNotifications();

  // Polling a cada 15 minutos se ainda não configurado
  if (!checkInterval && typeof setInterval !== "undefined") {
    checkInterval = setInterval(() => {
      fetchActiveNotifications();
    }, 15 * 60 * 1000);
  }
}
