<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex flex-column" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 50; background: var(--main-bg);">

      <!-- Header -->
      <div class="search-header flex-shrink-0" style="padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-color); background: var(--card-bg);">
        <div class="d-flex align-center" style="flex-shrink: 0;">
          <MenuToggleButton style="margin-right: 12px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />
          <div class="module-icon-box d-flex align-center justify-center mr-3" style="flex-shrink: 0;">
            <v-icon :icon="manifest.icon || 'mdi-help-circle-outline'" size="22" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 20px; font-weight: 600; line-height: 1; white-space: nowrap;">
            {{ t('title') }}
          </h2>
        </div>

        <div class="d-flex align-center">
          <v-tabs v-model="activeTab" color="var(--accent-blue)" density="comfortable">
            <v-tab :value="'guide'">
              <v-icon size="16" class="mr-1">mdi-book-open-variant</v-icon>
              {{ t('guide') }}
            </v-tab>
            <v-tab :value="'about'">
              <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
              {{ t('about') }}
            </v-tab>
            <v-tab :value="'credits'">
              <v-icon size="16" class="mr-1">mdi-account-group</v-icon>
              {{ t('credits') }}
            </v-tab>
          </v-tabs>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-grow-1 d-flex overflow-hidden">

        <!-- Guide Tab: Sidebar + Article -->
        <template v-if="activeTab === 'guide'">
          <div class="help-sidebar-wrapper flex-shrink-0" style="width: 280px; border-right: 1px solid var(--border-color);">
            <HelpSidebar
              :activeSlug="activeSlug"
              @select-article="onSelectArticle"
            />
          </div>
          <div class="flex-grow-1" style="background: var(--main-bg);">
            <HelpArticle
              :slug="activeSlug"
              :showBack="!!activeSlug"
              @back="activeSlug = null"
            />
          </div>
        </template>

        <!-- About Tab -->
        <template v-if="activeTab === 'about'">
          <div class="flex-grow-1" style="background: var(--main-bg);">
            <HelpAbout @go-to-guide="activeTab = 'guide'" />
          </div>
        </template>

        <!-- Credits Tab -->
        <template v-if="activeTab === 'credits'">
          <div class="flex-grow-1" style="background: var(--main-bg);">
            <HelpCredits />
          </div>
        </template>

      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import HelpSidebar from "../components/HelpSidebar.vue";
import HelpArticle from "../components/HelpArticle.vue";
import HelpAbout from "../components/HelpAbout.vue";
import HelpCredits from "../components/HelpCredits.vue";

export default {
  name: "HelpModule",
  components: {
    MenuToggleButton,
    HelpSidebar,
    HelpArticle,
    HelpAbout,
    HelpCredits,
  },
  data: () => ({
    manifest,
    activeTab: "guide",
    activeSlug: null,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
  },
  methods: {
    t(key) {
      return this.$t ? this.$t("modules.help." + key, key) : key;
    },
    toggleSidebar() {
      document.querySelector('.main-container')?.dispatchEvent(new CustomEvent('toggle-sidebar', { bubbles: true }));
    },
    onSelectArticle(slug) {
      this.activeSlug = slug;
    },
  },
};
</script>

<style scoped>
.help-sidebar-wrapper {
  background: var(--card-bg);
  overflow: hidden;
}
</style>
