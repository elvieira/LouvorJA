<template>
  <div
    ref="container"
    class="d-flex align-center justify-center position-relative w-100 h-100 overflow-hidden"
  >
    <!-- Background layer (color/image + opacity), isolated so it never fades the digits -->
    <div
      v-if="!preview"
      class="position-absolute w-100 h-100"
      style="top: 0; left: 0;"
      :style="bgLayerStyle"
    />

    <div
      class="timer-digits position-relative font-weight-black d-flex align-center justify-center text-center w-100"
      :style="{
        fontSize: `${digitalFontSize}px`,
        color: preview ? 'var(--sidebar-text)' : config.textColor,
        textShadow: preview ? 'none' : `0 4px 30px ${config.textColor}40`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        opacity: running ? 1 : 0.85,
      }"
    >
      {{ formatted }}
    </div>
  </div>
</template>

<script>
import defaultConfig from "../defaultConfig";

export default {
  name: "TimerScreen",
  props: {
    preview: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    s_width: 0,
    s_height: 0,
  }),
  computed: {
    timer() {
      return this.$appdata.get("timer") || {};
    },
    config() {
      const appConfig = this.$appdata.get("timer_config");
      return { ...defaultConfig, ...appConfig };
    },
    bgLayerStyle() {
      return {
        backgroundColor: this.config.bgColor,
        backgroundImage: this.config.bgImage ? `url(${this.config.bgImage})` : "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        opacity: this.config.bgOpacity / 100,
      };
    },
    running() {
      return !!this.timer.running;
    },
    remaining() {
      return this.timer.remaining ?? 0;
    },
    formatted() {
      return this.$datetime.mmss(this.remaining);
    },
    digitalFontSize() {
      const v = Math.min(this.s_width, this.s_height);
      return Math.max(v * 0.35, 20); // Responsive font size
    },
  },
  mounted() {
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
  },
  methods: {
    windowResize() {
      const container = this.$refs.container;
      if (container) {
        this.s_width = container.offsetWidth;
        this.s_height = container.offsetHeight;

        if (this.s_width <= 0 || this.s_height <= 0) {
          const self = this;
          setTimeout(() => {
            self.windowResize();
          }, 100);
        }
      }
    },
  },
};
</script>

<style scoped>
.timer-digits {
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
</style>
