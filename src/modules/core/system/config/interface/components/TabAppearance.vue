<template>
  <div class="h-100 overflow-auto px-6 pb-6">
    <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-6">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-palette
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('system_theme') }}
              </h3>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                {{ t('system_theme_desc') }}
              </div>
            </div>
          </div>
          
          <v-item-group
            v-model="active_theme_mode"
            mandatory
            class="d-flex w-100"
            style="gap: 16px;"
          >
            <v-item v-slot="{ isSelected, toggle }" value="light">
              <v-card
                flat
                class="flex-grow-1 rounded-xl cursor-pointer transition-all"
                :class="isSelected ? 'elevation-2' : ''"
                :style="isSelected ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important;' : 'background: var(--main-bg); border: 2px solid transparent !important; box-shadow: inset 0 0 0 1px var(--border-color);'"
                @click="toggle"
              >
                <div class="py-6 d-flex flex-column align-center">
                  <v-icon :color="isSelected ? 'primary' : 'grey'" size="40" class="mb-3 transition-all">
                    mdi-white-balance-sunny
                  </v-icon>
                  <span class="text-body-1 font-weight-bold text-center transition-all" :style="isSelected ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                    {{ t('light_mode') }}
                  </span>
                </div>
              </v-card>
            </v-item>

            <v-item v-slot="{ isSelected, toggle }" value="dark">
              <v-card
                flat
                class="flex-grow-1 rounded-xl cursor-pointer transition-all"
                :class="isSelected ? 'elevation-2' : ''"
                :style="isSelected ? 'background: rgba(0,151,215,0.08); border: 2px solid var(--accent-blue) !important;' : 'background: var(--main-bg); border: 2px solid transparent !important; box-shadow: inset 0 0 0 1px var(--border-color);'"
                @click="toggle"
              >
                <div class="py-6 d-flex flex-column align-center">
                  <v-icon :color="isSelected ? 'primary' : 'grey'" size="40" class="mb-3 transition-all">
                    mdi-weather-night
                  </v-icon>
                  <span class="text-body-1 font-weight-bold text-center transition-all" :style="isSelected ? 'color: var(--accent-blue)' : 'color: var(--sidebar-text-secondary)'">
                    {{ t('dark_mode') }}
                  </span>
                </div>
              </v-card>
            </v-item>
          </v-item-group>
        </v-card-text>
      </v-card>

      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <SettingsActionRow
            v-model="show_home_history"
            icon="mdi-view-dashboard"
            :title="t('home_layout')"
            :subtitle="t('home_history_desc')"
            type="switch"
          />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";
import SettingsActionRow from "@/components/SettingsActionRow.vue";

export default defineComponent({
  name: "TabAppearance",
  components: {
    SettingsActionRow,
  },
  data: () => ({
    show_home_history: true as boolean,
  }),
  computed: {
    active_theme_mode: {
      get(): string {
        return (this as any).$vuetify.theme.global.current.dark ? "dark" : "light";
      },
      set(mode: string) {
        this.setTheme(mode);
      },
    },
  },
  watch: {
    show_home_history(val: boolean) {
      this.$userdata.set("show_home_history", val);
    },
  },
  mounted() {
    const saved_home_history = this.$userdata.get("show_home_history");
    if (saved_home_history !== undefined && saved_home_history !== null) {
      this.show_home_history = saved_home_history;
    }
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${manifest.id}.${text}`);
    },
    setTheme(theme_id: string) {
      (this as any).$vuetify.theme.global.name = theme_id;
      this.$userdata.set("theme", theme_id);
      this.$appdata.set("is_dark", (this as any).$vuetify.theme.global.current.dark);
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
