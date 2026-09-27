<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('custom_collection.intro')" />

    <!-- Criação de Coletâneas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-folder-plus-outline" class="mr-2" size="22" />
      {{ t('custom_collection.create_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.create_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('custom_collection.step_1_title')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('custom_collection.step_1_name')" />
          <li v-html="t('custom_collection.step_1_cover')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('custom_collection.step_2_title')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('custom_collection.step_2_folder')" />
          <li v-html="t('custom_collection.step_2_song')" />
          <li v-html="t('custom_collection.step_2_empty')" />
        </ul>
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Gerenciamento de Músicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-music-box-multiple" class="mr-2" size="22" />
      {{ t('custom_collection.manage_songs_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.add_songs_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('custom_collection.add_catalog')" />
      <li class="mb-2" v-html="t('custom_collection.add_local_files')" />
      <li class="mb-3">
        <span v-html="t('custom_collection.song_actions_title')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('custom_collection.action_playback_options')" />
          <li v-html="t('custom_collection.action_queue')" />
          <li v-html="t('custom_collection.action_edit_media')" />
          <li v-html="t('custom_collection.action_remove')" />
        </ul>
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Busca e Filtros -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-filter-variant" class="mr-2" size="22" />
      {{ t('custom_collection.search_filter_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.search_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('custom_collection.filter_collection_name')" />
      <li class="mb-2" v-html="t('custom_collection.filter_song_name')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Ações da Coletânea -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-cog-outline" class="mr-2" size="22" />
      {{ t('custom_collection.collection_actions_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.collection_actions_desc')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualCustomCollection",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
