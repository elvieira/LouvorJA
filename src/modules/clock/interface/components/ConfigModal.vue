<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="internalValue"
      class="d-flex align-center justify-center clock-config-backdrop"
      @click.self="cancel"
    >
      <v-card
        class="clock-config-modal rounded-xl"
        width="96%"
        max-width="1040"
      >
        <!-- Header Fixo -->
        <div class="clock-config-header px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
          <div class="d-flex align-center" style="gap: 12px;">
            <div class="clock-config-icon-badge">
              <v-icon color="primary" size="22">
                mdi-palette-outline
              </v-icon>
            </div>
            <div>
              <h2 class="text-h6 font-weight-bold mb-0 clock-config-title">
                {{ t('proj_customization') }}
              </h2>
              <p class="text-caption mb-0 clock-config-subtitle">
                {{ t('modal_subtitle') }}
              </p>
            </div>
          </div>
          <v-btn
            icon
            size="small"
            variant="text"
            class="clock-config-close-btn"
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
        <div class="clock-config-body d-flex flex-grow-1 overflow-hidden">
          <!-- Coluna 1: Abas Verticais de Navegação -->
          <div class="clock-config-nav-col pa-3 d-flex flex-column flex-shrink-0">
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
              :class="{ active: activeTab === 'format' }"
              @click="activeTab = 'format'"
            >
              <v-icon size="18">
                mdi-clock-outline
              </v-icon>
              <span>{{ t('tab_format') }}</span>
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
              :class="{ active: activeTab === 'title' }"
              @click="activeTab = 'title'"
            >
              <v-icon size="18">
                mdi-subtitles-outline
              </v-icon>
              <span>{{ t('tab_title') }}</span>
            </button>
          </div>

          <!-- Coluna 2: Configurações da Aba Ativa -->
          <div class="clock-config-content-col pa-5 flex-grow-1 overflow-y-auto">
            <!-- ABA: APARÊNCIA -->
            <div v-if="activeTab === 'appearance'" class="tab-pane">
              <!-- Estilo de Exibição (Digital vs Analógico) -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-clock-time-four-outline
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('style') }}
                  </span>
                </div>
                <div class="style-cards-grid">
                  <!-- Digital -->
                  <div
                    class="style-card"
                    :class="{ active: localConfig.style === 'digital' }"
                    @click="localConfig.style = 'digital'"
                  >
                    <div class="d-flex align-center justify-space-between mb-1">
                      <v-icon color="primary" size="24">
                        mdi-numeric
                      </v-icon>
                      <span class="style-card-badge">12:45</span>
                    </div>
                    <span class="style-card-title">{{ t('digital') }}</span>
                    <span class="style-card-desc">{{ t('digital_desc') }}</span>
                  </div>

                  <!-- Analógico -->
                  <div
                    class="style-card"
                    :class="{ active: localConfig.style === 'analog' }"
                    @click="localConfig.style = 'analog'"
                  >
                    <div class="d-flex align-center justify-space-between mb-1">
                      <v-icon color="primary" size="24">
                        mdi-clock-outline
                      </v-icon>
                      <v-icon color="primary" size="20">
                        mdi-compass-outline
                      </v-icon>
                    </div>
                    <span class="style-card-title">{{ t('analog') }}</span>
                    <span class="style-card-desc">{{ t('analog_desc') }}</span>
                  </div>
                </div>
              </div>

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
                  {{ t('bg_color_desc') }}
                </p>
                <div class="color-palette-row">
                  <div
                    v-for="color in bgPaletteColors"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.bgColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="localConfig.bgColor = color"
                  />
                  <ModernColorPicker v-model="localConfig.bgColor">
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

              <!-- Imagem de Fundo (Wallpapers Dinâmicos) -->
              <div class="settings-section">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-image-outline
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('bg_image') }}
                  </span>
                </div>
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
                    <span>{{ t('none') }}</span>
                  </div>

                  <!-- Imagens do Usuário -->
                  <div
                    v-for="(img, idx) in savedImages"
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
                      @click.stop="removeSavedImage(idx)"
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
                    @click="triggerImageUpload"
                  >
                    <v-icon size="22" color="primary">
                      mdi-plus
                    </v-icon>
                  </div>
                </div>

                <!-- Input File Oculto -->
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  @change="onBgImageSelect"
                />
              </div>
            </div>

            <!-- ABA: TEXTO / PONTEIROS -->
            <div v-if="activeTab === 'text'" class="tab-pane">
              <div class="settings-section mb-4">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-palette-outline
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('text_color') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ localConfig.style === 'analog' ? 'Cor dos ponteiros principais e marcações da esfera analógica' : 'Cor dos dígitos de horas, minutos e segundos na tela' }}
                </p>
                <div class="color-palette-row mb-4">
                  <div
                    v-for="color in textPaletteColors"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.textColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="localConfig.textColor = color"
                  />
                  <ModernColorPicker v-model="localConfig.textColor">
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
            </div>

            <!-- ABA: FORMATO -->
            <div v-if="activeTab === 'format'" class="tab-pane">
              <!-- Mostrar Segundos -->
              <div class="setting-item-card mb-4 d-flex align-center justify-space-between">
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-icon size="22" color="primary">
                    mdi-timer-sand
                  </v-icon>
                  <div>
                    <h4 class="font-weight-bold text-body-2 mb-0" style="color: var(--sidebar-text);">
                      {{ t('show_seconds') }}
                    </h4>
                    <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
                      Exibir segundos em tempo real ao lado dos minutos
                    </p>
                  </div>
                </div>
                <v-switch
                  v-model="localConfig.showSeconds"
                  color="primary"
                  inset
                  hide-details
                  density="compact"
                />
              </div>

              <!-- Formato 24h -->
              <div class="setting-item-card d-flex align-center justify-space-between">
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-icon size="22" color="primary">
                    mdi-clock-digital
                  </v-icon>
                  <div>
                    <h4 class="font-weight-bold text-body-2 mb-0" style="color: var(--sidebar-text);">
                      {{ t('format_24h') }}
                    </h4>
                    <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
                      Alternar entre formato 24h e formato 12h (com indicador AM/PM)
                    </p>
                  </div>
                </div>
                <v-switch
                  v-model="localConfig.format24h"
                  color="primary"
                  inset
                  hide-details
                  density="compact"
                />
              </div>
            </div>

            <!-- ABA: POSICIONAMENTO -->
            <div v-if="activeTab === 'position'" class="tab-pane">
              <!-- Tamanho do Relógio (Escala) -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-1">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-arrow-expand-all
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('size') }}
                  </span>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('size_desc') }}
                </p>
                <div class="slider-control-row d-flex align-center" style="gap: 12px;">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="slider-step-btn"
                    @click="localConfig.sizeScale = Math.max(50, localConfig.sizeScale - 5)"
                  >
                    <v-icon size="18">
                      mdi-minus
                    </v-icon>
                  </v-btn>
                  <v-slider
                    v-model="localConfig.sizeScale"
                    :min="50"
                    :max="200"
                    :step="5"
                    hide-details
                    color="primary"
                    class="flex-grow-1"
                  />
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="slider-step-btn"
                    @click="localConfig.sizeScale = Math.min(200, localConfig.sizeScale + 5)"
                  >
                    <v-icon size="18">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="tonal"
                    class="font-weight-bold"
                    style="min-width: 58px; justify-content: center;"
                  >
                    {{ localConfig.sizeScale }}%
                  </v-chip>
                </div>
              </div>

              <!-- Alinhamento Rápido -->
              <div class="settings-section mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-crosshairs
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('position') }}
                    </span>
                  </div>
                  <v-btn
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="text-none font-weight-bold rounded-lg"
                    prepend-icon="mdi-crosshairs-gps"
                    @click="centerClock"
                  >
                    {{ t('center') }}
                  </v-btn>
                </div>
                <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary);">
                  {{ t('position_desc') }}
                </p>

                <!-- Seletor de Alvo de Arraste (quando título está livre) -->
                <div
                  v-if="effectiveConfig.customText && localConfig.customTextPosition === 'custom'"
                  class="mb-3 d-flex align-center"
                  style="gap: 10px;"
                >
                  <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                    {{ t('drag_target') }}
                  </span>
                  <PillSwitch
                    v-model="activePosTarget"
                    :items="[
                      { label: t('pos_target_clock'), value: 'clock', icon: 'mdi-clock-outline' },
                      { label: t('pos_target_text'), value: 'text', icon: 'mdi-format-title' }
                    ]"
                  />
                </div>

                <div class="d-flex justify-center pa-2">
                  <PositionAlignmentPicker
                    :x="currentCoordX"
                    :y="currentCoordY"
                    :hide-sliders="true"
                    @update:x="onUpdateCoordX"
                    @update:y="onUpdateCoordY"
                  />
                </div>
              </div>
            </div>

            <!-- ABA: TÍTULO -->
            <div v-if="activeTab === 'title'" class="tab-pane">
              <!-- Habilitar Título -->
              <div class="setting-item-card mb-4 d-flex align-center justify-space-between">
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-icon size="22" color="primary">
                    mdi-subtitles-outline
                  </v-icon>
                  <div>
                    <h4 class="font-weight-bold text-body-2 mb-0" style="color: var(--sidebar-text);">
                      {{ t('title_enable') }}
                    </h4>
                    <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
                      {{ t('custom_text_desc') }}
                    </p>
                  </div>
                </div>
                <v-switch
                  v-model="enableCustomText"
                  color="primary"
                  inset
                  hide-details
                  density="compact"
                />
              </div>

              <!-- Configurações do Título (quando habilitado) -->
              <template v-if="enableCustomText">
                <!-- Texto -->
                <div class="settings-section mb-4">
                  <span class="text-subtitle-2 font-weight-bold section-title d-block mb-2">
                    {{ t('title_text') }}
                  </span>
                  <v-text-field
                    v-model="localConfig.customText"
                    :placeholder="t('custom_text_placeholder')"
                    density="comfortable"
                    variant="outlined"
                    rounded="lg"
                    hide-details
                    color="primary"
                    clearable
                  />
                </div>

                <!-- Posição do Título -->
                <div class="settings-section mb-4">
                  <span class="text-subtitle-2 font-weight-bold section-title d-block mb-2">
                    {{ t('title_pos') }}
                  </span>
                  <PillSwitch
                    v-model="localConfig.customTextPosition"
                    :items="[
                      { label: t('pos_above'), value: 'above', icon: 'mdi-format-vertical-align-top' },
                      { label: t('pos_below'), value: 'below', icon: 'mdi-format-vertical-align-bottom' },
                      { label: t('pos_custom'), value: 'custom', icon: 'mdi-cursor-move' }
                    ]"
                    block
                  />
                </div>

                <!-- Cor do Título -->
                <div class="settings-section mb-4">
                  <span class="text-subtitle-2 font-weight-bold section-title d-block mb-2">
                    {{ t('title_color') }}
                  </span>
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

                <!-- Tamanho da Fonte do Título -->
                <div class="settings-section">
                  <span class="text-subtitle-2 font-weight-bold section-title d-block mb-2">
                    {{ t('title_size') }}
                  </span>
                  <div class="slider-control-row d-flex align-center" style="gap: 12px;">
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.customTextSizePc = Math.max(4, localConfig.customTextSizePc - 1)"
                    >
                      <v-icon size="18">
                        mdi-minus
                      </v-icon>
                    </v-btn>
                    <v-slider
                      v-model="localConfig.customTextSizePc"
                      :min="4"
                      :max="20"
                      :step="1"
                      hide-details
                      color="primary"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="slider-step-btn"
                      @click="localConfig.customTextSizePc = Math.min(20, localConfig.customTextSizePc + 1)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                    <v-chip
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="font-weight-bold"
                      style="min-width: 58px; justify-content: center;"
                    >
                      {{ localConfig.customTextSizePc }}%
                    </v-chip>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Coluna 3: Pré-visualização Fixa 16:9 com Arraste -->
          <div class="clock-config-preview-col pa-4 d-flex flex-column flex-shrink-0">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('tab_preview') || 'Pré-visualização' }}
              </span>
              <v-chip
                size="x-small"
                color="primary"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ t('preview_ratio') || '16:9 Tela' }}
              </v-chip>
            </div>

            <!-- Box 16:9 Interativo com Arraste -->
            <div
              ref="previewClockRef"
              class="preview-box-16-9 overflow-hidden position-relative cursor-move user-select-none mb-3"
              :style="{
                background: localConfig.bgColor,
              }"
              @pointerdown="startDrag"
            >
              <ClockScreen
                :preview="false"
                :preview-config="effectiveConfig"
              />

              <!-- Alça delimitadora interativa para Título Livre -->
              <template v-if="effectiveConfig.customText && localConfig.customTextPosition === 'custom'">
                <div
                  class="position-absolute custom-text-drag-box"
                  :style="{
                    left: `${localConfig.customTextX ?? 50}%`,
                    top: `${localConfig.customTextY ?? 20}%`,
                    transform: `translate(-${localConfig.customTextX ?? 50}%, -${localConfig.customTextY ?? 20}%)`,
                    border: activePosTarget === 'text' ? '2px dashed rgb(var(--v-theme-primary))' : '1px dashed rgba(255,255,255,0.5)',
                    borderRadius: '6px',
                    cursor: 'move',
                    zIndex: 15,
                  }"
                  @pointerdown.stop="selectAndDrag('text', $event)"
                >
                  <span class="drag-handle-tag">
                    {{ t('pos_target_text') }}
                  </span>
                </div>
              </template>
            </div>

            <!-- Dica Visual de Arraste Livre -->
            <div class="preview-info-box pa-3 rounded-lg d-flex align-start" style="gap: 10px;">
              <v-icon size="20" color="primary" class="mt-0.5 flex-shrink-0">
                mdi-cursor-move
              </v-icon>
              <div class="text-caption preview-info-text">
                {{ t('drag_hint') }}
              </div>
            </div>
          </div>
        </div>

        <v-divider style="border-color: var(--border-color); opacity: 0.6;" />

        <!-- Footer Fixo -->
        <div class="clock-config-footer px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
          <v-btn
            variant="tonal"
            color="error"
            class="rounded-lg text-none font-weight-bold"
            @click="resetToDefault"
          >
            {{ t('restore_default') }}
          </v-btn>
          <div class="d-flex align-center" style="gap: 12px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none font-weight-bold"
              @click="cancel"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              color="primary"
              class="rounded-lg text-none font-weight-bold px-6"
              @click="saveAndClose"
            >
              {{ t('apply') }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import PositionAlignmentPicker from "@/components/inputs/PositionAlignmentPicker.vue";
import PillSwitch from "@/components/inputs/PillSwitch.vue";
import ClockScreen from "./Screen.vue";

export default defineComponent({
  name: "ClockConfigModal",
  components: {
    ModernColorPicker,
    PositionAlignmentPicker,
    PillSwitch,
    ClockScreen,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data: () => ({
    activeTab: "appearance" as "appearance" | "text" | "format" | "position" | "title",
    activePosTarget: "clock" as "clock" | "text",
    enableCustomText: false,
    savedImages: [] as string[],
    bgPaletteColors: [
      "#000000",
      "#0f172a",
      "#1a1a1a",
      "#ffffff",
      "#1976d2",
      "#388e3c",
      "#d32f2f",
      "#f57c00",
      "#7b1fa2",
    ],
    textPaletteColors: [
      "#ffffff",
      "#f8fafc",
      "#000000",
      "#f59e0b",
      "#009fe3",
      "#10b981",
      "#ef4444",
      "#a855f7",
    ],
    localConfig: {
      style: "digital",
      showSeconds: true,
      format24h: true,
      bgColor: "#000000",
      bgImage: null as string | null,
      textColor: "#FFFFFF",
      sizeScale: 100,
      posX: 50,
      posY: 50,
      customText: "",
      customTextColor: "#FFFFFF",
      customTextSizePc: 8,
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
    },
    defaultConfig: {
      style: "digital",
      showSeconds: true,
      format24h: true,
      bgColor: "#000000",
      bgImage: null as string | null,
      textColor: "#FFFFFF",
      sizeScale: 100,
      posX: 50,
      posY: 50,
      customText: "",
      customTextColor: "#FFFFFF",
      customTextSizePc: 8,
      customTextPosition: "above",
      customTextX: 50,
      customTextY: 20,
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
    effectiveConfig(): any {
      return {
        ...this.localConfig,
        customText: this.enableCustomText ? (this.localConfig.customText || "") : "",
      };
    },
    currentCoordX(): number {
      if (
        this.effectiveConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        return this.localConfig.customTextX ?? 50;
      }
      return this.localConfig.posX ?? 50;
    },
    currentCoordY(): number {
      if (
        this.effectiveConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        return this.localConfig.customTextY ?? 20;
      }
      return this.localConfig.posY ?? 50;
    },
  },
  watch: {
    internalValue(val: boolean) {
      if (val) {
        this.loadConfig();
      }
    },
  },
  methods: {
    t(key: string): string {
      return this.$t(`modules.clock.${key}`);
    },
    loadConfig() {
      const saved = this.$userdata.get("clock_config");
      if (saved) {
        this.localConfig = { ...this.defaultConfig, ...saved };
      } else {
        this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
      }
      this.enableCustomText = Boolean(this.localConfig.customText && this.localConfig.customText.trim().length > 0);

      // Carregar wallpapers do usuário salvos
      const userWallpapers = this.$userdata.get("clock_user_wallpapers") || this.$userdata.get("user_wallpapers") || [];
      this.savedImages = Array.isArray(userWallpapers) ? [...userWallpapers] : [];
      if (this.localConfig.bgImage && !this.savedImages.includes(this.localConfig.bgImage)) {
        this.savedImages.push(this.localConfig.bgImage);
      }
    },
    resetToDefault() {
      this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
      this.enableCustomText = false;
    },
    centerClock() {
      if (
        this.effectiveConfig.customText &&
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
    onUpdateCoordX(val: number) {
      if (
        this.effectiveConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        this.localConfig.customTextX = val;
      } else {
        this.localConfig.posX = val;
      }
    },
    onUpdateCoordY(val: number) {
      if (
        this.effectiveConfig.customText &&
        this.localConfig.customTextPosition === "custom" &&
        this.activePosTarget === "text"
      ) {
        this.localConfig.customTextY = val;
      } else {
        this.localConfig.posY = val;
      }
    },
    triggerImageUpload() {
      (this.$refs.fileInputRef as HTMLInputElement)?.click();
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
              this.localConfig.bgImage = dataUrl;
              if (!this.savedImages.includes(dataUrl)) {
                this.savedImages.push(dataUrl);
                this.$userdata.set("clock_user_wallpapers", this.savedImages);
              }
              return;
            }
          }
          const rawUrl = e.target?.result as string;
          this.localConfig.bgImage = rawUrl;
          if (!this.savedImages.includes(rawUrl)) {
            this.savedImages.push(rawUrl);
            this.$userdata.set("clock_user_wallpapers", this.savedImages);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    removeSavedImage(idx: number) {
      const removed = this.savedImages.splice(idx, 1)[0];
      if (this.localConfig.bgImage === removed) {
        this.localConfig.bgImage = null;
      }
      this.$userdata.set("clock_user_wallpapers", this.savedImages);
    },
    selectAndDrag(target: "clock" | "text", e: PointerEvent) {
      this.activePosTarget = target;
      this.startDrag(e);
    },
    startDrag(e: PointerEvent) {
      const el = this.$refs.previewClockRef as HTMLElement;
      if (!el) return;
      const updatePos = (evt: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const rawX = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
        const rawY = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
        const clampedX = Math.max(5, Math.min(95, rawX));
        const clampedY = Math.max(5, Math.min(95, rawY));
        if (
          this.effectiveConfig.customText &&
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
      const cloned = JSON.parse(JSON.stringify(this.effectiveConfig));
      this.$appdata.set("clock_config", cloned);
      this.$userdata.set("clock_config", cloned);
      this.$userdata.set("clock_user_wallpapers", this.savedImages);
      this.close();
    },
    cancel() {
      this.close();
    },
    close() {
      this.internalValue = false;
    },
  },
});
</script>

<style scoped>
.clock-config-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
}

.clock-config-modal {
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
  height: 600px;
}

.clock-config-header {
  background: rgba(150, 150, 150, 0.03);
}

.clock-config-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock-config-title {
  color: var(--sidebar-text);
  line-height: 1.2;
}

.clock-config-subtitle {
  color: var(--sidebar-text-secondary);
}

.clock-config-close-btn {
  color: var(--sidebar-text-secondary);
  border-radius: 10px !important;
  transition: all 0.2s ease;
}

.clock-config-close-btn:hover {
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.1);
}

/* Body & Columns */
.clock-config-body {
  min-height: 0;
}

/* Coluna 1: Abas de Navegação */
.clock-config-nav-col {
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

/* Coluna 2: Configurações */
.clock-config-content-col {
  background: var(--card-bg);
}

.section-title {
  color: var(--sidebar-text);
}

/* Cards de Estilo Digital vs Analógico */
.style-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.style-card {
  padding: 16px;
  border-radius: 14px;
  border: 2px solid var(--border-color);
  background: rgba(150, 150, 150, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.style-card:hover {
  background: rgba(150, 150, 150, 0.06);
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
}

.style-card.active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 4px 14px rgba(var(--v-theme-primary), 0.2);
}

.style-card-badge {
  font-size: 18px;
  font-family: monospace;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.style-card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--sidebar-text);
}

.style-card-desc {
  font-size: 12px;
  color: var(--sidebar-text-secondary);
  line-height: 1.3;
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

/* Card de Configuração */
.setting-item-card {
  padding: 16px;
  border-radius: 12px;
  background: rgba(150, 150, 150, 0.04);
  border: 1px solid var(--border-color);
}

/* Coluna 3: Pré-visualização Fixa */
.clock-config-preview-col {
  width: 380px;
  background: rgba(150, 150, 150, 0.03);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

@container config-modal (max-width: 980px) {
  .clock-config-preview-col {
    display: none !important;
  }
}

@media (max-width: 980px) {
  .clock-config-preview-col {
    display: none !important;
  }
}

@container config-modal (max-width: 560px) {
  .clock-config-nav-col {
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
  .clock-config-nav-col {
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

.custom-text-drag-box {
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle-tag {
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}

/* Footer */
.clock-config-footer {
  background: var(--card-bg);
}

.slider-step-btn {
  border-radius: 8px !important;
}
</style>
