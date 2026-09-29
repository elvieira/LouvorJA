<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <!-- 1. Página Inicial / Busca Central -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-home-search-outline" class="mr-2" size="22" />
      {{ t('songs.home_title') }}
    </h3>
    <p class="mb-4" v-html="t('songs.home_p1')" />
    <ul class="mb-5 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('songs.focus_mode')" />
      <li class="mb-2" v-html="t('songs.history_mode')" />
    </ul>

    <!-- Mockup Interativo: Modos da Página Inicial -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-view-dashboard-outline" size="16" class="mr-1 text-primary" />
          {{ t('songs.preview_modes_title') }}
        </span>

        <!-- Seletor dos Modos -->
        <div class="d-flex align-center rounded-lg pa-1 mode-switch-container">
          <v-btn
            size="x-small"
            :variant="selectedHomeMode === 'history' ? 'flat' : 'text'"
            :color="selectedHomeMode === 'history' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-3 mr-1"
            @click="selectedHomeMode = 'history'"
          >
            {{ t('songs.preview_modes_switch_history') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedHomeMode === 'focus' ? 'flat' : 'text'"
            :color="selectedHomeMode === 'focus' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-3"
            @click="selectedHomeMode = 'focus'"
          >
            {{ t('songs.preview_modes_switch_focus') }}
          </v-btn>
        </div>
      </div>

      <!-- Preview do Modo Histórico -->
      <div v-if="selectedHomeMode === 'history'" class="preview-inner-bg rounded-lg pa-4">
        <!-- Barra de Busca no Topo -->
        <div class="mock-search-input rounded-xl pa-2 px-3 d-flex align-center mb-4">
          <v-icon size="18" class="mr-2 opacity-50">
            mdi-magnify
          </v-icon>
          <span class="text-caption opacity-60 text-truncate">
            {{ t('songs.preview_search_placeholder') }}
          </span>
        </div>

        <!-- Coletâneas Recentes -->
        <div class="text-caption font-weight-bold mb-2 opacity-70">
          {{ t('songs.preview_recent_collections') }}
        </div>
        <div class="d-flex flex-wrap gap-3 mb-4">
          <div class="mock-album-card rounded-lg pa-2 d-flex align-center">
            <div class="mock-cover rounded mr-2 d-flex align-center justify-center" style="background: rgba(0, 151, 215, 0.2);">
              <v-icon size="18" color="primary">
                mdi-book-music
              </v-icon>
            </div>
            <div class="text-caption font-weight-bold text-truncate" style="max-width: 140px;">
              {{ t('songs.preview_hymnal_name') }}
            </div>
          </div>
          <div class="mock-album-card rounded-lg pa-2 d-flex align-center">
            <div class="mock-cover rounded mr-2 d-flex align-center justify-center" style="background: rgba(245, 166, 35, 0.2);">
              <v-icon size="18" color="warning">
                mdi-music-box-multiple
              </v-icon>
            </div>
            <div class="text-caption font-weight-bold text-truncate" style="max-width: 140px;">
              {{ t('songs.preview_collection_ja') }}
            </div>
          </div>
        </div>

        <!-- Mais Tocadas -->
        <div class="text-caption font-weight-bold mb-2 opacity-70">
          {{ t('songs.preview_most_played') }}
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-chip size="x-small" variant="tonal" color="primary">
            {{ t('songs.preview_search_sample_2') }}
          </v-chip>
          <v-chip size="x-small" variant="tonal" color="primary">
            {{ t('songs.preview_search_sample_1') }}
          </v-chip>
          <v-chip size="x-small" variant="tonal" color="primary">
            {{ t('songs.preview_search_sample_3') }}
          </v-chip>
        </div>
      </div>

      <!-- Preview do Modo Foco em Busca -->
      <div v-else class="preview-inner-bg rounded-lg pa-8 d-flex flex-column align-center justify-center text-center">
        <v-icon size="36" color="primary" class="mb-3 opacity-80">
          mdi-text-box-search-outline
        </v-icon>
        <div class="mock-search-input focused rounded-xl pa-3 px-4 d-flex align-center w-100 mb-2" style="max-width: 480px;">
          <v-icon size="20" color="primary" class="mr-3">
            mdi-magnify
          </v-icon>
          <span class="text-body-2 font-weight-medium text-truncate" style="color: var(--sidebar-text);">
            {{ t('songs.preview_search_placeholder') }}
          </span>
        </div>
        <span class="text-caption opacity-60">
          {{ t('songs.focus_mode').replace(/<[^>]*>?/gm, '').split(':')[1] || '' }}
        </span>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Busca de Hinos & Curinga -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-book-music-outline" class="mr-2" size="22" />
      {{ t('songs.hymn_search_title') }}
    </h3>
    <p class="mb-4" v-html="t('songs.hymn_search_p1')" />
    <p class="mb-4" v-html="t('songs.hymn_search_p2')" />
    <ul class="mb-5 pl-6" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('songs.search_number')" />
      <li class="mb-2" v-html="t('songs.search_name')" />
      <li v-html="t('songs.search_lyrics')" />
    </ul>

    <!-- Mockup Interativo: Pesquisa e Curinga -->
    <div class="manual-preview-card pa-4 rounded-xl mb-5">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-magnify" size="16" class="mr-1 text-primary" />
          {{ t('songs.preview_search_title') }}
        </span>

        <!-- Botões de Exemplo de Pesquisa -->
        <div class="d-flex flex-wrap gap-1">
          <v-chip
            size="x-small"
            :color="selectedSearchSample === 'number' ? 'primary' : undefined"
            :variant="selectedSearchSample === 'number' ? 'flat' : 'outlined'"
            class="cursor-pointer"
            @click="selectedSearchSample = 'number'"
          >
            {{ t('songs.preview_search_tab_number') }}
          </v-chip>
          <v-chip
            size="x-small"
            :color="selectedSearchSample === 'name' ? 'primary' : undefined"
            :variant="selectedSearchSample === 'name' ? 'flat' : 'outlined'"
            class="cursor-pointer"
            @click="selectedSearchSample = 'name'"
          >
            {{ t('songs.preview_search_tab_name') }}
          </v-chip>
          <v-chip
            size="x-small"
            :color="selectedSearchSample === 'wildcard' ? 'primary' : undefined"
            :variant="selectedSearchSample === 'wildcard' ? 'flat' : 'outlined'"
            class="cursor-pointer"
            @click="selectedSearchSample = 'wildcard'"
          >
            {{ t('songs.preview_search_tab_wildcard') }}
          </v-chip>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- Input simulando a busca digitada -->
        <div class="mock-search-input rounded-lg pa-2 px-3 d-flex align-center mb-3">
          <v-icon size="18" color="primary" class="mr-2">
            mdi-magnify
          </v-icon>
          <span class="text-body-2 font-weight-bold text-primary font-mono">
            {{ activeQueryText }}
          </span>
          <v-spacer />
          <kbd class="keycap ml-2" style="font-size: 0.68rem; padding: 1px 5px;">ENTER</kbd>
        </div>

        <!-- Tabela / Linha com o Resultado Simulado -->
        <div class="mock-result-row rounded-lg pa-2 px-3 d-flex align-center justify-space-between">
          <div class="d-flex align-center overflow-hidden mr-3">
            <span class="mock-track-num font-weight-bold mr-3 opacity-60">
              {{ activeResultTrack }}
            </span>
            <div class="text-truncate">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span class="text-body-2 font-weight-bold d-block text-truncate" v-html="activeResultTitleHtml" />
              <span class="text-caption opacity-60 d-block text-truncate">
                {{ t('songs.preview_hymnal_name') }}
              </span>
            </div>
          </div>

          <div class="d-flex align-center flex-shrink-0">
            <span class="text-caption font-mono mr-3 opacity-60">3:42</span>
            <v-btn
              icon="mdi-dots-vertical"
              size="x-small"
              variant="text"
              color="primary"
              class="pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dica sobre Curinga (*) -->
    <v-alert
      type="info"
      variant="tonal"
      class="mb-6 rounded-lg"
      density="comfortable"
    >
      <span v-html="t('songs.search_tip')" />
    </v-alert>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Busca Rápida / Localizar Músicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-lightning-bolt-outline" class="mr-2" size="22" />
      {{ t('songs.quick_search_title') }}
    </h3>
    <p class="mb-4" v-html="t('songs.quick_search_p1')" />
    <p class="mb-5" v-html="t('songs.quick_search_p2')" />

    <!-- Mockup: Pop-up Global de Busca Rápida -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-application-brackets-outline" size="16" class="mr-1 text-primary" />
          {{ t('songs.preview_quick_search_title') }}
        </span>
        <div class="d-flex align-center">
          <kbd class="keycap mr-1">Ctrl / <span class="cmd-symbol">⌘</span></kbd>
          <span class="shortcut-operator">+</span>
          <kbd class="keycap">F</kbd>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4 d-flex align-center justify-center">
        <!-- Floating Dialog Mockup -->
        <div class="mock-popup-card rounded-xl pa-3 w-100" style="max-width: 460px;">
          <div class="d-flex align-center justify-space-between mb-2 px-1">
            <span class="text-caption font-weight-bold text-primary d-flex align-center">
              <v-icon size="16" class="mr-1">mdi-lightning-bolt</v-icon>
              {{ t('songs.preview_quick_search_header') }}
            </span>
            <kbd class="keycap" style="font-size: 0.65rem; padding: 1px 4px;">{{ t('songs.preview_quick_search_esc') }}</kbd>
          </div>

          <div class="mock-search-input rounded-lg pa-2 px-3 d-flex align-center mb-2">
            <v-icon size="16" color="primary" class="mr-2">
              mdi-magnify
            </v-icon>
            <span class="text-body-2 font-weight-bold text-primary">
              {{ t('songs.preview_quick_search_query') }}
            </span>
          </div>

          <div class="mock-result-row rounded-lg pa-2 px-3 d-flex align-center justify-space-between">
            <div class="d-flex align-center overflow-hidden mr-2">
              <div class="mock-cover rounded mr-2 d-flex align-center justify-center" style="background: rgba(var(--v-theme-primary), 0.15); width: 28px; height: 28px;">
                <v-icon size="16" color="primary">
                  mdi-music
                </v-icon>
              </div>
              <span class="text-caption font-weight-bold text-truncate">
                {{ t('songs.preview_quick_search_result') }}
              </span>
            </div>
            <div class="d-flex align-center flex-shrink-0">
              <v-btn
                icon="mdi-play"
                size="x-small"
                variant="flat"
                color="primary"
                class="mr-1 pointer-events-none"
              />
              <v-btn
                icon="mdi-playlist-plus"
                size="x-small"
                variant="tonal"
                color="primary"
                class="pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 4. Modos de Reprodução de Músicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-play-circle-outline" class="mr-2" size="22" />
      {{ t('songs.playback_title') }}
    </h3>
    <p class="mb-4">
      {{ t('songs.playback_desc') }}
    </p>

    <!-- Cards dos 5 Modos de Reprodução -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="text-caption font-weight-bold text-uppercase opacity-70 mb-3 d-flex align-center">
        <v-icon icon="mdi-tune-vertical" size="16" class="mr-1 text-primary" />
        {{ t('songs.preview_playback_title') }}
      </div>

      <v-row dense>
        <!-- 1. Cantado -->
        <v-col cols="12" sm="6">
          <div class="playback-action-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="action-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center" style="background: rgba(0, 151, 215, 0.15);">
              <v-icon icon="mdi-account-voice" size="20" color="primary" />
            </div>
            <div>
              <div class="d-flex align-center mb-1">
                <span class="font-weight-bold text-body-2 mr-2" style="color: var(--sidebar-text);">
                  {{ t('songs.preview_playback_sung_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Áudio + Slides
                </v-chip>
              </div>
              <div class="text-caption opacity-70">
                {{ t('songs.preview_playback_sung_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- 2. Playback / Instrumental -->
        <v-col cols="12" sm="6">
          <div class="playback-action-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="action-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center" style="background: rgba(76, 175, 80, 0.15);">
              <v-icon icon="mdi-music" size="20" color="success" />
            </div>
            <div>
              <div class="d-flex align-center mb-1">
                <span class="font-weight-bold text-body-2 mr-2" style="color: var(--sidebar-text);">
                  {{ t('songs.preview_playback_pb_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="success"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Instrumental
                </v-chip>
              </div>
              <div class="text-caption opacity-70">
                {{ t('songs.preview_playback_pb_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- 3. Sem Áudio -->
        <v-col cols="12" sm="6">
          <div class="playback-action-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="action-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center" style="background: rgba(245, 166, 35, 0.15);">
              <v-icon icon="mdi-volume-off" size="20" color="warning" />
            </div>
            <div>
              <div class="d-flex align-center mb-1">
                <span class="font-weight-bold text-body-2 mr-2" style="color: var(--sidebar-text);">
                  {{ t('songs.preview_playback_no_audio_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="warning"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Manual
                </v-chip>
              </div>
              <div class="text-caption opacity-70">
                {{ t('songs.preview_playback_no_audio_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- 4. Letra da Música -->
        <v-col cols="12" sm="6">
          <div class="playback-action-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="action-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center" style="background: rgba(33, 150, 243, 0.15);">
              <v-icon icon="mdi-text-box-outline" size="20" color="info" />
            </div>
            <div>
              <div class="d-flex align-center mb-1">
                <span class="font-weight-bold text-body-2 mr-2" style="color: var(--sidebar-text);">
                  {{ t('songs.preview_playback_lyrics_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="info"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Texto
                </v-chip>
              </div>
              <div class="text-caption opacity-70">
                {{ t('songs.preview_playback_lyrics_desc') }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- 5. Adicionar à Fila -->
        <v-col cols="12">
          <div class="playback-action-card rounded-lg pa-3 d-flex align-start h-100">
            <div class="action-icon-wrap rounded-lg pa-2 mr-3 d-flex align-center justify-center" style="background: rgba(156, 39, 176, 0.15);">
              <v-icon icon="mdi-playlist-plus" size="20" color="purple" />
            </div>
            <div>
              <div class="d-flex align-center mb-1">
                <span class="font-weight-bold text-body-2 mr-2" style="color: var(--sidebar-text);">
                  {{ t('songs.preview_playback_queue_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="purple"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Fila do Player
                </v-chip>
              </div>
              <div class="text-caption opacity-70">
                {{ t('songs.preview_playback_queue_desc') }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSongs",
  data() {
    return {
      selectedHomeMode: "history" as "history" | "focus",
      selectedSearchSample: "wildcard" as "number" | "name" | "wildcard",
    };
  },
  computed: {
    activeQueryText(): string {
      if (this.selectedSearchSample === "number") return "301";
      if (this.selectedSearchSample === "name") return "Jesus";
      return "Jesus * Melhor";
    },
    activeResultTrack(): string {
      return "301";
    },
    activeResultTitleHtml(): string {
      if (this.selectedSearchSample === "number") {
        return "301 - Jesus É Melhor";
      }
      if (this.selectedSearchSample === "name") {
        return "301 - <mark class=\"manual-highlight\">Jesus</mark> É Melhor";
      }
      return "301 - <mark class=\"manual-highlight\">Jesus</mark> É <mark class=\"manual-highlight\">Melhor</mark>";
    },
  },
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
  background: rgba(0, 0, 0, 0.035);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.mode-switch-container {
  background: rgba(128, 128, 128, 0.1);
}

.mock-search-input {
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid rgba(128, 128, 128, 0.2);
  transition: all 0.2s ease;
}

.mock-search-input.focused {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.15);
  background: rgba(var(--v-theme-primary), 0.04);
}

.mock-album-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(128, 128, 128, 0.12);
}

.mock-cover {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.mock-result-row {
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid rgba(128, 128, 128, 0.15);
}

.mock-popup-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.playback-action-card {
  background: rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(128, 128, 128, 0.09);
  transition: all 0.2s ease;
}

.playback-action-card:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.action-icon-wrap {
  flex-shrink: 0;
}

.pointer-events-none {
  pointer-events: none !important;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
