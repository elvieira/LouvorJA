<template>
  <div
    ref="container"
    class="position-relative w-100 h-100 overflow-hidden"
    :style="containerStyle"
  >
    <!-- Texto Personalizado Livre (se customTextPosition === 'custom') -->
    <div
      v-if="config.customText && config.customTextPosition === 'custom'"
      class="position-absolute font-weight-bold text-center pointer-events-none"
      :style="customTextFreeStyle"
    >
      {{ config.customText }}
    </div>

    <div
      class="position-absolute d-flex flex-column align-center justify-center text-center pointer-events-none"
      :style="{
        left: `${config.posX ?? 50}%`,
        top: `${config.posY ?? 50}%`,
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
      }"
    >
      <!-- Texto Personalizado Acima -->
      <div
        v-if="config.customText && (config.customTextPosition === 'above' || !config.customTextPosition)"
        class="font-weight-bold text-center mb-4"
        :style="customTextStyle"
      >
        {{ config.customText }}
      </div>

      <v-slide-y-transition mode="out-in">
        <div 
          :key="data.isDrawing ? 'drawing' : data.currentDisplay" 
          class="font-weight-black text-center" 
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

      <!-- Texto Personalizado Abaixo -->
      <div
        v-if="config.customText && config.customTextPosition === 'below'"
        class="font-weight-bold text-center mt-4"
        :style="customTextStyle"
      >
        {{ config.customText }}
      </div>
    </div>
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
      posX: 50,
      posY: 50,
      customText: "",
      customTextColor: "#0097d7",
      customTextSizePc: 6,
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
    },
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.$userdata.get("sorteio_config") || this.defaultConfig;
    },
    customTextStyle(): any {
      const sizePc = this.config.customTextSizePc ?? 6;
      return {
        fontSize: `${sizePc}vw`,
        color: this.config.customTextColor || this.config.color,
        textShadow: this.config.bgImage
          ? "0 4px 12px rgba(0,0,0,0.85)"
          : `0 4px 16px ${this.config.customTextColor || this.config.color}60`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: 1.2,
      };
    },
    customTextFreeStyle(): any {
      const x = this.config.customTextX ?? 50;
      const y = this.config.customTextY ?? 20;
      const sizePc = this.config.customTextSizePc ?? 6;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        fontSize: `${sizePc}vw`,
        color: this.config.customTextColor || this.config.color,
        textShadow: this.config.bgImage
          ? "0 4px 12px rgba(0,0,0,0.85)"
          : `0 4px 16px ${this.config.customTextColor || this.config.color}60`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        zIndex: 5,
      };
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
