<template>
  <div v-if="visible" class="w-100 h-100 d-flex align-center justify-center notice-bar-window px-6">
    <v-icon size="24" class="mr-3">
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
  },
};
</script>

<style scoped>
.notice-bar-window {
  background-color: #b8280d;
  color: #ffffff;
}
.notice-text {
  font-size: 2vw;
  font-weight: 700;
  text-align: center;
}
</style>
