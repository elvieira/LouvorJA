<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.4) !important; backdrop-filter: blur(2px);">
      <v-card
        class="rounded-xl overflow-hidden elevation-24"
        width="100%"
        max-width="450"
        style="background: var(--card-bg); max-height: 90%; display: flex; flex-direction: column;"
      >
        <v-card-text class="pa-0 d-flex flex-column" style="height: 100%; min-height: 0; overflow: hidden;">
          <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon color="primary" size="32" class="mr-3">
                  mdi-music-note-outline
                </v-icon>
                <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                  {{ config?.title }}
                </h2>
              </div>
              <v-btn icon variant="text" @click="$media.closeLyric()">
                <v-icon>mdi-close</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  {{ t('close') }}
                </v-tooltip>
              </v-btn>
            </div>
            <p v-if="config?.subtitle || config?.track > 0" class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
              {{ config?.subtitle || '' }}{{ config?.subtitle && config?.track > 0 ? ' | ' : '' }}{{ config?.track > 0 ? t('track') + ' ' + config.track : '' }}
            </p>
          </div>
          
          <div class="pa-6 pt-4 flex-grow-1" style="overflow-y: auto;">
            <v-skeleton-loader v-if="module?.loading" type="text@5" />
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

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

export default defineComponent({
  name: "LyricModule",
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    config(): any {
      return this.module?.config;
    },
    lyric(): any[] {
      const rawLyric = this.module?.data?.lyric || [];
      const raw = (Array.isArray(rawLyric) ? rawLyric : Object.values(rawLyric))
        .slice()
        .sort((a: any, b: any) => a.order - b.order);

      const grouped: any[] = [];
      let currentGroup: any = null;

      for (const item of raw) {
        const text = (item.lyric || "").replace(/[\r\n]+/g, " ").trim();
        
        if (!text) {
          currentGroup = null;
          continue;
        }

        if (item.show_slide === 0) continue;
        
        const aux = item.aux_lyric || "";
        
        if (!currentGroup || currentGroup.aux !== aux) {
          currentGroup = {
            id_lyric: item.id_lyric,
            aux_lyric: item.aux_lyric,
            aux,
            lines: [text],
          };
          grouped.push(currentGroup);
        } else {
          currentGroup.lines.push(text);
        }
      }

      return grouped.map(g => ({
        id_lyric: g.id_lyric,
        aux_lyric: g.aux_lyric,
        lyric: g.lines.join("\n"),
      }));
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */
  },
});
</script>

<style lang="scss">
.lyric-content-wrapper {
  font-size: 1.2rem;
  line-height: 1.7;
}

.lyric-text {
  font-weight: 500;
  white-space: pre-wrap;
  display: block;
}
</style>
