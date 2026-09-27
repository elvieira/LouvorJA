<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('liturgy.intro')" />

    <!-- Liturgias Diárias e Avulsas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-calendar-check-outline" class="mr-2" size="22" />
      {{ t('liturgy.days_title') }}
    </h3>
    <p class="mb-4" v-html="t('liturgy.days_p1')" />
    <p class="mb-4" v-html="t('liturgy.days_p2')" />

    <v-divider class="my-6 border-opacity-25" />

    <!-- Tipos de Itens -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-shape-outline" class="mr-2" size="22" />
      {{ t('liturgy.item_types_title') }}
    </h3>
    <p class="mb-4" v-html="t('liturgy.item_types_intro')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('liturgy.type_category')" />
      <li class="mb-2" v-html="t('liturgy.type_note')" />
      <li class="mb-2" v-html="t('liturgy.type_song')" />
      <li class="mb-2" v-html="t('liturgy.type_bible')" />
      <li class="mb-2" v-html="t('liturgy.type_media')" />
      <li class="mb-2" v-html="t('liturgy.type_weblink')" />
      <li class="mb-2" v-html="t('liturgy.type_file')" />
      <li class="mb-2" v-html="t('liturgy.type_scheduled')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Funcionalidades da Lista -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-format-list-checks" class="mr-2" size="22" />
      {{ t('liturgy.manage_title') }}
    </h3>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <span v-html="t('liturgy.timeline')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li><span class="text-success font-weight-bold">{{ t('liturgy.timeline_done') }}</span></li>
          <li><span class="text-primary font-weight-bold">{{ t('liturgy.timeline_next') }}</span></li>
          <li><span class="opacity-70">{{ t('liturgy.timeline_pending') }}</span></li>
        </ul>
      </li>
      <li class="mb-2" v-html="t('liturgy.drag_drop')" />
      <li class="mb-2" v-html="t('liturgy.toggle_done')" />
      <li class="mb-2">
        <strong>{{ t('liturgy.quick_actions') }}</strong>
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('liturgy.action_play')" />
          <li v-html="t('liturgy.action_view')" />
          <li v-html="t('liturgy.action_open')" />
          <li v-html="t('liturgy.action_duplicate')" />
          <li v-html="t('liturgy.action_edit')" />
          <li v-html="t('liturgy.action_delete')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('liturgy.collapse_expand')" />
      <li class="mb-2" v-html="t('liturgy.pending_tag')" />
      <li class="mb-2">
        <strong>{{ t('liturgy.global_actions') }}</strong>
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('liturgy.action_uncheck_all')" />
          <li v-html="t('liturgy.action_clear_all')" />
        </ul>
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Importar / Exportar, Templates e Agendados -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-swap-horizontal-bold" class="mr-2" size="22" />
      {{ t('liturgy.advanced_title') }}
    </h3>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('liturgy.import_export')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('liturgy.export_desc')" />
          <li v-html="t('liturgy.import_desc')" />
        </ul>
      </li>
      <li class="mb-3" v-html="t('liturgy.templates_desc')" />
      <li class="mb-3" v-html="t('liturgy.scheduled_desc')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Notas do Dia -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-note-text-outline" class="mr-2" size="22" />
      {{ t('liturgy.notes_title') }}
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('liturgy.notes_desc')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualLiturgy",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
