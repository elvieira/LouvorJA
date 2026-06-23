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
        <!-- Coletâneas Recentes -->
        <div class="dashboard-section collections-section">
          <h2 class="section-title">
            {{ t("recent_collections") }}
          </h2>
          <div 
            ref="collectionsGrid"
            class="collections-grid"
            @wheel="handleCollectionsScroll"
          >
            <div 
              v-for="collection in displayCollections" 
              :key="collection.id"
              class="collection-card"
              @click="openCollection(collection.id)"
            >
              <div class="card-image">
                <v-icon size="48">
                  {{ collection.icon }}
                </v-icon>
              </div>
              <div class="card-content">
                <h3 class="card-title">
                  {{ getCollectionName(collection) }}
                </h3>
                <p class="card-stats">
                  {{ collection.songCount || 0 }} {{ t("songs") }}
                </p>
              </div>
            </div>
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
                :key="song.id || index"
                class="music-item"
                @click="playSong(song)"
              >
                <div class="music-number">
                  {{ index + 1 }}
                </div>
                <div class="music-info">
                  <h4 class="music-title">
                    {{ song.title }}
                  </h4>
                  <p class="music-artist">
                    {{ song.artist }}
                  </p>
                </div>
                <div class="music-duration">
                  {{ song.duration || "0:00" }}
                </div>
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

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
  },
  data() {
    return {
      searchQuery: "",
      manifest: manifest,
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
    
    // Coletâneas para exibir
    displayCollections() {
      const collections = [];
      
      // Mapeia os módulos de música como coletâneas
      this.musicModules.forEach((module) => {
        collections.push({
          id: module.id,
          name: module.manifest?.name || this.$t(module.title),
          icon: module.icon || "mdi-music",
          songCount: this.getModuleSongCount(module.id),
        });
      });
      
      return collections;
    },
    
    // Músicas mais tocadas (placeholder até implementar sistema de histórico)
    topSongs() {
      return [
        {
          id: 1,
          title: this.t("sample_song_1"),
          artist: this.$t("modules.hymnal.title"),
          duration: "3:45",
        },
        {
          id: 2,
          title: this.t("sample_song_2"),
          artist: this.$t("modules.hymnal.title"),
          duration: "4:12",
        },
        {
          id: 3,
          title: this.t("sample_song_3"),
          artist: this.$t("modules.hymnal.title"),
          duration: "3:28",
        },
      ];
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    toggleSidebar() {
      // Emite para o Main.vue via evento global
      const mainEl = document.querySelector('.main-container');
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent('toggle-sidebar'));
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
    
    openCollection(collectionId) {
      // Abre o módulo correspondente
      this.$modules.open(collectionId);
    },
    
    playSong(song) {
      console.log("Playing song:", song);
      // TODO: Implementar reprodução de música
      this.$alert.info(this.t("feature_coming_soon"));
    },
    
    getCollectionName(collection) {
      return collection.name || this.$t(collection.title) || collection.id;
    },
    
    getModuleSongCount(moduleId) {
      const knownCounts = {
        hymnal: 609,
        hymnal_1996: 580,
        collections: 0,
        musics: 0,
      };
      
      return knownCounts[moduleId] || 0;
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/home.scss";
</style>
