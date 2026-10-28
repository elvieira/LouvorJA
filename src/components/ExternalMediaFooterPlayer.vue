<template>
  <div 
    ref="playerContainer"
    class="footer-player-bar d-flex align-center w-100 px-5 py-2"
    :class="{ 'light-theme': !isDark }"
  >
    <!-- 1. Informações da Mídia (Título e Subtítulo) -->
    <div
      v-if="showSongInfo"
      class="player-left-section d-flex align-center flex-shrink-0 mr-4"
      style="max-width: 260px; min-width: 0;"
    >
      <div
        class="player-info d-flex flex-column text-truncate mr-3 cursor-pointer"
        style="min-width: 0;"
        @click="maximize"
      >
        <span
          class="player-song-title text-truncate font-weight-bold"
          :class="isDark ? 'text-white' : 'text-black'"
          :title="mediaTitle"
        >
          {{ mediaTitle }}
        </span>
        <span
          class="player-song-subtitle text-truncate"
          :class="isDark ? 'text-grey' : 'text-grey-darken-1'"
          :title="mediaSubtitle"
        >
          {{ mediaSubtitle || (isVideo ? $t('modules.external_media.controls.video') : $t('modules.external_media.controls.audio')) }}
        </span>
      </div>
    </div>

    <!-- 2. Controles Principais de Reprodução (Retroceder, Play/Pause, Avançar) -->
    <div class="d-flex align-center flex-shrink-0 mr-2">
      <!-- Retroceder 10s -->
      <v-btn
        icon
        variant="text"
        :color="textColor"
        size="x-small"
        class="control-icon-btn mx-1"
        @click="rewind"
      >
        <v-icon size="20">
          mdi-rewind-10
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="250"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.external_media.controls.rewind_10') || 'Retroceder 10s' }}
        </v-tooltip>
      </v-btn>

      <!-- Play / Pause Circular Branco Sólido (Idêntico ao Player Principal) -->
      <button
        type="button"
        class="play-pill-btn mx-1"
        @click="togglePlay"
      >
        <v-icon
          size="20"
          color="#0b1120"
          :style="{ marginLeft: isPaused ? '2px' : '0' }"
        >
          {{ isPaused ? 'mdi-play' : 'mdi-pause' }}
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="250"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ isPaused ? $t('modules.external_media.controls.play') : $t('modules.external_media.controls.pause') }}
        </v-tooltip>
      </button>

      <!-- Avançar 10s -->
      <v-btn
        icon
        variant="text"
        :color="textColor"
        size="x-small"
        class="control-icon-btn mx-1"
        @click="fastForward"
      >
        <v-icon size="20">
          mdi-fast-forward-10
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="250"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.external_media.controls.forward_10') || 'Avançar 10s' }}
        </v-tooltip>
      </v-btn>
    </div>

    <!-- 3. Linha do Tempo / Barra de Progresso com Slider Interativo -->
    <div
      v-if="duration > 0"
      class="player-timeline-wrapper d-flex align-center flex-grow-1 mx-3"
      style="min-width: 100px; max-width: 100%; flex-shrink: 1;"
    >
      <span
        class="text-caption mr-2 font-weight-medium"
        :class="isDark ? 'text-grey' : 'text-grey-darken-1'"
        style="opacity: 0.85; font-size: 11px !important; min-width: 34px; text-align: right;"
      >
        {{ formatTime(currentTime) }}
      </span>

      <v-slider
        v-model="displayProgress"
        min="0"
        max="100"
        step="0.1"
        hide-details
        color="var(--accent-blue)"
        track-fill-color="var(--accent-blue)"
        thumb-size="12"
        class="timeline-slider flex-grow-1 mx-2"
        @start="onSeekStart"
        @end="onSeekEnd"
      />

      <span
        class="text-caption ml-2 font-weight-medium"
        :class="isDark ? 'text-grey' : 'text-grey-darken-1'"
        style="opacity: 0.85; font-size: 11px !important; min-width: 34px;"
      >
        {{ formatTime(duration) }}
      </span>
    </div>

    <!-- 4. Ações do Lado Direito (Velocidade, Volume Expansível, Projetar, Maximizar, Fechar) -->
    <div class="d-flex align-center flex-shrink-0 ml-auto">
      <!-- Menu de Velocidade -->
      <v-menu
        v-if="playerWidth >= 650"
        location="top center"
        :offset="12"
      >
        <template #activator="{ props: menuProps }">
          <button
            type="button"
            v-bind="menuProps"
            class="speed-pill-btn mx-1"
            :class="{ 'light-speed-btn': !isDark }"
          >
            <span>{{ currentSpeedLabel }}</span>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="250"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ $t('modules.external_media.controls.playback_rate') || 'Velocidade' }}: {{ currentSpeedLabel }}
            </v-tooltip>
          </button>
        </template>
        <v-card
          class="elevation-3 py-1 px-1 rounded-lg"
          :class="isDark ? 'modern-glass-menu' : ''"
          :color="!isDark ? '#f4f5f7' : ''"
          :theme="isDark ? 'dark' : 'light'"
          min-width="110"
          style="overflow: hidden;"
        >
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="rate in availableRates"
              :key="rate"
              :active="playbackRate === rate"
              active-color="var(--accent-blue)"
              class="rounded-md"
              style="min-height: 32px;"
              @click="setPlaybackRate(rate)"
            >
              <span class="text-caption font-weight-medium">
                {{ rate === 1 ? `1x (${$t('modules.external_media.controls.normal_speed') || 'Normal'})` : `${rate}x` }}
              </span>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <!-- Volume com Slider Expansível (Idêntico ao Player do Programa) -->
      <div
        v-if="duration > 0"
        class="player-volume-group d-flex align-center mx-1 flex-shrink-0"
        :class="{ 'is-dragging': isVolumeDragging }"
      >
        <v-btn
          :icon="volumeIcon"
          variant="text"
          :color="textColor"
          size="x-small"
          class="volume-btn"
          @click="toggleMute"
        >
          <v-icon size="19">
            {{ volumeIcon }}
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="250"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ volume === 0 ? ($t('modules.external_media.controls.unmute') || 'Desmutar') : ($t('modules.external_media.controls.mute') || 'Mutar') }}
          </v-tooltip>
        </v-btn>

        <div class="volume-slider-expandable">
          <v-slider
            v-model="volume"
            min="0"
            max="100"
            step="1"
            hide-details
            color="var(--accent-blue)"
            track-fill-color="var(--accent-blue)"
            thumb-size="10"
            class="volume-slider"
            @start="isVolumeDragging = true"
            @end="onVolumeChangeEnd"
            @update:model-value="onVolumeInput"
          />
        </div>
      </div>

      <!-- Projetar na Tela Externa -->
      <ButtonScreen
        v-if="isVideo"
        module="external_media"
        variant="text"
        size="x-small"
        :color="textColor"
        class="mx-1 control-icon-btn"
      />

      <!-- Maximizar -->
      <v-btn
        v-if="isVideo"
        variant="text"
        size="x-small"
        icon
        :color="textColor"
        class="mx-1 control-icon-btn"
        @click="maximize"
      >
        <v-icon size="19">
          mdi-arrow-expand-all
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="250"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.external_media.controls.maximize') }}
        </v-tooltip>
      </v-btn>

      <!-- Fechar Mídia -->
      <v-btn
        variant="text"
        size="x-small"
        icon
        :color="textColor"
        class="mx-1 control-icon-btn"
        @click="closeMedia"
      >
        <v-icon size="19">
          mdi-close
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="250"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.external_media.controls.close') }}
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useTheme } from "vuetify";
import { useAppData, useUserData } from "@/composables/useHelpers";
import ButtonScreen from "@/components/buttons/Screen.vue";

const theme = useTheme();
const appdata = useAppData();
const userdata = useUserData();

const playerWidth = ref(0);
const playerContainer = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
const volume = ref(appdata.get("modules.external_media.config.volume") ?? (userdata.get("modules.external_media.volume") ?? 100));
const savedVolume = ref(100);
const isVolumeDragging = ref(false);

const showSongInfo = computed(() => {
  return playerWidth.value >= 1000;
});

const isDark = computed(() => theme.name.value === "dark");
const textColor = computed(() => isDark.value ? "white" : "black");

const rawFilePath = computed(() => appdata.get("modules.external_media.filePath") || "");

const mediaTitle = computed(() => appdata.get("modules.external_media.title") || "Mídia Externa");
const mediaSubtitle = computed(() => appdata.get("modules.external_media.subtitle") || "");

const isYoutube = computed(() => rawFilePath.value.startsWith("youtube:"));

const isVideo = computed(() => {
  if (!rawFilePath.value) return false;
  if (isYoutube.value) return true;
  const ext = rawFilePath.value.split(".").pop()?.toLowerCase();
  return ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext || "");
});

const isPaused = computed(() => appdata.get("modules.external_media.config.is_paused") !== false);
const currentTime = computed(() => appdata.get("modules.external_media.config.current_time") || 0);
const duration = computed(() => appdata.get("modules.external_media.config.duration") || 0);
const playbackRate = computed(() => appdata.get("modules.external_media.config.playback_rate") || 1);

const isSeeking = ref(false);
const seekProgress = ref(0);

const displayProgress = computed({
  get: () => (isSeeking.value ? seekProgress.value : (appdata.get("modules.external_media.config.progress") || 0)),
  set: (val: number) => {
    seekProgress.value = val;
  },
});

const onSeekStart = () => {
  isSeeking.value = true;
  seekProgress.value = appdata.get("modules.external_media.config.progress") || 0;
};

const onSeekEnd = (val?: number) => {
  const targetVal = typeof val === "number" ? val : displayProgress.value;
  isSeeking.value = false;
  appdata.set("modules.external_media.config.request_action", {
    action: "seek",
    value: targetVal,
    timestamp: Date.now(),
  });
};

const availableRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const currentSpeedLabel = computed(() => `${playbackRate.value}x`);

const setPlaybackRate = (rate: number) => {
  appdata.set("modules.external_media.config.request_action", {
    action: "set_playback_rate",
    value: rate,
    timestamp: Date.now(),
  });
  appdata.set("modules.external_media.config.playback_rate", rate);
};

const rewind = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "rewind",
    value: 10,
    timestamp: Date.now(),
  });
};

const fastForward = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "fast_forward",
    value: 10,
    timestamp: Date.now(),
  });
};

const volumeIcon = computed(() => {
  if (volume.value <= 0) return "mdi-volume-mute";
  if (volume.value <= 20) return "mdi-volume-low";
  if (volume.value <= 70) return "mdi-volume-medium";
  return "mdi-volume-high";
});

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const togglePlay = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "toggle_play",
    timestamp: Date.now(),
  });
};

const onVolumeInput = (val: number) => {
  volume.value = val;
  onVolumeChange();
};

const onVolumeChangeEnd = () => {
  isVolumeDragging.value = false;
  onVolumeChange();
};

const onVolumeChange = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "set_volume",
    value: volume.value,
    timestamp: Date.now(),
  });
  appdata.set("modules.external_media.config.volume", volume.value);
  userdata.set("modules.external_media.volume", volume.value);
};

const toggleMute = () => {
  if (volume.value > 0) {
    savedVolume.value = volume.value;
    volume.value = 0;
  } else {
    volume.value = savedVolume.value || 100;
  }
  onVolumeChange();
};

const maximize = () => {
  appdata.set("modules.external_media.show", true);
  appdata.set("modules.external_media.minimized", false);
};

const closeMedia = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "close",
    timestamp: Date.now(),
  });
};

onMounted(() => {
  if (playerContainer.value) {
    playerWidth.value = playerContainer.value.clientWidth;
  }
  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      playerWidth.value = entry.contentRect.width;
    }
  });
  if (playerContainer.value) {
    resizeObserver.observe(playerContainer.value);
  }

  const savedVol = appdata.get("modules.external_media.config.volume") ?? userdata.get("modules.external_media.volume");
  if (savedVol !== undefined && savedVol !== null) {
    volume.value = savedVol;
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.footer-player-bar {
  background: var(--card-bg) !important;
  border-top: 1px solid var(--border-color);
  width: 100%;
  min-height: 64px;
  overflow: hidden;
  box-sizing: border-box;
  transition: background-color 0.25s ease;

  &.light-theme {
    background: #ffffff !important;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
}

.player-left-section {
  min-width: 0;

  .player-info {
    min-width: 0;
  }
}

.player-song-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.player-song-subtitle {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
}

.play-pill-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
  flex-shrink: 0;

  .v-icon {
    color: #0b1120 !important;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  }
  &:active {
    transform: scale(0.96);
  }
}

.control-icon-btn {
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.08);
  }
}

.timeline-slider {
  :deep(.v-slider-thumb),
  :deep(.v-slider-track__fill) {
    transition: none !important;
  }

  :deep(.v-slider-track__background) {
    opacity: 1 !important;
    background-color: rgba(255, 255, 255, 0.18) !important;
    height: 5px !important;
    border-radius: 9999px !important;
  }
  :deep(.v-slider-track__fill) {
    background-color: var(--accent-blue, #009FE3) !important;
    height: 5px !important;
    border-radius: 9999px !important;
  }
  :deep(.v-slider-thumb__surface) {
    background-color: #ffffff !important;
    box-shadow: 0 0 10px rgba(0, 159, 227, 0.8), 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  }
}

.light-theme {
  .timeline-slider,
  .volume-slider {
    :deep(.v-slider-track__background) {
      background-color: rgba(0, 0, 0, 0.12) !important;
    }
  }
}

.speed-pill-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: inherit;
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &.light-speed-btn {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.12);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.2);
    }
  }
}

.player-volume-group {
  display: flex;
  align-items: center;
  position: relative;

  .volume-slider-expandable {
    width: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    margin-left: 0;
    padding: 0;
    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.22s ease,
                margin 0.25s ease;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  &:hover .volume-slider-expandable,
  &.is-dragging .volume-slider-expandable {
    width: 90px;
    max-width: 90px;
    opacity: 1;
    margin-left: 2px;
    margin-right: 4px;
    padding: 0 4px;
    pointer-events: auto;
  }

  .volume-slider {
    width: 75px;
    min-width: 75px;
    margin-inline: 4px !important;

    :deep(.v-slider-thumb),
    :deep(.v-slider-track__fill) {
      transition: none !important;
    }

    :deep(.v-slider-track__background) {
      opacity: 1 !important;
      background-color: rgba(255, 255, 255, 0.18) !important;
      height: 4px !important;
      border-radius: 9999px !important;
    }
    :deep(.v-slider-track__fill) {
      background-color: var(--accent-blue, #009FE3) !important;
      height: 4px !important;
      border-radius: 9999px !important;
    }
    :deep(.v-slider-thumb__surface) {
      background-color: #ffffff !important;
      box-shadow: 0 0 8px rgba(0, 159, 227, 0.8), 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    }
  }
}

.modern-glass-menu {
  background: rgba(15, 23, 42, 0.88) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
</style>
