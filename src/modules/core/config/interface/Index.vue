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
            {{ t('main_title') }}
          </h2>
        </div>

        <div class="d-flex align-center" style="max-width: 100%; overflow-x: auto;">
          <v-tabs v-model="tab" color="var(--accent-blue)">
            <v-tab :value="1">
              {{ t('tab_appearance') }}
            </v-tab>
            <v-tab :value="2">
              {{ t('tab_general') }}
            </v-tab>
            <v-tab :value="3">
              {{ t('tab_media') }}
            </v-tab>
            <v-tab :value="4">
              {{ t('tab_projection') }}
            </v-tab>
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
                      <v-icon color="primary" class="mr-3" size="28">
                        mdi-palette
                      </v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                          {{ t('system_theme') }}
                        </h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                          {{ t('system_theme_desc') }}
                        </div>
                      </div>
                    </div>
                    
                    <v-btn-toggle
                      v-model="active_theme_mode"
                      color="primary"
                      variant="tonal"
                      mandatory
                      class="rounded-xl w-100 d-flex"
                      style="height: 48px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
                    >
                      <v-btn value="light" class="flex-grow-1 text-none font-weight-bold">
                        <v-icon start size="20">
                          mdi-white-balance-sunny
                        </v-icon> {{ t('light_mode') }}
                      </v-btn>
                      <v-btn value="dark" class="flex-grow-1 text-none font-weight-bold">
                        <v-icon start size="20">
                          mdi-weather-night
                        </v-icon> {{ t('dark_mode') }}
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
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <!-- IDIOMA -->
                    <div class="d-flex align-center justify-space-between mb-8">
                      <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-3" size="24">
                          mdi-translate
                        </v-icon>
                        <div>
                          <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                            {{ t('language') }}
                          </h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                            {{ t('language_desc') }}
                          </div>
                        </div>
                      </div>
                      <v-menu :close-on-content-click="true" location="bottom end">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            variant="tonal"
                            color="primary"
                            rounded="lg"
                            class="text-none px-4"
                            style="height: 44px; min-width: 140px;"
                          >
                            <div class="d-flex align-center justify-space-between w-100">
                              <span class="text-truncate font-weight-bold text-body-2 mr-2">
                                {{ languageName }}
                              </span>
                              <v-icon size="small">
                                mdi-menu-down
                              </v-icon>
                            </div>
                          </v-btn>
                        </template>
                        <v-card class="mt-1" rounded="lg" style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color); min-width: 140px;">
                          <v-list class="py-1" bg-color="transparent">
                            <v-list-item
                              v-for="item in languagesList"
                              :key="item.code"
                              :active="item.code === language"
                              color="primary"
                              class="mx-1 rounded-lg mb-1"
                              style="min-height: 36px;"
                              @click="language = item.code"
                            >
                              <span class="text-body-2 font-weight-bold">{{ item.name }}</span>
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </v-menu>
                    </div>

                    <v-divider class="mb-8" style="opacity: 0.1;" />

                    <!-- LAYOUT DA TELA INICIAL -->
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-3" size="24">
                          mdi-view-dashboard
                        </v-icon>
                        <div>
                          <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                            {{ t('home_layout') }}
                          </h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                            Ativar modo histórico (exibe itens recentes)
                          </div>
                        </div>
                      </div>
                      <v-switch
                        v-model="show_home_history"
                        color="primary"
                        inset
                        hide-details
                        class="font-weight-medium"
                      />
                    </div>
                  </v-card-text>
                </v-card>

                <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <!-- RESETAR HISTÓRICO -->
                    <div class="d-flex align-center justify-space-between mb-8">
                      <div class="d-flex align-center mr-4">
                        <v-icon color="error" class="mr-3" size="24">
                          mdi-database-refresh
                        </v-icon>
                        <div>
                          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                            {{ t('reset_history') }}
                          </h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
                            Limpa as coletâneas recentes e as músicas mais tocadas.
                          </div>
                        </div>
                      </div>
                      <v-btn
                        color="error"
                        variant="tonal"
                        class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
                        @click="resetHistory"
                      >
                        Limpar
                      </v-btn>
                    </div>

                    <v-divider class="mb-8" style="opacity: 0.1;" />

                    <!-- LIMPAR TODOS OS DADOS -->
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center mr-4">
                        <v-icon color="error" class="mr-3" size="24">
                          mdi-delete-alert
                        </v-icon>
                        <div>
                          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                            {{ t('clear_data') }}
                          </h3>
                          <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
                            Exclui banco de dados e arquivos baixados.
                          </div>
                        </div>
                      </div>
                      <v-btn
                        color="error"
                        variant="flat"
                        class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
                        @click="clearAllData"
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
                <v-card class="settings-card rounded-xl pa-2 mb-6 mt-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-4">
                      <v-icon color="primary" class="mr-3" size="28">
                        mdi-play-network-outline
                      </v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                          Reprodução
                        </h3>
                      </div>
                    </div>
                    
                    <div class="mt-4">
                      <v-switch
                        v-model="media_use_internal_player"
                        label="Reproduzir mídias internamente (em teste)"
                        color="primary"
                        hide-details
                        inset
                        class="font-weight-medium mb-2"
                      />

                      <v-expand-transition>
                        <div v-show="media_use_internal_player" class="pl-4 mt-4" style="border-left: 2px solid var(--border-color);">
                          <v-switch
                            v-model="media_sync_projection_settings"
                            label="Replicar configurações de Projeção & Telas"
                            color="primary"
                            hide-details
                            inset
                            density="compact"
                            class="mb-2"
                          />
                          
                          <v-switch
                            v-model="media_auto_project_video"
                            label="Projetar vídeos automaticamente ao abrir"
                            color="primary"
                            hide-details
                            inset
                            density="compact"
                            class="mb-2"
                          />
                          
                          <v-switch
                            v-model="media_pause_on_minimize"
                            label="Pausar vídeo ao minimizar"
                            color="primary"
                            hide-details
                            inset
                            density="compact"
                          />
                          <v-expand-transition>
                            <div v-show="!media_sync_projection_settings" class="mt-4 pa-4 rounded-xl" style="background: rgba(0,0,0,0.15); border: 1px solid var(--border-color);">
                              <!-- MÚLTIPLAS TELAS (MÍDIA) -->
                              <div class="mb-6">
                                <div class="d-flex align-center mb-4">
                                  <v-icon size="20" color="primary" class="mr-2">
                                    mdi-monitor-multiple
                                  </v-icon>
                                  <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('multi_screens') }}</span>
                                </div>
                                
                                <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary);">
                                  Projetar nas seguintes telas:
                                </div>
                                <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap mt-2" style="gap: 16px;">
                                  <v-card
                                    v-for="monitor in slideMonitorList"
                                    :key="monitor.value"
                                    flat
                                    class="rounded-xl border cursor-pointer"
                                    :class="media_slide_monitor.includes(monitor.value) ? 'elevation-2' : ''"
                                    :style="media_slide_monitor.includes(monitor.value) ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important; transition: all 0.2s;' : 'background: var(--main-bg); border: 2px solid transparent !important; transition: all 0.2s; box-shadow: inset 0 0 0 1px var(--border-color);'"
                                    width="160"
                                    @click="toggleMediaSlideMonitor(monitor.value)"
                                  >
                                    <div class="pa-4 d-flex flex-column align-center">
                                      <v-icon :color="media_slide_monitor.includes(monitor.value) ? 'primary' : 'grey'" size="32" class="mb-2 transition-all">
                                        {{ media_slide_monitor.includes(monitor.value) ? 'mdi-monitor-share' : 'mdi-monitor-off' }}
                                      </v-icon>
                                      <span class="text-body-2 font-weight-bold text-center transition-all" :style="media_slide_monitor.includes(monitor.value) ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                                        {{ monitor.title }}
                                      </span>
                                    </div>
                                  </v-card>
                                </div>
                                <v-alert
                                  v-else
                                  type="info"
                                  variant="tonal"
                                  density="compact"
                                  class="mt-2 text-caption rounded-lg"
                                >
                                  Nenhum monitor estendido (secundário) detectado no sistema.
                                </v-alert>
                              </div>

                              <!-- TELA ÚNICA / PRINCIPAL (MÍDIA) -->
                              <div>
                                <div class="d-flex align-center mb-4">
                                  <v-icon size="20" color="primary" class="mr-2">
                                    mdi-monitor
                                  </v-icon>
                                  <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('main_screen') }}</span>
                                </div>
                                
                                <v-switch
                                  v-model="media_slide_fullscreen"
                                  label="Abrir mídia em tela cheia na tela principal"
                                  color="primary"
                                  inset
                                  hide-details
                                  density="compact"
                                  class="mb-2 font-weight-medium"
                                />
                                <v-switch
                                  v-model="media_slide_disable_main_if_extended"
                                  label="Desativar tela principal caso haja monitor estendido"
                                  color="primary"
                                  inset
                                  hide-details
                                  density="compact"
                                  class="mb-2 font-weight-medium"
                                />
                                <v-switch
                                  v-model="media_slide_minimize_player"
                                  label="Minimizar o player automaticamente"
                                  color="primary"
                                  inset
                                  hide-details
                                  density="compact"
                                  class="font-weight-medium"
                                />
                              </div>
                            </div>
                          </v-expand-transition>
                        </div>
                      </v-expand-transition>
                    </div>
                    
                    <v-divider class="mb-8 mt-8" style="opacity: 0.1;" />
                      
                    <div class="d-flex justify-center mt-2">
                      <v-btn
                        variant="tonal"
                        color="primary"
                        class="text-none font-weight-bold rounded-lg px-6"
                        @click="resetMediaConfigs"
                      >
                        <v-icon start>
                          mdi-restore
                        </v-icon>
                        {{ t('restore_defaults') }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="4" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">
                        mdi-monitor-multiple
                      </v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                          {{ t('monitors') }}
                        </h3>
                      </div>
                    </div>
                    
                    <div class="d-flex flex-wrap mb-6 justify-center" style="gap: 32px; padding: 20px 0;">
                      <div
                        v-for="(display, index) in rawDisplays"
                        :key="display.id"
                        class="d-flex flex-column align-center"
                        style="transition: transform 0.2s ease;"
                      >
                        <!-- Tela do Monitor -->
                        <div 
                          class="d-flex flex-column align-center justify-center position-relative"
                          :style="`
                            width: 170px; 
                            height: 106px; 
                            border-radius: 12px; 
                            background: ${display.isPrimary ? 'linear-gradient(135deg, var(--accent-blue) 0%, #0077b6 100%)' : 'var(--main-bg)'}; 
                            color: ${display.isPrimary ? '#fff' : 'var(--sidebar-text)'};
                            border: ${display.isPrimary ? '2px solid transparent' : '2px solid rgba(150,150,150,0.2)'};
                            box-shadow: ${display.isPrimary ? '0 10px 25px rgba(0,151,215,0.4)' : '0 8px 20px rgba(0,0,0,0.06)'};
                            z-index: 2;
                          `"
                        >
                          <!-- Ícone de Estrela para o Primário -->
                          <v-icon
                            v-if="display.isPrimary"
                            size="18"
                            class="position-absolute"
                            style="top: 10px; right: 10px; opacity: 0.9"
                          >
                            mdi-star
                          </v-icon>
                          
                          <span class="font-weight-bold" style="font-size: 32px; line-height: 1; letter-spacing: -1px;">{{ index + 1 }}</span>
                          <span class="text-caption font-weight-medium mt-1" :style="`opacity: ${display.isPrimary ? '0.9' : '0.5'}`">
                            {{ display.bounds.width }} x {{ display.bounds.height }}
                          </span>
                          
                          <div v-if="display.isPrimary" class="text-overline mt-1 font-weight-bold" style="line-height: 1; opacity: 0.9; font-size: 0.65rem; letter-spacing: 1px;">
                            PRINCIPAL
                          </div>
                        </div>
                        
                        <!-- Haste do Monitor -->
                        <div 
                          :style="`
                            width: 30px; 
                            height: 14px; 
                            background: ${display.isPrimary ? '#0077b6' : 'rgba(150,150,150,0.3)'}; 
                            opacity: ${display.isPrimary ? '0.9' : '0.6'};
                          `"
                        />
                        
                        <!-- Base do Monitor -->
                        <div 
                          class="rounded-pill"
                          :style="`
                            width: 80px; 
                            height: 6px; 
                            background: ${display.isPrimary ? '#0077b6' : 'rgba(150,150,150,0.3)'}; 
                            opacity: ${display.isPrimary ? '0.9' : '0.6'};
                          `"
                        />
                      </div>
                    </div>
                    
                    <div class="d-flex justify-center mt-2">
                      <v-btn
                        variant="flat"
                        color="primary"
                        class="text-none font-weight-bold rounded-lg px-6"
                        elevation="2"
                        @click="identifyMonitors"
                      >
                        <v-icon start>
                          mdi-magnify-scan
                        </v-icon>
                        Identificar Monitores
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-6">
                      <v-icon color="primary" class="mr-3" size="28">
                        mdi-presentation-play
                      </v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                          {{ t('music_slides') }}
                        </h3>
                      </div>
                    </div>
                    
                    <!-- MÚLTIPLAS TELAS -->
                    <div class="mb-8">
                      <div class="d-flex align-center mb-4">
                        <v-icon size="20" color="primary" class="mr-2">
                          mdi-monitor-multiple
                        </v-icon>
                        <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('multi_screens') }}</span>
                      </div>
                      
                      <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary);">
                        Projetar nas seguintes telas:
                      </div>
                      <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap mt-2" style="gap: 16px;">
                        <v-card
                          v-for="monitor in slideMonitorList"
                          :key="monitor.value"
                          flat
                          class="rounded-xl border cursor-pointer"
                          :class="slide_monitor.includes(monitor.value) ? 'elevation-2' : ''"
                          :style="slide_monitor.includes(monitor.value) ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important; transition: all 0.2s;' : 'background: var(--main-bg); border: 2px solid transparent !important; transition: all 0.2s; box-shadow: inset 0 0 0 1px var(--border-color);'"
                          width="160"
                          @click="toggleSlideMonitor(monitor.value)"
                        >
                          <div class="pa-4 d-flex flex-column align-center">
                            <v-icon :color="slide_monitor.includes(monitor.value) ? 'primary' : 'grey'" size="32" class="mb-2 transition-all">
                              {{ slide_monitor.includes(monitor.value) ? 'mdi-monitor-share' : 'mdi-monitor-off' }}
                            </v-icon>
                            <span class="text-body-2 font-weight-bold text-center transition-all" :style="slide_monitor.includes(monitor.value) ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                              {{ monitor.title }}
                            </span>
                          </div>
                        </v-card>
                      </div>
                      <v-alert
                        v-else
                        type="info"
                        variant="tonal"
                        density="compact"
                        class="mt-2 text-caption rounded-lg"
                      >
                        Nenhum monitor estendido (secundário) detectado no sistema.
                      </v-alert>

                      <div class="text-body-2 font-weight-medium mb-2 mt-6" style="color: var(--sidebar-text-secondary);">
                        {{ t('return_screen_select_monitor') }}
                      </div>
                      <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap mt-2" style="gap: 16px;">
                        <v-card
                          v-for="monitor in slideMonitorList"
                          :key="monitor.value"
                          flat
                          class="rounded-xl border cursor-pointer"
                          :class="return_screen_monitor === monitor.value ? 'elevation-2' : ''"
                          :style="return_screen_monitor === monitor.value ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important; transition: all 0.2s;' : 'background: var(--main-bg); border: 2px solid transparent !important; transition: all 0.2s; box-shadow: inset 0 0 0 1px var(--border-color);'"
                          width="160"
                          @click="toggleReturnScreenMonitor(monitor.value)"
                        >
                          <div class="pa-4 d-flex flex-column align-center">
                            <v-icon :color="return_screen_monitor === monitor.value ? 'primary' : 'grey'" size="32" class="mb-2 transition-all">
                              {{ return_screen_monitor === monitor.value ? 'mdi-monitor-eye' : 'mdi-monitor-off' }}
                            </v-icon>
                            <span class="text-body-2 font-weight-bold text-center transition-all" :style="return_screen_monitor === monitor.value ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                              {{ monitor.title }}
                            </span>
                          </div>
                        </v-card>
                      </div>
                      <v-alert
                        v-else
                        type="info"
                        variant="tonal"
                        density="compact"
                        class="mt-2 text-caption rounded-lg"
                      >
                        Nenhum monitor estendido (secundário) detectado no sistema.
                      </v-alert>
                    </div>

                    <v-divider class="mb-8" style="opacity: 0.1;" />

                    <!-- TELA ÚNICA / PRINCIPAL -->
                    <div class="mb-8">
                      <div class="d-flex align-center mb-4">
                        <v-icon size="20" color="primary" class="mr-2">
                          mdi-monitor
                        </v-icon>
                        <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('main_screen') }}</span>
                      </div>
                      
                      <v-switch
                        v-model="slide_fullscreen"
                        label="Abrir música em tela cheia na tela principal"
                        color="primary"
                        inset
                        hide-details
                        class="mb-2 font-weight-medium"
                      />
                      <v-switch
                        v-model="slide_disable_main_if_extended"
                        label="Desativar tela principal caso haja monitor estendido"
                        color="primary"
                        inset
                        hide-details
                        class="mb-2 font-weight-medium"
                      />
                      <v-switch
                        v-model="slide_minimize_player"
                        label="Minimizar o player automaticamente"
                        color="primary"
                        inset
                        hide-details
                        class="font-weight-medium"
                      />
                    </div>

                    <v-divider class="mb-8" style="opacity: 0.1;" />

                    <!-- TELA DE RETORNO -->
                    <div class="mb-8">
                      <div class="d-flex align-center mb-4">
                        <v-icon size="20" color="primary" class="mr-2">
                          mdi-monitor-eye
                        </v-icon>
                        <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('return_screen') }}</span>
                      </div>

                      <!-- Cor de fundo -->
                      <div class="mb-6">
                        <div class="d-flex align-center mb-3">
                          <v-icon size="18" color="primary" class="mr-2">
                            mdi-format-color-fill
                          </v-icon>
                          <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('return_screen_bg_color') }}</span>
                        </div>
                        <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                          <div
                            v-for="color in ['#000000', '#192A56', '#FFFFFF', '#2F3640', '#FEF9E7', '#2C3A47', '#6D214F', '#2C2C54']"
                            :key="color"
                            class="rounded-circle cursor-pointer elevation-1"
                            :class="return_screen_bg_color === color ? 'elevation-4' : ''"
                            :style="{
                              width: '36px', height: '36px',
                              background: color,
                              border: return_screen_bg_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.2s',
                              transform: return_screen_bg_color === color ? 'scale(1.15)' : 'scale(1)',
                            }"
                            @click="return_screen_bg_color = color"
                          />
                          <ModernColorPicker v-model="return_screen_bg_color">
                            <template #activator="{ props }">
                              <div
                                v-bind="props"
                                class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                                style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                              >
                                <v-icon size="16" color="grey">
                                  mdi-eyedropper
                                </v-icon>
                              </div>
                            </template>
                          </ModernColorPicker>
                        </div>
                      </div>

                      <!-- Cor da fonte -->
                      <div>
                        <div class="d-flex align-center mb-3">
                          <v-icon size="18" color="primary" class="mr-2">
                            mdi-palette
                          </v-icon>
                          <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('return_screen_font_color') }}</span>
                        </div>
                        <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                          <div
                            v-for="color in ['#FFFFFF', '#f6c32a', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']"
                            :key="color"
                            class="rounded-circle cursor-pointer elevation-1"
                            :class="return_screen_font_color === color ? 'elevation-4' : ''"
                            :style="{
                              width: '36px', height: '36px',
                              background: color,
                              border: return_screen_font_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                              transition: 'all 0.2s',
                              transform: return_screen_font_color === color ? 'scale(1.15)' : 'scale(1)',
                            }"
                            @click="return_screen_font_color = color"
                          />
                          <ModernColorPicker v-model="return_screen_font_color">
                            <template #activator="{ props }">
                              <div
                                v-bind="props"
                                class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                                style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                              >
                                <v-icon size="16" color="grey">
                                  mdi-eyedropper
                                </v-icon>
                              </div>
                            </template>
                          </ModernColorPicker>
                        </div>
                      </div>
                    </div>

                    <v-divider class="mb-8" style="opacity: 0.1;" />

                    <!-- PERSONALIZAÇÃO -->
                    <div>
                      <div class="d-flex align-center mb-4">
                        <v-icon size="20" color="primary" class="mr-2">
                          mdi-palette-outline
                        </v-icon>
                        <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_customization') }}</span>
                      </div>

                      <div class="mb-6">
                        <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary);">
                          {{ t('font_align') }}
                        </div>
                        <v-btn-toggle
                          v-model="slide_align"
                          color="primary"
                          variant="tonal"
                          mandatory
                          class="rounded-xl d-flex"
                          style="height: 48px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
                        >
                          <v-btn value="Cima" class="flex-grow-1 text-none font-weight-bold">
                            <v-icon start size="20">
                              mdi-align-vertical-top
                            </v-icon> Cima
                          </v-btn>
                          <v-btn value="Centro" class="flex-grow-1 text-none font-weight-bold">
                            <v-icon start size="20">
                              mdi-align-vertical-center
                            </v-icon> Centro
                          </v-btn>
                          <v-btn value="Baixo" class="flex-grow-1 text-none font-weight-bold">
                            <v-icon start size="20">
                              mdi-align-vertical-bottom
                            </v-icon> Baixo
                          </v-btn>
                        </v-btn-toggle>
                      </div>
                      
                      <v-switch
                        v-model="slide_show_title"
                        label="Exibir título da música no primeiro slide"
                        color="primary"
                        inset
                        hide-details
                        class="mb-4 font-weight-medium"
                      />

                      <!-- FORMATAÇÃO DE TEXTO PERSONALIZADA -->
                      <div class="mb-4">
                        <v-switch
                          v-model="slide_custom_text_format"
                          label="Formatação de texto personalizada"
                          color="primary"
                          inset
                          hide-details
                          class="font-weight-medium"
                        />
                        <v-expand-transition>
                          <div v-if="slide_custom_text_format" class="mt-4 pa-5 rounded-xl" style="background: var(--main-bg); border: 1px solid var(--border-color);">
                            <!-- Tamanho do texto -->
                            <div class="mb-6">
                              <div class="d-flex align-center justify-space-between mb-3">
                                <div class="d-flex align-center">
                                  <v-icon size="18" color="primary" class="mr-2">
                                    mdi-format-size
                                  </v-icon>
                                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_size') }}</span>
                                </div>
                                <v-chip
                                  size="small"
                                  variant="tonal"
                                  color="primary"
                                  class="font-weight-bold"
                                >
                                  {{ slide_font_size }}%
                                </v-chip>
                              </div>
                              <div class="d-flex align-center" style="gap: 12px;">
                                <v-btn
                                  icon
                                  size="small"
                                  variant="tonal"
                                  color="primary"
                                  @click="slide_font_size = Math.max(50, slide_font_size - 5)"
                                >
                                  <v-icon size="18">
                                    mdi-minus
                                  </v-icon>
                                </v-btn>
                                <v-slider
                                  v-model="slide_font_size"
                                  :min="50"
                                  :max="200"
                                  :step="5"
                                  color="primary"
                                  track-color="grey-lighten-3"
                                  hide-details
                                  class="flex-grow-1"
                                />
                                <v-btn
                                  icon
                                  size="small"
                                  variant="tonal"
                                  color="primary"
                                  @click="slide_font_size = Math.min(200, slide_font_size + 5)"
                                >
                                  <v-icon size="18">
                                    mdi-plus
                                  </v-icon>
                                </v-btn>
                              </div>
                            </div>

                            <!-- Cor do texto -->
                            <div class="mb-6">
                              <div class="d-flex align-center mb-3">
                                <v-icon size="18" color="primary" class="mr-2">
                                  mdi-palette
                                </v-icon>
                                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_color') }}</span>
                              </div>
                              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                                <div
                                  v-for="color in ['#FFFFFF', '#f6c32a', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']"
                                  :key="color"
                                  class="rounded-circle cursor-pointer elevation-1"
                                  :class="slide_font_color === color ? 'elevation-4' : ''"
                                  :style="{
                                    width: '36px', height: '36px',
                                    background: color,
                                    border: slide_font_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s',
                                    transform: slide_font_color === color ? 'scale(1.15)' : 'scale(1)',
                                  }"
                                  @click="slide_font_color = color"
                                />
                                <ModernColorPicker v-model="slide_font_color">
                                  <template #activator="{ props }">
                                    <div
                                      v-bind="props"
                                      class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                                      style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                                    >
                                      <v-icon size="16" color="grey">
                                        mdi-eyedropper
                                      </v-icon>
                                    </div>
                                  </template>
                                </ModernColorPicker>
                              </div>
                            </div>

                            <!-- Peso da fonte -->
                            <div>
                              <div class="d-flex align-center mb-3">
                                <v-icon size="18" color="primary" class="mr-2">
                                  mdi-format-bold
                                </v-icon>
                                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_weight') }}</span>
                              </div>
                              <v-btn-toggle
                                v-model="slide_font_weight"
                                color="primary"
                                variant="tonal"
                                mandatory
                                class="rounded-xl d-flex"
                                style="height: 42px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
                              >
                                <v-btn value="400" class="flex-grow-1 text-none" style="font-weight: 400;">
                                  {{ t('weight_normal') }}
                                </v-btn>
                                <v-btn value="600" class="flex-grow-1 text-none" style="font-weight: 600;">
                                  {{ t('weight_semi') }}
                                </v-btn>
                                <v-btn value="700" class="flex-grow-1 text-none" style="font-weight: 700;">
                                  {{ t('weight_bold') }}
                                </v-btn>
                                <v-btn value="900" class="flex-grow-1 text-none" style="font-weight: 900;">
                                  {{ t('weight_extra') }}
                                </v-btn>
                              </v-btn-toggle>
                            </div>
                          </div>
                        </v-expand-transition>
                      </div>

                      <!-- FUNDO PERSONALIZADO -->
                      <div>
                        <v-switch
                          v-model="slide_custom_bg"
                          label="Fundo personalizado"
                          color="primary"
                          inset
                          hide-details
                          class="font-weight-medium"
                        />
                        <v-expand-transition>
                          <div v-if="slide_custom_bg" class="mt-4 pa-5 rounded-xl" style="background: var(--main-bg); border: 1px solid var(--border-color);">
                            <!-- Cor de fundo -->
                            <div class="mb-6">
                              <div class="d-flex align-center mb-3">
                                <v-icon size="18" color="primary" class="mr-2">
                                  mdi-format-color-fill
                                </v-icon>
                                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_color') }}</span>
                              </div>
                              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                                <div
                                  v-for="color in ['#000000', '#192A56', '#FFFFFF', '#2F3640', '#FEF9E7', '#2C3A47', '#6D214F', '#2C2C54']"
                                  :key="color"
                                  class="rounded-circle cursor-pointer elevation-1"
                                  :class="slide_bg_color === color ? 'elevation-4' : ''"
                                  :style="{
                                    width: '36px', height: '36px',
                                    background: color,
                                    border: slide_bg_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s',
                                    transform: slide_bg_color === color ? 'scale(1.15)' : 'scale(1)',
                                  }"
                                  @click="slide_bg_color = color"
                                />
                                <ModernColorPicker v-model="slide_bg_color">
                                  <template #activator="{ props }">
                                    <div
                                      v-bind="props"
                                      class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                                      style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                                    >
                                      <v-icon size="16" color="grey">
                                        mdi-eyedropper
                                      </v-icon>
                                    </div>
                                  </template>
                                </ModernColorPicker>
                              </div>
                            </div>

                            <!-- Imagem de fundo -->
                            <div class="mb-6">
                              <div class="d-flex align-center mb-3">
                                <v-icon size="18" color="primary" class="mr-2">
                                  mdi-image-outline
                                </v-icon>
                                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_image') }}</span>
                              </div>
                              
                              <div v-if="slide_bg_image" class="position-relative rounded-xl overflow-hidden mb-3" style="height: 140px; border: 1px solid var(--border-color);">
                                <img :src="slide_bg_image" class="w-100 h-100" style="object-fit: cover;" />
                                <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0; background: rgba(0,0,0,0.3);">
                                  <v-btn
                                    icon
                                    size="small"
                                    variant="flat"
                                    color="error"
                                    class="mr-2"
                                    @click="slide_bg_image = null"
                                  >
                                    <v-icon>mdi-delete</v-icon>
                                    <v-tooltip activator="parent" location="top">
                                      {{ t('remove_image') }}
                                    </v-tooltip>
                                  </v-btn>
                                  <v-btn
                                    icon
                                    size="small"
                                    variant="flat"
                                    color="white"
                                    @click="$refs.bgImageInput.click()"
                                  >
                                    <v-icon color="black">
                                      mdi-pencil
                                    </v-icon>
                                    <v-tooltip activator="parent" location="top">
                                      {{ t('change_image') }}
                                    </v-tooltip>
                                  </v-btn>
                                </div>
                              </div>

                              <div
                                v-else
                                class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer"
                                style="height: 100px; border: 2px dashed var(--border-color); background: var(--card-bg); transition: all 0.2s;"
                                @click="$refs.bgImageInput.click()"
                              >
                                <v-icon size="32" color="grey-lighten-1" class="mb-2">
                                  mdi-cloud-upload-outline
                                </v-icon>
                                <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">{{ t('select_image') }}</span>
                              </div>

                              <input
                                ref="bgImageInput"
                                type="file"
                                accept="image/*"
                                style="display: none;"
                                @change="onBgImageSelect"
                              />
                            </div>

                            <!-- Opacidade do fundo -->
                            <div>
                              <div class="d-flex align-center justify-space-between mb-3">
                                <div class="d-flex align-center">
                                  <v-icon size="18" color="primary" class="mr-2">
                                    mdi-opacity
                                  </v-icon>
                                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_opacity') }}</span>
                                </div>
                                <v-chip
                                  size="small"
                                  variant="tonal"
                                  color="primary"
                                  class="font-weight-bold"
                                >
                                  {{ slide_bg_opacity }}%
                                </v-chip>
                              </div>
                              <v-slider
                                v-model="slide_bg_opacity"
                                :min="0"
                                :max="100"
                                :step="5"
                                color="primary"
                                track-color="grey-lighten-3"
                                hide-details
                              />
                            </div>
                          </div>
                        </v-expand-transition>
                      </div>
                    </div>
                    
                    <v-divider class="mb-8 mt-8" style="opacity: 0.1;" />
                      
                    <div class="d-flex justify-center mt-2">
                      <v-btn
                        variant="tonal"
                        color="primary"
                        class="text-none font-weight-bold rounded-lg px-6"
                        @click="resetSlideConfigs"
                      >
                        <v-icon start>
                          mdi-restore
                        </v-icon>
                        {{ t('restore_defaults') }}
                      </v-btn>
                    </div>
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
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import $media from "@/helpers/Media";

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
    ModernColorPicker,
  },
  data: () => ({
    tab: 1,
    language: "pt",
    show_home_history: true,
    hardware_accel: true,
    fullscreen_mode: false,
    
    fade_effect: false,
    bg_color: "#000000",
    bg_image: null,
    bg_align: "Centro",
    
    player_monitor: "Monitor 1",
    exec_audio_player: false,
    exec_video_player: false,
    player_fullscreen: true,
    online_monitor: "Monitor 1",
    online_fullscreen: true,
    youtube_mode: "Vídeo",
    
    media_use_internal_player: false,
    media_sync_projection_settings: true,
    media_auto_project_video: true,
    media_pause_on_minimize: false,
    media_slide_monitor: [],
    media_slide_fullscreen: true,
    media_slide_disable_main_if_extended: true,
    media_slide_minimize_player: false,
    
    slide_monitor: [],
    slide_align: "Centro",
    slide_fullscreen: true,
    slide_disable_main_if_extended: true,
    slide_minimize_player: false,
    slide_show_title: true,
    slide_custom_text_format: false,
    slide_custom_bg: false,
    slide_font_size: 100,
    slide_font_color: "#FFFFFF",
    slide_font_weight: "700",
    slide_bg_color: "#000000",
    slide_bg_image: null,
    slide_bg_opacity: 100,

    return_screen_monitor: null,
    return_screen_bg_color: "#000000",
    return_screen_font_color: "#FFFFFF",

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
          { title: "Monitor 1 (Principal)", value: "Monitor 1" },
          { title: "Monitor 2", value: "Monitor 2" },
        ];
      }
      return this.rawDisplays.map((d, index) => ({
        title: `Monitor ${index + 1} ${d.isPrimary ? "(Principal)" : "(Estendido)"}`,
        value: d.id,
        isPrimary: d.isPrimary,
      }));
    },
    slideMonitorList() {
      return this.monitorList.filter(m => !m.isPrimary);
    },
    languagesList() {
      return [
        { code: "pt", name: "Português" },
        { code: "en", name: "English" },
        { code: "es", name: "Español" },
      ];
    },
    languageName() {
      const found = this.languagesList.find(l => l.code === this.language);
      return found ? found.name : "Português";
    },
  },
  watch: {
    language(val) {
      if (val) {
        this.$userdata.set("language", val);
        this.$i18n.locale = val;
      }
    },
    show_home_history(val) {
      this.$userdata.set("show_home_history", val);
    },
    media_use_internal_player(val) {
      this.$userdata.set("modules.config.media_use_internal_player", val);
    },
    media_sync_projection_settings(val) {
      this.$userdata.set("modules.config.media_sync_projection_settings", val);
      this.syncExternalMediaMonitors();
    },
    media_auto_project_video(val) {
      this.$userdata.set("modules.config.media_auto_project_video", val);
    },
    media_pause_on_minimize(val) {
      this.$userdata.set("modules.config.media_pause_on_minimize", val);
    },
    media_slide_monitor(val) {
      if (val !== undefined && val !== null) {
        this.$userdata.set("modules.config.media_slide_monitor", val);
        this.syncExternalMediaMonitors();
      }
    },
    media_slide_fullscreen(val) {
      this.$userdata.set("modules.config.media_slide_fullscreen", val);
    },
    media_slide_disable_main_if_extended(val) {
      this.$userdata.set("modules.config.media_slide_disable_main_if_extended", val);
    },
    media_slide_minimize_player(val) {
      this.$userdata.set("modules.config.media_slide_minimize_player", val);
    },
    slide_monitor(val) {
      if (val !== undefined && val !== null) {
        this.$userdata.set("modules.config.slide_monitor", val);
        $media.syncMonitors();
        this.syncExternalMediaMonitors();
      }
    },
    return_screen_monitor(val) {
      this.$userdata.set("modules.config.return_screen_monitor", val);
      $media.syncReturnMonitor();
    },
    return_screen_bg_color(val) {
      this.$userdata.set("modules.config.return_screen_bg_color", val);
    },
    return_screen_font_color(val) {
      this.$userdata.set("modules.config.return_screen_font_color", val);
    },
    slide_align(val) {
      if (val !== undefined && val !== null) {
        this.$userdata.set("modules.config.slide_align", val);
      }
    },
    slide_fullscreen(val) {
      this.$userdata.set("modules.config.slide_fullscreen", val);
    },
    slide_disable_main_if_extended(val) {
      this.$userdata.set("modules.config.slide_disable_main_if_extended", val);
    },
    slide_minimize_player(val) {
      this.$userdata.set("modules.config.slide_minimize_player", val);
    },
    slide_show_title(val) {
      this.$userdata.set("modules.config.slide_show_title", val);
    },
    slide_custom_text_format(val) { this.$userdata.set("modules.config.slide_custom_text_format", val); },
    slide_font_size(val) { this.$userdata.set("modules.config.slide_font_size", val); },
    slide_font_color(val) { this.$userdata.set("modules.config.slide_font_color", val); },
    slide_font_weight(val) { this.$userdata.set("modules.config.slide_font_weight", val); },
    slide_custom_bg(val) { this.$userdata.set("modules.config.slide_custom_bg", val); },
    slide_bg_color(val) { this.$userdata.set("modules.config.slide_bg_color", val); },
    slide_bg_image(val) { this.$userdata.set("modules.config.slide_bg_image", val); },
    slide_bg_opacity(val) { this.$userdata.set("modules.config.slide_bg_opacity", val); },
    slideMonitorList: {
      handler(newList) {
        if (newList.length > 0 && this.rawDisplays.length > 0) {
          const unselected = this.$userdata.get("modules.config.unselected_slide_monitors") || [];
          let changed = false;
          const currentMonitors = [...this.slide_monitor];
          
          newList.forEach(m => {
            if (!currentMonitors.includes(m.value) && !unselected.includes(m.value)) {
              currentMonitors.push(m.value);
              changed = true;
            }
          });
          
          if (changed) {
            this.slide_monitor = currentMonitors;
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if(this.$userdata.get("language")){
      this.language = this.$userdata.get("language");
    }

    if(this.$userdata.get("theme")){
      this.$vuetify.theme.global.name = this.$userdata.get("theme");
    }
    
    const saved_home_history = this.$userdata.get("show_home_history");
    if (saved_home_history !== undefined && saved_home_history !== null) {
      this.$data.show_home_history = saved_home_history;
    }

    let savedSlideMonitor = this.$userdata.get("modules.config.slide_monitor");
    if (savedSlideMonitor) {
      if (!Array.isArray(savedSlideMonitor)) {
        savedSlideMonitor = [savedSlideMonitor];
      }
      this.slide_monitor = savedSlideMonitor;
    }
    
    const savedSlideAlign = this.$userdata.get("modules.config.slide_align");
    if (savedSlideAlign) {
      this.slide_align = savedSlideAlign;
    }

    if (this.$userdata.get("modules.config.slide_fullscreen") != null) {
      this.slide_fullscreen = this.$userdata.get("modules.config.slide_fullscreen");
    }
    if (this.$userdata.get("modules.config.slide_disable_main_if_extended") != null) {
      this.slide_disable_main_if_extended = this.$userdata.get("modules.config.slide_disable_main_if_extended");
    }
    if (this.$userdata.get("modules.config.slide_minimize_player") != null) {
      this.slide_minimize_player = this.$userdata.get("modules.config.slide_minimize_player");
    }
    if (this.$userdata.get("modules.config.slide_show_title") != null) {
      this.slide_show_title = this.$userdata.get("modules.config.slide_show_title");
    }
    
    const fields = [
      "media_use_internal_player", "media_sync_projection_settings", "media_auto_project_video", "media_pause_on_minimize",
      "media_slide_monitor", "media_slide_fullscreen", "media_slide_disable_main_if_extended", "media_slide_minimize_player",
      "slide_custom_text_format", "slide_font_size", "slide_font_color", "slide_font_weight",
      "slide_custom_bg", "slide_bg_color", "slide_bg_image", "slide_bg_opacity",
      "return_screen_monitor", "return_screen_bg_color", "return_screen_font_color",
    ];
    fields.forEach(field => {
      const val = this.$userdata.get(`modules.config.${field}`);
      if (val !== undefined && val !== null) {
        this[field] = val;
      }
    });
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    async syncExternalMediaMonitors() {
      const isExternalMediaActive = this.$appdata.get("modules.external_media.filePath") != null;
      if (!isExternalMediaActive) return;

      const syncSettings = this.$userdata.get("modules.config.media_sync_projection_settings") !== false;
      let selectedMonitors = syncSettings
        ? this.$userdata.get("modules.config.slide_monitor") || []
        : this.$userdata.get("modules.config.media_slide_monitor") || [];
        
      if (!Array.isArray(selectedMonitors)) {
        selectedMonitors = selectedMonitors ? [selectedMonitors] : [];
      }
      
      if (window.electronAPI && window.electronAPI.getDisplays) {
        const displays = await window.electronAPI.getDisplays();
        if (displays && displays.length > 1) {
          const primary = displays.find(d => d.isPrimary) || displays[0];
          selectedMonitors = selectedMonitors.filter(m => m !== primary.id);
          
          const { default: $popup } = await import("@/helpers/Popup");
          await $popup.syncMonitors(selectedMonitors, "external_media", isExternalMediaActive);
        }
      }
    },
    identifyMonitors() {
      if (window.electronAPI && window.electronAPI.identifyDisplays) {
        window.electronAPI.identifyDisplays();
      }
    },
    toggleSlideMonitor(val) {
      let unselected = this.$userdata.get("modules.config.unselected_slide_monitors") || [];
      if (this.slide_monitor.includes(val)) {
        this.slide_monitor = this.slide_monitor.filter(m => m !== val);
        if (!unselected.includes(val)) unselected.push(val);
      } else {
        this.slide_monitor = [...this.slide_monitor, val];
        unselected = unselected.filter(m => m !== val);
      }
      this.$userdata.set("modules.config.unselected_slide_monitors", unselected);
    },
    toggleReturnScreenMonitor(val) {
      this.return_screen_monitor = this.return_screen_monitor === val ? null : val;
    },
    toggleMediaSlideMonitor(val) {
      if (this.media_slide_monitor.includes(val)) {
        this.media_slide_monitor = this.media_slide_monitor.filter(m => m !== val);
      } else {
        this.media_slide_monitor = [...this.media_slide_monitor, val];
      }
    },
    onBgImageSelect(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.slide_bg_image = e.target.result;
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    resetSlideConfigs() {
      this.slide_monitor = [];
      this.slide_align = "Centro";
      this.slide_fullscreen = true;
      this.slide_disable_main_if_extended = true;
      this.slide_minimize_player = false;
      this.slide_show_title = true;
      this.slide_custom_text_format = false;
      this.slide_font_size = 100;
      this.slide_font_color = "#FFFFFF";
      this.slide_font_weight = "700";
      this.slide_custom_bg = false;
      this.slide_bg_color = "#000000";
      this.slide_bg_image = null;
      this.slide_bg_opacity = 100;
    },
    resetMediaConfigs() {
      this.media_use_internal_player = false;
      this.media_sync_projection_settings = true;
      this.media_auto_project_video = true;
      this.media_pause_on_minimize = false;
      this.media_slide_monitor = [];
      this.media_slide_fullscreen = true;
      this.media_slide_disable_main_if_extended = true;
      this.media_slide_minimize_player = false;
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
      this.$alert.yesno(
        { text: "Tem certeza que deseja resetar o histórico de coletâneas e músicas mais tocadas?", translate: false },
        (resp) => {
          if (resp === "yes") {
            this.$history.clearAll();
            this.$alert.info({ text: "Histórico resetado com sucesso! Atualize a página inicial para ver as mudanças.", translate: false });
          }
        },
      );
    },
    async clearAllData() {
      this.$alert.yesno(
        { text: "ATENÇÃO: Você tem certeza que deseja apagar todos os bancos de dados, capas, músicas e mídias baixadas do aplicativo?<br><br>Isso exigirá um novo download de todos os arquivos essenciais e irá reiniciar o programa.", translate: false },
        async (resp) => {
          if (resp === "yes") {
            if (window.electronAPI) {
              const success = await window.electronAPI.clearAllData();
              if (success) {
                window.localStorage.clear();
                window.sessionStorage.clear();
                this.$alert.info({ text: "Todos os arquivos e configurações locais foram removidos com sucesso. O aplicativo será recarregado agora.", translate: false }, () => {
                  window.location.reload();
                });
              } else {
                this.$alert.error({ text: "Ocorreu um erro ao tentar limpar os dados.", translate: false });
              }
            } else {
              this.$alert.error({ text: "Apenas disponível na versão desktop.", translate: false });
            }
          }
        },
      );
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
