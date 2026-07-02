<template>
  <div class="text-screen-container" :style="containerStyle">
    <div class="text-screen-content" v-html="projectionHtml" :style="contentStyle"></div>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "TextScreen",
  data() {
    return {
      s_width: 0,
      s_height: 0,
    };
  },
  computed: {
    module_id() { return manifest.id; },
    module() { return this.$modules.get(this.module_id); },
    projectionData() {
      return this.$appdata.get("modules." + this.module_id + ".projection");
    },
    projectionHtml() {
      var data = this.projectionData;
      if (!data || !data.html) return "";
      return data.html;
    },
    containerStyle() {
      return {
        background: "#000000",
        width: "100%",
        height: "100%",
      };
    },
    contentStyle() {
      return {
        fontSize: "4vw",
        lineHeight: "1.6",
        color: "#ffffff",
      };
    },
  },
};
</script>
