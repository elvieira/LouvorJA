<template>
  <div class="dashboard-home">
    <div class="search-header">
      <!-- Botão para abrir sidebar em telas pequenas -->
      <MenuToggleButton style="margin: 0;" @toggle-sidebar="toggleSidebar" />
      
      <div class="search-bar">
        <v-text-field
          v-model="searchQuery"
          :placeholder="$t('home.search_placeholder')"
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
          {{ $t("home.recent_collections") }}
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
                {{ collection.songCount || 0 }} {{ $t("home.songs") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Músicas Mais Tocadas -->
      <div class="dashboard-section music-section">
        <h2 class="section-title">
          {{ $t("home.top_songs") }}
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
</template>

<script>
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default {
  name: "HomePage",
  components: {
    MenuToggleButton,
  },
  emits: ["toggle-sidebar"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
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
    
    // Coletâneas para exibir (simulação até ter dados reais)
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
      // Por enquanto, retorna dados de exemplo
      // TODO: Implementar sistema de histórico/contagem de reprodução
      return [
        {
          id: 1,
          title: this.$t("home.sample_song_1"),
          artist: this.$t("modules.hymnal.title"),
          duration: "3:45",
        },
        {
          id: 2,
          title: this.$t("home.sample_song_2"),
          artist: this.$t("modules.hymnal.title"),
          duration: "4:12",
        },
        {
          id: 3,
          title: this.$t("home.sample_song_3"),
          artist: this.$t("modules.hymnal.title"),
          duration: "3:28",
        },
      ];
    },
  },
  methods: {
    toggleSidebar() {
      this.$emit("toggle-sidebar");
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
      this.$alert.info(this.$t("home.feature_coming_soon"));
    },
    
    getCollectionName(collection) {
      return collection.name || this.$t(collection.title) || collection.id;
    },
    
    getModuleSongCount(moduleId) {
      // Contagens conhecidas para os módulos principais
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
