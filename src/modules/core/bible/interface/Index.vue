<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />

        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>

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
          <v-menu :close-on-content-click="true" location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="flat"
                rounded="xl"
                class="text-none px-4"
                style="height: 44px; max-width: 350px; background: var(--card-bg); box-shadow: var(--shadow);"
              >
                <div class="d-flex align-center text-truncate w-100" style="color: var(--sidebar-text);">
                  <v-icon size="small" class="mr-3 opacity-70">mdi-book-open-page-variant</v-icon>
                  <span class="text-truncate font-weight-medium text-body-2">
                    {{ versions_list.find(v => v.value === bible.id_bible_version)?.title || 'Selecionar Versão' }}
                  </span>
                  <v-icon size="small" class="ml-3 opacity-50">mdi-menu-down</v-icon>
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
                  v-for="version in versions_list"
                  :key="version.value"
                  :active="version.value === bible.id_bible_version"
                  color="primary"
                  class="mx-2 rounded-lg mb-1"
                  style="min-height: 40px;"
                  @click="bible.id_bible_version = version.value"
                >
                  <div class="d-flex align-center">
                    <span class="text-body-2 font-weight-medium" :class="version.value === bible.id_bible_version ? '' : 'opacity-70'">
                      {{ version.title }}
                    </span>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>

      <div class="content-main d-flex flex-row flex-grow-1" style="overflow: hidden; padding: 24px; min-height: 0; gap: 24px;">
        <div v-if="!compact" class="bible-navigation d-flex flex-row flex-shrink-0" style="width: 40%; min-width: 350px; max-width: 400px; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); min-height: 0;">
          <div class="books-col h-100 d-flex flex-column" style="width: 65%; border-right: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <div class="pa-4 pb-2">
              <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600; line-height: 1;">
                Livros
              </h3>
            </div>
            <div class="px-2 pb-4 flex-grow-1" style="overflow-y: scroll; overflow-x: hidden;">
              <v-skeleton-loader v-if="loading_book" type="list-item@10" />
              <v-list v-else density="compact" class="pa-0 bg-transparent">
                <v-list-item
                  v-for="book in books"
                  :id="`listBook_${book.id_bible_book}`"
                  :key="book.id_bible_book"
                  :active="book.id_bible_book == bible.id_bible_book"
                  color="primary"
                  class="rounded-lg mb-1"
                  :variant="book.id_bible_book == bible.id_bible_book ? 'flat' : 'text'"
                  @click="selBook(book.id_bible_book)"
                >
                  <v-list-item-title class="font-weight-medium">
                    {{ book.name }}
                  </v-list-item-title>
                  <template #append>
                    <span class="text-caption font-weight-bold" :class="book.id_bible_book == bible.id_bible_book ? 'text-white' : 'text-primary'" style="opacity: 0.8">{{ book.abbreviation }}</span>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <div class="chapters-col h-100 d-flex flex-column" style="width: 35%;">
            <div class="pa-4 pb-2">
              <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600; line-height: 1;">
                Cap.
              </h3>
            </div>
            <div class="px-2 pb-4 flex-grow-1" style="overflow-y: scroll; overflow-x: hidden;">
              <v-skeleton-loader v-if="loading_book" type="list-item@10" />
              <div v-else class="d-flex flex-wrap justify-center gap-1">
                <v-btn
                  v-for="chapter in chapters"
                  :id="`listChapter_${chapter}`"
                  :key="chapter"
                  :variant="chapter == bible.chapter ? 'flat' : 'text'"
                  :color="chapter == bible.chapter ? 'primary' : 'default'"
                  class="rounded-lg ma-1 chapter-btn"
                  min-width="44"
                  width="44"
                  height="44"
                  @click="selChapter(chapter)"
                >
                  {{ chapter }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="bible-verses-col d-flex flex-column flex-grow-1" style="background: var(--card-bg, #fff); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); min-height: 0;">
          <div class="pa-4 d-flex justify-space-between align-center" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <h3 class="scriptural-reference-title" style="font-size: 1.3rem; color: var(--sidebar-text); font-weight: 600; line-height: 1;">
              {{ scripturalReference(bible) }}
            </h3>
            
            <div class="d-flex align-center ml-auto" style="gap: 8px;">
              <v-btn
                v-shortkey="['arrowleft']"
                :disabled="!(select_bible?.verses && select_bible.verses.length > 0)"
                variant="tonal"
                size="small"
                icon
                @click="prevVerse()"
                @shortkey="prevVerse()"
              >
                <v-icon>mdi-chevron-left</v-icon>
                <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Voltar Versículo</v-tooltip>
              </v-btn>
              <v-btn
                v-shortkey="['arrowright']"
                :disabled="!(select_bible?.verses && select_bible.verses.length > 0)"
                variant="tonal"
                size="small"
                icon
                @click="nextVerse()"
                @shortkey="nextVerse()"
              >
                <v-icon>mdi-chevron-right</v-icon>
                <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Avançar Versículo</v-tooltip>
              </v-btn>
              <v-btn
                v-shortkey="['del']"
                :disabled="!(select_bible?.verses && select_bible.verses.length > 0)"
                variant="tonal"
                color="error"
                size="small"
                icon
                @click="clean()"
                @shortkey="clean()"
              >
                <v-icon>mdi-eraser</v-icon>
                <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Apagar</v-tooltip>
              </v-btn>
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                icon
                class="mx-1 config-palette-btn"
                @click="showConfigModal = true"
              >
                <v-icon>mdi-palette</v-icon>
                <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Personalizar</v-tooltip>
              </v-btn>
              <v-divider vertical class="mx-2" />
              <LScreenBtn module="bible" />
            </div>
          </div>

          <div class="pa-4 flex-grow-1" style="position: relative; min-height: 0; overflow-y: scroll; overflow-x: hidden;">
            <v-skeleton-loader v-if="loading_book || loading_verses" type="list-item-two-line@5" />
            <v-list v-else class="pa-0 bg-transparent">
              <v-list-item
                v-for="(verse, num) in verses"
                :id="`listVerse_${num}`"
                :key="num"
                :active="bible.verses.includes(+num)"
                color="primary"
                class="rounded-lg mb-2 verse-item"
                :variant="bible.verses.includes(+num) ? 'tonal' : 'text'"
                @click="selVerse($event, num)"
              >
                <div class="d-flex align-start py-2">
                  <v-chip
                    size="small"
                    class="mr-4 mt-1 font-weight-bold"
                    :color="bible.verses.includes(+num) ? 'primary' : 'default'"
                    :variant="bible.verses.includes(+num) ? 'flat' : 'tonal'"
                  >
                    {{ num }}
                  </v-chip>
                  <div class="verse-text" style="font-size: 1.15rem; line-height: 1.6; color: var(--sidebar-text);" v-html="verse" />
                </div>
              </v-list-item>
            </v-list>
          </div>

          <div style="height: 220px; flex-shrink: 0; background: #000;">
            <Screen />
          </div>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>

  <ConfigModal v-if="!loading" v-model="showConfigModal" />
</template>

<script>
import manifest from "../manifest.json";
import LWindow from "@/components/Window.vue";
import Screen from "../components/Screen.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "../components/ConfigModal.vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default {
  name: "CollectionsModule",
  components: {
    LWindow,
    Screen,
    LScreenBtn,
    ConfigModal,
    MenuToggleButton,
  },
  data: () => ({
    lang: null,
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
    },
    select_bible: {
      id_bible_version: null,
      id_bible_book: null,
      version: null,
      book: null,
      chapter: null,
      verses: [],
      scriptural_reference: null,
      text: null,
    },
    versions: [],
    books: [],
    verses: [],
    last_verse: 1,
    last_bible_file: null,
    showConfigModal: false,
  }),
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    show() {
      return this.module.show;
    },

    book() {
      return this.books.find(
        (b) => b.id_bible_book == this.bible.id_bible_book,
      );
    },
    version() {
      return this.versions.find(
        (b) => b.id_bible_version == this.bible.id_bible_version,
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
        title: `${version.abbreviation  } - ${  version.name}`,
        value: version.id_bible_version,
      }));
    },
    compact() {
      return this.$vuetify.display.width <= 750;
    },
    super_compact() {
      return this.$vuetify.display.width <= 400;
    },
  },
  watch: {
    async show() {
      if (this.show && this.lang != this.$i18n.locale) {
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
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    send(param, value) {
      this.$appdata.set(`modules.${this.module_id}.data.${param}`, value);
    },
    async loadData() {
      this.loading = true;

      if (this.books.length <= 0) {
        this.loading_book = true;
        this.books = await this.$database.get(
          `${this.$i18n.locale}_bible_book`,
        );
        if (!this.bible.id_bible_book) {
          await this.selBook(this.books[0].id_bible_book);
        }
        this.loading_book = false;
      }

      if (this.versions.length <= 0) {
        this.versions = await this.$database.get(
          `${this.$i18n.locale}_bible_version`,
        );
        if (!this.bible.id_bible_version) {
          await this.selVersion(this.versions[0].id_bible_version);
        }
      }

      const bible_file = `bible_${this.bible.id_bible_version}_${this.bible.id_bible_book}_${this.bible.chapter}`;
      if (bible_file != this.last_bible_file) {
        this.loading_verses = true;
        this.verses = {};
        this.verses = await this.$database.get(bible_file);
        this.last_bible_file = bible_file;
        this.loading_verses = false;
      }

      if (
        this.select_bible.id_bible_book == this.bible.id_bible_book &&
        this.select_bible.chapter == this.bible.chapter &&
        this.select_bible.id_bible_version == this.bible.id_bible_version
      ) {
        this.bible.verses = this.select_bible.verses;
      }

      this.lang = this.$i18n.locale;
      this.loading = false;
    },
    resize(data) {
      this.width = data.container_width;
      this.height = data.container_height;
    },

    async selVersion(id_bible_version) {
      if (id_bible_version) {
        this.bible.id_bible_version = id_bible_version;
      }
      this.bible.version = this.version?.abbreviation;
      this.bible.verses = [];
      this.last_verse = 1;
      await this.loadData();
    },
    async selBook(id_bible_book) {
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
    async selChapter(chapter) {
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
    async selVerse(event, num) {
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
      this.bible.verses.sort((a, b) => a - b);
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
          ...this.select_bible.verses.filter((num) => num > 0),
        );
        if (verse > 1) {
          verse--;
        } else if (this.select_bible.chapter > 1) {
          await this.selChapter(this.select_bible.chapter - 1);
          verse = Math.max(...Object.keys(this.verses).map(Number));
        } else {
          const bookIndex = this.books.findIndex(
            (b) => b.id_bible_book == this.bible.id_bible_book,
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
            (b) => b.id_bible_book == this.bible.id_bible_book,
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
    numbersInterval(numbers) {
      if (!numbers || numbers.length === 0) return "";

      numbers.sort((a, b) => a - b);

      const result = [];
      let start = numbers[0];
      let end = numbers[0];

      for (let i = 1; i <= numbers.length; i++) {
        if (numbers[i] === end + 1) {
          end = numbers[i];
        } else {
          if (start === end) {
            result.push(`${start}`);
          } else {
            result.push(`${start}-${end}`);
          }
          start = numbers[i];
          end = numbers[i];
        }
      }

      return result.join(", ");
    },
    scripturalReference(data) {
      const verses_interval = this.numbersInterval(data.verses);

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

    getSelectedVerses(keys) {
      keys.sort((a, b) => a - b);
      let result = "";
      let previousKey = null;

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
};
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
  .config-palette-btn {
    display: none !important;
  }
}
</style>
