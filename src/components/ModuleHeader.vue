<template>
  <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
    <div class="d-flex align-center" style="flex-shrink: 0;">
      <MenuToggleButton style="margin-right: 16px; flex-shrink: 0;" @toggle-sidebar="toggleSidebar" />
      
      <div class="module-icon-box d-flex align-center justify-center mr-4" style="flex-shrink: 0;">
        <v-icon :icon="icon" size="24" />
      </div>
      <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1; white-space: nowrap;">
        {{ title }}
      </h2>
    </div>
    
    <div class="d-flex align-center" style="max-width: 100%; overflow-x: auto;">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default defineComponent({
  name: "ModuleHeader",
  components: {
    MenuToggleButton,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "mdi-puzzle",
    },
  },
  methods: {
    toggleSidebar() {
      document.querySelector(".main-container")?.dispatchEvent(new CustomEvent("toggle-sidebar", { bubbles: true }));
    },
  },
});
</script>
