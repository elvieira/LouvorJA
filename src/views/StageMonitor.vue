<template>
  <div class="stage-monitor w-100 h-100 position-relative d-flex flex-column" style="background: #000; overflow: hidden;">
    <!-- Background Unificado da Tela de Retorno -->
    <div
      class="stage-monitor-bg position-absolute top-0 left-0 w-100 h-100"
      :style="unifiedBackgroundStyle"
    />

    <!-- Seção Superior: Letra Atual (60%) -->
    <div
      class="stage-current"
      style="flex: 1.8; position: relative; overflow: hidden; z-index: 1;"
    >
      <transition name="fade" mode="out-in">
        <LSlide
          v-if="currentSlide"
          :key="'stage_curr_' + slideIndex"
          :slide_number="slideIndex"
          :cover="currentSlide.cover === true"
          :text="currentSlide.lyric"
          :aux_text="currentSlide.aux_lyric"
          :image="currentSlide.url_image ? $path.file(currentSlide.url_image) : null"
          :image_position="currentSlide.image_position"
          :text_size_pc="currentSlide.fontSize"
          :text_color="currentSlide.fontColor"
          :aux_text_size_pc="currentSlide.auxFontSize"
          :aux_text_color="currentSlide.auxFontColor"
          :all_slides="allSlides"
          :no_background="true"
          :reference_size="screenDimensions"
        />
      </transition>
    </div>

    <!-- Divisor Visual -->
    <div class="stage-divider" />

    <!-- Seção Inferior: Próxima Letra (40%) -->
    <div
      class="stage-next"
      style="flex: 1.2; position: relative; overflow: hidden; z-index: 1;"
    >
      <transition name="fade" mode="out-in">
        <div
          v-if="nextSlide"
          :key="'stage_next_' + (slideIndex + 1)"
          class="w-100 h-100 position-relative"
          style="opacity: 0.9;"
        >
          <LSlide
            :slide_number="slideIndex + 1"
            :cover="nextSlide.cover === true"
            :text="nextSlide.lyric"
            :aux_text="nextSlide.aux_lyric"
            :image="nextSlide.url_image ? $path.file(nextSlide.url_image) : null"
            :image_position="nextSlide.image_position"
            :text_size_pc="nextSlideTextSize"
            :text_color="nextSlide.fontColor"
            :aux_text_size_pc="nextSlide.auxFontSize ? nextSlide.auxFontSize * 0.75 : undefined"
            :aux_text_color="nextSlide.auxFontColor"
            :all_slides="allSlides"
            :no_background="true"
            :reference_size="screenDimensions"
          />
        </div>
        <!-- Indicador de final quando não há próxima letra -->
        <div
          v-else
          key="stage_end"
          class="w-100 h-100 d-flex align-center justify-center"
          style="background: transparent;"
        >
          <div class="d-flex flex-column align-center" style="opacity: 0.35;">
            <v-icon
              size="48"
              color="white"
              class="mb-3"
            >
              mdi-music-note-off
            </v-icon>
            <span class="text-white text-body-1 font-weight-medium">Fim</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LSlide from "@/components/Slide.vue";

export default defineComponent({
  name: "StageMonitorPage",
  components: {
    LSlide,
  },
  data() {
    return {
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
      windowHeight: typeof window !== "undefined" ? window.innerHeight : 1080,
      updateDimensions: null as any,
    };
  },
  computed: {
    screenDimensions(): { width: number; height: number } {
      return {
        width: this.windowWidth,
        height: this.windowHeight,
      };
    },
    nextSlideTextSize(): number {
      const base = this.nextSlide?.fontSize ?? 15;
      return base * 0.60;
    },
    bgImage(): string | null {
      const currentImg = this.currentSlide?.url_image;
      if (currentImg) {
        return this.$path.file(currentImg);
      }
      return null;
    },
    unifiedBackgroundStyle(): any {
      const customBg = this.$userdata.get("modules.config.slide_custom_bg") || false;
      if (customBg) {
        const customBgColor = this.$userdata.get("modules.config.slide_bg_color") || "#000000";
        const customBgImage = this.$userdata.get("modules.config.slide_bg_image") || null;
        const customBgOpacity = this.$userdata.get("modules.config.slide_bg_opacity") ?? 100;
        return {
          backgroundColor: customBgColor,
          backgroundImage: customBgImage ? `url("${customBgImage}")` : "none",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          opacity: customBgOpacity / 100,
          transition: "background-image 0.5s ease-in-out, opacity 0.5s ease-in-out",
        };
      }

      const img = this.bgImage;
      const posIndex = this.currentSlide?.image_position || 5;
      const positions = [
        "top left",
        "top center",
        "top right",
        "center left",
        "center center",
        "center right",
        "bottom left",
        "bottom center",
        "bottom right",
      ];

      return {
        backgroundColor: "#000000",
        backgroundImage: img ? `url("${img}")` : "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: positions[posIndex] || "center center",
        backgroundSize: "cover",
        transition: "background-image 0.5s ease-in-out",
      };
    },
    config(): any {
      return this.$media.config();
    },
    slideIndex(): number {
      return this.config?.slide_index ?? 0;
    },
    allSlides(): any[] {
      const data = this.$appdata.get("modules.media.data");
      if (!data) return [];
      return this.$media.slides() ?? [];
    },
    currentSlide(): any {
      return this.allSlides[this.slideIndex] ?? null;
    },
    nextSlide(): any {
      const next = this.allSlides[this.slideIndex + 1];
      return next ?? null;
    },
  },
  mounted() {
    this.$appdata.set("is_popup", true);
    this.$appdata.set("is_stage_monitor", true);

    this.updateDimensions = () => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    };
    window.addEventListener("resize", this.updateDimensions);

    // Escuta keydown para fechar com ESC
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (e.key === "Escape" || ((e.ctrlKey || e.metaKey) && e.key === "Enter")) {
        if (window.opener) {
          window.opener.postMessage("escape-pressed", "*");
        }
        if (window.electronAPI) {
          window.electronAPI.windowControl("close");
        } else {
          window.close();
        }
      }
    });

    // Escuta mensagem close e parâmetros do pai
    window.addEventListener("message", (event: MessageEvent) => {
      if (
        event.origin === window.location.origin ||
        event.origin === "file://" ||
        event.origin === "null" ||
        !event.origin ||
        event.origin.startsWith("file:")
      ) {
        if (event.data === "close") {
          if (window.electronAPI) {
            window.electronAPI.windowControl("close");
          } else {
            window.close();
          }
          return;
        }

        if (event.data && event.data.param) {
          this.$appdata.set(event.data.param, event.data.value);
        }
      }
    });

    if (window.opener) {
      window.opener.postMessage("mounted", "*");
    }
  },
  unmounted() {
    if (this.updateDimensions) {
      window.removeEventListener("resize", this.updateDimensions);
    }
  },
});
</script>

<style scoped>
.stage-monitor {
  user-select: none;
}

.stage-monitor-bg {
  z-index: 0;
  pointer-events: none;
}

.stage-divider {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(0,151,215,0.5) 50%, rgba(255,255,255,0.2) 80%, transparent 100%);
  flex-shrink: 0;
  z-index: 2;
}

.stage-next {
  border-top: 1px solid rgba(255,255,255,0.08);
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
