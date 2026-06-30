<template>
  <div
    class="slide-projector fill-height d-flex align-center justify-center"
    :style="projectorStyle"
  >
    <div class="projector-content pa-8" :style="textStyle">
      <div class="projector-title mb-4">{{ slideData.title }}</div>
      <div class="projector-main">{{ slideData.mainText }}</div>
      <div v-if="slideData.auxText" class="projector-aux mt-3">{{ slideData.auxText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const slideData = ref({
  title: "",
  mainText: "",
  auxText: "",
  bgColor: "#000",
  bgImage: "",
  fontSize: 48,
  textColor: "#fff",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
  bold: false,
  italic: false,
});

const interval = ref(null);
const currentSlideIndex = ref(0);

const projectorStyle = computed(() => {
  const d = slideData.value;
  const bg = d.bgImage
    ? `url(${d.bgImage}) center/cover no-repeat #000`
    : d.bgColor || "#000";
  return {
    background: bg,
    backgroundSize: d.bgImage ? "cover" : undefined,
    backgroundPosition: "center",
    width: "100vw",
    height: "100vh",
  };
});

const textStyle = computed(() => {
  const d = slideData.value;
  return {
    color: d.textColor || "#fff",
    fontSize: `${d.fontSize || 48}px`,
    textAlign: d.textAlign || "center",
    fontWeight: d.bold ? "bold" : "normal",
    fontStyle: d.italic ? "italic" : "normal",
    fontFamily: d.fontFamily || "Arial, sans-serif",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    maxWidth: "90%",
  };
});

function loadData() {
  const data = window.$appdata.get("slide_editor.data");
  if (data) {
    slideData.value = { ...slideData.value, ...data };
  }
}

onMounted(() => {
  loadData();
  window.addEventListener("message", (event) => {
    if (event.data?.param === "slide_editor.data") {
      loadData();
    }
  });
});
</script>

<style scoped>
.slide-projector {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.projector-content {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}
.projector-title {
  font-size: 1.3em;
  opacity: 0.8;
}
.projector-main {
  line-height: 1.4;
}
.projector-aux {
  font-size: 0.7em;
  opacity: 0.6;
}
</style>