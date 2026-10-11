<template>
  <v-dialog
    v-model="isOpen"
    max-width="620"
    :theme="isDark ? 'dark' : 'light'"
    content-class="modern-alert-dialog-wrapper"
    transition="fade-transition"
    @keydown.esc="isOpen = false"
  >
    <v-card
      class="rounded-xl overflow-hidden elevation-24"
      width="100%"
      style="background: var(--card-bg); max-height: 85vh; display: flex; flex-direction: column;"
    >
      <v-card-text class="pa-0 d-flex flex-column" style="height: 100%; min-height: 0; overflow: hidden;">
        <!-- Cabeçalho (Padrão Módulo Sync, sem subtítulo) -->
        <div class="pa-5 px-6 flex-shrink-0" style="background: rgba(0, 0, 0, 0.02);">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="primary" size="30" class="mr-3">
                {{ hasUnread ? 'mdi-bell' : 'mdi-bell-outline' }}
              </v-icon>
              <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                Notificações
              </h2>
              <span
                v-if="unreadCount > 0"
                class="ml-3 px-2 py-0.5 text-caption font-weight-bold rounded-pill"
                style="background: rgba(var(--v-theme-primary), 0.15); color: var(--accent-blue);"
              >
                {{ unreadCount }} {{ unreadCount === 1 ? 'nova' : 'novas' }}
              </span>
            </div>

            <div class="d-flex align-center" style="gap: 8px;">
              <v-btn 
                v-if="hasUnread"
                color="primary" 
                variant="flat" 
                height="34"
                class="text-none font-weight-bold rounded-lg px-4"
                @click="markAllAsRead"
              >
                <v-icon start size="18">
                  mdi-check-all
                </v-icon>
                Marcar lidas
              </v-btn>

              <v-btn
                icon
                variant="text"
                size="small"
                :loading="notificationsState.loading"
                title="Atualizar"
                @click="refresh"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>

              <v-btn
                icon
                variant="text"
                size="small"
                title="Fechar"
                @click="isOpen = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <v-divider style="opacity: 0.1;" class="mx-6" />

        <!-- Conteúdo / Lista de Notificações -->
        <div class="pa-6 pt-3 flex-grow-1" style="overflow-y: auto;">
          <!-- Estado Carregando -->
          <div v-if="notificationsState.loading && sortedItems.length === 0" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="36"
              class="mb-3"
            />
            <p class="text-caption" style="color: var(--sidebar-text-secondary);">
              Carregando notificações...
            </p>
          </div>

          <!-- Estado Vazio (Estilo "Tudo em dia" do Módulo Sync) -->
          <div v-else-if="sortedItems.length === 0" style="padding: 48px 24px; text-align: center;">
            <v-icon color="primary" size="64" class="mb-4">
              mdi-bell-sleep-outline
            </v-icon>
            <div class="text-h6 font-weight-bold mb-1" style="color: var(--sidebar-text);">
              Tudo em dia!
            </div>
            <div class="text-body-2" style="color: var(--sidebar-text-secondary); max-width: 340px; margin: 0 auto;">
              Nenhuma notificação no momento. Quando houver novidades ou avisos, eles aparecerão aqui.
            </div>
          </div>

          <!-- Lista de Notificações Estilizada -->
          <div v-else>
            <v-list class="bg-transparent pa-0" lines="two">
              <v-list-item 
                v-for="item in sortedItems"
                :key="item.id"
                class="notification-item mb-3 rounded-xl pa-3 pa-sm-4"
                :class="[
                  `type-${item.type}`,
                  `priority-${item.priority || 'normal'}`,
                  { 'is-unread': isUnread(item.id) }
                ]"
              >
                <!-- Avatar do Tipo com Ícone Temático -->
                <template #prepend>
                  <v-avatar
                    rounded="lg"
                    size="44"
                    :color="getTypeVuetifyColor(item.type)"
                    variant="tonal"
                    class="mr-3 flex-shrink-0"
                  >
                    <v-icon size="24">
                      {{ getTypeIcon(item.type) }}
                    </v-icon>
                  </v-avatar>
                </template>

                <!-- Linha do Título e Data -->
                <div class="d-flex align-start justify-space-between gap-2 mb-1.5">
                  <span class="font-weight-bold text-body-2" style="color: var(--sidebar-text); font-size: 0.95rem !important; line-height: 1.35;">
                    {{ item.title }}
                  </span>
                  <span class="text-caption flex-shrink-0" style="color: var(--sidebar-text-secondary); font-size: 11px; white-space: nowrap;">
                    {{ formatTime(item.created_at) }}
                  </span>
                </div>

                <!-- Mensagem -->
                <div class="text-caption" style="color: var(--sidebar-text-secondary); white-space: pre-line; line-height: 1.55;">
                  {{ item.message }}
                </div>

                <!-- Rodapé: Tags na esquerda e Ações/Status na direita -->
                <div class="d-flex align-center justify-space-between flex-wrap mt-3 pt-2" style="gap: 8px; border-top: 1px dashed rgba(128, 128, 128, 0.18);">
                  <!-- Tags (Prioridade e Tipo) -->
                  <div class="d-flex align-center flex-wrap" style="gap: 6px;">
                    <!-- Chip de Prioridade Urgente -->
                    <v-chip
                      v-if="item.priority === 'urgent'"
                      size="x-small"
                      color="error"
                      variant="flat"
                      class="font-weight-bold text-uppercase"
                      style="height: 20px; font-size: 10px; letter-spacing: 0.5px;"
                    >
                      <v-icon start size="12">
                        mdi-alert-octagon
                      </v-icon>
                      URGENTE
                    </v-chip>

                    <!-- Chip de Prioridade Alta -->
                    <v-chip
                      v-else-if="item.priority === 'high'"
                      size="x-small"
                      color="warning"
                      variant="tonal"
                      class="font-weight-bold text-uppercase"
                      style="height: 20px; font-size: 10px; letter-spacing: 0.4px;"
                    >
                      <v-icon start size="12">
                        mdi-priority-high
                      </v-icon>
                      ALTA
                    </v-chip>

                    <!-- Chip do Tipo -->
                    <v-chip
                      size="x-small"
                      :color="getTypeVuetifyColor(item.type)"
                      variant="tonal"
                      class="font-weight-bold text-uppercase"
                      style="height: 20px; font-size: 10px; letter-spacing: 0.4px;"
                    >
                      {{ getTypeLabel(item.type) }}
                    </v-chip>

                    <!-- Indicador de Não Lida -->
                    <span
                      v-if="isUnread(item.id)"
                      class="text-caption font-weight-bold"
                      style="color: var(--accent-blue); font-size: 10px; letter-spacing: 0.3px;"
                    >
                      • NÃO LIDA
                    </span>
                  </div>

                  <!-- Ações e Status -->
                  <div class="d-flex align-center flex-wrap ml-auto" style="gap: 8px;">
                    <!-- Botão de Ação do Módulo / Programa -->
                    <v-btn
                      v-if="hasModuleAction(item)"
                      color="primary"
                      variant="flat"
                      size="small"
                      class="text-none font-weight-bold rounded-lg px-3"
                      height="28"
                      @click="openModuleAction(item)"
                    >
                      <v-icon start size="15">
                        {{ getModuleActionIcon(item.action_module || item.link_url) }}
                      </v-icon>
                      <span>{{ getModuleActionLabel(item) }}</span>
                    </v-btn>

                    <!-- Botão de Link Externo (Web) -->
                    <v-btn
                      v-if="hasExternalLink(item)"
                      :color="hasModuleAction(item) ? 'secondary' : getTypeVuetifyColor(item.type)"
                      :variant="hasModuleAction(item) ? 'tonal' : 'flat'"
                      size="small"
                      class="text-none font-weight-bold rounded-lg px-3"
                      height="28"
                      @click="openLink(item)"
                    >
                      <span>{{ item.link_label || 'Acessar Link' }}</span>
                      <v-icon end size="14">
                        mdi-open-in-new
                      </v-icon>
                    </v-btn>

                    <!-- Botão Marcar como Lida -->
                    <v-btn
                      v-if="isUnread(item.id)"
                      color="primary"
                      variant="tonal"
                      size="small"
                      class="text-none font-weight-bold rounded-lg px-3"
                      height="28"
                      @click="markSingleAsRead(item)"
                    >
                      <v-icon start size="14">
                        mdi-check
                      </v-icon>
                      Marcar lida
                    </v-btn>

                    <div v-else class="text-caption font-weight-medium d-flex align-center" style="color: var(--sidebar-text-secondary); opacity: 0.7; font-size: 11px;">
                      <v-icon start size="14" color="success">
                        mdi-check-circle
                      </v-icon>
                      Lida
                    </div>
                  </div>
                </div>
              </v-list-item>
            </v-list>
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
      feature: "mdi-creation",
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

<style scoped>
.notification-item {
  position: relative;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px var(--border-color);
  background: transparent;
}

.notification-item:hover {
  transform: translateY(-1px);
}

/* Tipos de notificação estilizados com borda lateral colorida e brilho suave */
.notification-item.type-feature {
  box-shadow: inset 4px 0 0 #a855f7, inset 0 0 0 1px var(--border-color);
}
.notification-item.type-feature.is-unread {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0%, transparent 55%);
  box-shadow: inset 4px 0 0 #a855f7, inset 0 0 0 1px rgba(168, 85, 247, 0.35), 0 4px 16px rgba(168, 85, 247, 0.12);
}
.notification-item.type-feature:hover {
  box-shadow: inset 4px 0 0 #a855f7, inset 0 0 0 1px rgba(168, 85, 247, 0.45), 0 4px 14px rgba(0, 0, 0, 0.08);
}

.notification-item.type-update {
  box-shadow: inset 4px 0 0 #0097d7, inset 0 0 0 1px var(--border-color);
}
.notification-item.type-update.is-unread {
  background: linear-gradient(90deg, rgba(0, 151, 215, 0.08) 0%, transparent 55%);
  box-shadow: inset 4px 0 0 #0097d7, inset 0 0 0 1px rgba(0, 151, 215, 0.35), 0 4px 16px rgba(0, 151, 215, 0.12);
}
.notification-item.type-update:hover {
  box-shadow: inset 4px 0 0 #0097d7, inset 0 0 0 1px rgba(0, 151, 215, 0.45), 0 4px 14px rgba(0, 0, 0, 0.08);
}

.notification-item.type-alert {
  box-shadow: inset 4px 0 0 #f59e0b, inset 0 0 0 1px var(--border-color);
}
.notification-item.type-alert.is-unread {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, transparent 55%);
  box-shadow: inset 4px 0 0 #f59e0b, inset 0 0 0 1px rgba(245, 158, 11, 0.35), 0 4px 16px rgba(245, 158, 11, 0.12);
}
.notification-item.type-alert:hover {
  box-shadow: inset 4px 0 0 #f59e0b, inset 0 0 0 1px rgba(245, 158, 11, 0.45), 0 4px 14px rgba(0, 0, 0, 0.08);
}

.notification-item.type-info {
  box-shadow: inset 4px 0 0 #10b981, inset 0 0 0 1px var(--border-color);
}
.notification-item.type-info.is-unread {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, transparent 55%);
  box-shadow: inset 4px 0 0 #10b981, inset 0 0 0 1px rgba(16, 185, 129, 0.35), 0 4px 16px rgba(16, 185, 129, 0.12);
}
.notification-item.type-info:hover {
  box-shadow: inset 4px 0 0 #10b981, inset 0 0 0 1px rgba(16, 185, 129, 0.45), 0 4px 14px rgba(0, 0, 0, 0.08);
}

/* Destaque especial de Prioridade Urgente */
.notification-item.priority-urgent {
  box-shadow: inset 4.5px 0 0 #ef4444, inset 0 0 0 1px rgba(239, 68, 68, 0.3) !important;
}
.notification-item.priority-urgent.is-unread {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, transparent 60%) !important;
  box-shadow: inset 4.5px 0 0 #ef4444, inset 0 0 0 1px rgba(239, 68, 68, 0.45), 0 4px 18px rgba(239, 68, 68, 0.16) !important;
}
.notification-item.priority-urgent:hover {
  box-shadow: inset 4.5px 0 0 #ef4444, inset 0 0 0 1px rgba(239, 68, 68, 0.6), 0 4px 18px rgba(239, 68, 68, 0.2) !important;
}

/* Destaque especial de Prioridade Alta */
.notification-item.priority-high:not(.priority-urgent) {
  box-shadow: inset 4px 0 0 #f59e0b, inset 0 0 0 1px rgba(245, 158, 11, 0.25) !important;
}
.notification-item.priority-high.is-unread:not(.priority-urgent) {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, transparent 60%) !important;
  box-shadow: inset 4px 0 0 #f59e0b, inset 0 0 0 1px rgba(245, 158, 11, 0.4), 0 4px 16px rgba(245, 158, 11, 0.14) !important;
}
</style>
