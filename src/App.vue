<template>
  <v-app id="app-container">
    <AppTitlebar />
    <AppAlert />
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
import BackgroundSync from "@/helpers/services/BackgroundSync";

export default {
  name: "App",
  components: {
    AppLoading,
    FirstBootLoader,
    AppTitlebar,
    AppAlert,
  },
  data() {
    return {
      isAppReady: false,
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
    
    const isPopup = window.location.href.includes("popup");
    
    if (!isPopup && window.electronAPI && window.electronAPI.isElectron) {
      const isComplete = await window.electronAPI.getLocalDb("system_first_boot_complete");
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
      setTimeout(() => {
        BackgroundSync.start();
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

      const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
      const isMediaModuleOpen = this.$appdata.get("modules.media.show");
      const isMinimized = this.$appdata.get("modules.media.minimized");

      const isActive = isFullscreen || (isMediaModuleOpen && !isMinimized);

      if (!isActive) return;

      if (e.code === "Space") {
        e.preventDefault();
        const isPaused = this.$appdata.get("modules.media.config.is_paused");
        this.$media.pause(!isPaused);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        this.$media.nextSlide();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        this.$media.prevSlide();
      } else if (e.code === "Escape") {
        e.preventDefault();
        this.$media.close();
      } else if (e.code === "KeyF") {
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
