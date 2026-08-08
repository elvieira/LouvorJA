<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 50;">
      <v-slide-x-reverse-transition mode="out-in">
        <!-- Normal View -->
        <div v-if="currentView === 'tabs'" class="d-flex flex-column h-100 w-100" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
          <ModuleHeader :title="$t('modules.help.title')" :icon="manifest.icon || 'mdi-help-circle'">
            <v-tabs v-model="tab" color="var(--accent-blue)">
              <v-tab :value="1">
                {{ $t('modules.help.tab_about') }}
              </v-tab>
              <v-tab :value="2">
                {{ $t('modules.help.tab_developers') }}
              </v-tab>
            </v-tabs>
          </ModuleHeader>

          <div class="content-main flex-grow-1 w-100" style="overflow: auto; padding-top: 24px; background: var(--main-bg);">
            <v-tabs-window v-model="tab" class="h-100 w-100">
              <v-tabs-window-item :value="1" class="h-100">
                <div class="h-100 overflow-auto px-6 pb-6">
                  <HelpAbout :app-version="appVersion" @open-update="openUpdate" @open-manual="currentView = 'manual'" />
                </div>
              </v-tabs-window-item>

              <v-tabs-window-item :value="2" class="h-100">
                <div class="h-100 overflow-auto px-6 pb-6">
                  <HelpDevelopers />
                </div>
              </v-tabs-window-item>
            </v-tabs-window>
          </div>
        </div>
        
        <!-- Manual View -->
        <div v-else-if="currentView === 'manual'" class="d-flex flex-column h-100 w-100" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: var(--main-bg);">
          <div class="content-main flex-grow-1 w-100 h-100" style="padding-top: 24px;">
            <div class="h-100 overflow-auto px-6 pb-6">
              <HelpManual @back="currentView = 'tabs'" />
            </div>
          </div>
        </div>
      </v-slide-x-reverse-transition>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import packageJson from "../../../../../../package.json";
import ModuleHeader from "@/components/ModuleHeader.vue";
import HelpAbout from "./components/HelpAbout.vue";
import HelpDevelopers from "./components/HelpDevelopers.vue";
import HelpManual from "./components/HelpManual.vue";

export default defineComponent({
  name: "HelpModule",
  components: {
    ModuleHeader,
    HelpManual,
    HelpAbout,
    HelpDevelopers,
  },
  data: () => ({
    tab: 1,
    currentView: "tabs",
    manifest,
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    appVersion(): string {
      return packageJson.version;
    },
  },
  watch: {
    "module.action": {
      handler(newVal) {
        if (newVal === "open-manual") {
          this.currentView = "manual";
          this.$appdata.set("modules.help.action", null);
        }
      },
      immediate: true,
    },
  },
  methods: {
    openUpdate() {
      this.$modules.open("update");
    },
  },
});
</script>
