<template>
  <v-slide-y-reverse-transition>
    <div v-if="show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <v-card rounded="xl" width="100%" max-width="520" style="background: var(--card-bg); overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, rgba(0,151,215,0.15) 0%, rgba(0,151,215,0.05) 100%); padding: 24px 24px 20px;">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center" style="gap: 12px;">
              <div style="background: rgba(0,151,215,0.15); border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
                <v-icon color="primary" size="28">mdi-rocket-launch</v-icon>
              </div>
              <div>
                <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">Nova Versão Disponível</div>
                <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
                  {{ updateVersion ? 'v' + updateVersion : 'Processando informações...' }}
                </div>
              </div>
            </div>
            <v-btn icon variant="text" size="small" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Conteúdo Carregando -->
        <div v-if="!updateVersion" style="padding: 40px 24px; text-align: center;">
          <v-progress-circular indeterminate color="primary" size="32" class="mb-3"></v-progress-circular>
          <div class="text-body-2" style="color: var(--sidebar-text-secondary);">Buscando detalhes da atualização...</div>
        </div>

        <!-- Release Notes -->
        <div v-else-if="releaseNotes" style="padding: 20px 24px; max-height: 320px; overflow-y: auto;">
          <div class="text-subtitle-2 font-weight-bold mb-3" style="color: var(--sidebar-text);">
            <v-icon size="18" class="mr-1" color="primary">mdi-text-box-outline</v-icon>
            O que há de novo
          </div>
          <div 
            class="release-notes-content text-body-2"
            style="color: var(--sidebar-text-secondary); line-height: 1.7;"
            v-html="releaseNotes"
          ></div>
        </div>

        <!-- Sem notas informadas -->
        <div v-else style="padding: 30px 24px; text-align: center; opacity: 0.7;">
           <v-icon size="40" color="primary" class="mb-3">mdi-update</v-icon>
           <div class="text-body-2" style="color: var(--sidebar-text-secondary);">Esta atualização não contém notas detalhadas de lançamento.</div>
        </div>

        <v-divider style="opacity: 0.1;" />

        <!-- Footer com ações -->
        <div style="padding: 16px 24px 20px;">
          <!-- Barra de progresso -->
          <div v-if="updateStatus === 'downloading'" class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">Baixando atualização...</span>
              <span class="text-caption font-weight-bold" style="color: var(--accent-blue);">{{ downloadPercent }}%</span>
            </div>
            <div style="height: 6px; background: rgba(0,151,215,0.1); border-radius: 6px; overflow: hidden;">
              <div 
                style="height: 100%; background: linear-gradient(90deg, #0097d7, #00b4d8); border-radius: 6px; transition: width 0.3s ease;" 
                :style="{ width: downloadPercent + '%' }"
              ></div>
            </div>
          </div>

          <div class="d-flex justify-end" style="gap: 12px;">
            <v-btn 
              v-if="updateStatus !== 'downloading'"
              variant="text" 
              rounded="xl" 
              class="text-none"
              @click="close"
            >
              Depois
            </v-btn>
            
            <!-- Botão: Atualizar Agora -->
            <v-btn 
              v-if="updateStatus === 'available'"
              color="primary" 
              rounded="xl" 
              class="text-none px-6"
              prepend-icon="mdi-download"
              @click="startDownload"
            >
              Atualizar Agora
            </v-btn>
            
            <!-- Botão: Baixando (desabilitado) -->
            <v-btn 
              v-else-if="updateStatus === 'downloading'"
              color="primary" 
              rounded="xl" 
              class="text-none px-6"
              disabled
              prepend-icon="mdi-loading mdi-spin"
            >
              Baixando...
            </v-btn>
            
            <!-- Botão: Reiniciar e Instalar -->
            <v-btn 
              v-else-if="updateStatus === 'ready'"
              color="success" 
              rounded="xl" 
              class="text-none px-6"
              prepend-icon="mdi-restart"
              @click="installUpdate"
            >
              Reiniciar e Instalar
            </v-btn>
            
            <!-- Botão: Tentar novamente -->
            <v-btn 
              v-else-if="updateStatus === 'error'"
              color="error" 
              rounded="xl" 
              class="text-none px-6"
              prepend-icon="mdi-refresh"
              @click="retryUpdate"
            >
              Tentar Novamente
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
export default {
  name: "UpdateModule",
  data: () => ({
    updateVersion: '',
    downloadPercent: 0,
    releaseNotes: '',
  }),
  computed: {
    module_id() {
      return 'update';
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    show: {
      get() {
        return this.module?.show || false;
      },
      set(val) {
        if (!val) {
          this.close();
        }
      }
    },
    updateStatus() {
      return this.$appdata.get("modules.update.status") || 'idle';
    }
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
      
      window.electronAPI.onUpdateAvailable((info) => {
        this.$appdata.set("modules.update.status", "available");
        this.updateVersion = info.version;
        this.releaseNotes = info.releaseNotes || '';
      });
      
      window.electronAPI.onUpdateNotAvailable(() => {
        this.$appdata.set("modules.update.status", "idle");
      });
      
      window.electronAPI.onUpdateDownloadProgress((progress) => {
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
      this.$appdata.set("modules.update.status", "idle");
      if (window.electronAPI) {
        window.electronAPI.checkForUpdates();
      }
    },
  }
};
</script>

<style scoped>
.release-notes-content :deep(h1),
.release-notes-content :deep(h2),
.release-notes-content :deep(h3) {
  font-size: 1.1em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: var(--sidebar-text);
}
.release-notes-content :deep(ul),
.release-notes-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 1em;
}
.release-notes-content :deep(p) {
  margin-bottom: 1em;
}
.release-notes-content :deep(a) {
  color: var(--accent-blue);
  text-decoration: none;
}
.release-notes-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
