<template>
  <div class="settings-container mx-auto pb-4" style="max-width: 600px;">
    <!-- App Info Card -->
    <v-card class="settings-card rounded-xl mb-6 overflow-hidden" flat style="background: var(--card-bg); box-shadow: var(--shadow); position: relative; border: 1px solid var(--border-color);">
      <!-- Subtle gradient background -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(0, 151, 215, 0.15) 0%, transparent 60%); pointer-events: none;" />
      
      <v-card-text class="pa-8 d-flex flex-column align-center text-center" style="position: relative; z-index: 1;">
        <!-- Logo with glow -->
        <div class="mb-5 rounded-circle d-flex align-center justify-center" style="width: 100px; height: 100px; background: rgba(0, 151, 215, 0.05); border: 1px solid var(--border-color); box-shadow: 0 8px 32px rgba(0, 151, 215, 0.15); backdrop-filter: blur(10px);">
          <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 64px; height: 64px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));" />
        </div>
        
        <!-- Title & Badge -->
        <div class="d-flex flex-column align-center justify-center mb-4">
          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.5rem; letter-spacing: -0.02em;">
            LOUVOR JA
          </h3>
          <span
            style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 4px; border: 1px solid rgba(0, 132, 193, 0.35); display: inline-flex; align-items: center; color: #0084C1; background-color: rgba(0, 132, 193, 0.15); font-size: 11px; padding: 2px 10px;"
          >
            FLUTE
          </span>
        </div>
        
        <!-- Description -->
        <p class="text-body-1 px-sm-6 mb-6" style="color: var(--sidebar-text-secondary); line-height: 1.6; max-width: 450px;">
          {{ $t('modules.help.app_desc') }}
        </p>

        <!-- Version Pill -->
        <div class="text-caption font-weight-bold" style="color: var(--sidebar-text-secondary); background: var(--main-bg); padding: 6px 16px; border-radius: 20px; box-shadow: inset 0 0 0 1px var(--border-color);">
          {{ $t('modules.help.version', { version: appVersion }) }}
        </div>
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
          @action="$emit('open-manual')"
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
  emits: ["open-update", "open-manual"],
});
</script>
