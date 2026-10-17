<template>
  <v-expand-transition>
    <div 
      class="custom-liturgy-bar d-flex align-center flex-shrink-0" 
      @wheel.prevent="onWheelScroll"
    >
      <v-chip
        v-for="(liturgy, index) in customLiturgies"
        :key="index"
        :color="selectedCustomIndex === index ? 'primary' : undefined"
        variant="flat"
        class="custom-liturgy-chip font-weight-medium text-none pr-2 flex-shrink-0"
        :class="{ 'is-active': selectedCustomIndex === index }"
        @click="selectCustom(index)"
      >
        <v-icon
          start
          size="16"
          class="mr-1"
          :color="selectedCustomIndex === index ? 'white' : 'var(--sidebar-text-secondary)'"
        >
          mdi-star-outline
        </v-icon>
        <span>{{ liturgy.name }}</span>
        <v-icon
          icon="mdi-close-circle"
          size="16"
          class="ml-2 remove-custom-btn"
          @click.stop="removeCustom(index)"
        />
      </v-chip>
      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        class="new-custom-btn text-none font-weight-bold ml-1 flex-shrink-0"
        prepend-icon="mdi-plus"
        @click="addNew"
      >
        {{ labelNew }}
      </v-btn>
    </div>
  </v-expand-transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "CustomLiturgySelector",
  props: {
    customLiturgies: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    selectedCustomIndex: {
      type: Number as PropType<number>,
      default: 0,
    },
    labelNew: {
      type: String as PropType<string>,
      default: "Nova",
    },
  },
  emits: ["update:selectedCustomIndex", "remove-custom", "add-custom"],
  methods: {
    selectCustom(index: number) {
      this.$emit("update:selectedCustomIndex", index);
    },
    removeCustom(index: number) {
      this.$emit("remove-custom", index);
    },
    addNew() {
      this.$emit("add-custom");
    },
    onWheelScroll(e: WheelEvent) {
      if (e.deltaY !== 0) {
        (e.currentTarget as HTMLElement).scrollLeft += e.deltaY;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.custom-liturgy-bar {
  padding: 8px 24px;
  gap: 8px;
  overflow-x: auto;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  max-width: 100%;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.custom-liturgy-chip {
  border-radius: 10px !important;
  height: 32px !important;
  letter-spacing: 0;
  transition: all 0.2s ease;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  color: var(--sidebar-text-secondary, #94a3b8);

  &:not(.is-active):hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
    color: var(--sidebar-text, #ffffff);
    border-color: var(--border-color, rgba(255, 255, 255, 0.12));
  }

  &.is-active {
    background: #009fe3 !important;
    border-color: #009fe3 !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(0, 159, 227, 0.3);
  }

  .remove-custom-btn {
    opacity: 0.5;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      color: #ef4444 !important;
      transform: scale(1.15);
    }
  }
}

.new-custom-btn {
  height: 32px;
  border-radius: 10px;
  letter-spacing: 0;
}
</style>
