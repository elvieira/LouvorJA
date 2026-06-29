<template>
  <div 
    ref="playerContainer"
    :class="location === 'footer' ? 'footer-player-bar d-flex align-center w-100 px-4 py-2' : (location === 'fullscreen' ? 'fullscreen-player-bar d-flex align-center px-6 py-2 w-100' : 'modern-pill-player d-flex align-center px-6 py-2 mx-auto')" 
  >
    <div v-if="playerWidth >= 880" class="player-info d-flex flex-column mr-6" :style="location === 'footer' ? 'max-width: 300px; min-width: 200px;' : 'max-width: 220px; min-width: 150px;'">
      <span class="text-subtitle-2 font-weight-bold text-truncate" :class="defaultTextClass" style="line-height: 1.2;">{{ media.config.title }}</span>
      <span class="text-caption text-truncate" :class="secondaryTextClass" style="line-height: 1.2;">{{ media.config.subtitle }}</span>
    </div>

    <div class="d-flex align-center mr-6">
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="small"
        class="mx-1"
        @click="prev"
      >
        <v-icon>mdi-skip-previous</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Anterior</v-tooltip>
      </v-btn>
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="large"
        class="mx-1 play-btn"
        @click="play"
      >
        <v-icon>{{ media.config.is_paused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">{{ media.config.is_paused ? 'Reproduzir' : 'Pausar' }}</v-tooltip>
      </v-btn>
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="small"
        class="mx-1"
        @click="next"
      >
        <v-icon>mdi-skip-next</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Próxima</v-tooltip>
      </v-btn>
    </div>

    <div v-if="media.config.audio" class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-6" style="min-width: 150px;">
      <span class="text-caption mr-3 font-weight-medium" :class="location === 'window' || location === 'fullscreen' ? 'text-white' : secondaryTextClass" style="opacity: 0.8;">{{ $datetime.shortTime(media.config.current_time) }}</span>
      <v-progress-linear
        v-model="media.config.progress"
        clickable
        :indeterminate="media.loading"
        :height="4"
        :stream="!media.loading"
        :buffer-value="media.config.buffered"
        :color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
        :bg-opacity="0"
        rounded
        class="flex-grow-1 timeline-slider"
        @click="changeProgress"
      />
      <span class="text-caption ml-3 font-weight-medium" :class="location === 'window' || location === 'fullscreen' ? 'text-white' : secondaryTextClass" style="opacity: 0.8;">{{ $datetime.shortTime(media.config.duration) }}</span>
    </div>

    <div v-if="media.config.audio" class="d-flex align-center">
      <v-menu
        location="top center"
        :close-on-content-click="false"
        open-on-hover
        :open-delay="50"
        :attach="location === 'fullscreen'"
      >
        <template #activator="{ props }">
          <v-btn
            :icon="volume_icon"
            variant="text"
            :color="defaultTextColor"
            size="small"
            v-bind="props"
            class="mx-1 volume-btn"
            @click="toogleVolume"
          />
        </template>
        <v-card 
          class="py-2 px-4 rounded-lg d-flex align-center" 
          :class="location === 'footer' ? 'elevation-3' : 'modern-glass-menu elevation-0'"
          :color="location === 'footer' && !isDark ? '#f4f5f7' : ''" 
          :theme="location === 'footer' && !isDark ? 'light' : 'dark'" 
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

    <div class="d-flex align-center">
      <v-menu v-if="location !== 'fullscreen' && playerWidth >= 880" :close-on-content-click="true">
        <template #activator="{ props }">
          <v-btn
            variant="text"
            size="small"
            :color="mode.color && mode.color !== 'white' ? mode.color : defaultTextColor"
            v-bind="props"
            icon
            class="mx-1"
          >
            <v-icon>{{ mode.tray_icon }}</v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Tipo de Áudio</v-tooltip>
          </v-btn>
        </template>
        <v-card
          :class="location === 'footer' ? 'elevation-3' : 'modern-glass-menu elevation-0'"
          :color="location === 'footer' && !isDark ? '#f4f5f7' : ''" 
          :theme="location === 'footer' && !isDark ? 'light' : 'dark'" 
          rounded="lg"
          style="overflow: hidden;"
        >
          <v-list
            class="py-2"
            :bg-color="location === 'footer' ? (isDark ? 'var(--card-bg)' : 'white') : 'transparent'"
          >
            <template v-for="(mode, key) in menu_modes" :key="key">
              <v-divider v-if="mode.title == '-'" class="my-2 border-opacity-25" />
              <v-list-item
                v-else
                :active="mode.active"
                :disabled="mode.disabled"
                :active-color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
                class="mx-2 rounded-lg mb-1"
                style="min-height: 40px;"
                @click="mode.click"
              >
                <div class="d-flex align-center">
                  <v-icon :icon="mode.icon" size="small" class="mr-3" />
                  <span class="text-body-2 font-weight-medium">{{ mode.title }}</span>
                </div>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-menu>



      <v-btn
        v-if="location === 'footer' && !showMiniPlayer"
        variant="text"
        size="small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="maximize()"
      >
        <v-icon>mdi-arrow-expand-all</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Maximizar</v-tooltip>
      </v-btn>

      <v-btn
        v-if="location === 'footer'"
        variant="text"
        size="small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="close()"
      >
        <v-icon>mdi-close</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Fechar</v-tooltip>
      </v-btn>

      <v-btn
        v-if="location == 'fullscreen'"
        variant="text"
        size="small"
        icon
        color="white"
        class="mx-1"
        @click="fullscreen(false)"
      >
        <v-icon>mdi-fullscreen-exit</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Sair da Tela Cheia</v-tooltip>
      </v-btn>
      <v-btn
        v-else-if="location == 'window'"
        variant="text"
        size="small"
        icon
        color="white"
        class="mx-1"
        @click="fullscreen()"
      >
        <v-icon>mdi-fullscreen</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Tela Cheia</v-tooltip>
      </v-btn>

      <v-btn 
        v-if="location == 'window' && playerWidth >= 880"
        variant="text" 
        size="small" 
        icon 
        :color="isPlaylistOpen ? 'var(--accent-blue)' : 'white'" 
        class="ml-2" 
        @click="togglePlaylist" 
      >
        <v-icon>mdi-format-list-bulleted</v-icon>
        <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Lista de Slides</v-tooltip>
      </v-btn>
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
    isDark() {
      return this.$vuetify.theme.name === 'dark';
    },
    defaultTextColor() {
      if (this.location !== 'footer') return 'white';
      return this.isDark ? 'white' : 'black';
    },
    defaultTextClass() {
      if (this.location !== 'footer') return 'text-white';
      return this.isDark ? 'text-white' : 'text-black';
    },
    secondaryTextClass() {
      if (this.location !== 'footer') return 'text-grey';
      return this.isDark ? 'text-grey' : 'text-grey-darken-1';
    },
    timelineBgColor() {
      if (this.location !== 'footer') return 'rgba(255,255,255,0.4)';
      return this.isDark ? 'rgba(255,255,255,0.2)' : '#b0b0b0';
    },
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
          icon: "mdi-play-circle",
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
          icon: "mdi-play-circle-outline",
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
          icon: "mdi-monitor",
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

.fullscreen-player-bar {
  background: rgba(15, 15, 20, 0.8) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.5);
  min-height: 64px;
  width: 100% !important;
  display: flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
}

.modern-glass-menu {
  background: rgba(15, 15, 20, 0.45) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.footer-player-bar {
  background: var(--card-bg) !important;
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
