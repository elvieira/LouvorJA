<template>
  <div v-if="isElectron" class="app-titlebar d-flex align-center justify-space-between pl-3" :style="{ background: 'var(--main-bg)', color: 'var(--sidebar-text)' }">
    <div class="d-flex align-center titlebar-drag-area flex-grow-1 h-100">
      <v-icon size="16" class="mr-2" style="opacity: 0.7;">mdi-music-note-eighth</v-icon>
      <span class="text-caption font-weight-medium" style="opacity: 0.9; letter-spacing: 0.5px;">Louvor JA</span>
    </div>
    
    <div class="window-controls d-flex h-100">
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
  </div>
</template>

<script>
export default {
  name: "AppTitlebar",
  data() {
    return {
      isMaximized: false,
      isElectron: false
    };
  },
  async mounted() {
    if (window.electronAPI && window.electronAPI.isElectron) {
      this.isElectron = true;
      this.isMaximized = await window.electronAPI.windowControl('is-maximized');
      
      window.electronAPI.onWindowMaximizedState((state) => {
        this.isMaximized = state;
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
    }
  }
}
</script>

<style scoped>
.app-titlebar {
  height: 32px;
  width: 100%;
  position: relative;
  z-index: 9999;
  user-select: none;
  border-bottom: 1px solid var(--border-color);
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
</style>
