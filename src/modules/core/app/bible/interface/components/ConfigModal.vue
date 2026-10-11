<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="visible"
      class="d-flex align-center justify-center bible-config-backdrop"
      @click.self="cancel"
    >
      <v-card
        class="bible-config-modal rounded-xl"
        width="96%"
        max-width="1040"
      >
        <!-- Header -->
        <div class="bible-config-header px-6 py-4 d-flex align-center justify-space-between flex-shrink-0">
          <div class="d-flex align-center" style="gap: 12px;">
            <div class="bible-config-icon-badge">
              <v-icon color="primary" size="22">
                mdi-palette-outline
              </v-icon>
            </div>
            <div>
              <h2 class="text-h6 font-weight-bold mb-0 bible-config-title">
                {{ t('proj_customization') }}
              </h2>
              <p class="text-caption mb-0 bible-config-subtitle">
                {{ t('modal_subtitle') }}
              </p>
            </div>
          </div>
          <v-btn
            icon
            size="small"
            variant="text"
            class="bible-config-close-btn"
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
        <div class="bible-config-body d-flex flex-grow-1 overflow-hidden">
          <!-- Coluna 1: Abas Verticais (Apenas Visual, Texto, Referência) -->
          <div class="bible-config-nav-col pa-3 d-flex flex-column flex-shrink-0">
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'visual' }"
              @click="activeTab = 'visual'"
            >
              <v-icon size="18">
                mdi-palette-outline
              </v-icon>
              <span>{{ t('tab_visual') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'text' }"
              @click="activeTab = 'text'"
            >
              <v-icon size="18">
                mdi-format-text
              </v-icon>
              <span>{{ t('tab_text') }}</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'reference' }"
              @click="activeTab = 'reference'"
            >
              <v-icon size="18">
                mdi-book-open-page-variant
              </v-icon>
              <span>{{ t('tab_reference') }}</span>
            </button>
          </div>

          <!-- Coluna 2: Configurações da Aba Ativa -->
          <div class="bible-config-content-col pa-5 flex-grow-1 overflow-y-auto">
            <!-- ABA: VISUAL -->
            <div v-if="activeTab === 'visual'" class="tab-pane">
              <!-- Tema da Projeção (Presets) -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-view-dashboard-outline
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('theme_preset') }}
                  </span>
                </div>
                <div class="theme-presets-grid">
                  <!-- Padrão -->
                  <div
                    class="theme-preset-card"
                    :class="{ active: currentThemePreset === 'default' }"
                    @click="applyThemePreset('default')"
                  >
                    <div class="theme-preset-thumb preset-default-bg">
                      <div class="sample-line sample-line-text" />
                      <div class="sample-line sample-line-ref" />
                    </div>
                    <span class="theme-preset-label">{{ t('theme_default') }}</span>
                  </div>

                  <!-- Escuro -->
                  <div
                    class="theme-preset-card"
                    :class="{ active: currentThemePreset === 'dark' }"
                    @click="applyThemePreset('dark')"
                  >
                    <div class="theme-preset-thumb preset-dark-bg">
                      <div class="sample-line sample-line-text" />
                      <div class="sample-line sample-line-ref-cyan" />
                    </div>
                    <span class="theme-preset-label">{{ t('theme_dark') }}</span>
                  </div>

                  <!-- Claro -->
                  <div
                    class="theme-preset-card"
                    :class="{ active: currentThemePreset === 'light' }"
                    @click="applyThemePreset('light')"
                  >
                    <div class="theme-preset-thumb preset-light-bg">
                      <div class="sample-line sample-line-dark" />
                      <div class="sample-line sample-line-ref-amber" />
                    </div>
                    <span class="theme-preset-label">{{ t('theme_light') }}</span>
                  </div>
                </div>
              </div>

              <!-- Cor de Fundo -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-color-fill
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('color_bg') }}
                  </span>
                </div>
                <div class="color-palette-row">
                  <div
                    v-for="color in bgPalette"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.background === color }"
                    :style="{ background: color }"
                    @click="localConfig.background = color"
                  />
                  <ModernColorPicker v-model="localConfig.background">
                    <template #activator="{ props }">
                      <div v-bind="props" class="color-circle color-picker-btn" title="Conta-gotas">
                        <v-icon size="16">
                          mdi-eyedropper
                        </v-icon>
                      </div>
                    </template>
                  </ModernColorPicker>
                </div>
              </div>

              <!-- Imagem de Fundo (Apenas Nenhuma + Imagens Adicionadas + Botão +) -->
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
                  <!-- Opção: Nenhuma Imagem -->
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

                  <!-- Imagens Adicionadas pelo Usuário -->
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

                  <!-- Botão Adicionar Imagem (+) -->
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
                <input
                  ref="bgImageInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  @change="onBgImageSelect"
                />
              </div>
            </div>

            <!-- ABA: TEXTO (Versículo Principal) -->
            <div v-else-if="activeTab === 'text'" class="tab-pane">
              <!-- Tamanho da Fonte -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center justify-space-between mb-3">
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
                    {{ localConfig.fontSizePc }}
                  </v-chip>
                </div>
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

              <!-- Cor da Fonte -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-palette
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('font_color') }}
                  </span>
                </div>
                <div class="color-palette-row">
                  <div
                    v-for="color in textPalette"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.color === color }"
                    :style="{ background: color }"
                    @click="localConfig.color = color"
                  />
                  <ModernColorPicker v-model="localConfig.color">
                    <template #activator="{ props }">
                      <div v-bind="props" class="color-circle color-picker-btn">
                        <v-icon size="16">
                          mdi-eyedropper
                        </v-icon>
                      </div>
                    </template>
                  </ModernColorPicker>
                </div>
              </div>

              <!-- Alinhamento do Texto -->
              <div class="settings-section">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-format-align-center
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('text_align') }}
                    </span>
                  </div>
                  <v-btn-toggle
                    v-model="localConfig.align"
                    color="primary"
                    variant="tonal"
                    divided
                    mandatory
                    rounded="lg"
                    style="height: 38px;"
                  >
                    <v-btn value="text-left" class="px-3">
                      <v-icon size="20">
                        mdi-format-align-left
                      </v-icon>
                    </v-btn>
                    <v-btn value="text-center" class="px-3">
                      <v-icon size="20">
                        mdi-format-align-center
                      </v-icon>
                    </v-btn>
                    <v-btn value="text-right" class="px-3">
                      <v-icon size="20">
                        mdi-format-align-right
                      </v-icon>
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </div>

            <!-- ABA: REFERÊNCIA BÍBLICA -->
            <div v-else-if="activeTab === 'reference'" class="tab-pane">
              <!-- Tamanho da Fonte da Referência -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center justify-space-between mb-3">
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
                    {{ localConfig.refFontSizePc }}
                  </v-chip>
                </div>
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="slider-step-btn"
                    @click="localConfig.refFontSizePc = Math.max(2, localConfig.refFontSizePc - 1)"
                  >
                    <v-icon size="18">
                      mdi-minus
                    </v-icon>
                  </v-btn>
                  <v-slider
                    v-model="localConfig.refFontSizePc"
                    :min="2"
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
                    @click="localConfig.refFontSizePc = Math.min(20, localConfig.refFontSizePc + 1)"
                  >
                    <v-icon size="18">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Cor da Referência -->
              <div class="settings-section mb-5">
                <div class="d-flex align-center mb-3">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-palette
                  </v-icon>
                  <span class="text-subtitle-2 font-weight-bold section-title">
                    {{ t('font_color') }}
                  </span>
                </div>
                <div class="color-palette-row">
                  <div
                    v-for="color in refPalette"
                    :key="color"
                    class="color-circle"
                    :class="{ active: localConfig.refColor === color }"
                    :style="{ background: color }"
                    @click="localConfig.refColor = color"
                  />
                  <ModernColorPicker v-model="localConfig.refColor">
                    <template #activator="{ props }">
                      <div v-bind="props" class="color-circle color-picker-btn">
                        <v-icon size="16">
                          mdi-eyedropper
                        </v-icon>
                      </div>
                    </template>
                  </ModernColorPicker>
                </div>
              </div>

              <!-- Alinhamento da Referência -->
              <div class="settings-section">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon size="18" color="primary" class="mr-2">
                      mdi-format-align-right
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold section-title">
                      {{ t('text_align') }}
                    </span>
                  </div>
                  <v-btn-toggle
                    v-model="localConfig.refAlign"
                    color="primary"
                    variant="tonal"
                    divided
                    mandatory
                    rounded="lg"
                    style="height: 38px;"
                  >
                    <v-btn value="text-left" class="px-3">
                      <v-icon size="20">
                        mdi-format-align-left
                      </v-icon>
                    </v-btn>
                    <v-btn value="text-center" class="px-3">
                      <v-icon size="20">
                        mdi-format-align-center
                      </v-icon>
                    </v-btn>
                    <v-btn value="text-right" class="px-3">
                      <v-icon size="20">
                        mdi-format-align-right
                      </v-icon>
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna 3: Pré-visualização Fixa (Sticky à Direita) -->
          <div class="bible-config-preview-col pa-5 flex-shrink-0 d-flex flex-column">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-monitor-dashboard
                </v-icon>
                <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                  {{ t('tab_preview') }} (16:9)
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

            <!-- Preview Card 16:9 -->
            <div
              class="preview-box-16-9 rounded-xl position-relative overflow-hidden user-select-none d-flex align-center justify-center"
              :style="{
                backgroundColor: localConfig.background,
                backgroundImage: localConfig.bgImage ? `url('${localConfig.bgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }"
            >
              <div class="d-flex flex-column w-100 pa-4" :class="[localConfig.align]">
                <div
                  :style="{
                    fontSize: `${localConfig.fontSizePc * 0.95}px`,
                    color: localConfig.color,
                    lineHeight: '1.4',
                    textShadow: localConfig.bgImage ? '0 2px 10px rgba(0,0,0,0.85)' : 'none'
                  }"
                >
                  No princípio, criou Deus os céus e a terra.
                </div>
                <div
                  class="mt-3 font-weight-bold"
                  :class="[localConfig.refAlign || 'text-right']"
                  :style="{
                    fontSize: `${localConfig.refFontSizePc * 0.95}px`,
                    color: localConfig.refColor,
                    textShadow: localConfig.bgImage ? '0 2px 8px rgba(0,0,0,0.85)' : 'none'
                  }"
                >
                  Gênesis 1:1 (ARA)
                </div>
              </div>
            </div>

            <!-- Dica Informativa -->
            <div class="preview-info-box mt-4 pa-3 rounded-lg d-flex align-start" style="gap: 10px;">
              <v-icon size="18" color="primary" class="mt-0.5">
                mdi-information-outline
              </v-icon>
              <div class="text-caption preview-info-text">
                {{ t('preview_info') }}
              </div>
            </div>
          </div>
        </div>

        <v-divider style="border-color: var(--border-color); opacity: 0.6;" />

        <!-- Footer -->
        <div class="bible-config-footer px-6 py-3 d-flex align-center justify-space-between flex-shrink-0">
          <v-btn
            variant="tonal"
            color="error"
            class="rounded-lg text-none px-5 font-weight-bold"
            @click="resetToDefault"
          >
            {{ t('restore_default') }}
          </v-btn>
          <div class="d-flex align-center" style="gap: 12px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none px-5 font-weight-bold"
              @click="cancel"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              elevation="0"
              class="rounded-lg text-none px-6 font-weight-bold"
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

export default defineComponent({
  name: "ConfigModal",
  components: {
    ModernColorPicker,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      activeTab: "visual" as "visual" | "text" | "reference",
      savedImages: [] as string[],
      bgPalette: [
        "#000000",
        "#111827",
        "#1e293b",
        "#0284c7",
        "#10b981",
        "#ec4899",
        "#8b5cf6",
        "#f59e0b",
      ],
      textPalette: [
        "#FFFFFF",
        "#f6c32a",
        "#38bdf8",
        "#4ade80",
        "#f43f5e",
        "#c084fc",
        "#fed7aa",
        "#e2e8f0",
      ],
      refPalette: [
        "#fb8c00",
        "#38bdf8",
        "#FFFFFF",
        "#f6c32a",
        "#4ade80",
        "#f43f5e",
        "#c084fc",
        "#94a3b8",
      ],
      localConfig: {
        fontSizePc: 15,
        align: "text-center",
        background: "#000000",
        bgImage: null as string | null,
        color: "#ffffff",
        refFontSizePc: 10,
        refColor: "#fb8c00",
        refAlign: "text-right",
      } as Record<string, any>,
      defaultConfig: {
        fontSizePc: 15,
        align: "text-center",
        background: "#000000",
        bgImage: null as string | null,
        color: "#ffffff",
        refFontSizePc: 10,
        refColor: "#fb8c00",
        refAlign: "text-right",
      } as Record<string, any>,
    };
  },
  computed: {
    visible: {
      get(): boolean {
        return this.modelValue;
      },
      set(value: boolean) {
        this.$emit("update:modelValue", value);
      },
    },
    currentThemePreset(): "default" | "dark" | "light" | "custom" {
      if (
        this.localConfig.background === "#000000" &&
        this.localConfig.color === "#ffffff" &&
        this.localConfig.refColor === "#fb8c00"
      ) {
        return "default";
      }
      if (
        this.localConfig.background === "#0f172a" &&
        this.localConfig.color === "#ffffff" &&
        this.localConfig.refColor === "#38bdf8"
      ) {
        return "dark";
      }
      if (
        this.localConfig.background === "#f8fafc" &&
        this.localConfig.color === "#0f172a" &&
        this.localConfig.refColor === "#d97706"
      ) {
        return "light";
      }
      return "custom";
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
      return this.$t(`modules.bible.${text}`);
    },
    loadConfig() {
      // Carregar lista de imagens salvas pelo usuário
      const userImages = this.$userdata.get("bible_saved_bg_images");
      if (Array.isArray(userImages)) {
        this.savedImages = [...userImages];
      } else {
        this.savedImages = [];
      }

      const savedConfig =
        this.$appdata.get("modules.bible.config") ||
        this.$userdata.get("bible_config");
      if (savedConfig) {
        this.localConfig = { ...this.defaultConfig, ...savedConfig };
      } else {
        this.localConfig = { ...this.defaultConfig };
      }

      // Se há imagem selecionada atualmente e ela não consta na lista, adiciona
      if (this.localConfig.bgImage && !this.savedImages.includes(this.localConfig.bgImage)) {
        this.savedImages.push(this.localConfig.bgImage);
      }
    },
    applyThemePreset(theme: "default" | "dark" | "light") {
      if (theme === "default") {
        this.localConfig.background = "#000000";
        this.localConfig.color = "#ffffff";
        this.localConfig.refColor = "#fb8c00";
      } else if (theme === "dark") {
        this.localConfig.background = "#0f172a";
        this.localConfig.color = "#ffffff";
        this.localConfig.refColor = "#38bdf8";
      } else if (theme === "light") {
        this.localConfig.background = "#f8fafc";
        this.localConfig.color = "#0f172a";
        this.localConfig.refColor = "#d97706";
      }
    },
    removeSavedImage(idx: number) {
      const removed = this.savedImages.splice(idx, 1)[0];
      if (this.localConfig.bgImage === removed) {
        this.localConfig.bgImage = null;
      }
      this.$userdata.set("bible_saved_bg_images", this.savedImages);
    },
    resetToDefault() {
      this.localConfig = { ...this.defaultConfig };
      this.activeTab = "visual";
    },
    triggerImageUpload() {
      (this.$refs.bgImageInputRef as HTMLInputElement | undefined)?.click();
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
          let finalDataUrl = "";
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
              finalDataUrl = canvas.toDataURL("image/jpeg", 0.85);
            }
          }
          if (!finalDataUrl) {
            finalDataUrl = e.target?.result as string;
          }

          if (finalDataUrl) {
            if (!this.savedImages.includes(finalDataUrl)) {
              this.savedImages.push(finalDataUrl);
              this.$userdata.set("bible_saved_bg_images", this.savedImages);
            }
            this.localConfig.bgImage = finalDataUrl;
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    saveAndClose() {
      this.$appdata.set(
        "modules.bible.config",
        JSON.parse(JSON.stringify(this.localConfig)),
      );
      this.$userdata.set(
        "bible_config",
        JSON.parse(JSON.stringify(this.localConfig)),
      );
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
.bible-config-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
}

.bible-config-modal {
  container-type: inline-size;
  container-name: config-modal;
  background: var(--card-bg, #ffffff) !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
  border: 1px solid var(--border-color);
  border-radius: 20px !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  height: 600px;
}

.bible-config-header {
  background: rgba(150, 150, 150, 0.03);
}

.bible-config-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bible-config-title {
  color: var(--sidebar-text);
  line-height: 1.2;
}

.bible-config-subtitle {
  color: var(--sidebar-text-secondary);
}

.bible-config-close-btn {
  color: var(--sidebar-text-secondary);
  border-radius: 10px !important;
  transition: all 0.2s ease;
}

.bible-config-close-btn:hover {
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.1);
}

/* Body & Columns */
.bible-config-body {
  min-height: 0;
}

/* Coluna 1: Abas de Navegação */
.bible-config-nav-col {
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
.bible-config-content-col {
  background: var(--card-bg);
}

.section-title {
  color: var(--sidebar-text);
}

/* Presets de Tema */
.theme-presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-preset-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-preset-thumb {
  height: 64px;
  border-radius: 10px;
  border: 2px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.theme-preset-card.active .theme-preset-thumb {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.25);
}

.preset-default-bg {
  background: #000000;
}

.preset-dark-bg {
  background: #0f172a;
}

.preset-light-bg {
  background: #f8fafc;
}

.sample-line {
  height: 5px;
  border-radius: 3px;
  width: 60%;
}

.sample-line-text {
  background: rgba(255, 255, 255, 0.85);
}

.sample-line-dark {
  background: rgba(15, 23, 42, 0.85);
}

.sample-line-ref {
  background: #fb8c00;
  width: 35%;
}

.sample-line-ref-cyan {
  background: #38bdf8;
  width: 35%;
}

.sample-line-ref-amber {
  background: #d97706;
  width: 35%;
}

.theme-preset-label {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--sidebar-text-secondary);
  padding: 3px 0;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.theme-preset-card.active .theme-preset-label {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
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

/* Miniaturas de Wallpapers Dinâmicas */
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
.bible-config-preview-col {
  width: 380px;
  background: rgba(150, 150, 150, 0.03);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

/* Oculta a pré-visualização quando a largura for reduzida para não espremer os controles */
@container config-modal (max-width: 980px) {
  .bible-config-preview-col {
    display: none !important;
  }
}

@media (max-width: 980px) {
  .bible-config-preview-col {
    display: none !important;
  }
}

@container config-modal (max-width: 560px) {
  .bible-config-nav-col {
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
  .bible-config-nav-col {
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

/* Footer */
.bible-config-footer {
  background: var(--card-bg);
}

.slider-step-btn {
  border-radius: 8px !important;
}
</style>
