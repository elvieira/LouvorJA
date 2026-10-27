<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page online-collection-module d-flex flex-column">
      <!-- Cabeçalho Principal -->
      <ModuleHeader
        :title="headerTitle"
        :subtitle="headerSubtitle"
        :icon="headerIcon"
        :image="headerImage"
      >
        <template #prefix>
          <v-btn
            v-if="view !== 'channels'"
            icon
            variant="text"
            size="small"
            class="header-back-btn mr-3"
            @click="goBack"
          >
            <v-icon size="22">
              mdi-arrow-left
            </v-icon>
            <v-tooltip
              activator="parent"
              location="bottom"
              open-delay="250"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('back') }}
            </v-tooltip>
          </v-btn>
        </template>

        <!-- Ações no topo direito do Header -->
        <div class="header-actions-row d-flex align-center">
          <!-- Campo de Pesquisa -->
          <div class="search-bar">
            <v-text-field
              v-model="search"
              :placeholder="searchPlaceholder"
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              density="comfortable"
              hide-details
              rounded="xl"
            >
              <template #append-inner>
                <v-btn
                  v-if="search"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  class="clear-search-btn"
                  :title="t('clear_search')"
                  @click="search = ''"
                />
              </template>
            </v-text-field>
          </div>

          <!-- Alternador de visualização Grade / Lista (em Canais e Playlists) -->
          <div v-if="view !== 'videos' && !isGlobalSearch" class="view-mode-toggle d-flex align-center ml-3">
            <button
              type="button"
              class="view-toggle-btn"
              :class="{ active: viewMode === 'list' }"
              :title="t('view_list')"
              @click="setViewMode('list')"
            >
              <v-icon size="18">
                mdi-format-list-bulleted
              </v-icon>
            </button>
            <button
              type="button"
              class="view-toggle-btn"
              :class="{ active: viewMode === 'grid' }"
              :title="t('view_grid')"
              @click="setViewMode('grid')"
            >
              <v-icon size="18">
                mdi-view-grid
              </v-icon>
            </button>
          </div>
        </div>
      </ModuleHeader>

      <!-- Conteúdo Principal -->
      <div class="content-main flex-grow-1" style="overflow-y: auto; overflow-x: hidden;">
        <!-- ESTADO: Busca Global em Andamento -->
        <template v-if="isGlobalSearch">
          <div v-if="searchLoading" class="d-flex flex-column align-center justify-center py-16" style="height: 100%;">
            <v-progress-circular indeterminate color="primary" size="44" />
          </div>

          <!-- Busca Global sem resultados -->
          <div
            v-else-if="filteredGlobalChannels.length === 0 && searchResults.length === 0"
            class="d-flex flex-column align-center justify-center py-16"
            style="height: 100%;"
          >
            <v-icon
              size="56"
              color="grey-lighten-1"
              class="mb-3"
              style="opacity: 0.5;"
            >
              mdi-magnify
            </v-icon>
            <p
              class="text-center mb-4"
              style="color: var(--sidebar-text-secondary); max-width: 360px;"
            >
              {{ t('no_results') }}
            </p>
            <v-btn
              variant="text"
              color="primary"
              class="text-none"
              @click="search = ''"
            >
              {{ t('clear_search') }}
            </v-btn>
          </div>

          <!-- Resultados da Busca Global -->
          <div v-else class="search-results-container py-3">
            <!-- Canais que coincidem com a busca -->
            <div v-if="filteredGlobalChannels.length > 0" class="mb-6">
              <h4 class="section-subtitle-label px-6 mb-3">
                {{ t('channel_badge') }}
              </h4>
              <div v-if="viewMode === 'grid'" class="online-grid-wrap">
                <CollectionCard
                  v-for="item in filteredGlobalChannels"
                  :key="item.id"
                  :title="item.name"
                  :subtitle="t('channel_badge')"
                  :image="item.image"
                  @click="selectChannel(item)"
                />
              </div>
              <div v-else class="online-list-wrap px-4">
                <CollectionListRow
                  v-for="item in filteredGlobalChannels"
                  :key="item.id"
                  :title="item.name"
                  :subtitle="t('channel_badge')"
                  :image="item.image"
                  @click="selectChannel(item)"
                />
              </div>
            </div>

            <!-- Vídeos que coincidem com a busca -->
            <div v-if="searchResults.length > 0">
              <h4 class="section-subtitle-label px-6 mb-3">
                {{ t('videos_count', [searchResults.length]) }}
              </h4>
              <div class="online-list-wrap px-4">
                <OnlineVideoRow
                  v-for="(video, index) in searchResults"
                  :key="video.id"
                  :index="index + 1"
                  :video="video"
                  :subtitle="formatVideoSubtitle(video)"
                  :is-playing="currentPlayingVideoId === video.id"
                  @play="playVideo(video, formatVideoSubtitle(video))"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- ESTADO NORMAL: Navegação regular por Canais / Playlists / Vídeos -->
        <template v-else>
          <!-- Carregando (Skeletons) -->
          <div v-if="loading" class="py-4">
            <div v-if="viewMode === 'grid' && view !== 'videos'" class="online-grid-wrap">
              <div v-for="n in 8" :key="n" class="online-card-skeleton">
                <div class="skeleton-thumb-16-9" />
                <div class="pa-3">
                  <div class="skeleton-line-title mb-2" />
                  <div class="skeleton-line-sub" />
                </div>
              </div>
            </div>
            <div v-else class="online-list-wrap px-4">
              <div v-for="n in 8" :key="n" class="skeleton-row-item d-flex align-center py-2 px-3 mb-2">
                <div class="skeleton-row-thumb mr-4" />
                <div class="flex-grow-1">
                  <div class="skeleton-line-title mb-2" style="width: 60%;" />
                  <div class="skeleton-line-sub" style="width: 35%;" />
                </div>
              </div>
            </div>
          </div>

          <!-- Erro de Conexão -->
          <div v-else-if="error" class="d-flex flex-column align-center justify-center py-16" style="height: 100%;">
            <v-icon size="56" color="error" class="mb-3">
              mdi-alert-circle-outline
            </v-icon>
            <p class="mb-4 text-center" style="color: var(--sidebar-text-secondary); max-width: 380px;">
              {{ error }}
            </p>
            <v-btn
              color="primary"
              variant="tonal"
              rounded="lg"
              class="text-none font-weight-medium"
              @click="reload"
            >
              <v-icon start size="18">
                mdi-refresh
              </v-icon>
              {{ t('retry') }}
            </v-btn>
          </div>

          <!-- Nenhum item disponível -->
          <div
            v-else-if="currentItemsCount === 0"
            class="d-flex flex-column align-center justify-center py-16"
            style="height: 100%;"
          >
            <v-icon
              size="64"
              color="grey-lighten-1"
              class="mb-4"
              style="opacity: 0.5;"
            >
              mdi-youtube
            </v-icon>
            <p
              class="text-center"
              style="color: var(--sidebar-text-secondary); max-width: 360px;"
            >
              {{ emptyText }}
            </p>
          </div>

          <!-- TELA C: Lista de Vídeos -->
          <div v-else-if="view === 'videos'" class="online-list-wrap px-4 py-2">
            <OnlineVideoRow
              v-for="(video, index) in filteredVideos"
              :key="video.id"
              :index="index + 1"
              :video="video"
              :subtitle="selectedPlaylist?.name + (selectedChannel ? ' | ' + selectedChannel.name : '')"
              :is-playing="currentPlayingVideoId === video.id"
              @play="playVideo(video, selectedPlaylist?.name)"
            />
          </div>

          <!-- TELA B: Playlists do Canal (Grade / Lista) -->
          <template v-else-if="view === 'playlists'">
            <div v-if="viewMode === 'grid'" class="online-grid-wrap">
              <CollectionCard
                v-for="item in filteredPlaylists"
                :key="item.id"
                :title="item.name"
                :subtitle="selectedChannel?.name"
                :image="item.image"
                @click="selectPlaylist(item)"
              />
            </div>
            <div v-else class="online-list-wrap px-4 py-2">
              <CollectionListRow
                v-for="item in filteredPlaylists"
                :key="item.id"
                :title="item.name"
                :subtitle="selectedChannel?.name"
                :image="item.image"
                @click="selectPlaylist(item)"
              />
            </div>
          </template>

          <!-- TELA A: Catálogo de Canais (Grade / Lista) -->
          <template v-else>
            <div v-if="viewMode === 'grid'" class="online-grid-wrap">
              <CollectionCard
                v-for="item in filteredChannels"
                :key="item.id"
                :title="item.name"
                :subtitle="t('channel_badge')"
                :image="item.image"
                @click="selectChannel(item)"
              />
            </div>
            <div v-else class="online-list-wrap px-4 py-2">
              <CollectionListRow
                v-for="item in filteredChannels"
                :key="item.id"
                :title="item.name"
                :subtitle="t('channel_badge')"
                :image="item.image"
                @click="selectChannel(item)"
              />
            </div>
          </template>
        </template>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import CollectionCard from "./components/CollectionCard.vue";
import CollectionListRow from "./components/CollectionListRow.vue";
import OnlineVideoRow from "./components/OnlineVideoRow.vue";
import OnlineCollections, {
  OnlineChannel,
  OnlinePlaylist,
  OnlineVideo,
  SearchableOnlineVideo,
} from "@/helpers/services/OnlineCollections";

type OnlineView = "channels" | "playlists" | "videos";
type ViewMode = "grid" | "list";

export default defineComponent({
  name: "OnlineCollectionModule",
  components: {
    ModuleHeader,
    CollectionCard,
    CollectionListRow,
    OnlineVideoRow,
  },
  data() {
    return {
      view: "channels" as OnlineView,
      viewMode: (typeof localStorage !== "undefined" && localStorage.getItem("louvorja_online_view_mode") === "list" ? "list" : "grid") as ViewMode,
      channels: [] as OnlineChannel[],
      playlists: [] as OnlinePlaylist[],
      videos: [] as OnlineVideo[],
      selectedChannel: null as OnlineChannel | null,
      selectedPlaylist: null as OnlinePlaylist | null,
      loading: false,
      error: "",
      search: "",
      allVideos: [] as SearchableOnlineVideo[],
      allVideosLoaded: false,
      searchLoading: false,
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return (this as any).$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    headerTitle(): string {
      if (this.view === "playlists") return this.selectedChannel?.name || this.t("title");
      if (this.view === "videos") return this.selectedPlaylist?.name || this.t("title");
      return this.t("title");
    },
    headerSubtitle(): string {
      if (this.view === "channels") {
        return this.t("subtitle");
      }
      if (this.view === "playlists") {
        return this.t("playlists_count", [this.filteredPlaylists.length]);
      }
      return `${this.filteredVideos.length} vídeos • ${this.selectedChannel?.name || ""}`;
    },
    headerIcon(): string | undefined {
      if (this.view === "channels") return "mdi-web";
      return undefined;
    },
    headerImage(): string | undefined {
      if (this.view === "playlists") return this.selectedChannel?.image || undefined;
      if (this.view === "videos") return this.selectedPlaylist?.image || undefined;
      return undefined;
    },
    searchPlaceholder(): string {
      if (this.view === "playlists") return this.t("search_playlists");
      if (this.view === "videos") return this.t("search_videos");
      return this.t("search_channels");
    },
    isGlobalSearch(): boolean {
      return this.view === "channels" && (this.search || "").trim().length > 0;
    },
    filteredChannels(): OnlineChannel[] {
      const query = (this.search || "").trim().toLowerCase();
      if (query && this.view === "channels") {
        return this.channels.filter((c) => c.name.toLowerCase().includes(query));
      }
      return this.channels;
    },
    filteredGlobalChannels(): OnlineChannel[] {
      const query = (this.search || "").trim().toLowerCase();
      if (!query) return [];
      return this.channels.filter((c) => c.name.toLowerCase().includes(query));
    },
    filteredPlaylists(): OnlinePlaylist[] {
      const query = (this.search || "").trim().toLowerCase();
      if (query && this.view === "playlists") {
        return this.playlists.filter((p) => p.name.toLowerCase().includes(query));
      }
      return this.playlists;
    },
    filteredVideos(): OnlineVideo[] {
      let list = this.videos.slice();
      const query = (this.search || "").trim().toLowerCase();
      if (query && this.view === "videos") {
        list = list.filter((v) => v.name.toLowerCase().includes(query));
      }
      return list.sort((a, b) => a.position - b.position);
    },
    searchResults(): SearchableOnlineVideo[] {
      const query = (this.search || "").trim().toLowerCase();
      if (!query) return [];
      return this.allVideos.filter((video) =>
        video.name.toLowerCase().includes(query) ||
        (video.channelName && video.channelName.toLowerCase().includes(query)),
      );
    },
    currentItemsCount(): number {
      if (this.view === "channels") return this.filteredChannels.length;
      if (this.view === "playlists") return this.filteredPlaylists.length;
      return this.filteredVideos.length;
    },
    emptyText(): string {
      if (this.view === "channels") return this.t("empty_channels");
      if (this.view === "playlists") return this.t("empty_playlists");
      return this.t("empty_videos");
    },
    currentPlayingVideoId(): string {
      const path = (this as any).$appdata?.get?.("modules.external_media.filePath") || "";
      if (typeof path === "string" && path.startsWith("youtube:")) {
        return path.replace("youtube:", "");
      }
      return "";
    },
  },
  watch: {
    "module.show"(val: boolean) {
      if (val && this.channels.length === 0) {
        this.loadChannels();
      }
    },
    search(val: string) {
      if (this.view === "channels" && (val || "").trim() && !this.allVideosLoaded && !this.searchLoading) {
        this.loadAllVideosForSearch();
      }
    },
  },
  mounted() {
    if (this.module?.show && this.channels.length === 0) {
      this.loadChannels();
    }
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${this.module_id}.${text}`, params || []);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    locale(): string {
      return (this as any).$i18n?.locale || "pt";
    },
    setViewMode(mode: ViewMode) {
      this.viewMode = mode;
      try {
        localStorage.setItem("louvorja_online_view_mode", mode);
      } catch {
        // ignore
      }
    },
    formatVideoSubtitle(video: SearchableOnlineVideo): string {
      if (video.channelName && video.playlistName) {
        return `${video.playlistName} • ${video.channelName}`;
      }
      return video.channelName || video.playlistName || "";
    },
    async loadChannels() {
      this.loading = true;
      this.error = "";
      try {
        this.channels = await OnlineCollections.getChannels(this.locale());
      } catch {
        this.error = this.t("load_error");
      } finally {
        this.loading = false;
      }
    },
    async loadPlaylists(channel: OnlineChannel) {
      this.loading = true;
      this.error = "";
      try {
        this.playlists = await OnlineCollections.getPlaylists(channel.id, this.locale());
      } catch {
        this.error = this.t("load_error");
      } finally {
        this.loading = false;
      }
    },
    async loadVideos(playlist: OnlinePlaylist) {
      this.loading = true;
      this.error = "";
      try {
        this.videos = await OnlineCollections.getVideos(playlist.id, this.locale());
      } catch {
        this.error = this.t("load_error");
      } finally {
        this.loading = false;
      }
    },
    selectChannel(channel: OnlineChannel) {
      this.selectedChannel = channel;
      this.view = "playlists";
      this.search = "";
      this.loadPlaylists(channel);
    },
    selectPlaylist(playlist: OnlinePlaylist) {
      this.selectedPlaylist = playlist;
      this.view = "videos";
      this.search = "";
      this.loadVideos(playlist);
    },
    goBack() {
      this.search = "";
      if (this.view === "videos") {
        this.view = "playlists";
        this.videos = [];
        this.selectedPlaylist = null;
      } else if (this.view === "playlists") {
        this.view = "channels";
        this.playlists = [];
        this.selectedChannel = null;
      }
    },
    reload() {
      if (this.view === "channels") {
        this.loadChannels();
      } else if (this.view === "playlists" && this.selectedChannel) {
        this.loadPlaylists(this.selectedChannel);
      } else if (this.view === "videos" && this.selectedPlaylist) {
        this.loadVideos(this.selectedPlaylist);
      }
    },
    playVideo(video: OnlineVideo | SearchableOnlineVideo, subtitle?: string) {
      const appdata = (this as any).$appdata;
      appdata.set("modules.external_media.filePath", `youtube:${video.id}`);
      appdata.set("modules.external_media.title", video.name);
      appdata.set(
        "modules.external_media.subtitle",
        subtitle || (video as any).playlistName || this.selectedPlaylist?.name || this.selectedChannel?.name || this.t("title"),
      );
      appdata.set("modules.external_media.image", video.image);
      appdata.set("modules.external_media.minimized", false);
      appdata.set("modules.external_media.show", true);
      const currentVolume =
        appdata.get("modules.external_media.config.volume") ??
        ((this as any).$userdata?.get?.("modules.external_media.volume") ?? 100);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: currentVolume,
      });
    },
    async loadAllVideosForSearch() {
      this.searchLoading = true;
      try {
        const lang = this.locale();
        this.allVideos = await OnlineCollections.getAllVideos(lang);
        this.allVideosLoaded = true;
      } catch {
        // Silencioso se a indexação falhar
      } finally {
        this.searchLoading = false;
      }
    },
  },
});
</script>

<style lang="scss">
.online-collection-module {
  .header-back-btn {
    color: var(--sidebar-text-secondary) !important;
    transition: all 0.2s ease !important;

    &:hover {
      color: var(--sidebar-text) !important;
      background: var(--sidebar-hover) !important;
    }
  }

  .header-actions-row {
    flex-wrap: nowrap;
    gap: 12px;
    margin-left: 28px;
  }

  .search-bar {
    width: 320px;
    max-width: 100%;

    .v-field {
      background: var(--ds-surface, var(--card-bg, #1a2638)) !important;
      box-shadow: none !important;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border-radius: 26px !important;

      .v-field__input {
        padding: 9px 16px !important;
        font-size: 13.5px !important;
        color: var(--sidebar-text) !important;

        &::placeholder {
          color: var(--sidebar-text-secondary) !important;
          opacity: 0.8 !important;
        }
      }

      .v-field__prepend-inner {
        padding-left: 14px !important;

        .v-icon {
          color: var(--sidebar-text-secondary) !important;
          opacity: 0.85 !important;
        }
      }

      &:hover {
        border-color: rgba(0, 159, 227, 0.45) !important;
      }

      &.v-field--focused {
        border-color: var(--accent-blue, #009FE3) !important;
        box-shadow: 0 0 0 3px rgba(0, 159, 227, 0.15) !important;

        .v-field__prepend-inner .v-icon {
          color: var(--accent-blue, #009FE3) !important;
          opacity: 1 !important;
        }
      }
    }

    .clear-search-btn {
      color: var(--sidebar-text-secondary) !important;
      border-radius: 50% !important;

      &:hover {
        color: var(--sidebar-text) !important;
        background: rgba(0, 159, 227, 0.12) !important;
      }
    }
  }

  .view-mode-toggle {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    padding: 3px;
    gap: 3px;

    .view-toggle-btn {
      width: 32px;
      height: 32px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--sidebar-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--sidebar-text);
        background: rgba(255, 255, 255, 0.06);
      }

      &.active {
        background: var(--accent-blue, #009FE3);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 159, 227, 0.35);
      }
    }
  }

  .content-main {
    padding-top: 12px;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent-blue, #009FE3);
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: var(--accent-yellow, #FFC107);
    }
  }

  .online-grid-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 20px;
    padding: 8px 24px 32px 24px;
  }

  .online-list-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .section-subtitle-label {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--sidebar-text-secondary);
    margin: 0;
  }

  /* Skeletons */
  .online-card-skeleton {
    border-radius: 16px;
    background: var(--card-bg, #1a2638);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    overflow: hidden;

    .skeleton-thumb-16-9 {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 75%);
      background-size: 200% 100%;
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }

    .skeleton-line-title {
      height: 14px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      width: 80%;
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }

    .skeleton-line-sub {
      height: 11px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      width: 45%;
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }
  }

  .skeleton-row-item {
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));

    .skeleton-row-thumb {
      width: 110px;
      aspect-ratio: 16 / 9;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }

    .skeleton-line-title {
      height: 14px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }

    .skeleton-line-sub {
      height: 11px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }
  }
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Suporte ao Tema Claro */
:root[data-theme="light"],
.v-theme--light {
  .online-collection-module {
    .search-bar .v-field {
      background: #f1f5f9 !important;
      border-color: rgba(0, 0, 0, 0.1) !important;

      .v-field__input {
        color: #1e293b !important;
        &::placeholder {
          color: #64748b !important;
        }
      }

      .v-field__prepend-inner .v-icon {
        color: #64748b !important;
      }
    }

    .view-mode-toggle {
      background: #e2e8f0;
      border-color: rgba(0, 0, 0, 0.08);

      .view-toggle-btn {
        color: #64748b;

        &:hover {
          color: #1e293b;
          background: rgba(0, 0, 0, 0.04);
        }

        &.active {
          background: var(--accent-blue, #008FD0);
          color: #ffffff;
        }
      }
    }

    .online-card-skeleton {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.08);

      .skeleton-thumb-16-9 {
        background: #e2e8f0;
      }
      .skeleton-line-title {
        background: #cbd5e1;
      }
      .skeleton-line-sub {
        background: #e2e8f0;
      }
    }
  }
}
</style>
