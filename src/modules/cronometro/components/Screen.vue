<template>
  <div
    ref="container"
    class="d-flex align-center justify-center position-relative w-100 h-100 overflow-hidden"
    :style="{
      background: preview ? 'transparent' : '#000000',
      color: preview ? 'var(--sidebar-text)' : '#FFFFFF',
    }"
  >
    <div
      class="cronometro-digits font-weight-black d-flex align-center justify-center text-center w-100"
      :style="{
        fontSize: `${digitalFontSize}px`,
        textShadow: preview ? 'none' : '0 4px 30px rgba(255,255,255,0.15)',
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
  }),
  computed: {
    cronometro() {
      return this.$appdata.get("cronometro") || {};
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
