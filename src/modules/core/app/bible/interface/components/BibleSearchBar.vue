<template>
  <!-- Search Bar & Toggle -->
  <div class="d-flex align-center ml-2 mr-4" style="max-width: 650px; flex: 2; position: relative; transition: all 0.3s ease;">
    <v-text-field
      ref="searchInput"
      v-model="searchQuery"
      :placeholder="searchMode === 'reference' ? 'Selecione um verso bíblico...' : 'Procure um texto bíblico...'"
      prepend-inner-icon="mdi-magnify"
      variant="solo"
      density="comfortable"
      hide-details
      rounded="xl"
      class="search-input-hero w-100"
      autofocus
      @keydown="onSearchKeyDown"
      @input="updateAutocompleteHint"
      @focus="onSearchFocus"
      @click="onSearchClick"
      @blur="onSearchBlur"
    >
      <template #append-inner>
        <div class="d-flex align-center ml-2" style="margin-right: -4px;">
          <div class="custom-segmented-control d-flex align-center pa-1" style="background: rgba(150, 150, 150, 0.15); border-radius: 20px; height: 32px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
            <div 
              class="d-flex align-center justify-center cursor-pointer"
              style="width: 44px; height: 100%; border-radius: 16px; transition: all 0.3s ease;"
              :style="searchMode === 'reference' ? 'background: var(--card-bg); color: var(--sidebar-text); box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : 'color: var(--sidebar-text-secondary);'"
              @click="setMode('reference')"
            >
              <span class="font-weight-bold" style="font-size: 0.65rem !important; letter-spacing: 0.5px;">REF</span>
            </div>
            <div 
              class="d-flex align-center justify-center cursor-pointer"
              style="width: 44px; height: 100%; border-radius: 16px; transition: all 0.3s ease;"
              :style="searchMode === 'text' ? 'background: var(--card-bg); color: var(--sidebar-text); box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : 'color: var(--sidebar-text-secondary);'"
              @click="setMode('text')"
            >
              <span class="font-weight-bold" style="font-size: 0.65rem !important; letter-spacing: 0.5px;">TEX</span>
            </div>
          </div>
        </div>
      </template>
    </v-text-field>
    
    <!-- Ghost hint text -->
    <div 
      v-if="searchMode === 'reference' && autocompleteHint && searchQuery" 
      class="autocomplete-hint d-flex align-center justify-end"
      style="position: absolute; right: 130px; top: 0; bottom: 0; pointer-events: none; z-index: 2;"
    >
      <span :style="matchedBook ? 'color: var(--accent-blue); opacity: 0.9; font-weight: 600;' : 'color: var(--sidebar-text-secondary); opacity: 0.6; font-weight: 500;'" style="font-size: 0.85rem;">
        {{ autocompleteHint }} <v-icon v-if="matchedBook" size="small" class="ml-1 opacity-50">{{ autocompleteHint === 'Versículo' ? 'mdi-keyboard-return' : 'mdi-keyboard-space' }}</v-icon>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BibleSearchBar",
  props: {
    books: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  emits: [
    "search-text",
    "select-book",
    "select-chapter",
    "search-verse",
    "execute-fallback",
  ],
  data() {
    return {
      searchMode: (this.$appdata.get("bible.searchMode") as "reference" | "text") || "reference",
      searchQuery: "",
      autocompleteHint: "",
      matchedBook: null as any,
      justFocused: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      // Pequeno atraso para garantir que a transição do módulo terminou antes de focar
      setTimeout(() => {
        if (this.$refs.searchInput) {
          (this.$refs.searchInput as any).focus();
        }
      }, 300);
    });
  },
  methods: {
    setMode(mode: "reference" | "text") {
      this.searchMode = mode;
      this.clearSearch();
    },
    clearSearch() {
      this.searchQuery = "";
      this.autocompleteHint = "";
      this.matchedBook = null;
    },
    getCleanString(str: string) {
      if (!str) return "";
      let clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      clean = clean.replace(/^iii\s+/, "3").replace(/^ii\s+/, "2").replace(/^i\s+/, "1");
      clean = clean
        .replace(/^isam/, "1sam")
        .replace(/^ire/, "1re")
        .replace(/^icr/, "1cr")
        .replace(/^ico/, "1co")
        .replace(/^ite/, "1te")
        .replace(/^iti/, "1ti")
        .replace(/^ipe/, "1pe")
        .replace(/^ijo/, "1jo");
      return clean.replace(/[^a-z0-9]/g, "");
    },

    parseQuery(query: string) {
      query = query.trimStart();
      let bookStr = "";
      let chapterStr = "";
      let verseStr = "";
      let isChapterStep = false;
      let isVerseStep = false;
      
      const colonIdx = query.indexOf(":");
      if (colonIdx !== -1) {
        isVerseStep = true;
        const beforeColon = query.substring(0, colonIdx).trimRight();
        verseStr = query.substring(colonIdx + 1).trimLeft();
        
        const m = beforeColon.match(/^(.+?)(?:\s+(\d*))?$/);
        if (m) {
          bookStr = m[1].trim();
          chapterStr = m[2] || "";
        } else {
          bookStr = beforeColon;
        }
      } else {
        const m = query.match(/^(.+?)(?:\s+(\d*))?$/);
        if (m) {
          bookStr = m[1].trim();
          if (m[2] !== undefined && m[2] !== "") {
            isChapterStep = true;
            chapterStr = m[2];
          } else if (query.endsWith(" ")) {
            isChapterStep = true;
          }
        } else {
          bookStr = query.trim();
        }
      }
      
      return { bookStr, chapterStr, verseStr, isChapterStep, isVerseStep };
    },
    getBestBookMatch(bookStr: string) {
      const val = this.getCleanString(bookStr);
      const exact = this.books.find(b => this.getCleanString(b.abbreviation) === val || this.getCleanString(b.name) === val);
      if (exact) return exact;
      
      const matched = this.books.filter(b => this.getCleanString(b.abbreviation).startsWith(val) || this.getCleanString(b.name).startsWith(val));
      if (matched.length === 1) return matched[0];
      
      return matched;
    },
    updateAutocompleteHint() {
      if (this.searchMode !== "reference") {
        this.autocompleteHint = "";
        this.matchedBook = null;
        return;
      }
      
      if (this.searchQuery) {
        let currentQuery = this.searchQuery;
        
        // Remove periods (macOS double-space often inserts '. ' automatically)
        if (currentQuery.includes(".")) {
          currentQuery = currentQuery.replace(/\./g, "");
        }
        
        // Check if a space was forced into the input without a valid book
        const parsed = this.parseQuery(currentQuery);
        if (parsed.isChapterStep) {
          const matchResult = this.getBestBookMatch(parsed.bookStr);
          const exactBook = Array.isArray(matchResult) ? null : matchResult;
          if (!exactBook) {
            currentQuery = currentQuery.trimEnd();
          } else if (parsed.chapterStr && exactBook.chapters) {
            let chStr = parsed.chapterStr;
            let chNum = parseInt(chStr);
            while (chStr.length > 0 && chNum > exactBook.chapters) {
              chStr = chStr.slice(0, -1);
              chNum = parseInt(chStr);
              currentQuery = `${parsed.bookStr} ${chStr}`;
            }
          }
        } else if (parsed.isVerseStep) {
          if (parsed.verseStr) {
            let vStr = parsed.verseStr;
            let vNum = parseInt(vStr);
            // Cap to 176 (longest chapter in the Bible is Psalm 119 with 176 verses)
            while (vStr.length > 0 && vNum > 176) {
              vStr = vStr.slice(0, -1);
              vNum = parseInt(vStr);
              const colonIdx = currentQuery.indexOf(":");
              currentQuery = currentQuery.substring(0, colonIdx + 1) + vStr;
            }
          }
        }
        
        if (currentQuery !== this.searchQuery) {
          this.searchQuery = currentQuery;
        }
      }
      
      if (!this.searchQuery.trimStart()) {
        this.autocompleteHint = "";
        this.matchedBook = null;
        return;
      }
      
      const { bookStr, chapterStr, verseStr, isChapterStep, isVerseStep } = this.parseQuery(this.searchQuery);
      const matchResult = this.getBestBookMatch(bookStr);
      const exactBook = Array.isArray(matchResult) ? null : matchResult;
      const matchedList = Array.isArray(matchResult) ? matchResult : [];
      
      if (!isChapterStep && !isVerseStep) {
        if (exactBook) {
          this.matchedBook = exactBook;
          this.autocompleteHint = exactBook.name;
        } else if (matchedList.length > 0) {
          this.matchedBook = null;
          this.autocompleteHint = matchedList.slice(0, 4).map(b => b.abbreviation).join(", ");
        } else {
          this.matchedBook = null;
          this.autocompleteHint = "";
        }
      } else if (isChapterStep && !isVerseStep) {
        if (exactBook) {
          this.matchedBook = exactBook;
          this.autocompleteHint = chapterStr ? `Capítulo ${chapterStr}` : "Capítulo";
        } else {
          this.matchedBook = null;
          this.autocompleteHint = "";
        }
      } else if (isVerseStep) {
        if (exactBook) {
          this.matchedBook = exactBook;
          this.autocompleteHint = verseStr ? `Versículo ${verseStr}` : "Versículo";
        } else {
          this.matchedBook = null;
          this.autocompleteHint = "";
        }
      }
    },
    async onSearchKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && this.searchMode === "text") {
        e.preventDefault();
        this.$emit("search-text", this.searchQuery);
        const inputEl = e.target as HTMLInputElement;
        if (inputEl && inputEl.select) inputEl.select();
        return;
      }

      if (this.searchMode !== "reference") return;
      
      if (e.key === " " || e.key === "Enter") {
        const { bookStr, chapterStr, verseStr, isChapterStep, isVerseStep } = this.parseQuery(this.searchQuery);
        const matchResult = this.getBestBookMatch(bookStr);
        const exactBook = Array.isArray(matchResult) ? null : matchResult;
        
        if (!isChapterStep && !isVerseStep) {
          if (exactBook) {
            e.preventDefault();
            this.searchQuery = `${exactBook.name} `;
            this.$nextTick(() => { this.updateAutocompleteHint(); });
            this.$emit("select-book", exactBook.id_bible_book);
          } else if (e.key === " ") {
            e.preventDefault();
          }
        } else if (isChapterStep && !isVerseStep) {
          if (!exactBook && e.key === " ") {
            e.preventDefault();
            return;
          }
          if (chapterStr) {
            e.preventDefault();
            this.searchQuery = `${this.searchQuery.trim()}:`;
            this.$nextTick(() => { this.updateAutocompleteHint(); });
            this.$emit("select-chapter", parseInt(chapterStr));
          } else if (e.key === " ") {
            e.preventDefault();
          }
        } else if (isVerseStep) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (exactBook && chapterStr && verseStr) {
              this.$emit("select-chapter", parseInt(chapterStr));
              this.$emit("search-verse", verseStr);
              
              // Select all text when final search is executed
              const inputEl = e.target as HTMLInputElement;
              if (inputEl && inputEl.select) {
                inputEl.select();
              }
            } else {
              this.$emit("execute-fallback", this.searchQuery);
            }
          }
        }
      }
    },
    onSearchFocus() {
      this.justFocused = true;
    },
    onSearchClick(e: MouseEvent) {
      if (this.justFocused && this.searchMode === "reference") {
        const inputEl = e.target as HTMLInputElement;
        if (inputEl && inputEl.select) {
          inputEl.select();
        }
        this.justFocused = false;
      }
    },
    onSearchBlur() {
      this.justFocused = false;
    },
  },
});
</script>
