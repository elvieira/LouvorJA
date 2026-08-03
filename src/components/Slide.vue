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
        <div class="position-absolute top-0 left-0 w-100 h-100" :style="style_bg(slide)" />
        <div
          class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center"
          :class="slideAlignClass"
          :style="{ padding: `${Math.max(16, fontSizePc(4))}px` }"
        >
          <div class="d-flex flex-column align-center justify-center w-100">
            <!-- eslint-disable vue/no-v-html -->
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
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/prop-name-casing */
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useUserData, useString } from "@/composables/useHelpers";

defineOptions({ name: "PresentationSlide" });

const props = withDefaults(defineProps<{
  slide_number?: number;
  cover?: boolean;
  text?: string;
  aux_text?: string;
  image?: string;
  image_position?: number;
}>(), {
  slide_number: 0,
  cover: false,
  text: "",
  aux_text: "",
  image: "",
  image_position: 50,
});

const userdata = useUserData();
const stringHelper = useString();

const slides = ref<any[]>([{}, {}]);
const repeat = ref(false);
const width = ref(0);
const height = ref(0);
const slideAlignClass = ref("align-center");
const customTextFormat = ref(false);
const customFontSize = ref(100);
const customFontColor = ref("#FFFFFF");
const customFontWeight = ref("700");
const customBg = ref(false);
const customBgColor = ref("#000000");
const customBgImage = ref<string | null>(null);
const customBgOpacity = ref(100);
const container = ref<HTMLElement | null>(null);

const props_slide = computed(() => ({
  slide_number: props.slide_number,
  cover: props.cover,
  text: props.text,
  aux_text: props.aux_text,
  image: props.image,
  image_position: props.image_position,
}));

const screenSize = computed(() => ({ width: width.value, height: height.value }));

const fontSizePc = (pc: number) => {
  const v = Math.min(width.value, height.value);
  return (pc * v) / 100 / 2;
};

const updateSettings = () => {
  const align = userdata.get("modules.config.slide_align") || "Centro";
  if (align === "Cima") slideAlignClass.value = "align-start";
  else if (align === "Baixo") slideAlignClass.value = "align-end";
  else slideAlignClass.value = "align-center";

  customTextFormat.value = userdata.get("modules.config.slide_custom_text_format") || false;
  customFontSize.value = userdata.get("modules.config.slide_font_size") || 100;
  customFontColor.value = userdata.get("modules.config.slide_font_color") || "#FFFFFF";
  customFontWeight.value = userdata.get("modules.config.slide_font_weight") || "700";

  customBg.value = userdata.get("modules.config.slide_custom_bg") || false;
  customBgColor.value = userdata.get("modules.config.slide_bg_color") || "#000000";
  customBgImage.value = userdata.get("modules.config.slide_bg_image") || null;
  customBgOpacity.value = userdata.get("modules.config.slide_bg_opacity") ?? 100;
};

const setSlide = () => {
  updateSettings();
  if (
    stringHelper.clean(slides.value[1].text || "") === stringHelper.clean(props_slide.value.text || "") &&
    stringHelper.clean(slides.value[1].aux_text || "") === stringHelper.clean(props_slide.value.aux_text || "") &&
    slides.value[1].image === props_slide.value.image &&
    slides.value[1].cover === props_slide.value.cover
  ) {
    repeat.value = !repeat.value;
  } else {
    repeat.value = false;
  }

  slides.value.unshift({});
  slides.value[1] = {
    ...props_slide.value,
    active: true,
  };

  if (slides.value.length > 3) {
    slides.value[3].destroy = true;
  }
};

const style_bg = (slide: any) => {
  if (customBg.value) {
    return {
      backgroundColor: customBgColor.value,
      backgroundImage: customBgImage.value ? `url(${customBgImage.value})` : "none",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      opacity: customBgOpacity.value / 100,
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
    ][props.image_position || 5],
    backgroundSize: "cover",
  };
};

const style_aux_text = (slide: any): any => {
  if (slide.cover) {
    return {
      fontSize: `${fontSizePc(7)}px`,
      color: "rgba(255, 255, 255, 0.95)",
      textTransform: "uppercase",
      fontWeight: "700",
      letterSpacing: "0.4em",
      marginBottom: `${fontSizePc(3)}px`,
      textShadow: "0px 4px 16px rgba(0,0,0,0.8)",
      textAlign: "center" as const,
    };
  } 
  return {
    fontSize: `${fontSizePc(4)}px`,
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    fontWeight: "500",
    letterSpacing: "0.1em",
    marginBottom: `${fontSizePc(2)}px`,
    textShadow: "0px 1px 4px rgba(0,0,0,0.5)",
    textAlign: "center" as const,
  };
};

const style_text = (slide: any): any => {
  if (slide.cover) {
    return {
      fontSize: `${fontSizePc(24)}px`,
      color: "#f6c32a",
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: "-0.01em",
      textAlign: "center" as const,
      textShadow: "0px 10px 30px rgba(0, 0, 0, 0.9), 0px 2px 6px rgba(0, 0, 0, 0.7)",
      lineHeight: "1.1",
    };
  } 

  if (customTextFormat.value) {
    const sizeMultiplier = customFontSize.value / 100;
    return {
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      border: `${Math.max(2, fontSizePc(0.4))}px solid rgba(255, 255, 255, 0.85)`,
      padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
      textAlign: "center" as const,
      textTransform: "uppercase",
      fontSize: `${fontSizePc(15) * sizeMultiplier}px`,
      color: repeat.value ? "#f6c32a" : customFontColor.value,
      fontWeight: customFontWeight.value,
      letterSpacing: "0.03em",
      lineHeight: "1.4",
      textShadow: "0px 2px 10px rgba(0, 0, 0, 0.8)",
    };
  }

  return {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    border: `${Math.max(2, fontSizePc(0.4))}px solid rgba(255, 255, 255, 0.85)`,
    padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
    textAlign: "center" as const,
    textTransform: "uppercase",
    fontSize: `${fontSizePc(15)}px`,
    color: repeat.value ? "#f6c32a" : "#ffffff",
    fontWeight: "700",
    letterSpacing: "0.03em",
    lineHeight: "1.4",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
  };
};

const windowResize = () => {
  if (container.value) {
    width.value = container.value.offsetWidth;
    height.value = container.value.offsetHeight;

    if (width.value <= 0 || height.value <= 0) {
      setTimeout(() => {
        windowResize();
      }, 100);
    }
  }
};

watch(props_slide, () => {
  setSlide();
});

watch(screenSize, () => {
  setTimeout(() => {
    windowResize();
  }, 100);
});

onMounted(() => {
  updateSettings();
  setSlide();
  windowResize();
  window.addEventListener("resize", windowResize);
  window.addEventListener("storage", updateSettings);
});

onUnmounted(() => {
  window.removeEventListener("resize", windowResize);
  window.removeEventListener("storage", updateSettings);
});
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
