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
    <div v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

export default defineComponent({
  name: "PopupExternalMediaPage",
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    rawFilePath(): string {
      return this.$appdata.get("modules.external_media.filePath") || "";
    },
    filePath(): string {
      if (!this.rawFilePath) return "";
      if (window.electronAPI) {
        // Usa o dummy host 'app' para evitar que o Chromium altere o case do path no macOS/Linux
        const prefix = this.rawFilePath.startsWith("/") ? "local://app" : "local://app/";
        return `${prefix}${this.rawFilePath}`;
      }
      return this.rawFilePath;
    },
    mediaTitle(): string {
      return this.$appdata.get("modules.external_media.title") || "Mídia Externa";
    },
    isVideo(): boolean {
      if (!this.rawFilePath) return false;
      const ext = this.rawFilePath.split(".").pop()?.toLowerCase() || "";
      return ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext);
    },
    isPaused(): boolean {
      return this.$appdata.get("modules.external_media.config.is_paused");
    },
    currentTime(): number {
      return this.$appdata.get("modules.external_media.config.current_time");
    },
  },
  watch: {
    currentTime(val: number) {
      const video = this.$refs.popupVideo as HTMLVideoElement;
      if (video && !video.seeking) {
        if (Math.abs(video.currentTime - val) > 0.5) {
          video.currentTime = val;
        }
      }
    },
    isPaused(val: boolean) {
      this.$nextTick(() => {
        const video = this.$refs.popupVideo as HTMLVideoElement;
        if (!video) return;
        
        if (val) {
          video.pause();
        } else {
          video.play().catch(() => {
          });
        }
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      const video = this.$refs.popupVideo as HTMLVideoElement;
      if (video) {
        video.currentTime = this.currentTime || 0;
        if (!this.isPaused) {
          video.play().catch(() => {
          });
        }
      }
    });
  },
  methods: {
    onCanPlay() {
      const video = this.$refs.popupVideo as HTMLVideoElement;
      if (video && !this.isPaused) {
        video.currentTime = this.currentTime || 0;
        video.play().catch(() => {
        });
      }
    },
    onError(event: Event) {
      const el = event.target as any;
      const error = el?.error;
      if (error) {
        console.error("Video error:", error);
      }
    },
  },
});
</script>
