<template>
  <v-fade-transition>
    <div v-if="visible" class="cronometro-overlay d-flex align-center justify-center">
      <v-icon size="20" class="mr-2" style="opacity: 0.8;">
        {{ running ? 'mdi-timer-outline' : 'mdi-timer-pause-outline' }}
      </v-icon>
      <span class="cronometro-overlay-time">{{ formatted }}</span>
    </div>
  </v-fade-transition>
</template>

<script>
export default {
  name: "CronometroOverlayComponent",
  computed: {
    cronometro() {
      return this.$appdata.get("cronometro") || {};
    },
    visible() {
      return !!this.cronometro.started;
    },
    running() {
      return !!this.cronometro.running;
    },
    remaining() {
      return this.cronometro.remaining ?? 0;
    },
    formatted() {
      return this.$datetime.mmss(this.remaining);
    },
  },
};
</script>

<style scoped>
.cronometro-overlay {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 50;
  background: rgba(0, 0, 0, 0.55);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 10px 24px;
  pointer-events: none;
}
.cronometro-overlay-time {
  font-size: 2.2vw;
  font-weight: 800;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}
</style>
