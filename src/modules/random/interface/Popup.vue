<template>
  <div
    ref="container"
    class="d-flex align-center justify-center overflow-hidden"
    :style="containerStyle"
  >
    <v-slide-y-transition mode="out-in">
      <div 
        :key="data.isDrawing ? 'drawing' : data.currentDisplay" 
        class="d-flex align-center justify-center w-100 h-100 px-10 text-center font-weight-black" 
        :style="{
          fontSize: data.isDrawing ? (config.fontSizePc * 0.8) + 'vw' : config.fontSizePc + 'vw',
          transition: 'all 0.3s ease-out',
          textTransform: config.textTransform,
          textShadow: data.isDrawing
            ? (config.bgImage ? '0 4px 12px rgba(0,0,0,0.8)' : 'none')
            : (config.bgImage ? `0 10px 40px ${config.color}60, 0 2px 10px rgba(0,0,0,0.8)` : `0 10px 40px ${config.color}60`),
          opacity: data.currentDisplay ? 1 : 0
        }"
      >
        {{ data.currentDisplay }}
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

export default defineComponent({
  name: "PopupSorteioPage",
  data: () => ({
    defaultConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
      bgImage: null as string | null,
    },
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.$userdata.get("sorteio_config") || this.defaultConfig;
    },
    containerStyle(): any {
      const base: any = {
        backgroundColor: this.config.background || "#ffffff",
        width: "100%",
        height: "100vh",
        color: this.config.color,
      };
      if (this.config.bgImage) {
        base.backgroundImage = `url("${this.config.bgImage}")`;
        base.backgroundSize = "cover";
        base.backgroundPosition = "center center";
        base.backgroundRepeat = "no-repeat";
      }
      return base;
    },
    data(): any {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        currentDisplay: "",
        isDrawing: false,
      };
    },
  },
});
</script>
