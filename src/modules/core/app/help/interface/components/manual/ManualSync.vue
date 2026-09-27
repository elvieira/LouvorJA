<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('sync.intro')" />

    <!-- Acesso e Indicador -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-library" class="mr-2" size="22" />
      {{ t('sync.access_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.access_desc')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Espaço em Disco -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-harddisk" class="mr-2" size="22" />
      {{ t('sync.storage_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.storage_desc')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Download e Gerenciamento -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-cloud-download-outline" class="mr-2" size="22" />
      {{ t('sync.collections_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.collections_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.status_idle')" />
      <li class="mb-2" v-html="t('sync.status_downloading')" />
      <li class="mb-2" v-html="t('sync.status_downloaded')" />
      <li class="mb-2" v-html="t('sync.status_delete')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Ações em Lote -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-checkbox-multiple-marked-circle-outline" class="mr-2" size="22" />
      {{ t('sync.batch_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.batch_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.batch_download_all')" />
      <li class="mb-2" v-html="t('sync.batch_all_downloaded')" />
      <li class="mb-2" v-html="t('sync.batch_cancel_all')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Atualização de Banco de Dados -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-database-refresh" class="mr-2" size="22" />
      {{ t('sync.db_update_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.db_update_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.db_version_check')" />
      <li class="mb-2" v-html="t('sync.db_update_btn')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Importação do Louvor JA Clássico -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-history" class="mr-2" size="22" />
      {{ t('sync.import_legacy_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.import_legacy_desc')" />
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
