<template>
  <div class="h-100 overflow-auto px-6 pb-6">
    <div class="settings-container mx-auto d-flex flex-column" style="max-width: 600px; gap: 24px;">
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <SettingsActionRow
            v-model="language"
            icon="mdi-translate"
            :title="t('language')"
            :subtitle="t('language_desc')"
            type="select"
            :items="languagesList"
            item-title="name"
            item-value="code"
            class="mb-8"
          />

          <v-divider class="mb-8" style="opacity: 0.1;" />

          <SettingsActionRow
            v-model="show_home_history"
            icon="mdi-view-dashboard"
            :title="t('home_layout')"
            :subtitle="t('home_history_desc')"
            type="switch"
          />
        </v-card-text>
      </v-card>

      <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <SettingsActionRow
            icon="mdi-database-refresh"
            icon-color="error"
            :title="t('reset_history')"
            :subtitle="t('reset_history_desc')"
            :button-text="t('reset_btn')"
            button-color="error"
            button-variant="tonal"
            class="mb-8"
            @action="resetHistory"
          />

          <v-divider class="mb-8" style="opacity: 0.1;" />

          <SettingsActionRow
            icon="mdi-delete-alert"
            icon-color="error"
            :title="t('clear_data')"
            :subtitle="t('clear_data_desc')"
            :button-text="t('clear_all_btn')"
            button-color="error"
            button-variant="flat"
            @action="clearAllData"
          />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import manifest from "../../manifest";
import SettingsActionRow from "@/components/SettingsActionRow.vue";

export default {
  name: "TabGeneral",
  components: {
    SettingsActionRow,
  },
  data: () => ({
    language: "pt",
    show_home_history: true,
  }),
  computed: {
    languagesList() {
      return [
        { code: "pt", name: "Português" },
        { code: "es", name: "Español" },
      ];
    },
    languageName() {
      const found = this.languagesList.find(l => l.code === this.language);
      return found ? found.name : "Português";
    },
  },
  watch: {
    language(val) {
      if (val) {
        this.$userdata.set("language", val);
        this.$i18n.locale = val;
      }
    },
    show_home_history(val) {
      this.$userdata.set("show_home_history", val);
    },
  },
  mounted() {
    if(this.$userdata.get("language")){
      this.language = this.$userdata.get("language");
    }
    const saved_home_history = this.$userdata.get("show_home_history");
    if (saved_home_history !== undefined && saved_home_history !== null) {
      this.show_home_history = saved_home_history;
    }
  },
  methods: {
    t(text) {
      return this.$t(`modules.${manifest.id}.${text}`);
    },
    resetHistory() {
      this.$alert.yesno(
        { text: this.t("msg_reset_history"), translate: false },
        (resp) => {
          if (resp === "yes") {
            this.$history.clearAll();
            this.$alert.info({ text: this.t("msg_reset_success"), translate: false });
          }
        },
      );
    },
    async clearAllData() {
      this.$alert.yesno(
        { text: this.t("msg_clear_data"), translate: false },
        async (resp) => {
          if (resp === "yes") {
            if (window.electronAPI) {
              const success = await window.electronAPI.clearAllData();
              if (success) {
                window.localStorage.clear();
                window.sessionStorage.clear();
                this.$alert.info({ text: this.t("msg_clear_success"), translate: false }, () => {
                  window.location.reload();
                });
              } else {
                this.$alert.error({ text: this.t("msg_clear_error"), translate: false });
              }
            } else {
              this.$alert.error({ text: this.t("msg_desktop_only"), translate: false });
            }
          }
        },
      );
    },
  },
};
</script>

<style scoped>
.settings-card {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
.settings-section h3 {
  opacity: 0.9;
}
</style>
