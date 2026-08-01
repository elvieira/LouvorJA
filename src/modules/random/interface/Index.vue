<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <v-btn-toggle
          v-model="drawMode"
          mandatory
          color="primary"
          variant="tonal"
          class="rounded-lg"
          style="height: 36px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
        >
          <v-btn value="names" class="text-caption font-weight-bold px-3 text-none">
            {{ t('mode_names') }}
          </v-btn>
          <v-btn value="numbers" class="text-caption font-weight-bold px-3 text-none">
            {{ t('mode_numbers') }}
          </v-btn>
        </v-btn-toggle>
        
        <v-btn
          variant="flat"
          color="error"
          rounded="lg"
          class="text-none font-weight-bold ml-4"
          prepend-icon="mdi-refresh"
          @click="resetAll"
        >
          {{ t('reset') }}
        </v-btn>
      </ModuleHeader>

      <!-- Main Layout -->
      <div class="content-main d-flex" :class="compact ? 'flex-column' : 'flex-row'" style="overflow-x: hidden; padding: 24px; min-height: 0; gap: 24px; flex-grow: 1;">
        <!-- =================== COMPACT TOP ROW (Left + Right) =================== -->
        <div v-if="compact" class="d-flex w-100 flex-grow-1" style="gap: 24px; min-height: 0;">
          <!-- Left Panel -->
          <div class="participants-col d-flex flex-column flex-grow-1" style="width: calc(50% - 12px); min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <AvailableList
              v-model:available-names="availableNames"
              :drawn-names="drawnNames"
              :draw-mode="drawMode"
              @clear:history="clearHistory"
            />
          </div>
          <!-- Right Panel -->
          <div class="history-col d-flex flex-column flex-grow-1" style="width: calc(50% - 12px); min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <HistoryList v-model:drawn-names="drawnNames" />
          </div>
        </div>

        <!-- =================== NORMAL MODE (Left) =================== -->
        <div v-if="!compact" class="participants-col d-flex flex-column flex-shrink-0" style="width: 25%; min-width: 280px; max-width: 320px; height: 100%; min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
          <AvailableList
            v-model:available-names="availableNames"
            :drawn-names="drawnNames"
            :draw-mode="drawMode"
            @clear:history="clearHistory"
          />
        </div>

        <!-- =================== THE STAGE (Both Modes) =================== -->
        <div class="stage-col d-flex position-relative" :class="compact ? 'flex-row align-center flex-shrink-0' : 'flex-column flex-grow-1 align-center justify-center'" :style="[compact ? { width: '100%', height: '220px' } : { minWidth: '350px', height: '100%', minHeight: '0' }, { background: 'var(--card-bg, #fff)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1px solid var(--border-color, rgba(0,0,0,0.05))' }]">
          <!-- Background decoration -->
          <div class="position-absolute top-0 left-0 w-100 h-100" style="background: linear-gradient(135deg, rgba(0,151,215,0.05) 0%, rgba(0,151,215,0.01) 100%); pointer-events: none;" />

          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <v-btn
              variant="tonal"
              color="primary"
              icon
              size="small"
              style="width: 36px; height: 36px;"
              class="config-palette-btn"
              @click="showConfig = true"
            >
              <v-icon>mdi-palette</v-icon>
              <v-tooltip
                activator="parent"
                location="bottom"
                open-delay="300"
                content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ t('config') }}
              </v-tooltip>
            </v-btn>
            <LScreenBtn module="random" />
          </div>

          <!-- Name Display Area -->
          <div class="text-center px-8 flex-grow-1 d-flex flex-column align-center justify-center" :style="{ zIndex: 1, height: compact ? '100%' : 'auto' }">
            <v-slide-y-transition mode="out-in">
              <div :key="isDrawing ? 'drawing' : currentDisplay" class="draw-text font-weight-black text-center" :style="{ fontSize: 'clamp(2rem, 3.5vw, 4.5rem)', color: isDrawing ? 'var(--sidebar-text-secondary)' : 'var(--accent-blue)', transition: 'color 0.3s', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: isDrawing ? 'none' : '0 4px 20px rgba(0,151,215,0.3)' }">
                {{ currentDisplay || "- - - -" }}
              </div>
            </v-slide-y-transition>
          </div>
          
          <!-- Button Area -->
          <div class="text-center flex-shrink-0 d-flex flex-column align-center justify-center" :class="compact ? 'pb-4 pt-12 px-8 h-100' : 'pa-6 w-100'" style="z-index: 1;">
            <v-btn
              :disabled="availableUndrawnNames.length === 0 || isDrawing"
              :loading="isDrawing"
              color="primary"
              variant="flat"
              rounded="xl"
              size="x-large"
              class="font-weight-bold text-none px-10"
              style="height: 64px; font-size: 1.2rem; box-shadow: 0 8px 24px rgba(0,151,215,0.4);"
              @click="startDraw"
            >
              <v-icon start size="28" class="mr-2">
                mdi-play-circle
              </v-icon>
              {{ t('draw_button') }}
            </v-btn>
            
            <div class="mt-4 opacity-70 text-caption font-weight-medium">
              <span v-if="availableUndrawnNames.length === 0">{{ t('empty_list') }}</span>
              <span v-else-if="!isDrawing">{{ t('ready_to_draw') }}</span>
            </div>
          </div>
        </div>

        <!-- =================== NORMAL MODE (Right) =================== -->
        <div v-if="!compact" class="history-col d-flex flex-column flex-shrink-0" style="width: 25%; min-width: 280px; max-width: 320px; height: 100%; min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
          <HistoryList v-model:drawn-names="drawnNames" />
        </div>
      </div>
      
      <ConfigModal v-model="showConfig" :module-id="module_id" />
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

export default defineComponent({
  name: "SorteioPage",
  components: {
    LScreenBtn,
    ConfigModal,
    ModuleHeader,
    AvailableList,
    HistoryList,
  },
  data: () => ({
    defaultConfig: { background: "#ffffff", color: "#0097d7", fontSizePc: 15, textTransform: "none", animationSpeed: "normal" },
    newName: "",
    drawMode: "names",
    numMin: 1,
    numMax: 100,
    availableNames: [] as string[],
    drawnNames: [] as string[],
    isDrawing: false,
    currentDisplay: "",
    showConfig: false,
    drawInterval: null as ReturnType<typeof setTimeout> | null,
    animationDuration: 3000,
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$appdata.get(`modules.${this.module_id}`);
    },
    availableUndrawnNames(): string[] {
      return this.availableNames.filter(n => !this.drawnNames.includes(n));
    },
    reversedDrawnNames(): string[] {
      return [...this.drawnNames].reverse();
    },
    compact(): boolean {
      return this.$vuetify.display.width < 1400;
    },
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.defaultConfig;
    },
  },
  watch: {
    availableNames: {
      handler(val: string[]) {
        this.$appdata.set(`modules.${this.module_id}.data.availableNames`, val);
        this.$userdata.set("sorteio_available", val);
      },
      deep: true,
    },
    drawnNames: {
      handler(val: string[]) {
        this.$appdata.set(`modules.${this.module_id}.data.drawnNames`, val);
        this.$userdata.set("sorteio_drawn", val);
      },
      deep: true,
    },
    currentDisplay(val: string) {
      this.$appdata.set(`modules.${this.module_id}.data.currentDisplay`, val);
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, this.isDrawing);
    },
    isDrawing(val: boolean) {
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, val);
    },
    drawMode() {
      this.resetAll();
    },
  },
  mounted() {
    this.loadState();
    // Pre-populate projection initial state
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
      const available = this.$userdata.get("sorteio_available");
      if (available && Array.isArray(available)) this.availableNames = available;
      
      const drawn = this.$userdata.get("sorteio_drawn");
      if (drawn && Array.isArray(drawn)) this.drawnNames = drawn;
    },
    clearHistory() {
      this.drawnNames = [];
      this.currentDisplay = "";
    },
    resetAll() {
      this.availableNames = [];
      this.drawnNames = [];
      this.currentDisplay = "";
    },
    startDraw() {
      const undrawn = this.availableUndrawnNames;
      if (undrawn.length === 0) return;

      this.isDrawing = true;
      let ticks = 0;
      let maxTicks = 30; // normal
      let intervalTime = 50; // normal

      if (this.config.animationSpeed === "fast") {
        maxTicks = 15;
        intervalTime = 30;
      } else if (this.config.animationSpeed === "slow") {
        maxTicks = 50;
        intervalTime = 80;
      }

      const tick = () => {
        ticks++;
        // Pick random name for animation
        const randIndex = Math.floor(Math.random() * undrawn.length);
        this.currentDisplay = undrawn[randIndex];

        if (ticks < maxTicks) {
          // Slow down animation towards the end
          if (ticks > maxTicks * 0.7) {
            intervalTime += 20;
          }
          this.drawInterval = setTimeout(tick, intervalTime);
        } else {
          // Final Winner
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
      this.drawnNames.push(winner);
      
      // We can add a confetti trigger here if we implement one
    },
  },
});
</script>

<style scoped>
.draw-text {
  line-height: 1.1;
  word-break: break-word;
}
</style>
