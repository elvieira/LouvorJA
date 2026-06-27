<template>
  <v-btn
    v-if="!is_mobile"
    :variant="variant"
    :size="size"
    :active="is_popup_opened"
    icon
    :class="{ 'rotate-icon': is_selected }"
    @click="popup()"
  >
    <v-icon>mdi-open-in-new</v-icon>
    <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-pill-player-volume elevation-0 font-weight-medium text-white">Monitor Estendido</v-tooltip>
  </v-btn>
</template>

<script>
export default {
  name: "ButtonScreenComponent",
  props: {
    module: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: "small",
    },
    variant: {
      type: String,
      default: "text",
    },
  },
  computed: {
    is_mobile() {
      return this.$appdata.get("is_mobile");
    },
    is_popup_opened() {
      return !!this.$appdata.get("popup");
    },
    popup_module() {
      return this.$appdata.get("popup_module");
    },
    is_selected() {
      return this.is_popup_opened && this.popup_module == this.module;
    },
  },
  methods: {
    popup() {
      if (this.is_selected) {
        this.$popup.exit();
      } else {
        this.$popup.open(this.module);
      }
    },
  },
};
</script>

<style scoped>
.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>
