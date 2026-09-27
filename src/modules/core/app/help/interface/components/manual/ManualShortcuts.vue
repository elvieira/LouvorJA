<template>
  <div class="manual-section">
    <p class="mb-6">
      {{ t('shortcuts.intro') }}
    </p>

    <!-- Geral -->
    <v-card variant="flat" class="rounded-xl mb-6" style="background: rgba(128, 128, 128, 0.04); border: 1px solid rgba(128, 128, 128, 0.1);">
      <v-card-title class="px-5 py-4 d-flex align-center" style="border-bottom: 1px solid rgba(128, 128, 128, 0.1);">
        <v-icon
          icon="mdi-laptop"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold" style="font-size: 1.1rem; color: var(--sidebar-text);">{{ t('shortcuts.general') }}</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent" density="comfortable">
          <tbody>
            <tr>
              <td style="width: 250px;">
                <kbd>ESC</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.close_song') }}
              </td>
            </tr>
            <tr>
              <td><kbd>CTRL / ⌘</kbd> + <kbd>F</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.quick_search_songs') }}
              </td>
            </tr>
            <tr>
              <td><kbd>CTRL / ⌘</kbd> + <kbd>B</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.quick_search_bible') }}
              </td>
            </tr>
            <tr>
              <td><kbd>F1</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.open_help') }}
              </td>
            </tr>
            <tr>
              <td><kbd>CTRL / ⌘</kbd> + <kbd>Enter</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.project_current_window') }}
              </td>
            </tr>
            <tr>
              <td class="font-weight-medium">
                {{ t('shortcuts.exit_projection') }}
              </td>
              <td><kbd>ESC</kbd></td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Bíblia -->
    <v-card variant="flat" class="rounded-xl mb-6" style="background: rgba(128, 128, 128, 0.04); border: 1px solid rgba(128, 128, 128, 0.1);">
      <v-card-title class="px-5 py-4 d-flex align-center" style="border-bottom: 1px solid rgba(128, 128, 128, 0.1);">
        <v-icon
          icon="mdi-book-cross"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold" style="font-size: 1.1rem; color: var(--sidebar-text);">{{ t('shortcuts.bible_title') }}</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent" density="comfortable">
          <tbody>
            <tr>
              <td style="width: 250px;">
                <kbd>←</kbd> / <kbd>↑</kbd> / <kbd>PgUp</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.prev_verse') }}
              </td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> / <kbd>↓</kbd> / <kbd>PgDn</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.next_verse') }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Projeção -->
    <v-card variant="flat" class="rounded-xl mb-6" style="background: rgba(128, 128, 128, 0.04); border: 1px solid rgba(128, 128, 128, 0.1);">
      <v-card-title class="px-5 py-4 d-flex align-center" style="border-bottom: 1px solid rgba(128, 128, 128, 0.1);">
        <v-icon
          icon="mdi-monitor"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold" style="font-size: 1.1rem; color: var(--sidebar-text);">{{ t('shortcuts.song_projection') }}</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent" density="comfortable">
          <tbody>
            <tr>
              <td style="width: 250px;">
                <kbd>←</kbd> / <kbd>↑</kbd> / <kbd>PgUp</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.prev_slide') }}
              </td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> / <kbd>↓</kbd> / <kbd>PgDn</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.next_slide') }}
              </td>
            </tr>
            <tr>
              <td><kbd>Home</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.first_slide') }}
              </td>
            </tr>
            <tr>
              <td><kbd>End</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.last_slide') }}
              </td>
            </tr>
            <tr>
              <td>
                <kbd>CTRL / ⌘</kbd> + <kbd>P</kbd> / <kbd>Espaço</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                {{ t('shortcuts.pause_resume') }}
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
