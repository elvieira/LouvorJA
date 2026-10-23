<template>
  <div class="uptodate-container px-6 py-8 d-flex flex-column align-center text-center">
    <div class="uptodate-icon-box mb-4 d-flex align-center justify-center">
      <v-icon size="36" color="#4caf50">
        mdi-check-circle-outline
      </v-icon>
    </div>

    <div class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.15rem;">
      {{ $t('modules.update.up_to_date_title') }}
    </div>

    <div class="text-caption mb-6" style="color: var(--sidebar-text-secondary); max-width: 340px; line-height: 1.5; font-size: 0.85rem;">
      {{ $t('modules.update.up_to_date_subtitle') }}
    </div>

    <!-- Cards informativos das versões instaladas -->
    <div class="d-flex align-center justify-center flex-wrap" style="gap: 12px; width: 100%; max-width: 380px;">
      <div class="version-chip d-flex align-center px-4 py-2 rounded-xl flex-grow-1 justify-space-between">
        <div class="d-flex align-center" style="gap: 8px;">
          <v-icon size="18" color="#009fe3">
            mdi-monitor
          </v-icon>
          <span class="text-caption" style="color: var(--sidebar-text-secondary);">{{ $t('modules.update.app_label') }}</span>
        </div>
        <span class="font-weight-bold text-caption" style="color: var(--sidebar-text);">
          {{ formatVersion(appVersion) }}
        </span>
      </div>

      <div class="version-chip d-flex align-center px-4 py-2 rounded-xl flex-grow-1 justify-space-between">
        <div class="d-flex align-center" style="gap: 8px;">
          <v-icon size="18" color="#009fe3">
            mdi-database
          </v-icon>
          <span class="text-caption" style="color: var(--sidebar-text-secondary);">{{ $t('modules.update.db_label') }}</span>
        </div>
        <span class="font-weight-bold text-caption" style="color: var(--sidebar-text);">
          {{ formatVersion(dbVersion) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UpToDateView",
  props: {
    appVersion: {
      type: [String, Number],
      default: "",
    },
    dbVersion: {
      type: [String, Number],
      default: "",
    },
  },
  methods: {
    formatVersion(v: string | number): string {
      const s = String(v || "").trim();
      if (!s) return "---";
      return s.startsWith("v") ? s : `v${s}`;
    },
  },
});
</script>

<style scoped>
.uptodate-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.25);
}

.version-chip {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Modo Claro */
:deep(.v-theme--light) .version-chip,
.v-theme--light .version-chip {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}
</style>
