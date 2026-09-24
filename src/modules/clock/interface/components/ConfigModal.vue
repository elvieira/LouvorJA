<template>
  <v-slide-y-reverse-transition>
    <div v-if="internalValue" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <!-- Modal Card -->

      <!-- Modal Card -->
      <v-card
        class="clock-config-modal rounded-xl"
        width="100%"
        max-width="520"
        style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; max-height: 90%;"
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
          </div>
          <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
            Ajuste o visual do relógio na tela
          </p>
        </div>

        <!-- Preview Box -->
        <div class="pa-4 flex-shrink-0" style="background: var(--main-bg, #f5f5f5); border-bottom: 1px solid rgba(0,0,0,0.05);">
          <div
            class="overflow-hidden rounded-lg mx-auto"
            :style="{
              aspectRatio: '16/9',
              maxHeight: '180px',
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              position: 'relative',
              background: localConfig.bgColor
            }"
          >
            <ClockScreen :preview="false" :preview-config="localConfig" />
          </div>
        </div>

        <!-- Scrollable Content -->
        <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 0; overflow-y: auto;">
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
                      {{ t('bg_color') }}
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

              <v-divider class="my-4" style="opacity: 0.1;" />

              <!-- Imagem de fundo -->
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

          <!-- Cor do Texto e Estilo -->
          <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-3" size="24">
                    mdi-format-color-text
                  </v-icon>
                  <div>
                    <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                      {{ t('text_color') }}
                    </h3>
                    <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                      Cor da fonte ou ponteiros do relógio
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Cores -->
              <div class="d-flex flex-wrap align-center mb-6" style="gap: 10px;">
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

              <v-divider class="mb-5" style="opacity: 0.1;" />

              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-clock-outline
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('style') }}</span>
                </div>
              </div>
              <v-btn-toggle
                v-model="localConfig.style"
                color="primary"
                variant="tonal"
                divided
                mandatory
                rounded="lg"
                class="w-100 mb-2 d-flex"
                style="height: 40px;"
              >
                <v-btn value="digital" class="flex-grow-1 text-none font-weight-bold">
                  <v-icon start size="18">
                    mdi-format-text-variant
                  </v-icon> {{ t('digital') }}
                </v-btn>
                <v-btn value="analog" class="flex-grow-1 text-none font-weight-bold">
                  <v-icon start size="18">
                    mdi-clock-outline
                  </v-icon> {{ t('analog') }}
                </v-btn>
              </v-btn-toggle>
            </v-card-text>
          </v-card>

          <!-- Opções do Relógio -->
          <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-6">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-tune
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    {{ t('options') }}
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Configurações de exibição do tempo
                  </div>
                </div>
              </div>

              <v-list class="bg-transparent pa-0">
                <v-list-item class="px-0 py-1">
                  <v-list-item-title class="font-weight-medium text-body-2">
                    {{ t('show_seconds') }}
                  </v-list-item-title>
                  <template #append>
                    <v-switch
                      v-model="localConfig.showSeconds"
                      color="primary"
                      hide-details
                      inset
                      density="compact"
                    />
                  </template>
                </v-list-item>
                
                <v-list-item class="px-0 py-1" :disabled="localConfig.style === 'analog'" :style="{ opacity: localConfig.style === 'analog' ? '0.5' : '1' }">
                  <v-list-item-title class="font-weight-medium text-body-2">
                    {{ t('format_24h') }}
                  </v-list-item-title>
                  <template #append>
                    <v-switch
                      v-model="localConfig.format24h"
                      color="primary"
                      hide-details
                      inset
                      density="compact"
                      :disabled="localConfig.style === 'analog'"
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
import { defineComponent } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import ClockScreen from "./Screen.vue";

export default defineComponent({
  name: "ClockConfigModal",
  components: {
    ModernColorPicker,
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
    localConfig: {
      style: "digital",
      showSeconds: true,
      format24h: true,
      bgColor: "#000000",
      bgImage: null as string | null,
      textColor: "#FFFFFF",
    },
    defaultConfig: {
      style: "digital",
      showSeconds: true,
      format24h: true,
      bgColor: "#000000",
      bgImage: null as string | null,
      textColor: "#FFFFFF",
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
  },
  watch: {
    internalValue(val: boolean) {
      if (val) {
        this.loadConfig();
      }
    },
    // We don't watch localConfig anymore to avoid changing the real background
  },
  methods: {
    loadConfig() {
      const saved = this.$userdata.get("clock_config");
      if (saved) {
        this.localConfig = { ...this.defaultConfig, ...saved };
      } else {
        this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
      }
    },
    resetToDefault() {
      this.localConfig = JSON.parse(JSON.stringify(this.defaultConfig));
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
    t(key: string): string {
      return this.$t(`modules.clock.${key}`);
    },
    saveAndClose() {
      const cloned = JSON.parse(JSON.stringify(this.localConfig));
      this.$appdata.set("clock_config", cloned);
      this.$userdata.set("clock_config", cloned);
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
.clock-config-modal {
  box-shadow: 0 24px 48px rgba(0,0,0,0.2) !important;
}
.settings-card {
  transition: all 0.3s;
}
</style>
