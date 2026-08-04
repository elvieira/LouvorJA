<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="modern-alert-card rounded-xl">
      <v-card-title class="pt-6 px-6">
        {{ t('custom_liturgy.new') }}
      </v-card-title>
      <v-card-text class="px-6 pb-2 pt-4">
        <v-text-field
          v-model="newCustomName"
          :placeholder="t('custom_liturgy.name_placeholder')"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="modern-input-no-thick"
          hide-details
          autofocus
          @keydown.enter="save"
        />
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-2 d-flex justify-end" style="gap: 12px;">
        <v-spacer />
        <v-btn
          color="error"
          variant="tonal"
          class="modern-alert-btn px-6"
          height="40"
          @click="$emit('update:modelValue', false)"
        >
          {{ t('actions.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="modern-alert-btn px-6"
          height="40"
          :disabled="!newCustomName.trim()"
          @click="save"
        >
          {{ t('actions.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NewCustomDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "save"],
  data: () => ({
    newCustomName: "" as string,
  }),
  watch: {
    modelValue(val) {
      if (val) {
        this.newCustomName = "";
      }
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    save() {
      if (this.newCustomName.trim()) {
        this.$emit("save", this.newCustomName.trim());
        this.$emit("update:modelValue", false);
      }
    },
  },
});
</script>
