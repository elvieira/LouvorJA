<template>
  <transition name="fade-transition">
    <div v-if="isOpen" class="first-boot-overlay d-flex flex-column align-center justify-center bg-main">
      <transition name="fade-transition">
        <div v-if="showContent" class="text-center" style="max-width: 500px; width: 100%;">
        <img src="/ico/favicon.svg" width="80" class="mb-6 pulse-anim" />
        <h2 class="text-h4 font-weight-bold mb-2" style="color: var(--sidebar-text);">
          {{ isFirstBoot ? 'Preparando o LouvorJA' : 'Iniciando o LouvorJA' }}
        </h2>
        <p class="text-subtitle-1 mb-8" style="color: var(--sidebar-text-secondary);">
          Aguarde instantes enquanto organizamos tudo para você.<br/>
          <span v-if="isFirstBoot" class="font-italic text-caption">Na primeira inicialização, este processo pode demorar alguns minutos.</span>
        </p>

        <div class="mb-2 d-flex justify-space-between align-center px-4">
          <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">{{ statusText }}</span>
          <span class="text-caption font-weight-bold" style="color: var(--accent-blue);">{{ progress }}%</span>
        </div>
        
        <div class="px-4">
          <v-progress-linear
            v-model="progress"
            color="primary"
            height="8"
            rounded
            striped
          ></v-progress-linear>
        </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import $path from "@/helpers/Path";

export default {
  name: "FirstBootLoader",
  data() {
    return {
      isOpen: true,
      showContent: false,
      progress: 0,
      statusText: "Iniciando...",
      isFirstBoot: false,
    };
  },
  mounted() {
    window.addEventListener('show-boot-screen', this.handleManualShow);
    
    // Aguarda 1 segundo antes de exibir os componentes internos e fazer o check
    setTimeout(async () => {
      this.showContent = true;
      await this.checkFirstBoot();
    }, 1000);
  },
  unmounted() {
    window.removeEventListener('show-boot-screen', this.handleManualShow);
  },
  methods: {
    handleManualShow() {
      this.isOpen = true;
      this.showContent = false;
      setTimeout(() => {
        this.showContent = true;
        this.progress = 50;
        this.statusText = "Modo de visualização (fechando em 5s)...";
        setTimeout(() => {
          this.isOpen = false;
        }, 5000);
      }, 1000);
    },
    async checkFirstBoot() {
      if (!window.electronAPI || !window.electronAPI.isElectron) return;
      
      this.isOpen = true;
      
      // Verifica se os dados essenciais já existem de forma completa
      const isComplete = await window.electronAPI.getLocalDb("system_first_boot_complete");
      if (!isComplete || !isComplete.complete) {
        this.isFirstBoot = true;
        
        // Se já existirem fragmentos, limpa tudo antes de recomeçar
        this.statusText = "Preparando nova instalação...";
        if (window.electronAPI.clearAllData) {
          await window.electronAPI.clearAllData();
        }
        
        await this.runFirstBootSync();
      } else {
        this.isFirstBoot = false;
        // Inicialização de charme animada (aprox. 2 segundos)
        this.statusText = "Carregando ambiente...";
        this.progress = 0;
        
        let step = 0;
        const interval = setInterval(() => {
          step += 1;
          this.progress = Math.min(100, step * 6); 
          if (step >= 17) {
            clearInterval(interval);
            this.progress = 100;
            setTimeout(() => {
              this.isOpen = false;
            }, 300);
          }
        }, 100);
      }
    },
    async fetchFromApi(file) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const response = await fetch(`${$path.db(`/${file}`)}?${date}`, {
        headers: { "Api-Token": import.meta.env.VITE_API_TOKEN },
      });
      if (!response.ok) return null;
      return await response.json();
    },
    async fetchAndSave(file) {
      const data = await this.fetchFromApi(file);
      if (data && window.electronAPI) {
        await window.electronAPI.saveLocalDb(file, data);
      }
      return data;
    },
    async downloadCoverImage(urlPath, filename) {
      if (window.electronAPI && urlPath) {
        const fullUrl = `${$path.file(urlPath)}`;
        await window.electronAPI.downloadMedia(fullUrl, 'covers', filename);
      }
    },
    async runFirstBootSync() {
      try {
        this.progress = 2;
        this.statusText = "Preparando...";
        
        // 1. Config
        await this.fetchAndSave("config");
        this.progress = 5;
        
        // 2. Categorias e Hinários (contém as coletâneas com os álbuns e os hinários)
        const categories = await this.fetchAndSave("pt_categories");
        const hymnal = await this.fetchAndSave("pt_hymnal");
        const hymnal1996 = await this.fetchAndSave("pt_hymnal_1996");
        this.progress = 10;
        
        if (!categories || !Array.isArray(categories)) {
          throw new Error("Falha ao baixar categorias");
        }
        
        let allSongIds = new Set();

        // Adicionar as músicas dos hinários à lista de letras para baixar
        if (hymnal && Array.isArray(hymnal)) {
          hymnal.forEach(song => allSongIds.add(song.id_music));
        }
        if (hymnal1996 && Array.isArray(hymnal1996)) {
          hymnal1996.forEach(song => allSongIds.add(song.id_music));
        }

        // 3. Álbuns e Capas — extrair todos os álbuns de todas as categorias
        let allAlbumIds = new Set();
        for (const cat of categories) {
          if (cat.albums && Array.isArray(cat.albums)) {
            cat.albums.forEach(a => allAlbumIds.add(a.id_album));
          }
        }
        
        const albumIds = Array.from(allAlbumIds);
        let processedAlbums = 0;
        const totalAlbums = albumIds.length;
        
        this.statusText = "Baixando arquivos...";
        
        for (const albumId of albumIds) {
          const albumData = await this.fetchAndSave(`album_${albumId}`);
          
          if (albumData && albumData.musics && Array.isArray(albumData.musics)) {
            albumData.musics.forEach(song => allSongIds.add(song.id_music));
          }
          
          // Baixar a capa do álbum
          if (albumData && albumData.url_image) {
            const imgFilename = albumData.url_image.split('/').pop();
            await this.downloadCoverImage(albumData.url_image, imgFilename);
          }
          
          processedAlbums++;
          this.progress = 10 + Math.floor((processedAlbums / totalAlbums) * 25);
        }
        
        // 4. Letras de Músicas (JSON) — em lotes
        const songIds = Array.from(allSongIds);
        const totalSongs = songIds.length;
        let processedSongs = 0;
        
        const batchSize = 15;
        for (let i = 0; i < songIds.length; i += batchSize) {
          const batch = songIds.slice(i, i + batchSize);
          await Promise.all(batch.map(id => this.fetchAndSave(`music_${id}`)));
          
          processedSongs += batch.length;
          this.progress = 35 + Math.floor((processedSongs / totalSongs) * 50);
        }
        
        // 5. Bíblias — livros e versões (índices)
        await this.fetchAndSave("pt_bible_book");
        const bibleVersions = await this.fetchAndSave("pt_bible_version");
        this.progress = 90;
        
        // 6. Baixar os capítulos da Bíblia (todos os capítulos de todas as versões)
        const bibleBooks = await window.electronAPI.getLocalDb("pt_bible_book");
        if (bibleBooks && Array.isArray(bibleBooks) && bibleVersions && Array.isArray(bibleVersions)) {
          let totalChapters = bibleBooks.reduce((sum, b) => sum + b.chapters, 0) * bibleVersions.length;
          let processedChapters = 0;
          
          for (const version of bibleVersions) {
            for (const book of bibleBooks) {
              const chapterBatch = [];
              for (let ch = 1; ch <= book.chapters; ch++) {
                chapterBatch.push(`bible_${version.id_bible_version}_${book.id_bible_book}_${ch}`);
              }
              // Baixa todos os capítulos desse livro em lotes de 10
              for (let i = 0; i < chapterBatch.length; i += 10) {
                const batch = chapterBatch.slice(i, i + 10);
                await Promise.all(batch.map(file => this.fetchAndSave(file)));
                processedChapters += batch.length;
                this.progress = 90 + Math.floor((processedChapters / totalChapters) * 10);
                
                if (this.progress >= 95) {
                  this.statusText = "Finalizando...";
                }
              }
            }
          }
        }
        
        // 7. Marca como instalação limpa concluída
        await window.electronAPI.saveLocalDb("system_first_boot_complete", { complete: true });
        
        this.progress = 100;
        this.statusText = "Finalizando...";
        setTimeout(() => {
          this.isOpen = false;
        }, 1500);
        
      } catch (error) {
        console.error("Erro na instalação offline:", error);
        this.statusText = "Ocorreu um erro. Verifique sua conexão e reinicie o aplicativo.";
      }
    }
  }
};
</script>

<style scoped>
.first-boot-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
}
.pulse-anim {
  animation: pulse 2s infinite ease-in-out;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
