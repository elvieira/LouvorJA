<template>
  <AppLoading />
  <v-btn
    v-show="false"
    @shortkey="handleKeydown()"
    v-shortkey="['ctrl', 'alt', 'd']"
  />
  <v-app id="app-container">
    <router-view />
  </v-app>
</template>

<script>
import AppLoading from "@/layout/Loading.vue";

export default {
  name: "App",
  components: {
    AppLoading,
  },
  methods: {
    handleKeydown() {
      console.log("click ");
      //if (event.shiftKey && event.key === "A") {
      this.$dev.toogle();
      //}
    },
  },
};
</script>

<style>
#app-container {
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

#app-container > div {
  height: 100vh;
  width: 100% !important;
  max-width: 100% !important;
}
</style>
