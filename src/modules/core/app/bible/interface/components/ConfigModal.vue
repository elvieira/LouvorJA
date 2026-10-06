<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="visible"
      class="d-flex align-center justify-center bg-transparent"
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(2px);"
    >
      <v-card
        class="bible-config-modal rounded-xl"
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
                  {{ t('modal_subtitle') }}
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
          class="bible-modal-body d-flex flex-row flex-grow-1 overflow-hidden"
          style="min-height: 0;"
        >
          <!-- Coluna Esquerda: Configurações com Rolagem -->
          <div
            class="bible-modal-settings-col flex-grow-1 overflow-y-auto pa-5"
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
                      {{ t('proj_background') }}
                    </h3>
                    <div
                      class="text-caption"
                      style="color: var(--sidebar-text-secondary);"
                    >
                      {{ t('bg_color_desc') }}
                    </div>
                  </div>
                </div>

                <div
                  class="d-flex flex-wrap align-center"
                  style="gap: 10px;"
                >
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
                      >{{ t('bg_image') }}</span>
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
                          {{ t('remove_image_tooltip') }}
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
                          {{ t('change_image_tooltip') }}
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
                    >{{ t('select_image') }}</span>
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

            <!-- Versículo Bíblico (Texto Principal) -->
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
                        {{ t('main_text') }}
                      </h3>
                      <div
                        class="text-caption"
                        style="color: var(--sidebar-text-secondary);"
                      >
                        {{ t('main_text_desc') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tamanho da Fonte -->
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
                    >{{ t('font_size') }}</span>
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

                <!-- Cor da Fonte -->
                <div class="d-flex align-center mb-3">
                  <v-icon
                    size="18"
                    color="primary"
                    class="mr-2"
                  >
                    mdi-palette
                  </v-icon>
                  <span
                    class="text-body-2 font-weight-bold"
                    style="color: var(--sidebar-text);"
                  >{{ t('font_color') }}</span>
                </div>

                <div
                  class="d-flex flex-wrap align-center mb-5"
                  style="gap: 10px;"
                >
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

                <!-- Alinhamento do Texto -->
                <div class="d-flex align-center justify-space-between">
                  <div
                    class="text-body-2 font-weight-medium"
                    style="color: var(--sidebar-text-secondary);"
                  >
                    {{ t('text_align') }}
                  </div>
                  <v-btn-toggle
                    v-model="localConfig.align"
                    color="primary"
                    variant="tonal"
                    divided
                    mandatory
                    rounded="lg"
                    style="height: 40px;"
                  >
                    <v-btn
                      value="text-left"
                      class="px-4"
                    >
                      <v-icon>mdi-format-align-left</v-icon>
                    </v-btn>
                    <v-btn
                      value="text-center"
                      class="px-4"
                    >
                      <v-icon>mdi-format-align-center</v-icon>
                    </v-btn>
                    <v-btn
                      value="text-right"
                      class="px-4"
                    >
                      <v-icon>mdi-format-align-right</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </v-card-text>
            </v-card>

            <!-- Referência Bíblica -->
            <v-card
              class="settings-card rounded-xl pa-2"
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
                      mdi-book-open-page-variant
                    </v-icon>
                    <div>
                      <h3
                        class="font-weight-bold"
                        style="color: var(--sidebar-text); font-size: 1.05rem; line-height: 1.2;"
                      >
                        {{ t('bible_reference') }}
                      </h3>
                      <div
                        class="text-caption"
                        style="color: var(--sidebar-text-secondary);"
                      >
                        Ex: Gênesis 1:1
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tamanho da Fonte da Referência -->
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
                    >{{ t('font_size') }}</span>
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

                <div
                  class="d-flex align-center mb-5"
                  style="gap: 12px;"
                >
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
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
                    track-color="rgba(0,0,0,0.1)"
                    class="flex-grow-1"
                  />
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="localConfig.refFontSizePc = Math.min(20, localConfig.refFontSizePc + 1)"
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

                <!-- Cor da Referência -->
                <div class="d-flex align-center mb-3">
                  <v-icon
                    size="18"
                    color="primary"
                    class="mr-2"
                  >
                    mdi-palette
                  </v-icon>
                  <span
                    class="text-body-2 font-weight-bold"
                    style="color: var(--sidebar-text);"
                  >{{ t('font_color') }}</span>
                </div>

                <div
                  class="d-flex flex-wrap align-center mb-5"
                  style="gap: 10px;"
                >
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
                  <ModernColorPicker v-model="localConfig.refColor">
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

                <!-- Alinhamento da Referência -->
                <div class="d-flex align-center justify-space-between">
                  <div
                    class="text-body-2 font-weight-medium"
                    style="color: var(--sidebar-text-secondary);"
                  >
                    {{ t('text_align') }}
                  </div>
                  <v-btn-toggle
                    v-model="localConfig.refAlign"
                    color="primary"
                    variant="tonal"
                    divided
                    mandatory
                    rounded="lg"
                    style="height: 40px;"
                  >
                    <v-btn
                      value="text-left"
                      class="px-4"
                    >
                      <v-icon>mdi-format-align-left</v-icon>
                    </v-btn>
                    <v-btn
                      value="text-center"
                      class="px-4"
                    >
                      <v-icon>mdi-format-align-center</v-icon>
                    </v-btn>
                    <v-btn
                      value="text-right"
                      class="px-4"
                    >
                      <v-icon>mdi-format-align-right</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Coluna Direita: Pré-visualização Fixa (Sticky) -->
          <div
            class="bible-modal-preview-col flex-shrink-0 d-flex flex-column pa-5"
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

            <!-- Preview Box 16:9 -->
            <div
              class="overflow-hidden rounded-lg mx-auto position-relative user-select-none d-flex align-center justify-center"
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
            >
              <div
                class="d-flex flex-column w-100 pa-4"
                :class="[localConfig.align]"
              >
                <div
                  :style="{
                    fontSize: `${localConfig.fontSizePc * 0.9}px`,
                    lineHeight: '1.4',
                    textShadow: localConfig.bgImage ? '0 2px 10px rgba(0,0,0,0.85)' : 'none'
                  }"
                >
                  No princípio criou Deus os céus e a terra.
                </div>
                <div
                  class="mt-2 font-weight-bold"
                  :class="[localConfig.refAlign || 'text-right']"
                  :style="{
                    fontSize: `${localConfig.refFontSizePc * 0.9}px`,
                    color: localConfig.refColor,
                    textShadow: localConfig.bgImage ? '0 2px 8px rgba(0,0,0,0.85)' : 'none'
                  }"
                >
                  Gênesis 1:1
                </div>
              </div>
            </div>

            <div
              class="mt-4 pa-3 rounded-lg d-flex align-start"
              style="background: rgba(0,0,0,0.04); gap: 10px;"
            >
              <v-icon
                size="18"
                color="primary"
                class="mt-0.5"
              >
                mdi-information-outline
              </v-icon>
              <div
                class="text-caption"
                style="color: var(--sidebar-text-secondary); line-height: 1.4;"
              >
                A pré-visualização reflete exatamente a proporção e cores da projeção do texto bíblico em tempo real.
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
            {{ t('restore_default') }}
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
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              color="primary"
              class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
              @click="saveAndClose"
            >
              {{ t('apply') }}
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
  data: () => ({
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
    initialConfig: null as Record<string, any> | null,
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
      return this.$t(`modules.bible.${text}`);
    },
    loadConfig() {
      const savedConfig = this.$appdata.get("modules.bible.config") || this.$userdata.get("bible_config");
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
      this.$appdata.set("modules.bible.config", JSON.parse(JSON.stringify(this.localConfig)));
      this.$userdata.set("bible_config", JSON.parse(JSON.stringify(this.localConfig)));
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
.bible-config-modal {
  box-shadow: 0 24px 48px rgba(0,0,0,0.2) !important;
}
.settings-card {
  transition: all 0.3s;
}
</style>
