<template>
  <div class="help-credits pa-6" style="max-width: 700px; height: 100%; overflow-y: auto; scrollbar-width: thin;">
    <div class="mx-auto" style="max-width: 600px;">

      <v-card class="settings-card rounded-xl pa-2 mb-6" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
        <v-card-text class="pa-6">

          <h3 class="font-weight-bold mb-6" style="color: var(--sidebar-text); font-size: 1.2rem; text-align: center;">
            {{ t('credits_title') }}
          </h3>

          <!-- Maintainer -->
          <div class="d-flex align-center mb-6 pa-4 rounded-lg" style="background: var(--main-bg); border: 1px solid var(--border-color);">
            <div class="rounded-circle d-flex align-center justify-center mr-4" style="width: 48px; height: 48px; background: rgba(0, 151, 215, 0.1); flex-shrink: 0;">
              <v-icon size="24" color="primary">mdi-account-star</v-icon>
            </div>
            <div>
              <div class="font-weight-bold text-body-1" style="color: var(--sidebar-text);">Maicon Debuche</div>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">{{ t('credits_maintainer') }} &bull; louvorja/app</div>
            </div>
          </div>

          <!-- Electron Developer -->
          <div class="d-flex align-center mb-6 pa-4 rounded-lg" style="background: var(--main-bg); border: 1px solid var(--border-color);">
            <div class="rounded-circle d-flex align-center justify-center mr-4" style="width: 48px; height: 48px; background: rgba(0, 151, 215, 0.1); flex-shrink: 0;">
              <v-icon size="24" color="primary">mdi-laptop</v-icon>
            </div>
            <div>
              <div class="font-weight-bold text-body-1" style="color: var(--sidebar-text);">Elias Vieira</div>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">{{ t('credits_electron') }} &bull; elvieira/LouvorJA</div>
            </div>
          </div>

          <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>

          <!-- Contributors header -->
          <div class="text-subtitle-2 font-weight-bold mb-3" style="color: var(--sidebar-text-secondary);">
            {{ t('credits_contributors') }}
          </div>

          <div class="d-flex align-center mb-4 pa-4 rounded-lg" style="background: var(--main-bg); border: 1px solid var(--border-color);">
            <div class="rounded-circle d-flex align-center justify-center mr-4" style="width: 48px; height: 48px; background: rgba(76, 175, 80, 0.1); flex-shrink: 0;">
              <v-icon size="24" color="green">mdi-account-edit</v-icon>
            </div>
            <div>
              <div class="font-weight-bold text-body-1" style="color: var(--sidebar-text);">Rafael Zendron</div>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">Sorteio, Cronometro, Liturgia, Texto Interativo, Favoritos, Ajuda</div>
            </div>
          </div>

          <v-divider class="mb-6" style="opacity: 0.1;"></v-divider>

          <!-- Open source note -->
          <div class="text-center pa-4 rounded-lg" style="background: rgba(0, 151, 215, 0.05); border: 1px dashed var(--border-color);">
            <v-icon size="28" color="primary" class="mb-2" style="opacity: 0.5;">mdi-heart-outline</v-icon>
            <p class="text-body-2 mb-0" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
              {{ t('credits_open_source_note') }}
            </p>
            <v-btn
              variant="text"
              size="small"
              class="text-none mt-2"
              style="color: var(--accent-blue);"
              href="https://github.com/elvieira/LouvorJA"
            >
              <v-icon size="16" class="mr-1">mdi-github</v-icon>
              GitHub
            </v-btn>
          </div>

        </v-card-text>
      </v-card>

    </div>
  </div>
</template>

<script>
export default {
  name: "HelpCredits",
  methods: {
    t(key) {
      return this.$t ? this.$t("modules.help." + key, key) : key;
    },
  },
};
</script>
