<template>
  <div class="version-comparison-card mx-6 mb-4 d-flex align-center justify-space-between">
    <!-- Versão Atual -->
    <div class="d-flex align-center" style="gap: 14px;">
      <div class="version-icon-box d-flex align-center justify-center">
        <v-icon size="26" color="var(--sidebar-text-secondary)">
          {{ icon }}
        </v-icon>
      </div>
      <div class="d-flex flex-column">
        <span class="version-label-sub" style="color: var(--sidebar-text-secondary);">
          {{ $t('modules.update.current_version') }}
        </span>
        <span class="version-number font-weight-bold" style="color: var(--sidebar-text);">
          {{ formatVersion(currentVersion) }}
        </span>
      </div>
    </div>

    <!-- Seta de transição -->
    <v-icon size="22" color="#009fe3" class="mx-3">
      mdi-arrow-right
    </v-icon>

    <!-- Nova Versão -->
    <div class="d-flex align-center" style="gap: 14px;">
      <div class="version-icon-box new-version-box d-flex align-center justify-center">
        <v-icon size="26" color="#009fe3">
          {{ icon }}
        </v-icon>
      </div>
      <div class="d-flex flex-column text-left">
        <span class="version-label-sub" style="color: var(--sidebar-text-secondary);">
          {{ $t('modules.update.new_version') }}
        </span>
        <span class="version-number font-weight-bold" style="color: #009fe3;">
          {{ formatVersion(targetVersion) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VersionComparison",
  props: {
    icon: {
      type: String,
      default: "mdi-monitor",
    },
    currentVersion: {
      type: [String, Number],
      required: true,
    },
    targetVersion: {
      type: [String, Number],
      required: true,
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
.version-comparison-card {
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 22px;
  min-height: 76px;
  box-sizing: border-box;
}

.version-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.new-version-box {
  background: rgba(0, 159, 227, 0.1);
  border: 1px solid rgba(0, 159, 227, 0.25);
}

.version-label-sub {
  font-size: 0.8rem;
  line-height: 1.2;
}

.version-number {
  font-size: 1.15rem;
  line-height: 1.3;
  margin-top: 2px;
  letter-spacing: 0.4px;
}

/* Modo Claro */
:deep(.v-theme--light) .version-comparison-card,
.v-theme--light .version-comparison-card {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

:deep(.v-theme--light) .version-icon-box,
.v-theme--light .version-icon-box {
  background: #edf2f7 !important;
}

:deep(.v-theme--light) .new-version-box,
.v-theme--light .new-version-box {
  background: rgba(0, 155, 226, 0.1) !important;
  border: 1px solid rgba(0, 155, 226, 0.3) !important;
}

:deep(.v-theme--light) .version-label-sub,
.v-theme--light .version-label-sub {
  color: #64748b !important;
}

:deep(.v-theme--light) .version-number,
.v-theme--light .version-number {
  color: #1e293b !important;
}
</style>
