<template>
  <Screen />
</template>

<script>
import manifest from "../manifest.json";
import Screen from "../components/Screen.vue";

export default {
  name: "TextPopup",
  components: { Screen },
  computed: {
    module_id() { return manifest.id; },
    module() { return this.$modules.get(this.module_id); },
  },
};
</script>
