<template>
  <div class="manual-container h-100 d-flex flex-column pb-4">
    <v-card class="settings-card rounded-xl flex-grow-1 overflow-hidden d-flex flex-column" flat style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color);">
      <!-- Top Header Area -->
      <div class="d-flex align-center py-6 px-6" style="border-bottom: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.01);">
        <v-btn
          class="mr-4"
          icon="mdi-arrow-left"
          size="small"
          variant="tonal"
          color="primary"
          @click="$emit('back')"
        />
        <div class="d-flex align-center justify-center rounded-circle pa-2 mr-3" style="background: rgba(0, 151, 215, 0.1);">
          <v-icon
            color="primary"
            icon="mdi-book-open-page-variant"
            size="22"
          />
        </div>
        <h3 class="font-weight-bold mb-0" style="color: var(--sidebar-text); font-size: 1.25rem; letter-spacing: -0.01em;">
          {{ $t('modules.help.manual_title') }}
        </h3>
        
        <v-spacer />
        
        <v-text-field
          v-model="search"
          bg-color="rgba(128, 128, 128, 0.08)"
          density="compact"
          flat
          hide-details
          clearable
          :placeholder="$t('modules.help.manual.search_placeholder')"
          prepend-inner-icon="mdi-magnify"
          rounded="xl"
          style="max-width: 320px;"
          variant="solo"
          elevation="0"
          class="search-bar"
          @keydown.esc="clearSearch"
          @click:clear="clearSearch"
        />
      </div>

      <!-- Main Area (Sidebar + Content) -->
      <div class="d-flex flex-grow-1" style="min-height: 0;">
        <!-- Sidebar Navigation -->
        <div class="manual-sidebar d-flex flex-column flex-shrink-0" style="width: 270px; border-right: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.015); overflow-y: auto;">
          <v-list
            v-if="displayedSections.length > 0"
            bg-color="transparent"
            class="px-4 py-4"
            density="comfortable"
            nav
          >
            <v-list-item
              v-for="section in displayedSections"
              :key="section.id"
              :active="activeSection === section.id"
              class="mb-2 manual-list-item rounded-lg"
              :value="section.id"
              :ripple="false"
              @click="selectSection(section.id)"
            >
              <template #prepend>
                <v-icon
                  :icon="section.icon"
                  size="small"
                  :color="activeSection === section.id ? 'primary' : 'grey-darken-1'"
                  style="margin-right: -16px;"
                />
              </template>
              <v-list-item-title 
                class="font-weight-medium" 
                :class="activeSection === section.id ? 'text-primary' : ''" 
                style="font-size: 0.95rem; letter-spacing: 0px;"
              >
                {{ section.title }}
              </v-list-item-title>
              <template v-if="searchQuery.length >= 2 && section.matchesCount > 0" #append>
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold ml-1"
                  style="font-size: 0.72rem; height: 20px; padding: 0 6px;"
                >
                  {{ section.matchesCount }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="pa-6 text-center text-caption" style="color: var(--sidebar-text-secondary);">
            {{ $t('modules.help.manual.no_topics_found') }}
          </div>
        </div>

        <!-- Main Content -->
        <div ref="contentArea" class="manual-content flex-grow-1 overflow-auto pa-8 bg-transparent">
          <!-- Empty State when searching and no results -->
          <div v-if="searchQuery.length >= 2 && displayedSections.length === 0" class="d-flex flex-column align-center justify-center h-100 py-12 text-center">
            <v-icon
              icon="mdi-text-box-search-outline"
              size="64"
              color="grey-darken-1"
              class="mb-4"
              style="opacity: 0.5;"
            />
            <h3 class="font-weight-bold mb-2" style="color: var(--sidebar-text);">
              {{ $t('modules.help.manual.no_results_title') }}
            </h3>
            <p class="text-body-2 mb-6" style="color: var(--sidebar-text-secondary); max-width: 420px;">
              {{ $t('modules.help.manual.no_results_desc', { query: search }) }}
            </p>
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-close"
              rounded="lg"
              @click="clearSearch"
            >
              {{ $t('modules.help.manual.clear_search') }}
            </v-btn>
          </div>

          <!-- Normal / Filtered Content -->
          <div v-else class="manual-content-view">
            <h2 class="mb-6 font-weight-bold" style="color: var(--sidebar-text); font-size: 2rem; letter-spacing: -0.02em;">
              {{ currentSectionTitle }}
            </h2>
            
            <div class="text-body-1" style="color: var(--sidebar-text-secondary); line-height: 1.7;">
              <component :is="activeSectionComponent" />
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ManualIntro from "./manual/ManualIntro.vue";
import ManualShortcuts from "./manual/ManualShortcuts.vue";
import ManualSongs from "./manual/ManualSongs.vue";
import ManualBible from "./manual/ManualBible.vue";
import ManualLiturgy from "./manual/ManualLiturgy.vue";
import ManualCustomCollection from "./manual/ManualCustomCollection.vue";
import ManualMusicEditor from "./manual/ManualMusicEditor.vue";
import ManualUtilities from "./manual/ManualUtilities.vue";
import ManualSync from "./manual/ManualSync.vue";
import ManualDisplays from "./manual/ManualDisplays.vue";
import ManualSettings from "./manual/ManualSettings.vue";
import ManualOnlineCollection from "./manual/ManualOnlineCollection.vue";
import ManualQueue from "./manual/ManualQueue.vue";

export default defineComponent({
  name: "HelpManual",
  components: {
    ManualIntro,
    ManualShortcuts,
    ManualSongs,
    ManualQueue,
    ManualBible,
    ManualLiturgy,
    ManualCustomCollection,
    ManualOnlineCollection,
    ManualMusicEditor,
    ManualUtilities,
    ManualSync,
    ManualDisplays,
    ManualSettings,
  },
  emits: ["back"],
  data() {
    return {
      search: "",
      activeSection: (this as any).$appdata?.get("modules.help.activeSection") || "intro",
      highlightTimeout: null as any,
    };
  },
  computed: {
    sections(): Array<{ id: string; title: string; icon: string }> {
      return [
        { id: "intro", title: (this as any).$t("modules.help.manual.sections.intro"), icon: "mdi-flag" },
        { id: "shortcuts", title: (this as any).$t("modules.help.manual.sections.shortcuts"), icon: "mdi-keyboard" },
        { id: "songs", title: (this as any).$t("modules.help.manual.sections.songs"), icon: "mdi-music-note" },
        { id: "queue", title: (this as any).$t("modules.help.manual.sections.queue"), icon: "mdi-playlist-play" },
        { id: "bible", title: (this as any).$t("modules.help.manual.sections.bible"), icon: "mdi-book-cross" },
        { id: "liturgy", title: (this as any).$t("modules.help.manual.sections.liturgy"), icon: "mdi-hands-pray" },
        { id: "custom_collection", title: (this as any).$t("modules.help.manual.sections.custom_collection"), icon: "mdi-music-box-multiple" },
        { id: "online_collection", title: (this as any).$t("modules.help.manual.sections.online_collection"), icon: "mdi-web" },
        { id: "music_editor", title: (this as any).$t("modules.help.manual.sections.music_editor"), icon: "mdi-music-note-plus" },
        { id: "utilities", title: (this as any).$t("modules.help.manual.sections.utilities"), icon: "mdi-plus-circle" },
        { id: "sync", title: (this as any).$t("modules.help.manual.sections.sync"), icon: "mdi-library" },
      ];
    },
    searchQuery(): string {
      return this.search ? this.search.trim() : "";
    },
    sectionMatches(): Record<string, number> {
      const query = this.searchQuery;
      if (query.length < 2) return {};
      const res: Record<string, number> = {};
      for (const section of this.sections) {
        const text = `${this.getSectionText(section.id)} ${section.title}`;
        res[section.id] = this.countMatches(text, query);
      }
      return res;
    },
    displayedSections(): Array<{ id: string; title: string; icon: string; matchesCount: number }> {
      const query = this.searchQuery;
      if (query.length < 2) {
        return this.sections.map((s) => ({ ...s, matchesCount: 0 }));
      }
      return this.sections
        .map((s) => ({ ...s, matchesCount: this.sectionMatches[s.id] || 0 }))
        .filter((s) => s.matchesCount > 0);
    },
    currentSectionTitle(): string {
      const section = this.sections.find((s) => s.id === this.activeSection);
      return section ? section.title : "";
    },
    activeSectionComponent(): string {
      const map: Record<string, string> = {
        intro: "ManualIntro",
        shortcuts: "ManualShortcuts",
        songs: "ManualSongs",
        queue: "ManualQueue",
        bible: "ManualBible",
        liturgy: "ManualLiturgy",
        custom_collection: "ManualCustomCollection",
        online_collection: "ManualOnlineCollection",
        music_editor: "ManualMusicEditor",
        utilities: "ManualUtilities",
        sync: "ManualSync",
        displays: "ManualDisplays",
        settings: "ManualSettings",
      };
      return map[this.activeSection] || "ManualIntro";
    },
  },
  watch: {
    activeSection() {
      this.onSectionChanged();
    },
    displayedSections(newVal) {
      if (this.searchQuery.length >= 2) {
        if (newVal.length > 0 && !newVal.some((s: any) => s.id === this.activeSection)) {
          this.activeSection = newVal[0].id;
        }
      }
    },
    search() {
      if (this.searchQuery.length >= 2) {
        this.applyHighlight();
      } else {
        this.clearHighlights();
        const container = this.$refs.contentArea as HTMLElement;
        if (container) {
          container.scrollTop = 0;
        }
      }
    },
  },
  mounted() {
    const container = this.$refs.contentArea as HTMLElement;
    if (container) {
      container.scrollTop = 0;
    }
    if (this.searchQuery.length >= 2) {
      this.applyHighlight();
    }
  },
  beforeUnmount() {
    (this as any).$appdata?.set("modules.help.activeSection", this.activeSection);
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }
    this.clearHighlights();
  },
  methods: {
    onSectionChanged() {
      (this as any).$appdata?.set("modules.help.activeSection", this.activeSection);
      this.$nextTick(() => {
        const container = this.$refs.contentArea as HTMLElement;
        if (container) {
          container.scrollTop = 0;
        }
        if (this.searchQuery.length >= 2) {
          this.applyHighlight();
        } else {
          this.clearHighlights();
        }
      });
    },
    normalizeString(str: string): string {
      return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    },
    countMatches(text: string, query: string): number {
      if (!text || !query) return 0;
      const normText = this.normalizeString(text);
      const normQuery = this.normalizeString(query);
      if (!normQuery) return 0;

      let count = 0;
      let pos = 0;
      while ((pos = normText.indexOf(normQuery, pos)) !== -1) {
        count++;
        pos += normQuery.length;
      }
      return count;
    },
    getManualMessages(): any {
      try {
        if (typeof (this as any).$tm === "function") {
          const tm = (this as any).$tm("modules.help.manual");
          if (tm && typeof tm === "object") return tm;
        }
      } catch {
        // fallback
      }
      const i18n = (this as any).$i18n;
      if (i18n) {
        const locale = typeof i18n.locale === "object" ? i18n.locale.value : i18n.locale;
        if (typeof i18n.getLocaleMessage === "function") {
          const msg = i18n.getLocaleMessage(locale);
          if (msg?.modules?.help?.manual) return msg.modules.help.manual;
        }
        if (i18n.messages?.[locale]?.modules?.help?.manual) {
          return i18n.messages[locale].modules.help.manual;
        }
      }
      return {};
    },
    getSectionText(sectionId: string): string {
      const manualObj = this.getManualMessages();
      const sectionObj = manualObj[sectionId];
      if (!sectionObj) return "";

      const extract = (val: any): string[] => {
        if (!val) return [];
        if (typeof val === "string") {
          return [val.replace(/<[^>]*>/g, " ")];
        }
        if (Array.isArray(val)) {
          return val.flatMap(extract);
        }
        if (typeof val === "object") {
          return Object.values(val).flatMap(extract);
        }
        return [];
      };

      return extract(sectionObj).join(" ");
    },
    selectSection(sectionId: string) {
      if (this.activeSection === sectionId) {
        if (this.searchQuery.length >= 2) {
          this.applyHighlight();
        }
        return;
      }
      this.activeSection = sectionId;
    },
    clearSearch() {
      this.search = "";
      this.clearHighlights();
      const container = this.$refs.contentArea as HTMLElement;
      if (container) {
        container.scrollTop = 0;
      }
    },
    applyHighlight() {
      if (this.highlightTimeout) {
        clearTimeout(this.highlightTimeout);
      }
      this.highlightTimeout = setTimeout(() => {
        this.$nextTick(() => {
          this.highlightContent();
        });
      }, 40);
    },
    clearHighlights() {
      if (typeof CSS !== "undefined" && (CSS as any)?.highlights) {
        (CSS as any).highlights.delete("manual-search");
      }
    },
    highlightContent() {
      const container = this.$refs.contentArea as HTMLElement;
      if (!container) return;

      this.clearHighlights();

      const query = this.searchQuery;
      if (query.length < 2) return;

      const normQuery = this.normalizeString(query);

      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (tag === "script" || tag === "style") {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        },
      );

      const ranges: Range[] = [];
      let node: Node | null;
      let firstMatchEl: HTMLElement | null = null;

      while ((node = walker.nextNode())) {
        const text = (node.nodeValue || "").normalize("NFC");
        const normText = this.normalizeString(text);

        let matchIndex = normText.indexOf(normQuery);
        while (matchIndex !== -1) {
          try {
            const range = new Range();
            range.setStart(node, matchIndex);
            range.setEnd(node, matchIndex + normQuery.length);
            ranges.push(range);

            if (!firstMatchEl && node.parentElement) {
              firstMatchEl = node.parentElement;
            }
          } catch {
            // Ignore boundary errors
          }
          matchIndex = normText.indexOf(normQuery, matchIndex + normQuery.length);
        }
      }

      if (ranges.length > 0 && typeof (window as any).Highlight !== "undefined" && (CSS as any)?.highlights) {
        const highlight = new (window as any).Highlight(...ranges);
        (CSS as any).highlights.set("manual-search", highlight);
      }

      if (firstMatchEl) {
        const containerRect = container.getBoundingClientRect();
        const elRect = firstMatchEl.getBoundingClientRect();
        const relativeTop = elRect.top - containerRect.top + container.scrollTop;
        const targetScroll = Math.max(0, relativeTop - container.clientHeight / 2 + elRect.height / 2);
        container.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    },
  },
});
</script>

<style scoped>
.search-bar :deep(.v-field) {
  box-shadow: none !important;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.search-bar :deep(.v-field--focused) {
  border-color: var(--accent-blue);
  background: rgba(0, 151, 215, 0.05) !important;
}
.manual-sidebar .v-list-item--active {
  background: rgba(0, 151, 215, 0.1) !important;
  color: var(--accent-blue) !important;
}
.manual-list-item {
  transition: all 0.2s ease;
}
.manual-list-item:hover:not(.v-list-item--active) {
  background: rgba(0, 0, 0, 0.04) !important;
}

.manual-content-view {
  animation: fadeIn 0.15s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
}

/* Estilos globais para as tags de atalho dentro do manual */
.manual-container :deep(kbd) {
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  color: var(--sidebar-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Symbol", "Apple Symbols", Roboto, sans-serif;
  font-size: 0.8em;
  font-weight: 600;
  padding: 1px 5px;
  margin: 0 3px;
  white-space: nowrap;
}

.manual-container :deep(.cmd-symbol) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Symbol", "Apple Symbols", sans-serif;
  font-weight: 600;
  font-size: 1.05em;
  line-height: 1;
  display: inline-block;
}

.manual-container :deep(.shortcut-operator) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 500;
  color: var(--sidebar-text);
  opacity: 0.45;
  margin: 0 4px;
  user-select: none;
  line-height: 1;
}

/* Realce da pesquisa no manual */
.manual-container :deep(mark.manual-highlight) {
  background-color: rgba(255, 214, 0, 0.45);
  color: inherit;
  border-radius: 4px;
  padding: 1px 3px;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(255, 214, 0, 0.6);
  transition: background-color 0.2s ease;
}

/* Remover o scroll individual das tabelas */
.manual-container :deep(.v-table__wrapper) {
  overflow: visible !important;
}
</style>

<style>
::highlight(manual-search) {
  background-color: #ffd600;
  color: #111111;
}
</style>
