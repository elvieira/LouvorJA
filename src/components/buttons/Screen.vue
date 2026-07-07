<template>
  <div v-if="!is_mobile" class="d-flex align-center" style="gap: 4px;">
    <v-btn
      v-if="has_popups"
      variant="tonal"
      color="primary"
      size="small"
      icon
      style="width: 36px; height: 36px; min-width: 36px;"
      @click="closeAll()"
    >
      <v-icon size="18">mdi-close-box-multiple-outline</v-icon>
      <v-tooltip
        activator="parent"
        location="bottom"
        open-delay="300"
        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
      >
        {{ t('close_all') }}
      </v-tooltip>
    </v-btn>
    <PopupCountSelector />
    <v-btn
      :variant="variant"
      :size="size"
      :active="is_popup_opened"
      icon="mdi-open-in-new"
      :class="{ 'rotate-icon': is_selected }"
      @click="popup()"
    />
  </div>
</template>

<script>
import PopupCountSelector from "@/components/buttons/PopupCountSelector.vue";

export default {
  name: "ButtonScreenComponent",
  components: {
    PopupCountSelector,
  },
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
    is_mobile: function () {
      return this.$appdata.get("is_mobile");
    },
    has_popups: function () {
      const popups = this.$appdata.get("popups") || [];
      return popups.some((p) => p && !p.closed);
    },
    is_popup_opened: function () {
      return this.has_popups;
    },
    popup_module: function () {
      return this.$appdata.get("popup_module");
    },
    is_selected: function () {
      return this.is_popup_opened && this.popup_module == this.module;
    },
  },
  methods: {
    t(key) {
      return this.$t(`components.popup_controls.${key}`);
    },
    popup: function () {
      if (this.is_selected) {
        this.$popup.exit();
      } else {
        this.$popup.open(this.module);
      }
    },
    closeAll() {
      this.$popup.closeAll();
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
