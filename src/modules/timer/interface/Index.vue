<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <ModuleHeader :title="t('title')" :icon="module.icon">
        <v-btn-toggle
          v-model="isStopwatchStr"
          mandatory
          color="primary"
          variant="tonal"
          class="rounded-lg"
          style="height: 36px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
          :disabled="isRunning"
          @update:model-value="onModeChange"
        >
          <v-btn value="false" class="text-caption font-weight-bold px-3 text-none">
            {{ t('mode_timer') }}
          </v-btn>
          <v-btn value="true" class="text-caption font-weight-bold px-3 text-none">
            {{ t('mode_stopwatch') }}
          </v-btn>
        </v-btn-toggle>
      </ModuleHeader>

      <!-- Main Content -->
      <div class="content-main flex-grow-1 w-100 pa-6 d-flex flex-column align-center justify-center" style="overflow-y: auto; background: transparent;">
        <!-- PREVIEW TV -->
        <div class="preview-tv position-relative mb-8" :style="{ width: '100%', maxWidth: '900px', aspectRatio: '21/9', maxHeight: '100%', background: 'var(--card-bg, #ffffff)', borderRadius: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid var(--border-color, rgba(0,0,0,0.05))', overflow: 'hidden' }">
          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <v-btn
              variant="tonal"
              color="primary"
              icon
              size="small"
              @click="showConfig = true"
            >
              <v-icon>mdi-palette-outline</v-icon>
            </v-btn>
            <LScreenBtn module="timer" />
          </div>
          <Screen :preview="true" />
        </div>

        <!-- CONTROLS -->
        <div class="controls-area d-flex flex-column align-center justify-center">
          <!-- Time Editors -->
          <v-expand-transition>
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
          </v-expand-transition>

          <!-- Buttons -->
          <div class="d-flex align-center" style="gap: 16px;">
            <v-btn
              size="x-large"
              :color="isRunning ? 'warning' : 'primary'"
              variant="flat"
              rounded="pill"
              class="font-weight-bold px-10 text-none"
              :style="{ height: '64px', fontSize: '1.2rem', boxShadow: isRunning ? 'none' : '0 10px 30px rgba(var(--v-theme-primary),0.3)' }"
              @click="toggleTimer"
            >
              <v-icon start size="28" class="mr-2">
                {{ isRunning ? 'mdi-pause-circle' : 'mdi-play-circle' }}
              </v-icon>
              {{ isRunning ? t('pause') : t('start') }}
            </v-btn>

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
      <ConfigModal v-model="showConfig" :module-id="module_id" />
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

export default defineComponent({
  name: manifest.id,
  components: {
    Screen,
    LScreenBtn,
    ConfigModal,
    ModuleHeader,
  },
  data: () => ({
    isStopwatchStr: "false",
    showConfig: false,
  }),
  computed: {
    config(): any {
      return this.$appdata.get(`modules.${this.module_id}.config`) || {
        fontColor: "#ffffff",
        bgColor: "#000000",
        visualAlert: true,
        audioAlert: true,
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
        isStopwatch: false,
        isRunning: false,
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 5 * 60000, // 5 min default
        isAlerting: false,
      };
    },
    isStopwatch(): boolean {
      return this.timerData.isStopwatch;
    },
    isRunning(): boolean {
      return this.timerData.isRunning;
    },
    targetDuration(): number {
      return this.timerData.targetDuration;
    },
    editHours: {
      get(): number {
        const ms = this.isStopwatch ? this.timerData.accumulatedTime : this.timerData.targetDuration;
        return Math.floor(ms / 3600000);
      },
      set(val: string | number) {
        const hrs = typeof val === "string" ? parseInt(val) : val;
        const ms = ((hrs || 0) * 3600000) + (this.editMinutes * 60000) + (this.editSeconds * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms });
        } else {
          this.updateData({ targetDuration: ms });
        }
      },
    },
    editMinutes: {
      get(): number {
        const ms = this.isStopwatch ? this.timerData.accumulatedTime : this.timerData.targetDuration;
        return Math.floor((ms % 3600000) / 60000);
      },
      set(val: string | number) {
        const mins = typeof val === "string" ? parseInt(val) : val;
        const ms = (this.editHours * 3600000) + ((mins || 0) * 60000) + (this.editSeconds * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms });
        } else {
          this.updateData({ targetDuration: ms });
        }
      },
    },
    editSeconds: {
      get(): number {
        const ms = this.isStopwatch ? this.timerData.accumulatedTime : this.timerData.targetDuration;
        return Math.floor((ms % 60000) / 1000);
      },
      set(val: string | number) {
        const secs = typeof val === "string" ? parseInt(val) : val;
        const ms = (this.editHours * 3600000) + (this.editMinutes * 60000) + ((secs || 0) * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms });
        } else {
          this.updateData({ targetDuration: ms });
        }
      },
    },
  },
  mounted() {
    // Initialize data if not present
    if (!this.$appdata.get(`modules.${this.module_id}.data`)) {
      this.resetTimer();
    } else {
      this.isStopwatchStr = this.timerData.isStopwatch ? "true" : "false";
    }
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    },
    updateData(updates: any) {
      const current = this.timerData;
      this.$appdata.set(`modules.${this.module_id}.data`, { ...current, ...updates });
    },
    onModeChange(val: string) {
      const isStopwatch = val === "true";
      this.updateData({
        isStopwatch,
        isRunning: false,
        accumulatedTime: 0,
        baseTime: Date.now(),
        isAlerting: false,
      });
    },
    toggleTimer() {
      if (this.isRunning) {
        // Pause
        const now = Date.now();
        let elapsed = 0;
        if (this.timerData.baseTime) {
          elapsed = now - this.timerData.baseTime;
        }
        this.updateData({
          isRunning: false,
          accumulatedTime: this.timerData.accumulatedTime + elapsed,
          baseTime: 0,
        });
      } else {
        // Stop Alerting if we were
        this.updateData({ isAlerting: false });
        
        // Check if timer is already finished, if so don't allow start
        if (!this.isStopwatch) {
          if (this.timerData.targetDuration <= this.timerData.accumulatedTime) {
            return;
          }
        }
        
        // Start
        this.updateData({
          isRunning: true,
          baseTime: Date.now(),
          isAlerting: false,
        });
      }
    },
    resetTimer() {
      this.updateData({
        isRunning: false,
        accumulatedTime: 0,
        baseTime: 0,
        isAlerting: false,
        targetDuration: this.isStopwatch ? 0 : 5 * 60000, // Reset to 5 min for timer
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
</style>
