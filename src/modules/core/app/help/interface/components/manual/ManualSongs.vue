<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <!-- Página Inicial / Busca Central -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-home-search-outline" class="mr-2" size="22" />
      {{ t('songs.home_title') }}
    </h3>
    <p class="mb-4" v-html="t('songs.home_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('songs.focus_mode')" />
      <li class="mb-2" v-html="t('songs.history_mode')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Busca de Hinos -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-book-music-outline" class="mr-2" size="22" />
      {{ t('songs.hymn_search_title') }}
    </h3>
    <p class="mb-4" v-html="t('songs.hymn_search_p1')" />
    <p class="mb-4" v-html="t('songs.hymn_search_p2')" />
    <ul class="mb-4 pl-6" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('songs.search_number')" />
      <li class="mb-2" v-html="t('songs.search_name')" />
      <li v-html="t('songs.search_lyrics')" />
      <v-alert
        type="info"
        variant="tonal"
        class="mt-4 rounded-lg"
        density="comfortable"
      >
        <span v-html="t('songs.search_tip')" />
      </v-alert>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Busca Rápida / Localizar Músicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-lightning-bolt-outline" class="mr-2" size="22" />
      {{ t('songs.quick_search_title') }}
    </h3>
    <p class="mb-4" v-html="t('songs.quick_search_p1')" />
    <p class="mb-4" v-html="t('songs.quick_search_p2')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Reprodução de Hinos -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-play-circle-outline" class="mr-2" size="22" />
      {{ t('songs.playback_title') }}
    </h3>
    <p class="mb-2">
      {{ t('songs.playback_desc') }}
    </p>
    <ul class="mb-4 pl-6" style="color: var(--sidebar-text-secondary);">
      <li class="mb-1" v-html="t('songs.playback_sung')" />
      <li class="mb-1" v-html="t('songs.playback_playback')" />
      <li class="mb-1" v-html="t('songs.playback_no_audio')" />
      <li class="mb-1" v-html="t('songs.playback_lyrics')" />
      <li class="mb-1" v-html="t('songs.playback_queue')" />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSongs",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
