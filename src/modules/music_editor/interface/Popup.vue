<template>
  <LSlide
    v-if="data"
    :text="data.text"
    :aux_text="data.auxText"
    :image="data.image || undefined"
    :text_size_pc="data.fontSize"
    :text_color="data.fontColor"
    :aux_text_size_pc="data.auxFontSize"
    :aux_text_color="data.auxFontColor"
    force_image
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import LSlide from "@/components/Slide.vue";

export default defineComponent({
  name: "PopupMusicEditorPage",
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
    data(): any {
      return this.$appdata.get("modules.music_editor.data");
    },
  },
});
</script>
