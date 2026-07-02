<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <div class="search-header-container" :class="(searchQuery || shouldShowHistory) ? 'search-header d-flex align-center w-100' : 'hero-search-header d-flex flex-column align-center justify-center'" :style="(searchQuery || shouldShowHistory) ? 'padding: 24px 32px 10px 32px; position: relative;' : 'flex: 1; position: relative; padding: 32px; transition: all 0.5s ease;'">
        <div :style="(searchQuery || shouldShowHistory) ? 'flex: 1; display: flex; align-items: center;' : 'position: absolute; top: 24px; left: 32px;'">
          <MenuToggleButton style="margin: 0;" @toggle-sidebar="toggleSidebar" />
        </div>
        
        <div class="hero-content d-flex flex-column align-center w-100" v-if="!searchQuery && !shouldShowHistory" style="animation: fadeIn 0.5s ease;">
          <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 80px; height: 80px; margin-bottom: 24px;" />
          <h1 class="hero-title mb-8" style="font-size: 2.5rem; font-weight: 700; color: var(--sidebar-text);">O que vamos cantar?</h1>
        </div>
        
        <div class="search-bar" :style="(searchQuery || shouldShowHistory) ? 'flex: 2; display: flex; justify-content: center; transition: all 0.5s ease;' : 'width: 100%; max-width: 650px; transition: all 0.5s ease;'">
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded
            @keydown.enter="playFirstResult"
            :style="(searchQuery || shouldShowHistory) ? 'width: 100%; max-width: 600px;' : 'width: 100%;'"
            class="search-input-hero"
          />
        </div>

        <div v-if="(searchQuery || shouldShowHistory)" style="flex: 1;"></div>
      </div>

      <div class="content-main" v-if="searchQuery || shouldShowHistory">
        <div v-if="searchQuery" class="dashboard-section music-section h-100 d-flex flex-column" style="min-height: 0;">
          <h2 class="section-title mb-4">
            Resultados da Pesquisa
          </h2>
          <div class="music-list flex-grow-1 d-flex flex-column" style="min-height: 0; background: transparent; box-shadow: none;">
            <LTable
              v-model="searchData"
              :search="searchQuery"
              :searchable_fields="{
                name: true,
              }"
              sort_by="name"
              :file="`${$i18n.locale}_musics`"
              class="flex-grow-1 d-flex flex-column"
              style="background: transparent; min-height: 0;"
            >
              <tbody class="music-list-container">
                <tr 
                  v-for="item in searchData.data" 
                  :key="item.id_music"
                  class="music-item w-100"
                  style="cursor: pointer;"
                  @click="$media.open({ id_music: item.id_music, mode: 'audio' })"
                >
                  <td class="music-info flex-grow-1" style="border-bottom: none; padding-left: 24px !important;">
                    <h4 class="music-title">
                      <span v-if="getHymnalTrack(item)" style="color: var(--accent-blue); margin-right: 8px;">{{ getHymnalTrack(item) }}</span>
                      {{ item.name }}
                    </h4>
                    <p class="music-artist" style="margin-top: 4px;">
                      {{ item.albums ? item.albums.map(a => a.name).join(', ') : '' }}
                    </p>
                  </td>
                  <td class="music-duration pr-4" style="border-bottom: none;">
                    {{ $datetime.shortTime(item.duration) }}
                  </td>
                  <td style="border-bottom: none;">
                    <div class="d-flex justify-end pr-4">
                      <LMusicMenuTable
                        :id_music="item.id_music"
                        :has_instrumental_music="item.has_instrumental_music"
                      />
                    </div>
                  </td>
                </tr>
                <tr v-if="searchData.data && searchData.data.length === 0">
                  <td class="text-center pa-8 text-grey w-100 d-block" style="border-bottom: none;">
                    Nenhuma música encontrada.
                  </td>
                </tr>
              </tbody>
            </LTable>
          </div>
        </div>

        <template v-else-if="shouldShowHistory && !searchQuery">
          <div class="dashboard-section collections-section">
            <h2 class="section-title">
              {{ t("recent_collections") }}
            </h2>
            <div 
              v-if="displayCollections.length > 0" 
              ref="collectionsGrid"
              class="collections-grid"
              @wheel="handleCollectionsScroll"
            >
              <div 
                v-for="collection in displayCollections" 
                :key="collection.id"
                class="collection-card"
                @click="openCollection(collection)"
              >
                <div class="card-image" style="position: relative;">
                  <v-img 
                    v-if="getCollectionImage(collection)" 
                    :src="getCollectionImage(collection)" 
                    cover 
                    style="width: 100%; height: 100%; position: absolute; inset: 0;"
                  />
                  <v-icon v-else size="48" style="position: relative; z-index: 1;">
                    {{ collection.icon }}
                  </v-icon>
                </div>
                <div class="card-content">
                  <h3 class="card-title">
                    {{ getCollectionName(collection) }}
                  </h3>
                  <p v-if="collection.songCount" class="card-stats">
                    {{ collection.songCount }} {{ t("songs") }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state collections-empty">
              <v-icon size="48" color="grey-lighten-1">mdi-music-box-multiple-outline</v-icon>
              <p>{{ t("no_collections_played") }}</p>
            </div>
          </div>

          <div class="dashboard-section music-section">
            <h2 class="section-title">
              {{ t("favorites") }}
            </h2>
            <div class="music-list">
              <div class="music-list-container">
                <div
                  v-for="(song, index) in favorites"
                  :key="song.id_music || index"
                  class="music-item"
                  @click="playSong(song)"
                >
                  <div class="music-number">
                    <v-icon size="18" color="amber">mdi-star</v-icon>
                  </div>
                  <div class="music-info">
                    <h4 class="music-title">{{ song.name }}</h4>
                    <p class="music-artist">{{ song.album_name }}</p>
                  </div>
                  <div class="music-duration">
                    {{ song.duration }}
                  </div>
                  <div style="padding-right: 12px;">
                    <v-btn icon size="x-small" variant="text" color="error" @click.stop="removeFavorite(song.id_music)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div v-if="favorites.length === 0" class="empty-state">
                  <v-icon size="48" color="grey-lighten-1">mdi-star-outline</v-icon>
                  <p>{{ t("no_favorites") }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-section music-section">
            <h2 class="section-title">
              {{ t("top_songs") }}
            </h2>
            <div class="music-list">
              <div class="music-list-container">
                <div 
                  v-for="(song, index) in topSongs" 
                  :key="song.id_music || index"
                  class="music-item"
                  @click="playSong(song)"
                >
                  <div class="music-number">
                    {{ index + 1 }}
                  </div>
                  <div class="music-info">
                    <h4 class="music-title">
                      {{ song.name }}
                    </h4>
                    <p class="music-artist">
                      {{ song.album_name }}
                    </p>
                  </div>
                  <div class="music-duration">
                    {{ $datetime.shortTime(song.duration) }}
                  </div>
                </div>
                <div v-if="topSongs.length === 0" class="empty-state">
                  <v-icon size="48" color="grey-lighten-1">
                    mdi-music-note-off
                  </v-icon>
                  <p>{{ t("no_songs_played") }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";

import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
    LTable,
    LMusicMenuTable,
  },
  data() {
    return {
      searchQuery: "",
      searchData: [],
      manifest,
      dynamicCollectionInfo: {},
      show_home_history: true,
      hymnalImg,
      hymnal1996Img,
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    musicModules() {
      const modules = this.$appdata.get("modules") || {};
      const musicGroup = this.$appdata.get("module_group.musics") || {};
      const musicModuleIds = musicGroup.modules || [];
      
      const result = [];
      musicModuleIds.forEach((id) => {
        if (modules[id]) {
          result.push({
            id,
            ...modules[id],
          });
        }
      });
      
      return result;
    },

    shouldShowHistory() {
      return this.show_home_history && (this.displayCollections.length > 0 || this.favorites.length > 0 || this.topSongs.length > 0);
    },
    
    displayCollections() {
      const recentCollections = this.$history.getRecentCollections();
      
      return recentCollections.map((item) => {
        const dynInfo = this.dynamicCollectionInfo[item.id] || {};
        
        return {
          ...item,
          songCount: dynInfo.songCount || 0,
          url_image: dynInfo.url_image || item.url_image,
        };
      });
    },
    
    favorites() {
      return this.$favorites.getFavorites();
    },
    topSongs() {
      return this.$history.getTopSongs(20);
    },
    
    compact() {
      return this.$vuetify.display.width <= 800;
    },
  },
  watch: {
    displayCollections: {
      handler(newVal) {
        this.fetchCollectionInfo();
      },
      deep: true,
      immediate: true,
    },
    'module.show': {
      handler(newVal) {
        if (newVal) {
          const setting = this.$userdata.get("show_home_history");
          this.show_home_history = setting !== false;
        }
      },
      immediate: true,
    }
  },
  mounted() {
    this.fetchCollectionInfo();
    const setting = this.$userdata.get("show_home_history");
    this.show_home_history = setting !== false;
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    async fetchCollectionInfo() {
      const collections = this.displayCollections;
      let allCategories;
      
      for (const col of collections) {
        if (!this.dynamicCollectionInfo[col.id]) {
          try {
            const info = { songCount: 0, url_image: null };
            
            if (col.type === "album") {
              const data = await this.$database.get(`album_${col.id}`);
              if (data) {
                info.songCount = data.musics ? data.musics.length : (data.data ? data.data.length : 0);
                info.url_image = data.url_image;
              }
            } else {
              const modData = this.$appdata.get(`modules.${col.id}`);
              if (modData && modData.url_image) {
                info.url_image = modData.url_image;
              }

              if (["hymnal", "hymnal_1996"].includes(col.id)) {
                const locale = this.$i18n.locale;
                const data = await this.$database.get(`${locale}_${col.id}`);
                if (data && data.data) {
                  info.songCount = data.data.length;
                }
              }
            }

            if (!info.url_image) {
              if (!allCategories) {
                allCategories = await this.$database.get(`${this.$i18n.locale}_categories`);
              }
              if (allCategories) {
                for (const cat of allCategories) {
                  const albumObj = cat.albums?.find(a => a.id_album === col.id || a.id_album === col.module || a.id_album === col.id.replace('hymnal', 'hasd'));
                  if (albumObj && albumObj.url_image) {
                    info.url_image = albumObj.url_image;
                    break;
                  }
                }
              }
            }
            
            if (info.url_image && window.electronAPI) {
              const imgRelativePath = info.url_image.replace(/^\/(musics|images|covers)\//, '');
              const localCheck = await window.electronAPI.checkMedia('covers', imgRelativePath);
              if (localCheck) {
                info.local_url_image = localCheck;
              }
            }
            
            this.dynamicCollectionInfo = {
              ...this.dynamicCollectionInfo,
              [col.id]: info,
            };
          } catch(e) {
            console.error("Erro ao buscar info da coletânea", col.id, e);
          }
        }
      }
    },
    
    getCollectionImage(collection) {
      const name = this.getCollectionName(collection) || '';
      
      if (
        collection.id === 'hymnal_1996' || 
        collection.module === 'hymnal_1996' || 
        collection.id === 'ha1996' ||
        name.includes('1996') ||
        (collection.url_image && collection.url_image.includes('1996'))
      ) {
        return this.hymnal1996Img;
      }
      
      if (
        collection.id === 'hymnal' || 
        collection.module === 'hymnal' || 
        collection.id === 'hasd' ||
        name.includes('Hinário') ||
        collection.url_image === '/covers/hasd.bmp'
      ) {
        return this.hymnalImg;
      }
      
      if (collection.local_url_image) {
        return collection.local_url_image;
      }
      
      if (collection.url_image) {
        return this.$path.file(collection.url_image);
      }
      return null;
    },

    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    
    handleCollectionsScroll(event) {
      event.preventDefault();
      
      const collectionsGrid = this.$refs.collectionsGrid;
      
      if (collectionsGrid) {
        const scrollAmount = event.deltaY * 2;
        
        collectionsGrid.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    },
    
    openCollection(collection) {
      if (collection.type === "album") {
        this.$media.openAlbum(collection.id);
      } else {
        this.$modules.open(collection.id);
      }
    },
    
    playSong(song) {
      if (song.id_music) {
        this.$media.open({ id_music: song.id_music, mode: "audio" });
      }
    },
    removeFavorite(id_music) {
      this.$favorites.toggle(id_music);
    },
    
    getCollectionName(collection) {
      return collection.name || this.$t(collection.title) || collection.id;
    },
    
    playFirstResult() {
      if (this.searchData && this.searchData.data && this.searchData.data.length > 0) {
        const first = this.searchData.data[0];
        if (first.id_music) {
          this.$media.open({ id_music: first.id_music, mode: 'audio' });
        }
      }
    },
    
    getHymnalTrack(item) {
      if (item && item.albums) {
        const hymnalAlbum = item.albums.find(a => a.type === 'hymnal');
        if (hymnalAlbum && hymnalAlbum.pivot && hymnalAlbum.pivot.track) {
          return hymnalAlbum.pivot.track;
        }
      }
      return null;
    },
    
    openAlbum(id_album) {
      this.$media.openAlbum(id_album);
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/home.scss";
</style>
