<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-tabs v-model="tab" align-tabs="center" :color="$theme.primary()">
        <v-tab :value="1">
          Simple Counter
        </v-tab>
        <v-tab :value="2">
          Advanced Counter
        </v-tab>
        <v-tab :value="3">
          Counter History
        </v-tab>
      </v-tabs>
    </template>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="1">
        <v-container fluid>
          <div class="d-flex flex-column align-center justify-center pa-6">
            <h2 class="text-h4 mb-4">
              Simple Counter
            </h2>
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-minus"
                variant="outlined"
                @click="decrement"
              />
              <div class="text-h3 mx-4">
                {{ count }}
              </div>
              <v-btn
                icon="mdi-plus"
                variant="outlined"
                @click="increment"
              />
            </div>
            <v-btn class="mt-4" color="primary" @click="reset">
              Reset
            </v-btn>
          </div>
        </v-container>
      </v-tabs-window-item>

      <v-tabs-window-item :value="2">
        <v-container fluid>
          <div class="d-flex flex-column align-center justify-center pa-6">
            <h2 class="text-h4 mb-4">
              Advanced Counter
            </h2>
            <div class="d-flex align-center">
              <v-text-field
                v-model.number="step"
                label="Increment Step"
                type="number"
                variant="outlined"
                class="mr-4"
                style="width: 120px"
              />
              <v-btn
                icon="mdi-minus"
                variant="outlined"
                @click="decrementBy(step)"
              />
              <div class="text-h3 mx-4">
                {{ count }}
              </div>
              <v-btn
                icon="mdi-plus"
                variant="outlined"
                @click="incrementBy(step)"
              />
            </div>
            <v-btn class="mt-4" color="primary" @click="reset">
              Reset
            </v-btn>
          </div>
        </v-container>
      </v-tabs-window-item>

      <v-tabs-window-item :value="3">
        <v-container fluid>
          <v-list>
            <v-list-item
              v-for="(value, index) in history"
              :key="index"
              :title="`Change ${index + 1}`"
              :subtitle="value > 0 ? `+${value}` : value"
            >
              <template #prepend>
                <v-icon
                  :color="value > 0 ? 'green' : 'red'"
                  :icon="value > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>
  </ModuleContainer>
</template>

<script>
export default {
  name: "CounterModule",
};
</script>

<script setup>
import { ref } from "vue";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import manifest from "../manifest.json";

// ---- Obrigatório para tradução -------
const moduleContainer = ref(null);
const t = (key) => {
  return moduleContainer.value?.t(key) || key;
};
// ---------------------------------------

const tab = ref(1);
const count = ref(0);
const step = ref(1);
const history = ref([]);

function increment() {
  count.value++;
  history.value.unshift(1);
}

function decrement() {
  count.value--;
  history.value.unshift(-1);
}

function incrementBy(value) {
  count.value += value;
  history.value.unshift(value);
}

function decrementBy(value) {
  count.value -= value;
  history.value.unshift(-value);
}

function reset() {
  count.value = 0;
  history.value = [];
}
</script>
