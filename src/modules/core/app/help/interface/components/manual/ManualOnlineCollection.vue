<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('online_collection.intro')" />

    <!-- Vídeos Online (Canais Oficiais) -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-web" class="mr-2" size="22" />
      {{ t('online_collection.online_videos_title') }}
    </h3>
    <p class="mb-4" v-html="t('online_collection.online_videos_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('online_collection.online_channels')" />
      <li class="mb-2" v-html="t('online_collection.online_playlists')" />
      <li class="mb-2" v-html="t('online_collection.online_playback')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Vídeos Personalizados -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-playlist-plus" class="mr-2" size="22" />
      {{ t('online_collection.personalized_videos_title') }}
    </h3>
    <p class="mb-4" v-html="t('online_collection.personalized_videos_desc')" />

    <!-- Aba Música -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-music-note" class="mr-2" size="18" />
      {{ t('online_collection.tab_music_title') }}
    </h4>
    <p class="mb-2 pl-2 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('online_collection.tab_music_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('online_collection.action_add_link')" />
      <li class="mb-2" v-html="t('online_collection.action_clipboard')" />
      <li class="mb-2" v-html="t('online_collection.action_menu_options')" />
    </ul>

    <!-- Aba Playlists -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-playlist-play" class="mr-2" size="18" />
      {{ t('online_collection.tab_playlists_title') }}
    </h4>
    <p class="mb-2 pl-2 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('online_collection.tab_playlists_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('online_collection.action_add_playlist')" />
      <li class="mb-2" v-html="t('online_collection.action_playlist_albums')" />
      <li class="mb-2" v-html="t('online_collection.action_playlist_navigation')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Busca e Filtros -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-magnify" class="mr-2" size="22" />
      {{ t('online_collection.search_title') }}
    </h3>
    <p class="mb-4" v-html="t('online_collection.search_desc')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualOnlineCollection",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
