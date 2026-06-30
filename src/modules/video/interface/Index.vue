<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-btn color="primary" variant="tonal" @click="openDialog = 'file'">
        <v-icon start>mdi-file-video</v-icon>
        {{ t('open_file') }}
      </v-btn>
      <v-btn variant="tonal" class="ml-2" @click="openDialog = 'url'">
        <v-icon start>mdi-link-variant</v-icon>
        {{ t('open_url') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="tonal"
        :color="videoSource && videoPlaying ? 'warning' : 'primary'"
        :disabled="!videoSource"
        @click="togglePlay"
      >
        <v-icon start>{{ videoPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        {{ videoPlaying ? t('pause') : t('play') }}
      </v-btn>
      <v-btn
        icon
        variant="text"
        class="ml-1"
        :disabled="!videoSource"
        @click="stopVideo"
      >
        <v-icon>mdi-stop</v-icon>
      </v-btn>
    </template>

    <template #default>
      <v-row v-if="!videoSource" align="center" justify="center" class="fill-height">
        <v-col cols="12" class="text-center">
          <div
            class="drop-zone pa-12"
            @click="openDialog = 'file'"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <v-icon size="80" color="grey-lighten-1">mdi-video-plus</v-icon>
            <p class="text-grey mt-4 text-h6">{{ t('drag_drop') }}</p>
            <p class="text-grey-lighten-2 text-caption">{{ t('supported_formats') }}</p>
          </div>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12" md="8">
          <v-card class="pa-2" dark>
            <video
              ref="videoEl"
              class="video-player w-100"
              :src="videoSource"
              :loop="loop"
              :muted="muted"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoaded"
              @ended="onEnded"
              @error="onError"
              controls
            />
            <div class="d-flex align-center pa-2">
              <span class="text-caption text-grey">{{ videoName }}</span>
              <v-spacer />
              <v-chip size="x-small" variant="tonal">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</v-chip>
            </div>
          </v-card>

          <v-slider
            v-model="currentTime"
            :max="duration"
            :step="0.1"
            class="mt-2"
            hide-details
            density="compact"
            @update:model-value="seek"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-3">
            <div class="text-subtitle-2 mb-3">{{ t('video_settings') }}</div>
            <v-switch v-model="autoPlay" :label="t('auto_play')" density="compact" hide-details />
            <v-switch v-model="loop" :label="t('loop')" density="compact" hide-details />
            <v-switch v-model="muted" :label="t('mute')" density="compact" hide-details @change="toggleMute" />
            <v-slider
              v-model="volume"
              :min="0"
              :max="100"
              :label="t('volume')"
              density="compact"
              class="mt-2"
              hide-details
              @update:model-value="changeVolume"
            >
              <template #prepend>
                <v-icon size="small">{{ volumeIcon }}</v-icon>
              </template>
            </v-slider>

            <v-divider class="my-3" />

            <v-btn
              block
              color="primary"
              variant="tonal"
              @click="projectVideo"
              :disabled="!videoSource"
            >
              <v-icon start>mdi-projector</v-icon>
              {{ t('project') }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </ModuleContainer>

  <!-- File dialog -->
  <v-dialog v-model="openDialog === 'file'" max-width="500">
    <v-card>
      <v-card-title>{{ t('open_file') }}</v-card-title>
      <v-card-text class="text-center">
        <div class="drop-zone pa-8" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
          <v-icon size="48">mdi-file-video</v-icon>
          <p class="mt-2">{{ t('drag_drop') }}</p>
        </div>
        <input ref="fileInput" type="file" accept="video/*" style="display:none" @change="handleFileSelect" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="openDialog = null">{{ t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- URL dialog -->
  <v-dialog v-model="openDialog === 'url'" max-width="500">
    <v-card>
      <v-card-title>{{ t('open_url') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="urlInput" :placeholder="t('url_placeholder')" variant="outlined" density="compact" hide-details />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="openDialog = null">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" variant="tonal" @click="loadUrl">{{ t('play') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import manifest from "../manifest.json";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import { ref, computed } from "vue";

const moduleContainer = ref(null);
const t = (key) => moduleContainer.value?.t(key) || key;
const videoEl = ref(null);
const fileInput = ref(null);

// State
const videoSource = ref(null);
const videoName = ref("");
const videoPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(100);
const muted = ref(false);
const autoPlay = ref(true);
const loop = ref(false);
const openDialog = ref(null);
const urlInput = ref("");
const isLoading = ref(false);

const volumeIcon = computed(() => {
  if (volume.value === 0) return "mdi-volume-off";
  if (volume.value < 50) return "mdi-volume-low";
  return "mdi-volume-high";
});

function togglePlay() {
  if (!videoEl.value) return;
  if (videoEl.value.paused) {
    videoEl.value.play();
    videoPlaying.value = true;
  } else {
    videoEl.value.pause();
    videoPlaying.value = false;
  }
}

function stopVideo() {
  if (!videoEl.value) return;
  videoEl.value.pause();
  videoEl.value.currentTime = 0;
  videoPlaying.value = false;
  currentTime.value = 0;
}

function onTimeUpdate() {
  if (videoEl.value) {
    currentTime.value = videoEl.value.currentTime;
  }
}

function onLoaded() {
  if (videoEl.value) {
    duration.value = videoEl.value.duration || 0;
  }
}

function onEnded() {
  videoPlaying.value = false;
}

function onError() {
  console.error("Video load error");
}

function seek(val) {
  if (videoEl.value) {
    videoEl.value.currentTime = val;
  }
}

function changeVolume(val) {
  if (videoEl.value) {
    videoEl.value.volume = val / 100;
  }
}

function toggleMute() {
  if (videoEl.value) {
    videoEl.value.muted = muted.value;
  }
}

function loadVideo(src, name) {
  videoSource.value = src;
  videoName.value = name || "Video";
  isLoading.value = false;
  openDialog.value = null;
  currentTime.value = 0;
  duration.value = 0;
  volume.value = 100;
  videoPlaying.value = false;

  // Auto-play
  setTimeout(() => {
    if (videoEl.value && autoPlay.value) {
      videoEl.value?.play();
      videoPlaying.value = true;
    }
  }, 100);
}

function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadVideo(url, file.name);
  e.target.value = "";
}

function handleDrop(e) {
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith("video/")) return;
  const url = URL.createObjectURL(file);
  loadVideo(url, file.name);
}

function loadUrl() {
  if (!urlInput.value) return;
  loadVideo(urlInput.value, urlInput.value.split("/").pop());
}

function projectVideo() {
  if (!videoSource.value) return;
  window.$appdata.set("modules.video.url", videoSource.value);
  window.$appdata.set("modules.video.loop", loop.value);
  window.$appdata.set("modules.video.muted", muted.value);
  window.$appdata.set("modules.video.volume", volume.value);
  import("@/helpers/Popup").then(({ default: $popup }) => {
    $popup.open({ module: "video" });
  });
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
.video-player {
  max-height: 60vh;
  background: #000;
  border-radius: 4px;
}
.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.3s;
}
.drop-zone:hover {
  border-color: var(--accent-blue);
}
</style>