<template>
  <Window
    v-model="module.show"
    title=""
    subtitle=""
    compact
    compact_footer
    size="large"
    :scroll-pos="scrollPos"
    class="modern-media-window"
    @close="$media.close()"
    @minimize="$media.minimize()"
    @resize="resize"
  >
    <!-- Substitui completamente a toolbar do Window para flutuar no canto esquerdo -->
    <template #toolbar>
      <div class="modern-media-toolbar d-flex align-center">
        <!-- Menu do Sistema -->
        <v-menu v-if="is_online">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="custom-system-btn"
              icon="mdi-dots-vertical"
              variant="flat"
              size="small"
              color="white"
            />
          </template>
          <v-card
            class="modern-menu-card"
            color="rgba(20, 20, 20, 0.9)"
            theme="dark"
            rounded="lg"
          >
            <v-card-text>
              <v-tooltip :text="t('inputs.lazy_load_tooltip')">
                <template #activator="{ props }">
                  <v-switch
                    v-bind="props"
                    v-model="lazy_load"
                    color="var(--accent-blue)"
                    :label="t('inputs.lazy_load')"
                    hide-details
                    class="mb-2"
                  />
                </template>
              </v-tooltip>
              <v-tooltip :text="t('inputs.fade_audio_tooltip')">
                <template #activator="{ props }">
                  <v-switch
                    v-bind="props"
                    v-model="fade_audio"
                    color="var(--accent-blue)"
                    :label="t('inputs.fade_audio')"
                    hide-details
                  />
                </template>
              </v-tooltip>
            </v-card-text>
          </v-card>
        </v-menu>

        <!-- Minimizar e Fechar flutuantes -->
        <v-btn
          class="custom-system-btn"
          icon
          variant="flat"
          size="small"
          color="white"
          @click="$media.minimize()"
        >
          <v-icon>mdi-minus</v-icon>
          <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Minimizar</v-tooltip>
        </v-btn>
        <v-btn
          class="custom-system-btn"
          icon
          variant="flat"
          size="small"
          color="white"
          @click="$media.close()"
        >
          <v-icon>mdi-close</v-icon>
          <v-tooltip activator="parent" location="top" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Fechar</v-tooltip>
        </v-btn>
      </div>
    </template>

    <div class="player-main-container position-relative w-100 h-100 d-flex flex-row overflow-hidden bg-black">
      <!-- Visual e Tela de Letras (Forçada a expandir - Cover) -->
      <div class="player-visual-area flex-grow-1 position-relative transition-all" style="z-index: 1;">
        <fullscreen
          v-model="fullscreen"
          class="position-absolute w-100 h-100"
          style="top: 0; left: 0;"
        >
          <div class="visual-content-wrapper w-100 h-100 position-absolute">
            <LSlide
              v-if="slide"
              :slide_number="config.slide_index"
              :cover="slide.cover == true"
              :text="slide.lyric"
              :aux_text="slide.aux_lyric"
              :image="slide.url_image ? $path.file(slide.url_image) : null"
              :image_position="slide.image_position"
              class="w-100 h-100"
            />
            <LFullscreenPlayer v-if="fullscreen" class="w-100 h-100" />
          </div>
        </fullscreen>
      </div>

      <!-- Lista Lateral de Letras (Ocultável) - Glassmorphism -->
      <div class="player-playlist-area transition-all" :class="{'playlist-open': isPlaylistOpen, 'playlist-closed': !isPlaylistOpen}">
        <v-list class="playlist-scroll h-100 pa-4 bg-transparent pt-6" :width="340" theme="dark">
          <v-list-item
            v-for="(item, index) in slides"
            :key="index"
            ref="slideItem"
            link
            :active="config.slide_index === index"
            class="playlist-item"
            :height="64"
            @click="$media.goToSlide(index)"
          >
            <template #prepend>
              <div class="slide-number-chip">
                {{ index + 1 }}
              </div>
            </template>

            <v-list-item-title v-if="item.cover" class="slide-title">
              {{ item.lyric }}
            </v-list-item-title>
            <div
              v-else
              class="slide-text text-truncate"
              v-html="item.lyric"
            />
            
            <div v-if="config.audio != '' && config.slide_index == index" class="slide-progress-container">
              <v-progress-linear
                v-model="config.slide_progress"
                :indeterminate="loading"
                :height="4"
                :color="config.is_paused ? 'var(--accent-yellow)' : 'white'"
                class="slide-progress-bar"
              />
            </div>

            <img
              v-if="item.url_image"
              :src="$path.file(item.url_image)"
              style="display: none"
            />
          </v-list-item>
        </v-list>
      </div>

      <!-- The Pill Player (Flutuante no fundo) -->
      <div class="floating-pill-container position-absolute w-100 d-flex justify-center" style="bottom: 40px; z-index: 20; pointer-events: none;">
        <div style="pointer-events: auto;">
          <LPlayer location="window" />
        </div>
      </div>
    </div>
  </Window>
</template>

<script>
import manifest from "../manifest.json";

import Window from "@/components/Window.vue";

import LSlide from "@/components/Slide.vue";
import LPlayer from "@/components/Player.vue";
import LFullscreenPlayer from "@/components/FullscreenPlayer.vue";

export default {
  name: "MediaComponent",
  components: {
    Window,
    LSlide,
    LPlayer,
    LFullscreenPlayer,
  },
  data: () => ({
    preview_height: 0,
    scrollPos: 0,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    is_online() {
      return this.$appdata.get("is_online");
    },
    loading() {
      return this.module.loading;
    },
    config() {
      return this.$media.config();
    },
    slide_index() {
      return this.config?.slide_index;
    },
    slides() {
      return this.$media.slides();
    },
    slide() {
      return this.$media.slide();
    },
    fullscreen: {
      get() {
        return this.module.config.fullscreen;
      },
      set(value) {
        this.$media.fullscreen(value);
      },
    },
    lazy_load: {
      get() {
        return this.$userdata.get("modules.media.lazy_load");
      },
      set(value) {
        this.$userdata.set("modules.media.lazy_load", value);
      },
    },
    fade_audio: {
      get() {
        return this.$userdata.get("modules.media.fade_audio");
      },
      set(value) {
        this.$userdata.set("modules.media.fade_audio", value);
      },
    },
    isPlaylistOpen() {
      return this.$appdata.get("modules.media.show_playlist") || false;
    },
  },
  watch: {
    slide_index() {
      if (!this.module.show) {
        return;
      }

      if (this.$refs?.slideItem && this.$refs?.slideItem[0]?.$el) {
        const self = this;
        const height = this.$refs.slideItem[0].$el.offsetHeight;
        setTimeout(() => {
          self.scrollPos = self.slide_index * height - height;
        }, 100);
      }
    },
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    resize(data) {
      this.preview_height = data.container_height;
    },
  },
};
</script>

<style lang="scss">
/* Estilo Moderno e Cinemático do Window */
.modern-media-window {
  .v-card {
    border-radius: 20px !important;
    overflow: hidden;
    background: #000 !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
    border: none !important;
  }
  
  /* Remove margens e paddings nativos da Window.vue */
  .v-card-text {
    padding: 0 !important;
  }

  /* Toolbar Substituída para flutuar no canto ESQUERDO SUPERIOR */
  .modern-media-toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    padding: 6px 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.05);

    /* Oculta os botões originais que podem tentar renderizar se o slot não substituir tudo */
  }

  .custom-system-btn {
    border-radius: 50% !important;
    width: 32px !important;
    height: 32px !important;
    margin: 0 4px;
    background: transparent !important;
    color: white !important;
    box-shadow: none !important;

    &:hover {
      background: rgba(255,255,255,0.15) !important;
    }
  }
}

/* Container Principal e Forçar vídeo a preencher bordas pretas */
.player-main-container {
  height: 100%;
}

.player-visual-area {
  z-index: 1;
}

/* Força as imagens ou vídeos de fundo a preencherem a div sem deixar listras pretas */
.visual-content-wrapper img, 
.visual-content-wrapper video,
.visual-content-wrapper iframe,
.visual-content-wrapper .v-img__img {
  object-fit: cover !important;
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}

/* Área da Playlist com Animação Deslizante (Design Dark/Glass) */
.player-playlist-area {
  z-index: 2;
  background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s;
  
  &.playlist-open {
    width: 340px;
    opacity: 1;
  }
  
  &.playlist-closed {
    width: 0px;
    opacity: 0;
    border: none;
  }

  .playlist-scroll {
    overflow-y: auto;
    overflow-x: hidden;


  }

  .playlist-item {
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    background: rgba(0, 0, 0, 0.25) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 8px 16px;
    margin-bottom: 12px;

    &:hover {
      background: rgba(0, 0, 0, 0.4) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      transform: translateX(-4px);
    }

    &.v-list-item--active {
      background: rgba(0, 0, 0, 0.55) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      transform: translateX(-8px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);

      .slide-number-chip {
        background: white;
        color: black;
      }
      
      .slide-text, .slide-title {
        color: white;
        font-weight: 600; line-height: 1;
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      }
    }

    .slide-number-chip {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600; line-height: 1;
      color: rgba(255, 255, 255, 0.8);
      margin-right: 14px;
      transition: all 0.2s;
    }

    .slide-title {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
    }

    .slide-text {
      font-size: 13px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.6);
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      text-transform: uppercase;
    }

    .slide-progress-container {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 0 16px;
      transform: translateY(2px);

      .slide-progress-bar {
        border-radius: 2px;
      }
    }
  }
}
</style>
