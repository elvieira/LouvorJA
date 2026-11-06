<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- PASTA DE MÍDIA COMPARTILHADA (FLUTE, PIANO, VIOLIN) -->
    <v-card
      class="settings-card rounded-xl pa-2"
      flat
      style="background: var(--card-bg); box-shadow: var(--shadow);"
    >
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-3" size="28">
            mdi-folder-music-outline
          </v-icon>
          <div>
            <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
              {{ t('media_path_title') }}
            </h3>
            <div class="text-caption" style="color: var(--sidebar-text-secondary);">
              {{ t('media_path_desc') }}
            </div>
          </div>
        </div>

        <!-- Caminho Atual em Destaque -->
        <div class="media-path-container pa-4 rounded-xl mb-4 d-flex align-center justify-space-between flex-wrap" style="background: var(--main-bg); border: 1px solid var(--border-color); gap: 12px;">
          <div class="d-flex align-center" style="min-width: 0; max-width: 100%;">
            <v-avatar
              color="primary"
              variant="tonal"
              size="38"
              class="mr-3 flex-shrink-0"
            >
              <v-icon size="20">
                mdi-folder-open
              </v-icon>
            </v-avatar>
            <div style="min-width: 0;">
              <div class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">
                {{ t('media_path_current') }}
              </div>
              <div class="text-body-2 font-weight-bold text-truncate" style="color: var(--sidebar-text); font-family: monospace;">
                {{ currentMediaPath || '...' }}
              </div>
            </div>
          </div>
          <div class="d-flex align-center flex-wrap" style="gap: 8px;">
            <v-btn
              color="primary"
              variant="tonal"
              height="40"
              prepend-icon="mdi-folder-open-outline"
              :disabled="!currentMediaPath"
              class="rounded-lg text-none font-weight-bold px-4"
              @click="openMediaFolder"
            >
              {{ t('media_path_open_btn') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              height="40"
              prepend-icon="mdi-folder-search-outline"
              :loading="isScanningDrives"
              :disabled="isMigratingMedia"
              class="rounded-lg text-none font-weight-bold px-4"
              @click="scanDrives"
            >
              {{ t('media_path_scan_btn') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              height="40"
              prepend-icon="mdi-folder-edit-outline"
              :disabled="isMigratingMedia"
              class="rounded-lg text-none font-weight-bold px-4"
              @click="changeMediaPath"
            >
              {{ t('media_path_change_btn') }}
            </v-btn>
          </div>
        </div>

        <!-- Alerta de Discos Encontrados -->
        <v-expand-transition>
          <div v-if="scannedDrives.length > 0" class="mb-4 pa-4 rounded-xl" style="background: rgba(0, 159, 227, 0.08); border: 1px solid rgba(0, 159, 227, 0.25);">
            <div class="text-subtitle-2 font-weight-bold mb-2 text-primary d-flex align-center">
              <v-icon size="18" class="mr-2">
                mdi-harddisk
              </v-icon>
              {{ t('media_path_scan_found') }}
            </div>
            <div v-for="dPath in scannedDrives" :key="dPath" class="d-flex align-center justify-space-between py-2 border-bottom">
              <span class="text-body-2 font-weight-medium text-truncate mr-3" style="font-family: monospace;">
                {{ dPath }}
              </span>
              <v-btn
                color="primary"
                variant="flat"
                size="x-small"
                class="text-none"
                @click="useScannedDrive(dPath)"
              >
                {{ t('media_path_use_this') }}
              </v-btn>
            </div>
          </div>
        </v-expand-transition>

        <!-- Alerta de Mídias Antigas no AppData Disponíveis para Migração -->
        <v-expand-transition>
          <div v-if="needsMigration && !isMigratingMedia" class="mb-4 pa-4 rounded-xl d-flex align-center justify-space-between flex-wrap" style="background: rgba(255, 152, 0, 0.1); border: 1px solid rgba(255, 152, 0, 0.3); gap: 12px;">
            <div class="d-flex align-center" style="min-width: 0;">
              <v-icon
                color="warning"
                class="mr-3"
                size="24"
              >
                mdi-alert-circle-outline
              </v-icon>
              <div>
                <div class="text-body-2 font-weight-bold text-warning">
                  {{ t('media_path_migration_title') }}
                </div>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                  Mídias antigas detectadas. Transfira para a nova pasta de mídia.
                </div>
              </div>
            </div>
            <v-btn
              color="warning"
              variant="flat"
              size="small"
              prepend-icon="mdi-cloud-sync"
              class="text-none font-weight-bold"
              @click="startMediaMigration()"
            >
              {{ t('media_path_migrate_btn') }}
            </v-btn>
          </div>
        </v-expand-transition>

        <!-- Progresso da Migração -->
        <v-expand-transition>
          <div v-if="isMigratingMedia" class="mt-2 pa-4 rounded-xl" style="background: var(--main-bg); border: 1px solid var(--border-color);">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span style="color: var(--sidebar-text-secondary); max-width: 75%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ mediaMigrationFilename ? `${t('media_path_migrating')} (${mediaMigrationFilename})` : t('media_path_migrating') }}
              </span>
              <span class="font-weight-bold text-primary">
                {{ mediaMigrationCurrent }} / {{ mediaMigrationTotal }} ({{ mediaMigrationPercent }}%)
              </span>
            </div>
            <v-progress-linear
              :model-value="mediaMigrationPercent"
              :indeterminate="mediaMigrationTotal === 0"
              color="primary"
              height="8"
              rounded
            />
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

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
    // Mídia compartilhada
    currentMediaPath: "",
    needsMigration: false,
    legacyPath: "",
    suggestedPath: "",
    isScanningDrives: false,
    scannedDrives: [] as string[],
    isMigratingMedia: false,
    mediaMigrationCurrent: 0,
    mediaMigrationTotal: 0,
    mediaMigrationFilename: "",
    mediaMigrationPercent: 0,

    // Legado
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
    this.loadMediaPathInfo();

    if ((window as any).electronAPI?.onImportLegacyProgress) {
      (window as any).electronAPI.onImportLegacyProgress((data: any) => {
        this.legacyImportCurrent = data.current;
        this.legacyImportTotal = data.total;
        this.legacyImportStatus = `${this.t("import_legacy_importing")} (${data.filename})`;
      });
    }

    if ((window as any).electronAPI?.onMediaMigrationProgress) {
      (window as any).electronAPI.onMediaMigrationProgress((data: any) => {
        this.mediaMigrationCurrent = data.current;
        this.mediaMigrationTotal = data.total;
        this.mediaMigrationFilename = data.filename;
        this.mediaMigrationPercent = data.percent;
      });
    }
  },
  unmounted() {
    if ((window as any).electronAPI?.removeMediaMigrationProgressListener) {
      (window as any).electronAPI.removeMediaMigrationProgressListener();
    }
  },
  methods: {
    async loadMediaPathInfo() {
      if (!(window as any).electronAPI) return;
      try {
        if ((window as any).electronAPI.getMediaPath) {
          this.currentMediaPath = await (window as any).electronAPI.getMediaPath();
        }
        if ((window as any).electronAPI.checkMediaPathMigration) {
          const res = await (window as any).electronAPI.checkMediaPathMigration();
          this.needsMigration = res.needsMigration;
          this.legacyPath = res.legacyPath;
          this.suggestedPath = res.suggestedPath;
        }
      } catch (e) {
        console.error("Erro ao carregar informações de mídia:", e);
      }
    },
    async openMediaFolder() {
      if (!(window as any).electronAPI?.openMediaFolder) return;
      try {
        await (window as any).electronAPI.openMediaFolder();
      } catch (e) {
        console.error("Erro ao abrir pasta de mídias:", e);
      }
    },
    async scanDrives() {
      if (!(window as any).electronAPI?.scanMediaDrives) return;
      this.isScanningDrives = true;
      this.scannedDrives = [];
      try {
        const found = await (window as any).electronAPI.scanMediaDrives();
        this.scannedDrives = found || [];
        if (this.scannedDrives.length === 0) {
          (this as any).$alert.show({
            title: this.t("media_path_title"),
            text: this.t("media_path_scan_none"),
            translate: false,
            buttons: [{ text: "alert.close", color: "primary", value: "close" }],
          });
        }
      } catch (e: any) {
        console.error("Erro na varredura de discos:", e);
      } finally {
        this.isScanningDrives = false;
      }
    },
    async useScannedDrive(targetPath: string) {
      if (!(window as any).electronAPI?.setMediaPath) return;
      (this as any).$alert.show({
        title: this.t("media_path_title"),
        text: this.t("media_path_scan_confirm", { path: targetPath }),
        translate: false,
        buttons: [
          { text: "alert.cancel", color: "grey", variant: "text", value: "cancel" },
          { text: this.t("media_path_use_this"), color: "primary", variant: "flat", value: "yes" },
        ],
      }, async (resp: string) => {
        if (resp === "yes") {
          await (window as any).electronAPI.setMediaPath(targetPath);
          await this.loadMediaPathInfo();
          (this as any).$alert.show({
            title: this.t("media_path_title"),
            text: `Pasta de mídia atualizada para:<br><b>${targetPath}</b>`,
            translate: false,
            buttons: [{ text: "alert.close", color: "primary", value: "close" }],
          });
        }
      });
    },
    async changeMediaPath() {
      if (!(window as any).electronAPI?.openFolderPicker) return;
      const picked = await (window as any).electronAPI.openFolderPicker();
      if (!picked) return;

      (this as any).$alert.show({
        title: this.t("media_path_title"),
        text: `Deseja configurar a pasta:<br><b>${picked}</b><br><br>Selecione se deseja apenas mudar o local ou copiar os arquivos de mídia atuais para ela.<br><br><span style="color: #f59e0b; font-weight: 600;">⚠️ Atenção: A cópia das mídias pode demorar alguns minutos. Não feche o programa e nem desligue o computador.</span>`,
        translate: false,
        maxWidth: 540,
        buttons: [
          { text: "alert.cancel", color: "grey", variant: "text", value: "cancel" },
          { text: "Apenas Definir", color: "primary", variant: "tonal", value: "just_set" },
          { text: "Copiar Mídias", color: "primary", variant: "flat", value: "migrate" },
        ],
      }, async (resp: string) => {
        if (resp === "just_set") {
          await (window as any).electronAPI.setMediaPath(picked);
          await this.loadMediaPathInfo();
        } else if (resp === "migrate") {
          // O usuário pode escolher se quer excluir ou manter a pasta antiga após a cópia
          (this as any).$alert.show({
            title: this.t("media_path_title"),
            text: `Deseja excluir a pasta antiga após a conclusão da transferência?<br><br>Se você excluir, o espaço no disco anterior será liberado.<br><br><b>Pasta antiga:</b> ${this.currentMediaPath}<br><b>Nova pasta:</b> ${picked}`,
            translate: false,
            maxWidth: 540,
            buttons: [
              { text: "alert.cancel", color: "grey", variant: "text", value: "cancel" },
              { text: "Manter pasta antiga", color: "primary", variant: "tonal", value: "keep" },
              { text: "Excluir pasta antiga", color: "error", variant: "flat", value: "delete" },
            ],
          }, async (choice: string) => {
            if (choice === "cancel") return;
            const shouldDelete = (choice === "delete");
            await this.startMediaMigration(picked, shouldDelete);
          });
        }
      });
    },
    async startMediaMigration(targetPath?: string, deleteSource: boolean = false) {
      if (!(window as any).electronAPI?.migrateMediaFiles || this.isMigratingMedia) return;
      const destination = targetPath || this.suggestedPath || this.currentMediaPath;
      if (!destination) return;

      this.isMigratingMedia = true;
      window.dispatchEvent(
        new CustomEvent("start-media-migration-boot", {
          detail: {
            targetPath: destination,
            deleteSource,
            sourcePath: this.currentMediaPath,
            onComplete: async (result: any) => {
              this.isMigratingMedia = false;
              await this.loadMediaPathInfo();
              if (result && !result.success) {
                (this as any).$alert.show({
                  title: this.t("media_path_title"),
                  text: this.t("media_path_migration_error", { error: result.error || "" }),
                  translate: false,
                  buttons: [{ text: "alert.close", color: "primary", value: "close" }],
                });
              }
            },
          },
        }),
      );
    },
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
.media-path-container {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.border-bottom {
  border-bottom: 1px solid var(--border-color);
}
.border-bottom:last-child {
  border-bottom: none;
}
</style>
