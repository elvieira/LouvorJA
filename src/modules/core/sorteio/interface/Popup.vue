<template>
  <Screen />
</template>

<script>
import manifest from "../manifest.json";

import Screen from "../components/Screen.vue";

export default {
  name: "PopupSorteioPage",
  components: {
    Screen,
  },
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
  },
};
</script>
