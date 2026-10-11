<template>
  <div class="bible-navigation d-flex flex-column flex-shrink-0">
    <div class="pa-4 pb-2">
      <h3 class="bible-nav-title">
        {{ $t('modules.bible.books') }}
      </h3>
    </div>
    <div class="books-scroll px-3 pb-4 flex-grow-1">
      <v-skeleton-loader v-if="loading" type="list-item@10" />
      <div v-else class="books-list">
        <template v-for="b in books" :key="b.id_bible_book">
          <!-- Linha do Livro -->
          <div
            :id="`listBook_${b.id_bible_book}`"
            class="book-row-item"
            :class="{
              'active-book': b.id_bible_book === selectedBook,
              'expanded-book': b.id_bible_book === expandedBookId
            }"
            @click="onBookClick(b.id_bible_book)"
          >
            <span class="book-name">{{ b.name }}</span>
            <div class="book-meta">
              <span
                v-if="b.id_bible_book === selectedBook && selectedChapter"
                class="chapter-badge"
              >
                {{ $t('modules.bible.chapters') }} {{ selectedChapter }}
              </span>
              <span class="book-abbrev">{{ b.abbreviation }}</span>
            </div>
          </div>

          <!-- Grade de Capítulos em 5 Colunas -->
          <v-expand-transition>
            <div
              v-if="b.id_bible_book === expandedBookId"
              class="chapters-expand-wrapper"
            >
              <div class="chapters-panel">
                <div class="chapters-grid">
                  <button
                    v-for="chapter in chaptersOf(b)"
                    :id="`listChapter_${chapter}`"
                    :key="chapter"
                    type="button"
                    class="chapter-cell-btn"
                    :class="{ active: isActiveChapter(b, chapter) }"
                    @click="onSelectChapter(b.id_bible_book, chapter)"
                  >
                    {{ chapter }}
                  </button>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </template>
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
      expandedBookId: null as string | number | null,
    };
  },
  methods: {
    onBookClick(id: string | number) {
      this.expandedBookId = this.expandedBookId === id ? null : id;
    },
    onSelectChapter(bookId: string | number, chapter: number) {
      this.$emit("select-chapter", { id_bible_book: bookId, chapter });
      this.expandedBookId = null;
    },
    chaptersOf(book: any): number[] {
      return Array.from({ length: book.chapters || 0 }, (_, index) => index + 1);
    },
    isActiveChapter(book: any, chapter: number): boolean {
      return (
        Number(book.id_bible_book) === Number(this.selectedBook) &&
        Number(chapter) === Number(this.selectedChapter)
      );
    },
  },
});
</script>

<style scoped>
.bible-navigation {
  width: 40%;
  min-width: 320px;
  max-width: 380px;
  background: var(--card-bg, #fff);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  min-height: 0;
}

.bible-nav-title {
  font-size: 1.15rem;
  color: var(--sidebar-text);
  font-weight: 700;
  line-height: 1;
}

.books-scroll {
  overflow-y: scroll;
  overflow-x: hidden;
  min-height: 0;
  overflow-anchor: none;
}

.books-scroll::-webkit-scrollbar,
.chapters-panel::-webkit-scrollbar {
  width: 4px;
}

.books-scroll::-webkit-scrollbar-track,
.chapters-panel::-webkit-scrollbar-track {
  background-color: transparent;
  margin: 6px 0;
}

.books-scroll::-webkit-scrollbar-thumb,
.chapters-panel::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(var(--v-theme-primary), 0.35);
  transition: background-color 0.2s ease;
}

.books-scroll::-webkit-scrollbar-thumb:hover,
.chapters-panel::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--v-theme-primary));
}

.books-list {
  display: flex;
  flex-direction: column;
}

/* Linha do Livro */
.book-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
  user-select: none;
  margin-bottom: 2px;
}

.book-row-item:hover {
  background: rgba(150, 150, 150, 0.08);
}

.book-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--sidebar-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.book-abbrev {
  font-size: 12px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

/* Livro Selecionado */
.book-row-item.active-book {
  background: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.35);
}

.book-row-item.active-book .book-name {
  color: #ffffff !important;
  font-weight: 700;
}

.book-row-item.active-book .book-abbrev {
  color: #ffffff !important;
  opacity: 0.95;
}

.chapter-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  letter-spacing: 0.2px;
}

/* Container de expansão: sem paddings, bordas ou margens para garantir recolhimento suave até 0px */
.chapters-expand-wrapper {
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: none;
}

/* Painel de Capítulos */
.chapters-panel {
  background: rgba(150, 150, 150, 0.05);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 8px;
  max-height: 230px;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 4px 0 8px 0;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  justify-items: center;
}

.chapter-cell-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
}

.chapter-cell-btn:hover {
  background: rgba(150, 150, 150, 0.12);
  color: var(--sidebar-text);
  transform: scale(1.06);
}

.chapter-cell-btn.active {
  background: rgb(var(--v-theme-primary)) !important;
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.4);
}
</style>
