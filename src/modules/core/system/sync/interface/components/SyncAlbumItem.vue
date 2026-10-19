<template>
  <!-- Modo Lista (Padrão) -->
  <div
    v-if="viewMode === 'list'"
    class="sync-album-item-row d-flex align-center justify-space-between cursor-pointer"
    :class="{ 'is-selected': isSelected, 'is-downloading': album.status === 'downloading' }"
    @click="$emit('select', album)"
  >
    <!-- Esquerda: Capa + Título + Subtítulo -->
    <div class="d-flex align-center flex-grow-1 min-w-0 mr-4">
      <div class="album-cover-box flex-shrink-0 mr-4 rounded-lg overflow-hidden position-relative">
        <v-img
          v-if="album.coverUrl"
          :src="album.coverUrl"
          cover
          width="52"
          height="52"
          class="rounded-lg bg-grey-darken-4"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height bg-grey-darken-3">
              <v-icon size="24" color="var(--sidebar-text-secondary)" style="opacity: 0.5;">
                mdi-album
              </v-icon>
            </div>
          </template>
        </v-img>
        <div v-else class="fallback-cover d-flex align-center justify-center">
          <v-icon size="28" :color="album.isHymnal ? '#009fe3' : 'var(--sidebar-text-secondary)'" :style="!album.isHymnal ? 'opacity: 0.6;' : ''">
            {{ album.isHymnal ? 'mdi-book-cross' : 'mdi-album' }}
          </v-icon>
        </div>
      </div>

      <div class="d-flex flex-column min-w-0 flex-grow-1">
        <span class="album-title font-weight-bold text-truncate" :title="album.name">
          {{ album.name }}
        </span>

        <!-- Progresso quando estiver baixando -->
        <div v-if="album.status === 'downloading'" class="mt-1 w-100" style="max-width: 320px;">
          <div class="d-flex justify-space-between align-center text-caption mb-1">
            <span class="text-caption font-weight-medium" style="color: var(--accent-blue, #009fe3); font-size: 0.75rem !important;">
              {{ album.progressText || $t('modules.sync.downloading') }}
            </span>
            <span class="text-caption font-weight-bold" style="color: var(--accent-blue, #009fe3); font-size: 0.75rem !important;">
              {{ album.progress }}%
            </span>
          </div>
          <v-progress-linear
            :model-value="album.progress"
            color="primary"
            height="4"
            rounded
            striped
          />
        </div>

        <span v-else class="album-subtitle text-caption text-truncate">
          {{ album.subtitle || album.categoryName || '' }}
        </span>
      </div>
    </div>

    <!-- Direita: Badges de status, botões de ação e menu de contexto -->
    <div class="d-flex align-center flex-shrink-0" @click.stop>
      <!-- Estado: BAIXADO -->
      <div v-if="album.status === 'downloaded'" class="d-flex align-center">
        <div class="status-badge-downloaded d-flex align-center px-3 py-1 rounded-pill">
          <v-icon
            start
            size="14"
            class="mr-1.5"
            color="#4caf50"
          >
            mdi-check-circle
          </v-icon>
          <span>{{ $t('modules.sync.downloaded') }}</span>
        </div>
      </div>

      <!-- Estado: BAIXANDO -->
      <div v-else-if="album.status === 'downloading'" class="d-flex align-center">
        <v-btn
          color="error"
          variant="tonal"
          size="small"
          density="comfortable"
          icon
          class="rounded-lg mr-1"
          @click="$emit('cancel', album)"
        >
          <v-icon size="16">
            mdi-close
          </v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-delay="300"
          >
            {{ $t('modules.sync.cancel') }}
          </v-tooltip>
        </v-btn>
      </div>

      <!-- Estado: IDLE (NÃO BAIXADO) -->
      <div v-else-if="album.status === 'idle'" class="d-flex align-center">
        <v-btn
          variant="flat"
          size="small"
          height="30"
          class="btn-download-action text-none font-weight-bold rounded-pill px-3.5"
          prepend-icon="mdi-arrow-down"
          @click="$emit('download', album)"
        >
          {{ $t('modules.sync.download') }}
        </v-btn>
        <span
          v-if="album.formattedSize"
          class="album-size-label font-weight-medium ml-3"
        >
          {{ album.formattedSize }}
        </span>
      </div>

      <!-- Estado: ERRO -->
      <div v-else-if="album.status === 'error'" class="d-flex align-center">
        <v-btn
          color="warning"
          variant="tonal"
          size="small"
          height="30"
          class="text-none font-weight-bold rounded-pill px-3"
          prepend-icon="mdi-refresh"
          @click="$emit('download', album)"
        >
          {{ $t('modules.sync.try_again') }}
        </v-btn>
      </div>

      <!-- Menu de contexto com reticências (...) -->
      <v-menu
        location="bottom end"
        :offset="6"
        transition="slide-y-transition"
        open-on-click
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            variant="text"
            size="small"
            density="comfortable"
            class="action-more-btn rounded-lg ml-2"
          >
            <v-icon
              size="18"
              color="var(--sidebar-text-secondary)"
            >
              mdi-dots-horizontal
            </v-icon>
          </v-btn>
        </template>

        <div class="search-filter-popover card-context-popover" style="min-width: 170px;">
          <!-- Ações se baixado -->
          <template v-if="album.status === 'downloaded'">
            <button
              type="button"
              class="filter-item"
              @click="$emit('play', album)"
            >
              <span class="filter-label">{{ $t('modules.sync.play') }}</span>
            </button>
            <button
              type="button"
              class="filter-item"
              @click="$emit('open-folder', album)"
            >
              <span class="filter-label">{{ $t('modules.sync.open_folder') }}</span>
            </button>
            <div class="filter-divider" />
            <button
              type="button"
              class="filter-item text-error-item"
              @click="$emit('delete', album)"
            >
              <span class="filter-label text-error">{{ $t('modules.sync.delete_album') }}</span>
            </button>
          </template>

          <!-- Ação se idle -->
          <template v-else-if="album.status === 'idle'">
            <button
              type="button"
              class="filter-item"
              @click="$emit('download', album)"
            >
              <span class="filter-label">{{ $t('modules.sync.download') }}</span>
            </button>
          </template>

          <!-- Ação se erro -->
          <template v-else-if="album.status === 'error'">
            <button
              type="button"
              class="filter-item"
              @click="$emit('download', album)"
            >
              <span class="filter-label">{{ $t('modules.sync.try_again') }}</span>
            </button>
          </template>

          <!-- Ação se baixando -->
          <template v-else-if="album.status === 'downloading'">
            <button
              type="button"
              class="filter-item text-error-item"
              @click="$emit('cancel', album)"
            >
              <span class="filter-label text-error">{{ $t('modules.sync.cancel') }}</span>
            </button>
          </template>
        </div>
      </v-menu>
    </div>
  </div>

  <!-- Modo Grade (Grid) -->
  <div
    v-else
    class="sync-album-card-grid pa-3 rounded-xl cursor-pointer d-flex flex-column justify-space-between position-relative"
    :class="{ 'is-selected': isSelected, 'is-downloading': album.status === 'downloading' }"
    @click="$emit('select', album)"
  >
    <div class="d-flex flex-column align-center text-center w-100">
      <div class="album-cover-box-grid rounded-lg overflow-hidden position-relative w-100">
        <v-img
          v-if="album.coverUrl"
          :src="album.coverUrl"
          cover
          class="w-100 h-100 rounded-lg bg-grey-darken-4"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height bg-grey-darken-3">
              <v-icon size="36" color="var(--sidebar-text-secondary)" style="opacity: 0.5;">
                mdi-album
              </v-icon>
            </div>
          </template>
        </v-img>
        <div v-else class="fallback-cover-grid d-flex align-center justify-center w-100 h-100">
          <v-icon
            size="44"
            :color="album.isHymnal ? '#009fe3' : 'var(--sidebar-text-secondary)'"
            :style="!album.isHymnal ? 'opacity: 0.6;' : ''"
          >
            {{ album.isHymnal ? 'mdi-book-cross' : 'mdi-album' }}
          </v-icon>
        </div>
      </div>

      <span class="album-title font-weight-bold w-100 px-1" :title="album.name">
        {{ album.name }}
      </span>
      <span class="album-subtitle text-caption text-truncate w-100 px-1">
        {{ album.subtitle || album.categoryName || '' }}
      </span>
    </div>

    <!-- Status ou Ação no rodapé do card -->
    <div
      class="album-card-footer mt-4 d-flex align-center justify-center w-100"
      @click.stop
    >
      <div v-if="album.status === 'downloaded'" class="status-badge-downloaded d-flex align-center px-3 py-1 rounded-pill">
        <v-icon
          start
          size="13"
          class="mr-1"
          color="#4caf50"
        >
          mdi-check-circle
        </v-icon>
        <span>{{ $t('modules.sync.downloaded') }}</span>
      </div>

      <v-btn
        v-else-if="album.status === 'idle'"
        variant="flat"
        size="x-small"
        height="28"
        class="btn-download-action text-none font-weight-bold rounded-pill px-3.5"
        prepend-icon="mdi-arrow-down"
        @click="$emit('download', album)"
      >
        {{ $t('modules.sync.download') }}
      </v-btn>

      <div v-else-if="album.status === 'downloading'" class="w-100 px-1">
        <v-progress-linear
          :model-value="album.progress"
          color="primary"
          height="4"
          rounded
          striped
        />
      </div>

      <v-btn
        v-else-if="album.status === 'error'"
        color="warning"
        variant="tonal"
        size="x-small"
        height="28"
        class="text-none font-weight-bold rounded-pill px-3"
        @click="$emit('download', album)"
      >
        {{ $t('modules.sync.try_again') }}
      </v-btn>
    </div>
  </div>
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
    isSelected: {
      type: Boolean,
      default: false,
    },
    viewMode: {
      type: String as PropType<"list" | "grid">,
      default: "list",
    },
  },
  emits: ["select", "download", "cancel", "delete", "play", "open-folder"],
});
</script>

<style scoped>
.sync-album-item-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid transparent;
  border-radius: 10px !important;
  padding: 13px 18px !important;
  margin-bottom: 10px !important;
  min-height: 74px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sync-album-item-row:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(255, 255, 255, 0.08);
}

.sync-album-item-row.is-selected {
  background: rgba(0, 159, 227, 0.09) !important;
  border-color: var(--accent-blue, #009fe3) !important;
  box-shadow: 0 0 16px rgba(0, 159, 227, 0.12);
}

.album-cover-box {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.fallback-cover {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}

.album-title {
  color: var(--sidebar-text, #ffffff);
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.album-subtitle {
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.6));
  font-size: 0.82rem;
  line-height: 1.35;
  margin-top: 3px;
}

.status-badge-downloaded {
  background: rgba(46, 125, 50, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.35);
  color: #4caf50;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  height: 28px;
}

.btn-download-action {
  background: rgba(0, 159, 227, 0.15) !important;
  border: 1px solid rgba(0, 159, 227, 0.35);
  color: #009fe3 !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
  height: 30px !important;
  transition: all 0.2s ease;
}

.btn-download-action:hover {
  background: var(--accent-blue, #009fe3) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0, 159, 227, 0.35);
}

.album-size-label {
  color: var(--sidebar-text-secondary);
  font-size: 0.80rem;
  min-width: 54px;
  text-align: right;
  display: inline-block;
  user-select: none;
}

.action-more-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-more-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.08);
}

/* Modo Grade */
.sync-album-card-grid {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px !important;
  padding: 13px 13px 15px 13px !important;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.sync-album-card-grid:hover {
  background: rgba(255, 255, 255, 0.065);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

.sync-album-card-grid.is-selected {
  background: rgba(0, 159, 227, 0.1) !important;
  border-color: var(--accent-blue, #009fe3) !important;
  box-shadow: 0 0 16px rgba(0, 159, 227, 0.18) !important;
  transform: none !important;
}

.album-cover-box-grid {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-bottom: 14px;
}

.fallback-cover-grid {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}

.sync-album-card-grid .album-title {
  font-size: 0.90rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--sidebar-text, #ffffff);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.16rem;
  text-align: center;
}

.sync-album-card-grid .album-subtitle {
  font-size: 0.74rem !important;
  color: var(--sidebar-text-secondary, #94a3b8);
  line-height: 1.2;
  text-align: center;
  display: block;
  margin-top: 2px !important;
}

.album-card-footer {
  border-top: none;
  min-height: 30px;
  margin-top: 14px !important;
  margin-bottom: 2px !important;
}

.sync-album-card-grid .status-badge-downloaded {
  height: 28px;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0 12px !important;
}

.sync-album-card-grid .btn-download-action {
  height: 28px !important;
  font-size: 0.74rem !important;
  font-weight: 600 !important;
  padding: 0 14px !important;
}

/* Adaptabilidade Tema Claro - SyncAlbumItem */
:root[data-theme="light"] .sync-album-item-row:hover,
.v-theme--light .sync-album-item-row:hover {
  background: rgba(0, 0, 0, 0.035);
  border-color: rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .album-cover-box,
.v-theme--light .album-cover-box {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .fallback-cover,
.v-theme--light .fallback-cover {
  background: rgba(0, 0, 0, 0.04);
}

:root[data-theme="light"] .action-more-btn:hover,
.v-theme--light .action-more-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .sync-album-card-grid,
.v-theme--light .sync-album-card-grid {
  background: rgba(0, 0, 0, 0.025);
  border-color: rgba(0, 0, 0, 0.07);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

:root[data-theme="light"] .sync-album-card-grid:hover,
.v-theme--light .sync-album-card-grid:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .sync-album-card-grid.is-selected,
.v-theme--light .sync-album-card-grid.is-selected {
  background: rgba(0, 159, 227, 0.08) !important;
  border-color: #0284c7 !important;
  box-shadow: 0 0 16px rgba(0, 159, 227, 0.15) !important;
}

:root[data-theme="light"] .album-cover-box-grid,
.v-theme--light .album-cover-box-grid {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .fallback-cover-grid,
.v-theme--light .fallback-cover-grid {
  background: rgba(0, 0, 0, 0.04);
}
</style>

<style lang="scss">
/* Menu de opções teletransportado padrão Louvor JA (conforme Coletâneas Personalizadas) */
.search-filter-popover {
  background: var(--ds-surface, #232733) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35) !important;
  padding: 6px !important;
  min-width: 170px;
  backdrop-filter: blur(12px);

  .filter-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 4px 6px;
  }

  .filter-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--sidebar-text, #E1E7EF);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;

    .filter-label {
      font-size: 13px;
      font-weight: 500;
    }

    &:hover {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
      color: var(--ds-accent, #009be2);

      .filter-label {
        color: var(--ds-accent, #009be2);
      }
    }

    &.active {
      background: rgba(0, 155, 226, 0.14) !important;
      color: var(--ds-accent, #009be2) !important;
      font-weight: 600;

      .filter-label {
        font-weight: 600;
      }
    }

    &.text-error-item:hover {
      background: rgba(244, 67, 54, 0.1) !important;
      color: #F44336 !important;

      .filter-label,
      .text-error {
        color: #F44336 !important;
      }
    }

    .text-error {
      color: #ef4444;
    }
  }
}

// Suporte ao tema claro
:root[data-theme="light"],
.v-theme--light {
  .search-filter-popover {
    background: #FFFFFF !important;
    border: 1px solid var(--ds-border, #E2E8F0) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;

    .filter-divider {
      background: rgba(0, 0, 0, 0.06);
    }

    .filter-item {
      color: var(--ds-text-primary, #334155);

      .filter-label {
        color: var(--ds-text-primary, #334155);
      }

      &:hover {
        background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
        color: var(--ds-accent, #009be2);

        .filter-label {
          color: var(--ds-accent, #009be2);
        }
      }

      &.text-error-item:hover {
        background: rgba(244, 67, 54, 0.1) !important;
        color: #F44336 !important;

        .filter-label,
        .text-error {
          color: #F44336 !important;
        }
      }

      .text-error {
        color: #ef4444;
      }
    }
  }
}
</style>
