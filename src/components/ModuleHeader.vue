<template>
  <div class="search-header flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; padding-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap; gap: 32px;">
    <div class="d-flex align-center min-w-0" style="flex: 0 1 auto; min-width: 0; max-width: 60%;">
      <MenuToggleButton style="margin-right: 16px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />
      
      <slot name="prefix" />
      
      <div class="module-icon-box d-flex align-center justify-center mr-4 flex-shrink-0" style="overflow: hidden;">
        <v-img
          v-if="image"
          :src="image"
          cover
          width="100%"
          height="100%"
        />
        <v-icon v-else :icon="icon" size="24" />
      </div>
      <div class="d-flex flex-column justify-center min-w-0" style="flex: 1 1 auto; overflow: hidden; padding-right: 20px;">
        <h2
          class="section-title mb-0 text-truncate"
          :title="title"
          style="color: var(--sidebar-text); font-size: 22px; font-weight: 600; line-height: 1.2;"
        >
          {{ title }}
        </h2>
        <span
          v-if="subtitle"
          class="section-subtitle text-truncate"
          :title="subtitle"
          style="color: var(--sidebar-text-secondary); font-size: 13px; font-weight: 400; margin-top: 4px;"
        >
          {{ subtitle }}
        </span>
      </div>
      <slot name="title-actions" />
    </div>
    
    <div class="module-header-actions d-flex align-center justify-end" style="flex: 1 1 auto; min-width: 0; max-width: 100%; overflow: visible;">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuToggleButton from "@/components/MenuToggleButton.vue";

withDefaults(defineProps<{
  title: string;
  subtitle?: string;
  icon?: string;
  image?: string;
}>(), {
  subtitle: undefined,
  icon: "mdi-puzzle",
  image: undefined,
});

const toggleSidebar = () => {
  document.querySelector(".main-container")?.dispatchEvent(new CustomEvent("toggle-sidebar", { bubbles: true }));
};
</script>
