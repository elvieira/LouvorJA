<template>
  <v-slide-y-reverse-transition>
    <div v-if="visible" class="d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);">
      <v-card
        class="sorteio-config-modal rounded-xl"
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
            Ajuste o visual do sorteio na tela
          </p>
        </div>
        
        <!-- Preview Box -->
        <div class="pa-4 flex-shrink-0" style="background: var(--main-bg, #f5f5f5); border-bottom: 1px solid rgba(0,0,0,0.05);">
          <div
            class="d-flex flex-column align-center justify-center overflow-hidden rounded-lg mx-auto"
            :style="{
              backgroundColor: localConfig.background,
              backgroundImage: localConfig.bgImage ? `url('${localConfig.bgImage}')` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              color: localConfig.color,
              aspectRatio: '16/9',
              maxHeight: '180px',
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }"
          >
            <div 
              class="font-weight-black text-center" 
              :style="{ 
                fontSize: `${localConfig.fontSizePc * 2.5}px`, 
                textTransform: localConfig.textTransform as any,
                textShadow: localConfig.bgImage ? '0 4px 12px rgba(0,0,0,0.8)' : `0 4px 16px ${localConfig.color}60`
              }"
            >
              João Silva
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 0; overflow-y: auto;">
          <!-- Fundo da Projeção -->
          <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-6">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-format-color-fill
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    Fundo da Projeção
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Cor e imagem de fundo da tela de exibição
                  </div>
                </div>
              </div>
              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
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

          <!-- Texto Principal e Alinhamento -->
          <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-6">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-3" size="24">
                    mdi-format-text
                  </v-icon>
                  <div>
                    <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                      Texto Principal
                    </h3>
                    <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                      Formatação dos nomes sorteados
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cores -->
              <div class="d-flex flex-wrap align-center mb-6" style="gap: 10px;">
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
                      <v-icon size="16" color="grey">
                        mdi-eyedropper
                      </v-icon>
                    </div>
                  </template>
                </ModernColorPicker>
              </div>
              
              <v-divider class="mb-6" style="opacity: 0.1;" />

              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-size
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Tamanho da letra</span>
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
              
              <div class="d-flex align-center mb-6" style="gap: 12px;">
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
                  min="5"
                  max="30"
                  step="1"
                  hide-details
                  color="primary"
                  track-color="grey-lighten-3"
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

              <v-divider class="mb-6" style="opacity: 0.1;" />

              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-letter-case
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Transformação de Texto</span>
                </div>
              </div>
              <PillSwitch
                v-model="localConfig.textTransform"
                block
                class="mb-2"
                style="background: var(--main-bg);"
                :items="[
                  { value: 'none', label: 'Aa (Normal)' },
                  { value: 'uppercase', label: 'AA (Maiúsculo)' },
                  { value: 'lowercase', label: 'aa (Minúsculo)' },
                ]"
              />
            </v-card-text>
          </v-card>

          <!-- Animação do Sorteio -->
          <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg, #ffffff); box-shadow: var(--shadow);">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-6">
                <v-icon color="primary" class="mr-3" size="24">
                  mdi-animation-outline
                </v-icon>
                <div>
                  <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                    Dinâmica do Sorteio
                  </h3>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Velocidade de rolagem dos nomes
                  </div>
                </div>
              </div>

              <PillSwitch
                v-model="localConfig.animationSpeed"
                block
                class="mb-2"
                style="background: var(--main-bg);"
                :items="[
                  { value: 'fast', label: 'Rápido', icon: 'mdi-run-fast' },
                  { value: 'normal', label: 'Normal', icon: 'mdi-run' },
                  { value: 'slow', label: 'Lento', icon: 'mdi-walk' },
                ]"
              />
            </v-card-text>
          </v-card>
        </div>

        <v-divider style="opacity: 0.1;" />

        <v-card-actions class="pa-4 d-flex justify-space-between" style="padding: 16px 24px 20px !important;">
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
import { defineComponent, PropType } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import PillSwitch from "@/components/inputs/PillSwitch.vue";

export default defineComponent({
  name: "SorteioConfigModal",
  components: {
    ModernColorPicker,
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
    localConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
      bgImage: null as string | null,
    },
    defaultConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
      bgImage: null as string | null,
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
    // We don't watch localConfig anymore to avoid changing the real background
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    loadConfig() {
      const savedConfig = this.$appdata.get(`modules.${this.moduleId}.config`) || this.$userdata.get("sorteio_config");
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
