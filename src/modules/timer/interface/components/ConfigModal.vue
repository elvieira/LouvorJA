<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="internalValue"
      class="d-flex align-center justify-center timer-config-backdrop"
      @click.self="cancel"
    >
      <v-card
        class="timer-config-modal rounded-xl"
        width="96%"
        max-width="1040"
      >
        <!-- Header Fixo -->
        <div class="timer-config-header px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
          <div class="d-flex align-center" style="gap: 12px;">
            <div class="timer-config-icon-badge">
              <v-icon color="primary" size="22">
                mdi-palette-outline
              </v-icon>
            </div>
            <div>
              <h2 class="text-h6 font-weight-bold mb-0 timer-config-title">
                {{ t('proj_customization') }}
              </h2>
              <p class="text-caption mb-0 timer-config-subtitle">
                {{ t('modal_subtitle') }}
              </p>
            </div>
          </div>

          <div class="d-flex align-center" style="gap: 12px;">
            <!-- Seletor de Perfil: Padrão vs Escola Sabatina -->
            <PillSwitch
              v-model="activeProfile"
              :items="[
                { value: 'general', label: t('profile_general'), icon: 'mdi-timer-outline' },
                { value: 'cult', label: t('profile_cult'), icon: 'mdi-progress-clock' },
              ]"
            />

            <v-btn
              icon
              size="small"
              variant="text"
              class="timer-config-close-btn"
              @click="cancel"
            >
              <v-icon size="20">
                mdi-close
              </v-icon>
              <v-tooltip
                activator="parent"
                location="bottom"
                open-delay="200"
                content-class="modern-glass-menu elevation-0 font-weight-medium"
              >
                {{ t('close') || $t('app.close') || 'Fechar' }}
              </v-tooltip>
            </v-btn>
          </div>
        </div>

        <v-divider style="border-color: var(--border-color); opacity: 0.6;" />

        <!-- Body com 3 Colunas: Sub-Abas | Configurações | Pré-visualização -->
        <div class="timer-config-body d-flex flex-grow-1 overflow-hidden">
          <!-- Coluna 1: Sub-Abas Verticais de Navegação -->
          <div class="timer-config-nav-col pa-3 d-flex flex-column flex-shrink-0">
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeSubTab === 'appearance' }"
              @click="activeSubTab = 'appearance'"
            >
              <v-icon size="18">
                mdi-palette-outline
              </v-icon>
              <span>{{ t('tab_appearance') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeSubTab === 'display' }"
              @click="activeSubTab = 'display'"
            >
              <v-icon size="18">
                mdi-numeric
              </v-icon>
              <span>{{ t('tab_display') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeSubTab === 'text' }"
              @click="activeSubTab = 'text'"
            >
              <v-icon size="18">
                mdi-format-size
              </v-icon>
              <span>{{ t('tab_text') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeSubTab === 'position' }"
              @click="activeSubTab = 'position'"
            >
              <v-icon size="18">
                mdi-arrow-all
              </v-icon>
              <span>{{ t('tab_position') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeSubTab === 'behavior' }"
              @click="activeSubTab = 'behavior'"
            >
              <v-icon size="18">
                mdi-bell-outline
              </v-icon>
              <span>{{ t('tab_behavior') }}</span>
            </button>
            <!-- Sub-aba de Prévia (Exibida em telas compactas < 980px) -->
            <button
              type="button"
              class="nav-tab-btn nav-tab-preview-only"
              :class="{ active: activeSubTab === 'preview' }"
              @click="activeSubTab = 'preview'"
            >
              <v-icon size="18">
                mdi-monitor-dashboard
              </v-icon>
              <span>{{ t('tab_preview') }}</span>
            </button>
          </div>

          <!-- Coluna 2: Conteúdo Rolável da Aba Ativa -->
          <div class="timer-config-content-col pa-5 flex-grow-1 overflow-y-auto">
            <!-- ================= SUB-ABA: APARÊNCIA ================= -->
            <div v-if="activeSubTab === 'appearance'" class="tab-pane">
              <!-- Cor de Fundo -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-color-fill
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('settings_bg_color') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('bg_color_desc') }}
                </p>
                <div class="color-palette-row">
                  <div
                    v-for="color in bgPaletteColors"
                    :key="color"
                    class="color-circle"
                    :class="{ active: currentBgColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="setBgColor(color)"
                  />
                  <ModernColorPicker
                    :model-value="currentBgColor"
                    @update:model-value="setBgColor"
                  >
                    <template #activator="{ props: pickerProps }">
                      <div
                        v-bind="pickerProps"
                        class="color-circle color-picker-btn"
                        title="Cor personalizada"
                      >
                        <v-icon size="16">
                          mdi-eyedropper
                        </v-icon>
                      </div>
                    </template>
                  </ModernColorPicker>
                </div>
              </div>

              <!-- Imagem de Fundo (Wallpapers) -->
              <div class="settings-section">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-image-outline
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('bg_image') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('bg_image_desc') }}
                </p>
                <div class="wallpaper-thumbs-row">
                  <!-- Nenhuma Imagem -->
                  <div
                    class="wallpaper-thumb-card no-wallpaper-card"
                    :class="{ active: !currentBgImage }"
                    @click="setBgImage(null)"
                  >
                    <v-icon size="20" class="mb-1">
                      mdi-close-circle-outline
                    </v-icon>
                    <span>{{ t('none') }}</span>
                  </div>

                  <!-- Imagens Salvas -->
                  <div
                    v-for="(img, idx) in savedWallpapers"
                    :key="idx"
                    class="wallpaper-thumb-card user-wallpaper-thumb"
                    :class="{ active: currentBgImage === img }"
                    :style="{ backgroundImage: `url('${img}')` }"
                    @click="setBgImage(img)"
                  >
                    <button
                      type="button"
                      class="delete-thumb-btn"
                      title="Excluir imagem"
                      @click.stop="removeSavedWallpaper(idx)"
                    >
                      <v-icon size="12">
                        mdi-close
                      </v-icon>
                    </button>
                  </div>

                  <!-- Imagem Atual se não estiver salva na lista -->
                  <div
                    v-if="currentBgImage && !savedWallpapers.includes(currentBgImage)"
                    class="wallpaper-thumb-card user-wallpaper-thumb active"
                    :style="{ backgroundImage: `url('${currentBgImage}')` }"
                  >
                    <button
                      type="button"
                      class="delete-thumb-btn"
                      title="Excluir imagem"
                      @click.stop="setBgImage(null)"
                    >
                      <v-icon size="12">
                        mdi-close
                      </v-icon>
                    </button>
                  </div>

                  <!-- Botão Adicionar (+) -->
                  <div
                    class="wallpaper-thumb-card upload-wallpaper-btn"
                    title="Adicionar imagem"
                    @click="($refs.bgImageInput as any)?.click()"
                  >
                    <v-icon size="20" color="primary">
                      mdi-plus
                    </v-icon>
                  </div>
                </div>

                <input
                  ref="bgImageInput"
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  @change="onBgImageUpload"
                />
              </div>
            </div>

            <!-- ================= SUB-ABA: MOSTRADORES ================= -->
            <div v-if="activeSubTab === 'display'" class="tab-pane">
              <!-- PERFIL PADRÃO -->
              <template v-if="activeProfile === 'general'">
                <!-- Cor dos Números -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-palette
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('timer_color') }}
                    </span>
                  </div>
                  <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                    {{ t('timer_color_desc') }}
                  </p>
                  <div class="color-palette-row">
                    <div
                      v-for="color in textPaletteColors"
                      :key="color"
                      class="color-circle"
                      :class="{ active: localConfig.fontColor === color }"
                      :style="{ backgroundColor: color }"
                      @click="localConfig.fontColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.fontColor">
                      <template #activator="{ props: pickerProps }">
                        <div
                          v-bind="pickerProps"
                          class="color-circle color-picker-btn"
                          title="Cor personalizada"
                        >
                          <v-icon size="16">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>
                </div>

                <!-- Tamanho dos Números -->
                <div class="settings-section">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-format-size
                      </v-icon>
                      <span class="text-subtitle-2 font-weight-bold section-title">
                        {{ t('settings_font_size') }}
                      </span>
                    </div>
                    <v-chip
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.fontSizePc }}%
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mt-3" style="gap: 12px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.fontSizePc = Math.max(10, localConfig.fontSizePc - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.fontSizePc"
                      :min="10"
                      :max="50"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.fontSizePc = Math.min(50, localConfig.fontSizePc + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>

              <!-- PERFIL ESCOLA SABATINA -->
              <template v-else>
                <!-- Relógio Atual (Hora Atual) -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-clock-outline
                      </v-icon>
                      <span class="text-subtitle-2 font-weight-bold section-title">
                        {{ t('show_clock') }}
                      </span>
                    </div>
                    <v-switch
                      v-model="localConfig.cultAlwaysShowClock"
                      color="primary"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                    {{ t('show_clock_desc') }}
                  </p>

                  <template v-if="localConfig.cultAlwaysShowClock">
                    <!-- Cor da Hora Atual -->
                    <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text);">
                      {{ t('clock_color') }}
                    </div>
                    <div class="color-palette-row mb-4">
                      <div
                        v-for="color in textPaletteColors"
                        :key="color"
                        class="color-circle"
                        :class="{ active: localConfig.cultClockColor === color }"
                        :style="{ backgroundColor: color }"
                        @click="localConfig.cultClockColor = color"
                      />
                      <ModernColorPicker v-model="localConfig.cultClockColor">
                        <template #activator="{ props: pickerProps }">
                          <div
                            v-bind="pickerProps"
                            class="color-circle color-picker-btn"
                            title="Cor personalizada"
                          >
                            <v-icon size="16">
                              mdi-eyedropper
                            </v-icon>
                          </div>
                        </template>
                      </ModernColorPicker>
                    </div>

                    <!-- Tamanho da Hora Atual -->
                    <div class="d-flex align-center justify-space-between mb-1">
                      <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('settings_cult_clock_size') }}
                      </span>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ localConfig.cultClockSizePc }}%
                      </v-chip>
                    </div>
                    <div class="d-flex align-center" style="gap: 12px;">
                      <v-btn
                        icon
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="slider-step-btn"
                        @click="localConfig.cultClockSizePc = Math.max(6, localConfig.cultClockSizePc - 1)"
                      >
                        <v-icon size="18">
                          mdi-minus
                        </v-icon>
                      </v-btn>
                      <v-slider
                        v-model="localConfig.cultClockSizePc"
                        :min="6"
                        :max="30"
                        :step="1"
                        hide-details
                        color="primary"
                        track-color="rgba(150, 150, 150, 0.2)"
                        class="flex-grow-1"
                      />
                      <v-btn
                        icon
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="slider-step-btn"
                        @click="localConfig.cultClockSizePc = Math.min(30, localConfig.cultClockSizePc + 1)"
                      >
                        <v-icon size="18">
                          mdi-plus
                        </v-icon>
                      </v-btn>
                    </div>
                  </template>
                </div>

                <v-divider class="my-4" style="opacity: 0.1;" />

                <!-- Cronômetro (Contagem Regressiva) -->
                <div class="settings-section">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-timer-outline
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('settings_cult_timer_color') }}
                    </span>
                  </div>
                  <div class="color-palette-row mb-4">
                    <div
                      v-for="color in ['#38bdf8', '#ffffff', '#000000', '#f6c32a', '#4ade80', '#fb923c', '#a855f7', '#f43f5e']"
                      :key="color"
                      class="color-circle"
                      :class="{ active: localConfig.cultTimerColor === color }"
                      :style="{ backgroundColor: color }"
                      @click="localConfig.cultTimerColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.cultTimerColor">
                      <template #activator="{ props: pickerProps }">
                        <div
                          v-bind="pickerProps"
                          class="color-circle color-picker-btn"
                          title="Cor personalizada"
                        >
                          <v-icon size="16">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>

                  <!-- Tamanho do Cronômetro -->
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                      {{ t('settings_cult_timer_size') }}
                    </span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.cultTimerSizePc }}%
                    </v-chip>
                  </div>
                  <div class="d-flex align-center" style="gap: 12px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.cultTimerSizePc = Math.max(10, localConfig.cultTimerSizePc - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.cultTimerSizePc"
                      :min="10"
                      :max="45"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.cultTimerSizePc = Math.min(45, localConfig.cultTimerSizePc + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
            </div>

            <!-- ================= SUB-ABA: TEXTOS ================= -->
            <div v-if="activeSubTab === 'text'" class="tab-pane">
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-title
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('settings_custom_text') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('settings_custom_text_desc') }}
                </p>

                <v-text-field
                  v-if="activeProfile === 'general'"
                  v-model="localConfig.customText"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :placeholder="t('custom_text_placeholder')"
                  clearable
                  hide-details
                  class="mb-4"
                />
                <v-text-field
                  v-else
                  v-model="localConfig.cultCustomText"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :placeholder="t('custom_text_placeholder')"
                  clearable
                  hide-details
                  class="mb-4"
                />
              </div>

              <!-- Opções se Título Ativo -->
              <template v-if="currentCustomText">
                <!-- Cor do Texto -->
                <div class="settings-section mb-5">
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text);">
                    {{ t('settings_custom_text_color') }}
                  </div>
                  <div class="color-palette-row">
                    <div
                      v-for="color in textPaletteColors"
                      :key="color"
                      class="color-circle"
                      :class="{ active: currentCustomTextColor === color }"
                      :style="{ backgroundColor: color }"
                      @click="setCustomTextColor(color)"
                    />
                    <ModernColorPicker
                      :model-value="currentCustomTextColor"
                      @update:model-value="setCustomTextColor"
                    >
                      <template #activator="{ props: pickerProps }">
                        <div
                          v-bind="pickerProps"
                          class="color-circle color-picker-btn"
                          title="Cor personalizada"
                        >
                          <v-icon size="16">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>
                </div>

                <!-- Tamanho do Texto -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                      {{ t('settings_custom_text_size') }}
                    </span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ currentCustomTextSize }}%
                    </v-chip>
                  </div>
                  <div class="d-flex align-center" style="gap: 12px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="setCustomTextSize(Math.max(3, currentCustomTextSize - 1))"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      :model-value="currentCustomTextSize"
                      :min="3"
                      :max="25"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                      class="flex-grow-1"
                      @update:model-value="setCustomTextSize"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="setCustomTextSize(Math.min(25, currentCustomTextSize + 1))"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>
                </div>

                <!-- Posição do Texto -->
                <div class="settings-section">
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text);">
                    {{ t('settings_custom_text_pos') }}
                  </div>
                  <PillSwitch
                    v-if="activeProfile === 'general'"
                    v-model="localConfig.customTextPosition"
                    block
                    :items="[
                      { value: 'above', label: t('pos_above'), icon: 'mdi-format-vertical-align-top' },
                      { value: 'below', label: t('pos_below'), icon: 'mdi-format-vertical-align-bottom' },
                      { value: 'free', label: t('pos_free'), icon: 'mdi-cursor-move' },
                    ]"
                  />
                  <PillSwitch
                    v-else
                    v-model="localConfig.cultCustomTextPosition"
                    block
                    :items="[
                      { value: 'above', label: t('pos_above'), icon: 'mdi-format-vertical-align-top' },
                      { value: 'below', label: t('pos_below'), icon: 'mdi-format-vertical-align-bottom' },
                      { value: 'custom', label: t('pos_free'), icon: 'mdi-cursor-move' },
                    ]"
                  />
                </div>
              </template>
            </div>

            <!-- ================= SUB-ABA: POSICIONAMENTO ================= -->
            <div v-if="activeSubTab === 'position'" class="tab-pane">
              <!-- PERFIL PADRÃO -->
              <template v-if="activeProfile === 'general'">
                <!-- Grade 9 Pontos -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-grid
                      </v-icon>
                      <span class="text-subtitle-2 font-weight-bold section-title">
                        Alinhamento Rápido
                      </span>
                    </div>
                    <v-btn
                      variant="tonal"
                      color="primary"
                      size="small"
                      class="rounded-lg text-none font-weight-bold"
                      prepend-icon="mdi-crosshairs-gps"
                      @click="localConfig.posX = 50; localConfig.posY = 50;"
                    >
                      {{ t('center') }}
                    </v-btn>
                  </div>
                  <div class="d-flex justify-center my-3">
                    <PositionAlignmentPicker
                      v-model:x="localConfig.posX"
                      v-model:y="localConfig.posY"
                    />
                  </div>
                </div>

                <!-- Sliders X / Y -->
                <div class="settings-section">
                  <div class="d-flex align-center mb-3">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-tune
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      Ajuste Fino Numérico (%)
                    </span>
                  </div>

                  <div class="mb-4">
                    <div class="d-flex align-center justify-space-between mb-1">
                      <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('pos_x') }}
                      </span>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ localConfig.posX }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="localConfig.posX"
                      :min="5"
                      :max="95"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                    />
                  </div>

                  <div>
                    <div class="d-flex align-center justify-space-between mb-1">
                      <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('pos_y') }}
                      </span>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ localConfig.posY }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="localConfig.posY"
                      :min="5"
                      :max="95"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                    />
                  </div>
                </div>
              </template>

              <!-- PERFIL ESCOLA SABATINA -->
              <template v-else>
                <!-- Modo de Posicionamento -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-arrow-all
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('pos_mode') }}
                    </span>
                  </div>
                  <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                    {{ localConfig.cultPosMode === 'together' ? t('pos_mode_together_desc') : t('pos_mode_individual_desc') }}
                  </p>
                  <PillSwitch
                    v-model="localConfig.cultPosMode"
                    block
                    :items="[
                      { value: 'together', label: t('pos_mode_together'), icon: 'mdi-vector-combine' },
                      { value: 'individual', label: t('pos_mode_individual'), icon: 'mdi-vector-difference' },
                    ]"
                  />
                </div>

                <!-- Se Individual: Seletor de Alvo -->
                <div v-if="localConfig.cultPosMode === 'individual'" class="settings-section mb-5">
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text);">
                    {{ t('pos_adjusting') }}
                  </div>
                  <PillSwitch
                    v-model="cultActivePosTarget"
                    block
                    :items="cultTargetItems"
                  />
                </div>

                <!-- Grade 9 Pontos Culto -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      Alinhamento Rápido
                    </span>
                    <v-btn
                      variant="tonal"
                      color="primary"
                      size="small"
                      class="rounded-lg text-none font-weight-bold"
                      prepend-icon="mdi-crosshairs-gps"
                      @click="centerCurrentCultTarget"
                    >
                      {{ t('center') }}
                    </v-btn>
                  </div>
                  <div class="d-flex justify-center my-3">
                    <PositionAlignmentPicker
                      v-if="localConfig.cultPosMode === 'together'"
                      v-model:x="localConfig.cultPosX"
                      v-model:y="localConfig.cultPosY"
                    />
                    <PositionAlignmentPicker
                      v-else-if="cultActivePosTarget === 'clock'"
                      v-model:x="localConfig.cultClockX"
                      v-model:y="localConfig.cultClockY"
                    />
                    <PositionAlignmentPicker
                      v-else-if="cultActivePosTarget === 'text'"
                      v-model:x="localConfig.cultTextX"
                      v-model:y="localConfig.cultTextY"
                    />
                    <PositionAlignmentPicker
                      v-else
                      v-model:x="localConfig.cultTimerX"
                      v-model:y="localConfig.cultTimerY"
                    />
                  </div>
                </div>

                <!-- Sliders X / Y Culto -->
                <div class="settings-section">
                  <div class="mb-4">
                    <div class="d-flex align-center justify-space-between mb-1">
                      <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('pos_x') }}
                      </span>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ currentCultTargetX }}%
                      </v-chip>
                    </div>
                    <v-slider
                      :model-value="currentCultTargetX"
                      :min="5"
                      :max="95"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                      @update:model-value="setCultTargetX"
                    />
                  </div>

                  <div>
                    <div class="d-flex align-center justify-space-between mb-1">
                      <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                        {{ t('pos_y') }}
                      </span>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ currentCultTargetY }}%
                      </v-chip>
                    </div>
                    <v-slider
                      :model-value="currentCultTargetY"
                      :min="5"
                      :max="95"
                      :step="1"
                      hide-details
                      color="primary"
                      track-color="rgba(150, 150, 150, 0.2)"
                      @update:model-value="setCultTargetY"
                    />
                  </div>
                </div>
              </template>
            </div>

            <!-- ================= SUB-ABA: COMPORTAMENTO ================= -->
            <div v-if="activeSubTab === 'behavior'" class="tab-pane">
              <!-- PERFIL PADRÃO -->
              <template v-if="activeProfile === 'general'">
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div>
                      <div class="text-subtitle-2 font-weight-bold section-title">
                        {{ t('settings_visual_alert') }}
                      </div>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_visual_alert_desc') }}
                      </div>
                    </div>
                    <v-switch
                      v-model="localConfig.visualAlert"
                      color="primary"
                      hide-details
                      density="compact"
                    />
                  </div>
                </div>

                <div class="settings-section">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div>
                      <div class="text-subtitle-2 font-weight-bold section-title">
                        {{ t('settings_audio_alert') }}
                      </div>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_audio_alert_desc') }}
                      </div>
                    </div>
                    <v-switch
                      v-model="localConfig.audioAlert"
                      color="primary"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <v-btn
                    v-if="localConfig.audioAlert"
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="rounded-lg text-none mt-2"
                    prepend-icon="mdi-volume-high"
                    @click="testSound"
                  >
                    Testar Som
                  </v-btn>
                </div>
              </template>

              <!-- PERFIL ESCOLA SABATINA -->
              <template v-else>
                <!-- Contagem Negativa -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div>
                      <div class="text-subtitle-2 font-weight-bold section-title">
                        {{ t('settings_cult_negative') }}
                      </div>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                        {{ t('settings_cult_negative_desc') }}
                      </div>
                    </div>
                    <v-switch
                      v-model="localConfig.cultAllowNegative"
                      color="primary"
                      hide-details
                      density="compact"
                    />
                  </div>
                </div>

                <!-- Cor do Alerta -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="error" class="mr-2">
                      mdi-alert-circle-outline
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('warning_color') }}
                    </span>
                  </div>
                  <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                    {{ t('warning_color_desc') }}
                  </p>
                  <div class="color-palette-row">
                    <div
                      v-for="color in ['#ef4444', '#f87171', '#dc2626', '#b91c1c', '#f97316', '#eab308']"
                      :key="color"
                      class="color-circle"
                      :class="{ active: localConfig.cultWarningColor === color }"
                      :style="{ backgroundColor: color }"
                      @click="localConfig.cultWarningColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.cultWarningColor">
                      <template #activator="{ props: pickerProps }">
                        <div
                          v-bind="pickerProps"
                          class="color-circle color-picker-btn"
                          title="Cor de alerta"
                        >
                          <v-icon size="16">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>
                </div>

                <!-- Avisos Sonoros do Culto -->
                <div class="settings-section">
                  <div class="text-subtitle-2 font-weight-bold section-title mb-3">
                    Avisos Sonoros
                  </div>

                  <div class="d-flex flex-column" style="gap: 12px;">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <span class="text-body-2" style="color: var(--sidebar-text);">{{ t('settings_cult_audio_start') }}</span>
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="primary"
                          class="ml-2"
                          @click="testCultSound('start')"
                        >
                          <v-icon size="16">
                            mdi-volume-high
                          </v-icon>
                        </v-btn>
                      </div>
                      <v-switch
                        v-model="localConfig.cultAudioStart"
                        color="primary"
                        hide-details
                        density="compact"
                      />
                    </div>

                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <span class="text-body-2" style="color: var(--sidebar-text);">{{ t('settings_cult_audio_5min') }}</span>
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="primary"
                          class="ml-2"
                          @click="testCultSound('5min')"
                        >
                          <v-icon size="16">
                            mdi-volume-high
                          </v-icon>
                        </v-btn>
                      </div>
                      <v-switch
                        v-model="localConfig.cultAudio5min"
                        color="primary"
                        hide-details
                        density="compact"
                      />
                    </div>

                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <span class="text-body-2" style="color: var(--sidebar-text);">{{ t('settings_cult_audio_1min') }}</span>
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="primary"
                          class="ml-2"
                          @click="testCultSound('1min')"
                        >
                          <v-icon size="16">
                            mdi-volume-high
                          </v-icon>
                        </v-btn>
                      </div>
                      <v-switch
                        v-model="localConfig.cultAudio1min"
                        color="primary"
                        hide-details
                        density="compact"
                      />
                    </div>

                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <span class="text-body-2" style="color: var(--sidebar-text);">{{ t('settings_cult_audio_end') }}</span>
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="primary"
                          class="ml-2"
                          @click="testCultSound('end')"
                        >
                          <v-icon size="16">
                            mdi-volume-high
                          </v-icon>
                        </v-btn>
                      </div>
                      <v-switch
                        v-model="localConfig.cultAudioEnd"
                        color="primary"
                        hide-details
                        density="compact"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- ================= SUB-ABA: PRÉVIA MOBILE ================= -->
            <div v-if="activeSubTab === 'preview'" class="tab-pane">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-monitor-dashboard
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('preview') }}
                  </span>
                </div>
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ t('preview_ratio') }}
                </v-chip>
              </div>

              <!-- Box 16:9 Mobile com Arraste -->
              <div
                class="preview-box-16-9 position-relative overflow-hidden cursor-move user-select-none"
                :style="previewBoxContainerStyle"
                @pointerdown="handlePreviewPointerDown"
              >
                <!-- Modo Padrão -->
                <template v-if="activeProfile === 'general'">
                  <div
                    class="position-absolute d-flex flex-column"
                    :style="previewStandardStyle"
                  >
                    <div
                      v-if="localConfig.customText && (localConfig.customTextPosition === 'above' || !localConfig.customTextPosition)"
                      class="font-weight-bold mb-1"
                      :style="previewStandardTitleStyle"
                    >
                      {{ localConfig.customText }}
                    </div>
                    <div
                      class="font-weight-black font-tabular"
                      :style="previewStandardTimerStyle"
                    >
                      05:00
                    </div>
                    <div
                      v-if="localConfig.customText && localConfig.customTextPosition === 'below'"
                      class="font-weight-bold mt-1"
                      :style="previewStandardTitleStyle"
                    >
                      {{ localConfig.customText }}
                    </div>
                  </div>
                </template>

                <!-- Modo Escola Sabatina -->
                <template v-else>
                  <!-- Escola Sabatina: Elementos Juntos -->
                  <div
                    v-if="localConfig.cultPosMode === 'together'"
                    class="position-absolute d-flex flex-column align-center"
                    :style="previewCultTogetherStyle"
                  >
                    <div
                      v-if="effectivePreviewCultCustomText && (localConfig.cultCustomTextPosition === 'above' || !localConfig.cultCustomTextPosition)"
                      class="font-weight-bold mb-1"
                      :style="previewCultTitleStyle"
                    >
                      {{ effectivePreviewCultCustomText }}
                    </div>
                    <div
                      v-if="localConfig.cultAlwaysShowClock"
                      class="font-weight-bold font-tabular mb-1"
                      :style="previewCultClockStyle"
                    >
                      10:15
                    </div>
                    <div
                      class="font-weight-black font-tabular"
                      :style="previewCultTimerStyle"
                    >
                      {{ previewAlert ? '-02:15' : '14:32' }}
                    </div>
                  </div>

                  <!-- Escola Sabatina: Individual -->
                  <template v-else>
                    <div
                      v-if="localConfig.cultAlwaysShowClock"
                      class="position-absolute font-weight-bold font-tabular"
                      :style="previewCultIndividualClockStyle"
                    >
                      10:15
                    </div>
                    <div
                      class="position-absolute font-weight-black font-tabular"
                      :style="previewCultIndividualTimerStyle"
                    >
                      {{ previewAlert ? '-02:15' : '14:32' }}
                    </div>
                    <div
                      v-if="effectivePreviewCultCustomText"
                      class="position-absolute font-weight-bold"
                      :style="previewCultIndividualTextStyle"
                    >
                      {{ effectivePreviewCultCustomText }}
                    </div>
                  </template>
                </template>
              </div>

              <!-- Botão Simular Término -->
              <div v-if="activeProfile === 'cult'" class="d-flex justify-center mt-3">
                <v-btn
                  variant="tonal"
                  :color="previewAlert ? 'error' : 'primary'"
                  size="small"
                  class="rounded-lg text-none font-weight-bold"
                  :prepend-icon="previewAlert ? 'mdi-bell-off' : 'mdi-bell-alert'"
                  @click="previewAlert = !previewAlert"
                >
                  {{ previewAlert ? t('simulate_normal') : t('simulate_time_up') }}
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Coluna 3: Pré-visualização Fixa (Sticky à Direita) -->
          <div class="timer-config-preview-col flex-shrink-0 d-flex flex-column pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-monitor-dashboard
                </v-icon>
                <span class="text-subtitle-2 font-weight-bold section-title">
                  {{ t('preview') }}
                </span>
              </div>
              <v-chip
                size="x-small"
                color="primary"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ t('preview_ratio') }}
              </v-chip>
            </div>

            <!-- Preview Box 16:9 com Arraste Interativo -->
            <div
              ref="previewBoxRef"
              class="preview-box-16-9 position-relative overflow-hidden cursor-move user-select-none"
              :style="previewBoxContainerStyle"
              @pointerdown="handlePreviewPointerDown"
            >
              <!-- Modo Padrão -->
              <template v-if="activeProfile === 'general'">
                <!-- Título Livre -->
                <div
                  v-if="localConfig.customText && localConfig.customTextPosition === 'free'"
                  class="position-absolute font-weight-bold"
                  :style="previewStandardFreeTextStyle"
                >
                  {{ localConfig.customText }}
                </div>

                <div
                  class="position-absolute d-flex flex-column"
                  :style="previewStandardStyle"
                >
                  <div
                    v-if="localConfig.customText && (localConfig.customTextPosition === 'above' || !localConfig.customTextPosition)"
                    class="font-weight-bold mb-1"
                    :style="previewStandardTitleStyle"
                  >
                    {{ localConfig.customText }}
                  </div>
                  <div
                    class="font-weight-black font-tabular"
                    :style="previewStandardTimerStyle"
                  >
                    05:00
                  </div>
                  <div
                    v-if="localConfig.customText && localConfig.customTextPosition === 'below'"
                    class="font-weight-bold mt-1"
                    :style="previewStandardTitleStyle"
                  >
                    {{ localConfig.customText }}
                  </div>
                </div>
              </template>

              <!-- Modo Escola Sabatina -->
              <template v-else>
                <!-- Escola Sabatina: Elementos Juntos -->
                <div
                  v-if="localConfig.cultPosMode === 'together'"
                  class="position-absolute d-flex flex-column align-center"
                  :style="previewCultTogetherStyle"
                >
                  <div
                    v-if="effectivePreviewCultCustomText && (localConfig.cultCustomTextPosition === 'above' || !localConfig.cultCustomTextPosition)"
                    class="font-weight-bold mb-1"
                    :style="previewCultTitleStyle"
                  >
                    {{ effectivePreviewCultCustomText }}
                  </div>
                  <div
                    v-if="localConfig.cultAlwaysShowClock"
                    class="font-weight-bold font-tabular mb-1"
                    :style="previewCultClockStyle"
                  >
                    10:15
                  </div>
                  <div
                    class="font-weight-black font-tabular"
                    :style="previewCultTimerStyle"
                  >
                    {{ previewAlert ? '-02:15' : '14:32' }}
                  </div>
                  <div
                    v-if="effectivePreviewCultCustomText && localConfig.cultCustomTextPosition === 'below'"
                    class="font-weight-bold mt-1"
                    :style="previewCultTitleStyle"
                  >
                    {{ effectivePreviewCultCustomText }}
                  </div>
                </div>

                <!-- Escola Sabatina: Individual -->
                <template v-else>
                  <div
                    v-if="localConfig.cultAlwaysShowClock"
                    class="position-absolute font-weight-bold font-tabular cursor-pointer"
                    :style="previewCultIndividualClockStyle"
                    @pointerdown.stop="selectAndDragCult('clock', $event)"
                  >
                    10:15
                  </div>
                  <div
                    class="position-absolute font-weight-black font-tabular cursor-pointer"
                    :style="previewCultIndividualTimerStyle"
                    @pointerdown.stop="selectAndDragCult('timer', $event)"
                  >
                    {{ previewAlert ? '-02:15' : '14:32' }}
                  </div>
                  <div
                    v-if="effectivePreviewCultCustomText"
                    class="position-absolute font-weight-bold cursor-pointer"
                    :style="previewCultIndividualTextStyle"
                    @pointerdown.stop="selectAndDragCult('text', $event)"
                  >
                    {{ effectivePreviewCultCustomText }}
                  </div>
                </template>
              </template>
            </div>

            <!-- Botão Simular Tempo Esgotado (apenas Escola Sabatina) -->
            <div v-if="activeProfile === 'cult'" class="d-flex justify-center mt-3">
              <v-btn
                variant="tonal"
                :color="previewAlert ? 'error' : 'primary'"
                size="small"
                class="rounded-lg text-none font-weight-bold w-100"
                :prepend-icon="previewAlert ? 'mdi-bell-off' : 'mdi-bell-alert'"
                @click="previewAlert = !previewAlert"
              >
                {{ previewAlert ? t('simulate_normal') : t('simulate_time_up') }}
              </v-btn>
            </div>

            <!-- Dica de Arraste -->
            <div class="preview-info-box mt-4 pa-3 rounded-lg d-flex align-start" style="gap: 10px;">
              <v-icon size="18" color="primary" class="mt-0.5">
                mdi-cursor-move
              </v-icon>
              <div class="text-caption preview-info-text">
                <strong style="color: var(--sidebar-text);">{{ t('drag_hint_title') }}</strong>
                {{ t('drag_hint') }}
              </div>
            </div>
          </div>
        </div>

        <v-divider style="border-color: var(--border-color); opacity: 0.6;" />

        <!-- Footer Fixo -->
        <div class="timer-config-footer px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
          <v-btn
            variant="tonal"
            color="error"
            class="rounded-lg text-none px-5 font-weight-bold"
            @click="showResetConfirm = true"
          >
            {{ t('restore_default') }}
          </v-btn>

          <div class="d-flex align-center" style="gap: 12px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none px-6 font-weight-bold"
              @click="cancel"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              color="primary"
              class="rounded-lg text-none px-6 font-weight-bold"
              @click="saveAndClose"
            >
              {{ t('apply') }}
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Diálogo de Confirmação: Restaurar Padrão do Perfil Ativo -->
      <v-dialog v-model="showResetConfirm" max-width="440">
        <v-card class="rounded-xl pa-5" style="background: var(--card-bg, #ffffff);">
          <div class="d-flex align-center mb-3" style="gap: 12px;">
            <v-avatar color="error" variant="tonal" size="40">
              <v-icon color="error" size="22">
                mdi-alert-outline
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                {{ t('restore_profile_confirm_title') }}
              </h3>
            </div>
          </div>
          <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
            {{ t('restore_profile_confirm_desc') }}
          </p>
          <div class="d-flex justify-end" style="gap: 10px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none font-weight-bold"
              @click="showResetConfirm = false"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              color="error"
              class="rounded-lg text-none font-weight-bold"
              @click="confirmResetProfile"
            >
              {{ t('restore_default') }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import PositionAlignmentPicker from "@/components/inputs/PositionAlignmentPicker.vue";
import PillSwitch from "@/components/inputs/PillSwitch.vue";
import { playSchoolBellAlert, stopSchoolBellAlert, playCultAlert } from "../../helpers/audioAlert";

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
    activeProfile: "general" as "general" | "cult",
    activeSubTab: "appearance" as "appearance" | "display" | "text" | "position" | "behavior" | "preview",
    cultActivePosTarget: "timer" as "timer" | "clock" | "text",
    previewAlert: false,
    showResetConfirm: false,
    savedWallpapers: [] as string[],
    bgPaletteColors: [
      "#000000",
      "#1A1A1A",
      "#FFFFFF",
      "#1976D2",
      "#388E3C",
      "#D32F2F",
      "#F57C00",
      "#7B1FA2",
    ],
    textPaletteColors: [
      "#FFFFFF",
      "#000000",
      "#38BDF8",
      "#F6C32A",
      "#4ADE80",
      "#FB923C",
      "#A855F7",
      "#F43F5E",
    ],
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
      cultCustomText: "",
      cultCustomTextColor: "#ffffff",
      cultCustomTextSizePc: 8,
      cultCustomTextPosition: "above" as "above" | "below" | "custom",
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
      cultCustomText: "",
      cultCustomTextColor: "#ffffff",
      cultCustomTextSizePc: 8,
      cultCustomTextPosition: "above" as "above" | "below" | "custom",
    },
    initialConfig: null as any,
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
    currentBgColor(): string {
      return this.activeProfile === "general"
        ? (this.localConfig.bgColor || "#000000")
        : (this.localConfig.cultBgColor || "#000000");
    },
    currentBgImage(): string | null {
      return this.activeProfile === "general"
        ? this.localConfig.bgImage
        : this.localConfig.cultBgImage;
    },
    currentCustomText(): string {
      return this.activeProfile === "general"
        ? this.localConfig.customText
        : (this.localConfig.cultCustomText || "");
    },
    currentCustomTextColor(): string {
      return this.activeProfile === "general"
        ? (this.localConfig.customTextColor || "#ffffff")
        : (this.localConfig.cultCustomTextColor || "#ffffff");
    },
    currentCustomTextSize(): number {
      return this.activeProfile === "general"
        ? (this.localConfig.customTextSizePc || 8)
        : (this.localConfig.cultCustomTextSizePc || 8);
    },
    effectivePreviewCultCustomText(): string {
      return this.localConfig.cultCustomText || "";
    },
    cultTargetItems(): any[] {
      const items = [
        { value: "timer", label: this.t("pos_target_timer"), icon: "mdi-timer-outline" },
        { value: "clock", label: this.t("pos_target_clock"), icon: "mdi-clock-outline" },
      ];
      if (this.effectivePreviewCultCustomText) {
        items.push({ value: "text", label: this.t("pos_target_text"), icon: "mdi-format-title" });
      }
      return items;
    },
    currentCultTargetX(): number {
      if (this.localConfig.cultPosMode === "together") return this.localConfig.cultPosX ?? 50;
      if (this.cultActivePosTarget === "clock") return this.localConfig.cultClockX ?? 50;
      if (this.cultActivePosTarget === "text") return this.localConfig.cultTextX ?? 50;
      return this.localConfig.cultTimerX ?? 50;
    },
    currentCultTargetY(): number {
      if (this.localConfig.cultPosMode === "together") return this.localConfig.cultPosY ?? 50;
      if (this.cultActivePosTarget === "clock") return this.localConfig.cultClockY ?? 35;
      if (this.cultActivePosTarget === "text") return this.localConfig.cultTextY ?? 15;
      return this.localConfig.cultTimerY ?? 60;
    },
    previewBoxContainerStyle(): Record<string, string> {
      const bg = this.currentBgColor;
      const img = this.currentBgImage;
      return {
        backgroundColor: bg,
        backgroundImage: img ? `url('${img}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        color: this.activeProfile === "general" ? this.localConfig.fontColor : this.localConfig.cultTimerColor,
      };
    },
    previewStandardStyle(): Record<string, any> {
      const x = this.localConfig.posX ?? 50;
      const y = this.localConfig.posY ?? 50;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        alignItems: x <= 30 ? "flex-start" : x >= 70 ? "flex-end" : "center",
        textAlign: x <= 30 ? "left" : x >= 70 ? "right" : "center",
        maxWidth: "94%",
        width: "max-content",
        whiteSpace: "nowrap",
      };
    },
    previewStandardTimerStyle(): Record<string, any> {
      return {
        fontSize: `${this.localConfig.fontSizePc * 2.2}px`,
        color: this.localConfig.fontColor,
        textShadow: this.localConfig.bgImage ? "0 4px 16px rgba(0,0,0,0.85)" : "none",
        lineHeight: "1.05",
      };
    },
    previewStandardTitleStyle(): Record<string, any> {
      return {
        fontSize: `${(this.localConfig.customTextSizePc || 8) * 1.5}px`,
        color: this.localConfig.customTextColor || this.localConfig.fontColor,
        textShadow: this.localConfig.bgImage ? "0 4px 12px rgba(0,0,0,0.85)" : "none",
        lineHeight: "1.2",
      };
    },
    previewStandardFreeTextStyle(): Record<string, any> {
      const x = this.localConfig.customTextX ?? 50;
      const y = this.localConfig.customTextY ?? 20;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        fontSize: `${(this.localConfig.customTextSizePc || 8) * 1.6}px`,
        color: this.localConfig.customTextColor || this.localConfig.fontColor,
        textShadow: this.localConfig.bgImage ? "0 4px 12px rgba(0,0,0,0.85)" : "none",
      };
    },
    previewCultTogetherStyle(): Record<string, any> {
      const x = this.localConfig.cultPosX ?? 50;
      const y = this.localConfig.cultPosY ?? 50;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        maxWidth: "94%",
        width: "max-content",
        whiteSpace: "nowrap",
      };
    },
    previewCultClockStyle(): Record<string, any> {
      return {
        fontSize: `${(this.localConfig.cultClockSizePc || 12) * 1.6}px`,
        color: this.localConfig.cultClockColor,
        textShadow: this.localConfig.cultBgImage ? "0 3px 12px rgba(0,0,0,0.8)" : "none",
        lineHeight: "1.1",
      };
    },
    previewCultTimerStyle(): Record<string, any> {
      const timerColor = this.previewAlert
        ? (this.localConfig.cultWarningColor || "#ef4444")
        : (this.localConfig.cultTimerColor || "#38bdf8");
      return {
        fontSize: `${(this.localConfig.cultTimerSizePc || 22) * 2.0}px`,
        color: timerColor,
        textShadow: this.localConfig.cultBgImage ? "0 4px 16px rgba(0,0,0,0.85)" : "none",
        lineHeight: "1.05",
      };
    },
    previewCultTitleStyle(): Record<string, any> {
      return {
        fontSize: `${(this.localConfig.cultCustomTextSizePc || 8) * 1.5}px`,
        color: this.localConfig.cultCustomTextColor || "#ffffff",
        textShadow: this.localConfig.cultBgImage ? "0 3px 12px rgba(0,0,0,0.8)" : "none",
        lineHeight: "1.2",
      };
    },
    previewCultIndividualClockStyle(): Record<string, any> {
      const x = this.localConfig.cultClockX ?? 50;
      const y = this.localConfig.cultClockY ?? 35;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        fontSize: `${(this.localConfig.cultClockSizePc || 12) * 1.6}px`,
        color: this.localConfig.cultClockColor,
        textShadow: this.localConfig.cultBgImage ? "0 3px 12px rgba(0,0,0,0.8)" : "none",
        border: this.cultActivePosTarget === "clock" ? "1px dashed var(--accent-blue, #0097d7)" : "1px dashed transparent",
        borderRadius: "4px",
        padding: "2px 6px",
      };
    },
    previewCultIndividualTimerStyle(): Record<string, any> {
      const x = this.localConfig.cultTimerX ?? 50;
      const y = this.localConfig.cultTimerY ?? 60;
      const timerColor = this.previewAlert
        ? (this.localConfig.cultWarningColor || "#ef4444")
        : (this.localConfig.cultTimerColor || "#38bdf8");
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        fontSize: `${(this.localConfig.cultTimerSizePc || 22) * 2.0}px`,
        color: timerColor,
        textShadow: this.localConfig.cultBgImage ? "0 4px 16px rgba(0,0,0,0.85)" : "none",
        border: this.cultActivePosTarget === "timer" ? "1px dashed var(--accent-blue, #0097d7)" : "1px dashed transparent",
        borderRadius: "4px",
        padding: "2px 6px",
      };
    },
    previewCultIndividualTextStyle(): Record<string, any> {
      const x = this.localConfig.cultTextX ?? 50;
      const y = this.localConfig.cultTextY ?? 15;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        fontSize: `${(this.localConfig.cultCustomTextSizePc || 8) * 1.5}px`,
        color: this.localConfig.cultCustomTextColor || "#ffffff",
        textShadow: this.localConfig.cultBgImage ? "0 3px 12px rgba(0,0,0,0.8)" : "none",
        border: this.cultActivePosTarget === "text" ? "1px dashed var(--accent-blue, #0097d7)" : "1px dashed transparent",
        borderRadius: "4px",
        padding: "2px 6px",
      };
    },
  },
  watch: {
    internalValue(val: boolean) {
      if (val) {
        this.loadConfig();
        if (this.initialTab) {
          this.activeProfile = this.initialTab === "cult" ? "cult" : "general";
        }
      }
    },
  },
  mounted() {
    this.loadConfig();
    if (this.initialTab) {
      this.activeProfile = this.initialTab === "cult" ? "cult" : "general";
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
      const saved =
        this.$appdata.get(`modules.${this.moduleId}.config`) ||
        this.$userdata.get(`modules.${this.moduleId}.config`);
      if (saved) {
        this.localConfig = { ...this.defaultConfig, ...saved };
      } else {
        this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
      }
      this.initialConfig = JSON.parse(JSON.stringify(this.localConfig));
      this.loadSavedWallpapers();
    },
    loadSavedWallpapers() {
      const saved = this.$userdata.get("timer_wallpapers");
      if (Array.isArray(saved)) {
        this.savedWallpapers = saved;
      }
    },
    removeSavedWallpaper(index: number) {
      const removed = this.savedWallpapers[index];
      this.savedWallpapers.splice(index, 1);
      this.$userdata.set("timer_wallpapers", this.savedWallpapers);
      if (this.localConfig.bgImage === removed) this.localConfig.bgImage = null;
      if (this.localConfig.cultBgImage === removed) this.localConfig.cultBgImage = null;
    },
    setBgColor(color: string) {
      if (this.activeProfile === "general") {
        this.localConfig.bgColor = color;
      } else {
        this.localConfig.cultBgColor = color;
      }
    },
    setBgImage(img: string | null) {
      if (this.activeProfile === "general") {
        this.localConfig.bgImage = img;
      } else {
        this.localConfig.cultBgImage = img;
      }
    },
    setCustomTextColor(color: string) {
      if (this.activeProfile === "general") {
        this.localConfig.customTextColor = color;
      } else {
        this.localConfig.cultCustomTextColor = color;
      }
    },
    setCustomTextSize(size: number) {
      if (this.activeProfile === "general") {
        this.localConfig.customTextSizePc = size;
      } else {
        this.localConfig.cultCustomTextSizePc = size;
      }
    },
    onBgImageUpload(event: Event) {
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
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              this.applySelectedWallpaper(dataUrl);
              return;
            }
          }
          const rawUrl = e.target?.result as string;
          this.applySelectedWallpaper(rawUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    applySelectedWallpaper(dataUrl: string) {
      this.setBgImage(dataUrl);
      if (!this.savedWallpapers.includes(dataUrl)) {
        this.savedWallpapers.unshift(dataUrl);
        if (this.savedWallpapers.length > 8) {
          this.savedWallpapers = this.savedWallpapers.slice(0, 8);
        }
        this.$userdata.set("timer_wallpapers", this.savedWallpapers);
      }
    },
    confirmResetProfile() {
      if (this.activeProfile === "general") {
        this.localConfig.fontColor = this.defaultConfig.fontColor;
        this.localConfig.bgColor = this.defaultConfig.bgColor;
        this.localConfig.bgImage = this.defaultConfig.bgImage;
        this.localConfig.fontSizePc = this.defaultConfig.fontSizePc;
        this.localConfig.posX = this.defaultConfig.posX;
        this.localConfig.posY = this.defaultConfig.posY;
        this.localConfig.customText = this.defaultConfig.customText;
        this.localConfig.customTextSizePc = this.defaultConfig.customTextSizePc;
        this.localConfig.customTextColor = this.defaultConfig.customTextColor;
        this.localConfig.customTextPosition = this.defaultConfig.customTextPosition;
        this.localConfig.visualAlert = this.defaultConfig.visualAlert;
        this.localConfig.audioAlert = this.defaultConfig.audioAlert;
      } else {
        this.localConfig.cultBgColor = this.defaultConfig.cultBgColor;
        this.localConfig.cultBgImage = this.defaultConfig.cultBgImage;
        this.localConfig.cultClockColor = this.defaultConfig.cultClockColor;
        this.localConfig.cultTimerColor = this.defaultConfig.cultTimerColor;
        this.localConfig.cultWarningColor = this.defaultConfig.cultWarningColor;
        this.localConfig.cultAlwaysShowClock = this.defaultConfig.cultAlwaysShowClock;
        this.localConfig.cultAllowNegative = this.defaultConfig.cultAllowNegative;
        this.localConfig.cultAudioStart = this.defaultConfig.cultAudioStart;
        this.localConfig.cultAudio5min = this.defaultConfig.cultAudio5min;
        this.localConfig.cultAudio1min = this.defaultConfig.cultAudio1min;
        this.localConfig.cultAudioEnd = this.defaultConfig.cultAudioEnd;
        this.localConfig.cultClockSizePc = this.defaultConfig.cultClockSizePc;
        this.localConfig.cultTimerSizePc = this.defaultConfig.cultTimerSizePc;
        this.localConfig.cultPosMode = this.defaultConfig.cultPosMode;
        this.localConfig.cultPosX = this.defaultConfig.cultPosX;
        this.localConfig.cultPosY = this.defaultConfig.cultPosY;
        this.localConfig.cultClockX = this.defaultConfig.cultClockX;
        this.localConfig.cultClockY = this.defaultConfig.cultClockY;
        this.localConfig.cultTimerX = this.defaultConfig.cultTimerX;
        this.localConfig.cultTimerY = this.defaultConfig.cultTimerY;
        this.localConfig.cultTextX = this.defaultConfig.cultTextX;
        this.localConfig.cultTextY = this.defaultConfig.cultTextY;
        this.localConfig.cultCustomText = this.defaultConfig.cultCustomText;
        this.localConfig.cultCustomTextColor = this.defaultConfig.cultCustomTextColor;
        this.localConfig.cultCustomTextSizePc = this.defaultConfig.cultCustomTextSizePc;
        this.localConfig.cultCustomTextPosition = this.defaultConfig.cultCustomTextPosition;
      }
      this.showResetConfirm = false;
    },
    centerCurrentCultTarget() {
      if (this.localConfig.cultPosMode === "together") {
        this.localConfig.cultPosX = 50;
        this.localConfig.cultPosY = 50;
      } else if (this.cultActivePosTarget === "clock") {
        this.localConfig.cultClockX = 50;
        this.localConfig.cultClockY = 35;
      } else if (this.cultActivePosTarget === "text") {
        this.localConfig.cultTextX = 50;
        this.localConfig.cultTextY = 15;
      } else {
        this.localConfig.cultTimerX = 50;
        this.localConfig.cultTimerY = 60;
      }
    },
    setCultTargetX(val: number) {
      if (this.localConfig.cultPosMode === "together") this.localConfig.cultPosX = val;
      else if (this.cultActivePosTarget === "clock") this.localConfig.cultClockX = val;
      else if (this.cultActivePosTarget === "text") this.localConfig.cultTextX = val;
      else this.localConfig.cultTimerX = val;
    },
    setCultTargetY(val: number) {
      if (this.localConfig.cultPosMode === "together") this.localConfig.cultPosY = val;
      else if (this.cultActivePosTarget === "clock") this.localConfig.cultClockY = val;
      else if (this.cultActivePosTarget === "text") this.localConfig.cultTextY = val;
      else this.localConfig.cultTimerY = val;
    },
    handlePreviewPointerDown(e: PointerEvent) {
      if (this.activeProfile === "general") {
        this.startDragStandard(e);
      } else if (this.localConfig.cultPosMode === "together") {
        this.startDragCultTogether(e);
      }
    },
    selectAndDragCult(target: "timer" | "clock" | "text", e: PointerEvent) {
      this.cultActivePosTarget = target;
      this.startDragCultIndividual(e);
    },
    startDragStandard(e: PointerEvent) {
      const el = (this.$refs.previewBoxRef || e.currentTarget) as HTMLElement;
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
    startDragCultTogether(e: PointerEvent) {
      const el = (this.$refs.previewBoxRef || e.currentTarget) as HTMLElement;
      if (!el) return;
      const updatePos = (evt: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const rawX = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
        const rawY = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
        const clampedX = Math.max(5, Math.min(95, rawX));
        const clampedY = Math.max(5, Math.min(95, rawY));
        this.localConfig.cultPosX = clampedX;
        this.localConfig.cultPosY = clampedY;
        this.localConfig.posX = clampedX;
        this.localConfig.posY = clampedY;
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
    startDragCultIndividual(e: PointerEvent) {
      const el = (this.$refs.previewBoxRef || (e.currentTarget as HTMLElement)?.closest(".preview-box-16-9")) as HTMLElement;
      if (!el) return;
      const updatePos = (evt: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const rawX = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
        const rawY = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
        const clampedX = Math.max(5, Math.min(95, rawX));
        const clampedY = Math.max(5, Math.min(95, rawY));
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
    testSound() {
      playSchoolBellAlert();
    },
    testCultSound(type: "start" | "5min" | "1min" | "end") {
      playCultAlert(type);
    },
    saveAndClose() {
      const cloned = JSON.parse(JSON.stringify(this.localConfig));
      this.$appdata.set(`modules.${this.moduleId}.config`, cloned);
      this.$userdata.set(`modules.${this.moduleId}.config`, cloned);
      this.close();
    },
    cancel() {
      if (this.initialConfig) {
        this.localConfig = JSON.parse(JSON.stringify(this.initialConfig));
      }
      this.close();
    },
    close() {
      stopSchoolBellAlert();
      this.previewAlert = false;
      this.internalValue = false;
    },
  },
});
</script>

<style scoped>
.timer-config-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
}

.timer-config-modal {
  background: var(--card-bg, #ffffff) !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
  container-type: inline-size;
  container-name: config-modal;
  border: 1px solid var(--border-color);
  border-radius: 20px !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  height: 640px;
}

.timer-config-header {
  background: rgba(150, 150, 150, 0.03);
}

.timer-config-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-config-title {
  color: var(--sidebar-text);
  line-height: 1.2;
}

.timer-config-subtitle {
  color: var(--sidebar-text-secondary);
}

.timer-config-close-btn {
  color: var(--sidebar-text-secondary);
  border-radius: 10px !important;
  transition: all 0.2s ease;
}

.timer-config-close-btn:hover {
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.1);
}

/* Body & Columns */
.timer-config-body {
  min-height: 0;
}

/* Coluna 1: Sub-Abas de Navegação */
.timer-config-nav-col {
  width: 175px;
  background: rgba(150, 150, 150, 0.03);
  border-right: 1px solid var(--border-color);
  gap: 6px;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--sidebar-text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-tab-btn:hover {
  background: rgba(150, 150, 150, 0.08);
  color: var(--sidebar-text);
}

.nav-tab-btn.active {
  background: rgb(var(--v-theme-primary)) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.nav-tab-preview-only {
  display: none !important;
}

/* Coluna 2: Configurações */
.timer-config-content-col {
  background: var(--card-bg);
}

.section-title {
  color: var(--sidebar-text);
}

/* Paleta de Cores */
.color-palette-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.color-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(150, 150, 150, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.color-circle:hover {
  transform: scale(1.1);
}

.color-circle.active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.35);
  transform: scale(1.15);
}

.color-picker-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  background: rgba(150, 150, 150, 0.06);
  color: var(--sidebar-text-secondary);
}

/* Miniaturas de Wallpapers */
.wallpaper-thumbs-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.wallpaper-thumb-card {
  width: 72px;
  height: 48px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background-size: cover;
  background-position: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.wallpaper-thumb-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.wallpaper-thumb-card.active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-2px);
}

.no-wallpaper-card {
  background: rgba(150, 150, 150, 0.06);
  font-size: 10px;
  font-weight: 600;
  color: var(--sidebar-text-secondary);
}

.user-wallpaper-thumb {
  position: relative;
}

.delete-thumb-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.user-wallpaper-thumb:hover .delete-thumb-btn {
  opacity: 1;
}

.delete-thumb-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.upload-wallpaper-btn {
  background: rgba(150, 150, 150, 0.05);
  border: 2px dashed var(--border-color);
}

.upload-wallpaper-btn:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

/* Coluna 3: Pré-visualização Fixa */
.timer-config-preview-col {
  width: 380px;
  background: rgba(150, 150, 150, 0.03);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

.preview-box-16-9 {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.preview-info-box {
  background: rgba(150, 150, 150, 0.06);
  border: 1px solid var(--border-color);
}

.preview-info-text {
  color: var(--sidebar-text-secondary);
  line-height: 1.4;
}

.font-tabular {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Footer */
.timer-config-footer {
  background: var(--card-bg);
}

.slider-step-btn {
  border-radius: 8px !important;
}

/* Container Queries e Responsividade */
@container config-modal (max-width: 980px) {
  .timer-config-preview-col {
    display: none !important;
  }
  .nav-tab-preview-only {
    display: flex !important;
  }
}

@media (max-width: 980px) {
  .timer-config-preview-col {
    display: none !important;
  }
  .nav-tab-preview-only {
    display: flex !important;
  }
}

@container config-modal (max-width: 560px) {
  .timer-config-nav-col {
    width: 60px !important;
    padding: 8px 4px !important;
  }

  .nav-tab-btn {
    justify-content: center !important;
    padding: 10px 0 !important;
  }

  .nav-tab-btn span {
    display: none !important;
  }
}

@media (max-width: 600px) {
  .timer-config-nav-col {
    width: 60px !important;
    padding: 8px 4px !important;
  }

  .nav-tab-btn {
    justify-content: center !important;
    padding: 10px 0 !important;
  }

  .nav-tab-btn span {
    display: none !important;
  }
}
</style>
