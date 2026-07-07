<template>
  <v-menu location="bottom" :close-on-content-click="true">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="tonal"
        color="primary"
        size="small"
        class="popup-count-btn font-weight-bold"
        style="width: 36px; height: 36px; min-width: 36px;"
      >
        {{ popup_count }}
        <v-tooltip
          activator="parent"
          location="bottom"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ t('tooltip') }}
        </v-tooltip>
      </v-btn>
    </template>
    <v-card class="mt-1" rounded="lg" style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color);">
      <v-list density="compact" class="py-1" bg-color="transparent">
        <v-list-item
          v-for="n in 6"
          :key="n"
          :active="popup_count === n"
          color="primary"
          class="mx-1 rounded-lg mb-1"
          style="min-height: 36px; justify-content: center;"
          @click="popup_count = n"
        >
          <span class="font-weight-bold">{{ n }}</span>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "PopupCountSelector",
  computed: {
    popup_count: {
      get() {
        const value = this.$userdata.get("modules.config.popup_count");
        return value ?? 2;
      },
      set(value) {
        const count = Math.min(6, Math.max(1, parseInt(value, 10) || 2));
        this.$userdata.set("modules.config.popup_count", count);

        const hasPopups = (this.$appdata.get("popups") || []).some(
          (p) => p && !p.closed,
        );
        if (hasPopups) {
          this.$popup.syncWindows();
        }
      },
    },
  },
  methods: {
    t(key) {
      return this.$t(`components.popup_count_selector.${key}`);
    },
  },
};
</script>
