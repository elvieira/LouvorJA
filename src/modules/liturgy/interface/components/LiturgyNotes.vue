<template>
  <div class="d-flex flex-column flex-shrink-0" style="flex: 0 0 380px; width: 380px; min-height: 0; background: var(--card-bg, #fff); border-radius: 20px; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); box-shadow: 0 8px 30px rgba(0,0,0,0.04); overflow: hidden;">
    <div class="pa-4 pb-3 d-flex align-center justify-space-between" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05)); background: rgba(var(--v-theme-surface), 0.3);">
      <h3 style="font-size: 1.15rem; color: var(--sidebar-text); font-weight: 700;">
        <v-icon size="20" class="mr-2 mb-1" color="primary">
          mdi-note-edit-outline
        </v-icon>
        {{ t('notes') }}
      </h3>
    </div>
    <div class="flex-grow-1" style="overflow-y: hidden;">
      <RichTextEditor
        :model-value="modelValue"
        :placeholder="t('notes_placeholder')"
        @update:model-value="$emit('update:modelValue', $event)"
        @blur="$emit('blur')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RichTextEditor from "../RichTextEditor.vue";

export default defineComponent({
  name: "LiturgyNotes",
  components: {
    RichTextEditor,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "blur"],
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
  },
});
</script>
