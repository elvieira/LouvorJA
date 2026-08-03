<template>
  <div
    class="position-absolute w-100 h-100 top-0 left-0"
    style="z-index: 9999"
    @mousemove="mouseMove"
  >
    <transition name="slide-up">
      <div
        v-if="visible"
        class="position-absolute w-100 bottom-0"
        @mouseenter="mouseEnter"
        @mouseleave="mouseLeave"
      >
        <LPlayer location="fullscreen" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import LPlayer from "@/components/Player.vue";

const visible = ref(false);
const start_timer = ref(true);
const timeout = ref<ReturnType<typeof setTimeout> | null>(null);

const startHideTimer = () => {
  if (timeout.value) clearTimeout(timeout.value);
  timeout.value = setTimeout(() => {
    visible.value = false;
  }, 1000);
};

const showChild = () => {
  visible.value = true;
  if (timeout.value) clearTimeout(timeout.value);
};

const mouseMove = () => {
  if (!start_timer.value) {
    return;
  }
  showChild();
  startHideTimer();
};

const mouseEnter = () => {
  start_timer.value = false;
  if (timeout.value) clearTimeout(timeout.value);
};

const mouseLeave = () => {
  start_timer.value = true;
  startHideTimer();
};

onBeforeUnmount(() => {
  if (timeout.value) clearTimeout(timeout.value);
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
