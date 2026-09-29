<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('queue.intro')" />

    <!-- O que é e Acesso -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-playlist-play" class="mr-2" size="22" />
      {{ t('queue.panel_title') }}
    </h3>
    <p class="mb-4" v-html="t('queue.panel_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('queue.toggle_access')" />
      <li class="mb-2" v-html="t('queue.auto_collapse')" />
    </ul>

    <!-- Mockup: Botões no Player -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-eye-outline" size="16" class="mr-1 text-primary" />
          {{ t('queue.preview_player_title') }}
        </span>
      </div>

      <div class="d-flex flex-wrap gap-4 align-center justify-space-around py-3 px-4 rounded-lg preview-inner-bg">
        <!-- Estado 1: Fila Fechada -->
        <div class="d-flex flex-column align-center text-center pa-2">
          <span class="text-caption mb-2 opacity-70">{{ t('queue.preview_player_collapsed') }}</span>
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            class="text-none pointer-events-none"
            prepend-icon="mdi-playlist-play"
          >
            {{ t('queue.preview_player_btn_queue') }}
          </v-btn>
        </div>

        <v-divider vertical class="my-2 d-none d-sm-block" />

        <!-- Estado 2: Fila Aberta -->
        <div class="d-flex flex-column align-center text-center pa-2">
          <span class="text-caption mb-2 opacity-70">{{ t('queue.preview_player_expanded') }}</span>
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            class="text-none pointer-events-none"
            prepend-icon="mdi-content-save-outline"
          >
            {{ t('queue.preview_player_btn_save') }}
          </v-btn>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Adicionando Músicas à Fila -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-playlist-plus" class="mr-2" size="22" />
      {{ t('queue.add_title') }}
    </h3>
    <p class="mb-4" v-html="t('queue.add_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('queue.add_from_anywhere')" />
      <li class="mb-2" v-html="t('queue.modes_explanation')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Reorganização e Execução -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-drag-vertical" class="mr-2" size="22" />
      {{ t('queue.reorder_title') }}
    </h3>
    <p class="mb-4" v-html="t('queue.reorder_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('queue.drag_and_drop')" />
      <li class="mb-2" v-html="t('queue.playing_indicator')" />
      <li class="mb-2" v-html="t('queue.direct_jump')" />
    </ul>

    <!-- Mockup: Fila de Reprodução Completa -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-view-headline" size="16" class="mr-1 text-primary" />
          {{ t('queue.preview_queue_title') }}
        </span>
        <div class="d-flex align-center">
          <v-btn
            variant="tonal"
            color="primary"
            size="x-small"
            class="text-none mr-2 pointer-events-none"
            prepend-icon="mdi-chevron-down"
          >
            {{ t('queue.preview_btn_collapse') }}
          </v-btn>
          <v-btn
            variant="tonal"
            color="error"
            size="x-small"
            class="text-none pointer-events-none"
            prepend-icon="mdi-trash-can-outline"
          >
            {{ t('queue.preview_btn_clear') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-queue-container rounded-lg pa-3">
        <!-- Item 1: Tocando agora (CT) -->
        <div class="mock-queue-item rounded-lg d-flex align-center pa-2 mb-2 playing">
          <v-icon size="18" class="mr-2 opacity-60">
            mdi-drag-vertical
          </v-icon>
          <div class="mock-cover rounded overflow-hidden mr-3 position-relative d-flex align-center justify-center">
            <v-icon size="20" class="opacity-40">
              mdi-music
            </v-icon>
            <div class="mock-playing-overlay position-absolute w-100 h-100 d-flex align-center justify-center">
              <v-icon color="white" size="18">
                mdi-volume-high
              </v-icon>
            </div>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-body-2 font-weight-bold text-truncate text-primary">
              {{ t('queue.preview_song_1_title') }}
            </div>
            <div class="text-caption text-truncate opacity-60">
              {{ t('queue.preview_song_1_album') }}
            </div>
          </div>
          <v-chip
            size="x-small"
            variant="outlined"
            color="info"
            class="mr-3 font-weight-bold"
            style="border-width: 2px;"
          >
            CT
          </v-chip>
          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="error"
            class="opacity-60 pointer-events-none"
          />
        </div>

        <!-- Item 2: Próxima na fila (PB) -->
        <div class="mock-queue-item rounded-lg d-flex align-center pa-2 mb-2">
          <v-icon size="18" class="mr-2 opacity-40">
            mdi-drag-vertical
          </v-icon>
          <div class="mock-cover rounded overflow-hidden mr-3 position-relative d-flex align-center justify-center">
            <v-icon size="20" class="opacity-40">
              mdi-music
            </v-icon>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ t('queue.preview_song_2_title') }}
            </div>
            <div class="text-caption text-truncate opacity-60">
              {{ t('queue.preview_song_2_album') }}
            </div>
          </div>
          <v-chip
            size="x-small"
            variant="outlined"
            color="success"
            class="mr-3 font-weight-bold"
            style="border-width: 2px;"
          >
            PB
          </v-chip>
          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="error"
            class="opacity-60 pointer-events-none"
          />
        </div>

        <!-- Item 3: Vídeo / Coletânea Online -->
        <div class="mock-queue-item rounded-lg d-flex align-center pa-2">
          <v-icon size="18" class="mr-2 opacity-40">
            mdi-drag-vertical
          </v-icon>
          <div class="mock-cover rounded overflow-hidden mr-3 position-relative d-flex align-center justify-center">
            <v-icon size="20" class="opacity-40">
              mdi-web
            </v-icon>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ t('queue.preview_song_3_title') }}
            </div>
            <div class="text-caption text-truncate opacity-60">
              {{ t('queue.preview_song_3_album') }}
            </div>
          </div>
          <v-chip
            size="x-small"
            variant="outlined"
            color="info"
            class="mr-3 font-weight-bold"
            style="border-width: 2px;"
          >
            CT
          </v-chip>
          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="error"
            class="opacity-60 pointer-events-none"
          />
        </div>
      </div>

      <!-- Legenda Didática -->
      <div class="d-flex flex-wrap align-center justify-space-around mt-3 pt-3 border-t-subtle text-caption opacity-80">
        <div class="d-flex align-center my-1">
          <v-icon icon="mdi-drag-vertical" size="16" class="mr-1 text-primary" />
          <span>{{ t('queue.preview_legend_drag') }}</span>
        </div>
        <div class="d-flex align-center my-1">
          <v-icon icon="mdi-volume-high" size="16" class="mr-1 text-primary" />
          <span>{{ t('queue.preview_legend_playing') }}</span>
        </div>
        <div class="d-flex align-center my-1">
          <v-chip
            size="x-small"
            variant="outlined"
            color="info"
            class="mr-1 font-weight-bold"
            style="border-width: 2px; height: 18px;"
          >
            CT
          </v-chip>
          <span>{{ t('queue.preview_legend_mode_ct') }}</span>
          <span class="mx-1">/</span>
          <v-chip
            size="x-small"
            variant="outlined"
            color="success"
            class="mr-1 font-weight-bold"
            style="border-width: 2px; height: 18px;"
          >
            PB
          </v-chip>
          <span>{{ t('queue.preview_legend_mode_pb') }}</span>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Salvar Fila como Coletânea -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-content-save-outline" class="mr-2" size="22" />
      {{ t('queue.save_collection_title') }}
    </h3>
    <p class="mb-4" v-html="t('queue.save_collection_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('queue.save_collection_trigger')" />
      <li class="mb-2" v-html="t('queue.save_collection_dialog')" />
    </ul>

    <!-- Mockup: Diálogo de Salvar Coletânea -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-folder-music-outline" size="16" class="mr-1 text-primary" />
          {{ t('queue.preview_dialog_title') }}
        </span>
      </div>

      <div class="d-flex justify-center py-2">
        <v-card
          class="mock-dialog-card rounded-xl pa-4 w-100"
          max-width="420"
          elevation="2"
        >
          <div class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
            <v-icon icon="mdi-content-save-outline" class="mr-2 text-primary" size="20" />
            {{ t('queue.preview_dialog_heading') }}
          </div>

          <div class="d-flex align-center mb-4">
            <div class="mock-dialog-cover rounded-lg mr-3 d-flex flex-column align-center justify-center">
              <v-icon icon="mdi-image-plus" size="22" class="opacity-60 mb-1" />
              <span style="font-size: 0.65rem;" class="opacity-60 text-uppercase font-weight-bold">
                {{ t('queue.preview_dialog_cover_placeholder') }}
              </span>
            </div>
            <div class="flex-grow-1 pointer-events-none">
              <v-text-field
                :model-value="t('queue.preview_dialog_name_value')"
                density="compact"
                variant="outlined"
                :label="t('queue.preview_dialog_name_label')"
                hide-details
                readonly
                tabindex="-1"
                rounded="lg"
                class="pointer-events-none"
              />
            </div>
          </div>

          <div class="d-flex justify-end">
            <v-btn
              variant="text"
              size="small"
              class="text-none mr-2 pointer-events-none"
            >
              {{ t('queue.preview_dialog_btn_cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              size="small"
              class="text-none pointer-events-none"
            >
              {{ t('queue.preview_dialog_btn_save') }}
            </v-btn>
          </div>
        </v-card>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Limpeza e Gerenciamento -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-trash-can-outline" class="mr-2" size="22" />
      {{ t('queue.management_title') }}
    </h3>
    <p class="mb-4" v-html="t('queue.management_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('queue.remove_item')" />
      <li class="mb-2" v-html="t('queue.clear_all')" />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualQueue",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>

<style scoped>
.manual-preview-card {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  user-select: none;
  -webkit-user-select: none;
}

.preview-inner-bg {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.preview-queue-container {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.mock-queue-item {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.mock-queue-item.playing {
  background-color: rgba(var(--v-theme-primary), 0.12);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.mock-cover {
  width: 40px;
  height: 40px;
  background-color: rgba(128, 128, 128, 0.15);
  flex-shrink: 0;
}

.mock-playing-overlay {
  background: rgba(0, 0, 0, 0.45);
}

.mock-dialog-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  user-select: none;
  -webkit-user-select: none;
}

.mock-dialog-cover {
  width: 70px;
  height: 70px;
  background-color: rgba(128, 128, 128, 0.08);
  border: 1px dashed rgba(128, 128, 128, 0.3);
  flex-shrink: 0;
}

.border-t-subtle {
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}

.pointer-events-none,
.pointer-events-none * {
  pointer-events: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
</style>
