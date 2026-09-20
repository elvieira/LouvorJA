<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page online-collection-module d-flex flex-column">
      <ModuleHeader :title="headerTitle" icon="mdi-youtube">
        <template #prefix>
          <v-btn
            v-if="view !== 'channels'"
            icon
            variant="text"
            size="small"
            style="margin-right: 16px; color: var(--sidebar-text-secondary);"
            @click="goBack"
          >
            <v-icon>mdi-arrow-left</v-icon>
            <v-tooltip
              activator="parent"
              location="bottom"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('back') }}
            </v-tooltip>
          </v-btn>
        </template>

        <div v-if="view === 'channels'" class="search-bar ml-4 d-flex align-center" style="max-width: 420px; flex: 1;">
          <v-text-field
            v-model="search"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
          />
        </div>
      </ModuleHeader>

      <div class="content-main flex-grow-1" style="overflow-y: auto; padding: 20px 24px;">
        <template v-if="isSearching">
          <div v-if="searchLoading" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-progress-circular indeterminate color="primary" size="48" />
          </div>

          <div v-else-if="searchResults.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-magnify
            </v-icon>
            <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
              {{ t('no_results') }}
            </p>
          </div>

          <div v-else class="online-grid-wrap">
            <div
              v-for="video in searchResults"
              :key="video.id"
              class="online-card"
              @click="playVideo(video, video.channelName)"
            >
              <div class="online-card-image">
                <img :src="video.image" loading="lazy" />
                <v-icon class="online-play-icon" size="40">
                  mdi-play-circle
                </v-icon>
              </div>
              <div class="online-card-title">
                {{ video.name }}
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="loading" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-progress-circular indeterminate color="primary" size="48" />
          </div>

          <div v-else-if="error" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-icon size="48" color="error" class="mb-3">
              mdi-alert-circle-outline
            </v-icon>
            <p class="mb-4 text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
              {{ error }}
            </p>
            <v-btn
              color="primary"
              variant="tonal"
              class="text-none"
              @click="reload"
            >
              {{ t('retry') }}
            </v-btn>
          </div>

          <div v-else-if="currentItems.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-youtube
            </v-icon>
            <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
              {{ emptyText }}
            </p>
          </div>

          <div v-else class="online-grid-wrap">
            <div
              v-for="item in currentItems"
              :key="item.id"
              class="online-card"
              @click="selectItem(item)"
            >
              <div class="online-card-image">
                <img :src="item.image" loading="lazy" />
                <v-icon v-if="view === 'videos'" class="online-play-icon" size="40">
                  mdi-play-circle
                </v-icon>
              </div>
              <div class="online-card-title">
                {{ item.name }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import OnlineCollections, { OnlineChannel, OnlinePlaylist, OnlineVideo } from "@/helpers/services/OnlineCollections";

type OnlineView = "channels" | "playlists" | "videos";
type OnlineItem = OnlineChannel | OnlinePlaylist | OnlineVideo;
interface SearchableVideo extends OnlineVideo {
  channelName: string;
}

export default defineComponent({
  name: "OnlineCollectionModule",
  components: {
    ModuleHeader,
  },
  data() {
    return {
      view: "channels" as OnlineView,
      channels: [] as OnlineChannel[],
      playlists: [] as OnlinePlaylist[],
      videos: [] as OnlineVideo[],
      selectedChannel: null as OnlineChannel | null,
      selectedPlaylist: null as OnlinePlaylist | null,
      loading: false,
      error: "",
      search: "",
      allVideos: [] as SearchableVideo[],
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
    currentItems(): OnlineItem[] {
      if (this.view === "channels") return this.channels;
      if (this.view === "playlists") return this.playlists;
      return this.videos;
    },
    isSearching(): boolean {
      return this.view === "channels" && (this.search || "").trim().length > 0;
    },
    searchResults(): SearchableVideo[] {
      const query = (this.search || "").trim().toLowerCase();
      if (!query) return [];
      return this.allVideos.filter((video) => video.name.toLowerCase().includes(query));
    },
    emptyText(): string {
      if (this.view === "channels") return this.t("empty_channels");
      if (this.view === "playlists") return this.t("empty_playlists");
      return this.t("empty_videos");
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
    selectItem(item: OnlineItem) {
      if (this.view === "channels") {
        this.selectedChannel = item as OnlineChannel;
        this.view = "playlists";
        this.search = "";
        this.loadPlaylists(item as OnlineChannel);
      } else if (this.view === "playlists") {
        this.selectedPlaylist = item as OnlinePlaylist;
        this.view = "videos";
        this.search = "";
        this.loadVideos(item as OnlinePlaylist);
      } else {
        this.playVideo(item as OnlineVideo);
      }
    },
    goBack() {
      this.search = "";
      if (this.view === "videos") {
        this.view = "playlists";
        this.videos = [];
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
    playVideo(video: OnlineVideo, subtitle?: string) {
      const appdata = (this as any).$appdata;
      appdata.set("modules.external_media.filePath", `youtube:${video.id}`);
      appdata.set("modules.external_media.title", video.name);
      appdata.set("modules.external_media.subtitle", subtitle || this.selectedChannel?.name || this.t("title"));
      appdata.set("modules.external_media.image", video.image);
      appdata.set("modules.external_media.minimized", false);
      appdata.set("modules.external_media.show", true);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
      });
    },
    async loadAllVideosForSearch() {
      this.searchLoading = true;
      try {
        const lang = this.locale();
        const channels = this.channels.length > 0 ? this.channels : await OnlineCollections.getChannels(lang);
        const allVideos: SearchableVideo[] = [];
        for (const channel of channels) {
          const playlists = await OnlineCollections.getPlaylists(channel.id, lang);
          for (const playlist of playlists) {
            const videos = await OnlineCollections.getVideos(playlist.id, lang);
            for (const video of videos) {
              allVideos.push({ ...video, channelName: channel.name });
            }
          }
        }
        this.allVideos = allVideos;
        this.allVideosLoaded = true;
      } catch {
        // Silencioso: se a busca completa falhar, simplesmente não há resultados.
      } finally {
        this.searchLoading = false;
      }
    },
  },
});
</script>

<style lang="scss">
.online-collection-module {
  .online-grid-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
  }

  .online-card {
    width: 100%;
    min-width: 0;
    background: var(--card-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    transition: var(--transition);
    cursor: pointer;
    overflow: hidden;

    &:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);

      .online-play-icon {
        opacity: 1;
      }
    }

    .online-card-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
      position: relative;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .online-play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        opacity: 0;
        transition: opacity 0.2s ease;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
      }
    }

    .online-card-title {
      padding: 12px 14px;
      font-size: 14px;
      font-weight: 600;
      color: var(--sidebar-text);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}
</style>
