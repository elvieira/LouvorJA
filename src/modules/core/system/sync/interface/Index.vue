<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.4) !important; backdrop-filter: blur(2px);">
      <!-- Layout Modal para Atualização de Banco de Dados -->
      <v-card
        v-if="isDbUpdateView"
        rounded="xl"
        width="100%"
        max-width="520"
        style="background: var(--card-bg); overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);"
      >
        <div style="background: linear-gradient(135deg, rgba(0,151,215,0.15) 0%, rgba(0,151,215,0.05) 100%); padding: 24px 24px 20px;">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center" style="gap: 12px;">
              <div>
                <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
                  Atualização de Banco de Dados
                </div>
                <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
                  {{ dbUpdateAvailable ? 'Nova versão disponível' : 'Atualizado' }}
                </div>
              </div>
            </div>
            <v-btn 
              icon 
              variant="text" 
              size="small" 
              @click="closeModule"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <v-card-text class="pa-0">
          <div v-if="dbUpdateAvailable" style="padding: 40px 24px; text-align: center;">
            <v-icon color="primary" size="64" class="mb-4">
              mdi-database-refresh
            </v-icon>
            <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
              Nova versão disponível
            </div>
            <div class="text-body-2" style="color: var(--sidebar-text-secondary); max-width: 340px; margin: 0 auto 20px;">
              Uma nova versão do banco de dados oficial foi encontrada. Recomendamos atualizar para obter as últimas correções e novos conteúdos.
            </div>
            
            <div class="text-caption mb-6 d-flex align-center justify-center font-weight-medium" style="color: var(--sidebar-text-secondary); gap: 12px; background: rgba(0,0,0,0.02); padding: 8px 16px; border-radius: 8px; width: fit-content; margin: 0 auto; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);">
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-1">
                  mdi-database-outline
                </v-icon>
                Atual: v{{ dbVersionLocal }}
              </div>
              <v-icon size="small" color="primary">
                mdi-arrow-right
              </v-icon>
              <div class="d-flex align-center" style="color: var(--accent-blue);">
                <v-icon size="small" class="mr-1" color="primary">
                  mdi-database-arrow-up
                </v-icon>
                Nova: v{{ dbVersionRemote }}
              </div>
            </div>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              class="text-none px-6 font-weight-bold"
              height="44"
              elevation="2"
              prepend-icon="mdi-download"
              :loading="isUpdatingDb"
              @click="updateDatabase"
            >
              Atualizar Banco de Dados
            </v-btn>
            
            <div v-if="isUpdatingDb" class="mt-6 mx-auto w-100" style="max-width: 340px;">
              <div class="d-flex justify-space-between text-caption mb-2">
                <span style="color: var(--sidebar-text-secondary);">{{ dbUpdateStatus }}</span>
              </div>
              <v-progress-linear
                v-model="dbUpdateProgress"
                :indeterminate="dbUpdateProgress === 0"
                color="primary"
                height="6"
                rounded
              />
            </div>
          </div>
          
          <div v-else style="padding: 40px 24px; text-align: center;">
            <v-icon color="success" size="64" class="mb-4">
              mdi-check-circle-outline
            </v-icon>
            <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
              Tudo atualizado!
            </div>
            <div class="text-body-2" style="color: var(--sidebar-text-secondary); max-width: 300px; margin: 0 auto;">
              Seu banco de dados já está na versão mais recente.
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Layout Normal da Biblioteca Local -->
      <v-card
        v-else
        class="rounded-xl overflow-hidden elevation-24"
        width="100%"
        max-width="600"
        style="background: var(--card-bg); max-height: 90%; display: flex; flex-direction: column; height: 100%;"
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
            <div v-if="appDataSize !== null" class="d-flex align-center mt-3">
              <v-icon size="small" color="primary" class="mr-2">
                mdi-harddisk
              </v-icon>
              <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">
                Ocupando {{ formattedAppDataSize }} no disco
              </span>
            </div>
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
      appDataSize: null as number | null,
      isUpdatingDb: false,
      dbUpdateStatus: "Conectando ao servidor...",
      dbUpdateProgress: 0,
    };
  },
  computed: {
    dbUpdateAvailable(): boolean {
      return (this as any).$appdata.get("modules.sync.db_update_available") === true;
    },
    dbVersionLocal(): number {
      return (this as any).$appdata.get("modules.sync.db_version_local") || 0;
    },
    dbVersionRemote(): number {
      return (this as any).$appdata.get("modules.sync.db_version_remote") || 0;
    },
    syncView(): string {
      return (this as any).$appdata.get("modules.sync.view") || "library";
    },
    isDbUpdateView(): boolean {
      return this.syncView === "db_update";
    },
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    hasNoIdleAlbums(): boolean {
      return !this.categoriesWithAlbums.some((cat: SyncCategory) => cat.albums.some((a: SyncAlbum) => a.status === "idle"));
    },
    formattedAppDataSize(): string {
      if (this.appDataSize === null) return "";
      if (this.appDataSize === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(this.appDataSize) / Math.log(k));
      return `${parseFloat((this.appDataSize / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },
  },
  async mounted() {
    this.loadAppDataSize();
    this.checkDatabaseVersion();
    await this.loadCollections();
    // Verifica em background se álbuns "idle" já possuem todos os arquivos no disco
    this.verifyIdleAlbumsOnDisk();
  },
  methods: {
    async loadAppDataSize() {
      if (window.electronAPI && window.electronAPI.getAppDataSize) {
        this.appDataSize = await window.electronAPI.getAppDataSize();
      }
    },
    async checkDatabaseVersion() {
      if (!window.electronAPI) return;
      try {
        const response = await fetch("https://api.louvorja.com.br/params?type=env");
        const text = await response.text();
        const dbVersionMatch = text.match(/db_version=(\d+)/);
        if (dbVersionMatch && dbVersionMatch[1]) {
          const remoteVersion = parseInt(dbVersionMatch[1], 10);
          const localConfig = await window.electronAPI.getLocalDb("config") as any;
          const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version) 
            ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10) 
            : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion(this.$i18n.locale) : 0);
          
          (this as any).$appdata.set("modules.sync.db_version_local", localVersion);
          (this as any).$appdata.set("modules.sync.db_version_remote", remoteVersion);
          if (remoteVersion > localVersion) {
            (this as any).$appdata.set("modules.sync.db_update_available", true);
          } else {
            (this as any).$appdata.set("modules.sync.db_update_available", false);
          }
        }
      } catch (e) {
        console.error("Erro ao verificar versão do banco:", e);
      }
    },
    async updateDatabase() {
      if (!window.electronAPI) return;
      this.isUpdatingDb = true;
      this.dbUpdateProgress = 0;
      
      window.electronAPI.onExtractProgress((data: any) => {
        this.dbUpdateProgress = data.progress;
      });
      
      if (window.electronAPI.onDownloadDbProgress) {
        window.electronAPI.onDownloadDbProgress((data: any) => {
          this.dbUpdateProgress = data.progress;
        });
      }

      try {
        this.dbUpdateStatus = "Baixando banco de dados...";
        this.dbUpdateProgress = 0;
        await window.electronAPI.downloadDatabase(this.$i18n.locale, true);
        
        this.dbUpdateStatus = "Extraindo arquivos e atualizando versão...";
        this.dbUpdateProgress = 0;
        await window.electronAPI.extractLocalDb(this.$i18n.locale);

        const localConfig = await window.electronAPI.getLocalDb("config") as any;
        const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version) 
          ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10) 
          : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion(this.$i18n.locale) : 0);

        (this as any).$appdata.set("modules.sync.db_version_local", localVersion);
        (this as any).$appdata.set("modules.sync.db_update_available", false);
        
        this.dbUpdateStatus = "Concluído! Reiniciando...";
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (e) {
        console.error("Erro na atualização do banco:", e);
        this.dbUpdateStatus = "Falha na atualização. Tente novamente mais tarde.";
        setTimeout(() => {
          this.isUpdatingDb = false;
        }, 3000);
      }
    },
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
    async verifyIdleAlbumsOnDisk() {
      if (!window.electronAPI || !window.electronAPI.checkMedia) return;

      const idleAlbums: SyncAlbum[] = [];
      for (const cat of this.categoriesWithAlbums) {
        for (const album of cat.albums) {
          if (album.status === "idle") {
            idleAlbums.push(album);
          }
        }
      }

      if (idleAlbums.length === 0) return;

      for (const album of idleAlbums) {
        try {
          let musicFiles: string[] = [];
          let slideFiles: string[] = [];

          if (album.isHymnal) {
            const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
            if (!hymnalData || !Array.isArray(hymnalData)) continue;

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
          } else {
            const albumData = (await $db.get(`album_${album.id_album}`)) as any;
            if (!albumData || !albumData.musics || !Array.isArray(albumData.musics)) continue;

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

          musicFiles = [...new Set(musicFiles)];
          slideFiles = [...new Set(slideFiles)];

          const allMediaFiles = [
            ...musicFiles.map(url => ({ url, type: "music" })),
            ...slideFiles.map(url => ({ url, type: "slides" })),
          ];

          if (album.rawCoverUrl) {
            allMediaFiles.push({ url: album.rawCoverUrl, type: "covers" });
          }

          if (allMediaFiles.length === 0) {
            album.status = "downloaded";
            await this.markAlbumDownloaded(album.id_album, album.isHymnal);
            continue;
          }

          // Verifica se todos os arquivos existem no disco
          let allExist = true;
          for (const media of allMediaFiles) {
            const relativePath = media.url.replace(/^\/(musics|images|covers)\//, "");
            const exists = await window.electronAPI.checkMedia(media.type, relativePath);
            if (!exists) {
              allExist = false;
              break; // Um faltou, não precisa continuar
            }
          }

          if (allExist) {
            album.status = "downloaded";
            await this.markAlbumDownloaded(album.id_album, album.isHymnal);
          }
        } catch (e) {
          console.warn(`[Sync] Erro ao verificar álbum ${album.id_album}:`, e);
        }
      }
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
            downloadedManifest = downloadedManifest.filter((id: string | number) => String(id) !== specificId);
            if (this.$i18n.locale === "pt") {
              downloadedManifest = downloadedManifest.filter((id: string | number) => String(id) !== String(album.id_album));
            }
          } else {
            downloadedManifest = downloadedManifest.filter((id: string | number) => String(id) !== String(album.id_album));
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
