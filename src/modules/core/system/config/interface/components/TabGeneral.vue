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
            v-if="isDesktop"
            v-model="start_on_login"
            icon="mdi-power"
            :title="t('start_on_login')"
            :subtitle="t('start_on_login_desc')"
            type="switch"
            class="mb-8"
          />

          <v-divider v-if="isDesktop" class="mb-8" style="opacity: 0.1;" />

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

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";
import SettingsActionRow from "@/components/SettingsActionRow.vue";

export default defineComponent({
  name: "TabGeneral",
  components: {
    SettingsActionRow,
  },
  data: () => ({
    language: "pt" as "pt" | "es",
    show_home_history: true as boolean,
    start_on_login: false as boolean,
    isDesktop: !!(window as any).electronAPI,
    isInitialized: false,
  }),
  computed: {
    languagesList(): Array<{ code: string; name: string }> {
      return [
        { code: "pt", name: "Português" },
        { code: "es", name: "Español" },
      ];
    },
    languageName(): string {
      const found = this.languagesList.find((l: any) => l.code === this.language);
      return found ? found.name : "Português";
    },
  },
  watch: {
    async language(val: "pt" | "es", oldVal: "pt" | "es") {
      if (!this.isInitialized) return;
      
      if (val && oldVal && val !== oldVal) {
        if ((window as any).electronAPI && (window as any).electronAPI.isElectron) {
          try {
            // Check if the database for the selected language is already downloaded
            const dbExists = await (window as any).electronAPI.checkDatabaseExists(val);
            if (dbExists) {
              this.$alert.yesno(
                {
                  title: this.t("msg_lang_title"),
                  text: this.t("msg_lang_reload"),
                  translate: false,
                },
                (resp: any) => {
                  if (resp === "yes") {
                    this.$userdata.set("language", val);
                    window.location.reload();
                  } else {
                    this.isInitialized = false; // Prevent loop
                    this.language = oldVal;
                    this.$nextTick(() => { this.isInitialized = true; });
                  }
                },
              );
              return;
            }
          } catch (err) {
            console.error("Erro ao verificar DB existente", err);
          }

          this.$alert.yesno(
            {
              title: this.t("msg_lang_title"),
              text: this.t("msg_lang_download"),
              translate: false,
            },
            async (resp: any) => {
              if (resp === "yes") {
                window.sessionStorage.setItem("pending_language", val);
                if ((window as any).electronAPI.clearSysData) {
                  await (window as any).electronAPI.clearSysData();
                }
                window.location.reload();
              } else {
                this.isInitialized = false; // Prevent loop
                this.language = oldVal;
                this.$nextTick(() => { this.isInitialized = true; });
              }
            },
          );
        } else {
          this.$userdata.set("language", val);
          this.$i18n.locale = val;
        }
      } else if (val && !oldVal) {
        this.$userdata.set("language", val);
        this.$i18n.locale = val;
      }
    },
    show_home_history(val: boolean) {
      this.$userdata.set("show_home_history", val);
    },
    start_on_login(val: boolean) {
      if (!this.isInitialized) return;
      if ((window as any).electronAPI && (window as any).electronAPI.setLoginItemSettings) {
        (window as any).electronAPI.setLoginItemSettings({
          openAtLogin: val,
        });
      }
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
    
    if (this.isDesktop && (window as any).electronAPI.getLoginItemSettings) {
      (window as any).electronAPI.getLoginItemSettings().then((settings: any) => {
        this.start_on_login = settings.openAtLogin;
      });
    }

    // Set isInitialized after mounting so the watcher doesn't trigger on initial load
    this.$nextTick(() => {
      this.isInitialized = true;
    });
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${manifest.id}.${text}`);
    },
    resetHistory() {
      this.$alert.yesno(
        { text: this.t("msg_reset_history"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            (this as any).$history.clearAll();
            this.$alert.info({ text: this.t("msg_reset_success"), translate: false });
          }
        },
      );
    },
    async clearAllData() {
      this.$alert.yesno(
        { text: this.t("msg_clear_data"), translate: false },
        async (resp: string) => {
          if (resp === "yes") {
            if (window.electronAPI) {
              try {
                await window.electronAPI.clearAllData();
                window.localStorage.clear();
                window.sessionStorage.clear();
                this.$alert.info({ text: this.t("msg_clear_success"), translate: false }, () => {
                  window.location.reload();
                });
              } catch (err) {
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
});
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
