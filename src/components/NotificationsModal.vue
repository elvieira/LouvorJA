<template>
  <v-dialog
    v-model="isOpen"
    max-width="680"
    :theme="isDark ? 'dark' : 'light'"
    content-class="notifications-dialog-wrapper"
    transition="fade-transition"
    @keydown.esc="isOpen = false"
  >
    <v-card
      class="notifications-modal-card overflow-hidden"
      width="100%"
    >
      <v-card-text class="pa-0 d-flex flex-column" style="height: 100%; min-height: 0; overflow: hidden;">
        <!-- Cabeçalho Fixo -->
        <div class="notifications-modal-header">
          <div class="d-flex align-center">
            <v-icon size="26" class="bell-icon mr-3">
              {{ hasUnread ? 'mdi-bell-ring-outline' : 'mdi-bell-outline' }}
            </v-icon>
            <h2 class="notifications-title">
              Notificações
            </h2>
          </div>

          <div class="header-actions d-flex align-center">
            <v-btn
              icon="mdi-refresh"
              variant="text"
              size="small"
              class="header-btn mr-1"
              :loading="notificationsState.loading"
              title="Atualizar"
              @click="refresh"
            />

            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              class="header-btn"
              title="Fechar"
              @click="isOpen = false"
            />
          </div>
        </div>

        <!-- Conteúdo / Lista de Notificações -->
        <div class="notifications-scroll-area flex-grow-1">
          <!-- Estado Carregando -->
          <div v-if="notificationsState.loading && sortedItems.length === 0" class="notifications-loading-state">
            <v-progress-circular
              indeterminate
              color="var(--ds-accent)"
              size="40"
              width="3"
              class="mb-3"
            />
            <p class="loading-text text-body-2 font-weight-medium">
              Carregando notificações...
            </p>
          </div>

          <!-- Estado Vazio -->
          <div v-else-if="sortedItems.length === 0" class="notifications-empty-state">
            <div class="empty-icon-circle mb-4">
              <v-icon size="36">
                mdi-bell-sleep-outline
              </v-icon>
            </div>
            <h3 class="empty-title mb-1">
              Tudo em dia!
            </h3>
            <p class="empty-subtitle">
              Nenhuma notificação no momento. Quando houver novidades ou avisos, eles aparecerão aqui.
            </p>
          </div>

          <!-- Lista de Notificações Estilizada -->
          <div v-else class="notifications-list">
            <div 
              v-for="item in sortedItems"
              :key="item.id"
              class="notification-card"
              :class="[
                `type-${item.type}`,
                `priority-${item.priority || 'normal'}`,
                { 'is-unread': isUnread(item.id) }
              ]"
            >
              <div class="card-inner-layout">
                <!-- Caixa do Ícone Contextual -->
                <div 
                  class="icon-box"
                  :class="`icon-box-${item.type}`"
                >
                  <v-icon size="24" :icon="getTypeIcon(item.type)" />
                </div>

                <!-- Conteúdo Principal do Card -->
                <div class="card-body">
                  <!-- Linha do Título e Horário -->
                  <div class="card-header-row">
                    <h3 class="card-title">
                      {{ item.title }}
                    </h3>
                    <span class="card-time">
                      {{ formatTime(item.created_at) }}
                    </span>
                  </div>

                  <!-- Mensagem -->
                  <p class="card-message">
                    {{ item.message }}
                  </p>

                  <!-- Rodapé: Tags na esquerda e Ações/Status na direita -->
                  <div class="card-footer">
                    <!-- Tags (Prioridade e Tipo) -->
                    <div class="card-tags">
                      <!-- Chip de Prioridade Urgente -->
                      <span
                        v-if="item.priority === 'urgent'"
                        class="badge-pill badge-urgent"
                      >
                        <v-icon size="13" class="badge-icon">mdi-alert-circle</v-icon>
                        URGENTE
                      </span>

                      <!-- Chip de Prioridade Alta -->
                      <span
                        v-else-if="item.priority === 'high'"
                        class="badge-pill badge-high"
                      >
                        <v-icon size="13" class="badge-icon">mdi-equal</v-icon>
                        ALTA
                      </span>

                      <!-- Chip do Tipo/Categoria -->
                      <span
                        class="badge-pill"
                        :class="`badge-category-${item.type}`"
                      >
                        {{ getTypeLabel(item.type) }}
                      </span>
                    </div>

                    <!-- Ações e Status -->
                    <div class="card-actions">
                      <!-- Botão de Ação do Módulo / Programa -->
                      <button
                        v-if="hasModuleAction(item)"
                        type="button"
                        class="action-btn"
                        @click="openModuleAction(item)"
                      >
                        <v-icon size="15" class="mr-1">
                          {{ getModuleActionIcon(item.action_module || item.link_url) }}
                        </v-icon>
                        <span>{{ getModuleActionLabel(item) }}</span>
                      </button>

                      <!-- Botão de Link Externo (Web) -->
                      <button
                        v-if="hasExternalLink(item)"
                        type="button"
                        class="action-btn"
                        @click="openLink(item)"
                      >
                        <span>{{ item.link_label || 'Ver Novidades' }}</span>
                        <v-icon size="14" class="ml-1">
                          mdi-open-in-new
                        </v-icon>
                      </button>

                      <!-- Botão Marcar como Lida (Interativo se não lida) -->
                      <button
                        v-if="isUnread(item.id)"
                        type="button"
                        class="mark-read-btn"
                        @click="markSingleAsRead(item)"
                      >
                        <v-icon size="14" class="mr-1">
                          mdi-check
                        </v-icon>
                        <span>Marcar lida</span>
                      </button>

                      <!-- Status Lida (Se já foi lida) -->
                      <div v-else class="status-read">
                        <v-icon size="16" class="mr-1">
                          mdi-check-circle
                        </v-icon>
                        <span>Lida</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import $modules from "@/helpers/core/Modules";
import $appdata from "@/helpers/config/AppData";
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
    const store = useStore();

    const isOpen = computed({
      get: () => notificationsState.isOpen,
      set: (val: boolean) => {
        notificationsState.isOpen = val;
      },
    });

    // Fecha o modal se o módulo ativo mudar
    watch(
      () => store?.state?.active_module,
      () => {
        if (notificationsState.isOpen) {
          notificationsState.isOpen = false;
        }
      },
    );

    const sortedItems = computed(() => {
      const priorityWeight: Record<string, number> = {
        urgent: 3,
        high: 2,
        normal: 1,
      };

      return [...notificationsState.items].sort((a, b) => {
        const aUnread = isUnread(a.id) ? 1 : 0;
        const bUnread = isUnread(b.id) ? 1 : 0;

        // Não lidas sempre antes de lidas
        if (aUnread !== bUnread) {
          return bUnread - aUnread;
        }

        // Maior prioridade primeiro (urgent > high > normal)
        const aWeight = priorityWeight[a.priority || "normal"] || 1;
        const bWeight = priorityWeight[b.priority || "normal"] || 1;
        if (aWeight !== bWeight) {
          return bWeight - aWeight;
        }

        // Desempate pela data de criação (mais recente primeiro)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    const isUnread = (id: number): boolean => {
      return !notificationsState.readIds.includes(id);
    };

    const TYPE_VUETIFY_COLORS: Record<NotificationType, string> = {
      feature: "purple",
      update: "primary",
      alert: "warning",
      info: "teal",
    };

    const TYPE_ICONS: Record<NotificationType, string> = {
      feature: "mdi-sparkles",
      update: "mdi-cloud-download-outline",
      alert: "mdi-alert-circle-outline",
      info: "mdi-bullhorn-outline",
    };

    const TYPE_LABELS: Record<NotificationType, string> = {
      feature: "Novidade",
      update: "Atualização",
      alert: "Aviso",
      info: "Informativo",
    };

    const getTypeVuetifyColor = (type: NotificationType): string => {
      return TYPE_VUETIFY_COLORS[type] || "primary";
    };

    const getTypeIcon = (type: NotificationType): string => {
      return TYPE_ICONS[type] || "mdi-bell-outline";
    };

    const getTypeLabel = (type: NotificationType): string => {
      return TYPE_LABELS[type] || "Aviso";
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

    const hasModuleAction = (item: AppNotification): boolean => {
      if (item.action_module && item.action_module.trim() !== "") return true;
      if (item.link_url) {
        const url = item.link_url.trim().toLowerCase();
        return url.startsWith("module:") || url.startsWith("app://");
      }
      return false;
    };

    const hasExternalLink = (item: AppNotification): boolean => {
      if (!item.link_url) return false;
      const url = item.link_url.trim().toLowerCase();
      return !url.startsWith("module:") && !url.startsWith("app://");
    };

    const MODULE_ICONS: Record<string, string> = {
      bible: "mdi-book-cross",
      hymnal: "mdi-music-clef-treble",
      hymnal_1996: "mdi-music-box-multiple",
      liturgy: "mdi-hands-pray",
      sync: "mdi-cloud-sync",
      update: "mdi-cloud-download",
      config: "mdi-cog",
      help: "mdi-help-circle",
      timer: "mdi-timer-outline",
      clock: "mdi-clock-outline",
      collections: "mdi-folder-music",
      custom_collection: "mdi-folder-star",
      music_editor: "mdi-pencil-box-multiple",
    };

    const getModuleActionIcon = (rawTarget?: string | null): string => {
      if (!rawTarget) return "mdi-open-in-app";
      let clean = rawTarget.trim().toLowerCase();
      if (clean.startsWith("app://module/")) clean = clean.replace("app://module/", "");
      else if (clean.startsWith("app://")) clean = clean.replace("app://", "");
      else if (clean.startsWith("module:")) clean = clean.replace("module:", "");
      const baseModule = clean.split(/[:.]/)[0];
      return MODULE_ICONS[baseModule] || "mdi-open-in-app";
    };

    const getModuleActionLabel = (item: AppNotification): string => {
      if (item.action_label && item.action_label.trim() !== "") {
        return item.action_label;
      }
      const rawTarget = item.action_module || item.link_url || "";
      let clean = rawTarget.trim().toLowerCase();
      if (clean.startsWith("app://module/")) clean = clean.replace("app://module/", "");
      else if (clean.startsWith("app://")) clean = clean.replace("app://", "");
      else if (clean.startsWith("module:")) clean = clean.replace("module:", "");

      if (clean.includes("db_update")) return "Atualizar Banco";
      if (clean.startsWith("sync")) return "Abrir Atualizações";
      if (clean.startsWith("bible")) return "Abrir Bíblia";
      if (clean.startsWith("hymnal_1996")) return "Abrir Hinário 1996";
      if (clean.startsWith("hymnal")) return "Abrir Hinário";
      if (clean.startsWith("liturgy")) return "Abrir Liturgia";
      if (clean.startsWith("help")) return "Ajuda e Suporte";
      if (clean.startsWith("config")) return "Configurações";
      return "Abrir no Programa";
    };

    const openModuleAction = (item: AppNotification): void => {
      markNotificationsAsRead([item.id]);

      const rawTarget = item.action_module || item.link_url || "";
      if (!rawTarget) return;

      let clean = rawTarget.trim();
      if (clean.startsWith("app://module/")) clean = clean.replace("app://module/", "");
      else if (clean.startsWith("app://")) clean = clean.replace("app://", "");
      else if (clean.startsWith("module:")) clean = clean.replace("module:", "");

      let moduleId = clean;
      let subView: string | null = null;
      if (clean.includes(".") || clean.includes(":")) {
        const parts = clean.split(/[:.]/);
        moduleId = parts[0];
        subView = parts[1];
      }

      let paramsObj: Record<string, any> | null = null;
      if (typeof item.action_params === "string") {
        try {
          paramsObj = JSON.parse(item.action_params);
        } catch {
          paramsObj = null;
        }
      } else if (typeof item.action_params === "object" && item.action_params !== null) {
        paramsObj = item.action_params as Record<string, any>;
      }

      if (moduleId === "sync") {
        const view = paramsObj?.view || subView || "library";
        $appdata.set("modules.sync.view", view);
      } else if (moduleId === "help") {
        const view = paramsObj?.view || subView;
        if (view) {
          $appdata.set("modules.help.currentView", view);
        }
      }

      notificationsState.isOpen = false;
      $modules.open(moduleId);
    };

    const markSingleAsRead = (item: AppNotification): void => {
      markNotificationsAsRead([item.id]);
    };

    const openLink = (item: AppNotification): void => {
      markNotificationsAsRead([item.id]);

      if (hasModuleAction(item) && !hasExternalLink(item)) {
        openModuleAction(item);
        return;
      }

      openNotificationLink(item.link_url);
    };

    return {
      notificationsState,
      items: sortedItems,
      isOpen,
      isDark,
      sortedItems,
      unreadCount,
      hasUnread,
      isUnread,
      getTypeVuetifyColor,
      getTypeIcon,
      getTypeLabel,
      formatTime,
      markAllAsRead,
      refresh,
      markSingleAsRead,
      openLink,
      hasModuleAction,
      hasExternalLink,
      getModuleActionIcon,
      getModuleActionLabel,
      openModuleAction,
    };
  },
});
</script>

<style lang="scss" scoped>
.notifications-modal-card {
  background: var(--ds-surface, #2B3043) !important;
  border: 1px solid var(--ds-border, #43495B) !important;
  border-radius: 22px !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.notifications-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 16px 28px;
  flex-shrink: 0;

  .bell-icon {
    color: var(--ds-accent, #009FE3);
  }

  .notifications-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--ds-text-primary, #F7F8FC);
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.3px;
  }

  .header-actions {
    gap: 4px;

    .header-btn {
      color: var(--ds-text-secondary, #A0A6B5);
      border-radius: 10px;
      transition: all 0.2s ease;

      &:hover {
        color: var(--ds-text-primary, #F7F8FC);
        background: var(--ds-surface-elevated, rgba(255, 255, 255, 0.08));
      }
    }
  }
}

.notifications-scroll-area {
  padding: 8px 24px 24px 24px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--accent-blue, #009be2);
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent-yellow, #f5a400);
  }
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-card {
  position: relative;
  background: var(--ds-surface-elevated, #30364B);
  border: 1px solid var(--ds-border, #454C62);
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.15);
  }

  // Indicador lateral de prioridade (4px)
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4.5px;
    background: transparent;
    border-radius: 16px 0 0 16px;
    transition: background 0.2s ease;
  }

  &.priority-urgent::before {
    background: #FF5265;
  }

  &.priority-high::before {
    background: #F5A400;
  }

  &.priority-normal::before {
    background: #10B981;
  }

  &:not(.priority-urgent):not(.priority-high):not(.priority-normal) {
    &.type-alert::before {
      background: #F5A400;
    }
    &.type-feature::before {
      background: #A855F7;
    }
    &.type-update::before {
      background: #009FE3;
    }
    &.type-info::before {
      background: #10B981;
    }
  }

  &.is-unread {
    border-color: rgba(0, 159, 227, 0.35);
    box-shadow: 0 4px 16px rgba(0, 159, 227, 0.08);
  }
}

.card-inner-layout {
  display: flex;
  padding: 18px 20px;
  gap: 16px;
  align-items: flex-start;
}

.icon-box {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &.icon-box-alert {
    background: rgba(245, 158, 11, 0.14);
    color: #F59E0B;
  }

  &.icon-box-feature {
    background: rgba(168, 85, 247, 0.14);
    color: #A855F7;
  }

  &.icon-box-update {
    background: rgba(0, 159, 227, 0.14);
    color: #009FE3;
  }

  &.icon-box-info {
    background: rgba(20, 184, 166, 0.14);
    color: #14B8A6;
  }
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ds-text-primary, #F7F8FC);
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.2px;
}

.card-time {
  font-size: 12px;
  font-weight: 500;
  color: var(--ds-text-secondary, #A0A6B5);
  white-space: nowrap;
  flex-shrink: 0;
}

.card-message {
  margin: 6px 0 14px 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--ds-text-secondary, #A0A6B5);
  white-space: pre-line;
  word-break: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  .card-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;

    .badge-pill {
      height: 24px;
      padding: 0 10px;
      border-radius: 9999px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      line-height: 1;
      user-select: none;

      .badge-icon {
        line-height: 1;
      }

      &.badge-urgent {
        background: #E03E52;
        color: #FFFFFF;
      }

      &.badge-high {
        background: #543916;
        color: #F5A400;
      }

      &.badge-category-alert {
        background: #4A3319;
        color: #F59E0B;
      }

      &.badge-category-feature {
        background: #381F4B;
        color: #C084FC;
      }

      &.badge-category-update {
        background: #17344D;
        color: #38BDF8;
      }

      &.badge-category-info {
        background: #134440;
        color: #2DD4BF;
      }
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;

    .action-btn {
      height: 30px;
      padding: 0 12px;
      border-radius: 8px;
      background: var(--ds-accent, #009FE3);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      outline: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0, 159, 227, 0.25);

      &:hover {
        background: #008FD0;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 159, 227, 0.35);
      }
    }

    .mark-read-btn {
      height: 30px;
      padding: 0 10px;
      border-radius: 8px;
      background: rgba(0, 159, 227, 0.1);
      border: 1px solid rgba(0, 159, 227, 0.25);
      color: var(--ds-accent, #009FE3);
      font-size: 11.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 159, 227, 0.2);
        border-color: rgba(0, 159, 227, 0.4);
        transform: translateY(-1px);
      }
    }

    .status-read {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #40C56C;
      user-select: none;

      .v-icon {
        color: #40C56C !important;
      }
    }
  }
}

.notifications-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;

  .loading-text {
    color: var(--ds-text-secondary, #A0A6B5);
    margin: 0;
  }
}

.notifications-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  text-align: center;

  .empty-icon-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba(0, 159, 227, 0.1);
    color: var(--ds-accent, #009FE3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--ds-text-primary, #F7F8FC);
    margin: 0;
  }

  .empty-subtitle {
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--ds-text-secondary, #A0A6B5);
    max-width: 360px;
    margin: 8px auto 0 auto;
  }
}

// Adaptação para Tema Claro
.v-theme--light {
  &.notifications-modal-card,
  .notifications-modal-card {
    background: var(--ds-surface, #FFFFFF) !important;
    border-color: var(--ds-border, #E1E5EA) !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1) !important;
  }

  .notification-card {
    background: #FFFFFF !important;
    border-color: var(--ds-border, #E1E5EA) !important;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
      border-color: rgba(0, 0, 0, 0.15) !important;
    }

    &.is-unread {
      background: #F8FAFD !important;
      border-color: rgba(0, 159, 227, 0.4) !important;
    }
  }

  .badge-pill {
    &.badge-high {
      background: #FEF3C7 !important;
      color: #B45309 !important;
    }
    &.badge-category-alert {
      background: #FFEDD5 !important;
      color: #C2410C !important;
    }
    &.badge-category-feature {
      background: #F3E8FF !important;
      color: #7E22CE !important;
    }
    &.badge-category-update {
      background: #E0F2FE !important;
      color: #0369A1 !important;
    }
    &.badge-category-info {
      background: #CCFBF1 !important;
      color: #0F766E !important;
    }
  }
}
</style>
