<template>
  <div 
    ref="playerContainer"
    :class="[
      location === 'footer' 
        ? 'footer-player-bar d-flex align-center w-100 px-5 py-2' 
        : (location === 'fullscreen' 
          ? 'fullscreen-player-bar d-flex align-center px-6 py-2 w-100' 
          : 'modern-pill-player d-flex align-center px-4 py-2 mx-auto'),
      { 'light-theme': location === 'footer' && !isDark }
    ]"
  >
    <!-- 2. Área Esquerda: Informações da Música e Favorito (Estilo Spotify) -->
    <div
      v-if="showSongInfo"
      class="player-left-section d-flex align-center flex-shrink-0"
      :class="location === 'footer' ? 'mr-6' : 'mr-3'"
      :style="location === 'footer' ? 'max-width: 280px; min-width: 0;' : 'max-width: 190px; min-width: 120px;'"
    >
      <div class="player-info d-flex flex-column text-truncate mr-3" style="min-width: 0;">
        <span
          class="player-song-title text-truncate font-weight-bold"
          :class="defaultTextClass"
          :title="media.config.title"
        >
          {{ media.config.title || 'Louvor JA' }}
        </span>
        <span
          class="player-song-subtitle text-truncate cursor-pointer"
          :class="secondaryTextClass"
          :title="media.config.subtitle"
          @click="maximize"
        >
          {{ media.config.subtitle || 'Reproduzindo' }}
        </span>
      </div>

      <!-- Botão de Favorito (Apenas no Rodapé) -->
      <v-btn
        v-if="currentPlayingIdMusic && location === 'footer'"
        icon
        variant="text"
        size="x-small"
        :color="isPlayerFavorite ? '#f43f5e' : defaultTextColor"
        class="player-fav-btn flex-shrink-0"
        @click="toggleFavoritePlayer"
      >
        <v-icon size="19">
          {{ isPlayerFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ isPlayerFavorite ? t('modules.custom_collection.remove_from_favorites') : t('modules.custom_collection.add_to_favorites') }}
        </v-tooltip>
      </v-btn>
    </div>

    <!-- 4. Controles Principais de Reprodução -->
    <div class="d-flex align-center flex-shrink-0 mr-2">
      <!-- Anterior -->
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="x-small"
        class="mx-1"
        @click="prev"
      >
        <v-icon size="20">
          mdi-skip-previous
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          Anterior
        </v-tooltip>
      </v-btn>

      <!-- Play / Pause Circular Branco Sólido -->
      <button
        type="button"
        class="play-pill-btn mx-1"
        @click="play"
      >
        <v-icon
          size="20"
          color="#0b1120"
          :style="{ marginLeft: media.config.is_paused ? '2px' : '0' }"
        >
          {{ media.config.is_paused ? 'mdi-play' : 'mdi-pause' }}
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ media.config.is_paused ? 'Reproduzir' : 'Pausar' }}
        </v-tooltip>
      </button>

      <!-- Próxima -->
      <v-btn
        icon
        variant="text"
        :color="defaultTextColor"
        size="x-small"
        class="mx-1"
        @click="next"
      >
        <v-icon size="20">
          mdi-skip-next
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          Próxima
        </v-tooltip>
      </v-btn>

      <!-- Repetir -->
      <v-btn
        icon
        variant="text"
        :color="loopIconColor"
        size="x-small"
        class="mx-1"
        @click="toggleLoop"
      >
        <v-icon size="18">
          {{ loopIcon }}
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ loopTooltip }}
        </v-tooltip>
      </v-btn>

      <!-- Aleatório / Shuffle -->
      <v-btn
        icon
        variant="text"
        :color="shuffleIconColor"
        size="x-small"
        class="mx-1"
        @click="toggleShuffle"
      >
        <v-icon size="18">
          mdi-shuffle
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ shuffleTooltip }}
        </v-tooltip>
      </v-btn>
    </div>

    <!-- 5. Barra de Progresso / Linha do Tempo -->
    <div
      v-if="media.config.audio"
      class="player-timeline-wrapper d-flex align-center flex-grow-1 mx-2"
      :style="timelineWrapperStyle"
    >
      <span
        class="text-caption mr-2 font-weight-medium player-time-label"
        :class="location === 'window' || location === 'fullscreen' ? 'text-white' : secondaryTextClass"
        style="opacity: 0.75; font-size: 11px !important; min-width: 32px; text-align: right;"
      >
        {{ $datetime.shortTime(media.config.current_time) }}
      </span>

      <v-slider
        v-model="displayProgress"
        min="0"
        max="100"
        step="0.1"
        hide-details
        color="var(--accent-blue)"
        track-fill-color="var(--accent-blue)"
        thumb-size="12"
        class="timeline-slider flex-grow-1"
        @start="onSeekStart"
        @end="onSeekEnd"
      />

      <span
        class="text-caption ml-2 font-weight-medium player-time-label"
        :class="location === 'window' || location === 'fullscreen' ? 'text-white' : secondaryTextClass"
        style="opacity: 0.75; font-size: 11px !important; min-width: 32px;"
      >
        {{ $datetime.shortTime(media.config.duration) }}
      </span>
    </div>

    <!-- 6. Ações do Lado Direito -->
    <div class="d-flex align-center flex-shrink-0 ml-auto">
      <!-- Volume com Expansão no Hover (Inline) -->
      <div
        v-if="media.config.audio"
        class="player-volume-group d-flex align-center mx-1 flex-shrink-0"
        :class="{ 'is-dragging': isVolumeDragging }"
      >
        <v-btn
          :icon="volume_icon"
          variant="text"
          :color="defaultTextColor"
          size="x-small"
          class="volume-btn"
          @click="toogleVolume"
        >
          <v-icon size="19">
            {{ volume_icon }}
          </v-icon>
        </v-btn>

        <div class="volume-slider-expandable">
          <v-slider
            v-model="media.config.volume"
            min="0"
            max="100"
            step="0.1"
            hide-details
            color="var(--accent-blue)"
            track-fill-color="var(--accent-blue)"
            thumb-size="10"
            class="volume-slider"
            @start="isVolumeDragging = true"
            @end="onVolumeChangeEnd"
            @update:model-value="onVolumeInput"
          />
        </div>
      </div>
      <!-- Tipo de Áudio (Cantado / Instrumental) -->
      <v-menu v-if="location !== 'fullscreen' && (playerWidth >= 650 || location === 'footer')" :close-on-content-click="true">
        <template #activator="{ props: activatorProps }">
          <v-btn
            variant="text"
            size="x-small"
            :color="mode.color && mode.color !== 'white' ? 'var(--accent-blue)' : defaultTextColor"
            v-bind="activatorProps"
            icon
            class="mx-1"
          >
            <v-icon size="19">
              {{ mode.tray_icon }}
            </v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              Tipo de Áudio: {{ mode.title }}
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

      <!-- Expandir / Maximizar (Apenas no Rodapé) -->
      <v-btn
        v-if="location === 'footer' && !showMiniPlayer"
        variant="text"
        size="x-small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="maximize"
      >
        <v-icon size="19">
          mdi-arrow-expand-all
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.maximize') }}
        </v-tooltip>
      </v-btn>

      <!-- Abrir Fila (Apenas no Rodapé) -->
      <v-btn
        v-if="location === 'footer' && queueCount > 0 && !isQueueOpen"
        variant="text"
        size="x-small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="openQueue"
      >
        <v-icon size="19">
          mdi-playlist-play
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.queue.title') }}
        </v-tooltip>
      </v-btn>

      <!-- Salvar Fila (Apenas no Rodapé quando aberta) -->
      <v-btn
        v-if="location === 'footer' && queueCount > 0 && isQueueOpen"
        variant="text"
        size="x-small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="openSaveQueueDialog"
      >
        <v-icon size="19">
          mdi-content-save-outline
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.queue.save_as_collection') }}
        </v-tooltip>
      </v-btn>

      <!-- Fechar (Apenas no Rodapé) -->
      <v-btn
        v-if="location === 'footer'"
        variant="text"
        size="x-small"
        icon
        :color="defaultTextColor"
        class="mx-1"
        @click="close"
      >
        <v-icon size="19">
          mdi-close
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.close') }}
        </v-tooltip>
      </v-btn>

      <!-- Tela Cheia (Fullscreen e Janela) -->
      <v-btn
        v-if="location === 'fullscreen'"
        variant="text"
        size="x-small"
        icon
        color="white"
        class="mx-1"
        @click="fullscreen(false)"
      >
        <v-icon size="19">
          mdi-fullscreen-exit
        </v-icon>
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
        size="x-small"
        icon
        color="white"
        class="mx-1"
        @click="fullscreen()"
      >
        <v-icon size="19">
          mdi-fullscreen
        </v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.media.controls.fullscreen') }}
        </v-tooltip>
      </v-btn>

      <!-- Lista de Slides (Apenas na Janela) -->
      <v-btn 
        v-if="location === 'window'"
        variant="text" 
        size="x-small" 
        icon 
        :color="isPlaylistOpen ? 'var(--accent-blue)' : 'white'" 
        class="ml-2" 
        @click="togglePlaylist" 
      >
        <v-icon size="19">
          mdi-format-list-bulleted
        </v-icon>
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
import { isFavoriteSong, toggleFavoriteSong } from "@/helpers/services/Favorites";

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

const showSongInfo = computed(() => {
  return playerWidth.value >= 1000;
});

const timelineWrapperStyle = computed(() => {
  if (props.location === "footer") {
    return "min-width: 100px; max-width: 100%; flex-shrink: 1;";
  }
  if (playerWidth.value < 1000) {
    return "min-width: 160px; max-width: 320px;";
  }
  return "min-width: 240px; max-width: 480px;";
});

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
const isQueueOpen = computed(() => appdata.get("modules.media.show_queue") === true);
const queueCount = computed(() => (appdata.get("modules.media.queue")?.items || []).length);

const openQueue = () => {
  appdata.set("modules.media.show_queue", true);
};

const isSeeking = ref(false);
const seekProgress = ref(0);

const displayProgress = computed({
  get: () => (isSeeking.value ? seekProgress.value : (media.value?.config?.progress || 0)),
  set: (val: number) => {
    seekProgress.value = val;
  },
});

const onSeekStart = () => {
  isSeeking.value = true;
  seekProgress.value = media.value?.config?.progress || 0;
};

const onSeekEnd = (val?: number) => {
  const targetVal = typeof val === "number" ? val : displayProgress.value;
  isSeeking.value = false;
  const dur = media.value?.config?.duration || 0;
  const time = (dur * targetVal) / 100;
  mediaHelper.goToTime(time);
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

const isShuffle = computed(() => {
  const current = appdata.get("modules.media.config.shuffle");
  if (typeof current === "boolean") return current;
  return userdata.get("modules.media.config.shuffle") === true;
});

const shuffleIconColor = computed(() => {
  if (!isShuffle.value) return secondaryTextColor.value;
  return "var(--accent-blue)";
});

const shuffleTooltip = computed(() => {
  return isShuffle.value ? t("modules.media.controls.shuffle_disable") : t("modules.media.controls.shuffle_enable");
});

const toggleShuffle = () => {
  mediaHelper.toggleShuffle();
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

const prev = () => {
  const lastSlide = media.value?.config?.last_slide || 0;
  const slideIndex = media.value?.config?.slide_index || 0;
  if (queueCount.value > 1 && (lastSlide <= 1 || slideIndex <= 0)) {
    mediaHelper.playPrev();
  } else {
    mediaHelper.prevSlide();
  }
};

const next = () => {
  const lastSlide = media.value?.config?.last_slide || 0;
  const slideIndex = media.value?.config?.slide_index || 0;
  if (queueCount.value > 1 && (lastSlide <= 1 || slideIndex >= lastSlide - 1)) {
    mediaHelper.playNext();
  } else {
    mediaHelper.nextSlide();
  }
};
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
const fullscreen = (value = true) => mediaHelper.fullscreen(value);
const toogleVolume = () => mediaHelper.toogleVolume();
const isVolumeDragging = ref(false);

const onVolumeInput = (val: number) => {
  const clamped = Math.max(0, Math.min(100, Math.round(val)));
  if (media.value?.config) {
    media.value.config.volume = clamped;
  }
  const audio = mediaHelper.getElement();
  if (audio) audio.volume = clamped / 100;
  const audioA = document.getElementById("__audio_a") as HTMLAudioElement | null;
  const audioB = document.getElementById("__audio_b") as HTMLAudioElement | null;
  if (audioA) audioA.volume = clamped / 100;
  if (audioB) audioB.volume = clamped / 100;
};

const onVolumeChangeEnd = (val?: number) => {
  isVolumeDragging.value = false;
  const finalVal = typeof val === "number" ? val : (media.value?.config?.volume ?? 100);
  mediaHelper.setVolume(finalVal);
};
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

const currentPlayingIdMusic = computed(() => appdata.get("modules.media.id_music"));
const isPlayerFavorite = computed(() => {
  const idMusic = currentPlayingIdMusic.value;
  if (!idMusic) return false;
  userdata.get("modules.custom_collection.list");
  return isFavoriteSong(idMusic);
});

const toggleFavoritePlayer = () => {
  const idMusic = currentPlayingIdMusic.value;
  if (!idMusic) return;
  const added = toggleFavoriteSong(idMusic);
  $snackbar.show({
    text: added
      ? (t("modules.custom_collection.added_to_favorites") || "Adicionado aos favoritos!")
      : (t("modules.custom_collection.removed_from_favorites") || "Removido dos favoritos"),
    color: added ? "success" : "info",
    timeout: 2000,
  });
};

const updatePlayerWidth = () => {
  if (props.location === "window") {
    const vCard = playerContainer.value?.closest(".v-card");
    if (vCard) {
      playerWidth.value = vCard.clientWidth;
      return;
    }
  } else if (props.location === "fullscreen") {
    playerWidth.value = window.innerWidth;
    return;
  }
  if (playerContainer.value) {
    playerWidth.value = playerContainer.value.clientWidth;
  }
};

onMounted(() => {
  updatePlayerWidth();
  window.addEventListener("resize", updatePlayerWidth);

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
  window.removeEventListener("resize", updatePlayerWidth);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style lang="scss">
.modern-pill-player {
  background: rgba(14, 23, 42, 0.72) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 9999px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  min-height: 60px;
  height: 60px;
  width: auto !important;
  display: inline-flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
  transition: all 0.25s ease;
}

.fullscreen-player-bar {
  background: rgba(10, 16, 26, 0.88) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 -8px 36px rgba(0, 0, 0, 0.6);
  min-height: 64px;
  width: 100% !important;
  display: flex !important;
  align-items: center;
  position: relative;
  overflow: visible;
}

.footer-player-bar {
  background: var(--card-bg) !important;
  border-top: 1px solid var(--border-color);
  width: 100%;
  min-height: 64px;
  overflow: hidden;
  box-sizing: border-box;
  transition: background-color 0.25s ease;

  &.light-theme {
    background: #ffffff !important;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
}

.player-left-section {
  min-width: 0;

  .player-info {
    min-width: 0;
  }
}

.player-timeline-wrapper {
  min-width: 0;
}

.player-song-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.player-song-subtitle {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
}

.play-pill-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
  flex-shrink: 0;

  .v-icon {
    color: #0b1120 !important;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  }
  &:active {
    transform: scale(0.96);
  }
}

.timeline-slider {
  .v-slider-thumb,
  .v-slider-track__fill {
    transition: none !important;
  }

  .v-slider-track__background {
    opacity: 1 !important;
    background-color: rgba(255, 255, 255, 0.18) !important;
    height: 5px !important;
    border-radius: 9999px !important;
  }
  .v-slider-track__fill {
    background-color: var(--accent-blue, #0ea5e9) !important;
    height: 5px !important;
    border-radius: 9999px !important;
  }
  .v-slider-thumb__surface {
    background-color: #ffffff !important;
    box-shadow: 0 0 10px rgba(14, 165, 233, 0.8), 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  }
}

.player-volume-group {
  display: flex;
  align-items: center;
  position: relative;

  .volume-slider-expandable {
    width: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    margin-left: 0;
    padding: 0;
    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.22s ease,
                margin 0.25s ease;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  &:hover .volume-slider-expandable,
  &.is-dragging .volume-slider-expandable {
    width: 100px;
    max-width: 100px;
    opacity: 1;
    margin-left: 2px;
    margin-right: 4px;
    padding: 0 4px;
    pointer-events: auto;
  }

  .volume-slider {
    width: 80px;
    min-width: 80px;
    margin-inline: 6px !important;

    .v-slider-thumb,
    .v-slider-track__fill {
      transition: none !important;
    }

    .v-slider-track__background {
      opacity: 1 !important;
      background-color: rgba(255, 255, 255, 0.18) !important;
      height: 4px !important;
      border-radius: 9999px !important;
    }
    .v-slider-track__fill {
      background-color: var(--accent-blue, #0ea5e9) !important;
      height: 4px !important;
      border-radius: 9999px !important;
    }
    .v-slider-thumb__surface {
      background-color: #ffffff !important;
      box-shadow: 0 0 8px rgba(14, 165, 233, 0.8), 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    }
  }
}

.light-theme {
  .timeline-slider,
  .volume-slider {
    .v-slider-track__background {
      background-color: rgba(0, 0, 0, 0.12) !important;
    }
  }
}

.modern-glass-menu {
  background: rgba(15, 23, 42, 0.78) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.volume-btn, .v-btn {
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.8;
    background: rgba(255, 255, 255, 0.05);
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
