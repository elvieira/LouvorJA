<template>
  <v-dialog
    v-model="isOpen"
    max-width="580"
    :theme="isDark ? 'dark' : 'light'"
    content-class="modern-alert-dialog-wrapper notifications-dialog-wrapper"
    transition="fade-transition"
    @keydown.esc="isOpen = false"
  >
    <v-card class="notifications-card rounded-xl overflow-hidden elevation-16">
      <!-- Cabeçalho do Modal -->
      <div class="notifications-header d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <div class="header-icon-box d-flex align-center justify-center mr-3">
            <v-icon color="primary" size="22">
              {{ hasUnread ? 'mdi-bell' : 'mdi-bell-outline' }}
            </v-icon>
          </div>
          <div>
            <div class="d-flex align-center">
              <h2 class="header-title mb-0">
                Notificações & Novidades
              </h2>
              <span
                v-if="unreadCount > 0"
                class="unread-pill ml-2 px-2 py-0.5 text-caption font-weight-bold"
              >
                {{ unreadCount }} {{ unreadCount === 1 ? 'nova' : 'novas' }}
              </span>
            </div>
            <p class="header-subtitle text-caption mb-0">
              Fique por dentro das atualizações do Louvor JA
            </p>
          </div>
        </div>

        <div class="d-flex align-center" style="gap: 8px;">
          <v-btn
            v-if="hasUnread"
            size="small"
            variant="tonal"
            color="primary"
            class="text-none font-weight-bold rounded-lg px-2 mr-1"
            height="32"
            title="Marcar todas como lidas"
            @click="markAllAsRead"
          >
            <v-icon
              size="16"
              class="mr-1"
            >
              mdi-check-all
            </v-icon>
            <span>Marcar lidas</span>
          </v-btn>

          <v-btn
            icon
            size="small"
            variant="flat"
            color="rgba(128, 128, 128, 0.1)"
            class="rounded-lg header-btn"
            :loading="notificationsState.loading"
            title="Atualizar comunicados"
            @click="refresh"
          >
            <v-icon size="18" color="var(--sidebar-text-secondary)">
              mdi-refresh
            </v-icon>
          </v-btn>

          <v-btn
            icon
            size="small"
            variant="flat"
            color="rgba(128, 128, 128, 0.1)"
            class="rounded-lg header-btn"
            title="Fechar"
            @click="isOpen = false"
          >
            <v-icon size="18" color="var(--sidebar-text-secondary)">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider style="border-color: var(--border-color); opacity: 0.8;" />

      <!-- Corpo com a Lista de Notificações -->
      <div class="notifications-body pa-5">
        <!-- Estado Carregando -->
        <div v-if="notificationsState.loading && items.length === 0" class="d-flex flex-column align-center justify-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="36"
            class="mb-3"
          />
          <span class="text-caption" style="color: var(--sidebar-text-secondary);">Carregando comunicados...</span>
        </div>

        <!-- Estado Vazio -->
        <div
          v-else-if="items.length === 0"
          class="empty-state d-flex flex-column align-center justify-center py-12 text-center"
        >
          <div class="empty-icon-box mb-3 d-flex align-center justify-center">
            <v-icon
              size="34"
              color="var(--sidebar-text-secondary)"
            >
              mdi-bell-sleep-outline
            </v-icon>
          </div>
          <h3 class="text-subtitle-1 font-weight-bold mb-1" style="color: var(--sidebar-text);">
            Nenhuma notificação no momento
          </h3>
          <p class="text-caption mb-0 px-6" style="color: var(--sidebar-text-secondary); max-width: 380px;">
            Você está com todas as novidades em dia! Quando houver comunicados ou atualizações, eles aparecerão aqui.
          </p>
        </div>

        <!-- Lista de Cards de Notificação -->
        <div v-else class="notifications-list d-flex flex-column gap-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="notification-card"
            :class="[
              `card-type-${item.type}`,
              { 'is-unread': isUnread(item.id) }
            ]"
          >
            <!-- Borda lateral dinâmica -->
            <div class="card-edge" :style="{ backgroundColor: getTypeColor(item.type) }" />

            <div class="card-content">
              <!-- Linha superior: Tag + Tempo Relativo + Botão Marcar como Lida -->
              <div class="card-meta d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <span
                    class="card-tag font-weight-bold"
                    :style="{
                      color: getTypeColor(item.type),
                      backgroundColor: getTypeBgColor(item.type)
                    }"
                  >
                    {{ getTypeLabel(item.type) }}
                  </span>
                  <span v-if="isUnread(item.id)" class="new-pill ml-2 font-weight-bold">
                    NÃO LIDA
                  </span>
                </div>
                <div class="d-flex align-center">
                  <span class="card-time mr-2">
                    {{ formatTime(item.created_at) }}
                  </span>
                  <button
                    v-if="isUnread(item.id)"
                    type="button"
                    class="mark-single-read-btn"
                    title="Marcar como lida"
                    @click.stop="markSingleAsRead(item)"
                  >
                    <v-icon
                      size="13"
                      class="mr-1"
                    >
                      mdi-check
                    </v-icon>
                    <span>Marcar lida</span>
                  </button>
                </div>
              </div>

              <!-- Título -->
              <h3 class="card-title font-weight-bold mb-1">
                {{ item.title }}
              </h3>

              <!-- Mensagem com quebra de linha -->
              <p class="card-message mb-3">
                {{ item.message }}
              </p>

              <!-- Botão de Ação Externo (se houver) -->
              <div v-if="item.link_url" class="card-actions d-flex align-center pt-1">
                <button
                  type="button"
                  class="action-btn d-inline-flex align-center"
                  @click.stop="openLink(item)"
                >
                  <span>{{ item.link_label || 'Ver Novidades' }}</span>
                  <v-icon
                    size="14"
                    class="ml-1"
                  >
                    mdi-arrow-right
                  </v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useTheme } from "vuetify";
import {
  notificationsState,
  unreadCount,
  hasUnread,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  fetchActiveNotifications,
  openNotificationLink,
  formatRelativeTime,
  type AppNotification,
  type NotificationType,
} from "@/helpers/services/Notifications";

export default defineComponent({
  name: "NotificationsModal",
  setup() {
    const theme = useTheme();
    const isDark = computed(() => theme.name.value === "dark");

    const isOpen = computed({
      get: () => notificationsState.isOpen,
      set: (val: boolean) => {
        notificationsState.isOpen = val;
      },
    });

    const items = computed(() => notificationsState.items);

    const isUnread = (id: number): boolean => {
      return !notificationsState.readIds.includes(id);
    };

    const TYPE_COLORS: Record<NotificationType, string> = {
      feature: "#a855f7",
      update: "#0097d7",
      alert: "#f59e0b",
      info: "#10b981",
    };

    const TYPE_BG_COLORS: Record<NotificationType, string> = {
      feature: "rgba(168, 85, 247, 0.12)",
      update: "rgba(0, 151, 215, 0.12)",
      alert: "rgba(245, 158, 11, 0.12)",
      info: "rgba(16, 185, 129, 0.12)",
    };

    const TYPE_LABELS: Record<NotificationType, string> = {
      feature: "NOVIDADE",
      update: "ATUALIZAÇÃO",
      alert: "AVISO IMPORTANTE",
      info: "INFORMATIVO",
    };

    const getTypeColor = (type: NotificationType): string => {
      return TYPE_COLORS[type] || "#0097d7";
    };

    const getTypeBgColor = (type: NotificationType): string => {
      return TYPE_BG_COLORS[type] || "rgba(0, 151, 215, 0.12)";
    };

    const getTypeLabel = (type: NotificationType): string => {
      return TYPE_LABELS[type] || "COMUNICADO";
    };

    const formatTime = (dateStr: string): string => {
      return formatRelativeTime(dateStr);
    };

    const markAllAsRead = (): void => {
      markAllNotificationsAsRead();
    };

    const refresh = (): void => {
      fetchActiveNotifications();
    };

    const markSingleAsRead = (item: AppNotification): void => {
      markNotificationsAsRead([item.id]);
    };

    const openLink = (item: AppNotification): void => {
      markNotificationsAsRead([item.id]);
      openNotificationLink(item.link_url);
    };

    return {
      notificationsState,
      isOpen,
      isDark,
      items,
      unreadCount,
      hasUnread,
      isUnread,
      getTypeColor,
      getTypeBgColor,
      getTypeLabel,
      formatTime,
      markAllAsRead,
      refresh,
      markSingleAsRead,
      openLink,
    };
  },
});
</script>

<style scoped>
.notifications-dialog-wrapper {
  margin: 20px;
}

.notifications-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-hover);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.notifications-header {
  background: rgba(0, 0, 0, 0.02);
  flex-shrink: 0;
}

.v-theme--dark .notifications-header {
  background: rgba(255, 255, 255, 0.02);
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 151, 215, 0.12);
  border: 1px solid rgba(0, 151, 215, 0.25);
  flex-shrink: 0;
}

.header-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--sidebar-text);
  letter-spacing: -0.2px;
  line-height: 1.25;
}

.header-subtitle {
  color: var(--sidebar-text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.unread-pill {
  background: rgba(0, 151, 215, 0.12);
  color: var(--accent-blue);
  border: 1px solid rgba(0, 151, 215, 0.28);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.notifications-body {
  overflow-y: auto;
  flex: 1;
  background: var(--main-bg);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card Principal no estilo do design system de Louvor JA */
.notification-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px 20px 16px 20px;
  box-shadow: var(--shadow);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notification-card:hover {
  border-color: rgba(0, 151, 215, 0.35);
  box-shadow: var(--shadow-hover);
}

.notification-card.is-unread {
  border-color: rgba(0, 151, 215, 0.45);
  box-shadow: 0 4px 16px rgba(0, 151, 215, 0.12);
}

/* Barra vertical colorida à esquerda */
.card-edge {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
  width: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.card-content {
  padding-left: 8px;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-tag {
  font-size: 10px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  line-height: 1.4;
}

.new-pill {
  font-size: 9px;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(0, 151, 215, 0.15);
  color: var(--accent-blue);
  border: 1px solid rgba(0, 151, 215, 0.35);
  line-height: 1.4;
}

.mark-single-read-btn {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid var(--border-color);
  color: var(--sidebar-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-single-read-btn:hover {
  background: rgba(0, 151, 215, 0.12);
  border-color: rgba(0, 151, 215, 0.35);
  color: var(--accent-blue);
}

.card-time {
  font-size: 11px;
  color: var(--sidebar-text-secondary);
  font-weight: 500;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--sidebar-text);
  line-height: 1.35;
  letter-spacing: -0.2px;
}

.card-message {
  font-size: 13px;
  line-height: 1.55;
  color: var(--sidebar-text-secondary);
  white-space: pre-line;
}

/* Botão de ação externa (ex: Ver Novidades ->) */
.action-btn {
  background: rgba(0, 151, 215, 0.1);
  border: 1px solid rgba(0, 151, 215, 0.25);
  color: var(--accent-blue);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:hover {
  background: rgba(0, 151, 215, 0.2);
  border-color: rgba(0, 151, 215, 0.45);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 151, 215, 0.18);
}

.empty-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid var(--border-color);
}
</style>
