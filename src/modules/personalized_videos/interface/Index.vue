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
          </v-btn>
        </template>

        <div v-if="!selectedAlbum" class="personalized-tabs-pill-center">
          <div class="personalized-tabs-pill d-flex align-center flex-shrink-0">
            <div class="personalized-tab-slider" :style="tabSliderStyle" />
            <button
              ref="musicTabBtn"
              type="button"
              class="personalized-tab-btn"
              :class="{ active: tab === 'music' }"
              @click="tab = 'music'"
            >
              <v-icon icon="mdi-music-note" size="16" class="mr-1" />
              {{ t('tab_music') }}
            </button>
            <button
              ref="playlistsTabBtn"
              type="button"
              class="personalized-tab-btn"
              :class="{ active: tab === 'playlists' }"
              @click="tab = 'playlists'"
            >
              <v-icon icon="mdi-playlist-play" size="16" class="mr-1" />
              {{ t('tab_playlists') }}
            </button>
          </div>
        </div>

        <div v-if="tab === 'music'" class="search-bar mr-4 d-flex align-center" style="max-width: 260px; flex: 1;">
          <v-text-field
            v-model="musicSearch"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
          />
        </div>
        <div v-else-if="!selectedAlbum" class="search-bar mr-4 d-flex align-center" style="max-width: 260px; flex: 1;">
          <v-text-field
            v-model="albumSearch"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
          />
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

      <div class="content-main flex-grow-1" style="overflow-y: auto; padding: 20px 24px;">
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

          <div v-else class="personalized-grid-wrap">
            <div
              v-for="video in filteredVideos"
              :key="video.id"
              class="personalized-card"
            >
              <div class="personalized-card-image" @click="playVideo(video)">
                <img :src="thumbnailUrl(video.videoId)" loading="lazy" />
                <v-icon class="personalized-play-icon" size="40">
                  mdi-play-circle
                </v-icon>
              </div>
              <div class="personalized-card-footer d-flex align-center">
                <div class="personalized-card-title flex-grow-1" @click="playVideo(video)">
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
                  <v-list density="compact" rounded="lg" class="py-1">
                    <v-list-item @click="openEditDialog(video)">
                      <template #prepend>
                        <v-icon size="18">
                          mdi-pencil-outline
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ t('edit') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyLink(video)">
                      <template #prepend>
                        <v-icon size="18">
                          mdi-content-copy
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ t('copy_link') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openInBrowser(video)">
                      <template #prepend>
                        <v-icon size="18">
                          mdi-open-in-new
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ t('open_browser') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="confirmDelete(video)">
                      <template #prepend>
                        <v-icon size="18" color="error">
                          mdi-delete-outline
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-error">
                        {{ t('delete') }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
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
            <div v-else class="personalized-grid-wrap">
              <div
                v-for="video in selectedAlbum.videos"
                :key="video.videoId"
                class="personalized-card"
              >
                <div class="personalized-card-image" @click="playAlbumVideo(video)">
                  <img :src="thumbnailUrl(video.videoId)" loading="lazy" />
                  <v-icon class="personalized-play-icon" size="40">
                    mdi-play-circle
                  </v-icon>
                </div>
                <div class="personalized-card-footer d-flex align-center">
                  <div class="personalized-card-title flex-grow-1" @click="playAlbumVideo(video)">
                    {{ video.name }}
                  </div>
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

            <div v-else class="personalized-grid-wrap">
              <div
                v-for="video in albumSearchResults"
                :key="`${video.albumId}_${video.videoId}`"
                class="personalized-card"
              >
                <div class="personalized-card-image" @click="playAlbumSearchVideo(video)">
                  <img :src="thumbnailUrl(video.videoId)" loading="lazy" />
                  <v-icon class="personalized-play-icon" size="40">
                    mdi-play-circle
                  </v-icon>
                </div>
                <div class="personalized-card-footer d-flex align-center">
                  <div class="personalized-card-title flex-grow-1" @click="playAlbumSearchVideo(video)">
                    {{ video.name }}
                  </div>
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
                    <v-list density="compact" rounded="lg" class="py-1">
                      <v-list-item @click="copyAlbumLink(album)">
                        <template #prepend>
                          <v-icon size="18">
                            mdi-content-copy
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ t('copy_link') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openAlbumInBrowser(album)">
                        <template #prepend>
                          <v-icon size="18">
                            mdi-open-in-new
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ t('open_browser') }}</v-list-item-title>
                      </v-list-item>
                      <v-divider />
                      <v-list-item @click="confirmDeleteAlbum(album)">
                        <template #prepend>
                          <v-icon size="18" color="error">
                            mdi-delete-outline
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-error">
                          {{ t('delete') }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <v-dialog v-model="showAddDialog" max-width="440" persistent>
        <v-card class="rounded-xl pa-2">
          <v-card-title class="font-weight-bold">
            {{ editingVideo ? t('edit') : t('add_link') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="nameInput"
              :label="t('video_name')"
              :placeholder="t('video_name_placeholder')"
              variant="outlined"
              density="comfortable"
              autofocus
              hide-details
              class="mb-4"
              @keydown.enter="submitVideo"
            />
            <v-text-field
              v-model="linkInput"
              :label="t('video_link')"
              :placeholder="t('video_link_placeholder')"
              variant="outlined"
              density="comfortable"
              hide-details
              @keydown.enter="submitVideo"
              @blur="fetchVideoTitle"
              @paste="onLinkPaste"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" class="text-none" @click="closeAddDialog">
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="text-none font-weight-bold"
              :disabled="!nameInput.trim() || !linkInput.trim()"
              @click="submitVideo"
            >
              {{ editingVideo ? t('save') : t('add_link') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showAddAlbumDialog" max-width="440" persistent>
        <v-card class="rounded-xl pa-2">
          <v-card-title class="font-weight-bold">
            {{ t('add_playlist') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="albumLinkInput"
              :label="t('playlist_link')"
              :placeholder="t('playlist_link_placeholder')"
              variant="outlined"
              density="comfortable"
              autofocus
              hide-details
              :disabled="albumLoading"
              @keydown.enter="submitAlbum"
            />
            <p v-if="albumError" class="mt-3 mb-0 text-error" style="font-size: 13px;">
              {{ albumError }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              class="text-none"
              :disabled="albumLoading"
              @click="closeAddAlbumDialog"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="text-none font-weight-bold"
              :loading="albumLoading"
              :disabled="!albumLinkInput.trim() || albumLoading"
              @click="submitAlbum"
            >
              {{ t('add_playlist') }}
            </v-btn>
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

      tabSliderLeft: 0,
      tabSliderWidth: 0,
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
      if (this.tab === "playlists" && this.selectedAlbum) return this.selectedAlbum.name;
      return this.t("title");
    },
    tabSliderStyle(): Record<string, string> {
      return {
        left: `${this.tabSliderLeft}px`,
        width: `${this.tabSliderWidth}px`,
      };
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
        this.$nextTick(() => this.updateTabSlider());
      }
    },
    tab() {
      this.$nextTick(() => this.updateTabSlider());
    },
    selectedAlbum(val: PersonalizedAlbum | null) {
      if (!val) {
        this.$nextTick(() => this.updateTabSlider());
      }
    },
  },
  mounted() {
    if (this.module?.show) {
      this.loadVideos();
      this.loadAlbums();
      this.$nextTick(() => this.updateTabSlider());
    }
    window.addEventListener("resize", this.updateTabSlider);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateTabSlider);
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${this.module_id}.${text}`, params || []);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    updateTabSlider() {
      const activeBtn = (this.tab === "music" ? this.$refs.musicTabBtn : this.$refs.playlistsTabBtn) as HTMLElement | undefined;
      if (!activeBtn) return;
      this.tabSliderLeft = activeBtn.offsetLeft;
      this.tabSliderWidth = activeBtn.offsetWidth;
    },

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
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
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
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
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
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
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

  .personalized-tabs-pill-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .personalized-tabs-pill {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 3px;
    box-shadow: var(--shadow);
  }

  .personalized-tab-slider {
    position: absolute;
    top: 3px;
    bottom: 3px;
    border-radius: 16px;
    background: var(--accent-blue);
    box-shadow: 0 2px 8px rgba(0, 151, 215, 0.35);
    transition: left 0.25s ease, width 0.25s ease;
    z-index: 0;
  }

  .personalized-tab-btn {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 16px;
    border: none;
    background: transparent;
    color: var(--sidebar-text-secondary);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease;

    &:hover:not(.active) {
      color: var(--sidebar-text);
      background: var(--sidebar-hover);
    }

    &.active {
      color: #ffffff;
    }
  }

  .personalized-grid-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
  }

  .personalized-card {
    width: 100%;
    min-width: 0;
    background: var(--card-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    transition: var(--transition);
    overflow: hidden;

    &:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);

      .personalized-play-icon {
        opacity: 1;
      }
    }

    .personalized-card-image {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
      position: relative;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .personalized-play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        opacity: 0;
        transition: opacity 0.2s ease;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
      }

      .personalized-album-badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        display: flex;
        align-items: center;
        gap: 2px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
      }
    }

    .personalized-card-footer {
      padding: 10px 6px 10px 14px;

      .personalized-card-title {
        font-size: 14px;
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
}
</style>
