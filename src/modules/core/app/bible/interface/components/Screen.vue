<template>
  <div
    ref="container"
    class="d-flex align-center justify-center overflow-hidden"
    :style="{
      background: forceStandardColors ? '#000000' : config.background,
      width: '100%',
      height: height ? height + 'px' : '100%',
      color: forceStandardColors ? '#ffffff' : config.color,
    }"
  >
    <div v-if="bible" class="d-flex flex-column w-100 pa-4" :class="[config.align]">
      <div
        v-if="bible.text"
        :style="{ fontSize: `${fontSizePc(config.fontSizePc)}px` }"
      >
        {{ bible.text }}
      </div>
      <div
        v-if="bible.scriptural_reference"
        class="mt-4 font-weight-bold"
        :class="[config.refAlign || 'text-right']"
        :style="{ fontSize: `${fontSizePc(config.refFontSizePc)}px`, color: forceStandardColors ? '#fb8c00' : config.refColor }"
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
      return this.$appdata.get("modules.bible.config") || {
        fontSizePc: 15,
        align: "text-center",
        background: "#000000",
        color: "#ffffff",
        refFontSizePc: 10,
        refColor: "#fb8c00",
      };
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
