<template>
  <div class="h-100 overflow-auto px-6 pb-6">
    <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-6">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-monitor-multiple
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('monitors') }}
              </h3>
            </div>
          </div>
                    
          <div class="d-flex flex-wrap mb-6 justify-center" style="gap: 32px; padding: 20px 0;">
            <div
              v-for="(display, index) in rawDisplays"
              :key="display.id"
              class="d-flex flex-column align-center"
              style="transition: transform 0.2s ease;"
            >
              <!-- Tela do Monitor -->
              <div 
                class="d-flex flex-column align-center justify-center position-relative"
                :style="`
                            width: 170px; 
                            height: 106px; 
                            border-radius: 12px; 
                            background: ${display.isPrimary ? 'linear-gradient(135deg, var(--accent-blue) 0%, #0077b6 100%)' : 'var(--main-bg)'}; 
                            color: ${display.isPrimary ? '#fff' : 'var(--sidebar-text)'};
                            border: ${display.isPrimary ? '2px solid transparent' : '2px solid rgba(150,150,150,0.2)'};
                            box-shadow: ${display.isPrimary ? '0 10px 25px rgba(0,151,215,0.4)' : '0 8px 20px rgba(0,0,0,0.06)'};
                            z-index: 2;
                          `"
              >
                <!-- Ícone de Estrela para o Primário -->
                <v-icon
                  v-if="display.isPrimary"
                  size="18"
                  class="position-absolute"
                  style="top: 10px; right: 10px; opacity: 0.9"
                >
                  mdi-star
                </v-icon>
                          
                <span class="font-weight-bold" style="font-size: 32px; line-height: 1; letter-spacing: -1px;">{{ index + 1 }}</span>
                <span class="text-caption font-weight-medium mt-1" :style="`opacity: ${display.isPrimary ? '0.9' : '0.5'}`">
                  {{ display.bounds.width }} x {{ display.bounds.height }}
                </span>
                          
                <div v-if="display.isPrimary" class="text-overline mt-1 font-weight-bold" style="line-height: 1; opacity: 0.9; font-size: 0.65rem; letter-spacing: 1px;">
                  {{ t('monitor_primary_label') }}
                </div>
              </div>
                        
              <!-- Haste do Monitor -->
              <div 
                :style="`
                            width: 30px; 
                            height: 14px; 
                            background: ${display.isPrimary ? '#0077b6' : 'rgba(150,150,150,0.3)'}; 
                            opacity: ${display.isPrimary ? '0.9' : '0.6'};
                          `"
              />
                        
              <!-- Base do Monitor -->
              <div 
                class="rounded-pill"
                :style="`
                            width: 80px; 
                            height: 6px; 
                            background: ${display.isPrimary ? '#0077b6' : 'rgba(150,150,150,0.3)'}; 
                            opacity: ${display.isPrimary ? '0.9' : '0.6'};
                          `"
              />
            </div>
          </div>
                    
          <div class="d-flex justify-center mt-2">
            <v-btn
              variant="flat"
              color="primary"
              class="text-none font-weight-bold rounded-lg px-6"
              elevation="2"
              @click="identifyMonitors"
            >
              <v-icon start>
                mdi-magnify-scan
              </v-icon>
              {{ t('identify_monitors') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-6">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-presentation-play
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('music_slides') }}
              </h3>
            </div>
          </div>
                    
          <!-- MÚLTIPLAS TELAS -->
          <div class="mb-8">
            <div class="d-flex align-center mb-4">
              <v-icon size="20" color="primary" class="mr-2">
                mdi-monitor-multiple
              </v-icon>
              <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('multi_screens') }}</span>
            </div>
                      
            <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary);">
              {{ t('project_on_screens') }}
            </div>
            <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap mt-2" style="gap: 16px;">
              <v-card
                v-for="monitor in slideMonitorList"
                :key="monitor.value"
                flat
                class="rounded-xl border cursor-pointer"
                :class="slide_monitor.includes(monitor.value) ? 'elevation-2' : ''"
                :style="slide_monitor.includes(monitor.value) ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important; transition: all 0.2s;' : 'background: var(--main-bg); border: 2px solid transparent !important; transition: all 0.2s; box-shadow: inset 0 0 0 1px var(--border-color);'"
                width="160"
                @click="toggleSlideMonitor(monitor.value)"
              >
                <div class="pa-4 d-flex flex-column align-center">
                  <v-icon :color="slide_monitor.includes(monitor.value) ? 'primary' : 'grey'" size="32" class="mb-2 transition-all">
                    {{ slide_monitor.includes(monitor.value) ? 'mdi-monitor-share' : 'mdi-monitor-off' }}
                  </v-icon>
                  <span class="text-body-2 font-weight-bold text-center transition-all" :style="slide_monitor.includes(monitor.value) ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                    {{ monitor.title }}
                  </span>
                </div>
              </v-card>
            </div>
            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2 text-caption rounded-lg"
            >
              {{ t('no_extended_monitors') }}
            </v-alert>
          </div>

          <v-divider class="mb-8" style="opacity: 0.1;" />

          <!-- TELA ÚNICA / PRINCIPAL -->
          <div class="mb-8">
            <div class="d-flex align-center mb-4">
              <v-icon size="20" color="primary" class="mr-2">
                mdi-monitor
              </v-icon>
              <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('main_screen') }}</span>
            </div>
                      
            <v-switch
              v-model="slide_fullscreen"
              :label="t('fullscreen_main_screen')"
              color="primary"
              inset
              hide-details
              class="mb-2 font-weight-medium"
            />
            <v-switch
              v-model="slide_disable_main_if_extended"
              :label="t('disable_main_screen_extended')"
              color="primary"
              inset
              hide-details
              class="mb-2 font-weight-medium"
            />
            <v-switch
              v-model="slide_minimize_player"
              :label="t('minimize_player')"
              color="primary"
              inset
              hide-details
              class="font-weight-medium"
            />
          </div>

          <v-divider class="mb-8" style="opacity: 0.1;" />

          <!-- PERSONALIZAÇÃO -->
          <div>
            <div class="d-flex align-center mb-4">
              <v-icon size="20" color="primary" class="mr-2">
                mdi-palette-outline
              </v-icon>
              <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('font_customization') }}</span>
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
                style="height: 48px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
              >
                <v-btn value="Cima" class="flex-grow-1 text-none font-weight-bold">
                  <v-icon start size="20">
                    mdi-align-vertical-top
                  </v-icon> {{ t('align_top') }}
                </v-btn>
                <v-btn value="Centro" class="flex-grow-1 text-none font-weight-bold">
                  <v-icon start size="20">
                    mdi-align-vertical-center
                  </v-icon> {{ t('align_center') }}
                </v-btn>
                <v-btn value="Baixo" class="flex-grow-1 text-none font-weight-bold">
                  <v-icon start size="20">
                    mdi-align-vertical-bottom
                  </v-icon> {{ t('align_bottom') }}
                </v-btn>
              </v-btn-toggle>
            </div>
                      
            <v-switch
              v-model="slide_show_title"
              :label="t('show_title_first_slide')"
              color="primary"
              inset
              hide-details
              class="mb-4 font-weight-medium"
            />

            <!-- FORMATAÇÃO DE TEXTO PERSONALIZADA -->
            <div class="mb-4">
              <v-switch
                v-model="slide_custom_text_format"
                :label="t('custom_text_format')"
                color="primary"
                inset
                hide-details
                class="font-weight-medium"
              />
              <v-expand-transition>
                <div v-if="slide_custom_text_format" class="mt-4 pa-5 rounded-xl" style="background: var(--main-bg); border: 1px solid var(--border-color);">
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
                        :min="50"
                        :max="200"
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
                        @click="slide_font_size = Math.min(200, slide_font_size + 5)"
                      >
                        <v-icon size="18">
                          mdi-plus
                        </v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Cor do texto -->
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
                          width: '36px', height: '36px',
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
                      style="height: 42px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
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

                  <!-- Opacidade do fundo do texto -->
                  <div>
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-icon size="18" color="primary" class="mr-2">
                          mdi-opacity
                        </v-icon>
                        <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('text_bg_opacity') }}</span>
                      </div>
                      <v-chip
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                      >
                        {{ slide_text_bg_opacity }}%
                      </v-chip>
                    </div>
                    <div class="px-2">
                      <v-slider
                        v-model="slide_text_bg_opacity"
                        :min="0"
                        :max="100"
                        :step="1"
                        color="primary"
                        track-color="rgba(255,255,255,0.1)"
                        thumb-size="16"
                        hide-details
                      />
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </div>

            <!-- FUNDO PERSONALIZADO -->
            <div>
              <v-switch
                v-model="slide_custom_bg"
                :label="t('custom_background')"
                color="primary"
                inset
                hide-details
                class="font-weight-medium"
              />
              <v-expand-transition>
                <div v-if="slide_custom_bg" class="mt-4 pa-5 rounded-xl" style="background: var(--main-bg); border: 1px solid var(--border-color);">
                  <!-- Cor de fundo -->
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
                          width: '36px', height: '36px',
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
                              
                    <div v-if="slide_bg_image" class="position-relative rounded-xl overflow-hidden mb-3" style="height: 140px; border: 1px solid var(--border-color);">
                      <img :src="slide_bg_image" class="w-100 h-100" style="object-fit: cover;" />
                      <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0; background: rgba(0,0,0,0.3);">
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
                      style="height: 100px; border: 2px dashed var(--border-color); background: var(--card-bg); transition: all 0.2s;"
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
                        class="mt-4 font-weight-medium"
                      >
                        {{ t('remove_text_bg_warning') }}
                      </v-alert>
                    </v-expand-transition>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </div>
                    
          <v-divider class="mb-8 mt-8" style="opacity: 0.1;" />
                      
          <div class="d-flex justify-center mt-2">
            <v-btn
              variant="tonal"
              color="primary"
              class="text-none font-weight-bold rounded-lg px-6"
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";
import $media from "@/helpers/services/Media";

export default defineComponent({
  name: "TabProjection",
  components: {
    ModernColorPicker,
  },
  data: () => ({
    isInitializing: true as boolean,
    slide_monitor: [] as any[],
    slide_align: "Centro" as string,
    slide_fullscreen: true as boolean,
    slide_disable_main_if_extended: true as boolean,
    slide_minimize_player: false as boolean,
    slide_show_title: true as boolean,
    slide_custom_text_format: false as boolean,
    slide_font_size: 100 as number,
    slide_font_color: "#FFFFFF" as string,
    slide_font_weight: "700" as string,
    slide_text_bg_opacity: 25 as number,
    slide_custom_bg: false as boolean,
    slide_bg_color: "#000000" as string,
    slide_bg_image: null as string | null,
    slide_bg_opacity: 100 as number,
    slide_remove_text_bg: false as boolean,
  }),
  computed: {
    rawDisplays(): any[] {
      return this.$appdata.get("system_displays") || [];
    },
    monitorList(): any[] {
      if (this.rawDisplays.length === 0) {
        return [
          { title: this.t("monitor_primary", [1]), value: "Monitor 1", isPrimary: true },
          { title: this.t("monitor_extended", [2]), value: "Monitor 2", isPrimary: false },
        ];
      }
      return this.rawDisplays.map((d: any, index: number) => ({
        title: d.isPrimary ? this.t("monitor_primary", [index + 1]) : this.t("monitor_extended", [index + 1]),
        value: d.id,
        isPrimary: d.isPrimary,
      }));
    },
    slideMonitorList(): any[] {
      return this.monitorList.filter((m: any) => !m.isPrimary);
    },
  },
  watch: {
    slide_monitor(val: any[]) {
      if (val !== undefined && val !== null) {
        this.$userdata.set("modules.config.slide_monitor", val);
        if (!this.isInitializing) {
          $media.syncMonitors();
          this.syncExternalMediaMonitors();
        }
      }
    },
    slide_align(val: string) {
      if (val !== undefined && val !== null) {
        this.$userdata.set("modules.config.slide_align", val);
      }
    },
    slide_fullscreen(val: boolean) { this.$userdata.set("modules.config.slide_fullscreen", val); },
    slide_disable_main_if_extended(val: boolean) { this.$userdata.set("modules.config.slide_disable_main_if_extended", val); },
    slide_minimize_player(val: boolean) { this.$userdata.set("modules.config.slide_minimize_player", val); },
    slide_show_title(val: boolean) { this.$userdata.set("modules.config.slide_show_title", val); },
    slide_custom_text_format(val: boolean) { this.$userdata.set("modules.config.slide_custom_text_format", val); },
    slide_font_size(val: number) { this.$userdata.set("modules.config.slide_font_size", val); },
    slide_font_color(val: string) { this.$userdata.set("modules.config.slide_font_color", val); },
    slide_font_weight(val: string) { this.$userdata.set("modules.config.slide_font_weight", val); },
    slide_text_bg_opacity(val: number) { this.$userdata.set("modules.config.slide_text_bg_opacity", val); },
    slide_custom_bg(val: boolean) { this.$userdata.set("modules.config.slide_custom_bg", val); },
    slide_bg_color(val: string) { this.$userdata.set("modules.config.slide_bg_color", val); },
    slide_bg_image(val: string | null) { this.$userdata.set("modules.config.slide_bg_image", val); },
    slide_bg_opacity(val: number) { this.$userdata.set("modules.config.slide_bg_opacity", val); },
    slide_remove_text_bg(val: boolean) { this.$userdata.set("modules.config.slide_remove_text_bg", val); },
    slideMonitorList: {
      handler(newList: any[]) {
        if (newList.length > 0 && this.rawDisplays.length > 0) {
          const unselected = this.$userdata.get("modules.config.unselected_slide_monitors") || [];
          let changed = false;
          const currentMonitors = [...this.slide_monitor];
          
          newList.forEach((m: any) => {
            if (!currentMonitors.includes(m.value) && !unselected.includes(m.value)) {
              currentMonitors.push(m.value);
              changed = true;
            }
          });
          
          if (changed) {
            this.slide_monitor = currentMonitors;
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    let savedSlideMonitor = this.$userdata.get("modules.config.slide_monitor");
    if (savedSlideMonitor) {
      if (!Array.isArray(savedSlideMonitor)) {
        savedSlideMonitor = [savedSlideMonitor];
      }
      this.slide_monitor = savedSlideMonitor;
    }
    
    const savedSlideAlign = this.$userdata.get("modules.config.slide_align");
    if (savedSlideAlign) {
      this.slide_align = savedSlideAlign;
    }

    const fields = [
      "slide_fullscreen", "slide_disable_main_if_extended", "slide_minimize_player", "slide_show_title",
      "slide_custom_text_format", "slide_font_size", "slide_font_color", "slide_font_weight", "slide_text_bg_opacity",
      "slide_custom_bg", "slide_bg_color", "slide_bg_image", "slide_bg_opacity", "slide_remove_text_bg",
    ];
    fields.forEach(field => {
      const val = this.$userdata.get(`modules.config.${field}`);
      if (val !== undefined && val !== null) {
        (this as any)[field] = val;
      }
    });

    setTimeout(() => {
      this.isInitializing = false;
    }, 100);
  },
  methods: {
    t(text: string, params?: any[]): string {
      return this.$t(`modules.${manifest.id}.${text}`, params || []);
    },
    identifyMonitors() {
      if (window.electronAPI && window.electronAPI.identifyDisplays) {
        window.electronAPI.identifyDisplays();
      }
    },
    toggleSlideMonitor(val: any) {
      let unselected: any[] = this.$userdata.get("modules.config.unselected_slide_monitors") || [];
      if (this.slide_monitor.includes(val)) {
        this.slide_monitor = this.slide_monitor.filter((m: any) => m !== val);
        if (!unselected.includes(val)) unselected.push(val);
      } else {
        this.slide_monitor = [...this.slide_monitor, val];
        unselected = unselected.filter((m: any) => m !== val);
      }
      this.$userdata.set("modules.config.unselected_slide_monitors", unselected);
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
      this.slide_monitor = [];
      this.slide_align = "Centro";
      this.slide_fullscreen = true;
      this.slide_disable_main_if_extended = true;
      this.slide_minimize_player = false;
      this.slide_show_title = true;
      this.slide_custom_text_format = false;
      this.slide_font_size = 100;
      this.slide_font_color = "#FFFFFF";
      this.slide_font_weight = "700";
      this.slide_custom_bg = false;
      this.slide_bg_color = "#000000";
      this.slide_bg_image = null;
      this.slide_bg_opacity = 100;
    },
    async syncExternalMediaMonitors() {
      const isExternalMediaActive = this.$appdata.get("modules.external_media.filePath") !== null;
      if (!isExternalMediaActive) return;

      const syncSettings = this.$userdata.get("modules.config.media_sync_projection_settings") !== false;
      let selectedMonitors = syncSettings
        ? this.$userdata.get("modules.config.slide_monitor") || []
        : this.$userdata.get("modules.config.media_slide_monitor") || [];
        
      if (!Array.isArray(selectedMonitors)) {
        selectedMonitors = selectedMonitors ? [selectedMonitors] : [];
      }
      
      if (window.electronAPI && window.electronAPI.getDisplays) {
        const displays = await window.electronAPI.getDisplays();
        if (displays && displays.length > 1) {
          const primary = (displays as any[]).find((d: any) => d.isPrimary) || (displays as any[])[0];
          selectedMonitors = selectedMonitors.filter((m: any) => m !== (primary as any).id);
          
          const { default: $popup } = await import("@/helpers/ui/Popup");
          await $popup.syncMonitors(selectedMonitors, "external_media", isExternalMediaActive);
        }
      }
    },
  },
});
</script>

<style scoped>
.settings-card {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
.settings-section h3 {
  opacity: 0.9;
}
</style>
