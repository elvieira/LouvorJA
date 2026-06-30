<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-btn
        v-if="status !== 'stopped'"
        :color="status === 'running' ? 'warning' : 'primary'"
        :icon="status === 'running' ? 'mdi-pause' : 'mdi-play'"
        variant="text"
        @click="status === 'running' ? pause() : start()"
      />
      <v-btn
        v-if="elapsed > 0"
        icon="mdi-stop"
        variant="text"
        @click="reset()"
      />
      <v-spacer />
      <span class="text-caption text-medium-emphasis mr-2">
        {{ t('status_' + status) }}
      </span>
      <v-btn
        icon="mdi-cog-outline"
        variant="text"
        @click="showSettings = !showSettings"
      />
    </template>

    <div class="timer-container pa-4">
      <!-- Config mode (only when stopped) -->
      <div v-if="status === 'stopped'" class="text-center mb-4">
        <v-btn-toggle v-model="selectedPreset" color="primary" variant="outlined" divided>
          <v-btn v-for="preset in presets" :key="preset.value" :value="preset.value" size="small">
            {{ preset.label }}
          </v-btn>
          <v-btn value="custom" size="small">
            {{ t('custom') }}
          </v-btn>
        </v-btn-toggle>

        <div v-if="selectedPreset === 'custom'" class="mt-3" style="max-width: 200px; margin: 0 auto;">
          <v-text-field
            v-model.number="customMinutes"
            :label="t('minutes')"
            type="number"
            min="1"
            max="999"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
      </div>

      <!-- Main clock display -->
      <div class="text-center my-6">
        <div
          class="timer-display"
          :class="{ 'time-up': timeUp }"
        >
          <span v-if="hours > 0" class="timer-segment">{{ formattedHours }}:</span>
          <span class="timer-segment">{{ formattedMinutes }}</span>
          <span class="timer-segment timer-sep">:</span>
          <span class="timer-segment">{{ formattedSeconds }}</span>
        </div>

        <!-- Time up indicator -->
        <div v-if="timeUp" class="time-up-banner mt-2">
          <v-icon icon="mdi-alert-circle" color="error" size="48" class="mb-2" />
          <div class="text-h5 font-weight-bold text-error">
            {{ t('time_up') }}
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="text-center mb-4">
        <v-btn
          v-if="status === 'stopped'"
          color="primary"
          size="large"
          :disabled="totalSeconds <= 0"
          @click="start()"
        >
          <v-icon start icon="mdi-play" />
          {{ t('start') }}
        </v-btn>
        <v-btn
          v-else
          :color="status === 'running' ? 'warning' : 'primary'"
          size="large"
          class="mr-2"
          @click="status === 'running' ? pause() : start()"
        >
          <v-icon start :icon="status === 'running' ? 'mdi-pause' : 'mdi-play'" />
          {{ status === 'running' ? t('pause') : t('resume') }}
        </v-btn>
        <v-btn
          size="large"
          variant="outlined"
          @click="reset()"
        >
          <v-icon start icon="mdi-stop" />
          {{ t('reset') }}
        </v-btn>
      </div>

      <!-- Info row -->
      <div class="d-flex justify-center gap-4 mt-2">
        <v-chip variant="text" size="small" prepend-icon="mdi-clock-outline">
          {{ t('elapsed') }}: {{ formatTime(elapsed) }}
        </v-chip>
        <v-chip variant="text" size="small" prepend-icon="mdi-timer-sand">
          {{ t('remaining') }}: {{ formatTime(Math.max(0, totalSeconds - elapsed)) }}
        </v-chip>
      </div>
    </div>
  </ModuleContainer>
</template>

<script>
export default {
  name: "TimerModule",
};
</script>

<script setup>
import { ref, computed } from "vue";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import manifest from "../manifest.json";

const moduleContainer = ref(null);
const t = (key) => {
  return moduleContainer.value?.t(key) || key;
};

// Presets
const presets = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "15 min", value: 900 },
  { label: "20 min", value: 1200 },
  { label: "30 min", value: 1800 },
  { label: "60 min", value: 3600 },
];

const selectedPreset = ref(300); // 5 min default
const customMinutes = ref(10);
const totalSeconds = ref(300);
const elapsed = ref(0);
const status = ref("stopped"); // stopped, running, paused
const timeUp = ref(false);
const showSettings = ref(false);

let interval = null;

const hours = computed(() => Math.floor((totalSeconds.value - elapsed.value) / 3600));
const minutes = computed(() => Math.floor(((totalSeconds.value - elapsed.value) % 3600) / 60));
const seconds = computed(() => (totalSeconds.value - elapsed.value) % 60);

const formattedHours = computed(() => String(hours.value).padStart(2, "0"));
const formattedMinutes = computed(() => String(minutes.value).padStart(2, "0"));
const formattedSeconds = computed(() => String(seconds.value).padStart(2, "0"));

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function start() {
  if (status.value === "stopped") {
    // Set total time from preset or custom
    if (selectedPreset.value === "custom") {
      totalSeconds.value = customMinutes.value * 60;
    } else {
      totalSeconds.value = selectedPreset.value;
    }
    elapsed.value = 0;
    timeUp.value = false;
  }

  status.value = "running";

  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    elapsed.value++;
    if (elapsed.value >= totalSeconds.value) {
      clearInterval(interval);
      interval = null;
      status.value = "stopped";
      timeUp.value = true;
      // Play beep sound via Web Audio API
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        // Audio not available
      }
    }
  }, 1000);
}

function pause() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  status.value = "paused";
}

function reset() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  elapsed.value = 0;
  status.value = "stopped";
  timeUp.value = false;
  totalSeconds.value = selectedPreset.value === "custom" ? customMinutes.value * 60 : selectedPreset.value;
}
</script>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.timer-display {
  font-family: "Roboto Mono", "Roboto", monospace;
  font-size: 5rem;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 4px;
  transition: color 0.5s ease;
  color: var(--accent-blue, #0097d7);
}

.timer-display.time-up {
  color: #ff5252;
  animation: pulse-red 1s ease-in-out infinite;
}

.timer-segment {
  display: inline-block;
}

.timer-sep {
  margin: 0 -4px;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.time-up-banner {
  animation: flash-banner 0.5s ease-in-out infinite alternate;
}

@keyframes flash-banner {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.gap-4 {
  gap: 16px;
}
</style>