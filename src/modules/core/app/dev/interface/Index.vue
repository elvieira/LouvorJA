<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <v-tabs v-model="tab" color="var(--accent-blue)" class="mr-4">
          <v-tab :value="1">
            {{ t("modules") }}
          </v-tab>
          <v-tab :value="2">
            {{ t("global-variables") }}
          </v-tab>
          <v-tab :value="3">
            {{ t("user-variables") }}
          </v-tab>
          <v-tab :value="4">
            {{ t("vue-variables") }}
          </v-tab>
        </v-tabs>
      </ModuleHeader>

      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <v-tabs-window v-model="tab" class="h-100 w-100">
          <v-tabs-window-item :value="1" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <ModuleList />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="2" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <v-card class="glass-card pa-4" elevation="0">
                <VueJsonPretty v-if="tab === 2" :data="$appdata.get()" />
              </v-card>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="3" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <v-card class="glass-card pa-4" elevation="0">
                <VueJsonPretty v-if="tab === 3" :data="$userdata.get()" />
              </v-card>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="4" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <v-card class="glass-card pa-4" elevation="0">
                <VueJsonPretty v-if="tab === 4" :data="($vuetify as any)" />
              </v-card>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import ModuleList from "../components/ModuleList.vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";

export default defineComponent({
  name: manifest.id,
  components: {
    VueJsonPretty,
    ModuleList,
    ModuleHeader,
  },
  data: () => ({
    tab: 1,
    manifest,
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    closeModule() {
      this.$modules.close(this.module_id);
    },
  },
});
</script>

<style lang="scss">
.dashboard-home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header {
  background: transparent;
}

.content-main {
  padding: 20px 32px 32px 32px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
}

@media (max-width: 1024px) {  
  .search-header {
    padding: 16px 20px 8px 20px;
    justify-content: flex-start;
  }
  .content-main {
    padding: 16px 20px 20px 20px;
    height: calc(100vh - 60px);
  }
}

@media (max-width: 768px) {  
  .search-header {
    padding: 12px 16px 6px 16px;
  }
  .content-main {
    padding: 12px 16px 16px 16px;
    height: calc(100vh - 50px);
  }
}

.vjs-tree {
  font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
  font-size: 14px;
}

.glass-card {
  background: var(--glass-bg) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: blur(20px);
}
</style>
