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
          @keydown.enter="confirmStep(false)"
          @keydown.space.prevent="confirmStep(false)"
          @keydown.p.prevent="handlePKey"
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
            <div class="text-caption text-grey mt-6 d-flex align-center justify-center flex-wrap">
              <span class="kbd-key mx-1">ESC</span> para sair
              <span class="mx-2 opacity-50">|</span>
              <span class="kbd-key mx-1">ESPAÇO/ENTER</span> para confirmar
            </div>
          </template>
          <template v-else-if="step === 2">
            <h2 v-if="book" class="text-h5 font-weight-bold text-primary mb-1">
              {{ book.name }} <v-icon size="small" class="mx-1">
                mdi-arrow-right
              </v-icon> cap. {{ inputValue || '?' }}
            </h2>
            <div class="text-caption text-grey mt-6 d-flex align-center justify-center flex-wrap">
              <span class="kbd-key mx-1">ESC</span> para sair
              <span class="mx-2 opacity-50">|</span>
              <span class="kbd-key mx-1">ESPAÇO/ENTER</span> para confirmar
              <span class="mx-2 opacity-50">|</span>
              <span class="kbd-key mx-1">BACKSPACE</span> para voltar
            </div>
          </template>
          <template v-else-if="step === 3">
            <h2 v-if="book && chapter" class="text-h5 font-weight-bold text-primary mb-1">
              {{ book.name }} {{ chapter }}:{{ inputValue || '?' }}
            </h2>
            <p v-if="verseError" class="text-caption font-weight-bold mt-2" style="color: #ff5252;">
              {{ verseError }}
            </p>
            <div v-else class="text-caption text-grey mt-6 d-flex align-center justify-center flex-wrap">
              <span class="kbd-key mx-1">ESC</span> para sair
              <span class="mx-2 opacity-50">|</span>
              
              <template v-if="bibleConfig.projWithP">
                <span class="kbd-key mx-1">ESPAÇO/ENTER</span> para abrir
                <span class="mx-2 opacity-50">|</span>
                <span class="kbd-key mx-1">P</span> para projetar
              </template>
              <template v-else-if="bibleConfig.autoProjQuick !== false">
                <span class="kbd-key mx-1">ESPAÇO/ENTER</span> para projetar
              </template>
              <template v-else>
                <span class="kbd-key mx-1">ESPAÇO/ENTER</span> para abrir
              </template>
              
              <span class="mx-2 opacity-50">|</span>
              <span class="kbd-key mx-1">BACKSPACE</span> para voltar
            </div>
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
      if (step.value === 1) return "Digite o nome ou a abreviação do livro";
      if (step.value === 2) return "Digite o número do capítulo";
      if (step.value === 3) return "Digite o número do versículo";
      return "";
    });

    const bibleConfig = computed(() => {
      return proxy.$appdata?.get("modules.bible.config") || proxy.$userdata?.get("bible_config") || {};
    });

    const getCleanString = (str: string) => {
      if (!str) return "";
      let clean = str.toLowerCase().trim();
      
      // Casos especiais para abreviaturas idênticas que perdem a distinção ao remover acentos
      if (clean === "jó") return "job_book";
      if (clean === "jo") return "joao_book";
      
      clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
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
      
      // Exact abbreviation or name match
      const exactAbv = books.value.find(b => getCleanString(b.abbreviation) === val || getCleanString(b.name) === val);
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

    const confirmStep = async (forceProject: boolean = false) => {
      if (step.value === 1) {
        if (matchedBook.value) {
          book.value = matchedBook.value;
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
          projectVerse(forceProject);
        }
      }
    };

    const handlePKey = (_e: KeyboardEvent) => {
      const config = bibleConfig.value;
      if (config.projWithP !== false && step.value === 3 && inputValue.value) {
        confirmStep(true);
      } else {
        // If not in step 3 or the shortcut is disabled, allow normal typing
        inputValue.value += "p";
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

    const projectVerse = (forceProject: boolean = false) => {
      if (!book.value || !chapter.value || !verse.value) return;
      
      const appdata = proxy.$appdata;
      const modules = proxy.$modules;
      const config = bibleConfig.value;

      let shouldProject = true;
      if (config.projWithP) {
        shouldProject = forceProject;
      } else {
        // Fallback to the specific setting (autoProjQuick is true by default)
        shouldProject = forceProject || config.autoProjQuick !== false;
      }

      if (appdata && popupHelper) {
        appdata.set("modules.bible.data.navigate", {
          bookId: book.value.id_bible_book,
          chapter: chapter.value,
          verses: verse.value,
        });
        
        // Evita que a barra de pesquisa roube o foco 300ms após o componente montar
        appdata.set("prevent_bible_focus", true);
        
        modules.open("bible");

        if (shouldProject) {
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

    watch(inputValue, (newVal) => {
      if (verseError.value) verseError.value = "";

      if (!newVal) return;

      if (step.value === 1) {
        // Passo 1: Apenas letras, e números 1, 2, 3 apenas no primeiro caractere.
        // Bloqueia espaços, símbolos e números no meio da string.
        let cleanVal = newVal.replace(/[^1-3A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
        cleanVal = cleanVal.replace(/(?!^)[1-3]/g, "");
        if (newVal !== cleanVal) {
          inputValue.value = cleanVal;
        }
      } else if (step.value === 2) {
        // Passo 2: Apenas números
        const cleanVal = newVal.replace(/[^0-9]/g, "");
        if (newVal !== cleanVal) {
          inputValue.value = cleanVal;
        }
      } else if (step.value === 3) {
        // Passo 3: Apenas números, vírgulas e traços
        const cleanVal = newVal.replace(/[^0-9,-]/g, "");
        if (newVal !== cleanVal) {
          inputValue.value = cleanVal;
        }
      }
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
      bibleConfig,
      suggestedBooks,
      matchedBook,
      focusInput,
      confirmStep,
      handlePKey,
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

.kbd-key {
  display: inline-block;
  padding: 3px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--sidebar-text-secondary);
  background-color: rgba(150, 150, 150, 0.1);
  border: 1px solid rgba(150, 150, 150, 0.2);
  border-radius: 4px;
  vertical-align: middle;
  text-transform: uppercase;
}
</style>
