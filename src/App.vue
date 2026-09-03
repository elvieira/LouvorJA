<template>
  <v-app id="app-container">
    <AppTitlebar />
    <AppAlert v-if="!isPopupWindow" />
    <AppSnackbar v-if="!isPopupWindow" />
    <FirstBootLoader @boot-complete="isAppReady = true" />
    <template v-if="isAppReady">
      <AppLoading />
      <v-btn
        v-show="false"
        v-shortkey="['ctrl', 'alt', 'd']"
        @shortkey="handleKeydown()"
      />
      <router-view />
    </template>
  </v-app>
</template>

<script>
import AppLoading from "@/layout/Loading.vue";
import FirstBootLoader from "@/layout/FirstBootLoader.vue";
import AppTitlebar from "@/layout/Titlebar.vue";
import AppAlert from "@/layout/Alert.vue";
import AppSnackbar from "@/layout/Snackbar.vue";


export default {
  name: "App",
  components: {
    AppLoading,
    FirstBootLoader,
    AppTitlebar,
    AppAlert,
    AppSnackbar,
  },
  data() {
    return {
      isAppReady: false,
      isPopupWindow: false,
    };
  },
  watch: {
    isAppReady(newVal) {
      if (newVal) {
        this.initBackgroundTasks();
      }
    },
  },
  created() {
    this.$userdata.load();
    const theme = this.$userdata.get("theme");
    if (theme !== "") {
      this.$vuetify.theme.global.name = theme;
    }
  },
  async mounted() {
    window.addEventListener("keydown", this.handleGlobalKeydown);
    
    this.isPopupWindow = window.location.href.includes("popup");
    
    if (!this.isPopupWindow && window.electronAPI && window.electronAPI.isElectron) {
      const currentLang = this.$i18n.locale || "pt";
      const isComplete = await window.electronAPI.getLocalDb(`sfbc_${currentLang}`);
      if (isComplete && isComplete.complete) {
        this.isAppReady = true;
      }
    } else {
      this.isAppReady = true;
    }

    if (this.isAppReady) {
      this.initBackgroundTasks();
    }
  },
  unmounted() {
    window.removeEventListener("keydown", this.handleGlobalKeydown);
  },
  methods: {
    initBackgroundTasks() {
      if (window.electronAPI && window.electronAPI.getDisplays) {
        window.electronAPI.getDisplays().then(displays => {
          this.$appdata.set("system_displays", displays);
        });
        
        if (window.electronAPI.onDisplaysChanged) {
          window.electronAPI.onDisplaysChanged(async () => {
            const displays = await window.electronAPI.getDisplays();
            this.$appdata.set("system_displays", displays);
            
            if (displays.length === 1) {
              const { default: $popup } = await import("@/helpers/ui/Popup");
              $popup.exit();
            }
          });
        }
      }
      
      // Inicia a sincronização silenciosa em background (se necessária)
      setTimeout(async () => {
        // Cache de avatares de desenvolvedores
        import("@/helpers/services/Developers").then(mod => mod.cacheAvatars());

        // Verificação de atualização do Banco de Dados
        if (window.electronAPI) {
          try {
            const response = await fetch("https://api.louvorja.com.br/params?type=env");
            const text = await response.text();
            const dbVersionMatch = text.match(/db_version=(\d+)/);
            if (dbVersionMatch && dbVersionMatch[1]) {
              const remoteVersion = parseInt(dbVersionMatch[1], 10);
              const localConfig = await window.electronAPI.getLocalDb("config");
              const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version) 
                ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10) 
                : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion() : 0);
              
              this.$appdata.set("modules.sync.db_version_local", localVersion);
              this.$appdata.set("modules.sync.db_version_remote", remoteVersion);
              if (remoteVersion > localVersion) {
                this.$appdata.set("modules.sync.db_update_available", true);
              } else {
                this.$appdata.set("modules.sync.db_update_available", false);
              }
            }
          } catch (e) {
            console.error("Erro ao verificar versão do banco em background:", e);
          }
        }

        // Auto-healing e validação de arquivos ausentes
        if (window.electronAPI && window.electronAPI.validateInstallation) {
          const missing = await window.electronAPI.validateInstallation();
          if (missing && missing.totalMissing > 0) {
            const { default: $snackbar } = await import("@/helpers/ui/Snackbar");
            $snackbar.show({ text: `Recuperando ${missing.totalMissing} arquivos ausentes...`, loading: true, timeout: -1, color: "orange-darken-2" });
            
            // 1. Repara os .bin primeiro localmente
            if (missing.missingBins.length > 0) {
              await window.electronAPI.repairSysdata(missing.missingBins);
            }
            
            // 2. Baixa mídias ausentes via HTTP(S) (com fallback FTP interno)
            if (missing.missingCovers.length > 0) {
              for (const file of missing.missingCovers) await window.electronAPI.downloadMedia("", "covers", file);
            }
            if (missing.missingMusic.length > 0) {
              for (const file of missing.missingMusic) await window.electronAPI.downloadMedia("", "music", file);
            }
            if (missing.missingImages.length > 0) {
              for (const file of missing.missingImages) await window.electronAPI.downloadMedia("", "slides", file);
            }
            
            // Adiciona um pequeno atraso para que o usuário consiga ler a mensagem de recuperação
            await new Promise(resolve => setTimeout(resolve, 1500));
            $snackbar.show({ text: "Todos os arquivos foram recuperados com sucesso!", color: "success", timeout: 3000 });
          }
        }
      }, 5000);
    },
    handleKeydown() {
      console.log("click ");
      this.$dev.toogle();
    },
    handleGlobalKeydown(e) {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
        return;
      }

      if (e.code === "Escape") {
        const popupModule = this.$appdata.get("popup_module");
        const externalMediaOpen = this.$appdata.get("modules.external_media.show");
        const isMediaActive = this.$appdata.get("modules.media.show") && !this.$appdata.get("modules.media.minimized");
        
        // Se a mídia estiver ativa (música tocando), não interceptamos o Esc aqui.
        // Deixamos cair para o handler de mídia abaixo que chama this.$media.close()
        // com a caixa de confirmação.
        if (!isMediaActive && (externalMediaOpen || popupModule)) {
          e.preventDefault();
          if (externalMediaOpen) {
            this.$appdata.set("modules.external_media.show", false);
            this.$appdata.set("modules.external_media.minimized", false);
            this.$appdata.set("modules.external_media.filePath", null);
          }
          if (popupModule) {
            import("@/helpers/ui/Popup").then(({ default: $popup }) => {
              $popup.exit();
            });
          }
          return;
        }
      }

      const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
      const isMediaModuleOpen = this.$appdata.get("modules.media.show");
      const isMinimized = this.$appdata.get("modules.media.minimized");

      const isActive = isFullscreen || (isMediaModuleOpen && !isMinimized);

      if (!isActive) return;

      if (e.code === "Space") {
        e.preventDefault();
        const isPaused = this.$appdata.get("modules.media.config.is_paused");
        this.$media.pause(!isPaused);
      } else if (e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "PageDown") {
        e.preventDefault();
        this.$media.nextSlide();
      } else if (e.code === "ArrowLeft" || e.code === "ArrowUp" || e.code === "PageUp") {
        e.preventDefault();
        this.$media.prevSlide();
      } else if (e.code === "Escape") {
        e.preventDefault();
        this.$media.close();
      } else if (e.code === "KeyF" || e.code === "F5") {
        e.preventDefault();
        this.$media.fullscreen(!isFullscreen);
      } else if (e.code === "KeyM") {
        e.preventDefault();
        this.$media.minimize();
      }
    },
  },
};
</script>

<style>
#app-container > div {
  height: 100vh;
}
</style>
