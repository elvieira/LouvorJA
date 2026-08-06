<template>
  <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
    <div class="d-flex align-center" style="flex-shrink: 0;">
      <MenuToggleButton style="margin-right: 16px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />
      
      <div class="module-icon-box d-flex align-center justify-center mr-4" style="flex-shrink: 0; overflow: hidden;">
        <v-img
          v-if="image"
          :src="image"
          cover
          width="100%"
          height="100%"
        />
        <v-icon v-else :icon="icon" size="24" />
      </div>
      <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1; white-space: nowrap;">
        {{ title }}
      </h2>
    </div>
    
    <div class="module-header-actions d-flex align-center justify-end" style="max-width: 100%; flex: 1; overflow: visible;">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuToggleButton from "@/components/MenuToggleButton.vue";

withDefaults(defineProps<{
  title: string;
  icon?: string;
  image?: string;
}>(), {
  icon: "mdi-puzzle",
  image: undefined,
});

const toggleSidebar = () => {
  document.querySelector(".main-container")?.dispatchEvent(new CustomEvent("toggle-sidebar", { bubbles: true }));
};
</script>
