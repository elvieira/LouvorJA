<template>
  <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
    <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6 d-flex flex-column align-center justify-center text-center" style="min-height: 300px;">
        <div class="mb-6 rounded-circle d-flex align-center justify-center" style="width: 80px; height: 80px; background: rgba(0, 151, 215, 0.05); border: 1px dashed var(--border-color);">
          <v-icon size="36" color="primary" style="opacity: 0.7;">
            mdi-account-group-outline
          </v-icon>
        </div>
        <h3 class="font-weight-bold mb-2" style="color: var(--sidebar-text); font-size: 1.2rem;">
          {{ $t('modules.help.devs_title') }}
        </h3>
        <p class="text-body-2 px-4" style="color: var(--sidebar-text-secondary); max-width: 350px; line-height: 1.5;">
          {{ $t('modules.help.devs_desc') }}
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HelpDevelopers",
});
</script>
