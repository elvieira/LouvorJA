<template>
  <div 
    ref="playerContainer"
    class="footer-player-bar d-flex align-center w-100 px-4 py-2"
  >
    <div v-if="playerWidth >= 600" class="player-info d-flex flex-column mr-6" style="max-width: 300px; min-width: 200px;">
      <span class="text-subtitle-2 font-weight-bold text-truncate" :class="isDark ? 'text-white' : 'text-black'" style="line-height: 1.2;">{{ mediaTitle }}</span>
      <span class="text-caption text-truncate" :class="isDark ? 'text-grey' : 'text-grey-darken-1'" style="line-height: 1.2;">{{ mediaSubtitle || (isVideo ? 'Vídeo' : 'Áudio') }}</span>
    </div>

    <div class="d-flex align-center mr-6">
      <v-btn
        icon
        variant="text"
        :color="textColor"
        size="large"
        class="mx-1 play-btn"
        @click="togglePlay"
      >
        <v-icon>{{ isPaused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
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
        :bg-opacity="0.3"
        rounded
        class="flex-grow-1 timeline-slider"
        @click="seekFromProgress"
      />
      <span class="text-caption ml-3 font-weight-medium" :class="isDark ? 'text-grey' : 'text-grey-darken-1'" style="opacity: 0.8;">{{ formatTime(duration) }}</span>
    </div>

    <div v-if="duration > 0" class="d-flex align-center">
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
            :color="textColor"
            size="small"
            v-bind="props"
            class="mx-1"
            @click="toggleMute"
          />
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
        v-if="isVideo && playerWidth >= 600 && !showExternalMiniPlayer"
        variant="text"
        size="small"
        icon
        :color="textColor"
        class="mx-1"
        @click="maximize()"
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
        variant="text"
        size="small"
        icon
        :color="textColor"
        class="mx-1"
        @click="closeMedia()"
      >
        <v-icon>mdi-close</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          Fechar
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useTheme } from "vuetify";
import { useAppData } from "@/composables/useHelpers";

const theme = useTheme();
const appdata = useAppData();

const playerWidth = ref(0);
const playerContainer = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
const volume = ref(100);
const savedVolume = ref(100);

const isDark = computed(() => theme.name.value === "dark");
const textColor = computed(() => isDark.value ? "white" : "black");

const rawFilePath = computed(() => appdata.get("modules.external_media.filePath") || "");

const mediaTitle = computed(() => appdata.get("modules.external_media.title") || "Mídia Externa");
const mediaSubtitle = computed(() => appdata.get("modules.external_media.subtitle") || "");

const isVideo = computed(() => {
  if (!rawFilePath.value) return false;
  const ext = rawFilePath.value.split(".").pop()?.toLowerCase();
  return ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext || "");
});

const isPaused = computed(() => appdata.get("modules.external_media.config.is_paused") !== false);
const currentTime = computed(() => appdata.get("modules.external_media.config.current_time") || 0);
const showExternalMiniPlayer = computed(() => appdata.get("modules.external_media.show_mini_player") !== false);
const duration = computed(() => appdata.get("modules.external_media.config.duration") || 0);

const progress = computed({
  get() {
    return appdata.get("modules.external_media.config.progress") || 0;
  },
  set(val: number) {
    appdata.set("modules.external_media.config.progress", val);
  },
});

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

const seekFromProgress = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "seek",
    value: progress.value,
    timestamp: Date.now(),
  });
};

const onVolumeChange = () => {
  appdata.set("modules.external_media.config.request_action", {
    action: "set_volume",
    value: volume.value,
    timestamp: Date.now(),
  });
  appdata.set("modules.external_media.config.volume", volume.value);
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
  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      playerWidth.value = entry.contentRect.width;
    }
  });
  if (playerContainer.value) {
    resizeObserver.observe(playerContainer.value);
  }

  const savedVol = appdata.get("modules.external_media.config.volume");
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
