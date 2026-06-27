<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.4) !important; backdrop-filter: blur(2px);">
      <v-card class="rounded-xl overflow-hidden elevation-24" width="100%" max-width="450" style="background: var(--card-bg); max-height: 75vh; display: flex; flex-direction: column;">
        <v-card-text class="pa-0 d-flex flex-column" style="height: 100%; min-height: 0; overflow: hidden;">
          <!-- Header -->
          <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon color="primary" size="32" class="mr-3">mdi-music-note-outline</v-icon>
                <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">{{ config?.title }}</h2>
              </div>
              <v-btn icon variant="text" @click="$media.closeLyric()">
                <v-icon>mdi-close</v-icon>
                <v-tooltip activator="parent" location="bottom" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Fechar</v-tooltip>
              </v-btn>
            </div>
            <p v-if="config?.subtitle || config?.track > 0" class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
              {{ config?.subtitle || '' }}{{ config?.subtitle && config?.track > 0 ? ' | ' : '' }}{{ config?.track > 0 ? t('track') + ' ' + config.track : '' }}
            </p>
          </div>
          
          <!-- Content -->
          <div class="pa-6 pt-4 flex-grow-1" style="overflow-y: auto;">
            <v-skeleton-loader v-if="module.loading" type="text@5" />
            <div v-else class="lyric-content-wrapper">
              <div v-for="line in lyric" :key="line.id_lyric" class="lyric-line mb-4">
                <b v-if="line.aux_lyric" class="d-block text-primary text-caption mb-1 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">{{ line.aux_lyric }}</b>
                <span class="lyric-text text-body-1" style="color: var(--sidebar-text); font-weight: 500;">{{ line.lyric }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "LyricModule",
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    config() {
      return this.module?.config;
    },
    lyric() {
      return this.module?.data?.lyric
        ?.slice()
        .sort((a, b) => a.order - b.order);
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */
  },
};
</script>

<style lang="scss">
.lyric-content-wrapper {
  font-size: 1.2rem;
  line-height: 1.7;
}

.lyric-text {
  font-weight: 500;
}
</style>
