<template>
  <div
    ref="container"
    class="d-flex align-center justify-center overflow-hidden"
    :style="{
      background: config.background,
      width: '100%',
      height: '100vh',
      color: config.color,
    }"
  >
    <v-slide-y-transition mode="out-in">
      <div 
        :key="data.isDrawing ? 'drawing' : data.currentDisplay" 
        class="d-flex align-center justify-center w-100 h-100 px-10 text-center font-weight-black" 
        :style="{
          fontSize: data.isDrawing ? (config.fontSizePc * 0.8) + 'vw' : config.fontSizePc + 'vw',
          transition: 'all 0.3s ease-out',
          textTransform: config.textTransform,
          textShadow: data.isDrawing ? 'none' : `0 10px 40px ${config.color}60`,
          opacity: data.currentDisplay ? 1 : 0
        }"
      >
        {{ data.currentDisplay }}
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "PopupSorteioPage",
  data: () => ({
    defaultConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
    },
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    config() {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.defaultConfig;
    },
    data() {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        currentDisplay: "",
        isDrawing: false,
      };
    },
  },
};
</script>
