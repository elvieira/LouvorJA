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
        :style="style_bg(slide)"
      >
        <div
          class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center align-center pa-6"
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
    this.setSlide();
    this.windowResize();
    window.addEventListener("resize", this.windowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.windowResize);
  },
  methods: {
    setSlide() {
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
      return {
        overflow: "hidden",
        backgroundColor: "rgb(0, 0, 0)",
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
