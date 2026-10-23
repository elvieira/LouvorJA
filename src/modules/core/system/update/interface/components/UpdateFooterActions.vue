<template>
  <div class="update-footer-actions px-6 py-4 mt-auto">
    <!-- Barra de Progresso quando ativo -->
    <div v-if="isProgressActive" class="mb-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">
          {{ progressStatusText }}
        </span>
        <span v-if="progressPercent > 0" class="text-caption font-weight-bold" style="color: #009fe3;">
          {{ Math.round(progressPercent) }}%
        </span>
      </div>
      <v-progress-linear
        :model-value="progressPercent"
        :indeterminate="progressPercent === 0"
        color="#009fe3"
        bg-color="rgba(255, 255, 255, 0.08)"
        height="6"
        rounded
      />
    </div>

    <!-- Linha de Botões -->
    <div class="d-flex align-center justify-end" style="gap: 12px;">
      <!-- Botão Secundário: "Agora não" -->
      <v-btn
        v-if="viewMode !== 'up-to-date'"
        variant="tonal"
        rounded="lg"
        class="btn-secondary-action text-none font-weight-medium px-5"
        height="42"
        :disabled="isUpdatingNow"
        @click="$emit('dismiss')"
      >
        {{ $t('modules.update.not_now') }}
      </v-btn>

      <!-- Botão Único para Cenário D: "Fechar" -->
      <v-btn
        v-if="viewMode === 'up-to-date'"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none font-weight-bold px-6"
        height="42"
        @click="$emit('close')"
      >
        {{ $t('modules.update.close') }}
      </v-btn>

      <!-- Cenário A: Aplicativo -->
      <template v-else-if="viewMode === 'app-only'">
        <!-- Disponível -->
        <v-btn
          v-if="appStatus === 'available'"
          color="primary"
          variant="flat"
          rounded="lg"
          class="btn-primary-action text-none px-6 font-weight-bold"
          height="42"
          prepend-icon="mdi-download"
          @click="$emit('update-app')"
        >
          {{ $t('modules.update.update_now') }}
        </v-btn>

        <!-- Baixando -->
        <v-btn
          v-else-if="appStatus === 'downloading'"
          color="primary"
          variant="tonal"
          rounded="lg"
          class="text-none px-6 font-weight-bold"
          height="42"
          disabled
          prepend-icon="mdi-loading mdi-spin"
        >
          {{ $t('modules.update.downloading_button') }}
        </v-btn>

        <!-- Pronto para instalar -->
        <v-btn
          v-else-if="appStatus === 'ready'"
          color="success"
          variant="flat"
          rounded="lg"
          class="text-none px-6 font-weight-bold"
          height="42"
          prepend-icon="mdi-restart"
          @click="$emit('install-app')"
        >
          {{ $t('modules.update.ready_to_install') }}
        </v-btn>

        <!-- Erro -->
        <v-btn
          v-else-if="appStatus === 'error'"
          color="error"
          variant="flat"
          rounded="lg"
          class="text-none px-6 font-weight-bold"
          height="42"
          prepend-icon="mdi-refresh"
          @click="$emit('retry')"
        >
          {{ $t('modules.update.try_again') }}
        </v-btn>
      </template>

      <!-- Cenário B: Banco de Dados -->
      <template v-else-if="viewMode === 'database-only'">
        <v-btn
          v-if="!isDbUpdating"
          color="primary"
          variant="flat"
          rounded="lg"
          class="btn-primary-action text-none px-6 font-weight-bold"
          height="42"
          prepend-icon="mdi-download"
          @click="$emit('update-db')"
        >
          {{ $t('modules.update.update_db') }}
        </v-btn>

        <v-btn
          v-else
          color="primary"
          variant="tonal"
          rounded="lg"
          class="text-none px-6 font-weight-bold"
          height="42"
          disabled
          prepend-icon="mdi-loading mdi-spin"
        >
          {{ $t('modules.update.downloading_button') }}
        </v-btn>
      </template>

      <!-- Cenário C: Combinado -->
      <template v-else-if="viewMode === 'combined'">
        <!-- Se app pronto para instalar após update tudo -->
        <v-btn
          v-if="appStatus === 'ready' && !isDbUpdating"
          color="success"
          variant="flat"
          rounded="lg"
          class="text-none px-6 font-weight-bold"
          height="42"
          prepend-icon="mdi-restart"
          @click="$emit('install-app')"
        >
          {{ $t('modules.update.ready_to_install') }}
        </v-btn>

        <!-- Botão Atualizar Tudo -->
        <v-btn
          v-else
          color="primary"
          variant="flat"
          rounded="lg"
          class="btn-primary-action text-none px-6 font-weight-bold"
          height="42"
          prepend-icon="mdi-download"
          :loading="isUpdatingNow"
          @click="$emit('update-all')"
        >
          {{ $t('modules.update.update_all') }}
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "UpdateFooterActions",
  props: {
    viewMode: {
      type: String as PropType<"app-only" | "database-only" | "combined" | "up-to-date" | "checking">,
      required: true,
    },
    appStatus: {
      type: String,
      default: "idle",
    },
    appDownloadPercent: {
      type: Number,
      default: 0,
    },
    isDbUpdating: {
      type: Boolean,
      default: false,
    },
    dbProgress: {
      type: Number,
      default: 0,
    },
    dbStatusText: {
      type: String,
      default: "",
    },
    isCombinedUpdating: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["dismiss", "close", "update-app", "update-db", "update-all", "install-app", "retry"],
  computed: {
    isProgressActive(): boolean {
      return (
        this.appStatus === "downloading" ||
        this.isDbUpdating ||
        this.isCombinedUpdating
      );
    },
    isUpdatingNow(): boolean {
      return (
        this.appStatus === "downloading" ||
        this.isDbUpdating ||
        this.isCombinedUpdating
      );
    },
    progressPercent(): number {
      if (this.appStatus === "downloading") {
        return this.appDownloadPercent;
      }
      if (this.isDbUpdating) {
        return this.dbProgress;
      }
      return 0;
    },
    progressStatusText(): string {
      if (this.appStatus === "downloading") {
        return this.$t("modules.update.downloading_app");
      }
      if (this.isDbUpdating) {
        return this.dbStatusText || this.$t("modules.update.downloading_db");
      }
      return "";
    },
  },
});
</script>

<style scoped>
.update-footer-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.15);
}

.btn-secondary-action {
  background: rgba(255, 255, 255, 0.05);
  color: var(--sidebar-text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.btn-secondary-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--sidebar-text);
}

.btn-primary-action {
  background: #009fe3 !important;
  box-shadow: 0 4px 14px rgba(0, 159, 227, 0.4);
}

/* Modo Claro */
:deep(.v-theme--light) .update-footer-actions,
.v-theme--light .update-footer-actions {
  border-top: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}

:deep(.v-theme--light) .btn-secondary-action,
.v-theme--light .btn-secondary-action {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}

:deep(.v-theme--light) .btn-secondary-action:hover,
.v-theme--light .btn-secondary-action:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
}
</style>
