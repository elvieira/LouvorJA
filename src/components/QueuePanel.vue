<template>
  <v-expand-transition>
    <div
      v-if="isOpen"
      class="queue-panel-container d-flex flex-column position-relative"
      :style="{ height: queueHeight, '--queue-height': queueHeight }"
      :class="!isDark ? 'bg-light' : 'bg-dark'"
    >
      <div class="queue-panel-header d-flex align-center px-6 pt-4 pb-2 flex-shrink-0">
        <span class="text-button font-weight-bold opacity-70">{{ $t('modules.media.queue.title') }}</span>
        
        <v-spacer />
        
        <v-btn
          v-if="queueItems.length > 0"
          variant="tonal"
          color="error"
          size="small"
          class="text-none"
          prepend-icon="mdi-trash-can-outline"
          @click="clearQueue"
        >
          {{ $t('modules.media.queue.clear') }}
        </v-btn>
      </div>
      
      <div class="queue-panel-content overflow-y-auto px-4 pb-4 flex-grow-1">
        <div v-if="queueItems.length === 0" class="d-flex flex-column align-center justify-center h-100 py-10 opacity-60">
          <v-icon size="48" class="mb-2">
            mdi-music-note-off-outline
          </v-icon>
          <span class="text-body-2">{{ $t('modules.media.queue.empty') }}</span>
        </div>
        
        <draggable
          v-else
          :list="queueItems"
          item-key="uniqueId"
          handle=".drag-handle"
          ghost-class="queue-ghost"
          drag-class="queue-drag"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div 
              class="queue-item rounded-lg d-flex align-center pa-2 mb-2"
              :class="{ 'playing': index === currentIndex }"
            >
              <v-icon size="18" class="drag-handle mr-2 cursor-grab opacity-40">
                mdi-drag-vertical
              </v-icon>
              
              <div class="queue-cover rounded overflow-hidden mr-3 position-relative d-flex align-center justify-center">
                <v-img
                  v-if="element.url_image"
                  :src="$path.file(element.url_image)"
                  width="40"
                  height="40"
                  cover
                />
                <v-icon v-else size="24" class="opacity-50">
                  mdi-music
                </v-icon>
                
                <div v-if="index === currentIndex" class="playing-indicator position-absolute w-100 h-100 d-flex align-center justify-center">
                  <v-icon color="white" size="20">
                    mdi-volume-high
                  </v-icon>
                </div>
                <div v-else class="play-overlay position-absolute w-100 h-100 d-flex align-center justify-center cursor-pointer" @click="playFromQueue(index)">
                  <v-icon color="white" size="20">
                    mdi-play
                  </v-icon>
                </div>
              </div>
              
              <div class="queue-info flex-grow-1 overflow-hidden" style="cursor: pointer;" @click="playFromQueue(index)">
                <div class="text-body-2 font-weight-medium text-truncate" :class="{'text-primary': index === currentIndex}">
                  {{ element.name }}
                </div>
                <div class="text-caption text-truncate opacity-70">
                  {{ element.subtitle }}
                </div>
              </div>
              
              <v-chip
                size="x-small"
                variant="outlined"
                :color="element.mode === 'instrumental' ? 'success' : 'info'"
                class="mr-3 font-weight-bold"
                style="border-width: 2px;"
              >
                {{ element.mode === 'instrumental' ? 'PB' : 'CT' }}
              </v-chip>
              
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                color="error"
                class="opacity-60 hover-opacity-100"
                @click="removeFromQueue(index)"
              />
            </div>
          </template>
        </draggable>
      </div>

      <v-btn
        icon="mdi-chevron-down"
        color="primary"
        variant="tonal"
        class="queue-close-fab opacity-80"
        @click="closeQueue"
      />
    </div>
  </v-expand-transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import { useAppData, useMedia } from "@/composables/useHelpers";
import draggable from "vuedraggable";

const theme = useTheme();
const appdata = useAppData();
const media = useMedia();

const isDark = computed(() => theme.name.value === "dark");
const isElectron = computed(() => !!(window as any).electronAPI);

const queueHeight = computed(() => isElectron.value ? "calc(100vh - 96px)" : "calc(100vh - 64px)");

const isOpen = computed(() => appdata.get("modules.media.show_queue") === true);

const queueData = computed(() => appdata.get("modules.media.queue") || { items: [], currentIndex: -1 });

// Criei um map para adicionar uniqueId pro vuedraggable funcionar perfeitamente sem bugar quando tem música igual
const queueItems = computed({
  get: () => {
    return (queueData.value.items || []).map((item: any, i: number) => ({
      ...item,
      uniqueId: `${item.id_music}_${i}_${item.mode}`,
    }));
  },
  set: (_val) => {
    // o draggable atualiza a lista chamando o setter do v-model (neste caso :list)
    // Então interceptamos e salvamos, mas usamos a action real no onDragEnd
  },
});

const currentIndex = computed(() => queueData.value.currentIndex);

const onDragEnd = (event: any) => {
  if (event.oldIndex !== undefined && event.newIndex !== undefined && event.oldIndex !== event.newIndex) {
    media.reorderQueue(event.oldIndex, event.newIndex);
  }
};

const closeQueue = () => {
  appdata.set("modules.media.show_queue", false);
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

<style scoped>
.queue-panel-container {
  width: 100%;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-dark {
  background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), var(--card-bg) !important;
}

.bg-light {
  background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), var(--card-bg) !important;
}

.queue-item {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.2s;
}

.bg-light .queue-item {
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.queue-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.bg-light .queue-item:hover {
  background-color: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.1);
}

.queue-item.playing {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.drag-handle {
  transition: opacity 0.2s;
}

.queue-item:hover .drag-handle {
  opacity: 0.8 !important;
}

.queue-close-fab {
  position: absolute;
  top: calc(var(--queue-height) - 72px);
  right: 16px;
  z-index: 1000;
  transition: opacity 0.2s;
}

.queue-close-fab:hover {
  opacity: 1 !important;
}

.queue-cover {
  width: 40px;
  height: 40px;
  background-color: rgba(128, 128, 128, 0.2);
}

.play-overlay {
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.queue-item:hover .play-overlay {
  opacity: 1;
}

.playing-indicator {
  background: rgba(0, 0, 0, 0.5);
}

.queue-ghost {
  opacity: 0.5;
  background: rgba(var(--v-theme-primary), 0.1);
}

.queue-drag {
  background: rgba(15, 15, 20, 0.9) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
}

.bg-light .queue-drag {
  background: rgba(255, 255, 255, 0.9) !important;
}

.hover-opacity-100:hover {
  opacity: 1 !important;
}
</style>
