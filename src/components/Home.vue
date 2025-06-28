<template>
  <div class="dashboard-home">
    <div class="search-header">
      <!-- Botão para abrir sidebar em telas pequenas -->
      <button class="menu-toggle-btn" @click="toggleSidebar">
        <v-icon>mdi-menu</v-icon>
      </button>
      
      <div class="search-bar">
        <v-text-field
          v-model="searchQuery"
          placeholder="Procure aqui..."
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
          Coletâneas recentes
        </h2>
        <div 
          ref="collectionsGrid"
          class="collections-grid"
          @wheel="handleCollectionsScroll"
        >
          <div 
            v-for="collection in recentCollections" 
            :key="collection.id"
            class="collection-card"
            @click="openCollection(collection)"
          >
            <div class="card-image">
              <v-icon size="48">{{ collection.icon }}</v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ collection.name }}</h3>
              <p class="card-stats">{{ collection.songs }} músicas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Músicas Mais Tocadas -->
      <div class="dashboard-section music-section">
        <h2 class="section-title">
          Músicas mais tocadas
        </h2>
        <div class="music-list">
          <div class="music-list-container">
            <div 
              v-for="(song, index) in topSongs" 
              :key="song.id"
              class="music-item"
              @click="playSong(song)"
            >
              <div class="music-number">{{ index + 1 }}</div>
              <div class="music-info">
                <h4 class="music-title">{{ song.title }}</h4>
                <p class="music-artist">{{ song.artist }}</p>
              </div>
              <div class="music-duration">{{ song.duration }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardHome",
  data() {
    return {
      searchQuery: '',
      // Dados fictícios para as coletâneas recentes
      recentCollections: [
        {
          id: 1,
          name: "Hinário Adventista",
          songs: 609,
          icon: "mdi-music-clef-treble"
        },
        {
          id: 2,
          name: "Coletânea Gospel",
          songs: 45,
          icon: "mdi-album"
        },
        {
          id: 3,
          name: "Adoração & Louvor",
          songs: 32,
          icon: "mdi-heart"
        },
        {
          id: 4,
          name: "Hinário Adventista 1996",
          songs: 580,
          icon: "mdi-music-note"
        },
        {
          id: 5,
          name: "Jovens Cantores",
          songs: 28,
          icon: "mdi-account-group"
        },
        {
          id: 6,
          name: "Quarteto Harmonia",
          songs: 56,
          icon: "mdi-microphone-variant"
        }
      ],
      // Dados fictícios para as músicas mais tocadas
      topSongs: [
        {
          id: 1,
          title: "Mais Perto Quero Estar",
          artist: "Hinário Adventista",
          duration: "3:45"
        },
        {
          id: 2,
          title: "Sublime Amor",
          artist: "Hinário Adventista",
          duration: "4:12"
        },
        {
          id: 3,
          title: "Jesus, Meu Guia É",
          artist: "Hinário Adventista",
          duration: "3:28"
        },
        {
          id: 4,
          title: "Santo! Santo! Santo!",
          artist: "Hinário Adventista",
          duration: "4:01"
        },
        {
          id: 5,
          title: "Quão Grande És Tu",
          artist: "Hinário Adventista",
          duration: "3:52"
        },
        {
          id: 6,
          title: "Face a Face",
          artist: "Hinário Adventista",
          duration: "2:58"
        },
        {
          id: 7,
          title: "Vem, Senhor Jesus",
          artist: "Hinário Adventista",
          duration: "3:33"
        },
        {
          id: 8,
          title: "Castelo Forte",
          artist: "Hinário Adventista",
          duration: "4:25"
        },
        {
          id: 9,
          title: "Momento de Glória",
          artist: "Quarteto Harmonia",
          duration: "3:47"
        },
        {
          id: 10,
          title: "Jerusalém Dourada",
          artist: "Hinário Adventista",
          duration: "3:15"
        }
      ]
    }
  },
  methods: {
    toggleSidebar() {
      // Emite evento para o componente pai controlar a sidebar
      this.$emit('toggle-sidebar');
    },
    
    handleCollectionsScroll(event) {
      event.preventDefault();
      
      const collectionsGrid = this.$refs.collectionsGrid;
      
      if (collectionsGrid) {
        const scrollAmount = event.deltaY * 2;
        
        collectionsGrid.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }
}
</script>