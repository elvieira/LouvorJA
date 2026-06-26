<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main">
      <!-- Cabeçalho Integrado com Abas -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div class="d-flex align-center" style="flex-shrink: 0;">
          <MenuToggleButton style="margin-right: 16px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />
          
          <div class="module-icon-box d-flex align-center justify-center mr-4" style="flex-shrink: 0;">
            <v-icon :icon="manifest.icon || 'mdi-cog'" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1; white-space: nowrap;">
            Configurações Gerais
          </h2>
        </div>

        <div class="d-flex align-center" style="max-width: 100%; overflow-x: auto;">
          <v-tabs v-model="tab" color="var(--accent-blue)">
            <v-tab :value="1">Aparência</v-tab>
            <v-tab :value="2">Geral</v-tab>
            <v-tab :value="3">Mídia & Player</v-tab>
            <v-tab :value="4">Projeção & Telas</v-tab>
          </v-tabs>
        </div>
      </div>

      <!-- Área Principal com Window -->
      <div class="content-main flex-grow-1 w-100" style="overflow: hidden; padding-top: 24px; background: var(--main-bg);">
        <v-tabs-window v-model="tab" class="h-100 w-100">
          
          <!-- Aba 1: Aparência -->
          <v-tabs-window-item :value="1" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <!-- Tema -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-palette</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Tema do Sistema</h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">Escolha o modo de cores para o aplicativo</div>
                      </div>
                    </div>
                    
                    <v-btn-toggle
                      v-model="active_theme_mode"
                      color="primary"
                      variant="tonal"
                      mandatory
                      class="rounded-lg w-100 d-flex"
                      style="height: 48px;"
                    >
                      <v-btn value="light" class="flex-grow-1 text-none font-weight-bold">
                        <v-icon start>mdi-white-balance-sunny</v-icon> Modo Claro
                      </v-btn>
                      <v-btn value="dark" class="flex-grow-1 text-none font-weight-bold">
                        <v-icon start>mdi-weather-night</v-icon> Modo Escuro
                      </v-btn>
                    </v-btn-toggle>
                  </v-card-text>
                </v-card>

                <!-- Efeitos -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-transition-masked</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Efeitos Visuais</h3>
                      </div>
                    </div>
                    <v-switch v-model="fade_effect" label="Adicionar efeito de esmaecimento nas telas" color="primary" inset hide-details class="font-weight-medium" />
                  </v-card-text>
                </v-card>

                <!-- Imagem de Fundo -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6 justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-3" size="28">mdi-image-multiple</v-icon>
                        <div>
                          <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Imagem de Fundo</h3>
                        </div>
                      </div>
                      <v-btn variant="outlined" color="primary" prepend-icon="mdi-restore" class="text-none">Restaurar</v-btn>
                    </div>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-text-field v-model="bg_color" type="color" label="Cor do Fundo" variant="outlined" density="comfortable" hide-details />
                      </v-col>
                      <v-col cols="12" sm="8">
                        <v-file-input v-model="bg_image" label="Imagem" variant="outlined" density="comfortable" hide-details prepend-icon="" prepend-inner-icon="mdi-camera" />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select v-model="bg_align" :items="['Centro', 'Preencher', 'Ajustar']" label="Alinhamento" variant="outlined" density="comfortable" hide-details />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Aba 2: Geral -->
          <v-tabs-window-item :value="2" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto d-flex flex-column" style="max-width: 600px; gap: 24px;">
                
                <!-- Idioma -->
                <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-translate</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Idioma</h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">Idioma de interface do aplicativo</div>
                      </div>
                    </div>
                    <v-select
                      v-model="language"
                      :items="['Português', 'English', 'Español']"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      bg-color="transparent"
                      class="font-weight-medium"
                    />
                  </v-card-text>
                </v-card>

                <!-- Layout da Página Inicial -->
                <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-view-dashboard</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Layout da Tela Inicial</h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">Exibir as coletâneas e músicas mais tocadas.</div>
                      </div>
                    </div>
                    <v-switch v-model="show_home_history" label="Ativar modo histórico" color="primary" inset hide-details class="font-weight-medium" />
                  </v-card-text>
                </v-card>

                <!-- Histórico -->
                <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-start">
                        <v-icon color="error" class="mr-3 mt-1" size="28">mdi-database-refresh</v-icon>
                        <div>
                          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Resetar Histórico</h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary); max-width: 300px;">
                            Limpa as coletâneas recentes e as músicas mais tocadas da página inicial. Esta ação não pode ser desfeita.
                          </div>
                        </div>
                      </div>
                      <v-btn
                        color="error"
                        variant="flat"
                        prepend-icon="mdi-delete-empty"
                        class="rounded-lg text-none px-6 font-weight-bold"
                        @click="resetHistory"
                        elevation="2"
                      >
                        Limpar
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Dados e Inicialização -->
                <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center justify-space-between mb-4">
                      <div class="d-flex align-start">
                        <v-icon color="warning" class="mr-3 mt-1" size="28">mdi-monitor-star</v-icon>
                        <div>
                          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Tela de Carregamento</h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary); max-width: 300px;">
                            Força a exibição da tela de carregamento inicial para fins de teste ou demonstração visual.
                          </div>
                        </div>
                      </div>
                      <v-btn
                        color="warning"
                        variant="flat"
                        prepend-icon="mdi-eye"
                        class="rounded-lg text-none px-6 font-weight-bold"
                        @click="showBootScreen"
                        elevation="2"
                      >
                        Visualizar Tela
                      </v-btn>
                    </div>

                    <v-divider class="my-4"></v-divider>

                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-start">
                        <v-icon color="error" class="mr-3 mt-1" size="28">mdi-delete-alert</v-icon>
                        <div>
                          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Limpar Todos os Dados</h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary); max-width: 300px;">
                            Exclui banco de dados, letras, capas e arquivos de áudio baixados no PC. O programa precisará baixar tudo na próxima vez.
                          </div>
                        </div>
                      </div>
                      <v-btn
                        color="error"
                        variant="flat"
                        prepend-icon="mdi-folder-remove"
                        class="rounded-lg text-none px-6 font-weight-bold"
                        @click="clearAllData"
                        elevation="2"
                      >
                        Apagar Tudo
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

              </div>
            </div>
          </v-tabs-window-item>

          <!-- Aba 3: Mídia & Player -->
          <v-tabs-window-item :value="3" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <!-- Player de Áudio/Vídeo -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-play-network</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Player de Áudio/Vídeo</h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">Configurações de reprodução de mídia local</div>
                      </div>
                    </div>
                    
                    <v-select v-model="player_monitor" :items="['Monitor 1', 'Monitor 2']" label="Abrir no monitor" variant="outlined" density="comfortable" class="mb-4" hide-details />
                    <v-switch v-model="exec_audio_player" label="Executar arquivos de áudio no player do programa" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="exec_video_player" label="Executar arquivos de vídeo no player do programa" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="player_fullscreen" label="Exibir vídeo em tela cheia" color="primary" inset hide-details class="font-weight-medium" />
                    
                    <v-alert type="info" variant="tonal" class="mt-4 text-caption" density="compact">
                      Nota: Se o áudio/vídeo não for suportado pelo player, o arquivo será automaticamente aberto no player nativo.
                    </v-alert>
                  </v-card-text>
                </v-card>

                <!-- Vídeos On-line -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-youtube</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Vídeos On-line</h3>
                      </div>
                    </div>
                    
                    <v-select v-model="online_monitor" :items="['Monitor 1', 'Monitor 2']" label="Abrir no monitor" variant="outlined" density="comfortable" class="mb-4" hide-details />
                    <v-switch v-model="online_fullscreen" label="Exibir em tela cheia" color="primary" inset hide-details class="mb-4 font-weight-medium" />
                    <v-select v-model="youtube_mode" :items="['Vídeo', 'Áudio']" label="Ao executar link do Youtube na liturgia, abrir:" variant="outlined" density="comfortable" hide-details />
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Aba 4: Projeção & Telas -->
          <v-tabs-window-item :value="4" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <!-- Monitores -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-monitor-multiple</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Monitores</h3>
                      </div>
                    </div>
                    
                    <div class="d-flex mb-4" style="gap: 2px;">
                      <!-- Visual mock for monitor -->
                      <div class="d-flex flex-column align-center justify-center rounded-sm" style="background: #000; color: #fff; width: 140px; height: 90px; border: 2px solid var(--accent-blue);">
                        <span class="font-weight-bold text-h5">1</span>
                        <span class="text-caption">1366 x 768</span>
                      </div>
                      <div class="d-flex flex-column align-center justify-center rounded-sm" style="background: rgba(120,120,120,0.1); width: 140px; height: 90px; border: 1px solid var(--border-color);">
                      </div>
                    </div>
                    <v-btn variant="tonal" color="primary" class="text-none font-weight-bold">Identificar Monitores</v-btn>
                  </v-card-text>
                </v-card>

                <!-- Slides de Músicas -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-presentation-play</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Slides de Músicas</h3>
                      </div>
                    </div>
                    
                    <v-row class="mb-2">
                      <v-col cols="12" sm="6">
                        <v-select v-model="slide_monitor" :items="['Monitor 1', 'Monitor 2']" label="Abrir no monitor" variant="outlined" density="comfortable" hide-details />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select v-model="slide_align" :items="['Centro', 'Esquerda', 'Direita']" label="Alinhamento da letra" variant="outlined" density="comfortable" hide-details />
                      </v-col>
                    </v-row>
                    
                    <v-switch v-model="slide_fullscreen" label="Exibir em tela cheia" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_always_on_top" label="Exibir músicas sempre em primeiro plano" color="primary" inset hide-details class="font-weight-medium" />
                    
                    <v-row class="mt-2 mb-2">
                      <v-col cols="12" sm="6">
                        <v-select v-model="operator_monitor" :items="['1', '2']" label="Abrir Tela do Operador no monitor:" variant="outlined" density="comfortable" hide-details />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select v-model="return_monitor" :items="['1', '2']" label="Abrir Tela de Retorno no monitor:" variant="outlined" density="comfortable" hide-details />
                      </v-col>
                    </v-row>
                    
                    <v-switch v-model="slide_show_title" label="Exibir título da música no primeiro slide" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_custom_text_format" label="Formatação de texto personalizada" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_custom_bg" label="Fundo personalizado" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_affect_external" label="Formatação e fundo afetam slides externos" color="primary" inset hide-details class="font-weight-medium" />
                  </v-card-text>
                </v-card>

                <!-- Sistema Avançado (Utilitários originais) -->
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-monitor-dashboard</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Utilitários de Desempenho</h3>
                      </div>
                    </div>
                    
                    <v-switch
                      v-model="hardware_accel"
                      color="primary"
                      label="Aceleração de Hardware"
                      hide-details
                      inset
                      class="mb-2 font-weight-medium"
                    />
                    <v-switch
                      v-model="fullscreen_mode"
                      color="primary"
                      label="Iniciar programa em Tela Cheia"
                      hide-details
                      inset
                      class="font-weight-medium"
                    />
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

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
  },
  data: () => ({
    tab: 1,
    language: "Português",
    show_home_history: true,
    hardware_accel: true,
    fullscreen_mode: false,
    
    // Tab 1: Aparência
    fade_effect: false,
    bg_color: '#000000',
    bg_image: null,
    bg_align: 'Centro',
    
    // Tab 3: Mídia & Player
    player_monitor: 'Monitor 1',
    exec_audio_player: false,
    exec_video_player: false,
    player_fullscreen: true,
    online_monitor: 'Monitor 1',
    online_fullscreen: true,
    youtube_mode: 'Vídeo',
    
    // Tab 4: Projeção & Telas
    slide_monitor: 'Monitor 1',
    slide_align: 'Centro',
    slide_fullscreen: true,
    slide_always_on_top: true,
    operator_monitor: '1',
    return_monitor: '1',
    slide_show_title: true,
    slide_custom_text_format: false,
    slide_custom_bg: false,
    slide_affect_external: true,
    
    manifest,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    active_theme_mode: {
      get() {
        return this.$vuetify.theme.global.current.dark ? "dark" : "light";
      },
      set(mode) {
        this.setTheme(mode);
      },
    },
  },
  mounted() {
    // Configura o toggle inicial para coincidir com o modo ativo
    if(this.$userdata.get("theme")){
      this.$vuetify.theme.global.name = this.$userdata.get("theme");
    }
    
    // Load show_home_history
    const saved_home_history = this.$userdata.get("show_home_history");
    if (saved_home_history !== undefined && saved_home_history !== null) {
      this.$data.show_home_history = saved_home_history;
    }
  },
  watch: {
    show_home_history(val) {
      this.$userdata.set("show_home_history", val);
    }
  },
  methods: {
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    setTheme(theme_id) {
      this.$vuetify.theme.global.name = theme_id;
      this.$userdata.set("theme", theme_id);
      this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);
    },
    resetHistory() {
      if (confirm("Tem certeza que deseja resetar o histórico de coletâneas e músicas mais tocadas?")) {
        this.$history.clearAll();
        // Dispara um alerta ou recarrega para aplicar a home (se desejar, mas Vue reatividade no Storage não é automática sem store. Uma msg é o suficiente)
        alert("Histórico resetado com sucesso! Atualize a página inicial para ver as mudanças.");
      }
    },
    async clearAllData() {
      if (confirm("ATENÇÃO: Você tem certeza que deseja apagar todos os bancos de dados, capas, músicas e mídias baixadas do aplicativo?\n\nIsso exigirá um novo download de todos os arquivos essenciais e irá reiniciar o programa.")) {
        if (window.electronAPI) {
          const success = await window.electronAPI.clearAllData();
          if (success) {
            alert("Todos os arquivos locais foram removidos com sucesso. O aplicativo será recarregado agora.");
            window.location.reload();
          } else {
            alert("Ocorreu um erro ao tentar limpar os dados.");
          }
        } else {
          alert("Apenas disponível na versão desktop.");
        }
      }
    },
    showBootScreen() {
      window.dispatchEvent(new CustomEvent('show-boot-screen'));
    },
  },
};
</script>

<style scoped>
.settings-card {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
.settings-section h3 {
  opacity: 0.9;
}
</style>
