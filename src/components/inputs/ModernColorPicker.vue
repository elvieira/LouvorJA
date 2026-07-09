<template>
  <v-menu
    v-model="isColorMenuOpen"
    :close-on-content-click="false"
    :persistent="true"
    @click:outside="isColorMenuOpen = false"
  >
    <template #activator="{ props }">
      <slot name="activator" :props="props">
        <!-- Default activator: a colored circle showing the current selection -->
        <div
          v-bind="props"
          class="rounded-circle cursor-pointer d-flex align-center justify-center"
          :style="{
            width: '36px', height: '36px',
            background: modelValue,
            border: '2px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s'
          }"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        />
      </slot>
    </template>
    
    <v-card class="pa-4 rounded-xl d-flex flex-column" style="background: var(--card-bg); width: 280px; gap: 12px; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
      <!-- Cores Padrão -->
      <div>
        <div class="text-caption font-weight-bold text-uppercase mb-3" style="color: var(--sidebar-text); opacity: 0.5; letter-spacing: 0.5px;">
          Cores Padrão
        </div>
        <div class="d-flex flex-wrap" style="gap: 12px; padding: 0 4px;">
          <div
            v-for="color in standardColors"
            :key="color"
            class="rounded-circle cursor-pointer d-flex align-center justify-center"
            :style="{
              width: '28px', height: '28px',
              background: color,
              border: modelValue === color ? '2px solid var(--accent-blue, #2196F3)' : '1px solid rgba(0,0,0,0.1)',
              boxShadow: modelValue === color ? '0 0 0 3px rgba(33, 150, 243, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: modelValue === color ? 'scale(1.15)' : 'scale(1)',
            }"
            @click="selectColor(color)"
          />
        </div>
      </div>

      <v-divider class="my-1" />

      <!-- Cor Personalizada -->
      <div>
        <v-hover v-slot="{ isHovering, props }">
          <div
            class="d-flex align-center justify-space-between cursor-pointer pa-2 rounded-lg" 
            v-bind="props"
            :style="{ background: isHovering ? 'var(--hover-bg, rgba(150,150,150,0.1))' : 'transparent', transition: 'background 0.2s', margin: '0 -8px' }"
            @click="showAdvancedColor = !showAdvancedColor"
          >
            <div class="d-flex align-center">
              <div class="rounded-circle d-flex align-center justify-center mr-3" style="width: 28px; height: 28px; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);">
                <div class="rounded-circle" style="width: 20px; height: 20px; background: var(--card-bg);" />
              </div>
              <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Cor Personalizada</span>
            </div>
            <v-icon size="20" color="grey">
              {{ showAdvancedColor ? 'mdi-chevron-up' : 'mdi-chevron-right' }}
            </v-icon>
          </div>
        </v-hover>

        <v-expand-transition>
          <div v-show="showAdvancedColor" class="pt-4">
            <v-color-picker
              :model-value="modelValue"
              mode="hexa"
              :swatches="[]"
              elevation="0"
              width="100%"
              bg-color="transparent"
              @update:model-value="selectColor"
            />
          </div>
        </v-expand-transition>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "ModernColorPicker",
  props: {
    modelValue: {
      type: String,
      default: "#000000",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isColorMenuOpen: false,
      showAdvancedColor: false,
      standardColors: [
        "#000000", "#424242", "#757575", "#BDBDBD", "#FFFFFF",
        "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE",
        "#448AFF", "#40C4FF", "#18FFFF", "#64FFDA", "#69F0AE",
        "#B2FF59", "#EEFF41", "#FFFF00", "#FFD740", "#FFAB40",
      ],
    };
  },
  methods: {
    selectColor(color) {
      this.$emit("update:modelValue", color);
    },
  },
};
</script>
