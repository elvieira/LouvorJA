<template>
  <div class="rich-text-editor d-flex flex-column h-100">
    <div
      ref="editor"
      class="editor-content flex-grow-1 pa-4"
      contenteditable="true"
      @input="onInput"
      @blur="$emit('blur')"
    />

    <div class="editor-toolbar d-flex flex-column mb-6" style="border-top: 1px solid var(--border-color, rgba(0,0,0,0.05)); border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
      <!-- Linha 1: Fontes e Cores -->
      <div class="d-flex align-center px-2 py-2 w-100" style="gap: 8px;">
        <v-select
          v-model="selectedFont"
          :items="fonts"
          density="compact"
          variant="solo"
          flat
          bg-color="rgba(150, 150, 150, 0.1)"
          style="border: 1px solid var(--border-color, rgba(0,0,0,0.05)); border-radius: 24px;"
          rounded
          hide-details
          class="toolbar-select flex-grow-1"
          :menu-props="{ contentClass: 'elevation-3 rounded-lg' }"
          @update:model-value="exec('fontName', selectedFont)"
        >
          <template #item="{ props }">
            <v-list-item
              v-bind="props"
              color="primary"
              class="mx-2 rounded-lg mb-1 text-body-2 font-weight-medium"
              style="min-height: 40px;"
            />
          </template>
        </v-select>

        <v-divider vertical class="mx-1 h-auto py-2" />

        <v-select
          v-model="selectedSize"
          :items="sizes"
          density="compact"
          variant="solo"
          flat
          bg-color="rgba(150, 150, 150, 0.1)"
          style="border: 1px solid var(--border-color, rgba(0,0,0,0.05)); border-radius: 24px; max-width: 120px;"
          rounded
          hide-details
          class="toolbar-select"
          :menu-props="{ contentClass: 'elevation-3 rounded-lg' }"
          @update:model-value="exec('fontSize', selectedSize)"
        >
          <template #item="{ props }">
            <v-list-item
              v-bind="props"
              color="primary"
              class="mx-2 rounded-lg mb-1 text-body-2 font-weight-medium"
              style="min-height: 40px;"
            />
          </template>
        </v-select>

        <v-divider vertical class="mx-1 h-auto py-2" />

        <ModernColorPicker :model-value="selectedColor" @update:model-value="(color) => { selectedColor = color; exec('foreColor', color, false); }">
          <template #activator="{ props }">
            <v-btn
              icon
              size="small"
              variant="text"
              v-bind="props"
            >
              <div class="d-flex flex-column align-center justify-center pt-1">
                <span class="font-weight-bold" style="font-size: 15px; line-height: 1;">A</span>
                <div :style="{ backgroundColor: selectedColor, height: '4px', width: '16px', marginTop: '2px', borderRadius: '2px' }" />
              </div>
              <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
                Cor do Texto
              </v-tooltip>
            </v-btn>
          </template>
        </ModernColorPicker>
      </div>

      <div class="w-100" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));" />

      <!-- Linha 2: Ferramentas de Formatação -->
      <div class="d-flex align-center px-2 pt-1 pb-2 w-100 justify-space-between">
        <div class="d-flex align-center" style="gap: 2px;">
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('bold')"
          >
            <v-icon size="16">
              mdi-format-bold
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Negrito
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('italic')"
          >
            <v-icon size="16">
              mdi-format-italic
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Itálico
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('underline')"
          >
            <v-icon size="16">
              mdi-format-underline
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Sublinhado
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('strikeThrough')"
          >
            <v-icon size="16">
              mdi-format-strikethrough
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Riscado
            </v-tooltip>
          </v-btn>
        </div>

        <v-divider vertical class="mx-1 h-auto py-2" />

        <div class="d-flex align-center" style="gap: 2px;">
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('justifyLeft')"
          >
            <v-icon size="16">
              mdi-format-align-left
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Alinhar à Esquerda
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('justifyCenter')"
          >
            <v-icon size="16">
              mdi-format-align-center
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Centralizar
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('justifyRight')"
          >
            <v-icon size="16">
              mdi-format-align-right
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Alinhar à Direita
            </v-tooltip>
          </v-btn>
        </div>

        <v-spacer />

        <v-divider vertical class="mx-2 h-auto py-2" />

        <div class="d-flex align-center" style="gap: 2px;">
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="exec('removeFormat')"
          >
            <v-icon size="16">
              mdi-format-clear
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Limpar Formatação
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="clearText"
          >
            <v-icon size="16">
              mdi-delete-sweep-outline
            </v-icon>
            <v-tooltip activator="parent" location="top" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">
              Apagar Tudo
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";

export default {
  name: "RichTextEditor",
  components: {
    ModernColorPicker,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "blur"],
  data() {
    return {
      selectedFont: "Arial",
      fonts: ["Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Impact", "Comic Sans MS"],
      selectedSize: "3",
      sizes: [
        { title: "Pequeno (1)", value: "1" },
        { title: "Normal (3)", value: "3" },
        { title: "Médio (4)", value: "4" },
        { title: "Grande (5)", value: "5" },
        { title: "Extra (6)", value: "6" },
        { title: "Gigante (7)", value: "7" },
      ],
      selectedColor: "#000000",
      isUpdating: false,
      savedRange: null,
    };
  },
  watch: {
    modelValue(val) {
      if (!this.isUpdating && this.$refs.editor) {
        this.$refs.editor.innerHTML = val || "";
      }
    },
  },
  mounted() {
    if (this.$refs.editor) {
      this.$refs.editor.innerHTML = this.modelValue || "";
    }
    document.addEventListener("selectionchange", this.handleSelectionChange);
  },
  beforeUnmount() {
    document.removeEventListener("selectionchange", this.handleSelectionChange);
  },
  methods: {
    handleSelectionChange() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (this.$refs.editor && this.$refs.editor.contains(range.commonAncestorContainer)) {
          this.savedRange = range;
        }
      }
    },
    restoreSelection() {
      if (this.savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
      }
    },
    exec(command, value = null, focusAfter = true) {
      this.restoreSelection();
      document.execCommand(command, false, value);
      if (focusAfter) {
        this.$refs.editor.focus();
      }
      this.onInput();
    },
    clearText() {
      if (this.$refs.editor) {
        this.$refs.editor.innerHTML = "";
        this.onInput();
      }
    },
    onInput() {
      this.isUpdating = true;
      this.$emit("update:modelValue", this.$refs.editor.innerHTML);
      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },
  },
};
</script>

<style scoped>
.rich-text-editor {
  background: transparent;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  background: rgba(var(--v-theme-surface), 0.5);
}

.editor-content {
  color: var(--sidebar-text);
  font-size: 1rem;
  overflow-y: auto;
  outline: none;
  min-height: 100px;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: var(--sidebar-text-secondary);
  pointer-events: none;
  display: block; /* For Firefox */
}

.toolbar-select :deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 32px !important;
  font-size: 0.85rem !important;
  font-weight: 500;
}
</style>
