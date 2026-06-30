<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
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

        <div class="search-bar ml-4 d-flex align-center" style="max-width: 500px; flex: 1; gap: 16px;">
          <v-text-field
            v-model="search"
            :placeholder="$t('modules.hymnal_1996.inputs.search') || 'Buscar música...'"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded
            @keydown.enter="playFirstResult"
          />
          <v-menu :close-on-content-click="true" location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="flat"
                rounded="xl"
                class="text-none px-4"
                style="height: 44px; max-width: 220px; background: var(--card-bg); box-shadow: var(--shadow);"
              >
                <div class="d-flex align-center text-truncate w-100" style="color: var(--sidebar-text);">
                  <v-icon size="small" class="mr-3 opacity-70">mdi-filter-variant</v-icon>
                  <span class="text-truncate font-weight-medium text-body-2">
                    {{ categoryOptions.find(c => c.id_category === id_category)?.name || 'Todos' }}
                  </span>
                  <v-icon size="small" class="ml-3 opacity-50">mdi-menu-down</v-icon>
                </div>
              </v-btn>
            </template>
            <v-card
              class="mt-2"
              rounded="lg"
              style="overflow: hidden; max-width: 220px; background: var(--card-bg); box-shadow: var(--shadow);"
            >
              <v-list class="py-2" bg-color="transparent">
                <v-list-item
                  v-for="cat in categoryOptions"
                  :key="cat.id_category"
                  :active="cat.id_category === id_category"
                  color="primary"
                  class="mx-2 rounded-lg mb-1"
                  style="min-height: 40px;"
                  @click="id_category = cat.id_category"
                >
                  <div class="d-flex align-center">
                    <span class="text-body-2 font-weight-medium" :class="cat.id_category === id_category ? '' : 'opacity-70'">
                      {{ cat.name }}
                    </span>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>

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
              Construindo índice de busca...
            </p>
          </div>
          <div v-else-if="filteredMusics.length === 0" class="d-flex flex-column align-center justify-center flex-grow-1 w-100">
            <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">
              mdi-magnify
            </v-icon>
            <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
              Nenhuma música encontrada
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
              .map((album) => [album.id_album, { ...album, subtitle: null }]),
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
    compact() {
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
  async mounted() {
    await this.loadData();
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    playFirstResult() {
      if (this.filteredMusics && this.filteredMusics.length > 0) {
        const first = this.filteredMusics[0];
        if (first.id_music) {
          this.$media.open({ id_music: first.id_music, mode: 'audio' });
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

      if (this.categories == null) {
        this.$modules.close(this.module_id);
        return;
      }

      if (this.categories.length > 0) {
        this.categories.sort((a, b) => a.order - b.order);
        
        if (window.electronAPI) {
          for (const cat of this.categories) {
            if (cat.albums) {
              for (const album of cat.albums) {
                if (album.url_image) {
                  const imgRelativePath = album.url_image.replace(/^\/(musics|images|covers)\//, '');
                  const localCheck = await window.electronAPI.checkMedia('covers', imgRelativePath);
                  if (localCheck) {
                    album.local_url_image = localCheck;
                  }
                }
              }
            }
          }
        }
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
        const musics = [];
        const allAlbums = this.categories.reduce((acc, cat) => acc.concat(cat.albums), []);
        
        const uniqueAlbums = [...new Map(allAlbums.map(a => [a.id_album, a])).values()];
        
        const promises = uniqueAlbums.map(a => this.$database.get(`album_${a.id_album}`));
        const results = await Promise.all(promises);
        
        results.forEach(albumData => {
          if (albumData && albumData.musics) {
            albumData.musics.forEach(m => {
              musics.push({
                ...m,
                album_name: albumData.name,
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
};
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

.collections-grid-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  padding: 0 16px 24px 16px;
  
  .collection-card {
    width: 100%;
    min-width: 0;
    flex-shrink: 1;
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
