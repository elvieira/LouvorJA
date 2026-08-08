<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <div class="search-bar ml-4 d-flex align-center" style="max-width: 500px; flex: 1; gap: 16px;">
          <v-text-field
            v-model="search"
            :placeholder="$t('modules.hymnal_1996.inputs.search') || 'Buscar música...'"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
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
                  class="pa-2"
                  rounded="lg"
                  min-width="200"
                  style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2));"
                >
                  <div
                    class="text-caption font-weight-bold mb-2 mx-2 mt-1"
                    style="color: var(--sidebar-text-secondary);"
                  >
                    Filtrar pesquisa por:
                  </div>
                  <v-list density="compact" bg-color="transparent" class="pa-0">
                    <v-checkbox
                      v-model="searchFilters"
                      value="name"
                      label="Nome da música"
                      hide-details
                      density="compact"
                      color="primary"
                      class="mb-1"
                    />
                    <v-checkbox
                      v-model="searchFilters"
                      value="albums"
                      label="Álbum/Coletânea"
                      hide-details
                      density="compact"
                      color="primary"
                      class="mb-1"
                    />
                    <v-checkbox
                      v-model="searchFilters"
                      value="lyrics"
                      label="Letra da música (em breve)"
                      hide-details
                      density="compact"
                      color="primary"
                      disabled
                    />
                  </v-list>
                </v-card>
              </v-menu>
            </template>
          </v-text-field>
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
                  <v-icon size="small" class="mr-3 opacity-70">
                    mdi-filter-variant
                  </v-icon>
                  <span class="text-truncate font-weight-medium text-body-2">
                    {{ categoryOptions.find(c => c.id_category === id_category)?.name || 'Todos' }}
                  </span>
                  <v-icon size="small" class="ml-3 opacity-50">
                    mdi-menu-down
                  </v-icon>
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
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
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

        if (isNum && !isNaN(m.track)) {
          return Number(m.track) === Number(term) || matchesName || matchesAlbum;
        }
        return matchesName || matchesAlbum;
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
          this.$userdata.set("search_filters", val);
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
    const savedFilters = this.$userdata.get("search_filters");
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
        
        results.forEach((albumData: any) => {
          if (albumData && albumData.musics) {
            albumData.musics.forEach((m: any) => {
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
