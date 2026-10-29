<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="show"
      class="module-full-page d-flex align-center justify-center bg-transparent update-modal-overlay"
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100;"
      @click.self="onOverlayClick"
    >
      <v-card
        rounded="xl"
        width="92%"
        max-width="620"
        class="update-center-card overflow-hidden elevation-24 d-flex flex-column"
        style="max-height: 88vh;"
      >
        <!-- 1. Cabeçalho Contextual (Cenários A, B, C, D e Checking) -->
        <UpdateHeader
          :icon="headerConfig.icon"
          :icon-bg-color="headerConfig.iconBg"
          :title="headerConfig.title"
          :subtitle="headerConfig.subtitle"
          :can-close="!isBusy"
          @close="close"
        />

        <!-- Conteúdo Interno Rolável -->
        <div class="update-content-scroll flex-grow-1 min-h-0 overflow-y-auto">
          <!-- Estado Verificando -->
          <div v-if="viewMode === 'checking'" class="py-12 px-6 text-center d-flex flex-column align-center justify-center">
            <v-progress-circular
              indeterminate
              color="#009fe3"
              size="40"
              class="mb-4"
            />
            <div class="text-body-2" style="color: var(--sidebar-text-secondary);">
              {{ $t('modules.update.checking_subtitle') }}
            </div>
          </div>

          <!-- Cenário A: Apenas Aplicativo -->
          <template v-else-if="viewMode === 'app-only'">
            <VersionComparison
              icon="mdi-monitor"
              :current-version="appInstalledVersion"
              :target-version="appTargetVersion"
            />
            <ReleaseAccordion
              :releases="appReleases"
              :single-notes="appReleaseNotes"
              :latest-version-number="appTargetVersion"
            />
          </template>

          <!-- Cenário B: Apenas Banco de Dados -->
          <template v-else-if="viewMode === 'database-only'">
            <VersionComparison
              icon="mdi-database"
              :current-version="dbLocalVersion"
              :target-version="dbRemoteVersion"
            />
            <ReleaseAccordion
              :single-notes="dbReleaseNotes"
              :latest-version-number="dbRemoteVersion"
            />
          </template>

          <!-- Cenário C: Ambos Disponíveis -->
          <template v-else-if="viewMode === 'combined'">
            <CombinedUpdatesView
              :app-current-version="appInstalledVersion"
              :app-target-version="appTargetVersion"
              :app-releases="appReleases"
              :app-release-notes="appReleaseNotes"
              :db-current-version="dbLocalVersion"
              :db-target-version="dbRemoteVersion"
              :db-release-notes="dbReleaseNotes"
              :is-app-updating="appStatus === 'downloading'"
              :is-db-updating="isDbUpdating"
              @update-app="startAppDownload"
              @update-db="updateDatabase"
            />
          </template>

          <!-- Cenário D: Tudo Atualizado -->
          <template v-else-if="viewMode === 'up-to-date'">
            <UpToDateView
              :app-version="appInstalledVersion"
              :db-version="dbLocalVersion"
            />
          </template>
        </div>

        <!-- 3. Rodapé Fixo de Ações -->
        <UpdateFooterActions
          :view-mode="viewMode"
          :app-status="appStatus"
          :app-download-percent="appDownloadPercent"
          :is-db-updating="isDbUpdating"
          :db-progress="dbProgress"
          :db-status-text="dbStatusText"
          :is-combined-updating="isCombinedUpdating"
          @dismiss="dismiss"
          @close="close"
          @update-app="startAppDownload"
          @update-db="updateDatabase"
          @update-all="updateAll"
          @install-app="installApp"
          @retry="retryUpdate"
        />
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import packageJson from "../../../../../../package.json";
import { fetchWithFallback, parseDbVersionFromEnv } from "@/helpers/services/Api";
import UpdateHeader from "./components/UpdateHeader.vue";
import VersionComparison from "./components/VersionComparison.vue";
import ReleaseAccordion, { type ReleaseViewItem } from "./components/ReleaseAccordion.vue";
import CombinedUpdatesView from "./components/CombinedUpdatesView.vue";
import UpToDateView from "./components/UpToDateView.vue";
import UpdateFooterActions from "./components/UpdateFooterActions.vue";

export default defineComponent({
  name: "UpdateModule",
  components: {
    UpdateHeader,
    VersionComparison,
    ReleaseAccordion,
    CombinedUpdatesView,
    UpToDateView,
    UpdateFooterActions,
  },
  data() {
    return {
      // Estado do Aplicativo
      appInstalledVersion: packageJson.version,
      appTargetVersion: "",
      appDownloadPercent: 0,
      appReleaseNotes: "",
      appReleases: [] as ReleaseViewItem[],
      appStatus: "idle" as "idle" | "checking" | "available" | "downloading" | "ready" | "error" | "not-available",

      // Estado do Banco de Dados
      dbLocalVersion: 0,
      dbRemoteVersion: 0,
      dbUpdateAvailable: false,
      isDbUpdating: false,
      dbProgress: 0,
      dbStatusText: "",
      dbReleaseNotes: "",

      // Atualização Conjunta e Checagem
      isCheckingUpdates: false,
      isCombinedUpdating: false,
    };
  },
  computed: {
    module_id(): string {
      return "update";
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    show: {
      get(): boolean {
        return this.module?.show || false;
      },
      set(val: boolean) {
        if (!val) {
          this.close();
        }
      },
    },
    isAppUpdateAvailable(): boolean {
      return this.appStatus === "available" || this.appStatus === "downloading" || this.appStatus === "ready";
    },
    isBusy(): boolean {
      return this.appStatus === "downloading" || this.isDbUpdating || this.isCombinedUpdating;
    },
    viewMode(): "app-only" | "database-only" | "combined" | "up-to-date" | "checking" {
      if (this.isCheckingUpdates) {
        return "checking";
      }
      if (this.isAppUpdateAvailable && this.dbUpdateAvailable) {
        return "combined";
      }
      if (this.isAppUpdateAvailable) {
        return "app-only";
      }
      if (this.dbUpdateAvailable) {
        return "database-only";
      }
      return "up-to-date";
    },
    headerConfig(): { icon: string; iconBg: string; title: string; subtitle: string } {
      const configs: Record<string, { icon: string; iconBg: string; title: string; subtitle: string }> = {
        "app-only": {
          icon: "mdi-monitor",
          iconBg: "#009fe3",
          title: this.$t("modules.update.app_update_title"),
          subtitle: this.$t("modules.update.app_update_subtitle"),
        },
        "database-only": {
          icon: "mdi-database",
          iconBg: "#009fe3",
          title: this.$t("modules.update.db_update_title"),
          subtitle: this.$t("modules.update.db_update_subtitle"),
        },
        combined: {
          icon: "mdi-sync",
          iconBg: "#009fe3",
          title: this.$t("modules.update.combined_update_title"),
          subtitle: this.$t("modules.update.combined_update_subtitle"),
        },
        checking: {
          icon: "mdi-cloud-sync-outline",
          iconBg: "#009fe3",
          title: this.$t("modules.update.checking_title"),
          subtitle: this.$t("modules.update.checking_subtitle"),
        },
        "up-to-date": {
          icon: "mdi-check-circle-outline",
          iconBg: "#4caf50",
          title: this.$t("modules.update.up_to_date_title"),
          subtitle: this.$t("modules.update.up_to_date_subtitle"),
        },
      };
      return configs[this.viewMode] || configs["up-to-date"];
    },
  },
  watch: {
    show(val: boolean) {
      if (val) {
        this.onModalOpen();
      }
    },
  },
  mounted() {
    this.setupListeners();
    this.loadInitialVersions();
    window.addEventListener("keydown", this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    close() {
      if (this.isBusy) return;
      this.$modules.close(this.module_id);
    },
    dismiss() {
      this.close();
    },
    onOverlayClick() {
      if (!this.isBusy) {
        this.close();
      }
    },
    handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && this.show && !this.isBusy) {
        this.close();
      }
    },
    async loadInitialVersions() {
      if (window.electronAPI?.getAppVersion) {
        try {
          const v = await window.electronAPI.getAppVersion();
          if (v) this.appInstalledVersion = v;
        } catch {
          // fallback to packageJson.version
        }
      }

      this.dbLocalVersion = this.$appdata.get("modules.sync.db_version_local") || 0;
      this.dbRemoteVersion = this.$appdata.get("modules.sync.db_version_remote") || 0;
      this.dbUpdateAvailable = this.$appdata.get("modules.sync.db_update_available") === true;
    },
    async onModalOpen() {
      // Se não houver verificação ativa nem downloads em andamento, verifica status
      if (this.appStatus === "idle" || this.appStatus === "not-available" || this.appStatus === "error") {
        this.checkAllUpdates();
      } else {
        // Apenas sincroniza versão do banco
        this.checkDbUpdate();
      }
    },
    setupListeners() {
      if (!window.electronAPI) return;

      this.$appdata.set("modules.update.status", "idle");

      window.electronAPI.onUpdateAvailable((info: any) => {
        this.isCheckingUpdates = false;
        this.appStatus = "available";
        this.appTargetVersion = info.version || "";
        this.appReleaseNotes = info.releaseNotes || "";
        if (info.currentVersion) {
          this.appInstalledVersion = info.currentVersion;
        }
        if (info.releases && Array.isArray(info.releases)) {
          this.appReleases = info.releases;
        }
        this.$appdata.set("modules.update.status", "available");
      });

      window.electronAPI.onUpdateNotAvailable((info: any) => {
        this.isCheckingUpdates = false;
        this.appStatus = "not-available";
        if (info?.currentVersion) {
          this.appInstalledVersion = info.currentVersion;
        }
        this.$appdata.set("modules.update.status", "not-available");
      });

      window.electronAPI.onUpdateDownloadProgress((progress: any) => {
        this.appStatus = "downloading";
        this.appDownloadPercent = progress.percent || 0;
        this.$appdata.set("modules.update.status", "downloading");
      });

      window.electronAPI.onUpdateDownloaded(() => {
        this.appStatus = "ready";
        this.$appdata.set("modules.update.status", "ready");
      });

      window.electronAPI.onUpdateError(() => {
        this.isCheckingUpdates = false;
        this.appStatus = "error";
        this.$appdata.set("modules.update.status", "error");
      });
    },
    async checkAllUpdates() {
      this.isCheckingUpdates = true;
      this.appStatus = "checking";
      this.$appdata.set("modules.update.status", "checking");

      // 1. Checa banco de dados
      const dbPromise = this.checkDbUpdate();

      // 2. Checa aplicativo via electron-updater
      let appPromise: Promise<any> = Promise.resolve();
      if (window.electronAPI?.checkForUpdates) {
        appPromise = window.electronAPI.checkForUpdates().then((result: any) => {
          if (!result) {
            this.appStatus = "not-available";
            this.$appdata.set("modules.update.status", "not-available");
          }
        }).catch(() => {
          this.appStatus = "error";
          this.$appdata.set("modules.update.status", "error");
        });
      } else {
        this.appStatus = "not-available";
      }

      // 3. Busca releases complementares se disponíveis
      if (window.electronAPI?.getAppReleases) {
        window.electronAPI.getAppReleases(this.appInstalledVersion).then((releases) => {
          if (releases && releases.length > 0) {
            this.appReleases = releases;
          }
        }).catch(() => { /* ignore */ });
      }

      await Promise.allSettled([dbPromise, appPromise]);
      this.isCheckingUpdates = false;
    },
    async checkDbUpdate() {
      if (!window.electronAPI) return;
      try {
        const response = await fetchWithFallback("/params?type=env");
        const text = await response.text();
        const remoteVersion = parseDbVersionFromEnv(text);
        if (remoteVersion > 0) {
          const localConfig = (await window.electronAPI.getLocalDb("config")) as any;
          const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version)
            ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10)
            : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion(this.$i18n.locale) : 0);

          this.dbLocalVersion = localVersion;
          this.dbRemoteVersion = remoteVersion;
          this.$appdata.set("modules.sync.db_version_local", localVersion);
          this.$appdata.set("modules.sync.db_version_remote", remoteVersion);

          if (remoteVersion > localVersion) {
            this.dbUpdateAvailable = true;
            this.$appdata.set("modules.sync.db_update_available", true);
          } else {
            this.dbUpdateAvailable = false;
            this.$appdata.set("modules.sync.db_update_available", false);
          }
        }
      } catch (e) {
        console.error("Erro ao verificar versão do banco:", e);
      }
    },
    startAppDownload() {
      if (window.electronAPI?.downloadUpdate) {
        this.appStatus = "downloading";
        this.appDownloadPercent = 0;
        this.$appdata.set("modules.update.status", "downloading");
        window.electronAPI.downloadUpdate();
      }
    },
    installApp() {
      if (window.electronAPI?.quitAndInstall) {
        window.electronAPI.quitAndInstall();
      }
    },
    async updateDatabase(): Promise<boolean> {
      if (!window.electronAPI) return false;
      this.isDbUpdating = true;
      this.dbProgress = 0;
      this.dbStatusText = this.$t("modules.update.downloading_db");

      window.electronAPI.onExtractProgress((data: any) => {
        this.dbProgress = data.progress;
      });

      if (window.electronAPI.onDownloadDbProgress) {
        window.electronAPI.onDownloadDbProgress((data: any) => {
          this.dbProgress = data.progress;
        });
      }

      try {
        await window.electronAPI.downloadDatabase(this.$i18n.locale, true);

        this.dbStatusText = this.$t("modules.update.extracting_db");
        this.dbProgress = 0;
        await window.electronAPI.extractLocalDb(this.$i18n.locale);

        const localConfig = (await window.electronAPI.getLocalDb("config")) as any;
        const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version)
          ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10)
          : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion(this.$i18n.locale) : 0);

        this.dbLocalVersion = localVersion;
        this.dbUpdateAvailable = false;
        this.$appdata.set("modules.sync.db_version_local", localVersion);
        this.$appdata.set("modules.sync.db_update_available", false);

        this.dbStatusText = this.$t("modules.update.db_finished_reloading");
        
        // Se a atualização foi feita isoladamente, reinicia para aplicar o banco
        if (!this.isCombinedUpdating) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }

        return true;
      } catch (e) {
        console.error("Erro na atualização do banco:", e);
        this.dbStatusText = this.$t("modules.update.error_title");
        setTimeout(() => {
          this.isDbUpdating = false;
        }, 3000);
        return false;
      }
    },
    async updateAll() {
      this.isCombinedUpdating = true;

      // 1. Baixa o aplicativo primeiro
      this.startAppDownload();

      // 2. Atualiza o banco de dados
      const dbSuccess = await this.updateDatabase();

      if (dbSuccess) {
        this.isDbUpdating = false;
      }
      this.isCombinedUpdating = false;
    },
    retryUpdate() {
      this.checkAllUpdates();
    },
  },
});
</script>

<style scoped>
.update-modal-overlay {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
}

.update-center-card {
  background: var(--card-bg, #161d2b);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

.update-content-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.update-content-scroll::-webkit-scrollbar-track {
  background: transparent !important;
  margin: 4px 0;
}

.update-content-scroll::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background-color: var(--accent-blue, #009fe3);
  transition: background-color 0.2s ease;
}

.update-content-scroll::-webkit-scrollbar-thumb:hover,
.update-content-scroll::-webkit-scrollbar-thumb:active {
  background-color: var(--accent-yellow, #ffc107);
}

.update-content-scroll {
  padding-bottom: 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--accent-blue, #009fe3) transparent;
}

/* Modo Claro */
:deep(.v-theme--light) .update-modal-overlay,
.v-theme--light .update-modal-overlay,
.v-theme--light.update-modal-overlay {
  background: rgba(15, 23, 42, 0.45) !important;
}

:deep(.v-theme--light) .update-center-card,
.v-theme--light .update-center-card,
.v-theme--light.update-center-card {
  background: #ffffff !important;
  border: 1px solid #e1e5ea !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12) !important;
}
</style>
