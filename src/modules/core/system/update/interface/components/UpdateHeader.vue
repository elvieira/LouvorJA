<template>
  <div class="update-header-container px-6 pt-6 pb-4">
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center" style="gap: 16px;">
        <div 
          class="update-header-icon-box d-flex align-center justify-center flex-shrink-0"
          :style="{ background: iconBgColor }"
        >
          <v-icon size="26" color="white">
            {{ icon }}
          </v-icon>
        </div>
        <div>
          <div class="update-header-title font-weight-bold" style="color: var(--sidebar-text); font-size: 1.15rem; line-height: 1.25;">
            {{ title }}
          </div>
          <div class="update-header-subtitle text-caption mt-1" style="color: var(--sidebar-text-secondary); font-size: 0.85rem;">
            {{ subtitle }}
          </div>
        </div>
      </div>

      <v-btn
        v-if="canClose"
        variant="text"
        size="small"
        class="modal-close-btn"
        @click="$emit('close')"
      >
        <v-icon size="20">
          mdi-close
        </v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
          open-delay="200"
          content-class="sync-tooltip"
        >
          {{ $t('modules.update.close') }}
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UpdateHeader",
  props: {
    icon: {
      type: String,
      default: "mdi-monitor",
    },
    iconBgColor: {
      type: String,
      default: "#009fe3",
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    canClose: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close"],
});
</script>

<style scoped>
.update-header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 159, 227, 0.35);
}

.modal-close-btn {
  color: var(--sidebar-text-secondary);
  border-radius: 8px !important;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  color: var(--sidebar-text);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px !important;
}

/* Modo Claro */
:deep(.v-theme--light) .modal-close-btn,
.v-theme--light .modal-close-btn {
  color: #64748b !important;
}

:deep(.v-theme--light) .modal-close-btn:hover,
.v-theme--light .modal-close-btn:hover {
  color: #0f172a !important;
  background: rgba(0, 0, 0, 0.06) !important;
}
</style>
