<template>
  <div
    class="position-absolute w-100 h-100 top-0 left-0"
    style="z-index: 9999; pointer-events: auto;"
    @mousemove="onMouseMove"
  >
    <transition name="slide-up">
      <div
        v-if="controlsVisible"
        class="position-absolute w-100 bottom-0"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <div class="external-media-controls-bar fullscreen-bar w-100 d-flex align-center px-6 py-2">
          <!-- Informações do Vídeo em Tela Cheia -->
          <div
            v-if="title"
            class="d-flex flex-column mr-4 flex-shrink-0"
            style="max-width: 250px; min-width: 140px;"
          >
            <span class="player-song-title text-truncate font-weight-bold text-white" :title="title">
              {{ title }}
            </span>
            <span v-if="subtitle" class="player-song-subtitle text-truncate text-grey" :title="subtitle">
              {{ subtitle }}
            </span>
          </div>

          <!-- Controles Principais (Retroceder, Play/Pause, Avançar) -->
          <div class="d-flex align-center flex-shrink-0 mr-3">
            <v-btn
              icon
              variant="text"
              color="white"
              size="x-small"
              class="control-icon-btn mx-0.5"
              @click="$emit('rewind', 10)"
            >
              <v-icon size="22">
                mdi-rewind-10
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                open-delay="250"
                theme="dark"
                content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ t('controls.rewind_10') || 'Retroceder 10s' }}
              </v-tooltip>
            </v-btn>

            <button
              type="button"
              class="play-pill-btn mx-2"
              @click="$emit('toggle-play')"
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
                theme="dark"
                content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ isPaused ? t('controls.play') : t('controls.pause') }}
              </v-tooltip>
            </button>

            <v-btn
              icon
              variant="text"
              color="white"
              size="x-small"
              class="control-icon-btn mx-0.5"
              @click="$emit('fast-forward', 10)"
            >
              <v-icon size="22">
                mdi-fast-forward-10
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                open-delay="250"
                theme="dark"
                content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ t('controls.forward_10') || 'Avançar 10s' }}
              </v-tooltip>
            </v-btn>
          </div>

          <!-- Linha do Tempo / Barra de Progresso -->
          <div class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-4" style="min-width: 160px;">
            <span
              class="text-caption mr-2.5 font-weight-medium text-white"
              style="opacity: 0.85; font-size: 11px !important; min-width: 32px; text-align: right;"
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
              class="text-caption ml-2.5 font-weight-medium text-white"
              style="opacity: 0.85; font-size: 11px !important; min-width: 32px;"
            >
              {{ formatTime(duration) }}
            </span>
          </div>

          <!-- Ações Adicionais (Velocidade, Volume, Sair da Tela Cheia) -->
          <div class="d-flex align-center flex-shrink-0">
            <!-- Menu de Velocidade -->
            <v-menu location="top center" :offset="12">
              <template #activator="{ props: menuProps }">
                <button
                  type="button"
                  v-bind="menuProps"
                  class="speed-pill-btn mx-1"
                >
                  <span>{{ currentSpeedLabel }}</span>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="250"
                    theme="dark"
                    content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
                  >
                    {{ t('controls.playback_rate') || 'Velocidade' }}: {{ currentSpeedLabel }}
                  </v-tooltip>
                </button>
              </template>
              <v-card
                class="modern-glass-menu elevation-0 py-1 px-1 rounded-lg"
                theme="dark"
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
                    @click="$emit('update:playback-rate', rate)"
                  >
                    <span class="text-caption font-weight-medium">
                      {{ rate === 1 ? `1x (${t('controls.normal_speed') || 'Normal'})` : `${rate}x` }}
                    </span>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>

            <!-- Volume com Slider Expansível -->
            <div
              class="player-volume-group d-flex align-center mx-1 flex-shrink-0"
              :class="{ 'is-dragging': isVolumeDragging }"
            >
              <v-btn
                :icon="volumeIcon"
                variant="text"
                color="white"
                size="x-small"
                class="volume-btn"
                @click="$emit('toggle-mute')"
              >
                <v-icon size="20">
                  {{ volumeIcon }}
                </v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-delay="250"
                  theme="dark"
                  content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  {{ volume === 0 ? (t('controls.unmute') || 'Desmutar') : (t('controls.mute') || 'Mutar') }}
                </v-tooltip>
              </v-btn>

              <div class="volume-slider-expandable">
                <v-slider
                  v-model="localVolume"
                  min="0"
                  max="100"
                  step="1"
                  hide-details
                  color="var(--accent-blue)"
                  track-fill-color="var(--accent-blue)"
                  thumb-size="10"
                  class="volume-slider"
                  @start="isVolumeDragging = true"
                  @end="isVolumeDragging = false"
                  @update:model-value="onVolumeInput"
                />
              </div>
            </div>

            <!-- Sair da Tela Cheia -->
            <v-btn
              variant="text"
              size="small"
              icon
              color="white"
              class="mx-1 control-icon-btn"
              @click="$emit('exit-fullscreen')"
            >
              <v-icon size="21">
                mdi-fullscreen-exit
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                open-delay="250"
                theme="dark"
                content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ t('controls.exit_fullscreen') }}
              </v-tooltip>
            </v-btn>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "FullscreenControls",
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    isPaused: {
      type: Boolean,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    playbackRate: {
      type: Number,
      default: 1,
    },
  },
  emits: [
    "toggle-play",
    "seek",
    "rewind",
    "fast-forward",
    "toggle-mute",
    "update:volume",
    "update:playback-rate",
    "exit-fullscreen",
  ],
  setup(props, { emit }) {
    const controlsVisible = ref(true);
    const timerActive = ref(true);
    const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null);

    const isSeeking = ref(false);
    const seekProgress = ref(0);

    const displayProgress = computed({
      get: () => (isSeeking.value ? seekProgress.value : (props.progress || 0)),
      set: (val: number) => {
        seekProgress.value = val;
      },
    });

    const onSeekStart = () => {
      isSeeking.value = true;
      seekProgress.value = props.progress || 0;
    };

    const onSeekEnd = (val?: number) => {
      const targetVal = typeof val === "number" ? val : displayProgress.value;
      isSeeking.value = false;
      emit("seek", targetVal);
    };

    const isVolumeDragging = ref(false);
    const localVolume = ref(props.volume);

    watch(() => props.volume, (val) => {
      if (!isVolumeDragging.value) {
        localVolume.value = val;
      }
    });

    const onVolumeInput = (val: number) => {
      localVolume.value = val;
      emit("update:volume", val);
    };

    const startHideTimer = () => {
      if (hideTimer.value) clearTimeout(hideTimer.value);
      hideTimer.value = setTimeout(() => {
        controlsVisible.value = false;
      }, 2500);
    };

    const onMouseMove = () => {
      if (!timerActive.value) return;
      controlsVisible.value = true;
      startHideTimer();
    };

    const onMouseEnter = () => {
      timerActive.value = false;
      if (hideTimer.value) clearTimeout(hideTimer.value);
    };

    const onMouseLeave = () => {
      timerActive.value = true;
      startHideTimer();
    };

    const formatTime = (seconds: number) => {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const availableRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    const currentSpeedLabel = computed(() => {
      return `${props.playbackRate || 1}x`;
    });

    return {
      controlsVisible,
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      displayProgress,
      onSeekStart,
      onSeekEnd,
      isVolumeDragging,
      localVolume,
      onVolumeInput,
      formatTime,
      availableRates,
      currentSpeedLabel,
    };
  },
  computed: {
    volumeIcon(): string {
      if (this.volume === 0) return "mdi-volume-mute";
      if (this.volume <= 20) return "mdi-volume-low";
      if (this.volume <= 70) return "mdi-volume-medium";
      return "mdi-volume-high";
    },
  },
  methods: {
    t(key: string): string {
      return (this as any).$t(`modules.${manifest.id}.${key}`);
    },
  },
});
</script>

<style lang="scss" scoped>
.player-song-title {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.25;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
  flex-shrink: 0;

  .v-icon {
    color: #0b1120 !important;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
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
    background-color: rgba(255, 255, 255, 0.2) !important;
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

.speed-pill-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
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
      background-color: rgba(255, 255, 255, 0.2) !important;
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
