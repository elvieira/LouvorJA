<template>
  <div class="d-flex flex-column" style="gap: 20px;">
    <!-- COMPORTAMENTO DE PROJEÇÃO BÍBLICA -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-3" size="28">
            mdi-book-open-page-variant-outline
          </v-icon>
          <div>
            <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
              {{ t('bible_proj_behavior') }}
            </h3>
            <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
              {{ t('bible_proj_behavior_desc') }}
            </div>
          </div>
        </div>

        <div class="mt-4">
          <v-switch
            v-model="bible_proj_with_p"
            :label="t('bible_proj_with_p')"
            color="primary"
            hide-details
            inset
            class="font-weight-medium mb-3"
          />
          
          <v-expand-transition>
            <div v-show="!bible_proj_with_p" class="pl-4 mt-2" style="border-left: 2px solid var(--border-color);">
              <v-switch
                v-model="bible_auto_proj_quick"
                :label="t('bible_auto_proj_quick')"
                color="primary"
                hide-details
                inset
                class="mb-3 font-weight-medium"
              />

              <v-switch
                v-model="bible_auto_proj_normal"
                :label="t('bible_auto_proj_normal')"
                color="primary"
                hide-details
                inset
                class="font-weight-medium"
              />
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "ConfigBible",
  data: () => ({
    bible_proj_with_p: false as boolean,
    bible_auto_proj_quick: false as boolean,
    bible_auto_proj_normal: false as boolean,
  }),
  watch: {
    bible_proj_with_p(val: boolean) {
      this.updateBibleConfig({ projWithP: val });
    },
    bible_auto_proj_quick(val: boolean) {
      this.updateBibleConfig({ autoProjQuick: val });
    },
    bible_auto_proj_normal(val: boolean) {
      this.updateBibleConfig({ autoProjNormal: val });
    },
  },
  mounted() {
    const savedBibleConfig = (this as any).$appdata.get("modules.bible.config") || (this as any).$userdata.get("bible_config") || {};
    if (savedBibleConfig.projWithP !== undefined) this.bible_proj_with_p = savedBibleConfig.projWithP;
    if (savedBibleConfig.autoProjQuick !== undefined) this.bible_auto_proj_quick = savedBibleConfig.autoProjQuick;
    if (savedBibleConfig.autoProjNormal !== undefined) this.bible_auto_proj_normal = savedBibleConfig.autoProjNormal;
  },
  methods: {
    t(text: string): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`);
    },
    updateBibleConfig(newValues: Record<string, any>) {
      const current = (this as any).$appdata.get("modules.bible.config") || (this as any).$userdata.get("bible_config") || {};
      const updated = { ...current, ...newValues };
      (this as any).$appdata.set("modules.bible.config", updated);
      (this as any).$userdata.set("bible_config", updated);
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
