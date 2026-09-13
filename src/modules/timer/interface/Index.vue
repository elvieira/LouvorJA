<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <PillSwitch
          v-model="currentMode"
          :items="[
            { value: 'timer', label: t('mode_timer') },
            { value: 'stopwatch', label: t('mode_stopwatch') },
            { value: 'cult', label: t('mode_cult') },
          ]"
          :disabled="isRunning"
          @update:model-value="onModeChange"
        />
      </ModuleHeader>

      <!-- Main Content -->
      <div class="content-main flex-grow-1 w-100 pa-6 d-flex flex-column align-center justify-center" style="overflow-y: auto; background: transparent;">
        <!-- PREVIEW TV -->
        <div
          class="preview-tv position-relative mb-8"
          :style="{
            width: '100%',
            maxWidth: '900px',
            aspectRatio: '21/9',
            maxHeight: '100%',
            background: isAlerting ? '#78242c' : 'var(--card-bg, #ffffff)',
            borderRadius: '40px',
            boxShadow: isAlerting ? '0 20px 60px rgba(139, 30, 42, 0.35)' : '0 20px 60px rgba(0,0,0,0.05)',
            border: isAlerting ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color, rgba(0,0,0,0.05))',
            overflow: 'hidden',
            transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease'
          }"
        >
          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <v-btn
              variant="tonal"
              color="primary"
              icon
              size="small"
              @click="showConfig = true"
            >
              <v-icon>mdi-palette-outline</v-icon>
              <v-tooltip activator="parent" location="bottom">
                {{ t('config') }}
              </v-tooltip>
            </v-btn>
            <LScreenBtn module="timer" />
          </div>

          <!-- Botões Flutuantes de Ajuste de Tempo (Modo Culto) -->
          <template v-if="currentMode === 'cult'">
            <!-- Botão Diminuir (-) à Esquerda -->
            <div
              class="position-absolute"
              style="left: 24px; top: 50%; transform: translateY(-50%); z-index: 5;"
            >
              <v-menu
                location="end center"
                offset="14"
                transition="scale-transition"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="large"
                    variant="tonal"
                    color="error"
                    class="cult-adjust-btn"
                  >
                    <v-icon size="28">
                      mdi-minus
                    </v-icon>
                  </v-btn>
                </template>
                <v-card
                  class="rounded-xl pa-2"
                  elevation="12"
                  style="background: var(--card-bg, #1e293b); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); min-width: 110px; backdrop-filter: blur(16px);"
                >
                  <v-list
                    density="compact"
                    class="pa-0 bg-transparent"
                  >
                    <v-list-item
                      v-for="item in [
                        { label: '-30 seg', secs: -30 },
                        { label: '-1 min', secs: -60 },
                        { label: '-5 min', secs: -300 },
                        { label: '-10 min', secs: -600 },
                        { label: '-15 min', secs: -900 },
                      ]"
                      :key="item.label"
                      rounded="lg"
                      class="mb-1 text-none"
                      @click="addCultSeconds(item.secs)"
                    >
                      <v-list-item-title
                        class="font-weight-bold text-center"
                        style="font-size: 0.92rem;"
                      >
                        {{ item.label }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </div>

            <!-- Botão Aumentar (+) à Direita -->
            <div
              class="position-absolute"
              style="right: 24px; top: 50%; transform: translateY(-50%); z-index: 5;"
            >
              <v-menu
                location="start center"
                offset="14"
                transition="scale-transition"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="large"
                    variant="tonal"
                    color="success"
                    class="cult-adjust-btn"
                  >
                    <v-icon size="28">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </template>
                <v-card
                  class="rounded-xl pa-2"
                  elevation="12"
                  style="background: var(--card-bg, #1e293b); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); min-width: 110px; backdrop-filter: blur(16px);"
                >
                  <v-list
                    density="compact"
                    class="pa-0 bg-transparent"
                  >
                    <v-list-item
                      v-for="item in [
                        { label: '+30 seg', secs: 30 },
                        { label: '+1 min', secs: 60 },
                        { label: '+5 min', secs: 300 },
                        { label: '+10 min', secs: 600 },
                        { label: '+15 min', secs: 900 },
                      ]"
                      :key="item.label"
                      rounded="lg"
                      class="mb-1 text-none"
                      @click="addCultSeconds(item.secs)"
                    >
                      <v-list-item-title
                        class="font-weight-bold text-center"
                        style="font-size: 0.92rem;"
                      >
                        {{ item.label }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </div>
          </template>

          <Screen :preview="true" />
        </div>

        <!-- CONTROLS -->
        <div class="controls-area d-flex flex-column align-center justify-center">
          <!-- CONTROLES DO MODO PADRÃO (Regressivo / Progressivo) -->
          <v-expand-transition>
            <div v-if="currentMode !== 'cult'">
              <div v-if="!isRunning" class="d-flex align-center mb-6">
                <div class="d-flex flex-column align-center">
                  <input
                    v-model="editHours"
                    type="number"
                    class="time-input"
                    min="0"
                    max="99"
                  />
                  <span class="text-caption font-weight-bold mt-2" style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;">{{ t('hours_label') }}</span>
                </div>
                <div class="text-h3 font-weight-bold mx-3 pb-6" style="color: var(--sidebar-text-secondary);">
                  :
                </div>
                <div class="d-flex flex-column align-center">
                  <input
                    v-model="editMinutes"
                    type="number"
                    class="time-input"
                    min="0"
                    max="59"
                  />
                  <span class="text-caption font-weight-bold mt-2" style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;">{{ t('minutes_label') }}</span>
                </div>
                <div class="text-h3 font-weight-bold mx-3 pb-6" style="color: var(--sidebar-text-secondary);">
                  :
                </div>
                <div class="d-flex flex-column align-center">
                  <input
                    v-model="editSeconds"
                    type="number"
                    class="time-input"
                    min="0"
                    max="59"
                  />
                  <span class="text-caption font-weight-bold mt-2" style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;">{{ t('seconds_label') }}</span>
                </div>
              </div>
            </div>
          </v-expand-transition>

          <!-- CONTROLES DO MODO CRONÔMETRO DE CULTO -->
          <v-expand-transition>
            <div
              v-if="currentMode === 'cult' && !isRunning && !isPaused"
              class="d-flex flex-column align-center mb-6"
            >
              <!-- Seletor de Tipo de Término -->
              <div class="mb-4">
                <PillSwitch
                  v-model="cultType"
                  :items="[
                    { value: 'duration', label: t('cult_type_duration'), icon: 'mdi-timer-sand' },
                    { value: 'time', label: t('cult_type_time'), icon: 'mdi-clock-outline' },
                  ]"
                  @update:model-value="setCultType"
                />
              </div>

              <!-- Input: Por Duração em Minutos -->
              <div
                v-if="cultType === 'duration'"
                class="d-flex flex-column align-center"
              >
                <div class="d-flex align-center">
                  <input
                    v-model="cultDurationMinutes"
                    type="number"
                    class="time-input"
                    style="width: 140px;"
                    min="1"
                    max="360"
                    @input="onCultDurationChange"
                  />
                </div>
                <span
                  class="text-caption font-weight-bold mt-2"
                  style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;"
                >
                  {{ t('cult_duration') }}
                </span>
                <div
                  class="text-caption mt-1"
                  style="color: var(--sidebar-text-secondary); opacity: 0.85;"
                >
                  Término estimado: <b>{{ expectedEndTimeByDuration }}</b>
                </div>
              </div>

              <!-- Input: Por Horário Final Fixo -->
              <div
                v-else
                class="d-flex flex-column align-center"
              >
                <div class="d-flex align-center">
                  <div class="d-flex flex-column align-center">
                    <input
                      v-model="cultEndHour"
                      type="number"
                      class="time-input"
                      min="0"
                      max="23"
                      @input="onCultTimeChange"
                    />
                    <span
                      class="text-caption font-weight-bold mt-2"
                      style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;"
                    >
                      {{ t('hours_label') }}
                    </span>
                  </div>
                  <div
                    class="text-h3 font-weight-bold mx-3 pb-6"
                    style="color: var(--sidebar-text-secondary);"
                  >
                    :
                  </div>
                  <div class="d-flex flex-column align-center">
                    <input
                      v-model="cultEndMinute"
                      type="number"
                      class="time-input"
                      min="0"
                      max="59"
                      @input="onCultTimeChange"
                    />
                    <span
                      class="text-caption font-weight-bold mt-2"
                      style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;"
                    >
                      {{ t('minutes_label') }}
                    </span>
                  </div>
                </div>
                <div
                  class="text-caption mt-1"
                  style="color: var(--sidebar-text-secondary); opacity: 0.85;"
                >
                  Tempo calculado: <b>{{ calculatedRemainingByTime }}</b>
                </div>
              </div>
            </div>
          </v-expand-transition>

          <!-- Action Buttons -->
          <div class="d-flex align-center" style="gap: 16px;">
            <!-- Botão Parar Alerta Visual Ativo (modo padrão) -->
            <v-btn
              v-if="isAlerting"
              size="x-large"
              color="error"
              variant="flat"
              rounded="pill"
              class="font-weight-bold px-10 text-none"
              style="height: 64px; font-size: 1.2rem; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);"
              @click="stopAlert"
            >
              <v-icon start size="28" class="mr-2">
                mdi-stop-circle
              </v-icon>
              {{ t('stop') }}
            </v-btn>

            <!-- Botão Iniciar / Pausar / Continuar -->
            <v-btn
              v-else
              size="x-large"
              :color="isRunning ? 'warning' : 'primary'"
              variant="flat"
              rounded="pill"
              class="font-weight-bold px-10 text-none"
              :style="{ height: '64px', fontSize: '1.2rem', boxShadow: isRunning ? 'none' : '0 10px 30px rgba(var(--v-theme-primary),0.3)' }"
              @click="toggleTimer"
            >
              <v-icon
                start
                size="28"
                class="mr-2"
              >
                {{ isRunning ? 'mdi-pause-circle' : 'mdi-play-circle' }}
              </v-icon>
              {{ isRunning ? t('pause') : (isPaused ? t('resume') : t('start')) }}
            </v-btn>

            <!-- Botão Zerar / Resetar -->
            <v-btn
              size="x-large"
              color="error"
              variant="tonal"
              rounded="pill"
              class="font-weight-bold px-8 text-none"
              style="height: 64px; font-size: 1.1rem;"
              @click="resetTimer"
            >
              {{ t('reset') }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Config Modal -->
      <ConfigModal
        v-model="showConfig"
        :module-id="module_id"
        :initial-tab="currentMode === 'cult' ? 'cult' : 'general'"
      />
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Screen from "./components/Screen.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "./components/ConfigModal.vue";
import ModuleHeader from "@/components/ModuleHeader.vue";
import manifest from "../manifest";
import { stopSchoolBellAlert, playCultAlert } from "../helpers/audioAlert";
import PillSwitch from "@/components/inputs/PillSwitch.vue";

export default defineComponent({
  name: manifest.id,
  components: {
    Screen,
    LScreenBtn,
    ConfigModal,
    ModuleHeader,
    PillSwitch,
  },
  data: () => ({
    currentMode: "timer", // 'timer' | 'stopwatch' | 'cult'
    showConfig: false,
    // Culto
    cultType: "duration", // 'duration' | 'time'
    cultDurationMinutes: 40,
    cultEndHour: 11,
    cultEndMinute: 30,
    clockTicker: 0,
    clockTickerId: null as any,
  }),
  computed: {
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || {
        fontColor: "#ffffff",
        bgColor: "#000000",
        visualAlert: true,
        audioAlert: true,
        cultBgColor: "#000000",
        cultClockColor: "#ffffff",
        cultTimerColor: "#38bdf8",
        cultWarningColor: "#ef4444",
        cultAlwaysShowClock: true,
        cultAllowNegative: true,
        cultAudioStart: false,
        cultAudio5min: true,
        cultAudio1min: true,
        cultAudioEnd: true,
      };
    },
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$appdata.get(`modules.${this.module_id}`);
    },
    timerData(): any {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        mode: "timer",
        isStopwatch: false,
        isRunning: false,
        isFinished: false,
        isPaused: false,
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 0,
        configuredDuration: 0,
        isAlerting: false,
        cultModeType: "duration",
        cultTargetEndTime: 0,
        cultTotalDurationMs: 0,
        cultRemainingMs: 0,
      };
    },
    isStopwatch(): boolean {
      return this.currentMode === "stopwatch";
    },
    isRunning(): boolean {
      return Boolean(this.timerData.isRunning);
    },
    isPaused(): boolean {
      if (this.isRunning) return false;
      if (this.currentMode === "cult") {
        return Boolean(this.timerData?.isPaused && !this.timerData?.isFinished);
      }
      if (this.isStopwatch) {
        return Boolean(this.timerData?.accumulatedTime > 0 && !this.timerData?.isFinished);
      }
      return Boolean(this.timerData?.accumulatedTime > 0 && !this.timerData?.isFinished);
    },
    isAlerting(): boolean {
      if (this.currentMode === "cult") return false;
      return Boolean(this.timerData.isAlerting && this.config.visualAlert !== false);
    },
    expectedEndTimeByDuration(): string {
      // depend on clockTicker to refresh every second
      void this.clockTicker;
      const mins = Number(this.cultDurationMinutes) || 0;
      const end = new Date(Date.now() + mins * 60000);
      const h = end.getHours().toString().padStart(2, "0");
      const m = end.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    },
    calculatedRemainingByTime(): string {
      void this.clockTicker;
      const now = new Date();
      const target = new Date();
      target.setHours(Number(this.cultEndHour) || 0, Number(this.cultEndMinute) || 0, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      const diffMs = target.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      if (h > 0) {
        return `${h}h ${m}min`;
      }
      return `${m} minutos`;
    },
    editHours: {
      get(): number {
        const ms = this.isStopwatch
          ? this.timerData.accumulatedTime
          : (this.timerData.configuredDuration ?? this.timerData.targetDuration ?? 0);
        return Math.floor(ms / 3600000);
      },
      set(val: string | number) {
        const hrs = Math.max(0, typeof val === "string" ? (parseInt(val) || 0) : (val || 0));
        const ms = (hrs * 3600000) + (this.editMinutes * 60000) + (this.editSeconds * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms, configuredDuration: ms, isFinished: false });
        } else {
          this.updateData({ targetDuration: ms, configuredDuration: ms, isFinished: false });
        }
      },
    },
    editMinutes: {
      get(): number {
        const ms = this.isStopwatch
          ? this.timerData.accumulatedTime
          : (this.timerData.configuredDuration ?? this.timerData.targetDuration ?? 0);
        return Math.floor((ms % 3600000) / 60000);
      },
      set(val: string | number) {
        const mins = Math.max(0, Math.min(59, typeof val === "string" ? (parseInt(val) || 0) : (val || 0)));
        const ms = (this.editHours * 3600000) + (mins * 60000) + (this.editSeconds * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms, configuredDuration: ms, isFinished: false });
        } else {
          this.updateData({ targetDuration: ms, configuredDuration: ms, isFinished: false });
        }
      },
    },
    editSeconds: {
      get(): number {
        const ms = this.isStopwatch
          ? this.timerData.accumulatedTime
          : (this.timerData.configuredDuration ?? this.timerData.targetDuration ?? 0);
        return Math.floor((ms % 60000) / 1000);
      },
      set(val: string | number) {
        const secs = Math.max(0, Math.min(59, typeof val === "string" ? (parseInt(val) || 0) : (val || 0)));
        const ms = (this.editHours * 3600000) + (this.editMinutes * 60000) + (secs * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms, configuredDuration: ms, isFinished: false });
        } else {
          this.updateData({ targetDuration: ms, configuredDuration: ms, isFinished: false });
        }
      },
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.clockTickerId = setInterval(() => {
      this.clockTicker++;
    }, 1000);

    // Inicializa campos padrão de culto próximos da hora atual
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    this.cultEndHour = nextHour;
    this.cultEndMinute = 0;

    const existing = this.$appdata.get(`modules.${this.module_id}.data`);
    if (existing && existing.mode) {
      this.currentMode = existing.mode;
      if (existing.cultModeType) {
        this.cultType = existing.cultModeType;
      }
    } else {
      this.resetTimer();
    }
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.clockTickerId) {
      clearInterval(this.clockTickerId);
    }
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    handleKeyDown(e: KeyboardEvent) {
      if (this.currentMode !== "cult" || (!this.isRunning && !this.isPaused)) return;
      if (e.key === "PageDown") {
        e.preventDefault();
        this.addCultMinutes(1);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        this.addCultMinutes(-1);
      }
    },
    updateData(updates: any) {
      const current = this.timerData;
      this.$appdata.set(`modules.${this.module_id}.data`, { ...current, ...updates });
    },
    onModeChange(val: string) {
      stopSchoolBellAlert();
      this.currentMode = val;
      const isStopwatch = val === "stopwatch";

      let initialDurationMs = 0;
      if (val === "cult") {
        initialDurationMs = (Number(this.cultDurationMinutes) || 40) * 60000;
      }

      this.updateData({
        mode: val,
        isStopwatch,
        isRunning: false,
        isFinished: false,
        isPaused: false,
        isAlerting: false,
        accumulatedTime: 0,
        baseTime: 0,
        targetDuration: initialDurationMs,
        configuredDuration: initialDurationMs,
        cultTotalDurationMs: initialDurationMs,
        cultRemainingMs: initialDurationMs,
        cultTargetEndTime: 0,
      });
    },
    onCultDurationChange() {
      if (this.isRunning) return;
      const mins = Math.max(1, Number(this.cultDurationMinutes) || 1);
      const totalMs = mins * 60000;
      this.updateData({
        cultModeType: "duration",
        cultTotalDurationMs: totalMs,
        cultRemainingMs: totalMs,
        targetDuration: totalMs,
        configuredDuration: totalMs,
      });
    },
    onCultTimeChange() {
      if (this.isRunning) return;
      const now = new Date();
      const target = new Date();
      target.setHours(Number(this.cultEndHour) || 0, Number(this.cultEndMinute) || 0, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      const totalMs = target.getTime() - now.getTime();
      this.updateData({
        cultModeType: "time",
        cultTotalDurationMs: totalMs,
        cultRemainingMs: totalMs,
        targetDuration: totalMs,
        configuredDuration: totalMs,
      });
    },
    setCultType(val: "duration" | "time") {
      this.cultType = val;
      if (val === "duration") {
        this.onCultDurationChange();
      } else {
        this.onCultTimeChange();
      }
    },
    addCultSeconds(secs: number) {
      if (!this.isRunning && !this.isPaused) {
        const mins = secs / 60;
        if (this.cultType === "duration") {
          this.cultDurationMinutes = Math.max(1, (Number(this.cultDurationMinutes) || 0) + mins);
          this.onCultDurationChange();
        } else {
          let totalMins = (Number(this.cultEndHour) || 0) * 60 + (Number(this.cultEndMinute) || 0) + Math.round(mins);
          if (totalMins < 0) totalMins += 24 * 60;
          totalMins = totalMins % (24 * 60);
          this.cultEndHour = Math.floor(totalMins / 60);
          this.cultEndMinute = totalMins % 60;
          this.onCultTimeChange();
        }
        return;
      }
      const addedMs = secs * 1000;
      if (this.isPaused) {
        const remaining = (this.timerData.cultRemainingMs || 0) + addedMs;
        const total = Math.max(30000, (this.timerData.cultTotalDurationMs || 0) + addedMs);
        this.updateData({
          cultRemainingMs: remaining,
          cultTotalDurationMs: total,
          cultTargetEndTime: 0,
          cultAudioEndPlayed: remaining <= 0,
        });
        return;
      }
      const currentTarget = this.timerData.cultTargetEndTime || (Date.now() + (this.timerData.cultRemainingMs || 0));
      const newTarget = currentTarget + addedMs;
      const newTotal = Math.max(30000, (this.timerData.cultTotalDurationMs || 0) + addedMs);

      // Se somar minutos e voltar para positivo, limpa o alerta de fim
      const willBePositive = newTarget > Date.now();
      this.updateData({
        cultTargetEndTime: newTarget,
        cultTotalDurationMs: newTotal,
        cultAudioEndPlayed: !willBePositive,
      });
    },
    addCultMinutes(mins: number) {
      this.addCultSeconds(mins * 60);
    },
    stopAlert() {
      stopSchoolBellAlert();
      this.updateData({
        isAlerting: false,
      });
    },
    toggleTimer() {
      if (this.isRunning) {
        // Pausar
        if (this.currentMode === "cult") {
          const currentTarget = this.timerData.cultTargetEndTime || Date.now();
          const remaining = currentTarget - Date.now();
          this.updateData({
            isRunning: false,
            cultTargetEndTime: 0,
            cultRemainingMs: remaining,
            isPaused: true,
          });
        } else {
          const now = Date.now();
          let elapsed = 0;
          if (this.timerData.baseTime) {
            elapsed = now - this.timerData.baseTime;
          }
          this.updateData({
            isRunning: false,
            accumulatedTime: this.timerData.accumulatedTime + elapsed,
            baseTime: 0,
            isPaused: true,
          });
        }
      } else {
        // Iniciar ou Continuar
        stopSchoolBellAlert();

        if (this.isAlerting) {
          this.stopAlert();
          return;
        }

        if (this.currentMode === "cult") {
          // Iniciar ou Continuar Modo Culto
          let targetEndTime = 0;
          let totalDuration = 0;

          if (this.timerData.isPaused && this.timerData.cultRemainingMs !== undefined && !this.timerData.isFinished) {
            // Retomando após pausa
            totalDuration = this.timerData.cultTotalDurationMs || ((Number(this.cultDurationMinutes) || 40) * 60000);
            targetEndTime = Date.now() + this.timerData.cultRemainingMs;
          } else {
            // Novo início
            if (this.cultType === "duration") {
              const mins = Math.max(1, Number(this.cultDurationMinutes) || 40);
              totalDuration = mins * 60000;
              targetEndTime = Date.now() + totalDuration;
            } else {
              const now = new Date();
              const target = new Date();
              target.setHours(Number(this.cultEndHour) || 0, Number(this.cultEndMinute) || 0, 0, 0);
              if (target.getTime() <= now.getTime()) {
                target.setDate(target.getDate() + 1);
              }
              targetEndTime = target.getTime();
              totalDuration = targetEndTime - now.getTime();
            }

            if (this.config.cultAudioStart) {
              playCultAlert("start");
            }
          }

          this.updateData({
            mode: "cult",
            isRunning: true,
            isFinished: false,
            isPaused: false,
            cultModeType: this.cultType,
            cultTargetEndTime: targetEndTime,
            cultTotalDurationMs: totalDuration,
            cultRemainingMs: targetEndTime - Date.now(),
            cultAudioStartPlayed: true,
            cultAudio5minPlayed: false,
            cultAudio1minPlayed: false,
            cultAudioEndPlayed: false,
          });
          return;
        }

        // Modo Padrão
        if (!this.isStopwatch) {
          const duration = this.timerData.configuredDuration || this.timerData.targetDuration;
          if (!duration || duration <= 0) {
            return;
          }

          if (this.timerData.isFinished || this.timerData.accumulatedTime >= duration) {
            this.updateData({
              mode: "timer",
              isRunning: true,
              isFinished: false,
              isPaused: false,
              isAlerting: false,
              targetDuration: duration,
              configuredDuration: duration,
              accumulatedTime: 0,
              baseTime: Date.now(),
            });
            return;
          }
        }

        this.updateData({
          mode: this.currentMode,
          isRunning: true,
          isFinished: false,
          isPaused: false,
          isAlerting: false,
          baseTime: Date.now(),
        });
      }
    },
    resetTimer() {
      stopSchoolBellAlert();
      let cultInitial = 0;
      if (this.currentMode === "cult") {
        cultInitial = (Number(this.cultDurationMinutes) || 40) * 60000;
      }
      this.updateData({
        mode: this.currentMode,
        isRunning: false,
        isFinished: false,
        isPaused: false,
        isAlerting: false,
        accumulatedTime: 0,
        baseTime: 0,
        targetDuration: cultInitial,
        configuredDuration: cultInitial,
        cultTotalDurationMs: cultInitial,
        cultRemainingMs: cultInitial,
        cultTargetEndTime: 0,
      });
    },
  },
});
</script>

<style scoped>
.time-input {
  width: 100px;
  height: 100px;
  background: var(--card-bg, #ffffff);
  border-radius: 20px;
  border: 1px solid var(--border-color, rgba(0,0,0,0.1));
  font-size: 3.5rem;
  font-weight: 700;
  text-align: center;
  color: var(--sidebar-text);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.3s ease;
  font-variant-numeric: tabular-nums;
  outline: none;
}
.time-input:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(0, 151, 215, 0.2);
}
.time-input::-webkit-inner-spin-button,
.time-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
.time-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.cult-adjust-btn {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  border-radius: 50% !important;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease !important;
}

.cult-adjust-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
}

.cult-adjust-btn:active {
  transform: scale(0.94);
}
</style>
