<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <PillSwitch
          v-model="drawMode"
          :items="[
            { value: 'names', label: t('mode_names') },
            { value: 'numbers', label: t('mode_numbers') },
          ]"
        />

        <v-btn
          variant="tonal"
          color="error"
          class="rounded-lg text-none font-weight-bold ml-4"
          prepend-icon="mdi-refresh"
          @click="showResetAllConfirm = true"
        >
          {{ t('reset') }}
        </v-btn>
      </ModuleHeader>

      <!-- Main Layout -->
      <div class="content-main random-content-main d-flex" :class="compact ? 'flex-column' : 'flex-row'">
        <!-- =================== COMPACT TOP ROW (Left + Right) =================== -->
        <div v-if="compact" class="compact-top-row d-flex w-100 flex-grow-1">
          <!-- Left Panel -->
          <div
            class="participants-col d-flex flex-column flex-grow-1"
            style="width: calc(50% - 12px); min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));"
          >
            <AvailableList
              v-model:available-names="availableNames"
              :drawn-names="drawnNames"
              :draw-mode="drawMode"
              @clear:history="clearHistory"
            />
          </div>
          <!-- Right Panel -->
          <div
            class="history-col d-flex flex-column flex-grow-1"
            style="width: calc(50% - 12px); min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));"
          >
            <HistoryList v-model:drawn-names="drawnNames" />
          </div>
        </div>

        <!-- =================== NORMAL MODE (Left) =================== -->
        <div
          v-if="!compact"
          class="participants-col d-flex flex-column flex-shrink-0"
          style="width: 25%; min-width: 280px; max-width: 320px; height: 100%; min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));"
        >
          <AvailableList
            v-model:available-names="availableNames"
            :drawn-names="drawnNames"
            :draw-mode="drawMode"
            @clear:history="clearHistory"
          />
        </div>

        <!-- =================== THE STAGE (Both Modes) =================== -->
        <div
          class="stage-col d-flex position-relative"
          :class="compact ? 'is-compact flex-row align-center flex-shrink-0' : 'flex-column flex-grow-1 align-center justify-center'"
        >
          <!-- Background decoration -->
          <div
            class="position-absolute top-0 left-0 w-100 h-100"
            style="background: linear-gradient(135deg, rgba(0,151,215,0.05) 0%, rgba(0,151,215,0.01) 100%); pointer-events: none;"
          />

          <!-- Actions in top-right (visible in standard height) -->
          <div
            class="stage-top-actions position-absolute top-0 right-0 ma-4 d-flex align-center"
            style="z-index: 2; gap: 8px;"
          >
            <v-btn
              variant="tonal"
              color="primary"
              icon
              size="small"
              class="config-palette-btn"
              @click="showConfig = true"
            >
              <v-icon size="18">
                mdi-palette
              </v-icon>
              <v-tooltip
                activator="parent"
                location="bottom"
                open-delay="300"
                content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ t('config') }}
              </v-tooltip>
            </v-btn>
            <LScreenBtn module="random" class="stage-screen-btn" />
          </div>

          <!-- Name Display Area -->
          <div
            class="text-center px-8 flex-grow-1 d-flex flex-column align-center justify-center"
            :style="{ zIndex: 1, height: compact ? '100%' : 'auto' }"
          >
            <v-slide-y-transition mode="out-in">
              <div
                :key="isDrawing ? 'drawing' : currentDisplay"
                class="draw-text font-weight-black text-center"
                :style="{
                  fontSize: 'clamp(2rem, 3.5vw, 4.5rem)',
                  color: isDrawing ? 'var(--sidebar-text-secondary)' : 'var(--accent-blue)',
                  transition: 'color 0.3s',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textShadow: isDrawing ? 'none' : '0 4px 20px rgba(0,151,215,0.3)',
                }"
              >
                {{ currentDisplay || "- - - -" }}
              </div>
            </v-slide-y-transition>
          </div>

          <!-- Button Area -->
          <div
            class="stage-btn-area text-center flex-shrink-0 d-flex flex-column align-center justify-center"
            :class="compact ? 'pb-4 pt-12 px-8 h-100' : 'pa-6 w-100'"
            style="z-index: 1;"
          >
            <div class="d-flex align-center justify-center" style="gap: 12px;">
              <!-- Action buttons on vertical column to the left (compact mode) -->
              <div class="stage-side-actions d-flex flex-column align-center justify-center" style="gap: 8px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  icon
                  size="small"
                  class="config-palette-btn"
                  @click="showConfig = true"
                >
                  <v-icon size="18">
                    mdi-palette
                  </v-icon>
                  <v-tooltip
                    activator="parent"
                    location="left"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                  >
                    {{ t('config') }}
                  </v-tooltip>
                </v-btn>
                <LScreenBtn
                  module="random"
                  class="stage-screen-btn"
                />
              </div>

              <!-- Draw Button and Caption Column -->
              <div class="d-flex flex-column align-center justify-center">
                <v-btn
                  :disabled="availableUndrawnNames.length === 0 || isDrawing"
                  :loading="isDrawing"
                  color="primary"
                  variant="flat"
                  rounded="xl"
                  size="x-large"
                  class="draw-btn font-weight-bold text-none px-10"
                  style="height: 64px; font-size: 1.2rem; box-shadow: 0 8px 24px rgba(0,151,215,0.4);"
                  @click="startDraw"
                >
                  <v-icon start size="28" class="mr-2">
                    mdi-play-circle
                  </v-icon>
                  {{ t('draw_button') }}
                </v-btn>

                <div class="draw-caption mt-3 opacity-70 text-caption font-weight-medium text-center">
                  <span v-if="availableUndrawnNames.length === 0">{{ t('empty_list') }}</span>
                  <span v-else-if="!isDrawing">{{ t('ready_to_draw') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- =================== NORMAL MODE (Right) =================== -->
        <div
          v-if="!compact"
          class="history-col d-flex flex-column flex-shrink-0"
          style="width: 25%; min-width: 280px; max-width: 320px; height: 100%; min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));"
        >
          <HistoryList v-model:drawn-names="drawnNames" />
        </div>
      </div>

      <!-- Config Modal -->
      <ConfigModal
        v-model="showConfig"
        :module-id="module_id"
        :draw-mode="drawMode"
        :sample-text="currentDisplay"
      />

      <!-- Diálogo de Confirmação: Resetar Tudo -->
      <v-dialog v-model="showResetAllConfirm" max-width="440">
        <v-card class="rounded-xl pa-5" style="background: var(--card-bg, #ffffff);">
          <div class="d-flex align-center mb-3" style="gap: 12px;">
            <v-avatar color="error" variant="tonal" size="40">
              <v-icon color="error" size="22">
                mdi-alert-outline
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0" style="color: var(--sidebar-text);">
                {{ t('confirm_reset_title') }}
              </h3>
            </div>
          </div>
          <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
            {{ t('confirm_reset_desc') }}
          </p>
          <div class="d-flex justify-end" style="gap: 10px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none font-weight-bold"
              @click="showResetAllConfirm = false"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              color="error"
              class="rounded-lg text-none font-weight-bold"
              @click="confirmResetAll"
            >
              {{ t('reset') }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "./components/ConfigModal.vue";
import ModuleHeader from "@/components/ModuleHeader.vue";
import AvailableList from "./components/AvailableList.vue";
import HistoryList from "./components/HistoryList.vue";
import manifest from "../manifest";
import PillSwitch from "@/components/inputs/PillSwitch.vue";

export default defineComponent({
  name: "SorteioPage",
  components: {
    LScreenBtn,
    ConfigModal,
    ModuleHeader,
    AvailableList,
    HistoryList,
    PillSwitch,
  },
  data: () => ({
    defaultConfig: {
      background: "#ffffff",
      color: "#0097d7",
      fontSizePc: 15,
      textTransform: "none",
      animationSpeed: "normal",
    },
    drawMode: "names" as "names" | "numbers",
    modeData: {
      names: {
        available: [] as string[],
        drawn: [] as string[],
      },
      numbers: {
        available: [] as string[],
        drawn: [] as string[],
      },
    },
    isDrawing: false,
    currentDisplay: "",
    showConfig: false,
    showResetAllConfirm: false,
    drawInterval: null as ReturnType<typeof setTimeout> | null,
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$appdata.get(`modules.${this.module_id}`);
    },
    availableNames: {
      get(): string[] {
        return this.modeData[this.drawMode]?.available || [];
      },
      set(val: string[]) {
        if (this.modeData[this.drawMode]) {
          this.modeData[this.drawMode].available = val;
          this.persistCurrentModeData();
        }
      },
    },
    drawnNames: {
      get(): string[] {
        return this.modeData[this.drawMode]?.drawn || [];
      },
      set(val: string[]) {
        if (this.modeData[this.drawMode]) {
          this.modeData[this.drawMode].drawn = val;
          this.persistCurrentModeData();
        }
      },
    },
    availableUndrawnNames(): string[] {
      return this.availableNames.filter((n) => !this.drawnNames.includes(n));
    },
    compact(): boolean {
      return this.$vuetify.display.width < 1050;
    },
    config(): any {
      return (
        this.$appdata.get(`modules.${this.module_id}.config`) ||
        this.$userdata.get("sorteio_config") ||
        this.defaultConfig
      );
    },
  },
  watch: {
    currentDisplay(val: string) {
      this.$appdata.set(`modules.${this.module_id}.data.currentDisplay`, val);
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, this.isDrawing);
    },
    isDrawing(val: boolean) {
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, val);
    },
    drawMode(newMode: "names" | "numbers") {
      this.$userdata.set("sorteio_mode", newMode);
      this.currentDisplay = "";
      this.isDrawing = false;
      if (this.drawInterval) {
        clearTimeout(this.drawInterval);
        this.drawInterval = null;
      }
      this.$appdata.set(`modules.${this.module_id}.data.currentDisplay`, "");
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, false);
    },
  },
  mounted() {
    this.loadState();
    this.$appdata.set(`modules.${this.module_id}.data.currentDisplay`, this.currentDisplay);
    this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, this.isDrawing);
  },
  beforeUnmount() {
    if (this.drawInterval) clearTimeout(this.drawInterval);
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    },
    loadState() {
      const savedMode = this.$userdata.get("sorteio_mode");
      if (savedMode === "numbers" || savedMode === "names") {
        this.drawMode = savedMode;
      }

      // Names data
      const namesAvail =
        this.$userdata.get("sorteio_available_names") ||
        this.$userdata.get("sorteio_available");
      if (Array.isArray(namesAvail)) this.modeData.names.available = namesAvail;

      const namesDrawn =
        this.$userdata.get("sorteio_drawn_names") ||
        this.$userdata.get("sorteio_drawn");
      if (Array.isArray(namesDrawn)) this.modeData.names.drawn = namesDrawn;

      // Numbers data
      const numsAvail = this.$userdata.get("sorteio_available_numbers");
      if (Array.isArray(numsAvail)) this.modeData.numbers.available = numsAvail;

      const numsDrawn = this.$userdata.get("sorteio_drawn_numbers");
      if (Array.isArray(numsDrawn)) this.modeData.numbers.drawn = numsDrawn;

      this.persistCurrentModeData();
    },
    persistCurrentModeData() {
      const currentAvail = this.availableNames;
      const currentDrawn = this.drawnNames;

      this.$appdata.set(`modules.${this.module_id}.data.availableNames`, currentAvail);
      this.$appdata.set(`modules.${this.module_id}.data.drawnNames`, currentDrawn);

      if (this.drawMode === "names") {
        this.$userdata.set("sorteio_available_names", currentAvail);
        this.$userdata.set("sorteio_drawn_names", currentDrawn);
        // For backwards compatibility
        this.$userdata.set("sorteio_available", currentAvail);
        this.$userdata.set("sorteio_drawn", currentDrawn);
      } else {
        this.$userdata.set("sorteio_available_numbers", currentAvail);
        this.$userdata.set("sorteio_drawn_numbers", currentDrawn);
      }
    },
    clearHistory() {
      this.drawnNames = [];
      this.currentDisplay = "";
    },
    confirmResetAll() {
      this.availableNames = [];
      this.drawnNames = [];
      this.currentDisplay = "";
      this.isDrawing = false;
      this.showResetAllConfirm = false;
    },
    startDraw() {
      const undrawn = this.availableUndrawnNames;
      if (undrawn.length === 0) return;

      this.isDrawing = true;
      let ticks = 0;
      let maxTicks = 30;
      let intervalTime = 50;

      if (this.config.animationSpeed === "fast") {
        maxTicks = 15;
        intervalTime = 30;
      } else if (this.config.animationSpeed === "slow") {
        maxTicks = 50;
        intervalTime = 80;
      }

      const tick = () => {
        ticks++;
        const randIndex = Math.floor(Math.random() * undrawn.length);
        this.currentDisplay = undrawn[randIndex];

        if (ticks < maxTicks) {
          if (ticks > maxTicks * 0.7) {
            intervalTime += 20;
          }
          this.drawInterval = setTimeout(tick, intervalTime);
        } else {
          this.finishDraw(undrawn);
        }
      };

      this.drawInterval = setTimeout(tick, intervalTime);
    },
    finishDraw(undrawn: string[]) {
      this.isDrawing = false;
      const randIndex = Math.floor(Math.random() * undrawn.length);
      const winner = undrawn[randIndex];
      this.currentDisplay = winner;
      this.drawnNames = [...this.drawnNames, winner];
    },
  },
});
</script>

<style scoped>
.draw-text {
  line-height: 1.1;
  word-break: break-word;
}

.random-content-main {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
  gap: 24px;
  flex-grow: 1;

  @media (max-height: 800px) {
    padding: 14px 16px;
    gap: 12px;
  }
}

.compact-top-row {
  gap: 24px;
  min-height: 200px;

  @media (max-height: 800px) {
    gap: 12px;
    min-height: 160px;
  }
}

.config-palette-btn {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  border-radius: 10px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.config-palette-btn:hover {
  transform: translateY(-1px);
}

:deep(.stage-screen-btn) {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  border-radius: 10px !important;
  background: transparent !important;
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.75)) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .v-btn__overlay,
  .v-btn__underlay {
    border-radius: 10px !important;
  }

  &:hover {
    transform: translateY(-1px);
    background: rgba(150, 150, 150, 0.12) !important;
    color: var(--sidebar-text, #ffffff) !important;
  }
}

.stage-top-actions {
  display: flex !important;
  gap: 8px !important;
}

.stage-side-actions {
  display: none !important;
  gap: 8px !important;
}

.stage-col {
  background: var(--card-bg, #fff);
  border-radius: 24px;
  box-shadow: var(--shadow);
  overflow: hidden;
  border: 1px solid var(--border-color, rgba(0,0,0,0.05));

  &.is-compact {
    width: 100%;
    height: 220px;
  }

  @media (max-height: 800px) {
    .stage-top-actions {
      display: none !important;
    }

    .stage-side-actions {
      display: flex !important;
      gap: 8px !important;
    }

    &.is-compact {
      height: 140px;

      .draw-text {
        min-height: 60px !important;
        font-size: clamp(1.8rem, 3vw, 3rem) !important;
      }

      .stage-btn-area {
        padding-top: 10px !important;
        padding-bottom: 10px !important;

        .draw-btn {
          height: 46px !important;
          font-size: 1rem !important;
          padding-left: 20px !important;
          padding-right: 20px !important;
        }

        .draw-caption {
          margin-top: 4px !important;
        }
      }
    }
  }

  &:not(.is-compact) {
    min-width: 350px;
    height: 100%;
    min-height: 0;
  }
}
</style>
