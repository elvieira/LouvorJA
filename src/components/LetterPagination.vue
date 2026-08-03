<template>
  <div class="w-100 d-flex align-center">
    <v-btn
      color="primary"
      :variant="input < 0 ? 'flat' : 'tonal'"
      density="compact"
      class="me-1"
      @click="reset()"
    >
      {{ $t("components.letterpagination.all") }}
    </v-btn>

    <v-slide-group v-model="input" show-arrows center-active>
      <v-slide-group-item
        v-for="letter in letters"
        :key="letter"
        v-slot="{ isSelected, toggle }"
      >
        <v-btn
          icon
          color="primary"
          :variant="isSelected ? 'flat' : 'tonal'"
          density="compact"
          class="me-1"
          @click="toggle"
        >
          {{ letter }}
        </v-btn>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  modelValue?: string;
}>(), {
  modelValue: "",
});

const emit = defineEmits(["update:modelValue"]);

const letters = [
  "#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
];

const input = computed({
  get() {
    return letters.indexOf(props.modelValue);
  },
  set(value: number) {
    emit("update:modelValue", letters[value] ?? "");
  },
});

const reset = () => {
  input.value = -1;
};
</script>
