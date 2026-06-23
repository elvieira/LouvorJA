<template>
  <Window
    v-model="module.show"
    :title="config?.title"
    :subtitle="
      (config?.subtitle || '') +
      (config?.track > 0 ? ' | ' + t('track') + ' ' + config.track : '')
    "
    closable
    size="small"
    @close="$media.closeLyric()"
    class="modern-lyric-window"
  >
    <div class="h-100">
      <v-skeleton-loader v-if="module.loading" type="text@5" />
      <div v-else class="lyric-content-wrapper pa-4">
        <div v-for="line in lyric" :key="line.id_lyric" class="lyric-line mb-3">
          <b v-if="line.aux_lyric" class="d-block text-primary text-caption mb-1 text-uppercase font-weight-bold">{{ line.aux_lyric }}</b>
          <span class="lyric-text">{{ line.lyric }}</span>
        </div>
      </div>
    </div>
  </Window>
</template>

<script>
import manifest from "../manifest.json";

import Window from "@/components/Window.vue";

export default {
  name: "LyricModule",
  components: {
    Window,
  },
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
.modern-lyric-window {
  .v-card {
    background: var(--glass-bg) !important;
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    box-shadow: 0 24px 48px rgba(0,0,0,0.4) !important;
    border: 1px solid var(--glass-border);
  }

  /* Modificando estilos nativos do Window.vue para integrar com o card escuro */
  .v-card-title {
    color: var(--glass-text);
    font-size: 1.4rem;
    font-weight: 600;
  }
  .v-card-subtitle {
    color: var(--glass-text-secondary) !important;
  }
  .v-btn {
    color: var(--glass-text-secondary) !important;
    &:hover {
      color: var(--glass-text) !important;
    }
  }

  .lyric-content-wrapper {
    font-size: 1.2rem;
    line-height: 1.7;
    color: var(--glass-text);
  }

  .lyric-text {
    font-weight: 500;
  }
  
  .text-primary {
    color: var(--accent-blue) !important;
    letter-spacing: 1px;
    opacity: 0.9;
  }
}
</style>
