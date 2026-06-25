<template>
  <AppLoading />
  <v-btn
    v-show="false"
    v-shortkey="['ctrl', 'alt', 'd']"
    @shortkey="handleKeydown()"
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
#app-container > div {
  height: 100vh;
}
</style>
