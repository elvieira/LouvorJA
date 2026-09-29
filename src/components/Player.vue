<template>
  <div 
    ref="playerContainer"
    :class="location === 'footer' ? 'footer-player-bar d-flex align-center w-100 px-4 py-2' : (location === 'fullscreen' ? 'fullscreen-player-bar d-flex align-center px-6 py-2 w-100' : 'modern-pill-player d-flex align-center px-6 py-2 mx-auto')"
  >
    <div v-if="playerWidth >= 880" class="player-info d-flex flex-column mr-6" :style="location === 'footer' ? 'max-width: 320px; min-width: 200px;' : 'max-width: 280px; min-width: 150px;'">
      <span
        class="text-subtitle-2 font-weight-bold text-truncate"
        :class="defaultTextClass"
        style="line-height: 1.2;"
        :title="media.config.title"
      >
        {{ media.config.title }}
      </span>
      <span
        class="text-caption text-truncate"
        :class="secondaryTextClass"
        style="line-height: 1.2;"
        :title="media.config.subtitle"
      >
        {{ media.config.subtitle }}
      </span>
    </div>

    <div class="d-flex align-center mr-6">
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="small"
        class="mx-1"
        @click="prev"
      >
        <v-icon>mdi-skip-previous</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          Anterior
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="large"
        class="mx-1 play-btn"
        @click="play"
      >
        <v-icon>{{ media.config.is_paused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ media.config.is_paused ? 'Reproduzir' : 'Pausar' }}
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="small"
        class="mx-1"
        @click="next"
      >
        <v-icon>mdi-skip-next</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          Próxima
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        variant="text"
        :color="loopIconColor"
        size="small"
        class="mx-1"
        @click="toggleLoop"
      >
        <v-icon>{{ loopIcon }}</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ loopTooltip }}
        </v-tooltip>
      </v-btn>
    </div>

    <div v-if="media.config.audio" class="player-timeline-wrapper d-flex align-center flex-grow-1 mr-6" style="min-width: 150px;">
      <span class="text-caption mr-3 font-weight-medium" :class="location === 'window' || location === 'fullscreen' ? 'text-white' : secondaryTextClass" style="opacity: 0.8;">{{ $datetime.shortTime(media.config.current_time) }}</span>
      <v-progress-linear
        v-model="media.config.progress"
        clickable
        :indeterminate="media.loading"
        :height="4"
        :stream="!media.loading"
        :buffer-value="media.config.buffered"
        :color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
        :bg-opacity="0.3"
        rounded
        class="flex-grow-1 timeline-slider"
        @click="changeProgress"
      />
      <span class="text-caption ml-3 font-weight-medium" :class="location === 'window' || location === 'fullscreen' ? 'text-white' : secondaryTextClass" style="opacity: 0.8;">{{ $datetime.shortTime(media.config.duration) }}</span>
    </div>

    <div v-if="media.config.audio" class="d-flex align-center">
      <v-menu
        location="top center"
        :close-on-content-click="false"
        open-on-hover
        :open-delay="50"
        :attach="location === 'fullscreen'"
      >
        <template #activator="{ props: activatorProps }">
          <v-btn
            :icon="volume_icon"
            variant="text"
            :color="defaultTextColor"
            size="small"
            v-bind="activatorProps"
            class="mx-1 volume-btn"
            @click="toogleVolume"
          />
        </template>
        <v-card 
          class="py-2 px-4 rounded-lg d-flex align-center" 
          :class="location === 'footer' ? 'elevation-3' : 'modern-glass-menu elevation-0'"
          :color="location === 'footer' && !isDark ? '#f4f5f7' : ''" 
          :theme="location === 'footer' && !isDark ? 'light' : 'dark'" 
          min-width="130" 
          height="40"
          style="overflow: hidden;"
        >
          <v-slider
            v-model="media.config.volume"
            :color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
            track-color="grey"
            hide-details
            thumb-size="12"
            step="1"
            min="0"
            max="100"
            class="ma-0 pa-0 w-100"
            @update:model-value="changeVolume"
          />
        </v-card>
      </v-menu>
    </div>

    <div class="d-flex align-center">
      <v-menu v-if="location !== 'fullscreen' && playerWidth >= 880" :close-on-content-click="true">
        <template #activator="{ props: activatorProps }">
          <v-btn
            variant="text"
            size="small"
            :color="mode.color && mode.color !== 'white' ? mode.color : defaultTextColor"
            v-bind="activatorProps"
            icon
            class="mx-1"
          >
            <v-icon>{{ mode.tray_icon }}</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              Tipo de Áudio
            </v-tooltip>
          </v-btn>
        </template>
        <v-card
          :class="location === 'footer' ? 'elevation-3' : 'modern-glass-menu elevation-0'"
          :color="location === 'footer' && !isDark ? '#f4f5f7' : ''" 
          :theme="location === 'footer' && !isDark ? 'light' : 'dark'" 
          rounded="lg"
          style="overflow: hidden;"
        >
          <v-list
            class="py-2"
            :bg-color="location === 'footer' ? (isDark ? 'var(--card-bg)' : 'white') : 'transparent'"
          >
            <template v-for="(menuMode, key) in menu_modes" :key="key">
              <v-divider v-if="menuMode.title === '-'" class="my-2 border-opacity-25" />
              <v-list-item
                v-else
                :active="menuMode.active"
                :disabled="menuMode.disabled"
                :active-color="location === 'footer' ? 'var(--accent-blue)' : 'white'"
                class="mx-2 rounded-lg mb-1"
                style="min-height: 40px;"
                @click="menuMode.click"
              >
                <div class="d-flex align-center">
                  <v-icon :icon="menuMode.icon" size="small" class="mr-3" />
                  <span class="text-body-2 font-weight-medium">{{ menuMode.title }}</span>
                </div>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-menu>




      <v-btn
        v-if="location === 'footer' && !showMiniPlayer"
        variant="text"
        size="small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="maximize()"
      >
        <v-icon>mdi-arrow-expand-all</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.maximize') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        v-if="location === 'footer' && queueCount > 0 && !isQueueOpen"
        variant="text"
        size="small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="openQueue"
      >
        <v-icon>mdi-playlist-play</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.queue.title') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        v-if="location === 'footer' && queueCount > 0 && isQueueOpen"
        variant="text"
        size="small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="openSaveQueueDialog"
      >
        <v-icon>mdi-content-save-outline</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.queue.save_as_collection') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        v-if="location === 'footer'"
        variant="text"
        size="small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="close()"
      >
        <v-icon>mdi-close</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.close') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        v-if="location === 'fullscreen'"
        variant="text"
        size="small"
        icon
        color="white"
        class="mx-1"
        @click="fullscreen(false)"
      >
        <v-icon>mdi-fullscreen-exit</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.exit_fullscreen') }}
        </v-tooltip>
      </v-btn>
      <v-btn
        v-else-if="location === 'window'"
        variant="text"
        size="small"
        icon
        color="white"
        class="mx-1"
        @click="fullscreen()"
      >
        <v-icon>mdi-fullscreen</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.fullscreen') }}
        </v-tooltip>
      </v-btn>

      <v-btn 
        v-if="location === 'window'"
        variant="text" 
        size="small" 
        icon 
        :color="isPlaylistOpen ? 'var(--accent-blue)' : 'white'" 
        class="ml-2" 
        @click="togglePlaylist" 
      >
        <v-icon>mdi-format-list-bulleted</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.general.slide_list') }}
        </v-tooltip>
      </v-btn>
    </div>
  </div>
  
  <v-expand-transition>
    <QueuePanel v-if="location === 'footer'" />
  </v-expand-transition>

  <v-dialog v-model="showSaveQueueDialog" max-width="440" persistent>
    <v-card
      class="rounded-xl pa-2"
      :color="isDark ? 'var(--card-bg)' : '#ffffff'"
      :theme="isDark ? 'dark' : 'light'"
    >
      <v-card-title class="font-weight-bold">
        {{ $t('modules.media.queue.save_as_collection') }}
      </v-card-title>
      <v-card-text>
        <div class="d-flex justify-center mb-4">
          <div class="dialog-cover-card">
            <div
              class="dialog-cover-card-image cursor-pointer"
              @click="coverFileInput?.click()"
            >
              <img
                v-if="saveQueueCover"
                :src="saveQueueCover"
                class="dialog-cover-card-img"
              />
              <v-icon v-else size="30" color="var(--accent-blue)">
                mdi-image-plus
              </v-icon>
              <div v-if="saveQueueCover" class="dialog-cover-card-hover">
                <v-icon size="22" color="white">
                  mdi-pencil
                </v-icon>
              </div>
              <v-btn
                v-if="saveQueueCover"
                icon
                size="x-small"
                variant="flat"
                color="error"
                class="dialog-cover-remove-btn"
                @click.stop="saveQueueCover = null"
              >
                <v-icon size="14">
                  mdi-close
                </v-icon>
              </v-btn>
            </div>
          </div>
          <input
            ref="coverFileInput"
            type="file"
            accept="image/*"
            style="display: none;"
            @change="onQueueCoverSelect"
          />
        </div>

        <div class="mb-4">
          <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
            {{ $t('modules.custom_collection.new_collection_name') }}
          </div>
          <v-text-field
            v-model="saveQueueName"
            :placeholder="$t('modules.custom_collection.new_collection_placeholder')"
            variant="outlined"
            color="primary"
            rounded="lg"
            density="compact"
            hide-details
            class="modern-input-compact"
            autofocus
            @keydown.enter="saveQueueAsCollection"
          />
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <div class="d-flex" style="gap: 12px;">
          <v-btn
            variant="tonal"
            :color="isDark ? 'white' : 'grey-darken-2'"
            class="rounded-lg text-none px-6 font-weight-bold"
            @click="showSaveQueueDialog = false"
          >
            {{ $t('alert.cancel') }}
          </v-btn>
          <v-btn
            variant="flat"
            color="primary"
            class="rounded-lg text-none px-6 font-weight-bold"
            :disabled="!saveQueueName.trim()"
            @click="saveQueueAsCollection"
          >
            {{ $t('modules.custom_collection.save') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useTheme } from "vuetify";
import { useMedia, useAppData, useModules, useUserData } from "@/composables/useHelpers";
import { useI18n } from "vue-i18n";
import QueuePanel from "@/components/QueuePanel.vue";
import $snackbar from "@/helpers/ui/Snackbar";

defineOptions({ name: "MediaPlayer" });

const props = withDefaults(defineProps<{
  location?: string;
}>(), {
  location: "window",
});

const theme = useTheme();
const mediaHelper = useMedia();
const appdata = useAppData();
const modules = useModules();
const userdata = useUserData();
// Note: datetime is used in the template via $datetime
const { t } = useI18n();

const playerWidth = ref(0);
const playerContainer = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

const isDark = computed(() => theme.name.value === "dark");

const defaultTextColor = computed(() => {
  if (props.location !== "footer") return "white";
  return isDark.value ? "white" : "black";
});

const defaultTextClass = computed(() => {
  if (props.location !== "footer") return "text-white";
  return isDark.value ? "text-white" : "text-black";
});

const secondaryTextClass = computed(() => {
  if (props.location !== "footer") return "text-grey";
  return isDark.value ? "text-grey" : "text-grey-darken-1";
});

const secondaryTextColor = computed(() => {
  if (props.location !== "footer") return "grey";
  return isDark.value ? "grey" : "grey-darken-1";
});

const media = computed(() => modules.get("media"));

const showMiniPlayer = computed(() => appdata.get("modules.media.show_mini_player") !== false);

const has_instrumental_music = computed(() => !!media.value.data.url_instrumental_music);

const isPlaylistOpen = computed(() => appdata.get("modules.media.show_playlist") || false);
const queueCount = computed(() => (appdata.get("modules.media.queue")?.items || []).length);
const isQueueOpen = computed(() => appdata.get("modules.media.show_queue") === true);

const openQueue = () => {
  appdata.set("modules.media.show_queue", true);
};

const loopMode = computed(() => appdata.get("modules.media.config.loop") || "none");

const loopIcon = computed(() => {
  if (loopMode.value === "track" || loopMode.value === true) return "mdi-repeat-once";
  return "mdi-repeat";
});

const loopIconColor = computed(() => {
  if (loopMode.value === "none" || !loopMode.value) return secondaryTextColor.value;
  return "var(--accent-blue)";
});

const loopTooltip = computed(() => {
  if (loopMode.value === "track" || loopMode.value === true) return "Repetir Música";
  if (loopMode.value === "queue") return "Repetir Fila";
  return "Repetição Desativada";
});

const toggleLoop = () => {
  let nextMode = "none";
  const current = loopMode.value;
  
  if (current === "none" || !current) {
    nextMode = queueCount.value > 1 ? "queue" : "track";
  } else if (current === "queue") {
    nextMode = "track";
  } else {
    nextMode = "none";
  }

  appdata.set("modules.media.config.loop", nextMode);
};

const menu_modes = computed(() => [
  {
    mode: "audio",
    title: t("modules.media.general.sung"),
    color: "info",
    active: media.value.config.mode === "audio",
    icon: "mdi-play-circle",
    tray_icon: "mdi-account-voice",
    click: () => openMedia({
      id_music: media.value.id_music,
      mode: "audio",
      minimized: media.value.minimized,
    }),
  },
  {
    mode: "instrumental",
    title: t("modules.media.general.instrumental"),
    color: "success",
    active: media.value.config.mode === "instrumental",
    disabled: !has_instrumental_music.value,
    icon: "mdi-play-circle-outline",
    tray_icon: "mdi-music-note",
    click: () => openMedia({
      id_music: media.value.id_music,
      mode: "instrumental",
      minimized: media.value.minimized,
    }),
  },
  {
    mode: "no_audio",
    title: t("modules.media.general.no_audio"),
    color: "error",
    active: media.value.config.mode === "no_audio",
    icon: "mdi-monitor",
    tray_icon: "mdi-music-off",
    click: () => openMedia({
      id_music: media.value.id_music,
      minimized: media.value.minimized,
    }),
  },
  { title: "-" },
  {
    title: t("modules.media.general.lyric"),
    color: "error",
    icon: "mdi-text-box-outline",
    click: () => openLyric(),
  },
]);

const mode = computed(() => menu_modes.value.filter((item: any) => item.mode === media.value.config.mode)[0]);

const volume_icon = computed(() => {
  if (media.value.config.volume <= 0) return "mdi-volume-mute";
  if (media.value.config.volume <= 20) return "mdi-volume-low";
  if (media.value.config.volume <= 70) return "mdi-volume-medium";
  return "mdi-volume-high";
});

const play = () => {
  if (media.value.config.is_paused) {
    mediaHelper.play();
  } else {
    mediaHelper.pause();
  }
};

const prev = () => mediaHelper.prevSlide();
const next = () => mediaHelper.nextSlide();
const openMedia = (data: any) => mediaHelper.open(data);
const openLyric = () => mediaHelper.openLyric();
const maximize = () => mediaHelper.maximize();
const close = () => {
  if (appdata.get("modules.media.show_queue")) {
    appdata.set("modules.media.show_queue", false);
    return;
  }
  mediaHelper.close();
};
const changeProgress = () => {
  const time = (media.value.config.duration * media.value.config.progress) / 100;
  mediaHelper.goToTime(time);
};
const fullscreen = (value = true) => mediaHelper.fullscreen(value);
const toogleVolume = () => mediaHelper.toogleVolume();
const changeVolume = () => mediaHelper.setVolume(media.value.config.volume);
const togglePlaylist = () => {
  const currentState = appdata.get("modules.media.show_playlist") || false;
  appdata.set("modules.media.show_playlist", !currentState);
};

const showSaveQueueDialog = ref(false);
const saveQueueName = ref("");
const saveQueueCover = ref<string | null>(null);
const coverFileInput = ref<HTMLInputElement | null>(null);

const onQueueCoverSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    saveQueueCover.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  input.value = "";
};

const openSaveQueueDialog = () => {
  saveQueueName.value = "";
  saveQueueCover.value = null;
  showSaveQueueDialog.value = true;
};

const saveQueueAsCollection = () => {
  const name = saveQueueName.value.trim();
  if (!name) return;

  const items = appdata.get("modules.media.queue")?.items || [];
  const songs = items
    .filter((item: any) => !!item.id_music)
    .map((item: any) => ({
      id: crypto.randomUUID(),
      type: "internal",
      id_music: item.id_music,
    }));

  const collections = userdata.get("modules.custom_collection.list") || [];
  collections.push({
    id: crypto.randomUUID(),
    name,
    coverImage: saveQueueCover.value || null,
    songs,
  });
  userdata.set("modules.custom_collection.list", collections);

  showSaveQueueDialog.value = false;
  $snackbar.show({ text: t("modules.media.queue.collection_saved", { name }), color: "success" });
};

onMounted(() => {
  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      playerWidth.value = entry.contentRect.width;
    }
  });
  
  let target: any = playerContainer.value;
  if (target) {
    if (props.location === "window") {
      const vCard = target.closest(".v-card");
      if (vCard) {
        target = vCard;
      } else {
        target = target.closest(".floating-pill-container")?.parentNode || target.parentNode;
      }
    } else if (props.location === "fullscreen") {
      target = document.body;
    }
    if (resizeObserver) resizeObserver.observe(target);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style lang="scss">
.modern-pill-player {
  background: rgba(15, 15, 20, 0.45) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 60px;
  width: auto !important;
  display: inline-flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
}

.fullscreen-player-bar {
  background: rgba(15, 15, 20, 0.8) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.5);
  min-height: 64px;
  width: 100% !important;
  display: flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
}

.modern-glass-menu {
  background: rgba(15, 15, 20, 0.45) !important;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.footer-player-bar {
  background: var(--card-bg) !important;
  border-top: 1px solid var(--border-color);
  width: 100%;
  min-height: 64px;
}

.discreet-badge .v-badge__badge {
  background-color: rgba(150, 150, 150, 0.25) !important;
  color: inherit !important;
  font-size: 9px !important;
  min-width: 16px !important;
  height: 16px !important;
  padding: 0 4px !important;
}

.play-btn {
  transform: scale(1.1);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    transform: scale(1.25);
  }
  &:active {
    transform: scale(1);
  }
}

.timeline-slider {
  transition: height 0.2s ease;
  cursor: pointer;
  
  &:hover {
    height: 6px !important;
  }
}

.volume-btn, .v-btn {
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.8;
    background: rgba(255,255,255,0.05);
  }
}

.dialog-cover-card {
  width: 168px;

  .dialog-cover-card-image {
    position: relative;
    width: 168px;
    height: 168px;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(150, 150, 150, 0.05);
    border: 2px dashed var(--border-color, rgba(255, 255, 255, 0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--accent-blue);

      .dialog-cover-card-hover {
        opacity: 1;
      }
    }
  }

  .dialog-cover-card-img {
    width: 168px;
    height: 168px;
    object-fit: cover;
    display: block;
  }

  .dialog-cover-card-hover {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .dialog-cover-remove-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 2;
  }
}
</style>
