<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- HINÁRIOS E BUSCA -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <SettingsActionRow
          v-model="primary_hymnal"
          icon="mdi-book-open-page-variant"
          icon-color="primary"
          :title="t('primary_hymnal')"
          :subtitle="t('primary_hymnal_desc')"
          type="select"
          :items="primaryHymnalList"
          item-title="name"
          item-value="code"
          class="mb-6"
        />

        <v-divider class="mb-6" style="opacity: 0.1;" />

        <SettingsActionRow
          v-model="hide_undownloaded"
          icon="mdi-eye-off"
          icon-color="primary"
          :title="t('hide_undownloaded')"
          :subtitle="t('hide_undownloaded_desc')"
          type="switch"
          class="mb-6"
        />

        <v-divider class="mb-6" style="opacity: 0.1;" />

        <SettingsActionRow
          v-model="show_home_history"
          icon="mdi-history"
          icon-color="primary"
          :title="t('home_layout')"
          :subtitle="t('home_history_desc')"
          type="switch"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";
import SettingsActionRow from "@/components/SettingsActionRow.vue";

export default defineComponent({
  name: "ConfigCollections",
  components: {
    SettingsActionRow,
  },
  data: () => ({
    show_home_history: true as boolean,
  }),
  computed: {
    primaryHymnalList(): Array<{ name: string; code: string }> {
      return [
        { name: this.t("hymnal_none"), code: "none" },
        { name: this.t("hymnal_default"), code: "hymnal" },
        { name: this.t("hymnal_1996"), code: "hymnal_1996" },
      ];
    },
    primary_hymnal: {
      get(): string {
        return (this as any).$userdata.get("primary_hymnal") || "none";
      },
      set(val: string) {
        (this as any).$userdata.set("primary_hymnal", val);
      },
    },
    hide_undownloaded: {
      get(): boolean {
        return (this as any).$userdata.get("hide_undownloaded") || false;
      },
      set(val: boolean) {
        (this as any).$userdata.set("hide_undownloaded", val);
      },
    },
  },
  watch: {
    show_home_history(val: boolean) {
      (this as any).$userdata.set("show_home_history", val);
    },
  },
  mounted() {
    const saved_home_history = (this as any).$userdata.get("show_home_history");
    if (saved_home_history !== undefined && saved_home_history !== null) {
      this.show_home_history = saved_home_history;
    }
  },
  methods: {
    t(text: string): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`);
    },
  },
});
</script>

<style scoped>
.settings-card {
  border-radius: 24px !important;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
</style>
