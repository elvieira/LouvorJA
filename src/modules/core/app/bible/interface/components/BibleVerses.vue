<template>
  <div class="bible-verses-col d-flex flex-column flex-grow-1" style="background: var(--card-bg, #fff); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); min-height: 0;">
    <div class="pa-4 d-flex justify-space-between align-center" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
      <div class="d-flex align-center" style="min-width: 0; gap: 8px;">
        <h3 class="scriptural-reference-title" style="font-size: 1.3rem; color: var(--sidebar-text); font-weight: 600; line-height: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          {{ referenceTitle }}
        </h3>
        <v-chip
          v-if="multiSelect"
          size="x-small"
          color="primary"
          variant="flat"
          class="font-weight-bold flex-shrink-0"
        >
          <v-icon start size="14">
            mdi-checkbox-multiple-marked
          </v-icon>
          {{ $t('modules.bible.multi_select') }}
        </v-chip>
      </div>
      
      <div class="d-flex align-center ml-auto flex-shrink-0" style="gap: 8px;">
        <!-- Destacar / Multi-Select (Posição 1) -->
        <v-btn
          variant="tonal"
          size="small"
          icon
          class="reader-action-btn"
          :class="{ active: multiSelect }"
          @click="$emit('toggle-multi-select')"
        >
          <v-icon size="18">
            {{ multiSelect ? 'mdi-checkbox-multiple-marked' : 'mdi-checkbox-multiple-marked-outline' }}
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.multi_select') }}
          </v-tooltip>
        </v-btn>

        <!-- Anterior (Posição 2) -->
        <v-btn
          v-shortkey="{ left: ['arrowleft'], up: ['arrowup'], pgup: ['pageup'] }"
          variant="tonal"
          size="small"
          icon
          class="reader-action-btn"
          @click="$emit('prev-verse')"
          @shortkey="$emit('prev-verse')"
        >
          <v-icon size="20">
            mdi-chevron-left
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.prev_verse') }}
          </v-tooltip>
        </v-btn>

        <!-- Próximo (Posição 3) -->
        <v-btn
          v-shortkey="{ right: ['arrowright'], down: ['arrowdown'], pgdn: ['pagedown'] }"
          variant="tonal"
          size="small"
          icon
          class="reader-action-btn"
          @click="$emit('next-verse')"
          @shortkey="$emit('next-verse')"
        >
          <v-icon size="20">
            mdi-chevron-right
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.next_verse') }}
          </v-tooltip>
        </v-btn>

        <!-- Copiar Versículo (Posição 4) -->
        <v-btn
          variant="tonal"
          size="small"
          icon
          class="reader-action-btn"
          @click="copySelectedVerses"
        >
          <v-icon size="18">
            mdi-content-copy
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.copy_verse') || 'Copiar Versículo(s)' }}
          </v-tooltip>
        </v-btn>

        <!-- Limpar Seleção (quando há versículos selecionados) -->
        <v-btn
          v-if="hasSelectedVerses"
          v-shortkey="['del']"
          variant="tonal"
          color="error"
          size="small"
          icon
          class="reader-action-btn"
          @click="$emit('clear-selection')"
          @shortkey="$emit('clear-selection')"
        >
          <v-icon size="18">
            mdi-eraser
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.bible.clear') }}
          </v-tooltip>
        </v-btn>
      </div>
    </div>

    <div class="pa-4 flex-grow-1 verses-scroll-container" style="position: relative; min-height: 0; overflow-y: scroll; overflow-x: hidden;">
      <v-skeleton-loader v-if="loading" type="list-item-two-line@5" />
      <div v-else class="verses-list">
        <div
          v-for="(verse, num) in verses"
          :id="`listVerse_${num}`"
          :key="num"
          class="verse-row-card"
          :class="{ selected: selectedVerses.includes(+num) }"
          @click="$emit('select-verse', $event, num)"
        >
          <div
            class="verse-num-badge"
            :class="{ active: selectedVerses.includes(+num) }"
          >
            {{ num }}
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="verse-body-text" v-html="verse" />
          <div v-if="selectedVerses.includes(+num)" class="verse-active-bar" />
        </div>
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BibleVerses",
  props: {
    verses: {
      type: Object as PropType<Record<number, string>>,
      required: true,
    },
    selectedVerses: {
      type: Array as PropType<number[]>,
      required: true,
    },
    referenceTitle: {
      type: String,
      default: "",
    },
    multiSelect: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    hasSelectedVerses: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "select-verse",
    "prev-verse",
    "next-verse",
    "clear-selection",
    "toggle-multi-select",
  ],
  methods: {
    async copySelectedVerses() {
      let textToCopy = "";
      if (this.selectedVerses && this.selectedVerses.length > 0) {
        const sorted = [...this.selectedVerses].sort((a, b) => a - b);
        textToCopy = sorted
          .map((num) => `${num}. ${this.verses[num] ? this.verses[num].replace(/<[^>]*>/g, "") : ""}`)
          .join("\n");
        if (this.referenceTitle) {
          textToCopy += `\n— ${this.referenceTitle}`;
        }
      } else {
        const allNums = Object.keys(this.verses).map(Number).sort((a, b) => a - b);
        if (allNums.length === 0) return;
        textToCopy = allNums
          .map((num) => `${num}. ${this.verses[num] ? this.verses[num].replace(/<[^>]*>/g, "") : ""}`)
          .join("\n");
        if (this.referenceTitle) {
          textToCopy += `\n— ${this.referenceTitle}`;
        }
      }
      try {
        await navigator.clipboard.writeText(textToCopy);
        (this as any).$appdata?.set("snackbar", {
          show: true,
          text: (this as any).$t("modules.bible.copied_success") || "Versículo(s) copiado(s) com sucesso!",
          color: "success",
        });
      } catch (e) {
        console.error("Falha ao copiar:", e);
      }
    },
  },
});
</script>

<style scoped>
.bible-verses-col {
  container-type: inline-size;
  container-name: verses-col;
}

.reader-action-btn {
  border-radius: 8px !important;
  min-width: 34px !important;
  width: 34px !important;
  height: 34px !important;
  background: var(--ds-surface-elevated, rgba(150, 150, 150, 0.12)) !important;
  border: 1px solid var(--ds-border, rgba(255, 255, 255, 0.08)) !important;
  color: var(--ds-text-secondary, #a0a6b5) !important;
  transition: all 0.2s ease !important;

  &:hover {
    color: var(--ds-accent, #009be2) !important;
    border-color: rgba(0, 155, 226, 0.45) !important;
    background: rgba(0, 155, 226, 0.1) !important;
  }

  &.active {
    background: var(--ds-accent, #009be2) !important;
    color: #ffffff !important;
    border-color: var(--ds-accent, #009be2) !important;
  }
}

:root[data-theme="light"],
.v-theme--light {
  .reader-action-btn {
    background: #f1f5f9 !important;
    border-color: #e2e8f0 !important;
    color: #64748b !important;

    &:hover {
      color: var(--ds-accent, #009be2) !important;
      background: rgba(0, 155, 226, 0.08) !important;
      border-color: rgba(0, 155, 226, 0.35) !important;
    }
  }
}

@container verses-col (max-width: 510px) {
  .scriptural-reference-title {
    display: none !important;
  }
}

@container verses-col (max-width: 310px) {
  :deep(.config-palette-btn) {
    display: none !important;
  }
}

/* Lista e Cards de Versículos */
.verses-scroll-container::-webkit-scrollbar {
  width: 4px;
}

.verses-scroll-container::-webkit-scrollbar-track {
  background-color: transparent;
  margin: 6px 0;
}

.verses-scroll-container::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(var(--v-theme-primary), 0.35);
  transition: background-color 0.2s ease;
}

.verses-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--v-theme-primary));
}

.verses-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.verse-row-card {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding: 12px 18px 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.verse-row-card:hover {
  background: rgba(150, 150, 150, 0.05);
}

.verse-row-card.selected {
  background: rgba(0, 155, 226, 0.14);
  border-color: rgba(0, 155, 226, 0.35);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

:root[data-theme="light"] .verse-row-card.selected,
.v-theme--light .verse-row-card.selected {
  background: rgba(0, 155, 226, 0.08);
  border-color: rgba(0, 155, 226, 0.28);
}

.verse-num-badge {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  margin-right: 14px;
  margin-top: 2px;
  background: rgba(150, 150, 150, 0.12);
  color: var(--sidebar-text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.verse-num-badge.active {
  background: rgb(var(--v-theme-primary)) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.4);
}

.verse-body-text {
  flex-grow: 1;
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--sidebar-text);
  word-break: break-word;
}

.verse-active-bar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  background: rgb(var(--v-theme-primary));
}
</style>
