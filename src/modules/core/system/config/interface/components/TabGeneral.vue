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
            v-if="isDesktop"
            v-model="remember_window_bounds"
            icon="mdi-window-restore"
            :title="t('remember_window_bounds')"
            :subtitle="t('remember_window_bounds_desc')"
            type="switch"
          />
        </v-card-text>
      </v-card>

      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <SettingsActionRow
            v-model="hide_undownloaded"
            icon="mdi-eye-off"
            :title="t('hide_undownloaded')"
            :subtitle="t('hide_undownloaded_desc')"
            type="switch"
            class="mb-8"
          />

          <v-divider class="mb-8" style="opacity: 0.1;" />

          <SettingsActionRow
            v-model="primary_hymnal"
            icon="mdi-book-open-page-variant"
            :title="t('primary_hymnal')"
            :subtitle="t('primary_hymnal_desc')"
            type="select"
            :items="primaryHymnalList"
            item-title="name"
            item-value="code"
          />
        </v-card-text>
      </v-card>

      <!-- Comportamento de Projeção Bíblica -->
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-book-open-page-variant-outline
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('bible_proj_behavior') }}
              </h3>
              <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
                {{ t('bible_proj_behavior_desc') }}
              </div>
            </div>
          </div>

          <div class="mt-4">
            <v-switch
              v-model="bible_proj_with_p"
              :label="t('bible_proj_with_p')"
              color="primary"
              hide-details
              inset
              class="font-weight-medium mb-2"
            />
            
            <v-expand-transition>
              <div v-show="!bible_proj_with_p" class="pl-4 mt-4" style="border-left: 2px solid var(--border-color);">
                <v-switch
                  v-model="bible_auto_proj_quick"
                  :label="t('bible_auto_proj_quick')"
                  color="primary"
                  hide-details
                  inset
                  density="compact"
                  class="mb-2"
                />

                <v-switch
                  v-model="bible_auto_proj_normal"
                  :label="t('bible_auto_proj_normal')"
                  color="primary"
                  hide-details
                  inset
                  density="compact"
                />
              </div>
            </v-expand-transition>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <template v-if="isWindows">
            <SettingsActionRow
              icon="mdi-folder-sync-outline"
              icon-color="primary"
              :title="t('import_legacy')"
              :subtitle="t('import_legacy_desc')"
              :button-text="t('import_legacy_btn')"
              button-color="primary"
              button-variant="tonal"
              :button-loading="isImportingLegacy"
              :button-disabled="isImportingLegacy"
              :class="isImportingLegacy ? 'mb-4' : 'mb-8'"
              @action="startLegacyImport"
            />

            <div v-if="isImportingLegacy" class="mb-8 pl-9">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span style="color: var(--sidebar-text-secondary); max-width: 80%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ legacyImportStatus }}
                </span>
                <span v-if="legacyImportTotal > 0" class="font-weight-bold" style="color: var(--accent-blue);">
                  {{ legacyImportCurrent }}/{{ legacyImportTotal }}
                </span>
              </div>
              <v-progress-linear
                :model-value="legacyImportPercent"
                :indeterminate="legacyImportTotal === 0"
                color="primary"
                height="6"
                rounded
              />
            </div>

            <v-divider class="mb-8" style="opacity: 0.1;" />
          </template>

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
            icon="mdi-sync-alert"
            icon-color="warning"
            :title="t('resync_data')"
            :subtitle="t('resync_data_desc')"
            :button-text="t('resync_btn')"
            button-color="warning"
            button-variant="tonal"
            class="mb-8"
            @action="resyncData"
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
    hide_undownloaded: false,
    primary_hymnal: "none",

    start_on_login: false as boolean,
    remember_window_bounds: false as boolean,
    isDesktop: !!(window as any).electronAPI,
    isInitialized: false,

    bible_proj_with_p: false,
    bible_auto_proj_quick: true,
    bible_auto_proj_normal: false,

    isImportingLegacy: false,
    legacyImportStatus: "",
    legacyImportCurrent: 0,
    legacyImportTotal: 0,
  }),
  computed: {
    isWindows(): boolean {
      return !!((window as any).electronAPI && (window as any).electronAPI.isWindows);
    },
    legacyImportPercent(): number {
      if (this.legacyImportTotal === 0) return 0;
      return Math.min(100, Math.round((this.legacyImportCurrent / this.legacyImportTotal) * 100));
    },
    languagesList(): Array<{ code: string; name: string }> {
      return [
        { code: "pt", name: "Português" },
        { code: "es", name: "Español" },
      ];
    },
    primaryHymnalList(): Array<{ code: string; name: string }> {
      return [
        { code: "none", name: this.t("hymnal_none") },
        { code: "hymnal", name: this.t("hymnal_default") },
        { code: "hymnal_1996", name: this.t("hymnal_1996") },
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

    start_on_login(val: boolean) {
      if (!this.isInitialized) return;
      if ((window as any).electronAPI && (window as any).electronAPI.setLoginItemSettings) {
        (window as any).electronAPI.setLoginItemSettings({
          openAtLogin: val,
        });
      }
    },
    remember_window_bounds(val: boolean) {
      if (!this.isInitialized) return;
      this.$userdata.set("remember_window_bounds", val);
      if ((window as any).electronAPI && (window as any).electronAPI.setRememberWindowBounds) {
        (window as any).electronAPI.setRememberWindowBounds(val);
      }
    },
    hide_undownloaded(val: boolean) {
      this.$userdata.set("hide_undownloaded", val);
    },
    primary_hymnal(val: string) {
      this.$userdata.set("primary_hymnal", val);
    },
    bible_proj_with_p(val: boolean) {
      this.updateBibleConfig({ projWithP: val });
    },
    bible_auto_proj_quick(val: boolean) {
      this.updateBibleConfig({ autoProjQuick: val });
    },
    bible_auto_proj_normal(val: boolean) {
      this.updateBibleConfig({ autoProjNormal: val });
    },
  },
  mounted() {
    if(this.$userdata.get("language")){
      this.language = this.$userdata.get("language");
    }
    
    if (this.$userdata.get("hide_undownloaded") !== undefined) {
      this.hide_undownloaded = this.$userdata.get("hide_undownloaded");
    }
    
    this.primary_hymnal = this.$userdata.get("primary_hymnal") || "none";

    
    if (this.isDesktop && (window as any).electronAPI.getLoginItemSettings) {
      (window as any).electronAPI.getLoginItemSettings().then((settings: any) => {
        this.start_on_login = settings.openAtLogin;
      });
    }

    if (this.isDesktop && (window as any).electronAPI.getRememberWindowBounds) {
      (window as any).electronAPI.getRememberWindowBounds().then((enabled: boolean) => {
        this.remember_window_bounds = enabled;
      });
    } else {
      this.remember_window_bounds = this.$userdata.get("remember_window_bounds") || false;
    }

    const savedBibleConfig = this.$appdata.get("modules.bible.config") || this.$userdata.get("bible_config") || {};
    if (savedBibleConfig.projWithP !== undefined) this.bible_proj_with_p = savedBibleConfig.projWithP;
    if (savedBibleConfig.autoProjQuick !== undefined) this.bible_auto_proj_quick = savedBibleConfig.autoProjQuick;
    if (savedBibleConfig.autoProjNormal !== undefined) this.bible_auto_proj_normal = savedBibleConfig.autoProjNormal;

    if ((window as any).electronAPI?.onImportLegacyProgress) {
      (window as any).electronAPI.onImportLegacyProgress((data: any) => {
        this.legacyImportCurrent = data.current;
        this.legacyImportTotal = data.total;
        this.legacyImportStatus = `${this.t("import_legacy_importing")} (${data.filename})`;
      });
    }

    // Set isInitialized after mounting so the watcher doesn't trigger on initial load
    this.$nextTick(() => {
      this.isInitialized = true;
    });
  },
  methods: {
    updateBibleConfig(changes: any) {
      if (!this.isInitialized) return;
      const currentConfig = this.$appdata.get("modules.bible.config") || this.$userdata.get("bible_config") || {};
      const newConfig = { ...currentConfig, ...changes };
      this.$appdata.set("modules.bible.config", newConfig);
      this.$userdata.set("bible_config", newConfig);
    },
    t(text: string, values?: Record<string, unknown>): string {
      return this.$t(`modules.${manifest.id}.${text}`, values as any);
    },
    async startLegacyImport() {
      if (!(window as any).electronAPI || !this.isWindows || this.isImportingLegacy) return;

      try {
        const check = await (window as any).electronAPI.checkLegacyInstallation?.();
        if (check?.exists) {
          (this as any).$alert.show({
            title: this.t("import_legacy_title"),
            text: this.t("import_legacy_found", { path: check.path }),
            translate: false,
            maxWidth: 540,
            buttons: [
              { text: "alert.cancel", color: "grey", variant: "text", value: "cancel" },
              { text: this.t("import_legacy_choose"), color: "primary", variant: "tonal", value: "choose" },
              { text: this.t("import_legacy_btn_import"), color: "primary", variant: "flat", value: "import" },
            ],
          }, async (resp: string) => {
            if (resp === "import") {
              await this.executeLegacyImport(check.path);
            } else if (resp === "choose") {
              await this.chooseAndImportLegacy();
            }
          });
        } else {
          const defaultPath = "C:\\Program Files (x86)\\Louvor JA";
          (this as any).$alert.show({
            title: this.t("import_legacy_title"),
            text: this.t("import_legacy_not_found", { path: defaultPath }),
            translate: false,
            maxWidth: 520,
            buttons: [
              { text: "alert.cancel", color: "grey", variant: "text", value: "cancel" },
              { text: this.t("import_legacy_select_folder"), color: "primary", variant: "flat", value: "choose" },
            ],
          }, async (resp: string) => {
            if (resp === "choose") {
              await this.chooseAndImportLegacy();
            }
          });
        }
      } catch (err) {
        console.error("Erro ao verificar instalação clássica:", err);
      }
    },
    async chooseAndImportLegacy() {
      if (!(window as any).electronAPI?.selectLegacyFolder) return;
      const res = await (window as any).electronAPI.selectLegacyFolder();
      if (res.canceled || !res.path) return;

      if (!res.valid) {
        (this as any).$alert.show({
          title: this.t("import_legacy_title"),
          text: this.t("import_legacy_invalid_folder"),
          translate: false,
          buttons: [
            { text: "alert.close", color: "primary", value: "close" },
          ],
        });
        return;
      }

      await this.executeLegacyImport(res.path);
    },
    async executeLegacyImport(folderPath?: string) {
      if (!(window as any).electronAPI?.importLegacyMedia) return;

      this.isImportingLegacy = true;
      this.legacyImportCurrent = 0;
      this.legacyImportTotal = 0;
      this.legacyImportStatus = this.t("import_legacy_importing");

      try {
        const result = await (window as any).electronAPI.importLegacyMedia(folderPath);
        if (result.success) {
          (this as any).$alert.show({
            title: this.t("import_legacy_title"),
            text: this.t("import_legacy_success", { count: result.totalCopied }),
            translate: false,
            buttons: [
              { text: "alert.close", color: "primary", value: "close" },
            ],
          });
        } else {
          (this as any).$alert.show({
            title: this.t("import_legacy_title"),
            text: this.t("import_legacy_error", { error: result.error || "" }),
            translate: false,
            buttons: [
              { text: "alert.close", color: "primary", value: "close" },
            ],
          });
        }
      } catch (err: any) {
        console.error("Erro na importação legada:", err);
        (this as any).$alert.show({
          title: this.t("import_legacy_title"),
          text: this.t("import_legacy_error", { error: err.message || err }),
          translate: false,
          buttons: [
            { text: "alert.close", color: "primary", value: "close" },
          ],
        });
      } finally {
        this.isImportingLegacy = false;
        this.legacyImportStatus = "";
      }
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
    async resyncData() {
      this.$alert.yesno(
        { text: this.t("msg_resync_data"), translate: false },
        async (resp: string) => {
          if (resp === "yes") {
            if ((window as any).electronAPI && (window as any).electronAPI.clearSysData) {
              try {
                await (window as any).electronAPI.clearSysData();
                this.$alert.info({ text: this.t("msg_resync_success"), translate: false }, () => {
                  window.location.reload();
                });
              } catch (err) {
                this.$alert.error({ text: this.t("msg_resync_error"), translate: false });
              }
            } else {
              this.$alert.error({ text: this.t("msg_desktop_only"), translate: false });
            }
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
