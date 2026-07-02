<template>
  <div class="help-about pa-6" style="max-width: 700px; height: 100%; overflow-y: auto; scrollbar-width: thin;">
    <div class="mx-auto" style="max-width: 600px;">

      <!-- App Info Card -->
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6 d-flex flex-column align-center text-center">
          <div class="mb-4 rounded-circle d-flex align-center justify-center" style="width: 96px; height: 96px; background: rgba(0, 151, 215, 0.05); border: 1px solid var(--border-color);">
            <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 56px; height: 56px;" />
          </div>
          <h3 class="font-weight-bold mb-1" style="color: var(--sidebar-text); font-size: 1.5rem; letter-spacing: -0.02em;">Louvor JA</h3>
          <div class="text-body-2 font-weight-medium mb-6" style="color: var(--sidebar-text-secondary); background: var(--main-bg); padding: 4px 12px; border-radius: 20px; box-shadow: inset 0 0 0 1px var(--border-color);">
            {{ t('about_version') }} {{ appVersion }} ({{ t('about_beta') }})
          </div>
          <p class="text-body-2 px-4" style="color: var(--sidebar-text-secondary); line-height: 1.6;">
            {{ t('about_description') }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Helpful Links Card -->
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-space-between mb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="24">mdi-book-open-page-variant</v-icon>
              <div>
                <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">{{ t('manual') }}</h3>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">{{ t('manual_desc') }}</div>
              </div>
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              class="rounded-lg text-none font-weight-bold px-4"
              height="40"
              @click="$emit('go-to-guide')"
            >
              {{ t('access') }}
            </v-btn>
          </div>

          <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>

          <div class="d-flex align-center justify-space-between mb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="24">mdi-chat-question</v-icon>
              <div>
                <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">{{ t('support') }}</h3>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">{{ t('support_desc') }}</div>
              </div>
            </div>
            <v-btn variant="tonal" color="primary" class="rounded-lg text-none font-weight-bold px-4" height="40">
              {{ t('contact') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- System Actions Card -->
      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-space-between mb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="24">mdi-rocket-launch</v-icon>
              <div>
                <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">{{ t('updates') }}</h3>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">{{ t('updates_desc') }}</div>
              </div>
            </div>
            <v-btn variant="flat" color="primary" elevation="2" class="rounded-lg text-none font-weight-bold px-4" height="40" @click="openUpdate">
              {{ t('check_updates') }}
            </v-btn>
          </div>

          <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="grey" class="mr-3" size="24">mdi-text-box-search-outline</v-icon>
              <div>
                <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">{{ t('diagnostics') }}</h3>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">{{ t('diagnostics_desc') }}</div>
              </div>
            </div>
            <v-btn variant="tonal" color="grey" class="rounded-lg text-none font-weight-bold px-4" height="40">
              {{ t('view') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

    </div>
  </div>
</template>

<script>
import packageJson from "../../../../../package.json";

export default {
  name: "HelpAbout",
  emits: ["go-to-guide"],
  computed: {
    appVersion() {
      return packageJson.version;
    },
  },
  methods: {
    t(key) {
      return this.$t ? this.$t("modules.help." + key, key) : key;
    },
    openUpdate() {
      this.$modules.open("update");
    },
  },
};
</script>
