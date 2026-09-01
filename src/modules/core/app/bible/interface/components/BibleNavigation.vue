<template>
  <div class="bible-navigation d-flex flex-column flex-shrink-0" style="width: 40%; min-width: 320px; max-width: 380px; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); min-height: 0;">
    <div class="pa-4 pb-2">
      <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600; line-height: 1;">
        {{ $t('modules.bible.books') }}
      </h3>
    </div>
    <div class="books-scroll px-2 pb-4 flex-grow-1" style="overflow-y: scroll; overflow-x: hidden; min-height: 0;">
      <v-skeleton-loader v-if="loading" type="list-item@10" />
      <v-list v-else density="compact" class="pa-0 bg-transparent">
        <template v-for="b in books" :key="b.id_bible_book">
          <v-list-item
            :id="`listBook_${b.id_bible_book}`"
            :active="b.id_bible_book === selectedBook"
            color="primary"
            class="rounded-lg mb-1"
            :variant="b.id_bible_book === selectedBook ? 'flat' : 'text'"
            @click="onBookClick(b.id_bible_book)"
          >
            <v-list-item-title class="font-weight-medium">
              {{ b.name }}
            </v-list-item-title>
            <template #append>
              <div class="d-flex align-center" style="gap: 6px;">
                <v-chip
                  v-if="b.id_bible_book === selectedBook"
                  size="x-small"
                  color="white"
                  variant="flat"
                  class="font-weight-bold text-primary"
                >
                  <v-icon start size="12">
                    mdi-bookmark-check
                  </v-icon>
                  {{ $t('modules.bible.chapters') }} {{ selectedChapter }}
                </v-chip>
                <span class="text-caption font-weight-bold" :class="b.id_bible_book === selectedBook ? 'text-white' : 'text-primary'" style="opacity: 0.8">{{ b.abbreviation }}</span>
              </div>
            </template>
          </v-list-item>

          <v-expand-transition>
            <div
              v-if="b.id_bible_book === expandedBookId"
              class="chapters-panel mb-2"
              style="background: var(--main-bg, rgba(0,0,0,0.02)); border-radius: 12px; border: 1px solid var(--border-color, rgba(0,0,0,0.05));"
            >
              <div class="chapters-scroll pa-2" style="max-height: 220px; overflow-y: auto; overflow-x: hidden; display: grid; grid-template-columns: repeat(auto-fill, 40px); gap: 8px; justify-content: center;">
                <v-btn
                  v-for="chapter in chaptersOf(b)"
                  :id="`listChapter_${chapter}`"
                  :key="chapter"
                  :variant="isActiveChapter(b, chapter) ? 'flat' : 'text'"
                  :color="isActiveChapter(b, chapter) ? 'primary' : 'default'"
                  class="rounded-lg chapter-btn"
                  min-width="40"
                  width="40"
                  height="40"
                  size="small"
                  @click="$emit('select-chapter', { id_bible_book: b.id_bible_book, chapter })"
                >
                  {{ chapter }}
                </v-btn>
              </div>
            </div>
          </v-expand-transition>
        </template>
      </v-list>
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
  emits: ["select-chapter"],
  data() {
    return {
      // Only controls which book's chapter grid is expanded — browsing a
      // book here does not navigate the reading pane, only picking a
      // chapter does (see select-chapter emit above).
      expandedBookId: this.selectedBook as string | number | null,
    };
  },
  watch: {
    selectedBook(val: string | number | null) {
      this.expandedBookId = val;
    },
  },
  methods: {
    onBookClick(id: string | number) {
      this.expandedBookId = this.expandedBookId === id ? null : id;
    },
    chaptersOf(book: any): number[] {
      return Array.from({ length: book.chapters || 0 }, (_, index) => index + 1);
    },
    isActiveChapter(book: any, chapter: number): boolean {
      return book.id_bible_book === this.selectedBook && chapter === this.selectedChapter;
    },
  },
});
</script>

<style scoped>
.chapters-scroll::-webkit-scrollbar {
  width: 4px;
}

.chapters-scroll::-webkit-scrollbar-track {
  background-color: transparent;
  margin: 6px 0;
}

.chapters-scroll::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 151, 215, 0.35);
  transition: background-color 0.2s ease;
}

.chapters-scroll::-webkit-scrollbar-thumb:hover {
  background-color: var(--accent-blue);
}
</style>
