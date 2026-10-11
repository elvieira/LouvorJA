<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    content-class="bible-search-dialog"
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="bible-search-card">
      <!-- Header -->
      <v-card-title class="d-flex align-center px-6 pt-5 pb-3">
        <div class="d-flex align-center" style="gap: 10px;">
          <div class="bible-search-header-icon">
            <v-icon color="primary" size="22">
              mdi-magnify
            </v-icon>
          </div>
          <span class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
            {{ $t('modules.bible.search_bible_title') }}
          </span>
        </div>
        <v-spacer />
        <v-btn
          icon
          size="small"
          variant="text"
          class="bible-dialog-close-btn"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
          <v-tooltip
            activator="parent"
            location="bottom"
            open-delay="200"
            content-class="modern-glass-menu elevation-0 font-weight-medium"
          >
            {{ $t('app.close') || 'Fechar' }}
          </v-tooltip>
        </v-btn>
      </v-card-title>

      <!-- Search Input & Filters Section -->
      <div class="px-6 pt-1 pb-3">
        <!-- Input Bar with Solid Blue Search Button -->
        <div class="bible-search-input-wrapper">
          <v-icon size="20" class="input-search-icon" color="primary">
            mdi-magnify
          </v-icon>
          <input
            ref="searchInputRef"
            v-model="localQuery"
            type="text"
            class="bible-search-field"
            :placeholder="$t('modules.bible.search_input_placeholder')"
            @keydown.enter="handleSearch"
          />
          <button
            v-if="localQuery"
            type="button"
            class="bible-search-clear-btn"
            title="Limpar"
            @click="clearQuery"
          >
            <v-icon size="16">
              mdi-close
            </v-icon>
          </button>
          <v-btn
            color="primary"
            elevation="0"
            rounded="lg"
            class="bible-search-submit-btn"
            :loading="isSearching"
            @click="handleSearch"
          >
            <v-icon size="20">
              mdi-magnify
            </v-icon>
          </v-btn>
        </div>

        <!-- Scope Pills (Todos / Antigo Testamento / Novo Testamento) -->
        <div class="bible-scope-pills-row mt-3">
          <button
            type="button"
            class="scope-pill"
            :class="{ active: scopeFilter === 'all' }"
            @click="scopeFilter = 'all'"
          >
            {{ $t('modules.bible.all') }}
          </button>
          <button
            type="button"
            class="scope-pill"
            :class="{ active: scopeFilter === 'at' }"
            @click="scopeFilter = 'at'"
          >
            {{ $t('modules.bible.old_testament') }}
          </button>
          <button
            type="button"
            class="scope-pill"
            :class="{ active: scopeFilter === 'nt' }"
            @click="scopeFilter = 'nt'"
          >
            {{ $t('modules.bible.new_testament') }}
          </button>
        </div>

        <!-- Meta Line: Results count & Sort -->
        <div class="bible-search-meta-row mt-3">
          <span class="results-count-text">
            {{ isSearching ? $t('modules.bible.searching_bible') : resultsCountText }}
          </span>
          <div class="bible-search-sort-wrapper">
            <span class="sort-label">{{ $t('modules.bible.sort_by') }}</span>
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <button type="button" class="sort-dropdown-btn" v-bind="props">
                  <span>{{ sortBy === 'book' ? $t('modules.bible.sort_book') : $t('modules.bible.sort_az') }}</span>
                  <v-icon size="16">
                    mdi-chevron-down
                  </v-icon>
                </button>
              </template>
              <v-list density="compact" class="bible-sort-menu" elevation="4">
                <v-list-item :active="sortBy === 'book'" @click="sortBy = 'book'">
                  <v-list-item-title class="text-caption font-weight-medium">
                    {{ $t('modules.bible.sort_book') }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item :active="sortBy === 'az'" @click="sortBy = 'az'">
                  <v-list-item-title class="text-caption font-weight-medium">
                    {{ $t('modules.bible.sort_az') }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </div>

      <v-divider style="border-color: var(--border-color); opacity: 0.6;" />

      <!-- Results List -->
      <v-card-text class="px-6 py-4 bible-search-results-body">
        <!-- Loading State -->
        <div v-if="isSearching" class="d-flex flex-column align-center justify-center py-10">
          <v-progress-circular
            indeterminate
            color="primary"
            size="44"
            width="4"
            class="mb-4"
          />
          <span class="text-body-2 font-weight-medium" style="color: var(--sidebar-text-secondary);">
            {{ $t('modules.bible.searching_bible') }}
          </span>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredResults.length === 0"
          class="d-flex flex-column align-center justify-center py-10 text-center"
        >
          <div class="bible-empty-icon-wrap mb-3">
            <v-icon size="42" color="primary">
              mdi-text-box-search-outline
            </v-icon>
          </div>
          <span class="text-body-1 font-weight-medium" style="color: var(--sidebar-text-secondary); max-width: 420px;">
            {{ $t('modules.bible.no_verses_found', { query: lastExecutedQuery || searchQuery }) }}
          </span>
        </div>

        <!-- Cards List -->
        <div v-else class="bible-results-list">
          <div
            v-for="(res, i) in filteredResults"
            :key="`${res.id_bible_book}_${res.chapter}_${res.verse}_${i}`"
            class="bible-result-card"
            @click="$emit('open-result', res)"
          >
            <div class="bible-result-badge">
              <v-icon size="20" color="primary">
                mdi-bookmark-outline
              </v-icon>
            </div>
            <div class="bible-result-content">
              <div class="bible-result-ref">
                {{ res.book_name }} {{ res.chapter }}:{{ res.verse }}
                <span v-if="versionAbbr" class="bible-result-version">({{ versionAbbr }})</span>
              </div>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="bible-result-text" v-html="highlightText(res.text, lastExecutedQuery)" />
            </div>
            <div class="bible-result-action">
              <v-icon size="20" class="chevron-icon">
                mdi-chevron-right
              </v-icon>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BibleSearchResults",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    isSearching: {
      type: Boolean,
      required: true,
    },
    searchResults: {
      type: Array as PropType<any[]>,
      required: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
    versionAbbr: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "open-result", "search-text"],
  data() {
    return {
      localQuery: this.searchQuery || "",
      lastExecutedQuery: this.searchQuery || "",
      scopeFilter: "all" as "all" | "at" | "nt",
      sortBy: "book" as "book" | "az",
    };
  },
  computed: {
    filteredResults(): any[] {
      let list = [...this.searchResults];

      if (this.scopeFilter === "at") {
        list = list.filter((r) => Number(r.id_bible_book) <= 39);
      } else if (this.scopeFilter === "nt") {
        list = list.filter((r) => Number(r.id_bible_book) >= 40);
      }

      if (this.sortBy === "az") {
        list.sort((a, b) => (a.text || "").localeCompare(b.text || ""));
      } else {
        list.sort((a, b) => {
          const bookDiff = Number(a.id_bible_book) - Number(b.id_bible_book);
          if (bookDiff !== 0) return bookDiff;
          const chapDiff = Number(a.chapter) - Number(b.chapter);
          if (chapDiff !== 0) return chapDiff;
          return Number(a.verse) - Number(b.verse);
        });
      }

      return list;
    },
    resultsCountText(): string {
      const count = this.filteredResults.length;
      if (count === 1) {
        return this.$t("modules.bible.one_result_found");
      }
      return this.$t("modules.bible.results_found", { count });
    },
  },
  watch: {
    modelValue(val: boolean) {
      if (val) {
        this.localQuery = this.searchQuery || "";
        this.lastExecutedQuery = this.searchQuery || "";
        this.$nextTick(() => {
          (this.$refs.searchInputRef as HTMLInputElement | undefined)?.focus();
        });
      }
    },
    searchQuery(val: string) {
      this.localQuery = val || "";
      this.lastExecutedQuery = val || "";
    },
  },
  methods: {
    handleSearch() {
      const query = this.localQuery.trim();
      if (!query) return;
      this.lastExecutedQuery = query;
      this.$emit("search-text", query);
    },
    clearQuery() {
      this.localQuery = "";
      this.$nextTick(() => {
        (this.$refs.searchInputRef as HTMLInputElement | undefined)?.focus();
      });
    },
    highlightText(text: string, query: string) {
      if (!query || !text) return text;

      const cleanQuery = query
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      if (!cleanQuery) return text;

      const normalizedText = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (normalizedText.startsWith(cleanQuery, i)) {
          const matchText = text.slice(i, i + cleanQuery.length);
          result += `<mark class="bible-search-mark">${matchText}</mark>`;
          i += cleanQuery.length - 1;
        } else {
          result += text[i];
        }
      }
      return result;
    },
  },
});
</script>

<style scoped>
.bible-search-card {
  background: var(--card-bg) !important;
  box-shadow: var(--shadow) !important;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.bible-search-header-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bible-dialog-close-btn {
  color: var(--sidebar-text-secondary);
  border-radius: 10px !important;
  transition: all 0.2s ease;
}

.bible-dialog-close-btn:hover {
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.1);
}

/* Search input container */
.bible-search-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  background: rgba(150, 150, 150, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 4px 6px 4px 14px;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.bible-search-input-wrapper:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15);
}

.input-search-icon {
  opacity: 0.7;
}

.bible-search-field {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--sidebar-text);
  padding: 8px 0;
}

.bible-search-field::placeholder {
  color: var(--sidebar-text-secondary);
  opacity: 0.7;
}

.bible-search-clear-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-text-secondary);
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease;
}

.bible-search-clear-btn:hover {
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.12);
}

.bible-search-submit-btn {
  min-width: 44px !important;
  width: 44px !important;
  height: 38px !important;
  padding: 0 !important;
  border-radius: 8px !important;
}

/* Scope Pills */
.bible-scope-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scope-pill {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: rgba(150, 150, 150, 0.05);
  color: var(--sidebar-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scope-pill:hover {
  background: rgba(150, 150, 150, 0.12);
  color: var(--sidebar-text);
}

.scope-pill.active {
  background: rgb(var(--v-theme-primary)) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
}

/* Meta Line */
.bible-search-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-count-text {
  font-size: 13px;
  color: var(--sidebar-text-secondary);
  font-weight: 500;
}

.bible-search-sort-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-label {
  font-size: 12.5px;
  color: var(--sidebar-text-secondary);
}

.sort-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sidebar-text);
  background: rgba(150, 150, 150, 0.06);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-dropdown-btn:hover {
  background: rgba(150, 150, 150, 0.12);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.bible-sort-menu {
  background: var(--card-bg) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 10px !important;
}

/* Results body */
.bible-search-results-body {
  max-height: 58vh;
  overflow-y: auto;
}

.bible-empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bible-results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Result Card */
.bible-result-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: rgba(150, 150, 150, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.bible-result-card:hover {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgba(var(--v-theme-primary), 0.45);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.bible-result-badge {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bible-result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bible-result-ref {
  font-size: 14.5px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
  gap: 4px;
}

.bible-result-version {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

.bible-result-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--sidebar-text);
  word-break: break-word;
}

:deep(.bible-search-mark) {
  background: rgba(var(--v-theme-primary), 0.28) !important;
  color: inherit !important;
  font-weight: 700;
  padding: 1px 4px;
  margin: 0 1px;
  border-radius: 4px;
  border-bottom: 2px solid rgb(var(--v-theme-primary));
}

.bible-result-action {
  color: var(--sidebar-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chevron-icon {
  opacity: 0.5;
  transition: all 0.2s ease;
}

.bible-result-card:hover .chevron-icon {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
  transform: translateX(3px);
}
</style>
