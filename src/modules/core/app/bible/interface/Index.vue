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

          <!-- Seletor de Versão Bíblica (Dropdown estilo Design System) -->
          <v-menu
            :close-on-content-click="true"
            location="bottom end"
            :offset="8"
            transition="slide-y-transition"
          >
            <template #activator="{ props: versionMenuProps }">
              <button
                v-bind="versionMenuProps"
                type="button"
                class="bible-version-select-btn"
                :title="currentVersionName"
              >
                <v-icon size="18" class="version-btn-icon mr-2">
                  mdi-book-open-page-variant-outline
                </v-icon>
                <span class="version-btn-abbr">
                  {{ currentVersionAbbr }}
                </span>
                <v-icon size="18" class="version-btn-arrow ml-2">
                  mdi-chevron-down
                </v-icon>
              </button>
            </template>
            <div class="search-filter-popover bible-version-popover">
              <div class="filter-header">
                {{ t('select_version') || 'Versões Bíblicas' }}
              </div>
              <div class="bible-version-list custom-scroll">
                <button
                  v-for="v in versions_list"
                  :key="v.value"
                  type="button"
                  class="filter-item version-item"
                  :class="{ active: v.value === bible.id_bible_version }"
                  @click="bible.id_bible_version = v.value"
                >
                  <span class="version-item-title text-truncate">{{ v.title }}</span>
                  <v-icon
                    v-if="v.value === bible.id_bible_version"
                    size="18"
                    class="active-check ml-2"
                  >
                    mdi-check
                  </v-icon>
                </button>
              </div>
            </div>
          </v-menu>
        </div>
      </ModuleHeader>

      <div class="content-main d-flex flex-row flex-grow-1" style="overflow: hidden; padding: 24px; min-height: 0; gap: 24px;">
        <BibleNavigation
          v-if="!compact"
          :books="books"
          :selected-book="bible.id_bible_book"
          :selected-chapter="bible.chapter"
          :loading="loading_book"
          @select-chapter="selBookChapter"
        />

        <BibleVerses
          :verses="verses"
          :selected-verses="bible.verses"
          :reference-title="scripturalReference(bible)"
          :multi-select="multiSelect"
          :loading="loading_book || loading_verses"
          :has-selected-verses="select_bible?.verses && select_bible.verses.length > 0"
          @toggle-multi-select="multiSelect = !multiSelect"
          @select-verse="selVerse"
          @prev-verse="prevVerse"
          @next-verse="nextVerse"
          @clear-selection="clean"
        >
          <template #footer>
            <div
              class="bible-projection-preview-bar"
              :class="{ 'expanded': showPreview }"
            >
              <div class="projection-preview-actions d-flex align-center">
                <v-btn
                  variant="text"
                  size="small"
                  icon
                  class="preview-action-btn"
                  @click="showPreview = !showPreview"
                >
                  <v-icon size="18">
                    {{ showPreview ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
                  </v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                  >
                    {{ showPreview ? t('hide_preview') : t('show_preview') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="primary"
                  size="small"
                  icon
                  class="preview-action-btn config-palette-btn"
                  @click="showConfigModal = true"
                >
                  <v-icon size="18">
                    mdi-palette
                  </v-icon>
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
                  variant="text"
                  size="small"
                  class="preview-action-btn"
                />
              </div>
              <div v-show="showPreview" class="preview-screen-wrapper">
                <Screen :force-standard-colors="true" />
              </div>
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
        :version-abbr="currentVersionAbbr"
        @open-result="openSearchResult"
        @search-text="executeSearchText"
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
      multiSelect: false,
      verseSearchQuery: "",
      
      // New search features
      isSearching: false,
      showSearchResults: false,
      searchResults: [] as any[],
      lastSearchQuery: "",
      
      showPreview: false,
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
    currentVersionAbbr(): string {
      return this.versions_list.find((v: any) => v.value === this.bible.id_bible_version)?.abbreviation || this.t("select_version");
    },
    currentVersionName(): string {
      return this.versions_list.find((v: any) => v.value === this.bible.id_bible_version)?.title || this.t("select_version");
    },
    compact() {
      // @ts-ignore
      return this.$vuetify.display.width <= 750;
    },
    super_compact() {
      // @ts-ignore
      return this.$vuetify.display.width <= 400;
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
            this.applyVerseSearch(false);
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
    showPreview(val: boolean) {
      // @ts-ignore
      this.$userdata.set(`modules.${this.module_id}.show_preview`, val);
    },
  },
  created() {
    // @ts-ignore
    const savedPreview = this.$userdata.get(`modules.${this.module_id}.show_preview`);
    if (savedPreview !== null && savedPreview !== undefined) {
      this.showPreview = Boolean(savedPreview);
    }
  },
  async mounted() {
    await this.loadData();
    window.addEventListener("keydown", this.handleGlobalKeydown);
  },
  unmounted() {
    window.removeEventListener("keydown", this.handleGlobalKeydown);
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
    projectIfConfigured(forceProject: boolean = false) {
      // @ts-ignore
      const bibleConfig = this.$appdata.get("modules.bible.config") || this.$userdata.get("bible_config") || {};
      
      let shouldProject = false;
      if (bibleConfig.projWithP) {
        shouldProject = forceProject;
      } else {
        shouldProject = forceProject || bibleConfig.autoProjNormal === true;
      }

      if (shouldProject) {
        setTimeout(() => {
          let selectedMonitors: any[] = [];
          if ((window as any).electronAPI && (window as any).electronAPI.getDisplays) {
            (window as any).electronAPI.getDisplays().then((displays: any) => {
              if (displays && displays.length > 1) {
                // @ts-ignore
                let configMonitors = this.$userdata.get("modules.config.slide_monitor");
                if (!Array.isArray(configMonitors)) {
                  configMonitors = configMonitors ? [configMonitors] : [];
                }
                const primary = displays.find((d: any) => d.isPrimary) || displays[0];
                selectedMonitors = configMonitors.filter((m: any) => m !== primary.id);
              }
              
              if (selectedMonitors.length > 0) {
                // @ts-ignore
                this.$popup.syncMonitors(selectedMonitors, "bible", true);
              } else {
                // @ts-ignore
                const fullscreen = this.$userdata.get("modules.config.slide_fullscreen") !== false;
                // @ts-ignore
                this.$popup.open({ module: "bible", fullscreen });
              }
            });
          } else {
            // @ts-ignore
            const fullscreen = this.$userdata.get("modules.config.slide_fullscreen") !== false;
            // @ts-ignore
            this.$popup.open({ module: "bible", fullscreen });
          }
        }, 150);
      }
    },
    handleGlobalKeydown(e: KeyboardEvent) {
      if (!this.show) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.key.toLowerCase() === "p") {
        // If it's a real keyboard press (isTrusted is true), ignore it. 
        // We only want 'p' to work when dispatched synthetically from the search bars.
        if (e.isTrusted) return;

        // @ts-ignore
        const bibleConfig = this.$appdata.get("modules.bible.config") || this.$userdata.get("bible_config") || {};
        if (bibleConfig.projWithP === false) return;
        
        if (this.select_bible && this.select_bible.verses && this.select_bible.verses.length > 0) {
          e.preventDefault();
          this.projectIfConfigured(true);
        }
      }

      // Navegação de versículos pelas teclas direcionais quando a mídia não estiver tocando
      const isMediaPlaying = this.$appdata.get("modules.media.show") && !this.$appdata.get("modules.media.minimized");
      if (!isMediaPlaying && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.code)) {
          if (this.select_bible?.verses?.length) {
            e.preventDefault();
            this.nextVerse();
          }
        } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.code)) {
          if (this.select_bible?.verses?.length) {
            e.preventDefault();
            this.prevVerse();
          }
        }
      }
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
        // No book/chapter is pre-selected on first open; the reading pane
        // stays empty until the user picks one in BibleNavigation.
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

      if (this.bible.id_bible_book && this.bible.chapter) {
        const bible_file = `bible_${this.bible.id_bible_version}_${this.bible.id_bible_book}_${this.bible.chapter}`;
        if (bible_file !== this.last_bible_file) {
          this.loading_verses = true;
          this.verses = {};
          // @ts-ignore
          this.verses = await this.$database.get(bible_file);
          this.last_bible_file = bible_file;
          this.loading_verses = false;
        }
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
      // Keeps the current chapter and verse selection when only the book
      // changes; selChapter() below already clears them when the chapter
      // actually changes (new chapter, or clamped to the book's last one).
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
    // Picking a chapter while browsing a book's expanded chapter list in
    // BibleNavigation: switches book + chapter together in one step, since
    // browsing that list no longer navigates the reading pane by itself.
    async selBookChapter(payload: { id_bible_book: any; chapter: any }) {
      if (payload.id_bible_book && payload.id_bible_book !== this.bible.id_bible_book) {
        this.bible.id_bible_book = payload.id_bible_book;
        this.bible.book = this.book?.name;
      }
      await this.selChapter(payload.chapter);
    },
    applyVerseSearch(triggerProjection: boolean = true) {
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
        
        if (triggerProjection) {
          this.projectIfConfigured();
        }
      }
      
      this.verseSearchQuery = "";
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

      const isMac = Boolean((window as any)?.electronAPI?.isMac) || (
        typeof navigator !== "undefined" && (
          navigator.userAgent.includes("Mac") || (navigator.platform && navigator.platform.includes("Mac"))
        )
      );
      const isMultiSelectModifier = isMac ? (event?.metaKey && !event?.ctrlKey) : (event?.ctrlKey && !event?.metaKey);

      if (this.multiSelect || isMultiSelectModifier) {
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

      this.projectIfConfigured();
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

<style lang="scss">
.bible-version-select-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  min-width: 96px;
  padding: 0 16px;
  border-radius: 20px;
  background: var(--ds-surface, #30364a);
  border: 1px solid var(--ds-border, #43495b);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: var(--ds-text-primary, #f7f8fc);
  cursor: pointer;
  outline: none;
  user-select: none;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .version-btn-icon {
    color: var(--ds-text-secondary, #a0a6b5);
    transition: color 0.2s ease;
  }

  .version-btn-abbr {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1;
    color: var(--ds-text-primary, #f7f8fc);
  }

  .version-btn-arrow {
    color: var(--ds-text-secondary, #a0a6b5);
    transition: transform 0.2s ease, color 0.2s ease;
  }

  &:hover {
    background: var(--ds-surface-elevated, #373e55);
    border-color: rgba(0, 155, 226, 0.45);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);

    .version-btn-icon,
    .version-btn-arrow {
      color: var(--ds-accent, #009be2);
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.bible-version-popover {
  min-width: 280px;
  max-width: 380px;
  background: var(--ds-surface, #30364a) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28) !important;
  padding: 8px !important;

  .bible-version-list {
    max-height: 380px;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .version-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: var(--ds-text-primary, #f7f8fc);
    text-align: left;
    outline: none;

    .version-item-title {
      font-size: 13.5px;
      font-weight: 500;
      line-height: 1.2;
    }

    .active-check {
      color: var(--ds-accent, #009be2);
      flex-shrink: 0;
    }

    &:hover {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
      color: var(--ds-accent, #009be2);
    }

    &.active {
      background: rgba(0, 155, 226, 0.14) !important;
      color: var(--ds-accent, #009be2) !important;
      font-weight: 600;
    }
  }
}

.bible-projection-preview-bar {
  flex-shrink: 0;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  min-height: 48px;

  &.expanded {
    height: 240px;
    max-height: 280px;
  }

  .projection-preview-actions {
    position: absolute;
    top: 8px;
    right: 12px;
    z-index: 10;
    gap: 8px;
  }

  .preview-action-btn {
    border-radius: 10px !important;
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
    background: transparent !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.75) !important;
    box-shadow: none !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;

    :deep(.v-btn__overlay),
    :deep(.v-btn__underlay) {
      border-radius: 10px !important;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    &.config-palette-btn {
      background: rgba(var(--v-theme-primary), 0.16) !important;
      color: rgb(var(--v-theme-primary)) !important;

      &:hover {
        background: rgba(var(--v-theme-primary), 0.26) !important;
        color: rgb(var(--v-theme-primary)) !important;
        transform: translateY(-1px);
      }
    }
  }

  .preview-screen-wrapper {
    height: 100%;
    width: 100%;
    padding-top: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sidebar-text);
  }
}

:root[data-theme="light"],
.v-theme--light {
  .bible-version-select-btn {
    background: #ffffff;
    border-color: var(--ds-border, #dee4ec);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    color: var(--ds-text-primary, #30333a);

    .version-btn-icon,
    .version-btn-arrow {
      color: #94a3b8;
    }

    .version-btn-abbr {
      color: var(--ds-text-primary, #30333a);
    }

    &:hover {
      background: #f8fafc;
      border-color: var(--ds-accent, #009be2);

      .version-btn-icon,
      .version-btn-arrow {
        color: var(--ds-accent, #009be2);
      }
    }
  }

  .bible-version-popover {
    background: #ffffff !important;
    border-color: var(--ds-border, #dee4ec) !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;

    .version-item {
      color: var(--ds-text-primary, #30333a);

      &:hover {
        background: rgba(0, 155, 226, 0.08);
      }
    }
  }

  .bible-projection-preview-bar {
    background: #f8fafc;
    border-color: var(--ds-border, #dee4ec);

    .preview-action-btn {
      background: transparent !important;
      border: none !important;
      color: #64748b !important;
      box-shadow: none !important;

      &:hover {
        background: rgba(0, 0, 0, 0.06) !important;
        color: #1e293b !important;
      }

      &.config-palette-btn {
        background: rgba(0, 155, 226, 0.12) !important;
        color: var(--ds-accent, #009be2) !important;

        &:hover {
          background: rgba(0, 155, 226, 0.22) !important;
          color: var(--ds-accent, #009be2) !important;
        }
      }
    }
  }
}
</style>


