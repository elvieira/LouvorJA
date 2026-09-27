<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('sync.intro')" />

    <!-- Biblioteca Local -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('sync.local_bib_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.local_bib_p1')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        {{ t('sync.local_bib_li1') }}
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Download de Coletâneas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('sync.download_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.download_p1')" />
    <p class="mb-4">
      {{ t('sync.download_p2') }}
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        {{ t('sync.download_li1') }}
      </li>
      <li class="mb-2">
        {{ t('sync.download_li2') }}
      </li>
      <li class="mb-2">
        {{ t('sync.download_li3') }}
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Atualizações do Programa -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      {{ t('sync.updates_title') }}
    </h3>
    <p class="mb-4">
      {{ t('sync.updates_p1') }}
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.updates_auto')" />
      <li class="mb-2" v-html="t('sync.updates_bg')" />
      <li class="mb-2" v-html="t('sync.updates_easy')" />
      <li class="mb-2" v-html="t('sync.updates_manual')" />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSync",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
