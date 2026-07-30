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
      class="cronometro-digits position-relative font-weight-black d-flex align-center justify-center text-center w-100"
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
export default {
  name: "CronometroScreen",
  props: {
    preview: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    s_width: 0,
    s_height: 0,
    defaultConfig: {
      bgColor: "#000000",
      bgImage: null,
      bgOpacity: 100,
      textColor: "#FFFFFF",
    },
  }),
  computed: {
    cronometro() {
      return this.$appdata.get("cronometro") || {};
    },
    config() {
      const appConfig = this.$appdata ? this.$appdata.get("cronometro_config") : null;
      return { ...this.defaultConfig, ...appConfig };
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
      return !!this.cronometro.running;
    },
    remaining() {
      return this.cronometro.remaining ?? 0;
    },
    formatted() {
      const total = Math.max(Math.floor(this.remaining), 0);
      const minutes = Math.floor(total / 60).toString().padStart(2, "0");
      const seconds = (total % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
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
.cronometro-digits {
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
</style>
