<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- PLAYER INTERNO DE VÍDEO E MÍDIA -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-3" size="28">
            mdi-play-network-outline
          </v-icon>
          <div>
            <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
              {{ t('playback') }}
            </h3>
            <div class="text-caption" style="color: var(--sidebar-text-secondary);">
              Configurações do player interno de vídeo e apresentações
            </div>
          </div>
        </div>
                  
        <div class="mt-4">
          <v-switch
            v-model="media_use_internal_player"
            :label="t('internal_player')"
            color="primary"
            hide-details
            inset
            class="font-weight-medium mb-3"
          />

          <v-expand-transition>
            <div v-show="media_use_internal_player" class="pl-4 mt-2" style="border-left: 2px solid var(--border-color);">
              <v-switch
                v-model="media_sync_projection_settings"
                :label="t('sync_proj_settings')"
                color="primary"
                hide-details
                inset
                class="mb-3 font-weight-medium"
              />
                        
              <v-switch
                v-model="media_auto_project_video"
                :label="t('auto_project_video')"
                color="primary"
                hide-details
                inset
                class="mb-3 font-weight-medium"
              />
                        
              <v-switch
                v-model="media_pause_on_minimize"
                :label="t('pause_on_minimize')"
                color="primary"
                hide-details
                inset
                class="font-weight-medium"
              />

              <!-- SE NÃO SINCRONIZAR COM SLIDES, MOSTRA SELEÇÃO INDEPENDENTE -->
              <v-expand-transition>
                <div v-show="!media_sync_projection_settings" class="mt-4 pa-4 rounded-xl" style="background: var(--main-bg); border: 1px solid var(--border-color);">
                  <div class="text-subtitle-2 font-weight-bold mb-2" style="color: var(--sidebar-text);">
                    {{ t('multi_screens') }}
                  </div>
                  <div class="text-body-2 font-weight-medium mb-3" style="color: var(--sidebar-text-secondary);">
                    {{ t('project_on_screens') }}
                  </div>
                  <div v-if="slideMonitorList.length > 0" class="d-flex flex-wrap" style="gap: 16px;">
                    <v-card
                      v-for="monitor in slideMonitorList"
                      :key="monitor.value"
                      flat
                      class="rounded-xl border cursor-pointer"
                      :class="media_slide_monitor.includes(monitor.value) ? 'elevation-2' : ''"
                      :style="media_slide_monitor.includes(monitor.value) ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important;' : 'background: var(--card-bg); border: 2px solid transparent !important; box-shadow: inset 0 0 0 1px var(--border-color);'"
                      width="160"
                      @click="toggleMediaSlideMonitor(monitor.value)"
                    >
                      <div class="pa-4 d-flex flex-column align-center">
                        <v-icon :color="media_slide_monitor.includes(monitor.value) ? 'primary' : 'grey'" size="32" class="mb-2 transition-all">
                          {{ media_slide_monitor.includes(monitor.value) ? 'mdi-monitor-share' : 'mdi-monitor-off' }}
                        </v-icon>
                        <span class="text-body-2 font-weight-bold text-center" :style="media_slide_monitor.includes(monitor.value) ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                          {{ monitor.title }}
                        </span>
                      </div>
                    </v-card>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </v-expand-transition>
        </div>

        <div class="d-flex justify-end">
          <v-btn
            variant="tonal"
            color="primary"
            class="text-none font-weight-bold rounded-lg px-4"
            @click="resetMediaConfigs"
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

export default defineComponent({
  name: "ConfigMedia",
  data: () => ({
    isInitializing: true as boolean,
    media_use_internal_player: false as boolean,
    media_sync_projection_settings: true as boolean,
    media_auto_project_video: true as boolean,
    media_pause_on_minimize: false as boolean,
    media_slide_monitor: [] as any[],
    media_slide_fullscreen: true as boolean,
    media_slide_disable_main_if_extended: true as boolean,
    media_slide_minimize_player: false as boolean,
  }),
  computed: {
    rawDisplays(): any[] {
      return (this as any).$appdata.get("system_displays") || [];
    },
    monitorList(): any[] {
      if (this.rawDisplays.length === 0) {
        return [
          { title: this.t("monitor_primary", ["1"]), value: "Monitor 1", isPrimary: true },
          { title: this.t("monitor_extended", ["2"]), value: "Monitor 2", isPrimary: false },
        ];
      }
      return this.rawDisplays.map((d: any, index: number) => ({
        title: d.isPrimary ? this.t("monitor_primary", [String(index + 1)]) : this.t("monitor_extended", [String(index + 1)]),
        value: d.id,
        isPrimary: d.isPrimary,
      }));
    },
    slideMonitorList(): any[] {
      return this.monitorList.filter((m: any) => !m.isPrimary);
    },
  },
  watch: {
    media_use_internal_player(val: boolean) { (this as any).$userdata.set("modules.config.media_use_internal_player", val); },
    media_sync_projection_settings(val: boolean) {
      (this as any).$userdata.set("modules.config.media_sync_projection_settings", val);
      if (!this.isInitializing) {
        this.syncExternalMediaMonitors();
      }
    },
    media_auto_project_video(val: boolean) { (this as any).$userdata.set("modules.config.media_auto_project_video", val); },
    media_pause_on_minimize(val: boolean) { (this as any).$userdata.set("modules.config.media_pause_on_minimize", val); },
    media_slide_monitor(val: any[]) {
      if (val !== undefined && val !== null) {
        (this as any).$userdata.set("modules.config.media_slide_monitor", val);
        if (!this.isInitializing) {
          this.syncExternalMediaMonitors();
        }
      }
    },
    media_slide_fullscreen(val: boolean) { (this as any).$userdata.set("modules.config.media_slide_fullscreen", val); },
    media_slide_disable_main_if_extended(val: boolean) { (this as any).$userdata.set("modules.config.media_slide_disable_main_if_extended", val); },
    media_slide_minimize_player(val: boolean) { (this as any).$userdata.set("modules.config.media_slide_minimize_player", val); },
  },
  mounted() {
    const fields = [
      "media_use_internal_player", "media_sync_projection_settings", "media_auto_project_video", "media_pause_on_minimize",
      "media_slide_monitor", "media_slide_fullscreen", "media_slide_disable_main_if_extended", "media_slide_minimize_player",
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
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`, params || []);
    },
    toggleMediaSlideMonitor(val: any) {
      if (this.media_slide_monitor.includes(val)) {
        this.media_slide_monitor = this.media_slide_monitor.filter((m: any) => m !== val);
      } else {
        this.media_slide_monitor = [...this.media_slide_monitor, val];
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
    resetMediaConfigs() {
      this.media_use_internal_player = false;
      this.media_sync_projection_settings = true;
      this.media_auto_project_video = true;
      this.media_pause_on_minimize = false;
      this.media_slide_monitor = [];
      this.media_slide_fullscreen = true;
      this.media_slide_disable_main_if_extended = true;
      this.media_slide_minimize_player = false;
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
