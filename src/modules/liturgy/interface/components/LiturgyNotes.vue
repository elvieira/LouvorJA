<template>
  <div class="d-flex flex-column flex-shrink-0" style="flex: 0 0 380px; width: 380px; min-height: 0; background: var(--main-bg, transparent); border-radius: 20px;">
    <div class="px-6 py-4 d-flex align-center justify-space-between">
      <h3 style="font-size: 1.25rem; color: var(--sidebar-text); font-weight: 700;">
        <v-icon size="22" class="mr-2 mb-1" color="primary">
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
