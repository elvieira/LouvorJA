<template>
  <AppSidebar v-model="sidebarOpen" />

  <div class="main-container" :class="{ 'sidebar-open': sidebarOpen }" @toggle-sidebar="toggleSidebar">
    <v-main class="bg-main">
      <AppModules />
      
      <AppTrayArea />

      <transition name="fade-slide">
        <div v-if="isMinimized && showMiniPlayer" class="mini-player-popup elevation-12">
          <v-card
            theme="dark"
            rounded="lg"
            class="overflow-hidden bg-black"
            width="320"
          >
            <div class="mini-player-toolbar d-flex justify-end pa-1 position-absolute w-100" style="z-index: 10;">
              <v-btn 
                icon
                size="x-small" 
                variant="flat" 
                color="rgba(0,0,0,0.6)" 
                class="mx-1 hover-btn"
                @click="maximizePlayer" 
              >
                <v-icon>mdi-arrow-expand-all</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Maximizar
                </v-tooltip>
              </v-btn>
              <v-btn 
                icon
                size="x-small" 
                variant="flat" 
                color="rgba(0,0,0,0.6)" 
                class="hover-btn"
                @click="showMiniPlayer = false" 
              >
                <v-icon>mdi-minus</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Minimizar
                </v-tooltip>
              </v-btn>
            </div>
            <div class="position-relative w-100 bg-black" style="height: 180px;">
              <LSlide
                v-if="slide"
                :slide_number="config.slide_index"
                :cover="slide.cover == true"
                :text="slide.lyric"
                :aux_text="slide.aux_lyric"
                :image="slide.url_image ? $path.file(slide.url_image) : null"
                :image_position="slide.image_position"
                class="w-100 h-100"
              />
              <div v-else class="w-100 h-100 d-flex align-center justify-center text-grey">
                Sem mídia
              </div>
            </div>
          </v-card>
        </div>
      </transition>

      <!-- External Media MiniPlayer -->
      <transition name="fade-slide">
        <div v-if="isExternalMediaMinimized && showExternalMiniPlayer && isExternalVideo" class="mini-player-popup elevation-12">
          <v-card
            theme="dark"
            rounded="lg"
            class="overflow-hidden bg-black"
            width="320"
          >
            <div class="mini-player-toolbar d-flex justify-end pa-1 position-absolute w-100" style="z-index: 10;">
              <v-btn 
                icon
                size="x-small" 
                variant="flat" 
                color="rgba(0,0,0,0.6)" 
                class="mx-1 hover-btn"
                @click="maximizeExternalPlayer" 
              >
                <v-icon>mdi-arrow-expand-all</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Maximizar
                </v-tooltip>
              </v-btn>
              <v-btn 
                icon
                size="x-small" 
                variant="flat" 
                color="rgba(0,0,0,0.6)" 
                class="hover-btn"
                @click="showExternalMiniPlayer = false" 
              >
                <v-icon>mdi-minus</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Minimizar
                </v-tooltip>
              </v-btn>
            </div>
            <div class="position-relative w-100 bg-black" style="height: 180px;">
              <video
                v-if="externalFilePath"
                ref="externalMiniPlayerVideo"
                :src="externalFilePath"
                class="w-100 h-100"
                style="object-fit: contain;"
                muted
                @loadedmetadata="syncMiniPlayer"
              />
              <div v-else class="w-100 h-100 d-flex align-center justify-center text-grey">
                Sem mídia
              </div>
            </div>
          </v-card>
        </div>
      </transition>
    </v-main>

    <AppFooter />
  </div>
</template>

<script>
import AppFooter from "@/layout/Footer.vue";
import AppSidebar from "@/layout/Sidebar.vue";
import AppModules from "@/layout/Modules.vue";
import AppTrayArea from "@/layout/TrayArea.vue";
import LSlide from "@/components/Slide.vue";

export default {
  name: "MainPage",
  components: {
    AppFooter,
    AppSidebar,
    AppModules,
    AppTrayArea,
    LSlide,
  },
  data() {
    return {
      sidebarOpen: false,
    };
  },
  computed: {
    showMiniPlayer: {
      get() {
        return this.$appdata.get("modules.media.show_mini_player") !== false;
      },
      set(val) {
        this.$appdata.set("modules.media.show_mini_player", val);
      },
    },
    showExternalMiniPlayer: {
      get() {
        return this.$appdata.get("modules.external_media.show_mini_player") !== false;
      },
      set(val) {
        this.$appdata.set("modules.external_media.show_mini_player", val);
      },
    },
    isMinimized() {
      return this.$media.isMinimized();
    },
    isExternalMediaMinimized() {
      return this.$appdata.get("modules.external_media.minimized") === true && this.$appdata.get("modules.external_media.filePath");
    },
    externalFilePath() {
      const raw = this.$appdata.get("modules.external_media.filePath");
      if (!raw) return "";
      if (window.electronAPI) {
        const prefix = raw.startsWith("/") ? "local://app" : "local://app/";
        return `${prefix}${raw}`;
      }
      return raw;
    },
    isExternalVideo() {
      const raw = this.$appdata.get("modules.external_media.filePath");
      if (!raw) return false;
      const ext = raw.split(".").pop().toLowerCase();
      return ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext);
    },
    externalMediaCurrentTime() {
      return this.$appdata.get("modules.external_media.config.current_time");
    },
    externalMediaIsPaused() {
      return this.$appdata.get("modules.external_media.config.is_paused");
    },
    config() {
      return this.$media.config();
    },
    slide() {
      return this.$media.slide();
    },
  },
  watch: {
    externalMediaCurrentTime(val) {
      if (this.showExternalMiniPlayer && this.$refs.externalMiniPlayerVideo) {
        const video = this.$refs.externalMiniPlayerVideo;
        if (!video.seeking && Math.abs(video.currentTime - val) > 0.5) {
          video.currentTime = val;
        }
      }
    },
    externalMediaIsPaused(val) {
      if (this.showExternalMiniPlayer && this.$refs.externalMiniPlayerVideo) {
        if (val) this.$refs.externalMiniPlayerVideo.pause();
        else this.$refs.externalMiniPlayerVideo.play().catch((err) => {
          console.error("[MiniPlayer] play() failed:", err.message);
        });
      }
    },
    showExternalMiniPlayer(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          if (!this.externalMediaIsPaused && this.$refs.externalMiniPlayerVideo) {
            this.$refs.externalMiniPlayerVideo.currentTime = this.externalMediaCurrentTime || 0;
            this.$refs.externalMiniPlayerVideo.play().catch((err) => {
              console.error("[MiniPlayer] play() failed:", err.message);
            });
          }
        });
      }
    },
    isMinimized(val) {
      if (val) {
        this.showMiniPlayer = true;
      }
    },
    isExternalMediaMinimized(val) {
      if (val && this.isExternalVideo) {
        this.showExternalMiniPlayer = true;
      }
    },
  },
  mounted() {
    this.closeAllModules();

    this.$userdata.load();

    const theme = this.$userdata.get("theme");
    if (theme !== "") {
      this.$vuetify.theme.global.name = theme;
    }
    this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);

    const lang = this.$userdata.get("language");
    if (lang !== "") {
      this.$i18n.locale = lang;
    } else {
      this.$userdata.set("language", this.$i18n.locale);
    }

    const is_dev = import.meta.env.VITE_APP_MODE === "development";
    this.$appdata.set("is_dev", is_dev);

    // beforeunload foi removido para usar o diálogo customizado de fechamento no Titlebar

    this.$appdata.set(
      "is_mobile",
      this.$vuetify.display.platform.android ||
        this.$vuetify.display.platform.ios,
    );

    if (this.$vuetify.display.platform.electron) {
      this.$appdata.set("is_desktop", true);
    } else {
      this.$appdata.set("is_desktop", false);
      this.$appdata.set("is_online", true);
    }

    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin || event.origin === "file://" || event.origin === "null") {
        if (event.data === "mounted") {
          const popupSource = event.source;
          if (popupSource) {
            const data = this.$appdata.getFlatten();
            Object.keys(data).map((item) => {
              popupSource.postMessage(
                { param: item, value: data[item] },
                "*",
              );
            });
          }
        }
      }
    });

    /*********************************************************************/
    /*********************************************************************/
    /* ********************* PROVISORIO ******************************** */
    if (is_dev) {
      //const self = this;
      setTimeout(() => {
        //self.$media.open({ id_music: 112, mode: "audio", minimized: false });
        //self.$modules.open("clock");
        //self.$modules.open("collections");
        //self.$media.openAlbum(9);
      }, 100);
    }
    /*********************************************************************/
    /*********************************************************************/

    if (window.electronAPI && window.electronAPI.isElectron) {
      window.electronAPI.onNavigateModule((moduleId) => {
        this.$modules.open(moduleId);
      });
      window.electronAPI.onNavigateRoute((routeName) => {
        if (routeName === "help") {
          this.$modules.open("help");
        }
      });
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    syncMiniPlayer() {
      const video = this.$refs.externalMiniPlayerVideo;
      if (video) {
        const currentTime = this.$appdata.get("modules.external_media.config.current_time") || 0;
        video.currentTime = currentTime;
        
        const isPaused = this.$appdata.get("modules.external_media.config.is_paused");
        if (!isPaused) {
          video.play().catch(e => console.log("MiniPlayer play error:", e));
        }
      }
    },
    closeAllModules() {
      const modules = this.$appdata.get("modules") || {};
      for (const key of Object.keys(modules)) {
        this.$appdata.set(`modules.${key}.show`, false);
      }
      if (this.$appdata.get("modules.home")) {
        this.$appdata.set("modules.home.show", true);
      }
    },
    maximizePlayer() {
      this.$media.maximize();
      this.showMiniPlayer = false;
    },
    maximizeExternalPlayer() {
      this.$appdata.set("modules.external_media.show", true);
      this.$appdata.set("modules.external_media.minimized", false);
      this.showExternalMiniPlayer = false;
    },
  },
};
</script>

<style scoped>
.main-container {
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .main-container {
    margin-left: 0 !important;
  }
}

main {
  display: flex !important;
  flex: auto !important;
  align-items: stretch !important;
  --v-layout-top: 0 !important;
  padding-top: 0 !important;
  overflow: hidden !important;
  position: relative !important;
}

.mini-player-popup {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 1000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}

.mini-player-toolbar {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  padding-bottom: 20px !important;
}

.mini-player-popup:hover .mini-player-toolbar {
  opacity: 1;
}

.hover-btn {
  transition: all 0.2s;
}

.hover-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  color: white !important;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
