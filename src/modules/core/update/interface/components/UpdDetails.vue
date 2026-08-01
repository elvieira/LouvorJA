<template>
  <div>
    <!-- Conteúdo Carregando -->
    <div v-if="updateStatus === 'checking' || (updateStatus === 'idle' && !updateVersion)" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular
        indeterminate
        color="primary"
        size="32"
        class="mb-3"
      />
      <div class="text-body-2" style="color: var(--sidebar-text-secondary);">
        {{ $t('modules.update.fetching_details') }}
      </div>
    </div>
    
    <!-- Não há atualizações -->
    <div v-else-if="updateStatus === 'not-available'" style="padding: 40px 24px; text-align: center;">
      <v-icon color="success" size="64" class="mb-4">
        mdi-check-circle-outline
      </v-icon>
      <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
        {{ $t('modules.update.app_updated_title') }}
      </div>
      <div class="text-body-2" style="color: var(--sidebar-text-secondary); max-width: 300px; margin: 0 auto;">
        {{ $t('modules.update.app_updated_desc') }}
      </div>
    </div>

    <!-- Release Notes -->
    <div v-else-if="releaseNotes" style="padding: 20px 24px; max-height: 320px; overflow-y: auto;">
      <div class="text-subtitle-2 font-weight-bold mb-3" style="color: var(--sidebar-text);">
        <v-icon size="18" class="mr-1" color="primary">
          mdi-text-box-outline
        </v-icon>
        {{ $t('modules.update.whats_new') }}
      </div>
      <!-- eslint-disable vue/no-v-html -->
      <div 
        class="release-notes-content text-body-2"
        style="color: var(--sidebar-text-secondary); line-height: 1.7;"
        v-html="releaseNotes"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>

    <!-- Sem notas informadas -->
    <div v-else style="padding: 30px 24px; text-align: center; opacity: 0.7;">
      <v-icon size="40" color="primary" class="mb-3">
        mdi-update
      </v-icon>
      <div class="text-body-2" style="color: var(--sidebar-text-secondary);">
        {{ $t('modules.update.no_release_notes') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UpdateContent",
  props: {
    updateStatus: {
      type: String,
      required: true,
    },
    updateVersion: {
      type: String,
      default: "",
    },
    releaseNotes: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped>
.release-notes-content :deep(h1),
.release-notes-content :deep(h2),
.release-notes-content :deep(h3) {
  font-size: 1.1em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: var(--sidebar-text);
}
.release-notes-content :deep(ul),
.release-notes-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 1em;
}
.release-notes-content :deep(p) {
  margin-bottom: 1em;
}
.release-notes-content :deep(a) {
  color: var(--accent-blue);
  text-decoration: none;
}
.release-notes-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
