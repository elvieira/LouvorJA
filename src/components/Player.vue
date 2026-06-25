<template>
  <div 
    ref="playerContainer"
    :class="location === 'footer' ? 'footer-player-bar d-flex align-center w-100 px-4 py-2' : 'modern-pill-player d-flex align-center px-6 py-2 mx-auto'" 
  >
    <!-- INFO (Música e Álbum) -->
    <div v-if="playerWidth >= 880" class="player-info d-flex flex-column mr-6" :style="location === 'footer' ? 'max-width: 300px; min-width: 200px;' : 'max-width: 220px; min-width: 150px;'">
      <span class="text-subtitle-2 font-weight-bold text-truncate" :class="location === 'footer' ? 'text-black' : 'text-white'" style="line-height: 1.2;">{{ media.config.title }}</span>
      <span class="text-caption text-truncate" :class="location === 'footer' ? 'text-grey-darken-1' : 'text-grey'" style="line-height: 1.2;">{{ media.config.subtitle }}</span>
    </div>

    <!-- CONTROLES PRINCIPAIS (Prev, Play, Next) -->
    <div class="d-flex align-center mr-6">
      <v-btn
        icon="mdi-skip-previous"
        variant="text"
        :color="location === 'footer' ? 'black' : 'white'"
        size="small"
        class="mx-1"
        @click="prev"
      />
      <v-btn
        :icon="media.config.is_paused ? 'mdi-play-circle' : 'mdi-pause-circle'"
        variant="text"
        :color="location === 'footer' ? 'black' : 'white'"
        size="large"
        class="mx-1 play-btn"
        @click="play"
      />
      <v-btn
        icon="mdi-skip-next"
        variant="text"
        :color="location === 'footer' ? 'black' : 'white'"
        size="small"
        class="mx-1"
        @click="next"
      />
    </div>

    <!-- TIMELINE E TEMPO -->
    <div v-if="media.config.audio" class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-6" style="min-width: 150px;">
      <span class="text-caption mr-3 font-weight-medium" :class="location === 'footer' ? 'text-grey-darken-2' : 'text-white'" style="opacity: 0.8;">{{ $datetime.shortTime(media.config.current_time) }}</span>
      <v-progress-linear
        v-model="media.config.progress"
        clickable
        :indeterminate="media.loading"
        :height="4"
        :stream="!media.loading"
        :buffer-value="media.config.buffered"
        :color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
        :bg-color="location === 'footer' ? '#b0b0b0' : 'rgba(255,255,255,0.4)'"
        :bg-opacity="1"
        rounded
        class="flex-grow-1 timeline-slider"
        @click="changeProgress"
      />
      <span class="text-caption ml-3 font-weight-medium" :class="location === 'footer' ? 'text-grey-darken-2' : 'text-white'" style="opacity: 0.8;">{{ $datetime.shortTime(media.config.duration) }}</span>
    </div>

    <!-- VOLUME -->
    <div v-if="media.config.audio" class="d-flex align-center mr-4">
      <v-menu
        location="top center"
        :close-on-content-click="false"
        open-on-hover
        :open-delay="50"
      >
        <template #activator="{ props }">
          <v-btn
            :icon="volume_icon"
            variant="text"
            :color="location === 'footer' ? 'black' : 'white'"
            size="small"
            v-bind="props"
            class="mx-1 volume-btn"
            @click="toogleVolume"
          />
        </template>
        <v-card 
          class="py-2 px-4 rounded-lg d-flex align-center" 
          :class="location === 'footer' ? '' : 'modern-pill-player-volume'"
          :color="location === 'footer' ? '#f4f5f7' : ''" 
          :theme="location === 'footer' ? 'light' : 'dark'" 
          elevation="8" 
          min-width="130" 
          height="40"
          style="overflow: hidden;"
        >
          <v-slider
            v-model="media.config.volume"
            :color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
            track-color="grey"
            hide-details
            thumb-size="12"
            step="1"
            min="0"
            max="100"
            class="ma-0 pa-0 w-100"
            @update:model-value="changeVolume"
          />
        </v-card>
      </v-menu>
    </div>

    <!-- AÇÕES SECUNDÁRIAS -->
    <div class="d-flex align-center">
      <!-- Status Mode (Áudio/Instrumental/Letra) -->
      <v-menu v-if="location !== 'fullscreen' && playerWidth >= 880" :close-on-content-click="true">
        <template #activator="{ props }">
          <v-btn
            variant="text"
            size="small"
            :color="location === 'footer' ? (mode.color === 'white' ? 'black' : mode.color) : (mode.color || 'white')"
            v-bind="props"
            :icon="mode.tray_icon"
            class="mx-1"
          />
        </template>
        <v-list
          class="elevation-3"
          rounded="lg"
          :bg-color="location === 'footer' ? 'white' : '#1e1e1e'"
          :theme="location === 'footer' ? 'light' : 'dark'"
        >
          <template v-for="(mode, key) in menu_modes" :key="key">
            <v-divider v-if="mode.title == '-'" class="my-1 border-opacity-25" />
            <v-list-item
              v-else
              :active="mode.active"
              :disabled="mode.disabled"
              active-color="var(--accent-blue)"
              @click="mode.click"
            >
              <template #prepend>
                <v-icon :icon="mode.icon" />
              </template>
              {{ mode.title }}
            </v-list-item>
          </template>
        </v-list>
      </v-menu>

      <!-- Extensão de Tela -->
      <LScreenBtn
        v-if="location !== 'fullscreen'"
        module="media"
        :color="location === 'footer' ? 'black' : 'white'"
        class="mx-1"
      />

      <!-- Maximizar (Apenas no Footer e se o Mini Player estiver fechado) -->
      <v-btn
        v-if="location === 'footer' && !showMiniPlayer"
        variant="text"
        size="small"
        icon="mdi-arrow-expand-all"
        color="black"
        class="mx-1"
        @click="maximize()"
      />

      <!-- Fechar (Apenas no Footer) -->
      <v-btn
        v-if="location === 'footer'"
        variant="text"
        size="small"
        icon="mdi-close"
        color="black"
        class="mx-1"
        @click="close()"
      />

      <!-- Fullscreen (Apenas no Window/Fullscreen) -->
      <v-btn
        v-if="location == 'fullscreen'"
        variant="text"
        size="small"
        icon="mdi-fullscreen-exit"
        color="white"
        class="mx-1"
        @click="fullscreen(false)"
      />
      <v-btn
        v-else-if="location == 'window'"
        variant="text"
        size="small"
        icon="mdi-fullscreen"
        color="white"
        class="mx-1"
        @click="fullscreen()"
      />

      <!-- Botão de Playlist (Apenas no Window) -->
      <v-btn 
        v-if="location == 'window' && playerWidth >= 880"
        variant="text" 
        size="small" 
        icon="mdi-format-list-bulleted" 
        :color="isPlaylistOpen ? 'var(--accent-blue)' : 'white'" 
        class="ml-2" 
        @click="togglePlaylist" 
      />
    </div>
  </div>
</template>

<script>
import LScreenBtn from "@/components/buttons/Screen.vue";

export default {
  name: "PlayerComponent",
  components: {
    LScreenBtn,
  },
  props: {
    location: String,
  },
  data() {
    return {
      playerWidth: 0,
      resizeObserver: null,
    };
  },
  computed: {
    media() {
      return this.$modules.get("media");
    },
    showMiniPlayer() {
      return this.$appdata.get("modules.media.show_mini_player") !== false;
    },
    slides() {
      return this.$media.slides();
    },
    has_instrumental_music() {
      return this.media.data.url_instrumental_music ? true : false;
    },
    isPlaylistOpen() {
      return this.$appdata.get("modules.media.show_playlist") || false;
    },
    menu_modes() {
      return [
        {
          mode: "audio",
          title: this.$t("modules.media.general.sung"),
          color: "info",
          active: this.media.config.mode == "audio",
          icon: "mdi-play-box-multiple",
          tray_icon: "mdi-account-voice",
          click: () =>
            this.open({
              id_music: this.media.id_music,
              mode: "audio",
              minimized: this.media.minimized,
            }),
        },
        {
          mode: "instrumental",
          title: this.$t("modules.media.general.instrumental"),
          color: "success",
          active: this.media.config.mode == "instrumental",
          disabled: !this.has_instrumental_music,
          icon: "mdi-play-box-multiple-outline",
          tray_icon: "mdi-music-note",
          click: () =>
            this.open({
              id_music: this.media.id_music,
              mode: "instrumental",
              minimized: this.media.minimized,
            }),
        },
        {
          mode: "no_audio",
          title: this.$t("modules.media.general.no_audio"),
          color: "error",
          active: this.media.config.mode == "no_audio",
          icon: "mdi-checkbox-multiple-blank-outline",
          tray_icon: "mdi-music-off",
          click: () =>
            this.open({
              id_music: this.media.id_music,
              minimized: this.media.minimized,
            }),
        },
        { title: "-" },
        {
          title: this.$t("modules.media.general.lyric"),
          color: "error",
          icon: "mdi-text-box-outline",
          click: () => this.openLyric(),
        },
      ];
    },
    mode() {
      return this.menu_modes.filter(
        (item) => item.mode == this.media.config.mode,
      )[0];
    },
    volume_icon() {
      switch (true) {
      case this.media.config.volume <= 0:
        return "mdi-volume-mute";
      case this.media.config.volume <= 20:
        return "mdi-volume-low";
      case this.media.config.volume <= 70:
        return "mdi-volume-medium";
      default:
        return "mdi-volume-high";
      }
    },
    is_mobile() {
      return this.$appdata.get("is_mobile");
    },
    compact() {
      return this.$vuetify.display.width <= 500;
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.playerWidth = entry.contentRect.width;
      }
    });
    
    let target = this.$refs.playerContainer;
    if (target) {
      if (this.location === "window") {
        const vCard = target.closest(".v-card");
        if (vCard) {
          target = vCard;
        } else {
          // Fallback para o contêiner principal se não achar v-card
          target = target.closest(".floating-pill-container")?.parentNode || target.parentNode;
        }
      } else if (this.location === "fullscreen") {
        target = document.body;
      }
      this.resizeObserver.observe(target);
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    play() {
      if (this.media.config.is_paused) {
        this.$media.play();
      } else {
        this.$media.pause();
      }
    },
    prev() {
      this.$media.prevSlide();
    },
    next() {
      this.$media.nextSlide();
    },
    open(data) {
      this.$media.open(data);
    },
    openLyric() {
      this.$media.openLyric();
    },
    maximize() {
      this.$media.maximize();
    },
    close() {
      this.$media.close();
    },
    changeProgress() {
      const time =
        (this.media.config.duration * this.media.config.progress) / 100;
      this.$media.goToTime(time);
    },
    fullscreen(value = true) {
      this.$media.fullscreen(value);
    },
    toogleVolume() {
      this.$media.toogleVolume();
    },
    changeVolume() {
      this.$media.setVolume(this.media.config.volume);
    },
    togglePlaylist() {
      const currentState = this.$appdata.get("modules.media.show_playlist") || false;
      this.$appdata.set("modules.media.show_playlist", !currentState);
    },
  },
};
</script>

<style lang="scss">
.modern-pill-player {
  background: rgba(15, 15, 20, 0.45) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 60px;
  width: auto !important;
  display: inline-flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
}

.modern-pill-player-volume {
  background: rgba(15, 15, 20, 0.45) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.footer-player-bar {
  background: #f4f5f7 !important;
  border-top: 1px solid var(--border-color);
  width: 100%;
  min-height: 64px;
}

.play-btn {
  transform: scale(1.1);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    transform: scale(1.25);
  }
  &:active {
    transform: scale(1);
  }
}

.timeline-slider {
  transition: height 0.2s ease;
  cursor: pointer;
  
  &:hover {
    height: 6px !important;
  }
}

.volume-btn, .v-btn {
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.8;
    background: rgba(255,255,255,0.05);
  }
}
</style>
