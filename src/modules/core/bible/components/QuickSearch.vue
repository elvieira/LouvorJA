<template>
  <v-slide-y-reverse-transition>
    <div
      v-if="visible"
      class="quick-search-overlay d-flex align-center justify-center"
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: rgba(0,0,0,0.65); backdrop-filter: blur(3px);"
      @mousedown.self="cancel"
    >
      <div class="quick-search-card" style="width: 100%; max-width: 480px; background: #14141c; border-radius: 20px; box-shadow: 0 24px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.08); padding: 28px 32px; position: relative;">
        <span class="text-caption" style="position: absolute; top: 16px; right: 20px; color: rgba(255,255,255,0.4);">
          Esc para cancelar
        </span>

        <input
          ref="hiddenInput"
          v-model="query"
          class="quick-search-hidden-input"
          style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px;"
          autocomplete="off"
          spellcheck="false"
          @keydown.esc="cancel"
          @keydown.enter.prevent="confirm"
          @keydown.tab.prevent="handleTab"
        />

        <div class="mb-5">
          <div class="text-caption font-weight-bold" style="color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase;">
            Livro
          </div>
          <div class="font-weight-bold" style="color: #fff; font-size: 1.6rem; min-height: 2.1rem;">
            {{ matchedBook ? matchedBook.name : bookQuery }}<span v-if="stage === 'book'" class="quick-search-caret">|</span>
          </div>
          <div v-if="stage === 'book' && !bookQuery" class="text-caption" style="color: rgba(255,255,255,0.35);">
            digite o nome ou abreviação (ex: lc, gn, 1sm)
          </div>
        </div>

        <div class="mb-5">
          <div class="text-caption font-weight-bold" style="color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase;">
            Capítulo
          </div>
          <div class="font-weight-bold" style="color: #fff; font-size: 1.6rem; min-height: 2.1rem;">
            {{ chapterQuery }}<span v-if="stage === 'chapter'" class="quick-search-caret">|</span>
          </div>
          <div v-if="matchedBook" class="text-caption" style="color: rgba(255,255,255,0.35);">
            Capítulos: {{ matchedBook.chapters }}
          </div>
        </div>

        <div class="mb-2">
          <div class="text-caption font-weight-bold" style="color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase;">
            Versículo
          </div>
          <div class="font-weight-bold" style="color: #fff; font-size: 1.6rem; min-height: 2.1rem;">
            {{ verseQuery }}<span v-if="stage === 'verse'" class="quick-search-caret">|</span>
          </div>
        </div>

        <div v-if="errorMessage" class="text-center mt-4" style="color: #ff6b81; font-weight: 600;">
          {{ errorMessage }}
        </div>

        <div class="text-caption text-center mt-4" style="color: rgba(255,255,255,0.3);">
          Tab avança de campo · Enter seleciona
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
export default {
  name: "BibleQuickSearch",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    books: {
      type: Array,
      default: () => [],
    },
    initialChar: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "navigate"],
  data: () => ({
    query: "",
  }),
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    parts() {
      return this.query.length ? this.query.split(/\s+/) : [];
    },
    bookQuery() {
      return this.parts[0] || "";
    },
    chapterQuery() {
      return this.parts.length > 1 ? this.parts[1] : "";
    },
    verseQuery() {
      return this.parts.length > 2 ? this.parts[2] : "";
    },
    stage() {
      if (this.parts.length <= 1) return "book";
      if (this.parts.length === 2) return "chapter";
      return "verse";
    },
    matchedBook() {
      return this.findBook(this.bookQuery);
    },
    chapterNum() {
      const num = parseInt(this.chapterQuery, 10);
      return isNaN(num) ? null : num;
    },
    chapterIsValid() {
      return !!(
        this.matchedBook &&
        this.chapterNum !== null &&
        this.chapterNum >= 1 &&
        this.chapterNum <= this.matchedBook.chapters
      );
    },
    errorMessage() {
      if (this.stage === "book" && this.bookQuery && !this.matchedBook) {
        return "Nenhum resultado encontrado";
      }
      if (this.stage !== "book" && this.matchedBook && this.chapterQuery && !this.chapterIsValid) {
        return "Nenhum resultado encontrado";
      }
      return "";
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.query = this.initialChar || "";
        this.$nextTick(() => {
          this.$refs.hiddenInput?.focus();
        });
      }
    },
  },
  methods: {
    normalize(str) {
      return (str || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    },
    findBook(query) {
      if (!query) return null;
      const q = this.normalize(query);
      return (
        this.books.find((b) => this.normalize(b.abbreviation) === q) ||
        this.books.find((b) => this.normalize(b.abbreviation).startsWith(q)) ||
        this.books.find((b) => this.normalize(b.name).startsWith(q)) ||
        this.books.find((b) => this.normalize(b.name).includes(q)) ||
        null
      );
    },
    handleTab(e) {
      if (e.shiftKey) return;
      this.nextField();
    },
    nextField() {
      if (this.stage === "verse") return;
      if (!/\s$/.test(this.query)) {
        this.query += " ";
      }
    },
    confirm() {
      if (!this.matchedBook || this.errorMessage) return;

      const chapter = this.chapterIsValid ? this.chapterNum : 1;

      this.$emit("navigate", {
        bookId: this.matchedBook.id_bible_book,
        chapter,
        verses: this.verseQuery || null,
      });

      this.close();
    },
    cancel() {
      this.close();
    },
    close() {
      this.query = "";
      this.visible = false;
    },
  },
};
</script>

<style scoped>
.quick-search-caret {
  display: inline-block;
  margin-left: 2px;
  animation: quick-search-blink 1s step-end infinite;
  color: var(--accent-blue, #1976d2);
}

@keyframes quick-search-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
</style>
