<template>
  <LSlide
    v-if="slide"
    :slide_number="config.slide_index"
    :cover="slide.cover == true"
    :text="slide.lyric"
    :aux_text="slide.aux_lyric"
    :image="slide.url_image ? $path.file(slide.url_image) : null"
    :image_position="slide.image_position"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

import LSlide from "@/components/Slide.vue";

export default defineComponent({
  name: "PopupMediaPage",
  components: {
    LSlide,
  },
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
    config(): any {
      return this.$media.config();
    },
    slide_index(): number {
      return this.config.slide_index;
    },
    slide(): any {
      return this.$media.slide();
    },
  },
});
</script>
