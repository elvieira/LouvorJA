<template>
  <div class="history-header pa-4 pb-2" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 style="font-size: 1.05rem; color: var(--sidebar-text); font-weight: 700;" class="d-flex align-center">
        {{ t('drawn') }}
        <v-chip
          size="x-small"
          color="success"
          variant="tonal"
          class="ml-2 font-weight-bold"
        >
          {{ drawnNames.length }}
        </v-chip>
      </h3>
    </div>
  </div>

  <!-- Lista de Sorteados -->
  <div class="history-items flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 80px;">
    <!-- Estado Vazio -->
    <div
      v-if="drawnNames.length === 0"
      class="d-flex flex-column align-center justify-center h-100 py-8 text-center px-4"
      style="opacity: 0.6;"
    >
      <v-icon size="40" class="mb-2" color="success">
        mdi-history
      </v-icon>
      <div class="text-subtitle-2 font-weight-bold mb-1" style="color: var(--sidebar-text);">
        {{ t('empty_history') }}
      </div>
      <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
        {{ t('empty_history_hint') }}
      </div>
    </div>

    <!-- Lista de Itens Sorteados -->
    <v-list v-else density="compact" class="bg-transparent pa-0">
      <v-list-item
        v-for="(name, index) in reversedDrawnNames"
        :key="index"
        class="rounded-lg mb-1"
        style="background: rgba(var(--v-theme-success), 0.08);"
      >
        <template #prepend>
          <v-avatar size="24" color="success" class="mr-3 text-caption font-weight-bold text-white">
            {{ drawnNames.length - index }}
          </v-avatar>
        </template>
        <v-list-item-title class="font-weight-bold" style="color: var(--sidebar-text);">
          {{ name }}
        </v-list-item-title>
        <template #append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="primary"
            class="rounded-lg"
            @click="removeDrawn(drawnNames.length - 1 - index)"
          >
            <v-icon size="16">
              mdi-undo
            </v-icon>
            <v-tooltip
              activator="parent"
              location="left"
              open-delay="200"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('return_to_list') }}
            </v-tooltip>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>

  <!-- Footer com Limpar Histórico -->
  <div class="history-footer pa-3" style="border-top: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <v-btn
      block
      variant="tonal"
      color="error"
      class="clear-btn text-none font-weight-bold rounded-lg"
      :disabled="drawnNames.length === 0"
      @click="showClearConfirm = true"
    >
      {{ t('clear_history') }}
    </v-btn>
  </div>

  <!-- Diálogo de Confirmação: Limpar Histórico -->
  <v-dialog v-model="showClearConfirm" max-width="440">
    <v-card class="rounded-xl pa-5" style="background: var(--card-bg, #ffffff);">
      <div class="d-flex align-center mb-3" style="gap: 12px;">
        <v-avatar color="error" variant="tonal" size="40">
          <v-icon color="error" size="22">
            mdi-alert-outline
          </v-icon>
        </v-avatar>
        <div>
          <h3 class="text-subtitle-1 font-weight-bold mb-0" style="color: var(--sidebar-text);">
            {{ t('confirm_clear_history_title') }}
          </h3>
        </div>
      </div>
      <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
        {{ t('confirm_clear_history_desc') }}
      </p>
      <div class="d-flex justify-end" style="gap: 10px;">
        <v-btn
          variant="tonal"
          class="rounded-lg text-none font-weight-bold"
          @click="showClearConfirm = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          variant="flat"
          color="error"
          class="rounded-lg text-none font-weight-bold"
          @click="confirmClearHistory"
        >
          {{ t('clear_history') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "HistoryList",
  props: {
    drawnNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ["update:drawnNames"],
  data: () => ({
    showClearConfirm: false,
  }),
  computed: {
    moduleId(): string {
      return manifest.id;
    },
    reversedDrawnNames(): string[] {
      return [...this.drawnNames].reverse();
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    removeDrawn(index: number) {
      const newArr = [...this.drawnNames];
      newArr.splice(index, 1);
      this.$emit("update:drawnNames", newArr);
    },
    confirmClearHistory() {
      this.$emit("update:drawnNames", []);
      this.showClearConfirm = false;
    },
  },
});
</script>

<style scoped>
@media (max-height: 800px) {
  .history-header {
    padding: 10px 12px 6px 12px !important;

    h3 {
      font-size: 0.95rem !important;
    }
  }

  .history-items {
    padding: 4px 6px !important;
  }

  .history-footer {
    padding: 6px 12px !important;

    .clear-btn {
      min-height: 32px !important;
      height: 32px !important;
      font-size: 0.85rem !important;
    }
  }
}
</style>
