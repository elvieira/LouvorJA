<template>
  <div class="floating-pill-container position-absolute w-100 d-flex justify-center" style="bottom: 40px; z-index: 20; pointer-events: none;">
    <div style="pointer-events: auto;">
      <div class="modern-pill-player d-flex align-center px-6 py-2 mx-auto">
        <div v-if="pillWidth >= 600" class="player-info d-flex flex-column mr-6" style="max-width: 220px; min-width: 150px;">
          <span class="text-subtitle-2 font-weight-bold text-truncate text-white" style="line-height: 1.2;">{{ title }}</span>
          <span class="text-caption text-truncate text-grey" style="line-height: 1.2;">{{ subtitle || (isVideo ? t('controls.video') : t('controls.audio')) }}</span>
        </div>
        <div class="d-flex align-center mr-6">
          <v-btn
            icon
            variant="text"
            color="white"
            size="large"
            class="mx-1 play-btn"
            @click="$emit('toggle-play')"
          >
            <v-icon>{{ isPaused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
          </v-btn>
        </div>
        <div class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-6" style="min-width: 150px;">
          <span class="text-caption mr-3 font-weight-medium text-white" style="opacity: 0.8;">{{ formatTime(currentTime) }}</span>
          <v-progress-linear
            v-model="localProgress"
            clickable
            :height="4"
            color="white"
            :bg-opacity="0.3"
            rounded
            class="flex-grow-1 timeline-slider mx-2"
            @click="onProgressClick"
            @update:model-value="onProgressUpdate"
          />
          <span class="text-caption ml-3 font-weight-medium text-white" style="opacity: 0.8;">{{ formatTime(duration) }}</span>
        </div>
        <div class="d-flex align-center">
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
                @click="$emit('toggle-mute')"
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
                v-model="localVolume"
                color="white"
                track-color="grey"
                hide-details
                thumb-size="12"
                step="1"
                min="0"
                max="100"
                class="ma-0 pa-0 w-100"
                @update:model-value="onVolumeUpdate"
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
            @click="$emit('enter-fullscreen')"
          >
            <v-icon>mdi-fullscreen</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
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
import { defineComponent, ref, watch } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "PlayerControls",
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
    pillWidth: {
      type: Number,
      default: 0,
    },
  },
  emits: ["toggle-play", "seek", "toggle-mute", "update:volume", "enter-fullscreen"],
  setup(props, { emit }) {
    const localProgress = ref(props.progress);
    const localVolume = ref(props.volume);

    watch(() => props.progress, (val) => {
      localProgress.value = val;
    });

    watch(() => props.volume, (val) => {
      localVolume.value = val;
    });

    const onProgressClick = () => {
      emit("seek", localProgress.value);
    };

    const onProgressUpdate = (val: number) => {
      localProgress.value = val;
      emit("seek", val);
    };

    const onVolumeUpdate = (val: number) => {
      localVolume.value = val;
      emit("update:volume", val);
    };

    const formatTime = (seconds: number) => {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return {
      localProgress,
      localVolume,
      onProgressClick,
      onProgressUpdate,
      onVolumeUpdate,
      formatTime,
    };
  },
  computed: {
    volumeIcon(): string {
      if (this.volume === 0) return "mdi-volume-mute";
      if (this.volume < 50) return "mdi-volume-medium";
      return "mdi-volume-high";
    },
  },
  methods: {
    t(key: string): string {
      return this.$t(`modules.${manifest.id}.${key}`);
    },
  },
});
</script>
