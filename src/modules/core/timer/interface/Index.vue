<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page">
      <div class="content-main">
        <div class="timer-container">
          <div class="timer-left">
            <div class="timer-card">
              <div class="timer-card-header">
                <v-icon color="var(--accent-blue)">mdi-timer-outline</v-icon>
                <h3 class="timer-card-title">{{ t("title") }}</h3>
              </div>

              <div class="timer-mode-selector">
                <v-btn-toggle v-model="mode" mandatory color="var(--accent-blue)">
                  <v-btn value="simple" size="small">
                    <v-icon start>mdi-clock-outline</v-icon>
                    {{ t("simple_mode") }}
                  </v-btn>
                  <v-btn value="worship" size="small">
                    <v-icon start>mdi-account-group</v-icon>
                    {{ t("worship_mode") }}
                  </v-btn>
                </v-btn-toggle>
              </div>

              <div v-if="mode === 'simple'" class="timer-inputs">
                <v-text-field
                  v-model.number="inputMinutes"
                  :min="0"
                  :max="999"
                  :label="t('minutes')"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="max-width: 120px"
                />
                <v-text-field
                  v-model.number="inputSeconds"
                  :min="0"
                  :max="59"
                  :label="t('seconds')"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="max-width: 120px"
                />
                <v-btn-toggle v-model="timerMode" mandatory color="var(--accent-blue)" size="small">
                  <v-btn value="countdown">{{ t("countdown") }}</v-btn>
                  <v-btn value="countup">{{ t("countup") }}</v-btn>
                </v-btn-toggle>
              </div>

              <div v-if="mode === 'simple'" class="timer-presets">
                <v-btn
                  v-for="preset in presets"
                  :key="preset"
                  size="small"
                  variant="outlined"
                  @click="setPreset(preset)"
                >{{ preset }}m</v-btn>
              </div>

              <div v-if="mode === 'worship'" class="timer-worship-config">
                <div class="timer-inputs">
                  <v-btn-toggle v-model="worshipTimeMode" mandatory color="var(--accent-blue)" size="small">
                    <v-btn value="duration">{{ t("duration_mode") }}</v-btn>
                    <v-btn value="target">{{ t("time_mode") }}</v-btn>
                  </v-btn-toggle>
                </div>

                <div v-if="worshipTimeMode === 'duration'" class="timer-inputs">
                  <v-text-field
                    v-model.number="worshipTotalMinutes"
                    :min="1"
                    :max="999"
                    :label="t('total_minutes')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 200px"
                  />
                </div>

                <div v-if="worshipTimeMode === 'target'" class="timer-inputs">
                  <v-text-field
                    v-model="worshipTargetTime"
                    :label="t('target_time')"
                    type="time"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 200px"
                  />
                </div>

                <div class="mt-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <h4>{{ t("parts") }}</h4>
                    <v-btn size="small" color="var(--accent-blue)" @click="addPart">
                      <v-icon start>mdi-plus</v-icon>
                      {{ t("add_part") }}
                    </v-btn>
                  </div>
                  <div class="timer-parts-list">
                    <div
                      v-for="(part, index) in worshipParts"
                      :key="index"
                      class="timer-part-item"
                      :class="{ 'timer-part-active': index === worshipCurrentPart && running }"
                    >
                      <v-text-field
                        v-model="part.name"
                        :label="t('part_name')"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="flex-1"
                      />
                      <v-text-field
                        v-model.number="part.minutes"
                        :min="1"
                        :label="t('part_duration')"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="max-width: 100px"
                      />
                      <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="removePart(index)" />
                    </div>
                  </div>
                </div>

                <div class="timer-audio-settings mt-4">
                  <div class="d-flex align-center mb-2">
                    <v-icon size="small" class="mr-1">mdi-volume-high</v-icon>
                    <h4 class="text-body-2">{{ t("audio_settings") }}</h4>
                  </div>
                  <div class="d-flex flex-column gap-1">
                    <div class="d-flex align-center">
                      <v-checkbox v-model="audioEnabled.opening" density="compact" hide-details :label="t('audio_opening')" />
                      <v-btn size="x-small" variant="text" @click="playSound('abertura_escsb.mp3')">{{ t("preview_sound") }}</v-btn>
                    </div>
                    <div class="d-flex align-center">
                      <v-checkbox v-model="audioEnabled.fiveMin" density="compact" hide-details :label="t('audio_5min')" />
                      <v-btn size="x-small" variant="text" @click="playSound('5minutos_escsb.mp3')">{{ t("preview_sound") }}</v-btn>
                    </div>
                    <div class="d-flex align-center">
                      <v-checkbox v-model="audioEnabled.oneMin" density="compact" hide-details :label="t('audio_1min')" />
                      <v-btn size="x-small" variant="text" @click="playSound('1minuto_escsb.mp3')">{{ t("preview_sound") }}</v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <div class="timer-controls mt-4">
                <v-btn v-if="!running && !paused" color="success" @click="startTimer" :disabled="!canStart">
                  <v-icon start>mdi-play</v-icon> {{ t("start") }}
                </v-btn>
                <v-btn v-if="running" color="warning" @click="pauseTimer">
                  <v-icon start>mdi-pause</v-icon> {{ t("pause") }}
                </v-btn>
                <v-btn v-if="paused" color="success" @click="resumeTimer">
                  <v-icon start>mdi-play</v-icon> {{ t("resume") }}
                </v-btn>
                <v-btn color="error" @click="resetTimer">
                  <v-icon start>mdi-stop</v-icon> {{ t("stop") }}
                </v-btn>
              </div>

              <div v-if="running || paused" class="timer-add-time mt-3">
                <span class="text-caption mr-2">{{ t("add_time") }}:</span>
                <v-btn size="small" variant="outlined" color="success" @click="addTime(1)" class="mr-1">{{ t("add_1_min") }}</v-btn>
                <v-btn size="small" variant="outlined" color="success" @click="addTime(5)" class="mr-1">{{ t("add_5_min") }}</v-btn>
                <v-btn size="small" variant="outlined" color="success" @click="addTime(10)">{{ t("add_10_min") }}</v-btn>
                <v-btn size="small" variant="outlined" color="error" @click="addTime(-1)" class="ml-2 mr-1">{{ t("sub_1_min") }}</v-btn>
                <v-btn size="small" variant="outlined" color="error" @click="addTime(-5)" class="mr-1">{{ t("sub_5_min") }}</v-btn>
                <v-btn size="small" variant="outlined" color="error" @click="addTime(-10)">{{ t("sub_10_min") }}</v-btn>
              </div>
            </div>
          </div>

          <div class="timer-right">
            <div class="timer-time-display">
              <div class="timer-display-value" :class="displayClass">{{ displayTime }}</div>
              <div class="timer-display-label">
                {{ mode === 'simple' ? (timerMode === 'countdown' ? t('countdown') : t('countup')) : t('worship_mode') }}
              </div>
              <div v-if="mode === 'worship' && worshipParts.length > 0 && (running || paused)" class="timer-worship-badge">
                {{ worshipCurrentPart + 1 }}/{{ worshipParts.length }}: {{ worshipParts[worshipCurrentPart]?.name || '' }}
              </div>
            </div>

            <div class="timer-projection-actions mt-2">
              <LScreenBtn module="timer" />
            </div>

            <div class="timer-history">
              <h4 class="mb-2">{{ t("history") }}</h4>
              <div v-for="(entry, index) in history" :key="index" class="timer-history-item">
                <div class="timer-history-time">{{ entry.time }}</div>
                <div class="timer-history-timestamp">{{ entry.timestamp }}</div>
              </div>
              <div v-if="history.length === 0" class="text-center text--disabled py-4">{{ t("projection_ready") }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import LScreenBtn from "@/components/buttons/Screen.vue";

export default {
  name: "TimerIndexPage",
  components: { LScreenBtn },
  data: () => ({
    mode: "simple",
    timerMode: "countdown",
    running: false,
    paused: false,
    pausedRemaining: 0,
    endTimestamp: 0,
    now: Date.now(),
    timerInterval: null,
    audioElement: null,
    _audioCtx: null,

    soundedAlerts: {},

    audioEnabled: {
      opening: true,
      fiveMin: true,
      oneMin: true,
    },

    inputMinutes: 5,
    inputSeconds: 0,

    worshipTimeMode: "duration",
    worshipTotalMinutes: 60,
    worshipTargetTime: "10:00",
    worshipParts: [],
    worshipCurrentPart: 0,
    worshipPartTimers: {},

    presets: [5, 10, 15, 30, 45, 60],
    history: [],
    blink: false,
  }),
  computed: {
    module_id() { return manifest.id; },
    module() { return this.$modules.get(this.module_id); },

    totalSeconds() {
      return (this.inputMinutes * 60) + this.inputSeconds;
    },

    remainingSeconds() {
      if (this.mode === "simple") {
        if (!this.running && !this.paused) {
          return this.timerMode === "countdown" ? this.totalSeconds : 0;
        }
        if (this.paused) return this.pausedRemaining;
        if (this.timerMode === "countup") {
          return Math.round((this.now - this.endTimestamp) / 1000);
        }
        return Math.round((this.endTimestamp - this.now) / 1000);
      }
      if (!this.running && !this.paused) {
        if (this.worshipTimeMode === "duration") return this.worshipTotalMinutes * 60;
        return this.worshipTargetSeconds;
      }
      if (this.paused) return this.pausedRemaining;
      return Math.round((this.endTimestamp - this.now) / 1000);
    },

    worshipTargetSeconds() {
      const parts = this.worshipTargetTime.split(":");
      if (parts.length < 2) return 0;
      const now = new Date();
      const target = new Date();
      target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      let diff = Math.round((target - now) / 1000);
      // Se ja passou, mostra 0 no preview (a logica de proximo dia so roda no startTimer)
      if (diff < 0) return 0;
      return diff;
    },

    formattedTime() {
      const s = this.remainingSeconds;
      const isNegative = s < 0 && this.mode === "worship";
      const absS = Math.abs(s);
      const hours = Math.floor(absS / 3600);
      const mins = Math.floor((absS % 3600) / 60);
      const secs = absS % 60;
      let result;
      if (hours > 0) {
        result = String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
      } else {
        result = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
      }
      return isNegative ? "-" + result : result;
    },

    displayTime() { return this.formattedTime; },

    displayClass() {
      if (this.blink) return "timer-blink timer-display-red";
      if (this.remainingSeconds < 0 && this.mode === "worship") return "timer-display-red";
      if (this.remainingSeconds <= 60 && this.running) return "timer-display-orange";
      return "";
    },

    worshipPartsTotal() {
      return this.worshipParts.reduce((sum, p) => sum + (p.minutes || 0), 0);
    },

    canStart() {
      if (this.mode === "simple") {
        return this.timerMode === "countdown" ? this.totalSeconds > 0 : true;
      }
      if (this.worshipTimeMode === "target") return this.worshipTargetSeconds > 0;
      return this.worshipTotalMinutes > 0;
    },
  },
  watch: {
    "module.show": {
      handler(newVal) {
        if (newVal) this.loadSavedData();
      },
      immediate: true,
    },
  },
  methods: {
    t(text) {
      return this.$t("modules." + this.module_id + "." + text);
    },

    loadSavedData() {
      try {
        const saved = this.$userdata.get("modules." + this.module_id);
        if (saved) {
          this.inputMinutes = saved.inputMinutes ?? 5;
          this.inputSeconds = saved.inputSeconds ?? 0;
          this.timerMode = saved.timerMode ?? "countdown";
          this.worshipTotalMinutes = saved.worshipTotalMinutes ?? 60;
          this.worshipTargetTime = saved.worshipTargetTime ?? "10:00";
          this.worshipParts = saved.worshipParts ?? [];
          this.audioEnabled = saved.audioEnabled ?? { opening: true, fiveMin: true, oneMin: true };
        }
      } catch (e) {
        console.error("Error loading timer data:", e);
      }
    },

    saveData() {
      this.$userdata.set("modules." + this.module_id, {
        inputMinutes: this.inputMinutes,
        inputSeconds: this.inputSeconds,
        timerMode: this.timerMode,
        worshipTotalMinutes: this.worshipTotalMinutes,
        worshipTargetTime: this.worshipTargetTime,
        worshipParts: this.worshipParts,
        audioEnabled: this.audioEnabled,
      });
    },

    setPreset(minutes) {
      this.inputMinutes = minutes;
      this.inputSeconds = 0;
      this.saveData();
    },

    // ===== SOUND ENGINE =====
    playSound(filename) {
      try {
        this.stopSound();
        this.audioElement = new Audio("/sounds/timer/" + filename);
        this.audioElement.volume = 1;
        this.audioElement.play().catch(() => {});
      } catch (e) {}
    },

    stopSound() {
      if (this.audioElement) {
        try { this.audioElement.pause(); this.audioElement.currentTime = 0; } catch (e) {}
      }
    },

    playBeep(freq, duration, volume) {
      try {
        if (!this._audioCtx) {
          this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        var osc = this._audioCtx.createOscillator();
        var gain = this._audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this._audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.value = volume;
        osc.start();
        osc.stop(this._audioCtx.currentTime + duration);
      } catch (e) {}
    },

    // ===== TIMER CONTROLS =====
    startTimer() {
      this.stopSound();
      if (this.mode === "worship" && this.audioEnabled.opening) {
        this.playSound("abertura_escsb.mp3");
      }

      if (this.mode === "simple") {
        if (this.timerMode === "countup") {
          this.endTimestamp = Date.now();
        } else {
          this.endTimestamp = Date.now() + (this.totalSeconds * 1000);
        }
      } else {
        if (this.worshipTimeMode === "target") {
          var parts = this.worshipTargetTime.split(":");
          var target = new Date();
          target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
          this.endTimestamp = target.getTime() < Date.now() ? target.getTime() + 86400000 : target.getTime();
        } else {
          this.endTimestamp = Date.now() + (this.worshipTotalMinutes * 60 * 1000);
        }
      }

      this.running = true;
      this.paused = false;
      this.worshipCurrentPart = 0;
      this.worshipPartTimers = {};
      this.soundedAlerts = {};
      this.blink = false;
      this.timerInterval = setInterval(this.tick, 500);
      this.updateProjection();
    },

    pauseTimer() {
      this.pausedRemaining = this.remainingSeconds;
      this.running = false;
      this.paused = true;
      clearInterval(this.timerInterval);
      this.updateProjection();
    },

    resumeTimer() {
      this.endTimestamp = Date.now() + (this.pausedRemaining * 1000);
      this.running = true;
      this.paused = false;
      this.timerInterval = setInterval(this.tick, 500);
      this.updateProjection();
    },

    resetTimer() {
      this.stopSound();
      this.running = false;
      this.paused = false;
      this.pausedRemaining = 0;
      this.endTimestamp = 0;
      clearInterval(this.timerInterval);
      this.blink = false;
      this.worshipCurrentPart = 0;
      this.worshipPartTimers = {};
      this.soundedAlerts = {};
      this.updateProjection();
    },

    addTime(minutes) {
      this.stopSound();
      this.endTimestamp += minutes * 60 * 1000;
      if (this.paused) {
        this.pausedRemaining += minutes * 60;
        if (this.pausedRemaining < 0) this.pausedRemaining = 0;
      }
      var remaining = this.remainingSeconds;
      if (remaining > 310) this.soundedAlerts["5min"] = false;
      if (remaining > 70) this.soundedAlerts["1min"] = false;
      this.updateProjection();
    },

    tick() {
      this.now = Date.now();
      var remaining = this.remainingSeconds;

      if (this.timerMode === "countup" && this.mode === "simple") {
        // Check if countup reached the target time
        if (remaining >= this.totalSeconds && !this.blink) {
          this.blink = true;
          this.finishTimer();
        } else {
          this.updateProjection();
        }
        return;
      }

      // 5min alert at 5min10s (310s) - desktop: '00:05:10'
      if (remaining <= 310 && remaining >= 308 && !this.soundedAlerts["5min"]) {
        this.soundedAlerts["5min"] = true;
        if (this.mode === "worship" && this.audioEnabled.fiveMin) {
          this.playSound("5minutos_escsb.mp3");
        } else if (this.mode === "simple") {
          this.playBeep(440, 0.3, 0.4);
        }
      }

      // 1min alert at 1min10s (70s) - desktop: '00:01:10'
      if (remaining <= 70 && remaining >= 68 && !this.soundedAlerts["1min"]) {
        this.soundedAlerts["1min"] = true;
        if (this.mode === "worship" && this.audioEnabled.oneMin) {
          this.playSound("1minuto_escsb.mp3");
        } else if (this.mode === "simple") {
          this.playBeep(587, 0.15, 0.4);
        }
      }

      if (this.mode === "worship") this.checkWorshipParts(remaining);

      if (remaining <= 0 && !this.blink) {
        this.blink = true;
        this.finishTimer();
      } else {
        this.updateProjection();
      }
    },

    checkWorshipParts(totalRemaining) {
      if (this.worshipParts.length === 0) return;
      var totalSec = this.worshipTimeMode === "duration" ? this.worshipTotalMinutes * 60 : this.worshipTargetSeconds;
      var elapsed = totalSec - totalRemaining;
      var accumulated = 0;
      var newIndex = 0;
      for (var i = 0; i < this.worshipParts.length; i++) {
        accumulated += (this.worshipParts[i].minutes || 0) * 60;
        if (elapsed < accumulated) { newIndex = i; break; }
        newIndex = i;
      }
      if (newIndex !== this.worshipCurrentPart) this.worshipCurrentPart = newIndex;
    },

    finishTimer() {
      this.running = false;
      clearInterval(this.timerInterval);
      var now = new Date();
      this.history.unshift({ time: this.formattedTime, timestamp: now.toLocaleTimeString() });
      if (this.history.length > 10) this.history.pop();
      setTimeout(() => { this.blink = false; }, 5000);
      this.updateProjection({ isFinished: true });
    },

    addPart() {
      this.worshipParts.push({ name: "Parte " + (this.worshipParts.length + 1), minutes: 10 });
      this.saveData();
    },

    removePart(index) {
      this.worshipParts.splice(index, 1);
      this.saveData();
    },

    updateProjection(extra) {
      extra = extra || {};
      var currentPart = this.mode === "worship" && this.worshipParts.length > 0
        ? this.worshipParts[this.worshipCurrentPart] : null;
      this.$appdata.set("modules." + this.module_id + ".projection", {
        displayTime: this.displayTime,
        blink: this.blink,
        isFinished: extra.isFinished || false,
        mode: this.mode,
        worshipPartName: currentPart ? currentPart.name : null,
        worshipCurrentPart: this.worshipCurrentPart + 1,
        worshipTotalParts: this.worshipParts.length,
        isNegative: this.remainingSeconds < 0,
      });
    },
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
    this.stopSound();
    if (this._audioCtx) this._audioCtx.close();
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/timer.scss";
</style>
