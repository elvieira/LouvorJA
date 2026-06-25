<template>
  <v-dialog v-model="visible" max-width="600px" persistent>
    <v-card class="bible-config-modal rounded-xl" style="background: var(--card-bg, #ffffff);">
      <v-toolbar color="transparent" class="px-2 pt-2" flat>
        <v-toolbar-title class="font-weight-bold" style="color: var(--sidebar-text);">
          Personalização da Projeção
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          color="var(--sidebar-text-secondary)"
          @click="close"
        />
      </v-toolbar>

      <v-divider class="mt-2 mb-4" />

      <v-card-text class="pa-4 pt-0" style="color: var(--sidebar-text);">
        <!-- Fundo -->
        <div class="text-subtitle-1 font-weight-bold mb-2">
          Fundo da Projeção
        </div>
        <div class="d-flex align-center gap-4 mb-6">
          <div class="d-flex flex-column" style="width: 100%;">
            <span class="text-caption mb-1">Cor do Fundo</span>
            <v-color-picker
              v-model="localConfig.background"
              hide-inputs
              hide-canvas
              hide-sliders
              show-swatches
              swatches-max-height="100"
              class="elevation-0"
              style="width: 100%; max-width: 100%; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px;"
            />
          </div>
        </div>

        <!-- Texto Principal -->
        <div class="text-subtitle-1 font-weight-bold mb-2 mt-4">
          Texto Principal
        </div>
        <div class="d-flex align-center gap-4 mb-6">
          <div style="flex: 1;">
            <span class="text-caption mb-1">Tamanho da Fonte (%)</span>
            <v-slider
              v-model="localConfig.fontSizePc"
              min="5"
              max="30"
              step="1"
              thumb-label
              density="compact"
              hide-details
              color="primary"
            />
          </div>
          <div style="width: 100px;">
            <span class="text-caption mb-1">Cor</span>
            <input v-model="localConfig.color" type="color" style="width: 100%; height: 36px; border: none; border-radius: 8px; cursor: pointer; background: transparent; padding: 0;" />
          </div>
        </div>

        <!-- Alinhamento -->
        <div class="text-subtitle-1 font-weight-bold mb-2">
          Alinhamento
        </div>
        <div class="mb-6">
          <v-btn-toggle
            v-model="localConfig.align"
            color="primary"
            variant="outlined"
            divided
            mandatory
            class="w-100"
          >
            <v-btn value="text-left" class="flex-grow-1">
              <v-icon>mdi-format-align-left</v-icon>
            </v-btn>
            <v-btn value="text-center" class="flex-grow-1">
              <v-icon>mdi-format-align-center</v-icon>
            </v-btn>
            <v-btn value="text-right" class="flex-grow-1">
              <v-icon>mdi-format-align-right</v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Referência Scriptural -->
        <div class="text-subtitle-1 font-weight-bold mb-2">
          Referência (Ex: Números 28:3)
        </div>
        <div class="d-flex align-center gap-4 mb-4">
          <div style="flex: 1;">
            <span class="text-caption mb-1">Tamanho da Fonte (%)</span>
            <v-slider
              v-model="localConfig.refFontSizePc"
              min="2"
              max="20"
              step="1"
              thumb-label
              density="compact"
              hide-details
              color="primary"
            />
          </div>
          <div style="width: 100px;">
            <span class="text-caption mb-1">Cor</span>
            <input v-model="localConfig.refColor" type="color" style="width: 100%; height: 36px; border: none; border-radius: 8px; cursor: pointer; background: transparent; padding: 0;" />
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 d-flex justify-space-between">
        <v-btn variant="text" color="error" @click="resetToDefault">
          Restaurar Padrão
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          class="px-6 rounded-lg"
          @click="saveAndClose"
        >
          Aplicar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
        // Atualiza em tempo real a projeção para o preview funcionar enquanto arrasta
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
      this.$userdata.set("bible_config", this.localConfig); // Persiste nos dados do usuário se aplicável
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
