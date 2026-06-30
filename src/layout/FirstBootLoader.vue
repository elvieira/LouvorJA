<template>
  <transition name="fade-transition">
    <div v-if="isOpen" class="first-boot-overlay d-flex flex-column align-center justify-center bg-main">
      <transition name="fade-transition">
        <div v-if="showContent" class="text-center" style="max-width: 500px; width: 100%;">
        <img src="/ico/favicon.svg" width="80" class="mb-6 pulse-anim" />
        <h2 class="text-h4 font-weight-bold mb-2" style="color: var(--sidebar-text);">
          {{ isFirstBoot ? 'Preparando o Louvor JA' : 'Iniciando o Louvor JA' }}
        </h2>
        <p class="text-subtitle-1 mb-8" style="color: var(--sidebar-text-secondary);">
          Aguarde instantes enquanto organizamos tudo para você.
        </p>

        <div class="mb-2 d-flex justify-space-between align-center px-4">
          <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">{{ statusText }}</span>
          <span class="text-caption font-weight-bold" style="color: var(--accent-blue);">{{ progress }}%</span>
        </div>
        
        <div class="px-4">
          <v-progress-linear
            v-if="!hasError"
            v-model="progress"
            color="primary"
            height="8"
            rounded
            striped
          ></v-progress-linear>
          
          <v-btn
            v-else
            color="primary"
            class="mt-4"
            @click="retrySync"
          >
            Tentar Novamente
          </v-btn>
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
      hasError: false,
    };
  },
  mounted() {
    if (window.location.href.includes('popup')) {
      this.isOpen = false;
      return;
    }

    window.addEventListener('show-boot-screen', this.handleManualShow);
    
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
    async retrySync() {
      this.hasError = false;
      this.progress = 0;
      this.statusText = "Tentando novamente...";
      await this.runFirstBootSync();
    },
    async checkFirstBoot() {
      if (!window.electronAPI || !window.electronAPI.isElectron) return;
      
      this.isOpen = true;
      
      const isComplete = await window.electronAPI.getLocalDb("system_first_boot_complete");
      if (!isComplete || !isComplete.complete) {
        this.isFirstBoot = true;
        
        this.statusText = "Preparando nova instalação...";
        if (window.electronAPI.clearAllData) {
          await window.electronAPI.clearAllData();
        }
        
        await this.runFirstBootSync();
      } else {
        this.isFirstBoot = false;
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
    async fetchFromApi(file, retries = 5, delayMs = 1000) {
      try {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const response = await fetch(`${$path.db(`/${file}`)}?${date}`, {
          headers: { "Api-Token": import.meta.env.VITE_API_TOKEN },
        });
        
        if (response.status === 429 && retries > 0) {
          console.warn(`Rate limit 429 em ${file}. Tentando novamente em ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.fetchFromApi(file, retries - 1, delayMs * 1.5);
        }
        
        if (!response.ok) {
          if (retries > 0 && response.status >= 500) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return this.fetchFromApi(file, retries - 1, delayMs * 1.5);
          }
          throw new Error(`Servidor retornou erro ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0 && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.fetchFromApi(file, retries - 1, delayMs * 1.5);
        }
        throw error;
      }
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
        if (window.electronAPI) {
          this.progress = 0;
          this.statusText = "Preparando...";
          
          window.electronAPI.onExtractProgress((data) => {
            this.progress = data.progress;
          });
          
          await this.fetchAndSave("config");
          
          const success = await window.electronAPI.extractLocalDb();
          if (success) {
            this.statusText = "Baixando capas dos álbuns...";
            this.progress = 0;
            
            // Baixa todas as capas
            const categories = await window.electronAPI.getLocalDb("pt_categories");
            if (categories && Array.isArray(categories)) {
              let allImages = new Set();
              for (const cat of categories) {
                if (cat.albums && Array.isArray(cat.albums)) {
                  cat.albums.forEach(a => {
                    if (a.url_image) allImages.add(a.url_image);
                  });
                }
              }
              
              const imagesToDownload = Array.from(allImages);
              const totalImages = imagesToDownload.length;
              let processedImages = 0;
              
              for (const urlImage of imagesToDownload) {
                const imgFilename = urlImage.split('/').pop();
                await this.downloadCoverImage(urlImage, imgFilename);
                processedImages++;
                this.progress = Math.floor((processedImages / totalImages) * 100);
              }
            }

            await window.electronAPI.saveLocalDb("system_first_boot_complete", { complete: true });
            this.progress = 100;
            this.statusText = "Sincronização Concluída!";
            
            setTimeout(() => {
              this.isOpen = false;
              this.$emit('boot-complete');
              // Auto-reload the app so all pre-loaded modules (like sync) detect the new images
              window.location.reload();
            }, 1000);
            return;
          }
        }
        
        throw new Error("Falha ao extrair banco de dados local.");
      } catch (err) {
        console.error("Erro na sincronização inicial:", err);
        this.statusText = "Erro na extração. Tente novamente.";
        this.hasError = true;
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
