<template>
  <Screen />
</template>

<script>
import manifest from "../manifest.json";
import Screen from "../components/Screen.vue";

export default {
  name: "PopupTimerPage",
  components: { Screen },
  provide() {
    return {
      popup_module: manifest.id,
    };
  },
};
</script>
