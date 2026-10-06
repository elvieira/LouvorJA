<template>
  <v-slide-y-reverse-transition>
    <div v-if="internalValue" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <v-card
        class="timer-config-modal rounded-2xl"
        width="95%"
        max-width="960"
        style="background: var(--card-bg, #ffffff); box-shadow: 0 16px 50px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; height: 680px;"
      >
        <!-- Header -->
        <div class="pa-5 pb-2 flex-shrink-0" style="background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.06);">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon color="primary" size="30" class="mr-3">
                mdi-palette-outline
              </v-icon>
              <div>
                <h2 class="text-h6 font-weight-bold mb-0" style="color: var(--sidebar-text); line-height: 1.2;">
                  {{ t('proj_customization') }}
                </h2>
                <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
                  Ajuste o visual e funcionamento do cronômetro na tela
                </p>
              </div>
            </div>
            <v-btn
              icon
              size="small"
              variant="text"
              color="grey"
              @click="cancel"
            >
              <v-icon size="20">
                mdi-close
              </v-icon>
            </v-btn>
          </div>

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

        <!-- Modal Body com layout 2 colunas -->
        <div class="timer-modal-body d-flex flex-grow-1 overflow-hidden" style="min-height: 0;">
          <!-- COLUNA ESQUERDA: Configurações com scroll livre -->
          <div class="timer-modal-settings-col flex-grow-1 overflow-y-auto pa-6" style="background: var(--main-bg, #f5f5f5); min-width: 0;">
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
                      @click="setBgColor(color)"
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

              <!-- Formatação e Tamanho dos Números -->
              <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-3" size="24">
                        mdi-format-color-text
                      </v-icon>
                      <div>
                        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                          Formatação dos Números
                        </h3>
                        <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                          Cor e tamanho dos números do cronômetro
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <!-- Cor dos Números -->
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    {{ t('settings_font_color') }}
                  </div>
                  <div class="d-flex flex-wrap align-center mb-4" style="gap: 10px;">
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

                  <v-divider class="my-4" style="opacity: 0.1;" />

                  <!-- Tamanho dos Números -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-format-size
                      </v-icon>
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('settings_font_size') }}
                      </span>
                    </div>
                    <v-chip
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.fontSizePc }}
                    </v-chip>
                  </div>

                  <div class="d-flex align-center" style="gap: 10px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.fontSizePc = Math.max(10, localConfig.fontSizePc - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.fontSizePc"
                      min="10"
                      max="50"
                      step="1"
                      hide-details
                      color="primary"
                      track-color="grey-lighten-3"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.fontSizePc = Math.min(50, localConfig.fontSizePc + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Texto Personalizado no Cronômetro -->
              <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-4">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-format-title
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_custom_text') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_custom_text_desc') }}
                      </div>
                    </div>
                  </div>

                  <v-text-field
                    v-model="localConfig.customText"
                    placeholder="Ex: Momento de Oração, Intervalo, Culto Jovem..."
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    clearable
                    hide-details
                    class="mb-4"
                  />

                  <template v-if="localConfig.customText">
                    <!-- Cor do Texto -->
                    <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                      {{ t('settings_custom_text_color') }}
                    </div>
                    <div class="d-flex flex-wrap align-center mb-4" style="gap: 10px;">
                      <div
                        v-for="color in ['#FFFFFF', '#000000', '#f6c32a', '#FF6B6B', '#4ECDC4', '#96CEB4', '#FFEAA7', '#0097d7']"
                        :key="color"
                        class="rounded-circle cursor-pointer elevation-1"
                        :class="localConfig.customTextColor === color ? 'elevation-4' : ''"
                        :style="{
                          width: '32px', height: '32px',
                          background: color,
                          border: localConfig.customTextColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                          transition: 'all 0.2s',
                          transform: localConfig.customTextColor === color ? 'scale(1.15)' : 'scale(1)',
                        }"
                        @click="localConfig.customTextColor = color"
                      />
                      <ModernColorPicker v-model="localConfig.customTextColor">
                        <template #activator="{ props }">
                          <div
                            v-bind="props"
                            class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                            style="width: 32px; height: 32px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                          >
                            <v-icon
                              size="14"
                              color="grey"
                            >
                              mdi-eyedropper
                            </v-icon>
                          </div>
                        </template>
                      </ModernColorPicker>
                    </div>

                    <!-- Tamanho do Texto -->
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('settings_custom_text_size') }}
                      </span>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ localConfig.customTextSizePc }}
                      </v-chip>
                    </div>
                    <div class="d-flex align-center mb-4" style="gap: 10px;">
                      <v-btn
                        icon
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        @click="localConfig.customTextSizePc = Math.max(3, localConfig.customTextSizePc - 1)"
                      >
                        <v-icon size="16">
                          mdi-minus
                        </v-icon>
                      </v-btn>
                      <v-slider
                        v-model="localConfig.customTextSizePc"
                        min="3"
                        max="25"
                        step="1"
                        hide-details
                        color="primary"
                        track-color="grey-lighten-3"
                        class="flex-grow-1"
                      />
                      <v-btn
                        icon
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        @click="localConfig.customTextSizePc = Math.min(25, localConfig.customTextSizePc + 1)"
                      >
                        <v-icon size="16">
                          mdi-plus
                        </v-icon>
                      </v-btn>
                    </div>

                    <!-- Modo de Posição do Texto -->
                    <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                      {{ t('settings_custom_text_pos') }}
                    </div>
                    <PillSwitch
                      v-model="localConfig.customTextPosition"
                      block
                      class="mb-4"
                      :items="[
                        { value: 'above', label: 'Acima do Cronômetro' },
                        { value: 'below', label: 'Abaixo do Cronômetro' },
                        { value: 'custom', label: 'Posição Livre' },
                      ]"
                    />

                    <!-- Grade e Sliders se for Posição Livre -->
                    <PositionAlignmentPicker
                      v-if="localConfig.customTextPosition === 'custom'"
                      v-model:x="localConfig.customTextX"
                      v-model:y="localConfig.customTextY"
                    />
                  </template>
                </v-card-text>
              </v-card>

              <!-- Posicionamento na Tela -->
              <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-4">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-crosshairs-gps
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_position') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_position_desc') }}
                      </div>
                    </div>
                  </div>

                  <PositionAlignmentPicker
                    v-model:x="localConfig.posX"
                    v-model:y="localConfig.posY"
                  />
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
                      @click="setCultBgColor(color)"
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

              <!-- Tamanho dos Elementos do Culto -->
              <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-4">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-format-size
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_font_size') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        Personalize a escala dos números e relógio na tela
                      </div>
                    </div>
                  </div>

                  <!-- Tamanho da Hora Atual -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-clock-outline
                      </v-icon>
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('settings_cult_clock_size') }}
                      </span>
                    </div>
                    <v-chip
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.cultClockSizePc || 12 }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mb-4" style="gap: 10px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.cultClockSizePc = Math.max(5, (localConfig.cultClockSizePc || 12) - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.cultClockSizePc"
                      min="5"
                      max="30"
                      step="1"
                      hide-details
                      color="primary"
                      track-color="grey-lighten-3"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.cultClockSizePc = Math.min(30, (localConfig.cultClockSizePc || 12) + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>

                  <v-divider class="my-4" style="opacity: 0.1;" />

                  <!-- Tamanho do Cronômetro -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-timer-outline
                      </v-icon>
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('settings_cult_timer_size') }}
                      </span>
                    </div>
                    <v-chip
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.cultTimerSizePc || 22 }}
                    </v-chip>
                  </div>
                  <div class="d-flex align-center" style="gap: 10px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.cultTimerSizePc = Math.max(8, (localConfig.cultTimerSizePc || 22) - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.cultTimerSizePc"
                      min="8"
                      max="45"
                      step="1"
                      hide-details
                      color="primary"
                      track-color="grey-lighten-3"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.cultTimerSizePc = Math.min(45, (localConfig.cultTimerSizePc || 22) + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Posicionamento na Tela do Culto -->
              <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-4">
                    <v-icon color="primary" class="mr-3" size="24">
                      mdi-crosshairs-gps
                    </v-icon>
                    <div>
                      <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                        {{ t('settings_position') }}
                      </h3>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_position_desc') }}
                      </div>
                    </div>
                  </div>

                  <!-- Modo de Posicionamento (Juntos vs Individual) -->
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    {{ t('pos_mode') }}
                  </div>
                  <PillSwitch
                    v-model="localConfig.cultPosMode"
                    block
                    class="mb-3"
                    :items="[
                      { value: 'together', label: t('pos_mode_together'), icon: 'mdi-group' },
                      { value: 'individual', label: t('pos_mode_individual'), icon: 'mdi-vector-selection' },
                    ]"
                  />

                  <div class="text-caption mb-4" style="color: var(--sidebar-text-secondary);">
                    {{ localConfig.cultPosMode === 'individual' ? t('pos_mode_individual_desc') : t('pos_mode_together_desc') }}
                  </div>

                  <!-- Se Juntos: Um único PositionAlignmentPicker -->
                  <template v-if="localConfig.cultPosMode !== 'individual'">
                    <PositionAlignmentPicker
                      v-model:x="localConfig.cultPosX"
                      v-model:y="localConfig.cultPosY"
                    />
                  </template>

                  <!-- Se Individual: Seletor do Elemento Alvo + PositionAlignmentPicker correspondente -->
                  <template v-else>
                    <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                      {{ t('pos_adjusting') }}
                    </div>
                    <PillSwitch
                      v-model="cultActivePosTarget"
                      block
                      class="mb-4"
                      :items="cultTargetItems"
                    />

                    <!-- Alvo: Cronômetro -->
                    <div v-if="cultActivePosTarget === 'timer'">
                      <PositionAlignmentPicker
                        v-model:x="localConfig.cultTimerX"
                        v-model:y="localConfig.cultTimerY"
                      />
                    </div>

                    <!-- Alvo: Hora Atual -->
                    <div v-else-if="cultActivePosTarget === 'clock'">
                      <PositionAlignmentPicker
                        v-model:x="localConfig.cultClockX"
                        v-model:y="localConfig.cultClockY"
                      />
                    </div>

                    <!-- Alvo: Texto -->
                    <div v-else-if="cultActivePosTarget === 'text'">
                      <PositionAlignmentPicker
                        v-model:x="localConfig.cultTextX"
                        v-model:y="localConfig.cultTextY"
                      />
                    </div>
                  </template>
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
                  </div>

                  <v-list class="bg-transparent pa-0">
                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ t('settings_cult_audio_start') }}
                      </v-list-item-title>
                      <template #append>
                        <div class="d-flex align-center" style="gap: 8px;">
                          <v-btn
                            v-if="localConfig.cultAudioStart"
                            icon
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            class="mr-1"
                            @click="testCultSound('start')"
                          >
                            <v-icon size="18">
                              mdi-volume-high
                            </v-icon>
                            <v-tooltip activator="parent" location="top">
                              Testar Som
                            </v-tooltip>
                          </v-btn>
                          <v-switch
                            v-model="localConfig.cultAudioStart"
                            color="primary"
                            hide-details
                            inset
                            density="compact"
                          />
                        </div>
                      </template>
                    </v-list-item>

                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ t('settings_cult_audio_5min') }}
                      </v-list-item-title>
                      <template #append>
                        <div class="d-flex align-center" style="gap: 8px;">
                          <v-btn
                            v-if="localConfig.cultAudio5min"
                            icon
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            class="mr-1"
                            @click="testCultSound('5min')"
                          >
                            <v-icon size="18">
                              mdi-volume-high
                            </v-icon>
                            <v-tooltip activator="parent" location="top">
                              Testar Som
                            </v-tooltip>
                          </v-btn>
                          <v-switch
                            v-model="localConfig.cultAudio5min"
                            color="primary"
                            hide-details
                            inset
                            density="compact"
                          />
                        </div>
                      </template>
                    </v-list-item>

                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ t('settings_cult_audio_1min') }}
                      </v-list-item-title>
                      <template #append>
                        <div class="d-flex align-center" style="gap: 8px;">
                          <v-btn
                            v-if="localConfig.cultAudio1min"
                            icon
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            class="mr-1"
                            @click="testCultSound('1min')"
                          >
                            <v-icon size="18">
                              mdi-volume-high
                            </v-icon>
                            <v-tooltip activator="parent" location="top">
                              Testar Som
                            </v-tooltip>
                          </v-btn>
                          <v-switch
                            v-model="localConfig.cultAudio1min"
                            color="primary"
                            hide-details
                            inset
                            density="compact"
                          />
                        </div>
                      </template>
                    </v-list-item>

                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ t('settings_cult_audio_end') }}
                      </v-list-item-title>
                      <template #append>
                        <div class="d-flex align-center" style="gap: 8px;">
                          <v-btn
                            v-if="localConfig.cultAudioEnd"
                            icon
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            class="mr-1"
                            @click="testCultSound('end')"
                          >
                            <v-icon size="18">
                              mdi-volume-high
                            </v-icon>
                            <v-tooltip activator="parent" location="top">
                              Testar Som
                            </v-tooltip>
                          </v-btn>
                          <v-switch
                            v-model="localConfig.cultAudioEnd"
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
          </div> <!-- Fim de timer-modal-settings-col -->

          <!-- COLUNA DIREITA: Preview Fixo em Tempo Real -->
          <div class="timer-modal-preview-col flex-shrink-0 d-flex flex-column pa-5 overflow-y-auto" style="width: 410px; background: var(--card-bg, #ffffff); border-left: 1px solid rgba(0,0,0,0.08);">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon color="primary" size="20" class="mr-2">
                  mdi-monitor-dashboard
                </v-icon>
                <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">Pré-visualização</span>
              </div>
              <v-chip
                size="x-small"
                variant="tonal"
                color="primary"
                class="font-weight-bold"
              >
                16:9 Tela
              </v-chip>
            </div>

            <!-- Preview Padrão -->
            <div
              v-if="activeTab === 'general'"
              ref="previewStandardRef"
              class="overflow-hidden rounded-lg mx-auto position-relative cursor-crosshair select-none w-100"
              :style="{
                backgroundColor: localConfig.bgColor,
                backgroundImage: localConfig.bgImage ? `url('${localConfig.bgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                aspectRatio: '16/9',
                maxHeight: '210px',
                width: '100%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
              }"
              @pointerdown="startDragStandard"
            >
              <!-- Wrapper posicionado do cronômetro padrão -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${localConfig.posX ?? 50}%`,
                  top: `${localConfig.posY ?? 50}%`,
                  transform: `translate(-${localConfig.posX ?? 50}%, -${localConfig.posY ?? 50}%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: (localConfig.posX ?? 50) <= 30 ? 'flex-start' : (localConfig.posX ?? 50) >= 70 ? 'flex-end' : 'center',
                  textAlign: (localConfig.posX ?? 50) <= 30 ? 'left' : (localConfig.posX ?? 50) >= 70 ? 'right' : 'center',
                  maxWidth: '92%',
                  pointerEvents: 'none',
                }"
              >
                <!-- Texto Personalizado Acima -->
                <div
                  v-if="localConfig.customText && (localConfig.customTextPosition === 'above' || !localConfig.customTextPosition)"
                  class="font-weight-bold"
                  :style="{
                    color: localConfig.customTextColor || localConfig.fontColor,
                    fontSize: `${Math.max(10, (localConfig.customTextSizePc || 8) * 1.6)}px`,
                    lineHeight: '1.2',
                    marginBottom: '2px',
                    textShadow: previewStandardTextShadow,
                  }"
                >
                  {{ localConfig.customText }}
                </div>

                <!-- Números do Cronômetro -->
                <div
                  :style="{
                    fontSize: `${(localConfig.fontSizePc || 25) * 2.2}px`,
                    fontWeight: '900',
                    lineHeight: '1',
                    textShadow: previewStandardTextShadow,
                    color: localConfig.fontColor,
                  }"
                >
                  05:00
                </div>

                <!-- Texto Personalizado Abaixo -->
                <div
                  v-if="localConfig.customText && localConfig.customTextPosition === 'below'"
                  class="font-weight-bold"
                  :style="{
                    color: localConfig.customTextColor || localConfig.fontColor,
                    fontSize: `${Math.max(10, (localConfig.customTextSizePc || 8) * 1.6)}px`,
                    lineHeight: '1.2',
                    marginTop: '2px',
                    textShadow: previewStandardTextShadow,
                  }"
                >
                  {{ localConfig.customText }}
                </div>
              </div>

              <!-- Texto Livre Independente no Preview -->
              <div
                v-if="localConfig.customText && localConfig.customTextPosition === 'custom'"
                class="font-weight-bold"
                :style="{
                  position: 'absolute',
                  left: `${localConfig.customTextX ?? 50}%`,
                  top: `${localConfig.customTextY ?? 20}%`,
                  transform: `translate(-${localConfig.customTextX ?? 50}%, -${localConfig.customTextY ?? 20}%)`,
                  color: localConfig.customTextColor || localConfig.fontColor,
                  fontSize: `${Math.max(10, (localConfig.customTextSizePc || 8) * 1.6)}px`,
                  lineHeight: '1.2',
                  textShadow: previewStandardTextShadow,
                  pointerEvents: 'none',
                }"
              >
                {{ localConfig.customText }}
              </div>
            </div>

            <!-- Preview Modo Culto -->
            <div
              v-else
              ref="previewCultRef"
              class="overflow-hidden rounded-lg mx-auto position-relative cursor-crosshair select-none w-100"
              :style="{
                backgroundColor: localConfig.cultBgColor || localConfig.bgColor,
                backgroundImage: (localConfig.cultBgImage || localConfig.bgImage) ? `url('${localConfig.cultBgImage || localConfig.bgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                aspectRatio: '16/9',
                maxHeight: '210px',
                width: '100%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                padding: '12px'
              }"
              @pointerdown="startDragCult"
            >
              <!-- MODO INDIVIDUAL NO PREVIEW -->
              <template v-if="localConfig.cultPosMode === 'individual'">
                <!-- Texto Personalizado Individual -->
                <div
                  v-if="localConfig.customText"
                  class="font-weight-bold"
                  :style="{
                    position: 'absolute',
                    left: `${localConfig.cultTextX ?? 50}%`,
                    top: `${localConfig.cultTextY ?? 15}%`,
                    transform: `translate(-${localConfig.cultTextX ?? 50}%, -${localConfig.cultTextY ?? 15}%)`,
                    color: localConfig.customTextColor || localConfig.fontColor,
                    fontSize: `${Math.max(9, (localConfig.customTextSizePc || 8) * 1.5)}px`,
                    lineHeight: '1.2',
                    textShadow: previewCultClockShadow,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: cultActivePosTarget === 'text' ? '1px dashed var(--accent-blue, #0097d7)' : '1px dashed transparent',
                    cursor: 'pointer',
                    zIndex: 2,
                  }"
                  @pointerdown.stop="selectAndDragCult('text', $event)"
                >
                  {{ localConfig.customText }}
                </div>

                <!-- Hora Atual Individual -->
                <div
                  v-if="localConfig.cultAlwaysShowClock !== false"
                  class="font-weight-bold"
                  :style="{
                    position: 'absolute',
                    left: `${localConfig.cultClockX ?? 50}%`,
                    top: `${localConfig.cultClockY ?? 35}%`,
                    transform: `translate(-${localConfig.cultClockX ?? 50}%, -${localConfig.cultClockY ?? 35}%)`,
                    color: previewCultClockColor,
                    fontSize: `${(localConfig.cultClockSizePc || 12) * 1.5}px`,
                    lineHeight: '1',
                    textShadow: previewCultClockShadow,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: cultActivePosTarget === 'clock' ? '1px dashed var(--accent-blue, #0097d7)' : '1px dashed transparent',
                    cursor: 'pointer',
                    zIndex: 2,
                  }"
                  @pointerdown.stop="selectAndDragCult('clock', $event)"
                >
                  10:45:00
                </div>

                <!-- Cronômetro Individual -->
                <div
                  class="font-weight-black"
                  :style="{
                    position: 'absolute',
                    left: `${localConfig.cultTimerX ?? 50}%`,
                    top: `${localConfig.cultTimerY ?? 60}%`,
                    transform: `translate(-${localConfig.cultTimerX ?? 50}%, -${localConfig.cultTimerY ?? 60}%)`,
                    color: previewAlert ? (localConfig.cultWarningColor || '#ef4444') : (localConfig.cultTimerColor || '#38bdf8'),
                    fontSize: `${(localConfig.cultTimerSizePc || 22) * 1.7}px`,
                    lineHeight: '1',
                    textShadow: previewCultTimerShadow,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: cultActivePosTarget === 'timer' ? '1px dashed var(--accent-blue, #0097d7)' : '1px dashed transparent',
                    cursor: 'pointer',
                    zIndex: 2,
                  }"
                  @pointerdown.stop="selectAndDragCult('timer', $event)"
                >
                  {{ previewAlert ? '-00:02:15' : '00:15:00' }}
                </div>
              </template>

              <!-- MODO JUNTOS NO PREVIEW -->
              <template v-else>
                <div
                  :style="{
                    position: 'absolute',
                    left: `${localConfig.cultPosX ?? localConfig.posX ?? 50}%`,
                    top: `${localConfig.cultPosY ?? localConfig.posY ?? 50}%`,
                    transform: `translate(-${localConfig.cultPosX ?? localConfig.posX ?? 50}%, -${localConfig.cultPosY ?? localConfig.posY ?? 50}%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: (localConfig.cultPosX ?? localConfig.posX ?? 50) <= 30 ? 'flex-start' : (localConfig.cultPosX ?? localConfig.posX ?? 50) >= 70 ? 'flex-end' : 'center',
                    textAlign: (localConfig.cultPosX ?? localConfig.posX ?? 50) <= 30 ? 'left' : (localConfig.cultPosX ?? localConfig.posX ?? 50) >= 70 ? 'right' : 'center',
                    maxWidth: '92%',
                    pointerEvents: 'none',
                  }"
                >
                  <!-- Texto Personalizado Vinculado -->
                  <div
                    v-if="localConfig.customText && localConfig.customTextPosition !== 'custom'"
                    class="font-weight-bold mb-1"
                    :style="{
                      color: localConfig.customTextColor || localConfig.fontColor,
                      fontSize: `${Math.max(9, (localConfig.customTextSizePc || 8) * 1.5)}px`,
                      lineHeight: '1.2',
                      textShadow: previewCultClockShadow,
                    }"
                  >
                    {{ localConfig.customText }}
                  </div>

                  <!-- Hora Atual Superior -->
                  <div
                    v-if="localConfig.cultAlwaysShowClock !== false"
                    class="font-weight-bold mb-1"
                    :style="{
                      color: previewCultClockColor,
                      fontSize: `${(localConfig.cultClockSizePc || 12) * 1.5}px`,
                      lineHeight: '1',
                      textShadow: previewCultClockShadow
                    }"
                  >
                    10:45:00
                  </div>

                  <!-- Tempo Restante Inferior -->
                  <div
                    class="font-weight-black"
                    :style="{
                      color: previewAlert ? (localConfig.cultWarningColor || '#ef4444') : (localConfig.cultTimerColor || '#38bdf8'),
                      fontSize: `${(localConfig.cultTimerSizePc || 22) * 1.7}px`,
                      lineHeight: '1',
                      textShadow: previewCultTimerShadow
                    }"
                  >
                    {{ previewAlert ? '-00:02:15' : '00:15:00' }}
                  </div>
                </div>

                <!-- Texto Livre se posição for 'custom' -->
                <div
                  v-if="localConfig.customText && localConfig.customTextPosition === 'custom'"
                  class="font-weight-bold"
                  :style="{
                    position: 'absolute',
                    left: `${localConfig.cultTextX ?? localConfig.customTextX ?? 50}%`,
                    top: `${localConfig.cultTextY ?? localConfig.customTextY ?? 20}%`,
                    transform: `translate(-${localConfig.cultTextX ?? localConfig.customTextX ?? 50}%, -${localConfig.cultTextY ?? localConfig.customTextY ?? 20}%)`,
                    color: localConfig.customTextColor || localConfig.fontColor,
                    fontSize: `${Math.max(9, (localConfig.customTextSizePc || 8) * 1.5)}px`,
                    lineHeight: '1.2',
                    textShadow: previewCultClockShadow,
                    pointerEvents: 'none',
                  }"
                >
                  {{ localConfig.customText }}
                </div>
              </template>

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
                    transition: 'background 0.3s ease'
                  }"
                />
              </div>
            </div>

            <!-- Botão Simular no Modo Culto -->
            <div v-if="activeTab === 'cult'" class="mt-3">
              <v-btn
                size="small"
                variant="tonal"
                :color="previewAlert ? 'error' : 'primary'"
                block
                class="text-none font-weight-bold"
                @click="previewAlert = !previewAlert"
              >
                <v-icon start size="16">
                  {{ previewAlert ? 'mdi-clock-check-outline' : 'mdi-alert-circle-outline' }}
                </v-icon>
                {{ previewAlert ? 'Simular: Tempo Normal' : 'Simular: Tempo Esgotado' }}
              </v-btn>
            </div>

            <!-- Dica do preview -->
            <div class="mt-4 pa-3 rounded-lg d-flex align-start" style="background: var(--main-bg, #f5f5f5); border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
              <v-icon color="primary" size="18" class="mt-1 flex-shrink-0">
                mdi-cursor-move
              </v-icon>
              <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
                <strong style="color: var(--sidebar-text);">Arraste Livre:</strong> Clique e arraste diretamente no preview acima para mover os elementos para qualquer lugar da tela.
              </div>
            </div>
          </div> <!-- Fim de timer-modal-preview-col -->
        </div> <!-- Fim de timer-modal-body -->

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
import PositionAlignmentPicker from "@/components/inputs/PositionAlignmentPicker.vue";
import PillSwitch from "@/components/inputs/PillSwitch.vue";
import { playSchoolBellAlert, stopSchoolBellAlert, playCultAlert } from "../../helpers/audioAlert";

function getLuminance(colorStr?: string | null): number {
  if (!colorStr) return 0;
  const hex = colorStr.trim();
  if (hex.startsWith("#")) {
    let cleanHex = hex.slice(1);
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  return 0;
}

function isLightColor(colorStr?: string | null): boolean {
  return getLuminance(colorStr) > 0.6;
}

export default defineComponent({
  name: "ConfigModal",
  components: {
    ModernColorPicker,
    PositionAlignmentPicker,
    PillSwitch,
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
    cultActivePosTarget: "timer" as "timer" | "clock" | "text",
    localConfig: {
      fontColor: "#ffffff",
      bgColor: "#000000",
      bgImage: null as string | null,
      fontSizePc: 25,
      posX: 50,
      posY: 50,
      customText: "",
      customTextSizePc: 8,
      customTextColor: "#ffffff",
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
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
      cultClockSizePc: 12,
      cultTimerSizePc: 22,
      cultPosMode: "together" as "together" | "individual",
      cultPosX: 50,
      cultPosY: 50,
      cultClockX: 50,
      cultClockY: 35,
      cultTimerX: 50,
      cultTimerY: 60,
      cultTextX: 50,
      cultTextY: 15,
    },
    defaultConfig: {
      fontColor: "#ffffff",
      bgColor: "#000000",
      bgImage: null as string | null,
      fontSizePc: 25,
      posX: 50,
      posY: 50,
      customText: "",
      customTextSizePc: 8,
      customTextColor: "#ffffff",
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
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
      cultClockSizePc: 12,
      cultTimerSizePc: 22,
      cultPosMode: "together" as "together" | "individual",
      cultPosX: 50,
      cultPosY: 50,
      cultClockX: 50,
      cultClockY: 35,
      cultTimerX: 50,
      cultTimerY: 60,
      cultTextX: 50,
      cultTextY: 15,
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
    previewStandardTextShadow(): string {
      if (this.localConfig.bgImage) return "0 4px 20px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.8)";
      if (isLightColor(this.localConfig.bgColor)) return "0 2px 8px rgba(0,0,0,0.12)";
      return "0 4px 20px rgba(0,0,0,0.5)";
    },
    previewCultClockColor(): string {
      const color = this.localConfig.cultClockColor || "#ffffff";
      const hasImage = Boolean(this.localConfig.cultBgImage || this.localConfig.bgImage);
      if (!hasImage && isLightColor(this.localConfig.cultBgColor || this.localConfig.bgColor) && isLightColor(color)) {
        return "#0f172a";
      }
      return color;
    },
    previewCultClockShadow(): string {
      const hasImage = Boolean(this.localConfig.cultBgImage || this.localConfig.bgImage);
      if (hasImage) return "0 2px 10px rgba(0,0,0,0.7)";
      const isLight = isLightColor(this.localConfig.cultBgColor || this.localConfig.bgColor);
      if (isLight) return "0 2px 8px rgba(0,0,0,0.10)";
      return "0 3px 14px rgba(0,0,0,0.5)";
    },
    previewCultTimerShadow(): string {
      const hasImage = Boolean(this.localConfig.cultBgImage || this.localConfig.bgImage);
      if (hasImage) return "0 4px 16px rgba(0,0,0,0.7)";
      const isLight = isLightColor(this.localConfig.cultBgColor || this.localConfig.bgColor);
      if (isLight) return "0 3px 12px rgba(0,0,0,0.12)";
      return "0 4px 20px rgba(0,0,0,0.5)";
    },
    cultTargetItems(): any[] {
      const items = [
        { value: "timer", label: this.t("pos_target_timer"), icon: "mdi-timer-outline" },
        { value: "clock", label: this.t("pos_target_clock"), icon: "mdi-clock-outline" },
      ];
      if (this.localConfig.customText) {
        items.push({ value: "text", label: this.t("pos_target_text"), icon: "mdi-format-title" });
      }
      return items;
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
    "localConfig.cultBgColor"(newColor: string) {
      if (isLightColor(newColor)) {
        if (!this.localConfig.cultClockColor || isLightColor(this.localConfig.cultClockColor)) {
          this.localConfig.cultClockColor = "#000000";
        }
      }
    },
    "localConfig.bgColor"(newColor: string) {
      if (isLightColor(newColor)) {
        if (!this.localConfig.fontColor || isLightColor(this.localConfig.fontColor)) {
          this.localConfig.fontColor = "#000000";
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
    setCultBgColor(color: string) {
      this.localConfig.cultBgColor = color;
      if (isLightColor(color)) {
        if (!this.localConfig.cultClockColor || isLightColor(this.localConfig.cultClockColor)) {
          this.localConfig.cultClockColor = "#000000";
        }
      } else {
        if (this.localConfig.cultClockColor === "#000000" || this.localConfig.cultClockColor === "#0F172A") {
          this.localConfig.cultClockColor = "#FFFFFF";
        }
      }
    },
    setBgColor(color: string) {
      this.localConfig.bgColor = color;
      if (isLightColor(color)) {
        if (!this.localConfig.fontColor || isLightColor(this.localConfig.fontColor)) {
          this.localConfig.fontColor = "#000000";
        }
      } else {
        if (this.localConfig.fontColor === "#000000" || this.localConfig.fontColor === "#0F172A") {
          this.localConfig.fontColor = "#FFFFFF";
        }
      }
    },
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    loadConfig() {
      const saved = this.$appdata.get(`modules.${this.moduleId}.config`) || this.$userdata.get(`modules.${this.moduleId}.config`);
      if (saved) {
        this.localConfig = { ...this.defaultConfig, ...saved };
        if (this.localConfig.cultPosX === undefined) this.localConfig.cultPosX = this.localConfig.posX ?? 50;
        if (this.localConfig.cultPosY === undefined) this.localConfig.cultPosY = this.localConfig.posY ?? 50;
        if (this.localConfig.cultClockX === undefined) this.localConfig.cultClockX = 50;
        if (this.localConfig.cultClockY === undefined) this.localConfig.cultClockY = 35;
        if (this.localConfig.cultTimerX === undefined) this.localConfig.cultTimerX = 50;
        if (this.localConfig.cultTimerY === undefined) this.localConfig.cultTimerY = 60;
        if (this.localConfig.cultTextX === undefined) this.localConfig.cultTextX = 50;
        if (this.localConfig.cultTextY === undefined) this.localConfig.cultTextY = 15;
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
    testCultSound(type: "start" | "5min" | "1min" | "end") {
      playCultAlert(type);
    },
    startDragStandard(e: PointerEvent) {
      const el = this.$refs.previewStandardRef as HTMLElement;
      if (!el) return;
      const updatePos = (evt: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const rawX = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
        const rawY = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
        this.localConfig.posX = Math.max(5, Math.min(95, rawX));
        this.localConfig.posY = Math.max(5, Math.min(95, rawY));
      };
      updatePos(e);
      const onMove = (evt: PointerEvent) => updatePos(evt);
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    selectAndDragCult(target: "timer" | "clock" | "text", e: PointerEvent) {
      this.cultActivePosTarget = target;
      this.startDragCult(e);
    },
    startDragCult(e: PointerEvent) {
      const el = this.$refs.previewCultRef as HTMLElement;
      if (!el) return;
      const updatePos = (evt: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const rawX = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
        const rawY = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
        const clampedX = Math.max(5, Math.min(95, rawX));
        const clampedY = Math.max(5, Math.min(95, rawY));
        if (this.localConfig.cultPosMode === "individual") {
          if (this.cultActivePosTarget === "clock") {
            this.localConfig.cultClockX = clampedX;
            this.localConfig.cultClockY = clampedY;
          } else if (this.cultActivePosTarget === "text") {
            this.localConfig.cultTextX = clampedX;
            this.localConfig.cultTextY = clampedY;
          } else {
            this.localConfig.cultTimerX = clampedX;
            this.localConfig.cultTimerY = clampedY;
          }
        } else {
          this.localConfig.cultPosX = clampedX;
          this.localConfig.cultPosY = clampedY;
          this.localConfig.posX = clampedX;
          this.localConfig.posY = clampedY;
        }
      };
      updatePos(e);
      const onMove = (evt: PointerEvent) => updatePos(evt);
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
  },
});
</script>

<style scoped>
.timer-config-modal {
  box-shadow: 0 24px 60px rgba(0,0,0,0.4) !important;
}
.settings-card {
  transition: all 0.3s;
}
@media (max-width: 860px) {
  .timer-modal-body {
    flex-direction: column-reverse !important;
  }
  .timer-modal-preview-col {
    width: 100% !important;
    border-left: none !important;
    border-bottom: 1px solid rgba(0,0,0,0.08) !important;
    max-height: 260px !important;
  }
}
</style>
