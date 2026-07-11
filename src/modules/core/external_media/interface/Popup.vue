<template>
  <div class="w-100 h-100 bg-black d-flex align-center justify-center">
    <video
      v-if="isVideo && filePath"
      ref="popupVideo"
      class="w-100 h-100"
      style="object-fit: contain;"
      :src="filePath"
      muted
      @canplay="onCanPlay"
      @error="onError"
    />
    <div v-else></div>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "PopupExternalMediaPage",
  computed: {
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
        const prefix = this.rawFilePath.startsWith('/') ? 'local://app' : 'local://app/';
        return `${prefix}${this.rawFilePath}`;
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
      return this.$appdata.get("modules.external_media.config.is_paused");
    },
    currentTime() {
      return this.$appdata.get("modules.external_media.config.current_time");
    },
  },
  watch: {
    currentTime(val) {
      const video = this.$refs.popupVideo;
      if (video && !video.seeking) {
        if (Math.abs(video.currentTime - val) > 0.5) {
          video.currentTime = val;
        }
      }
    },
    isPaused(val) {
      this.$nextTick(() => {
        const video = this.$refs.popupVideo;
        if (!video) return;
        if (val) {
          video.pause();
        } else {
          video.play().catch((err) => {
          });
        }
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      const video = this.$refs.popupVideo;
      if (video) {
        video.currentTime = this.currentTime || 0;
        if (!this.isPaused) {
          video.play().catch((err) => {
          });
        }
      }
    });
  },
  methods: {
    onCanPlay() {
      const video = this.$refs.popupVideo;
      if (video && !this.isPaused) {
        video.currentTime = this.currentTime || 0;
        video.play().catch((err) => {
        });
      }
    },
    onError(event) {
      const el = event.target;
      const error = el?.error;
      if (error) {
      }
    },
  },
};
</script>
