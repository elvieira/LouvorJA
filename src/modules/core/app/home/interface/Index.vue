<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <div class="search-header-container" :class="(searchQuery || shouldShowHistory) ? 'search-header d-flex align-center w-100' : 'hero-search-header d-flex flex-column align-center justify-center'" :style="(searchQuery || shouldShowHistory) ? 'padding: 24px 32px 10px 32px; position: relative;' : 'flex: 1; position: relative; padding: 32px; transition: all 0.5s ease;'">
        <div :style="(searchQuery || shouldShowHistory) ? 'flex: 1; display: flex; align-items: center;' : 'position: absolute; top: 24px; left: 32px;'">
          <MenuToggleButton style="margin: 0;" @toggle-sidebar="toggleSidebar" />
        </div>
        
        <div v-if="!searchQuery && !shouldShowHistory" class="hero-content d-flex flex-column align-center w-100" style="animation: fadeIn 0.5s ease;">
          <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 80px; height: 80px; margin-bottom: 24px;" />
          <h1 class="hero-title mb-8" style="font-size: 2.5rem; font-weight: 700; color: var(--sidebar-text);">
            O que vamos cantar?
          </h1>
        </div>
        
        <div class="search-bar" :style="(searchQuery || shouldShowHistory) ? 'flex: 2; display: flex; justify-content: center; transition: all 0.5s ease;' : 'width: 100%; max-width: 650px; transition: all 0.5s ease;'">
          <v-text-field
            ref="searchInput"
            v-model="searchQuery"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
            :style="(searchQuery || shouldShowHistory) ? 'width: 100%; max-width: 600px;' : 'width: 100%;'"
            class="search-input-hero"
            @keydown.enter="playFirstResult"
          >
            <template #append-inner>
              <v-menu :close-on-content-click="false" location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-filter-variant"
                    size="small"
                    variant="text"
                    v-bind="props"
                    color="var(--sidebar-text-secondary)"
                  />
                </template>
                <v-card
                  :class="isDark ? 'modern-glass-menu elevation-0' : 'elevation-3'"
                  :color="isDark ? '' : '#ffffff'"
                  rounded="lg"
                  min-width="220"
                  style="overflow: hidden; border: 1px solid rgba(150, 150, 150, 0.1);"
                >
                  <v-list
                    class="py-2"
                    :bg-color="isDark ? 'transparent' : '#ffffff'"
                  >
                    <div
                      class="text-caption font-weight-bold mb-2 mx-4 mt-1"
                      style="color: var(--sidebar-text-secondary);"
                    >
                      Filtrar pesquisa por:
                    </div>
                    <v-list-item
                      :active="searchFilters.includes('name')"
                      active-color="var(--accent-blue)"
                      class="mx-2 rounded-lg mb-1"
                      style="min-height: 40px;"
                      @click="toggleSearchFilter('name')"
                    >
                      <div class="d-flex align-center">
                        <v-icon :icon="searchFilters.includes('name') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                        <span class="text-body-2 font-weight-medium">Nome da música</span>
                      </div>
                    </v-list-item>
                    <v-list-item
                      :active="searchFilters.includes('albums')"
                      active-color="var(--accent-blue)"
                      class="mx-2 rounded-lg mb-1"
                      style="min-height: 40px;"
                      @click="toggleSearchFilter('albums')"
                    >
                      <div class="d-flex align-center">
                        <v-icon :icon="searchFilters.includes('albums') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                        <span class="text-body-2 font-weight-medium">Álbum/Coletânea</span>
                      </div>
                    </v-list-item>
                    <v-list-item
                      disabled
                      class="mx-2 rounded-lg mb-1"
                      style="min-height: 40px;"
                    >
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-circle-outline" size="small" class="mr-3" />
                        <span class="text-body-2 font-weight-medium">Letra da música (em breve)</span>
                      </div>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </template>
          </v-text-field>
        </div>

        <div v-if="(searchQuery || shouldShowHistory)" style="flex: 1;" />
      </div>

      <div v-if="searchQuery || shouldShowHistory" class="content-main">
        <div v-if="searchQuery" class="dashboard-section music-section h-100 d-flex flex-column" style="min-height: 0;">
          <h2 class="section-title mb-4">
            Resultados da Pesquisa
          </h2>
          <div class="music-list flex-grow-1 d-flex flex-column" style="min-height: 0; background: transparent; box-shadow: none;">
            <LTable
              v-model="searchData"
              :search="searchQuery"
              :searchable-fields="searchableFields"
              sort-by="name"
              :file="`${$i18n.locale}_musics`"
              class="flex-grow-1 d-flex flex-column"
              style="background: transparent; min-height: 0;"
            >
              <div v-if="searchData.data && searchData.data.length === 0" class="d-flex flex-column align-center justify-center w-100" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
                <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">
                  mdi-magnify
                </v-icon>
                <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
                  Nenhuma música encontrada
                </p>
              </div>
              <tbody v-else class="music-list-container">
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
                      {{ item.albums ? item.albums.map((a: any) => a.name).join(', ') : '' }}
                    </p>
                  </td>
                  <td class="music-duration pr-4" style="border-bottom: none;">
                    {{ $datetime.shortTime(item.duration) }}
                  </td>
                  <td style="border-bottom: none;">
                    <div class="d-flex justify-end pr-4">
                      <LMusicMenuTable
                        :id-music="item.id_music"
                        :has-instrumental-music="item.has_instrumental_music"
                      />
                    </div>
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
              <v-icon size="48" color="grey-lighten-1">
                mdi-music-box-multiple-outline
              </v-icon>
              <p>{{ t("no_collections_played") }}</p>
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

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";
import { useTheme } from "vuetify";
import { computed } from "vue";

import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

export default defineComponent({
  name: manifest.id,
  components: {
    MenuToggleButton,
    LTable,
    LMusicMenuTable,
  },
  setup() {
    const theme = useTheme();
    const isDark = computed(() => theme.name.value === "dark");
    return { isDark };
  },
  data: () => ({
    searchQuery: "",
    searchData: { data: [] } as any,
    manifest,
    dynamicCollectionInfo: {} as Record<string, any>,
    show_home_history: true,
    hymnalImg,
    hymnal1996Img,
    searchFilters: ["name"] as string[],
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    musicModules(): any[] {
      const modules = this.$appdata.get("modules") || {};
      const musicGroup = this.$appdata.get("module_group.musics") || {};
      const musicModuleIds = musicGroup.modules || [];
      
      const result: any[] = [];
      musicModuleIds.forEach((id: string) => {
        if (modules[id]) {
          result.push({
            id,
            ...modules[id],
          });
        }
      });
      
      return result;
    },

    shouldShowHistory(): boolean {
      return this.show_home_history && (this.displayCollections.length > 0 || this.topSongs.length > 0);
    },
    
    displayCollections(): any[] {
      const recentCollections = (this as any).$history.getRecentCollections();
      
      return recentCollections.map((item: any) => {
        const dynInfo = this.dynamicCollectionInfo[item.id] || {};
        
        return {
          ...item,
          songCount: dynInfo.songCount || 0,
          url_image: dynInfo.url_image || item.url_image,
        };
      });
    },
    
    topSongs(): any[] {
      return (this as any).$history.getTopSongs(20);
    },
    
    compact(): boolean {
      return this.$vuetify.display.width <= 800;
    },
    searchableFields(): any {
      const fields: any = {};
      this.searchFilters.forEach(f => { fields[f] = true; });
      return fields;
    },
  },
  watch: {
    displayCollections: {
      handler() {
        this.fetchCollectionInfo();
      },
      deep: true,
      immediate: true,
    },
    searchFilters: {
      handler(val) {
        if (val.length === 0) {
          this.$nextTick(() => { this.searchFilters = ["name"]; });
        } else {
          this.$userdata.set("search_filters", val);
        }
      },
      deep: true,
    },
    searchQuery(newVal: string) {
      if (!newVal) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            (this.$refs.searchInput as any).focus();
          }
        });
      }
    },
    "module.show": {
      handler(newVal: boolean) {
        if (newVal) {
          const setting = this.$userdata.get("show_home_history");
          this.show_home_history = setting !== false;
          
          this.$nextTick(() => {
            if (this.$refs.searchInput) {
              (this.$refs.searchInput as any).focus();
            }
          });
        }
      },
      immediate: true,
    },
  },
  mounted() {
    const savedFilters = this.$userdata.get("search_filters");
    if (savedFilters && Array.isArray(savedFilters) && savedFilters.length > 0) {
      this.searchFilters = savedFilters;
    }
    
    this.fetchCollectionInfo();
    const setting = this.$userdata.get("show_home_history");
    this.show_home_history = setting !== false;
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    async fetchCollectionInfo() {
      const collections = this.displayCollections;
      let allCategories: any;
      
      for (const col of collections) {
        if (!this.dynamicCollectionInfo[col.id]) {
          try {
            const info: Record<string, any> = { songCount: 0, url_image: null };
            
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
                  const albumObj = cat.albums?.find((a: any) => a.id_album === col.id || a.id_album === col.module || a.id_album === col.id.replace("hymnal", "hasd"));
                  if (albumObj && albumObj.url_image) {
                    info.url_image = albumObj.url_image;
                    break;
                  }
                }
              }
            }
            
            if (info.url_image && window.electronAPI) {
              const imgRelativePath = info.url_image.replace(/^\/(musics|images|covers)\//, "");
              const localCheck = await window.electronAPI.checkMedia("covers", imgRelativePath);
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
    
    getCollectionImage(collection: any) {
      const name = this.getCollectionName(collection) || "";
      
      if (
        collection.id === "hymnal_1996" || 
        collection.module === "hymnal_1996" || 
        collection.id === "ha1996" ||
        name.includes("1996") ||
        (collection.url_image && collection.url_image.includes("1996"))
      ) {
        return this.hymnal1996Img;
      }
      
      if (
        collection.id === "hymnal" || 
        collection.module === "hymnal" || 
        collection.id === "hasd" ||
        name.includes("Hinário") ||
        name.includes("Himnario") ||
        collection.url_image === "/covers/hasd.bmp"
      ) {
        return this.$i18n.locale === "es" ? this.hymnal1996Img : this.hymnalImg;
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
    
    handleCollectionsScroll(event: WheelEvent) {
      event.preventDefault();
      
      const collectionsGrid = this.$refs.collectionsGrid as HTMLElement;
      
      if (collectionsGrid) {
        const scrollAmount = event.deltaY * 2;
        
        collectionsGrid.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    },
    
    openCollection(collection: any) {
      const name = (this.getCollectionName(collection) || "").toLowerCase();
      const id = String(collection.id).toLowerCase();
      const module = String(collection.module || "").toLowerCase();
      const img = String(collection.url_image || "").toLowerCase();

      const is1996 = id === "hymnal_1996" || 
        module === "hymnal_1996" || 
        id === "ha1996" ||
        name.includes("1996") ||
        img.includes("1996");

      const isNormal = id === "hymnal" || 
        module === "hymnal" || 
        id === "hasd" ||
        name.includes("hinário") ||
        name.includes("hinario") ||
        img.includes("hasd");

      if (is1996) {
        this.$modules.open("hymnal_1996");
        return;
      }
      
      if (isNormal) {
        this.$modules.open("hymnal");
        return;
      }
      
      if (collection.type === "album") {
        this.$media.openAlbum(collection.id);
      } else {
        this.$modules.open(collection.id);
      }
    },
    
    playSong(song: any) {
      if (song.id_music) {
        this.$media.open({ id_music: song.id_music, mode: "audio" });
      }
    },
    
    getCollectionName(collection: any): string {
      return collection.name || this.$t(collection.title) || collection.id;
    },
    
    playFirstResult() {
      if (this.searchData && this.searchData.data && this.searchData.data.length > 0) {
        const first = this.searchData.data[0];
        if (first.id_music) {
          this.$media.open({ id_music: first.id_music, mode: "audio" });
        }
      }
    },
    
    getHymnalTrack(item: any) {
      if (item && item.albums) {
        const hymnalAlbum = item.albums.find((a: any) => a.type === "hymnal");
        if (hymnalAlbum && hymnalAlbum.pivot && hymnalAlbum.pivot.track) {
          return hymnalAlbum.pivot.track;
        }
      }
      return null;
    },
    
    openAlbum(id_album: string) {
      this.$media.openAlbum(id_album);
    },
    
    toggleSearchFilter(filter: string) {
      if (this.searchFilters.includes(filter)) {
        this.searchFilters = this.searchFilters.filter((f: string) => f !== filter);
      } else {
        this.searchFilters.push(filter);
      }
    },
  },
});
</script>

<style lang="scss">
.dashboard-home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header, .hero-search-header {
  background: transparent;
}

.dashboard-home .search-bar {
  .v-field {
    background: var(--card-bg) !important;
    box-shadow: var(--shadow) !important;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    border-radius: 25px !important;
    
    .v-field__input {
      padding: 12px 20px !important;
      font-size: 14px !important;
    }
    
    .v-field__prepend-inner {
      padding-left: 16px !important;
      
      .v-icon {
        color: var(--accent-blue) !important;
        opacity: 0.7;
      }
    }
    
    &:hover {
      box-shadow: var(--shadow-hover) !important;
    }
    
    &.v-field--focused {
      border-color: var(--accent-blue);
      background: rgba(0, 151, 215, 0.05) !important;
      box-shadow: 0 4px 20px rgba(0, 151, 215, 0.15) !important;
    }
  }
}

.content-main {
  padding: 20px 32px 32px 32px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
}

.dashboard-section {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  
  &.collections-section {
    flex-shrink: 0;
    position: relative;
    min-height: 200px;
  }
  
  &.music-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  
  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--sidebar-text);
    margin: 0 !important;
    padding-bottom: 10px;
    align-self: flex-start;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}

.collections-grid {
  display: flex;
  padding: 5px;
  gap: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 16px;
  scroll-behavior: smooth;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
}

.collection-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
  overflow: hidden;
  width: clamp(150px, 20vh, 250px);
  flex-shrink: 0;
  
  &:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }
  
  .card-image {
    width: 100%;
    aspect-ratio: 1 / 1;
    height: auto;
    background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 48px;
    position: relative;
  }
  
  .card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 80px;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--sidebar-text);
      margin-bottom: auto;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .card-stats {
      font-size: 12px;
      color: var(--sidebar-text-secondary);
      margin-top: 8px;
      flex-shrink: 0;
    }
  }
}

.music-list {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .v-table__wrapper {
    background: transparent !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    flex: 1 1 auto;
    height: 100%;
    

  }
  
  table {
    background: transparent !important;
    border-spacing: 0;
  }

  tr:hover td {
    background: transparent !important;
  }
  
  .music-list-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
    

  }
}

.music-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    background: var(--sidebar-hover);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .music-number {
    font-size: 15px;
    font-weight: 600;
    line-height: 1;
    color: var(--accent-blue);
    min-width: 40px;
    margin-right: 16px;
  }
  
  .music-info {
    flex: 1;
    
    .music-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--sidebar-text);
      margin-bottom: 4px;
    }
    
    .music-artist {
      font-size: 13px;
      color: var(--sidebar-text-secondary);
    }
  }
  
  .music-duration {
    font-size: 13px;
    color: var(--sidebar-text-secondary);
  }

  .music-plays {
    font-size: 12px;
    color: var(--accent-blue);
    font-weight: 500;
    margin-right: 16px;
    white-space: nowrap;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  
  p {
    font-size: 14px;
    color: var(--sidebar-text-secondary);
    text-align: center;
  }
}

@media (max-width: 1024px) {  
  .search-header {
    padding: 16px 20px 8px 20px;
    justify-content: flex-start;
    
    .search-bar {
      max-width: 100%;
      
      .v-field__input {
        padding: 10px 16px !important;
        font-size: 13px !important;
      }
      
      .v-field__prepend-inner {
        padding-left: 12px !important;
      }
    }
  }
  
  .content-main {
    padding: 16px 20px 20px 20px;
    height: calc(100vh - 60px);
  }
  
  .collections-grid {
    gap: 16px;
    
    .collection-card {
      .card-content {
        padding: 16px;
        min-height: 70px;
        
        .card-title {
          font-size: 15px;
        }
        
        .card-stats {
          font-size: 11px;
        }
      }
    }
  }
}

@media (max-width: 768px) {  
  .search-header {
    padding: 12px 16px 6px 16px;
    
    .search-bar .v-field {
      border-radius: 20px !important;
      
      .v-field__input {
        padding: 8px 14px !important;
        font-size: 12px !important;
      }
      
      .v-field__prepend-inner {
        padding-left: 10px !important;
      }
    }
  }
  
  .collections-grid {
    gap: 12px;
    
    .collection-card {
      .card-content {
        padding: 14px;
        min-height: 65px;
      }
    }
  }
  
  .content-main {
    padding: 12px 16px 16px 16px;
    height: calc(100vh - 50px);
  }
}
</style>
