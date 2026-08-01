<template>
  <div>
    <!-- Hidden audio player (ONLY for audio files) -->
    <audio
      v-if="!isVideo && filePath"
      ref="audioEl"
      :src="filePath"
      preload="auto"
      style="display: none;"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="onMediaError"
      @canplay="onCanPlay"
    />

    <Window
      v-model="module.show"
      :title="mediaTitle"
      :subtitle="mediaSubtitle"
      compact
      compact_footer
      size="large"
      eager
      class="modern-media-window external-media-window"
      @close="closeMedia()"
      @minimize="minimizeMedia()"
    >
      <template #toolbar>
        <div class="modern-media-toolbar d-flex align-center">
          <v-btn
            class="custom-system-btn"
            icon
            variant="flat"
            size="small"
            color="white"
            @click="minimizeMedia()"
          >
            <v-icon>mdi-minus</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('controls.minimize') }}
            </v-tooltip>
          </v-btn>
          <v-btn
            class="custom-system-btn"
            icon
            variant="flat"
            size="small"
            color="white"
            @click="closeMedia()"
          >
            <v-icon>mdi-close</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('controls.close') }}
            </v-tooltip>
          </v-btn>
        </div>

        <div 
          class="modern-media-toolbar-right align-center" 
          :class="(isVideo && !autoProject) ? 'd-flex' : 'd-none'"
        >
          <ButtonScreen 
            ref="btnScreen"
            module="external_media" 
            class="custom-system-btn" 
            color="white" 
            variant="flat" 
            size="small" 
            @fullscreen="isFullscreen = true"
          />
        </div>
      </template>

      <div class="player-main-container position-relative w-100 h-100 d-flex flex-column overflow-hidden bg-black">
        <!-- Video / Visual Area -->
        <div class="flex-grow-1 position-relative" style="z-index: 1;">
          <fullscreen
            v-model="isFullscreen"
            class="position-absolute w-100 h-100"
            style="top: 0; left: 0;"
          >
            <div class="w-100 h-100 position-absolute d-flex align-center justify-center bg-black">
              <!-- VIDEO: This is the MAIN player for video files -->
              <video
                v-if="isVideo && filePath"
                ref="videoEl"
                class="w-100 h-100"
                style="object-fit: contain;"
                :src="filePath"
                preload="auto"
                @loadedmetadata="onLoadedMetadata"
                @timeupdate="onTimeUpdate"
                @play="onPlay"
                @pause="onPause"
                @ended="onEnded"
                @error="onMediaError"
                @canplay="onCanPlay"
                @waiting="onWaiting"
                @stalled="onStalled"
              />

              <!-- Audio-only visual placeholder -->
              <div v-if="!isVideo && filePath" class="d-flex flex-column align-center justify-center text-white" style="gap: 16px;">
                <v-icon size="80" color="white" style="opacity: 0.6;">
                  mdi-music-circle
                </v-icon>
                <div class="text-h6 font-weight-medium text-center px-6" style="opacity: 0.9;">
                  {{ mediaTitle }}
                </div>
              </div>

              <!-- Fullscreen controls overlay -->
              <div
                v-if="isFullscreen"
                class="position-absolute w-100 h-100 top-0 left-0"
                style="z-index: 9999"
                @mousemove="onFullscreenMouseMove"
              >
                <transition name="slide-up">
                  <div
                    v-if="fullscreenControlsVisible"
                    class="position-absolute w-100 bottom-0"
                    @mouseenter="fullscreenMouseEnter"
                    @mouseleave="fullscreenMouseLeave"
                  >
                    <div class="external-media-controls-bar fullscreen-bar w-100 d-flex align-center px-6 py-2">
                      <v-btn
                        icon
                        variant="text"
                        color="white"
                        size="large"
                        class="mx-1 play-btn"
                        @click="togglePlay"
                      >
                        <v-icon>{{ isPaused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
                      </v-btn>
                      <span class="text-caption mr-3 font-weight-medium text-white" style="opacity: 0.8;">{{ formatTime(currentTime) }}</span>
                      <v-progress-linear
                        v-model="progress"
                        clickable
                        :height="4"
                        color="white"
                        :bg-opacity="0.3"
                        rounded
                        class="flex-grow-1 timeline-slider mx-2"
                        @click="seekFromProgress"
                      />
                      <span class="text-caption ml-3 font-weight-medium text-white" style="opacity: 0.8;">{{ formatTime(duration) }}</span>
                      <v-menu
                        location="top center"
                        :close-on-content-click="false"
                        open-on-hover
                        :open-delay="50"
                        :attach="true"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            :icon="volumeIcon"
                            variant="text"
                            color="white"
                            size="small"
                            v-bind="props"
                            class="mx-1"
                            @click="toggleMute"
                          />
                        </template>
                        <v-card
                          class="py-2 px-4 rounded-lg d-flex align-center modern-glass-menu elevation-0"
                          theme="dark"
                          min-width="130"
                          height="40"
                          style="overflow: hidden;"
                        >
                          <v-slider
                            v-model="volume"
                            color="white"
                            track-color="grey"
                            hide-details
                            thumb-size="12"
                            step="1"
                            min="0"
                            max="100"
                            class="ma-0 pa-0 w-100"
                            @update:model-value="onVolumeChange"
                          />
                        </v-card>
                      </v-menu>
                      <v-btn
                        variant="text"
                        size="small"
                        icon
                        color="white"
                        class="mx-1"
                        @click="isFullscreen = false"
                      >
                        <v-icon>mdi-fullscreen-exit</v-icon>
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-delay="300"
                          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                        >
                          Sair da Tela Cheia
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </fullscreen>
        </div>

        <!-- Bottom Controls (pill bar, not fullscreen) -->
        <div v-if="!isFullscreen" class="floating-pill-container position-absolute w-100 d-flex justify-center" style="bottom: 40px; z-index: 20; pointer-events: none;">
          <div style="pointer-events: auto;">
            <div class="modern-pill-player d-flex align-center px-6 py-2 mx-auto">
              <div v-if="pillWidth >= 600" class="player-info d-flex flex-column mr-6" style="max-width: 220px; min-width: 150px;">
                <span class="text-subtitle-2 font-weight-bold text-truncate text-white" style="line-height: 1.2;">{{ mediaTitle }}</span>
                <span class="text-caption text-truncate text-grey" style="line-height: 1.2;">{{ mediaSubtitle || (isVideo ? 'Vídeo' : 'Áudio') }}</span>
              </div>
              <div class="d-flex align-center mr-6">
                <v-btn
                  icon
                  variant="text"
                  color="white"
                  size="large"
                  class="mx-1 play-btn"
                  @click="togglePlay"
                >
                  <v-icon>{{ isPaused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
                </v-btn>
              </div>
              <div class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-6" style="min-width: 150px;">
                <span class="text-caption mr-3 font-weight-medium text-white" style="opacity: 0.8;">{{ formatTime(currentTime) }}</span>
                <v-progress-linear
                  v-model="progress"
                  clickable
                  :height="4"
                  color="white"
                  :bg-opacity="0.3"
                  rounded
                  class="flex-grow-1 timeline-slider"
                  @click="seekFromProgress"
                />
                <span class="text-caption ml-3 font-weight-medium text-white" style="opacity: 0.8;">{{ formatTime(duration) }}</span>
              </div>
              <div class="d-flex align-center">
                <v-menu
                  location="top center"
                  :close-on-content-click="false"
                  open-on-hover
                  :open-delay="50"
                >
                  <template #activator="{ props }">
                    <v-btn
                      :icon="volumeIcon"
                      variant="text"
                      color="white"
                      size="small"
                      v-bind="props"
                      class="mx-1"
                      @click="toggleMute"
                    />
                  </template>
                  <v-card
                    class="py-2 px-4 rounded-lg d-flex align-center modern-glass-menu elevation-0"
                    theme="dark"
                    min-width="130"
                    height="40"
                    style="overflow: hidden;"
                  >
                    <v-slider
                      v-model="volume"
                      color="white"
                      track-color="grey"
                      hide-details
                      thumb-size="12"
                      step="1"
                      min="0"
                      max="100"
                      class="ma-0 pa-0 w-100"
                      @update:model-value="onVolumeChange"
                    />
                  </v-card>
                </v-menu>
                <v-btn
                  v-if="isVideo"
                  variant="text"
                  size="small"
                  icon
                  color="white"
                  class="mx-1"
                  @click="isFullscreen = true"
                >
                  <v-icon>mdi-fullscreen</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                  >
                    Tela Cheia
                  </v-tooltip>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Window>
  </div>
</template>

<script>
import manifest from "../manifest.json";
import Window from "@/components/Window.vue";
import ButtonScreen from "@/components/buttons/Screen.vue";

export default {
  name: "ExternalMediaComponent",
  components: {
    Window,
    ButtonScreen,
  },
  data() {
    return {
      isPaused: true,
      currentTime: 0,
      duration: 0,
      progress: 0,
      volume: 100,
      savedVolume: 100,
      isFullscreen: false,
      pillWidth: 800,
      pillResizeObserver: null,
      fullscreenControlsVisible: false,
      fullscreenTimer: null,
      fullscreenTimerActive: true,
      mediaReady: false,
      userPaused: false,
    };
  },
  computed: {
    requestAction() {
      return this.$appdata.get("modules.external_media.config.request_action");
    },
    autoProject() {
      return this.$userdata.get("modules.config.media_auto_project_video") !== false;
    },
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    rawFilePath() {
      return this.$appdata.get("modules.external_media.filePath") || "";
    },
    filePath() {
      if (!this.rawFilePath) return "";
      if (window.electronAPI) {
        // Usa o dummy host 'app' para evitar que o Chromium altere o case do path no macOS/Linux
        const prefix = this.rawFilePath.startsWith("/") ? "local://app" : "local://app/";
        return `${prefix}${this.rawFilePath}`;
      }
      return this.rawFilePath;
    },
    mediaTitle() {
      return this.$appdata.get("modules.external_media.title") || "Mídia Externa";
    },
    mediaSubtitle() {
      return this.$appdata.get("modules.external_media.subtitle") || "";
    },
    isVideo() {
      if (!this.rawFilePath) return false;
      const ext = this.rawFilePath.split(".").pop().toLowerCase();
      return ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext);
    },
    volumeIcon() {
      if (this.volume <= 0) return "mdi-volume-mute";
      if (this.volume <= 20) return "mdi-volume-low";
      if (this.volume <= 70) return "mdi-volume-medium";
      return "mdi-volume-high";
    },
  },
  watch: {
    requestAction(req) {
      if (!req) return;
      if (req.action === "toggle_play") {
        this.togglePlay();
      } else if (req.action === "seek") {
        const el = this.getMediaEl();
        if (el && this.duration) {
          el.currentTime = (this.duration * req.value) / 100;
        }
      } else if (req.action === "set_volume") {
        const el = this.getMediaEl();
        if (el) el.volume = req.value / 100;
        this.volume = req.value;
      } else if (req.action === "minimize") {
        this.minimizeMedia();
      } else if (req.action === "close") {
        this.closeMedia(true);
      }
    },
    "module.show"(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.setupPillObserver();
        });

        const syncSettings = this.$userdata.get("modules.config.media_sync_projection_settings") !== false;
        
        const slideFullscreen = syncSettings 
          ? this.$userdata.get("modules.config.slide_fullscreen") !== false
          : this.$userdata.get("modules.config.media_slide_fullscreen") !== false;
          
        const disableIfExtended = syncSettings 
          ? this.$userdata.get("modules.config.slide_disable_main_if_extended") !== false
          : this.$userdata.get("modules.config.media_slide_disable_main_if_extended") !== false;
          
        let slideMonitors = syncSettings
          ? this.$userdata.get("modules.config.slide_monitor") || []
          : this.$userdata.get("modules.config.media_slide_monitor") || [];
          
        if (!Array.isArray(slideMonitors)) {
          slideMonitors = slideMonitors ? [slideMonitors] : [];
        }

        if (slideFullscreen && !(disableIfExtended && slideMonitors.length > 0)) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.isFullscreen = true;
            }, 200);
          });
        }
      }
    },
    filePath(newVal) {
      this.mediaReady = false;
      this.userPaused = false;
      if (newVal) {
        this.$nextTick(() => {
          this.initPlayback();
        });
      }
    },
  },
  mounted() {
    if (this.filePath) {
      this.$nextTick(() => {
        this.initPlayback();
      });
    }
    if (this.module.show) {
      this.$nextTick(() => {
        this.setupPillObserver();
      });
    }
  },
  beforeUnmount() {
    this.stopPlayback();
    if (this.pillResizeObserver) {
      this.pillResizeObserver.disconnect();
    }
    clearTimeout(this.fullscreenTimer);
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },

    // Returns the active media element (video or audio)
    getMediaEl() {
      if (this.isVideo) {
        return this.$refs.videoEl;
      }
      return this.$refs.audioEl;
    },

    setupPillObserver() {
      this.$nextTick(() => {
        const el = this.$el?.querySelector?.(".modern-pill-player");
        if (el && !this.pillResizeObserver) {
          this.pillResizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
              this.pillWidth = entry.contentRect.width;
            }
          });
          this.pillResizeObserver.observe(el);
        }
      });
    },

    // Initialize playback - waits for canplay before playing
    initPlayback() {
      const el = this.getMediaEl();
      if (!el) {
        return;
      }
      el.volume = this.volume / 100;
      
      if (this.autoProject && this.$refs.btnScreen) {
        if (this.isVideo && !this.$refs.btnScreen.is_selected) {
          this.$refs.btnScreen.popup();
        } else if (!this.isVideo && this.$refs.btnScreen.is_selected) {
          this.$refs.btnScreen.popup();
        }
      }
      
      const syncSettings = this.$userdata.get("modules.config.media_sync_projection_settings") !== false;
      const minimizePlayer = syncSettings 
        ? this.$userdata.get("modules.config.slide_minimize_player") === true
        : this.$userdata.get("modules.config.media_slide_minimize_player") === true;
        
      const slideFullscreen = syncSettings 
        ? this.$userdata.get("modules.config.slide_fullscreen") !== false
        : this.$userdata.get("modules.config.media_slide_fullscreen") !== false;
        
      const disableIfExtended = syncSettings 
        ? this.$userdata.get("modules.config.slide_disable_main_if_extended") !== false
        : this.$userdata.get("modules.config.media_slide_disable_main_if_extended") !== false;
        
      let slideMonitors = syncSettings
        ? this.$userdata.get("modules.config.slide_monitor") || []
        : this.$userdata.get("modules.config.media_slide_monitor") || [];
        
      if (!Array.isArray(slideMonitors)) {
        slideMonitors = slideMonitors ? [slideMonitors] : [];
      }
      
      let hasExtended = false;
      if (window.electronAPI && window.electronAPI.getDisplays) {
        window.electronAPI.getDisplays().then(displays => {
          if (displays && displays.length > 1) {
            const primary = displays.find(d => d.isPrimary) || displays[0];
            const extendedSelected = slideMonitors.filter(m => m !== primary.id);
            hasExtended = extendedSelected.length > 0;
          }
          
          const willGoFullscreen = slideFullscreen && !(disableIfExtended && hasExtended);
          
          if (minimizePlayer && !willGoFullscreen) {
            this.$appdata.set("modules.external_media.show", false);
            this.$appdata.set("modules.external_media.minimized", true);
          }
        });
      } else {
        const willGoFullscreen = slideFullscreen && !(disableIfExtended && slideMonitors.length > 0);
        if (minimizePlayer && !willGoFullscreen) {
          this.$appdata.set("modules.external_media.show", false);
          this.$appdata.set("modules.external_media.minimized", true);
        }
      }
      
      // Don't call play() here - wait for onCanPlay event
    },

    stopPlayback() {
      const el = this.getMediaEl();
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    },

    togglePlay() {
      const el = this.getMediaEl();
      if (!el) {
        return;
      }
      if (el.paused) {
        this.userPaused = false;
        el.play().then(() => {
        }).catch((_err) => {
        });
      } else {
        this.userPaused = true;
        el.pause();
      }
    },

    // --- Media Events ---

    onCanPlay() {
      if (!this.mediaReady) {
        this.mediaReady = true;
        const el = this.getMediaEl();
        if (el) {
          el.volume = this.volume / 100;
          if (!this.userPaused) {
            el.play().then(() => {
            }).catch((_err) => {
            });
          }
        }
      }
    },

    onWaiting() {
    },

    onStalled() {
    },

    onMediaError(event) {
      const el = event.target;
      const error = el?.error;
      if (error) {
        // const codes = { 1: "MEDIA_ERR_ABORTED", 2: "MEDIA_ERR_NETWORK", 3: "MEDIA_ERR_DECODE", 4: "MEDIA_ERR_SRC_NOT_SUPPORTED" };
        console.error("Media error:", error.code);
      }
    },

    onTimeUpdate() {
      const el = this.getMediaEl();
      if (!el) return;
      this.currentTime = el.currentTime;
      if (this.duration > 0) {
        this.progress = (el.currentTime / this.duration) * 100;
      }
      this.$appdata.set("modules.external_media.config.current_time", this.currentTime);
      this.$appdata.set("modules.external_media.config.progress", this.progress);
    },

    onLoadedMetadata() {
      const el = this.getMediaEl();
      if (el) {
        this.duration = el.duration;
        this.$appdata.set("modules.external_media.config.duration", this.duration);
      }
    },

    onEnded() {
      this.isPaused = true;
      this.progress = 0;
      this.currentTime = 0;
      this.$appdata.set("modules.external_media.config.is_paused", true);
    },

    onPlay() {
      this.isPaused = false;
      this.$appdata.set("modules.external_media.config.is_paused", false);
    },

    onPause() {
      this.isPaused = true;
      this.$appdata.set("modules.external_media.config.is_paused", true);
    },

    // --- Controls ---

    seekFromProgress() {
      const el = this.getMediaEl();
      if (!el || !this.duration) return;
      const time = (this.duration * this.progress) / 100;
      el.currentTime = time;
    },

    onVolumeChange() {
      const el = this.getMediaEl();
      if (el) {
        el.volume = this.volume / 100;
      }
      this.$appdata.set("modules.external_media.config.volume", this.volume);
    },

    toggleMute() {
      if (this.volume > 0) {
        this.savedVolume = this.volume;
        this.volume = 0;
      } else {
        this.volume = this.savedVolume || 100;
      }
      this.onVolumeChange();
    },

    minimizeMedia() {
      const pauseOnMinimize = this.$userdata.get("modules.config.media_pause_on_minimize") === true;
      if (pauseOnMinimize) {
        this.userPaused = true;
        this.getMediaEl()?.pause();
      }
      
      this.$appdata.set("modules.external_media.show", false);
      this.$appdata.set("modules.external_media.minimized", true);
    },

    closeMedia(force = false) {
      if (!force) {
        this.$alert.yesno(
          { text: this.t("alerts.close"), translate: false },
          (btn) => {
            if (btn === "yes") {
              this.closeMedia(true);
            }
          },
        );
        return;
      }
      this.stopPlayback();
      this.$appdata.set("modules.external_media.show", false);
      this.$appdata.set("modules.external_media.minimized", false);
      this.$appdata.set("modules.external_media.filePath", "");
      this.$appdata.set("modules.external_media.title", "");

      // Close projection if open
      import("@/helpers/ui/Popup").then(({ default: $popup }) => {
        if (this.$appdata.get("popup_module") === "external_media") {
          $popup.exit();
        }
      });
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },

    // --- Fullscreen ---
    onFullscreenMouseMove() {
      if (!this.fullscreenTimerActive) return;
      this.fullscreenControlsVisible = true;
      this.startFullscreenHideTimer();
    },
    fullscreenMouseEnter() {
      this.fullscreenTimerActive = false;
      clearTimeout(this.fullscreenTimer);
    },
    fullscreenMouseLeave() {
      this.fullscreenTimerActive = true;
      this.startFullscreenHideTimer();
    },
    startFullscreenHideTimer() {
      clearTimeout(this.fullscreenTimer);
      this.fullscreenTimer = setTimeout(() => {
        this.fullscreenControlsVisible = false;
      }, 2000);
    },
  },
};
</script>

<style lang="scss">
.external-media-window {
  .v-card {
    border-radius: 20px !important;
    overflow: hidden;
    background: #000 !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
    border: none !important;
  }

  .v-card-text {
    padding: 0 !important;
  }

  .modern-media-toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    padding: 6px 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .modern-media-toolbar-right {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    padding: 4px 0px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .custom-system-btn {
    border-radius: 50% !important;
    width: 32px !important;
    height: 32px !important;
    margin: 0 4px;
    background: transparent !important;
    color: white !important;
    box-shadow: none !important;

    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
    }
  }
}

.external-media-controls-bar.fullscreen-bar {
  background: rgba(15, 15, 20, 0.8) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.5);
  min-height: 64px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
