<template>
  <div class="px-6 py-4 flex-shrink-0" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <div 
      style="background: rgba(128, 128, 128, 0.15); border-radius: 12px; padding: 4px; display: flex; gap: 4px; width: 100%; overflow-x: auto;"
      @wheel.prevent="onWheelScroll"
    >
      <v-btn
        v-for="day in regularDays"
        :key="day.value"
        :color="selectedDay === day.value ? 'primary' : undefined"
        :variant="selectedDay === day.value ? 'flat' : 'text'"
        class="flex-grow-1 text-none font-weight-bold rounded-lg"
        :style="{ color: selectedDay === day.value ? '#fff' : 'var(--sidebar-text)', letterSpacing: 0, height: '40px', minWidth: isCompactView ? '50px' : '80px' }"
        @click="selectDay(day.value)"
      >
        {{ isCompactView ? day.label.substring(0, 3) : day.label }}
      </v-btn>
      
      <v-divider vertical class="mx-1 my-2" style="opacity: 0.1;" />

      <v-btn
        :color="selectedDay === 'custom' ? 'primary' : undefined"
        :variant="selectedDay === 'custom' ? 'flat' : 'text'"
        class="flex-grow-1 text-none font-weight-bold rounded-lg"
        :style="{ color: selectedDay === 'custom' ? '#fff' : 'var(--sidebar-text)', letterSpacing: 0, height: '40px', minWidth: isCompactView ? '0' : '100px' }"
        prepend-icon="mdi-star-outline"
        @click="selectDay('custom')"
      >
        {{ isCompactView ? 'Avul.' : (customDayLabel || 'Avulsa') }}
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
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
      type: Array,
      required: true,
    },
  },
  emits: ["update:selectedDay", "change"],
  computed: {
    regularDays() {
      return this.dayOptions.filter(d => d.value !== "custom");
    },
    customDayLabel() {
      const customDay = this.dayOptions.find(d => d.value === "custom");
      return customDay ? customDay.label : "";
    },
  },
  methods: {
    selectDay(day) {
      this.$emit("update:selectedDay", day);
      this.$emit("change", day);
    },
    onWheelScroll(e) {
      if (e.deltaY !== 0) {
        e.currentTarget.scrollLeft += e.deltaY;
      }
    },
  },
};
</script>
