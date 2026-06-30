<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-tabs v-model="tab" align-tabs="center" :color="$theme.primary()">
        <v-tab :value="1">
          <v-icon start icon="mdi-account-group" />
          {{ t('names_tab') }}
        </v-tab>
        <v-tab :value="2">
          <v-icon start icon="mdi-numeric" />
          {{ t('numbers_tab') }}
        </v-tab>
      </v-tabs>
    </template>

    <v-tabs-window v-model="tab">
      <!-- Tab 1: Name Drawing -->
      <v-tabs-window-item :value="1">
        <v-container fluid>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <v-textarea
                  v-model="namesText"
                  :label="t('names_tab')"
                  :placeholder="t('names_placeholder')"
                  variant="outlined"
                  rows="8"
                  auto-grow
                  hide-details
                />
                <div class="text-caption text-medium-emphasis mt-2 mb-3">
                  {{ t('names_info') }}
                </div>
                <v-btn
                  color="primary"
                  size="large"
                  block
                  :disabled="namesList.length < 2 || isDrawing"
                  @click="drawName()"
                >
                  <v-icon start icon="mdi-dice-5" />
                  {{ isDrawing ? t('drawing') : t('draw_btn') }}
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <!-- Result display -->
              <v-card
                class="result-card pa-6 text-center"
                :class="{ 'result-active': drawingResult.name !== null }"
                variant="outlined"
              >
                <div class="text-h6 text-medium-emphasis mb-2">
                  {{ t('result_title') }}
                </div>
                <div
                  class="result-text"
                  :class="{ 'result-animating': isDrawing, 'result-final': drawingResult.name !== null && !isDrawing }"
                >
                  {{ displayName }}
                </div>
                <div v-if="drawingResult.name && !isDrawing" class="text-caption text-medium-emphasis mt-2">
                  {{ t('at') }} {{ drawingResult.time }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- History -->
          <v-card variant="outlined" class="pa-4 mt-4">
            <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-history" class="mr-2" />
              <span class="text-h6">{{ t('history_title') }}</span>
              <v-spacer />
              <v-btn
                v-if="nameHistory.length > 0"
                variant="text"
                color="error"
                size="small"
                @click="nameHistory = []"
              >
                <v-icon start icon="mdi-delete" small />
                {{ t('clear_history') }}
              </v-btn>
            </div>

            <v-list v-if="nameHistory.length > 0" density="compact">
              <v-list-item
                v-for="(entry, i) in [...nameHistory].reverse()"
                :key="i"
                :title="entry.value"
                :subtitle="entry.time"
              >
                <template #prepend>
                  <v-chip size="small" color="primary" variant="tonal">
                    #{{ nameHistory.length - i }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center text-medium-emphasis pa-4">
              {{ t('no_history') }}
            </div>
          </v-card>
        </v-container>
      </v-tabs-window-item>

      <!-- Tab 2: Number Drawing -->
      <v-tabs-window-item :value="2">
        <v-container fluid>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="minValue"
                      :label="t('min_label')"
                      type="number"
                      variant="outlined"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="maxValue"
                      :label="t('max_label')"
                      type="number"
                      variant="outlined"
                      hide-details
                    />
                  </v-col>
                </v-row>
                <v-btn
                  color="primary"
                  size="large"
                  block
                  class="mt-4"
                  :disabled="minValue >= maxValue || isDrawing"
                  @click="drawNumber()"
                >
                  <v-icon start icon="mdi-dice-5" />
                  {{ isDrawing ? t('drawing') : t('draw_btn') }}
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <!-- Result display -->
              <v-card
                class="result-card pa-6 text-center"
                :class="{ 'result-active': drawingResult.number !== null }"
                variant="outlined"
              >
                <div class="text-h6 text-medium-emphasis mb-2">
                  {{ t('result_title') }}
                </div>
                <div
                  class="result-text result-number"
                  :class="{ 'result-animating': isDrawing, 'result-final': drawingResult.number !== null && !isDrawing }"
                >
                  {{ displayNumber }}
                </div>
                <div v-if="drawingResult.number !== null && !isDrawing" class="text-caption text-medium-emphasis mt-2">
                  {{ t('at') }} {{ drawingResult.time }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- History -->
          <v-card variant="outlined" class="pa-4 mt-4">
            <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-history" class="mr-2" />
              <span class="text-h6">{{ t('history_title') }}</span>
              <v-spacer />
              <v-btn
                v-if="numberHistory.length > 0"
                variant="text"
                color="error"
                size="small"
                @click="numberHistory = []"
              >
                <v-icon start icon="mdi-delete" small />
                {{ t('clear_history') }}
              </v-btn>
            </div>

            <v-list v-if="numberHistory.length > 0" density="compact">
              <v-list-item
                v-for="(entry, i) in [...numberHistory].reverse()"
                :key="i"
                :title="String(entry.value)"
                :subtitle="entry.time"
              >
                <template #prepend>
                  <v-chip size="small" color="primary" variant="tonal">
                    #{{ numberHistory.length - i }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center text-medium-emphasis pa-4">
              {{ t('no_history') }}
            </div>
          </v-card>
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>
  </ModuleContainer>
</template>

<script>
export default {
  name: "DrawModule",
};
</script>

<script setup>
import { ref, computed } from "vue";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import manifest from "../manifest.json";

const moduleContainer = ref(null);
const t = (key) => {
  return moduleContainer.value?.t(key) || key;
};

const tab = ref(1);
const namesText = ref("");
const minValue = ref(1);
const maxValue = ref(100);
const isDrawing = ref(false);

// Drawing result
const drawingResult = ref({ name: null, number: null, time: "" });

// History
const nameHistory = ref([]);
const numberHistory = ref([]);

// Computed
const namesList = computed(() => {
  return namesText.value
    .split("\n")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
});

const displayName = computed(() => {
  if (isDrawing.value) return "?";
  return drawingResult.value.name || "—";
});

const displayNumber = computed(() => {
  if (isDrawing.value) return "?";
  return drawingResult.value.number !== null ? String(drawingResult.value.number) : "—";
});

// Draw animation helper
function animateDraw(callback, onDone) {
  isDrawing.value = true;
  const interval = 60; // ms between changes
  const duration = 1500; // total animation time
  const steps = duration / interval;
  let step = 0;

  const animInterval = setInterval(() => {
    step++;
    callback(step, steps);
    if (step >= steps) {
      clearInterval(animInterval);
      isDrawing.value = false;
      onDone();
    }
  }, interval);
}

function drawName() {
  const list = namesList.value;
  if (list.length < 2) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  animateDraw(
    (step, total) => {
      const idx = Math.floor(Math.random() * list.length);
      drawingResult.value = { name: list[idx], number: null, time: "" };
    },
    () => {
      const finalIdx = Math.floor(Math.random() * list.length);
      drawingResult.value = { name: list[finalIdx], number: null, time: timeStr };
      nameHistory.value.push({ value: list[finalIdx], time: timeStr });
    }
  );
}

function drawNumber() {
  if (minValue.value >= maxValue.value) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  animateDraw(
    (step, total) => {
      const n = Math.floor(Math.random() * (maxValue.value - minValue.value + 1)) + minValue.value;
      drawingResult.value = { name: null, number: n, time: "" };
    },
    () => {
      const finalN = Math.floor(Math.random() * (maxValue.value - minValue.value + 1)) + minValue.value;
      drawingResult.value = { name: null, number: finalN, time: timeStr };
      numberHistory.value.push({ value: finalN, time: timeStr });
    }
  );
}
</script>

<style scoped>
.result-card {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-color: var(--border-color, #e0e0e0);
}

.result-card.result-active {
  border-color: var(--accent-blue, #0097d7);
  box-shadow: 0 0 20px rgba(0, 151, 215, 0.1);
}

.result-text {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent-blue, #0097d7);
  transition: all 0.5s ease;
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-text.result-number {
  font-size: 5rem;
}

.result-text.result-animating {
  animation: cycling 0.1s ease-in-out infinite alternate;
}

.result-text.result-final {
  animation: pop-in 0.3s ease-out;
}

@keyframes cycling {
  from { opacity: 0.3; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1.05); }
}

@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
</style>