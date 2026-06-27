<template>
  <v-app id="app-container">
    <FirstBootLoader />
    <AppLoading />
    <v-btn
      v-show="false"
      v-shortkey="['ctrl', 'alt', 'd']"
      @shortkey="handleKeydown()"
    />
    <router-view />
  </v-app>
</template>

<script>
import AppLoading from "@/layout/Loading.vue";
import FirstBootLoader from "@/layout/FirstBootLoader.vue";

export default {
  name: "App",
  components: {
    AppLoading,
    FirstBootLoader,
  },
  methods: {
    handleKeydown() {
      console.log("click ");
      //if (event.shiftKey && event.key === "A") {
      this.$dev.toogle();
      //}
    },
  },
  created() {
    this.$userdata.load();
    const theme = this.$userdata.get("theme");
    if (theme !== "") {
      this.$vuetify.theme.global.name = theme;
    }
  }
};
</script>

<style>
#app-container > div {
  height: 100vh;
}
</style>
