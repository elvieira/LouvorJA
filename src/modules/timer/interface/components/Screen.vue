<template>
  <div
    class="screen-container w-100 h-100 d-flex flex-column align-center justify-center position-relative"
    :style="backgroundStyle"
    :class="[{ 'blink-animation': isAlerting }, { 'is-preview': preview }]"
  >
    <!-- MODO PADRÃO (Regressivo / Progressivo) -->
    <template v-if="mode !== 'cult'">
      <div 
        class="timer-text font-weight-black text-center" 
        :style="textStyle"
      >
        {{ formattedTime }}
      </div>
    </template>

    <!-- MODO CRONÔMETRO DE CULTO -->
    <template v-else>
      <div class="cult-container w-100 h-100 d-flex flex-column align-center justify-center position-relative">
        <!-- Mostrador Superior: Hora Atual (Relógio) -->
        <div
          v-if="showCultClock"
          class="cult-clock font-weight-bold text-center d-flex align-center justify-center"
          :style="cultClockStyle"
        >
          {{ currentClockTime }}
        </div>

        <!-- Mostrador Inferior: Tempo Restante / Negativo -->
        <div
          class="cult-timer font-weight-black text-center d-flex align-center justify-center"
          :style="cultTimerStyle"
        >
          {{ formattedCultTime }}
        </div>

        <!-- Barra de Progresso Inferior (Gauge) -->
        <div
          class="cult-gauge-container position-absolute bottom-0 left-0 w-100"
          :style="{ height: preview ? '5px' : '10px', background: preview ? 'rgba(128,128,128,0.2)' : 'rgba(255,255,255,0.1)' }"
        >
          <div
            class="cult-gauge-fill h-100"
            :style="{
              width: `${gaugePercent}%`,
              background: isCultNegative ? (config.cultWarningColor || '#ef4444') : (config.cultTimerColor || '#38bdf8'),
              transition: 'width 0.25s linear'
            }"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { playSchoolBellAlert, stopSchoolBellAlert, playCultAlert } from "../../helpers/audioAlert";

export default defineComponent({
  name: "TimerScreen",
  props: {
    preview: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  data: () => ({
    module_id: "timer",
    currentTimeMs: 0,
    currentClockTime: "00:00:00",
    cultRemainingMs: 0,
    animationFrameId: null as number | null,
    clockIntervalId: null as any,
  }),
  computed: {
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.$userdata.get(`modules.${this.module_id}.config`) || {
        fontColor: "#ffffff",
        bgColor: "#000000",
        visualAlert: true,
        audioAlert: true,
        cultBgColor: "#000000",
        cultClockColor: "#ffffff",
        cultTimerColor: "#38bdf8",
        cultWarningColor: "#ef4444",
        cultAlwaysShowClock: true,
        cultAllowNegative: true,
        cultAudioStart: false,
        cultAudio5min: true,
        cultAudio1min: true,
        cultAudioEnd: true,
      };
    },
    timerData(): any {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        mode: "timer",
        isStopwatch: false,
        isRunning: false,
        isFinished: false,
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 0,
        configuredDuration: 0,
        isAlerting: false,
        // Culto
        cultModeType: "duration",
        cultTargetEndTime: 0,
        cultTotalDurationMs: 0,
        cultRemainingMs: 0,
      };
    },
    mode(): string {
      return this.timerData?.mode || (this.timerData?.isStopwatch ? "stopwatch" : "timer");
    },
    isAlerting(): boolean {
      if (this.mode === "cult") return false;
      return Boolean(this.timerData?.isAlerting && this.config?.visualAlert !== false);
    },
    showCultClock(): boolean {
      if (this.config.cultAlwaysShowClock !== false) return true;
      return Boolean(this.timerData?.isRunning);
    },
    isCultNegative(): boolean {
      return this.cultRemainingMs < 0;
    },
    gaugePercent(): number {
      const total = this.timerData?.cultTotalDurationMs || 0;
      if (total <= 0) return 0;
      if (this.cultRemainingMs <= 0) return 0;
      return Math.min(100, Math.max(0, (this.cultRemainingMs / total) * 100));
    },
    formattedTime(): string {
      const totalSeconds = Math.floor(this.currentTimeMs / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      const mStr = m.toString().padStart(2, "0");
      const sStr = s.toString().padStart(2, "0");
      
      if (h > 0) {
        const hStr = h.toString().padStart(2, "0");
        return `${hStr}:${mStr}:${sStr}`;
      }
      return `${mStr}:${sStr}`;
    },
    formattedCultTime(): string {
      const isNeg = this.cultRemainingMs < 0;
      const absSeconds = Math.floor(Math.abs(this.cultRemainingMs) / 1000);
      const h = Math.floor(absSeconds / 3600);
      const m = Math.floor((absSeconds % 3600) / 60);
      const s = absSeconds % 60;

      const mStr = m.toString().padStart(2, "0");
      const sStr = s.toString().padStart(2, "0");

      let text = "";
      if (h > 0) {
        const hStr = h.toString().padStart(2, "0");
        text = `${hStr}:${mStr}:${sStr}`;
      } else {
        text = `${mStr}:${sStr}`;
      }

      return isNeg ? `-${text}` : text;
    },
    textStyle(): any {
      return {
        color: this.isAlerting
          ? "#ffffff"
          : (this.preview ? "var(--sidebar-text)" : this.config.fontColor),
        fontSize: this.preview ? "clamp(4rem, 8vw, 8rem)" : "25vmin",
        lineHeight: 1,
        textShadow: this.preview ? "none" : "0 10px 40px rgba(0,0,0,0.5)",
      };
    },
    cultClockStyle(): any {
      return {
        color: this.preview
          ? "var(--sidebar-text)"
          : (this.config.cultClockColor || "#ffffff"),
        fontSize: this.preview ? "clamp(2rem, 4vw, 3.6rem)" : "12vmin",
        lineHeight: 1.1,
        textShadow: this.preview ? "none" : "0 8px 30px rgba(0,0,0,0.6)",
        fontVariantNumeric: "tabular-nums",
      };
    },
    cultTimerStyle(): any {
      const color = this.isCultNegative
        ? (this.config.cultWarningColor || "#ef4444")
        : (this.config.cultTimerColor || "#38bdf8");
      return {
        color,
        fontSize: this.preview ? "clamp(3.5rem, 7.5vw, 6.8rem)" : "22vmin",
        lineHeight: 1.1,
        textShadow: this.preview ? "none" : "0 10px 40px rgba(0,0,0,0.6)",
        fontVariantNumeric: "tabular-nums",
      };
    },
    backgroundStyle(): any {
      if (this.isAlerting) {
        return {
          backgroundColor: "#78242c",
        };
      }
      if (this.preview) return { background: "transparent" };
      if (this.mode === "cult") {
        return {
          background: this.config.cultBgColor || this.config.bgColor || "#000000",
        };
      }
      return {
        background: this.config.bgColor,
      };
    },
  },
  watch: {
    isAlerting(newVal: boolean, oldVal: boolean) {
      if (!newVal && oldVal) {
        stopSchoolBellAlert();
      }
    },
  },
  mounted() {
    this.updateClock();
    this.clockIntervalId = setInterval(() => {
      this.updateClock();
    }, 500);
    this.startLoop();
  },
  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
    stopSchoolBellAlert();
  },
  methods: {
    updateClock() {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      this.currentClockTime = `${h}:${m}:${s}`;
    },
    startLoop() {
      const updateTime = () => {
        const data = this.timerData;
        const now = Date.now();

        if (data.mode === "cult") {
          // MODO CULTO
          if (data.isRunning) {
            const targetEnd = data.cultTargetEndTime || 0;
            const remaining = targetEnd - now;
            this.cultRemainingMs = remaining;

            // Alertas sonoros intermediários do Culto
            if (this.config.cultAudio5min !== false && !data.cultAudio5minPlayed) {
              if (remaining <= 300000 && remaining > 280000) {
                this.$appdata.set(`modules.${this.module_id}.data.cultAudio5minPlayed`, true);
                playCultAlert("5min");
              }
            }

            if (this.config.cultAudio1min !== false && !data.cultAudio1minPlayed) {
              if (remaining <= 60000 && remaining > 40000) {
                this.$appdata.set(`modules.${this.module_id}.data.cultAudio1minPlayed`, true);
                playCultAlert("1min");
              }
            }

            // Ao atingir 0
            if (remaining <= 0 && !data.cultAudioEndPlayed) {
              this.$appdata.set(`modules.${this.module_id}.data.cultAudioEndPlayed`, true);
              if (this.config.cultAudioEnd !== false) {
                playCultAlert("end");
              }

              // Se não permite contagem negativa, encerra automaticamente
              if (this.config.cultAllowNegative === false) {
                this.$appdata.set(`modules.${this.module_id}.data`, {
                  ...data,
                  isRunning: false,
                  isFinished: true,
                  cultRemainingMs: 0,
                });
              }
            }
          } else {
            // Culto parado / pausado / não iniciado
            if (data.isFinished) {
              this.cultRemainingMs = 0;
            } else if (data.cultRemainingMs !== undefined && data.cultRemainingMs !== null) {
              this.cultRemainingMs = data.cultRemainingMs;
            } else {
              this.cultRemainingMs = data.cultTotalDurationMs || 0;
            }
          }
        } else {
          // MODO PADRÃO (timer / stopwatch)
          if (data.isRunning) {
            const elapsed = data.accumulatedTime + (now - data.baseTime);
            
            if (data.isStopwatch) {
              this.currentTimeMs = elapsed;
            } else {
              let remaining = data.targetDuration - elapsed;
              if (remaining <= 0) {
                remaining = 0;
                if (data.isRunning) {
                  const visualAlert = this.config.visualAlert !== false;
                  this.$appdata.set(`modules.${this.module_id}.data`, {
                    ...data,
                    isRunning: false,
                    isFinished: true,
                    isAlerting: visualAlert,
                    accumulatedTime: data.targetDuration,
                  });
                  this.checkAndPlaySound();
                }
              }
              this.currentTimeMs = remaining;
            }
          } else {
            if (data.isStopwatch) {
              this.currentTimeMs = data.accumulatedTime || 0;
            } else {
              if (data.isFinished) {
                if (this.preview) {
                  if (data.isAlerting) {
                    this.currentTimeMs = 0;
                  } else {
                    this.currentTimeMs = data.configuredDuration || 0;
                  }
                } else {
                  this.currentTimeMs = 0;
                }
              } else {
                if (data.accumulatedTime > 0) {
                  this.currentTimeMs = Math.max(0, data.targetDuration - data.accumulatedTime);
                } else {
                  this.currentTimeMs = data.configuredDuration || data.targetDuration || 0;
                }
              }
            }
          }
        }
        
        this.animationFrameId = requestAnimationFrame(updateTime);
      };
      
      this.animationFrameId = requestAnimationFrame(updateTime);
    },
    checkAndPlaySound() {
      if (this.config.audioAlert === false) return;
      const lastPlayed = this.timerData.lastAudioAlertTime || 0;
      if (Date.now() - lastPlayed < 4000) return;
      this.$appdata.set(`modules.${this.module_id}.data.lastAudioAlertTime`, Date.now());
      playSchoolBellAlert();
    },
  },
});
</script>

<style scoped>
.timer-text, .cult-clock, .cult-timer {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

@keyframes alert-pulse {
  0%, 100% {
    opacity: 1;
    background-color: #8b1e2a !important;
  }
  50% {
    opacity: 0.65;
    background-color: #4a1218 !important;
  }
}

.blink-animation {
  animation: alert-pulse 1s infinite ease-in-out !important;
}

@media (max-height: 800px) {
  .screen-container.is-preview .cult-clock {
    font-size: clamp(1.2rem, 2.5vw, 2rem) !important;
  }
  .screen-container.is-preview .cult-timer {
    font-size: clamp(2.2rem, 4.5vw, 3.4rem) !important;
  }
}
</style>
