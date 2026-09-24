<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- IMPORTAÇÃO DO LOUVOR JA CLÁSSICO (SE WINDOWS) -->
    <v-card
      v-if="isWindows"
      class="settings-card rounded-xl pa-2"
      flat
      style="background: var(--card-bg); box-shadow: var(--shadow);"
    >
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-3" size="28">
            mdi-folder-sync-outline
          </v-icon>
          <div>
            <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
              {{ t('import_legacy') }}
            </h3>
            <div class="text-caption" style="color: var(--sidebar-text-secondary);">
              {{ t('import_legacy_desc') }}
            </div>
          </div>
        </div>

        <SettingsActionRow
          icon="mdi-database-import"
          icon-color="primary"
          :title="t('import_legacy')"
          :subtitle="t('import_legacy_desc')"
          :button-text="t('import_legacy_btn')"
          button-color="primary"
          button-variant="tonal"
          :button-loading="isImportingLegacy"
          :button-disabled="isImportingLegacy"
          :class="isImportingLegacy ? 'mb-4' : ''"
          @action="startLegacyImport"
        />

        <div v-if="isImportingLegacy" class="mt-4 pl-9">
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
      </v-card-text>
    </v-card>

    <!-- HISTÓRICO & SESSÃO -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <SettingsActionRow
          icon="mdi-database-refresh"
          icon-color="warning"
          :title="t('reset_history')"
          :subtitle="t('reset_history_desc')"
          :button-text="t('reset_btn')"
          button-color="warning"
          button-variant="tonal"
          @action="resetHistory"
        />
      </v-card-text>
    </v-card>

    <!-- BANCO DE DADOS & REPAROS -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <SettingsActionRow
          icon="mdi-sync-alert"
          icon-color="warning"
          :title="t('resync_data')"
          :subtitle="t('resync_data_desc')"
          :button-text="t('resync_btn')"
          button-color="warning"
          button-variant="tonal"
          @action="resyncData"
        />

        <v-divider class="my-6" style="opacity: 0.1;" />

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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";
import SettingsActionRow from "@/components/SettingsActionRow.vue";

export default defineComponent({
  name: "ConfigMaintenance",
  components: {
    SettingsActionRow,
  },
  data: () => ({
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
  },
  mounted() {
    if ((window as any).electronAPI?.onImportLegacyProgress) {
      (window as any).electronAPI.onImportLegacyProgress((data: any) => {
        this.legacyImportCurrent = data.current;
        this.legacyImportTotal = data.total;
        this.legacyImportStatus = `${this.t("import_legacy_importing")} (${data.filename})`;
      });
    }
  },
  methods: {
    t(text: string, values?: Record<string, unknown>): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`, values as any);
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
      (this as any).$alert.yesno(
        { text: this.t("msg_reset_history"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            (this as any).$history.clearAll();
            (this as any).$alert.info({ text: this.t("msg_reset_success"), translate: false });
          }
        },
      );
    },
    async resyncData() {
      (this as any).$alert.yesno(
        { text: this.t("msg_resync_data"), translate: false },
        async (resp: string) => {
          if (resp === "yes") {
            if ((window as any).electronAPI && (window as any).electronAPI.clearSysData) {
              try {
                await (window as any).electronAPI.clearSysData();
                (this as any).$alert.info({ text: this.t("msg_resync_success"), translate: false }, () => {
                  window.location.reload();
                });
              } catch (err) {
                (this as any).$alert.error({ text: this.t("msg_resync_error"), translate: false });
              }
            } else {
              (this as any).$alert.error({ text: this.t("msg_desktop_only"), translate: false });
            }
          }
        },
      );
    },
    async clearAllData() {
      (this as any).$alert.yesno(
        { text: this.t("msg_clear_data"), translate: false },
        async (resp: string) => {
          if (resp === "yes") {
            if ((window as any).electronAPI?.clearAllData) {
              try {
                await (window as any).electronAPI.clearAllData();
                window.localStorage.clear();
                window.sessionStorage.clear();
                (this as any).$alert.info({ text: this.t("msg_clear_success"), translate: false }, () => {
                  window.location.reload();
                });
              } catch (err) {
                (this as any).$alert.error({ text: this.t("msg_clear_error"), translate: false });
              }
            } else {
              (this as any).$alert.error({ text: this.t("msg_desktop_only"), translate: false });
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
  border-radius: 24px !important;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
</style>
