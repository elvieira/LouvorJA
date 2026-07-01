<template>
  <div ref="container" class="w-100 h-100">
    <transition
      v-for="(slide, index) in slides.slice().reverse()"
      :key="index"
      name="fade"
    >
      <div
        v-if="!slide.destroy"
        v-show="slide.active"
        class="position-absolute top-0 left-0 w-100 h-100"
        style="overflow: hidden; background-color: rgb(0,0,0);"
      >
        <div class="position-absolute top-0 left-0 w-100 h-100" :style="style_bg(slide)"></div>
        <div
          class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center"
          :class="slideAlignClass"
          :style="{ padding: `${Math.max(16, fontSizePc(4))}px` }"
        >
          <div class="d-flex flex-column align-center justify-center w-100">
            <div
              v-if="slide.aux_text"
              :style="style_aux_text(slide)"
              v-html="slide.aux_text"
            />
            <div
              v-if="slide.text"
              :style="style_text(slide)"
              v-html="slide.text"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "SlideComponent",
  props: {
    slide_number: Number,
    cover: Boolean,
    text: String,
    aux_text: String,
    image: String,
    image_position: Number,
  },
  data: () => ({
    slides: [{}, {}],
    repeat: false,
    width: 0,
    height: 0,
    slideAlignClass: 'align-center',
    customTextFormat: false,
    customFontSize: 100,
    customFontColor: '#FFFFFF',
    customFontWeight: '700',
    customBg: false,
    customBgColor: '#000000',
    customBgImage: null,
    customBgOpacity: 100,
  }),
  computed: {
    props_slide() {
      return {
        slide_number: this.slide_number,
        cover: this.cover,
        text: this.text,
        aux_text: this.aux_text,
        image: this.image,
        image_position: this.image_position,
      };
    },
    screenSize() {
      return { width: this.width, height: this.height };
    },
  },
  watch: {
    props_slide() {
      this.setSlide();
    },
    screenSize() {
      const self = this;
      setTimeout(() => {
        self.windowResize();
      }, 100);
    },
  },
  mounted() {
    this.updateSettings();
    this.setSlide();
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
    window.addEventListener("storage", this.updateSettings);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
    window.removeEventListener("storage", this.updateSettings);
  },
  methods: {
    updateSettings() {
      const align = this.$userdata.get("modules.config.slide_align") || "Centro";
      if (align === 'Cima') this.slideAlignClass = 'align-start';
      else if (align === 'Baixo') this.slideAlignClass = 'align-end';
      else this.slideAlignClass = 'align-center';

      this.customTextFormat = this.$userdata.get("modules.config.slide_custom_text_format") || false;
      this.customFontSize = this.$userdata.get("modules.config.slide_font_size") || 100;
      this.customFontColor = this.$userdata.get("modules.config.slide_font_color") || '#FFFFFF';
      this.customFontWeight = this.$userdata.get("modules.config.slide_font_weight") || '700';

      this.customBg = this.$userdata.get("modules.config.slide_custom_bg") || false;
      this.customBgColor = this.$userdata.get("modules.config.slide_bg_color") || '#000000';
      this.customBgImage = this.$userdata.get("modules.config.slide_bg_image") || null;
      this.customBgOpacity = this.$userdata.get("modules.config.slide_bg_opacity") ?? 100;
    },
    setSlide() {
      this.updateSettings();
      if (
        this.$string.clean(this.slides[1].text) ==
        this.$string.clean(this.props_slide.text) &&
        this.$string.clean(this.slides[1].aux_text) ==
        this.$string.clean(this.props_slide.aux_text) &&
        this.slides[1].image == this.props_slide.image &&
        this.slides[1].cover == this.props_slide.cover
      ) {
        this.repeat = !this.repeat;
      } else {
        this.repeat = false;
      }

      this.slides.unshift({});
      this.slides[1] = {
        ...this.props_slide,
        active: true,
      };

      if (this.slides.length > 3) {
        this.slides[3].destroy = true;
      }
    },
    style_bg(slide) {
      if (this.customBg) {
        return {
          backgroundColor: this.customBgColor,
          backgroundImage: this.customBgImage ? `url(${this.customBgImage})` : 'none',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          opacity: this.customBgOpacity / 100,
        };
      }

      return {
        backgroundColor: "transparent",
        backgroundImage: `url(${slide.image})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: [
          "top left",
          "top center",
          "top right",
          "center left",
          "center center",
          "center right",
          "bottom left",
          "bottom center",
          "bottom right",
        ][this.image_position || 5],
        backgroundSize: "cover",
      };
    },
    style_aux_text(slide) {
      if (slide.cover) {
        return {
          fontSize: `${this.fontSizePc(7)}px`,
          color: "rgba(255, 255, 255, 0.95)",
          textTransform: "uppercase",
          fontWeight: "700",
          letterSpacing: "0.4em",
          marginBottom: `${this.fontSizePc(3)}px`,
          textShadow: "0px 4px 16px rgba(0,0,0,0.8)",
          textAlign: "center",
        };
      } 
      return {
        fontSize: `${this.fontSizePc(4)}px`,
        color: "rgba(255, 255, 255, 0.8)",
        textTransform: "uppercase",
        fontWeight: "500",
        letterSpacing: "0.1em",
        marginBottom: `${this.fontSizePc(2)}px`,
        textShadow: "0px 1px 4px rgba(0,0,0,0.5)",
        textAlign: "center",
      };
      
    },
    style_text(slide) {
      if (slide.cover) {
        return {
          fontSize: `${this.fontSizePc(24)}px`,
          color: "#f6c32a",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          textAlign: "center",
          textShadow: "0px 10px 30px rgba(0, 0, 0, 0.9), 0px 2px 6px rgba(0, 0, 0, 0.7)",
          lineHeight: "1.1",
        };
      } 

      if (this.customTextFormat) {
        const sizeMultiplier = this.customFontSize / 100;
        return {
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          border: `${Math.max(2, this.fontSizePc(0.4))}px solid rgba(255, 255, 255, 0.85)`,
          padding: `${this.fontSizePc(5)}px ${this.fontSizePc(8)}px`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          textTransform: "uppercase",
          fontSize: `${this.fontSizePc(15) * sizeMultiplier}px`,
          color: this.repeat ? "#f6c32a" : this.customFontColor,
          fontWeight: this.customFontWeight,
          letterSpacing: "0.03em",
          lineHeight: "1.4",
          textShadow: "0px 2px 10px rgba(0, 0, 0, 0.8)",
        };
      }

      return {
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        border: `${Math.max(2, this.fontSizePc(0.4))}px solid rgba(255, 255, 255, 0.85)`,
        padding: `${this.fontSizePc(5)}px ${this.fontSizePc(8)}px`,
        textAlign: "center",
        textTransform: "uppercase",
        fontSize: `${this.fontSizePc(15)}px`,
        color: this.repeat ? "#f6c32a" : "#ffffff",
        fontWeight: "700",
        letterSpacing: "0.03em",
        lineHeight: "1.4",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
      };
    },
    fontSizePc(pc) {
      const v = Math.min(this.width, this.height);
      return (pc * v) / 100 / 2;
    },
    windowResize() {
      const container = this.$refs.container;
      if (container) {
        this.width = container.offsetWidth;
        this.height = container.offsetHeight;

        if (this.width <= 0 || this.height <= 0) {
          const self = this;
          setTimeout(() => {
            self.windowResize();
          }, 100);
        }
      }
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
