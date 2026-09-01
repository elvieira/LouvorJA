<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    scrollable
    content-class="bible-search-dialog"
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-title class="d-flex align-center px-6 pt-6 pb-4">
        <v-icon color="primary" class="mr-3">
          mdi-text-search
        </v-icon>
        <span class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">Resultados da Busca</span>
        <v-spacer />
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="px-6 pb-6 pt-0" style="max-height: 60vh;">
        <div v-if="isSearching" class="d-flex flex-column align-center justify-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="40"
            class="mb-4"
          />
          <span class="text-body-2" style="color: var(--sidebar-text-secondary);">Buscando em toda a Bíblia...</span>
        </div>
        
        <div v-else-if="searchResults.length === 0" class="d-flex flex-column align-center justify-center py-8">
          <v-icon size="48" color="grey" class="mb-4 opacity-50">
            mdi-text-box-search-outline
          </v-icon>
          <span class="text-body-1" style="color: var(--sidebar-text-secondary);">Nenhum versículo encontrado para "{{ searchQuery }}".</span>
        </div>
        
        <div v-else class="d-flex flex-column" style="gap: 12px;">
          <div
            v-for="(res, i) in searchResults"
            :key="i"
            class="rounded-lg pa-4 transition-swing"
            style="border: 1px solid var(--border-color); cursor: pointer; background: rgba(150, 150, 150, 0.05);"
            @click="$emit('open-result', res)"
          >
            <div class="d-flex flex-column align-center text-center">
              <span class="text-caption font-weight-bold text-primary mb-2 text-uppercase" style="letter-spacing: 0.5px;">
                {{ res.book_name }} {{ res.chapter }}:{{ res.verse }}
              </span>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span class="text-body-1" style="color: var(--sidebar-text); line-height: 1.6;" v-html="highlightText(res.text, searchQuery)" />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BibleSearchResults",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    isSearching: {
      type: Boolean,
      required: true,
    },
    searchResults: {
      type: Array as PropType<any[]>,
      required: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue", "open-result"],
  methods: {
    highlightText(text: string, query: string) {
      if (!query || !text) return text;
      
      const cleanQuery = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (!cleanQuery) return text;
      
      const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (normalizedText.startsWith(cleanQuery, i)) {
          const matchText = text.slice(i, i + cleanQuery.length);
          result += `<mark class="text-white px-1 mx-1 rounded font-weight-bold" style="background: rgba(var(--v-theme-primary), 0.6) !important;">${matchText}</mark>`;
          i += cleanQuery.length - 1;
        } else {
          result += text[i];
        }
      }
      return result;
    },
  },
});
</script>
