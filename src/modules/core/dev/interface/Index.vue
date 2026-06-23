<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Cabeçalho Integrado do Módulo -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center; justify-content: space-between;">
        
        <div class="d-flex align-center">
          <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
          <div class="module-icon-box d-flex align-center justify-center mr-4">
             <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>

        <div class="d-flex align-center">
          <v-tabs v-model="tab" color="var(--accent-blue)" class="mr-4">
            <v-tab :value="1">{{ t("modules") }}</v-tab>
            <v-tab :value="2">{{ t("global-variables") }}</v-tab>
            <v-tab :value="3">{{ t("user-variables") }}</v-tab>
            <v-tab :value="4">{{ t("vue-variables") }}</v-tab>
          </v-tabs>
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <v-tabs-window v-model="tab" class="h-100 w-100">
          <!-- Aba 1: Módulos -->
          <v-tabs-window-item :value="1" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <ModuleList />
            </div>
          </v-tabs-window-item>

          <!-- Aba 2: Variáveis Globais -->
          <v-tabs-window-item :value="2" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <v-card class="glass-card pa-4" elevation="0">
                <VueJsonPretty v-if="tab === 2" :data="$appdata.get()" />
              </v-card>
            </div>
          </v-tabs-window-item>

          <!-- Aba 3: Variáveis do Usuário -->
          <v-tabs-window-item :value="3" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <v-card class="glass-card pa-4" elevation="0">
                <VueJsonPretty v-if="tab === 3" :data="$userdata.get()" />
              </v-card>
            </div>
          </v-tabs-window-item>

          <!-- Aba 4: Variáveis do Vue -->
          <v-tabs-window-item :value="4" class="h-100">
            <div class="h-100 overflow-auto pa-4">
              <v-card class="glass-card pa-4" elevation="0">
                <VueJsonPretty v-if="tab === 4" :data="$vuetify" />
              </v-card>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import ModuleList from "../components/ModuleList.vue";
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default {
  name: manifest.id,
  components: {
    VueJsonPretty,
    ModuleList,
    MenuToggleButton,
  },
  data: () => ({
    tab: 1,
    manifest: manifest,
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    toggleSidebar() {
      const mainEl = document.querySelector('.main-container');
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }
    },
    closeModule() {
      this.$modules.close(this.module_id);
    }
  }
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/home.scss";

/* Estilos específicos para a tela de dev */
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
