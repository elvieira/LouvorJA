<template>
  <div class="rich-text-editor d-flex flex-column h-100">
    <div
      ref="editor"
      class="editor-content flex-grow-1 pa-4"
      contenteditable="true"
      @input="onInput"
      @blur="$emit('blur')"
    />

    <div class="editor-toolbar d-flex flex-column">
      <!-- Linha 1: Fontes e Cores -->
      <div class="d-flex align-center w-100" style="gap: 8px;">
        <v-select
          v-model="selectedFont"
          :items="fonts"
          density="compact"
          variant="outlined"
          color="primary"
          rounded="lg"
          hide-details
          class="toolbar-select font-select flex-grow-1"
          :menu-props="{ contentClass: 'editor-select-menu', transition: 'fade-transition', offset: 4 }"
          @update:model-value="exec('fontName', selectedFont)"
        >
          <template #item="{ item, props }">
            <v-list-item
              v-bind="props"
              :title="item.title"
              :style="{ fontFamily: item.value }"
            />
          </template>
        </v-select>

        <v-select
          v-model="selectedSize"
          :items="sizes"
          item-title="title"
          item-value="value"
          density="compact"
          variant="outlined"
          color="primary"
          rounded="lg"
          hide-details
          class="toolbar-select size-select"
          :menu-props="{ contentClass: 'editor-select-menu', transition: 'fade-transition', offset: 4 }"
          @update:model-value="exec('fontSize', selectedSize)"
        >
          <template #item="{ item, props }">
            <v-list-item
              v-bind="props"
              :title="item.title"
            />
          </template>
        </v-select>

        <ModernColorPicker :model-value="selectedColor" @update:model-value="(color) => { selectedColor = color; exec('foreColor', color, false); }">
          <template #activator="{ props: pickerProps }">
            <button
              type="button"
              class="toolbar-color-btn"
              v-bind="pickerProps"
            >
              <div class="d-flex flex-column align-center justify-center">
                <span class="color-letter font-weight-bold">A</span>
                <div class="color-bar" :style="{ backgroundColor: selectedColor }" />
              </div>
              <v-tooltip activator="parent" location="top" open-delay="300">
                {{ t('richtext.text_color') }}
              </v-tooltip>
            </button>
          </template>
        </ModernColorPicker>
      </div>

      <!-- Linha 2: Ferramentas de Formatação em Grupos -->
      <div class="d-flex align-center w-100 justify-space-between mt-1">
        <!-- Grupo Estilos de Texto -->
        <div class="toolbar-btn-group d-flex align-center">
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.bold }"
            @click="exec('bold')"
          >
            <v-icon size="17">
              mdi-format-bold
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.bold') }}
            </v-tooltip>
          </button>
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.italic }"
            @click="exec('italic')"
          >
            <v-icon size="17">
              mdi-format-italic
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.italic') }}
            </v-tooltip>
          </button>
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.underline }"
            @click="exec('underline')"
          >
            <v-icon size="17">
              mdi-format-underline
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.underline') }}
            </v-tooltip>
          </button>
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.strikeThrough }"
            @click="exec('strikeThrough')"
          >
            <v-icon size="17">
              mdi-format-strikethrough
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.strikethrough') }}
            </v-tooltip>
          </button>
        </div>

        <!-- Grupo Alinhamento -->
        <div class="toolbar-btn-group d-flex align-center">
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.justifyLeft }"
            @click="exec('justifyLeft')"
          >
            <v-icon size="17">
              mdi-format-align-left
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.align_left') }}
            </v-tooltip>
          </button>
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.justifyCenter }"
            @click="exec('justifyCenter')"
          >
            <v-icon size="17">
              mdi-format-align-center
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.align_center') }}
            </v-tooltip>
          </button>
          <button
            type="button"
            class="toolbar-action-btn"
            :class="{ active: activeFormats.justifyRight }"
            @click="exec('justifyRight')"
          >
            <v-icon size="17">
              mdi-format-align-right
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.align_right') }}
            </v-tooltip>
          </button>
        </div>

        <!-- Grupo Limpeza / Ações -->
        <div class="toolbar-btn-group d-flex align-center">
          <button
            type="button"
            class="toolbar-action-btn"
            @click="exec('removeFormat')"
          >
            <v-icon size="17">
              mdi-format-clear
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('richtext.clear_format') }}
            </v-tooltip>
          </button>
          <button
            type="button"
            class="toolbar-action-btn btn-danger"
            @click="clearText"
          >
            <v-icon size="17">
              mdi-delete-sweep-outline
            </v-icon>
            <v-tooltip activator="parent" location="top" open-delay="300">
              {{ t('actions.clear_all') || 'Apagar Tudo' }}
            </v-tooltip>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";

export default defineComponent({
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
      selectedFont: "Arial" as string,
      fonts: ["Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Impact", "Comic Sans MS"] as string[],
      selectedSize: "3" as string,

      selectedColor: "#000000" as string,
      isUpdating: false as boolean,
      savedRange: null as Range | null,
      activeFormats: {
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
      } as Record<string, boolean>,
    };
  },
  computed: {
    sizes(): {title: string, value: string}[] {
      return [
        { title: this.t("richtext.size_small"), value: "1" },
        { title: this.t("richtext.size_normal"), value: "3" },
        { title: this.t("richtext.size_medium"), value: "4" },
        { title: this.t("richtext.size_large"), value: "5" },
        { title: this.t("richtext.size_extra"), value: "6" },
        { title: this.t("richtext.size_giant"), value: "7" },
      ];
    },
  },
  watch: {
    modelValue(val) {
      if (!this.isUpdating && this.$refs.editor) {
        (this.$refs.editor as HTMLElement).innerHTML = val || "";
      }
    },
  },
  mounted() {
    if (this.$refs.editor) {
      (this.$refs.editor as HTMLElement).innerHTML = this.modelValue || "";
    }
    document.addEventListener("selectionchange", this.handleSelectionChange);
  },
  beforeUnmount() {
    document.removeEventListener("selectionchange", this.handleSelectionChange);
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    handleSelectionChange() {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (this.$refs.editor && (this.$refs.editor as HTMLElement).contains(range.commonAncestorContainer)) {
          this.savedRange = range;
          
          try {
            this.activeFormats.bold = document.queryCommandState("bold");
            this.activeFormats.italic = document.queryCommandState("italic");
            this.activeFormats.underline = document.queryCommandState("underline");
            this.activeFormats.strikeThrough = document.queryCommandState("strikeThrough");
            this.activeFormats.justifyLeft = document.queryCommandState("justifyLeft");
            this.activeFormats.justifyCenter = document.queryCommandState("justifyCenter");
            this.activeFormats.justifyRight = document.queryCommandState("justifyRight");
            
            const font = document.queryCommandValue("fontName");
            if (font) this.selectedFont = font.replace(/['"]/g, "");
            
            const size = document.queryCommandValue("fontSize");
            if (size) this.selectedSize = size;
          } catch (e) {
            // queryCommandState pode falhar em alguns contextos, ignora
          }
        } else {
          Object.keys(this.activeFormats).forEach(k => this.activeFormats[k] = false);
        }
      }
    },
    restoreSelection() {
      if (this.savedRange) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(this.savedRange);
        }
      }
    },
    exec(command: string, value: string | null = null, focusAfter = true) {
      this.restoreSelection();
      document.execCommand(command, false, value as string);
      if (focusAfter && this.$refs.editor) {
        (this.$refs.editor as HTMLElement).focus();
      }
      this.onInput();
    },
    clearText() {
      if (this.$refs.editor) {
        (this.$refs.editor as HTMLElement).innerHTML = "";
        this.onInput();
      }
    },
    onInput() {
      this.isUpdating = true;
      if (this.$refs.editor) {
        this.$emit("update:modelValue", (this.$refs.editor as HTMLElement).innerHTML);
      }
      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },
  },
});
</script>

<!-- Unscoped styles for the dropdown menus teleported to overlay -->
<style lang="scss">
.editor-select-menu {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12)) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  padding: 4px !important;

  .v-list {
    background: transparent !important;
    padding: 0 !important;
    max-height: 220px !important;
    overflow-y: auto !important;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent-blue, #009FE3);
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover,
    &::-webkit-scrollbar-thumb:active {
      background: var(--accent-yellow, #FFC107);
    }
  }

  .v-list-item {
    border-radius: 8px !important;
    min-height: 34px !important;
    padding: 6px 12px !important;
    margin: 2px 0 !important;
    font-size: 0.84rem !important;
    color: var(--sidebar-text-secondary, #94a3b8) !important;
    transition: all 0.15s ease !important;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.08) !important;
      color: var(--sidebar-text, #ffffff) !important;
    }

    &--active {
      background: rgba(0, 159, 227, 0.15) !important;
      color: rgb(var(--v-theme-primary)) !important;
      font-weight: 600 !important;
    }
  }
}

:root[data-theme="light"] .editor-select-menu,
.v-theme--light .editor-select-menu {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15) !important;

  .v-list-item {
    color: #475569 !important;

    &:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }

    &--active {
      background: rgba(0, 159, 227, 0.12) !important;
      color: #0284c7 !important;
    }
  }
}
</style>

<style scoped lang="scss">
.rich-text-editor {
  background: transparent;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  padding: 10px 12px 12px;
  gap: 8px;
}

.editor-content {
  color: var(--sidebar-text, #ffffff);
  font-size: 0.95rem;
  line-height: 1.5;
  overflow-y: auto;
  outline: none;
  min-height: 100px;
  user-select: text !important;
  -webkit-user-select: text !important;
  cursor: text;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--accent-blue, #009FE3);
    border-radius: 4px;
    transition: background 0.2s ease;
  }
  &::-webkit-scrollbar-thumb:hover,
  &::-webkit-scrollbar-thumb:active {
    background: var(--accent-yellow, #FFC107);
  }
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: var(--sidebar-text-secondary, #94a3b8);
  pointer-events: none;
  display: block;
}

// Selects
:deep(.toolbar-select) {
  .v-field {
    border-radius: 8px !important;
    background: rgba(var(--v-theme-on-surface), 0.04) !important;
    transition: all 0.2s ease !important;
    min-height: 32px !important;
    height: 32px !important;
  }

  .v-field__outline {
    --v-field-border-opacity: 0.08 !important;
    color: var(--border-color, rgba(255, 255, 255, 0.12)) !important;
  }

  &:hover .v-field__outline {
    --v-field-border-opacity: 0.35 !important;
    color: rgba(var(--v-theme-primary), 0.6) !important;
  }

  &.v-input--focused .v-field__outline {
    color: rgb(var(--v-theme-primary)) !important;
  }

  .v-field__input {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 10px !important;
    padding-right: 4px !important;
    min-height: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    color: var(--sidebar-text, #ffffff) !important;
    white-space: nowrap !important;
  }

  .v-field__append-inner {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    align-items: center !important;
    padding-right: 6px !important;

    .v-icon {
      font-size: 16px !important;
      opacity: 0.55 !important;
      transition: opacity 0.2s ease;
    }
  }

  &:hover .v-field__append-inner .v-icon {
    opacity: 1 !important;
  }
}

.size-select {
  width: 125px !important;
  flex: 0 0 125px !important;
}

// Color button
.toolbar-color-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: var(--sidebar-text, #ffffff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
    border-color: rgba(var(--v-theme-primary), 0.5);
  }

  .color-letter {
    font-size: 14px;
    line-height: 1;
  }

  .color-bar {
    height: 3px;
    width: 14px;
    margin-top: 2px;
    border-radius: 1.5px;
  }
}

// Button groups
.toolbar-btn-group {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.toolbar-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--sidebar-text-secondary, #94a3b8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: all 0.18s ease;

  &:hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(var(--v-theme-on-surface), 0.08);
  }

  &.active {
    color: rgb(var(--v-theme-primary));
    background: rgba(0, 159, 227, 0.16);
    font-weight: 600;
  }

  &.btn-danger {
    &:hover {
      color: rgb(var(--v-theme-error)) !important;
      background: rgba(var(--v-theme-error), 0.12) !important;
    }
  }
}

// Light theme support
:root[data-theme="light"],
.v-theme--light {
  .editor-content {
    color: #1e293b;
  }

  .editor-toolbar {
    background: #f8fafc;
    border-top-color: rgba(0, 0, 0, 0.06);
  }

  :deep(.toolbar-select) {
    .v-field {
      background: #ffffff !important;
    }

    .v-field__outline {
      color: rgba(0, 0, 0, 0.1) !important;
    }

    .v-field__input {
      color: #1e293b !important;
    }
  }

  .toolbar-color-btn {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.1);
    color: #1e293b;

    &:hover {
      background: #f1f5f9;
      border-color: #009fe3;
    }
  }

  .toolbar-btn-group {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.08);
  }

  .toolbar-action-btn {
    color: #64748b;

    &:hover {
      color: #0f172a;
      background: rgba(0, 0, 0, 0.06);
    }

    &.active {
      color: #0284c7;
      background: rgba(0, 159, 227, 0.14);
    }

    &.btn-danger:hover {
      color: rgb(var(--v-theme-error)) !important;
      background: rgba(var(--v-theme-error), 0.1) !important;
    }
  }
}
</style>
