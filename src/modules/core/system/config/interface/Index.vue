<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main">
      <ModuleHeader :title="t('main_title')" :icon="manifest.icon || 'mdi-cog'">
        <div class="d-flex align-center" style="max-width: 100%; overflow-x: auto;">
          <v-tabs v-model="tab" color="var(--accent-blue)">
            <v-tab>
              {{ t('tab_general') }}
            </v-tab>
            <v-tab>
              {{ t('tab_appearance') }}
            </v-tab>
            <v-tab>
              {{ t('tab_media') }}
            </v-tab>
            <v-tab>
              {{ t('tab_projection') }}
            </v-tab>
          </v-tabs>
        </div>
      </ModuleHeader>

      <div class="content-main flex-grow-1 w-100" style="overflow: hidden; padding-top: 24px; background: var(--main-bg);">
        <v-tabs-window v-model="tab" class="h-100 w-100">
          <v-tabs-window-item class="h-100">
            <TabGeneral />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100">
            <TabAppearance />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100">
            <TabMedia />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100">
            <TabProjection />
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import TabAppearance from "./components/TabAppearance.vue";
import TabGeneral from "./components/TabGeneral.vue";
import TabMedia from "./components/TabMedia.vue";
import TabProjection from "./components/TabProjection.vue";

export default defineComponent({
  name: manifest.id,
  components: {
    ModuleHeader,
    TabAppearance,
    TabGeneral,
    TabMedia,
    TabProjection,
  },
  data: () => ({
    tab: 0,
    manifest,
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return (this as any).$modules.get(this.module_id);
    },
  },
  methods: {
    t(text: string): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`);
    },
  },
});
</script>
