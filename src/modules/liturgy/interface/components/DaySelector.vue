<template>
  <div class="day-selector-wrapper">
    <div 
      class="day-selector-track"
      @wheel.prevent="onWheelScroll"
    >
      <v-btn
        v-for="day in regularDays"
        :key="day.value"
        :color="selectedDay === day.value ? 'primary' : undefined"
        :variant="selectedDay === day.value ? 'flat' : 'text'"
        class="day-pill-btn flex-grow-1 text-none font-weight-bold rounded-lg"
        :class="{ 'is-active': selectedDay === day.value }"
        :style="{ height: '38px', minWidth: isCompactView ? '50px' : '75px' }"
        @click="selectDay(day.value)"
      >
        <span class="day-label">{{ isCompactView ? day.label.substring(0, 3) : day.label }}</span>
        <v-tooltip
          v-if="isCompactView"
          activator="parent"
          location="bottom"
          open-delay="200"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ day.label }}
        </v-tooltip>
      </v-btn>
      
      <div class="day-selector-divider" />

      <v-btn
        :color="selectedDay === 'custom' ? 'primary' : undefined"
        :variant="selectedDay === 'custom' ? 'flat' : 'text'"
        class="day-pill-btn flex-grow-1 text-none font-weight-bold rounded-lg"
        :class="{ 'is-active': selectedDay === 'custom' }"
        :style="{ height: '38px', minWidth: isCompactView ? '60px' : '95px' }"
        prepend-icon="mdi-star-outline"
        @click="selectDay('custom')"
      >
        <span class="day-label">{{ isCompactView ? 'Avul.' : (customDayLabel || 'Avulsa') }}</span>
        <v-tooltip
          v-if="isCompactView"
          activator="parent"
          location="bottom"
          open-delay="200"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ customDayLabel || 'Avulsa' }}
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "DaySelector",
  props: {
    selectedDay: {
      type: String,
      default: "sunday",
    },
    isCompactView: {
      type: Boolean,
      default: false,
    },
    dayOptions: {
      type: Array as PropType<{value: string, label: string}[]>,
      required: true,
    },
  },
  emits: ["update:selectedDay", "change"],
  computed: {
    regularDays(): {value: string, label: string}[] {
      return this.dayOptions.filter(d => d.value !== "custom");
    },
    customDayLabel(): string {
      const customDay = this.dayOptions.find(d => d.value === "custom");
      return customDay ? customDay.label : "";
    },
  },
  methods: {
    selectDay(day: string) {
      this.$emit("update:selectedDay", day);
      this.$emit("change", day);
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
.day-selector-wrapper {
  padding: 12px 24px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.day-selector-track {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  padding: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.day-pill-btn {
  letter-spacing: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--sidebar-text-secondary, #94a3b8);
  position: relative;

  &:not(.is-active):hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(var(--v-theme-on-surface), 0.05) !important;
  }

  &.is-active {
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(0, 159, 227, 0.25);
  }
}

.day-label {
  font-size: 0.88rem;
}

.day-selector-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color, rgba(255, 255, 255, 0.08));
  margin: 0 2px;
  flex-shrink: 0;
}
</style>
