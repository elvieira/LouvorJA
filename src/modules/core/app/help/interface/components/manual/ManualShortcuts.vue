<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-4 text-body-1" style="color: var(--sidebar-text);">
      {{ t('shortcuts.intro') }}
    </p>

    <!-- Nota de Compatibilidade de Teclas (Windows/Linux vs macOS) -->
    <div class="d-flex align-center mb-5 px-4 py-2 rounded-lg os-info-pill">
      <v-icon
        icon="mdi-keyboard-outline"
        size="18"
        color="primary"
        class="mr-2"
      />
      <span class="text-caption font-weight-medium" style="color: var(--sidebar-text);">
        {{ t('shortcuts.os_platform_note') }}
      </span>
    </div>

    <!-- Destaque: Atalhos Mais Usados no Culto -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-star-shooting-outline" class="mr-2" size="22" />
      {{ t('shortcuts.essential_title') }}
    </h3>
    <p class="mb-4 text-caption opacity-80" style="color: var(--sidebar-text-secondary);">
      {{ t('shortcuts.essential_desc') }}
    </p>

    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <v-row dense>
        <!-- Card 1: Avançar Slide -->
        <v-col cols="12" sm="6" md="4">
          <div class="shortcut-hero-card rounded-lg pa-3 d-flex flex-column justify-space-between h-100">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-arrow-right-bold"
                size="18"
                color="primary"
                class="mr-2"
              />
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('shortcuts.action_advance') }}
              </span>
            </div>
            <div class="d-flex align-center flex-wrap">
              <kbd class="keycap">→</kbd>
              <span class="shortcut-operator">{{ t('shortcuts.or') }}</span>
              <kbd class="keycap">PgDn</kbd>
            </div>
          </div>
        </v-col>

        <!-- Card 2: Voltar Slide -->
        <v-col cols="12" sm="6" md="4">
          <div class="shortcut-hero-card rounded-lg pa-3 d-flex flex-column justify-space-between h-100">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-arrow-left-bold"
                size="18"
                color="primary"
                class="mr-2"
              />
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('shortcuts.action_previous') }}
              </span>
            </div>
            <div class="d-flex align-center flex-wrap">
              <kbd class="keycap">←</kbd>
              <span class="shortcut-operator">{{ t('shortcuts.or') }}</span>
              <kbd class="keycap">PgUp</kbd>
            </div>
          </div>
        </v-col>

        <!-- Card 3: Busca Rápida de Músicas -->
        <v-col cols="12" sm="6" md="4">
          <div class="shortcut-hero-card rounded-lg pa-3 d-flex flex-column justify-space-between h-100">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-music-note"
                size="18"
                color="primary"
                class="mr-2"
              />
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('shortcuts.action_search_song') }}
              </span>
            </div>
            <div class="d-flex align-center flex-wrap">
              <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd>
              <span class="shortcut-operator">+</span>
              <kbd class="keycap">F</kbd>
            </div>
          </div>
        </v-col>

        <!-- Card 4: Busca Rápida da Bíblia -->
        <v-col cols="12" sm="6" md="4">
          <div class="shortcut-hero-card rounded-lg pa-3 d-flex flex-column justify-space-between h-100">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-book-cross"
                size="18"
                color="primary"
                class="mr-2"
              />
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('shortcuts.action_search_bible') }}
              </span>
            </div>
            <div class="d-flex align-center flex-wrap">
              <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd>
              <span class="shortcut-operator">+</span>
              <kbd class="keycap">B</kbd>
            </div>
          </div>
        </v-col>

        <!-- Card 5: Play / Pausar Música -->
        <v-col cols="12" sm="6" md="4">
          <div class="shortcut-hero-card rounded-lg pa-3 d-flex flex-column justify-space-between h-100">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-play-pause"
                size="18"
                color="primary"
                class="mr-2"
              />
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('shortcuts.action_play_pause') }}
              </span>
            </div>
            <div class="d-flex align-center flex-wrap">
              <kbd class="keycap">Espaço</kbd>
              <span class="shortcut-operator">{{ t('shortcuts.or') }}</span>
              <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd>
              <span class="shortcut-operator">+</span>
              <kbd class="keycap">P</kbd>
            </div>
          </div>
        </v-col>

        <!-- Card 6: Fechar Música (Duplo ESC Instantâneo) -->
        <v-col cols="12" sm="6" md="4">
          <div class="shortcut-hero-card rounded-lg pa-3 d-flex flex-column justify-space-between h-100">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-close-circle-outline"
                size="18"
                color="error"
                class="mr-2"
              />
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('shortcuts.action_close') }}
              </span>
            </div>
            <div class="d-flex align-center flex-wrap">
              <kbd class="keycap">ESC</kbd>
              <span class="shortcut-operator">+</span>
              <kbd class="keycap">ESC</kbd>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 1. Navegação Rápida entre Módulos -->
    <v-card variant="flat" class="rounded-xl mb-6 shortcut-table-card">
      <v-card-title class="px-5 py-4 d-flex align-center shortcut-card-header">
        <v-icon
          icon="mdi-compass-outline"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold text-subtitle-1" style="color: var(--sidebar-text);">
          {{ t('shortcuts.navigation_title') }}
        </span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent shortcut-table" density="comfortable">
          <tbody>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">1</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_home') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">2</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_musics') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">3</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_bible') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">4</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_utilities') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">5</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_online') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">6</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_personalized') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">7</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_liturgy') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">L</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_library') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">H</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_help') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">F1</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_manual') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">,</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.nav_config') }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- 2. Controles de Reprodução e Mídia -->
    <v-card variant="flat" class="rounded-xl mb-6 shortcut-table-card">
      <v-card-title class="px-5 py-4 d-flex align-center shortcut-card-header">
        <v-icon
          icon="mdi-play-circle-outline"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold text-subtitle-1" style="color: var(--sidebar-text);">
          {{ t('shortcuts.playback_title') }}
        </span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent shortcut-table" density="comfortable">
          <tbody>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Espaço</kbd> <span class="shortcut-operator">{{ t('shortcuts.or') }}</span> <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">P</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.play_pause') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">ESC</kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">ESC</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.close_song_instant') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">ESC</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.close_song_confirm') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">Q</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.toggle_queue') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">T</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.toggle_audio_mode') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">M</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.toggle_mute') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">↑</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.volume_up') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">↓</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.volume_down') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">→</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.next_music') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">←</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.prev_music') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">M</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.minimize_player') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">F</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.fullscreen_player') }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- 3. Apresentação e Projeção de Slides -->
    <v-card variant="flat" class="rounded-xl mb-6 shortcut-table-card">
      <v-card-title class="px-5 py-4 d-flex align-center shortcut-card-header">
        <v-icon
          icon="mdi-monitor-dashboard"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold text-subtitle-1" style="color: var(--sidebar-text);">
          {{ t('shortcuts.projection_title') }}
        </span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent shortcut-table" density="comfortable">
          <tbody>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">→</kbd> <span class="shortcut-operator">{{ t('shortcuts.or') }}</span> <kbd class="keycap">↓</kbd> <span class="shortcut-operator">{{ t('shortcuts.or') }}</span> <kbd class="keycap">PgDn</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.next_slide') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">←</kbd> <span class="shortcut-operator">{{ t('shortcuts.or') }}</span> <kbd class="keycap">↑</kbd> <span class="shortcut-operator">{{ t('shortcuts.or') }}</span> <kbd class="keycap">PgUp</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.prev_slide') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Home</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.first_slide') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">End</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.last_slide') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">Enter</kbd> <span class="shortcut-operator">{{ t('shortcuts.or') }}</span> <kbd class="keycap">F11</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.toggle_projection') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">.</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.blackout') }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- 4. Buscas Globais Rápidas -->
    <v-card variant="flat" class="rounded-xl mb-6 shortcut-table-card">
      <v-card-title class="px-5 py-4 d-flex align-center shortcut-card-header">
        <v-icon
          icon="mdi-magnify"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold text-subtitle-1" style="color: var(--sidebar-text);">
          {{ t('shortcuts.search_title') }}
        </span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent shortcut-table" density="comfortable">
          <tbody>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">F</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.quick_search_songs') }}
              </td>
            </tr>
            <tr>
              <td class="keys-cell">
                <kbd class="keycap">Ctrl/ <span class="cmd-symbol">⌘</span></kbd> <span class="shortcut-operator">+</span> <kbd class="keycap">B</kbd>
              </td>
              <td class="desc-cell">
                {{ t('shortcuts.quick_search_bible') }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualShortcuts",
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

.os-info-pill {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  width: fit-content;
}

.shortcut-hero-card {
  background: rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(128, 128, 128, 0.1);
  transition: all 0.2s ease;
}

.shortcut-hero-card:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.shortcut-table-card {
  background: rgba(128, 128, 128, 0.03) !important;
  border: 1px solid var(--border-color) !important;
}

.shortcut-card-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.keys-cell {
  min-width: 320px;
  width: 340px;
  vertical-align: middle;
  padding: 12px 16px !important;
  white-space: nowrap;
}

.desc-cell {
  color: var(--sidebar-text-secondary);
  vertical-align: middle;
  padding: 12px 16px !important;
}

/* Keycap styling premium */
.keycap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Symbol", "Apple Symbols", Roboto, "Helvetica Neue", Arial, sans-serif;
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.12);
  color: var(--sidebar-text);
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-bottom: 2px solid rgba(128, 128, 128, 0.4);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.cmd-symbol {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Symbol", "Apple Symbols", sans-serif;
  font-weight: 600;
  font-size: 1.05em;
  line-height: 1;
  display: inline-block;
}

/* Operador / Conector: ou, +, etc. Estilo padronizado e meio opaco */
.shortcut-operator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--sidebar-text);
  opacity: 0.45;
  margin: 0 5px;
  user-select: none;
  line-height: 1;
}

.shortcut-table tr:hover {
  background: rgba(var(--v-theme-primary), 0.03);
}
</style>
