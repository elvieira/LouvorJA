<template>
  <v-expand-transition>
    <div 
      class="px-6 py-3 d-flex align-center flex-shrink-0 custom-liturgy-scroll" 
      style="gap: 8px; overflow-x: auto; background: rgba(128, 128, 128, 0.1); border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05)); max-width: 100%;"
      @wheel.prevent="onWheelScroll"
    >
      <v-chip
        v-for="(liturgy, index) in customLiturgies"
        :key="index"
        :color="selectedCustomIndex === index ? 'primary' : 'default'"
        :variant="selectedCustomIndex === index ? 'flat' : 'elevated'"
        class="font-weight-medium text-none pr-2 flex-shrink-0"
        style="box-shadow: 0 2px 5px rgba(0,0,0,0.05);"
        @click="selectCustom(index)"
      >
        {{ liturgy.name }}
        <v-icon
          icon="mdi-close-circle"
          size="18"
          class="ml-2"
          style="opacity: 0.6; cursor: pointer;"
          @click.stop="removeCustom(index)"
        />
      </v-chip>
      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        rounded="lg"
        class="text-none font-weight-bold ml-2 flex-shrink-0"
        prepend-icon="mdi-plus"
        @click="addNew"
      >
        {{ labelNew }}
      </v-btn>
    </div>
  </v-expand-transition>
</template>

<script>
export default {
  name: "CustomLiturgySelector",
  props: {
    customLiturgies: {
      type: Array,
      default: () => [],
    },
    selectedCustomIndex: {
      type: Number,
      default: 0,
    },
    labelNew: {
      type: String,
      default: "Nova",
    },
  },
  emits: ["update:selectedCustomIndex", "remove-custom", "add-custom"],
  methods: {
    selectCustom(index) {
      this.$emit("update:selectedCustomIndex", index);
    },
    removeCustom(index) {
      this.$emit("remove-custom", index);
    },
    addNew() {
      this.$emit("add-custom");
    },
    onWheelScroll(e) {
      if (e.deltaY !== 0) {
        e.currentTarget.scrollLeft += e.deltaY;
      }
    },
  },
};
</script>
