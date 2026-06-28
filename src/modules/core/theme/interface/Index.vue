<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main">
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

      <div class="content-main flex-grow-1 w-100" style="overflow: hidden; padding-top: 24px; background: var(--main-bg);">
        <v-tabs-window v-model="tab" class="h-100 w-100">
          
          <v-tabs-window-item :value="1" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
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


              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="2" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto d-flex flex-column" style="max-width: 600px; gap: 24px;">
                
                <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-translate</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Idioma</h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">Idioma de interface do aplicativo</div>
                      </div>
                    </div>
                    <v-menu :close-on-content-click="true" location="bottom start">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          variant="flat"
                          color="var(--card-bg, #1a1a1a)"
                          rounded="xl"
                          class="text-none px-4 elevation-1 w-100"
                          style="height: 44px; border: 1px solid var(--border-color, rgba(255,255,255,0.05));"
                        >
                          <div class="d-flex align-center justify-space-between w-100" style="color: var(--sidebar-text);">
                            <span class="text-truncate font-weight-medium text-body-2">
                              {{ language }}
                            </span>
                            <v-icon size="small" class="opacity-50">mdi-menu-down</v-icon>
                          </div>
                        </v-btn>
                      </template>
                      <v-card
                        class="modern-glass-menu elevation-0 mt-2"
                        theme="dark"
                        rounded="lg"
                        style="overflow: hidden; min-width: 200px;"
                      >
                        <v-list class="py-2" bg-color="transparent">
                          <v-list-item
                            v-for="item in ['Português', 'English', 'Español']"
                            :key="item"
                            :active="item === language"
                            active-color="white"
                            class="mx-2 rounded-lg mb-1"
                            style="min-height: 40px;"
                            @click="language = item"
                          >
                            <div class="d-flex align-center">
                              <span class="text-body-2 font-weight-medium" :class="item === language ? 'text-white' : 'text-white-50'">
                                {{ item }}
                              </span>
                            </div>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-menu>
                  </v-card-text>
                </v-card>

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

          <v-tabs-window-item :value="3" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <v-alert
                  type="warning"
                  variant="tonal"
                  class="mb-6 rounded-xl"
                  border="start"
                  elevation="0"
                >
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" size="32">mdi-hammer-wrench</v-icon>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold">Em Desenvolvimento</div>
                      <div class="text-body-2">As configurações de Mídia & Player estão sendo construídas e não estão disponíveis no momento.</div>
                    </div>
                  </div>
                </v-alert>
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="4" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-monitor-multiple</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Monitores</h3>
                      </div>
                    </div>
                    
                    <div class="d-flex flex-wrap mb-4" style="gap: 16px;">
                      <div v-for="(display, index) in rawDisplays" :key="display.id" 
                           class="d-flex flex-column align-center justify-center rounded-sm" 
                           :style="`background: ${display.isPrimary ? '#000' : 'rgba(120,120,120,0.1)'}; color: ${display.isPrimary ? '#fff' : 'inherit'}; width: 140px; height: 90px; border: ${display.isPrimary ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)'};`">
                        <span class="font-weight-bold text-h5">{{ index + 1 }}</span>
                        <span class="text-caption" style="opacity: 0.8">{{ display.bounds.width }} x {{ display.bounds.height }}</span>
                      </div>
                    </div>
                    <v-btn variant="tonal" color="primary" class="text-none font-weight-bold" @click="identifyMonitors">Identificar Monitores</v-btn>
                  </v-card-text>
                </v-card>

                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">mdi-presentation-play</v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Slides de Músicas</h3>
                      </div>
                    </div>
                    
                    <div class="mb-6">
                      <div class="text-body-2 font-weight-bold mb-2" style="color: var(--sidebar-text);">Projetar nas seguintes telas:</div>
                      <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap pa-3 rounded-lg" style="gap: 16px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.02);">
                        <v-checkbox
                          v-for="monitor in slideMonitorList"
                          :key="monitor.value"
                          v-model="slide_monitor"
                          :value="monitor.value"
                          :label="monitor.title"
                          color="primary"
                          hide-details
                          density="compact"
                          class="font-weight-medium"
                        ></v-checkbox>
                      </div>
                      <v-alert v-else type="info" variant="tonal" density="compact" class="mt-2 text-caption">
                        Nenhum monitor estendido (secundário) detectado no sistema.
                      </v-alert>
                    </div>

                    <v-row class="mb-2">
                      <v-col cols="12" sm="6">
                        <div class="text-caption font-weight-medium mb-1" style="color: var(--sidebar-text-secondary);">Alinhamento da letra</div>
                        <v-menu :close-on-content-click="true" location="bottom start">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              variant="flat"
                              color="var(--card-bg, #1a1a1a)"
                              rounded="xl"
                              class="text-none px-4 elevation-1 w-100"
                              style="height: 44px; border: 1px solid var(--border-color, rgba(255,255,255,0.05));"
                            >
                              <div class="d-flex align-center justify-space-between w-100" style="color: var(--sidebar-text);">
                                <span class="text-truncate font-weight-medium text-body-2">
                                  {{ slide_align }}
                                </span>
                                <v-icon size="small" class="opacity-50">mdi-menu-down</v-icon>
                              </div>
                            </v-btn>
                          </template>
                          <v-card
                            class="modern-glass-menu elevation-0 mt-2"
                            theme="dark"
                            rounded="lg"
                            style="overflow: hidden; min-width: 200px;"
                          >
                            <v-list class="py-2" bg-color="transparent">
                              <v-list-item
                                v-for="item in ['Centro', 'Esquerda', 'Direita']"
                                :key="item"
                                :active="item === slide_align"
                                active-color="white"
                                class="mx-2 rounded-lg mb-1"
                                style="min-height: 40px;"
                                @click="slide_align = item"
                              >
                                <div class="d-flex align-center">
                                  <span class="text-body-2 font-weight-medium" :class="item === slide_align ? 'text-white' : 'text-white-50'">
                                    {{ item }}
                                  </span>
                                </div>
                              </v-list-item>
                            </v-list>
                          </v-card>
                        </v-menu>
                      </v-col>
                    </v-row>
                    
                    <v-switch v-model="slide_fullscreen" label="Exibir em tela cheia" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_always_on_top" label="Exibir músicas sempre em primeiro plano" color="primary" inset hide-details class="font-weight-medium" />
                    
                    <v-row class="mt-2 mb-2">
                      <v-col cols="12" sm="6">
                        <div class="text-caption font-weight-medium mb-1" style="color: var(--sidebar-text-secondary);">Abrir Tela do Operador no monitor:</div>
                        <v-menu :close-on-content-click="true" location="bottom start">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              variant="flat"
                              color="var(--card-bg, #1a1a1a)"
                              rounded="xl"
                              class="text-none px-4 elevation-1 w-100"
                              style="height: 44px; border: 1px solid var(--border-color, rgba(255,255,255,0.05));"
                            >
                              <div class="d-flex align-center justify-space-between w-100" style="color: var(--sidebar-text);">
                                <span class="text-truncate font-weight-medium text-body-2">
                                  {{ operator_monitor }}
                                </span>
                                <v-icon size="small" class="opacity-50">mdi-menu-down</v-icon>
                              </div>
                            </v-btn>
                          </template>
                          <v-card
                            class="modern-glass-menu elevation-0 mt-2"
                            theme="dark"
                            rounded="lg"
                            style="overflow: hidden; min-width: 200px;"
                          >
                            <v-list class="py-2" bg-color="transparent">
                              <v-list-item
                                v-for="item in ['1', '2']"
                                :key="item"
                                :active="item === operator_monitor"
                                active-color="white"
                                class="mx-2 rounded-lg mb-1"
                                style="min-height: 40px;"
                                @click="operator_monitor = item"
                              >
                                <div class="d-flex align-center">
                                  <span class="text-body-2 font-weight-medium" :class="item === operator_monitor ? 'text-white' : 'text-white-50'">
                                    {{ item }}
                                  </span>
                                </div>
                              </v-list-item>
                            </v-list>
                          </v-card>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <div class="text-caption font-weight-medium mb-1" style="color: var(--sidebar-text-secondary);">Abrir Tela de Retorno no monitor:</div>
                        <v-menu :close-on-content-click="true" location="bottom start">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              variant="flat"
                              color="var(--card-bg, #1a1a1a)"
                              rounded="xl"
                              class="text-none px-4 elevation-1 w-100"
                              style="height: 44px; border: 1px solid var(--border-color, rgba(255,255,255,0.05));"
                            >
                              <div class="d-flex align-center justify-space-between w-100" style="color: var(--sidebar-text);">
                                <span class="text-truncate font-weight-medium text-body-2">
                                  {{ return_monitor }}
                                </span>
                                <v-icon size="small" class="opacity-50">mdi-menu-down</v-icon>
                              </div>
                            </v-btn>
                          </template>
                          <v-card
                            class="modern-glass-menu elevation-0 mt-2"
                            theme="dark"
                            rounded="lg"
                            style="overflow: hidden; min-width: 200px;"
                          >
                            <v-list class="py-2" bg-color="transparent">
                              <v-list-item
                                v-for="item in ['1', '2']"
                                :key="item"
                                :active="item === return_monitor"
                                active-color="white"
                                class="mx-2 rounded-lg mb-1"
                                style="min-height: 40px;"
                                @click="return_monitor = item"
                              >
                                <div class="d-flex align-center">
                                  <span class="text-body-2 font-weight-medium" :class="item === return_monitor ? 'text-white' : 'text-white-50'">
                                    {{ item }}
                                  </span>
                                </div>
                              </v-list-item>
                            </v-list>
                          </v-card>
                        </v-menu>
                      </v-col>
                    </v-row>
                    
                    <v-switch v-model="slide_show_title" label="Exibir título da música no primeiro slide" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_custom_text_format" label="Formatação de texto personalizada" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_custom_bg" label="Fundo personalizado" color="primary" inset hide-details class="mb-2 font-weight-medium" />
                    <v-switch v-model="slide_affect_external" label="Formatação e fundo afetam slides externos" color="primary" inset hide-details class="font-weight-medium" />
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
import $media from "@/helpers/Media";

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
    
    fade_effect: false,
    bg_color: '#000000',
    bg_image: null,
    bg_align: 'Centro',
    
    player_monitor: 'Monitor 1',
    exec_audio_player: false,
    exec_video_player: false,
    player_fullscreen: true,
    online_monitor: 'Monitor 1',
    online_fullscreen: true,
    youtube_mode: 'Vídeo',
    
    slide_monitor: [],
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
    rawDisplays() {
      return this.$appdata.get("system_displays") || [];
    },
    monitorList() {
      if (this.rawDisplays.length === 0) {
        return [
          { title: 'Monitor 1 (Principal)', value: 'Monitor 1' },
          { title: 'Monitor 2', value: 'Monitor 2' }
        ];
      }
      return this.rawDisplays.map((d, index) => ({
        title: `Monitor ${index + 1} ${d.isPrimary ? '(Principal)' : '(Estendido)'}`,
        value: d.id,
        isPrimary: d.isPrimary
      }));
    },
    slideMonitorList() {
      return this.monitorList.filter(m => !m.isPrimary);
    }
  },
  mounted() {
    if(this.$userdata.get("theme")){
      this.$vuetify.theme.global.name = this.$userdata.get("theme");
    }
    
    const saved_home_history = this.$userdata.get("show_home_history");
    if (saved_home_history !== undefined && saved_home_history !== null) {
      this.$data.show_home_history = saved_home_history;
    }

    let savedSlideMonitor = this.$userdata.get("modules.theme.slide_monitor");
    if (savedSlideMonitor) {
      if (!Array.isArray(savedSlideMonitor)) {
        savedSlideMonitor = [savedSlideMonitor];
      }
      this.slide_monitor = savedSlideMonitor;
    }
  },
  watch: {
    show_home_history(val) {
      this.$userdata.set("show_home_history", val);
    },
    slide_monitor(val) {
      if (val !== undefined && val !== null) {
        this.$userdata.set("modules.theme.slide_monitor", val);
        $media.syncMonitors();
      }
    },
    slideMonitorList: {
      handler(newList) {
        if (newList.length > 0 && this.rawDisplays.length > 0) {
          if (this.slide_monitor === undefined || this.slide_monitor === null) {
            this.slide_monitor = newList.map(m => m.value);
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    identifyMonitors() {
      if (window.electronAPI && window.electronAPI.identifyDisplays) {
        window.electronAPI.identifyDisplays();
      }
    },
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
