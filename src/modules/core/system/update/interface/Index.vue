<template>
  <v-slide-y-reverse-transition>
    <div v-if="show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <v-card
        rounded="xl"
        width="100%"
        max-width="520"
        style="background: var(--card-bg); overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);"
      >
        <UpdHeader 
          :update-status="updateStatus" 
          :update-version="updateVersion"
          @close="close" 
        />

        <UpdDetails 
          :update-status="updateStatus" 
          :update-version="updateVersion"
          :release-notes="releaseNotes"
        />

        <v-divider style="opacity: 0.1;" />

        <UpdActions 
          :update-status="updateStatus"
          :download-percent="downloadPercent"
          @start-download="startDownload"
          @install-update="installUpdate"
          @retry-update="retryUpdate"
        />
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UpdHeader from "./components/UpdHeader.vue";
import UpdDetails from "./components/UpdDetails.vue";
import UpdActions from "./components/UpdActions.vue";

export default defineComponent({
  name: "UpdateModule",
  components: {
    UpdHeader,
    UpdDetails,
    UpdActions,
  },
  data() {
    return {
      updateVersion: "",
      downloadPercent: 0,
      releaseNotes: "",
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
    updateStatus(): string {
      return this.$appdata.get("modules.update.status") || "idle";
    },
  },
  watch: {
    show(val: boolean) {
      if (val) {
        if (this.updateStatus === "idle" || this.updateStatus === "not-available" || this.updateStatus === "error") {
          this.$appdata.set("modules.update.status", "checking");
          this.checkDbUpdate();
          if (window.electronAPI) {
            window.electronAPI.checkForUpdates().then((result: any) => {
              if (!result) {
                this.$appdata.set("modules.update.status", "not-available");
              }
            }).catch(() => {
              this.$appdata.set("modules.update.status", "error");
            });
          }
        }
      }
    },
  },
  mounted() {
    this.setupAutoUpdateListeners();
  },
  methods: {
    close() {
      this.$modules.close(this.module_id);
    },
    setupAutoUpdateListeners() {
      if (!window.electronAPI) return;
      
      // Reseta o estado sempre que o app inicia para evitar status 'presos' de sessões anteriores
      this.$appdata.set("modules.update.status", "idle");
      
      window.electronAPI.onUpdateAvailable((info: any) => {
        this.$appdata.set("modules.update.status", "available");
        this.updateVersion = info.version;
        this.releaseNotes = info.releaseNotes || "";
      });
      
      window.electronAPI.onUpdateNotAvailable(() => {
        this.$appdata.set("modules.update.status", "not-available");
      });
      
      window.electronAPI.onUpdateDownloadProgress((progress: any) => {
        this.$appdata.set("modules.update.status", "downloading");
        this.downloadPercent = progress.percent;
      });
      
      window.electronAPI.onUpdateDownloaded(() => {
        this.$appdata.set("modules.update.status", "ready");
      });
      
      window.electronAPI.onUpdateError(() => {
        this.$appdata.set("modules.update.status", "error");
      });
    },
    startDownload() {
      if (window.electronAPI) {
        this.$appdata.set("modules.update.status", "downloading");
        this.downloadPercent = 0;
        window.electronAPI.downloadUpdate();
      }
    },
    installUpdate() {
      if (window.electronAPI) {
        window.electronAPI.quitAndInstall();
      }
    },
    retryUpdate() {
      this.$appdata.set("modules.update.status", "checking");
      this.checkDbUpdate();
      if (window.electronAPI) {
        window.electronAPI.checkForUpdates().then((result: any) => {
          if (!result) {
            this.$appdata.set("modules.update.status", "not-available");
          }
        }).catch(() => {
          this.$appdata.set("modules.update.status", "error");
        });
      }
    },
    async checkDbUpdate() {
      if (window.electronAPI) {
        try {
          const response = await fetch("https://api.louvorja.com.br/params?type=env");
          const text = await response.text();
          const dbVersionMatch = text.match(/db_version=(\d+)/);
          if (dbVersionMatch && dbVersionMatch[1]) {
            const remoteVersion = parseInt(dbVersionMatch[1], 10);
            const localConfig = await window.electronAPI.getLocalDb("config") as any;
            const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version) 
              ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10) 
              : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion() : 0);
            
            this.$appdata.set("modules.sync.db_version_local", localVersion);
            this.$appdata.set("modules.sync.db_version_remote", remoteVersion);
            if (remoteVersion > localVersion) {
              this.$appdata.set("modules.sync.db_update_available", true);
            } else {
              this.$appdata.set("modules.sync.db_update_available", false);
            }
          }
        } catch (e) {
          console.error("Erro ao verificar versão do banco:", e);
        }
      }
    },
  },
});
</script>
