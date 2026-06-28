<template>
  <div v-if="isElectron && isMainApp" class="app-titlebar d-flex align-center" :style="{ background: 'var(--main-bg)', color: 'var(--sidebar-text)' }">
    
    <!-- MAC VERSION -->
    <template v-if="isMac">
      <div class="mac-controls d-flex align-center h-100 titlebar-no-drag pl-4" :class="{ 'mac-unfocused': !isFocused }" style="z-index: 2;">
        <div class="mac-btn mac-close d-flex align-center justify-center mr-2" @click="close">
          <v-icon size="8" class="mac-icon">mdi-close</v-icon>
        </div>
        <div class="mac-btn mac-minimize d-flex align-center justify-center mr-2" @click="minimize">
          <v-icon size="8" class="mac-icon">mdi-minus</v-icon>
        </div>
        <div class="mac-btn mac-maximize d-flex align-center justify-center" @click="maximize">
          <v-icon size="8" class="mac-icon">mdi-window-maximize</v-icon>
        </div>
      </div>
      
      <div class="mac-title-center h-100 d-flex align-center justify-center">
        <span class="text-caption font-weight-medium" style="opacity: 0.9; letter-spacing: 0.5px;">Louvor JA</span>
      </div>
    </template>

    <!-- WINDOWS VERSION -->
    <template v-else>
      <div class="d-flex align-center titlebar-drag-area flex-grow-1 h-100 pl-3">
        <img src="/ico/favicon.svg" width="16" height="16" class="mr-2" style="opacity: 0.9;" alt="Icone" />
        <span class="text-caption font-weight-medium" style="opacity: 0.9; letter-spacing: 0.5px;">Louvor JA</span>
      </div>
      
      <div class="window-controls d-flex h-100 titlebar-no-drag">
        <div class="control-btn d-flex align-center justify-center" @click="minimize">
          <v-icon size="16">mdi-minus</v-icon>
        </div>
        <div class="control-btn d-flex align-center justify-center" @click="maximize">
          <v-icon size="14">{{ isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize' }}</v-icon>
        </div>
        <div class="control-btn close-btn d-flex align-center justify-center" @click="close">
          <v-icon size="18">mdi-close</v-icon>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import $appdata from "@/helpers/AppData";
import $alert from "@/helpers/Alert";

export default {
  name: "AppTitlebar",
  data() {
    return {
      isMaximized: false,
      isElectron: false,
      isMac: false,
      isFocused: true
    };
  },
  computed: {
    isMainApp() {
      return this.$route.name !== 'Popup';
    }
  },
  async mounted() {
    this.isMac = navigator.userAgent.includes('Mac');
    
    window.addEventListener('focus', () => { this.isFocused = true; });
    window.addEventListener('blur', () => { this.isFocused = false; });

    if (window.electronAPI && window.electronAPI.isElectron) {
      this.isElectron = true;
      this.isMaximized = await window.electronAPI.windowControl('is-maximized');
      
      window.electronAPI.onWindowMaximizedState((state) => {
        this.isMaximized = state;
      });

      // Intercepta pedido de fechamento
      window.electronAPI.onRequestCloseApp(() => {
        const isMediaActive = $appdata.get("modules.media.id_music") != null || $appdata.get("modules.media.show");
        let popups = $appdata.get("popups") || [];
        const hasProjector = popups.some(p => !p.closed);

        if (isMediaActive || hasProjector) {
          $alert.yesno({
            title: "Encerrar Aplicativo?",
            text: "Existe uma mídia ativa ou projeção em andamento. Deseja realmente sair?",
            translate: false
          }, (btn) => {
            if (btn === "yes") {
              this.executeClose();
            }
          });
        } else {
          this.executeClose();
        }
      });
    }
  },
  methods: {
    minimize() {
      if (this.isElectron) window.electronAPI.windowControl('minimize');
    },
    maximize() {
      if (this.isElectron) window.electronAPI.windowControl('maximize');
    },
    close() {
      if (this.isElectron) window.electronAPI.windowControl('close');
    },
    executeClose() {
      if (this.isElectron) {
        window.electronAPI.forceQuitApp();
      }
    }
  }
}
</script>

<style scoped>
.app-titlebar {
  height: 32px;
  width: 100%;
  position: relative;
  z-index: 99999;
  user-select: none;
  border-bottom: 1px solid var(--border-color);
  -webkit-app-region: drag;
}

.titlebar-drag-area {
  -webkit-app-region: drag;
}

.window-controls {
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 46px;
  height: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
  opacity: 0.8;
}

.control-btn:hover {
  background-color: rgba(128, 128, 128, 0.2);
  opacity: 1;
}

.close-btn:hover {
  background-color: #E81123 !important;
  color: white !important;
  opacity: 1;
}

.titlebar-no-drag {
  -webkit-app-region: no-drag;
}

/* MAC STYLES */
.mac-controls {
  -webkit-app-region: no-drag;
}

.mac-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: background-color 0.2s ease;
}
.mac-close { background-color: #ff5f56; }
.mac-minimize { background-color: #ffbd2e; }
.mac-maximize { background-color: #27c93f; }

.mac-unfocused .mac-btn {
  background-color: rgba(128, 128, 128, 0.35) !important;
}

.mac-unfocused .mac-icon {
  opacity: 0 !important;
}

.mac-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: rgba(0, 0, 0, 0.6) !important;
}

.mac-controls:hover:not(.mac-unfocused) .mac-icon {
  opacity: 1;
}

.mac-title-center {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
}
</style>
