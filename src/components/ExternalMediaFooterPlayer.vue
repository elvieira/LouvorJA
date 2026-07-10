<template>
  <div 
    ref="playerContainer"
    class="footer-player-bar d-flex align-center w-100 px-4 py-2"
  >
    <div v-if="playerWidth >= 600" class="player-info d-flex flex-column mr-6" style="max-width: 300px; min-width: 200px;">
      <span class="text-subtitle-2 font-weight-bold text-truncate" :class="isDark ? 'text-white' : 'text-black'" style="line-height: 1.2;">{{ mediaTitle }}</span>
      <span class="text-caption text-truncate" :class="isDark ? 'text-grey' : 'text-grey-darken-1'" style="line-height: 1.2;">{{ isVideo ? 'Vídeo' : 'Áudio' }}</span>
    </div>

    <div class="d-flex align-center mr-6">
      <v-btn icon variant="text" :color="textColor" size="large" class="mx-1 play-btn" @click="togglePlay">
        <v-icon>{{ isPaused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
          {{ isPaused ? 'Reproduzir' : 'Pausar' }}
        </v-tooltip>
      </v-btn>
    </div>

    <div v-if="duration > 0" class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-6" style="min-width: 150px;">
      <span class="text-caption mr-3 font-weight-medium" :class="isDark ? 'text-grey' : 'text-grey-darken-1'" style="opacity: 0.8;">{{ formatTime(currentTime) }}</span>
      <v-progress-linear
        v-model="progress"
        clickable
        :height="4"
        :color="isDark ? 'white' : 'var(--accent-blue)'"
        :bg-opacity="0"
        rounded
        class="flex-grow-1 timeline-slider"
        @click="seekFromProgress"
      />
      <span class="text-caption ml-3 font-weight-medium" :class="isDark ? 'text-grey' : 'text-grey-darken-1'" style="opacity: 0.8;">{{ formatTime(duration) }}</span>
    </div>

    <div v-if="duration > 0" class="d-flex align-center">
      <v-menu location="top center" :close-on-content-click="false" open-on-hover :open-delay="50">
        <template #activator="{ props }">
          <v-btn :icon="volumeIcon" variant="text" :color="textColor" size="small" v-bind="props" class="mx-1" @click="toggleMute" />
        </template>
        <v-card 
          class="py-2 px-4 rounded-lg d-flex align-center elevation-3" 
          :color="!isDark ? '#f4f5f7' : ''" 
          :theme="!isDark ? 'light' : 'dark'" 
          min-width="130" 
          height="40" 
          style="overflow: hidden;"
        >
          <v-slider
            v-model="volume"
            :color="isDark ? 'white' : 'var(--accent-blue)'"
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
    </div>

    <div class="d-flex align-center">
      <v-btn
        v-if="isVideo && playerWidth >= 600"
        variant="text"
        size="small"
        icon
        :color="textColor"
        class="mx-1"
        @click="maximize()"
      >
        <v-icon>mdi-arrow-expand-all</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
          Maximizar
        </v-tooltip>
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        icon
        :color="textColor"
        class="mx-1"
        @click="closeMedia()"
      >
        <v-icon>mdi-close</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
          Fechar
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "ExternalMediaFooterPlayer",
  data() {
    return {
      playerWidth: 0,
      resizeObserver: null,
      volume: 100,
      savedVolume: 100,
    };
  },
  computed: {
    isDark() {
      return this.$vuetify.theme.name === "dark";
    },
    textColor() {
      return this.isDark ? "white" : "black";
    },
    rawFilePath() {
      return this.$appdata.get("modules.external_media.filePath") || "";
    },
    filePath() {
      if (!this.rawFilePath) return "";
      if (window.electronAPI) {
        return `local://${this.rawFilePath}`;
      }
      return this.rawFilePath;
    },
    mediaTitle() {
      return this.$appdata.get("modules.external_media.title") || "Mídia Externa";
    },
    isVideo() {
      if (!this.rawFilePath) return false;
      const ext = this.rawFilePath.split(".").pop().toLowerCase();
      return ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext);
    },
    isPaused() {
      return this.$appdata.get("modules.external_media.config.is_paused") !== false;
    },
    currentTime() {
      return this.$appdata.get("modules.external_media.config.current_time") || 0;
    },
    duration() {
      return this.$appdata.get("modules.external_media.config.duration") || 0;
    },
    progress: {
      get() {
        return this.$appdata.get("modules.external_media.config.progress") || 0;
      },
      set(val) {
        this.$appdata.set("modules.external_media.config.progress", val);
      },
    },
    volumeIcon() {
      if (this.volume <= 0) return "mdi-volume-mute";
      if (this.volume <= 20) return "mdi-volume-low";
      if (this.volume <= 70) return "mdi-volume-medium";
      return "mdi-volume-high";
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.playerWidth = entry.contentRect.width;
      }
    });
    if (this.$refs.playerContainer) {
      this.resizeObserver.observe(this.$refs.playerContainer);
    }

    const savedVol = this.$appdata.get("modules.external_media.config.volume");
    if (savedVol !== undefined && savedVol !== null) {
      this.volume = savedVol;
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    togglePlay() {
      this.$appdata.set("modules.external_media.config.request_action", {
        action: "toggle_play",
        timestamp: Date.now()
      });
    },
    seekFromProgress() {
      this.$appdata.set("modules.external_media.config.request_action", {
        action: "seek",
        value: this.progress,
        timestamp: Date.now()
      });
    },
    onVolumeChange() {
      this.$appdata.set("modules.external_media.config.request_action", {
        action: "set_volume",
        value: this.volume,
        timestamp: Date.now()
      });
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
    maximize() {
      this.$appdata.set("modules.external_media.show", true);
      this.$appdata.set("modules.external_media.minimized", false);
    },
    closeMedia() {
      this.$appdata.set("modules.external_media.config.request_action", {
        action: "close",
        timestamp: Date.now()
      });
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
  },
};
</script>
