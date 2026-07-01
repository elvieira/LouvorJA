<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 50;">
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div class="d-flex align-center" style="flex-shrink: 0;">
          <MenuToggleButton style="margin-right: 16px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />
          
          <div class="module-icon-box d-flex align-center justify-center mr-4" style="flex-shrink: 0;">
            <v-icon :icon="manifest.icon || 'mdi-help-circle'" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1; white-space: nowrap;">
            Ajuda e sobre
          </h2>
        </div>
        
        <div class="d-flex align-center" style="max-width: 100%; overflow-x: auto;">
          <v-tabs v-model="tab" color="var(--accent-blue)">
            <v-tab :value="1">Sobre</v-tab>
            <v-tab :value="2">Desenvolvedores</v-tab>
          </v-tabs>
        </div>
      </div>

      <div class="content-main flex-grow-1 w-100" style="overflow: auto; padding-top: 24px; background: var(--main-bg);">
        <v-tabs-window v-model="tab" class="h-100 w-100">
          
          <v-tabs-window-item :value="1" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                
                <!-- App Info Card -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
             <v-card-text class="pa-6 d-flex flex-column align-center text-center">
                <div class="mb-4 rounded-circle d-flex align-center justify-center" style="width: 96px; height: 96px; background: rgba(0, 151, 215, 0.05); border: 1px solid var(--border-color);">
                  <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 56px; height: 56px;" />
                </div>
                <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.5rem; letter-spacing: -0.02em;">Louvor JA</h3>
                <div class="text-body-2 font-weight-medium mb-6" style="color: var(--sidebar-text-secondary); background: var(--main-bg); padding: 4px 12px; border-radius: 20px; box-shadow: inset 0 0 0 1px var(--border-color);">
                  Versão {{ appVersion }} (Beta)
                </div>
                <p class="text-body-2 px-4" style="color: var(--sidebar-text-secondary); line-height: 1.6;">
                  Aplicativo desktop para gerenciamento e apresentação de músicas, hinos, letras e recursos multimídia para igrejas. Feito com amor e tecnologia para tornar a adoração ainda mais fluida.
                </p>
             </v-card-text>
           </v-card>

           <!-- Helpful Links Card -->
           <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
             <v-card-text class="pa-6">
                <div class="d-flex align-center justify-space-between mb-8">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">mdi-book-open-page-variant</v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Manual de Uso</h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">Aprenda a utilizar todos os recursos</div>
                    </div>
                  </div>
                  <v-btn variant="tonal" color="primary" class="rounded-lg text-none font-weight-bold px-4" height="40">
                    Acessar
                  </v-btn>
                </div>
                
                <v-divider class="mb-8" style="opacity: 0.1;"></v-divider>
                
                <div class="d-flex align-center justify-space-between mb-8">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">mdi-chat-question</v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Suporte e Dúvidas</h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">Fale diretamente com os desenvolvedores</div>
                    </div>
                  </div>
                  <v-btn variant="tonal" color="primary" class="rounded-lg text-none font-weight-bold px-4" height="40">
                    Contato
                  </v-btn>
                </div>


             </v-card-text>
           </v-card>

           <!-- System Actions Card -->
           <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
             <v-card-text class="pa-6">
                <div class="d-flex align-center justify-space-between mb-8">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">mdi-rocket-launch</v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Atualizações</h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">Verificar por novas versões disponíveis</div>
                    </div>
                  </div>
                  <v-btn variant="flat" color="primary" elevation="2" class="rounded-lg text-none font-weight-bold px-4" height="40" @click="openUpdate">
                    Verificar
                  </v-btn>
                </div>
                
                <v-divider class="mb-8" style="opacity: 0.1;"></v-divider>
                
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon color="grey" class="mr-3" size="24">mdi-text-box-search-outline</v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Diagnóstico</h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">Visualizar logs e informações do sistema</div>
                    </div>
                  </div>
                  <v-btn variant="tonal" color="grey" class="rounded-lg text-none font-weight-bold px-4" height="40">
                    Visualizar
                  </v-btn>
                </div>
             </v-card-text>
           </v-card>



              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="2" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6 d-flex flex-column align-center justify-center text-center" style="min-height: 300px;">
                    <div class="mb-6 rounded-circle d-flex align-center justify-center" style="width: 80px; height: 80px; background: rgba(0, 151, 215, 0.05); border: 1px dashed var(--border-color);">
                      <v-icon size="36" color="primary" style="opacity: 0.7;">mdi-account-group-outline</v-icon>
                    </div>
                    <h3 class="font-weight-bold mb-2" style="color: var(--sidebar-text); font-size: 1.2rem;">Equipe e Contribuidores</h3>
                    <p class="text-body-2 px-4" style="color: var(--sidebar-text-secondary); max-width: 350px; line-height: 1.5;">
                      As informações sobre os desenvolvedores e contribuidores do projeto estarão disponíveis aqui em breve.
                    </p>
                  </v-card-text>
                </v-card>



              </div>
            </div>
          </v-tabs-window-item>

        </v-tabs-window>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import packageJson from "../../../../../package.json";

export default {
  name: "HelpModule",
  components: {
    MenuToggleButton,
  },
  data: () => ({
    tab: 1,
    manifest,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    appVersion() {
      return packageJson.version;
    },
  },
  methods: {
    toggleSidebar() {
      document.querySelector('.main-container')?.dispatchEvent(new CustomEvent('toggle-sidebar', { bubbles: true }));
    },
    openUpdate() {
      this.$modules.open("update");
    }
  },
};
</script>
