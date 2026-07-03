<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      
      <!-- Top Bar -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0 mr-4" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>
        
        <div class="search-bar ml-4 d-flex align-center" style="flex: 1; justify-content: flex-end; gap: 12px;">
        </div>
      </div>

      <!-- Clock Display -->
      <div class="content-main flex-grow-1 w-100 pa-6 d-flex align-center justify-center" style="overflow: hidden; background: transparent;">
        <div class="clock-widget-container d-flex flex-column justify-center align-center position-relative" style="width: 100%; max-width: 900px; aspect-ratio: 21/9; max-height: 100%; background: var(--card-bg, #ffffff); border-radius: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.05); border: 1px solid var(--border-color, rgba(0,0,0,0.05)); overflow: hidden; transition: transform 0.3s ease;">
          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <v-btn variant="tonal" color="primary" icon size="small" style="width: 36px; height: 36px;" class="config-palette-btn" @click="$refs.configModal.open()">
              <v-icon>mdi-palette</v-icon>
              <v-tooltip activator="parent" location="bottom" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">{{ t('config') }}</v-tooltip>
            </v-btn>
            <LScreenBtn module="clock" />
          </div>
          <Screen :preview="true" />
        </div>
      </div>

      <!-- Config Modal -->
      <ConfigModal ref="configModal" />
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import Screen from "../components/Screen.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "./components/ConfigModal.vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import manifest from "../manifest.json";

export default {
  name: manifest.id,
  components: {
    Screen,
    LScreenBtn,
    ConfigModal,
    MenuToggleButton
  },
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$appdata.get(`modules.${this.module_id}`);
    }
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    }
  }
};
</script>
