<template>
  <div class="screen-container w-100 h-100 d-flex flex-column align-center justify-center position-relative" :style="backgroundStyle" :class="{'blink-animation': isAlerting && config.visualAlert}">
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
    isAlerting: false,
    animationFrameId: null as number | null,
    audioContext: null as AudioContext | null,
  }),
  computed: {
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || {
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
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 0,
        isAlerting: false,
      };
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
        color: this.preview ? "var(--sidebar-text)" : this.config.fontColor,
        fontSize: this.preview ? "clamp(4rem, 8vw, 8rem)" : "25vmin",
        lineHeight: 1,
        textShadow: this.preview ? "none" : "0 10px 40px rgba(0,0,0,0.5)",
      };
    },
    backgroundStyle(): any {
      if (this.preview) return { background: "transparent" };
      return {
        background: this.config.bgColor,
      };
    },
  },
  watch: {
    "timerData.isAlerting"(newVal: boolean, oldVal: boolean) {
      if (newVal && !oldVal && !this.preview) { // only trigger sound on projector/main instance if possible, or maybe both is fine but audio alert is better handled if preview plays it too? Actually let's let projector play it.
        this.triggerAlert();
      }
      this.isAlerting = newVal;
    },
  },
  mounted() {
    this.isAlerting = this.timerData.isAlerting;
    this.startLoop();
  },
  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
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
              if (!data.isAlerting) {
                // We reached 0
                this.$appdata.set(`modules.${this.module_id}.data.isAlerting`, true);
                this.$appdata.set(`modules.${this.module_id}.data.isRunning`, false);
                this.$appdata.set(`modules.${this.module_id}.data.accumulatedTime`, data.targetDuration);
              }
            }
            this.currentTimeMs = remaining;
          }
        } else {
          // Paused or stopped
          if (data.isStopwatch) {
            this.currentTimeMs = data.accumulatedTime;
          } else {
            this.currentTimeMs = Math.max(0, data.targetDuration - data.accumulatedTime);
          }
        }
        
        this.animationFrameId = requestAnimationFrame(updateTime);
      };
      
      this.animationFrameId = requestAnimationFrame(updateTime);
    },
    triggerAlert() {
      if (!this.config.audioAlert) return;
      
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
      } catch (e) {
        console.error("Audio alert failed", e);
      }
    },
  },
});
</script>

<style scoped>
.timer-text {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

.blink-animation {
  animation: blink 1s infinite;
  background-color: rgba(255, 0, 0, 0.3) !important;
}
</style>
