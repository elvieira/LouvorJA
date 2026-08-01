<template>
  <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
    <!-- App Info Card -->
    <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6 d-flex flex-column align-center text-center">
        <div class="mb-4 rounded-circle d-flex align-center justify-center" style="width: 96px; height: 96px; background: rgba(0, 151, 215, 0.05); border: 1px solid var(--border-color);">
          <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 56px; height: 56px;" />
        </div>
        <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.5rem; letter-spacing: -0.02em;">
          Louvor JA
        </h3>
        <div class="text-body-2 font-weight-medium mb-6" style="color: var(--sidebar-text-secondary); background: var(--main-bg); padding: 4px 12px; border-radius: 20px; box-shadow: inset 0 0 0 1px var(--border-color);">
          {{ $t('modules.help.version', { version: appVersion }) }}
        </div>
        <p class="text-body-2 px-4" style="color: var(--sidebar-text-secondary); line-height: 1.6;">
          {{ $t('modules.help.app_desc') }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Helpful Links Card -->
    <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <SettingsActionRow
          icon="mdi-book-open-page-variant"
          :title="$t('modules.help.manual_title')"
          :subtitle="$t('modules.help.manual_desc')"
          :button-text="$t('modules.help.manual_btn')"
          class="mb-8"
        />
    
        <v-divider class="mb-8" style="opacity: 0.1;" />
    
        <SettingsActionRow
          icon="mdi-chat-question"
          :title="$t('modules.help.support_title')"
          :subtitle="$t('modules.help.support_desc')"
          :button-text="$t('modules.help.support_btn')"
        />
      </v-card-text>
    </v-card>

    <!-- System Actions Card -->
    <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <SettingsActionRow
          icon="mdi-rocket-launch"
          :title="$t('modules.help.updates_title')"
          :subtitle="$t('modules.help.updates_desc')"
          :button-text="$t('modules.help.updates_btn')"
          button-variant="flat"
          button-elevation="2"
          class="mb-8"
          @action="$emit('open-update')"
        />
    
        <v-divider class="mb-8" style="opacity: 0.1;" />
    
        <SettingsActionRow
          icon="mdi-text-box-search-outline"
          icon-color="grey"
          :title="$t('modules.help.diagnostics_title')"
          :subtitle="$t('modules.help.diagnostics_desc')"
          :button-text="$t('modules.help.diagnostics_btn')"
          button-color="grey"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SettingsActionRow from "@/components/SettingsActionRow.vue";

export default defineComponent({
  name: "HelpAbout",
  components: {
    SettingsActionRow,
  },
  props: {
    appVersion: {
      type: String,
      required: true,
    },
  },
  emits: ["open-update"],
});
</script>
