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

<script>
export default {
  name: "CheckBoxComponent",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    disabled: Boolean,
    switch: Boolean,
  },
  emits: ["update:modelValue"],
  computed: {
    input: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    is_switch() {
      return this.switch;
    },
  },
};
</script>
