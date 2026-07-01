<template>
  <div
    ref="container"
    class="d-flex flex-column align-center justify-center overflow-hidden"
    :style="{
      background: '#000',
      width: '100%',
      height: height ? height + 'px' : '100%'
    }"
  >
    <div v-if="projection" class="screen-content">
      <div
        class="timer-text font-weight-bold"
        :class="{ 'blink': shouldBlink }"
      >
        {{ displayTime }}
      </div>

      <div v-if="projection.mode === 'worship' && projection.worshipPartName" class="worship-part-badge">
        {{ projection.worshipPartName }}
      </div>

      <div v-if="isFinished" class="time-up-text">
        {{ t('time_up') }}
      </div>
    </div>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "ScreenTimerPage",
  inject: ["popup_module"],
  props: { height: Number },
  data: () => ({ s_width: 0, s_height: 0, audioCtx: null }),
  computed: {
    module_id() { return this.popup_module || manifest.id; },
    module() { return this.$modules.get(this.module_id); },
    projection() {
      return this.$appdata.get(`modules.${this.module_id}.projection`);
    },
    displayTime() {
      if (!this.projection) return "00:00";
      return this.projection.displayTime || "00:00";
    },
    isFinished() {
      return this.projection?.isFinished === true;
    },
    shouldBlink() {
      return this.projection?.blink === true;
    }
  },
  mounted() {
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  },
  methods: {
    t(key) {
      return this.$t(`modules.${this.module_id}.${key}`);
    },
    fontSizePc(pc) {
      const v = Math.min(this.s_width, this.s_height);
      return (pc * v) / 100 / 2;
    },
    windowResize() {
      const container = this.$refs.container;
      if (container) {
        this.s_width = container.offsetWidth;
        this.s_height = container.offsetHeight;
        if (this.s_width <= 0 || this.s_height <= 0) {
          setTimeout(() => this.windowResize(), 100);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.screen-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40px;
}

.timer-text {
  font-size: 20vw;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  letter-spacing: 0.1em;
  line-height: 1;
}

.worship-part-badge {
  margin-top: 3rem;
  font-size: 4vw;
  color: var(--accent-blue);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.time-up-text {
  font-size: 6vw;
  color: #f44336;
  font-weight: bold;
  margin-top: 3rem;
  letter-spacing: 0.1em;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.blink {
  animation: blink 1s ease-in-out infinite;
}
</style>