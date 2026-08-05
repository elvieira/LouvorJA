<template>
  <v-slide-y-reverse-transition>
    <div v-if="internalValue" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <!-- Modal Card -->
      <v-card
        class="elevation-24 rounded-xl d-flex flex-column"
        width="100%"
        max-width="520"
        style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid var(--border-color, rgba(0,0,0,0.05)); overflow: hidden;"
      >
        <!-- Header -->
        <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon color="primary" size="32" class="mr-3">
                mdi-palette-outline
              </v-icon>
              <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                {{ t('proj_customization') }}
              </h2>
            </div>
            <v-btn icon variant="text" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
            Ajuste o visual do cronômetro na tela
          </p>
        </div>

        <!-- Scrollable Content -->
        <div style="background: var(--main-bg, #f5f5f5); padding: 24px; max-height: 60vh; overflow-y: auto;" class="custom-scrollbar">
          <!-- Fundo da Projeção -->
          <v-card class="settings-card rounded-xl pa-2 mb-4" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
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
            </v-card-text>
          </v-card>

          <!-- Cor do Texto -->
          <v-card class="settings-card rounded-xl pa-2 mb-4" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
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
              
              <!-- Cores -->
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
              <div class="d-flex align-center mb-6">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-bell-outline
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    Alertas
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Avisos quando o tempo esgotar
                  </div>
                </div>
              </div>

              <v-list class="bg-transparent pa-0">
                <v-list-item class="px-0 py-1">
                  <v-list-item-title class="font-weight-medium text-body-2">
                    {{ t('settings_visual_alert') }}
                  </v-list-item-title>
                  <v-list-item-subtitle style="color: var(--sidebar-text-secondary);">
                    {{ t('settings_visual_alert_desc') }}
                  </v-list-item-subtitle>
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
                  <v-list-item-subtitle style="color: var(--sidebar-text-secondary);">
                    {{ t('settings_audio_alert_desc') }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-switch
                      v-model="localConfig.audioAlert"
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
          <v-btn
            variant="flat"
            color="primary"
            class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
            @click="close"
          >
            Aplicar
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";

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
  },
  emits: ["update:modelValue"],
  data: () => ({
    localConfig: {
      fontColor: "#ffffff",
      bgColor: "#000000",
      visualAlert: true,
      audioAlert: true,
    },
    defaultConfig: {
      fontColor: "#ffffff",
      bgColor: "#000000",
      visualAlert: true,
      audioAlert: true,
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
      if (val) this.loadConfig();
    },
    localConfig: {
      handler(val: any) {
        const cloned = JSON.parse(JSON.stringify(val));
        this.$appdata.set(`modules.${this.moduleId}.config`, cloned);
      },
      deep: true,
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
      const saved = this.$appdata.get(`modules.${this.moduleId}.config`);
      if (saved) {
        this.localConfig = { ...this.defaultConfig, ...saved };
      } else {
        this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
      }
    },
    resetToDefault() {
      this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
    },
    close() {
      this.internalValue = false;
    },
  },
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
[data-theme='dark'] .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
