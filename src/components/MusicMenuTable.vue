<template>
  <div class="d-flex flex-nowrap align-center">
    <v-btn
      v-for="(btn, key) in buttons"
      :key="key"
      :disabled="btn.disabled ? btn.disabled : false"
      variant="text"
      :color="color ? color : $theme.primary()"
      density="compact"
      class="mx-1"
      icon
      @click.stop="btn.click"
    >
      <v-icon>{{ btn.icon }}</v-icon>
      <v-tooltip
        activator="parent"
        location="top"
        open-delay="300"
        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
      >
        {{ btn.tooltip }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MusicMenuTableComponent",
  props: {
    idMusic: { type: Number, required: true },
    hasInstrumentalMusic: { type: [Boolean, Number], default: false },
    color: { type: String, default: "" },
  },
  computed: {
    buttons(): Array<{ tooltip: string; disabled: boolean; icon: string; click: () => void }> {
      return [
        {
          tooltip: "Cantado",
          disabled: false,
          icon: "mdi-play-circle",
          click: () =>
            this.$media.open({ id_music: this.idMusic, mode: "audio" }),
        },
        {
          tooltip: "Playback",
          disabled: !this.hasInstrumentalMusic,
          icon: "mdi-play-circle-outline",
          click: () =>
            this.$media.open({ id_music: this.idMusic, mode: "instrumental" }),
        },
        {
          tooltip: "Sem Áudio",
          disabled: false,
          icon: "mdi-monitor",
          click: () => this.$media.open(this.idMusic as any),
        },
        {
          tooltip: "Letra",
          disabled: false,
          icon: "mdi-text-box-outline",
          click: () => this.$media.openLyric(this.idMusic),
        },
      ];
    },
  },
});
</script>
