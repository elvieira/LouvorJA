<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main">
      <!-- Cabeçalho -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          @click="$modules.close(manifest.id); $router.push({ name: 'home' });"
          class="mr-4"
          color="var(--sidebar-text-secondary)"
        />
        
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4" style="background: var(--accent-blue); color: white; width: 48px; height: 48px; border-radius: 12px;">
             <v-icon :icon="manifest.icon || 'mdi-cog'" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600;">
            Configurações Gerais
          </h2>
        </div>
      </div>

      <!-- Área Principal -->
      <div class="content-main flex-grow-1 overflow-y-auto w-100">
        <div class="settings-container mx-auto d-flex flex-column" style="max-width: 800px; padding: 32px 24px; gap: 32px;">
        
        <!-- Bloco de Aparência -->
        <div class="settings-section">
          <h3 class="font-weight-bold mb-4 d-flex align-center" style="color: var(--sidebar-text); font-size: 1.1rem;">
            <v-icon color="primary" class="mr-3" size="22">mdi-palette-outline</v-icon> Aparência
          </h3>
          <v-card class="settings-card rounded-xl" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
            <v-card-text class="pa-6 d-flex flex-column" style="gap: 28px;">
            
            <!-- Modo Claro / Escuro -->
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-3" style="color: var(--sidebar-text-secondary);">Tema do Sistema</div>
              <v-btn-toggle
                v-model="active_theme_mode"
                color="primary"
                variant="tonal"
                mandatory
                class="rounded-lg"
                style="height: 44px;"
              >
                <v-btn value="light" class="px-6">
                  <v-icon start>mdi-white-balance-sunny</v-icon> Modo Claro
                </v-btn>
                <v-btn value="dark" class="px-6">
                  <v-icon start>mdi-moon-waning-crescent</v-icon> Modo Escuro
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>
        </div>

        <!-- Bloco Geral -->
        <div class="settings-section">
          <h3 class="font-weight-bold mb-4 d-flex align-center" style="color: var(--sidebar-text); font-size: 1.1rem;">
            <v-icon color="primary" class="mr-3" size="22">mdi-earth</v-icon> Geral
          </h3>
          <v-card class="settings-card rounded-xl" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
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
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        </div>

        <!-- Bloco Avançado -->
        <div class="settings-section mb-8">
          <h3 class="font-weight-bold mb-4 d-flex align-center" style="color: var(--sidebar-text); font-size: 1.1rem;">
            <v-icon color="primary" class="mr-3" size="22">mdi-monitor-dashboard</v-icon> Projeção & Sistema
          </h3>
          <v-card class="settings-card rounded-xl" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
            <v-card-text class="pa-6">
             <v-switch
                v-model="hardware_accel"
                color="primary"
                label="Aceleração de Hardware"
                hide-details
                inset
              ></v-switch>
              <v-switch
                v-model="fullscreen_mode"
                color="primary"
                label="Iniciar em Tela Cheia"
                hide-details
                inset
              ></v-switch>
          </v-card-text>
        </v-card>
        </div>

        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: manifest.id,
  data: () => ({
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
        return this.$vuetify.theme.global.current.dark ? 'dark' : 'light';
      },
      set(mode) {
        this.setTheme(mode);
      }
    }
  },
  methods: {
    setTheme(theme_id) {
      this.$vuetify.theme.global.name = theme_id;
      this.$userdata.set("theme", theme_id);
      this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);
    },
  },
  mounted() {
    // Configura o toggle inicial para coincidir com o modo ativo
    if(this.$userdata.get("theme")){
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
.settings-section h3 {
  opacity: 0.9;
}
</style>
