<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('online_collection.intro')" />

    <!-- 1. Vídeos Online (Canais Oficiais) -->
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

    <!-- Exemplo Visual 1: Navegador de Canais Oficiais -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-youtube" size="16" class="mr-1 text-primary" />
          {{ t('online_collection.preview_channels_title') }}
        </span>
        <div class="d-flex align-center gap-1">
          <v-btn
            size="x-small"
            :color="channelView === 'channels' ? 'primary' : ''"
            :variant="channelView === 'channels' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="channelView = 'channels'"
          >
            {{ t('online_collection.preview_tab_channels') }}
          </v-btn>
          <v-btn
            size="x-small"
            :color="channelView === 'videos' ? 'primary' : ''"
            :variant="channelView === 'videos' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="channelView = 'videos'"
          >
            {{ t('online_collection.preview_tab_playlist_videos') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- VISTA DE CANAIS -->
        <div v-if="channelView === 'channels'">
          <div class="text-caption font-weight-medium opacity-70 mb-3">
            Canais e ministérios de louvor oficiais cadastrados no sistema:
          </div>
          <v-row dense>
            <v-col
              v-for="ch in officialChannels"
              :key="ch.id"
              cols="12"
              sm="6"
              md="3"
            >
              <div
                class="mock-channel-card rounded-lg pa-3 cursor-pointer d-flex flex-column justify-space-between"
                :class="{ 'card-active': selectedChannelId === ch.id }"
                @click="selectedChannelId = ch.id; channelView = 'videos'"
              >
                <div>
                  <div
                    class="mock-channel-avatar rounded-circle mb-3 d-flex align-center justify-center text-white font-weight-bold"
                    :style="{ background: ch.gradient }"
                  >
                    <v-icon size="24">
                      {{ ch.icon }}
                    </v-icon>
                  </div>
                  <div class="font-weight-bold text-subtitle-2 mb-1" style="color: var(--sidebar-text); line-height: 1.2;">
                    {{ ch.name }}
                  </div>
                  <div class="text-caption opacity-60">
                    {{ ch.genre }}
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between mt-3 pt-2 border-t-subtle">
                  <span class="text-caption font-weight-medium text-primary">{{ ch.playlistsCount }} playlists</span>
                  <v-icon size="16" color="primary">
                    mdi-chevron-right
                  </v-icon>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- VISTA DE VÍDEOS DA PLAYLIST -->
        <div v-else>
          <!-- Cabeçalho do Canal Ativo -->
          <div class="d-flex align-center justify-space-between mb-3 pb-2 border-b-subtle flex-wrap gap-2">
            <div class="d-flex align-center">
              <div
                class="mock-back-btn rounded-circle pa-1 mr-2 d-flex align-center justify-center cursor-pointer"
                @click="channelView = 'channels'"
              >
                <v-icon size="18">
                  mdi-arrow-left
                </v-icon>
              </div>
              <div
                class="mock-mini-avatar rounded-circle mr-2 d-flex align-center justify-center text-white"
                :style="{ background: activeChannel.gradient, width: '32px', height: '32px' }"
              >
                <v-icon size="18">
                  {{ activeChannel.icon }}
                </v-icon>
              </div>
              <div>
                <div class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                  {{ activeChannel.name }}
                </div>
                <div class="text-caption opacity-60">
                  Playlist: <strong>Louvores e Playbacks Principais</strong>
                </div>
              </div>
            </div>

            <!-- Badge Ilustrativo de Projeção -->
            <div class="mock-live-chip rounded-pill px-2 py-1 text-caption font-weight-bold d-flex align-center">
              <span class="pulse-dot-red mr-1" />
              Pronto para Telão
            </div>
          </div>

          <!-- Lista de Vídeos com Thumbnails (Visual) -->
          <div class="mock-online-video-list rounded-lg overflow-hidden">
            <div
              v-for="(vid, idx) in activeChannel.videos"
              :key="vid.id"
              class="mock-online-video-item d-flex align-center pa-2 px-3"
            >
              <!-- Número Sequencial -->
              <span class="text-caption font-weight-bold opacity-60 mr-3" style="min-width: 18px;">
                {{ Number(idx) + 1 }}
              </span>

              <!-- Thumbnail com Botão Play -->
              <div class="mock-thumb-box rounded-md mr-3 overflow-hidden d-flex align-center justify-center">
                <v-icon size="20" color="white" class="mock-play-overlay">
                  mdi-play-circle
                </v-icon>
              </div>

              <!-- Título do Vídeo -->
              <div class="flex-grow-1 min-width-0 mr-2">
                <div class="text-body-2 font-weight-medium text-truncate" style="color: var(--sidebar-text);">
                  {{ vid.title }}
                </div>
                <div class="text-caption opacity-50">
                  {{ activeChannel.name }} &bull; {{ vid.duration }}
                </div>
              </div>

              <!-- Botão Ilustrativo Projetar -->
              <div class="mock-ui-btn-tonal rounded-lg px-2 py-1 text-caption font-weight-bold d-flex align-center pointer-events-none">
                <v-icon icon="mdi-monitor" size="14" class="mr-1" />
                Projetar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Vídeos Personalizados -->
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

    <!-- Exemplo Visual 2: Gerenciador de Vídeos Personalizados (Música & Playlists) -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-youtube-subscription" size="16" class="mr-1 text-primary" />
          {{ t('online_collection.preview_personalized_title') }}
        </span>

        <!-- Seletor Pill Switch -->
        <div class="mock-pill-switch rounded-pill d-flex align-center pa-1">
          <button
            type="button"
            class="mock-pill-btn rounded-pill px-3 py-1 font-weight-bold text-caption d-flex align-center"
            :class="{ active: customTab === 'music' }"
            @click="customTab = 'music'"
          >
            <v-icon icon="mdi-music-note" size="14" class="mr-1" />
            Música (3)
          </button>
          <button
            type="button"
            class="mock-pill-btn rounded-pill px-3 py-1 font-weight-bold text-caption d-flex align-center"
            :class="{ active: customTab === 'playlists' }"
            @click="customTab = 'playlists'"
          >
            <v-icon icon="mdi-playlist-play" size="14" class="mr-1" />
            Playlists (2)
          </button>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- BARRA SUPERIOR DO MÓDULO PERSONALIZADO -->
        <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
          <div class="mock-search-box rounded-xl d-flex align-center px-3 py-1 flex-grow-1" style="max-width: 360px;">
            <v-icon
              icon="mdi-magnify"
              size="18"
              color="primary"
              class="mr-2 opacity-70"
            />
            <span class="text-caption opacity-50">{{ customTab === 'music' ? 'Buscar vídeo por nome...' : 'Buscar playlist...' }}</span>
          </div>

          <div class="mock-ui-btn rounded-lg pa-2 px-3 text-caption font-weight-bold d-flex align-center pointer-events-none">
            <v-icon icon="mdi-plus" size="16" class="mr-1" />
            {{ customTab === 'music' ? '+ Adicionar Link' : '+ Adicionar Playlist' }}
          </div>
        </div>

        <!-- CONTEÚDO DA ABA MÚSICA -->
        <div v-if="customTab === 'music'">
          <div class="mock-online-video-list rounded-lg overflow-hidden">
            <div
              v-for="(item, idx) in customVideos"
              :key="item.id"
              class="mock-online-video-item d-flex align-center pa-2 px-3"
            >
              <span class="text-caption font-weight-bold opacity-60 mr-3" style="min-width: 18px;">
                {{ Number(idx) + 1 }}
              </span>

              <div class="mock-thumb-box custom-thumb rounded-md mr-3 d-flex align-center justify-center">
                <v-icon size="18" color="white">
                  mdi-youtube
                </v-icon>
              </div>

              <div class="flex-grow-1 min-width-0 mr-2">
                <div class="text-body-2 font-weight-medium text-truncate" style="color: var(--sidebar-text);">
                  {{ item.name }}
                </div>
                <div class="text-caption opacity-50">
                  ID: {{ item.videoId }} &bull; Adicionado por você
                </div>
              </div>

              <!-- Ações da Música (Visual) -->
              <div class="d-flex align-center gap-1 opacity-80 pointer-events-none">
                <v-icon color="primary" size="18" class="mx-1">
                  mdi-play-circle
                </v-icon>
                <v-icon size="16" class="mx-1 opacity-60">
                  mdi-dots-vertical
                </v-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- CONTEÚDO DA ABA PLAYLISTS (ÁLBUNS) -->
        <div v-else>
          <v-row dense>
            <v-col
              v-for="album in customAlbums"
              :key="album.id"
              cols="12"
              sm="6"
            >
              <div class="mock-album-card rounded-lg pa-3 d-flex align-center">
                <div
                  class="mock-album-cover rounded-md mr-3 d-flex align-center justify-center text-white"
                  :style="{ background: album.gradient }"
                >
                  <v-icon size="26">
                    mdi-playlist-play
                  </v-icon>
                </div>
                <div class="flex-grow-1 min-width-0">
                  <div class="font-weight-bold text-subtitle-2 text-truncate" style="color: var(--sidebar-text);">
                    {{ album.name }}
                  </div>
                  <div class="text-caption opacity-60">
                    {{ album.count }} vídeos cadastrados
                  </div>
                </div>
                <v-icon size="18" color="primary" class="ml-2">
                  mdi-chevron-right
                </v-icon>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>

    <!-- Exemplo Visual 3: Diálogo Ilustrativo de Adição de Link -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-clipboard-arrow-down-outline" size="16" class="mr-1 text-primary" />
          {{ t('online_collection.preview_add_dialog_title') }}
        </span>
        <span class="text-caption opacity-60">Exemplo da tela de cadastro</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <!-- Badge Ilustrativo de Detecção Automática -->
        <div class="bg-success-subtle text-success rounded-lg pa-2 px-3 mb-3 d-flex align-center text-caption font-weight-bold">
          <v-icon icon="mdi-check-circle" size="16" class="mr-2" />
          {{ t('online_collection.preview_add_detected_badge') }}
        </div>

        <!-- Campos Ilustrativos -->
        <div class="mb-3">
          <div class="text-caption font-weight-medium opacity-70 mb-1">
            {{ t('online_collection.preview_add_url_label') }}
          </div>
          <div class="mock-static-field rounded-lg pa-2 px-3 text-body-2 font-weight-medium">
            https://www.youtube.com/watch?v=dQw4w9WgXcQ
          </div>
        </div>

        <div class="mb-4">
          <div class="text-caption font-weight-medium opacity-70 mb-1">
            {{ t('online_collection.preview_add_title_label') }}
          </div>
          <div class="mock-static-field rounded-lg pa-2 px-3 text-body-2 font-weight-medium">
            Maravilhas de Deus (Coral Jovem)
          </div>
        </div>

        <!-- Botões Ilustrativos -->
        <div class="d-flex align-center justify-end gap-2 pointer-events-none">
          <div class="mock-ui-btn-tonal rounded-lg pa-1 px-3 text-caption font-weight-bold">
            {{ $t('modules.custom_collection.cancel') }}
          </div>
          <div class="mock-ui-btn rounded-lg pa-1 px-4 text-caption font-weight-bold d-flex align-center">
            <v-icon icon="mdi-check" size="14" class="mr-1" />
            {{ $t('modules.custom_collection.save') }}
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Busca e Filtros -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-magnify" class="mr-2" size="22" />
      {{ t('online_collection.search_title') }}
    </h3>
    <p class="mb-4" v-html="t('online_collection.search_desc')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface ChannelVideo {
  id: string;
  title: string;
  duration: string;
}

interface OfficialChannel {
  id: string;
  name: string;
  genre: string;
  playlistsCount: number;
  icon: string;
  gradient: string;
  videos: ChannelVideo[];
}

export default defineComponent({
  name: "ManualOnlineCollection",
  data() {
    return {
      channelView: "channels" as "channels" | "videos",
      selectedChannelId: "ch1",
      customTab: "music" as "music" | "playlists",

      // Canais Oficiais de Vídeos Online
      officialChannels: [
        {
          id: "ch1",
          name: "Minha Vida É Uma Viagem",
          genre: "Infantil & Animações",
          playlistsCount: 8,
          icon: "mdi-airplane-takeoff",
          gradient: "linear-gradient(135deg, #0097d7 0%, #005b82 100%)",
          videos: [
            { id: "v1", title: "A Melhor Aventura", duration: "3:40" },
            { id: "v2", title: "Trem da Alegria", duration: "3:15" },
            { id: "v3", title: "O Amigo Mais Fiel", duration: "4:02" },
          ],
        },
        {
          id: "ch2",
          name: "MENOS UM",
          genre: "Playbacks & Acústicos",
          playlistsCount: 14,
          icon: "mdi-guitar-acoustic",
          gradient: "linear-gradient(135deg, #e91e63 0%, #880e4f 100%)",
          videos: [
            { id: "v4", title: "Descansar (Playback Oficial)", duration: "3:45" },
            { id: "v5", title: "Grandes Coisas (Acústico)", duration: "4:12" },
          ],
        },
        {
          id: "ch3",
          name: "Gravadora Novo Tempo",
          genre: "Clipes & Coletâneas",
          playlistsCount: 22,
          icon: "mdi-record-player",
          gradient: "linear-gradient(135deg, #ff9800 0%, #e65100 100%)",
          videos: [
            { id: "v6", title: "Vaso de Alabastro", duration: "4:30" },
            { id: "v7", title: "Ele Vive", duration: "5:10" },
          ],
        },
        {
          id: "ch4",
          name: "Cata Vento",
          genre: "Primários & Crianças",
          playlistsCount: 6,
          icon: "mdi-weather-windy",
          gradient: "linear-gradient(135deg, #4caf50 0%, #1b5e20 100%)",
          videos: [
            { id: "v8", title: "Brilha Jesus", duration: "3:25" },
          ],
        },
      ] as OfficialChannel[],

      // Vídeos Personalizados
      customVideos: [
        { id: "cv1", name: "Maravilhas de Deus - Coral Jovem", videoId: "dQw4w9WgXcQ" },
        { id: "cv2", name: "Hino da Vitória - Quarteto Arautos", videoId: "a1b2c3d4e5f" },
        { id: "cv3", name: "Oração Silenciosa - Instrumental", videoId: "9z8y7x6w5v4" },
      ],
      customAlbums: [
        { id: "ca1", name: "Culto Jovem 2026", count: 6, gradient: "linear-gradient(135deg, #00bcd4 0%, #006064 100%)" },
        { id: "ca2", name: "Especiais de Páscoa", count: 4, gradient: "linear-gradient(135deg, #9c27b0 0%, #4a148c 100%)" },
      ],
    };
  },
  computed: {
    activeChannel(): OfficialChannel {
      return this.officialChannels.find((c) => c.id === this.selectedChannelId) || this.officialChannels[0];
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
.manual-section {
  color: var(--sidebar-text);
  line-height: 1.6;
}

.manual-preview-card {
  background: var(--v-theme-surface, rgba(128, 128, 128, 0.05));
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.preview-inner-bg {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.12));
}

.mock-search-box {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.mock-ui-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mock-ui-btn-tonal {
  background: rgba(var(--v-theme-primary), 0.12);
  color: var(--v-theme-primary);
}

.mock-back-btn {
  background: rgba(128, 128, 128, 0.1);
  color: var(--sidebar-text);
}

/* Cards de Canais */
.mock-channel-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  min-height: 160px;
}

.mock-channel-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.mock-channel-card.card-active {
  border-color: var(--v-theme-primary);
}

.mock-channel-avatar {
  width: 48px;
  height: 48px;
}

/* Lista de Vídeos */
.mock-online-video-list {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
}

.mock-online-video-item {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.mock-online-video-item:last-child {
  border-bottom: none;
}

.mock-thumb-box {
  width: 64px;
  height: 36px;
  background: linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%);
  position: relative;
  flex-shrink: 0;
}

.mock-thumb-box.custom-thumb {
  background: linear-gradient(135deg, #c4302b 0%, #8b0000 100%);
}

.mock-play-overlay {
  opacity: 0.85;
}

.mock-live-chip {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.pulse-dot-red {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}

/* Pill Switch */
.mock-pill-switch {
  background: rgba(128, 128, 128, 0.12);
}

.mock-pill-btn {
  border: none;
  background: transparent;
  color: var(--sidebar-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mock-pill-btn.active {
  background: var(--card-bg, #ffffff);
  color: var(--v-theme-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Álbuns */
.mock-album-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.mock-album-cover {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

/* Diálogo Estático */
.mock-static-field {
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  background: var(--card-bg, #ffffff);
  color: var(--sidebar-text);
}

.bg-success-subtle {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.border-b-subtle {
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
}

.border-t-subtle {
  border-top: 1px solid rgba(128, 128, 128, 0.12);
}

.pointer-events-none {
  pointer-events: none;
}

.min-width-0 {
  min-width: 0;
}
</style>
