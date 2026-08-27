<template>
  <div class="w-100 h-100 bg-black d-flex align-center justify-center">
    <video
      v-if="isVideo"
      ref="popupVideo"
      class="w-100 h-100"
      style="object-fit: contain;"
      autoplay
      muted
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
  data: () => ({
    retryTimer: null as any,
    attached: false,
  }),
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
    forceSyncTime(): number {
      return this.$appdata.get("modules.external_media.config.force_sync_time");
    },
  },
  watch: {
    rawFilePath() {
      // Quando o arquivo muda, re-attach ao novo stream
      this.attached = false;
      this.$nextTick(() => {
        this.tryAttachStream();
      });
    },
  },
  mounted() {
    this.tryAttachStream();
  },
  beforeUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.cleanupStream();
  },
  methods: {
    tryAttachStream() {
      if (!this.isVideo || this.attached) return;
      
      // Tenta obter o stream capturado da janela principal
      const stream = (window.opener as any)?._externalMediaStream;
      if (stream) {
        this.attached = true;
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
        }
        this.$nextTick(() => {
          const video = this.$refs.popupVideo as HTMLVideoElement;
          if (video) {
            try {
              video.srcObject = stream.clone();
              video.play().catch(() => {});
            } catch (_e) {
              // Se captureStream falhou, usa fallback com src direto
              console.warn("captureStream fallback: usando src direto");
              this.useFallback();
            }
          }
        });
      } else {
        // Stream ainda não disponível, tenta novamente
        this.retryTimer = setTimeout(() => this.tryAttachStream(), 300);
      }
    },

    // Fallback: usa o método antigo com src direto (dupla decodificação)
    useFallback() {
      this.attached = true;
      const video = this.$refs.popupVideo as HTMLVideoElement;
      if (video && this.filePath) {
        video.srcObject = null;
        video.src = this.filePath;
        video.muted = true;
        video.currentTime = this.currentTime || 0;
        if (!this.isPaused) {
          video.play().catch(() => {});
        }
        // Ativa watchers de sync legado para o fallback
        this.$watch("currentTime", (val: number) => {
          if (video && !video.seeking && !video.paused) {
            const diff = val - video.currentTime;
            if (Math.abs(diff) > 0.8) {
              video.currentTime = val;
              video.playbackRate = 1.0;
            } else if (diff > 0.05) {
              video.playbackRate = 1.05;
            } else if (diff < -0.05) {
              video.playbackRate = 0.95;
            } else {
              video.playbackRate = 1.0;
            }
          }
        });
        this.$watch("forceSyncTime", (val: number) => {
          if (video) {
            video.currentTime = val;
          }
        });
        this.$watch("isPaused", (val: boolean) => {
          this.$nextTick(() => {
            if (!video) return;
            if (val) {
              video.pause();
            } else {
              if (Math.abs(video.currentTime - this.currentTime) > 0.3) {
                video.currentTime = this.currentTime;
              }
              video.play().catch(() => {});
            }
          });
        });
      }
    },

    cleanupStream() {
      const video = this.$refs.popupVideo as HTMLVideoElement;
      if (video && video.srcObject) {
        try {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        } catch (_e) { /* ignore */ }
        video.srcObject = null;
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
