<template>
  <div class="w-100 h-100 d-flex align-center justify-space-between status-bar-window px-6" :style="style_bg">
    <template v-if="show_clock">
      <span class="clock">{{ clock }}</span>
    </template>
    <template v-else>
      <span class="slide-count">{{ slide_status }}</span>
      <span class="time">{{ remaining_time }}</span>
    </template>
  </div>
</template>

<script>
import $media from "@/helpers/Media";
import $datetime from "@/helpers/DateTime";

export default {
  name: "ReturnStatusBarComponent",
  data: () => ({
    now: new Date(),
    clockInterval: null,
  }),
  computed: {
    popup_module() {
      return this.$appdata.get("popup_module");
    },
    is_bible_active() {
      return this.popup_module === "bible";
    },
    show_clock() {
      return !this.popup_module || this.is_bible_active;
    },
    clock() {
      return this.now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
    background_color() {
      return this.$userdata.get("modules.config.return_screen_bg_color") || "#000000";
    },
    font_color() {
      return this.$userdata.get("modules.config.return_screen_font_color") || "#ffffff";
    },
    style_bg() {
      return {
        backgroundColor: this.background_color,
        color: this.font_color,
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
  mounted() {
    this.clockInterval = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  unmounted() {
    clearInterval(this.clockInterval);
  },
  methods: {
    t(text) {
      return this.$t(`modules.config.${text}`);
    },
  },
};
</script>

<style scoped>
.status-bar-window {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.clock {
  font-size: 2.4vw;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  width: 100%;
  text-align: center;
}
.slide-count {
  font-size: 2.2vw;
  font-weight: 700;
  opacity: 0.85;
}
.time {
  font-size: 1.6vw;
  font-weight: 600;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
</style>
