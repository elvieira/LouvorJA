<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page personalized-videos-module d-flex flex-column">
      <ModuleHeader :title="headerTitle" icon="mdi-playlist-plus">
        <template #prefix>
          <v-btn
            v-if="tab === 'playlists' && selectedAlbum"
            icon
            variant="text"
            size="small"
            style="margin-right: 16px; color: var(--sidebar-text-secondary);"
            @click="selectedAlbum = null"
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

        <template #title-actions>
          <div v-if="!selectedAlbum" class="ml-6 d-flex align-center">
            <PillSwitch
              v-model="tab"
              :items="tabItems"
            />
          </div>
        </template>

        <div v-if="tab === 'music'" class="search-bar mr-4 d-flex align-center" style="max-width: 360px; flex: 1;">
          <v-text-field
            v-model="musicSearch"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            rounded="xl"
          >
            <template #append-inner>
              <v-btn
                v-if="musicSearch"
                icon="mdi-close"
                size="x-small"
                variant="text"
                class="clear-search-btn mr-1"
                title="Limpar pesquisa"
                @click="musicSearch = ''"
              />
            </template>
          </v-text-field>
        </div>
        <div v-else-if="!selectedAlbum" class="search-bar mr-4 d-flex align-center" style="max-width: 360px; flex: 1;">
          <v-text-field
            v-model="albumSearch"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            rounded="xl"
          >
            <template #append-inner>
              <v-btn
                v-if="albumSearch"
                icon="mdi-close"
                size="x-small"
                variant="text"
                class="clear-search-btn mr-1"
                title="Limpar pesquisa"
                @click="albumSearch = ''"
              />
            </template>
          </v-text-field>
        </div>

        <v-btn
          v-if="tab === 'music'"
          color="primary"
          variant="flat"
          rounded="lg"
          class="text-none font-weight-bold"
          @click="openAddDialog"
        >
          <v-icon start>
            mdi-plus
          </v-icon>
          {{ t('add_link') }}
        </v-btn>
        <v-btn
          v-else-if="!selectedAlbum"
          color="primary"
          variant="flat"
          rounded="lg"
          class="text-none font-weight-bold"
          @click="openAddAlbumDialog"
        >
          <v-icon start>
            mdi-plus
          </v-icon>
          {{ t('add_playlist') }}
        </v-btn>
      </ModuleHeader>

      <div class="content-main flex-grow-1" style="overflow-y: auto; overflow-x: hidden; padding-top: 16px;">
        <!-- Aba Música -->
        <template v-if="tab === 'music'">
          <div v-if="videos.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-youtube
            </v-icon>
            <h3 class="mb-2" style="color: var(--sidebar-text);">
              {{ t('empty_title') }}
            </h3>
            <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
              {{ t('empty_desc') }}
            </p>
          </div>

          <div v-else-if="filteredVideos.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-magnify
            </v-icon>
            <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
              {{ t('no_results') }}
            </p>
          </div>

          <div v-else class="personalized-list-wrap">
            <div
              v-for="(video, index) in filteredVideos"
              :key="video.id"
              class="personalized-list-item"
              @click="playVideo(video)"
            >
              <div class="personalized-list-number">
                {{ index + 1 }}
              </div>
              <div class="personalized-list-thumb">
                <img :src="thumbnailUrl(video.videoId)" loading="lazy" />
                <v-icon class="personalized-play-icon" size="20">
                  mdi-play-circle
                </v-icon>
              </div>
              <div class="personalized-list-title">
                {{ video.name }}
              </div>
              <v-menu location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    icon
                    variant="text"
                    size="small"
                    @click.stop
                  >
                    <v-icon size="18">
                      mdi-dots-vertical
                    </v-icon>
                  </v-btn>
                </template>
                <div class="search-filter-popover" style="min-width: 170px;">
                  <button type="button" class="filter-item" @click="openEditDialog(video)">
                    <span class="filter-label">{{ t('edit') }}</span>
                  </button>
                  <button type="button" class="filter-item" @click="copyLink(video)">
                    <span class="filter-label">{{ t('copy_link') }}</span>
                  </button>
                  <button type="button" class="filter-item" @click="openInBrowser(video)">
                    <span class="filter-label">{{ t('open_browser') }}</span>
                  </button>
                  <button type="button" class="filter-item text-error-item" @click="confirmDelete(video)">
                    <span class="filter-label text-error">{{ t('delete') }}</span>
                  </button>
                </div>
              </v-menu>
            </div>
          </div>
        </template>

        <!-- Aba Playlists -->
        <template v-else>
          <!-- Vídeos de um álbum selecionado -->
          <template v-if="selectedAlbum">
            <div v-if="selectedAlbum.videos.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
              <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
                {{ t('empty_videos') }}
              </p>
            </div>
            <div v-else class="personalized-list-wrap">
              <div
                v-for="(video, index) in selectedAlbum.videos"
                :key="video.videoId"
                class="personalized-list-item"
                @click="playAlbumVideo(video)"
              >
                <div class="personalized-list-number">
                  {{ index + 1 }}
                </div>
                <div class="personalized-list-thumb">
                  <img :src="thumbnailUrl(video.videoId)" loading="lazy" />
                  <v-icon class="personalized-play-icon" size="20">
                    mdi-play-circle
                  </v-icon>
                </div>
                <div class="personalized-list-title">
                  {{ video.name }}
                </div>
              </div>
            </div>
          </template>

          <!-- Grade de álbuns (playlists importadas) -->
          <template v-else-if="isSearchingAlbums">
            <div v-if="albumSearchResults.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-magnify
              </v-icon>
              <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
                {{ t('no_results') }}
              </p>
            </div>

            <div v-else class="personalized-list-wrap">
              <div
                v-for="(video, index) in albumSearchResults"
                :key="`${video.albumId}_${video.videoId}`"
                class="personalized-list-item"
                @click="playAlbumSearchVideo(video)"
              >
                <div class="personalized-list-number">
                  {{ index + 1 }}
                </div>
                <div class="personalized-list-thumb">
                  <img :src="thumbnailUrl(video.videoId)" loading="lazy" />
                  <v-icon class="personalized-play-icon" size="20">
                    mdi-play-circle
                  </v-icon>
                </div>
                <div class="personalized-list-title">
                  {{ video.name }}
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="albums.length === 0" class="d-flex flex-column align-center justify-center" style="height: 100%;">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-youtube
              </v-icon>
              <h3 class="mb-2" style="color: var(--sidebar-text);">
                {{ t('empty_albums_title') }}
              </h3>
              <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
                {{ t('empty_albums_desc') }}
              </p>
            </div>

            <div v-else class="personalized-grid-wrap">
              <div
                v-for="album in albums"
                :key="album.id"
                class="personalized-card"
              >
                <div class="personalized-card-image" @click="openAlbum(album)">
                  <img :src="album.coverImage" loading="lazy" />
                  <v-icon class="personalized-play-icon" size="40">
                    mdi-play-circle
                  </v-icon>
                  <div class="personalized-album-badge">
                    <v-icon size="14">
                      mdi-playlist-play
                    </v-icon>
                    {{ album.videos.length }}
                  </div>
                </div>
                <div class="personalized-card-footer d-flex align-center">
                  <div class="personalized-card-title flex-grow-1" @click="openAlbum(album)">
                    {{ album.name }}
                  </div>
                  <v-menu location="bottom end">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        v-bind="menuProps"
                        icon
                        variant="text"
                        size="small"
                        @click.stop
                      >
                        <v-icon size="18">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <div class="search-filter-popover" style="min-width: 170px;">
                      <button type="button" class="filter-item" @click="copyAlbumLink(album)">
                        <span class="filter-label">{{ t('copy_link') }}</span>
                      </button>
                      <button type="button" class="filter-item" @click="openAlbumInBrowser(album)">
                        <span class="filter-label">{{ t('open_browser') }}</span>
                      </button>
                      <button type="button" class="filter-item text-error-item" @click="confirmDeleteAlbum(album)">
                        <span class="filter-label text-error">{{ t('delete') }}</span>
                      </button>
                    </div>
                  </v-menu>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <v-dialog v-model="showAddDialog" max-width="440" persistent>
        <v-card
          class="rounded-xl pa-2"
          :color="isDark ? 'var(--card-bg)' : '#ffffff'"
          :theme="isDark ? 'dark' : 'light'"
        >
          <v-card-title class="font-weight-bold">
            {{ editingVideo ? t('edit') : t('add_link') }}
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('video_name') }}
              </div>
              <v-text-field
                v-model="nameInput"
                :placeholder="t('video_name_placeholder')"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                hide-details
                class="modern-input-compact"
                autofocus
                @keydown.enter="submitVideo"
              />
            </div>
            <div>
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('video_link') }}
              </div>
              <v-text-field
                v-model="linkInput"
                :placeholder="t('video_link_placeholder')"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                hide-details
                class="modern-input-compact"
                @keydown.enter="submitVideo"
                @blur="fetchVideoTitle"
                @paste="onLinkPaste"
              />
            </div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <div class="d-flex" style="gap: 12px;">
              <v-btn
                variant="tonal"
                :color="isDark ? 'white' : 'grey-darken-2'"
                class="rounded-lg text-none px-6 font-weight-bold"
                @click="closeAddDialog"
              >
                {{ t('cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="rounded-lg text-none px-6 font-weight-bold"
                :disabled="!nameInput.trim() || !linkInput.trim()"
                @click="submitVideo"
              >
                {{ editingVideo ? t('save') : t('add_link') }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showAddAlbumDialog" max-width="440" persistent>
        <v-card
          class="rounded-xl pa-2"
          :color="isDark ? 'var(--card-bg)' : '#ffffff'"
          :theme="isDark ? 'dark' : 'light'"
        >
          <v-card-title class="font-weight-bold">
            {{ t('add_playlist') }}
          </v-card-title>
          <v-card-text>
            <div>
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('playlist_link') }}
              </div>
              <v-text-field
                v-model="albumLinkInput"
                :placeholder="t('playlist_link_placeholder')"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                hide-details
                class="modern-input-compact"
                autofocus
                :disabled="albumLoading"
                @keydown.enter="submitAlbum"
              />
            </div>
            <p v-if="albumError" class="mt-3 mb-0 text-error" style="font-size: 13px;">
              {{ albumError }}
            </p>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <div class="d-flex" style="gap: 12px;">
              <v-btn
                variant="tonal"
                :color="isDark ? 'white' : 'grey-darken-2'"
                class="rounded-lg text-none px-6 font-weight-bold"
                :disabled="albumLoading"
                @click="closeAddAlbumDialog"
              >
                {{ t('cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="rounded-lg text-none px-6 font-weight-bold"
                :loading="albumLoading"
                :disabled="!albumLinkInput.trim() || albumLoading"
                @click="submitAlbum"
              >
                {{ t('add_playlist') }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import PillSwitch, { PillSwitchItem } from "@/components/inputs/PillSwitch.vue";
import $snackbar from "@/helpers/ui/Snackbar";

interface PersonalizedVideo {
  id: string;
  name: string;
  videoId: string;
}

interface PlaylistVideo {
  videoId: string;
  name: string;
}

interface PersonalizedAlbum {
  id: string;
  name: string;
  playlistId: string;
  coverImage: string;
  videos: PlaylistVideo[];
}

interface AlbumSearchResult extends PlaylistVideo {
  albumId: string;
  albumName: string;
}

type PersonalizedTab = "music" | "playlists";

function extractVideoId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/(?:v=|\/videos\/|embed\/|youtu\.be\/|\/v\/|shorts\/)([a-zA-Z0-9_-]{6,})/);
  if (match) return match[1];
  // Não parece uma URL: assume que já é o ID puro do vídeo.
  return trimmed;
}

function extractPlaylistId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Não parece uma URL: assume que já é o ID puro da playlist.
  return trimmed;
}

export default defineComponent({
  name: "PersonalizedVideosModule",
  components: {
    ModuleHeader,
    PillSwitch,
  },
  data() {
    return {
      tab: "music" as PersonalizedTab,

      nameInput: "",
      linkInput: "",
      showAddDialog: false,
      editingVideo: null as PersonalizedVideo | null,
      videos: [] as PersonalizedVideo[],

      albums: [] as PersonalizedAlbum[],
      showAddAlbumDialog: false,
      albumLinkInput: "",
      albumLoading: false,
      albumError: "",
      selectedAlbum: null as PersonalizedAlbum | null,

      musicSearch: "",
      albumSearch: "",
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

    isDark(): boolean {
      return (this as any).$vuetify.theme.current.dark;
    },
    headerTitle(): string {
      if (this.tab === "playlists" && this.selectedAlbum) return this.selectedAlbum.name;
      return this.t("title");
    },
    tabItems(): PillSwitchItem[] {
      return [
        { value: "music", label: this.t("tab_music"), icon: "mdi-music-note" },
        { value: "playlists", label: this.t("tab_playlists"), icon: "mdi-playlist-play" },
      ];
    },
    filteredVideos(): PersonalizedVideo[] {
      const query = (this.musicSearch || "").trim().toLowerCase();
      if (!query) return this.videos;
      return this.videos.filter((video) => video.name.toLowerCase().includes(query));
    },
    isSearchingAlbums(): boolean {
      return this.tab === "playlists" && !this.selectedAlbum && (this.albumSearch || "").trim().length > 0;
    },
    albumSearchResults(): AlbumSearchResult[] {
      const query = (this.albumSearch || "").trim().toLowerCase();
      if (!query) return [];
      const results: AlbumSearchResult[] = [];
      for (const album of this.albums) {
        for (const video of album.videos) {
          if (video.name.toLowerCase().includes(query)) {
            results.push({ ...video, albumId: album.id, albumName: album.name });
          }
        }
      }
      return results;
    },
  },
  watch: {
    "module.show"(val: boolean) {
      if (val) {
        this.loadVideos();
        this.loadAlbums();
      }
    },
  },
  mounted() {
    if (this.module?.show) {
      this.loadVideos();
      this.loadAlbums();
    }
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${this.module_id}.${text}`, params || []);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    loadVideos() {
      this.videos = (this as any).$userdata.get("modules.personalized_videos.list") || [];
    },
    saveVideos() {
      (this as any).$userdata.set("modules.personalized_videos.list", this.videos);
    },
    loadAlbums() {
      this.albums = (this as any).$userdata.get("modules.personalized_videos.albums") || [];
    },
    saveAlbums() {
      (this as any).$userdata.set("modules.personalized_videos.albums", this.albums);
    },
    thumbnailUrl(videoId: string): string {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    },
    openAddDialog() {
      this.editingVideo = null;
      this.nameInput = "";
      this.linkInput = "";
      this.showAddDialog = true;
      this.fillLinkFromClipboard();
    },
    async fillLinkFromClipboard() {
      try {
        const text = (await navigator.clipboard?.readText())?.trim();
        if (!text || !/youtube\.com|youtu\.be/i.test(text)) return;
        this.linkInput = text;
        await this.fetchVideoTitle();
      } catch {
        // Sem permissão de leitura da área de transferência: usuário cola manualmente.
      }
    },
    openEditDialog(video: PersonalizedVideo) {
      this.editingVideo = video;
      this.nameInput = video.name;
      this.linkInput = video.videoId;
      this.showAddDialog = true;
    },
    closeAddDialog() {
      this.showAddDialog = false;
      this.editingVideo = null;
    },
    onLinkPaste(event: ClipboardEvent) {
      const pasted = (event.clipboardData?.getData("text") || "").trim();
      if (!pasted) return;
      // Assume o controle da colagem pra já disparar a busca do título sem
      // precisar esperar o usuário sair do campo (clicar em outro lugar).
      event.preventDefault();
      this.linkInput = pasted;
      this.$nextTick(() => {
        this.fetchVideoTitle();
      });
    },
    async fetchVideoTitle() {
      // Só busca automaticamente se o usuário ainda não digitou um nome.
      if (this.nameInput.trim()) return;
      const link = this.linkInput.trim();
      if (!link) return;
      const videoId = extractVideoId(link);
      if (!videoId) return;
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
        const response = await fetch(oembedUrl);
        if (!response.ok) return;
        const data = await response.json();
        if (data?.title && !this.nameInput.trim()) {
          this.nameInput = data.title;
        }
      } catch {
        // Sem internet ou vídeo inválido: usuário digita o nome manualmente.
      }
    },
    submitVideo() {
      const name = this.nameInput.trim();
      const link = this.linkInput.trim();
      if (!name) {
        (this as any).$alert.error({ text: this.t("name_required"), translate: false });
        return;
      }
      if (!link) {
        (this as any).$alert.error({ text: this.t("link_required"), translate: false });
        return;
      }
      const videoId = extractVideoId(link);
      const duplicate = this.videos.some((v) => v.videoId === videoId && v.id !== this.editingVideo?.id);
      if (duplicate) {
        (this as any).$alert.error({ text: this.t("duplicate_video"), translate: false });
        return;
      }
      if (this.editingVideo) {
        this.editingVideo.name = name;
        this.editingVideo.videoId = videoId;
      } else {
        this.videos.push({ id: crypto.randomUUID(), name, videoId });
      }
      this.saveVideos();
      this.showAddDialog = false;
      this.editingVideo = null;
    },
    confirmDelete(video: PersonalizedVideo) {
      (this as any).$alert.yesno({
        title: this.t("delete_title"),
        text: this.t("delete_text"),
        translate: false,
      }, (btn: any) => {
        if (btn === "yes") {
          this.videos = this.videos.filter((v) => v.id !== video.id);
          this.saveVideos();
        }
      });
    },
    copyLink(video: PersonalizedVideo) {
      const url = `https://www.youtube.com/watch?v=${video.videoId}`;
      navigator.clipboard?.writeText(url).then(() => {
        $snackbar.show({ text: this.t("link_copied"), color: "success" });
      }).catch(() => { /* ignore */ });
    },
    openInBrowser(video: PersonalizedVideo) {
      const url = `https://www.youtube.com/watch?v=${video.videoId}`;
      if ((window as any).electronAPI?.openExternal) {
        (window as any).electronAPI.openExternal(url);
      } else {
        window.open(url, "_blank");
      }
    },
    playVideo(video: PersonalizedVideo) {
      const appdata = (this as any).$appdata;
      appdata.set("modules.external_media.filePath", `youtube:${video.videoId}`);
      appdata.set("modules.external_media.title", video.name);
      appdata.set("modules.external_media.subtitle", this.t("title"));
      appdata.set("modules.external_media.image", this.thumbnailUrl(video.videoId));
      appdata.set("modules.external_media.minimized", false);
      appdata.set("modules.external_media.show", true);
      const currentVolume = appdata.get("modules.external_media.config.volume") ?? ((this as any).$userdata?.get?.("modules.external_media.volume") ?? 100);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: currentVolume,
      });
    },

    openAddAlbumDialog() {
      this.albumLinkInput = "";
      this.albumError = "";
      this.showAddAlbumDialog = true;
      this.fillAlbumLinkFromClipboard();
    },
    async fillAlbumLinkFromClipboard() {
      try {
        const text = (await navigator.clipboard?.readText())?.trim();
        if (!text || !/list=/i.test(text)) return;
        this.albumLinkInput = text;
      } catch {
        // Sem permissão de leitura da área de transferência: usuário cola manualmente.
      }
    },
    closeAddAlbumDialog() {
      if (this.albumLoading) return;
      this.showAddAlbumDialog = false;
    },
    async submitAlbum() {
      const link = this.albumLinkInput.trim();
      if (!link) return;
      const playlistId = extractPlaylistId(link);
      const duplicate = this.albums.some((a) => a.playlistId === playlistId);
      if (duplicate) {
        this.albumError = this.t("duplicate_playlist");
        return;
      }
      if (!(window as any).electronAPI?.fetchYoutubePlaylist) {
        this.albumError = this.t("playlist_desktop_only");
        return;
      }
      this.albumLoading = true;
      this.albumError = "";
      try {
        const result = await (window as any).electronAPI.fetchYoutubePlaylist(playlistId);
        if (!result || !result.videos || result.videos.length === 0) {
          this.albumError = this.t("playlist_fetch_error");
          return;
        }
        const album: PersonalizedAlbum = {
          id: crypto.randomUUID(),
          name: result.title || this.t("title"),
          playlistId: result.playlistId,
          coverImage: this.thumbnailUrl(result.videos[0].videoId),
          videos: result.videos.map((v: { videoId: string; title: string }) => ({ videoId: v.videoId, name: v.title })),
        };
        this.albums.push(album);
        this.saveAlbums();
        this.showAddAlbumDialog = false;
      } catch {
        this.albumError = this.t("playlist_fetch_error");
      } finally {
        this.albumLoading = false;
      }
    },
    openAlbum(album: PersonalizedAlbum) {
      this.selectedAlbum = album;
      this.albumSearch = "";
    },
    confirmDeleteAlbum(album: PersonalizedAlbum) {
      (this as any).$alert.yesno({
        title: this.t("delete_album_title"),
        text: this.t("delete_album_text"),
        translate: false,
      }, (btn: any) => {
        if (btn === "yes") {
          this.albums = this.albums.filter((a) => a.id !== album.id);
          this.saveAlbums();
          if (this.selectedAlbum?.id === album.id) this.selectedAlbum = null;
        }
      });
    },
    copyAlbumLink(album: PersonalizedAlbum) {
      const url = `https://www.youtube.com/playlist?list=${album.playlistId}`;
      navigator.clipboard?.writeText(url).then(() => {
        $snackbar.show({ text: this.t("link_copied"), color: "success" });
      }).catch(() => { /* ignore */ });
    },
    openAlbumInBrowser(album: PersonalizedAlbum) {
      const url = `https://www.youtube.com/playlist?list=${album.playlistId}`;
      if ((window as any).electronAPI?.openExternal) {
        (window as any).electronAPI.openExternal(url);
      } else {
        window.open(url, "_blank");
      }
    },
    playAlbumVideo(video: PlaylistVideo) {
      if (!this.selectedAlbum) return;
      const appdata = (this as any).$appdata;
      appdata.set("modules.external_media.filePath", `youtube:${video.videoId}`);
      appdata.set("modules.external_media.title", video.name);
      appdata.set("modules.external_media.subtitle", this.selectedAlbum.name);
      appdata.set("modules.external_media.image", this.thumbnailUrl(video.videoId));
      appdata.set("modules.external_media.minimized", false);
      appdata.set("modules.external_media.show", true);
      const currentVolume1 = appdata.get("modules.external_media.config.volume") ?? ((this as any).$userdata?.get?.("modules.external_media.volume") ?? 100);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: currentVolume1,
      });
    },
    playAlbumSearchVideo(video: AlbumSearchResult) {
      const appdata = (this as any).$appdata;
      appdata.set("modules.external_media.filePath", `youtube:${video.videoId}`);
      appdata.set("modules.external_media.title", video.name);
      appdata.set("modules.external_media.subtitle", video.albumName);
      appdata.set("modules.external_media.image", this.thumbnailUrl(video.videoId));
      appdata.set("modules.external_media.minimized", false);
      appdata.set("modules.external_media.show", true);
      const currentVolume2 = appdata.get("modules.external_media.config.volume") ?? ((this as any).$userdata?.get?.("modules.external_media.volume") ?? 100);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: currentVolume2,
      });
    },
  },
});
</script>

<style lang="scss">
.personalized-videos-module {
  .search-header {
    position: relative;
  }

  .search-bar {
    .v-field {
      background: var(--ds-surface, var(--card-bg)) !important;
      box-shadow: none !important;
      border: 1px solid var(--ds-border, #43495b) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border-radius: 26px !important;
      
      .v-field__input {
        padding: 10px 16px !important;
        font-size: 14px !important;
        color: var(--ds-text-primary, var(--sidebar-text)) !important;

        &::placeholder {
          color: var(--ds-text-secondary, var(--sidebar-text-secondary)) !important;
          opacity: 0.8 !important;
        }
      }
      
      .v-field__prepend-inner {
        padding-left: 16px !important;
        
        .v-icon {
          color: var(--ds-text-secondary, #a0a6b5) !important;
          opacity: 0.9 !important;
          transition: color 0.2s ease !important;
        }
      }
      
      &:hover {
        border-color: rgba(0, 155, 226, 0.45) !important;
      }
      
      &.v-field--focused {
        border-color: var(--ds-accent, #009be2) !important;
        background: var(--ds-surface, var(--card-bg)) !important;
        box-shadow: 0 0 0 3px rgba(0, 155, 226, 0.15) !important;

        .v-field__prepend-inner .v-icon {
          color: var(--ds-accent, #009be2) !important;
          opacity: 1 !important;
        }
      }
    }

    .clear-search-btn {
      color: var(--ds-text-secondary, #a0a6b5) !important;
      border-radius: 50% !important;
      transition: all 0.15s ease !important;

      &:hover {
        color: var(--ds-text-primary, #f7f8fc) !important;
        background: var(--ds-accent-hover, rgba(0, 155, 226, 0.1)) !important;
      }
    }

    .filter-search-btn {
      color: var(--ds-text-secondary, #a0a6b5) !important;
      border-radius: 50% !important;
      transition: all 0.15s ease !important;

      &:hover, &.filter-active {
        color: var(--ds-accent, #009be2) !important;
        background: var(--ds-accent-hover, rgba(0, 155, 226, 0.1)) !important;
      }
    }
  }

  .content-main {
    /* Scrollbar oficial do Louvor JA */
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



  .personalized-grid-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
    padding: 8px 16px 24px 16px;
  }

  .personalized-card {
    width: 100%;
    min-width: 0;
    background: var(--ds-surface, #232733);
    border: 1px solid var(--ds-border, #43495b);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s cubic-bezier(0.2, 0, 0, 1), border-color 0.25s ease;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
      border-color: var(--ds-accent, #009FE3);

      .personalized-card-image img {
        transform: scale(1.04);
      }

      .personalized-play-icon {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    .personalized-card-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: linear-gradient(135deg, var(--accent-blue, #009FE3) 0%, var(--accent-blue-dark, #0077b6) 100%);
      position: relative;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.35s ease;
      }

      .personalized-play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1);
        color: white;
        opacity: 0;
        transition: all 0.25s ease;
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
      }

      .personalized-album-badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        display: flex;
        align-items: center;
        gap: 3px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(6px);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
      }
    }

    .personalized-card-footer {
      padding: 14px 14px 14px 16px;

      .personalized-card-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--sidebar-text);
        line-height: 1.3;
        cursor: pointer;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .personalized-list-wrap {
    display: flex;
    flex-direction: column;
    padding: 0;
    width: 100%;
  }

  .personalized-list-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: transparent;
    border-bottom: 1px solid var(--border-color);
    box-shadow: none;
    transition: var(--transition);
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--sidebar-hover) !important;

      .personalized-list-thumb img {
        transform: scale(1.04);
      }

      .personalized-play-icon {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    .personalized-list-number {
      font-size: 15px;
      font-weight: 700;
      line-height: 1;
      color: var(--accent-blue, #009FE3);
      min-width: 44px;
      width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-right: 14px;
      flex-shrink: 0;
    }

    .personalized-list-thumb {
      position: relative;
      flex-shrink: 0;
      width: 104px;
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, var(--accent-blue, #009FE3) 0%, var(--accent-blue-dark, #0077b6) 100%);
      border-radius: 8px;
      overflow: hidden;
      margin-right: 14px;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.25s ease;
      }

      .personalized-play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1);
        color: white;
        opacity: 0;
        transition: all 0.25s ease;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
      }
    }

    .personalized-list-title {
      flex: 1;
      min-width: 0;
      font-size: 15px;
      font-weight: 500;
      color: var(--sidebar-text);
      line-height: 1.3;
      cursor: pointer;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

.search-filter-popover {
  background: var(--ds-surface, #232733) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  padding: 8px !important;
  min-width: 170px;
  backdrop-filter: blur(12px);

  .filter-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--sidebar-text, #E1E7EF);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;

    &:hover {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
      color: var(--ds-accent, #009be2);
    }

    &.text-error-item:hover {
      background: rgba(244, 67, 54, 0.1) !important;
      color: #F44336 !important;
    }
  }
}

// Suporte ao tema claro
:root[data-theme="light"],
.v-theme--light {
  .personalized-videos-module {


    .personalized-card {
      background: #FFFFFF;
      border-color: var(--ds-border, #DEE4EC);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .personalized-card-title {
        color: var(--ds-text-primary, #30333A);
      }

      &:hover {
        border-color: var(--ds-accent, #008FD0);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
    }

    .personalized-list-item {
      border-bottom-color: rgba(0, 0, 0, 0.06);

      &:hover {
        background: rgba(0, 155, 226, 0.06) !important;
      }

      .personalized-list-title {
        color: var(--ds-text-primary, #30333A);
      }
    }
  }

  .search-filter-popover {
    background: #FFFFFF !important;
    border: 1px solid var(--ds-border, #E2E8F0) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;

    .filter-item {
      color: var(--ds-text-primary, #334155);

      &:hover {
        background: rgba(0, 155, 226, 0.08);
        color: var(--ds-accent, #008fd0);
      }

      &.text-error-item:hover {
        background: rgba(244, 67, 54, 0.08) !important;
        color: #E53935 !important;
      }
    }
  }
}
</style>
