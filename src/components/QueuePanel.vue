<template>
  <v-expand-transition>
    <div
      v-if="isOpen"
      class="queue-panel-container d-flex flex-column position-relative"
      :style="{ height: queueHeight, '--queue-height': queueHeight }"
      :class="!isDark ? 'bg-light' : 'bg-dark'"
    >
      <!-- Cabeçalho da Fila de Reprodução -->
      <div class="queue-panel-header px-6 pt-5 pb-3 flex-shrink-0 d-flex flex-wrap align-center justify-space-between" style="gap: 16px;">
        <!-- Lado Esquerdo: Recolher e Título -->
        <div class="d-flex align-center" style="gap: 16px; min-width: 0;">
          <v-btn
            variant="tonal"
            color="primary"
            rounded="lg"
            height="36"
            class="text-none font-weight-medium px-3.5 queue-collapse-btn flex-shrink-0"
            prepend-icon="mdi-chevron-down"
            @click="closeQueue"
          >
            {{ $t('modules.media.queue.collapse') || 'Recolher fila' }}
          </v-btn>

          <div class="d-flex flex-column" style="min-width: 0;">
            <h2 class="queue-title text-truncate">
              {{ $t('modules.media.queue.title') || 'FILA DE REPRODUÇÃO' }}
            </h2>
            <span class="queue-subtitle text-truncate">
              {{ queueSubtitleText }}
            </span>
          </div>
        </div>

        <!-- Lado Direito: Busca e Ações -->
        <div class="d-flex align-center flex-wrap" style="gap: 10px;">
          <!-- Campo de Busca na Fila -->
          <div class="queue-search-wrapper" style="width: 240px;">
            <v-text-field
              v-model="searchQuery"
              placeholder="Buscar na fila..."
              density="compact"
              variant="solo"
              rounded="lg"
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="standard-text-input queue-search-input"
            >
              <template #append-inner>
                <v-btn
                  v-if="searchQuery"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  class="clear-search-btn"
                  title="Limpar busca"
                  @click="searchQuery = ''"
                />
              </template>
            </v-text-field>
          </div>

          <!-- Ordem Aleatória -->
          <v-btn
            v-if="queueItems.length > 0"
            variant="tonal"
            :color="isShuffle ? 'primary' : undefined"
            rounded="lg"
            height="36"
            class="text-none font-weight-medium px-3.5 queue-action-btn"
            :class="{ 'queue-btn-active': isShuffle }"
            prepend-icon="mdi-shuffle"
            @click="toggleShuffle"
          >
            {{ $t('modules.media.controls.shuffle') || 'Ordem aleatória' }}
          </v-btn>

          <!-- Limpar Fila -->
          <v-btn
            v-if="queueItems.length > 0"
            variant="tonal"
            color="error"
            rounded="lg"
            height="36"
            class="text-none font-weight-medium px-3.5 queue-clear-btn"
            prepend-icon="mdi-trash-can-outline"
            @click="clearQueue"
          >
            {{ $t('modules.media.queue.clear') || 'Limpar fila' }}
          </v-btn>
        </div>
      </div>

      <!-- Conteúdo da Lista de Músicas -->
      <div class="queue-panel-content overflow-y-auto px-6 pb-2 flex-grow-1">
        <!-- Estado Vazio: Sem músicas na fila -->
        <div v-if="queueItems.length === 0" class="empty-state d-flex flex-column align-center justify-center h-100 py-12 text-center">
          <div class="empty-icon-circle mb-3">
            <v-icon size="36" color="primary">
              mdi-music-box-multiple-outline
            </v-icon>
          </div>
          <h3 class="text-subtitle-1 font-weight-bold mb-1" style="color: var(--sidebar-text, #ffffff);">
            {{ $t('modules.media.queue.empty') || 'Fila de reprodução vazia' }}
          </h3>
          <p class="text-caption" style="color: var(--sidebar-text-secondary, #94a3b8); max-width: 320px;">
            Adicione músicas à fila para ouvi-las em sequência durante o culto.
          </p>
        </div>

        <!-- Estado Vazio: Busca sem resultados -->
        <div v-else-if="filteredDisplayItems.length === 0" class="empty-state d-flex flex-column align-center justify-center h-100 py-12 text-center">
          <div class="empty-icon-circle mb-3">
            <v-icon size="34" color="var(--sidebar-text-secondary, #94a3b8)">
              mdi-magnify-remove-outline
            </v-icon>
          </div>
          <h3 class="text-subtitle-1 font-weight-bold mb-1" style="color: var(--sidebar-text, #ffffff);">
            Nenhuma música encontrada
          </h3>
          <p class="text-caption mb-4" style="color: var(--sidebar-text-secondary, #94a3b8); max-width: 320px;">
            Nenhuma música na fila corresponde ao termo "{{ searchQuery }}".
          </p>
          <v-btn
            variant="tonal"
            color="primary"
            rounded="lg"
            height="34"
            prepend-icon="mdi-close"
            class="text-none font-weight-medium px-4"
            @click="searchQuery = ''"
          >
            Limpar busca
          </v-btn>
        </div>

        <!-- Lista Principal com Drag & Drop (quando sem busca) -->
        <draggable
          v-else-if="!searchQuery"
          :list="queueItems"
          item-key="uniqueId"
          handle=".drag-handle"
          ghost-class="queue-ghost"
          drag-class="queue-drag"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div
              class="queue-track-row d-flex align-center px-3 py-2 mb-2 rounded-xl"
              :class="{ 'is-active': index === currentIndex }"
            >
              <!-- Alça de Arraste -->
              <div class="drag-handle-wrapper d-flex align-center justify-center flex-shrink-0 mr-1">
                <v-icon size="18" class="drag-handle cursor-grab">
                  mdi-dots-grid
                </v-icon>
              </div>

              <!-- Posição Numérica -->
              <span class="track-index font-weight-bold flex-shrink-0 mr-3">
                {{ index + 1 }}
              </span>

              <!-- Capa Quadrada com Botão de Play no Hover -->
              <div class="queue-cover rounded-lg overflow-hidden position-relative d-flex align-center justify-center flex-shrink-0 mr-4">
                <v-img
                  v-if="element.url_image"
                  :src="$path.file(element.url_image)"
                  width="44"
                  height="44"
                  cover
                />
                <v-icon
                  v-else
                  size="22"
                  class="fallback-icon"
                >
                  mdi-music
                </v-icon>

                <!-- Overlay de Play ao Passar o Mouse (se não for a atual) -->
                <div
                  v-if="index !== currentIndex"
                  class="play-overlay position-absolute w-100 h-100 d-flex align-center justify-center cursor-pointer"
                  title="Reproduzir agora"
                  @click.stop="playFromQueue(index)"
                >
                  <v-icon color="white" size="22">
                    mdi-play
                  </v-icon>
                </div>
              </div>

              <!-- Informações da Música (Título e Subtítulo) -->
              <div class="queue-info flex-grow-1 overflow-hidden mr-3" style="cursor: pointer;" @click="playFromQueue(index)">
                <div
                  class="track-title text-body-2 font-weight-semibold text-truncate"
                  :class="{ 'text-primary': index === currentIndex }"
                  :title="element.name"
                >
                  {{ element.name }}
                </div>
                <div class="track-subtitle text-caption text-truncate opacity-75" :title="element.subtitle">
                  {{ element.subtitle || 'Louvor JA' }}
                </div>
              </div>

              <!-- Indicador de Áudio Equalizador (se faixa ativa) -->
              <div v-if="index === currentIndex" class="queue-equalizer d-flex align-center mr-3" title="Reproduzindo">
                <span class="eq-bar bar-1" />
                <span class="eq-bar bar-2" />
                <span class="eq-bar bar-3" />
              </div>

              <!-- Duração da Faixa -->
              <span class="track-duration font-weight-medium text-caption mr-4 flex-shrink-0">
                {{ getDuration(element, index) }}
              </span>

              <!-- Badge de Modo (PB verde / CT azul) -->
              <span
                class="mode-badge flex-shrink-0 mr-3 font-weight-bold"
                :class="element.mode === 'instrumental' ? 'mode-pb' : 'mode-ct'"
              >
                {{ element.mode === 'instrumental' ? 'PB' : 'CT' }}
              </span>

              <!-- Botão Favorito -->
              <v-btn
                icon
                size="x-small"
                variant="text"
                class="queue-icon-btn mr-1 flex-shrink-0"
                :title="isFavorite(element) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                @click.stop="toggleFav(element)"
              >
                <v-icon
                  :icon="isFavorite(element) ? 'mdi-heart' : 'mdi-heart-outline'"
                  :color="isFavorite(element) ? '#e91e63' : undefined"
                  size="18"
                />
              </v-btn>

              <!-- Botão Excluir da Fila -->
              <v-btn
                icon
                size="x-small"
                variant="text"
                class="queue-icon-btn queue-delete-btn flex-shrink-0"
                title="Remover da fila"
                @click.stop="removeFromQueue(index)"
              >
                <v-icon icon="mdi-trash-can-outline" size="18" />
              </v-btn>
            </div>
          </template>
        </draggable>

        <!-- Lista Filtrada pela Busca (somente visualização/execução, sem drag) -->
        <div v-else class="queue-filtered-list">
          <div
            v-for="({ item: element, originalIndex: index }) in filteredDisplayItems"
            :key="element.uniqueId || index"
            class="queue-track-row d-flex align-center px-3 py-2 mb-2 rounded-xl"
            :class="{ 'is-active': index === currentIndex }"
          >
            <!-- Posição Numérica -->
            <span class="track-index font-weight-bold flex-shrink-0 mr-3" style="margin-left: 26px;">
              {{ index + 1 }}
            </span>

            <!-- Capa Quadrada -->
            <div class="queue-cover rounded-lg overflow-hidden position-relative d-flex align-center justify-center flex-shrink-0 mr-4">
              <v-img
                v-if="element.url_image"
                :src="$path.file(element.url_image)"
                width="44"
                height="44"
                cover
              />
              <v-icon
                v-else
                size="22"
                class="fallback-icon"
              >
                mdi-music
              </v-icon>
              <div
                v-if="index !== currentIndex"
                class="play-overlay position-absolute w-100 h-100 d-flex align-center justify-center cursor-pointer"
                title="Reproduzir agora"
                @click.stop="playFromQueue(index)"
              >
                <v-icon color="white" size="22">
                  mdi-play
                </v-icon>
              </div>
            </div>

            <!-- Informações da Música -->
            <div class="queue-info flex-grow-1 overflow-hidden mr-3" style="cursor: pointer;" @click="playFromQueue(index)">
              <div
                class="track-title text-body-2 font-weight-semibold text-truncate"
                :class="{ 'text-primary': index === currentIndex }"
                :title="element.name"
              >
                {{ element.name }}
              </div>
              <div class="track-subtitle text-caption text-truncate opacity-75" :title="element.subtitle">
                {{ element.subtitle || 'Louvor JA' }}
              </div>
            </div>

            <!-- Equalizador se faixa ativa -->
            <div v-if="index === currentIndex" class="queue-equalizer d-flex align-center mr-3" title="Reproduzindo">
              <span class="eq-bar bar-1" />
              <span class="eq-bar bar-2" />
              <span class="eq-bar bar-3" />
            </div>

            <!-- Duração -->
            <span class="track-duration font-weight-medium text-caption mr-4 flex-shrink-0">
              {{ getDuration(element, index) }}
            </span>

            <!-- Badge de Modo -->
            <span
              class="mode-badge flex-shrink-0 mr-3 font-weight-bold"
              :class="element.mode === 'instrumental' ? 'mode-pb' : 'mode-ct'"
            >
              {{ element.mode === 'instrumental' ? 'PB' : 'CT' }}
            </span>

            <!-- Favorito -->
            <v-btn
              icon
              size="x-small"
              variant="text"
              class="queue-icon-btn mr-1 flex-shrink-0"
              :title="isFavorite(element) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
              @click.stop="toggleFav(element)"
            >
              <v-icon
                :icon="isFavorite(element) ? 'mdi-heart' : 'mdi-heart-outline'"
                :color="isFavorite(element) ? '#e91e63' : undefined"
                size="18"
              />
            </v-btn>

            <!-- Botão Excluir da Fila -->
            <v-btn
              icon
              size="x-small"
              variant="text"
              class="queue-icon-btn queue-delete-btn flex-shrink-0"
              title="Remover da fila"
              @click.stop="removeFromQueue(index)"
            >
              <v-icon icon="mdi-trash-can-outline" size="18" />
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </v-expand-transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { useAppData, useMedia, useDatabase, useDateTime } from "@/composables/useHelpers";
import { isFavoriteSong, toggleFavoriteSong } from "@/helpers/services/Favorites";
import draggable from "vuedraggable";

const theme = useTheme();
const appdata = useAppData();
const media = useMedia();
const database = useDatabase();
const datetime = useDateTime();

const isDark = computed(() => theme.name.value === "dark");
const isElectron = computed(() => !!(window as any).electronAPI);

const queueHeight = computed(() => isElectron.value ? "calc(100vh - 96px)" : "calc(100vh - 64px)");
const isOpen = computed(() => appdata.get("modules.media.show_queue") === true);

const queueData = computed(() => appdata.get("modules.media.queue") || { items: [], currentIndex: -1 });

// Criei um map para adicionar uniqueId pro vuedraggable funcionar perfeitamente sem bugar quando tem música igual
const queueItems = computed<any[]>({
  get: () => {
    return (queueData.value.items || []).map((item: any, i: number) => ({
      ...item,
      uniqueId: `${item.id_music}_${i}_${item.mode}`,
    }));
  },
  set: (_val) => {
    // Tratado no onDragEnd
  },
});

const currentIndex = computed(() => queueData.value.currentIndex);
const isShuffle = computed(() => appdata.get("modules.media.config.shuffle") === true);

// Busca local na fila
const searchQuery = ref("");

const filteredDisplayItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const all: Array<{ item: any; originalIndex: number }> = queueItems.value.map((item: any, originalIndex: number) => ({ item, originalIndex }));
  if (!q) return all;
  return all.filter(({ item }: { item: any }) => {
    const name = (item.name || "").toLowerCase();
    const sub = (item.subtitle || "").toLowerCase();
    return name.includes(q) || sub.includes(q);
  });
});

// Cache reativo para durações carregadas do banco de dados
const durationCache = ref<Record<string, string>>({});

const loadDuration = async (item: any) => {
  const key = `${item.id_music}_${item.mode}`;
  if (durationCache.value[key]) return;
  if (item.duration && item.duration !== "0:00" && item.duration !== "00:00") {
    durationCache.value[key] = datetime.shortTime(item.duration);
    return;
  }
  if (!item.is_external_song && item.id_music) {
    try {
      const data: any = await database.get(`music_${item.id_music}`);
      if (data) {
        const d = item.mode === "instrumental" && data.instrumental_duration 
          ? data.instrumental_duration 
          : data.duration;
        if (d && d !== "0:00" && d !== "00:00") {
          durationCache.value[key] = datetime.shortTime(d);
        }
      }
    } catch {
      // Ignora erro de leitura silenciosamente
    }
  }
};

watch(
  () => queueItems.value,
  (items: any[]) => {
    items.forEach((item: any) => loadDuration(item));
  },
  { immediate: true, deep: true },
);

const getDuration = (item: any, index: number): string => {
  if (index === currentIndex.value) {
    const liveDur = appdata.get("modules.media.config.duration");
    if (typeof liveDur === "number" && liveDur > 0) {
      return datetime.shortTime(liveDur);
    }
  }
  const key = `${item.id_music}_${item.mode}`;
  if (durationCache.value[key]) {
    return durationCache.value[key];
  }
  if (item.duration && item.duration !== "0:00" && item.duration !== "00:00") {
    return datetime.shortTime(item.duration);
  }
  return "--:--";
};

// Subtítulo do cabeçalho: "X músicas • Ymin Zs"
const queueSubtitleText = computed(() => {
  const count = queueItems.value.length;
  if (count === 0) return "0 músicas";

  let totalSeconds = 0;
  for (let i = 0; i < queueItems.value.length; i++) {
    const item = queueItems.value[i];
    const durStr = getDuration(item, i);
    if (durStr && durStr !== "--:--") {
      totalSeconds += datetime.toNumber(durStr);
    }
  }

  const musicText = count === 1 ? "1 música" : `${count} músicas`;
  if (totalSeconds > 0) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    const timeFormatted = m > 0 ? `${m}min ${String(s).padStart(2, "0")}s` : `${s}s`;
    return `${musicText} • ${timeFormatted}`;
  }

  return musicText;
});



// Suporte reativo a favoritos
const favTick = ref(0);
const isFavorite = (element: any) => {
  void favTick.value;
  return isFavoriteSong(element.id_music, element);
};

const toggleFav = (element: any) => {
  toggleFavoriteSong(element.id_music, element);
  favTick.value++;
};

// Ações da fila
const onDragEnd = (event: any) => {
  if (event.oldIndex !== undefined && event.newIndex !== undefined && event.oldIndex !== event.newIndex) {
    media.reorderQueue(event.oldIndex, event.newIndex);
  }
};

const closeQueue = () => {
  appdata.set("modules.media.show_queue", false);
};

const toggleShuffle = () => {
  media.toggleShuffle();
};

const clearQueue = () => {
  media.clearQueue();
};

const removeFromQueue = (index: number) => {
  media.removeFromQueue(index);
};

const playFromQueue = (index: number) => {
  media.playFromQueue(index);
};
</script>

<style scoped lang="scss">
.queue-panel-container {
  width: 100%;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  user-select: none;
}

.bg-dark {
  background: #1b1f2b !important;
}

.bg-light {
  background: #f8fafc !important;
}

// HEADER
.queue-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--sidebar-text, #ffffff);
  margin: 0;
  line-height: 1.2;
}

.queue-subtitle {
  font-size: 12.5px;
  color: var(--sidebar-text-secondary, #94a3b8);
  margin-top: 3px;
  font-weight: 500;
}

.queue-search-input {
  :deep(.v-field) {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-size: 13px !important;
    box-shadow: none !important;

    &:hover, &.v-field--focused {
      border-color: var(--accent-blue, #009fe3) !important;
    }
  }

  :deep(input) {
    color: var(--sidebar-text, #ffffff) !important;
    font-size: 13px !important;
    min-height: 36px !important;
    height: 36px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;

    &::placeholder {
      color: var(--sidebar-text-secondary, #94a3b8) !important;
      opacity: 0.7;
    }
  }
}

// TRACK ROW
.queue-track-row {
  background: #232838;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 60px;

  &:hover {
    background: #2a3144;
    border-color: rgba(255, 255, 255, 0.12);

    .drag-handle {
      opacity: 0.75 !important;
    }

    .play-overlay {
      opacity: 1;
    }
  }

  &.is-active {
    background: #1b2f48 !important;
    border: 1px solid var(--accent-blue, #009fe3) !important;
    box-shadow: 0 0 16px rgba(0, 159, 227, 0.18) !important;

    .track-index {
      color: var(--accent-blue, #009fe3) !important;
    }

    .track-title {
      color: #ffffff !important;
      font-weight: 700;
    }
  }
}

.drag-handle {
  color: var(--sidebar-text-secondary, #94a3b8);
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.track-index {
  width: 22px;
  text-align: center;
  font-size: 13px;
  color: var(--sidebar-text-secondary, #94a3b8);
  opacity: 0.8;
}

.queue-cover {
  width: 44px;
  height: 44px;
  margin-right: 16px !important;
  background: rgba(255, 255, 255, 0.05);

  .fallback-icon {
    color: var(--sidebar-text-secondary, #94a3b8);
    opacity: 0.45;
  }
}

.play-overlay {
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-title {
  color: var(--sidebar-text, #ffffff);
  line-height: 1.3;
}

.track-subtitle {
  color: var(--sidebar-text-secondary, #94a3b8);
  line-height: 1.2;
  margin-top: 2px;
}

.track-duration {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 13px;
  min-width: 42px;
  text-align: right;
}

// EQUALIZER
.queue-equalizer {
  height: 16px;
  gap: 2.5px;

  .eq-bar {
    display: inline-block;
    width: 3px;
    background: var(--accent-blue, #009fe3);
    border-radius: 1.5px;
    animation: equalizerBounce 1s ease-in-out infinite alternate;
  }

  .bar-1 {
    height: 10px;
    animation-delay: 0s;
  }
  .bar-2 {
    height: 16px;
    animation-delay: 0.25s;
  }
  .bar-3 {
    height: 8px;
    animation-delay: 0.5s;
  }
}

@keyframes equalizerBounce {
  0% {
    height: 4px;
  }
  100% {
    height: 16px;
  }
}

// BADGES
.mode-badge {
  font-size: 10.5px;
  padding: 2px 7.5px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;

  &.mode-pb {
    color: #22c55e;
    border: 1.5px solid #22c55e;
    background: rgba(34, 197, 94, 0.1);
  }

  &.mode-ct {
    color: var(--accent-blue, #009fe3);
    border: 1.5px solid var(--accent-blue, #009fe3);
    background: rgba(0, 159, 227, 0.1);
  }
}

// ICONS
.queue-icon-btn {
  color: var(--sidebar-text-secondary, #94a3b8) !important;
  transition: all 0.15s ease !important;

  &:hover {
    color: var(--sidebar-text, #ffffff) !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }

  &.queue-delete-btn:hover {
    color: #ef4444 !important;
    background: rgba(239, 68, 68, 0.12) !important;
  }
}

// EMPTY STATE
.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 155, 226, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

// DRAGGABLE GHOST & DRAG
.queue-ghost {
  opacity: 0.4;
  border: 1px dashed var(--accent-blue, #009fe3) !important;
}

.queue-drag {
  background: #2a3144 !important;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4) !important;
  border: 1px solid var(--accent-blue, #009fe3) !important;
}

// LIGHT THEME ADAPTABILITY
.bg-light {
  .queue-panel-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .queue-title {
    color: #0f172a !important;
  }

  .queue-subtitle {
    color: #64748b !important;
  }

  .queue-search-input :deep(.v-field) {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.1) !important;
  }

  .queue-search-input :deep(input) {
    color: #0f172a !important;
  }

  .queue-track-row {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.08);

    &:hover {
      background: #f1f5f9;
      border-color: rgba(0, 0, 0, 0.14);
    }

    &.is-active {
      background: #eff6ff !important;
      border-color: var(--accent-blue, #009fe3) !important;

      .track-title {
        color: #0f172a !important;
      }
    }
  }

  .track-title {
    color: #0f172a !important;
  }

  .track-subtitle,
  .track-duration,
  .track-index,
  .drag-handle {
    color: #64748b !important;
  }

  .queue-icon-btn {
    color: #64748b !important;

    &:hover {
      color: #0f172a !important;
      background: rgba(0, 0, 0, 0.06) !important;
    }

    &.queue-delete-btn:hover {
      color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.12) !important;
    }
  }
}
</style>
