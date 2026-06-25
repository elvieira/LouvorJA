<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <div class="search-header">
        <!-- Botão para abrir sidebar em telas pequenas -->
        <MenuToggleButton style="margin: 0;" @toggle-sidebar="toggleSidebar" />
        
        <div class="search-bar">
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded
          />
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div class="content-main">
        <!-- Resultados da Pesquisa -->
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
                albums_names: true,
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

        <template v-else>
          <!-- Coletâneas Recentes -->
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
                <div class="card-image" :style="getCollectionStyle(collection)">
                  <v-icon v-if="!getCollectionImage(collection)" size="48">
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

          <!-- Músicas Mais Tocadas -->
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

    // Pega todos os módulos de música disponíveis
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
    
    // Coletâneas para exibir (dinâmico via histórico)
    displayCollections() {
      const recentCollections = this.$history.getRecentCollections();
      
      return recentCollections.map((item) => {
        // Mescla informações dinâmicas carregadas assincronamente
        const dynInfo = this.dynamicCollectionInfo[item.id] || {};
        
        return {
          ...item,
          songCount: dynInfo.songCount || 0,
          url_image: dynInfo.url_image || item.url_image,
        };
      });
    },
    
    // Músicas mais tocadas (dinâmico via histórico)
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
        // Quando a lista mudar, busca informações dos álbuns (se faltar)
        this.fetchCollectionInfo();
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.fetchCollectionInfo();
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    async fetchCollectionInfo() {
      // Cria uma cópia da lista de coleções para iterar
      const collections = this.displayCollections;
      
      for (const col of collections) {
        if (!this.dynamicCollectionInfo[col.id]) {
          try {
            const info = { songCount: 0, url_image: null };
            
            if (col.type === "album") {
              const data = await this.$database.get(`album_${col.id}`);
              if (data) {
                // albums tem uma lista de músicas em .musics (ou .data, dependendo da API)
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
            
            // Atualiza de forma reativa
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
    
    getCollectionStyle(collection) {
      const url = this.getCollectionImage(collection);
      if (url) {
        return {
          backgroundImage: `url(${this.$path.file(url)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "transparent",
        };
      }
      return {};
    },
    
    getCollectionImage(collection) {
      return collection.url_image || null;
    },

    toggleSidebar() {
      // Emite para o Main.vue via evento global
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
    
    getCollectionName(collection) {
      return collection.name || this.$t(collection.title) || collection.id;
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
