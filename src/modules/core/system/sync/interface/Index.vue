<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.4) !important; backdrop-filter: blur(2px);">
      <v-card
        class="rounded-xl overflow-hidden elevation-24"
        width="100%"
        max-width="600"
        style="background: var(--card-bg); max-height: 90vh; display: flex; flex-direction: column;"
      >
        <v-card-text class="pa-0 d-flex flex-column" style="height: 100%; min-height: 0; overflow: hidden;">
          <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon color="primary" size="32" class="mr-3">
                  mdi-library
                </v-icon>
                <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                  {{ $t('modules.sync.title') }}
                </h2>
              </div>
              <div class="d-flex align-center">
                <transition name="fade" mode="out-in">
                  <v-btn 
                    v-if="categoriesWithAlbums.length > 0 && !isDownloadingAll && !hasNoIdleAlbums"
                    color="primary" 
                    variant="flat" 
                    height="36"
                    class="text-none font-weight-bold rounded-lg px-4 mr-3"
                    @click="downloadAllAlbums"
                  >
                    <v-icon start size="18">
                      mdi-cloud-download
                    </v-icon> {{ $t('modules.sync.download_all') }}
                  </v-btn>
                  <v-btn 
                    v-else-if="categoriesWithAlbums.length > 0 && !isDownloadingAll && hasNoIdleAlbums"
                    color="success" 
                    variant="tonal" 
                    height="36"
                    class="text-none font-weight-bold rounded-lg px-4 mr-3"
                    style="opacity: 0.9; pointer-events: none;"
                    :ripple="false"
                  >
                    <v-icon start size="18">
                      mdi-check-all
                    </v-icon> {{ $t('modules.sync.all_downloaded') }}
                  </v-btn>
                  <v-btn 
                    v-else-if="categoriesWithAlbums.length > 0 && isDownloadingAll"
                    color="error" 
                    variant="flat" 
                    height="36"
                    class="text-none font-weight-bold rounded-lg px-4 mr-3"
                    @click="cancelAll"
                  >
                    <v-icon start size="18">
                      mdi-close-circle-multiple
                    </v-icon> {{ $t('modules.sync.cancel_all') }}
                  </v-btn>
                </transition>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="closeModule"
                >
                  <v-icon>mdi-close</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                  >
                    {{ $t('modules.sync.close') }}
                  </v-tooltip>
                </v-btn>
              </div>
            </div>
            <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
              {{ $t('modules.sync.description') }}
            </p>
          </div>
          <v-divider style="opacity: 0.1;" class="mx-6 mt-3 mb-1" />

          <div class="pa-6 pt-2 flex-grow-1" style="overflow-y: auto;">
            <div v-for="cat in categoriesWithAlbums" :key="cat.id_category" class="mb-4">
              <h3 class="text-subtitle-2 font-weight-bold text-uppercase mb-2 px-1" style="color: var(--sidebar-text-secondary); letter-spacing: 0.5px;">
                {{ cat.name }}
              </h3>
            
              <v-list class="bg-transparent" lines="two">
                <SyncAlbumItem
                  v-for="album in cat.albums" 
                  :key="album.id_album" 
                  :album="album"
                  @download="downloadAlbum"
                  @cancel="cancelAlbum"
                  @delete="deleteAlbum"
                />
              </v-list>
            </div>
          
            <div v-if="categoriesWithAlbums.length === 0" class="text-center py-8">
              <v-progress-circular
                v-if="loadingList"
                indeterminate
                color="primary"
                size="32"
              />
              <p v-else class="text-caption" style="color: var(--sidebar-text-secondary);">
                {{ $t('modules.sync.no_collections') }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import $path from "@/helpers/utils/Path";
import $db from "@/helpers/services/Database";
import manifest from "../manifest";

import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

import SyncAlbumItem from "./components/SyncAlbumItem.vue";
import type { SyncAlbum, SyncCategory } from "./types";

export default defineComponent({
  name: "SyncIndex",
  components: {
    SyncAlbumItem,
  },
  data() {
    return {
      manifest,
      categoriesWithAlbums: [] as SyncCategory[],
      loadingList: false,
      cancelToken: false,
      isDownloadingAll: false,
      hymnalImg,
      hymnal1996Img,
    };
  },
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    hasNoIdleAlbums(): boolean {
      return !this.categoriesWithAlbums.some((cat: SyncCategory) => cat.albums.some((a: SyncAlbum) => a.status === "idle"));
    },
  },
  async mounted() {
    await this.loadCollections();
  },
  methods: {
    closeModule() {
      this.$modules.close(this.module_id);
    },
    async loadCollections() {
      if (!window.electronAPI || !window.electronAPI.isElectron) return;
      this.loadingList = true;
      
      try {
        const categories = (await $db.get(`${this.$i18n.locale}_categories`)) as any[];
        const downloadedManifest = ((await window.electronAPI.getLocalDb("dla")) as any[]) || [];
        
        if (!categories || !Array.isArray(categories)) {
          this.loadingList = false;
          return;
        }
        
        const result: SyncCategory[] = [];
        
        const hymnalsList: SyncAlbum[] = [];
        const hymnal = (await $db.get(`${this.$i18n.locale}_hymnal`)) as any[];
        const hymnal1996 = (await $db.get(`${this.$i18n.locale}_hymnal_1996`)) as any[];
        
        if (hymnal && hymnal.length > 0) {
          hymnalsList.push({
            id_album: "hymnal",
            name: this.$t("modules.sync.hymnal_name"),
            subtitle: this.$t("modules.sync.hymnal_subtitle", { count: hymnal.length }),
            coverUrl: this.$i18n.locale === "es" ? this.hymnal1996Img : this.hymnalImg,
            status: downloadedManifest.includes(`hymnal_${this.$i18n.locale}`) || (this.$i18n.locale === "pt" && downloadedManifest.includes("hymnal")) ? "downloaded" : "idle",
            progress: 0,
            totalCount: 0,
            downloadedCount: 0,
            isHymnal: true,
          });
        }
        
        if (hymnal1996 && hymnal1996.length > 0) {
          hymnalsList.push({
            id_album: "hymnal_1996",
            name: this.$t("modules.sync.hymnal_1996_name"),
            subtitle: this.$t("modules.sync.hymnal_1996_subtitle", { count: hymnal1996.length }),
            coverUrl: this.hymnal1996Img,
            status: downloadedManifest.includes(`hymnal_1996_${this.$i18n.locale}`) || (this.$i18n.locale === "pt" && downloadedManifest.includes("hymnal_1996")) ? "downloaded" : "idle",
            progress: 0,
            totalCount: 0,
            downloadedCount: 0,
            isHymnal: true,
          });
        }
        
        if (hymnalsList.length > 0) {
          result.push({
            id_category: "hymnals",
            name: this.$t("modules.sync.hymnals_category"),
            albums: hymnalsList,
          });
        }
        
        for (const cat of categories) {
          if (this.$i18n.locale === "es") continue;
          if (!cat.albums || cat.albums.length === 0) continue;
          
          const albumsList: SyncAlbum[] = [];
          for (const a of cat.albums) {
            if ([712, 629, 713].includes(a.id_album as number)) continue;
            
            let coverUrl = null;
            if (a.url_image) {
              const imgRelativePath = (a.url_image as string).replace(/^\/(musics|images|covers)\//, "");
              const localCheck = await window.electronAPI?.checkMedia("covers", imgRelativePath);
              coverUrl = (localCheck === false ? null : localCheck) || $path.file(a.url_image);
            }
            
            albumsList.push({
              id_album: a.id_album,
              name: a.name,
              subtitle: a.subtitle || "",
              coverUrl,
              rawCoverUrl: a.url_image,
              status: downloadedManifest.includes(a.id_album) ? "downloaded" : "idle",
              progress: 0,
              totalCount: 0,
              downloadedCount: 0,
              isHymnal: false,
            });
          }
          if (albumsList.length > 0) {
            result.push({
              id_category: cat.id_category,
              name: cat.name,
              albums: albumsList,
            });
          }
        }
        
        // Ordenação personalizada
        const orderMap: Record<string, number> = {
          hymnals: 1,
          Hinários: 1,
          "CDs Oficiais/Ano": 2,
          Infantis: 98,
          Doxologia: 99,
        };
        
        result.sort((a, b) => {
          const orderA = orderMap[a.id_category] || orderMap[a.name] || 50;
          const orderB = orderMap[b.id_category] || orderMap[b.name] || 50;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });

        this.categoriesWithAlbums = result;
      } catch (e) {
        console.error("Erro ao carregar coletâneas:", e);
      }
      
      this.loadingList = false;
    },
    checkGlobalDownloadState() {
      const isDownloading = this.categoriesWithAlbums.some(cat => cat.albums.some(a => a.status === "downloading"));
      this.$appdata.set("sync_is_downloading", isDownloading);
    },
    async downloadAlbum(album: SyncAlbum) {
      if (!window.electronAPI) return;
      if (this.cancelToken) return;
      
      this.$appdata.set("sync_is_downloading", true);
      
      album.status = "downloading";
      album.progress = 0;
      album.totalCount = 0;
      album.downloadedCount = 0;
      album.cancelToken = false;
      album.progressText = "Preparando..."; 
      
      try {
        let musicFiles: string[] = [];
        let slideFiles: string[] = [];

        if (album.isHymnal) {
          const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
          if (!hymnalData || !Array.isArray(hymnalData)) {
            album.status = "idle";
            return;
          }

          let fetched = 0;
          const totalToFetch = hymnalData.length;

          for (const song of hymnalData) {
            fetched++;
            album.progress = Math.floor((fetched / totalToFetch) * 10);
            const musicData = (await $db.get(`music_${song.id_music}`)) as any;
            if (musicData) {
              if (musicData.url_music) musicFiles.push(musicData.url_music);
              if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
              if (musicData.url_image) slideFiles.push(musicData.url_image);
              
              if (musicData.lyric) {
                musicData.lyric.forEach((l: any) => {
                  if (l.url_image) slideFiles.push(l.url_image);
                });
              }
            }
          }
        } else {
          const albumData = (await $db.get(`album_${album.id_album}`)) as any;
          if (!albumData || !albumData.musics || !Array.isArray(albumData.musics)) {
            album.status = "idle";
            return;
          }
          
          let fetched = 0;
          const totalToFetch = albumData.musics.length;
          
          for (const song of albumData.musics) {
            fetched++;
            album.progress = Math.floor((fetched / totalToFetch) * 10);
            const musicData = (await $db.get(`music_${song.id_music}`)) as any;
            if (musicData) {
              if (musicData.url_music) musicFiles.push(musicData.url_music);
              if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
              if (musicData.url_image) slideFiles.push(musicData.url_image);
              
              if (musicData.lyric) {
                musicData.lyric.forEach((l: any) => {
                  if (l.url_image) slideFiles.push(l.url_image);
                });
              }
            }
          }
        }
        
        musicFiles = [...new Set(musicFiles)];
        slideFiles = [...new Set(slideFiles)];
        
        const allMediaFiles = [
          ...musicFiles.map(url => ({ url, type: "music" })),
          ...slideFiles.map(url => ({ url, type: "slides" })),
        ];

        if (album.rawCoverUrl) {
          allMediaFiles.push({ url: album.rawCoverUrl, type: "covers" });
        }
        
        album.totalCount = allMediaFiles.length;
        if (album.totalCount === 0) {
          album.status = "downloaded";
          await this.markAlbumDownloaded(album.id_album, album.isHymnal);
          return;
        }
        
        let downloaded = 0;
        const batchSize = 5;
        let consecutiveErrors = 0;
        let totalErrors = 0;
        const MAX_CONSECUTIVE_ERRORS = 5; 
        
        album.progressText = this.$t("modules.sync.downloading");
        
        for (let i = 0; i < allMediaFiles.length; i += batchSize) {
          if (this.cancelToken || album.cancelToken || !navigator.onLine) {
            if (!navigator.onLine) totalErrors++;
            break;
          }
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) break;
          
          const batch = allMediaFiles.slice(i, i + batchSize);
          await Promise.all(batch.map(async (media) => {
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) return;
            const fullUrl = $path.file(media.url);
            const relativePath = media.url.replace(/^\/(musics|images|covers)\//, "");
            const exists = await window.electronAPI?.checkMedia(media.type, relativePath);
            if (!exists) {
              const success = await window.electronAPI?.downloadMedia(fullUrl, media.type, relativePath);
              if (!success) {
                consecutiveErrors++;
                totalErrors++;
                console.warn(`[Sync] Falha ao baixar: ${relativePath} (${consecutiveErrors} consecutivas)`);
                return;
              }
              consecutiveErrors = 0; 
            }
            downloaded++;
            album.downloadedCount = downloaded;
            album.progress = 10 + Math.floor((downloaded / album.totalCount) * 90);
            album.progressText = `${this.$t("modules.sync.downloading")} (${downloaded}/${album.totalCount})`;
          }));
        }
        
        const abortedByErrors = consecutiveErrors >= MAX_CONSECUTIVE_ERRORS;
        
        if (abortedByErrors || !navigator.onLine) {
          album.status = "error";
          album.progressText = !navigator.onLine ? this.$t("modules.sync.no_internet") : this.$t("modules.sync.server_failure");
          if (!this.isDownloadingAll) {
            this.$alert.error({
              title: this.$t("modules.sync.download_failed"),
              text: !navigator.onLine 
                ? this.$t("modules.sync.error_no_internet")
                : this.$t("modules.sync.error_server", { count: totalErrors }),
              translate: false,
            });
          }
        } else if (this.cancelToken || album.cancelToken) {
          album.status = "idle";
          album.progressText = this.$t("modules.sync.cancelled");
        } else {
          if (totalErrors > 0) {
            console.warn(`[Sync] Coletânea baixada com ${totalErrors} arquivo(s) faltando.`);
          }
          album.status = "downloaded";
          await this.markAlbumDownloaded(album.id_album, album.isHymnal);
        }
      } catch (error) {
        console.error("Erro ao baixar album:", error);
        album.status = "error";
        album.progressText = this.$t("modules.sync.download_error");
      } finally {
        this.checkGlobalDownloadState();
      }
    },
    async markAlbumDownloaded(albumId: string | number, isHymnal = false) {
      const downloadedManifest = (await window.electronAPI?.getLocalDb("dla")) as any[] || [];
      const idToSave = isHymnal ? `${albumId}_${this.$i18n.locale}` : albumId;
      if (!downloadedManifest.includes(idToSave)) {
        downloadedManifest.push(idToSave);
        await window.electronAPI?.saveLocalDb("dla", downloadedManifest);
      }
    },
    async downloadAllAlbums() {
      if (this.hasNoIdleAlbums) return;
      this.cancelToken = false;
      this.isDownloadingAll = true;
      this.$appdata.set("sync_is_downloading", true);
      
      for (const cat of this.categoriesWithAlbums) {
        for (const album of cat.albums) {
          if (this.cancelToken) break;
          if (album.status === "idle") {
            await this.downloadAlbum(album);
            if ((album.status as string) === "error" && !navigator.onLine) {
              this.cancelAll();
              this.$alert.error({
                title: this.$t("modules.sync.no_connection"),
                text: this.$t("modules.sync.batch_cancelled_no_internet"),
                translate: false,
              });
              break;
            }
          }
        }
        if (this.cancelToken) break;
      }
      
      this.isDownloadingAll = false;
      this.$appdata.set("sync_is_downloading", false);
    },
    cancelAll() {
      this.cancelToken = true;
    },
    cancelAlbum(album: SyncAlbum) {
      album.cancelToken = true;
    },
    deleteAlbum(album: SyncAlbum) {
      this.$alert.yesno({
        title: this.$t("modules.sync.delete_album"),
        text: this.$t("modules.sync.delete_confirm", { name: album.name }),
        translate: false,
      }, async (resp: string) => {
        if (resp === "yes") {
          let downloadedManifest = (await window.electronAPI?.getLocalDb("dla")) as any[] || [];
          
          if (album.isHymnal) {
            const specificId = `${album.id_album}_${this.$i18n.locale}`;
            downloadedManifest = downloadedManifest.filter((id: string | number) => id !== specificId);
            if (this.$i18n.locale === "pt") {
              downloadedManifest = downloadedManifest.filter((id: string | number) => id !== album.id_album);
            }
          } else {
            downloadedManifest = downloadedManifest.filter((id: string | number) => id !== album.id_album);
          }
          
          await window.electronAPI?.saveLocalDb("dla", downloadedManifest);
          
          album.status = "idle";
          album.progress = 0;
          album.downloadedCount = 0;
          
          try {
            let musicFiles: string[] = [];
            let slideFiles: string[] = [];
            if (album.isHymnal) {
              const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
              if (hymnalData) {
                for (const song of hymnalData) {
                  const musicData = (await $db.get(`music_${song.id_music}`)) as any;
                  if (musicData) {
                    if (musicData.url_music) musicFiles.push(musicData.url_music);
                    if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                    if (musicData.url_image) slideFiles.push(musicData.url_image);
                    if (musicData.lyric) {
                      musicData.lyric.forEach((l: any) => {
                        if (l.url_image) slideFiles.push(l.url_image);
                      });
                    }
                  }
                }
              }
            } else {
              const albumData = (await $db.get(`album_${album.id_album}`)) as any;
              if (albumData && albumData.musics) {
                for (const song of albumData.musics) {
                  const musicData = (await $db.get(`music_${song.id_music}`)) as any;
                  if (musicData) {
                    if (musicData.url_music) musicFiles.push(musicData.url_music);
                    if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                    if (musicData.url_image) slideFiles.push(musicData.url_image);
                    if (musicData.lyric) {
                      musicData.lyric.forEach((l: any) => {
                        if (l.url_image) slideFiles.push(l.url_image);
                      });
                    }
                  }
                }
              }
            }
            
            musicFiles = [...new Set(musicFiles)];
            for (const urlPath of musicFiles) {
              const relativePath = urlPath.replace(/^\/(musics|images|covers)\//, "");
              await window.electronAPI?.deleteMedia("music", relativePath);
            }
            
            slideFiles = [...new Set(slideFiles)];
            for (const urlPath of slideFiles) {
              const relativePath = urlPath.replace(/^\/(musics|images|covers)\//, "");
              await window.electronAPI?.deleteMedia("slides", relativePath);
            }
          } catch (e) {
            console.error("Erro ao apagar arquivos:", e);
          }
        }
      });
    },
  },
});
</script>
