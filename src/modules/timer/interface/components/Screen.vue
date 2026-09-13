<template>
  <div
    class="screen-container w-100 h-100 d-flex flex-column align-center justify-center position-relative"
    :style="backgroundStyle"
    :class="{'blink-animation': isAlerting}"
  >
    <div 
      class="timer-text font-weight-black text-center" 
      :style="textStyle"
    >
      {{ formattedTime }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { playSchoolBellAlert, stopSchoolBellAlert } from "../../helpers/audioAlert";

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
    animationFrameId: null as number | null,
  }),
  computed: {
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.$userdata.get(`modules.${this.module_id}.config`) || {
        fontColor: "#ffffff",
        bgColor: "#000000",
        visualAlert: true,
        audioAlert: true,
      };
    },
    timerData(): any {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        isStopwatch: false,
        isRunning: false,
        isFinished: false,
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 0,
        configuredDuration: 0,
        isAlerting: false,
      };
    },
    isAlerting(): boolean {
      return Boolean(this.timerData?.isAlerting && this.config?.visualAlert !== false);
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
    backgroundStyle(): any {
      if (this.isAlerting) {
        return {
          backgroundColor: "#78242c",
        };
      }
      if (this.preview) return { background: "transparent" };
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
    this.startLoop();
  },
  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    stopSchoolBellAlert();
  },
  methods: {
    startLoop() {
      const updateTime = () => {
        const data = this.timerData;
        
        if (data.isRunning) {
          const elapsed = data.accumulatedTime + (Date.now() - data.baseTime);
          
          if (data.isStopwatch) {
            this.currentTimeMs = elapsed;
          } else {
            let remaining = data.targetDuration - elapsed;
            if (remaining <= 0) {
              remaining = 0;
              if (data.isRunning) {
                // Fim do tempo regressivo
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
          // Pausado ou parado
          if (data.isStopwatch) {
            this.currentTimeMs = data.accumulatedTime || 0;
          } else {
            if (data.isFinished) {
              if (this.preview) {
                // Na janela principal (preview):
                // Se o alerta visual estiver ativo, exibe 00:00 com efeito visual
                // Quando o alerta visual para (ou se já estava desligado), reseta para o tempo que o usuário colocou
                if (data.isAlerting) {
                  this.currentTimeMs = 0;
                } else {
                  this.currentTimeMs = data.configuredDuration || 0;
                }
              } else {
                // Na tela projetada:
                // Continua zerado (00:00) até o usuário iniciar de novo
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
        
        this.animationFrameId = requestAnimationFrame(updateTime);
      };
      
      this.animationFrameId = requestAnimationFrame(updateTime);
    },
    checkAndPlaySound() {
      if (this.config.audioAlert === false) return;
      const lastPlayed = this.timerData.lastAudioAlertTime || 0;
      if (Date.now() - lastPlayed < 4000) return; // evita tocar em duplicidade
      this.$appdata.set(`modules.${this.module_id}.data.lastAudioAlertTime`, Date.now());
      playSchoolBellAlert();
    },
  },
});
</script>

<style scoped>
.timer-text {
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
</style>
