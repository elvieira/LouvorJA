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
          :style="{ padding: `${fontSizePc(4)}px` }"
        >
          <!-- Hero Design Exclusivo para o Título da Música (Cover Slide) -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="slide.cover"
            class="cover-slide-hero d-flex flex-column align-center justify-center text-center"
            :style="style_cover_container(slide)"
          >
            <!-- Badge Superior caso exista texto auxiliar (ex: número do hino / coletânea) -->
            <div
              v-if="slide.aux_text"
              class="cover-badge-pill d-inline-flex align-center justify-center"
              :style="style_cover_badge(slide)"
            >
              <v-icon :size="Math.max(14, fontSizePc(3.2))" color="#f6c32a" class="mr-2">
                mdi-music
              </v-icon>
              <span v-html="slide.aux_text" />
            </div>

            <!-- Título Principal da Música -->
            <div
              class="cover-title-text"
              :style="style_cover_title(slide)"
              v-html="slide.text"
            />
          </div>
          <!-- eslint-enable vue/no-v-html -->

          <!-- Slide de Letra Padrão -->
          <div v-else class="d-flex flex-column align-center justify-center w-100">
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="slide.aux_text"
              :style="style_aux_text(slide)"
              v-html="slide.aux_text"
            />
            <div
              v-if="slide.text"
              class="slide-lyric-card"
              :style="style_text(slide)"
            >
              <div class="slide-lyric-content w-100 text-center" v-html="slide.text" />
            </div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </div>
    </transition>

    <!-- Elemento invisível para medir o maior slide de letra da música -->
    <!-- eslint-disable vue/no-v-html -->
    <div
      ref="measureContainer"
      style="position: absolute; top: -9999px; left: -9999px; visibility: hidden; pointer-events: none; z-index: -999; opacity: 0;"
    >
      <div
        v-for="(item, idx) in slidesToMeasure"
        :key="idx"
        ref="measureItems"
        :style="measureItemStyle(item)"
      >
        <div v-html="getMeasureText(item)" />
      </div>
    </div>
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/prop-name-casing */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useUserData, useString, useMedia, useAppData } from "@/composables/useHelpers";

defineOptions({ name: "PresentationSlide" });

const props = withDefaults(defineProps<{
  slide_number?: number;
  cover?: boolean;
  text?: string;
  aux_text?: string;
  image?: string;
  image_position?: number;
  text_size_pc?: number;
  text_color?: string;
  aux_text_size_pc?: number;
  aux_text_color?: string;
  force_image?: boolean;
  all_slides?: any[];
}>(), {
  slide_number: 0,
  cover: false,
  text: "",
  aux_text: "",
  image: "",
  image_position: 50,
  text_size_pc: undefined,
  text_color: undefined,
  aux_text_size_pc: undefined,
  aux_text_color: undefined,
  force_image: false,
  all_slides: () => [],
});

const userdata = useUserData();
const stringHelper = useString();
const media = useMedia();
const appdata = useAppData();

const slides = ref<any[]>([{}, {}]);
const repeat = ref(false);
const width = ref(0);
const height = ref(0);
const slideAlignClass = ref("align-center");
const customTextFormat = ref(false);
const customFontSize = ref(100);
const customFontColor = ref("#FFFFFF");
const customFontWeight = ref("700");
const customTextBgColor = ref("#000000");
const customTextBgIntensity = ref(25);
const customTextBgBorder = ref(true);
const removeTextBg = ref(false);

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
  const effectiveWidth = Math.min(width.value, height.value * (16 / 9));
  const effectiveHeight = effectiveWidth / (16 / 9);
  
  return ((pc * effectiveHeight) / 100 / 2) * 1;
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  customTextBgColor.value = userdata.get("modules.config.slide_text_bg_color") || "#000000";
  customTextBgIntensity.value = userdata.get("modules.config.slide_text_bg_intensity") ?? 25;
  customTextBgBorder.value = userdata.get("modules.config.slide_text_bg_border") ?? true;

  customBg.value = userdata.get("modules.config.slide_custom_bg") || false;
  customBgColor.value = userdata.get("modules.config.slide_bg_color") || "#000000";
  customBgImage.value = userdata.get("modules.config.slide_bg_image") || null;
  customBgOpacity.value = userdata.get("modules.config.slide_bg_opacity") ?? 100;
  removeTextBg.value = userdata.get("modules.config.slide_remove_text_bg") || false;
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
  if (customBg.value && !(props.force_image && slide.image)) {
    return {
      backgroundColor: customBgColor.value,
      backgroundImage: customBgImage.value ? `url("${customBgImage.value}")` : "none",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      opacity: customBgOpacity.value / 100,
    };
  }

  return {
    backgroundColor: "transparent",
    backgroundImage: slide.image ? `url("${slide.image}")` : "none",
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

const style_cover_container = (_slide: any): any => {
  const isBgRemoved = customBg.value && removeTextBg.value;
  if (isBgRemoved) {
    return {
      maxWidth: "88%",
      padding: `${fontSizePc(4)}px ${fontSizePc(6)}px`,
      backgroundColor: "transparent",
      border: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      boxShadow: "none",
    };
  }

  const hasTextBg = !customTextFormat.value || customTextBgIntensity.value > 0;
  const bgColor = customTextFormat.value
    ? hexToRgba(customTextBgColor.value, customTextBgIntensity.value / 100)
    : "rgba(10, 16, 26, 0.45)";
  const hasBorder = !customTextFormat.value || customTextBgBorder.value;
  const borderStyle = hasBorder
    ? "1px solid rgba(255, 255, 255, 0.18)"
    : "none";

  return {
    maxWidth: "88%",
    padding: `${fontSizePc(4)}px ${fontSizePc(8)}px`,
    borderRadius: `${Math.max(16, fontSizePc(4))}px`,
    backgroundColor: hasTextBg ? bgColor : "transparent",
    border: borderStyle,
    backdropFilter: hasTextBg ? "blur(16px)" : "none",
    WebkitBackdropFilter: hasTextBg ? "blur(16px)" : "none",
    boxShadow: hasTextBg
      ? "0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
      : "none",
  };
};

const style_cover_badge = (_slide: any): any => {
  return {
    backgroundColor: "rgba(246, 195, 42, 0.15)",
    border: "1px solid rgba(246, 195, 42, 0.4)",
    borderRadius: "9999px",
    padding: `${fontSizePc(0.8)}px ${fontSizePc(2.8)}px`,
    fontSize: `${fontSizePc(3.2)}px`,
    fontWeight: "700",
    color: "#f6c32a",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    marginBottom: `${fontSizePc(2.5)}px`,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  };
};

const style_cover_title = (_slide: any): any => {
  return {
    fontSize: `${fontSizePc(21)}px`,
    color: "#f6c32a",
    fontWeight: "900",
    textTransform: "uppercase" as const,
    letterSpacing: "0.01em",
    textAlign: "center" as const,
    lineHeight: "1.15",
    margin: "0",
    padding: "0",
    textShadow: "0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6)",
  };
};

const style_aux_text = (_slide: any): any => {
  return {
    fontSize: `${fontSizePc(props.aux_text_size_pc ?? 4)}px`,
    color: props.aux_text_color ?? "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    fontWeight: "500",
    letterSpacing: "0.1em",
    marginBottom: `${fontSizePc(2)}px`,
    textShadow: "0px 1px 4px rgba(0,0,0,0.5)",
    textAlign: "center" as const,
  };
};

const slidesToMeasure = computed(() => {
  let list: any[] = [];
  if (props.all_slides && props.all_slides.length > 0) {
    list = props.all_slides;
  } else if (media?.slides) {
    const s = media.slides();
    if (Array.isArray(s) && s.length > 0) list = s;
  }
  if (list.length === 0) {
    const data = appdata?.get?.("modules.media.data");
    if (data?.lyric) {
      list = Object.values(data.lyric);
    }
  }

  return list.filter((s: any) => {
    if (s.cover === true) return false;
    const txt = s.lyric || s.text || "";
    return typeof txt === "string" && txt.trim().length > 0;
  });
});

const getMeasureText = (item: any): string => {
  if (!item) return "";
  const raw = item.lyric || item.text || "";
  if (!raw.includes("<br>") && raw.includes("\n")) {
    return raw.replace(/[\r\n]+/g, "<br>");
  }
  return raw;
};

const measureItemStyle = (_item: any): any => {
  const sizeMultiplier = customTextFormat.value ? customFontSize.value / 100 : 1;
  const borderSize = Math.max(2, fontSizePc(0.4));
  return {
    display: "inline-block",
    boxSizing: "border-box" as const,
    padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
    border: `${borderSize}px solid transparent`,
    fontSize: `${fontSizePc(props.text_size_pc ?? 15) * sizeMultiplier}px`,
    fontWeight: customTextFormat.value ? customFontWeight.value : "700",
    letterSpacing: "0.03em",
    lineHeight: "1.4",
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
    whiteSpace: "normal" as const,
    wordBreak: "break-word" as const,
    maxWidth: width.value > 0 ? `${Math.floor(width.value * 0.9)}px` : "90vw",
  };
};

const measureItems = ref<any[]>([]);
const fixedCardWidth = ref(0);
const fixedCardHeight = ref(0);

const calculateMaxCardSize = () => {
  if (!slidesToMeasure.value || slidesToMeasure.value.length === 0) {
    fixedCardWidth.value = 0;
    fixedCardHeight.value = 0;
    return;
  }

  let maxW = 0;
  let maxH = 0;

  if (measureItems.value && measureItems.value.length > 0) {
    measureItems.value.forEach((domEl: any) => {
      const el = domEl?.$el || domEl;
      if (el && typeof el.getBoundingClientRect === "function") {
        const rect = el.getBoundingClientRect();
        if (rect.width > maxW) maxW = rect.width;
        if (rect.height > maxH) maxH = rect.height;
      }
    });
  }

  if (maxW > 0 && maxH > 0) {
    fixedCardWidth.value = Math.ceil(maxW) + 4;
    fixedCardHeight.value = Math.ceil(maxH);
  }
};

const style_text = (_slide: any): any => { 
  const isBgRemoved = customBg.value && removeTextBg.value;

  const fixedDims: any = {};
  if (fixedCardWidth.value > 0) {
    fixedDims.width = `${fixedCardWidth.value}px`;
  }
  if (fixedCardHeight.value > 0) {
    fixedDims.height = `${fixedCardHeight.value}px`;
  }
  fixedDims.maxWidth = "90%";
  fixedDims.maxHeight = "82%";
  fixedDims.boxSizing = "border-box";
  fixedDims.display = "flex";
  fixedDims.flexDirection = "column";
  fixedDims.alignItems = "center";
  fixedDims.justifyContent = "center";

  if (isBgRemoved) {
    const bgStyles = {
      backgroundColor: "transparent",
      border: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      boxShadow: "none",
    };

    if (customTextFormat.value) {
      const sizeMultiplier = customFontSize.value / 100;
      return {
        ...bgStyles,
        ...fixedDims,
        padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
        textAlign: "center" as const,
        textTransform: "uppercase",
        fontSize: `${fontSizePc(props.text_size_pc ?? 15) * sizeMultiplier}px`,
        color: props.text_color ?? (repeat.value ? "#f6c32a" : customFontColor.value),
        fontWeight: customFontWeight.value,
        letterSpacing: "0.03em",
        lineHeight: "1.4",
        textShadow: "0px 2px 10px rgba(0, 0, 0, 0.8)",
      };
    }

    return {
      ...bgStyles,
      ...fixedDims,
      padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
      textAlign: "center" as const,
      textTransform: "uppercase",
      fontSize: `${fontSizePc(props.text_size_pc ?? 15)}px`,
      color: props.text_color ?? (repeat.value ? "#f6c32a" : "#ffffff"),
      fontWeight: "700",
      letterSpacing: "0.03em",
      lineHeight: "1.4",
    };
  }

  if (customTextFormat.value) {
    const sizeMultiplier = customFontSize.value / 100;
    const hasTextBg = customTextBgIntensity.value > 0;
    return {
      ...fixedDims,
      backgroundColor: hasTextBg ? hexToRgba(customTextBgColor.value, customTextBgIntensity.value / 100) : "transparent",
      border: hasTextBg && customTextBgBorder.value ? `${Math.max(2, fontSizePc(0.4))}px solid rgba(255, 255, 255, 0.85)` : "none",
      padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
      backdropFilter: hasTextBg ? "blur(8px)" : "none",
      WebkitBackdropFilter: hasTextBg ? "blur(8px)" : "none",
      boxShadow: hasTextBg ? "0px 10px 30px rgba(0, 0, 0, 0.4)" : "none",
      textAlign: "center" as const,
      textTransform: "uppercase",
      fontSize: `${fontSizePc(props.text_size_pc ?? 15) * sizeMultiplier}px`,
      color: props.text_color ?? (repeat.value ? "#f6c32a" : customFontColor.value),
      fontWeight: customFontWeight.value,
      letterSpacing: "0.03em",
      lineHeight: "1.4",
      textShadow: "0px 2px 10px rgba(0, 0, 0, 0.8)",
    };
  }

  return {
    ...fixedDims,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    border: `${Math.max(2, fontSizePc(0.4))}px solid rgba(255, 255, 255, 0.85)`,
    padding: `${fontSizePc(5)}px ${fontSizePc(8)}px`,
    textAlign: "center" as const,
    textTransform: "uppercase",
    fontSize: `${fontSizePc(props.text_size_pc ?? 15)}px`,
    color: props.text_color ?? (repeat.value ? "#f6c32a" : "#ffffff"),
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
    } else {
      nextTick(() => {
        calculateMaxCardSize();
      });
    }
  }
};

watch(props_slide, () => {
  setSlide();
  if (fixedCardWidth.value === 0) {
    nextTick(() => {
      calculateMaxCardSize();
    });
  }
});

watch(slidesToMeasure, () => {
  nextTick(() => {
    calculateMaxCardSize();
  });
}, { deep: true, immediate: true });

watch(screenSize, () => {
  setTimeout(() => {
    windowResize();
    calculateMaxCardSize();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateSettings();
  setSlide();
  windowResize();
  window.addEventListener("resize", windowResize);
  window.addEventListener("storage", updateSettings);
  
  if (container.value) {
    resizeObserver = new ResizeObserver(() => {
      windowResize();
    });
    resizeObserver.observe(container.value);
  }

  setTimeout(() => {
    calculateMaxCardSize();
  }, 120);
});

onUnmounted(() => {
  window.removeEventListener("resize", windowResize);
  window.removeEventListener("storage", updateSettings);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
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
