<template>
  <div class="d-flex align-center justify-space-between">
    <div class="d-flex align-center">
      <v-icon :color="iconColor" class="mr-3" size="24">
        {{ icon }}
      </v-icon>
      <div>
        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
          {{ title }}
        </h3>
        <div class="text-caption" style="color: var(--sidebar-text-secondary);">
          {{ subtitle }}
        </div>
      </div>
    </div>
    <v-btn
      :variant="buttonVariant"
      :color="buttonColor"
      :elevation="buttonElevation"
      class="rounded-lg text-none font-weight-bold px-4"
      height="40"
      @click="$emit('action')"
    >
      {{ buttonText }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "SettingsActionRow",
  props: {
    icon: { type: String, required: true },
    iconColor: { type: String, default: "primary" },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    buttonText: { type: String, required: true },
    buttonColor: { type: String, default: "primary" },
    buttonVariant: { 
      type: String as PropType<"flat" | "text" | "elevated" | "tonal" | "outlined" | "plain">, 
      default: "tonal", 
    },
    buttonElevation: { type: [Number, String], default: 0 },
  },
  emits: ["action"],
});
</script>
