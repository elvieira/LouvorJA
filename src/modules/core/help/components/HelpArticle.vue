<template>
  <div class="help-article pa-6" style="max-width: 800px; height: 100%; overflow-y: auto; scrollbar-width: thin;">
    <!-- Breadcrumb -->
    <div v-if="article" class="mb-4">
      <v-btn
        v-if="showBack"
        variant="text"
        size="small"
        class="text-none mb-2 px-0"
        style="color: var(--accent-blue);"
        @click="$emit('back')"
      >
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        {{ t('back_to_guide') }}
      </v-btn>
      <h1 class="text-h5 font-weight-bold mb-1" style="color: var(--sidebar-text); line-height: 1.3;">{{ article.title }}</h1>
      <v-divider class="mt-3 mb-4" style="opacity: 0.1;"></v-divider>
    </div>

    <!-- No article selected -->
    <div v-if="!article" class="d-flex flex-column align-center justify-center" style="height: 60%;">
      <v-icon size="64" color="grey lighten-2" style="opacity: 0.3;">mdi-book-open-variant</v-icon>
      <p class="text-body-1 mt-4" style="color: var(--sidebar-text-secondary); opacity: 0.6;">
        Selecione um artigo na barra lateral
      </p>
    </div>

    <!-- Article content -->
    <div v-if="article && article.text" class="help-content">
      <div v-for="(block, idx) in article.text" :key="idx" class="mb-4">
        <!-- Subtitle -->
        <h3
          v-if="block.type === 'title'"
          class="text-subtitle-1 font-weight-bold mb-2"
          style="color: var(--sidebar-text);"
        >
          {{ block.value }}
        </h3>

        <!-- Paragraph -->
        <p
          v-else-if="block.type === 'text'"
          class="text-body-2 help-paragraph"
          style="color: var(--sidebar-text-secondary); line-height: 1.7;"
          v-html="renderText(block.value, block.link)"
        ></p>

        <!-- List -->
        <ul v-else-if="block.type === 'list'" class="help-list">
          <li
            v-for="(item, liIdx) in block.value"
            :key="liIdx"
            class="text-body-2 mb-1"
            style="color: var(--sidebar-text-secondary); line-height: 1.7;"
            v-html="renderText(item)"
          ></li>
        </ul>

        <!-- Code block -->
        <div v-else-if="block.type === 'code'" class="help-code-block rounded-lg pa-3">
          <code class="text-body-2" style="color: var(--accent-blue); font-family: 'Courier New', monospace;">{{ block.value }}</code>
        </div>

        <!-- Status badge (Electron-only articles) -->
        <div
          v-if="idx === 0 && article.status"
          class="help-status-badge rounded-lg pa-2 mb-4 d-flex align-center"
          :class="{
            'status-available': article.status === 'available',
            'status-coming-soon': article.status === 'coming_soon',
          }"
        >
          <v-icon size="16" class="mr-2" :icon="article.status === 'available' ? 'mdi-check-circle' : 'mdi-clock-outline'"></v-icon>
          <span class="text-caption font-weight-medium">
            {{ article.status === 'available' ? 'Disponivel nesta versao' : 'Em desenvolvimento - disponivel na versao Desktop' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import helpData from "../data/pt.json";

export default {
  name: "HelpArticle",
  props: {
    slug: { type: String, default: null },
    showBack: { type: Boolean, default: true },
  },
  emits: ["back", "navigate"],
  data: () => ({
    helpData: helpData,
  }),
  computed: {
    items() {
      return this.helpData.items || {};
    },
    article() {
      if (!this.slug) return null;
      return this.items[this.slug] || null;
    },
  },
  methods: {
    t(key) {
      return this.$t ? this.$t("modules.help." + key, key) : key;
    },
    renderText(text, link) {
      if (!text) return "";
      // Render the text with HTML (the site JSON uses <b> tags)
      let html = text;
      // Handle "link" property - wrap in a clickable span
      if (link) {
        // The link is already inline in the text, just note it for navigation
      }
      return html;
    },
  },
};
</script>

<style scoped>
.help-content h3 {
  border-left: 3px solid var(--accent-blue);
  padding-left: 12px;
  margin-top: 16px;
}
.help-list {
  list-style: none;
  padding-left: 0;
  margin-left: 12px;
}
.help-list li {
  position: relative;
  padding-left: 16px;
}
.help-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-blue);
  opacity: 0.6;
}
.help-code-block {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  overflow-x: auto;
}
.help-status-badge {
  border: 1px solid;
  margin-bottom: 8px;
}
.status-available {
  border-color: rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.08);
  color: #4caf50;
}
.status-coming-soon {
  border-color: rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.08);
  color: #ff9800;
}
</style>
