<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <!-- Configurações -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-cog-outline" class="mr-2" size="22" />
      {{ t('settings.title') }}
    </h3>
    <p class="mb-4">
      {{ t('settings.p1') }}
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('settings.appearance')" />
      <li class="mb-2" v-html="t('settings.projection_monitor')" />
      <li class="mb-2" v-html="t('settings.language')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Utilitários -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-tools" class="mr-2" size="22" />
      {{ t('settings.utilities_title') }}
    </h3>
    <p class="mb-4">
      {{ t('settings.utilities_p1') }}
    </p>
    
    <p class="font-weight-medium mb-1 mt-4">
      {{ t('settings.giveaway_title') }}
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      {{ t('settings.giveaway_p') }}
    </p>

    <p class="font-weight-medium mb-1">
      {{ t('settings.timer_title') }}
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      {{ t('settings.timer_p') }}
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Texto Interativo -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-text-box-edit-outline" class="mr-2" size="22" />
      {{ t('settings.interactive_text_title') }}
    </h3>
    <p class="mb-4">
      {{ t('settings.interactive_text_p') }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSettings",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
