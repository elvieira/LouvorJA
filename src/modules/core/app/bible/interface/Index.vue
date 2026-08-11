<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <div class="search-bar ml-4 d-flex align-center" style="flex: 1; justify-content: flex-end; gap: 16px;">
          <v-autocomplete
            v-if="compact"
            v-model="bible.id_bible_book"
            :items="books_list"
            hide-details
            density="comfortable"
            variant="solo"
            rounded
            style="max-width: 150px;"
          />
          <v-autocomplete
            v-if="compact"
            v-model="bible.chapter"
            :items="chapters_list"
            hide-details
            density="comfortable"
            variant="solo"
            rounded
            style="max-width: 100px;"
          />
          <!-- Search Bar & Toggle -->
          <BibleSearchBar
            :books="books"
            @select-book="selBook"
            @select-chapter="selChapter"
            @search-verse="(v) => { verseSearchQuery = v; applyVerseSearch(); }"
            @search-text="executeSearchText"
            @execute-fallback="executeSearchFallback"
          />

          <v-menu :close-on-content-click="true" location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="flat"
                rounded="xl"
                class="text-none px-4"
                style="height: 44px; min-width: 90px; background: var(--card-bg); box-shadow: var(--shadow);"
              >
                <div class="d-flex align-center justify-center w-100" style="color: var(--sidebar-text);">
                  <v-icon size="small" class="mr-2 opacity-70">
                    mdi-book-open-page-variant
                  </v-icon>
                  <span class="font-weight-medium text-body-2">
                    {{ versions_list.find(v => v.value === bible.id_bible_version)?.abbreviation || t('select_version') }}
                  </span>
                  <v-icon size="small" class="ml-2 opacity-50">
                    mdi-menu-down
                  </v-icon>
                </div>
              </v-btn>
            </template>
            <v-card
              class="mt-2"
              rounded="lg"
              style="overflow: hidden; max-width: 350px; background: var(--card-bg); box-shadow: var(--shadow);"
            >
              <v-list class="py-2" bg-color="transparent">
                <v-list-item
                  v-for="v in versions_list"
                  :key="v.value"
                  :active="v.value === bible.id_bible_version"
                  color="primary"
                  class="mx-2 rounded-lg mb-1"
                  style="min-height: 40px;"
                  @click="bible.id_bible_version = v.value"
                >
                  <div class="d-flex align-center">
                    <span class="text-body-2 font-weight-medium" :class="v.value === bible.id_bible_version ? '' : 'opacity-70'">
                      {{ v.title }}
                    </span>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </ModuleHeader>

      <div class="content-main d-flex flex-row flex-grow-1" style="overflow: hidden; padding: 24px; min-height: 0; gap: 24px;">
        <BibleNavigation
          v-if="!compact"
          :books="books"
          :chapters="chapters_list"
          :selected-book="bible.id_bible_book"
          :selected-chapter="bible.chapter"
          :loading="loading_book"
          @select-book="selBook"
          @select-chapter="selChapter"
        />

        <BibleVerses
          :verses="filteredVerses"
          :selected-verses="bible.verses"
          :reference-title="scripturalReference(bible)"
          :show-search="showVerseSearch"
          :search-query="verseSearchQuery"
          :loading="loading_book || loading_verses"
          :has-selected-verses="select_bible?.verses && select_bible.verses.length > 0"
          @update:search-query="verseSearchQuery = $event"
          @toggle-search="showVerseSearch = !showVerseSearch"
          @apply-search="applyVerseSearch"
          @select-verse="selVerse"
          @prev-verse="prevVerse"
          @next-verse="nextVerse"
          @clear-selection="clean"
        >
          <template #footer>
            <div style="height: 220px; flex-shrink: 0; background: #000; position: relative;">
              <div style="position: absolute; top: 12px; right: 12px; z-index: 10; display: flex; gap: 8px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  size="small"
                  icon
                  class="config-palette-btn"
                  @click="showConfigModal = true"
                >
                  <v-icon>mdi-palette</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                  >
                    {{ t('customize') }}
                  </v-tooltip>
                </v-btn>
                <LScreenBtn
                  module="bible"
                  variant="tonal"
                  color="white"
                  class="text-white"
                />
              </div>
              <Screen :force-standard-colors="true" />
            </div>
          </template>
        </BibleVerses>
      </div>
      <ConfigModal v-if="!loading" v-model="showConfigModal" />

      <!-- Search Results Dialog -->
      <BibleSearchResults
        v-model="showSearchResults"
        :is-searching="isSearching"
        :search-results="searchResults"
        :search-query="lastSearchQuery"
        @open-result="openSearchResult"
      />
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import Screen from "./components/Screen.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "./components/ConfigModal.vue";
import ModuleHeader from "@/components/ModuleHeader.vue";
import BibleNavigation from "./components/BibleNavigation.vue";
import BibleVerses from "./components/BibleVerses.vue";
import BibleSearchBar from "./components/BibleSearchBar.vue";
import BibleSearchResults from "./components/BibleSearchResults.vue";
import { parseVerseSearchQuery, formatNumbersInterval } from "./bibleHelpers";

export default defineComponent({
  name: "CollectionsModule",
  components: {
    ModuleHeader,
    BibleNavigation,
    BibleVerses,
    Screen,
    LScreenBtn,
    ConfigModal,
    BibleSearchBar,
    BibleSearchResults,
  },
  data() {
    return {
      lang: null as string | null,
      loading: false,
      loading_book: false,
      loading_verses: false,
      tab: null,
      width: 0,
      height: 0,
      bible: {
        id_bible_version: null,
        id_bible_book: null,
        version: null,
        book: null,
        chapter: null,
        verses: [],
      } as any,
      select_bible: {
        id_bible_version: null,
        id_bible_book: null,
        version: null,
        book: null,
        chapter: null,
        verses: [],
        scriptural_reference: null,
        text: null,
      } as any,
      versions: [] as any[],
      books: [] as any[],
      verses: [] as any,
      last_verse: 1,
      last_bible_file: null as string | null,
      showConfigModal: false,
      showVerseSearch: false,
      verseSearchQuery: "",
      
      // New search features
      isSearching: false,
      showSearchResults: false,
      searchResults: [] as any[],
      lastSearchQuery: "",
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    navigateData() {
      // @ts-ignore
      return this.$appdata.get("modules.bible.data.navigate");
    },
    module() {
      // @ts-ignore
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    show() {
      return this.module.show;
    },

    book() {
      return this.books.find(
        (b) => b.id_bible_book === this.bible.id_bible_book,
      );
    },
    version() {
      return this.versions.find(
        (b) => b.id_bible_version === this.bible.id_bible_version,
      );
    },
    chapters() {
      return this.book?.chapters;
    },
    books_list() {
      return this.books.map((book) => ({
        title: book.name,
        value: book.id_bible_book,
      }));
    },
    chapters_list() {
      return Array.from({ length: this.chapters }, (_, index) => index + 1);
    },
    versions_list() {
      return this.versions.map((version) => ({
        abbreviation: version.abbreviation,
        title: `${version.abbreviation} - ${version.name}`,
        value: version.id_bible_version,
      }));
    },
    compact() {
      // @ts-ignore
      return this.$vuetify.display.width <= 750;
    },
    super_compact() {
      // @ts-ignore
      return this.$vuetify.display.width <= 400;
    },
    filteredVerses() {
      if (!this.showVerseSearch || !this.verseSearchQuery) return this.verses;
      
      const newVerses = parseVerseSearchQuery(this.verseSearchQuery, this.verses);
      
      const filtered: Record<number, any> = {};
      for (const num of newVerses) {
        filtered[num] = this.verses[num];
      }
      return Object.keys(filtered).length > 0 ? filtered : this.verses;
    },
  },
  watch: {
    navigateData: {
      deep: true,
      async handler(val) {
        if (val && val.bookId && val.chapter) {
          this.bible.id_bible_book = val.bookId;
          this.bible.chapter = val.chapter;
          await this.loadData();
          if (val.verses) {
            this.verseSearchQuery = val.verses;
            this.applyVerseSearch();
          }
        }
      },
    },
    async show() {
      if (this.show) {
        // @ts-ignore
        if (this.lang !== this.$i18n.locale) {
          this.versions = [];
          this.books = [];
          this.verses = [];
          this.bible = {
            id_bible_version: null,
            id_bible_book: null,
            version: null,
            book: null,
            chapter: null,
            verses: [],
          };
          this.select_bible = Object.assign({}, this.bible);
          await this.loadData();
        }

        // Recupera o scroll após o componente ser montado novamente no DOM
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.bible.id_bible_book) {
              const el = document.getElementById(`listBook_${this.bible.id_bible_book}`);
              if (el) el.scrollIntoView({ behavior: "auto", block: "center" });
            }
            if (this.bible.chapter) {
              const el = document.getElementById(`listChapter_${this.bible.chapter}`);
              if (el) el.scrollIntoView({ behavior: "auto", block: "center" });
            }
            if (this.last_verse) {
              const el = document.getElementById(`listVerse_${this.last_verse}`);
              if (el) el.scrollIntoView({ behavior: "auto", block: "center" });
            }
          }, 100);
        });
      }
    },
    async "bible.id_bible_book"() {
      await this.selBook();
    },
    async "bible.chapter"() {
      await this.selChapter();
    },
    async "bible.id_bible_version"() {
      await this.selVersion();
    },
    select_bible() {
      this.send("scriptural_reference", this.select_bible.scriptural_reference);
      this.send("text", this.select_bible.text);
    },
  },
  async mounted() {
    await this.loadData();
  },
  methods: {

    /* METHODS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string) {
      // @ts-ignore
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIAS - FIM */
    send(param: string, value: any) {
      // @ts-ignore
      this.$appdata.set(`modules.${this.module_id}.data.${param}`, value);
    },
    async loadData() {
      this.loading = true;

      if (this.books.length <= 0) {
        this.loading_book = true;
        // @ts-ignore
        this.books = await this.$database.get(
          // @ts-ignore
          `${this.$i18n.locale}_bible_book`,
        );
        if (!this.bible.id_bible_book) {
          await this.selBook(this.books[0].id_bible_book);
        }
        this.loading_book = false;
      }

      if (this.versions.length <= 0) {
        // @ts-ignore
        this.versions = await this.$database.get(
          // @ts-ignore
          `${this.$i18n.locale}_bible_version`,
        );
        if (!this.bible.id_bible_version) {
          // @ts-ignore
          const savedVersion = this.$userdata.get(`modules.${this.module_id}.selected_version`);
          let targetVersion = null;
          
          if (savedVersion && this.versions.find(v => v.id_bible_version === savedVersion)) {
            targetVersion = savedVersion;
          } else {
            const ara = this.versions.find(v => v.abbreviation === "ARA" || v.name === "ARA");
            targetVersion = ara ? ara.id_bible_version : this.versions[0].id_bible_version;
          }
          
          await this.selVersion(targetVersion);
        }
      }

      const bible_file = `bible_${this.bible.id_bible_version}_${this.bible.id_bible_book}_${this.bible.chapter}`;
      if (bible_file !== this.last_bible_file) {
        this.loading_verses = true;
        this.verses = {};
        // @ts-ignore
        this.verses = await this.$database.get(bible_file);
        this.last_bible_file = bible_file;
        this.loading_verses = false;
      }

      if (
        this.select_bible.id_bible_book === this.bible.id_bible_book &&
        this.select_bible.chapter === this.bible.chapter &&
        this.select_bible.id_bible_version === this.bible.id_bible_version
      ) {
        this.bible.verses = this.select_bible.verses;
      }

      // @ts-ignore
      this.lang = this.$i18n.locale;
      this.loading = false;
    },
    resize(data: any) {
      this.width = data.container_width;
      this.height = data.container_height;
    },

    async selVersion(id_bible_version?: any) {
      if (id_bible_version) {
        this.bible.id_bible_version = id_bible_version;
        // @ts-ignore
        this.$userdata.set(`modules.${this.module_id}.selected_version`, id_bible_version);
      }
      this.bible.version = this.version?.abbreviation;
      this.bible.verses = [];
      this.last_verse = 1;
      await this.loadData();
    },
    async selBook(id_bible_book?: any) {
      if (id_bible_book) {
        this.bible.id_bible_book = id_bible_book;
      }
      this.bible.book = this.book.name;
      this.bible.verses = [];
      this.last_verse = 1;
      if (!this.bible.chapter) {
        this.selChapter(1);
      } else if (this.bible.chapter > this.book.chapters) {
        this.selChapter(this.book.chapters);
      } else {
        await this.loadData();
      }

      const element = document.getElementById(`listBook_${id_bible_book}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    async selChapter(chapter?: any) {
      if (chapter) {
        this.bible.chapter = chapter;
      }
      this.bible.verses = [];
      this.last_verse = 1;
      await this.loadData();

      const element = document.getElementById(`listChapter_${chapter}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    applyVerseSearch() {
      if (!this.verseSearchQuery) return;
      
      const newVerses = parseVerseSearchQuery(this.verseSearchQuery, this.verses);
      
      if (newVerses.length > 0) {
        this.bible.verses = newVerses;
        this.last_verse = newVerses[newVerses.length - 1];
        
        this.select_bible = Object.assign({}, this.bible);
        this.select_bible.scriptural_reference = this.scripturalReference(this.select_bible);
        this.select_bible.text = this.getSelectedVerses(this.select_bible.verses);
        
        this.$nextTick(() => {
          const element = document.getElementById(`listVerse_${newVerses[0]}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
      
      this.verseSearchQuery = "";
      this.showVerseSearch = false;
    },
    async executeSearchFallback(searchQuery: string) {
      if (!searchQuery.trim()) return;
      
      const match = searchQuery.trim().match(/^(\d?\s*[a-zA-Záéíóúçãõ]+)\s+(\d+)(?::(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*))?$/i);
      if (match) {
        const abbrev = match[1].replace(/\s+/g, "").toLowerCase();
        const chapter = parseInt(match[2]);
        const versesStr = match[3];
        
        const book = this.books.find(b => b.abbreviation.toLowerCase() === abbrev || b.name.toLowerCase() === match[1].toLowerCase());
        
        if (book) {
          await this.selBook(book.id_bible_book);
          await this.selChapter(chapter);
          if (versesStr) {
            this.verseSearchQuery = versesStr;
            this.applyVerseSearch();
          }
        } else {
          // @ts-ignore
          this.$alert.error({ text: "Livro não encontrado." });
        }
      }
    },
    async executeSearchText(searchQuery: string) {
      if (!searchQuery.trim()) return;
      
      this.lastSearchQuery = searchQuery;
      this.isSearching = true;
      this.showSearchResults = true;
      try {
        // @ts-ignore
        this.searchResults = await window.electronAPI.searchBible(this.bible.id_bible_version, searchQuery, "text", this.lang || "pt");
      } catch (error) {
        console.error(error);
        this.searchResults = [];
      } finally {
        this.isSearching = false;
      }
    },
    async openSearchResult(res: any) {
      this.showSearchResults = false;
      await this.selBook(res.id_bible_book);
      await this.selChapter(res.chapter);
      
      this.bible.verses = [res.verse];
      this.last_verse = res.verse;
      this.select_bible = Object.assign({}, this.bible);
      this.select_bible.scriptural_reference = this.scripturalReference(this.select_bible);
      this.select_bible.text = this.getSelectedVerses(this.select_bible.verses);
      
      this.$nextTick(() => {
        const element = document.getElementById(`listVerse_${res.verse}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    },
    async selVerse(event: any, num: any) {
      if (event) {
        event.preventDefault();
      }

      num = parseInt(num);
      if (isNaN(num)) {
        return;
      }

      if (event?.ctrlKey) {
        const index = this.bible.verses.indexOf(num);
        if (index === -1) {
          this.bible.verses.push(num);
        } else {
          this.bible.verses.splice(index, 1);
        }
      } else if (event?.shiftKey) {
        const start = Math.min(num, this.last_verse);
        const end = Math.max(num, this.last_verse);
        for (let i = start; i <= end; i++) {
          if (!this.bible.verses.includes(i)) {
            this.bible.verses.push(i);
          }
        }
      } else {
        this.bible.verses = [num];
      }
      this.last_verse = num;
      this.bible.verses.sort((a: number, b: number) => a - b);
      this.select_bible = Object.assign({}, this.bible);
      this.select_bible.scriptural_reference = this.scripturalReference(
        this.select_bible,
      );
      this.select_bible.text = this.getSelectedVerses(this.select_bible.verses);

      const element = document.getElementById(`listVerse_${this.last_verse}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    async prevVerse() {
      if (this.select_bible?.id_bible_version) {
        await this.selVersion(this.select_bible.id_bible_version);
      }
      if (this.select_bible?.id_bible_book) {
        await this.selBook(this.select_bible.id_bible_book);
      }
      if (this.select_bible?.chapter) {
        await this.selChapter(this.select_bible.chapter);
      }
      if (this.select_bible?.verses && this.select_bible.verses.length > 0) {
        let verse = Math.min(
          ...this.select_bible.verses.filter((num: number) => num > 0),
        );
        if (verse > 1) {
          verse--;
        } else if (this.select_bible.chapter > 1) {
          await this.selChapter(this.select_bible.chapter - 1);
          verse = Math.max(...Object.keys(this.verses).map(Number));
        } else {
          const bookIndex = this.books.findIndex(
            (b: any) => b.id_bible_book === this.bible.id_bible_book,
          );
          const book =
            bookIndex > 0
              ? this.books[bookIndex - 1]
              : this.books[this.books.length - 1];
          await this.selBook(book.id_bible_book);
          await this.selChapter(book.chapters);
          verse = Math.max(...Object.keys(this.verses).map(Number));
        }
        this.selVerse(null, verse);
      }
    },
    async nextVerse() {
      if (this.select_bible?.id_bible_version) {
        await this.selVersion(this.select_bible.id_bible_version);
      }
      if (this.select_bible?.id_bible_book) {
        await this.selBook(this.select_bible.id_bible_book);
      }
      if (this.select_bible?.chapter) {
        await this.selChapter(this.select_bible.chapter);
      }
      if (this.select_bible?.verses && this.select_bible.verses.length > 0) {
        let verse = Math.max(...this.select_bible.verses);
        const max_verse = Math.max(...Object.keys(this.verses).map(Number));
        const max_chapter = this.book.chapters;
        if (verse < max_verse) {
          verse++;
        } else if (this.select_bible.chapter < max_chapter) {
          await this.selChapter(this.select_bible.chapter + 1);
          verse = 1;
        } else {
          const bookIndex = this.books.findIndex(
            (b: any) => b.id_bible_book === this.bible.id_bible_book,
          );
          const book =
            bookIndex < this.books.length - 1
              ? this.books[bookIndex + 1]
              : this.books[0];
          await this.selBook(book.id_bible_book);
          await this.selChapter(1);
          verse = 1;
        }
        this.selVerse(null, verse);
      }
    },
    scripturalReference(data: any) {
      const verses_interval = formatNumbersInterval(data.verses);

      if (!data.book || !data.version) {
        return "";
      }

      return (
        `${data.book 
        } ${ 
          data.chapter 
        }${verses_interval ? `:${verses_interval}` : "" 
        }${data.version ? ` (${data.version})` : ""}`
      ).trim();
    },

    getSelectedVerses(keys: any[]) {
      keys.sort((a, b) => a - b);
      let result = "";
      let previousKey: any = null;

      keys.forEach((key) => {
        if (previousKey !== null && key - previousKey > 1) {
          result += " [...] ";
        } else if (result) {
          result += " ";
        }
        result += this.verses[key];
        previousKey = key;
      });

      return result;
    },
    clean() {
      this.bible.verses = [];
      this.select_bible = {
        id_bible_version: null,
        id_bible_book: null,
        version: null,
        book: null,
        chapter: null,
        verses: [],
        scriptural_reference: null,
        text: null,
      };
    },

    close() {
      // @ts-ignore
      this.$popup.exit();
      this.bible.verses = [];
      this.select_bible = {
        id_bible_version: null,
        id_bible_book: null,
        version: null,
        book: null,
        chapter: null,
        verses: [],
        scriptural_reference: null,
        text: null,
      };
    },
  },
});
</script>


