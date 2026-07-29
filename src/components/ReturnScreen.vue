<template>
  <div class="w-100 h-100 d-flex flex-column justify-space-between pa-8" :style="style_bg">
    <div class="d-flex flex-column align-center justify-center flex-grow-1" style="gap: 24px;">
      <div v-if="current_lyric" class="text-center current-lyric" v-html="current_lyric" />
      <div v-else class="text-center current-lyric" style="opacity: 0.4;">
        {{ t("return_screen_no_song") }}
      </div>

      <div v-if="next_lyric" class="text-center next-lyric" v-html="next_lyric" />
    </div>

    <div class="d-flex align-center justify-space-between status-bar">
      <span>{{ slide_status }}</span>
      <span>{{ remaining_time }}</span>
    </div>
  </div>
</template>

<script>
import $media from "@/helpers/Media";
import $datetime from "@/helpers/DateTime";

export default {
  name: "ReturnScreenComponent",
  computed: {
    background_color() {
      return this.$userdata.get("modules.config.return_screen_bg_color") || "#000000";
    },
    style_bg() {
      return {
        backgroundColor: this.background_color,
        color: "#ffffff",
      };
    },
    config() {
      return $media.config() || {};
    },
    slides() {
      return $media.slides() ?? [];
    },
    slide_index() {
      return this.config.slide_index ?? 0;
    },
    current_slide() {
      return this.slides[this.slide_index];
    },
    next_slide() {
      return this.slides[this.slide_index + 1];
    },
    current_lyric() {
      return this.current_slide?.lyric;
    },
    next_lyric() {
      return this.next_slide?.lyric;
    },
    last_slide() {
      return this.config.last_slide ?? this.slides.length;
    },
    slide_status() {
      if (!this.slides.length) {
        return "";
      }
      return `${this.t("return_screen_slide")} ${this.slide_index + 1}/${this.last_slide}`;
    },
    remaining_time() {
      const duration = this.config.duration ?? 0;
      const current_time = this.config.current_time ?? 0;
      const audio = this.config.audio;
      if (!audio || !duration) {
        return "--:--";
      }
      const remaining = Math.max(duration - current_time, 0);
      return $datetime.shortTime(remaining);
    },
  },
  methods: {
    t(text) {
      return this.$t(`modules.config.${text}`);
    },
  },
};
</script>

<style scoped>
.current-lyric {
  font-size: 6vw;
  font-weight: 700;
  line-height: 1.3;
  text-shadow: 0px 4px 16px rgba(0, 0, 0, 0.6);
}
.next-lyric {
  font-size: 3vw;
  font-weight: 500;
  opacity: 0.6;
  line-height: 1.3;
}
.status-bar {
  font-size: 1.6vw;
  font-weight: 600;
  opacity: 0.7;
  letter-spacing: 0.05em;
}
</style>
