<template>
  <transition name="fade-transition">
    <div
      v-if="isOpen"
      class="first-boot-overlay d-flex flex-column align-center justify-center"
      :class="[bootThemeClass, { 'is-mac': isMac }]"
    >
      <!-- Theme Switcher Button (First Boot Welcome only) -->
      <transition name="fade-transition">
        <button
          v-if="showWelcomeScreen"
          type="button"
          class="boot-theme-toggle-btn"
          :class="{ 'is-mac': isMac }"
          :title="isDarkMode ? 'Modo Escuro (clique para alternar)' : 'Modo Claro (clique para alternar)'"
          @click="toggleTheme"
        >
          <v-icon size="19">
            {{ isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}
          </v-icon>
        </button>
      </transition>

      <!-- Background Waves Layer -->
      <div class="boot-background-layer" aria-hidden="true">
        <svg
          class="boot-waves-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="bootWaveGrad1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stop-color="var(--boot-wave-1-stop1)" />
              <stop offset="100%" stop-color="var(--boot-wave-1-stop2)" />
            </linearGradient>
            <linearGradient
              id="bootWaveGrad2"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stop-color="var(--boot-wave-2-stop1)" />
              <stop offset="100%" stop-color="var(--boot-wave-2-stop2)" />
            </linearGradient>
            <linearGradient
              id="bootWaveGrad3"
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
            >
              <stop offset="0%" stop-color="var(--boot-wave-3-stop1)" />
              <stop offset="100%" stop-color="var(--boot-wave-3-stop2)" />
            </linearGradient>
          </defs>
          <!-- Organic Wave Layer 1 (Left-to-bottom-right deep swoop) -->
          <path
            d="M -60 220 C 180 140, 320 460, 620 500 C 920 540, 1180 390, 1500 640 L 1500 960 L -60 960 Z"
            fill="url(#bootWaveGrad1)"
            opacity="0.95"
          />
          <!-- Organic Wave Layer 2 (Soft ambient dynamic ridge) -->
          <path
            d="M -60 560 C 240 500, 520 680, 860 580 C 1180 480, 1340 620, 1500 540 L 1500 960 L -60 960 Z"
            fill="url(#bootWaveGrad2)"
            opacity="0.8"
          />
          <!-- Organic Wave Layer 3 (Lower base horizon) -->
          <path
            d="M -60 720 C 380 670, 720 800, 1080 730 C 1300 690, 1420 760, 1500 740 L 1500 960 L -60 960 Z"
            fill="url(#bootWaveGrad3)"
            opacity="0.9"
          />
        </svg>
      </div>

      <!-- Main Central Content -->
      <div
        class="boot-content-wrapper text-center"
        :class="{ 'has-content': hasContentToShow }"
      >
        <!-- Brand Header: Logo, Name & Slogan -->
        <div
          class="brand-header"
          :class="{
            'is-raised': hasContentToShow,
            'mb-3': !isFirstBoot && hasContentToShow,
            'mb-8': isFirstBoot || !hasContentToShow
          }"
        >
          <div class="logo-wrapper mb-4">
            <img
              src="/ico/favicon.svg"
              width="84"
              height="84"
              class="boot-logo"
              alt="Louvor JA"
            />
          </div>

          <div class="brand-title d-flex align-center justify-center">
            <span class="brand-name">Louvor JA</span>
            <span class="brand-flute-badge ml-3">FLUTE</span>
          </div>
        </div>

        <!-- Dynamic Body: Welcome or Loading -->
        <transition name="boot-slide-fade" mode="out-in">
          <!-- WELCOME: FIRST USE LANGUAGE SELECTION -->
          <div
            v-if="showWelcomeScreen"
            key="welcome"
            class="welcome-screen-box"
          >
            <h2 class="welcome-heading mb-1">
              Bem-vindo &bull; Bienvenido
            </h2>
            <p class="welcome-subtitle mb-5">
              Escolha seu idioma principal &bull; Elige tu idioma principal
            </p>

            <div class="lang-cards-grid d-flex justify-center" style="gap: 16px;">
              <div
                role="button"
                tabindex="0"
                class="lang-card flex-grow-1"
                :class="{ 'is-selected': selectedLang === 'pt' }"
                @click="selectLanguage('pt')"
                @keydown.enter.prevent="selectLanguage('pt')"
                @keydown.space.prevent="selectLanguage('pt')"
              >
                <div class="lang-icon-wrapper mb-2">
                  <v-icon size="32" class="lang-icon">
                    mdi-earth
                  </v-icon>
                  <span class="lang-pill">PT</span>
                </div>
                <span class="lang-label">Português</span>
              </div>

              <div
                role="button"
                tabindex="0"
                class="lang-card flex-grow-1"
                :class="{ 'is-selected': selectedLang === 'es' }"
                @click="selectLanguage('es')"
                @keydown.enter.prevent="selectLanguage('es')"
                @keydown.space.prevent="selectLanguage('es')"
              >
                <div class="lang-icon-wrapper mb-2">
                  <v-icon size="32" class="lang-icon">
                    mdi-earth
                  </v-icon>
                  <span class="lang-pill">ES</span>
                </div>
                <span class="lang-label">Español</span>
              </div>
            </div>
          </div>

          <!-- LOADER PROGRESS SCREEN (Baseline for Etapa 1, ready for Etapa 2) -->
          <!-- LOADER PROGRESS SCREEN (ETAPA 2: PROGRESS, CHECKLIST & DETAIL CARD) -->
          <div
            v-else-if="showContent"
            key="loader"
            class="loader-screen-box"
          >
            <!-- Direct Boot Subtitle (only during direct boot) -->
            <p
              v-if="!isFirstBoot"
              class="loader-subtitle text-center mb-6"
            >
              {{ $t('first_boot.subtitle') }}
            </p>

            <!-- Status & Percentage Header (only when not in error) -->
            <div v-if="!hasError" class="status-meta d-flex justify-space-between align-center mb-2 px-1">
              <span class="status-text font-weight-medium">{{ statusText }}</span>
              <span v-if="!isIndeterminate && progress > 0" class="progress-percent font-weight-bold">{{ progress }}%</span>
            </div>

            <!-- Progress Bar (Normal) -->
            <div v-if="!hasError" class="progress-wrapper">
              <v-progress-linear
                v-model="progress"
                :indeterminate="isIndeterminate"
                height="6"
                rounded
                class="boot-progress-bar"
              />
            </div>

            <!-- Error Card & Recovery Options -->
            <div v-else class="boot-error-card mt-2 pa-4 text-center">
              <v-icon size="36" color="error" class="mb-2">
                mdi-alert-circle-outline
              </v-icon>
              <div class="error-msg font-weight-medium mb-4">
                {{ statusText }}
              </div>
              <div class="d-flex justify-center" style="gap: 12px;">
                <v-btn
                  color="primary"
                  class="px-5 rounded-lg font-weight-bold"
                  elevation="2"
                  @click="retrySync"
                >
                  <v-icon start size="18">
                    mdi-refresh
                  </v-icon>
                  {{ $t('first_boot.retry_button') }}
                </v-btn>

                <v-btn
                  v-if="canContinueOffline"
                  variant="outlined"
                  class="px-4 rounded-lg font-weight-medium offline-btn"
                  @click="continueOffline"
                >
                  <v-icon start size="18">
                    mdi-cloud-off-outline
                  </v-icon>
                  {{ $t('first_boot.offline_button') }}
                </v-btn>
              </div>
            </div>

            <!-- Contextual Secondary Area: Detail Card or Checklist -->
            <transition name="fade-transition" mode="out-in">
              <!-- Detail Card (e.g. Database / Library Download & Extract) -->
              <div
                v-if="detailCard"
                key="detail-card"
                class="boot-panel boot-detail-panel d-flex align-center"
              >
                <div class="detail-icon-wrap d-flex align-center justify-center mr-4">
                  <v-icon size="24" class="detail-icon">
                    {{ detailCard.icon || 'mdi-database' }}
                  </v-icon>
                </div>
                <div class="detail-text-wrap text-left">
                  <div class="detail-title font-weight-bold">
                    {{ detailCard.title }}
                  </div>
                  <div class="detail-subtitle">
                    {{ detailCard.subtitle }}
                  </div>
                </div>
              </div>

              <!-- Checklist Card (Tasks with Completed, Running, Pending states) -->
              <div
                v-else-if="tasks && tasks.length > 0"
                key="checklist"
                class="boot-panel boot-checklist-panel"
              >
                <div
                  v-for="task in tasks"
                  :key="task.id"
                  class="checklist-item d-flex align-center"
                  :class="'checklist-item--' + task.status"
                >
                  <div class="task-icon-wrap d-flex align-center justify-center mr-3">
                    <v-icon
                      v-if="task.status === 'completed'"
                      size="18"
                      class="task-icon task-icon--completed"
                    >
                      mdi-check-circle
                    </v-icon>
                    <div
                      v-else-if="task.status === 'running'"
                      class="task-spinner"
                      aria-label="Em andamento"
                    />
                    <v-icon
                      v-else-if="task.status === 'failed'"
                      size="18"
                      class="task-icon task-icon--failed"
                    >
                      mdi-alert-circle
                    </v-icon>
                    <v-icon
                      v-else
                      size="18"
                      class="task-icon task-icon--pending"
                    >
                      mdi-circle-outline
                    </v-icon>
                  </div>

                  <span class="task-label">
                    {{ task.label }}
                  </span>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import $path from "@/helpers/utils/Path";
import $alert from "@/helpers/ui/Alert";
import { fetchWithFallback } from "@/helpers/services/Api";

export default defineComponent({
  name: "FirstBootLoader",
  emits: ["boot-complete"],
  data() {
    return {
      isOpen: true as boolean,
      showContent: false as boolean,
      showWelcomeScreen: false as boolean,
      progress: 0 as number,
      statusText: "" as string,
      isFirstBoot: false as boolean,
      hasError: false as boolean,
      selectedLang: "" as string,
      isMac: false as boolean,
      tasks: [] as Array<{ id: string; label: string; status: "pending" | "running" | "completed" | "failed" }>,
      detailCard: null as null | { icon: string; title: string; subtitle: string },
      isIndeterminate: false as boolean,
      canContinueOffline: false as boolean,
      bootInterval: null as any,
      overrideTheme: null as null | "light" | "dark",
    };
  },
  computed: {
    isDarkMode(): boolean {
      if (this.overrideTheme) {
        return this.overrideTheme === "dark";
      }
      const theme = (this as any).$userdata?.get?.("theme");
      if (theme === "light") return false;
      if (theme === "dark") return true;
      if (typeof this.$vuetify !== "undefined" && this.$vuetify.theme?.global?.name) {
        return this.$vuetify.theme.global.name === "dark";
      }
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return true;
    },
    bootThemeClass(): string {
      return this.isDarkMode ? "boot-theme--dark" : "boot-theme--light";
    },
    hasContentToShow(): boolean {
      return this.showWelcomeScreen || this.showContent;
    },
  },
  mounted() {
    this.isMac = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac");
    const isElectron = typeof window !== "undefined" && !!(window.electronAPI && window.electronAPI.isElectron);
    if (!isElectron || window.location.href.includes("popup") || window.location.href.includes("stage-monitor")) {
      this.isOpen = false;
      this.$appdata.set("system_first_boot_loading", false);
      this.$emit("boot-complete");
      return;
    }

    this.statusText = this.$t("first_boot.status.starting");
    this.$appdata.set("system_first_boot_loading", true);

    window.addEventListener("show-boot-screen", this.handleManualShow);

    setTimeout(async () => {
      this.showContent = true;
      await this.checkFirstBoot();
    }, 1000);
  },
  unmounted() {
    window.removeEventListener("show-boot-screen", this.handleManualShow);
    if (this.bootInterval) {
      clearInterval(this.bootInterval);
      this.bootInterval = null;
    }
  },
  methods: {
    toggleTheme() {
      const nextTheme = this.isDarkMode ? "light" : "dark";
      this.overrideTheme = nextTheme;
      if ((this as any).$userdata && (this as any).$userdata.set) {
        (this as any).$userdata.set("theme", nextTheme);
      }
      if (typeof (this as any).$vuetify !== "undefined" && (this as any).$vuetify.theme?.global) {
        (this as any).$vuetify.theme.global.name = nextTheme;
      }
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", nextTheme);
      }
    },
    handleManualShow() {
      this.isOpen = true;
      this.showContent = false;
      this.detailCard = null;
      this.tasks = [];
      setTimeout(() => {
        this.showContent = true;
        this.progress = 36;
        this.statusText = this.$t("first_boot.status.loading_env");
        this.tasks = [
          { id: "files", label: this.$t("first_boot.tasks.checking_files"), status: "completed" },
          { id: "modules", label: this.$t("first_boot.tasks.loading_modules"), status: "running" },
          { id: "resources", label: this.$t("first_boot.tasks.preparing_resources"), status: "pending" },
        ];
        setTimeout(() => {
          this.progress = 78;
          this.statusText = this.$t("first_boot.status.downloading_db");
          this.tasks = [];
          this.detailCard = {
            icon: "mdi-database",
            title: this.$t("first_boot.database_card.title"),
            subtitle: this.$t("first_boot.database_card.subtitle"),
          };
          setTimeout(() => {
            this.progress = 92;
            this.statusText = this.$t("first_boot.status.complete");
            this.detailCard = null;
            this.tasks = [
              { id: "modules", label: this.$t("first_boot.tasks.modules_loaded"), status: "completed" },
              { id: "data", label: this.$t("first_boot.tasks.data_updated"), status: "completed" },
              { id: "interface", label: this.$t("first_boot.tasks.interface_ready"), status: "completed" },
            ];
            setTimeout(() => {
              this.isOpen = false;
            }, 3000);
          }, 2000);
        }, 2000);
      }, 1000);
    },
    async retrySync() {
      this.hasError = false;
      this.progress = 0;
      this.statusText = this.$t("first_boot.status.retrying");
      await this.runFirstBootSync();
    },
    async checkFirstBoot() {
      if (!window.electronAPI || !window.electronAPI.isElectron) {
        this.isOpen = false;
        this.$appdata.set("system_first_boot_loading", false);
        this.$emit("boot-complete");
        return;
      }
      
      this.isOpen = true;
      
      const currentLang = this.$i18n.locale || "pt";
      const isComplete: any = await window.electronAPI.getLocalDb(`sfbc_${currentLang}`);
      if (!isComplete || !isComplete.complete) {
        this.isFirstBoot = true;
        
        // Limpa os arquivos essenciais do sistema antes de baixar o novo
        if (window.electronAPI.clearSysData) {
          await window.electronAPI.clearSysData(currentLang);
        }
        
        const pendingLang = window.sessionStorage.getItem("pending_language");
        if (!pendingLang) {
          this.showWelcomeScreen = true;
        } else {
          this.$i18n.locale = pendingLang;
          await this.runFirstBootSync();
        }
      } else {
        this.isFirstBoot = false;
        this.statusText = this.$t("first_boot.status.loading_env");
        this.detailCard = null;
        this.progress = 0;
        this.tasks = [
          { id: "files", label: this.$t("first_boot.tasks.checking_files"), status: "running" },
          { id: "modules", label: this.$t("first_boot.tasks.loading_modules"), status: "pending" },
          { id: "resources", label: this.$t("first_boot.tasks.preparing_resources"), status: "pending" },
        ];

        let step = 0;
        this.bootInterval = setInterval(async () => {
          step += 1;
          this.progress = Math.min(100, step * 6);

          if (step === 5) {
            // Etapa 1: Verificação do banco de dados e arquivos
            const electronAPI = window.electronAPI;
            const hasDb = electronAPI && electronAPI.checkDatabaseExists
              ? await electronAPI.checkDatabaseExists(currentLang)
              : true;
            this.tasks[0].status = hasDb ? "completed" : "failed";
            this.tasks[1].status = "running";
            this.statusText = this.$t("first_boot.tasks.loading_modules");
          } else if (step === 11) {
            // Etapa 2: Módulos e preferências do usuário
            if (this.$userdata && this.$userdata.load) {
              this.$userdata.load();
            }
            this.tasks[1].status = "completed";
            this.tasks[2].status = "running";
            this.statusText = this.$t("first_boot.tasks.preparing_resources");
          } else if (step >= 17) {
            // Etapa 3: Interface e recursos concluídos
            if (this.bootInterval) {
              clearInterval(this.bootInterval);
              this.bootInterval = null;
            }
            this.tasks[2].status = "completed";
            this.progress = 100;
            this.statusText = this.$t("first_boot.status.complete");

            setTimeout(() => {
              this.isOpen = false;
              this.$appdata.set("system_first_boot_loading", false);
              this.$emit("boot-complete");
            }, 600);
          }
        }, 100);
      }
    },
    async selectLanguage(lang: string) {
      this.selectedLang = lang;
      this.showWelcomeScreen = false;
      this.$i18n.locale = lang;
      window.sessionStorage.setItem("pending_language", lang);
      await this.runFirstBootSync();
    },
    async fetchFromApi(file: string, retries = 5, delayMs = 1000): Promise<any> {
      try {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const response = await fetchWithFallback(`${$path.db(`/${file}`)}?${date}`, {
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
          this.tasks = [];
          this.detailCard = null;
          
          window.electronAPI.onExtractProgress((data: any) => {
            this.progress = data.progress;
          });
          
          if (window.electronAPI.onDownloadDbProgress) {
            window.electronAPI.onDownloadDbProgress((data: any) => {
              this.progress = data.progress;
            });
          }
          this.statusText = this.$t("first_boot.status.downloading_db");
          this.detailCard = {
            icon: "mdi-database",
            title: this.$t("first_boot.database_card.title"),
            subtitle: this.$t("first_boot.database_card.subtitle"),
          };
          this.tasks = [];

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
          
          let success = false;
          
          if (shouldDownloadDb) {
            try {
              const currentLang = this.$i18n.locale || "pt";
              await window.electronAPI.downloadDatabase(currentLang);
            } catch (e: any) {
              throw new Error(this.$t("first_boot.errors.db_download_fail"));
            }
          }
            
          this.statusText = this.$t("first_boot.status.extracting");
          this.progress = 0;
          this.detailCard = {
            icon: "mdi-archive-arrow-down-outline",
            title: this.$t("first_boot.status.extracting"),
            subtitle: this.$t("first_boot.database_card.subtitle"),
          };
          
          try {
            const currentLang = this.$i18n.locale || "pt";
            success = await window.electronAPI.extractLocalDb(currentLang);
          } catch (e: any) {
            throw new Error(this.$t("first_boot.errors.extraction_fail"));
          }

          if (success) {
            if (window.electronAPI.validateInstallation) {
              this.statusText = "Baixando capas dos álbuns...";
              this.progress = 0;
              this.detailCard = {
                icon: "mdi-image-multiple-outline",
                title: "Baixando capas dos álbuns",
                subtitle: this.$t("first_boot.database_card.subtitle"),
              };
              const currentLang = this.$i18n.locale || "pt";
              const missing = await window.electronAPI.validateInstallation(currentLang);
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

            try {
              const { checkAndRecoverAvatars } = await import("@/helpers/services/Developers");
              await checkAndRecoverAvatars(true);
            } catch (err) {
              console.warn("Falha no download inicial dos avatares:", err);
            }

            this.progress = 100;
            this.detailCard = null;
            this.tasks = [
              { id: "modules", label: this.$t("first_boot.tasks.modules_loaded"), status: "completed" },
              { id: "data", label: this.$t("first_boot.tasks.data_updated"), status: "completed" },
              { id: "interface", label: this.$t("first_boot.tasks.interface_ready"), status: "completed" },
            ];
            const finalLang = this.$i18n.locale || "pt";
            await window.electronAPI.saveLocalDb(`sfbc_${finalLang}`, { complete: true, date: new Date().toISOString() });
            
            const pendingLang = window.sessionStorage.getItem("pending_language");
            if (pendingLang) {
              (this as any).$userdata.set("language", pendingLang);
              window.sessionStorage.removeItem("pending_language");
            }
            
            this.statusText = this.$t("first_boot.status.complete");
            
            setTimeout(() => {
              this.isOpen = false;
              this.$appdata.set("system_first_boot_loading", false);
              this.$emit("boot-complete");
              // Auto-reload the app so all pre-loaded modules (like sync) detect the new images
              window.location.reload();
            }, 250);
            return;
          }
          
          throw new Error("Falha desconhecida ao extrair banco de dados local.");
        }
        throw new Error("Ambiente Electron não disponível.");
      } catch (err: any) {
        console.error("Erro na sincronização inicial:", err);
        this.statusText = err.message || "Erro na sincronização. Tente novamente.";
        this.hasError = true;
        this.detailCard = null;

        // Verifica se é possível operar offline com dados existentes
        try {
          const currentLang = this.$i18n.locale || "pt";
          if (window.electronAPI && window.electronAPI.checkDatabaseExists) {
            this.canContinueOffline = await window.electronAPI.checkDatabaseExists(currentLang);
          }
        } catch {
          this.canContinueOffline = false;
        }
      }
    },
    async continueOffline() {
      this.hasError = false;
      this.progress = 100;
      this.statusText = this.$t("first_boot.status.complete");
      const currentLang = this.$i18n.locale || "pt";
      if (window.electronAPI) {
        await window.electronAPI.saveLocalDb(`sfbc_${currentLang}`, {
          complete: true,
          offline: true,
          date: new Date().toISOString(),
        });
      }
      setTimeout(() => {
        this.isOpen = false;
        this.$appdata.set("system_first_boot_loading", false);
        this.$emit("boot-complete");
      }, 180);
    },
  },
});
</script>

<style lang="scss" scoped>
/* Tokens: Dark Theme (Default reference) */
.first-boot-overlay.boot-theme--dark {
  --boot-bg: #111C30;
  --boot-radial-start: #1A2A44;
  --boot-text: #F4F6FB;
  --boot-text-secondary: #A4AEC0;
  --boot-accent: #0A9DE8;
  
  /* FLUTE badge - blue accent color */
  --boot-flute-color: #0A9DE8;
  --boot-flute-bg: rgba(10, 157, 232, 0.15);
  --boot-flute-border: rgba(10, 157, 232, 0.4);
  
  /* Wave gradient colors */
  --boot-wave-1-stop1: rgba(14, 25, 45, 0.95);
  --boot-wave-1-stop2: rgba(20, 36, 62, 0.7);
  --boot-wave-2-stop1: rgba(10, 157, 232, 0.08);
  --boot-wave-2-stop2: rgba(18, 32, 54, 0.85);
  --boot-wave-3-stop1: rgba(13, 22, 38, 0.9);
  --boot-wave-3-stop2: rgba(17, 28, 48, 0.98);
  
  /* Cards & Surface */
  --boot-card-bg: rgba(22, 34, 54, 0.65);
  --boot-card-border: rgba(52, 74, 107, 0.5);
  --boot-card-hover-bg: rgba(10, 157, 232, 0.12);
  --boot-card-hover-border: #0A9DE8;
  --boot-card-selected-bg: rgba(10, 157, 232, 0.18);
  --boot-badge-bg: #111C30;
  --boot-badge-text: #0A9DE8;
  --boot-track: #1C2B42;
  --boot-icon-bg: rgba(10, 157, 232, 0.12);
  --boot-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

/* Tokens: Light Theme */
.first-boot-overlay.boot-theme--light {
  --boot-bg: #F8FAFC;
  --boot-radial-start: #FFFFFF;
  --boot-text: #0F172A;
  --boot-text-secondary: #64748B;
  --boot-accent: #0284C7;
  
  /* FLUTE badge - blue accent color */
  --boot-flute-color: #0284C7;
  --boot-flute-bg: rgba(2, 132, 199, 0.1);
  --boot-flute-border: rgba(2, 132, 199, 0.35);
  
  /* Wave gradient colors */
  --boot-wave-1-stop1: rgba(226, 238, 253, 0.85);
  --boot-wave-1-stop2: rgba(219, 234, 254, 0.5);
  --boot-wave-2-stop1: rgba(2, 132, 199, 0.06);
  --boot-wave-2-stop2: rgba(241, 245, 249, 0.85);
  --boot-wave-3-stop1: rgba(241, 245, 249, 0.9);
  --boot-wave-3-stop2: rgba(248, 250, 252, 0.98);
  
  /* Cards & Surface */
  --boot-card-bg: rgba(255, 255, 255, 0.85);
  --boot-card-border: rgba(226, 232, 240, 0.9);
  --boot-card-hover-bg: rgba(2, 132, 199, 0.06);
  --boot-card-hover-border: #0284C7;
  --boot-card-selected-bg: rgba(2, 132, 199, 0.12);
  --boot-badge-bg: #EDF2F7;
  --boot-badge-text: #0284C7;
  --boot-track: #E2E8F0;
  --boot-icon-bg: rgba(2, 132, 199, 0.08);
  --boot-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.first-boot-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  background: radial-gradient(circle at 50% 38%, var(--boot-radial-start) 0%, var(--boot-bg) 85%);
  overflow: hidden;
  user-select: none;
  transition: background-color 0.3s ease;
}

/* Background Waves */
.boot-background-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.boot-waves-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Content Wrapper */
.boot-content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 520px;
  min-height: 420px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* Brand Header: centered initially, slides smoothly up when content mounts */
.brand-header {
  width: 100%;
  transform: translateY(115px);
  transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;

  &.is-raised {
    transform: translateY(0);
  }
}

/* Screen Boxes */
.welcome-screen-box,
.loader-screen-box {
  width: 100%;
}

/* Slide-Fade transition for dynamic body */
.boot-slide-fade-enter-active {
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.12s,
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.12s;
}

.boot-slide-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.boot-slide-fade-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

.boot-slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

@media (prefers-reduced-motion: reduce) {
  .brand-header,
  .boot-logo,
  .boot-slide-fade-enter-active,
  .boot-slide-fade-leave-active {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}

/* Logo */
.boot-logo {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.25));
  animation: bootLogoEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes bootLogoEntrance {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Brand Title */
.brand-title {
  line-height: 1.1;
}

.brand-name {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--boot-text);
  white-space: nowrap;
}

.brand-flute-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-indent: 0.06em;
  padding: 3px 10px;
  border-radius: 6px;
  color: var(--boot-flute-color);
  background-color: var(--boot-flute-bg);
  border: 1px solid var(--boot-flute-border);
  line-height: 1;
  white-space: nowrap;
}

.loader-subtitle {
  color: var(--boot-text-secondary);
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  line-height: 1.4;
  opacity: 0.9;
}

/* Theme Switcher Button (First Boot Welcome) */
.boot-theme-toggle-btn {
  position: absolute;
  top: 44px;
  right: 24px;
  z-index: 100001;
  -webkit-app-region: no-drag;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--boot-card-bg);
  border: 1px solid var(--boot-card-border);
  color: var(--boot-text);
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;

  &:hover {
    background: var(--boot-card-hover-bg);
    border-color: var(--boot-card-hover-border);
    color: var(--boot-accent);
    transform: translateY(-1px) scale(1.05);
  }

  &:active {
    transform: translateY(0) scale(0.96);
  }
}

/* Welcome Screen */
.welcome-heading {
  color: var(--boot-text);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.welcome-subtitle {
  color: var(--boot-text-secondary);
  font-size: 0.88rem;
  line-height: 1.4;
}

.lang-card {
  background: var(--boot-card-bg);
  border: 1px solid var(--boot-card-border);
  border-radius: 14px;
  padding: 18px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  outline: none;

  &:hover {
    background: var(--boot-card-hover-bg);
    border-color: var(--boot-card-hover-border);
    transform: translateY(-2px);
    box-shadow: var(--boot-shadow);

    .lang-icon {
      color: var(--boot-accent);
    }
    .lang-label {
      color: var(--boot-accent);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--boot-accent);
    outline-offset: 3px;
  }

  &.is-selected {
    background: var(--boot-card-selected-bg);
    border-color: var(--boot-accent);
    box-shadow: 0 0 0 1px var(--boot-accent);

    .lang-icon {
      color: var(--boot-accent);
    }
    .lang-label {
      color: var(--boot-accent);
    }
  }
}

.lang-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.lang-icon {
  color: var(--boot-text-secondary);
  transition: color 0.2s ease;
}

.lang-pill {
  position: absolute;
  bottom: -2px;
  right: -6px;
  font-size: 0.65rem;
  font-weight: 800;
  background-color: var(--boot-badge-bg);
  color: var(--boot-badge-text);
  border: 1px solid var(--boot-card-border);
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1;
}

.lang-label {
  color: var(--boot-text);
  font-size: 1rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

/* Loader Screen */
.status-meta {
  color: var(--boot-text-secondary);
  font-size: 0.85rem;
}

.status-text {
  color: var(--boot-text-secondary);
}

.progress-percent {
  color: var(--boot-accent);
}

.progress-wrapper {
  width: 100%;
}

:deep(.boot-progress-bar) {
  background-color: var(--boot-track) !important;

  .v-progress-linear__background {
    background-color: var(--boot-track) !important;
    opacity: 1 !important;
  }

  .v-progress-linear__determinate {
    background: linear-gradient(90deg, var(--boot-accent) 0%, #38BDF8 100%) !important;
    border-radius: 999px;
    box-shadow: 0 0 10px var(--boot-accent);
  }
}

/* Secondary Panels (Detail Card & Checklist) */
.boot-panel {
  margin-top: 24px;
  background: var(--boot-card-bg);
  border: 1px solid var(--boot-card-border);
  border-radius: 14px;
  padding: 16px 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--boot-shadow);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.boot-detail-panel {
  min-height: 68px;

  .detail-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--boot-icon-bg);
    color: var(--boot-accent);
    flex-shrink: 0;
  }

  .detail-title {
    font-size: 0.95rem;
    color: var(--boot-text);
    line-height: 1.3;
  }

  .detail-subtitle {
    font-size: 0.8rem;
    color: var(--boot-text-secondary);
    line-height: 1.3;
    margin-top: 2px;
  }
}

.boot-checklist-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;

  .checklist-item {
    font-size: 0.9rem;
    color: var(--boot-text-secondary);
    transition: color 0.2s ease;

    &.checklist-item--completed {
      color: var(--boot-text);
      .task-icon--completed {
        color: var(--boot-accent);
      }
    }

    &.checklist-item--running {
      color: var(--boot-text);
      font-weight: 500;
    }

    &.checklist-item--pending {
      color: var(--boot-text-secondary);
      opacity: 0.6;
      .task-icon--pending {
        color: var(--boot-text-secondary);
      }
    }

    &.checklist-item--failed {
      color: #E65E73;
      .task-icon--failed {
        color: #E65E73;
      }
    }
  }

  .task-icon-wrap {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}

.task-spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(10, 157, 232, 0.25);
  border-top-color: var(--boot-accent);
  animation: bootTaskSpin 0.85s linear infinite;
}

@keyframes bootTaskSpin {
  to {
    transform: rotate(360deg);
  }
}

/* Error Card */
.boot-error-card {
  background: var(--boot-card-bg);
  border: 1px solid rgba(230, 94, 115, 0.4);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--boot-shadow);

  .error-msg {
    color: var(--boot-text);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .offline-btn {
    border-color: var(--boot-card-border);
    color: var(--boot-text);

    &:hover {
      background: var(--boot-card-hover-bg);
      border-color: var(--boot-accent);
      color: var(--boot-accent);
    }
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .boot-logo,
  .lang-card,
  .task-spinner {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
</style>
