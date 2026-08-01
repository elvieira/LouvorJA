<template>
  <div class="pa-4 pb-2" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600;">
      {{ t('drawn') }}
      <v-chip size="x-small" color="success" class="ml-2 font-weight-bold">
        {{ drawnNames.length }}
      </v-chip>
    </h3>
  </div>
  <div class="flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 0;">
    <div v-if="drawnNames.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-8">
      <v-icon size="40" class="mb-2">
        mdi-history
      </v-icon>
      <div class="text-body-2 font-weight-medium">
        {{ t('empty_history') }}
      </div>
    </div>
    <v-list v-else density="compact" class="bg-transparent pa-0">
      <v-list-item
        v-for="(name, index) in reversedDrawnNames"
        :key="index"
        class="rounded-lg mb-1"
        style="background: rgba(var(--v-theme-success), 0.1);"
      >
        <template #prepend>
          <v-avatar size="24" color="success" class="mr-3 text-caption font-weight-bold text-white">
            {{ drawnNames.length - index }}
          </v-avatar>
        </template>
        <v-list-item-title class="font-weight-bold" style="color: var(--sidebar-text);">
          {{ name }}
        </v-list-item-title>
        <template #append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="removeDrawn(drawnNames.length - 1 - index)"
          >
            <v-icon>mdi-undo</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>
  <div class="pa-3" style="border-top: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <v-btn
      block
      variant="tonal"
      color="error"
      class="text-none font-weight-bold"
      @click="clearHistory"
    >
      {{ t('clear_history') }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "HistoryList",
  props: {
    drawnNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ["update:drawnNames"],
  computed: {
    moduleId(): string {
      return manifest.id;
    },
    reversedDrawnNames(): string[] {
      return [...this.drawnNames].reverse();
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    removeDrawn(index: number) {
      const newArr = [...this.drawnNames];
      newArr.splice(index, 1);
      this.$emit("update:drawnNames", newArr);
    },
    clearHistory() {
      this.$emit("update:drawnNames", []);
    },
  },
});
</script>
