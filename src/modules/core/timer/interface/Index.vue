<template>
  <l-window
    v-model="module.show"
    :title="t('title')"
    :icon="module.icon"
    closable
    minimizable
    @close="close()"
    @minimize="$modules.minimize(module_id)"
    @resize="resize"
    :index="show ? 1 : 0"
  >
    <template v-slot:customize>
      <l-customization-tools
        :module="module"
      />
    </template>

    <template v-slot:header-extra>
      <LScreenBtn module="timer" />
    </template>

    <div class="timer-container pa-4">
      <!-- Mode toggle -->
      <div class="text-center mb-4">
        <v-btn-toggle v-model="mode" mandatory color="primary" density="compact">
          <v-btn size="small" value="countdown">
            <v-icon start>mdi-arrow-down</v-icon>
            {{ t('modeCountdown') }}
          </v-btn>
          <v-btn size="small" value="countup">
            <v-icon start>mdi-arrow-up</v-icon>
            {{ t('modeCountup') }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Time input (only in countdown mode when not running) -->
      <div v-if="mode === 'countdown' && !running" class="mb-4">
        <v-row dense align="center" justify="center">
          <v-col cols="5">
            <v-text-field
              v-model.number="inputMinutes"
              type="number"
              :label="t('minutes')"
              min="0"
              max="999"
              variant="outlined"
              density="compact"
              hide-spin-buttons
              @update:model-value="savePreset"
            />
          </v-col>
          <v-col cols="1" class="text-center text-h5 font-weight-bold">:</v-col>
          <v-col cols="5">
            <v-text-field
              v-model.number="inputSeconds"
              type="number"
              :label="t('seconds')"
              min="0"
              max="59"
              variant="outlined"
              density="compact"
              hide-spin-buttons
              @update:model-value="savePreset"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Presets -->
      <div v-if="mode === 'countdown' && !running && !paused" class="mb-4">
        <div class="text-caption text-grey mb-2 text-center">{{ t('presets') }}</div>
        <div class="d-flex justify-center flex-wrap gap-1">
          <v-chip
            v-for="p in presets"
            :key="p"
            @click="setPreset(p)"
            color="primary"
            variant="outlined"
            size="small"
          >
            {{ p }}min
          </v-chip>
        </div>
      </div>

      <!-- Big timer display -->
      <div class="timer-display text-center my-8">
        <div
          class="timer-text font-weight-bold"
          :class="{
            'timer-alert': isAlert && !isExpired,
            'timer-expired blink': isExpired,
          }"
        >
          {{ displayTime }}
        </div>
        <div v-if="isExpired" class="timer-expired-label mt-2">
          {{ t('timeUp') }}
        </div>
      </div>

      <!-- Controls -->
      <div class="timer-controls d-flex justify-center gap-2">
        <v-btn
          v-if="!running && !paused"
          color="success"
          size="large"
          :disabled="mode === 'countdown' && totalSeconds === 0"
          @click="start"
        >
          <v-icon start>mdi-play</v-icon>
          {{ t('start') }}
        </v-btn>

        <v-btn v-if="running && !paused" color="warning" size="large" @click="pause">
          <v-icon start>mdi-pause</v-icon>
          {{ t('pause') }}
        </v-btn>

        <v-btn v-if="paused" color="success" size="large" @click="resume">
          <v-icon start>mdi-play</v-icon>
          {{ t('resume') }}
        </v-btn>

        <v-btn
          v-if="running || paused"
          color="error"
          size="large"
          variant="outlined"
          @click="reset"
        >
          <v-icon start>mdi-stop</v-icon>
          {{ t('reset') }}
        </v-btn>
      </div>
    </div>
  </l-window>
</template>

<script>
import manifest from "../manifest.json";
import LWindow from "@/components/Window.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import LCustomizationTools from "@/components/CustomizationTools.vue";

const PRESETS = [5, 10, 15, 30, 45, 60];

export default {
  name: "TimerIndexPage",
  components: {
    LWindow,
    LScreenBtn,
    LCustomizationTools,
  },
  data: () => ({
    mode: "countdown",
    inputMinutes: 5,
    inputSeconds: 0,
    running: false,
    paused: false,
    isExpired: false,
    elapsedMs: 0,
    targetEndMs: null,
    pausedAtMs: 0,
    totalSeconds: 300,
    intervalId: null,
    audioCtx: null,
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
    show() {
      return this.module ? this.module.show : false;
    },
    presets() {
      return PRESETS;
    },
    remainingMs() {
      if (!this.running && !this.paused) {
        if (this.mode === "countdown") {
          return this.totalSeconds * 1000;
        }
        return 0;
      }
      if (this.isExpired) return 0;
      if (this.mode === "countdown" && this.targetEndMs) {
        return Math.max(0, this.targetEndMs - Date.now());
      }
      return this.elapsedMs;
    },
    displayTime() {
      var ms = this.mode === "countdown" ? this.remainingMs : this.elapsedMs;
      var totalSec = Math.floor(ms / 1000);
      var m = Math.floor(totalSec / 60);
      var s = totalSec % 60;
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    },
    isAlert() {
      if (this.mode === "countdown") {
        var remaining = this.remainingMs;
        return remaining > 0 && remaining <= 60000;
      }
      return false;
    },
  },
  watch: {
    remainingMs(val) {
      this.updateProjection();
      if (this.mode === "countdown" && this.running) {
        if (val <= 10000 && val > 0) {
          this.playBeep();
        }
        if (val <= 0 && !this.isExpired) {
          this.onTimeUp();
        }
      }
    },
  },
  mounted() {
    this.loadPreset();
  },
  unmounted() {
    this.clearInterval();
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  },
  methods: {
    t(key) {
      if (this.module && this.module.t) {
        return this.module.t(key);
      }
      return key;
    },
    close() {
      this.$modules.close(this.module_id);
    },
    resize() {
      // noop for now
    },
    setPreset(minutes) {
      this.inputMinutes = minutes;
      this.inputSeconds = 0;
      this.totalSeconds = minutes * 60;
      this.savePreset();
    },
    savePreset() {
      this.totalSeconds = (this.inputMinutes || 0) * 60 + (this.inputSeconds || 0);
      this.$userdata.set("modules.timer.lastMinutes", this.inputMinutes || 0);
      this.$userdata.set("modules.timer.lastSeconds", this.inputSeconds || 0);
    },
    loadPreset() {
      var m = this.$userdata.get("modules.timer.lastMinutes", 5);
      var s = this.$userdata.get("modules.timer.lastSeconds", 0);
      this.inputMinutes = m;
      this.inputSeconds = s;
      this.totalSeconds = m * 60 + s;
    },
    start() {
      if (this.mode === "countdown") {
        this.totalSeconds = (this.inputMinutes || 0) * 60 + (this.inputSeconds || 0);
        if (this.totalSeconds <= 0) return;
        this.targetEndMs = Date.now() + this.totalSeconds * 1000;
      }
      this.running = true;
      this.paused = false;
      this.isExpired = false;
      this.elapsedMs = 0;
      this._startedAt = Date.now();
      this.startInterval();
    },
    pause() {
      this.paused = true;
      this.pausedAtMs = Date.now();
      this.clearInterval();
      this.updateProjection();
    },
    resume() {
      if (this.mode === "countdown" && this.targetEndMs) {
        var drift = Date.now() - this.pausedAtMs;
        this.targetEndMs += drift;
      }
      this.paused = false;
      this.startInterval();
    },
    reset() {
      this.clearInterval();
      this.running = false;
      this.paused = false;
      this.isExpired = false;
      this.elapsedMs = 0;
      this.targetEndMs = null;
      this.updateProjection();
    },
    startInterval() {
      this.clearInterval();
      var self = this;
      this.intervalId = setInterval(function () {
        if (self.mode === "countup") {
          self.elapsedMs = Date.now() - self._startedAt;
        }
      }, 200);
    },
    clearInterval() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
    onTimeUp() {
      this.isExpired = true;
      this.running = false;
      this.clearInterval();
      this.playAlarm();
      this.updateProjection();
    },
    updateProjection() {
      this.$appdata.set("modules.timer.projection", {
        display: this.displayTime,
        isAlert: this.isAlert,
        isExpired: this.isExpired,
        mode: this.mode,
        running: this.running,
      });
    },
    playBeep() {
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
      } catch (e) {
        // Silently ignore audio failures
      }
    },
    playAlarm() {
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        for (var i = 0; i < 3; i++) {
          var osc = this.audioCtx.createOscillator();
          var gain = this.audioCtx.createGain();
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.frequency.value = 1200;
          gain.gain.value = 0.4;
          osc.start(this.audioCtx.currentTime + i * 0.3);
          osc.stop(this.audioCtx.currentTime + i * 0.3 + 0.15);
        }
      } catch (e) {
        // Silently ignore audio failures
      }
    },
  },
};
</script>

<style scoped>
.timer-container {
  max-width: 500px;
  margin: 0 auto;
}

.timer-text {
  font-size: 5rem;
  font-family: "Courier New", Courier, monospace;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
  line-height: 1;
}

.timer-alert {
  color: #ffd600 !important;
  text-shadow: 0 0 20px rgba(255, 214, 0, 0.5);
}

.timer-expired {
  color: #ff1744 !important;
  text-shadow: 0 0 20px rgba(255, 23, 68, 0.5);
}

.timer-expired-label {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff1744;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.timer-controls {
  margin-top: 1rem;
}

.blink {
  animation: blink-anim 0.8s ease-in-out infinite;
}

@keyframes blink-anim {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
</style>
