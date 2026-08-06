<template>
  <v-list-item 
    class="mb-2 rounded-xl pa-3" 
    style="background: transparent; box-shadow: inset 0 0 0 1px var(--border-color); transition: all 0.2s;"
  >
    <template #prepend>
      <v-avatar
        rounded="lg"
        size="48"
        color="primary"
        variant="tonal"
        class="mr-3"
      >
        <v-img v-if="album.coverUrl" :src="album.coverUrl" cover />
        <v-icon v-else>
          mdi-album
        </v-icon>
      </v-avatar>
    </template>
  
    <v-list-item-title class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">
      {{ album.name }}
    </v-list-item-title>
  
    <v-list-item-subtitle v-if="album.status === 'downloading'" class="mt-1">
      <div class="d-flex justify-space-between align-center mb-1">
        <span class="text-caption font-weight-medium text-primary">
          {{ album.progressText || $t('modules.sync.downloading') }}
        </span>
        <span class="text-caption font-weight-bold text-primary">{{ album.progress }}%</span>
      </div>
      <v-progress-linear
        :model-value="album.progress"
        color="primary"
        height="5"
        rounded
        striped
      />
    </v-list-item-subtitle>
  
    <v-list-item-subtitle v-else class="text-caption" style="color: var(--sidebar-text-secondary);">
      {{ album.subtitle || '' }}
    </v-list-item-subtitle>
  
    <template #append>
      <v-btn
        v-if="album.status === 'idle'"
        color="primary"
        variant="text"
        size="small"
        icon
        class="rounded-lg"
        @click="$emit('download', album)"
      >
        <v-icon>mdi-download</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.sync.download') }}
        </v-tooltip>
      </v-btn>
    
      <v-btn
        v-else-if="album.status === 'downloading'"
        color="error"
        variant="text"
        size="small"
        icon
        class="rounded-lg ml-2"
        @click="$emit('cancel', album)"
      >
        <v-icon>mdi-close</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ $t('modules.sync.cancel') }}
        </v-tooltip>
      </v-btn>

      <div v-else-if="album.status === 'downloaded'" class="d-flex align-center">
        <div class="text-success font-weight-medium text-caption mr-3 d-flex align-center">
          <v-icon start size="14" class="mr-1">
            mdi-check-circle
          </v-icon> {{ $t('modules.sync.downloaded') }}
        </div>
        <v-btn
          color="error"
          variant="text"
          size="small"
          icon
          class="rounded-lg"
          @click="$emit('delete', album)"
        >
          <v-icon>mdi-delete</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ $t('modules.sync.delete_album') }}
          </v-tooltip>
        </v-btn>
      </div>
    
      <v-btn
        v-else-if="album.status === 'error'"
        color="error"
        variant="tonal"
        size="small"
        class="text-none font-weight-bold rounded-lg px-3"
        @click="$emit('download', album)"
      >
        <v-icon start size="16">
          mdi-refresh
        </v-icon> {{ $t('modules.sync.try_again') }}
      </v-btn>
    </template>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { SyncAlbum } from "../types";

export default defineComponent({
  name: "SyncAlbumItem",
  props: {
    album: {
      type: Object as PropType<SyncAlbum>,
      required: true,
    },
  },
  emits: ["download", "cancel", "delete"],
});
</script>
