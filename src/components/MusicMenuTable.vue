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
      @click.stop="btn.click"
      icon
    >
      <v-icon>{{ btn.icon }}</v-icon>
      <v-tooltip activator="parent" location="top" open-delay="300">
        {{ btn.tooltip }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "MusicMenuTableComponent",
  props: {
    id_music: Number,
    has_instrumental_music: [Boolean, Number],
    color: String,
  },
  computed: {
    buttons() {
      return [
        {
          tooltip: "Cantado",
          disabled: false,
          icon: "mdi-play-circle",
          click: () =>
            this.$media.open({ id_music: this.id_music, mode: "audio" }),
        },
        {
          tooltip: "Playback",
          disabled: !this.has_instrumental_music,
          icon: "mdi-play-circle-outline",
          click: () =>
            this.$media.open({ id_music: this.id_music, mode: "instrumental" }),
        },
        {
          tooltip: "Sem Áudio",
          disabled: false,
          icon: "mdi-monitor",
          click: () => this.$media.open(this.id_music),
        },
        {
          tooltip: "Letra",
          disabled: false,
          icon: "mdi-text-box-outline",
          click: () => this.$media.openLyric(this.id_music),
        },
      ];
    },
  },
};
</script>
