<template>
  <Screen />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

import Screen from "./components/Screen.vue";

export default defineComponent({
  name: "PopupTimerPage",
  components: {
    Screen,
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
  },
});
</script>
