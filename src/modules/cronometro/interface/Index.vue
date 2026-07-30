<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0 mr-4" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>

        <div class="search-bar ml-4 d-flex align-center" style="flex: 1; justify-content: flex-end; gap: 12px;" />
      </div>

      <!-- Cronometro Display -->
      <div class="content-main flex-grow-1 w-100 pa-6 d-flex align-center justify-center" style="overflow: hidden; background: transparent;">
        <div class="clock-widget-container d-flex flex-column justify-center align-center position-relative" style="width: 100%; max-width: 900px; aspect-ratio: 21/9; max-height: 100%; background: var(--card-bg, #ffffff); border-radius: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.05); border: 1px solid var(--border-color, rgba(0,0,0,0.05)); overflow: hidden; transition: transform 0.3s ease;">
          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <LScreenBtn module="cronometro" />
          </div>
          <Screen :preview="true" />
        </div>
      </div>

      <!-- Controls -->
      <div class="cronometro-controls flex-shrink-0 d-flex align-center justify-center pb-8" style="gap: 16px;">
        <v-text-field
          v-model.number="minutesInput"
          :label="t('minutes')"
          type="number"
          min="0"
          variant="outlined"
          density="comfortable"
          hide-details
          :disabled="started"
          style="width: 100px;"
        />
        <v-text-field
          v-model.number="secondsInput"
          :label="t('seconds')"
          type="number"
          min="0"
          max="59"
          variant="outlined"
          density="comfortable"
          hide-details
          :disabled="started"
          style="width: 100px;"
        />
        <v-btn
          :color="running ? 'warning' : 'primary'"
          variant="flat"
          class="rounded-lg text-none px-6 font-weight-bold"
          @click="toggleRunning"
        >
          <v-icon start>
            {{ running ? 'mdi-pause' : 'mdi-play' }}
          </v-icon>
          {{ running ? t('pause') : t('start') }}
        </v-btn>
        <v-btn
          variant="tonal"
          color="error"
          class="rounded-lg text-none px-6 font-weight-bold"
          @click="reset"
        >
          <v-icon start>
            mdi-restore
          </v-icon>
          {{ t('reset') }}
        </v-btn>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import Screen from "../components/Screen.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import manifest from "../manifest.json";

export default {
  name: manifest.id,
  components: {
    Screen,
    LScreenBtn,
    MenuToggleButton,
  },
  data: () => ({
    interval: null,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$appdata.get(`modules.${this.module_id}`);
    },
    cronometro() {
      return this.$appdata.get("cronometro") || {};
    },
    duration() {
      return this.cronometro.duration ?? 300;
    },
    remaining() {
      return this.cronometro.remaining ?? this.duration;
    },
    running() {
      return !!this.cronometro.running;
    },
    started() {
      return !!this.cronometro.started;
    },
    minutesInput: {
      get() {
        return Math.floor(this.duration / 60);
      },
      set(value) {
        this.applyDuration(value, this.secondsInput);
      },
    },
    secondsInput: {
      get() {
        return this.duration % 60;
      },
      set(value) {
        this.applyDuration(this.minutesInput, value);
      },
    },
  },
  mounted() {
    // Roda apenas na janela principal (esta interface nunca é carregada dentro de um popup),
    // garantindo uma única fonte de decremento sincronizada para todas as telas de exibição.
    this.interval = setInterval(this.tick, 1000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    },
    applyDuration(minutes, seconds) {
      const m = Math.max(parseInt(minutes) || 0, 0);
      const s = Math.max(Math.min(parseInt(seconds) || 0, 59), 0);
      const duration = (m * 60) + s;
      this.$appdata.set("cronometro.duration", duration);
      if (!this.started) {
        this.$appdata.set("cronometro.remaining", duration);
      }
    },
    toggleRunning() {
      if (this.running) {
        this.$appdata.set("cronometro.running", false);
        return;
      }

      if (this.remaining <= 0) {
        this.$appdata.set("cronometro.remaining", this.duration);
      }
      this.$appdata.set("cronometro.started", true);
      this.$appdata.set("cronometro.running", true);
    },
    reset() {
      this.$appdata.set("cronometro.running", false);
      this.$appdata.set("cronometro.started", false);
      this.$appdata.set("cronometro.remaining", this.duration);
    },
    tick() {
      if (!this.running) return;

      const next = Math.max(this.remaining - 1, 0);
      this.$appdata.set("cronometro.remaining", next);

      if (next <= 0) {
        this.$appdata.set("cronometro.running", false);
      }
    },
  },
};
</script>
