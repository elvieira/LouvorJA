<template>
  <div class="position-alignment-picker">
    <!-- Grade 3x3 de Alinhamento Rápido -->
    <div class="d-flex flex-column align-center mb-4">
      <div class="text-caption font-weight-medium mb-2 text-center" style="color: var(--sidebar-text-secondary);">
        Alinhamento Rápido na Tela
      </div>
      <div class="alignment-grid-container pa-1 rounded-xl" style="background: var(--main-bg, #f0f2f5); display: inline-grid; grid-template-columns: repeat(3, 44px); gap: 6px;">
        <v-btn
          v-for="preset in presets"
          :key="preset.id"
          icon
          size="small"
          :variant="isPresetActive(preset) ? 'flat' : 'text'"
          :color="isPresetActive(preset) ? 'primary' : undefined"
          class="alignment-btn rounded-lg"
          :style="{
            width: '44px',
            height: '44px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isPresetActive(preset) ? '0 4px 12px rgba(var(--v-theme-primary), 0.35)' : 'none',
          }"
          @click="selectPreset(preset)"
        >
          <v-icon size="20" :color="isPresetActive(preset) ? 'white' : 'grey-darken-1'">
            {{ preset.icon }}
          </v-icon>
          <v-tooltip activator="parent" location="top" open-delay="200">
            {{ preset.label }}
          </v-tooltip>
        </v-btn>
      </div>
    </div>

    <!-- Sliders de Ajuste Manual Fino (X e Y) -->
    <div v-if="!hideSliders" class="manual-position-controls">
      <!-- Posição Horizontal (X) -->
      <div class="mb-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon size="18" color="primary" class="mr-2">
              mdi-arrow-left-right
            </v-icon>
            <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
              Posição Horizontal (X)
            </span>
          </div>
          <div class="d-flex align-center" style="gap: 6px;">
            <v-chip
              size="x-small"
              variant="tonal"
              color="primary"
              class="font-weight-bold"
            >
              {{ xLabel }} ({{ Math.round(x) }}%)
            </v-chip>
            <v-btn
              v-if="Math.round(x) !== 50"
              icon
              size="x-small"
              variant="text"
              color="grey"
              @click="updateX(50)"
            >
              <v-icon size="14">
                mdi-restore
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Centralizar
              </v-tooltip>
            </v-btn>
          </div>
        </div>
        <div class="d-flex align-center" style="gap: 8px;">
          <v-btn
            icon
            size="x-small"
            variant="tonal"
            color="primary"
            @click="updateX(Math.max(0, x - 5))"
          >
            <v-icon size="16">
              mdi-minus
            </v-icon>
          </v-btn>
          <v-slider
            :model-value="x"
            min="0"
            max="100"
            step="1"
            hide-details
            color="primary"
            track-color="grey-lighten-3"
            class="flex-grow-1"
            @update:model-value="updateX"
          />
          <v-btn
            icon
            size="x-small"
            variant="tonal"
            color="primary"
            @click="updateX(Math.min(100, x + 5))"
          >
            <v-icon size="16">
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Posição Vertical (Y) -->
      <div>
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon size="18" color="primary" class="mr-2">
              mdi-arrow-up-down
            </v-icon>
            <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
              Posição Vertical (Y)
            </span>
          </div>
          <div class="d-flex align-center" style="gap: 6px;">
            <v-chip
              size="x-small"
              variant="tonal"
              color="primary"
              class="font-weight-bold"
            >
              {{ yLabel }} ({{ Math.round(y) }}%)
            </v-chip>
            <v-btn
              v-if="Math.round(y) !== 50"
              icon
              size="x-small"
              variant="text"
              color="grey"
              @click="updateY(50)"
            >
              <v-icon size="14">
                mdi-restore
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Centralizar
              </v-tooltip>
            </v-btn>
          </div>
        </div>
        <div class="d-flex align-center" style="gap: 8px;">
          <v-btn
            icon
            size="x-small"
            variant="tonal"
            color="primary"
            @click="updateY(Math.max(0, y - 5))"
          >
            <v-icon size="16">
              mdi-minus
            </v-icon>
          </v-btn>
          <v-slider
            :model-value="y"
            min="0"
            max="100"
            step="1"
            hide-details
            color="primary"
            track-color="grey-lighten-3"
            class="flex-grow-1"
            @update:model-value="updateY"
          />
          <v-btn
            icon
            size="x-small"
            variant="tonal"
            color="primary"
            @click="updateY(Math.min(100, y + 5))"
          >
            <v-icon size="16">
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface PresetItem {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
}

const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
    hideSliders?: boolean;
  }>(),
  {
    x: 50,
    y: 50,
    hideSliders: false,
  },
);

const emit = defineEmits<{
  (_e: "update:x", _val: number): void;
  (_e: "update:y", _val: number): void;
}>();

const presets: PresetItem[] = [
  { id: "top-left", label: "Topo Esquerda", icon: "mdi-arrow-top-left", x: 10, y: 15 },
  { id: "top-center", label: "Topo Centro", icon: "mdi-arrow-up", x: 50, y: 15 },
  { id: "top-right", label: "Topo Direita", icon: "mdi-arrow-top-right", x: 90, y: 15 },
  { id: "center-left", label: "Centro Esquerda", icon: "mdi-arrow-left", x: 10, y: 50 },
  { id: "center", label: "Centro da Tela", icon: "mdi-crosshairs-gps", x: 50, y: 50 },
  { id: "center-right", label: "Centro Direita", icon: "mdi-arrow-right", x: 90, y: 50 },
  { id: "bottom-left", label: "Baixo Esquerda", icon: "mdi-arrow-bottom-left", x: 10, y: 85 },
  { id: "bottom-center", label: "Baixo Centro", icon: "mdi-arrow-down", x: 50, y: 85 },
  { id: "bottom-right", label: "Baixo Direita", icon: "mdi-arrow-bottom-right", x: 90, y: 85 },
];

function isPresetActive(preset: PresetItem): boolean {
  return Math.abs(props.x - preset.x) <= 5 && Math.abs(props.y - preset.y) <= 5;
}

function selectPreset(preset: PresetItem) {
  emit("update:x", preset.x);
  emit("update:y", preset.y);
}

function updateX(val: number) {
  emit("update:x", Math.round(val));
}

function updateY(val: number) {
  emit("update:y", Math.round(val));
}

const xLabel = computed(() => {
  const rounded = Math.round(props.x);
  if (rounded <= 25) return "Esquerda";
  if (rounded >= 75) return "Direita";
  return "Centro";
});

const yLabel = computed(() => {
  const rounded = Math.round(props.y);
  if (rounded <= 25) return "Topo";
  if (rounded >= 75) return "Baixo";
  return "Centro";
});
</script>

<style scoped>
.alignment-grid-container {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.alignment-btn {
  border-radius: 8px !important;
}
</style>
