<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Cabeçalho Integrado do Módulo -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />

        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
             <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>

        <div class="search-bar ml-4 d-flex align-center flex-wrap" style="max-width: 500px; flex: 1; gap: 16px;">
          <v-text-field
            v-model="search"
            :placeholder="t('inputs.search')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded
            @update:modelValue="onSearchInput"
            style="flex: 1; min-width: 200px;"
          />
          <v-select
            v-model="id_category"
            :items="categoryOptions"
            item-title="name"
            item-value="id_category"
            variant="solo"
            density="comfortable"
            hide-details
            rounded
            prepend-inner-icon="mdi-filter-variant"
            style="flex: 1; min-width: 160px; max-width: 100%;"
          />
        </div>
      </div>

      <!-- Conteúdo Principal do Grid de Coleções -->
      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <v-progress-linear
          :color="$theme.primary()"
          indeterminate
          v-if="loading"
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
            <v-progress-circular indeterminate color="var(--accent-blue)" size="48" class="mb-4" />
            <p style="color: var(--sidebar-text-secondary); font-weight: 500;">{{ t('status.indexing') }}</p>
          </div>
          <div v-else-if="filteredMusics.length === 0" class="d-flex flex-column align-center justify-center flex-grow-1 w-100">
            <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">mdi-magnify</v-icon>
            <p style="color: var(--sidebar-text-secondary); font-weight: 500;">{{ t('status.no_results') }}</p>
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
                  <td class="music-duration">{{ $datetime.shortTime(item.duration) }}</td>
                  <td class="music-actions">
                    <div class="d-flex justify-end">
                      <l-music-menu-table
                        :id_music="item.id_music"
                        :has_instrumental_music="item.has_instrumental_music"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>

        <div v-else class="collections-page-scroll flex-grow-1" style="overflow-y: auto; overflow-x: hidden; padding: 16px 8px;">
          <!-- Empty state: nenhum album cadastrado -->
          <div v-if="!loading && albums.length === 0" class="d-flex flex-column align-center justify-center" style="min-height: 300px;">
            <v-icon size="56" color="var(--sidebar-text-secondary)" class="mb-4">mdi-playlist-music</v-icon>
            <p style="color: var(--sidebar-text-secondary); font-weight: 500; font-size: 16px;">{{ t('status.no_albums') }}</p>
          </div>
          <div v-else class="collections-grid-wrap">
            <div 
              v-for="album in albums" 
              :key="album.id_album"
              class="collection-card"
              @click="openAlbum(album.id_album)"
            >
              <div class="card-image" :style="album.color ? `background: ${album.color}` : ''">
                <v-img 
                  v-if="album.url_image" 
                  :src="$path.file(album.url_image)" 
                  cover 
                  style="width: 100%; height: 100%; position: absolute; inset: 0;"
                />
                <v-icon v-else size="48">mdi-album</v-icon>
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

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

import LMusicMenuTable from "@/components/MusicMenuTable.vue";

export default {
  name: manifest.id,
  components: {
    LMusicMenuTable,
    MenuToggleButton,
  },
  data: () => ({
    search: "",
    all_musics: [],
    indexing: false,
    indexed: false,
    categories: [],
    lang: null,
    id_category: 0,
    loading: false,
    error: null,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    categoryOptions() {
      return [
        { id_category: 0, name: this.t("all_collections") },
        ...this.categories,
      ];
    },
    albums() {
      if (!this.categories) {
        return [];
      }
      if (!this.id_category || this.id_category === 0) {
        return [
          ...new Map(
            this.categories
              .reduce((acc, category) => acc.concat(category.albums), [])
              .map((album) => [album.id_album, { ...album, subtitle: null }])
          ).values(),
        ].sort((a, b) => this.$string.sort(a.name, b.name));
      }

      return this.categories
        .filter((item) => item.id_category == this.id_category)[0]
        ?.albums.sort((a, b) => a.order - b.order) || [];
    },
    filteredMusics() {
      if (!this.search || this.search.length <= 1 || this.all_musics.length === 0) {
        return [];
      }
      const term = this.$string.clean(this.search);
      return this.all_musics.filter(m => {
        const name = this.$string.clean(m.name);
        if (!isNaN(m.track) && !isNaN(term)) {
          return Number(m.track) === Number(term) || name.includes(term);
        }
        return name.includes(term);
      });
    },
    compact: function () {
      return this.$vuetify.display.width <= 600;
    },
  },
  watch: {
    search(val) {
      if (val && val.length > 1 && !this.indexed) {
        this.buildSearchIndex();
      }
    },
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector('.main-container');
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }
    },
    async loadData() {
      this.id_category = 0;
      this.categories = [];
      this.loading = true;

      this.categories = await this.$database.get(
        `${this.$i18n.locale}_categories`
      );

      if (this.categories == null) {
        this.$modules.close(this.module_id);
        return;
      }

      if (this.categories.length > 0) {
        this.categories.sort((a, b) => a.order - b.order);
      }
      
      this.id_category = 0;
      this.lang = this.$i18n.locale;
      this.loading = false;
    },
    openAlbum(id_album) {
      this.$media.openAlbum(id_album);
    },
    async show(value) {
      if (value && this.lang != this.$i18n.locale) {
        await this.loadData();
      }
    },
    async buildSearchIndex() {
      if (this.indexed || this.indexing) return;
      this.indexing = true;
      
      try {
        let musics = [];
        const allAlbums = this.categories.reduce((acc, cat) => acc.concat(cat.albums), []);
        
        // Remove duplicatas de álbuns
        const uniqueAlbums = [...new Map(allAlbums.map(a => [a.id_album, a])).values()];
        
        const promises = uniqueAlbums.map(a => this.$database.get(`album_${a.id_album}`));
        const results = await Promise.all(promises);
        
        results.forEach(albumData => {
          if (albumData && albumData.musics) {
            albumData.musics.forEach(m => {
              musics.push({
                ...m,
                album_name: albumData.name
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
  },
  async mounted() {
    await this.loadData();
  },
};
</script>

<style lang="scss">
/* Container do modo tela cheia integrado */
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

.collections-page-scroll {
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--border-color);
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(135deg, var(--accent-blue-dark) 0%, var(--accent-blue) 100%);
    }
  }
}

.collections-grid-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  padding: 0 16px 24px 16px;
  
  .collection-card {
    /* Força o width 100% para ocupar o cell do grid, sobrescrevendo flex-shrink do home.scss se houver */
    width: 100%;
    min-width: 0;
    flex-shrink: 1;
    margin: 0;
    cursor: pointer;
    border-radius: var(--border-radius);
    overflow: hidden;
    background: var(--card-bg);
    box-shadow: var(--shadow);
    transition: var(--transition);

    &:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);
    }
  }

  .card-image {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-content {
    padding: 12px 14px;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--sidebar-text);
    margin: 0 0 4px 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-stats {
    font-size: 13px;
    color: var(--sidebar-text-secondary);
    margin: 0;
  }
}

@media (max-width: 768px) {
  .collections-grid-wrap {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 0 8px 16px 8px;
  }
}

@media (max-width: 480px) {
  .collections-grid-wrap {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
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
  }
}

/* === MOBILE RESPONSIVENESS - Search Header === */
@media (max-width: 600px) {
  .search-header {
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 16px !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  
  .search-header .d-flex.align-center.mr-auto {
    width: 100%;
    justify-content: space-between;
    margin-right: 0;
  }
  
  .search-header .search-bar {
    width: 100%;
    max-width: 100% !important;
    flex: 1 1 100%;
    order: 2;
  }
  
  .search-header .search-bar .v-field {
    width: 100%;
  }
  
  .search-header .v-select {
    width: 100%;
    max-width: 100% !important;
  }
  
  .module-icon-box {
    width: 40px;
    height: 40px;
  }
  
  .section-title {
    font-size: 20px !important;
  }
}

/* === MOBILE RESPONSIVENESS - Collections grid extra small === */
@media (max-width: 360px) {
  .collections-grid-wrap {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
    gap: 8px !important;
    padding: 0 4px 8px 4px !important;
  }
}

/* === Continuacao do .modern-hymnal-table (regras internas) === */
.modern-hymnal-table {
  tr:hover td {
    background: transparent !important;
  }

  .music-list-container {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }

  .music-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
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
</style>
