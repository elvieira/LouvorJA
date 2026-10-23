<template>
  <div ref="container" class="w-100 h-100 position-relative">
    <transition name="fade-blackout" :duration="200">
      <div
        v-if="isBlackout"
        class="position-absolute top-0 left-0 w-100 h-100"
        style="background-color: #000; z-index: 10000; pointer-events: none;"
      />
    </transition>
    <transition :name="no_background ? 'slide-fade-transparent' : 'slide-fade'" :duration="350">
      <div
        v-if="currentSlide"
        :key="currentSlide.uid"
        class="position-absolute top-0 left-0 w-100 h-100"
        :style="{
          overflow: 'hidden',
          backgroundColor: no_background ? 'transparent' : 'rgb(0,0,0)',
        }"
      >
        <div v-if="!no_background" class="position-absolute top-0 left-0 w-100 h-100" :style="style_bg(currentSlide)" />
        <div
          class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center"
          :class="slideAlignClass"
          :style="{ padding: `${fontSizePc(4)}px` }"
        >
          <!-- Hero Design Exclusivo para o Título da Música (Cover Slide) -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="currentSlide.cover && (hasText(currentSlide.text) || hasText(currentSlide.aux_text))"
            class="cover-slide-group d-flex flex-column align-center justify-center text-center w-100"
            :style="{ maxWidth: '90%' }"
          >
            <!-- Card Principal do Título -->
            <div
              v-if="hasText(currentSlide.text)"
              class="cover-slide-hero d-flex flex-column align-center justify-center text-center"
              :style="style_cover_container(currentSlide)"
            >
              <div
                class="cover-title-text"
                :style="style_cover_title(currentSlide)"
                v-html="formatCoverTitle(currentSlide.text)"
              />
            </div>

            <!-- Subtítulo Abaixo do Card do Título (Aba com Whiskers) -->
            <div
              v-if="hasText(currentSlide.aux_text)"
              class="cover-subtitle-tab d-inline-flex align-center justify-center"
              :style="style_cover_subtitle(currentSlide)"
            >
              <span class="subtitle-whisker" :style="style_subtitle_whisker" />
              <span class="subtitle-text" :style="style_subtitle_text">
                {{ formatCoverSubtitle(currentSlide.aux_text) }}
              </span>
              <span class="subtitle-whisker" :style="style_subtitle_whisker" />
            </div>
          </div>
          <!-- eslint-enable vue/no-v-html -->

          <!-- Slide de Letra Padrão -->
          <div v-else-if="!currentSlide.cover && (hasText(currentSlide.text) || hasText(currentSlide.aux_text))" class="d-flex flex-column align-center justify-center w-100">
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="hasText(currentSlide.aux_text)"
              :style="style_aux_text(currentSlide)"
              v-html="currentSlide.aux_text"
            />
            <div
              v-if="hasText(currentSlide.text)"
              class="slide-lyric-card"
              :style="style_text(currentSlide)"
            >
              <div class="slide-lyric-content w-100 text-center" v-html="formatLyricText(currentSlide.text)" />
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
        :ref="(el) => { if (el) measureItems[idx] = el }"
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
  no_background?: boolean;
  reference_size?: { width: number; height: number };
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
  no_background: false,
  reference_size: undefined,
});

const userdata = useUserData();
const stringHelper = useString();
const media = useMedia();
const appdata = useAppData();
const isBlackout = computed(() => appdata.get("projection_blackout") === true);

let slideUid = 0;
const currentSlide = ref<any>(null);
const repeat = ref(false);
const getInitialDims = () => {
  if (props.reference_size?.width && props.reference_size?.height) {
    return {
      w: props.reference_size.width,
      h: props.reference_size.height,
    };
  }
  if (typeof window !== "undefined" && window.innerWidth > 0 && window.innerHeight > 0) {
    return {
      w: Math.floor(window.innerWidth * 0.95),
      h: Math.floor(window.innerHeight * 0.88),
    };
  }
  return { w: 1280, h: 720 };
};

const initialDims = getInitialDims();
const width = ref(initialDims.w);
const height = ref(initialDims.h);
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

const isTextEmpty = (val?: string) => {
  if (!val || typeof val !== "string") return true;
  const stripped = val.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return stripped.length === 0;
};

const hasText = (val?: string) => !isTextEmpty(val);

const fontSizePc = (pc: number) => {
  const refW = props.reference_size?.width && props.reference_size.width > 0
    ? props.reference_size.width
    : width.value;
  const refH = props.reference_size?.height && props.reference_size.height > 0
    ? props.reference_size.height
    : height.value;
  const effectiveWidth = Math.min(refW, refH * (16 / 9));
  const effectiveHeight = effectiveWidth / (16 / 9);
  
  return ((pc * effectiveHeight) / 100 / 2) * 1;
};

const getStableDims = () => {
  if (props.reference_size?.width && props.reference_size.width > 0 && props.reference_size?.height && props.reference_size.height > 0) {
    return {
      w: props.reference_size.width,
      h: props.reference_size.height,
    };
  }
  if (width.value > 0 && width.value < 500 && !(typeof window !== "undefined" && window.innerWidth > 800 && appdata?.get?.("modules.media.show") && !appdata?.get?.("modules.media.minimized"))) {
    return {
      w: width.value,
      h: height.value || 180,
    };
  }
  if (typeof window !== "undefined" && window.innerWidth > 0 && window.innerHeight > 0) {
    return {
      w: Math.floor(window.innerWidth * 0.95),
      h: Math.floor(window.innerHeight * 0.88),
    };
  }
  return { w: width.value || 1280, h: height.value || 720 };
};

const stableFontSizePc = (pc: number) => {
  const dims = getStableDims();
  const effectiveWidth = Math.min(dims.w, dims.h * (16 / 9));
  const effectiveHeight = effectiveWidth / (16 / 9);
  return ((pc * effectiveHeight) / 100 / 2) * 1;
};

let measureCanvas: HTMLCanvasElement | null = null;

const measureTextWidth = (
  text: string,
  fontSizePx: number,
  fontWeight: string = "900",
  fontFamily: string = "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
): number => {
  if (typeof document === "undefined") return 0;
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  const clean = text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return ctx.measureText(clean).width;
};

const hasExplicitLineBreak = (text?: string): boolean => {
  if (!text) return false;
  return /<br\s*\/?>/i.test(text) || /\r?\n/.test(text);
};

const shouldWrapTitle = computed(() => {
  const text = props_slide.value?.text;
  if (!text || isTextEmpty(text)) return false;

  if (hasExplicitLineBreak(text)) return true;

  const baseSize = customTextFormat.value ? (21 * customFontSize.value) / 100 : 21;
  const fontWeight = customFontWeight.value ? customFontWeight.value : "900";
  const titleFontSize = stableFontSizePc(baseSize);

  const textWidth = measureTextWidth(text, titleFontSize, fontWeight);
  const cardPaddingH = stableFontSizePc(8) * 2;
  const dims = getStableDims();

  const maxAvailableForText = Math.floor(dims.w * 0.85) - cardPaddingH;

  return textWidth > maxAvailableForText;
});

const formatCoverTitle = (text?: string): string => {
  if (!text) return "";
  if (!text.includes("<br>") && text.includes("\n")) {
    return text.replace(/[\r\n]+/g, "<br>");
  }
  return text;
};

const formatLyricText = (text?: string): string => {
  if (!text) return "";
  if (!text.includes("<br>") && text.includes("\n")) {
    return text.replace(/[\r\n]+/g, "<br>");
  }
  return text;
};

const currentSlideScale = computed(() => {
  const slide = currentSlide.value;
  if (!slide || slide.cover || !hasText(slide.text)) return 1;

  const rawText = formatLyricText(slide.text);
  const rawLines = rawText.split(/<br\s*\/?>|\r?\n/gi);
  const cleanLines = rawLines
    .map((l: string) => l.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim())
    .filter((l: string) => l.length > 0);

  if (cleanLines.length === 0) return 1;

  const dims = getStableDims();
  const currentW = width.value > 0 ? width.value : dims.w;
  const currentH = height.value > 0 ? height.value : dims.h;

  const outerPad = fontSizePc(4) * 2;
  const usableW = Math.max(100, currentW - outerPad);
  const usableH = Math.max(100, currentH - outerPad);

  // O card ocupa no máximo 92% da largura e 84% da altura utilizável
  const maxCardW = usableW * 0.92;
  const maxCardH = usableH * 0.84;

  // Usa as dimensões do container fixo da música se calculado, ou o limite máximo como base
  const cardW = fixedCardWidth.value > 0 ? fixedCardWidth.value : maxCardW;
  const cardH = fixedCardHeight.value > 0 ? fixedCardHeight.value : maxCardH;

  // Paddings internos do card
  const padH = fontSizePc(6) * 2;
  const padV = fontSizePc(4.5) * 2;

  const availableTextW = Math.max(50, cardW - padH);
  const availableTextH = Math.max(50, cardH - padV);

  const baseSizeMultiplier = customTextFormat.value ? customFontSize.value / 100 : 1;
  const baseFontSize = fontSizePc((props.text_size_pc ?? 15) * 1.14) * baseSizeMultiplier;
  const fontWeight = customTextFormat.value ? (customFontWeight.value || "700") : "700";

  let maxLineWidth = 0;
  for (const line of cleanLines) {
    const w = measureTextWidth(line, baseFontSize, fontWeight);
    if (w > maxLineWidth) maxLineWidth = w;
  }

  let scaleW = 1;
  if (maxLineWidth > availableTextW && availableTextW > 0) {
    scaleW = availableTextW / maxLineWidth;
  }

  // Altura total das linhas (line-height: 1.4)
  const estimatedTextH = cleanLines.length * baseFontSize * 1.4;
  let scaleH = 1;
  if (estimatedTextH > availableTextH && availableTextH > 0) {
    scaleH = availableTextH / estimatedTextH;
  }

  const scale = Math.min(1, scaleW, scaleH);
  return Math.max(0.40, scale);
});

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
    currentSlide.value &&
    stringHelper.clean(currentSlide.value.text || "") === stringHelper.clean(props_slide.value.text || "") &&
    stringHelper.clean(currentSlide.value.aux_text || "") === stringHelper.clean(props_slide.value.aux_text || "") &&
    currentSlide.value.image === props_slide.value.image &&
    currentSlide.value.cover === props_slide.value.cover
  ) {
    repeat.value = !repeat.value;
    return;
  }
  repeat.value = false;

  currentSlide.value = {
    ...props_slide.value,
    uid: ++slideUid,
  };
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
  const widthStyle = shouldWrapTitle.value ? "fit-content" : "max-content";
  return {
    position: "relative" as const,
    width: widthStyle,
    maxWidth: "100%",
    boxSizing: "border-box" as const,
    padding: "0",
    backgroundColor: "transparent",
    border: "none",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    boxShadow: "none",
  };
};

const formatCoverSubtitle = (text: string): string => {
  if (!text) return "";
  let str = text.trim();
  str = str.replace(/^(\d+)\s*[-•·.:]\s*/, "$1  ·  ");
  str = str.replace(/\s+-\s+/, "  ·  ");
  return str;
};

const style_subtitle_whisker = computed(() => {
  const whiskerWidth = Math.max(16, fontSizePc(6.5));
  return {
    display: "inline-block",
    width: `${whiskerWidth}px`,
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    flexShrink: 0,
  };
});

const style_subtitle_text = computed(() => {
  const baseSize = customTextFormat.value ? (5.2 * customFontSize.value) / 100 : 5.2;
  const textColor = "#FFFFFF";
  return {
    margin: `0 ${Math.max(14, Math.round(fontSizePc(3)))}px`,
    fontFamily: "'Montserrat', sans-serif",
    fontSize: `${fontSizePc(baseSize)}px`,
    fontWeight: "600",
    color: textColor,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
    lineHeight: "1",
    whiteSpace: "nowrap" as const,
  };
});

const style_cover_subtitle = (_slide: any): any => {
  const isBgRemoved = customBg.value && removeTextBg.value;

  if (isBgRemoved) {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "90%",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "9999px",
      padding: `${fontSizePc(1.6)}px ${fontSizePc(5)}px`,
      marginTop: `${fontSizePc(3.5)}px`,
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      boxShadow: "none",
      whiteSpace: "nowrap" as const,
    };
  }

  const hasTextBg = !customTextFormat.value || customTextBgIntensity.value > 0;
  const bgColor = customTextFormat.value
    ? hexToRgba(customTextBgColor.value, customTextBgIntensity.value / 100)
    : "rgba(23, 38, 59, 0.65)";
  const hasBorder = !customTextFormat.value || customTextBgBorder.value;
  const borderCol = "rgba(255, 255, 255, 0.22)";

  return {
    position: "relative" as const,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "90%",
    backgroundColor: hasTextBg ? bgColor : "transparent",
    border: hasBorder ? `1px solid ${borderCol}` : "none",
    borderRadius: "9999px",
    padding: `${Math.max(8, Math.round(fontSizePc(2)))}px ${Math.max(26, Math.round(fontSizePc(6)))}px`,
    marginTop: `${Math.max(22, Math.round(fontSizePc(4.5)))}px`,
    zIndex: 2,
    backdropFilter: hasTextBg ? "blur(14px)" : "none",
    WebkitBackdropFilter: hasTextBg ? "blur(14px)" : "none",
    boxShadow: hasTextBg
      ? "0 10px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
      : "none",
    whiteSpace: "nowrap" as const,
  };
};

const style_cover_title = (_slide: any): any => {
  const baseColor = "#f5af19";
  const baseSize = customTextFormat.value ? (22 * customFontSize.value) / 100 : 22;
  const fontWeight = customFontWeight.value ? customFontWeight.value : "900";
  return {
    width: shouldWrapTitle.value ? "100%" : "max-content",
    maxWidth: "100%",
    boxSizing: "border-box" as const,
    fontFamily: "'Montserrat', sans-serif",
    fontSize: `${fontSizePc(baseSize)}px`,
    color: baseColor,
    fontWeight,
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
    textAlign: "center" as const,
    lineHeight: "1.15",
    margin: "0",
    padding: "0",
    whiteSpace: shouldWrapTitle.value ? ("normal" as const) : ("nowrap" as const),
    textWrap: "balance" as const,
    overflowWrap: "break-word" as const,
    wordBreak: "normal" as const,
    textShadow: "0 6px 18px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.28)",
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

const measureItemStyle = (item: any): any => {
  const sizeMultiplier = customTextFormat.value ? customFontSize.value / 100 : 1;
  const borderSize = 1;
  const dims = getStableDims();
  const currentW = width.value > 0 ? width.value : dims.w;
  const baseFontSize = fontSizePc((props.text_size_pc ?? 15) * 1.14) * sizeMultiplier;
  const fontWeight = customTextFormat.value ? (customFontWeight.value || "700") : "700";

  const rawText = formatLyricText(item?.lyric || item?.text || "");
  const rawLines = rawText.split(/<br\s*\/?>|\r?\n/gi);
  const cleanLines = rawLines
    .map((l: string) => l.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim())
    .filter((l: string) => l.length > 0);

  const outerPad = fontSizePc(4) * 2;
  const usableW = Math.max(100, currentW - outerPad);
  const availableTextW = Math.max(50, (usableW * 0.92) - (fontSizePc(6) * 2));

  let maxLineWidth = 0;
  for (const line of cleanLines) {
    const w = measureTextWidth(line, baseFontSize, fontWeight);
    if (w > maxLineWidth) maxLineWidth = w;
  }

  let scale = 1;
  if (maxLineWidth > availableTextW && availableTextW > 0) {
    scale = Math.max(0.40, availableTextW / maxLineWidth);
  }

  return {
    display: "inline-block",
    boxSizing: "border-box" as const,
    padding: `${fontSizePc(4.5) * Math.max(0.65, scale)}px ${fontSizePc(6.5) * Math.max(0.65, scale)}px`,
    border: `${borderSize}px solid transparent`,
    fontSize: `${baseFontSize * scale}px`,
    fontWeight,
    letterSpacing: "0.03em",
    lineHeight: "1.4",
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
    whiteSpace: "normal" as const,
    wordBreak: "break-word" as const,
    maxWidth: `${Math.floor(usableW * 0.92)}px`,
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

  const dims = getStableDims();
  const currentW = width.value > 0 ? width.value : dims.w;
  const currentH = height.value > 0 ? height.value : dims.h;

  const outerPad = fontSizePc(4) * 2;
  const usableW = Math.max(100, currentW - outerPad);
  const usableH = Math.max(100, currentH - outerPad);

  const maxAllowedCardW = Math.floor(usableW * 0.92);
  const maxAllowedCardH = Math.floor(usableH * 0.84);

  const padH = fontSizePc(6) * 2;
  const padV = fontSizePc(4.5) * 2;
  const availableTextW = Math.max(50, maxAllowedCardW - padH);
  const availableTextH = Math.max(50, maxAllowedCardH - padV);

  const baseMultiplier = customTextFormat.value ? customFontSize.value / 100 : 1;
  const baseFontSize = fontSizePc((props.text_size_pc ?? 15) * 1.14) * baseMultiplier;
  const fontWeight = customTextFormat.value ? (customFontWeight.value || "700") : "700";

  let maxW = 0;
  let maxH = 0;

  // 1. Mede analiticamente cada slide da música para encontrar a largura e altura do maior slide
  slidesToMeasure.value.forEach((item: any) => {
    const rawText = formatLyricText(item?.lyric || item?.text || "");
    const rawLines = rawText.split(/<br\s*\/?>|\r?\n/gi);
    const cleanLines = rawLines
      .map((l: string) => l.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim())
      .filter((l: string) => l.length > 0);

    if (cleanLines.length === 0) return;

    let maxLineW = 0;
    for (const line of cleanLines) {
      const w = measureTextWidth(line, baseFontSize, fontWeight);
      if (w > maxLineW) maxLineW = w;
    }

    let scaleW = 1;
    if (maxLineW > availableTextW && availableTextW > 0) {
      scaleW = availableTextW / maxLineW;
    }

    const estimatedTextH = cleanLines.length * baseFontSize * 1.4;
    let scaleH = 1;
    if (estimatedTextH > availableTextH && availableTextH > 0) {
      scaleH = availableTextH / estimatedTextH;
    }

    const itemScale = Math.max(0.40, Math.min(1, scaleW, scaleH));

    const itemPadH = Math.max(16, Math.round(fontSizePc(6.5) * Math.max(0.65, itemScale))) * 2;
    const itemPadV = Math.max(8, Math.round(fontSizePc(4.5) * Math.max(0.65, itemScale))) * 2;

    const itemW = Math.ceil(maxLineW * itemScale) + itemPadH;
    const itemH = Math.ceil(cleanLines.length * baseFontSize * itemScale * 1.4) + itemPadV;

    if (itemW > maxW) maxW = itemW;
    if (itemH > maxH) maxH = itemH;
  });

  // 2. Se os elementos DOM no container de medição medirem algo a mais, considera também
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
    fixedCardWidth.value = Math.min(Math.ceil(maxW) + 4, maxAllowedCardW);
    fixedCardHeight.value = Math.min(Math.ceil(maxH), maxAllowedCardH);
  }
};

const style_text = (_slide: any): any => { 
  const isBgRemoved = customBg.value && removeTextBg.value;

  const scale = currentSlideScale.value;
  const cardRadius = `${Math.max(18, Math.round(fontSizePc(6.5) * Math.max(0.7, scale)))}px`;

  const padV = Math.max(8, Math.round(fontSizePc(4.5) * Math.max(0.65, scale)));
  const padH = Math.max(16, Math.round(fontSizePc(6.5) * Math.max(0.65, scale)));

  const baseMultiplier = customTextFormat.value ? customFontSize.value / 100 : 1;
  const finalFontSize = fontSizePc((props.text_size_pc ?? 15) * 1.14) * baseMultiplier * scale;

  const fixedDims: any = {
    maxWidth: "92%",
    maxHeight: "84%",
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: cardRadius,
    padding: `${padV}px ${padH}px`,
  };

  if (fixedCardWidth.value > 0) {
    fixedDims.width = `${fixedCardWidth.value}px`;
  }
  if (fixedCardHeight.value > 0) {
    fixedDims.height = `${fixedCardHeight.value}px`;
  }

  if (isBgRemoved) {
    const bgStyles = {
      backgroundColor: "transparent",
      border: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      boxShadow: "none",
    };

    if (customTextFormat.value) {
      return {
        ...bgStyles,
        ...fixedDims,
        textAlign: "center" as const,
        textTransform: "uppercase",
        fontSize: `${finalFontSize}px`,
        color: props.text_color ?? (repeat.value ? "#f6c32a" : customFontColor.value),
        fontWeight: customFontWeight.value || "700",
        letterSpacing: "0.03em",
        lineHeight: "1.4",
        textShadow: "0px 2px 10px rgba(0, 0, 0, 0.8)",
      };
    }

    return {
      ...bgStyles,
      ...fixedDims,
      textAlign: "center" as const,
      textTransform: "uppercase",
      fontSize: `${finalFontSize}px`,
      color: props.text_color ?? (repeat.value ? "#f6c32a" : "#ffffff"),
      fontWeight: "700",
      letterSpacing: "0.03em",
      lineHeight: "1.4",
    };
  }

  if (customTextFormat.value) {
    const hasTextBg = customTextBgIntensity.value > 0;
    return {
      ...fixedDims,
      backgroundColor: hasTextBg ? hexToRgba(customTextBgColor.value, customTextBgIntensity.value / 100) : "transparent",
      border: hasTextBg && customTextBgBorder.value ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
      backdropFilter: hasTextBg ? "blur(12px)" : "none",
      WebkitBackdropFilter: hasTextBg ? "blur(12px)" : "none",
      boxShadow: hasTextBg ? "0 10px 30px rgba(0, 0, 0, 0.3)" : "none",
      textAlign: "center" as const,
      textTransform: "uppercase",
      fontSize: `${finalFontSize}px`,
      color: props.text_color ?? (repeat.value ? "#f6c32a" : customFontColor.value),
      fontWeight: customFontWeight.value || "700",
      letterSpacing: "0.03em",
      lineHeight: "1.4",
      textShadow: "0px 2px 10px rgba(0, 0, 0, 0.8)",
    };
  }

  // Padrão clean com cantos levemente arredondados
  return {
    ...fixedDims,
    backgroundColor: "rgba(10, 16, 26, 0.52)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    textAlign: "center" as const,
    textTransform: "uppercase",
    fontSize: `${finalFontSize}px`,
    color: props.text_color ?? (repeat.value ? "#f6c32a" : "#ffffff"),
    fontWeight: "700",
    letterSpacing: "0.03em",
    lineHeight: "1.4",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  };
};

let resizeTimer: any = null;
let animationCheckTimer: any = null;

const windowResize = () => {
  if (container.value) {
    const newW = container.value.offsetWidth;
    const newH = container.value.offsetHeight;

    if (newW <= 0 || newH <= 0) {
      setTimeout(() => {
        windowResize();
      }, 100);
      return;
    }

    width.value = newW;
    height.value = newH;

    nextTick(() => {
      calculateMaxCardSize();
    });

    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (container.value) {
        width.value = container.value.offsetWidth;
        height.value = container.value.offsetHeight;
      }
      nextTick(() => {
        calculateMaxCardSize();
      });
    }, 150);

    if (animationCheckTimer) clearTimeout(animationCheckTimer);
    animationCheckTimer = setTimeout(() => {
      if (container.value) {
        width.value = container.value.offsetWidth;
        height.value = container.value.offsetHeight;
      }
      nextTick(() => {
        calculateMaxCardSize();
      });
    }, 350);
  }
};

watch(props_slide, () => {
  setSlide();
  nextTick(() => {
    if (fixedCardWidth.value === 0) {
      calculateMaxCardSize();
    }
  });
});

watch(slidesToMeasure, () => {
  nextTick(() => {
    calculateMaxCardSize();
  });
}, { deep: true, immediate: true });

watch([width, height], ([newW, newH], [oldW, oldH]) => {
  if (newW > 0 && newH > 0 && (newW !== oldW || newH !== oldH)) {
    nextTick(() => {
      calculateMaxCardSize();
    });
  }
});

watch(
  () => [appdata.get("modules.media.show"), appdata.get("modules.media.minimized")],
  ([show, min]) => {
    if (show && !min) {
      nextTick(() => {
        windowResize();
      });
      setTimeout(() => {
        windowResize();
      }, 150);
      setTimeout(() => {
        windowResize();
      }, 350);
    }
  },
);

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
  setTimeout(() => {
    calculateMaxCardSize();
  }, 350);
});

onUnmounted(() => {
  if (resizeTimer) clearTimeout(resizeTimer);
  if (animationCheckTimer) clearTimeout(animationCheckTimer);
  window.removeEventListener("resize", windowResize);
  window.removeEventListener("storage", updateSettings);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.slide-fade-enter-active {
  transition: opacity 0.35s ease;
  z-index: 2;
}

.slide-fade-enter-from {
  opacity: 0;
}

.slide-fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.slide-fade-leave-to {
  opacity: 1;
}

/* Modo sem fundo (transparência ativa): o slide anterior faz fade-out */
.slide-fade-transparent-enter-active {
  transition: opacity 0.35s ease;
  z-index: 2;
}

.slide-fade-transparent-enter-from {
  opacity: 0;
}

.slide-fade-transparent-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.slide-fade-transparent-leave-to {
  opacity: 0;
}

.fade-blackout-enter-active,
.fade-blackout-leave-active {
  transition: opacity 0.2s ease;
}
.fade-blackout-enter-from,
.fade-blackout-leave-to {
  opacity: 0;
}

.slide-lyric-card {
  transition: all 0.25s ease-out;
}

.slide-lyric-content {
  white-space: normal;
  word-break: normal;
  overflow-wrap: break-word;
  text-wrap: balance;
}
</style>
