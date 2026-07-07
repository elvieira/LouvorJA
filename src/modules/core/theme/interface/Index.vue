<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main">
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div class="d-flex align-center" style="flex-shrink: 0;">
          <MenuToggleButton style="margin-right: 16px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />

          <div class="module-icon-box d-flex align-center justify-center mr-4" style="flex-shrink: 0; background: var(--accent-blue); color: white; width: 48px; height: 48px; border-radius: 12px;">
            <v-icon icon="mdi-cog" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1; white-space: nowrap;">
            {{ t('main_title') }}
          </h2>
        </div>

        <div class="d-flex align-center" style="max-width: 100%; overflow-x: auto;">
          <v-tabs v-model="activeTab" color="var(--accent-blue)">
            <v-tab value="appearance">{{ t('tab_appearance') }}</v-tab>
            <v-tab value="general">{{ t('tab_general') }}</v-tab>
            <v-tab value="media">{{ t('tab_media') }}</v-tab>
            <v-tab value="projection">{{ t('tab_projection') }}</v-tab>
          </v-tabs>
        </div>
      </div>

      <div class="content-main flex-grow-1 w-100" style="overflow: hidden; padding-top: 24px; background: var(--main-bg);">
        <v-tabs-window v-model="activeTab" class="h-100 w-100">
          <!-- Aparência -->
          <v-tabs-window-item value="appearance" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <div class="text-subtitle-2 font-weight-bold mb-3" style="color: var(--sidebar-text-secondary);">{{ t('system_theme') }}</div>
                    <v-btn-toggle
                      v-model="active_theme_mode"
                      color="primary"
                      variant="tonal"
                      mandatory
                      class="rounded-lg"
                      style="height: 44px;"
                    >
                      <v-btn value="light" class="px-6">
                        <v-icon start>mdi-white-balance-sunny</v-icon> {{ t('light_mode') }}
                      </v-btn>
                      <v-btn value="dark" class="px-6">
                        <v-icon start>mdi-moon-waning-crescent</v-icon> {{ t('dark_mode') }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Geral -->
          <v-tabs-window-item value="general" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">Idioma</div>
                        <v-select
                          v-model="language"
                          :items="['Português', 'English', 'Español']"
                          variant="outlined"
                          density="compact"
                          hide-details
                          bg-color="transparent"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Mídia & Player -->
          <v-tabs-window-item value="media" class="h-100">
            <div class="h-100 d-flex flex-column align-center justify-center px-6" style="padding-bottom: 10vh;">
              <div class="text-center" style="max-width: 420px;">
                <div class="mb-8 position-relative d-inline-block">
                  <div class="rounded-circle d-flex align-center justify-center" style="width: 120px; height: 120px; background: rgba(0, 151, 215, 0.05); border: 2px dashed rgba(0, 151, 215, 0.2);">
                    <v-icon size="64" color="primary" style="opacity: 0.8">mdi-play-network-outline</v-icon>
                  </div>
                  <v-icon size="36" color="primary" class="position-absolute" style="bottom: -5px; right: -5px; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); background: var(--main-bg); border-radius: 50%;">mdi-hammer-wrench</v-icon>
                </div>
                <h3 class="font-weight-bold mb-3" style="color: var(--sidebar-text); font-size: 1.5rem; letter-spacing: -0.02em;">{{ t('under_construction') }}</h3>
                <p class="text-body-1" style="color: var(--sidebar-text-secondary); line-height: 1.6;">
                  As configurações avançadas de <strong>Mídia & Player</strong> estão sendo desenhadas e estarão disponíveis em breve.
                </p>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Projeção & Telas -->
          <v-tabs-window-item value="projection" class="h-100">
            <div class="h-100 overflow-auto px-6 pb-6">
              <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
                <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
                  <v-card-text class="pa-6 d-flex flex-column" style="gap: 16px;">
                    <v-switch
                      v-model="hardware_accel"
                      color="primary"
                      label="Aceleração de Hardware"
                      hide-details
                      inset
                    />
                    <v-switch
                      v-model="fullscreen_mode"
                      color="primary"
                      label="Iniciar em Tela Cheia"
                      hide-details
                      inset
                    />
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
  },
  data: () => ({
    activeTab: "appearance",
    language: "Português",
    hardware_accel: true,
    fullscreen_mode: false,
    manifest: manifest,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    active_theme_mode: {
      get() {
        return this.$vuetify.theme.global.current.dark ? "dark" : "light";
      },
      set(mode) {
        this.setTheme(mode);
      },
    },
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    setTheme(theme_id) {
      this.$vuetify.theme.global.name = theme_id;
      this.$userdata.set("theme", theme_id);
      this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);
    },
  },
  mounted() {
    if (this.$userdata.get("theme")) {
      this.$vuetify.theme.global.name = this.$userdata.get("theme");
    }
  },
};
</script>

<style scoped>
.settings-card {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}
</style>
