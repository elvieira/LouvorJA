<template>
  <v-slide-y-reverse-transition>
    <div v-if="visible" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <!-- Modal Card -->
      <v-card
        class="elevation-24 rounded-xl d-flex flex-column"
        width="100%"
        max-width="520"
        style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid var(--border-color, rgba(0,0,0,0.05)); overflow: hidden;"
      >
        <!-- Header -->
        <div class="pa-6 pb-4 d-flex align-center justify-space-between flex-shrink-0" style="background: rgba(0,0,0,0.02);">
          <div class="d-flex align-center">
            <div class="rounded-circle d-flex align-center justify-center mr-3" style="width: 40px; height: 40px; background: rgba(var(--v-theme-primary), 0.1);">
              <v-icon color="primary" size="22">
                mdi-palette-outline
              </v-icon>
            </div>
            <div>
              <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                Personalização da Projeção
              </h2>
              <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
                Ajuste o visual do cronômetro na tela
              </p>
            </div>
          </div>
          <v-btn icon variant="text" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Scrollable Content -->
        <div style="background: var(--main-bg, #f5f5f5); padding: 24px; max-height: 60vh; overflow-y: auto;" class="custom-scrollbar">
          <!-- Fundo da Projeção -->
          <v-card class="settings-card rounded-xl pa-2 mb-4" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-format-color-fill
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    {{ t('bg_color') }}
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Cor base de fundo da tela de exibição
                  </div>
                </div>
              </div>
              <div class="d-flex flex-wrap align-center mb-2" style="gap: 10px;">
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

          <!-- Imagem de Fundo -->
          <v-card class="settings-card rounded-xl pa-2 mb-4" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-image-outline
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    {{ t('bg_image') }}
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Imagem opcional exibida atrás do cronômetro
                  </div>
                </div>
              </div>

              <div v-if="localConfig.bgImage" class="position-relative rounded-xl overflow-hidden mb-4" style="height: 140px; border: 1px solid var(--border-color);">
                <img :src="localConfig.bgImage" class="w-100 h-100" style="object-fit: cover;" />
                <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0; background: rgba(0,0,0,0.3);">
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
                      {{ t('remove_image') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="flat"
                    color="white"
                    @click="$refs.bgImageInput.click()"
                  >
                    <v-icon color="black">
                      mdi-pencil
                    </v-icon>
                    <v-tooltip activator="parent" location="top">
                      {{ t('change_image') }}
                    </v-tooltip>
                  </v-btn>
                </div>
              </div>

              <div
                v-else
                class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer mb-4"
                style="height: 100px; border: 2px dashed var(--border-color); background: var(--card-bg); transition: all 0.2s;"
                @click="$refs.bgImageInput.click()"
              >
                <v-icon size="32" color="grey-lighten-1" class="mb-2">
                  mdi-cloud-upload-outline
                </v-icon>
                <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">{{ t('select_image') }}</span>
              </div>

              <input
                ref="bgImageInput"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="onBgImageSelect"
              />

              <v-divider class="mb-5" style="opacity: 0.1;" />

              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-opacity
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_opacity') }}</span>
                </div>
                <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">
                  {{ localConfig.bgOpacity }}%
                </v-chip>
              </div>
              <v-slider
                v-model="localConfig.bgOpacity"
                :min="0"
                :max="100"
                :step="5"
                color="primary"
                track-color="grey-lighten-3"
                hide-details
              />
            </v-card-text>
          </v-card>

          <!-- Cor do Texto -->
          <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-format-color-text
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    {{ t('text_color') }}
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Cor dos números do cronômetro
                  </div>
                </div>
              </div>
              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                <div
                  v-for="color in ['#FFFFFF', '#000000', '#f6c32a', '#FF6B6B', '#4ECDC4', '#96CEB4', '#FFEAA7', '#0097d7']"
                  :key="color"
                  class="rounded-circle cursor-pointer elevation-1"
                  :class="localConfig.textColor === color ? 'elevation-4' : ''"
                  :style="{
                    width: '36px', height: '36px',
                    background: color,
                    border: localConfig.textColor === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    transform: localConfig.textColor === color ? 'scale(1.15)' : 'scale(1)',
                  }"
                  @click="localConfig.textColor = color"
                />
                <ModernColorPicker v-model="localConfig.textColor">
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
            @click="visible = false"
          >
            Aplicar
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import defaultConfig from "../../defaultConfig";

export default {
  name: "TimerConfigModal",
  components: {
    ModernColorPicker,
  },
  data: () => ({
    visible: false,
    localConfig: { ...defaultConfig },
  }),
  watch: {
    visible(val) {
      if (val) this.loadConfig();
    },
    localConfig: {
      handler(val) {
        const cloned = JSON.parse(JSON.stringify(val));
        this.$userdata.set("timer_config", cloned);
        this.$appdata.set("timer_config", cloned);
      },
      deep: true,
    },
  },
  methods: {
    loadConfig() {
      const saved = this.$userdata.get("timer_config");
      if (saved) {
        this.localConfig = { ...defaultConfig, ...saved };
      } else {
        this.localConfig = { ...defaultConfig };
      }
    },
    resetToDefault() {
      this.localConfig = { ...defaultConfig };
    },
    onBgImageSelect(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.localConfig.bgImage = e.target.result;
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    t(key) {
      return this.$t(`modules.timer.${key}`);
    },
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
  },
};
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
