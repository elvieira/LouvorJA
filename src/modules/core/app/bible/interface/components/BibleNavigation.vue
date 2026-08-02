<template>
  <div class="bible-navigation d-flex flex-row flex-shrink-0" style="width: 40%; min-width: 350px; max-width: 400px; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); min-height: 0;">
    <div class="books-col h-100 d-flex flex-column" style="width: 65%; border-right: 1px solid var(--border-color, rgba(0,0,0,0.05));">
      <div class="pa-4 pb-2">
        <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600; line-height: 1;">
          {{ $t('modules.bible.books') }}
        </h3>
      </div>
      <div class="px-2 pb-4 flex-grow-1" style="overflow-y: scroll; overflow-x: hidden;">
        <v-skeleton-loader v-if="loading" type="list-item@10" />
        <v-list v-else density="compact" class="pa-0 bg-transparent">
          <v-list-item
            v-for="b in books"
            :id="`listBook_${b.id_bible_book}`"
            :key="b.id_bible_book"
            :active="b.id_bible_book === selectedBook"
            color="primary"
            class="rounded-lg mb-1"
            :variant="b.id_bible_book === selectedBook ? 'flat' : 'text'"
            @click="$emit('select-book', b.id_bible_book)"
          >
            <v-list-item-title class="font-weight-medium">
              {{ b.name }}
            </v-list-item-title>
            <template #append>
              <span class="text-caption font-weight-bold" :class="b.id_bible_book === selectedBook ? 'text-white' : 'text-primary'" style="opacity: 0.8">{{ b.abbreviation }}</span>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <div class="chapters-col h-100 d-flex flex-column" style="width: 35%;">
      <div class="pa-4 pb-2">
        <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600; line-height: 1;">
          {{ $t('modules.bible.chapters') }}
        </h3>
      </div>
      <div class="px-2 pb-4 flex-grow-1" style="overflow-y: scroll; overflow-x: hidden;">
        <v-skeleton-loader v-if="loading" type="list-item@10" />
        <div v-else class="d-flex flex-wrap justify-center gap-1">
          <v-btn
            v-for="chapter in chapters"
            :id="`listChapter_${chapter}`"
            :key="chapter"
            :variant="chapter === selectedChapter ? 'flat' : 'text'"
            :color="chapter === selectedChapter ? 'primary' : 'default'"
            class="rounded-lg ma-1 chapter-btn"
            min-width="44"
            width="44"
            height="44"
            @click="$emit('select-chapter', chapter)"
          >
            {{ chapter }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BibleNavigation",
  props: {
    books: {
      type: Array as PropType<any[]>,
      required: true,
    },
    chapters: {
      type: Array as PropType<number[]>,
      required: true,
    },
    selectedBook: {
      type: [String, Number],
      default: null,
    },
    selectedChapter: {
      type: [String, Number],
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["select-book", "select-chapter"],
});
</script>
