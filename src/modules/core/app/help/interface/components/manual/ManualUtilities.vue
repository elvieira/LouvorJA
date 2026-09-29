<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('utilities.intro')" />

    <!-- 1. Relógio Integrado -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-clock-outline" class="mr-2" size="22" />
      {{ t('utilities.clock_title') }}
    </h3>
    <p class="mb-4" v-html="t('utilities.clock_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <span v-html="t('utilities.clock_styles')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.clock_digital')" />
          <li v-html="t('utilities.clock_analog')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('utilities.clock_formats')" />
      <li class="mb-2" v-html="t('utilities.clock_custom')" />
      <li class="mb-2" v-html="t('utilities.clock_projection')" />
    </ul>

    <!-- Exemplo Visual 1: Relógio (Digital vs Analógico) -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-clock-time-four-outline" size="16" class="mr-1 text-primary" />
          {{ t('utilities.preview_clock_title') }}
        </span>
        <div class="d-flex align-center gap-1">
          <v-btn
            size="x-small"
            :color="clockMode === 'digital' ? 'primary' : ''"
            :variant="clockMode === 'digital' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="clockMode = 'digital'"
          >
            {{ t('utilities.preview_clock_digital_tab') }}
          </v-btn>
          <v-btn
            size="x-small"
            :color="clockMode === 'analog' ? 'primary' : ''"
            :variant="clockMode === 'analog' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="clockMode = 'analog'"
          >
            {{ t('utilities.preview_clock_analog_tab') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <!-- Moldura do Widget de Relógio -->
        <div class="mock-clock-container rounded-xl pa-6 position-relative overflow-hidden d-flex flex-column align-center justify-center">
          <!-- Botões Superiores de Ação do Relógio (Visual) -->
          <div class="position-absolute top-0 right-0 ma-3 d-flex align-center gap-2 pointer-events-none">
            <div class="mock-action-circle d-flex align-center justify-center rounded-circle">
              <v-icon icon="mdi-palette" size="16" color="primary" />
            </div>
            <div class="mock-action-circle d-flex align-center justify-center rounded-circle">
              <v-icon icon="mdi-monitor-screenshot" size="16" color="primary" />
            </div>
          </div>

          <!-- MODO DIGITAL -->
          <div v-if="clockMode === 'digital'" class="text-center py-4">
            <div class="d-flex align-center justify-center flex-wrap">
              <span class="mock-clock-digits font-weight-black">10:45</span>
              <span class="mock-clock-seconds font-weight-bold ml-2 opacity-70">:30</span>
              <span class="mock-clock-ampm ml-3 text-caption font-weight-bold px-2 py-1 rounded bg-primary-subtle text-primary">24h</span>
            </div>
            <div class="text-body-2 font-weight-medium mt-2 opacity-70">
              {{ t('utilities.preview_clock_date_sample') }}
            </div>
          </div>

          <!-- MODO ANALÓGICO -->
          <div v-else class="d-flex flex-column align-center justify-center py-2">
            <div class="mock-analog-dial rounded-circle position-relative d-flex align-center justify-center">
              <!-- Marcadores de Horas -->
              <span class="mock-analog-num num-12">12</span>
              <span class="mock-analog-num num-3">3</span>
              <span class="mock-analog-num num-6">6</span>
              <span class="mock-analog-num num-9">9</span>

              <!-- Ponteiros -->
              <div class="mock-hand hand-hour" />
              <div class="mock-hand hand-minute" />
              <div class="mock-hand hand-second" />
              <div class="mock-center-pivot rounded-circle" />
            </div>
            <div class="text-caption font-weight-medium mt-3 opacity-70">
              {{ t('utilities.preview_clock_date_sample') }} &bull; 10:45:30
            </div>
          </div>
        </div>

        <!-- Dicas de Configuração do Relógio -->
        <div class="d-flex align-center justify-space-between mt-3 flex-wrap gap-2 text-caption opacity-70 px-1">
          <div class="d-flex align-center gap-1">
            <v-icon icon="mdi-tune" size="14" class="text-primary" />
            <span>Formatos: <strong>24 Horas</strong> ou <strong>12 Horas (AM/PM)</strong></span>
          </div>
          <div class="d-flex align-center gap-1">
            <v-icon icon="mdi-image-filter-vintage" size="14" class="text-primary" />
            <span>Fundo personalizável com imagem ou cor sólida</span>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Cronômetro de Culto e Atividades -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-timer-outline" class="mr-2" size="22" />
      {{ t('utilities.timer_title') }}
    </h3>
    <p class="mb-4" v-html="t('utilities.timer_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('utilities.timer_modes')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.timer_progressive')" />
          <li v-html="t('utilities.timer_regressive')" />
          <li v-html="t('utilities.timer_sabbath')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.timer_controls')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.timer_btn_controls')" />
          <li v-html="t('utilities.timer_quick_adjust')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.timer_features')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.timer_always_active')" />
          <li v-html="t('utilities.timer_negative')" />
          <li v-html="t('utilities.timer_visual_alert')" />
          <li v-html="t('utilities.timer_audio_alert')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('utilities.timer_visual_custom')" />
    </ul>

    <!-- Exemplo Visual 2: Cronômetro e Timer de Culto -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-timer-play-outline" size="16" class="mr-1 text-primary" />
          {{ t('utilities.preview_timer_title') }}
        </span>
        <div class="d-flex align-center gap-1 flex-wrap">
          <v-btn
            size="x-small"
            :color="timerMode === 'timer' ? 'primary' : ''"
            :variant="timerMode === 'timer' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="timerMode = 'timer'"
          >
            {{ t('utilities.preview_timer_mode_regressive') }}
          </v-btn>
          <v-btn
            size="x-small"
            :color="timerMode === 'stopwatch' ? 'primary' : ''"
            :variant="timerMode === 'stopwatch' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="timerMode = 'stopwatch'"
          >
            {{ t('utilities.preview_timer_mode_progressive') }}
          </v-btn>
          <v-btn
            size="x-small"
            :color="timerMode === 'cult' ? 'primary' : ''"
            :variant="timerMode === 'cult' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="timerMode = 'cult'"
          >
            {{ t('utilities.preview_timer_mode_cult') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <!-- Display Central do Cronômetro -->
        <div
          class="mock-timer-display rounded-xl pa-5 text-center position-relative overflow-hidden"
          :class="{ 'timer-alert-bg': timerMode === 'cult' }"
        >
          <!-- Ações do Canto Superior (Visual) -->
          <div class="position-absolute top-0 right-0 ma-3 d-flex align-center gap-2 pointer-events-none">
            <div class="mock-action-circle d-flex align-center justify-center rounded-circle">
              <v-icon icon="mdi-palette-outline" size="16" color="primary" />
            </div>
            <div class="mock-action-circle d-flex align-center justify-center rounded-circle">
              <v-icon icon="mdi-monitor-screenshot" size="16" color="primary" />
            </div>
          </div>

          <!-- Botões Flutuantes de Ajuste Rápido (Modo Culto) -->
          <template v-if="timerMode === 'cult'">
            <div class="mock-side-adjust left position-absolute d-flex flex-column gap-1 pointer-events-none">
              <div class="mock-adjust-badge text-error font-weight-bold">
                -1 min
              </div>
              <div class="mock-adjust-badge text-error font-weight-bold">
                -5 min
              </div>
            </div>
            <div class="mock-side-adjust right position-absolute d-flex flex-column gap-1 pointer-events-none">
              <div class="mock-adjust-badge text-success font-weight-bold">
                +1 min
              </div>
              <div class="mock-adjust-badge text-success font-weight-bold">
                +5 min
              </div>
            </div>
          </template>

          <!-- Título do Modo -->
          <div class="text-caption font-weight-bold text-uppercase opacity-70 mb-1">
            <template v-if="timerMode === 'timer'">
              Contagem Regressiva (Tempo Restante)
            </template>
            <template v-else-if="timerMode === 'stopwatch'">
              Tempo Decorrido (Progressivo)
            </template>
            <template v-else>
              Culto: Término previsto às 11:30
            </template>
          </div>

          <!-- Número Central do Cronômetro -->
          <div class="mock-timer-digits font-weight-black my-1">
            <template v-if="timerMode === 'timer'">
              15:00
            </template>
            <template v-else-if="timerMode === 'stopwatch'">
              00:12:45
            </template>
            <template v-else>
              -02:15
            </template>
          </div>

          <!-- Indicador de Status / Alerta -->
          <div class="d-flex align-center justify-center gap-2 mt-2">
            <template v-if="timerMode === 'cult'">
              <span class="mock-alert-chip rounded-pill px-3 py-1 text-caption font-weight-bold d-flex align-center">
                <v-icon icon="mdi-alert-circle" size="14" class="mr-1" />
                Tempo Ultrapassado (Contagem Negativa em Vermelho)
              </span>
            </template>
            <template v-else>
              <span class="text-caption font-weight-medium opacity-60">
                Hora certa no ambiente: 10:45 &bull; Alerta sonoro ativado
              </span>
            </template>
          </div>
        </div>

        <!-- Barra Inferior de Controles Ilustrativos -->
        <div class="d-flex align-center justify-center gap-3 mt-4 pointer-events-none flex-wrap">
          <div class="mock-ui-btn rounded-lg px-4 py-2 text-caption font-weight-bold d-flex align-center">
            <v-icon icon="mdi-play" size="16" class="mr-1" />
            Iniciar
          </div>
          <div class="mock-ui-btn-tonal rounded-lg px-4 py-2 text-caption font-weight-bold d-flex align-center">
            <v-icon icon="mdi-pause" size="16" class="mr-1" />
            Pausar
          </div>
          <div class="mock-ui-btn-error rounded-lg px-4 py-2 text-caption font-weight-bold d-flex align-center">
            <v-icon icon="mdi-stop" size="16" class="mr-1" />
            Zerar
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Sorteio Animado (Nomes e Números) -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-ticket-confirmation" class="mr-2" size="22" />
      {{ t('utilities.giveaway_title') }}
    </h3>
    <p class="mb-4" v-html="t('utilities.giveaway_p1')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('utilities.giveaway_modes')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.giveaway_names')" />
          <li v-html="t('utilities.giveaway_numbers')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.giveaway_dynamic')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.giveaway_anim')" />
          <li v-html="t('utilities.giveaway_duration')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.giveaway_history')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.giveaway_columns')" />
          <li v-html="t('utilities.giveaway_options')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('utilities.giveaway_projection')" />
    </ul>

    <!-- Exemplo Visual 3: Sorteio Dinâmico -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-ticket-outline" size="16" class="mr-1 text-primary" />
          {{ t('utilities.preview_giveaway_title') }}
        </span>
        <div class="d-flex align-center gap-1">
          <v-btn
            size="x-small"
            :color="giveawayMode === 'names' ? 'primary' : ''"
            :variant="giveawayMode === 'names' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="giveawayMode = 'names'"
          >
            {{ t('utilities.preview_giveaway_tab_names') }}
          </v-btn>
          <v-btn
            size="x-small"
            :color="giveawayMode === 'numbers' ? 'primary' : ''"
            :variant="giveawayMode === 'numbers' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="giveawayMode = 'numbers'"
          >
            {{ t('utilities.preview_giveaway_tab_numbers') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- Layout do Módulo Sorteio (3 Colunas) -->
        <v-row dense>
          <!-- Coluna Esquerda: Participantes Disponíveis -->
          <v-col cols="12" md="3">
            <div class="mock-giveaway-card rounded-lg pa-3 h-100 d-flex flex-column">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption font-weight-bold opacity-70">
                  {{ giveawayMode === 'names' ? 'Disponíveis (4)' : 'Números (1 a 100)' }}
                </span>
                <v-icon icon="mdi-account-multiple-outline" size="16" class="opacity-50" />
              </div>

              <!-- Lista de Amostra -->
              <div class="d-flex flex-column gap-1 flex-grow-1">
                <div
                  v-for="(item, idx) in availableSamples"
                  :key="idx"
                  class="mock-item-row rounded px-2 py-1 text-caption font-weight-medium"
                >
                  {{ item }}
                </div>
              </div>

              <div class="mock-import-btn text-caption text-primary font-weight-bold mt-2 pt-2 border-t-subtle pointer-events-none d-flex align-center justify-center">
                <v-icon icon="mdi-file-import-outline" size="14" class="mr-1" />
                Importar Lista (.txt)
              </div>
            </div>
          </v-col>

          <!-- Coluna Central: O Palco do Sorteio -->
          <v-col cols="12" md="6">
            <div class="mock-stage-card rounded-lg pa-4 h-100 d-flex flex-column align-center justify-center text-center position-relative">
              <div class="mock-winner-badge rounded-pill px-3 py-1 text-caption font-weight-bold d-flex align-center mb-2">
                <v-icon icon="mdi-trophy" size="14" class="mr-1" />
                Vencedor(a) Sorteado(a)
              </div>

              <!-- Nome / Número Sorteado -->
              <div class="mock-winner-name font-weight-black my-3">
                {{ giveawayMode === 'names' ? 'Larissa Mendes' : '#042' }}
              </div>

              <div class="text-caption opacity-60 mb-3">
                Duração da animação: 3 segundos &bull; Transmitido no telão
              </div>

              <!-- Botão Principal de Sortear (Visual) -->
              <div class="mock-draw-btn rounded-xl px-6 py-2 text-body-2 font-weight-bold d-flex align-center pointer-events-none">
                <v-icon icon="mdi-dice-5" size="18" class="mr-2" />
                SORTEAR
              </div>
            </div>
          </v-col>

          <!-- Coluna Direita: Histórico de Sorteados -->
          <v-col cols="12" md="3">
            <div class="mock-giveaway-card rounded-lg pa-3 h-100 d-flex flex-column">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption font-weight-bold opacity-70">
                  Sorteados (2)
                </span>
                <v-icon icon="mdi-history" size="16" class="opacity-50" />
              </div>

              <div class="d-flex flex-column gap-1 flex-grow-1">
                <div class="mock-history-row rounded px-2 py-1 text-caption font-weight-bold text-primary bg-primary-subtle">
                  1º &bull; {{ giveawayMode === 'names' ? 'Daniel Ribeiro' : '#018' }}
                </div>
                <div class="mock-history-row rounded px-2 py-1 text-caption font-weight-bold text-primary bg-primary-subtle">
                  2º &bull; {{ giveawayMode === 'names' ? 'Larissa Mendes' : '#042' }}
                </div>
              </div>

              <div class="text-caption opacity-50 text-center mt-2 pt-2 border-t-subtle pointer-events-none">
                Limpar Histórico
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualUtilities",
  data() {
    return {
      clockMode: "digital" as "digital" | "analog",
      timerMode: "cult" as "timer" | "stopwatch" | "cult",
      giveawayMode: "names" as "names" | "numbers",
    };
  },
  computed: {
    availableSamples(): string[] {
      if (this.giveawayMode === "names") {
        return ["Gabriel Souza", "Mateus Oliveira", "Rebeca Santos", "Tiago Ferreira"];
      }
      return ["#001 a #017", "#019 a #041", "#043 a #080", "#081 a #100"];
    },
  },
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>

<style scoped>
.manual-section {
  color: var(--sidebar-text);
  line-height: 1.6;
}

.manual-preview-card {
  background: var(--v-theme-surface, rgba(128, 128, 128, 0.05));
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.preview-inner-bg {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.12));
}

.pointer-events-none {
  pointer-events: none !important;
}

.border-t-subtle {
  border-top: 1px solid var(--border-color, rgba(128, 128, 128, 0.12));
}

/* ================= 1. RELÓGIO ================= */
.mock-clock-container {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  min-height: 190px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.mock-action-circle {
  width: 30px;
  height: 30px;
  background: rgba(var(--v-theme-primary), 0.1);
}

.mock-clock-digits {
  font-size: clamp(2.4rem, 4.5vw, 3.8rem);
  line-height: 1;
  color: var(--sidebar-text);
  letter-spacing: -0.02em;
}

.mock-clock-seconds {
  font-size: clamp(1.4rem, 2.5vw, 2.2rem);
  line-height: 1;
  color: var(--v-theme-primary);
}

/* Relógio Analógico */
.mock-analog-dial {
  width: 140px;
  height: 140px;
  border: 4px solid var(--v-theme-primary);
  background: var(--card-bg, #ffffff);
  box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.06);
}

.mock-analog-num {
  position: absolute;
  font-size: 11px;
  font-weight: 800;
  color: var(--sidebar-text);
  opacity: 0.8;
}
.num-12 { top: 4px; }
.num-3  { right: 6px; }
.num-6  { bottom: 4px; }
.num-9  { left: 6px; }

.mock-hand {
  position: absolute;
  transform-origin: bottom center;
  border-radius: 4px;
}
.hand-hour {
  width: 4px;
  height: 36px;
  background: var(--sidebar-text);
  top: 34px;
  transform: rotate(305deg);
}
.hand-minute {
  width: 3px;
  height: 48px;
  background: var(--sidebar-text);
  top: 22px;
  transform: rotate(270deg);
}
.hand-second {
  width: 1.5px;
  height: 54px;
  background: var(--v-theme-primary);
  top: 16px;
  transform: rotate(180deg);
}
.mock-center-pivot {
  width: 8px;
  height: 8px;
  background: var(--v-theme-primary);
  z-index: 2;
}

/* ================= 2. CRONÔMETRO ================= */
.mock-timer-display {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.mock-timer-display.timer-alert-bg {
  background: rgba(239, 68, 68, 0.07);
  border-color: rgba(239, 68, 68, 0.35);
}

.mock-timer-digits {
  font-size: clamp(2.6rem, 5vw, 4.2rem);
  line-height: 1;
  color: var(--sidebar-text);
}

.mock-timer-display.timer-alert-bg .mock-timer-digits {
  color: #d32f2f;
}

.mock-side-adjust {
  top: 50%;
  transform: translateY(-50%);
}
.mock-side-adjust.left { left: 16px; }
.mock-side-adjust.right { right: 16px; }

.mock-adjust-badge {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 6px;
}

.mock-alert-chip {
  background: rgba(239, 68, 68, 0.15);
  color: #d32f2f;
}

.mock-ui-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.mock-ui-btn-tonal {
  background: rgba(var(--v-theme-primary), 0.12);
  color: var(--v-theme-primary);
}
.mock-ui-btn-error {
  background: rgba(239, 68, 68, 0.12);
  color: #d32f2f;
}

/* ================= 3. SORTEIO ================= */
.mock-giveaway-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.mock-stage-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border: 1px dashed rgba(var(--v-theme-primary), 0.4);
}

.mock-winner-badge {
  background: rgba(var(--v-theme-primary), 0.15);
  color: var(--v-theme-primary);
}

.mock-winner-name {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  color: var(--v-theme-primary);
  text-shadow: 0 4px 18px rgba(var(--v-theme-primary), 0.25);
  line-height: 1.1;
}

.mock-draw-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(var(--v-theme-primary), 0.35);
  letter-spacing: 0.5px;
}

.mock-item-row {
  background: rgba(128, 128, 128, 0.06);
  color: var(--sidebar-text);
}
</style>
