<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="visible"
      class="d-flex align-center justify-center sorteio-config-backdrop"
      @click.self="cancel"
    >
      <v-card
        class="sorteio-config-modal rounded-xl"
        width="96%"
        max-width="1040"
      >
        <!-- Header Fixo -->
        <div class="sorteio-config-header px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
          <div class="d-flex align-center" style="gap: 12px;">
            <div class="sorteio-config-icon-badge">
              <v-icon color="primary" size="22">
                mdi-palette-outline
              </v-icon>
            </div>
            <div>
              <h2 class="text-h6 font-weight-bold mb-0 sorteio-config-title">
                {{ t('proj_customization') }}
              </h2>
              <p class="text-caption mb-0 sorteio-config-subtitle">
                {{ t('modal_subtitle') }}
              </p>
            </div>
          </div>
          <v-btn
            icon
            size="small"
            variant="text"
            class="sorteio-config-close-btn"
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

        <v-divider style="border-color: var(--border-color); opacity: 0.6;" />

        <!-- Body com 3 Colunas: Abas | Configurações | Pré-visualização -->
        <div class="sorteio-config-body d-flex flex-grow-1 overflow-hidden">
          <!-- Coluna 1: Abas Verticais de Navegação -->
          <div class="sorteio-config-nav-col pa-3 d-flex flex-column flex-shrink-0">
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'appearance' }"
              @click="activeTab = 'appearance'"
            >
              <v-icon size="18">
                mdi-palette-outline
              </v-icon>
              <span>{{ t('tab_appearance') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'text' }"
              @click="activeTab = 'text'"
            >
              <v-icon size="18">
                mdi-format-size
              </v-icon>
              <span>{{ t('tab_text') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'title' }"
              @click="activeTab = 'title'"
            >
              <v-icon size="18">
                mdi-subtitles-outline
              </v-icon>
              <span>{{ t('tab_title') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'position' }"
              @click="activeTab = 'position'"
            >
              <v-icon size="18">
                mdi-arrow-all
              </v-icon>
              <span>{{ t('tab_position') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'animation' }"
              @click="activeTab = 'animation'"
            >
              <v-icon size="18">
                mdi-animation-outline
              </v-icon>
              <span>{{ t('tab_animation') }}</span>
            </button>
            <!-- Aba de Prévia (Exibida em telas compactas onde a coluna fixa se esconde) -->
            <button
              type="button"
              class="nav-tab-btn nav-tab-preview-only"
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >
              <v-icon size="18">
                mdi-monitor-dashboard
              </v-icon>
              <span>{{ t('tab_preview') }}</span>
            </button>
          </div>

          <!-- Coluna 2: Configurações da Aba Ativa -->
          <div class="sorteio-config-content-col pa-5 flex-grow-1 overflow-y-auto">
            <!-- ABA: APARÊNCIA -->
            <div v-if="activeTab === 'appearance'" class="tab-pane">
              <!-- Cor de Fundo -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-color-fill
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('bg_color') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('bg_desc') }}
                </p>
                <div class="color-palette-row">
                  <div
                    v-for="color in bgPaletteColors"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.background === color }"
                    :style="{ backgroundColor: color }"
                    @click="localConfig.background = color"
                  />
                  <ModernColorPicker v-model="localConfig.background">
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
                    :class="{ active: !localConfig.bgImage }"
                    @click="localConfig.bgImage = null"
                  >
                    <v-icon size="20" class="mb-1">
                      mdi-close-circle-outline
                    </v-icon>
                    <span>Nenhuma</span>
                  </div>

                  <!-- Imagens do Usuário / Wallpapers -->
                  <div
                    v-for="(img, idx) in savedWallpapers"
                    :key="idx"
                    class="wallpaper-thumb-card user-wallpaper-thumb"
                    :class="{ active: localConfig.bgImage === img }"
                    :style="{ backgroundImage: `url('${img}')` }"
                    @click="localConfig.bgImage = img"
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
                    v-if="localConfig.bgImage && !savedWallpapers.includes(localConfig.bgImage)"
                    class="wallpaper-thumb-card user-wallpaper-thumb active"
                    :style="{ backgroundImage: `url('${localConfig.bgImage}')` }"
                  >
                    <button
                      type="button"
                      class="delete-thumb-btn"
                      title="Excluir imagem"
                      @click.stop="localConfig.bgImage = null"
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
                  @change="onBgImageSelect"
                />
              </div>
            </div>

            <!-- ABA: TEXTO PRINCIPAL -->
            <div v-if="activeTab === 'text'" class="tab-pane">
              <!-- Cor do Texto -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-palette
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('text_color') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('text_color_desc') }}
                </p>
                <div class="color-palette-row">
                  <div
                    v-for="color in textPaletteColors"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="localConfig.color = color"
                  />
                  <ModernColorPicker v-model="localConfig.color">
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

              <!-- Tamanho da Fonte -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="d-flex align-center">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-format-size
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('font_size') }}
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
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('font_size_desc') }}
                </p>
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="slider-step-btn"
                    @click="localConfig.fontSizePc = Math.max(5, localConfig.fontSizePc - 1)"
                  >
                    <v-icon size="18">
                      mdi-minus
                    </v-icon>
                  </v-btn>
                  <v-slider
                    v-model="localConfig.fontSizePc"
                    :min="5"
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
                    @click="localConfig.fontSizePc = Math.min(30, localConfig.fontSizePc + 1)"
                  >
                    <v-icon size="18">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Transformação de Texto -->
              <div class="settings-section">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-letter-case
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('text_transform') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  Formatação de maiúsculas e minúsculas no resultado
                </p>
                <PillSwitch
                  v-model="localConfig.textTransform"
                  block
                  :items="[
                    { value: 'none', label: t('transform_none') },
                    { value: 'uppercase', label: t('transform_uppercase') },
                    { value: 'lowercase', label: t('transform_lowercase') },
                  ]"
                />
              </div>
            </div>

            <!-- ABA: TÍTULO DO SORTEIO -->
            <div v-if="activeTab === 'title'" class="tab-pane">
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-title
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('custom_text') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('custom_text_desc') }}
                </p>

                <v-text-field
                  v-model="localConfig.customText"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :placeholder="t('custom_text_placeholder')"
                  clearable
                  hide-details
                  class="mb-4"
                />
              </div>

              <template v-if="localConfig.customText">
                <!-- Cor do Título -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center mb-2">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-palette
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('title_color') }}
                    </span>
                  </div>
                  <div class="color-palette-row">
                    <div
                      v-for="color in textPaletteColors"
                      :key="color"
                      class="color-circle"
                      :class="{ active: localConfig.customTextColor === color }"
                      :style="{ backgroundColor: color }"
                      @click="localConfig.customTextColor = color"
                    />
                    <ModernColorPicker v-model="localConfig.customTextColor">
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

                <!-- Tamanho do Título -->
                <div class="settings-section mb-5">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2">
                        mdi-format-size
                      </v-icon>
                      <span class="text-subtitle-2 font-weight-bold section-title">
                        {{ t('title_size') }}
                      </span>
                    </div>
                    <v-chip
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.customTextSizePc || 6 }}%
                    </v-chip>
                  </div>
                  <div class="d-flex align-center" style="gap: 12px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.customTextSizePc = Math.max(3, (localConfig.customTextSizePc || 6) - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.customTextSizePc"
                      :min="3"
                      :max="20"
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
                      @click="localConfig.customTextSizePc = Math.min(20, (localConfig.customTextSizePc || 6) + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>
                </div>

                <!-- Posição do Título -->
                <div class="settings-section">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-arrow-split-horizontal
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('text_pos') }}
                    </span>
                  </div>
                  <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                    Localização do título em relação ao sorteado
                  </p>
                  <PillSwitch
                    v-model="localConfig.customTextPosition"
                    block
                    :items="[
                      { value: 'above', label: t('pos_above'), icon: 'mdi-format-vertical-align-top' },
                      { value: 'below', label: t('pos_below'), icon: 'mdi-format-vertical-align-bottom' },
                      { value: 'custom', label: t('pos_custom'), icon: 'mdi-cursor-move' },
                    ]"
                  />
                </div>
              </template>
            </div>

            <!-- ABA: POSICIONAMENTO -->
            <div v-if="activeTab === 'position'" class="tab-pane">
              <!-- Seletor de Alvo se Título for Livre -->
              <div
                v-if="localConfig.customText && localConfig.customTextPosition === 'custom'"
                class="settings-section mb-5"
              >
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-target
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('pos_target_element') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  Selecione qual elemento deseja posicionar
                </p>
                <PillSwitch
                  v-model="activePosTarget"
                  block
                  :items="[
                    { value: 'draw', label: t('pos_target_draw'), icon: 'mdi-ticket-outline' },
                    { value: 'text', label: t('pos_target_text'), icon: 'mdi-format-title' },
                  ]"
                />
              </div>

              <!-- Grade de 9 Pontos -->
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
                    @click="centerCurrent"
                  >
                    {{ t('center') }}
                  </v-btn>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  Toque em um ponto da grade ou use os controles finos
                </p>
                <div class="d-flex justify-center my-3">
                  <PositionAlignmentPicker
                    v-if="activePosTarget === 'draw' || !localConfig.customText || localConfig.customTextPosition !== 'custom'"
                    v-model:x="localConfig.posX"
                    v-model:y="localConfig.posY"
                  />
                  <PositionAlignmentPicker
                    v-else
                    v-model:x="localConfig.customTextX"
                    v-model:y="localConfig.customTextY"
                  />
                </div>
              </div>

              <!-- Ajustes Finos X / Y -->
              <div class="settings-section">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-tune
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    Ajuste Fino Numérico (%)
                  </span>
                </div>

                <!-- Eixo X -->
                <div class="mb-4">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                      Posição Horizontal (X)
                    </span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ currentActiveX }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-if="activePosTarget === 'draw' || !localConfig.customText || localConfig.customTextPosition !== 'custom'"
                    v-model="localConfig.posX"
                    :min="5"
                    :max="95"
                    :step="1"
                    hide-details
                    color="primary"
                    track-color="rgba(150, 150, 150, 0.2)"
                  />
                  <v-slider
                    v-else
                    v-model="localConfig.customTextX"
                    :min="5"
                    :max="95"
                    :step="1"
                    hide-details
                    color="primary"
                    track-color="rgba(150, 150, 150, 0.2)"
                  />
                </div>

                <!-- Eixo Y -->
                <div>
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                      Posição Vertical (Y)
                    </span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ currentActiveY }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-if="activePosTarget === 'draw' || !localConfig.customText || localConfig.customTextPosition !== 'custom'"
                    v-model="localConfig.posY"
                    :min="5"
                    :max="95"
                    :step="1"
                    hide-details
                    color="primary"
                    track-color="rgba(150, 150, 150, 0.2)"
                  />
                  <v-slider
                    v-else
                    v-model="localConfig.customTextY"
                    :min="5"
                    :max="95"
                    :step="1"
                    hide-details
                    color="primary"
                    track-color="rgba(150, 150, 150, 0.2)"
                  />
                </div>
              </div>
            </div>

            <!-- ABA: DINÂMICA DO SORTEIO -->
            <div v-if="activeTab === 'animation'" class="tab-pane">
              <div class="settings-section">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-animation-outline
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('animation_speed') }}
                  </span>
                </div>
                <p class="text-caption mb-4" style="color: var(--sidebar-text-secondary);">
                  {{ t('animation_speed_desc') }}
                </p>

                <div class="speed-cards-grid">
                  <!-- Rápido -->
                  <div
                    class="speed-card"
                    :class="{ active: localConfig.animationSpeed === 'fast' }"
                    @click="localConfig.animationSpeed = 'fast'"
                  >
                    <div class="d-flex align-center justify-space-between mb-1">
                      <v-icon color="primary" size="24">
                        mdi-run-fast
                      </v-icon>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        1.5s
                      </v-chip>
                    </div>
                    <span class="speed-card-title">{{ t('speed_fast') }}</span>
                    <span class="speed-card-desc">{{ t('speed_fast_desc') }}</span>
                  </div>

                  <!-- Normal -->
                  <div
                    class="speed-card"
                    :class="{ active: localConfig.animationSpeed === 'normal' }"
                    @click="localConfig.animationSpeed = 'normal'"
                  >
                    <div class="d-flex align-center justify-space-between mb-1">
                      <v-icon color="primary" size="24">
                        mdi-run
                      </v-icon>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        3.0s
                      </v-chip>
                    </div>
                    <span class="speed-card-title">{{ t('speed_normal') }}</span>
                    <span class="speed-card-desc">{{ t('speed_normal_desc') }}</span>
                  </div>

                  <!-- Lento -->
                  <div
                    class="speed-card"
                    :class="{ active: localConfig.animationSpeed === 'slow' }"
                    @click="localConfig.animationSpeed = 'slow'"
                  >
                    <div class="d-flex align-center justify-space-between mb-1">
                      <v-icon color="primary" size="24">
                        mdi-walk
                      </v-icon>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        5.0s
                      </v-chip>
                    </div>
                    <span class="speed-card-title">{{ t('speed_slow') }}</span>
                    <span class="speed-card-desc">{{ t('speed_slow_desc') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ABA: PRÉVIA (Visível apenas em telas menores via tab-pane) -->
            <div v-if="activeTab === 'preview'" class="tab-pane">
              <div class="preview-mobile-wrapper">
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
                  ref="previewMobileRef"
                  class="preview-box-16-9 position-relative overflow-hidden cursor-move user-select-none"
                  :style="previewContainerStyle"
                  @pointerdown="startDrag"
                >
                  <!-- Título Livre -->
                  <div
                    v-if="localConfig.customText && localConfig.customTextPosition === 'custom'"
                    class="position-absolute font-weight-bold"
                    :style="previewCustomTextFreeStyle"
                    @pointerdown.stop="selectAndDrag('text', $event)"
                  >
                    {{ localConfig.customText }}
                  </div>

                  <!-- Container Sorteado (com Título Acima / Abaixo se aplicável) -->
                  <div
                    class="position-absolute d-flex flex-column"
                    :style="previewDrawContainerStyle"
                    @pointerdown.stop="selectAndDrag('draw', $event)"
                  >
                    <div
                      v-if="localConfig.customText && (localConfig.customTextPosition === 'above' || !localConfig.customTextPosition)"
                      class="font-weight-bold mb-1"
                      :style="previewTitleStyle"
                    >
                      {{ localConfig.customText }}
                    </div>

                    <div
                      class="font-weight-black"
                      :style="previewDrawTextStyle"
                    >
                      {{ sampleDisplayText }}
                    </div>

                    <div
                      v-if="localConfig.customText && localConfig.customTextPosition === 'below'"
                      class="font-weight-bold mt-1"
                      :style="previewTitleStyle"
                    >
                      {{ localConfig.customText }}
                    </div>
                  </div>
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
          </div>

          <!-- Coluna 3: Pré-visualização Fixa (Sticky à Direita) -->
          <div class="sorteio-config-preview-col flex-shrink-0 d-flex flex-column pa-5">
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
              :style="previewContainerStyle"
              @pointerdown="startDrag"
            >
              <!-- Título Livre na Tela -->
              <div
                v-if="localConfig.customText && localConfig.customTextPosition === 'custom'"
                class="position-absolute font-weight-bold"
                :style="previewCustomTextFreeStyle"
                @pointerdown.stop="selectAndDrag('text', $event)"
              >
                {{ localConfig.customText }}
              </div>

              <!-- Container Sorteado (com Título Acima / Abaixo se aplicável) -->
              <div
                class="position-absolute d-flex flex-column"
                :style="previewDrawContainerStyle"
                @pointerdown.stop="selectAndDrag('draw', $event)"
              >
                <!-- Título Acima -->
                <div
                  v-if="localConfig.customText && (localConfig.customTextPosition === 'above' || !localConfig.customTextPosition)"
                  class="font-weight-bold mb-1"
                  :style="previewTitleStyle"
                >
                  {{ localConfig.customText }}
                </div>

                <!-- Nome / Número Sorteado -->
                <div
                  class="font-weight-black"
                  :style="previewDrawTextStyle"
                >
                  {{ sampleDisplayText }}
                </div>

                <!-- Título Abaixo -->
                <div
                  v-if="localConfig.customText && localConfig.customTextPosition === 'below'"
                  class="font-weight-bold mt-1"
                  :style="previewTitleStyle"
                >
                  {{ localConfig.customText }}
                </div>
              </div>
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
        <div class="sorteio-config-footer px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
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

      <!-- Diálogo de Confirmação: Restaurar Padrão -->
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
                {{ t('restore_confirm_title') }}
              </h3>
            </div>
          </div>
          <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
            {{ t('restore_confirm_desc') }}
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
              @click="resetToDefault"
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

export default defineComponent({
  name: "SorteioConfigModal",
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
      default: "random",
    },
    drawMode: {
      type: String as PropType<string>,
      default: "names",
    },
    sampleText: {
      type: String as PropType<string>,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data: () => ({
    activeTab: "appearance" as "appearance" | "text" | "title" | "position" | "animation" | "preview",
    activePosTarget: "draw" as "draw" | "text",
    showResetConfirm: false,
    savedWallpapers: [] as string[],
    bgPaletteColors: [
      "#FFFFFF",
      "#000000",
      "#1A1A1A",
      "#1976D2",
      "#388E3C",
      "#D32F2F",
      "#F57C00",
      "#7B1FA2",
    ],
    textPaletteColors: [
      "#0097d7",
      "#FFFFFF",
      "#000000",
      "#f6c32a",
      "#FF6B6B",
      "#4ECDC4",
      "#96CEB4",
      "#FFEAA7",
    ],
    localConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
      bgImage: null as string | null,
      posX: 50,
      posY: 50,
      customText: "",
      customTextColor: "#0097d7",
      customTextSizePc: 6,
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
    },
    defaultConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
      bgImage: null as string | null,
      posX: 50,
      posY: 50,
      customText: "",
      customTextColor: "#0097d7",
      customTextSizePc: 6,
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
    },
    initialConfig: null as any,
  }),
  computed: {
    visible: {
      get(): boolean {
        return this.modelValue;
      },
      set(value: boolean) {
        this.$emit("update:modelValue", value);
      },
    },
    sampleDisplayText(): string {
      if (this.sampleText) return this.sampleText;
      return this.drawMode === "numbers" ? "42" : "João Silva";
    },
    currentActiveX(): number {
      if (
        this.localConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        return this.localConfig.customTextX ?? 50;
      }
      return this.localConfig.posX ?? 50;
    },
    currentActiveY(): number {
      if (
        this.localConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        return this.localConfig.customTextY ?? 20;
      }
      return this.localConfig.posY ?? 50;
    },
    previewContainerStyle(): Record<string, string> {
      return {
        backgroundColor: this.localConfig.background || "#ffffff",
        backgroundImage: this.localConfig.bgImage ? `url('${this.localConfig.bgImage}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        color: this.localConfig.color || "#0097d7",
      };
    },
    previewDrawContainerStyle(): Record<string, any> {
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
        border: this.activePosTarget === "draw" ? "1px dashed rgba(var(--v-theme-primary), 0.7)" : "1px dashed transparent",
        borderRadius: "6px",
        padding: "2px 6px",
      };
    },
    previewDrawTextStyle(): Record<string, any> {
      const x = this.localConfig.posX ?? 50;
      return {
        fontSize: `${this.localConfig.fontSizePc * 2.2}px`,
        textTransform: this.localConfig.textTransform as any,
        color: this.localConfig.color,
        textShadow: this.localConfig.bgImage
          ? "0 4px 12px rgba(0,0,0,0.85)"
          : `0 4px 16px ${this.localConfig.color}60`,
        lineHeight: "1.1",
        textAlign: x <= 30 ? "left" : x >= 70 ? "right" : "center",
      };
    },
    previewTitleStyle(): Record<string, any> {
      const x = this.localConfig.posX ?? 50;
      const titleColor = this.localConfig.customTextColor || this.localConfig.color;
      return {
        fontSize: `${(this.localConfig.customTextSizePc || 6) * 1.6}px`,
        color: titleColor,
        textShadow: this.localConfig.bgImage
          ? "0 4px 12px rgba(0,0,0,0.85)"
          : `0 4px 16px ${titleColor}60`,
        lineHeight: "1.2",
        textAlign: x <= 30 ? "left" : x >= 70 ? "right" : "center",
      };
    },
    previewCustomTextFreeStyle(): Record<string, any> {
      const x = this.localConfig.customTextX ?? 50;
      const y = this.localConfig.customTextY ?? 20;
      const titleColor = this.localConfig.customTextColor || this.localConfig.color;
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        textAlign: x <= 30 ? "left" : x >= 70 ? "right" : "center",
        fontSize: `${(this.localConfig.customTextSizePc || 6) * 1.8}px`,
        color: titleColor,
        textShadow: this.localConfig.bgImage
          ? "0 4px 12px rgba(0,0,0,0.85)"
          : `0 4px 16px ${titleColor}60`,
        padding: "2px 6px",
        border: this.activePosTarget === "text" ? "1px dashed var(--accent-blue, #0097d7)" : "1px dashed transparent",
        borderRadius: "4px",
        whiteSpace: "nowrap",
        maxWidth: "94%",
        width: "max-content",
        zIndex: 10,
      };
    },
  },
  watch: {
    visible(val: boolean) {
      if (val) {
        this.loadConfig();
      }
    },
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    loadConfig() {
      const savedConfig =
        this.$appdata.get(`modules.${this.moduleId}.config`) ||
        this.$userdata.get("sorteio_config");
      if (savedConfig) {
        this.localConfig = { ...this.defaultConfig, ...savedConfig };
      } else {
        this.localConfig = { ...this.defaultConfig };
      }
      this.initialConfig = JSON.parse(JSON.stringify(this.localConfig));
      this.loadSavedWallpapers();
    },
    loadSavedWallpapers() {
      const saved = this.$userdata.get("sorteio_wallpapers");
      if (Array.isArray(saved)) {
        this.savedWallpapers = saved;
      }
    },
    removeSavedWallpaper(index: number) {
      const removed = this.savedWallpapers[index];
      this.savedWallpapers.splice(index, 1);
      this.$userdata.set("sorteio_wallpapers", this.savedWallpapers);
      if (this.localConfig.bgImage === removed) {
        this.localConfig.bgImage = null;
      }
    },
    centerCurrent() {
      if (
        this.localConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        this.localConfig.customTextX = 50;
        this.localConfig.customTextY = 20;
      } else {
        this.localConfig.posX = 50;
        this.localConfig.posY = 50;
      }
    },
    resetToDefault() {
      this.localConfig = { ...this.defaultConfig };
      this.showResetConfirm = false;
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
      this.localConfig.bgImage = dataUrl;
      if (!this.savedWallpapers.includes(dataUrl)) {
        this.savedWallpapers.unshift(dataUrl);
        if (this.savedWallpapers.length > 8) {
          this.savedWallpapers = this.savedWallpapers.slice(0, 8);
        }
        this.$userdata.set("sorteio_wallpapers", this.savedWallpapers);
      }
    },
    selectAndDrag(target: "draw" | "text", e: PointerEvent) {
      this.activePosTarget = target;
      this.startDrag(e);
    },
    startDrag(e: PointerEvent) {
      const el = (this.$refs.previewBoxRef || this.$refs.previewMobileRef) as HTMLElement;
      if (!el) return;
      const updatePos = (evt: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const rawX = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
        const rawY = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
        const clampedX = Math.max(5, Math.min(95, rawX));
        const clampedY = Math.max(5, Math.min(95, rawY));
        if (
          this.localConfig.customText &&
          this.localConfig.customTextPosition === "custom" &&
          this.activePosTarget === "text"
        ) {
          this.localConfig.customTextX = clampedX;
          this.localConfig.customTextY = clampedY;
        } else {
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
    saveAndClose() {
      const cloned = JSON.parse(JSON.stringify(this.localConfig));
      this.$appdata.set(`modules.${this.moduleId}.config`, cloned);
      this.$userdata.set("sorteio_config", cloned);
      this.close();
    },
    cancel() {
      if (this.initialConfig) {
        this.localConfig = JSON.parse(JSON.stringify(this.initialConfig));
      }
      this.close();
    },
    close() {
      this.visible = false;
    },
  },
});
</script>

<style scoped>
.sorteio-config-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
}

.sorteio-config-modal {
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
  height: 620px;
}

.sorteio-config-header {
  background: rgba(150, 150, 150, 0.03);
}

.sorteio-config-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sorteio-config-title {
  color: var(--sidebar-text);
  line-height: 1.2;
}

.sorteio-config-subtitle {
  color: var(--sidebar-text-secondary);
}

.sorteio-config-close-btn {
  color: var(--sidebar-text-secondary);
  border-radius: 10px !important;
  transition: all 0.2s ease;
}

.sorteio-config-close-btn:hover {
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.1);
}

/* Body & Columns */
.sorteio-config-body {
  min-height: 0;
}

/* Coluna 1: Abas de Navegação */
.sorteio-config-nav-col {
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
.sorteio-config-content-col {
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

/* Cards de Velocidade de Animação */
.speed-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.speed-card {
  padding: 14px;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: rgba(150, 150, 150, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.speed-card:hover {
  background: rgba(150, 150, 150, 0.06);
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
}

.speed-card.active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 4px 14px rgba(var(--v-theme-primary), 0.2);
}

.speed-card-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--sidebar-text);
}

.speed-card-desc {
  font-size: 11.5px;
  color: var(--sidebar-text-secondary);
  line-height: 1.3;
}

/* Coluna 3: Pré-visualização Fixa */
.sorteio-config-preview-col {
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

/* Footer */
.sorteio-config-footer {
  background: var(--card-bg);
}

.slider-step-btn {
  border-radius: 8px !important;
}

/* Container Queries e Responsividade */
@container config-modal (max-width: 980px) {
  .sorteio-config-preview-col {
    display: none !important;
  }
  .nav-tab-preview-only {
    display: flex !important;
  }
}

@media (max-width: 980px) {
  .sorteio-config-preview-col {
    display: none !important;
  }
  .nav-tab-preview-only {
    display: flex !important;
  }
}

@container config-modal (max-width: 560px) {
  .sorteio-config-nav-col {
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

  .speed-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .sorteio-config-nav-col {
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

  .speed-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
