<template>
  <div class="combined-updates-container px-6 flex-grow-1 min-h-0 d-flex flex-column" style="gap: 12px;">
    <!-- Card 1: Atualização do Aplicativo -->
    <div class="combined-item-card pa-4 d-flex flex-column">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center" style="gap: 14px;">
          <v-icon size="26" color="#009fe3">
            mdi-monitor
          </v-icon>
          <div>
            <div class="font-weight-bold" style="color: var(--sidebar-text); font-size: 0.95rem; line-height: 1.2;">
              {{ $t('modules.update.app_label') }}
            </div>
            <div class="d-flex align-center mt-1" style="gap: 8px; font-size: 0.85rem;">
              <span style="color: var(--sidebar-text-secondary);">{{ formatVersion(appCurrentVersion) }}</span>
              <v-icon size="14" color="#009fe3">
                mdi-arrow-right
              </v-icon>
              <span class="font-weight-bold" style="color: #009fe3;">{{ formatVersion(appTargetVersion) }}</span>
            </div>
          </div>
        </div>

        <v-btn
          variant="flat"
          size="small"
          rounded="lg"
          class="btn-details-toggle text-none font-weight-medium px-3"
          :append-icon="showAppDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showAppDetails = !showAppDetails"
        >
          {{ showAppDetails ? $t('modules.update.hide_details') : $t('modules.update.see_details') }}
        </v-btn>
      </div>

      <!-- Detalhes expandidos do Aplicativo -->
      <v-expand-transition>
        <div v-if="showAppDetails" class="combined-details-panel mt-3 pt-3">
          <ReleaseAccordion
            :releases="appReleases"
            :single-notes="appReleaseNotes"
            :latest-version-number="appTargetVersion"
          />
          <div class="d-flex justify-end mt-3">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              rounded="lg"
              class="text-none font-weight-bold px-4"
              prepend-icon="mdi-download"
              :loading="isAppUpdating"
              :disabled="isDbUpdating"
              @click="$emit('update-app')"
            >
              {{ $t('modules.update.update_app') }}
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>

    <!-- Card 2: Atualização do Banco de Dados -->
    <div class="combined-item-card pa-4 d-flex flex-column">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center" style="gap: 14px;">
          <v-icon size="26" color="#009fe3">
            mdi-database
          </v-icon>
          <div>
            <div class="font-weight-bold" style="color: var(--sidebar-text); font-size: 0.95rem; line-height: 1.2;">
              {{ $t('modules.update.db_label') }}
            </div>
            <div class="d-flex align-center mt-1" style="gap: 8px; font-size: 0.85rem;">
              <span style="color: var(--sidebar-text-secondary);">{{ formatVersion(dbCurrentVersion) }}</span>
              <v-icon size="14" color="#009fe3">
                mdi-arrow-right
              </v-icon>
              <span class="font-weight-bold" style="color: #009fe3;">{{ formatVersion(dbTargetVersion) }}</span>
            </div>
          </div>
        </div>

        <v-btn
          variant="flat"
          size="small"
          rounded="lg"
          class="btn-details-toggle text-none font-weight-medium px-3"
          :append-icon="showDbDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showDbDetails = !showDbDetails"
        >
          {{ showDbDetails ? $t('modules.update.hide_details') : $t('modules.update.see_details') }}
        </v-btn>
      </div>

      <!-- Detalhes expandidos do Banco -->
      <v-expand-transition>
        <div v-if="showDbDetails" class="combined-details-panel mt-3 pt-3">
          <div class="text-caption px-1 mb-2" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
            {{ dbReleaseNotes || $t('modules.update.no_notes_available') }}
          </div>
          <div class="d-flex justify-end mt-3">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              rounded="lg"
              class="text-none font-weight-bold px-4"
              prepend-icon="mdi-download"
              :loading="isDbUpdating"
              :disabled="isAppUpdating"
              @click="$emit('update-db')"
            >
              {{ $t('modules.update.update_db') }}
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import ReleaseAccordion, { type ReleaseViewItem } from "./ReleaseAccordion.vue";

export default defineComponent({
  name: "CombinedUpdatesView",
  components: {
    ReleaseAccordion,
  },
  props: {
    appCurrentVersion: {
      type: [String, Number],
      required: true,
    },
    appTargetVersion: {
      type: [String, Number],
      required: true,
    },
    appReleases: {
      type: Array as PropType<ReleaseViewItem[]>,
      default: () => [],
    },
    appReleaseNotes: {
      type: String,
      default: "",
    },
    dbCurrentVersion: {
      type: [String, Number],
      required: true,
    },
    dbTargetVersion: {
      type: [String, Number],
      required: true,
    },
    dbReleaseNotes: {
      type: String,
      default: "",
    },
    isAppUpdating: {
      type: Boolean,
      default: false,
    },
    isDbUpdating: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update-app", "update-db"],
  data() {
    return {
      showAppDetails: false,
      showDbDetails: false,
    };
  },
  methods: {
    formatVersion(v: string | number): string {
      const s = String(v || "").trim();
      return s.startsWith("v") ? s : `v${s}`;
    },
  },
});
</script>

<style scoped>
.combined-item-card {
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 20px !important;
  transition: all 0.2s ease;
}

.combined-item-card:hover {
  border-color: rgba(0, 159, 227, 0.25);
}

.btn-details-toggle {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.8)) !important;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-details-toggle:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  color: #ffffff !important;
}

.combined-details-panel {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.combined-details-panel :deep(.release-accordion-container) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.combined-details-panel :deep(.releases-scroll-area) {
  max-height: none !important;
  overflow-y: visible !important;
}

/* Modo Claro */
:deep(.v-theme--light) .combined-item-card,
.v-theme--light .combined-item-card {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

:deep(.v-theme--light) .combined-item-card:hover,
.v-theme--light .combined-item-card:hover {
  border-color: rgba(0, 155, 226, 0.35) !important;
}

:deep(.v-theme--light) .btn-details-toggle,
.v-theme--light .btn-details-toggle {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}

:deep(.v-theme--light) .btn-details-toggle:hover,
.v-theme--light .btn-details-toggle:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}

:deep(.v-theme--light) .combined-details-panel,
.v-theme--light .combined-details-panel {
  border-top: 1px solid #e2e8f0 !important;
}
</style>
