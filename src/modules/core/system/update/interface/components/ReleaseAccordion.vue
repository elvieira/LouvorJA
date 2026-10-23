<template>
  <div class="release-accordion-container px-6 flex-grow-1 min-h-0 d-flex flex-column">
    <!-- Título da Seção -->
    <div class="mb-3">
      <div class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1rem; line-height: 1.3;">
        {{ $t('modules.update.whats_new_heading') }}
      </div>
      <div class="text-caption mt-0.5" style="color: var(--sidebar-text-secondary); font-size: 0.82rem;">
        {{ $t('modules.update.whats_new_subheading') }}
      </div>
    </div>

    <!-- Lista com Scroll das Versões -->
    <div class="releases-scroll-area flex-grow-1 min-h-0 overflow-y-auto pr-1">
      <div class="d-flex flex-column" style="gap: 12px;">
        <div
          v-for="(rel, idx) in releasesList"
          :key="rel.version"
          class="release-card"
          :class="{ 'release-card-expanded': isExpanded(rel.version, idx) }"
        >
          <!-- Header da Versão (Clicável para expandir/colapsar) -->
          <div
            class="release-card-header d-flex align-center justify-space-between cursor-pointer"
            @click="toggleRelease(rel.version, idx)"
          >
            <div class="d-flex align-center" style="gap: 14px;">
              <div
                class="release-dot-indicator flex-shrink-0"
                :class="{ 'is-latest': idx === 0 }"
              />
              <div class="d-flex flex-column">
                <div class="d-flex align-center flex-wrap" style="gap: 4px;">
                  <span class="version-name font-weight-bold">
                    {{ formatVersion(rel.version) }}
                  </span>
                  <span
                    v-if="idx === 0"
                    class="latest-badge"
                  >
                    {{ $t('modules.update.latest_badge') }}
                  </span>
                </div>
                <span v-if="rel.publishedAt" class="version-date">
                  {{ formatDate(rel.publishedAt) }}
                </span>
              </div>
            </div>

            <div class="d-flex align-center">
              <v-icon
                size="22"
                class="accordion-chevron"
                :class="{ 'rotate-180': isExpanded(rel.version, idx) }"
              >
                mdi-chevron-down
              </v-icon>
            </div>
          </div>

          <!-- Conteúdo / Notas de Lançamento quando expandido -->
          <v-expand-transition>
            <div
              v-if="isExpanded(rel.version, idx)"
              class="release-notes-wrapper"
              @click.stop
            >
              <div class="release-notes-body">
                <!-- eslint-disable vue/no-v-html -->
                <div
                  v-if="hasNotes(rel)"
                  class="notes-content"
                  v-html="renderNotes(rel.notes)"
                />
                <!-- eslint-enable vue/no-v-html -->
                <div
                  v-else
                  class="text-caption"
                  style="color: var(--sidebar-text-secondary); font-style: italic;"
                >
                  {{ $t('modules.update.no_notes_available') }}
                </div>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export interface ReleaseViewItem {
  version: string;
  publishedAt?: string;
  title?: string;
  notes?: string;
}

export default defineComponent({
  name: "ReleaseAccordion",
  props: {
    releases: {
      type: Array as PropType<ReleaseViewItem[]>,
      default: () => [],
    },
    singleNotes: {
      type: String,
      default: "",
    },
    latestVersionNumber: {
      type: [String, Number],
      default: "",
    },
  },
  data() {
    return {
      expandedState: {} as Record<string, boolean>,
    };
  },
  computed: {
    releasesList(): ReleaseViewItem[] {
      if (this.releases && this.releases.length > 0) {
        return this.releases;
      }
      if (this.latestVersionNumber) {
        return [
          {
            version: String(this.latestVersionNumber),
            notes: this.singleNotes || "",
          },
        ];
      }
      return [];
    },
  },
  methods: {
    formatVersion(v: string | number): string {
      const s = String(v || "").trim();
      return s.startsWith("v") ? s : `v${s}`;
    },
    formatDate(dateStr?: string): string {
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const locale = this.$i18n.locale === "es" ? "es-ES" : "pt-BR";
        return new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d);
      } catch {
        return dateStr;
      }
    },
    hasNotes(rel: ReleaseViewItem): boolean {
      return !!(rel.notes && rel.notes.trim().length > 0);
    },
    isExpanded(version: string, index: number): boolean {
      if (this.expandedState[version] !== undefined) {
        return this.expandedState[version];
      }
      // Por padrão, a primeira versão (mais recente) vem expandida
      return index === 0;
    },
    toggleRelease(version: string, index: number) {
      const current = this.isExpanded(version, index);
      this.expandedState = {
        ...this.expandedState,
        [version]: !current,
      };
    },
    renderNotes(rawNotes?: string): string {
      if (!rawNotes) return "";
      // Escapa tags html inseguras preservando o conteúdo
      const text = rawNotes
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const lines = text.split(/\r?\n/);
      const outputLines: string[] = [];
      let inUl = false;

      // Regex para identificar cabeçalhos (Markdown ou linhas de destaque com emoji)
      const headerRegex = /^(#{1,4}\s+|[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*)/u;

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Cabeçalhos (### Título ou ✨ Título)
        if (line.startsWith("#") || headerRegex.test(line)) {
          if (inUl) {
            outputLines.push("</ul>");
            inUl = false;
          }
          const cleanTitle = line.replace(/^#+\s*/, "");
          outputLines.push(`<div class="release-category-title font-weight-bold">${cleanTitle}</div>`);
          continue;
        }

        // Bullets de lista: - ou * ou •
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
          if (!inUl) {
            outputLines.push('<ul class="release-bullet-list">');
            inUl = true;
          }
          let itemText = line.substring(2).trim();
          itemText = this.formatInline(itemText);
          outputLines.push(`<li>${itemText}</li>`);
          continue;
        }

        // Linha comum de texto
        if (inUl) {
          outputLines.push("</ul>");
          inUl = false;
        }
        const cleanText = this.formatInline(line);
        outputLines.push(`<p class="release-text-p">${cleanText}</p>`);
      }

      if (inUl) {
        outputLines.push("</ul>");
      }

      return outputLines.join("");
    },
    formatInline(text: string): string {
      let res = text;
      // 1. Links simples [texto](url)
      res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="release-link">$1</a>');
      // 2. Código inline `code`
      res = res.replace(/`([^`]+)`/g, "<code>$1</code>");
      // 3. Negrito duplo com asteriscos **texto** ou sublinhados __texto__
      res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      res = res.replace(/__(.*?)__/g, "<strong>$1</strong>");
      // 4. Itálico com _texto_ ou *texto*
      res = res.replace(/(?<=^|[\s(.,;:!?'"“”«»])_([^\s_](?:[^_]*[^\s_])?)_(?=[\s).,;:!?'"“”«»]|$)/g, "<em>$1</em>");
      res = res.replace(/(?<=^|[\s(.,;:!?'"“”«»])\*([^\s*](?:[^*]*[^\s*])?)\*(?=[\s).,;:!?'"“”«»]|$)/g, "<em>$1</em>");
      // 5. Tachado ~~texto~~
      res = res.replace(/~~(.*?)~~/g, "<del>$1</del>");
      return res;
    },
  },
});
</script>

<style scoped>
.release-card {
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.release-card:hover {
  border-color: rgba(0, 159, 227, 0.3);
}

.release-card-expanded {
  background: rgba(0, 0, 0, 0.28);
  border-color: rgba(255, 255, 255, 0.1);
}

.release-card-header {
  padding: 14px 20px;
  min-height: 64px;
  user-select: none;
}

.release-dot-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.release-dot-indicator.is-latest {
  background: #009fe3;
  box-shadow: 0 0 8px rgba(0, 159, 227, 0.65);
}

.version-name {
  color: var(--sidebar-text);
  font-size: 1.05rem;
  line-height: 1.25;
  letter-spacing: 0.3px;
}

.latest-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.14);
  border: 1px solid rgba(76, 175, 80, 0.32);
  padding: 4px 10px;
  border-radius: 9999px;
  line-height: 1.2;
  margin-left: 10px;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.version-date {
  color: var(--sidebar-text-secondary);
  font-size: 0.8rem;
  margin-top: 3px;
  line-height: 1.2;
}

.accordion-chevron {
  color: var(--sidebar-text-secondary);
  transition: transform 0.25s ease, color 0.2s ease;
}

.release-card-header:hover .accordion-chevron {
  color: var(--sidebar-text);
}

.accordion-chevron.rotate-180 {
  transform: rotate(180deg);
  color: #009fe3;
}

.release-notes-wrapper {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 18px 16px 18px;
}

.release-notes-body {
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 14px 18px;
  margin-top: 12px;
  --release-text-color: rgba(255, 255, 255, 0.84);
  --release-strong-color: #ffffff;
  --release-em-color: #e2e8f0;
  --release-category-color: #009fe3;
  --release-code-bg: rgba(255, 255, 255, 0.08);
  --release-code-color: #009fe3;
  --release-bullet-color: #009fe3;
}

.releases-scroll-area {
  max-height: min(480px, 50vh);
  scrollbar-width: thin;
  scrollbar-color: var(--accent-blue, #009fe3) transparent;
}

.releases-scroll-area::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.releases-scroll-area::-webkit-scrollbar-track {
  background: transparent !important;
  margin: 4px 0;
}

.releases-scroll-area::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background-color: var(--accent-blue, #009fe3);
  transition: background-color 0.2s ease;
}

.releases-scroll-area::-webkit-scrollbar-thumb:hover,
.releases-scroll-area::-webkit-scrollbar-thumb:active {
  background-color: var(--accent-yellow, #ffc107);
}

.release-notes-body :deep(.release-category-title) {
  color: var(--release-category-color);
  font-size: 0.94rem;
  font-weight: 700;
  margin-top: 14px;
  margin-bottom: 8px;
  letter-spacing: 0.2px;
}

.release-notes-body :deep(.release-category-title:first-child) {
  margin-top: 2px;
}

.release-notes-body :deep(.release-bullet-list) {
  list-style: none;
  padding-left: 0;
  margin: 0 0 10px 0;
}

.release-notes-body :deep(.release-bullet-list li) {
  position: relative;
  padding-left: 20px;
  font-size: 0.88rem;
  color: var(--release-text-color);
  line-height: 1.6;
  margin-bottom: 8px;
}

.release-notes-body :deep(.release-bullet-list li:last-child) {
  margin-bottom: 0;
}

.release-notes-body :deep(.release-bullet-list li::before) {
  content: "•";
  position: absolute;
  left: 2px;
  top: -1px;
  color: var(--release-bullet-color);
  font-size: 1.3rem;
  line-height: 1.5;
}

.release-notes-body :deep(.release-text-p) {
  font-size: 0.88rem;
  color: var(--release-text-color);
  line-height: 1.6;
  margin-bottom: 8px;
}

.release-notes-body :deep(strong) {
  color: var(--release-strong-color);
  font-weight: 600;
}

.release-notes-body :deep(em) {
  font-style: italic;
  color: var(--release-em-color);
}

.release-notes-body :deep(del) {
  text-decoration: line-through;
  opacity: 0.6;
}

.release-notes-body :deep(code) {
  background: var(--release-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.82rem;
  font-family: monospace;
  color: var(--release-code-color);
}

.release-notes-body :deep(.release-link) {
  color: var(--release-category-color);
  text-decoration: underline;
  text-underline-offset: 3px;
  word-break: break-all;
}

/* Modo Claro */
.v-theme--light .release-card,
.v-theme--light.release-card {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

.v-theme--light .release-card:hover,
.v-theme--light.release-card:hover {
  border-color: rgba(0, 155, 226, 0.4) !important;
}

.v-theme--light .release-card-expanded,
.v-theme--light.release-card-expanded {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
}

.v-theme--light .release-dot-indicator {
  background: #94a3b8;
}

.v-theme--light .release-dot-indicator.is-latest {
  background: #009be2 !important;
  box-shadow: 0 0 6px rgba(0, 155, 226, 0.5) !important;
}

.v-theme--light .version-name {
  color: #1e293b !important;
}

.v-theme--light .version-date {
  color: #64748b !important;
}

.v-theme--light .latest-badge {
  color: #15803d !important;
  background: #dcfce7 !important;
  border-color: #86efac !important;
}

.v-theme--light .accordion-chevron {
  color: #64748b;
}

.v-theme--light .accordion-chevron.rotate-180 {
  color: #009be2 !important;
}

.v-theme--light .release-notes-wrapper {
  border-top: 1px solid #e2e8f0 !important;
}

.v-theme--light .release-notes-body {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  --release-text-color: #334155;
  --release-strong-color: #0f172a;
  --release-em-color: #1e293b;
  --release-category-color: #0284c7;
  --release-code-bg: #e2e8f0;
  --release-code-color: #0369a1;
  --release-bullet-color: #0284c7;
}
</style>
