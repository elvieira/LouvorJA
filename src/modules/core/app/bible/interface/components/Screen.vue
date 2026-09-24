<template>
  <div
    ref="container"
    class="d-flex align-center justify-center overflow-hidden"
    :style="containerStyle"
  >
    <div v-if="bible" class="d-flex flex-column w-100 pa-4" :class="[config.align]">
      <div
        v-if="bible.text"
        :style="{
          fontSize: `${fontSizePc(config.fontSizePc)}px`,
          textShadow: (!forceStandardColors && config.bgImage) ? '0 2px 10px rgba(0,0,0,0.85)' : 'none'
        }"
      >
        {{ bible.text }}
      </div>
      <div
        v-if="bible.scriptural_reference"
        class="mt-4 font-weight-bold"
        :class="[config.refAlign || 'text-right']"
        :style="{
          fontSize: `${fontSizePc(config.refFontSizePc)}px`,
          color: forceStandardColors ? '#fb8c00' : config.refColor,
          textShadow: (!forceStandardColors && config.bgImage) ? '0 2px 8px rgba(0,0,0,0.85)' : 'none'
        }"
      >
        {{ bible.scriptural_reference }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "ScreenBiblePage",
  props: {
    height: {
      type: Number as PropType<number>,
      default: 0,
    },
    forceStandardColors: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  data: () => ({
    s_width: 0 as number,
    s_height: 0 as number,
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    bible(): any {
      return this.$appdata.get("modules.bible.data");
    },
    config(): any {
      return this.$appdata.get("modules.bible.config") || this.$userdata.get("bible_config") || {
        fontSizePc: 15,
        align: "text-center",
        background: "#000000",
        bgImage: null,
        color: "#ffffff",
        refFontSizePc: 10,
        refColor: "#fb8c00",
      };
    },
    isDarkMode(): boolean {
      return this.$vuetify?.theme?.global?.name !== "light";
    },
    containerStyle(): any {
      if (this.forceStandardColors) {
        return {
          background: "transparent",
          width: "100%",
          height: this.height ? `${this.height  }px` : "100%",
          color: "#ffffff",
        };
      }
      const style: any = {
        backgroundColor: this.config.background || "#000000",
        width: "100%",
        height: this.height ? `${this.height  }px` : "100%",
        color: this.config.color,
      };
      if (this.config.bgImage) {
        style.backgroundImage = `url("${this.config.bgImage}")`;
        style.backgroundSize = "cover";
        style.backgroundPosition = "center center";
        style.backgroundRepeat = "no-repeat";
      }
      return style;
    },
  },
  watch: {
    bible: {
      deep: true,
      immediate: true,
      handler(val) {
        if (typeof window !== "undefined" && window.electronAPI?.streamingPushSlide) {
          if (val && val.text) {
            window.electronAPI.streamingPushSlide({
              type: "bible",
              bibleText: val.text,
              bibleReference: val.scriptural_reference || "",
              bibleVersion: val.version || "",
              updatedAt: Date.now(),
            });
          } else {
            window.electronAPI.streamingClearSlide?.();
          }
        }
      },
    },
  },
  mounted() {
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
  },
  methods: {
    fontSizePc(pc: number): number {
      const v = Math.min(this.s_width, this.s_height);
      return (pc * v) / 100 / 2;
    },
    windowResize() {
      const container = this.$refs.container as HTMLElement | undefined;
      if (container) {
        this.s_width = container.offsetWidth;
        this.s_height = container.offsetHeight;

        if (this.s_width <= 0 || this.s_height <= 0) {
          setTimeout(() => {
            this.windowResize();
          }, 100);
        }
      }
    },
  },
});
</script>
