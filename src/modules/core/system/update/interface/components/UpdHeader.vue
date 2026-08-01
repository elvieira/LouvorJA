<template>
  <div style="background: linear-gradient(135deg, rgba(0,151,215,0.15) 0%, rgba(0,151,215,0.05) 100%); padding: 24px 24px 20px;">
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center" style="gap: 12px;">
        <div>
          <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
            {{ updateStatus === 'not-available' ? $t('modules.update.all_updated') : $t('modules.update.new_version') }}
          </div>
          <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
            {{ updateVersion ? 'v' + updateVersion : (updateStatus === 'not-available' ? $t('modules.update.no_pending') : $t('modules.update.processing')) }}
          </div>
        </div>
      </div>
      <v-btn icon variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
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
    updateStatus: {
      type: String,
      required: true,
    },
    updateVersion: {
      type: String,
      default: "",
    },
  },
  emits: ["close"],
});
</script>
