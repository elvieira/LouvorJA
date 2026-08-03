<template>
  <v-snackbar
    :model-value="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="bottom right"
    variant="flat"
    class="mb-4 mr-4"
    @update:model-value="(val) => appdata.set('snackbar.show', val)"
  >
    <div class="d-flex align-center">
      <v-progress-circular
        v-if="snackbar.loading"
        indeterminate
        color="white"
        size="20"
        width="2"
        class="mr-3"
      />
      <span class="text-body-2 font-weight-medium text-white">{{ snackbar.text }}</span>
    </div>
    <template #actions>
      <v-btn
        color="white"
        variant="text"
        size="small"
        icon="mdi-close"
        @click="appdata.set('snackbar.show', false)"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppData } from "@/composables/useHelpers";

defineOptions({ name: "AppSnackbar" });

const appdata = useAppData();

const snackbar = computed(() => ({
  show: appdata.get("snackbar.show") || false,
  text: appdata.get("snackbar.text") || "",
  loading: appdata.get("snackbar.loading") || false,
  color: appdata.get("snackbar.color") || "primary",
  timeout: appdata.get("snackbar.timeout") || 5000,
}));
</script>
