<template>
  <v-switch
    v-if="is_switch"
    v-model="input"
    :color="$theme.primary()"
    :disabled="disabled"
    :label="label"
    density="compact"
    hide-details
  />
  <v-checkbox
    v-else
    v-model="input"
    :color="$theme.primary()"
    :disabled="disabled"
    :label="label"
    density="compact"
    hide-details
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
  switch?: boolean;
}>(), {
  modelValue: false,
  label: "",
  disabled: false,
  switch: false,
});

const emit = defineEmits(["update:modelValue"]);

const input = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const is_switch = computed(() => props.switch);
</script>
