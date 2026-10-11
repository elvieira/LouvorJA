<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page collections-module d-flex flex-column">
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <div class="search-bar ml-4 d-flex align-center" style="max-width: 800px; flex: 1; gap: 16px;">
          <v-text-field
            v-model="search"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            rounded="xl"
            @keydown.enter="playFirstResult"
          >
            <template #append-inner>
              <div class="d-flex align-center">
                <v-btn
                  v-if="search"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  class="clear-search-btn mr-1"
                  title="Limpar pesquisa"
                  @click="search = ''"
                />

                <v-menu
                  :close-on-content-click="false"
                  location="bottom end"
                  :offset="8"
                  transition="slide-y-transition"
                >
                  <template #activator="{ props: filterProps }">
                    <v-btn
                      icon="mdi-filter-variant"
                      size="small"
                      variant="text"
                      v-bind="filterProps"
                      class="filter-search-btn"
                      :class="{ 'filter-active': hasCustomFilter }"
                      :title="t('filter_by')"
                    />
                  </template>
                  <div class="search-filter-popover">
                    <div class="filter-header">
                      {{ t('filter_by') }}
                    </div>
                    <button
                      type="button"
                      class="filter-item"
                      :class="{ active: searchFilters.includes('name') }"
                      @click="toggleSearchFilter('name')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('name') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        size="18"
                        class="filter-radio-icon mr-2.5"
                      />
                      <span class="filter-label">{{ t('filter_song_name') }}</span>
                    </button>
                    <button
                      type="button"
                      class="filter-item"
                      :class="{ active: searchFilters.includes('albums') }"
                      @click="toggleSearchFilter('albums')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('albums') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        size="18"
                        class="filter-radio-icon mr-2.5"
                      />
                      <span class="filter-label">{{ t('filter_album') }}</span>
                    </button>
                    <button
                      type="button"
                      class="filter-item"
                      :class="{ active: searchFilters.includes('lyric') }"
                      @click="toggleSearchFilter('lyric')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('lyric') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        size="18"
                        class="filter-radio-icon mr-2.5"
                      />
                      <span class="filter-label">{{ t('filter_lyrics') }}</span>
                    </button>
                  </div>
                </v-menu>
              </div>
            </template>
          </v-text-field>

          <!-- Dropdown Seletor de Categoria de Coletâneas -->
          <v-menu
            :close-on-content-click="true"
            location="bottom end"
            :offset="8"
            transition="slide-y-transition"
          >
            <template #activator="{ props: catMenuProps }">
              <button
                v-bind="catMenuProps"
                type="button"
                class="category-select-btn"
                :title="selectedCategoryName"
              >
                <span class="category-name text-truncate">
                  {{ selectedCategoryName }}
                </span>
                <v-icon size="18" class="category-arrow ml-2">
                  mdi-chevron-down
                </v-icon>
              </button>
            </template>
            <div class="search-filter-popover category-dropdown-popover">
              <div class="filter-header">
                {{ t('categories') || 'Categorias' }}
              </div>
              <div class="category-items-list custom-scroll">
                <button
                  v-for="cat in categoryOptions"
                  :key="cat.id_category"
                  type="button"
                  class="filter-item category-item"
                  :class="{ active: cat.id_category === id_category }"
                  @click="id_category = cat.id_category"
                >
                  <v-icon
                    v-if="cat.id_category === id_category"
                    size="16"
                    class="mr-2 active-check"
                  >
                    mdi-check
                  </v-icon>
                  <span v-else class="check-spacer" />
                  <span class="filter-label text-truncate">{{ cat.name }}</span>
                </button>
              </div>
            </div>
          </v-menu>
        </div>
      </ModuleHeader>

      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <v-progress-linear
          v-if="loading"
          :color="$theme.primary()"
          indeterminate
        />

        <v-alert
          v-if="error"
          type="error"
          :text="error"
          variant="tonal"
          border="start"
          class="ma-2 mx-8"
        />

        <div v-if="search && search.length > 1" class="flex-grow-1 d-flex flex-column" style="min-height: 0;">
          <div v-if="indexing" class="d-flex flex-column align-center justify-center flex-grow-1 w-100">
            <v-progress-circular
              indeterminate
              color="var(--accent-blue)"
              size="48"
              class="mb-4"
            />
            <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
              {{ t('building_index') }}
            </p>
          </div>
          <div v-else-if="filteredMusics.length === 0" class="d-flex flex-column align-center justify-center flex-grow-1 w-100">
            <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">
              mdi-magnify
            </v-icon>
            <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
              {{ t('no_songs_found') }}
            </p>
          </div>
          <div v-else class="music-list flex-grow-1 d-flex flex-column" style="background: transparent; box-shadow: none; min-height: 0;">
            <v-table class="modern-hymnal-table flex-grow-1 d-flex flex-column" style="min-height: 0; background: transparent;">
              <tbody class="music-list-container">
                <tr v-for="item in filteredMusics" :key="item.id_music" class="music-item">
                  <td class="music-info pl-4">
                    <h4 class="music-title">
                      {{ item.name }}
                    </h4>
                    <p class="music-artist">
                      {{ item.album_name }}
                    </p>
                  </td>
                  <td class="music-duration">
                    {{ $datetime.shortTime(item.duration) }}
                  </td>
                  <td class="music-actions">
                    <div class="d-flex justify-end">
                      <LMusicMenuTable
                        :id-music="item.id_music"
                        :has-instrumental-music="item.has_instrumental_music"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>

        <div v-else class="collections-page-scroll flex-grow-1">
          <div class="collections-grid-wrap">
            <div 
              v-for="album in albums" 
              :key="album.id_album"
              class="collection-card"
              @click="openAlbum(album.id_album)"
            >
              <div class="card-image" :style="album.color ? `background: ${album.color}` : ''">
                <v-img 
                  v-if="album.url_image || album.local_url_image" 
                  :src="album.local_url_image || $path.file(album.url_image)" 
                  cover 
                  style="width: 100%; height: 100%; position: absolute; inset: 0;"
                />
                <v-icon v-else size="48">
                  mdi-album
                </v-icon>
              </div>
              <div class="card-content">
                <h3 class="card-title" style="-webkit-line-clamp: 2; line-clamp: 2;">
                  {{ album.name }}
                </h3>
                <p class="card-stats">
                  {{ album.subtitle || '' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";

export default defineComponent({
  name: manifest.id,
  components: {
    LMusicMenuTable,
    ModuleHeader,
  },
  data: () => ({
    search: "",
    all_musics: [] as any[],
    indexing: false,
    indexed: false,
    categories: [] as any[],
    lang: null as string | null,
    id_category: 0,
    loading: false,
    error: null as string | null,
    searchFilters: ["name"] as string[],
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    isDark(): boolean {
      return this.$vuetify?.theme?.name === "dark";
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    selectedCategoryName(): string {
      return this.categoryOptions.find((c: any) => c.id_category === this.id_category)?.name || this.t("all_collections");
    },
    hasCustomFilter(): boolean {
      return !(this.searchFilters.length === 1 && this.searchFilters.includes("name"));
    },
    categoryOptions(): any[] {
      return [
        { id_category: 0, name: this.t("all_collections") },
        ...this.categories,
      ];
    },
    albums(): any[] {
      if (!this.categories) {
        return [];
      }
      if (!this.id_category || this.id_category === 0) {
        return [
          ...new Map(
            this.categories
              .reduce((acc: any[], category: any) => acc.concat(category.albums), [])
              .map((album: any) => [album.id_album, { ...album, subtitle: null }]),
          ).values(),
        ].sort((a: any, b: any) => this.$string.sort(a.name, b.name));
      }

      return this.categories
        .filter((item: any) => item.id_category === this.id_category)[0]
        ?.albums.sort((a: any, b: any) => a.order - b.order) || [];
    },
    filteredMusics(): any[] {
      if (!this.search || this.search.length <= 1 || this.all_musics.length === 0) {
        return [];
      }
      const term = this.$string.clean(this.search);
      const isNum = !isNaN(Number(term)) && term !== "";

      const results = this.all_musics.filter((m: any) => {
        const matchesName = this.searchFilters.includes("name") ? this.$string.matchesSearch(m.name, this.search) : false;
        const matchesAlbum = (this.searchFilters.includes("albums") && m.album_name) ? this.$string.matchesSearch(m.album_name, this.search) : false;
        const matchesLyric = (this.searchFilters.includes("lyric") && m.lyric) ? this.$string.matchesSearch(m.lyric, this.search) : false;

        if (isNum && !isNaN(m.track)) {
          return Number(m.track) === Number(term) || matchesName || matchesAlbum || matchesLyric;
        }
        return matchesName || matchesAlbum || matchesLyric;
      });

      const cleanQuery = term;
      
      results.sort((a: any, b: any) => {
        if (isNum) {
          const isA = !isNaN(a.track) && Number(a.track) === Number(term);
          const isB = !isNaN(b.track) && Number(b.track) === Number(term);
          if (isA && !isB) return -1;
          if (isB && !isA) return 1;
        }
        
        const getScore = (item: any) => {
          let maxScore = 0;
          
          if (this.searchFilters.includes("name")) {
            const cleanName = this.$string.clean(item.name);
            if (cleanName.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 4);
            else if (cleanName.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 3);
          }
          
          if (this.searchFilters.includes("albums") && item.album_name) {
            const cleanAlbum = this.$string.clean(item.album_name);
            if (cleanAlbum.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 2);
            else if (cleanAlbum.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 1);
          }

          if (this.searchFilters.includes("lyric") && item.lyric) {
            const cleanLyric = this.$string.clean(item.lyric);
            if (cleanLyric.includes(cleanQuery)) maxScore = Math.max(maxScore, 1);
          }
          
          return maxScore;
        };
        
        const scoreA = getScore(a);
        const scoreB = getScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return this.$string.sort(a.name, b.name);
      });

      return results;
    },
    compact(): boolean {
      return this.$vuetify.display.width <= 600;
    },
  },
  watch: {
    searchFilters: {
      handler(val) {
        if (val.length === 0) {
          this.$nextTick(() => { this.searchFilters = ["name"]; });
        } else {
          this.$userdata.set("collections_search_filters", val);
        }
      },
      deep: true,
    },
    search(val: string) {
      if (val && val.length > 1 && !this.indexed) {
        this.buildSearchIndex();
      }
    },
  },
  async mounted() {
    const savedFilters = this.$userdata.get("collections_search_filters");
    if (savedFilters && Array.isArray(savedFilters) && savedFilters.length > 0) {
      this.searchFilters = savedFilters;
    }
    await this.loadData();
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */
    playFirstResult() {
      if (this.filteredMusics && this.filteredMusics.length > 0) {
        const first = this.filteredMusics[0];
        if (first.id_music) {
          this.$media.open({ id_music: first.id_music, mode: "audio" });
        }
      }
    },
    async loadData() {
      this.id_category = 0;
      this.categories = [];
      this.loading = true;

      this.categories = await this.$database.get(
        `${this.$i18n.locale}_categories`,
      );

      if (!this.categories) {
        this.$modules.close(this.module_id);
        return;
      }

      if (this.categories.length > 0) {
        if (window.electronAPI) {
          for (const cat of this.categories) {
            if (cat.albums) {
              cat.albums = cat.albums.filter((a: any) => ![712, 629, 713].includes(a.id_album));
              for (const album of cat.albums) {
                if (album.url_image) {
                  const imgRelativePath = album.url_image.replace(/^\/(musics|images|covers)\//, "");
                  const localCheck = await window.electronAPI.checkMedia("covers", imgRelativePath);
                  if (localCheck) {
                    album.local_url_image = localCheck;
                  }
                }
              }
            }
          }
        }
        
        // Remove categorias que ficaram sem álbuns
        this.categories = this.categories.filter((cat: any) => cat.albums && cat.albums.length > 0);
        
        // Ordenação personalizada
        const orderMap: Record<string, number> = {
          "CDs Oficiais/Ano": 2,
          Infantis: 98,
          Doxologia: 99,
        };
        
        this.categories.sort((a: any, b: any) => {
          const orderA = orderMap[a.id_category] || orderMap[a.name] || 50;
          const orderB = orderMap[b.id_category] || orderMap[b.name] || 50;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });
      }
      
      this.id_category = 0;
      this.lang = this.$i18n.locale;
      this.loading = false;
    },
    openAlbum(id_album: number) {
      this.$media.openAlbum(id_album);
    },
    async show(value: boolean) {
      if (value && this.lang !== this.$i18n.locale) {
        await this.loadData();
      }
    },
    async buildSearchIndex() {
      if (this.indexed || this.indexing) return;
      this.indexing = true;
      
      try {
        const musics: any[] = [];
        const allAlbums = this.categories.reduce((acc: any[], cat: any) => acc.concat(cat.albums), []);
        
        const uniqueAlbums = [...new Map(allAlbums.map((a: any) => [a.id_album, a])).values()];
        
        const promises = uniqueAlbums.map((a: any) => this.$database.get(`album_${a.id_album}`));
        const results = await Promise.all(promises);
        
        const lyricsMap: Record<number, string> = {};
        const allMusicsData = (await this.$database.get(`${this.$i18n.locale}_musics`)) || [];
        allMusicsData.forEach((m: any) => {
          if (m.id_music && m.lyric) {
            lyricsMap[m.id_music] = m.lyric;
          }
        });

        results.forEach((albumData: any) => {
          if (albumData && albumData.musics) {
            albumData.musics.forEach((m: any) => {
              musics.push({
                ...m,
                album_name: albumData.name,
                lyric: lyricsMap[m.id_music] || "",
              });
            });
          }
        });
        
        this.all_musics = musics;
        this.indexed = true;
      } catch (e) {
        console.error("Erro ao indexar músicas", e);
      } finally {
        this.indexing = false;
      }
    },
    close() {
      this.search = "";
      this.id_category = 0;
    },
    toggleSearchFilter(filter: string) {
      if (this.searchFilters.includes(filter)) {
        if (this.searchFilters.length > 1) {
          this.searchFilters = this.searchFilters.filter(f => f !== filter);
        }
      } else {
        this.searchFilters.push(filter);
      }
    },
  },
});
</script>

<style lang="scss">
.module-full-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  z-index: 10;
}

.module-icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 151, 215, 0.3);
}

.collections-module {
  .collections-page-scroll {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 14px 16px 36px 16px;

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

  .collections-grid-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
    gap: 22px;
    padding: 8px 8px 36px 8px;
  }

  @media (max-width: 768px) {
    .collections-grid-wrap {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      padding: 6px 4px 24px 4px;
    }
  }

  @media (max-width: 480px) {
    .collections-grid-wrap {
      grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
      gap: 12px;
    }
  }

  .collection-card {
    width: 100%;
    min-width: 0;
    background: var(--ds-surface, #30364a);
    border: 1px solid var(--ds-border, #43495b);
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    padding: 12px;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
    
    &:hover {
      border-color: rgba(0, 155, 226, 0.5);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
      transform: translateY(-4px);

      .card-image img,
      .card-image .v-img {
        transform: scale(1.04);
      }
    }

    &:active {
      transform: scale(0.98);
    }
    
    .card-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: var(--ds-surface-elevated, #353c52);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border-radius: 10px;

      img,
      .v-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.25s ease;
      }
    }
    
    .card-content {
      padding: 10px 2px 2px 2px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      background: transparent;
      
      .card-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--ds-text-primary, #f7f8fc);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }
      
      .card-stats {
        font-size: 12px;
        color: var(--ds-text-secondary, #a0a6b5);
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .modern-hymnal-table {
    background: transparent !important;
    
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
      width: 100%;
    }

    tr:hover td {
      background: transparent !important;
    }

    .music-list-container {
      display: flex;
      flex-direction: column;
      padding: 0;
      width: 100%;
    }

    .music-item {
      display: flex;
      align-items: center;
      padding: 12px 24px;
      width: 100%;
      border-bottom: 1px solid var(--border-color);
      transition: var(--transition);
      
      &:hover {
        background: var(--sidebar-hover) !important;
      }
      
      td {
        border-bottom: none !important;
        padding: 0 !important;
        height: auto !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      &:hover td,
      &:hover > td {
        background: transparent !important;
        background-color: transparent !important;
      }
    }
    
    .music-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .music-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--sidebar-text);
        margin-bottom: 2px;
        line-height: 1.2;
      }
      
      .music-artist {
        font-size: 13px;
        color: var(--sidebar-text-secondary);
        margin: 0;
      }
    }
    
    .music-duration {
      font-size: 13px;
      color: var(--sidebar-text-secondary);
      min-width: 60px;
      padding-right: 16px !important;
    }
    
    .music-actions {
      min-width: 80px;
    }
  }

  .category-select-btn {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    min-width: 170px;
    max-width: 240px;
    padding: 0 16px;
    border-radius: 20px;
    background: var(--ds-surface, #30364a);
    border: 1px solid var(--ds-border, #43495b);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    color: var(--ds-text-primary, #f7f8fc);
    cursor: pointer;
    outline: none;
    user-select: none;
    flex-shrink: 0;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    .category-name {
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1;
      color: var(--ds-text-primary, #f7f8fc);
    }

    .category-arrow {
      color: var(--ds-text-secondary, #a0a6b5);
      flex-shrink: 0;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    &:hover {
      background: var(--ds-surface-elevated, #373e55);
      border-color: rgba(0, 155, 226, 0.4);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);

      .category-arrow {
        color: var(--ds-accent, #009be2);
      }
    }

    &:active {
      transform: scale(0.99);
    }
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

  .filter-search-btn {
    color: var(--ds-text-secondary, #a0a6b5) !important;
    transition: all 0.2s ease !important;

    &:hover {
      color: var(--ds-accent, #009be2) !important;
      background: rgba(0, 155, 226, 0.1) !important;
    }

    &.filter-active {
      color: var(--ds-accent, #009be2) !important;
      background: rgba(0, 155, 226, 0.15) !important;
    }
  }
}

.search-filter-popover {
  background: var(--ds-surface, #30364a) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28) !important;
  padding: 8px !important;
  min-width: 200px;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &.category-dropdown-popover {
    min-width: 220px;
    max-width: 280px;

    .category-items-list {
      max-height: 360px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-right: 2px;
    }
  }

  .filter-header {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--ds-text-secondary, #a0a6b5);
    padding: 6px 12px 4px 12px;
    line-height: 1;
  }

  .filter-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 9px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: var(--ds-text-primary, #f7f8fc);
    text-align: left;
    outline: none;

    .filter-label {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.2;
    }

    .filter-radio-icon {
      font-size: 18px;
      color: var(--ds-text-secondary, #a0a6b5);
      transition: color 0.15s ease;
      flex-shrink: 0;
    }

    .active-check {
      color: var(--ds-accent, #009be2);
      flex-shrink: 0;
    }

    .check-spacer {
      width: 16px;
      margin-right: 8px;
      flex-shrink: 0;
    }

    &:hover {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
      color: var(--ds-accent, #009be2);

      .filter-radio-icon {
        color: var(--ds-accent, #009be2);
      }
    }

    &.active {
      background: rgba(0, 155, 226, 0.14) !important;
      color: var(--ds-accent, #009be2) !important;
      font-weight: 600;

      .filter-radio-icon {
        color: var(--ds-accent, #009be2) !important;
      }

      .filter-label {
        font-weight: 600;
      }
    }
  }
}

// Suporte ao tema claro
:root[data-theme="light"],
.v-theme--light {
  .collections-module {
    .category-select-btn {
      background: #FFFFFF;
      border-color: var(--ds-border, #DEE4EC);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      color: var(--ds-text-primary, #30333A);

      .category-name {
        color: var(--ds-text-primary, #30333A);
      }

      .category-arrow {
        color: #94A3B8;
      }

      &:hover {
        background: #F8FAFC;
        border-color: var(--ds-accent, #008FD0);

        .category-arrow {
          color: var(--ds-accent, #008FD0);
        }
      }
    }

    .search-bar {
      .v-field {
        background: #FFFFFF !important;
        border-color: var(--ds-border, #DEE4EC) !important;
        
        .v-field__input {
          color: var(--ds-text-primary, #30333A) !important;

          &::placeholder {
            color: var(--ds-text-secondary, #6D7480) !important;
          }
        }

        .v-field__prepend-inner .v-icon {
          color: #94A3B8 !important;
        }

        &:hover {
          border-color: rgba(0, 155, 226, 0.45) !important;
        }

        &.v-field--focused {
          border-color: var(--ds-accent, #009be2) !important;
          box-shadow: 0 0 0 3px rgba(0, 155, 226, 0.15) !important;

          .v-field__prepend-inner .v-icon {
            color: var(--ds-accent, #009be2) !important;
          }
        }
      }
    }

    .collection-card {
      background: #FFFFFF;
      border-color: var(--ds-border, #DEE4EC);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .card-image {
        background: #F1F5F9;
      }

      .card-content {
        .card-title {
          color: var(--ds-text-primary, #30333A);
        }
        .card-stats {
          color: var(--ds-text-secondary, #6D7480);
        }
      }

      &:hover {
        border-color: var(--ds-accent, #008FD0);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .search-filter-popover {
    background: #FFFFFF !important;
    border: 1px solid var(--ds-border, #E2E8F0) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;

    .filter-header {
      color: #64748B;
    }

    .filter-item {
      color: var(--ds-text-primary, #334155);

      .filter-radio-icon {
        color: #94A3B8;
      }

      &:hover {
        background: rgba(0, 155, 226, 0.08);
        color: var(--ds-accent, #008fd0);

        .filter-radio-icon {
          color: var(--ds-accent, #008fd0);
        }
      }

      &.active {
        background: rgba(0, 155, 226, 0.14) !important;
        color: var(--ds-accent, #008fd0) !important;

        .filter-radio-icon {
          color: var(--ds-accent, #008fd0) !important;
        }

        .active-check {
          color: var(--ds-accent, #008fd0);
        }
      }
    }
  }
}
</style>
