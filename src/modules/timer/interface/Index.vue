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
        </div>
        
        <div class="search-bar ml-4 d-flex align-center" style="flex: 1; justify-content: flex-end; gap: 12px;">
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-main flex-grow-1 w-100 pa-6 d-flex flex-column align-center justify-center" style="overflow-y: auto; background: transparent;">
        
        <!-- PREVIEW TV -->
        <div class="preview-tv position-relative mb-8" :style="{ width: '100%', maxWidth: '900px', aspectRatio: '21/9', maxHeight: '100%', background: 'var(--card-bg, #ffffff)', borderRadius: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid var(--border-color, rgba(0,0,0,0.05))', overflow: 'hidden' }">
          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <v-btn variant="tonal" color="primary" icon size="small" @click="showConfig = true">
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
                <input type="number" v-model="editHours" class="time-input" min="0" max="99" />
                <span class="text-caption font-weight-bold mt-2" style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;">{{ t('hours_label') }}</span>
              </div>
              <div class="text-h3 font-weight-bold mx-3 pb-6" style="color: var(--sidebar-text-secondary);">:</div>
              <div class="d-flex flex-column align-center">
                <input type="number" v-model="editMinutes" class="time-input" min="0" max="59" />
                <span class="text-caption font-weight-bold mt-2" style="color: var(--sidebar-text-secondary); text-transform: uppercase; letter-spacing: 1px;">{{ t('minutes_label') }}</span>
              </div>
              <div class="text-h3 font-weight-bold mx-3 pb-6" style="color: var(--sidebar-text-secondary);">:</div>
              <div class="d-flex flex-column align-center">
                <input type="number" v-model="editSeconds" class="time-input" min="0" max="59" />
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

<script>
import Screen from "./components/Screen.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "./components/ConfigModal.vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import manifest from "../manifest.json";

export default {
  name: manifest.id,
  components: {
    Screen,
    LScreenBtn,
    ConfigModal,
    MenuToggleButton,
  },
  data: () => ({
    isStopwatchStr: "false",
    showConfig: false
  }),
  computed: {
    config() {
      return this.$appdata.get(`modules.${this.module_id}.config`) || {
        fontColor: "#ffffff",
        bgColor: "#000000",
        visualAlert: true,
        audioAlert: true
      };
    },
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$appdata.get(`modules.${this.module_id}`);
    },
    timerData() {
      return this.$appdata.get(`modules.${this.module_id}.data`) || {
        isStopwatch: false,
        isRunning: false,
        baseTime: 0,
        accumulatedTime: 0,
        targetDuration: 5 * 60000, // 5 min default
        isAlerting: false
      };
    },
    isStopwatch() {
      return this.timerData.isStopwatch;
    },
    isRunning() {
      return this.timerData.isRunning;
    },
    targetDuration() {
      return this.timerData.targetDuration;
    },
    editHours: {
      get() {
        const ms = this.isStopwatch ? this.timerData.accumulatedTime : this.timerData.targetDuration;
        return Math.floor(ms / 3600000);
      },
      set(val) {
        const hrs = parseInt(val) || 0;
        const ms = (hrs * 3600000) + (this.editMinutes * 60000) + (this.editSeconds * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms });
        } else {
          this.updateData({ targetDuration: ms });
        }
      }
    },
    editMinutes: {
      get() {
        const ms = this.isStopwatch ? this.timerData.accumulatedTime : this.timerData.targetDuration;
        return Math.floor((ms % 3600000) / 60000);
      },
      set(val) {
        const mins = parseInt(val) || 0;
        const ms = (this.editHours * 3600000) + (mins * 60000) + (this.editSeconds * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms });
        } else {
          this.updateData({ targetDuration: ms });
        }
      }
    },
    editSeconds: {
      get() {
        const ms = this.isStopwatch ? this.timerData.accumulatedTime : this.timerData.targetDuration;
        return Math.floor((ms % 60000) / 1000);
      },
      set(val) {
        const secs = parseInt(val) || 0;
        const ms = (this.editHours * 3600000) + (this.editMinutes * 60000) + (secs * 1000);
        if (this.isStopwatch) {
          this.updateData({ accumulatedTime: ms });
        } else {
          this.updateData({ targetDuration: ms });
        }
      }
    }
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
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    },
    updateData(updates) {
      const current = this.timerData;
      this.$appdata.set(`modules.${this.module_id}.data`, { ...current, ...updates });
    },
    onModeChange(val) {
      const isStopwatch = val === "true";
      this.updateData({
        isStopwatch,
        isRunning: false,
        accumulatedTime: 0,
        baseTime: Date.now(),
        isAlerting: false
      });
    },
    toggleTimer() {
      if (this.isRunning) {
        // Pause
        const elapsed = Date.now() - this.timerData.baseTime;
        this.updateData({
          isRunning: false,
          accumulatedTime: this.timerData.accumulatedTime + elapsed,
          isAlerting: false
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
          baseTime: Date.now()
        });
      }
    },
    resetTimer() {
      this.updateData({
        isRunning: false,
        accumulatedTime: 0,
        baseTime: Date.now(),
        isAlerting: false,
        targetDuration: this.isStopwatch ? 0 : 5 * 60000 // Reset to 5 min for timer
      });
    }
  },
};
</script>

<style scoped>
.time-input {
  width: 100px;
  height: 100px;
  font-size: 3.5rem;
  font-weight: 800;
  text-align: center;
  background: var(--card-bg, #ffffff);
  border-radius: 28px;
  border: 2px solid var(--border-color, rgba(0,0,0,0.1));
  color: var(--sidebar-text, #000);
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}
.time-input:focus {
  border-color: rgba(var(--v-theme-primary), 1);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.15);
}
/* Hide arrows */
.time-input::-webkit-outer-spin-button,
.time-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.time-input[type=number] {
  -moz-appearance: textfield;
}
</style>
