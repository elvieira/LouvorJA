<template>
  <v-dialog
    :model-value="modelValue"
    width="440"
    max-width="440"
    :theme="$theme.primary()"
    content-class="liturgy-dialog-wrapper new-custom-dialog-wrapper"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="modern-custom-dialog-card rounded-xl">
      <!-- Modal Header -->
      <div class="modal-header d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3">
            <v-icon color="#009fe3" size="22">
              mdi-star-outline
            </v-icon>
          </div>
          <div>
            <h2 class="modal-title font-weight-bold">
              {{ t('custom_liturgy.new') }}
            </h2>
            <p class="modal-subtitle mb-0">
              {{ t('custom_liturgy.name_placeholder') }}
            </p>
          </div>
        </div>
        <v-btn
          icon
          size="small"
          variant="text"
          class="modal-close-btn"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <!-- Modal Body -->
      <v-card-text class="px-6 py-5">
        <label class="form-label mb-2 d-block text-caption font-weight-bold">
          {{ t('fields.name') }}
        </label>
        <v-text-field
          v-model="newCustomName"
          :placeholder="t('custom_liturgy.name_placeholder')"
          variant="solo"
          flat
          rounded="lg"
          density="comfortable"
          class="standard-text-input"
          hide-details
          autofocus
          @keydown.enter="save"
        />
      </v-card-text>

      <!-- Modal Actions -->
      <v-card-actions class="px-6 pb-5 pt-2 d-flex justify-end" style="gap: 12px;">
        <v-spacer />
        <v-btn
          variant="tonal"
          class="text-none font-weight-medium px-5"
          height="38"
          rounded="lg"
          @click="$emit('update:modelValue', false)"
        >
          {{ t('actions.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="text-none font-weight-bold px-6"
          height="38"
          rounded="lg"
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

<!-- Unscoped wrapper style to constrain width -->
<style lang="scss">
.new-custom-dialog-wrapper {
  max-width: 440px !important;
  width: 100% !important;
  margin: 0 auto !important;
}
</style>

<style lang="scss" scoped>
.modern-custom-dialog-card {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45) !important;
  border-radius: 16px !important;
  max-width: 440px !important;
  width: 100% !important;
  margin: 0 auto;
  overflow: hidden;
}

.modal-header {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0, 159, 227, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  color: var(--sidebar-text, #ffffff);
  font-size: 1.05rem;
  line-height: 1.25;
  margin: 0;
}

.modal-subtitle {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.8rem;
  line-height: 1.25;
}

.modal-close-btn {
  color: var(--sidebar-text-secondary, #94a3b8);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(var(--v-theme-on-surface), 0.08);
  }
}

.form-label {
  color: var(--sidebar-text-secondary, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.standard-text-input {
  :deep(.v-field) {
    background: rgba(var(--v-theme-on-surface), 0.05) !important;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
    border-radius: 10px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.4) !important;
    }

    &.v-field--focused {
      border-color: rgba(var(--v-theme-primary), 0.9) !important;
      box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2) !important;
    }
  }

  :deep(input) {
    color: var(--sidebar-text, #ffffff) !important;
    font-size: 0.95rem;
  }
}

// Light theme support
:root[data-theme="light"],
.v-theme--light {
  .modern-custom-dialog-card {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12) !important;
  }

  .modal-header {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
  }

  .modal-title {
    color: #1e293b;
  }

  .modal-subtitle {
    color: #64748b;
  }

  .form-label {
    color: #64748b;
  }

  .standard-text-input {
    :deep(.v-field) {
      background: #f8fafc !important;
      border-color: rgba(0, 0, 0, 0.1) !important;
    }

    :deep(input) {
      color: #1e293b !important;
    }
  }
}
</style>
