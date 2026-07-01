<template>
  <v-slide-y-reverse-transition>
    <div v-if="visible" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <v-card class="bible-config-modal rounded-xl" width="100%" max-width="520" style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden;">
        
        <!-- Header -->
        <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon color="primary" size="32" class="mr-3">mdi-palette-outline</v-icon>
              <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">Personalização da Projeção</h2>
            </div>
            <v-btn icon variant="text" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
            Ajuste o visual da bíblia na tela
          </p>
        </div>
      <div style="background: var(--main-bg, #f5f5f5); padding: 24px; max-height: 60vh; overflow-y: auto;">
        
        <!-- Fundo da Projeção -->
        <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-6">
              <v-icon color="primary" class="mr-3" size="24">mdi-format-color-fill</v-icon>
              <div>
                <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Fundo da Projeção</h3>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">Cor base de fundo da tela de exibição</div>
              </div>
            </div>
            <div class="d-flex flex-wrap align-center" style="gap: 10px;">
              <div
                v-for="color in ['#000000', '#1A1A1A', '#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2', '#455A64']"
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
              <v-menu :close-on-content-click="false" location="bottom">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                    style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                  >
                    <v-icon size="16" color="grey">mdi-eyedropper</v-icon>
                  </div>
                </template>
                <v-card class="pa-3 rounded-xl" style="background: var(--card-bg);">
                  <v-color-picker v-model="localConfig.background" mode="hexa" hide-inputs :swatches="[]" elevation="0" />
                </v-card>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>

        <!-- Texto Principal e Alinhamento -->
        <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-6">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-3" size="24">mdi-format-text</v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Texto Principal</h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">Formatação dos versículos projetados</div>
                </div>
              </div>
            </div>
            
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon size="18" color="primary" class="mr-2">mdi-format-size</v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Tamanho da letra</span>
              </div>
              <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">{{ localConfig.fontSizePc }}</v-chip>
            </div>
            
            <div class="d-flex align-center mb-6" style="gap: 12px;">
              <v-btn icon size="small" variant="tonal" color="primary" @click="localConfig.fontSizePc = Math.max(5, localConfig.fontSizePc - 1)">
                <v-icon size="18">mdi-minus</v-icon>
              </v-btn>
              <v-slider
                v-model="localConfig.fontSizePc" min="5" max="30" step="1" hide-details color="primary" track-color="grey-lighten-3"
                class="flex-grow-1"
              />
              <v-btn icon size="small" variant="tonal" color="primary" @click="localConfig.fontSizePc = Math.min(30, localConfig.fontSizePc + 1)">
                <v-icon size="18">mdi-plus</v-icon>
              </v-btn>
            </div>

            <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>
            
            <div class="d-flex align-center mb-3">
              <v-icon size="18" color="primary" class="mr-2">mdi-palette</v-icon>
              <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Cor da letra</span>
            </div>
            
            <div class="d-flex flex-wrap align-center mb-6" style="gap: 10px;">
              <div
                v-for="color in ['#FFFFFF', '#f6c32a', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']"
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
              <v-menu :close-on-content-click="false" location="bottom">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                    style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                  >
                    <v-icon size="16" color="grey">mdi-eyedropper</v-icon>
                  </div>
                </template>
                <v-card class="pa-3 rounded-xl" style="background: var(--card-bg);">
                  <v-color-picker v-model="localConfig.color" mode="hexa" hide-inputs :swatches="[]" elevation="0" />
                </v-card>
              </v-menu>
            </div>

            <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>
            
            <div class="d-flex align-center justify-space-between">
              <div class="text-body-2 font-weight-medium" style="color: var(--sidebar-text-secondary);">Alinhamento do Texto</div>
              <v-btn-toggle v-model="localConfig.align" color="primary" variant="tonal" divided mandatory rounded="lg" style="height: 40px;">
                <v-btn value="text-left" class="px-4"><v-icon>mdi-format-align-left</v-icon></v-btn>
                <v-btn value="text-center" class="px-4"><v-icon>mdi-format-align-center</v-icon></v-btn>
                <v-btn value="text-right" class="px-4"><v-icon>mdi-format-align-right</v-icon></v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>

        <!-- Referência -->
        <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-6">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-3" size="24">mdi-book-open-page-variant</v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">Referência Bíblica</h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">Ex: Números 28:3</div>
                </div>
              </div>
            </div>
            
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon size="18" color="primary" class="mr-2">mdi-format-size</v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Tamanho da letra</span>
              </div>
              <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">{{ localConfig.refFontSizePc }}</v-chip>
            </div>
            
            <div class="d-flex align-center mb-6" style="gap: 12px;">
              <v-btn icon size="small" variant="tonal" color="primary" @click="localConfig.refFontSizePc = Math.max(2, localConfig.refFontSizePc - 1)">
                <v-icon size="18">mdi-minus</v-icon>
              </v-btn>
              <v-slider
                v-model="localConfig.refFontSizePc" min="2" max="20" step="1" hide-details color="primary" track-color="grey-lighten-3"
                class="flex-grow-1"
              />
              <v-btn icon size="small" variant="tonal" color="primary" @click="localConfig.refFontSizePc = Math.min(20, localConfig.refFontSizePc + 1)">
                <v-icon size="18">mdi-plus</v-icon>
              </v-btn>
            </div>
            
            <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>
            
            <div class="d-flex align-center mb-3">
              <v-icon size="18" color="primary" class="mr-2">mdi-palette</v-icon>
              <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Cor da letra</span>
            </div>
            
            <div class="d-flex flex-wrap align-center" style="gap: 10px;">
              <div
                v-for="color in ['#FFFFFF', '#f6c32a', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']"
                :key="color"
                class="rounded-circle cursor-pointer elevation-1"
                :class="localConfig.refColor === color ? 'elevation-4' : ''"
                :style="{
                  width: '36px', height: '36px',
                  background: color,
                  border: localConfig.refColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  transform: localConfig.refColor === color ? 'scale(1.15)' : 'scale(1)',
                }"
                @click="localConfig.refColor = color"
              />
              <v-menu :close-on-content-click="false" location="bottom">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="rounded-circle cursor-pointer elevation-1 d-flex align-center justify-center"
                    style="width: 36px; height: 36px; border: 2px dashed var(--border-color); background: var(--card-bg);"
                  >
                    <v-icon size="16" color="grey">mdi-eyedropper</v-icon>
                  </div>
                </template>
                <v-card class="pa-3 rounded-xl" style="background: var(--card-bg);">
                  <v-color-picker v-model="localConfig.refColor" mode="hexa" hide-inputs :swatches="[]" elevation="0" />
                </v-card>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>

      </div>

      <v-divider style="opacity: 0.1;" />

      <v-card-actions class="pa-4 d-flex justify-space-between" style="padding: 16px 24px 20px !important;">
        <v-btn variant="tonal" color="error" class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0" @click="resetToDefault">
          Restaurar Padrão
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
          @click="saveAndClose"
        >
          Aplicar
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  </v-slide-y-reverse-transition>
</template>

<script>
export default {
  name: "ConfigModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    localConfig: {
      fontSizePc: 15,
      align: "text-center",
      background: "#000000",
      color: "#ffffff",
      refFontSizePc: 10,
      refColor: "#fb8c00",
    },
    defaultConfig: {
      fontSizePc: 15,
      align: "text-center",
      background: "#000000",
      color: "#ffffff",
      refFontSizePc: 10,
      refColor: "#fb8c00",
    },
  }),
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadConfig();
      }
    },
    localConfig: {
      handler(val) {
        this.$appdata.set("modules.bible.config", val);
      },
      deep: true,
    },
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    loadConfig() {
      const savedConfig = this.$appdata.get("modules.bible.config");
      if (savedConfig) {
        this.localConfig = { ...this.defaultConfig, ...savedConfig };
      } else {
        this.localConfig = { ...this.defaultConfig };
      }
    },
    resetToDefault() {
      this.localConfig = { ...this.defaultConfig };
    },
    saveAndClose() {
      this.$appdata.set("modules.bible.config", this.localConfig);
      this.$userdata.set("bible_config", this.localConfig);
      this.close();
    },
    close() {
      this.visible = false;
    },
  },
};
</script>

<style scoped>
.bible-config-modal {
  box-shadow: 0 24px 48px rgba(0,0,0,0.2) !important;
}
</style>
