<template>
  <div class="help-sidebar d-flex flex-column" style="height: 100%; background: var(--card-bg); border-right: 1px solid var(--border-color);">
    <!-- Search -->
    <div class="pa-3 pb-2">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="outlined"
        :placeholder="t('search_placeholder')"
        hide-details
        clearable
        prepend-inner-icon="mdi-magnify"
        :color="'var(--accent-blue)'"
      >
        <template #clear="{ props }">
          <v-btn v-bind="props" icon size="x-small" variant="text">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </div>

    <!-- Category list -->
    <div class="flex-grow-1 overflow-y-auto px-2 pb-4" style="scrollbar-width: thin;">
      <!-- Search results -->
      <div v-if="searchQuery && searchQuery.length >= 2">
        <div v-if="searchResults.length === 0" class="text-caption text-center pa-4" style="color: var(--sidebar-text-secondary);">
          {{ t('no_results') }}
        </div>
        <div v-for="(item, idx) in searchResults" :key="'search-' + idx" class="mb-1">
          <div
            class="help-sidebar-item rounded-lg px-3 py-2 cursor-pointer"
            :class="{ 'active': activeSlug === item.slug }"
            @click="selectArticle(item.slug)"
          >
            <v-icon size="16" class="mr-2" :icon="'mdi-file-document-outline'" style="opacity: 0.6;"></v-icon>
            <span class="text-body-2" style="color: var(--sidebar-text);">{{ item.title }}</span>
          </div>
        </div>
      </div>

      <!-- Normal categories -->
      <div v-if="!searchQuery || searchQuery.length < 2">
        <div v-for="(cat, catKey) in categories" :key="catKey" class="mb-1">
          <div
            class="help-sidebar-category rounded-lg px-3 py-2 cursor-pointer d-flex align-center"
            :class="{ 'category-active': expandedCategories[catKey] }"
            @click="toggleCategory(catKey)"
          >
            <v-icon size="18" class="mr-2" :icon="cat.icon || 'mdi-folder-outline'" :color="'var(--accent-blue)'"></v-icon>
            <span class="text-body-2 font-weight-medium flex-grow-1" style="color: var(--sidebar-text);">{{ cat.title }}</span>
            <v-icon
              size="16"
              :icon="expandedCategories[catKey] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              style="opacity: 0.4;"
            ></v-icon>
          </div>
          <transition name="slide">
            <div v-if="expandedCategories[catKey]" class="ml-2 mt-1">
              <div
                v-for="slug in cat.items"
                :key="slug"
                class="help-sidebar-item rounded-lg px-3 py-1 cursor-pointer"
                :class="{ 'active': activeSlug === slug }"
                @click="selectArticle(slug)"
              >
                <span class="text-caption" style="color: var(--sidebar-text-secondary);">{{ getItemTitle(slug) }}</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import helpData from "../data/pt.json";

export default {
  name: "HelpSidebar",
  props: {
    activeSlug: { type: String, default: null },
  },
  emits: ["select-article"],
  data: () => ({
    searchQuery: "",
    expandedCategories: {},
    helpData: helpData,
  }),
  computed: {
    categories() {
      return this.helpData.categories || {};
    },
    items() {
      return this.helpData.items || {};
    },
    searchResults() {
      if (!this.searchQuery || this.searchQuery.length < 2) return [];
      const q = this.searchQuery.toLowerCase();
      const results = [];
      for (const [slug, item] of Object.entries(this.items)) {
        const titleMatch = item.title.toLowerCase().includes(q);
        const textMatch = item.text && item.text.some(t => {
          if (t.value && typeof t.value === "string") {
            return t.value.toLowerCase().includes(q);
          }
          if (t.value && Array.isArray(t.value)) {
            return t.value.some(v => v.toLowerCase().includes(q));
          }
          return false;
        });
        if (titleMatch || textMatch) {
          results.push({ slug, title: item.title });
        }
      }
      return results;
    },
  },
  mounted() {
    // Expand all categories by default
    for (const key of Object.keys(this.categories)) {
      this.expandedCategories[key] = true;
    }
  },
  methods: {
    t(key) {
      return this.$t ? this.$t("modules.help." + key, key) : key;
    },
    getItemTitle(slug) {
      return this.items[slug] ? this.items[slug].title : slug;
    },
    toggleCategory(catKey) {
      this.expandedCategories[catKey] = !this.expandedCategories[catKey];
    },
    selectArticle(slug) {
      this.$emit("select-article", slug);
    },
  },
};
</script>

<style scoped>
.help-sidebar-item {
  transition: background 0.15s ease;
}
.help-sidebar-item:hover {
  background: rgba(0, 151, 215, 0.08);
}
.help-sidebar-item.active {
  background: rgba(0, 151, 215, 0.15);
}
.help-sidebar-item.active span {
  color: var(--accent-blue) !important;
  font-weight: 500;
}
.help-sidebar-category {
  transition: background 0.15s ease;
  user-select: none;
}
.help-sidebar-category:hover {
  background: rgba(255, 255, 255, 0.04);
}
.help-sidebar-category.category-active {
  background: rgba(255, 255, 255, 0.06);
}
.cursor-pointer {
  cursor: pointer;
}
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  max-height: 600px;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
