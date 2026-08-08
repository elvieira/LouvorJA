<template>
  <v-dialog
    v-model="internalValue"
    max-width="500"
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper quick-search-modal"
    attach=".bg-main"
    transition="fade-transition"
    @keydown.esc="internalValue = false"
  >
    <v-card class="modern-alert-card rounded-xl overflow-hidden pa-6" style="background: var(--card-bg); position: relative; text-align: center; min-height: 350px;">
      <!-- Botão fechar (opcional, igual ao da imagem) -->
      <v-btn
        icon
        size="small"
        variant="text"
        color="grey"
        class="position-absolute"
        style="top: 12px; right: 12px;"
        @click="internalValue = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <!-- Stepper Indicator -->
      <div class="d-flex align-center justify-center mb-8" style="gap: 16px; margin-top: 16px;">
        <div class="d-flex align-center" :class="{ 'opacity-50': step !== 1 }">
          <v-avatar
            size="24"
            :color="step === 1 ? 'primary' : 'grey-darken-2'"
            class="mr-2 text-white font-weight-bold"
            style="font-size: 12px;"
          >
            1
          </v-avatar>
          <span class="font-weight-medium" :class="step === 1 ? 'text-primary' : 'text-grey'">Livro</span>
        </div>
        <v-icon size="small" class="text-grey">
          mdi-arrow-right
        </v-icon>
        
        <div class="d-flex align-center" :class="{ 'opacity-50': step !== 2 }">
          <v-avatar
            size="24"
            :color="step === 2 ? 'primary' : 'grey-darken-2'"
            class="mr-2 text-white font-weight-bold"
            style="font-size: 12px;"
          >
            2
          </v-avatar>
          <span class="font-weight-medium" :class="step === 2 ? 'text-primary' : 'text-grey'">Capítulo</span>
        </div>
        <v-icon size="small" class="text-grey">
          mdi-arrow-right
        </v-icon>

        <div class="d-flex align-center" :class="{ 'opacity-50': step !== 3 }">
          <v-avatar
            size="24"
            :color="step === 3 ? 'primary' : 'grey-darken-2'"
            class="mr-2 text-white font-weight-bold"
            style="font-size: 12px;"
          >
            3
          </v-avatar>
          <span class="font-weight-medium" :class="step === 3 ? 'text-primary' : 'text-grey'">Versículo</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-grow-1 d-flex flex-column align-center justify-center pt-4" @click="focusInput">
        <h3 class="text-body-1 text-grey-darken-1 mb-8" style="font-weight: 500;">
          {{ instructionText }}
        </h3>

        <!-- Hidden input for mobile / proper focus -->
        <input 
          ref="hiddenInput"
          v-model="inputValue"
          type="text"
          class="hidden-input"
          @keydown.enter="confirmStep"
          @keydown.space.prevent="confirmStep"
          @keydown.delete="handleBackspace"
        />

        <!-- Fake Large Input Display -->
        <div class="display-input text-h2 font-weight-bold mb-6" style="color: var(--sidebar-text); min-height: 72px;">
          {{ inputValue }}<span class="cursor-blink">|</span>
        </div>

        <!-- Suggestion / Validation area -->
        <div class="suggestion-area" style="min-height: 48px;">
          <template v-if="step === 1">
            <h2 v-if="matchedBook" class="text-h5 font-weight-bold text-primary mb-1">
              {{ matchedBook.name }}
            </h2>
            <p v-else-if="suggestedBooks.length > 0" class="text-body-1 font-weight-medium" style="color: var(--sidebar-text);">
              {{ suggestedBooks.map(b => b.abbreviation).join(', ') }}
            </p>
            <p class="text-caption text-grey mt-2">
              Ex: gn para Gênesis
            </p>
          </template>
          <template v-else-if="step === 2">
            <h2 v-if="book" class="text-h5 font-weight-bold text-primary mb-1">
              {{ book.name }} <v-icon size="small" class="mx-1">
                mdi-arrow-right
              </v-icon> cap. {{ inputValue || '?' }}
            </h2>
            <p class="text-caption text-grey mt-2">
              Espaço ou Enter confirmam • Backspace volta
            </p>
          </template>
          <template v-else-if="step === 3">
            <h2 v-if="book && chapter" class="text-h5 font-weight-bold text-primary mb-1">
              {{ book.name }} {{ chapter }}:{{ inputValue || '?' }}
            </h2>
            <p v-if="verseError" class="text-caption font-weight-bold mt-2" style="color: #ff5252;">
              {{ verseError }}
            </p>
            <p v-else class="text-caption text-grey mt-2">
              Enter projeta • Backspace volta
            </p>
          </template>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, getCurrentInstance } from "vue";
import { usePopup } from "@/composables/useHelpers";
import { parseVerseSearchQuery } from "@/modules/core/app/bible/interface/bibleHelpers";

export default defineComponent({
  name: "BibleQuickSearchModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance() as any;
    const internalValue = ref(props.modelValue);
    const popupHelper = usePopup();
    
    const step = ref(1); // 1: Book, 2: Chapter, 3: Verse
    const inputValue = ref("");
    const hiddenInput = ref<HTMLInputElement | null>(null);
    
    const books = ref<any[]>([]);
    
    // Selections
    const book = ref<any>(null);
    const chapter = ref<number | null>(null);
    const verse = ref<string>("");
    
    const verseError = ref("");
    const chapterVerses = ref<any>(null);

    const instructionText = computed(() => {
      if (step.value === 1) return "Digite a abreviação do livro";
      if (step.value === 2) return "Digite o número do capítulo";
      if (step.value === 3) return "Digite o número do versículo";
      return "";
    });

    const getCleanString = (str: string) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    };

    const suggestedBooks = computed(() => {
      if (!inputValue.value || step.value !== 1) return [];
      const val = getCleanString(inputValue.value);
      return books.value.filter(b => {
        const abv = getCleanString(b.abbreviation);
        const name = getCleanString(b.name);
        return abv.startsWith(val) || name.startsWith(val);
      }).slice(0, 5); // top 5
    });

    const matchedBook = computed(() => {
      if (!inputValue.value || step.value !== 1) return null;
      const val = getCleanString(inputValue.value);
      
      // Exact abbreviation match
      const exactAbv = books.value.find(b => getCleanString(b.abbreviation) === val);
      if (exactAbv) return exactAbv;
      
      // If only 1 suggestion
      if (suggestedBooks.value.length === 1) return suggestedBooks.value[0];
      
      return null;
    });

    const loadBooks = async () => {
      if (books.value.length === 0) {
        const locale = proxy.$i18n?.locale || "pt";
        const res = await proxy.$database?.get(`${locale}_bible_book`);
        if (res) books.value = res;
      }
    };

    const focusInput = () => {
      nextTick(() => {
        if (hiddenInput.value) {
          hiddenInput.value.focus();
        }
      });
    };

    const reset = () => {
      step.value = 1;
      inputValue.value = "";
      book.value = null;
      chapter.value = null;
      verse.value = "";
      verseError.value = "";
      chapterVerses.value = null;
    };

    const loadChapterVerses = async () => {
      try {
        const locale = proxy.$i18n?.locale || "pt";
        
        const versions = await proxy.$database?.get(`${locale}_bible_version`);
        let versionId = null;
        if (versions && versions.length > 0) {
          const savedVersion = proxy.$userdata.get("modules.bible.selected_version");
          if (savedVersion && versions.find((v: any) => v.id_bible_version === savedVersion)) {
            versionId = savedVersion;
          } else {
            const ara = versions.find((v: any) => v.abbreviation === "ARA" || v.name === "ARA");
            versionId = ara ? ara.id_bible_version : versions[0].id_bible_version;
          }
        }
        
        if (versionId && book.value && chapter.value) {
          const file = `bible_${versionId}_${book.value.id_bible_book}_${chapter.value}`;
          chapterVerses.value = await proxy.$database?.get(file);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const confirmStep = async () => {
      if (step.value === 1) {
        if (matchedBook.value) {
          book.value = matchedBook.value;
          step.value = 2;
          inputValue.value = "";
        } else if (suggestedBooks.value.length > 0) {
          book.value = suggestedBooks.value[0];
          step.value = 2;
          inputValue.value = "";
        }
      } else if (step.value === 2) {
        if (inputValue.value && !isNaN(Number(inputValue.value))) {
          let c = Number(inputValue.value);
          if (book.value && c > book.value.chapters) c = book.value.chapters;
          if (c < 1) c = 1;
          
          chapter.value = c;
          step.value = 3;
          inputValue.value = "";
          verseError.value = "";
          await loadChapterVerses();
        }
      } else if (step.value === 3) {
        if (inputValue.value) {
          if (chapterVerses.value) {
            const versesArray = parseVerseSearchQuery(inputValue.value, chapterVerses.value);
            if (versesArray.length === 0) {
              verseError.value = "Versículo não encontrado.";
              return;
            }
          }
          verse.value = inputValue.value;
          verseError.value = "";
          projectVerse();
        }
      }
    };

    const handleBackspace = (e: KeyboardEvent) => {
      if (inputValue.value === "") {
        if (step.value === 3) {
          step.value = 2;
          inputValue.value = String(chapter.value || "");
          chapter.value = null;
          verseError.value = "";
          chapterVerses.value = null;
          e.preventDefault();
        } else if (step.value === 2) {
          step.value = 1;
          inputValue.value = book.value ? book.value.abbreviation : "";
          book.value = null;
          e.preventDefault();
        }
      }
    };

    const projectVerse = () => {
      if (!book.value || !chapter.value || !verse.value) return;
      
      const appdata = proxy.$appdata;
      const modules = proxy.$modules;

      if (appdata && popupHelper) {
        appdata.set("modules.bible.data.navigate", {
          bookId: book.value.id_bible_book,
          chapter: chapter.value,
          verses: verse.value,
        });
        
        modules.open("bible");

        setTimeout(() => {
          let selectedMonitors: any[] = [];
          if ((window as any).electronAPI && (window as any).electronAPI.getDisplays) {
            (window as any).electronAPI.getDisplays().then((displays: any) => {
              if (displays && displays.length > 1) {
                let configMonitors = proxy.$userdata.get("modules.config.slide_monitor");
                if (!Array.isArray(configMonitors)) {
                  configMonitors = configMonitors ? [configMonitors] : [];
                }
                const primary = displays.find((d: any) => d.isPrimary) || displays[0];
                selectedMonitors = configMonitors.filter((m: any) => m !== primary.id);
              }
              
              if (selectedMonitors.length > 0) {
                popupHelper.syncMonitors(selectedMonitors, "bible", true);
              } else {
                const fullscreen = proxy.$userdata.get("modules.config.slide_fullscreen") !== false;
                popupHelper.open({ module: "bible", fullscreen });
              }
            });
          } else {
            const fullscreen = proxy.$userdata.get("modules.config.slide_fullscreen") !== false;
            popupHelper.open({ module: "bible", fullscreen });
          }
        }, 150);
      }

      internalValue.value = false;
    };

    watch(() => props.modelValue, (newVal) => {
      internalValue.value = newVal;
      if (newVal) {
        reset();
        loadBooks();
        setTimeout(focusInput, 100);
      }
    });

    watch(internalValue, (newVal) => {
      emit("update:modelValue", newVal);
    });

    watch(inputValue, () => {
      if (verseError.value) verseError.value = "";
    });

    return {
      internalValue,
      step,
      inputValue,
      hiddenInput,
      book,
      chapter,
      verse,
      verseError,
      instructionText,
      suggestedBooks,
      matchedBook,
      focusInput,
      confirmStep,
      handleBackspace,
    };
  },
});
</script>

<style scoped>
.hidden-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;
  z-index: -1;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
  color: var(--primary-color, #1976D2);
  font-weight: 300;
  opacity: 0.8;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.display-input {
  cursor: text;
  display: inline-block;
  min-width: 50px;
}
</style>
