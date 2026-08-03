<template>
  <v-text-field
    v-model="input"
    :color="$theme.primary()"
    :disabled="disabled"
    :label="label"
    prepend-inner-icon="mdi-magnify"
    :append-inner-icon="input ? 'mdi-close' : ''"
    density="compact"
    variant="outlined"
    :hide-details="!disabled"
    :hint="disabled ? disabledHint : ''"
    :persistent-hint="disabled"
    :loading="disabled"
    :error="error"
    @click:append-inner="reset()"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  modelValue?: string;
  label?: string;
  disabled?: boolean;
  disabledHint?: string;
  error?: boolean;
}>(), {
  modelValue: "",
  label: "",
  disabled: false,
  disabledHint: "",
  error: false,
});

const emit = defineEmits(["update:modelValue"]);

const input = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit("update:modelValue", value);
  },
});

const reset = () => {
  input.value = "";
};
</script>
