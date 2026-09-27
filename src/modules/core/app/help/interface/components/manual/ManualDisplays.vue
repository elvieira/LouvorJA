<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <!-- Projetando Tela -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('displays.projecting_title') }}
    </h3>
    <p class="mb-4" v-html="t('displays.projecting_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('displays.projecting_li1')" />
      <li class="mb-2" v-html="t('displays.projecting_li2')" />
      <li class="mb-2" v-html="t('displays.projecting_li3')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Formatação -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('displays.formatting_title') }}
    </h3>
    <p class="mb-4" v-html="t('displays.formatting_p1')" />
    <p class="mb-4" v-html="t('displays.formatting_p2')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Transmitindo e CSS -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('displays.streaming_title') }}
    </h3>
    <p class="mb-4" v-html="t('displays.streaming_p1')" />
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('displays.streaming_p2')" />
    
    <!-- Dicas de CSS -->
    <v-card variant="tonal" class="rounded-lg mb-6 border-opacity-25 bg-surface-light">
      <v-card-text>
        <p class="font-weight-bold mb-2">
          {{ t('displays.css_tips_title') }}
        </p>
        <p class="mb-3 text-body-2">
          {{ t('displays.css_tips_p1') }}
        </p>
        
        <p class="font-weight-medium text-caption mt-2 mb-1">
          {{ t('displays.css_bottom') }}
        </p>
        <code class="d-block pa-2 rounded bg-black text-green-accent-2 mb-3">table td { vertical-align: bottom !important; }</code>
        
        <p class="font-weight-medium text-caption mt-2 mb-1">
          {{ t('displays.css_font') }}
        </p>
        <code class="d-block pa-2 rounded bg-black text-green-accent-2 mb-3">* { font-size: 50px !important; }</code>
        
        <p class="font-weight-medium text-caption mt-2 mb-1">
          {{ t('displays.css_center') }}
        </p>
        <code class="d-block pa-2 rounded bg-black text-green-accent-2 mb-1">* { color: red !important; font-family: Arial !important; }</code>
      </v-card-text>
    </v-card>
    
    <v-divider class="my-6 border-opacity-25" />

    <!-- Editor de Slides -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('displays.editor_title') }}
    </h3>
    <p class="mb-4" v-html="t('displays.editor_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-1" v-html="t('displays.editor_split')" />
      <li class="mb-1" v-html="t('displays.editor_merge')" />
    </ul>

    <p class="font-weight-medium mb-2">
      {{ t('displays.editor_intervals_title') }}
    </p>
    <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary);" v-html="t('displays.editor_intervals_desc')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualDisplays",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
