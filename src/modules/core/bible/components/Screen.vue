<template>
  <div
    ref="container"
    class="d-flex align-center justify-center overflow-hidden"
    :style="{
      background: config.background,
      width: '100%',
      height: height ? height + 'px' : '100%',
      color: config.color,
    }"
  >
    <div v-if="bible" class="d-flex flex-column w-100 pa-4" :class="[config.align]">
      <span
        v-if="bible.text"
        :style="{ fontSize: `${this.fontSizePc(config.fontSizePc)}px` }"
      >
        {{ bible.text }}
      </span>
      <span
        v-if="bible.scriptural_reference"
        class="mt-4 font-weight-bold"
        :style="{ fontSize: `${this.fontSizePc(config.refFontSizePc)}px`, color: config.refColor }"
      >
        {{ bible.scriptural_reference }}
      </span>
    </div>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "ScreenBiblePage",
  props: {
    height: Number,
  },
  data: () => ({
    s_width: 0,
    s_height: 0,
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    bible() {
      return this.$appdata.get("modules.bible.data");
    },
    config() {
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
  methods: {
    fontSizePc(pc) {
      const v = Math.min(this.s_width, this.s_height);
      return (pc * v) / 100 / 2;
    },
    windowResize() {
      const container = this.$refs.container;
      if (container) {
        this.s_width = container.offsetWidth;
        this.s_height = container.offsetHeight;

        if (this.width <= 0 || this.height <= 0) {
          const self = this;
          setTimeout(function () {
            self.windowResize();
          }, 100);
        }
      }
    },
  },
  mounted() {
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
  },
};
</script>
