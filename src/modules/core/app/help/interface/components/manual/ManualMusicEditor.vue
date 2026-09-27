<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('music_editor.intro')" />

    <!-- Ribbon / Faixa de Opções -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-view-dashboard-outline" class="mr-2" size="22" />
      {{ t('music_editor.ribbon_title') }}
    </h3>
    <p class="mb-4" v-html="t('music_editor.ribbon_p1')" />

    <!-- Aba Arquivo -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-folder-outline" class="mr-2" size="18" />
      {{ t('music_editor.tab_file_title') }}
    </h4>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('music_editor.file_new')" />
      <li class="mb-2" v-html="t('music_editor.file_open')" />
      <li class="mb-2" v-html="t('music_editor.file_import')" />
      <li class="mb-2" v-html="t('music_editor.file_audio_bind')" />
      <li class="mb-2" v-html="t('music_editor.file_save')" />
    </ul>

    <!-- Aba Slides -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-presentation" class="mr-2" size="18" />
      {{ t('music_editor.tab_slides_title') }}
    </h4>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('music_editor.slides_new')" />
      <li class="mb-2" v-html="t('music_editor.slides_duplicate')" />
      <li class="mb-2" v-html="t('music_editor.slides_delete')" />
      <li class="mb-2" v-html="t('music_editor.slides_nav')" />
    </ul>

    <!-- Aba Formatar -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-format-paint" class="mr-2" size="18" />
      {{ t('music_editor.tab_format_title') }}
    </h4>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('music_editor.format_bg_image')" />
      <li class="mb-2" v-html="t('music_editor.format_batch_bg')" />
      <li class="mb-2" v-html="t('music_editor.format_main_text')" />
      <li class="mb-2" v-html="t('music_editor.format_aux_text')" />
    </ul>

    <!-- Aba Sincronia -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-sync" class="mr-2" size="18" />
      {{ t('music_editor.tab_sync_title') }}
    </h4>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('music_editor.sync_player')" />
      <li class="mb-2" v-html="t('music_editor.sync_record_advance')" />
      <li class="mb-2" v-html="t('music_editor.sync_reset')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Apresentação e Projeção -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-projector-screen" class="mr-2" size="22" />
      {{ t('music_editor.projection_title') }}
    </h3>
    <p class="mb-4" v-html="t('music_editor.projection_p1')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualMusicEditor",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
