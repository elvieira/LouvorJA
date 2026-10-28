<template>
  <div class="floating-pill-container position-absolute w-100 d-flex justify-center" style="bottom: 32px; z-index: 20; pointer-events: none;">
    <div style="pointer-events: auto;">
      <div class="modern-pill-player d-flex align-center px-4 py-2 mx-auto">
        <!-- 1. Informações do Vídeo / Áudio (Estilo Player do Programa) -->
        <div
          v-if="showMediaInfo"
          class="player-info d-flex flex-column mr-4 flex-shrink-0"
          style="max-width: 220px; min-width: 120px;"
        >
          <span class="player-song-title text-truncate font-weight-bold text-white" :title="title">
            {{ title }}
          </span>
          <span class="player-song-subtitle text-truncate text-grey" :title="subtitle">
            {{ subtitle || (isVideo ? t('controls.video') : t('controls.audio')) }}
          </span>
        </div>

        <!-- 2. Controles Principais de Reprodução (Retroceder, Play/Pause, Avançar) -->
        <div class="d-flex align-center flex-shrink-0 mr-2">
          <!-- Retroceder 10s -->
          <v-btn
            icon
            variant="text"
            color="white"
            size="x-small"
            class="control-icon-btn mx-1"
            @click="$emit('rewind', 10)"
          >
            <v-icon size="20">
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

          <!-- Play / Pause Circular Branco Sólido (Idêntico ao Player Principal) -->
          <button
            type="button"
            class="play-pill-btn mx-1"
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

          <!-- Avançar 10s -->
          <v-btn
            icon
            variant="text"
            color="white"
            size="x-small"
            class="control-icon-btn mx-1"
            @click="$emit('fast-forward', 10)"
          >
            <v-icon size="20">
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

        <!-- 3. Linha do Tempo / Barra de Progresso Interativa -->
        <div
          class="player-timeline-wrapper d-flex align-center flex-grow-1 mx-2"
          :style="timelineWrapperStyle"
        >
          <span
            class="text-caption mr-2 font-weight-medium text-white"
            style="opacity: 0.8; font-size: 11px !important; min-width: 32px; text-align: right;"
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
            class="text-caption ml-2 font-weight-medium text-white"
            style="opacity: 0.8; font-size: 11px !important; min-width: 32px;"
          >
            {{ formatTime(duration) }}
          </span>
        </div>

        <!-- 4. Ações Adicionais (Velocidade, Volume Expansível, Projetar, Tela Cheia) -->
        <div class="d-flex align-center flex-shrink-0">
          <!-- Menu de Velocidade de Reprodução -->
          <v-menu
            v-if="pillWidth >= 650"
            location="top center"
            :offset="12"
          >
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

          <!-- Volume com Slider Expansível ao Passar o Mouse (Idêntico ao Player Principal) -->
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
              <v-icon size="19">
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

          <!-- Botão Projetar na Tela Externa -->
          <ButtonScreen
            v-if="isVideo"
            module="external_media"
            variant="text"
            size="x-small"
            color="white"
            class="mx-1 control-icon-btn"
          />

          <!-- Tela Cheia (Fullscreen) -->
          <v-btn
            v-if="isVideo"
            variant="text"
            size="x-small"
            icon
            color="white"
            class="mx-1 control-icon-btn"
            @click="$emit('enter-fullscreen')"
          >
            <v-icon size="19">
              mdi-fullscreen
            </v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="250"
              theme="dark"
              content-class="player-tooltip modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('controls.maximize') }}
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import manifest from "../../manifest";
import ButtonScreen from "@/components/buttons/Screen.vue";

export default defineComponent({
  name: "PlayerControls",
  components: {
    ButtonScreen,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    isVideo: {
      type: Boolean,
      default: false,
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
    pillWidth: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "toggle-play",
    "seek",
    "seek-time",
    "rewind",
    "fast-forward",
    "toggle-mute",
    "update:volume",
    "update:playback-rate",
    "enter-fullscreen",
  ],
  setup(props, { emit }) {
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

    const showMediaInfo = computed(() => {
      return props.pillWidth >= 1000;
    });

    const timelineWrapperStyle = computed(() => {
      if (props.pillWidth < 1000) {
        return "min-width: 160px; max-width: 420px;";
      }
      return "min-width: 240px; max-width: 520px;";
    });

    return {
      displayProgress,
      onSeekStart,
      onSeekEnd,
      isVolumeDragging,
      localVolume,
      onVolumeInput,
      formatTime,
      availableRates,
      currentSpeedLabel,
      showMediaInfo,
      timelineWrapperStyle,
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
.modern-pill-player {
  background: rgba(14, 23, 42, 0.78) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 9999px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  min-height: 58px;
  height: 58px;
  width: auto !important;
  display: inline-flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
  transition: all 0.25s ease;
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
  background: rgba(15, 23, 42, 0.85) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}
</style>
