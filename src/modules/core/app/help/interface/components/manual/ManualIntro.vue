<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-4" v-html="t('intro.p1')" />
    <p class="mb-4" v-html="t('intro.p2')" />
    <p class="mb-6" v-html="t('intro.p3')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Principais Módulos do Sistema -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-view-grid-outline" class="mr-2" size="22" />
      {{ t('intro.modules_overview_title') }}
    </h3>
    <p class="mb-5" v-html="t('intro.modules_overview_desc')" />

    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <v-row dense>
        <!-- Módulo: Álbuns e Coletâneas -->
        <v-col cols="12" sm="6">
          <div class="module-feature-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="module-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center">
              <v-icon icon="mdi-play" size="20" color="primary" />
            </div>
            <div>
              <div class="font-weight-bold text-body-2 mb-1" style="color: var(--sidebar-text);">
                {{ t('intro.mod_songs_title') }}
              </div>
              <div class="text-caption opacity-70">
                {{ t('intro.mod_songs_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Módulo: Bíblia Sagrada -->
        <v-col cols="12" sm="6">
          <div class="module-feature-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="module-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center">
              <v-icon icon="mdi-book-cross" size="20" color="primary" />
            </div>
            <div>
              <div class="font-weight-bold text-body-2 mb-1" style="color: var(--sidebar-text);">
                {{ t('intro.mod_bible_title') }}
              </div>
              <div class="text-caption opacity-70">
                {{ t('intro.mod_bible_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Módulo: Utilitários -->
        <v-col cols="12" sm="6">
          <div class="module-feature-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="module-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center">
              <v-icon icon="mdi-plus-circle" size="20" color="primary" />
            </div>
            <div>
              <div class="font-weight-bold text-body-2 mb-1" style="color: var(--sidebar-text);">
                {{ t('intro.mod_utilities_title') }}
              </div>
              <div class="text-caption opacity-70">
                {{ t('intro.mod_utilities_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Módulo: Coletânea Online -->
        <v-col cols="12" sm="6">
          <div class="module-feature-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="module-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center">
              <v-icon icon="mdi-web" size="20" color="primary" />
            </div>
            <div>
              <div class="font-weight-bold text-body-2 mb-1" style="color: var(--sidebar-text);">
                {{ t('intro.mod_online_title') }}
              </div>
              <div class="text-caption opacity-70">
                {{ t('intro.mod_online_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Módulo: Coletânea Personalizada (inclui Editor de Música) -->
        <v-col cols="12" sm="6">
          <div class="module-feature-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="module-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center">
              <v-icon icon="mdi-star-outline" size="20" color="primary" />
            </div>
            <div>
              <div class="font-weight-bold text-body-2 mb-1" style="color: var(--sidebar-text);">
                {{ t('intro.mod_custom_title') }}
              </div>
              <div class="text-caption opacity-70">
                {{ t('intro.mod_custom_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Módulo: Liturgia de Culto -->
        <v-col cols="12" sm="6">
          <div class="module-feature-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="module-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center">
              <v-icon icon="mdi-hands-pray" size="20" color="primary" />
            </div>
            <div>
              <div class="font-weight-bold text-body-2 mb-1" style="color: var(--sidebar-text);">
                {{ t('intro.mod_liturgy_title') }}
              </div>
              <div class="text-caption opacity-70">
                {{ t('intro.mod_liturgy_desc') }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Barra de Controle e Player Inferior -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-play-circle-outline" class="mr-2" size="22" />
      {{ t('intro.player_preview_title') }}
    </h3>
    <p class="mb-5" v-html="t('intro.player_preview_desc')" />

    <!-- Mockup: Barra do Player (Fiel ao design original de Player.vue) -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="mock-player-wrapper rounded-xl overflow-hidden">
        <div class="footer-mockup-bar d-flex align-center w-100 px-4 py-2 pointer-events-none">
          <!-- 1. Informações da Faixa -->
          <div class="player-info d-flex flex-column mr-4 flex-shrink-0" style="max-width: 220px; min-width: 140px;">
            <span class="text-subtitle-2 font-weight-bold text-truncate text-primary" style="line-height: 1.2;">
              {{ t('intro.player_mock_title') }}
            </span>
            <span class="text-caption text-truncate opacity-70" style="line-height: 1.2;">
              {{ t('intro.player_mock_subtitle') }}
            </span>
          </div>

          <!-- 2. Controles de Reprodução -->
          <div class="d-flex align-center mr-4 flex-shrink-0">
            <v-btn
              icon="mdi-skip-previous"
              size="small"
              variant="text"
              class="mx-1 opacity-70"
            />
            <v-btn
              icon="mdi-play"
              size="small"
              variant="text"
              color="primary"
              class="mx-1"
            />
            <v-btn
              icon="mdi-skip-next"
              size="small"
              variant="text"
              class="mx-1 opacity-70"
            />
            <v-btn
              icon="mdi-repeat"
              size="small"
              variant="text"
              class="mx-1 opacity-50"
            />
          </div>

          <!-- 3. Linha do Tempo / Barra de Progresso -->
          <div class="d-flex align-center flex-grow-1 mr-4" style="min-width: 140px;">
            <span class="text-caption mr-2 font-weight-medium opacity-70">0:02</span>
            <v-progress-linear
              model-value="15"
              color="primary"
              rounded
              height="4"
              class="flex-grow-1"
            />
            <span class="text-caption ml-2 font-weight-medium opacity-70">2:54</span>
          </div>

          <!-- 4. Ações da Direita -->
          <div class="d-flex align-center flex-shrink-0">
            <v-btn
              icon="mdi-volume-high"
              size="small"
              variant="text"
              class="mx-1 opacity-70"
            />
            <v-btn
              icon="mdi-account-voice"
              size="small"
              variant="text"
              class="mx-1 text-primary"
            />
            <v-btn
              icon="mdi-playlist-play"
              size="small"
              variant="text"
              class="mx-1 opacity-70"
            />
            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              class="mx-1 opacity-70"
            />
          </div>
        </div>
      </div>

      <!-- Legenda de Apoio -->
      <div class="d-flex flex-wrap align-center justify-space-around mt-3 pt-3 border-t-subtle text-caption opacity-80">
        <div class="d-flex align-center my-1">
          <v-icon icon="mdi-music" size="16" class="mr-1 text-primary" />
          <span>{{ t('intro.player_legend_info') }}</span>
        </div>
        <div class="d-flex align-center my-1">
          <v-icon icon="mdi-play-circle" size="16" class="mr-1 text-primary" />
          <span>{{ t('intro.player_legend_controls') }}</span>
        </div>
        <div class="d-flex align-center my-1">
          <v-icon icon="mdi-account-voice" size="16" class="mr-1 text-primary" />
          <span>{{ t('intro.player_legend_actions') }}</span>
        </div>
      </div>
    </div>

    <!-- Dica para iniciantes -->
    <v-alert
      type="success"
      variant="tonal"
      class="rounded-xl mt-8"
      border="start"
      elevation="0"
    >
      <p class="font-weight-bold mb-1" style="font-size: 1.05rem;">
        {{ t('intro.tip_title') }}
      </p>
      <div v-html="t('intro.tip_desc')" />
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualIntro",
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

.module-feature-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(128, 128, 128, 0.08);
  transition: all 0.2s ease;
}

.module-feature-card:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.module-icon-wrap {
  background: rgba(var(--v-theme-primary), 0.1);
  flex-shrink: 0;
}

.mock-player-wrapper {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
  overflow-x: auto;
}

.footer-mockup-bar {
  min-height: 52px;
  white-space: nowrap;
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
