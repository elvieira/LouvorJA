<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('bible.intro')" />

    <!-- Exibindo Passagens Bíblicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-book-open-page-variant-outline" class="mr-2" size="22" />
      {{ t('bible.nav_title') }}
    </h3>
    <p class="mb-4" v-html="t('bible.nav_p1')" />
    <p class="mb-4" v-html="t('bible.nav_p2')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Barra de Pesquisa e Seleção de Versículos -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-text-box-search-outline" class="mr-2" size="22" />
      {{ t('bible.search_bar_title') }}
    </h3>
    <p class="mb-4" v-html="t('bible.search_bar_intro')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('bible.mode_ref')" />
        <ul class="mt-2 pl-4" style="list-style-type: circle;">
          <li class="mb-1" v-html="t('bible.mode_ref_book')" />
          <li class="mb-1" v-html="t('bible.mode_ref_chapter')" />
          <li class="mb-1" v-html="t('bible.mode_ref_verses')" />
          <li v-html="t('bible.mode_ref_enter')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('bible.mode_tex')" />
        <ul class="mt-2 pl-4" style="list-style-type: circle;">
          <li class="mb-1" v-html="t('bible.mode_tex_words')" />
          <li v-html="t('bible.mode_tex_wildcard')" />
        </ul>
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Seleção Múltipla e Projeção -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-checkbox-multiple-marked-outline" class="mr-2" size="22" />
      {{ t('bible.multi_proj_title') }}
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('bible.multi_proj_p1')" />
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      {{ t('bible.multi_proj_p2') }}
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('bible.seq_1_3')" />
      <li class="mb-2" v-html="t('bible.seq_1_comma_3')" />
      <li class="mb-2" v-html="t('bible.seq_1_3_comma_5')" />
    </ul>

    <v-alert
      type="success"
      variant="tonal"
      class="mb-6 rounded-lg"
      density="comfortable"
    >
      <span v-html="t('bible.quick_search_alert')" />
    </v-alert>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Personalização da Projeção -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-palette-outline" class="mr-2" size="22" />
      {{ t('bible.custom_title') }}
    </h3>
    <p class="mb-4" v-html="t('bible.custom_p1')" />
    <p class="mb-4">
      {{ t('bible.custom_p2') }}
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('bible.custom_bg')" />
      <li class="mb-2" v-html="t('bible.custom_text')" />
      <li class="mb-2" v-html="t('bible.custom_ref')" />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualBible",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
