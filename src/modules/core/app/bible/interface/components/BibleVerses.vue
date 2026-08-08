<template>
  <div class="bible-verses-col d-flex flex-column flex-grow-1" style="background: var(--card-bg, #fff); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); min-height: 0;">
    <div class="pa-4 d-flex justify-space-between align-center" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
      <h3 v-if="!showSearch" class="scriptural-reference-title" style="font-size: 1.3rem; color: var(--sidebar-text); font-weight: 600; line-height: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        {{ referenceTitle }}
      </h3>
      <div v-else class="flex-grow-1 mr-4" style="min-width: 0;">
        <v-text-field
          :model-value="searchQuery"
          :placeholder="$t('modules.bible.search_verse')"
          variant="solo"
          flat
          bg-color="rgba(150, 150, 150, 0.1)"
          style="border: 1px solid var(--border-color, rgba(0,0,0,0.05)); border-radius: 24px;"
          density="compact"
          hide-details
          autofocus
          clearable
          rounded
          @update:model-value="$emit('update:searchQuery', $event)"
          @keydown.enter="$emit('apply-search')"
          @keydown.esc="$emit('toggle-search')"
        />
      </div>
      
      <div class="d-flex align-center ml-auto flex-shrink-0" style="gap: 8px;">
        <v-btn
          variant="tonal"
          size="small"
          icon
          :color="showSearch ? 'primary' : 'default'"
          @click="$emit('toggle-search')"
        >
          <v-icon>{{ showSearch ? 'mdi-close' : 'mdi-magnify' }}</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ showSearch ? $t('modules.bible.close_search') : $t('modules.bible.search_verse') }}
          </v-tooltip>
        </v-btn>
        <v-btn
          v-shortkey="{ left: ['arrowleft'], up: ['arrowup'], pgup: ['pageup'] }"
          :disabled="!hasSelectedVerses"
          variant="tonal"
          size="small"
          icon
          @click="$emit('prev-verse')"
          @shortkey="$emit('prev-verse')"
        >
          <v-icon>mdi-chevron-left</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.prev_verse') }}
          </v-tooltip>
        </v-btn>
        <v-btn
          v-shortkey="{ right: ['arrowright'], down: ['arrowdown'], pgdn: ['pagedown'] }"
          :disabled="!hasSelectedVerses"
          variant="tonal"
          size="small"
          icon
          @click="$emit('next-verse')"
          @shortkey="$emit('next-verse')"
        >
          <v-icon>mdi-chevron-right</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.next_verse') }}
          </v-tooltip>
        </v-btn>
        <v-btn
          v-shortkey="['del']"
          :disabled="!hasSelectedVerses"
          variant="tonal"
          color="error"
          size="small"
          icon
          @click="$emit('clear-selection')"
          @shortkey="$emit('clear-selection')"
        >
          <v-icon>mdi-eraser</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.clear') }}
          </v-tooltip>
        </v-btn>
      </div>
    </div>

    <div class="pa-4 flex-grow-1" style="position: relative; min-height: 0; overflow-y: scroll; overflow-x: hidden;">
      <v-skeleton-loader v-if="loading" type="list-item-two-line@5" />
      <v-list v-else class="pa-0 bg-transparent">
        <v-list-item
          v-for="(verse, num) in verses"
          :id="`listVerse_${num}`"
          :key="num"
          :active="selectedVerses.includes(+num)"
          color="primary"
          class="rounded-lg mb-2 verse-item"
          :variant="selectedVerses.includes(+num) ? 'tonal' : 'text'"
          @click="$emit('select-verse', $event, num)"
        >
          <div class="d-flex align-start py-2">
            <v-avatar
              size="32"
              class="mr-4 mt-1 font-weight-bold flex-shrink-0"
              :color="selectedVerses.includes(+num) ? 'primary' : 'surface-variant'"
              :variant="selectedVerses.includes(+num) ? 'flat' : 'tonal'"
            >
              <span style="font-size: 0.85rem;">{{ num }}</span>
            </v-avatar>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="verse-text" style="font-size: 1.15rem; line-height: 1.6; color: var(--sidebar-text);" v-html="verse" />
          </div>
        </v-list-item>
      </v-list>
    </div>

    <slot name="footer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BibleVerses",
  props: {
    verses: {
      type: Object as PropType<Record<number, string>>,
      required: true,
    },
    selectedVerses: {
      type: Array as PropType<number[]>,
      required: true,
    },
    referenceTitle: {
      type: String,
      default: "",
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    hasSelectedVerses: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "select-verse",
    "prev-verse",
    "next-verse",
    "clear-selection",
    "toggle-search",
    "update:searchQuery",
    "apply-search",
  ],
});
</script>

<style scoped>
.bible-verses-col {
  container-type: inline-size;
  container-name: verses-col;
}

@container verses-col (max-width: 510px) {
  .scriptural-reference-title {
    display: none !important;
  }
}

@container verses-col (max-width: 310px) {
  :deep(.config-palette-btn) {
    display: none !important;
  }
}
</style>
