<template>
  <v-app-bar
    id="header-bar"
    tile
    flat
    color="primary"
  >
    <template #prepend>
      <v-app-bar-nav-icon @click="$appdata.toogle('menu.show')" />
    </template>
    <v-app-bar-title>{{ $t("app.name") }}</v-app-bar-title>
    <v-spacer />
    <LanguageSelector />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LanguageSelector from "@/components/LanguageSelector.vue";

export default defineComponent({
  name: "HeaderLayout",
  components: {
    LanguageSelector,
  },
});
</script>

<style scoped>
#header-bar {
  position: initial !important;
  flex: 0 !important;
}
</style>
