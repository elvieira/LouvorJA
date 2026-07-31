<template>
  <div v-if="visible" class="w-100 h-100 d-flex align-center justify-center notice-bar-window px-6" :style="style_bg">
    <v-icon size="24" class="mr-3" :color="font_color">
      mdi-alert-circle-outline
    </v-icon>
    <span class="notice-text">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: "NoticeBarComponent",
  computed: {
    text() {
      return this.$appdata.get("notice.text") || "";
    },
    visible() {
      return !!this.$appdata.get("notice.visible");
    },
    background_color() {
      return this.$userdata.get("modules.config.notice_bar_bg_color") || "#b8280d";
    },
    font_color() {
      return this.$userdata.get("modules.config.notice_bar_font_color") || "#ffffff";
    },
    style_bg() {
      return {
        backgroundColor: this.background_color,
        color: this.font_color,
      };
    },
  },
};
</script>

<style scoped>
.notice-text {
  font-size: 2vw;
  font-weight: 700;
  text-align: center;
}
</style>
