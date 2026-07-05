<template>
  <div v-if="!$media.isMinimized()" id="footer-version">
    <v-snackbar
      v-model="showUpdateSnackbar"
      :timeout="0"
      location="top center"
      color="info"
      class="update-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-database-sync</v-icon>
        <span class="update-text">
          Novas músicas disponíveis! (v{{ remoteVersion }})
        </span>
      </div>
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="downloadUpdate"
          :loading="isUpdating"
        >
          Atualizar
        </v-btn>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="showUpdateSnackbar = false"
        />
      </template>
    </v-snackbar>
    <span class="version-text">v{{ version }}</span>
  </div>
  <v-footer
    v-else
    id="footer-bar"
    class="pa-0"
    color="primary"
  >
    <LPlayer location="footer" />
  </v-footer>
</template>

<script>
import packageJson from "../../package.json";

import LPlayer from "@/components/Player.vue";
import $storage from "@/helpers/Storage";

export default {
  name: "FooterLayout",
  components: {
    LPlayer,
  },
  data: () => ({
    db_version: 0,
    showUpdateSnackbar: false,
    remoteVersion: 0,
    isUpdating: false,
  }),
  computed: {
    version() {
      return `${packageJson.version}.${this.db_version}`;
    },
  },
  async mounted() {
    await this.loadDBVersion();
    await this.checkForDbUpdate();
  },
  methods: {
    async loadDBVersion() {
      const config = await this.$database.get("config");
      this.db_version = config.version_number;
    },
    async checkForDbUpdate() {
      if (!window.electronAPI || !window.electronAPI.syncCheckVersion) return;

      try {
        const result = await window.electronAPI.syncCheckVersion();
        if (result.hasUpdate) {
          this.remoteVersion = result.remoteVersion;
          this.showUpdateSnackbar = true;
        }
      } catch (e) {
        console.error("Erro ao verificar atualização do DB:", e);
      }
    },
    async downloadUpdate() {
      if (!window.electronAPI) return;
      this.isUpdating = true;

      try {
        // 1. Download database.db via FTP
        const downloaded = await window.electronAPI.downloadDatabase();
        if (!downloaded) {
          throw new Error("Falha no download do banco de dados");
        }

        // 2. Extrair dados (lê VERSAO_BD automaticamente)
        const extracted = await window.electronAPI.extractLocalDb();
        if (!extracted) {
          throw new Error("Falha na extração do banco de dados");
        }

        // 3. Limpar cache de sessão para forçar reload dos dados
        $storage.removeAll("db");

        // 4. Atualizar UI
        this.showUpdateSnackbar = false;
        this.isUpdating = false;

        // 5. Recarregar versão local
        await this.loadDBVersion();

        // 6. Recarregar dados do app (dispatch evento para módulos)
        window.location.reload();
      } catch (error) {
        console.error("Erro na atualização:", error);
        this.isUpdating = false;
        // TODO: mostrar erro via $alert
      }
    },
  },
};
</script>

<style scoped>
#footer-bar {
  flex: 0 !important;
}

#footer-version {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1001;
  pointer-events: none;
}

.version-text {
  display: inline-block;
  background: rgba(26, 26, 26, 0.9);
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.update-text {
  font-size: 14px;
  font-weight: 500;
}
</style>
