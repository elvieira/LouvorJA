<template>
  <v-slide-y-reverse-transition>
    <div v-if="internalValue" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <v-card
        class="timer-config-modal rounded-xl"
        width="100%"
        max-width="520"
        style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; max-height: 90%;"
      >
        <!-- Header -->
        <div class="pa-6 pb-2 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon color="primary" size="32" class="mr-3">
                mdi-palette-outline
              </v-icon>
              <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                {{ t('proj_customization') }}
              </h2>
            </div>
          </div>
          <p class="text-caption mb-2" style="color: var(--sidebar-text-secondary);">
            Ajuste o visual e funcionamento do cronômetro na tela
          </p>

          <!-- Tabs de Navegação: Geral vs Modo Culto -->
          <v-tabs
            v-model="activeTab"
            color="primary"
            density="compact"
            class="mt-2"
            style="border-bottom: 1px solid rgba(0,0,0,0.06);"
          >
            <v-tab value="general" class="text-none font-weight-bold">
              <v-icon start size="18">
                mdi-timer-outline
              </v-icon>
              Padrão
            </v-tab>
            <v-tab value="cult" class="text-none font-weight-bold">
              <v-icon start size="18">
                mdi-progress-clock
              </v-icon>
              {{ t('mode_cult') }}
            </v-tab>
          </v-tabs>
        </div>

        <!-- Preview Box -->
        <div class="pa-4 flex-shrink-0" style="background: var(--main-bg, #f5f5f5); border-bottom: 1px solid rgba(0,0,0,0.05);">
          <!-- Preview Padrão -->
          <div
            v-if="activeTab === 'general'"
            class="d-flex flex-column align-center justify-center overflow-hidden rounded-lg mx-auto position-relative"
            :style="{
              backgroundColor: localConfig.bgColor,
              backgroundImage: localConfig.bgImage ? `url('${localConfig.bgImage}')` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              color: localConfig.fontColor,
              aspectRatio: '16/9',
              maxHeight: '170px',
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }"
          >
            <div :style="{ fontSize: '64px', fontWeight: '900', lineHeight: '1', textShadow: localConfig.bgImage ? '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)' : 'none' }">
              05:00
            </div>
          </div>

          <!-- Preview Modo Culto -->
          <div
            v-else
            class="d-flex flex-column align-center justify-center overflow-hidden rounded-lg mx-auto position-relative"
            :style="{
              backgroundColor: localConfig.cultBgColor || localConfig.bgColor,
              backgroundImage: (localConfig.cultBgImage || localConfig.bgImage) ? `url('${localConfig.cultBgImage || localConfig.bgImage}')` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              aspectRatio: '16/9',
              maxHeight: '170px',
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              padding: '12px'
            }"
          >
            <!-- Hora Atual Superior -->
            <div
              class="font-weight-bold mb-1"
              :style="{
                color: localConfig.cultClockColor || '#ffffff',
                fontSize: '28px',
                lineHeight: '1'
              }"
            >
              10:45:00
            </div>

            <!-- Tempo Restante Inferior -->
            <div
              class="font-weight-black"
              :style="{
                color: previewAlert ? (localConfig.cultWarningColor || '#ef4444') : (localConfig.cultTimerColor || '#38bdf8'),
                fontSize: '44px',
                lineHeight: '1'
              }"
            >
              {{ previewAlert ? '-00:02:15' : '00:15:00' }}
            </div>

            <!-- Botão de simular tempo estourado no preview -->
            <v-btn
              size="x-small"
              variant="tonal"
              :color="previewAlert ? 'error' : 'primary'"
              class="position-absolute bottom-0 right-0 ma-2 text-none"
              style="font-size: 0.65rem; height: 20px; z-index: 2;"
              @click="previewAlert = !previewAlert"
            >
              {{ previewAlert ? 'Ver Normal' : 'Ver Esgotado' }}
            </v-btn>

            <!-- Mini Barra Inferior (Gauge) -->
            <div
              class="position-absolute bottom-0 left-0 w-100"
              style="height: 4px; background: rgba(255,255,255,0.15);"
            >
              <div
                :style="{
                  width: previewAlert ? '100%' : '65%',
                  height: '100%',
                  background: previewAlert ? (localConfig.cultWarningColor || '#ef4444') : (localConfig.cultTimerColor || '#38bdf8'),
                  transition: 'all 0.3s ease'
                }"
              />
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 0; overflow-y: auto;">
          <!-- CONFIGURAÇÕES: ABA PADRÃO (GERAL) -->
          <template v-if="activeTab === 'general'">
            <!-- Fundo da Projeção -->
            <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-format-color-fill
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_bg_color') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        Cor base de fundo da tela de exibição
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                  <div
                    v-for="color in ['#000000', '#1A1A1A', '#FFFFFF', '#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2']"
                    :key="color"
                    class="rounded-circle cursor-pointer elevation-1"
                    :class="localConfig.bgColor === color ? 'elevation-4' : ''"
                    :style="{
                      width: '36px', height: '36px',
                      background: color,
                      border: localConfig.bgColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      transform: localConfig.bgColor === color ? 'scale(1.15)' : 'scale(1)',
                    }"
                    @click="localConfig.bgColor = color"
                  />
                  <ModernColorPicker v-model="localConfig.bgColor">
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

                <v-divider class="my-4" style="opacity: 0.1;" />

                <!-- Imagem de fundo Padrão -->
                <div class="mb-2">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-image-outline
                      </v-icon>
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Imagem de Fundo</span>
                    </div>
                  </div>

                  <div
                    v-if="localConfig.bgImage"
                    class="position-relative rounded-xl overflow-hidden mb-2"
                    style="height: 120px; border: 1px solid var(--border-color); border-radius: 16px !important;"
                  >
                    <img :src="localConfig.bgImage" class="w-100 h-100" style="object-fit: cover;" />
                    <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0; background: rgba(0,0,0,0.35);">
                      <v-btn
                        icon
                        size="small"
                        variant="flat"
                        color="error"
                        class="mr-2"
                        @click="localConfig.bgImage = null"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="top">
                          Remover imagem
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="flat"
                        color="white"
                        @click="($refs.bgImageInput as any).click()"
                      >
                        <v-icon color="black">
                          mdi-pencil
                        </v-icon>
                        <v-tooltip activator="parent" location="top">
                          Trocar imagem
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </div>

                  <div
                    v-else
                    class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer"
                    style="height: 90px; border: 2px dashed var(--border-color); background: var(--card-bg); transition: all 0.2s; border-radius: 16px !important;"
                    @click="($refs.bgImageInput as any).click()"
                  >
                    <v-icon size="28" color="grey-lighten-1" class="mb-1">
                      mdi-cloud-upload-outline
                    </v-icon>
                    <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">Selecionar Imagem</span>
                  </div>

                  <input
                    ref="bgImageInput"
                    type="file"
                    accept="image/*"
                    style="display: none;"
                    @change="onBgImageSelect"
                  />
                </div>
              </v-card-text>
            </v-card>

            <!-- Cor do Texto -->
            <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-format-color-text
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_font_color') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        Cor dos números do cronômetro
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex flex-wrap align-center mb-2" style="gap: 10px;">
                  <div
                    v-for="color in ['#FFFFFF', '#000000', '#f6c32a', '#FF6B6B', '#4ECDC4', '#96CEB4', '#FFEAA7', '#0097d7']"
                    :key="color"
                    class="rounded-circle cursor-pointer elevation-1"
                    :class="localConfig.fontColor === color ? 'elevation-4' : ''"
                    :style="{
                      width: '36px', height: '36px',
                      background: color,
                      border: localConfig.fontColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      transform: localConfig.fontColor === color ? 'scale(1.15)' : 'scale(1)',
                    }"
                    @click="localConfig.fontColor = color"
                  />
                  <ModernColorPicker v-model="localConfig.fontColor">
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
              </v-card-text>
            </v-card>

            <!-- Alertas -->
            <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3" size="24">
                    mdi-bell-outline
                  </v-icon>
                  <div>
                    <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                      Alertas
                    </h3>
                  </div>
                </div>

                <v-list class="bg-transparent pa-0">
                  <v-list-item class="px-0 py-1">
                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ t('settings_visual_alert') }}
                    </v-list-item-title>
                    <template #append>
                      <v-switch
                        v-model="localConfig.visualAlert"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>
                  
                  <v-list-item class="px-0 py-1">
                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ t('settings_audio_alert') }}
                    </v-list-item-title>
                    <template #append>
                      <div class="d-flex align-center" style="gap: 8px;">
                        <v-btn
                          v-if="localConfig.audioAlert"
                          icon
                          size="x-small"
                          variant="tonal"
                          color="primary"
                          class="mr-1"
                          @click="testSound"
                        >
                          <v-icon size="18">
                            mdi-volume-high
                          </v-icon>
                          <v-tooltip activator="parent" location="top">
                            Testar Som
                          </v-tooltip>
                        </v-btn>
                        <v-switch
                          v-model="localConfig.audioAlert"
                          color="primary"
                          hide-details
                          inset
                          density="compact"
                        />
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </template>

          <!-- CONFIGURAÇÕES: ABA CRONÔMETRO DE CULTO -->
          <template v-else>
            <!-- Fundo Culto -->
            <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-format-color-fill
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_bg_color') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        Cor base de fundo no modo culto
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                  <div
                    v-for="color in ['#000000', '#1A1A1A', '#0F172A', '#1E1B4B', '#14532D', '#7F1D1D', '#701A75', '#FFFFFF']"
                    :key="color"
                    class="rounded-circle cursor-pointer elevation-1"
                    :class="localConfig.cultBgColor === color ? 'elevation-4' : ''"
                    :style="{
                      width: '36px', height: '36px',
                      background: color,
                      border: localConfig.cultBgColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      transform: localConfig.cultBgColor === color ? 'scale(1.15)' : 'scale(1)',
                    }"
                    @click="localConfig.cultBgColor = color"
                  />
                  <ModernColorPicker v-model="localConfig.cultBgColor">
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

                <v-divider class="my-4" style="opacity: 0.1;" />

                <!-- Imagem de fundo Modo Culto -->
                <div class="mb-2">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-image-outline
                      </v-icon>
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Imagem de Fundo (Modo Culto)</span>
                    </div>
                  </div>

                  <div
                    v-if="localConfig.cultBgImage"
                    class="position-relative rounded-xl overflow-hidden mb-2"
                    style="height: 120px; border: 1px solid var(--border-color); border-radius: 16px !important;"
                  >
                    <img :src="localConfig.cultBgImage" class="w-100 h-100" style="object-fit: cover;" />
                    <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0; background: rgba(0,0,0,0.35);">
                      <v-btn
                        icon
                        size="small"
                        variant="flat"
                        color="error"
                        class="mr-2"
                        @click="localConfig.cultBgImage = null"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="top">
                          Remover imagem
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="flat"
                        color="white"
                        @click="($refs.cultBgImageInput as any).click()"
                      >
                        <v-icon color="black">
                          mdi-pencil
                        </v-icon>
                        <v-tooltip activator="parent" location="top">
                          Trocar imagem
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </div>

                  <div
                    v-else
                    class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer"
                    style="height: 90px; border: 2px dashed var(--border-color); background: var(--card-bg); transition: all 0.2s; border-radius: 16px !important;"
                    @click="($refs.cultBgImageInput as any).click()"
                  >
                    <v-icon size="28" color="grey-lighten-1" class="mb-1">
                      mdi-cloud-upload-outline
                    </v-icon>
                    <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">Selecionar Imagem para o Modo Culto</span>
                  </div>

                  <input
                    ref="cultBgImageInput"
                    type="file"
                    accept="image/*"
                    style="display: none;"
                    @change="onCultBgImageSelect"
                  />
                </div>
              </v-card-text>
            </v-card>

            <!-- Cores do Culto (Hora, Tempo Restante, Alerta) -->
            <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3" size="24">
                    mdi-palette
                  </v-icon>
                  <div>
                    <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                      Cores dos Mostradores
                    </h3>
                  </div>
                </div>

                <!-- Cor da Hora Atual -->
                <div class="mb-4">
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    {{ t('settings_cult_clock_color') }} (Relógio Superior)
                  </div>
                  <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                    <div
                      v-for="color in ['#FFFFFF', '#E2E8F0', '#94A3B8', '#FDE047', '#38BDF8', '#4ADE80', '#000000']"
                      :key="color"
                      class="rounded-circle cursor-pointer elevation-1"
                      :style="{
                        width: '32px', height: '32px',
                        background: color,
                        border: localConfig.cultClockColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                        transform: localConfig.cultClockColor === color ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }"
                      @click="localConfig.cultClockColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.cultClockColor">
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                          style="width: 32px; height: 32px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                        >
                          <v-icon size="14" color="grey">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>
                </div>

                <!-- Cor do Tempo Restante -->
                <div class="mb-4">
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    {{ t('settings_cult_timer_color') }} (Contagem Normal)
                  </div>
                  <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                    <div
                      v-for="color in ['#38BDF8', '#FFFFFF', '#4ADE80', '#FBBF24', '#A78BFA', '#F472B6', '#000000']"
                      :key="color"
                      class="rounded-circle cursor-pointer elevation-1"
                      :style="{
                        width: '32px', height: '32px',
                        background: color,
                        border: localConfig.cultTimerColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                        transform: localConfig.cultTimerColor === color ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }"
                      @click="localConfig.cultTimerColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.cultTimerColor">
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                          style="width: 32px; height: 32px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                        >
                          <v-icon size="14" color="grey">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>
                </div>

                <!-- Cor do Tempo Esgotado / Negativo -->
                <div>
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    {{ t('settings_cult_warning_color') }} (Estouro / Tempo Negativo)
                  </div>
                  <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                    <div
                      v-for="color in ['#EF4444', '#DC2626', '#FF5722', '#E11D48', '#B91C1C', '#FFA000', '#F43F5E']"
                      :key="color"
                      class="rounded-circle cursor-pointer elevation-1"
                      :style="{
                        width: '32px', height: '32px',
                        background: color,
                        border: localConfig.cultWarningColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                        transform: localConfig.cultWarningColor === color ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }"
                      @click="localConfig.cultWarningColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.cultWarningColor">
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                          style="width: 32px; height: 32px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                        >
                          <v-icon size="14" color="grey">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Comportamentos do Culto -->
            <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3" size="24">
                    mdi-cog-outline
                  </v-icon>
                  <div>
                    <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                      Opções de Exibição
                    </h3>
                  </div>
                </div>

                <v-list class="bg-transparent pa-0">
                  <v-list-item class="px-0 py-2">
                    <template #default>
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ t('settings_cult_always_clock') }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_cult_always_clock_desc') }}
                      </v-list-item-subtitle>
                    </template>
                    <template #append>
                      <v-switch
                        v-model="localConfig.cultAlwaysShowClock"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>

                  <v-divider style="opacity: 0.1;" class="my-1" />

                  <v-list-item class="px-0 py-2">
                    <template #default>
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ t('settings_cult_negative') }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_cult_negative_desc') }}
                      </v-list-item-subtitle>
                    </template>
                    <template #append>
                      <v-switch
                        v-model="localConfig.cultAllowNegative"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Alertas Sonoros do Culto -->
            <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-volume-high
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        Alertas Sonoros Automáticos
                      </h3>
                    </div>
                  </div>
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="testSound"
                  >
                    <v-icon size="20">
                      mdi-play
                    </v-icon>
                    <v-tooltip activator="parent" location="top">
                      Ouvir Som
                    </v-tooltip>
                  </v-btn>
                </div>

                <v-list class="bg-transparent pa-0">
                  <v-list-item class="px-0 py-1">
                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ t('settings_cult_audio_start') }}
                    </v-list-item-title>
                    <template #append>
                      <v-switch
                        v-model="localConfig.cultAudioStart"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-1">
                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ t('settings_cult_audio_5min') }}
                    </v-list-item-title>
                    <template #append>
                      <v-switch
                        v-model="localConfig.cultAudio5min"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-1">
                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ t('settings_cult_audio_1min') }}
                    </v-list-item-title>
                    <template #append>
                      <v-switch
                        v-model="localConfig.cultAudio1min"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-1">
                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ t('settings_cult_audio_end') }}
                    </v-list-item-title>
                    <template #append>
                      <v-switch
                        v-model="localConfig.cultAudioEnd"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </template>
        </div>

        <v-divider style="opacity: 0.1;" />

        <v-card-actions class="pa-4 d-flex justify-space-between" style="padding: 16px 24px 20px !important; background: var(--card-bg, #fff);">
          <v-btn
            variant="tonal"
            color="error"
            class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
            @click="resetToDefault"
          >
            Restaurar Padrão
          </v-btn>
          <div class="d-flex" style="gap: 12px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
              @click="cancel"
            >
              Cancelar
            </v-btn>
            <v-btn
              variant="flat"
              color="primary"
              class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
              @click="saveAndClose"
            >
              Aplicar
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import { playSchoolBellAlert, stopSchoolBellAlert } from "../../helpers/audioAlert";

export default defineComponent({
  name: "ConfigModal",
  components: {
    ModernColorPicker,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    moduleId: {
      type: String as PropType<string>,
      required: true,
    },
    initialTab: {
      type: String as PropType<string>,
      default: "general",
    },
  },
  emits: ["update:modelValue"],
  data: () => ({
    activeTab: "general",
    previewAlert: false,
    localConfig: {
      fontColor: "#ffffff",
      bgColor: "#000000",
      bgImage: null as string | null,
      visualAlert: true,
      audioAlert: true,
      // Culto
      cultBgColor: "#000000",
      cultBgImage: null as string | null,
      cultClockColor: "#ffffff",
      cultTimerColor: "#38bdf8",
      cultWarningColor: "#ef4444",
      cultAlwaysShowClock: true,
      cultAllowNegative: true,
      cultAudioStart: false,
      cultAudio5min: true,
      cultAudio1min: true,
      cultAudioEnd: true,
    },
    defaultConfig: {
      fontColor: "#ffffff",
      bgColor: "#000000",
      bgImage: null as string | null,
      visualAlert: true,
      audioAlert: true,
      // Culto
      cultBgColor: "#000000",
      cultBgImage: null as string | null,
      cultClockColor: "#ffffff",
      cultTimerColor: "#38bdf8",
      cultWarningColor: "#ef4444",
      cultAlwaysShowClock: true,
      cultAllowNegative: true,
      cultAudioStart: false,
      cultAudio5min: true,
      cultAudio1min: true,
      cultAudioEnd: true,
    },
  }),
  computed: {
    internalValue: {
      get(): boolean {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  watch: {
    internalValue(val: boolean) {
      if (val) {
        this.loadConfig();
        if (this.initialTab) {
          this.activeTab = this.initialTab;
        }
      }
    },
  },
  mounted() {
    this.loadConfig();
    if (this.initialTab) {
      this.activeTab = this.initialTab;
    }
  },
  beforeUnmount() {
    stopSchoolBellAlert();
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    loadConfig() {
      const saved = this.$appdata.get(`modules.${this.moduleId}.config`) || this.$userdata.get(`modules.${this.moduleId}.config`);
      if (saved) {
        this.localConfig = { ...this.defaultConfig, ...saved };
      } else {
        this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
      }
    },
    resetToDefault() {
      this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
    },
    saveAndClose() {
      const cloned = JSON.parse(JSON.stringify(this.localConfig));
      this.$appdata.set(`modules.${this.moduleId}.config`, cloned);
      this.$userdata.set(`modules.${this.moduleId}.config`, cloned);
      this.close();
    },
    cancel() {
      this.close();
    },
    close() {
      stopSchoolBellAlert();
      this.internalValue = false;
    },
    onBgImageSelect(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 1920;
          const maxH = 1080;
          let w = img.width;
          let h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              this.localConfig.bgImage = canvas.toDataURL("image/jpeg", 0.85);
              return;
            }
          }
          this.localConfig.bgImage = e.target?.result as string;
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    onCultBgImageSelect(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 1920;
          const maxH = 1080;
          let w = img.width;
          let h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              this.localConfig.cultBgImage = canvas.toDataURL("image/jpeg", 0.85);
              return;
            }
          }
          this.localConfig.cultBgImage = e.target?.result as string;
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    testSound() {
      playSchoolBellAlert();
    },
  },
});
</script>

<style scoped>
.timer-config-modal {
  box-shadow: 0 24px 48px rgba(0,0,0,0.2) !important;
}
.settings-card {
  transition: all 0.3s;
}
</style>
