<template>
  <div
    ref="containerRef"
    class="custom-tabs-pill d-flex align-center flex-shrink-0"
    :class="{ 'w-100': block }"
    :style="block ? 'width: 100%; position: relative;' : 'position: relative;'"
  >
    <!-- Marcador Deslizante (Sliding Active Indicator) -->
    <div
      class="pill-slider-indicator"
      :style="indicatorStyle"
    />

    <!-- Botões de Opção -->
    <button
      v-for="item in items"
      :key="String(item.value)"
      :ref="(el) => setButtonRef(el, item.value)"
      type="button"
      class="custom-tab-btn"
      :class="{
        active: modelValue === item.value,
        'flex-grow-1 justify-center': block,
      }"
      :disabled="disabled || item.disabled"
      @click="selectItem(item.value)"
    >
      <v-icon
        v-if="item.icon"
        size="16"
        class="mr-1"
      >
        {{ item.icon }}
      </v-icon>
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

export interface PillSwitchItem {
  value: string | number | boolean;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | boolean;
    items: PillSwitchItem[];
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    disabled: false,
    block: false,
  },
);

const emit = defineEmits<{
  (_e: "update:modelValue", _value: any): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const buttonRefs = new Map<string | number | boolean, HTMLElement>();

const indicatorLeft = ref(0);
const indicatorWidth = ref(0);
const indicatorVisible = ref(false);
const isReady = ref(false);

const setButtonRef = (el: any, value: string | number | boolean) => {
  if (el) {
    buttonRefs.set(value, el as HTMLElement);
  } else {
    buttonRefs.delete(value);
  }
};

const updateIndicator = () => {
  const activeEl = buttonRefs.get(props.modelValue);
  if (activeEl && containerRef.value) {
    indicatorLeft.value = activeEl.offsetLeft;
    indicatorWidth.value = activeEl.offsetWidth;
    indicatorVisible.value = true;
  } else {
    indicatorVisible.value = false;
  }
};

const indicatorStyle = computed(() => {
  return {
    transform: `translateX(${indicatorLeft.value}px)`,
    width: `${indicatorWidth.value}px`,
    opacity: indicatorVisible.value && indicatorWidth.value > 0 ? 1 : 0,
    transition:
      isReady.value && indicatorWidth.value > 0
        ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease"
        : "none",
  };
});

const selectItem = (val: string | number | boolean) => {
  if (props.disabled) return;
  const item = props.items.find((i) => i.value === val);
  if (item?.disabled) return;
  emit("update:modelValue", val);
};

let resizeObserver: ResizeObserver | null = null;

watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      updateIndicator();
    });
  },
);

watch(
  () => props.items,
  () => {
    nextTick(() => {
      updateIndicator();
    });
  },
  { deep: true },
);

onMounted(() => {
  nextTick(() => {
    updateIndicator();
    requestAnimationFrame(() => {
      if (indicatorWidth.value > 0) {
        isReady.value = true;
      } else {
        setTimeout(() => {
          updateIndicator();
          isReady.value = true;
        }, 50);
      }
    });
  });

  if (window.ResizeObserver && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateIndicator();
      if (!isReady.value && indicatorWidth.value > 0) {
        requestAnimationFrame(() => {
          isReady.value = true;
        });
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.custom-tabs-pill {
  position: relative !important;
}

.pill-slider-indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 0;
  max-height: 48px;
  background: var(--accent-blue);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 151, 215, 0.35);
  pointer-events: none;
  z-index: 1;
}

.custom-tab-btn {
  position: relative;
  z-index: 2;
  background: transparent !important;
  box-shadow: none !important;
}

.custom-tab-btn.active {
  background: transparent !important;
  box-shadow: none !important;
}

.custom-tab-btn:hover:not(:disabled):not(.active) {
  background: var(--sidebar-hover) !important;
}
</style>
