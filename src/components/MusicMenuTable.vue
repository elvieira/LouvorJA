<template>
  <div class="d-flex flex-nowrap align-center" :class="{ 'compact-menu-table': compact }">
    <v-btn
      v-for="(btn, key) in buttons"
      :key="key"
      :disabled="btn.disabled ? btn.disabled : false"
      variant="text"
      :color="color ? color : $theme.primary()"
      :density="compact ? 'compact' : 'compact'"
      :size="compact ? 'x-small' : undefined"
      :class="[compact ? 'mx-0 px-0' : 'mx-1', btn.class]"
      :style="compact ? 'min-width: 26px; width: 26px; height: 26px;' : ''"
      icon
      @click.stop="btn.click"
    >
      <v-icon :size="compact ? 17 : undefined">
        {{ btn.icon }}
      </v-icon>
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
      v-if="canQueue"
      v-model="queueMenuOpen"
      location="top center"
      :offset="8"
      open-on-hover
      :open-delay="120"
      :close-on-content-click="true"
      transition="slide-y-reverse-transition"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          variant="text"
          :color="color ? color : $theme.primary()"
          :density="compact ? 'compact' : 'compact'"
          :size="compact ? 'x-small' : undefined"
          :class="compact ? 'mx-0 px-0' : 'mx-1'"
          :style="compact ? 'min-width: 26px; width: 26px; height: 26px;' : ''"
          icon
          @click.stop
        >
          <v-icon :size="compact ? 17 : undefined">
            mdi-playlist-plus
          </v-icon>
        </v-btn>
      </template>

      <div class="queue-context-menu">
        <div class="filter-header">
          {{ $t('modules.media.queue.add_to_queue') }}
        </div>
        <!-- Opção: Cantado -->
        <button
          type="button"
          class="filter-item"
          @click.stop="addToQueue('audio')"
        >
          <span class="filter-label">{{ $t('modules.media.general.sung') || 'Cantado' }}</span>
        </button>

        <!-- Opção: Playback -->
        <button
          type="button"
          class="filter-item"
          :disabled="!hasInstrumentalMusic"
          :class="{ 'is-disabled': !hasInstrumentalMusic }"
          @click.stop="hasInstrumentalMusic ? addToQueue('instrumental') : null"
        >
          <span class="filter-label">{{ $t('modules.media.general.instrumental') || 'Playback' }}</span>
        </button>
      </div>
    </v-menu>

    <!-- Se não pode fila (externas / online) -->
    <v-btn
      v-else
      :disabled="true"
      variant="text"
      :color="color ? color : $theme.primary()"
      :density="compact ? 'compact' : 'compact'"
      :size="compact ? 'x-small' : undefined"
      :class="compact ? 'mx-0 px-0' : 'mx-1'"
      :style="compact ? 'min-width: 26px; width: 26px; height: 26px;' : ''"
      icon
    >
      <v-icon :size="compact ? 17 : undefined">
        mdi-playlist-plus
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
        open-delay="300"
        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
      >
        {{ 'Fila disponível para músicas locais' }}
      </v-tooltip>
    </v-btn>

    <!-- Favoritos (Coração) -->
    <v-btn
      v-if="canFavorite"
      variant="text"
      :color="isFavorite ? '#e91e63' : (color ? color : $theme.primary())"
      :density="compact ? 'compact' : 'compact'"
      :size="compact ? 'x-small' : undefined"
      :class="[compact ? 'mx-0 px-0' : 'mx-1', isFavorite ? 'favorite-active-btn' : '']"
      :style="compact ? 'min-width: 26px; width: 26px; height: 26px;' : ''"
      icon
      @click.stop="toggleFavorite"
    >
      <v-icon :size="compact ? 17 : undefined">
        {{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
        open-delay="300"
        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
      >
        {{ isFavorite ? favoriteRemoveTooltip : favoriteAddTooltip }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { useMedia } from "@/composables/useHelpers";
import { toggleFavoriteSong } from "@/helpers/services/Favorites";

const props = withDefaults(defineProps<{
  idMusic?: number | string;
  hasInstrumentalMusic?: boolean | number;
  color?: string;
  compact?: boolean;
  item?: any;
  pulseLyric?: boolean;
  searchQuery?: string;
}>(), {
  idMusic: 0,
  hasInstrumentalMusic: false,
  color: "",
  compact: false,
  item: null,
  pulseLyric: false,
  searchQuery: "",
});

const emit = defineEmits(["action"]);

const store = useStore();
const { t } = useI18n();
const media = useMedia();

const queueMenuOpen = ref(false);

const canFavorite = computed(() => {
  const numId = Number(props.idMusic);
  const isNum = !isNaN(numId) && numId > 0;
  const isExt = Boolean(props.item?.is_external_song && props.item?.filePathAudio);
  return isNum || isExt;
});

const isFavorite = computed(() => {
  const list = store?.getters?.getData?.("user_data.modules.custom_collection.list") || [];
  const fav = list.find((c: any) => c.id === "favorites" || c.is_favorites);
  if (!fav || !Array.isArray(fav.songs)) return false;

  const numId = Number(props.idMusic);
  if (!isNaN(numId) && numId > 0) {
    return fav.songs.some((s: any) => s.type === "internal" && Number(s.id_music) === numId);
  }

  if (props.item?.is_external_song && props.item?.filePathAudio) {
    return fav.songs.some((s: any) => s.type === "external" && s.filePathAudio === props.item.filePathAudio);
  }

  return false;
});

const favoriteAddTooltip = computed(() => {
  return t("modules.custom_collection.add_to_favorites") || "Adicionar aos favoritos";
});

const favoriteRemoveTooltip = computed(() => {
  return t("modules.custom_collection.remove_from_favorites") || "Remover dos favoritos";
});

const toggleFavorite = () => {
  const added = toggleFavoriteSong(props.idMusic, props.item);
  import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
    $snackbar.show({
      text: added
        ? (t("modules.custom_collection.added_to_favorites") || "Adicionado aos favoritos!")
        : (t("modules.custom_collection.removed_from_favorites") || "Removido dos favoritos"),
      color: added ? "success" : "info",
      timeout: 2000,
    });
  });
  emit("action", "favorite");
};

const canQueue = computed(() => {
  if (props.item?.is_online_collection) return false;
  if (props.item?.is_external_song) return false;
  const numId = Number(props.idMusic);
  return !isNaN(numId) && numId > 0;
});

const addToQueue = (mode: string) => {
  media.addToQueue({ id_music: Number(props.idMusic), mode });
  queueMenuOpen.value = false;
  import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
    const modeLabel = mode === "instrumental" 
      ? (t("modules.media.general.instrumental") || "Playback") 
      : (t("modules.media.general.sung") || "Cantado");
    $snackbar.show({
      text: `${t("modules.media.queue.added") || "Música adicionada à fila"} (${modeLabel})`,
      color: "success",
      timeout: 2000,
    });
  });
  emit("action", "queue");
};

const isSljaFile = (filePath: string): boolean => {
  return /\.(slja|sja|lja)$/i.test(filePath || "");
};

const buttons = computed(() => {
  const item = props.item;

  // 1. Coletânea Online (YouTube)
  if (item?.is_online_collection) {
    return [
      {
        tooltip: "Cantado (Vídeo)",
        disabled: false,
        icon: "mdi-play-circle",
        click: () => {
          (media as any).playOnlineVideo({
            id: item.video_id,
            name: item.name,
            channelName: item.channel_name,
            image: item.image,
          });
          emit("action", "play");
        },
      },
      {
        tooltip: "Playback indisponível",
        disabled: true,
        icon: "mdi-play-circle-outline",
        click: () => {},
      },
      {
        tooltip: "Sem Áudio (Projeção)",
        disabled: false,
        icon: "mdi-monitor",
        click: () => {
          (media as any).playOnlineVideo({
            id: item.video_id,
            name: item.name,
            channelName: item.channel_name,
            image: item.image,
            isMuted: true,
          });
          emit("action", "view");
        },
      },
      {
        tooltip: "Letra indisponível para vídeo online",
        disabled: true,
        icon: "mdi-text-box-outline",
        click: () => {},
      },
    ];
  }

  // 2. Coletânea Personalizada (Arquivo Externo)
  if (item?.is_external_song) {
    const isSlja = isSljaFile(item.filePathAudio);
    return [
      {
        tooltip: "Cantado",
        disabled: !item.filePathAudio,
        icon: "mdi-play-circle",
        click: () => {
          (media as any).playExternalFile(item, "audio");
          emit("action", "play");
        },
      },
      {
        tooltip: item.filePathInstrumental ? "Playback" : "Playback indisponível",
        disabled: !item.filePathInstrumental,
        icon: "mdi-play-circle-outline",
        click: () => {
          (media as any).playExternalFile(item, "instrumental");
          emit("action", "play");
        },
      },
      {
        tooltip: "Sem Áudio",
        disabled: !item.filePathAudio,
        icon: "mdi-monitor",
        click: () => {
          (media as any).playExternalFile(item, "no_audio");
          emit("action", "view");
        },
      },
      {
        tooltip: isSlja ? "Letra" : "Letra indisponível",
        disabled: !isSlja,
        icon: "mdi-text-box-outline",
        pulse: isSlja && props.pulseLyric,
        class: (isSlja && props.pulseLyric) ? "pulse-lyric-btn" : "",
        click: () => {
          if (isSlja) {
            (media as any).playExternalSlja(item.filePathAudio, "no_audio");
            emit("action", "lyric");
          }
        },
      },
    ];
  }

  // 3. Música Padrão (Local ou Interna em Coletânea Personalizada)
  const numId = Number(props.idMusic);
  return [
    {
      tooltip: "Cantado",
      disabled: false,
      icon: "mdi-play-circle",
      click: () => {
        media.open({ id_music: numId, mode: "audio" });
        emit("action", "play");
      },
    },
    {
      tooltip: "Playback",
      disabled: !props.hasInstrumentalMusic,
      icon: "mdi-play-circle-outline",
      click: () => {
        media.open({ id_music: numId, mode: "instrumental" });
        emit("action", "play");
      },
    },
    {
      tooltip: "Sem Áudio",
      disabled: false,
      icon: "mdi-monitor",
      click: () => {
        media.open(numId as any);
        emit("action", "view");
      },
    },
    {
      tooltip: "Letra",
      disabled: false,
      icon: "mdi-text-box-outline",
      pulse: props.pulseLyric,
      class: props.pulseLyric ? "pulse-lyric-btn" : "",
      click: () => {
        media.openLyric({
          id_music: numId,
          highlight: props.searchQuery,
        });
        emit("action", "lyric");
      },
    },
  ];
});
</script>

<style scoped>
@keyframes lyricPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 151, 215, 0.7);
  }
  50% {
    transform: scale(1.18);
    box-shadow: 0 0 8px 3px rgba(0, 151, 215, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 151, 215, 0);
  }
}

.pulse-lyric-btn {
  animation: lyricPulse 1.5s infinite ease-in-out !important;
  color: var(--accent-blue, #0097d7) !important;
  background: rgba(0, 151, 215, 0.15) !important;
  border-radius: 50% !important;
}

.favorite-active-btn {
  color: #e91e63 !important;
}

.queue-context-menu {
  min-width: 150px;
  background: var(--ds-surface, #30364a) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28) !important;
  padding: 8px !important;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .filter-header {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--ds-text-secondary, #a0a6b5);
    padding: 6px 10px 4px 10px;
    line-height: 1;
  }

  .filter-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: var(--ds-text-primary, #f7f8fc);
    text-align: left;
    outline: none;

    .filter-label {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.2;
    }

    &:hover:not(:disabled):not(.is-disabled) {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
      color: var(--ds-accent, #009be2);
    }

    &:active:not(:disabled):not(.is-disabled) {
      background: rgba(0, 155, 226, 0.14) !important;
      color: var(--ds-accent, #009be2) !important;
      font-weight: 600;
    }

    &.is-disabled,
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      color: var(--ds-text-secondary, #a0a6b5);

      &:hover {
        background: transparent;
        color: var(--ds-text-secondary, #a0a6b5);
      }
    }
  }
}

:root[data-theme="light"],
.v-theme--light {
  .queue-context-menu {
    background: #FFFFFF !important;
    border: 1px solid var(--ds-border, #E2E8F0) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;

    .filter-header {
      color: #64748B;
    }

    .filter-item {
      color: var(--ds-text-primary, #334155);

      &:hover:not(:disabled):not(.is-disabled) {
        background: rgba(0, 155, 226, 0.08);
        color: var(--ds-accent, #008fd0);
      }

      &:active:not(:disabled):not(.is-disabled) {
        background: rgba(0, 155, 226, 0.14) !important;
        color: var(--ds-accent, #008fd0) !important;
      }

      &.is-disabled,
      &:disabled {
        color: #94A3B8;
      }
    }
  }
}
</style>
