<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.4) !important; backdrop-filter: blur(2px);">
      <v-card class="rounded-xl overflow-hidden elevation-24" width="100%" max-width="600" style="background: var(--card-bg); max-height: 90vh; display: flex; flex-direction: column;">
        <v-card-text class="pa-0 d-flex flex-column" style="height: 100%; min-height: 0; overflow: hidden;">
          <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon color="primary" size="32" class="mr-3">mdi-library</v-icon>
                <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">Biblioteca Local</h2>
              </div>
              <v-btn icon variant="text" @click="closeModule">
                <v-icon>mdi-close</v-icon>
                <v-tooltip activator="parent" location="bottom" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Fechar</v-tooltip>
              </v-btn>
            </div>
            <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
              Baixe as coletâneas para poder reproduzir as músicas.
            </p>
          </div>
          
          <div v-if="categoriesWithAlbums.length > 0" class="px-6 pb-2 d-flex gap-2">
            <v-btn 
              v-if="!isDownloadingAll"
              color="primary" 
              variant="tonal" 
              class="text-none font-weight-bold flex-grow-1"
              @click="downloadAllAlbums"
              :disabled="hasNoIdleAlbums"
            >
              <v-icon start>mdi-download-multiple</v-icon> Baixar Todas
            </v-btn>
            <v-btn 
              v-else
              color="error" 
              variant="tonal" 
              class="text-none font-weight-bold flex-grow-1"
              @click="cancelAll"
            >
              <v-icon start>mdi-close-circle-multiple</v-icon> Cancelar Todas
            </v-btn>
          </div>

          <div class="pa-6 pt-2 flex-grow-1" style="overflow-y: auto;">
          <div v-for="cat in categoriesWithAlbums" :key="cat.id_category" class="mb-4">
            <h3 class="text-subtitle-2 font-weight-bold text-uppercase mb-2 px-1" style="color: var(--sidebar-text-secondary); letter-spacing: 0.5px;">
              {{ cat.name }}
            </h3>
            
            <v-list class="bg-transparent" lines="two">
              <v-list-item 
                v-for="album in cat.albums" 
                :key="album.id_album" 
                class="mb-2 rounded-xl pa-3" 
                style="background: transparent; border: 1px solid var(--border-color);"
              >
                <template #prepend>
                  <v-avatar rounded="lg" size="48" color="primary" variant="tonal" class="mr-3">
                    <v-img v-if="album.coverUrl" :src="album.coverUrl" cover></v-img>
                    <v-icon v-else>mdi-album</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">
                  {{ album.name }}
                </v-list-item-title>
                
                <v-list-item-subtitle v-if="album.status === 'downloading'" class="mt-1">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-medium text-primary">
                      {{ album.progressText || 'Baixando...' }}
                    </span>
                    <span class="text-caption font-weight-bold text-primary">{{ album.progress }}%</span>
                  </div>
                  <v-progress-linear :model-value="album.progress" color="primary" height="5" rounded striped></v-progress-linear>
                </v-list-item-subtitle>
                
                <v-list-item-subtitle v-else class="text-caption" style="color: var(--sidebar-text-secondary);">
                  {{ album.subtitle || '' }}
                </v-list-item-subtitle>
                
                <template #append>
                  <v-btn
                    v-if="album.status === 'idle'"
                    color="primary"
                    variant="flat"
                    size="small"
                    class="text-none font-weight-bold rounded-lg px-3"
                    @click="downloadAlbum(album)"
                  >
                    <v-icon start size="16">mdi-download</v-icon> Baixar
                  </v-btn>
                  
                  <v-btn
                    v-else-if="album.status === 'downloading'"
                    color="error"
                    variant="tonal"
                    size="small"
                    class="rounded-lg ml-2"
                    icon
                    @click="cancelAlbum(album)"
                  >
                    <v-icon>mdi-close</v-icon>
                    <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Cancelar</v-tooltip>
                  </v-btn>

                  <div v-else-if="album.status === 'downloaded'" class="d-flex align-center">
                    <v-chip
                      color="success"
                      variant="tonal"
                      size="small"
                      class="font-weight-bold mr-2"
                    >
                      <v-icon start size="14">mdi-check-circle</v-icon> Baixado
                    </v-chip>
                    <v-btn
                      color="error"
                      variant="text"
                      size="small"
                      icon
                      @click="deleteAlbum(album)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Excluir Coletânea</v-tooltip>
                    </v-btn>
                  </div>
                  
                  <v-btn
                    v-else-if="album.status === 'error'"
                    color="error"
                    variant="tonal"
                    size="small"
                    class="text-none font-weight-bold rounded-lg px-3"
                    @click="downloadAlbum(album)"
                  >
                    <v-icon start size="16">mdi-refresh</v-icon> Tentar Novamente
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
          
          <div v-if="categoriesWithAlbums.length === 0" class="text-center py-8">
            <v-progress-circular v-if="loadingList" indeterminate color="primary" size="32"></v-progress-circular>
            <p v-else class="text-caption" style="color: var(--sidebar-text-secondary);">
              Nenhuma coletânea disponível. Execute a inicialização primeiro.
            </p>
          </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import $path from "@/helpers/Path";
import $db from "@/helpers/Database";
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

export default {
  name: "SyncIndex",
  components: {
    MenuToggleButton,
  },
  data() {
    return {
      manifest,
      categoriesWithAlbums: [],
      loadingList: false,
      cancelToken: false,
      isDownloadingAll: false,
      hymnalImg,
      hymnal1996Img,
    };
  },
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    hasNoIdleAlbums() {
      return !this.categoriesWithAlbums.some(cat => cat.albums.some(a => a.status === 'idle'));
    }
  },
  async mounted() {
    await this.loadCollections();
  },
  methods: {
    async toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    closeModule() {
      this.$modules.close(this.module_id);
    },
    async loadCollections() {
      if (!window.electronAPI || !window.electronAPI.isElectron) return;
      this.loadingList = true;
      
      try {
        const categories = await $db.get("pt_categories");
        const manifest = await window.electronAPI.getLocalDb("downloaded_albums") || [];
        
        if (!categories || !Array.isArray(categories)) {
          this.loadingList = false;
          return;
        }
        
        let result = [];
        
        let hymnalsList = [];
        const hymnal = await $db.get("pt_hymnal");
        const hymnal1996 = await $db.get("pt_hymnal_1996");
        
        if (hymnal && hymnal.length > 0) {
          hymnalsList.push({
            id_album: 'hymnal',
            name: 'Hinário Adventista',
            subtitle: 'Hinário oficial com ' + hymnal.length + ' hinos',
            coverUrl: this.hymnalImg,
            status: manifest.includes('hymnal') ? 'downloaded' : 'idle',
            progress: 0,
            totalCount: 0,
            downloadedCount: 0,
            isHymnal: true,
          });
        }
        
        if (hymnal1996 && hymnal1996.length > 0) {
          hymnalsList.push({
            id_album: 'hymnal_1996',
            name: 'Hinário Adventista (1996)',
            subtitle: 'Edição de 1996 com ' + hymnal1996.length + ' hinos',
            coverUrl: this.hymnal1996Img,
            status: manifest.includes('hymnal_1996') ? 'downloaded' : 'idle',
            progress: 0,
            totalCount: 0,
            downloadedCount: 0,
            isHymnal: true,
          });
        }
        
        if (hymnalsList.length > 0) {
          result.push({
            id_category: 'hymnals',
            name: 'Hinários',
            albums: hymnalsList
          });
        }
        
        for (const cat of categories) {
          if (!cat.albums || cat.albums.length === 0) continue;
          
          let albumsList = [];
          for (const a of cat.albums) {
            let coverUrl = null;
            if (a.url_image) {
              const imgRelativePath = a.url_image.replace(/^\/(musics|images|covers)\//, '');
              const localCheck = await window.electronAPI.checkMedia('covers', imgRelativePath);
              coverUrl = localCheck || $path.file(a.url_image);
            }
            
            albumsList.push({
              id_album: a.id_album,
              name: a.name,
              subtitle: a.subtitle || '',
              coverUrl,
              status: manifest.includes(a.id_album) ? 'downloaded' : 'idle',
              progress: 0,
              totalCount: 0,
              downloadedCount: 0,
              isHymnal: false,
            });
          }
          
          result.push({
            id_category: cat.id_category,
            name: cat.name,
            albums: albumsList,
          });
        }
        
        this.categoriesWithAlbums = result;
      } catch (e) {
        console.error("Erro ao carregar coletâneas:", e);
      }
      
      this.loadingList = false;
    },
    checkGlobalDownloadState() {
      const isDownloading = this.categoriesWithAlbums.some(cat => cat.albums.some(a => a.status === 'downloading'));
      this.$appdata.set("sync_is_downloading", isDownloading);
    },
    async downloadAlbum(album) {
      if (!window.electronAPI) return;
      if (this.cancelToken) return;
      
      this.$appdata.set("sync_is_downloading", true);
      
      album.status = 'downloading';
      album.progress = 0;
      album.totalCount = 0;
      album.downloadedCount = 0;
      album.cancelToken = false;
      album.progressText = 'Preparando...';
      
      try {
        let musicFiles = [];
        let slideFiles = [];

        if (album.isHymnal) {
          const hymnalData = await $db.get(`pt_${album.id_album}`);
          if (!hymnalData || !Array.isArray(hymnalData)) {
            album.status = 'idle';
            return;
          }

          let fetched = 0;
          const totalToFetch = hymnalData.length;

          for (const song of hymnalData) {
            fetched++;
            album.progress = Math.floor((fetched / totalToFetch) * 10);
            const musicData = await $db.get(`music_${song.id_music}`);
            if (musicData) {
              if (musicData.url_music) musicFiles.push(musicData.url_music);
              if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
              if (musicData.url_image) slideFiles.push(musicData.url_image);
              
              if (musicData.lyric) {
                musicData.lyric.forEach(l => {
                  if (l.url_image) slideFiles.push(l.url_image);
                });
              }
            }
          }
        } else {
          const albumData = await $db.get(`album_${album.id_album}`);
          if (!albumData || !albumData.musics || !Array.isArray(albumData.musics)) {
            album.status = 'idle';
            return;
          }
          
          let fetched = 0;
          const totalToFetch = albumData.musics.length;
          
          for (const song of albumData.musics) {
            fetched++;
            album.progress = Math.floor((fetched / totalToFetch) * 10);
            const musicData = await $db.get(`music_${song.id_music}`);
            if (musicData) {
              if (musicData.url_music) musicFiles.push(musicData.url_music);
              if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
              if (musicData.url_image) slideFiles.push(musicData.url_image);
              
              if (musicData.lyric) {
                musicData.lyric.forEach(l => {
                  if (l.url_image) slideFiles.push(l.url_image);
                });
              }
            }
          }
        }
        
        musicFiles = [...new Set(musicFiles)];
        slideFiles = [...new Set(slideFiles)];
        
        const allMediaFiles = [
          ...musicFiles.map(url => ({ url, type: 'music' })),
          ...slideFiles.map(url => ({ url, type: 'slides' }))
        ];
        
        album.totalCount = allMediaFiles.length;
        if (album.totalCount === 0) {
          album.status = 'downloaded';
          await this.markAlbumDownloaded(album.id_album);
          return;
        }
        
        let downloaded = 0;
        const batchSize = 5;
        let hasError = false;
        
        album.progressText = 'Baixando...';
        
        for (let i = 0; i < allMediaFiles.length; i += batchSize) {
          if (this.cancelToken || album.cancelToken || hasError || !navigator.onLine) {
            if (!navigator.onLine) hasError = true;
            break;
          }
          
          const batch = allMediaFiles.slice(i, i + batchSize);
          await Promise.all(batch.map(async (media) => {
            if (hasError) return;
            const fullUrl = $path.file(media.url);
            const relativePath = media.url.replace(/^\/(musics|images|covers)\//, '');
            const exists = await window.electronAPI.checkMedia(media.type, relativePath);
            if (!exists) {
              const success = await window.electronAPI.downloadMedia(fullUrl, media.type, relativePath);
              if (!success) {
                hasError = true;
                return;
              }
            }
            downloaded++;
            album.downloadedCount = downloaded;
            album.progress = 10 + Math.floor((downloaded / album.totalCount) * 90);
          }));
        }
        
        if (hasError) {
          album.status = 'error';
          album.progressText = !navigator.onLine ? 'Sem internet' : 'Falha no servidor';
          if (!this.isDownloadingAll) {
            this.$alert.error({
              title: "Falha no download",
              text: !navigator.onLine 
                ? "Não foi possível baixar os arquivos. Verifique sua conexão com a internet." 
                : "Não foi possível concluir o download pois o servidor está indisponível no momento. Tente novamente mais tarde.",
              translate: false
            });
          }
        } else if (this.cancelToken || album.cancelToken) {
          album.status = 'idle';
          album.progressText = 'Cancelado';
        } else {
          album.status = 'downloaded';
          await this.markAlbumDownloaded(album.id_album);
        }
      } catch (error) {
        console.error("Erro ao baixar album:", error);
        album.status = 'error';
        album.progressText = 'Erro ao baixar';
      } finally {
        this.checkGlobalDownloadState();
      }
    },
    async markAlbumDownloaded(albumId) {
      let manifest = await window.electronAPI.getLocalDb("downloaded_albums") || [];
      if (!manifest.includes(albumId)) {
        manifest.push(albumId);
        await window.electronAPI.saveLocalDb("downloaded_albums", manifest);
      }
    },
    async downloadAllAlbums() {
      if (this.hasNoIdleAlbums) return;
      this.isDownloadingAll = true;
      this.$appdata.set("sync_is_downloading", true);
      
      for (const cat of this.categoriesWithAlbums) {
        for (const album of cat.albums) {
          if (this.cancelToken) break;
          if (album.status === 'idle') {
            await this.downloadAlbum(album);
            if (album.status === 'error' && !navigator.onLine) {
              this.cancelAll();
              this.$alert.error({
                title: "Sem conexão",
                text: "O download em lote foi cancelado porque não há conexão com a internet.",
                translate: false
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
    cancelAlbum(album) {
      album.cancelToken = true;
    },
    deleteAlbum(album) {
      this.$alert.yesno({
        title: "Excluir Coletânea",
        text: `Tem certeza que deseja excluir a coletânea "<b>${album.name}</b>"? Isso irá apagar os arquivos do seu computador.`,
        translate: false,
      }, async (resp) => {
        if (resp === 'yes') {
          let manifest = await window.electronAPI.getLocalDb("downloaded_albums") || [];
          manifest = manifest.filter(id => id !== album.id_album);
          await window.electronAPI.saveLocalDb("downloaded_albums", manifest);
          
          album.status = 'idle';
          album.progress = 0;
          album.downloadedCount = 0;
          
          try {
            let musicFiles = [];
            let slideFiles = [];
            if (album.isHymnal) {
              const hymnalData = await $db.get(`pt_${album.id_album}`);
              if (hymnalData) {
                for (const song of hymnalData) {
                  const musicData = await $db.get(`music_${song.id_music}`);
                  if (musicData) {
                    if (musicData.url_music) musicFiles.push(musicData.url_music);
                    if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                    if (musicData.url_image) slideFiles.push(musicData.url_image);
                    if (musicData.lyric) {
                      musicData.lyric.forEach(l => {
                        if (l.url_image) slideFiles.push(l.url_image);
                      });
                    }
                  }
                }
              }
            } else {
              const albumData = await $db.get(`album_${album.id_album}`);
              if (albumData && albumData.musics) {
                for (const song of albumData.musics) {
                  const musicData = await $db.get(`music_${song.id_music}`);
                  if (musicData) {
                    if (musicData.url_music) musicFiles.push(musicData.url_music);
                    if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                    if (musicData.url_image) slideFiles.push(musicData.url_image);
                    if (musicData.lyric) {
                      musicData.lyric.forEach(l => {
                        if (l.url_image) slideFiles.push(l.url_image);
                      });
                    }
                  }
                }
              }
            }
            
            musicFiles = [...new Set(musicFiles)];
            for (const urlPath of musicFiles) {
              const relativePath = urlPath.replace(/^\/(musics|images|covers)\//, '');
              await window.electronAPI.deleteMedia('music', relativePath);
            }
            
            slideFiles = [...new Set(slideFiles)];
            for (const urlPath of slideFiles) {
              const relativePath = urlPath.replace(/^\/(musics|images|covers)\//, '');
              await window.electronAPI.deleteMedia('slides', relativePath);
            }
          } catch (e) {
            console.error("Erro ao apagar arquivos:", e);
          }
        }
      });
    }
  }
};
</script>
