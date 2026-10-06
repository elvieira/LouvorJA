<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="visible"
      class="d-flex align-center justify-center bg-transparent"
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);"
    >
      <v-card
        class="sorteio-config-modal rounded-xl"
        width="95%"
        max-width="960"
        style="background: var(--card-bg, #ffffff); box-shadow: 0 16px 50px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; height: 680px; border-radius: 24px !important;"
      >
        <!-- Header -->
        <div
          class="pa-5 pb-3 flex-shrink-0"
          style="background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.06);"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon
                color="primary"
                size="30"
                class="mr-3"
              >
                mdi-palette-outline
              </v-icon>
              <div>
                <h2
                  class="text-h6 font-weight-bold mb-0"
                  style="color: var(--sidebar-text); line-height: 1.2;"
                >
                  {{ t('proj_customization') }}
                </h2>
                <p
                  class="text-caption mb-0"
                  style="color: var(--sidebar-text-secondary);"
                >
                  Ajuste o visual, tamanho, posicionamento e título do sorteio
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
        </div>

        <!-- Body com 2 Colunas -->
        <div
          class="sorteio-modal-body d-flex flex-row flex-grow-1 overflow-hidden"
          style="min-height: 0;"
        >
          <!-- Coluna Esquerda: Configurações com Rolagem -->
          <div
            class="sorteio-modal-settings-col flex-grow-1 overflow-y-auto pa-5"
            style="min-width: 0; background: var(--main-bg, #f5f5f5);"
          >
            <!-- Fundo da Projeção -->
            <v-card
              class="settings-card rounded-xl pa-2 mb-5"
              flat
              style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon
                    color="primary"
                    class="mr-3"
                    size="24"
                  >
                    mdi-format-color-fill
                  </v-icon>
                  <div>
                    <h3
                      class="font-weight-bold"
                      style="color: var(--sidebar-text); font-size: 1.05rem; line-height: 1.2;"
                    >
                      Fundo da Projeção
                    </h3>
                    <div
                      class="text-caption"
                      style="color: var(--sidebar-text-secondary);"
                    >
                      Cor e imagem de fundo da tela de exibição
                    </div>
                  </div>
                </div>

                <div
                  class="d-flex flex-wrap align-center"
                  style="gap: 10px;"
                >
                  <div
                    v-for="color in ['#FFFFFF', '#000000', '#1A1A1A', '#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2']"
                    :key="color"
                    class="rounded-circle cursor-pointer elevation-1"
                    :class="localConfig.background === color ? 'elevation-4' : ''"
                    :style="{
                      width: '36px', height: '36px',
                      background: color,
                      border: localConfig.background === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      transform: localConfig.background === color ? 'scale(1.15)' : 'scale(1)',
                    }"
                    @click="localConfig.background = color"
                  />
                  <ModernColorPicker v-model="localConfig.background">
                    <template #activator="{ props }">
                      <div
                        v-bind="props"
                        class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                        style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                      >
                        <v-icon
                          size="16"
                          color="grey"
                        >
                          mdi-eyedropper
                        </v-icon>
                      </div>
                    </template>
                  </ModernColorPicker>
                </div>

                <v-divider
                  class="my-4"
                  style="opacity: 0.1;"
                />

                <!-- Imagem de fundo -->
                <div class="mb-2">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center">
                      <v-icon
                        size="18"
                        color="primary"
                        class="mr-2"
                      >
                        mdi-image-outline
                      </v-icon>
                      <span
                        class="text-body-2 font-weight-bold"
                        style="color: var(--sidebar-text);"
                      >Imagem de Fundo</span>
                    </div>
                  </div>

                  <div
                    v-if="localConfig.bgImage"
                    class="position-relative rounded-xl overflow-hidden mb-2"
                    style="height: 120px; border: 1px solid var(--border-color); border-radius: 16px !important;"
                  >
                    <img
                      :src="localConfig.bgImage"
                      class="w-100 h-100"
                      style="object-fit: cover;"
                    />
                    <div
                      class="position-absolute w-100 h-100 d-flex align-center justify-center"
                      style="top: 0; left: 0; background: rgba(0,0,0,0.35);"
                    >
                      <v-btn
                        icon
                        size="small"
                        variant="flat"
                        color="error"
                        class="mr-2"
                        @click="localConfig.bgImage = null"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip
                          activator="parent"
                          location="top"
                        >
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
                        <v-tooltip
                          activator="parent"
                          location="top"
                        >
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
                    <v-icon
                      size="28"
                      color="grey-lighten-1"
                      class="mb-1"
                    >
                      mdi-cloud-upload-outline
                    </v-icon>
                    <span
                      class="text-caption font-weight-medium"
                      style="color: var(--sidebar-text-secondary);"
                    >Selecionar Imagem</span>
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

            <!-- Texto Principal (Nome / Número) -->
            <v-card
              class="settings-card rounded-xl pa-2 mb-5"
              flat
              style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon
                      color="primary"
                      class="mr-3"
                      size="24"
                    >
                      mdi-format-text
                    </v-icon>
                    <div>
                      <h3
                        class="font-weight-bold"
                        style="color: var(--sidebar-text); font-size: 1.05rem; line-height: 1.2;"
                      >
                        Texto Principal
                      </h3>
                      <div
                        class="text-caption"
                        style="color: var(--sidebar-text-secondary);"
                      >
                        Formatação dos nomes ou números sorteados
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cores -->
                <div
                  class="d-flex flex-wrap align-center mb-5"
                  style="gap: 10px;"
                >
                  <div
                    v-for="color in ['#0097d7', '#FFFFFF', '#000000', '#f6c32a', '#FF6B6B', '#4ECDC4', '#96CEB4', '#FFEAA7']"
                    :key="color"
                    class="rounded-circle cursor-pointer elevation-1"
                    :class="localConfig.color === color ? 'elevation-4' : ''"
                    :style="{
                      width: '36px', height: '36px',
                      background: color,
                      border: localConfig.color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      transform: localConfig.color === color ? 'scale(1.15)' : 'scale(1)',
                    }"
                    @click="localConfig.color = color"
                  />
                  <ModernColorPicker v-model="localConfig.color">
                    <template #activator="{ props }">
                      <div
                        v-bind="props"
                        class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                        style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                      >
                        <v-icon
                          size="16"
                          color="grey"
                        >
                          mdi-eyedropper
                        </v-icon>
                      </div>
                    </template>
                  </ModernColorPicker>
                </div>

                <v-divider
                  class="mb-4"
                  style="opacity: 0.1;"
                />

                <!-- Tamanho da Letra -->
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center">
                    <v-icon
                      size="18"
                      color="primary"
                      class="mr-2"
                    >
                      mdi-format-size
                    </v-icon>
                    <span
                      class="text-body-2 font-weight-bold"
                      style="color: var(--sidebar-text);"
                    >Tamanho da letra</span>
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

                <div
                  class="d-flex align-center mb-5"
                  style="gap: 12px;"
                >
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
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
                    track-color="rgba(0,0,0,0.1)"
                    class="flex-grow-1"
                  />
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="localConfig.fontSizePc = Math.min(30, localConfig.fontSizePc + 1)"
                  >
                    <v-icon size="18">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </div>

                <v-divider
                  class="mb-4"
                  style="opacity: 0.1;"
                />

                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center">
                    <v-icon
                      size="18"
                      color="primary"
                      class="mr-2"
                    >
                      mdi-format-letter-case
                    </v-icon>
                    <span
                      class="text-body-2 font-weight-bold"
                      style="color: var(--sidebar-text);"
                    >Transformação de Texto</span>
                  </div>
                </div>
                <PillSwitch
                  v-model="localConfig.textTransform"
                  block
                  class="mb-2"
                  :items="[
                    { value: 'none', label: 'Aa (Normal)' },
                    { value: 'uppercase', label: 'AA (Maiúsculo)' },
                    { value: 'lowercase', label: 'aa (Minúsculo)' },
                  ]"
                />
              </v-card-text>
            </v-card>

            <!-- Título do Sorteio (Texto Personalizado) -->
            <v-card
              class="settings-card rounded-xl pa-2 mb-5"
              flat
              style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon
                      color="primary"
                      class="mr-3"
                      size="24"
                    >
                      mdi-format-title
                    </v-icon>
                    <div>
                      <h3
                        class="font-weight-bold"
                        style="color: var(--sidebar-text); font-size: 1.05rem; line-height: 1.2;"
                      >
                        {{ t('custom_text') }}
                      </h3>
                      <div
                        class="text-caption"
                        style="color: var(--sidebar-text-secondary);"
                      >
                        {{ t('custom_text_desc') }}
                      </div>
                    </div>
                  </div>
                </div>

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

                <template v-if="localConfig.customText">
                  <!-- Cor do Título -->
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    Cor do Título
                  </div>
                  <div class="d-flex flex-wrap align-center mb-4" style="gap: 10px;">
                    <div
                      v-for="color in ['#0097d7', '#FFFFFF', '#000000', '#f6c32a', '#FF6B6B', '#4ECDC4', '#96CEB4', '#FFEAA7']"
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
                          <v-icon size="14" color="grey">
                            mdi-eyedropper
                          </v-icon>
                        </div>
                      </template>
                    </ModernColorPicker>
                  </div>

                  <!-- Tamanho do Título -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text-secondary);">
                      Tamanho do Título
                    </span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                    >
                      {{ localConfig.customTextSizePc }}%
                    </v-chip>
                  </div>
                  <div class="d-flex align-center mb-4" style="gap: 10px;">
                    <v-btn
                      icon
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.customTextSizePc = Math.max(3, (localConfig.customTextSizePc || 6) - 1)"
                    >
                      <v-icon size="14">
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
                      track-color="rgba(0,0,0,0.1)"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      @click="localConfig.customTextSizePc = Math.min(20, (localConfig.customTextSizePc || 6) + 1)"
                    >
                      <v-icon size="14">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </div>

                  <!-- Posição do Título -->
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    {{ t('text_pos') }}
                  </div>
                  <PillSwitch
                    v-model="localConfig.customTextPosition"
                    block
                    class="mb-2"
                    :items="[
                      { value: 'above', label: t('pos_above'), icon: 'mdi-format-vertical-align-top' },
                      { value: 'below', label: t('pos_below'), icon: 'mdi-format-vertical-align-bottom' },
                      { value: 'custom', label: t('pos_custom'), icon: 'mdi-cursor-move' },
                    ]"
                  />
                </template>
              </v-card-text>
            </v-card>

            <!-- Posicionamento na Tela -->
            <v-card
              class="settings-card rounded-xl pa-2 mb-5"
              flat
              style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="d-flex align-center">
                    <v-icon
                      color="primary"
                      class="mr-3"
                      size="24"
                    >
                      mdi-crosshairs-gps
                    </v-icon>
                    <div>
                      <h3
                        class="font-weight-bold"
                        style="color: var(--sidebar-text); font-size: 1.05rem; line-height: 1.2;"
                      >
                        {{ t('position') }}
                      </h3>
                      <div
                        class="text-caption"
                        style="color: var(--sidebar-text-secondary);"
                      >
                        {{ t('position_desc') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Se título livre na tela: seletor de elemento para posicionar -->
                <template v-if="localConfig.customText && localConfig.customTextPosition === 'custom'">
                  <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                    Elemento a Alinhar
                  </div>
                  <PillSwitch
                    v-model="activePosTarget"
                    block
                    class="mb-4"
                    :items="[
                      { value: 'draw', label: t('pos_target_draw'), icon: 'mdi-ticket-outline' },
                      { value: 'text', label: t('pos_target_text'), icon: 'mdi-format-title' },
                    ]"
                  />

                  <div v-if="activePosTarget === 'draw'">
                    <PositionAlignmentPicker
                      v-model:x="localConfig.posX"
                      v-model:y="localConfig.posY"
                    />
                  </div>
                  <div v-else>
                    <PositionAlignmentPicker
                      v-model:x="localConfig.customTextX"
                      v-model:y="localConfig.customTextY"
                    />
                  </div>
                </template>

                <template v-else>
                  <PositionAlignmentPicker
                    v-model:x="localConfig.posX"
                    v-model:y="localConfig.posY"
                  />
                </template>
              </v-card-text>
            </v-card>

            <!-- Dinâmica do Sorteio -->
            <v-card
              class="settings-card rounded-xl pa-2"
              flat
              style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon
                    color="primary"
                    class="mr-3"
                    size="24"
                  >
                    mdi-animation-outline
                  </v-icon>
                  <div>
                    <h3
                      class="font-weight-bold"
                      style="color: var(--sidebar-text); font-size: 1.05rem; line-height: 1.2;"
                    >
                      Dinâmica do Sorteio
                    </h3>
                    <div
                      class="text-caption"
                      style="color: var(--sidebar-text-secondary);"
                    >
                      Velocidade de rolagem dos nomes
                    </div>
                  </div>
                </div>

                <PillSwitch
                  v-model="localConfig.animationSpeed"
                  block
                  class="mb-2"
                  :items="[
                    { value: 'fast', label: 'Rápido', icon: 'mdi-run-fast' },
                    { value: 'normal', label: 'Normal', icon: 'mdi-run' },
                    { value: 'slow', label: 'Lento', icon: 'mdi-walk' },
                  ]"
                />
              </v-card-text>
            </v-card>
          </div>

          <!-- Coluna Direita: Pré-visualização Fixa (Sticky) -->
          <div
            class="sorteio-modal-preview-col flex-shrink-0 d-flex flex-column pa-5"
            style="width: 410px; background: rgba(0,0,0,0.02); border-left: 1px solid rgba(0,0,0,0.06); overflow-y: auto;"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon
                  size="18"
                  color="primary"
                  class="mr-2"
                >
                  mdi-monitor-dashboard
                </v-icon>
                <span
                  class="text-subtitle-2 font-weight-bold"
                  style="color: var(--sidebar-text);"
                >
                  Pré-visualização
                </span>
              </div>
              <v-chip
                size="x-small"
                color="primary"
                variant="tonal"
                class="font-weight-bold"
              >
                16:9 Tela
              </v-chip>
            </div>

            <!-- Preview Box com Arraste -->
            <div
              ref="previewRandomRef"
              class="overflow-hidden rounded-lg mx-auto position-relative cursor-move user-select-none"
              :style="{
                backgroundColor: localConfig.background,
                backgroundImage: localConfig.bgImage ? `url('${localConfig.bgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                color: localConfig.color,
                aspectRatio: '16/9',
                width: '100%',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                border: '1px solid rgba(0,0,0,0.1)'
              }"
              @pointerdown="startDrag"
            >
              <!-- Texto Personalizado Livre -->
              <div
                v-if="localConfig.customText && localConfig.customTextPosition === 'custom'"
                class="position-absolute font-weight-bold text-center"
                :style="{
                  left: `${localConfig.customTextX ?? 50}%`,
                  top: `${localConfig.customTextY ?? 20}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${(localConfig.customTextSizePc || 6) * 1.8}px`,
                  color: localConfig.customTextColor || localConfig.color,
                  textShadow: localConfig.bgImage ? '0 4px 12px rgba(0,0,0,0.85)' : `0 4px 16px ${localConfig.customTextColor || localConfig.color}60`,
                  padding: '2px 6px',
                  border: activePosTarget === 'text' ? '1px dashed var(--accent-blue, #0097d7)' : '1px dashed transparent',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                }"
                @pointerdown.stop="selectAndDrag('text', $event)"
              >
                {{ localConfig.customText }}
              </div>

              <!-- Container do Sorteado -->
              <div
                class="position-absolute d-flex flex-column align-center justify-center text-center"
                :style="{
                  left: `${localConfig.posX ?? 50}%`,
                  top: `${localConfig.posY ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  whiteSpace: 'nowrap',
                }"
                @pointerdown.stop="selectAndDrag('draw', $event)"
              >
                <!-- Título Acima -->
                <div
                  v-if="localConfig.customText && (localConfig.customTextPosition === 'above' || !localConfig.customTextPosition)"
                  class="font-weight-bold text-center mb-1"
                  :style="{
                    fontSize: `${(localConfig.customTextSizePc || 6) * 1.6}px`,
                    color: localConfig.customTextColor || localConfig.color,
                    textShadow: localConfig.bgImage ? '0 4px 12px rgba(0,0,0,0.85)' : `0 4px 16px ${localConfig.customTextColor || localConfig.color}60`,
                    lineHeight: '1.2',
                  }"
                >
                  {{ localConfig.customText }}
                </div>

                <!-- Nome / Número Sorteado -->
                <div
                  class="font-weight-black text-center"
                  :style="{
                    fontSize: `${localConfig.fontSizePc * 2.2}px`,
                    textTransform: localConfig.textTransform as any,
                    textShadow: localConfig.bgImage ? '0 4px 12px rgba(0,0,0,0.8)' : `0 4px 16px ${localConfig.color}60`,
                    lineHeight: '1.1',
                  }"
                >
                  João Silva
                </div>

                <!-- Título Abaixo -->
                <div
                  v-if="localConfig.customText && localConfig.customTextPosition === 'below'"
                  class="font-weight-bold text-center mt-1"
                  :style="{
                    fontSize: `${(localConfig.customTextSizePc || 6) * 1.6}px`,
                    color: localConfig.customTextColor || localConfig.color,
                    textShadow: localConfig.bgImage ? '0 4px 12px rgba(0,0,0,0.85)' : `0 4px 16px ${localConfig.customTextColor || localConfig.color}60`,
                    lineHeight: '1.2',
                  }"
                >
                  {{ localConfig.customText }}
                </div>
              </div>
            </div>

            <!-- Dica de arrastar -->
            <div
              class="mt-4 pa-3 rounded-lg d-flex align-start"
              style="background: rgba(0,0,0,0.04); gap: 10px;"
            >
              <v-icon
                size="18"
                color="primary"
                class="mt-0.5"
              >
                mdi-cursor-move
              </v-icon>
              <div
                class="text-caption"
                style="color: var(--sidebar-text-secondary); line-height: 1.4;"
              >
                <strong style="color: var(--sidebar-text);">Arraste Livre:</strong> Clique e arraste diretamente no preview acima para mover o nome sorteado ou o título para qualquer posição da tela.
              </div>
            </div>
          </div>
        </div>

        <v-divider style="opacity: 0.1;" />

        <!-- Footer -->
        <v-card-actions
          class="pa-4 d-flex justify-space-between"
          style="padding: 16px 24px 20px !important; background: var(--card-bg, #fff);"
        >
          <v-btn
            variant="tonal"
            color="error"
            class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
            @click="resetToDefault"
          >
            Restaurar Padrão
          </v-btn>
          <div
            class="d-flex"
            style="gap: 12px;"
          >
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
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data: () => ({
    activePosTarget: "draw" as "draw" | "text",
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
    },
    resetToDefault() {
      this.localConfig = { ...this.defaultConfig };
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
    selectAndDrag(target: "draw" | "text", e: PointerEvent) {
      this.activePosTarget = target;
      this.startDrag(e);
    },
    startDrag(e: PointerEvent) {
      const el = this.$refs.previewRandomRef as HTMLElement;
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
      this.close();
    },
    close() {
      this.visible = false;
    },
  },
});
</script>

<style scoped>
.sorteio-config-modal {
  box-shadow: 0 24px 48px rgba(0,0,0,0.2) !important;
}
.settings-card {
  transition: all 0.3s;
}
</style>
