<template>
  <div
    ref="container"
    class="d-flex align-center justify-center overflow-hidden"
    :style="{
      background: '#000',
      width: '100%',
      height: height ? height + 'px' : '100%',
    }"
  >
    <div v-if="projection" class="sorteio-screen-content" :class="[align]">
      <div
        class="sorteio-screen-name"
        :style="{ fontSize: `${fontSizePc(40)}px` }"
      >
        {{ projection.name }}
      </div>
    </div>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "ScreenSorteioPage",
  props: {
    height: Number,
  },
  data: () => ({
    s_width: 0,
    s_height: 0,
    align: "text-center",
  }),
  computed: {
    /* COMPUTEDS OBRIGATORIOS - INICIO */
    /* NAO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATORIOS - FIM */

    projection() {
      return this.$appdata.get("modules.sorteio.projection");
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
    fontSizePc(pc) {
      const v = Math.min(this.s_width, this.s_height);
      return (pc * v) / 100 / 2;
    },
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
.sorteio-screen-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.sorteio-screen-name {
  color: #fff;
  font-weight: 700;
  text-shadow: 0 4px 20px rgba(0, 151, 215, 0.4);
  word-break: break-word;
  animation: fadeIn 0.5s ease;
  line-height: 1.2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
