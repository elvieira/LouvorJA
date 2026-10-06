<template>
  <div
    class="screen-container w-100 h-100 position-relative overflow-hidden"
    :style="backgroundStyle"
    :class="[{ 'blink-animation': isAlerting }, { 'is-preview': preview }]"
  >
    <!-- MODO PADRÃO (Regressivo / Progressivo) -->
    <template v-if="mode !== 'cult'">
      <div 
        class="timer-main-wrapper"
        :style="timerWrapperStyle"
      >
        <!-- Texto Personalizado (Acima quando vinculado) -->
        <div
          v-if="config.customText && (config.customTextPosition === 'above' || !config.customTextPosition)"
          class="custom-timer-title font-weight-bold"
          :style="customTextStyle"
        >
          {{ config.customText }}
        </div>

        <div 
          class="timer-text font-weight-black" 
          :style="textStyle"
        >
          {{ formattedTime }}
        </div>

        <!-- Texto Personalizado (Abaixo quando vinculado) -->
        <div
          v-if="config.customText && config.customTextPosition === 'below'"
          class="custom-timer-title font-weight-bold"
          :style="customTextStyle"
        >
          {{ config.customText }}
        </div>
      </div>

      <!-- Texto Personalizado Livre (Independente) -->
      <div
        v-if="config.customText && config.customTextPosition === 'custom'"
        class="custom-timer-title font-weight-bold"
        :style="customTextFreeStyle"
      >
        {{ config.customText }}
      </div>
    </template>

    <!-- MODO CRONÔMETRO DE CULTO -->
    <template v-else>
      <div class="cult-container w-100 h-100 position-relative overflow-hidden">
        <!-- SE VISUALIZAÇÃO NA JANELA PRINCIPAL (PREVIEW) -->
        <template v-if="preview">
          <div class="cult-preview-main-layout w-100 h-100 position-relative d-flex flex-column align-center justify-center">
            <!-- Bloco Central: Relógio e Cronômetro -->
            <div class="d-flex flex-column align-center justify-center text-center">
              <!-- Relógio (Hora Atual) -->
              <div
                v-if="showCultClock"
                class="cult-clock font-weight-bold text-center d-flex align-center justify-center mb-1"
                :style="previewCultClockStyle"
              >
                {{ currentClockTime }}
              </div>

              <!-- Cronômetro (Tempo Restante) -->
              <div
                class="cult-timer font-weight-black text-center d-flex align-center justify-center"
                :style="previewCultTimerStyle"
              >
                {{ formattedCultTime }}
              </div>
            </div>

            <!-- Texto Personalizado: Abaixo, entre o cronômetro e a parte de baixo -->
            <div
              v-if="effectiveCultCustomText"
              class="custom-timer-title font-weight-bold text-center position-absolute"
              :style="previewCultCustomTextStyle"
            >
              {{ effectiveCultCustomText }}
            </div>
          </div>
        </template>

        <!-- SE TELA DE PROJEÇÃO (NÃO PREVIEW): Segue o posicionamento configurado -->
        <template v-else>
          <!-- SE MODO INDIVIDUAL -->
          <template v-if="config.cultPosMode === 'individual'">
            <!-- Texto Personalizado se configurado -->
            <div
              v-if="effectiveCultCustomText"
              class="custom-timer-title font-weight-bold"
              :style="cultTextStyle"
            >
              {{ effectiveCultCustomText }}
            </div>

            <!-- Relógio / Hora Atual -->
            <div
              v-if="showCultClock"
              class="cult-clock font-weight-bold text-center d-flex align-center justify-center"
              :style="cultClockStyle"
            >
              {{ currentClockTime }}
            </div>

            <!-- Cronômetro / Tempo Restante -->
            <div
              class="cult-timer font-weight-black text-center d-flex align-center justify-center"
              :style="cultTimerStyle"
            >
              {{ formattedCultTime }}
            </div>
          </template>

          <!-- SE MODO JUNTOS (TOGETHER) -->
          <template v-else>
            <div
              class="cult-main-wrapper"
              :style="cultWrapperStyle"
            >
              <!-- Texto Personalizado Vinculado Acima -->
              <div
                v-if="effectiveCultCustomText && (config.cultCustomTextPosition === 'above' || (!config.cultCustomTextPosition && config.customTextPosition !== 'below' && config.customTextPosition !== 'custom'))"
                class="custom-timer-title font-weight-bold mb-1"
                :style="cultTogetherCustomTextStyle"
              >
                {{ effectiveCultCustomText }}
              </div>

              <!-- Mostrador Superior: Hora Atual (Relógio) -->
              <div
                v-if="showCultClock"
                class="cult-clock font-weight-bold text-center d-flex align-center justify-center"
                :style="cultClockStyle"
              >
                {{ currentClockTime }}
              </div>

              <!-- Mostrador Inferior: Tempo Restante / Negativo -->
              <div
                class="cult-timer font-weight-black text-center d-flex align-center justify-center"
                :style="cultTimerStyle"
              >
                {{ formattedCultTime }}
              </div>

              <!-- Texto Personalizado Vinculado Abaixo -->
              <div
                v-if="effectiveCultCustomText && (config.cultCustomTextPosition === 'below' || (!config.cultCustomTextPosition && config.customTextPosition === 'below'))"
                class="custom-timer-title font-weight-bold mt-1"
                :style="cultTogetherCustomTextStyle"
              >
                {{ effectiveCultCustomText }}
              </div>
            </div>

            <!-- Texto Personalizado Livre no Culto -->
            <div
              v-if="effectiveCultCustomText && (config.cultCustomTextPosition === 'custom' || (!config.cultCustomTextPosition && config.customTextPosition === 'custom'))"
              class="custom-timer-title font-weight-bold"
              :style="cultTextStyle"
            >
              {{ effectiveCultCustomText }}
            </div>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { playSchoolBellAlert, stopSchoolBellAlert, playCultAlert } from "../../helpers/audioAlert";

function getLuminance(colorStr?: string | null): number {
  if (!colorStr) return 0;
  const hex = colorStr.trim();
  if (hex.startsWith("#")) {
    let cleanHex = hex.slice(1);
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  return 0;
}

function isLightColor(colorStr?: string | null): boolean {
  return getLuminance(colorStr) > 0.6;
}

export default defineComponent({
  name: "TimerScreen",
  props: {
    preview: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  data: () => ({
    module_id: "timer",
    currentTimeMs: 0,
    currentClockTime: "00:00:00",
    cultRemainingMs: 0,
    animationFrameId: null as number | null,
    clockIntervalId: null as any,
  }),
  computed: {
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.$userdata.get(`modules.${this.module_id}.config`) || {
        fontColor: "#ffffff",
        bgColor: "#000000",
        fontSizePc: 25,
        posX: 50,
        posY: 50,
        customText: "",
        customTextSizePc: 8,
        customTextColor: "#ffffff",
        customTextPosition: "above",
        customTextX: 50,
        customTextY: 20,
        visualAlert: true,
        audioAlert: true,
        cultBgColor: "#000000",
        cultBgImage: null,
        cultClockColor: "#ffffff",
        cultTimerColor: "#38bdf8",
        cultWarningColor: "#ef4444",
        cultAlwaysShowClock: true,
        cultAllowNegative: true,
        cultAudioStart: false,
        cultAudio5min: true,
        cultAudio1min: true,
        cultAudioEnd: true,
        bgImage: null,
        cultClockSizePc: 12,
        cultTimerSizePc: 22,
        cultPosMode: "together",
        cultPosX: 50,
        cultPosY: 50,
        cultClockX: 50,
        cultClockY: 35,
        cultTimerX: 50,
        cultTimerY: 60,
        cultTextX: 50,
        cultTextY: 15,
        cultCustomText: "",
        cultCustomTextColor: "#ffffff",
        cultCustomTextSizePc: 8,
        cultCustomTextPosition: "above",
      };
    },
    timerData(): any {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        mode: "timer",
        isStopwatch: false,
        isRunning: false,
        isFinished: false,
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 0,
        configuredDuration: 0,
        isAlerting: false,
        // Culto
        cultModeType: "duration",
        cultTargetEndTime: 0,
        cultTotalDurationMs: 0,
        cultRemainingMs: 0,
      };
    },
    mode(): string {
      return this.timerData?.mode || (this.timerData?.isStopwatch ? "stopwatch" : "timer");
    },
    isAlerting(): boolean {
      if (this.mode === "cult") return false;
      return Boolean(this.timerData?.isAlerting && this.config?.visualAlert !== false);
    },
    showCultClock(): boolean {
      return this.config.cultAlwaysShowClock !== false;
    },
    isCultNegative(): boolean {
      return this.cultRemainingMs < 0;
    },
    formattedTime(): string {
      const totalSeconds = Math.floor(this.currentTimeMs / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      const mStr = m.toString().padStart(2, "0");
      const sStr = s.toString().padStart(2, "0");
      
      if (h > 0) {
        const hStr = h.toString().padStart(2, "0");
        return `${hStr}:${mStr}:${sStr}`;
      }
      return `${mStr}:${sStr}`;
    },
    formattedCultTime(): string {
      const isNeg = this.cultRemainingMs < 0;
      const absSeconds = Math.floor(Math.abs(this.cultRemainingMs) / 1000);
      const h = Math.floor(absSeconds / 3600);
      const m = Math.floor((absSeconds % 3600) / 60);
      const s = absSeconds % 60;

      const mStr = m.toString().padStart(2, "0");
      const sStr = s.toString().padStart(2, "0");

      let text = "";
      if (h > 0) {
        const hStr = h.toString().padStart(2, "0");
        text = `${hStr}:${mStr}:${sStr}`;
      } else {
        text = `${mStr}:${sStr}`;
      }

      return isNeg ? `-${text}` : text;
    },
    effectiveBgColor(): string {
      if (this.mode === "cult") {
        return this.config.cultBgColor || this.config.bgColor || "#000000";
      }
      return this.config.bgColor || "#000000";
    },
    hasBgImage(): boolean {
      if (this.mode === "cult") {
        return Boolean(this.config.cultBgImage || this.config.bgImage);
      }
      return Boolean(this.config.bgImage);
    },
    isLightBackground(): boolean {
      if (this.hasBgImage) {
        return false;
      }
      return isLightColor(this.effectiveBgColor);
    },
    textShadowValue(): string {
      if (this.preview) return "none";
      if (this.hasBgImage) {
        return "0 4px 20px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0, 0, 0, 0.8)";
      }
      if (this.isLightBackground) {
        return "0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)";
      }
      return "0 4px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.6)";
    },
    cultClockTextShadowValue(): string {
      if (this.preview) return "none";
      if (this.hasBgImage) {
        return "0 3px 14px rgba(0, 0, 0, 0.7), 0 1px 4px rgba(0, 0, 0, 0.8)";
      }
      if (this.isLightBackground) {
        return "0 2px 10px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06)";
      }
      return "0 3px 16px rgba(0, 0, 0, 0.5), 0 1px 6px rgba(0, 0, 0, 0.6)";
    },
    effectiveCultClockColor(): string {
      if (this.preview) {
        return "var(--sidebar-text)";
      }
      const rawColor = this.config.cultClockColor || "#ffffff";
      if (this.isLightBackground && isLightColor(rawColor)) {
        return "#0f172a";
      }
      return rawColor;
    },
    effectiveCultTimerColor(): string {
      const color = this.isCultNegative
        ? (this.config.cultWarningColor || "#ef4444")
        : (this.config.cultTimerColor || "#38bdf8");
      if (this.preview) {
        return color;
      }
      if (this.isLightBackground && isLightColor(color) && getLuminance(color) > 0.85) {
        return "#0284c7";
      }
      return color;
    },
    effectiveFontColor(): string {
      if (this.preview) {
        return "var(--sidebar-text)";
      }
      const rawColor = this.config.fontColor || "#ffffff";
      if (this.isLightBackground && isLightColor(rawColor)) {
        return "#0f172a";
      }
      return rawColor;
    },
    timerWrapperStyle(): any {
      const x = this.preview ? 50 : (this.config.posX ?? 50);
      const y = this.preview ? 50 : (this.config.posY ?? 50);
      const align = this.preview ? "center" : (x <= 30 ? "flex-start" : x >= 70 ? "flex-end" : "center");
      const textAlign = this.preview ? "center" : (x <= 30 ? "left" : x >= 70 ? "right" : "center");
      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        textAlign,
        maxWidth: "94%",
        userSelect: "none",
        pointerEvents: "auto",
        transition: this.preview ? "none" : "all 0.2s ease-out",
      };
    },
    customTextStyle(): any {
      const sizePc = this.config.customTextSizePc ?? 8;
      return {
        color: this.config.customTextColor || this.effectiveFontColor,
        fontSize: this.preview ? `clamp(1rem, ${sizePc * 0.3}vw, 3rem)` : `${sizePc}vmin`,
        lineHeight: 1.2,
        marginBottom: this.config.customTextPosition === "below" ? "0" : "1.2vmin",
        marginTop: this.config.customTextPosition === "below" ? "1.2vmin" : "0",
        textShadow: this.textShadowValue,
        letterSpacing: "0.02em",
        wordBreak: "break-word",
      };
    },
    customTextFreeStyle(): any {
      const x = this.preview ? 50 : (this.config.customTextX ?? 50);
      const y = this.preview ? 82 : (this.config.customTextY ?? 20);
      const sizePc = this.config.customTextSizePc ?? 8;
      const align = this.preview ? "center" : (x <= 30 ? "left" : x >= 70 ? "right" : "center");
      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        color: this.config.customTextColor || this.effectiveFontColor,
        fontSize: this.preview ? `clamp(1rem, ${sizePc * 0.3}vw, 3rem)` : `${sizePc}vmin`,
        lineHeight: 1.2,
        textAlign: align,
        textShadow: this.textShadowValue,
        letterSpacing: "0.02em",
        maxWidth: "94%",
        userSelect: "none",
        wordBreak: "break-word",
        transition: this.preview ? "none" : "all 0.2s ease-out",
      };
    },
    textStyle(): any {
      const sizePc = this.config.fontSizePc ?? 25;
      return {
        color: this.isAlerting
          ? "#ffffff"
          : this.effectiveFontColor,
        fontSize: this.preview ? `clamp(2.5rem, ${sizePc * 0.35}vw, 8.5rem)` : `${sizePc}vmin`,
        lineHeight: 1,
        textShadow: this.textShadowValue,
        fontVariantNumeric: "tabular-nums",
      };
    },
    cultWrapperStyle(): any {
      const x = this.config.cultPosX ?? this.config.posX ?? 50;
      const y = this.config.cultPosY ?? this.config.posY ?? 50;
      const align = x <= 30 ? "flex-start" : x >= 70 ? "flex-end" : "center";
      const textAlign = x <= 30 ? "left" : x >= 70 ? "right" : "center";
      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        textAlign,
        maxWidth: "94%",
        userSelect: "none",
        pointerEvents: "auto",
        transition: this.preview ? "none" : "all 0.2s ease-out",
      };
    },
    cultClockStyle(): any {
      const sizePc = this.config.cultClockSizePc ?? 12;
      const isIndividual = this.config.cultPosMode === "individual";
      const x = isIndividual ? (this.config.cultClockX ?? 50) : 50;
      const y = isIndividual ? (this.config.cultClockY ?? 35) : 0;
      const align = x <= 30 ? "left" : x >= 70 ? "right" : "center";
      const base: any = {
        color: this.effectiveCultClockColor,
        fontSize: this.preview ? `clamp(1.2rem, ${sizePc * 0.18}vw, 4.2rem)` : `${sizePc}vmin`,
        lineHeight: 1.1,
        textShadow: this.cultClockTextShadowValue,
        fontVariantNumeric: "tabular-nums",
        textAlign: align,
      };
      if (isIndividual) {
        base.position = "absolute";
        base.left = `${x}%`;
        base.top = `${y}%`;
        base.transform = `translate(-${x}%, -${y}%)`;
        base.maxWidth = "94%";
        base.userSelect = "none";
        base.pointerEvents = "auto";
        base.transition = this.preview ? "none" : "all 0.2s ease-out";
      }
      return base;
    },
    cultTimerStyle(): any {
      const sizePc = this.config.cultTimerSizePc ?? 22;
      const isIndividual = this.config.cultPosMode === "individual";
      const x = isIndividual ? (this.config.cultTimerX ?? 50) : 50;
      const y = isIndividual ? (this.config.cultTimerY ?? 60) : 0;
      const align = x <= 30 ? "left" : x >= 70 ? "right" : "center";
      const base: any = {
        color: this.effectiveCultTimerColor,
        fontSize: this.preview ? `clamp(2rem, ${sizePc * 0.3}vw, 7.5rem)` : `${sizePc}vmin`,
        lineHeight: 1.1,
        textShadow: this.textShadowValue,
        fontVariantNumeric: "tabular-nums",
        textAlign: align,
      };
      if (isIndividual) {
        base.position = "absolute";
        base.left = `${x}%`;
        base.top = `${y}%`;
        base.transform = `translate(-${x}%, -${y}%)`;
        base.maxWidth = "94%";
        base.userSelect = "none";
        base.pointerEvents = "auto";
        base.transition = this.preview ? "none" : "all 0.2s ease-out";
      }
      return base;
    },
    effectiveCultCustomText(): string {
      if (
        this.config.cultCustomText !== undefined &&
        this.config.cultCustomText !== null &&
        this.config.cultCustomText !== ""
      ) {
        return this.config.cultCustomText;
      }
      return this.config.customText || "";
    },
    cultTextStyle(): any {
      const x = this.config.cultTextX ?? this.config.customTextX ?? 50;
      const y = this.config.cultTextY ?? this.config.customTextY ?? 15;
      const sizePc = this.config.cultCustomTextSizePc ?? this.config.customTextSizePc ?? 8;
      const align = x <= 30 ? "left" : x >= 70 ? "right" : "center";
      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-${x}%, -${y}%)`,
        color: this.config.cultCustomTextColor || this.config.customTextColor || this.effectiveFontColor,
        fontSize: this.preview ? `clamp(1rem, ${sizePc * 0.3}vw, 3rem)` : `${sizePc}vmin`,
        lineHeight: 1.2,
        textAlign: align,
        textShadow: this.textShadowValue,
        letterSpacing: "0.02em",
        maxWidth: "94%",
        userSelect: "none",
        wordBreak: "break-word",
        transition: this.preview ? "none" : "all 0.2s ease-out",
        zIndex: 5,
      };
    },
    cultTogetherCustomTextStyle(): any {
      const sizePc = this.config.cultCustomTextSizePc ?? this.config.customTextSizePc ?? 8;
      return {
        color: this.config.cultCustomTextColor || this.config.customTextColor || this.effectiveFontColor,
        fontSize: this.preview ? `clamp(1rem, ${sizePc * 0.3}vw, 3rem)` : `${sizePc}vmin`,
        lineHeight: 1.2,
        textShadow: this.textShadowValue,
        letterSpacing: "0.02em",
        maxWidth: "94%",
        userSelect: "none",
        wordBreak: "break-word",
      };
    },
    previewCultClockStyle(): any {
      const sizePc = this.config.cultClockSizePc ?? 12;
      return {
        color: this.effectiveCultClockColor,
        fontSize: `clamp(1.3rem, ${sizePc * 0.22}vw, 4.2rem)`,
        lineHeight: 1.1,
        textShadow: this.cultClockTextShadowValue,
        fontVariantNumeric: "tabular-nums",
        textAlign: "center",
      };
    },
    previewCultTimerStyle(): any {
      const sizePc = this.config.cultTimerSizePc ?? 22;
      return {
        color: this.effectiveCultTimerColor,
        fontSize: `clamp(2.5rem, ${sizePc * 0.35}vw, 7.5rem)`,
        lineHeight: 1,
        textShadow: this.textShadowValue,
        fontVariantNumeric: "tabular-nums",
        textAlign: "center",
      };
    },
    previewCultCustomTextStyle(): any {
      const sizePc = this.config.cultCustomTextSizePc ?? this.config.customTextSizePc ?? 8;
      return {
        position: "absolute",
        left: "50%",
        bottom: "8%",
        transform: "translateX(-50%)",
        color: this.config.cultCustomTextColor || this.config.customTextColor || this.effectiveFontColor,
        fontSize: `clamp(1.1rem, ${sizePc * 0.28}vw, 2.8rem)`,
        lineHeight: 1.2,
        textAlign: "center",
        textShadow: this.textShadowValue,
        letterSpacing: "0.02em",
        maxWidth: "88%",
        userSelect: "none",
        wordBreak: "break-word",
      };
    },
    backgroundStyle(): any {
      if (this.isAlerting) {
        return {
          backgroundColor: "#78242c",
        };
      }
      if (this.preview) return { background: "transparent" };
      
      const bgImg = this.mode === "cult"
        ? (this.config.cultBgImage || this.config.bgImage)
        : this.config.bgImage;

      const baseBg = this.mode === "cult"
        ? (this.config.cultBgColor || this.config.bgColor || "#000000")
        : (this.config.bgColor || "#000000");

      if (bgImg) {
        return {
          backgroundColor: baseBg,
          backgroundImage: `url("${bgImg}")`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        };
      }

      return {
        background: baseBg,
      };
    },
  },
  watch: {
    isAlerting(newVal: boolean, oldVal: boolean) {
      if (!newVal && oldVal) {
        stopSchoolBellAlert();
      }
    },
  },
  mounted() {
    this.updateClock();
    this.clockIntervalId = setInterval(() => {
      this.updateClock();
    }, 500);
    this.startLoop();
  },
  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
    stopSchoolBellAlert();
  },
  methods: {
    updateClock() {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      this.currentClockTime = `${h}:${m}:${s}`;
    },
    startLoop() {
      const updateTime = () => {
        const data = this.timerData;
        const now = Date.now();

        if (data.mode === "cult") {
          // MODO CULTO
          if (data.isRunning) {
            const targetEnd = data.cultTargetEndTime || 0;
            const remaining = targetEnd - now;
            this.cultRemainingMs = remaining;

            // Alertas sonoros intermediários do Culto
            if (this.config.cultAudio5min !== false && !data.cultAudio5minPlayed) {
              if (remaining <= 300000 && remaining > 280000) {
                this.$appdata.set(`modules.${this.module_id}.data.cultAudio5minPlayed`, true);
                playCultAlert("5min");
              }
            }

            if (this.config.cultAudio1min !== false && !data.cultAudio1minPlayed) {
              if (remaining <= 60000 && remaining > 40000) {
                this.$appdata.set(`modules.${this.module_id}.data.cultAudio1minPlayed`, true);
                playCultAlert("1min");
              }
            }

            // Ao atingir 0
            if (remaining <= 0 && !data.cultAudioEndPlayed) {
              this.$appdata.set(`modules.${this.module_id}.data.cultAudioEndPlayed`, true);
              if (this.config.cultAudioEnd !== false) {
                playCultAlert("end");
              }

              // Se não permite contagem negativa, encerra automaticamente
              if (this.config.cultAllowNegative === false) {
                this.$appdata.set(`modules.${this.module_id}.data`, {
                  ...data,
                  isRunning: false,
                  isFinished: true,
                  cultRemainingMs: 0,
                });
              }
            }
          } else {
            // Culto parado / pausado / não iniciado
            if (data.isFinished) {
              this.cultRemainingMs = 0;
            } else if (data.cultRemainingMs !== undefined && data.cultRemainingMs !== null) {
              this.cultRemainingMs = data.cultRemainingMs;
            } else {
              this.cultRemainingMs = data.cultTotalDurationMs || 0;
            }
          }
        } else {
          // MODO PADRÃO (timer / stopwatch)
          if (data.isRunning) {
            const elapsed = data.accumulatedTime + (now - data.baseTime);
            
            if (data.isStopwatch) {
              this.currentTimeMs = elapsed;
            } else {
              let remaining = data.targetDuration - elapsed;
              if (remaining <= 0) {
                remaining = 0;
                if (data.isRunning) {
                  const visualAlert = this.config.visualAlert !== false;
                  this.$appdata.set(`modules.${this.module_id}.data`, {
                    ...data,
                    isRunning: false,
                    isFinished: true,
                    isAlerting: visualAlert,
                    accumulatedTime: data.targetDuration,
                  });
                  this.checkAndPlaySound();
                }
              }
              this.currentTimeMs = remaining;
            }
          } else {
            if (data.isStopwatch) {
              this.currentTimeMs = data.accumulatedTime || 0;
            } else {
              if (data.isFinished) {
                if (this.preview) {
                  if (data.isAlerting) {
                    this.currentTimeMs = 0;
                  } else {
                    this.currentTimeMs = data.configuredDuration || 0;
                  }
                } else {
                  this.currentTimeMs = 0;
                }
              } else {
                if (data.accumulatedTime > 0) {
                  this.currentTimeMs = Math.max(0, data.targetDuration - data.accumulatedTime);
                } else {
                  this.currentTimeMs = data.configuredDuration || data.targetDuration || 0;
                }
              }
            }
          }
        }
        
        this.animationFrameId = requestAnimationFrame(updateTime);
      };
      
      this.animationFrameId = requestAnimationFrame(updateTime);
    },
    checkAndPlaySound() {
      if (this.config.audioAlert === false) return;
      const lastPlayed = this.timerData.lastAudioAlertTime || 0;
      if (Date.now() - lastPlayed < 4000) return;
      this.$appdata.set(`modules.${this.module_id}.data.lastAudioAlertTime`, Date.now());
      playSchoolBellAlert();
    },
  },
});
</script>

<style scoped>
.timer-text, .cult-clock, .cult-timer {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

@keyframes alert-pulse {
  0%, 100% {
    opacity: 1;
    background-color: #8b1e2a !important;
  }
  50% {
    opacity: 0.65;
    background-color: #4a1218 !important;
  }
}

.blink-animation {
  animation: alert-pulse 1s infinite ease-in-out !important;
}

@media (max-height: 800px) {
  .screen-container.is-preview .cult-clock {
    font-size: clamp(1.2rem, 2.5vw, 2rem) !important;
  }
  .screen-container.is-preview .cult-timer {
    font-size: clamp(2.2rem, 4.5vw, 3.4rem) !important;
  }
}
</style>
