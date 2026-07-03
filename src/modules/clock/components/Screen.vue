<template>
  <div
    ref="container"
    class="d-flex align-center justify-center position-relative w-100 h-100 overflow-hidden"
    :style="{
      background: preview ? 'transparent' : config.bgColor,
      height: height ? height + 'px' : '100%',
      color: preview ? 'var(--sidebar-text)' : config.textColor,
    }"
  >
    <!-- DIGITAL CLOCK -->
    <v-fade-transition>
      <div 
        v-if="config.style === 'digital'" 
        class="digital-clock font-weight-black d-flex align-center justify-center text-center w-100"
        :style="{
          fontSize: `${digitalFontSize}px`,
          textShadow: preview ? 'none' : `0 4px 30px ${config.textColor}40`,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }"
      >
        <span>{{ formattedTime }}</span>
        <span 
          v-if="config.showSeconds" 
          class="ml-2 opacity-70"
          :style="{ fontSize: `${digitalFontSize * 0.5}px`, alignSelf: 'flex-end', marginBottom: `${digitalFontSize * 0.15}px` }"
        >
          {{ formattedSeconds }}
        </span>
        <span 
          v-if="!config.format24h" 
          class="ml-4 opacity-50 font-weight-bold"
          :style="{ fontSize: `${digitalFontSize * 0.3}px`, alignSelf: 'flex-end', marginBottom: `${digitalFontSize * 0.2}px` }"
        >
          {{ ampm }}
        </span>
      </div>
    </v-fade-transition>

    <!-- ANALOG CLOCK -->
    <v-fade-transition>
      <div 
        v-if="config.style === 'analog'" 
        class="analog-clock rounded-circle position-relative"
        :style="{
          width: `${analogSize}px`,
          height: `${analogSize}px`,
          border: `min(8px, ${analogSize * 0.02}px) solid ${config.textColor}`,
          boxShadow: `inset 0 0 40px ${config.bgColor}40, 0 10px 40px ${config.textColor}20`
        }"
      >
        <!-- Center Dot -->
        <div 
          class="position-absolute rounded-circle"
          :style="{
            width: `${analogSize * 0.06}px`,
            height: `${analogSize * 0.06}px`,
            background: config.textColor,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }"
        ></div>

        <!-- Hour Hand -->
        <div 
          class="hand hour-hand position-absolute"
          :style="{
            width: `${analogSize * 0.025}px`,
            height: `${analogSize * 0.3}px`,
            background: config.textColor,
            bottom: '50%',
            left: `calc(50% - ${analogSize * 0.0125}px)`,
            transformOrigin: 'bottom center',
            transform: `rotate(${hourAngle}deg)`,
            borderRadius: '4px',
            zIndex: 7
          }"
        ></div>

        <!-- Minute Hand -->
        <div 
          class="hand minute-hand position-absolute"
          :style="{
            width: `${analogSize * 0.015}px`,
            height: `${analogSize * 0.4}px`,
            background: config.textColor,
            opacity: 0.8,
            bottom: '50%',
            left: `calc(50% - ${analogSize * 0.0075}px)`,
            transformOrigin: 'bottom center',
            transform: `rotate(${minuteAngle}deg)`,
            borderRadius: '4px',
            zIndex: 8
          }"
        ></div>

        <!-- Second Hand -->
        <div 
          v-if="config.showSeconds"
          class="hand second-hand position-absolute"
          :style="{
            width: `${analogSize * 0.005}px`,
            height: `${analogSize * 0.45}px`,
            background: '#ff3b30',
            bottom: '50%',
            left: `calc(50% - ${analogSize * 0.0025}px)`,
            transformOrigin: 'bottom center',
            transform: `rotate(${secondAngle}deg)`,
            zIndex: 9
          }"
        >
          <!-- Tail of second hand -->
          <div :style="{ width: '100%', height: '20%', background: '#ff3b30', position: 'absolute', top: '100%' }"></div>
        </div>

        <!-- Clock Markers -->
        <div 
          v-for="i in 12" 
          :key="i"
          class="position-absolute"
          :style="{
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            transform: `rotate(${i * 30}deg)`
          }"
        >
          <div 
            :style="{
              width: `${i % 3 === 0 ? analogSize * 0.02 : analogSize * 0.01}px`,
              height: `${i % 3 === 0 ? analogSize * 0.06 : analogSize * 0.03}px`,
              background: config.textColor,
              margin: '0 auto',
              marginTop: `${analogSize * 0.02}px`,
              opacity: i % 3 === 0 ? 1 : 0.5,
              borderRadius: '2px'
            }"
          ></div>
        </div>
      </div>
    </v-fade-transition>

  </div>
</template>

<script>
export default {
  name: "ClockScreen",
  props: {
    height: Number,
    preview: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    s_width: 0,
    s_height: 0,
    timer: null,
    now: new Date(),
    defaultConfig: {
      style: 'digital',
      showSeconds: true,
      format24h: true,
      bgColor: '#000000',
      textColor: '#FFFFFF'
    }
  }),
  computed: {
    config() {
      // Allow receiving config from appdata directly
      const appConfig = this.$appdata ? this.$appdata.get('clock_config') : null;
      return appConfig || this.defaultConfig;
    },
    digitalFontSize() {
      const v = Math.min(this.s_width, this.s_height);
      const ratio = this.config.showSeconds ? 0.35 : 0.4;
      return Math.max(v * ratio, 20); // Responsive font size
    },
    analogSize() {
      const v = Math.min(this.s_width, this.s_height);
      return Math.max(v * 0.8, 100); // 80% of smallest dimension
    },
    formattedTime() {
      const opts = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !this.config.format24h
      };
      let timeString = this.now.toLocaleTimeString("pt-BR", opts);
      // Remove AM/PM from string if present (we show it manually)
      timeString = timeString.replace(/[a-zA-Z\s]/g, '');
      return timeString;
    },
    formattedSeconds() {
      return this.now.toLocaleTimeString("pt-BR", { second: '2-digit' });
    },
    ampm() {
      return this.now.getHours() >= 12 ? 'PM' : 'AM';
    },
    hourAngle() {
      const h = this.now.getHours() % 12;
      const m = this.now.getMinutes();
      return (h * 30) + (m * 0.5);
    },
    minuteAngle() {
      const m = this.now.getMinutes();
      const s = this.now.getSeconds();
      return (m * 6) + (s * 0.1);
    },
    secondAngle() {
      const s = this.now.getSeconds();
      const ms = this.now.getMilliseconds();
      return (s * 6) + (ms * 0.006);
    }
  },
  mounted() {
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
    
    const tick = () => {
      this.now = new Date();
      this.timer = requestAnimationFrame(tick);
    };
    this.timer = requestAnimationFrame(tick);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
    cancelAnimationFrame(this.timer);
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
.digital-clock {
  letter-spacing: -0.02em;
}
.hand {
  transition: transform 0.05s cubic-bezier(0.4, 2.08, 0.55, 0.44);
}
.second-hand {
  transition: none; /* Smooth sweep */
}
</style>
