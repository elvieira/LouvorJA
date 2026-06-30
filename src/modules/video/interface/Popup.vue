<template>
  <div class="video-projector fill-height overflow-hidden" style="background:#000;width:100vw;height:100vh;">
    <video
      ref="videoEl"
      class="projector-video"
      :src="videoUrl"
      :loop="loop"
      :muted="muted"
      autoplay
      style="width:100%;height:100%;object-fit:contain;"
      @error="onError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const videoEl = ref(null);
const videoUrl = ref("");
const loop = ref(false);
const muted = ref(false);
const volume = ref(100);

onMounted(() => {
  videoUrl.value = window.$appdata.get("modules.video.url") || "";
  loop.value = window.$appdata.get("modules.video.loop") || false;
  muted.value = window.$appdata.get("modules.video.muted") || false;
  volume.value = window.$appdata.get("modules.video.volume") || 100;

  setTimeout(() => {
    if (videoEl.value) {
      videoEl.value.volume = volume.value / 100;
      videoEl.value.play();
    }
  }, 200);
});

function onError() {
  console.error("Projection video error");
}
</script>