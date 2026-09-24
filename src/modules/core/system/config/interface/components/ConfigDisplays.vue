<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- MONITORES CONECTADOS -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-monitor-multiple
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('monitors') }}
              </h3>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                Telas e monitores detectados pelo sistema operacional
              </div>
            </div>
          </div>

          <v-btn
            variant="tonal"
            color="primary"
            class="text-none font-weight-bold rounded-lg px-4"
            @click="identifyMonitors"
          >
            <v-icon start>
              mdi-magnify-scan
            </v-icon>
            {{ t('identify_monitors') }}
          </v-btn>
        </div>

        <!-- DISPLAYS VISUAIS -->
        <div class="d-flex flex-wrap my-4 justify-center" style="gap: 24px; padding: 12px 0;">
          <div
            v-for="(display, index) in rawDisplays"
            :key="display.id"
            class="d-flex flex-column align-center"
          >
            <div 
              class="d-flex flex-column align-center justify-center position-relative"
              :style="`
                width: 160px; 
                height: 100px; 
                border-radius: 14px; 
                background: ${display.isPrimary ? 'linear-gradient(135deg, var(--accent-blue) 0%, #0077b6 100%)' : 'var(--main-bg)'}; 
                color: ${display.isPrimary ? '#fff' : 'var(--sidebar-text)'};
                border: ${display.isPrimary ? '2px solid transparent' : '2px solid rgba(150,150,150,0.2)'};
                box-shadow: ${display.isPrimary ? '0 10px 25px rgba(0,151,215,0.4)' : '0 8px 20px rgba(0,0,0,0.06)'};
                z-index: 2;
              `"
            >
              <v-icon
                v-if="display.isPrimary"
                size="18"
                class="position-absolute"
                style="top: 8px; right: 8px; opacity: 0.9"
              >
                mdi-star
              </v-icon>
                        
              <span class="font-weight-bold" style="font-size: 28px; line-height: 1;">{{ index + 1 }}</span>
              <span class="text-caption font-weight-medium mt-1" :style="`opacity: ${display.isPrimary ? '0.9' : '0.6'}`">
                {{ display.bounds.width }} x {{ display.bounds.height }}
              </span>
                        
              <div v-if="display.isPrimary" class="text-overline mt-1 font-weight-bold" style="line-height: 1; opacity: 0.9; font-size: 0.65rem; letter-spacing: 1px;">
                {{ t('monitor_primary_label') }}
              </div>
            </div>
                      
            <div 
              :style="`
                width: 24px; 
                height: 14px; 
                background: var(--border-color); 
                opacity: 0.6;
              `"
            />
            <div 
              :style="`
                width: 60px; 
                height: 4px; 
                border-radius: 4px; 
                background: var(--border-color); 
                opacity: 0.8;
              `"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- PROJEÇÃO EM MÚLTIPLAS TELAS (SLIDES) -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-3" size="28">
            mdi-presentation-play
          </v-icon>
          <div>
            <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
              {{ t('multi_screens') }}
            </h3>
            <div class="text-caption" style="color: var(--sidebar-text-secondary);">
              {{ t('project_on_screens') }}
            </div>
          </div>
        </div>

        <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap mt-4" style="gap: 16px;">
          <v-card
            v-for="monitor in slideMonitorList"
            :key="monitor.value"
            flat
            class="rounded-xl border cursor-pointer"
            :class="slide_monitor.includes(monitor.value) ? 'elevation-2' : ''"
            :style="slide_monitor.includes(monitor.value) ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important; transition: all 0.2s;' : 'background: var(--main-bg); border: 2px solid transparent !important; transition: all 0.2s; box-shadow: inset 0 0 0 1px var(--border-color);'"
            width="180"
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

        <v-divider class="my-6" style="opacity: 0.1;" />

        <!-- TELA DE RETORNO FÍSICA (STAGE MONITOR) -->
        <div>
          <div class="d-flex align-center mb-2">
            <v-icon size="22" color="primary" class="mr-2">
              mdi-monitor-eye
            </v-icon>
            <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">{{ t('stage_monitor') }}</span>
          </div>
          <div class="text-body-2 font-weight-medium mb-3" style="color: var(--sidebar-text-secondary);">
            {{ t('stage_monitor_desc') }}
          </div>
          <v-switch
            v-model="stage_monitor_enabled"
            :label="t('stage_monitor_enable')"
            color="primary"
            inset
            hide-details
            class="mb-3 font-weight-medium"
          />
          <v-expand-transition>
            <div v-if="stage_monitor_enabled" class="pl-4 mt-2" style="border-left: 2px solid var(--border-color);">
              <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary);">
                {{ t('stage_monitor_screen') }}
              </div>
              <div v-if="stageMonitorScreenList.length > 0" class="d-flex flex-wrap mt-2" style="gap: 16px;">
                <v-card
                  v-for="monitor in stageMonitorScreenList"
                  :key="monitor.value"
                  flat
                  class="rounded-xl border cursor-pointer"
                  :class="stage_monitor_display === monitor.value ? 'elevation-2' : ''"
                  :style="stage_monitor_display === monitor.value ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important; transition: all 0.2s;' : 'background: var(--main-bg); border: 2px solid transparent !important; transition: all 0.2s; box-shadow: inset 0 0 0 1px var(--border-color);'"
                  width="180"
                  @click="stage_monitor_display = stage_monitor_display === monitor.value ? null : monitor.value"
                >
                  <div class="pa-4 d-flex flex-column align-center">
                    <v-icon :color="stage_monitor_display === monitor.value ? 'primary' : 'grey'" size="32" class="mb-2 transition-all">
                      {{ stage_monitor_display === monitor.value ? 'mdi-monitor-eye' : 'mdi-monitor-off' }}
                    </v-icon>
                    <span class="text-body-2 font-weight-bold text-center transition-all" :style="stage_monitor_display === monitor.value ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
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
                {{ t('stage_monitor_no_screens') }}
              </v-alert>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>
    </v-card>

    <!-- COMPORTAMENTO DE TELA ÚNICA / JANELA -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon size="22" color="primary" class="mr-2">
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
          class="mb-3 font-weight-medium"
        />
        <v-switch
          v-model="slide_disable_main_if_extended"
          :label="t('disable_main_screen_extended')"
          color="primary"
          inset
          hide-details
          class="mb-3 font-weight-medium"
        />
        <v-switch
          v-model="slide_minimize_player"
          :label="t('minimize_player')"
          color="primary"
          inset
          hide-details
          class="font-weight-medium"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "ConfigDisplays",
  data: () => ({
    isInitializing: true as boolean,
    slide_monitor: [] as any[],
    slide_fullscreen: true as boolean,
    slide_disable_main_if_extended: true as boolean,
    slide_minimize_player: false as boolean,
    stage_monitor_enabled: false as boolean,
    stage_monitor_display: null as any,
  }),
  computed: {
    rawDisplays(): any[] {
      return (this as any).$appdata.get("system_displays") || [];
    },
    slideMonitorList(): any[] {
      const displays = this.rawDisplays;
      if (displays.length <= 1) return [];
      const primary = displays.find((d: any) => d.isPrimary) || displays[0];
      return displays
        .filter((d: any) => d.id !== primary.id)
        .map((d: any) => {
          const index = displays.findIndex((disp: any) => disp.id === d.id);
          return {
            title: `${this.t("monitor_extended", [index + 1])} (${d.bounds.width}x${d.bounds.height})`,
            value: d.id,
          };
        });
    },
    stageMonitorScreenList(): any[] {
      const displays = this.rawDisplays;
      if (displays.length <= 1) return [];
      const primary = displays.find((d: any) => d.isPrimary) || displays[0];
      return displays
        .filter((d: any) => d.id !== primary.id)
        .map((d: any) => {
          const index = displays.findIndex((disp: any) => disp.id === d.id);
          return {
            title: `${this.t("monitor_extended", [index + 1])} (${d.bounds.width}x${d.bounds.height})`,
            value: d.id,
          };
        });
    },
  },
  watch: {
    slide_monitor(val: any[]) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_monitor", val);
      if (this.stage_monitor_display && !val.includes(this.stage_monitor_display)) {
        this.stage_monitor_display = null;
      }
      this.syncPopup();
      this.syncExternalMediaMonitors();
    },
    slide_fullscreen(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_fullscreen", val);
      this.syncPopup();
    },
    slide_disable_main_if_extended(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_disable_main_if_extended", val);
      this.syncPopup();
    },
    slide_minimize_player(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.slide_minimize_player", val);
    },
    stage_monitor_enabled(val: boolean) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.stage_monitor_enabled", val);
      if (!val) {
        this.closeStageMonitor();
      } else if (this.stage_monitor_display) {
        this.syncPopup();
      }
    },
    stage_monitor_display(val: any) {
      if (this.isInitializing) return;
      (this as any).$userdata.set("modules.config.stage_monitor_display", val);
      if (!val) {
        this.closeStageMonitor();
      } else if (this.stage_monitor_enabled) {
        this.syncPopup();
      }
    },
  },
  mounted() {
    const fields = [
      "slide_monitor", "slide_fullscreen", "slide_disable_main_if_extended",
      "slide_minimize_player", "stage_monitor_enabled", "stage_monitor_display",
    ];
    fields.forEach(field => {
      const val = (this as any).$userdata.get(`modules.config.${field}`);
      if (val !== undefined && val !== null) {
        (this as any)[field] = val;
      }
    });

    if (this.stage_monitor_display && !this.slide_monitor.includes(this.stage_monitor_display)) {
      this.stage_monitor_display = null;
      (this as any).$userdata.set("modules.config.stage_monitor_display", null);
    }

    setTimeout(() => {
      this.isInitializing = false;
    }, 100);
  },
  methods: {
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`, params || []);
    },
    identifyMonitors() {
      if (window.electronAPI && window.electronAPI.identifyDisplays) {
        window.electronAPI.identifyDisplays();
      }
    },
    toggleSlideMonitor(val: any) {
      let unselected: any[] = (this as any).$userdata.get("modules.config.unselected_slide_monitors") || [];
      if (this.slide_monitor.includes(val)) {
        this.slide_monitor = this.slide_monitor.filter((m: any) => m !== val);
        if (!unselected.includes(val)) unselected.push(val);
      } else {
        this.slide_monitor = [...this.slide_monitor, val];
        unselected = unselected.filter((m: any) => m !== val);
      }
      (this as any).$userdata.set("modules.config.unselected_slide_monitors", unselected);
    },
    async syncPopup() {
      const isMediaActive = (this as any).$appdata.get("modules.media.id_music") !== null;
      if (!isMediaActive) return;

      const displays = (this as any).$appdata.get("system_displays") || [];
      if (displays.length > 1) {
        const primary = displays.find((d: any) => d.isPrimary) || displays[0];
        let selected = this.slide_monitor.filter((m: any) => m !== primary.id);

        if (this.stage_monitor_enabled && this.stage_monitor_display && selected.includes(this.stage_monitor_display)) {
          selected = selected.filter((m: any) => m !== this.stage_monitor_display);
        }

        const { default: $popup } = await import("@/helpers/ui/Popup");
        await $popup.syncMonitors(selected, "media", isMediaActive);

        if (this.stage_monitor_enabled && this.stage_monitor_display) {
          await $popup.openStageMonitor(this.stage_monitor_display);
        } else {
          $popup.closeStageMonitor();
        }
      }
    },
    async syncExternalMediaMonitors() {
      const isExternalMediaActive = (this as any).$appdata.get("modules.external_media.filePath") !== null;
      if (!isExternalMediaActive) return;

      const syncSettings = (this as any).$userdata.get("modules.config.media_sync_projection_settings") !== false;
      let selectedMonitors = syncSettings
        ? (this as any).$userdata.get("modules.config.slide_monitor") || []
        : (this as any).$userdata.get("modules.config.media_slide_monitor") || [];
        
      if (!Array.isArray(selectedMonitors)) {
        selectedMonitors = selectedMonitors ? [selectedMonitors] : [];
      }
      
      if (window.electronAPI && window.electronAPI.getDisplays) {
        const displays = await window.electronAPI.getDisplays();
        if (displays && (displays as any[]).length > 1) {
          const primary = (displays as any[]).find((d: any) => d.isPrimary) || (displays as any[])[0];
          selectedMonitors = selectedMonitors.filter((m: any) => m !== (primary as any).id);
          
          const { default: $popup } = await import("@/helpers/ui/Popup");
          await $popup.syncMonitors(selectedMonitors, "external_media", isExternalMediaActive);
        }
      }
    },
    async closeStageMonitor() {
      const { default: $popup } = await import("@/helpers/ui/Popup");
      $popup.closeStageMonitor();
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
