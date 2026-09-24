<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <SettingsActionRow
          v-model="language"
          icon="mdi-translate"
          icon-color="primary"
          :title="t('language')"
          :subtitle="t('language_desc')"
          type="select"
          :items="languagesList"
          item-title="name"
          item-value="code"
          class="mb-6"
        />

        <v-divider class="mb-6" style="opacity: 0.1;" />

        <SettingsActionRow
          v-if="isDesktop"
          v-model="start_on_login"
          icon="mdi-power"
          icon-color="primary"
          :title="t('start_on_login')"
          :subtitle="t('start_on_login_desc')"
          type="switch"
          class="mb-6"
        />

        <v-divider v-if="isDesktop" class="mb-6" style="opacity: 0.1;" />

        <SettingsActionRow
          v-if="isDesktop"
          v-model="remember_window_bounds"
          icon="mdi-window-restore"
          icon-color="primary"
          :title="t('remember_window_bounds')"
          :subtitle="t('remember_window_bounds_desc')"
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
  name: "ConfigSystem",
  components: {
    SettingsActionRow,
  },
  data: () => ({
    isDesktop: !!(window as any).electronAPI,
    languagesList: [
      { name: "Português", code: "pt" },
      { name: "Español", code: "es" },
    ],
  }),
  computed: {
    language: {
      get(): string {
        return (this as any).$userdata.get("language") || (this as any).$i18n.locale || "pt";
      },
      set(val: string) {
        (this as any).$userdata.set("language", val);
        (this as any).$i18n.locale = val;
      },
    },
    start_on_login: {
      get(): boolean {
        return (this as any).$userdata.get("start_on_login") || false;
      },
      set(val: boolean) {
        (this as any).$userdata.set("start_on_login", val);
        if ((window as any).electronAPI?.setLoginItemSettings) {
          (window as any).electronAPI.setLoginItemSettings({ openAtLogin: val });
        }
      },
    },
    remember_window_bounds: {
      get(): boolean {
        return (this as any).$userdata.get("remember_window_bounds") || false;
      },
      set(val: boolean) {
        (this as any).$userdata.set("remember_window_bounds", val);
        (this as any).$userdata.set("modules.config.remember_window_bounds", val);
        if ((window as any).electronAPI?.setRememberWindowBounds) {
          (window as any).electronAPI.setRememberWindowBounds(val);
        }
      },
    },
  },
  async mounted() {
    if ((window as any).electronAPI?.getLoginItemSettings) {
      const settings = await (window as any).electronAPI.getLoginItemSettings();
      if (settings) {
        (this as any).$userdata.set("start_on_login", settings.openAtLogin);
      }
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
