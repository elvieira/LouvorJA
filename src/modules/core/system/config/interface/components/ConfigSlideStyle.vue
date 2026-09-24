<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- ALINHAMENTO E ESTRUTURA DOS SLIDES -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon size="24" color="primary" class="mr-2">
            mdi-format-align-center
          </v-icon>
          <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">Alinhamento e Estrutura</span>
        </div>

        <div class="mb-6">
          <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary);">
            {{ t('font_align') }}
          </div>
          <v-btn-toggle
            v-model="slide_align"
            color="primary"
            variant="tonal"
            mandatory
            class="rounded-xl d-flex"
            style="height: 48px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color); border-radius: 16px !important;"
          >
            <v-btn value="Cima" class="flex-grow-1 text-none font-weight-bold">
              <v-icon start size="20">
                mdi-align-vertical-top
              </v-icon>
              {{ t('align_top') }}
            </v-btn>
            <v-btn value="Centro" class="flex-grow-1 text-none font-weight-bold">
              <v-icon start size="20">
                mdi-align-vertical-center
              </v-icon>
              {{ t('align_center') }}
            </v-btn>
            <v-btn value="Baixo" class="flex-grow-1 text-none font-weight-bold">
              <v-icon start size="20">
                mdi-align-vertical-bottom
              </v-icon>
              {{ t('align_bottom') }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-switch
          v-model="slide_show_title"
          :label="t('show_title_first_slide')"
          color="primary"
          inset
          hide-details
          class="font-weight-medium"
        />
      </v-card-text>
    </v-card>

    <!-- FORMATAÇÃO DE TEXTO PERSONALIZADA -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-format-font
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('font_customization') }}
              </h3>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                Tamanho da letra, cores, peso da fonte e tarja de fundo
              </div>
            </div>
          </div>

          <v-switch
            v-model="slide_custom_text_format"
            color="primary"
            inset
            hide-details
          />
        </div>

        <!-- PAINEL DINÂMICO INSET DE FORMATAÇÃO DE TEXTO -->
        <v-expand-transition>
          <div
            v-if="slide_custom_text_format"
            class="mt-6 pa-5 rounded-xl"
            style="background: var(--main-bg); border: 1px solid var(--border-color); border-radius: 20px !important;"
          >
            <!-- Tamanho do texto -->
            <div class="mb-6">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-format-size
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_size') }}</span>
                </div>
                <v-chip
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="font-weight-bold"
                >
                  {{ slide_font_size }}%
                </v-chip>
              </div>
              <div class="d-flex align-center" style="gap: 12px;">
                <v-btn
                  icon
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="slide_font_size = Math.max(50, slide_font_size - 5)"
                >
                  <v-icon size="18">
                    mdi-minus
                  </v-icon>
                </v-btn>
                <v-slider
                  v-model="slide_font_size"
                  :min="75"
                  :max="150"
                  :step="5"
                  color="primary"
                  track-color="grey-lighten-3"
                  hide-details
                  class="flex-grow-1"
                />
                <v-btn
                  icon
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="slide_font_size = Math.min(300, slide_font_size + 5)"
                >
                  <v-icon size="18">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Cor do texto (Paleta Dinâmica) -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-palette
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_color') }}</span>
              </div>
              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                <div
                  v-for="color in ['#FFFFFF', '#f6c32a', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']"
                  :key="color"
                  class="rounded-circle cursor-pointer elevation-1"
                  :class="slide_font_color === color ? 'elevation-4' : ''"
                  :style="{
                    width: '36px',
                    height: '36px',
                    background: color,
                    border: slide_font_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    transform: slide_font_color === color ? 'scale(1.15)' : 'scale(1)',
                  }"
                  @click="slide_font_color = color"
                />
                <ModernColorPicker v-model="slide_font_color">
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
            </div>

            <!-- Peso da fonte -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-format-bold
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_weight') }}</span>
              </div>
              <v-btn-toggle
                v-model="slide_font_weight"
                color="primary"
                variant="tonal"
                mandatory
                class="rounded-xl d-flex"
                style="height: 42px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color); border-radius: 16px !important;"
              >
                <v-btn value="400" class="flex-grow-1 text-none" style="font-weight: 400;">
                  {{ t('weight_normal') }}
                </v-btn>
                <v-btn value="600" class="flex-grow-1 text-none" style="font-weight: 600;">
                  {{ t('weight_semi') }}
                </v-btn>
                <v-btn value="700" class="flex-grow-1 text-none" style="font-weight: 700;">
                  {{ t('weight_bold') }}
                </v-btn>
                <v-btn value="900" class="flex-grow-1 text-none" style="font-weight: 900;">
                  {{ t('weight_extra') }}
                </v-btn>
              </v-btn-toggle>
            </div>

            <!-- Cor da tarja atrás das letras -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-palette
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('text_bg_color') }}</span>
              </div>
              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                <div
                  v-for="color in ['#000000', '#FFFFFF', '#192A56', '#2F3640', '#6D214F', '#2C2C54']"
                  :key="color"
                  class="rounded-circle cursor-pointer elevation-1"
                  :class="slide_text_bg_color === color ? 'elevation-4' : ''"
                  :style="{
                    width: '36px',
                    height: '36px',
                    background: color,
                    border: slide_text_bg_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(150,150,150,0.3)',
                    transition: 'all 0.2s',
                    transform: slide_text_bg_color === color ? 'scale(1.15)' : 'scale(1)',
                  }"
                  @click="slide_text_bg_color = color"
                />
                <ModernColorPicker v-model="slide_text_bg_color">
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
            </div>

            <!-- Opacidade da tarja -->
            <div class="mb-6">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-opacity
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('text_bg_intensity') }}</span>
                </div>
                <v-chip
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="font-weight-bold"
                >
                  {{ slide_text_bg_intensity }}%
                </v-chip>
              </div>
              <v-slider
                v-model="slide_text_bg_intensity"
                :min="0"
                :max="100"
                :step="5"
                color="primary"
                track-color="grey-lighten-3"
                hide-details
              />
            </div>

            <!-- Borda da tarja -->
            <v-switch
              v-model="slide_text_bg_border"
              :label="t('text_bg_border')"
              :disabled="slide_text_bg_intensity === 0"
              color="primary"
              inset
              hide-details
              class="font-weight-medium"
            />
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- FUNDO PERSONALIZADO DOS SLIDES -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-image-filter-hdr
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('custom_background') }}
              </h3>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                Defina uma cor sólida ou imagem personalizada para os slides
              </div>
            </div>
          </div>

          <v-switch
            v-model="slide_custom_bg"
            color="primary"
            inset
            hide-details
          />
        </div>

        <!-- PAINEL DINÂMICO INSET DE FUNDO PERSONALIZADO -->
        <v-expand-transition>
          <div
            v-if="slide_custom_bg"
            class="mt-6 pa-5 rounded-xl"
            style="background: var(--main-bg); border: 1px solid var(--border-color); border-radius: 20px !important;"
          >
            <!-- Cor de fundo (Paleta Dinâmica) -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-format-color-fill
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_color') }}</span>
              </div>
              <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                <div
                  v-for="color in ['#000000', '#192A56', '#FFFFFF', '#2F3640', '#FEF9E7', '#2C3A47', '#6D214F', '#2C2C54']"
                  :key="color"
                  class="rounded-circle cursor-pointer elevation-1"
                  :class="slide_bg_color === color ? 'elevation-4' : ''"
                  :style="{
                    width: '36px',
                    height: '36px',
                    background: color,
                    border: slide_bg_color === color ? '3px solid var(--accent-blue)' : '2px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s',
                    transform: slide_bg_color === color ? 'scale(1.15)' : 'scale(1)',
                  }"
                  @click="slide_bg_color = color"
                />
                <ModernColorPicker v-model="slide_bg_color">
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
            </div>

            <!-- Imagem de fundo -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-image-outline
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_image') }}</span>
              </div>
                        
              <div
                v-if="slide_bg_image"
                class="position-relative rounded-xl overflow-hidden mb-3"
                style="height: 140px; border: 1px solid var(--border-color); border-radius: 16px !important;"
              >
                <img :src="slide_bg_image" class="w-100 h-100" style="object-fit: cover;" />
                <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0; background: rgba(0,0,0,0.35);">
                  <v-btn
                    icon
                    size="small"
                    variant="flat"
                    color="error"
                    class="mr-2"
                    @click="slide_bg_image = null"
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
                    @click="($refs.bgImageInput as any).click()"
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
                class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer"
                style="height: 100px; border: 2px dashed var(--border-color); background: var(--card-bg); transition: all 0.2s; border-radius: 16px !important;"
                @click="($refs.bgImageInput as any).click()"
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
            </div>

            <!-- Opacidade do fundo -->
            <div>
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-opacity
                  </v-icon>
                  <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('bg_opacity') }}</span>
                </div>
                <v-chip
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="font-weight-bold"
                >
                  {{ slide_bg_opacity }}%
                </v-chip>
              </div>
              <v-slider
                v-model="slide_bg_opacity"
                :min="0"
                :max="100"
                :step="5"
                color="primary"
                track-color="grey-lighten-3"
                hide-details
              />
            </div>

            <!-- Remover fundo da letra -->
            <div class="mt-6 pt-4" style="border-top: 1px solid var(--border-color);">
              <div class="d-flex align-start">
                <div class="mr-4 mt-1">
                  <v-icon color="primary" size="24">
                    mdi-format-color-text
                  </v-icon>
                </div>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">
                    {{ t('remove_text_bg') }}
                  </div>
                  <div class="text-body-2 font-weight-medium" style="color: var(--sidebar-text-secondary);">
                    {{ t('remove_text_bg_desc') }}
                  </div>
                </div>
                <div>
                  <v-switch
                    v-model="slide_remove_text_bg"
                    color="primary"
                    inset
                    hide-details
                  />
                </div>
              </div>
              <v-expand-transition>
                <v-alert
                  v-if="slide_remove_text_bg"
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mt-4 font-weight-medium rounded-xl"
                  style="border-radius: 14px !important;"
                >
                  {{ t('remove_text_bg_warning') }}
                </v-alert>
              </v-expand-transition>
            </div>
          </div>
        </v-expand-transition>

        <v-divider class="my-6" style="opacity: 0.1;" />

        <div class="d-flex justify-end">
          <v-btn
            variant="tonal"
            color="primary"
            class="text-none font-weight-bold rounded-xl px-4"
            style="border-radius: 12px !important;"
            @click="resetSlideConfigs"
          >
            <v-icon start>
              mdi-restore
            </v-icon>
            {{ t('restore_defaults') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";

export default defineComponent({
  name: "ConfigSlideStyle",
  components: {
    ModernColorPicker,
  },
  data: () => ({
    isInitializing: true as boolean,
    slide_align: "Centro" as string,
    slide_show_title: true as boolean,
    slide_custom_text_format: false as boolean,
    slide_font_size: 100 as number,
    slide_font_color: "#FFFFFF" as string,
    slide_font_weight: "700" as string,
    slide_text_bg_color: "#000000" as string,
    slide_text_bg_intensity: 25 as number,
    slide_text_bg_border: true as boolean,
    slide_custom_bg: false as boolean,
    slide_bg_color: "#000000" as string,
    slide_bg_image: null as string | null,
    slide_bg_opacity: 100 as number,
    slide_remove_text_bg: false as boolean,
  }),
  watch: {
    slide_align(val: string) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_align", val);
    },
    slide_show_title(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_show_title", val);
    },
    slide_custom_text_format(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_custom_text_format", val);
    },
    slide_font_size(val: number) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_font_size", val);
    },
    slide_font_color(val: string) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_font_color", val);
    },
    slide_font_weight(val: string) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_font_weight", val);
    },
    slide_text_bg_color(val: string) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_text_bg_color", val);
    },
    slide_text_bg_intensity(val: number) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_text_bg_intensity", val);
    },
    slide_text_bg_border(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_text_bg_border", val);
    },
    slide_custom_bg(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_custom_bg", val);
    },
    slide_bg_color(val: string) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_bg_color", val);
    },
    slide_bg_image(val: string | null) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_bg_image", val);
    },
    slide_bg_opacity(val: number) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_bg_opacity", val);
    },
    slide_remove_text_bg(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_remove_text_bg", val);
    },
  },
  mounted() {
    const fields = [
      "slide_align", "slide_show_title", "slide_custom_text_format",
      "slide_font_size", "slide_font_color", "slide_font_weight",
      "slide_text_bg_color", "slide_text_bg_intensity", "slide_text_bg_border", "slide_custom_bg",
      "slide_bg_color", "slide_bg_image", "slide_bg_opacity", "slide_remove_text_bg",
    ];
    fields.forEach(field => {
      const val = (this as any).$userdata.get(`modules.config.${field}`);
      if (val !== undefined && val !== null) {
        (this as any)[field] = val;
      }
    });

    setTimeout(() => {
      this.isInitializing = false;
    }, 100);
  },
  methods: {
    t(text: string): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`);
    },
    onBgImageSelect(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.slide_bg_image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    resetSlideConfigs() {
      this.slide_align = "Centro";
      this.slide_show_title = true;
      this.slide_custom_text_format = false;
      this.slide_font_size = 100;
      this.slide_font_color = "#FFFFFF";
      this.slide_font_weight = "700";
      this.slide_text_bg_color = "#000000";
      this.slide_text_bg_intensity = 25;
      this.slide_text_bg_border = true;
      this.slide_custom_bg = false;
      this.slide_bg_color = "#000000";
      this.slide_bg_image = null;
      this.slide_bg_opacity = 100;
      this.slide_remove_text_bg = false;
    },
  },
});
</script>

<style scoped>
.settings-card {
  border-radius: 24px !important;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
</style>
