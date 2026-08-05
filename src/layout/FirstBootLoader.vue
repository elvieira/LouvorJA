<template>
  <transition name="fade-transition">
    <div v-if="isOpen" class="first-boot-overlay d-flex flex-column align-center justify-center bg-main">
      <transition name="fade-transition">
        <div v-if="showContent" class="text-center" style="max-width: 500px; width: 100%;">
          <img src="/ico/favicon.svg" width="80" class="mb-6 pulse-anim" />
          <h2 class="text-h4 font-weight-bold mb-2" style="color: var(--sidebar-text);">
            {{ isFirstBoot ? $t('first_boot.title_prepare') : $t('first_boot.title_start') }}
          </h2>
          <p class="text-subtitle-1 mb-8" style="color: var(--sidebar-text-secondary);">
            {{ $t('first_boot.subtitle') }}
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
            />
          
            <v-btn
              v-else
              color="primary"
              class="mt-4"
              @click="retrySync"
            >
              {{ $t('first_boot.retry_button') }}
            </v-btn>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import $path from "@/helpers/utils/Path";
import $alert from "@/helpers/ui/Alert";

export default defineComponent({
  name: "FirstBootLoader",
  emits: ["boot-complete"],
  data() {
    return {
      isOpen: true as boolean,
      showContent: false as boolean,
      progress: 0 as number,
      statusText: "" as string,
      isFirstBoot: false as boolean,
      hasError: false as boolean,
    };
  },
  mounted() {
    this.statusText = this.$t("first_boot.status.starting");
    this.$appdata.set("system_first_boot_loading", true);

    if (window.location.href.includes("popup")) {
      this.isOpen = false;
      this.$appdata.set("system_first_boot_loading", false);
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
        this.statusText = this.$t("first_boot.status.view_mode");
        setTimeout(() => {
          this.isOpen = false;
        }, 5000);
      }, 1000);
    },
    async retrySync() {
      this.hasError = false;
      this.progress = 0;
      this.statusText = this.$t("first_boot.status.retrying");
      await this.runFirstBootSync();
    },
    async checkFirstBoot() {
      if (!window.electronAPI || !window.electronAPI.isElectron) return;
      
      this.isOpen = true;
      
      const isComplete: any = await window.electronAPI.getLocalDb("sfbc");
      if (!isComplete || !isComplete.complete) {
        this.isFirstBoot = true;
        
        // Limpa os arquivos essenciais do sistema antes de baixar o novo
        if (window.electronAPI.clearSysData) {
          await window.electronAPI.clearSysData();
        }
        
        await this.runFirstBootSync();
      } else {
        this.isFirstBoot = false;
        this.statusText = this.$t("first_boot.status.loading_env");
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
              this.$appdata.set("system_first_boot_loading", false);
            }, 300);
          }
        }, 100);
      }
    },
    async fetchFromApi(file: string, retries = 5, delayMs = 1000): Promise<any> {
      try {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const response = await fetch(`${$path.db(`/${file}`)}?${date}`, {
          headers: { "Api-Token": import.meta.env.VITE_API_TOKEN as string },
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
      } catch (error: any) {
        if (retries > 0 && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.fetchFromApi(file, retries - 1, delayMs * 1.5);
        }
        throw error;
      }
    },
    async fetchAndSave(file: string) {
      const data = await this.fetchFromApi(file);
      if (data && window.electronAPI) {
        await window.electronAPI.saveLocalDb(file, data);
      }
      return data;
    },
    async downloadCoverImage(urlPath: string, filename: string) {
      if (window.electronAPI && urlPath) {
        const fullUrl = `${$path.file(urlPath)}`;
        await window.electronAPI.downloadMedia(fullUrl, "covers", filename);
      }
    },
    async runFirstBootSync() {
      try {
        if (window.electronAPI) {
          this.progress = 0;
          this.statusText = this.$t("first_boot.status.preparing");
          
          window.electronAPI.onExtractProgress((data: any) => {
            this.progress = data.progress;
          });
          
          if (window.electronAPI.onDownloadDbProgress) {
            window.electronAPI.onDownloadDbProgress((data: any) => {
              this.progress = data.progress;
            });
          }
          
          try {
            await this.fetchAndSave("config");
          } catch (e: any) {
            if (e.message && (e.message.includes("Failed to fetch") || e.message.includes("NetworkError"))) {
              throw new Error(this.$t("first_boot.errors.no_internet"));
            } else if (e.message && e.message.includes("429")) {
              throw new Error(this.$t("first_boot.errors.rate_limit"));
            } else {
              throw new Error(this.$t("first_boot.errors.server_fail").replace("{0}", e.message));
            }
          }
          
          this.statusText = this.$t("first_boot.status.downloading_db");
          this.progress = 0;
          
          let shouldDownloadDb = true;
          if (window.electronAPI.checkOldInstallation) {
            const hasOldVersion = await window.electronAPI.checkOldInstallation();
            if (hasOldVersion) {
              const wantsToImport = await new Promise((resolve) => {
                $alert.yesno({
                  title: this.$t("first_boot.old_version.title"),
                  text: this.$t("first_boot.old_version.text"),
                  translate: false,
                  center: true,
                }, (resp: any) => {
                  resolve(resp === "yes");
                });
              });
              
              if (wantsToImport) {
                this.statusText = this.$t("first_boot.status.importing_old");
                const imported = await window.electronAPI.importOldInstallation();
                if (imported) {
                  shouldDownloadDb = false;
                } else {
                  this.statusText = this.$t("first_boot.status.import_failed");
                }
              }
            }
          }
          
          if (shouldDownloadDb) {
            try {
              await window.electronAPI.downloadDatabase();
            } catch (e: any) {
              throw new Error(this.$t("first_boot.errors.db_download_fail"));
            }
          }
          
          this.statusText = this.$t("first_boot.status.extracting");
          this.progress = 0;
          
          let success = false;
          try {
            success = await window.electronAPI.extractLocalDb();
          } catch (e: any) {
            throw new Error(this.$t("first_boot.errors.extraction_fail"));
          }

          if (success) {
            // @ts-ignore
            if (window.electronAPI.validateInstallation) {
              this.statusText = "Baixando capas dos álbuns...";
              this.progress = 0;
              // @ts-ignore
              const missing = await window.electronAPI.validateInstallation();
              if (missing && missing.missingCovers.length > 0) {
                const total = missing.missingCovers.length;
                let current = 0;
                for (const file of missing.missingCovers) {
                  await window.electronAPI.downloadMedia("", "covers", file);
                  current++;
                  this.progress = Math.round((current / total) * 100);
                }
              }
            }

            this.progress = 100;
            await window.electronAPI.saveLocalDb("sfbc", { complete: true });
            this.progress = 100;
            this.statusText = "Concluindo...";
            
            setTimeout(() => {
              this.isOpen = false;
              this.$appdata.set("system_first_boot_loading", false);
              this.$emit("boot-complete");
              // Auto-reload the app so all pre-loaded modules (like sync) detect the new images
              window.location.reload();
            }, 1000);
            return;
          }
          
          throw new Error("Falha desconhecida ao extrair banco de dados local.");
        }
        throw new Error("Ambiente Electron não disponível.");
      } catch (err: any) {
        console.error("Erro na sincronização inicial:", err);
        this.statusText = err.message || "Erro na sincronização. Tente novamente.";
        this.hasError = true;
      }
    },
  },
});
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
