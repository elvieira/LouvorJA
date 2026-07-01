<template>
  <div
    ref="container"
    class="d-flex flex-column align-center justify-center"
    :style="{
      background: isExpired ? '#D32F2F' : '#000',
      width: '100%',
      height: height ? height + 'px' : '100%',
      transition: 'background 0.5s ease',
    }"
  >
    <span
      class="font-weight-bold"
      :class="{ 'timer-blink': isUrgent && !isExpired }"
      :style="{
        color: isExpired ? '#fff' : isAlert ? '#FFD600' : '#fff',
        fontSize: fontSizePc(30) + 'px',
        fontFamily: 'Courier New, Courier, monospace',
        textShadow: isAlert ? '0 0 30px rgba(255,214,0,0.5)' : 'none',
        transition: 'color 0.3s ease',
        letterSpacing: '0.05em',
      }"
    >
      {{ display }}
    </span>
    <span
      v-if="isExpired"
      class="font-weight-bold mt-4"
      :style="{
        color: '#fff',
        fontSize: fontSizePc(8) + 'px',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
      }"
    >
      TEMPO ESGOTADO
    </span>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "ScreenTimerPage",
  props: {
    height: Number,
  },
  data: () => ({
    s_width: 0,
    s_height: 0,
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    projection() {
      return this.$appdata.get("modules.timer.projection");
    },
    display() {
      if (this.projection && this.projection.display) {
        return this.projection.display;
      }
      return "00:00";
    },
    isAlert() {
      return !!(this.projection && this.projection.isAlert);
    },
    isUrgent() {
      if (!this.projection) return false;
      var remaining = this.projection.remainingMs || 0;
      return remaining <= 10000 && remaining > 0;
    },
    isExpired() {
      return !!(this.projection && this.projection.isExpired);
    },
  },
  methods: {
    fontSizePc(pc) {
      var v = Math.min(this.s_width, this.s_height);
      return (pc * v) / 100 / 2;
    },
    windowResize() {
      var container = this.$refs.container;
      if (container) {
        this.s_width = container.offsetWidth;
        this.s_height = container.offsetHeight;
        if (this.s_width <= 0 || this.s_height <= 0) {
          var self = this;
          setTimeout(function () {
            self.windowResize();
          }, 100);
        }
      }
    },
  },
  mounted() {
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
  },
};
</script>

<style scoped>
.timer-blink {
  animation: timer-blink-anim 0.6s ease-in-out infinite;
}

@keyframes timer-blink-anim {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.15;
  }
}
</style>
