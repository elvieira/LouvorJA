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

    <!-- Adicionar à Fila -->
    <v-menu
      v-if="hasInstrumentalMusic"
      location="top center"
      open-on-hover
      :close-on-content-click="true"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          variant="text"
          :color="color ? color : $theme.primary()"
          density="compact"
          class="mx-1"
          icon
          @click.stop
        >
          <v-icon>
            mdi-playlist-plus
          </v-icon>
        </v-btn>
      </template>
      <v-card class="modern-glass-menu elevation-0" :theme="isDark ? 'dark' : 'light'" rounded="lg">
        <div class="text-caption text-center pt-2 pb-0 font-weight-bold opacity-70">
          {{ $t('modules.media.queue.add_to_queue') }}
        </div>
        <v-list class="py-1" bg-color="transparent" density="compact">
          <v-list-item class="mx-1 rounded" style="min-height: 32px;" @click.stop="addToQueue('audio')">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">
                mdi-play-circle
              </v-icon>
              <span class="text-caption font-weight-medium">{{ $t('modules.media.general.sung') }}</span>
            </div>
          </v-list-item>
          <v-list-item class="mx-1 rounded" style="min-height: 32px;" @click.stop="addToQueue('instrumental')">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">
                mdi-play-circle-outline
              </v-icon>
              <span class="text-caption font-weight-medium">{{ $t('modules.media.general.instrumental') }}</span>
            </div>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Se não tem instrumental, adiciona cantado direto -->
    <v-btn
      v-else
      variant="text"
      :color="color ? color : $theme.primary()"
      density="compact"
      class="mx-1"
      icon
      @click.stop="addToQueue('audio')"
    >
      <v-icon>mdi-playlist-plus</v-icon>
      <v-tooltip
        activator="parent"
        location="top"
        open-delay="300"
        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
      >
        {{ $t('modules.media.queue.add_to_queue') }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import { useMedia } from "@/composables/useHelpers";

const props = withDefaults(defineProps<{
  idMusic: number;
  hasInstrumentalMusic?: boolean | number;
  color?: string;
}>(), {
  hasInstrumentalMusic: false,
  color: "",
});

const theme = useTheme();
const media = useMedia();

const isDark = computed(() => theme.name.value === "dark");

const addToQueue = (mode: string) => {
  media.addToQueue({ id_music: props.idMusic, mode });
};

const buttons = computed(() => {
  return [
    {
      tooltip: "Cantado",
      disabled: false,
      icon: "mdi-play-circle",
      click: () => media.open({ id_music: props.idMusic, mode: "audio" }),
    },
    {
      tooltip: "Playback",
      disabled: !props.hasInstrumentalMusic,
      icon: "mdi-play-circle-outline",
      click: () => media.open({ id_music: props.idMusic, mode: "instrumental" }),
    },
    {
      tooltip: "Sem Áudio",
      disabled: false,
      icon: "mdi-monitor",
      click: () => media.open(props.idMusic as any),
    },
    {
      tooltip: "Letra",
      disabled: false,
      icon: "mdi-text-box-outline",
      click: () => media.openLyric(props.idMusic),
    },
  ];
});
</script>
