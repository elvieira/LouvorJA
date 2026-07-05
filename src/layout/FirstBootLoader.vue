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
              v-if="!hasError && !showLegacyOption"
              v-model="progress"
              color="primary"
              height="8"
              rounded
              striped
            />
          
            <!-- Legacy DB Import Option (Windows only, first boot) -->
            <div v-if="showLegacyOption && !isImporting" class="mt-6">
              <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                {{ legacyScanMessage }}
              </p>
              <div class="d-flex justify-center ga-2">
                <v-btn
                  v-if="legacyDbFound"
                  color="primary"
                  prepend-icon="mdi-database-import"
                  @click="importLegacyDb"
                >
                  Importar do Desktop
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-cloud-download"
                  @click="skipLegacyImport"
                >
                  Baixar da Internet
                </v-btn>
              </div>
            </div>

            <!-- Progresso da importação legada -->
            <div v-if="isImporting">
              <p class="text-caption mb-2" style="color: var(--sidebar-text-secondary);">
                Importando dados do Desktop...
              </p>
              <v-progress-linear
                v-model="progress"
                color="primary"
                height="8"
                rounded
                striped
              />
            </div>
          
            <v-btn
              v-else-if="hasError"
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
      // Legacy import
      showLegacyOption: false,
      legacyDbFound: false,
      legacyDbVersion: null,
      legacyScanMessage: "Verificando dados do LouvorJA Desktop...",
      isImporting: false,
    };
  },
  mounted() {
    if (window.location.href.includes("popup")) {
      this.isOpen = false;
      return;
    }

    window.addEventListener("show-boot-screen", this.handleManualShow);
    
    setTimeout(async () => {
      this.showContent = true;
      await this.checkFirstBoot();
    }, 1000);
  },
  unmounted() {
    window.removeEventListener("show-boot-screen", this.handleManualShow);
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
        
        // Verifica se há DB legado do Delphi (Windows only)
        await this.scanForLegacyDb();
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
    async scanForLegacyDb() {
      if (!window.electronAPI?.scanLegacyDb) {
        // Scan não disponível (Linux/macOS ou versão antiga) — segue direto pro download
        await this.runFirstBootSync();
        return;
      }

      this.statusText = "Verificando dados locais...";
      this.progress = 0;
      
      try {
        const result = await window.electronAPI.scanLegacyDb();
        
        if (result.found) {
          this.legacyDbFound = true;
          this.legacyDbVersion = result.version;
          this.legacyScanMessage = `Encontrado LouvorJA Desktop (versão ${result.version || "desconhecida"}). Deseja importar seus dados?`;
          this.showLegacyOption = true;
          this.statusText = "Dados do Desktop encontrados!";
        } else {
          this.legacyScanMessage = result.message || "Nenhum dado local encontrado.";
          // Sem legacy — segue download normal após breve pausa
          await new Promise(r => setTimeout(r, 800));
          await this.runFirstBootSync();
        }
      } catch (err) {
        console.warn("[LegacyScan] Erro:", err);
        await this.runFirstBootSync();
      }
    },
    async importLegacyDb() {
      this.showLegacyOption = false;
      this.isImporting = true;
      this.progress = 0;
      this.statusText = "Importando dados do Desktop...";
      
      if (window.electronAPI?.onExtractProgress) {
        window.electronAPI.onExtractProgress((data) => {
          this.progress = data.progress;
          if (data.text) this.statusText = data.text;
        });
      }
      
      try {
        const result = await window.electronAPI.importLegacyDb();
        
        if (result.success) {
          this.isImporting = false;
          this.progress = 100;
          this.statusText = "Importação concluída! Finalizando...";
          
          await window.electronAPI.saveLocalDb("system_first_boot_complete", { complete: true });
          
          setTimeout(() => {
            this.isOpen = false;
            this.$emit("boot-complete");
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(result.message || "Falha na importação");
        }
      } catch (err) {
        console.error("[LegacyImport] Erro:", err);
        this.isImporting = false;
        this.statusText = `Erro: ${err.message}`;
        this.hasError = true;
      }
    },
    async skipLegacyImport() {
      this.showLegacyOption = false;
      await this.runFirstBootSync();
    },
    async downloadCoverImage(urlPath, filename) {
      if (window.electronAPI && urlPath) {
        const fullUrl = `${$path.file(urlPath)}`;
        await window.electronAPI.downloadMedia(fullUrl, "covers", filename);
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
          
          if (window.electronAPI.onDownloadDbProgress) {
            window.electronAPI.onDownloadDbProgress((data) => {
              this.progress = data.progress;
            });
          }
          
          await this.fetchAndSave("config");
          
          this.statusText = "Baixando banco de dados...";
          this.progress = 0;
          await window.electronAPI.downloadDatabase();
          
          this.statusText = "Extraindo dados locais...";
          this.progress = 0;
          
          const success = await window.electronAPI.extractLocalDb();
          if (success) {
            this.progress = 100;
            await window.electronAPI.saveLocalDb("system_first_boot_complete", { complete: true });
            this.progress = 100;
            this.statusText = "Sincronização Concluída!";
            
            setTimeout(() => {
              this.isOpen = false;
              this.$emit("boot-complete");
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
    },
  },
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
