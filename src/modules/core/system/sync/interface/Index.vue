<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page d-flex align-center justify-center bg-transparent" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; background: rgba(0,0,0,0.5) !important; backdrop-filter: blur(4px);">
      <!-- Layout Reformulado da Biblioteca Local (3 Colunas Conforme Mockup Aprovado) -->
      <v-card
        class="sync-modal-container overflow-hidden elevation-24 d-flex flex-column"
        width="90%"
        max-width="1220"
      >
        <!-- 1. CABEÇALHO DO MODAL -->
        <div class="sync-header px-6 py-4 flex-shrink-0 d-flex align-center justify-space-between">
          <!-- Esquerda: Ícone + Título + Subtítulo -->
          <div class="d-flex align-center">
            <v-icon
              size="38"
              color="#009fe3"
              class="mr-5 flex-shrink-0"
            >
              mdi-library
            </v-icon>
            <div>
              <h2 class="sync-header-title font-weight-bold mb-0">
                {{ $t('modules.sync.title') }}
              </h2>
              <span class="sync-header-subtitle">
                {{ $t('modules.sync.subtitle') }}
              </span>
            </div>
          </div>

          <!-- Direita: Indicador de Armazenamento + Baixar Todas + Fechar -->
          <div class="d-flex align-center gap-3">
            <!-- Widget Dinâmico de Armazenamento -->
            <div
              v-if="appDataSize !== null"
              class="storage-header-widget d-flex align-center px-4 py-2 mr-2"
            >
              <v-icon
                size="22"
                color="var(--sidebar-text-secondary)"
                class="mr-3"
              >
                mdi-harddisk
              </v-icon>
              <div class="d-flex flex-column" style="min-width: 120px;">
                <span class="text-caption font-weight-medium mb-1" style="color: var(--sidebar-text); font-size: 0.78rem; line-height: 1;">
                  {{ formattedAppDataSize }} / {{ formattedTotalDiskSize }}
                </span>
                <v-progress-linear
                  :model-value="storageDiskPercent"
                  color="#009fe3"
                  bg-color="var(--border-color, rgba(128, 128, 128, 0.2))"
                  height="4"
                  rounded
                />
              </div>
            </div>

            <!-- Botão Baixar Todas / Cancelar Todas / Todas Baixadas -->
            <transition name="fade" mode="out-in">
              <v-btn
                v-if="categoriesWithAlbums.length > 0 && !isDownloadingAll && !hasNoIdleAlbums"
                color="primary"
                variant="flat"
                height="38"
                class="btn-primary-action text-none font-weight-bold px-4"
                prepend-icon="mdi-cloud-download"
                @click="downloadAllAlbums"
              >
                {{ $t('modules.sync.download_all') }}
              </v-btn>
              <v-btn
                v-else-if="categoriesWithAlbums.length > 0 && !isDownloadingAll && hasNoIdleAlbums"
                color="success"
                variant="tonal"
                height="38"
                class="btn-primary-action text-none font-weight-bold px-4"
                style="pointer-events: none; opacity: 0.9;"
                prepend-icon="mdi-check-all"
              >
                {{ $t('modules.sync.all_downloaded') }}
              </v-btn>
              <v-btn
                v-else-if="categoriesWithAlbums.length > 0 && isDownloadingAll"
                color="error"
                variant="flat"
                height="38"
                class="btn-primary-action text-none font-weight-bold px-4"
                prepend-icon="mdi-close-circle-outline"
                @click="cancelAll"
              >
                {{ $t('modules.sync.cancel_all') }}
              </v-btn>
            </transition>

            <!-- Botão Fechar -->
            <v-btn
              variant="text"
              size="small"
              class="modal-close-btn"
              @click="closeModule"
            >
              <v-icon size="20">
                mdi-close
              </v-icon>
              <v-tooltip
                activator="parent"
                location="bottom"
                open-delay="300"
                content-class="sync-tooltip"
              >
                {{ $t('modules.sync.close') }} (Esc)
              </v-tooltip>
            </v-btn>
          </div>
        </div>

        <!-- 2. CORPO DO MODAL - 3 COLUNAS -->
        <div class="sync-body-grid d-flex flex-grow-1 min-h-0 overflow-hidden">
          <!-- COLUNA 1: NAVEGAÇÃO LATERAL (CATEGORIAS) -->
          <div class="sync-sidebar-left d-flex flex-column h-100 flex-shrink-0">
            <div class="d-flex flex-column pa-4 overflow-y-auto sync-scroll-area flex-grow-1 min-h-0">
              <!-- Botão "Todas" -->
              <div
                class="category-nav-item d-flex align-center justify-space-between cursor-pointer"
                :class="{ 'is-active': selectedCategory === 'all' }"
                @click="selectedCategory = 'all'"
              >
                <div class="d-flex align-center text-truncate mr-2">
                  <v-icon
                    size="20"
                    class="mr-3 flex-shrink-0"
                    :color="selectedCategory === 'all' ? '#009fe3' : 'inherit'"
                  >
                    mdi-file-document-outline
                  </v-icon>
                  <span class="font-weight-medium text-truncate">{{ $t('modules.sync.all_categories') }}</span>
                </div>
                <span class="category-badge flex-shrink-0">
                  {{ totalAlbumsCount }}
                </span>
              </div>

              <!-- Título da Seção: CATEGORIAS -->
              <span class="sidebar-section-title text-uppercase">
                {{ $t('modules.sync.categories') }}
              </span>

              <!-- Lista dinâmica de categorias do catálogo -->
              <div
                v-for="cat in categoriesWithCounts"
                :key="cat.id"
                class="category-nav-item d-flex align-center justify-space-between cursor-pointer"
                :class="{ 'is-active': selectedCategory === cat.id }"
                @click="selectedCategory = cat.id"
              >
                <div class="d-flex align-center text-truncate mr-2">
                  <v-icon
                    size="20"
                    class="mr-3 flex-shrink-0"
                    :color="selectedCategory === cat.id ? '#009fe3' : 'inherit'"
                  >
                    {{ cat.icon }}
                  </v-icon>
                  <span class="font-weight-medium text-truncate" :title="cat.name">{{ cat.name }}</span>
                </div>
                <span class="category-badge flex-shrink-0">
                  {{ cat.count }}
                </span>
              </div>
            </div>
          </div>

          <!-- ÁREA PRINCIPAL DIREITA (TOOLBAR SUPERIOR + CATÁLOGO E DETALHES EMBAIXO) -->
          <div class="sync-main-area d-flex flex-column flex-grow-1 min-w-0 min-h-0">
            <!-- Barra de ferramentas superior unificada (Ocupa até o canto direito!) -->
            <div class="catalog-toolbar px-6 py-3.5 d-flex align-center flex-shrink-0" style="gap: 12px;">
              <!-- Campo de busca (Ocupa todo o restante do espaço) -->
              <v-text-field
                v-model="searchQuery"
                :placeholder="$t('modules.sync.search_placeholder')"
                density="compact"
                variant="solo"
                rounded="lg"
                color="primary"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="standard-text-input flex-grow-1"
                style="min-width: 0;"
              >
                <template #append-inner>
                  <v-btn
                    v-if="searchQuery"
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    class="clear-search-btn"
                    title="Limpar pesquisa"
                    @click="searchQuery = ''"
                  />
                </template>
              </v-text-field>

              <!-- Filtro de Estado (Mesmo tamanho que o filtro de ordem) -->
              <v-select
                v-model="statusFilter"
                :items="statusFilterOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="solo"
                rounded="lg"
                color="primary"
                hide-details
                class="standard-text-input filter-select-fixed flex-shrink-0"
                :menu-props="{ contentClass: 'compact-filter-menu', transition: 'fade-transition', offset: 4 }"
              >
                <template #selection="{ item }">
                  <span class="text-body-2 font-weight-medium text-truncate">{{ item.title }}</span>
                </template>
                <template #item="{ item, props: itemProps }">
                  <v-list-item
                    v-bind="itemProps"
                    :title="undefined"
                    density="compact"
                    class="mx-1 rounded-md"
                    style="min-height: 32px; height: 32px;"
                    color="primary"
                  >
                    <template #title>
                      <span
                        class="text-caption font-weight-medium text-truncate"
                        style="font-size: 0.84rem !important; line-height: 1.2;"
                        :class="item.value === statusFilter ? 'text-primary font-weight-bold' : 'opacity-75'"
                      >
                        {{ item.title }}
                      </span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Ordenação (Mesmo tamanho que o filtro de estado) -->
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="solo"
                rounded="lg"
                color="primary"
                hide-details
                class="standard-text-input filter-select-fixed flex-shrink-0"
                :menu-props="{ contentClass: 'compact-filter-menu', transition: 'fade-transition', offset: 4 }"
              >
                <template #selection="{ item }">
                  <span class="text-body-2 font-weight-medium text-truncate">{{ item.title }}</span>
                </template>
                <template #item="{ item, props: itemProps }">
                  <v-list-item
                    v-bind="itemProps"
                    :title="undefined"
                    density="compact"
                    class="mx-1 rounded-md"
                    style="min-height: 32px; height: 32px;"
                    color="primary"
                  >
                    <template #title>
                      <span
                        class="text-caption font-weight-medium text-truncate"
                        style="font-size: 0.84rem !important; line-height: 1.2;"
                        :class="item.value === sortBy ? 'text-primary font-weight-bold' : 'opacity-75'"
                      >
                        {{ item.title }}
                      </span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Alternador Grade / Lista -->
              <div class="view-mode-toggle d-flex align-center pa-1 flex-shrink-0">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  class="view-toggle-btn"
                  :class="{ 'view-active': viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  <v-icon size="18">
                    mdi-view-grid-outline
                  </v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="sync-tooltip"
                  >
                    {{ $t('modules.sync.view_grid') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  class="view-toggle-btn"
                  :class="{ 'view-active': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  <v-icon size="18">
                    mdi-format-list-bulleted
                  </v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="sync-tooltip"
                  >
                    {{ $t('modules.sync.view_list') }}
                  </v-tooltip>
                </v-btn>
              </div>
            </div>

            <!-- Área Inferior Dividida: Catálogo Central + Card de Detalhes -->
            <div class="d-flex flex-grow-1 min-h-0 overflow-hidden">
              <!-- Catálogo Central (Lista ou Grade) -->
              <div class="catalog-content-scroll px-6 py-4 flex-grow-1 min-w-0 h-100 overflow-y-auto sync-scroll-area">
                <div v-if="loadingList" class="d-flex flex-column align-center justify-center py-12">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="40"
                    class="mb-3"
                  />
                  <span class="text-caption" style="color: var(--sidebar-text-secondary);">Carregando coletâneas...</span>
                </div>

                <!-- Lista em Modo Linhas (Padrão) -->
                <div v-else-if="viewMode === 'list' && filteredAlbums.length > 0">
                  <SyncAlbumItem
                    v-for="album in filteredAlbums"
                    :key="album.id_album"
                    :album="album"
                    :is-selected="selectedAlbum?.id_album === album.id_album"
                    view-mode="list"
                    @select="selectAlbum"
                    @download="downloadAlbum"
                    @cancel="cancelAlbum"
                    @delete="deleteAlbum"
                    @play="playAlbum"
                    @open-folder="openAlbumFolder"
                  />
                </div>

                <!-- Lista em Modo Grade (Grid) -->
                <div v-else-if="viewMode === 'grid' && filteredAlbums.length > 0" class="sync-grid-container">
                  <SyncAlbumItem
                    v-for="album in filteredAlbums"
                    :key="album.id_album"
                    :album="album"
                    :is-selected="selectedAlbum?.id_album === album.id_album"
                    view-mode="grid"
                    @select="selectAlbum"
                    @download="downloadAlbum"
                    @cancel="cancelAlbum"
                    @delete="deleteAlbum"
                    @play="playAlbum"
                    @open-folder="openAlbumFolder"
                  />
                </div>

                <!-- Estado Vazio -->
                <div v-else-if="!loadingList && filteredAlbums.length === 0" class="d-flex flex-column align-center justify-center py-12 text-center h-100">
                  <div class="empty-icon-circle mb-3">
                    <v-icon
                      size="34"
                      color="primary"
                    >
                      mdi-music-box-multiple-outline
                    </v-icon>
                  </div>
                  <h3 class="text-subtitle-1 font-weight-bold mb-1" style="color: var(--sidebar-text);">
                    {{ $t('modules.sync.no_results') }}
                  </h3>
                  <p class="text-caption mb-4" style="color: var(--sidebar-text-secondary); max-width: 320px;">
                    Nenhuma coletânea corresponde à categoria ou busca selecionada.
                  </p>
                  <v-btn
                    variant="tonal"
                    color="primary"
                    rounded="lg"
                    height="36"
                    prepend-icon="mdi-filter-remove-outline"
                    class="text-none font-weight-medium px-4"
                    @click="clearFilters"
                  >
                    {{ $t('modules.sync.clear_filters') }}
                  </v-btn>
                </div>
              </div>

              <!-- Painel Direito: Card de Detalhes do Álbum (Container Menor e Flutuante) -->
              <div class="sync-details-column flex-shrink-0 h-100 overflow-hidden d-flex flex-column pa-4" style="width: 275px;">
                <div v-if="selectedAlbum" class="album-details-card pa-4 d-flex flex-column align-start text-left h-100">
                  <!-- Capa Grande -->
                  <div class="detail-cover-box mb-3 overflow-hidden position-relative align-self-center">
                    <v-img
                      v-if="selectedAlbum.coverUrl"
                      :src="selectedAlbum.coverUrl"
                      cover
                      width="160"
                      height="160"
                      class="rounded-xl bg-grey-darken-4"
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height bg-grey-darken-3">
                          <v-icon
                            size="44"
                            color="var(--sidebar-text-secondary)"
                            style="opacity: 0.5;"
                          >
                            mdi-album
                          </v-icon>
                        </div>
                      </template>
                    </v-img>
                    <div v-else class="detail-fallback-cover d-flex align-center justify-center">
                      <v-icon
                        size="60"
                        :color="selectedAlbum.isHymnal ? '#009fe3' : 'var(--sidebar-text-secondary)'"
                        :style="!selectedAlbum.isHymnal ? 'opacity: 0.6;' : ''"
                      >
                        {{ selectedAlbum.isHymnal ? 'mdi-book-open-page-variant-outline' : 'mdi-album' }}
                      </v-icon>
                    </div>
                  </div>

                  <!-- Título e Subtítulo (Alinhados à Esquerda conforme Mockup) -->
                  <h3 class="album-detail-title font-weight-bold mb-1 w-100 text-left">
                    {{ selectedAlbum.name }}
                  </h3>
                  <p class="album-detail-subtitle text-caption mb-3 w-100 text-left">
                    {{ selectedAlbum.subtitle || selectedAlbum.categoryName || '' }}
                  </p>

                  <!-- Badge de Status e Botão Excluir (Alinhados nas extremidades) -->
                  <div class="d-flex align-center justify-space-between mb-3 w-100" style="min-height: 32px;">
                    <div v-if="selectedAlbum.status === 'downloaded'" class="status-badge-downloaded d-flex align-center px-3 py-1 rounded-pill">
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
                    <div v-else-if="selectedAlbum.status === 'downloading'" class="status-badge-downloading d-flex align-center px-3 py-1 rounded-pill">
                      <v-icon
                        start
                        size="14"
                        class="mr-1.5"
                        color="#009fe3"
                      >
                        mdi-cloud-download
                      </v-icon>
                      <span>{{ selectedAlbum.progress }}%</span>
                    </div>
                    <div v-else class="status-badge-idle d-flex align-center px-3 py-1 rounded-pill">
                      <v-icon
                        start
                        size="14"
                        class="mr-1.5"
                        color="var(--sidebar-text-secondary)"
                      >
                        mdi-cloud-outline
                      </v-icon>
                      <span>{{ $t('modules.sync.not_downloaded') }}</span>
                    </div>

                    <!-- Botão de Excluir Coletânea (substituindo os 3 pontinhos) -->
                    <v-btn
                      v-if="selectedAlbum.status === 'downloaded'"
                      icon
                      size="x-small"
                      variant="text"
                      class="album-delete-btn"
                      @click="deleteAlbum(selectedAlbum)"
                    >
                      <v-icon size="18">
                        mdi-delete-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="200"
                        content-class="sync-tooltip"
                      >
                        {{ $t('modules.sync.delete') }}
                      </v-tooltip>
                    </v-btn>
                  </div>

                  <!-- Lista de Metadados -->
                  <div class="w-100 d-flex flex-column gap-1 text-left mb-4">
                    <div class="detail-meta-row d-flex align-center justify-space-between text-caption py-1 w-100">
                      <div class="d-flex align-center" style="color: var(--sidebar-text-secondary);">
                        <v-icon
                          size="16"
                          class="mr-2"
                          color="var(--sidebar-text-secondary)"
                        >
                          mdi-text-box-outline
                        </v-icon>
                        <span>{{ $t('modules.sync.category_label') }}</span>
                      </div>
                      <span class="font-weight-medium" style="color: var(--sidebar-text);">
                        {{ selectedAlbum.categoryName || 'Coletânea' }}
                      </span>
                    </div>

                    <div v-if="selectedAlbum.trackCount || selectedAlbum.totalCount" class="detail-meta-row d-flex align-center justify-space-between text-caption py-1 w-100">
                      <div class="d-flex align-center" style="color: var(--sidebar-text-secondary);">
                        <v-icon
                          size="16"
                          class="mr-2"
                          color="var(--sidebar-text-secondary)"
                        >
                          mdi-headphones
                        </v-icon>
                        <span>{{ selectedAlbum.isHymnal ? 'Hinos' : $t('modules.sync.tracks_label') }}</span>
                      </div>
                      <span class="font-weight-medium" style="color: var(--sidebar-text);">
                        {{ selectedAlbum.trackCount || selectedAlbum.totalCount }}
                      </span>
                    </div>

                    <div class="detail-meta-row d-flex align-center justify-space-between text-caption py-1 w-100">
                      <div class="d-flex align-center" style="color: var(--sidebar-text-secondary);">
                        <v-icon
                          size="16"
                          class="mr-2"
                          color="var(--sidebar-text-secondary)"
                        >
                          mdi-folder-outline
                        </v-icon>
                        <span>{{ $t('modules.sync.size_label') }}</span>
                      </div>
                      <span class="font-weight-medium" style="color: var(--sidebar-text);">
                        {{ selectedAlbum.formattedSize || '---' }}
                      </span>
                    </div>

                    <div class="detail-meta-row d-flex align-center justify-space-between text-caption py-1 w-100">
                      <div class="d-flex align-center" style="color: var(--sidebar-text-secondary);">
                        <v-icon
                          size="16"
                          class="mr-2"
                          color="var(--sidebar-text-secondary)"
                        >
                          mdi-clock-outline
                        </v-icon>
                        <span>Adicionado em</span>
                      </div>
                      <span class="font-weight-medium" style="color: var(--sidebar-text);">
                        {{ selectedAlbum.status === 'downloaded' ? (selectedAlbum.addedAt || '---') : '—' }}
                      </span>
                    </div>
                  </div>

                  <!-- Botões de Ação na base do Card -->
                  <div class="w-100 d-flex flex-column mt-auto" style="gap: 10px;">
                    <!-- Botão Primário Contextual -->
                    <v-btn
                      v-if="selectedAlbum.status === 'downloaded'"
                      color="primary"
                      variant="flat"
                      height="40"
                      class="btn-primary-action text-none font-weight-bold rounded-lg w-100"
                      prepend-icon="mdi-play"
                      @click="playAlbum(selectedAlbum)"
                    >
                      {{ $t('modules.sync.play') }}
                    </v-btn>

                    <v-btn
                      v-else-if="selectedAlbum.status === 'idle'"
                      color="primary"
                      variant="flat"
                      height="40"
                      class="btn-primary-action text-none font-weight-bold rounded-lg w-100"
                      prepend-icon="mdi-arrow-down"
                      @click="downloadAlbum(selectedAlbum)"
                    >
                      {{ $t('modules.sync.download') }}
                    </v-btn>

                    <v-btn
                      v-else-if="selectedAlbum.status === 'downloading'"
                      color="error"
                      variant="tonal"
                      height="40"
                      class="text-none font-weight-bold rounded-lg w-100"
                      prepend-icon="mdi-close"
                      @click="cancelAlbum(selectedAlbum)"
                    >
                      {{ $t('modules.sync.cancel') }}
                    </v-btn>

                    <v-btn
                      v-else-if="selectedAlbum.status === 'error'"
                      color="warning"
                      variant="tonal"
                      height="40"
                      class="text-none font-weight-bold rounded-lg w-100"
                      prepend-icon="mdi-refresh"
                      @click="downloadAlbum(selectedAlbum)"
                    >
                      {{ $t('modules.sync.try_again') }}
                    </v-btn>

                    <!-- Botão Secundário: Abrir Pasta da Coletânea -->
                    <v-btn
                      v-if="selectedAlbum.status === 'downloaded'"
                      variant="flat"
                      height="35"
                      class="detail-action-btn-secondary text-none font-weight-medium rounded-lg w-100"
                      prepend-icon="mdi-folder-open-outline"
                      @click="openAlbumFolder(selectedAlbum)"
                    >
                      {{ $t('modules.sync.open_folder') }}
                    </v-btn>
                  </div>
                </div>

                <!-- Estado Vazio quando nenhuma selecionada -->
                <div v-else class="pa-5 d-flex flex-column align-center justify-center text-center h-100">
                  <v-icon
                    size="48"
                    color="var(--sidebar-text-secondary)"
                    class="mb-3"
                    style="opacity: 0.35;"
                  >
                    mdi-music-box-outline
                  </v-icon>
                  <span class="text-caption" style="color: var(--sidebar-text-secondary); max-width: 200px;">
                    {{ $t('modules.sync.select_collection_hint') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { fetchWithFallback, parseDbVersionFromEnv } from "@/helpers/services/Api";
import $path from "@/helpers/utils/Path";
import $db from "@/helpers/services/Database";
import Logger from "@/helpers/services/Logger";
import manifest from "../manifest";

import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

import SyncAlbumItem from "./components/SyncAlbumItem.vue";
import type { SyncAlbum, SyncCategory } from "./types";

export default defineComponent({
  name: "SyncIndex",
  components: {
    SyncAlbumItem,
  },
  data() {
    return {
      manifest,
      categoriesWithAlbums: [] as SyncCategory[],
      loadingList: false,
      cancelToken: false,
      isDownloadingAll: false,
      hymnalImg,
      hymnal1996Img,
      appDataSize: null as number | null,
      totalDiskSize: 0 as number,
      userDataPath: "",
      
      // Filtros e Interações da Reformulação
      searchQuery: "",
      selectedCategory: "all" as string | number,
      statusFilter: "all" as "all" | "downloaded" | "idle",
      sortBy: "recent" as "recent" | "name_asc" | "name_desc",
      viewMode: "list" as "list" | "grid",
      selectedAlbum: null as SyncAlbum | null,
    };
  },
  computed: {
    dbUpdateAvailable(): boolean {
      return (this as any).$appdata.get("modules.sync.db_update_available") === true;
    },
    dbVersionLocal(): number {
      return (this as any).$appdata.get("modules.sync.db_version_local") || 0;
    },
    dbVersionRemote(): number {
      return (this as any).$appdata.get("modules.sync.db_version_remote") || 0;
    },
    syncView(): string {
      return (this as any).$appdata.get("modules.sync.view") || "library";
    },
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    hasNoIdleAlbums(): boolean {
      return !this.categoriesWithAlbums.some((cat: SyncCategory) => cat.albums.some((a: SyncAlbum) => a.status === "idle"));
    },
    formattedAppDataSize(): string {
      if (this.appDataSize === null) return "";
      if (this.appDataSize === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(this.appDataSize) / Math.log(k));
      return `${parseFloat((this.appDataSize / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },
    formattedTotalDiskSize(): string {
      const size = this.totalDiskSize || 256 * 1024 * 1024 * 1024;
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(size) / Math.log(k));
      return `${parseFloat((size / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`;
    },
    storageDiskPercent(): number {
      if (!this.appDataSize) return 0;
      const total = this.totalDiskSize || 256 * 1024 * 1024 * 1024;
      return Math.min(100, Math.max(1, Math.round((this.appDataSize / total) * 100)));
    },
    allAlbums(): SyncAlbum[] {
      const list: SyncAlbum[] = [];
      for (const cat of this.categoriesWithAlbums) {
        list.push(...cat.albums);
      }
      return list;
    },
    totalAlbumsCount(): number {
      return this.allAlbums.length;
    },
    downloadedAlbumsCount(): number {
      return this.allAlbums.filter(a => a.status === "downloaded").length;
    },
    storageUsagePercent(): number {
      if (this.totalAlbumsCount === 0) return 0;
      return Math.min(100, Math.round((this.downloadedAlbumsCount / this.totalAlbumsCount) * 100));
    },
    categoriesWithCounts(): Array<{ id: string | number; name: string; count: number; icon: string }> {
      return this.categoriesWithAlbums.map(cat => ({
        id: cat.id_category,
        name: cat.name,
        count: cat.albums.length,
        icon: this.getCategoryIcon(cat.name || cat.id_category),
      }));
    },
    statusFilterOptions(): Array<{ title: string; value: string }> {
      return [
        { title: this.$t("modules.sync.filter_all"), value: "all" },
        { title: this.$t("modules.sync.filter_downloaded"), value: "downloaded" },
        { title: this.$t("modules.sync.filter_not_downloaded"), value: "idle" },
      ];
    },
    sortOptions(): Array<{ title: string; value: string }> {
      return [
        { title: this.$t("modules.sync.sort_recent"), value: "recent" },
        { title: this.$t("modules.sync.sort_name_asc"), value: "name_asc" },
        { title: this.$t("modules.sync.sort_name_desc"), value: "name_desc" },
      ];
    },
    filteredAlbums(): SyncAlbum[] {
      let list = this.allAlbums;

      // Filtro por categoria
      if (this.selectedCategory !== "all") {
        list = list.filter(a => String(a.categoryId) === String(this.selectedCategory));
      }

      // Filtro por texto de pesquisa
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toLowerCase();
        list = list.filter(a => 
          a.name.toLowerCase().includes(query) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(query)) ||
          (a.categoryName && a.categoryName.toLowerCase().includes(query)),
        );
      }

      // Filtro por status
      if (this.statusFilter === "downloaded") {
        list = list.filter(a => a.status === "downloaded");
      } else if (this.statusFilter === "idle") {
        list = list.filter(a => a.status === "idle");
      }

      // Ordenação
      const sorted = [...list];
      if (this.sortBy === "name_asc") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === "name_desc") {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
      }

      return sorted;
    },
  },
  async mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.loadAppDataSize();
    this.checkDatabaseVersion();
    await this.loadCollections();
    // Verifica em background se álbuns "idle" já possuem todos os arquivos no disco
    this.verifyIdleAlbumsOnDisk();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !this.isDownloadingAll) {
        this.closeModule();
      }
    },
    async loadAppDataSize() {
      if (window.electronAPI && window.electronAPI.getAppDataSize) {
        try {
          const res = (await window.electronAPI.getAppDataSize()) as any;
          if (typeof res === "number") {
            this.appDataSize = res;
          } else if (res && typeof res === "object") {
            this.appDataSize = res.used || 0;
            if (res.total) this.totalDiskSize = res.total;
            if (res.userDataPath) this.userDataPath = res.userDataPath;
          }
        } catch (e) {
          console.warn("Erro ao carregar tamanho de armazenamento:", e);
        }
      }
      if (!this.userDataPath && Logger && Logger.getSystemDiagnostics) {
        try {
          const diag = await Logger.getSystemDiagnostics();
          if (diag?.app?.userDataPath) {
            this.userDataPath = diag.app.userDataPath;
          }
        } catch {
          // ignora se diagnóstico não estiver disponível
        }
      }
    },
    getCategoryIcon(catIdOrName: string | number): string {
      const name = String(catIdOrName).toLowerCase();
      if (name.includes("hinário") || name === "hymnals") return "mdi-book-open-page-variant-outline";
      if (name.includes("cd") || name.includes("oficia")) return "mdi-album";
      if (name.includes("coletânea")) return "mdi-music";
      if (name.includes("ministério") || name.includes("cantores") || name.includes("adoradores")) return "mdi-account-group-outline";
      if (name.includes("infantil") || name.includes("infantis")) return "mdi-teddy-bear";
      if (name.includes("doxologia")) return "mdi-church";
      return "mdi-folder-outline";
    },
    selectAlbum(album: SyncAlbum) {
      this.selectedAlbum = album;
      this.updateAlbumTrackCount(album);
      this.updateAlbumDetails(album);
    },
    async updateAlbumTrackCount(album: SyncAlbum) {
      if (!album) return;
      try {
        if (album.isHymnal) {
          const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
          if (hymnalData && Array.isArray(hymnalData)) {
            album.trackCount = hymnalData.length;
          }
        } else {
          const albumData = (await $db.get(`album_${album.id_album}`)) as any;
          if (albumData && albumData.musics && Array.isArray(albumData.musics)) {
            album.trackCount = albumData.musics.length;
          }
        }
      } catch (e) {
        console.warn("Erro ao buscar faixas do album:", e);
      }
    },
    async updateAlbumDetails(album: SyncAlbum) {
      if (!album) return;
      if (!album.formattedSize || !album.folderPath || (album.status === "downloaded" && !album.addedAt)) {
        if (window.electronAPI?.getAlbumsDetails) {
          try {
            const detailsMap = (await window.electronAPI.getAlbumsDetails(this.$i18n.locale)) as Record<string, { sizeBytes: number; formattedSize: string; addedAt?: string; folderPath?: string }>;
            const key = String(album.id_album);
            const details = detailsMap?.[key] || (album.isHymnal ? detailsMap?.[`${key}_${this.$i18n.locale}`] : undefined);
            if (details) {
              if (!album.formattedSize) album.formattedSize = details.formattedSize;
              if (!album.sizeBytes) album.sizeBytes = details.sizeBytes;
              if (details.addedAt) album.addedAt = details.addedAt;
              if (details.folderPath) album.folderPath = details.folderPath;
            }
          } catch (e) {
            console.warn("Erro ao buscar detalhes do álbum:", e);
          }
        }
      }
    },
    playAlbum(album: SyncAlbum) {
      if (!album) return;
      if (album.isHymnal) {
        this.$modules.open(album.id_album as string);
      } else {
        this.$media.openAlbum(album.id_album);
      }
      this.closeModule();
    },
    async openAlbumFolder(album?: SyncAlbum | null) {
      if (!window.electronAPI?.openPath) return;
      try {
        const target = album || this.selectedAlbum;
        if (target?.folderPath) {
          await window.electronAPI.openPath(target.folderPath);
          return;
        }

        if (target && window.electronAPI.getAlbumsDetails) {
          const detailsMap = (await window.electronAPI.getAlbumsDetails(this.$i18n.locale)) as Record<string, { sizeBytes: number; formattedSize: string; addedAt?: string; folderPath?: string }>;
          const key = String(target.id_album);
          const details = detailsMap?.[key] || (target.isHymnal ? detailsMap?.[`${key}_${this.$i18n.locale}`] : undefined);
          if (details?.folderPath) {
            target.folderPath = details.folderPath;
            await window.electronAPI.openPath(details.folderPath);
            return;
          }
        }

        const folder = this.userDataPath ? `${this.userDataPath}/Media/musics` : "";
        if (folder) {
          await window.electronAPI.openPath(folder);
        } else {
          await window.electronAPI.openPath("");
        }
      } catch (e) {
        console.error("Erro ao abrir pasta do álbum:", e);
      }
    },
    openMediaFolder(album?: SyncAlbum | null) {
      this.openAlbumFolder(album || this.selectedAlbum);
    },
    clearFilters() {
      this.searchQuery = "";
      this.selectedCategory = "all";
      this.statusFilter = "all";
      this.sortBy = "recent";
    },
    async checkDatabaseVersion() {
      if (!window.electronAPI) return;
      try {
        const response = await fetchWithFallback("/params?type=env");
        const text = await response.text();
        const remoteVersion = parseDbVersionFromEnv(text);
        if (remoteVersion > 0) {
          const localConfig = await window.electronAPI.getLocalDb("config") as any;
          const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version) 
            ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10) 
            : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion(this.$i18n.locale) : 0);
          
          (this as any).$appdata.set("modules.sync.db_version_local", localVersion);
          (this as any).$appdata.set("modules.sync.db_version_remote", remoteVersion);
          if (remoteVersion > localVersion) {
            (this as any).$appdata.set("modules.sync.db_update_available", true);
          } else {
            (this as any).$appdata.set("modules.sync.db_update_available", false);
          }
        }
      } catch (e) {
        console.error("Erro ao verificar versão do banco:", e);
      }
    },
    closeModule() {
      this.$modules.close(this.module_id);
    },
    async loadCollections() {
      if (!window.electronAPI || !window.electronAPI.isElectron) return;
      this.loadingList = true;
      
      try {
        const categories = (await $db.get(`${this.$i18n.locale}_categories`)) as any[];
        const downloadedManifest = ((await window.electronAPI.getLocalDb("dla")) as any[]) || [];
        
        if (!categories || !Array.isArray(categories)) {
          this.loadingList = false;
          return;
        }
        
        const result: SyncCategory[] = [];
        
        const hymnalsList: SyncAlbum[] = [];
        const hymnal = (await $db.get(`${this.$i18n.locale}_hymnal`)) as any[];
        const hymnal1996 = (await $db.get(`${this.$i18n.locale}_hymnal_1996`)) as any[];
        
        if (hymnal && hymnal.length > 0) {
          hymnalsList.push({
            id_album: "hymnal",
            name: this.$t("modules.sync.hymnal_name"),
            subtitle: this.$t("modules.sync.hymnal_subtitle", { count: hymnal.length }),
            coverUrl: this.$i18n.locale === "es" ? this.hymnal1996Img : this.hymnalImg,
            status: downloadedManifest.includes(`hymnal_${this.$i18n.locale}`) || (this.$i18n.locale === "pt" && downloadedManifest.includes("hymnal")) ? "downloaded" : "idle",
            progress: 0,
            totalCount: hymnal.length,
            downloadedCount: 0,
            isHymnal: true,
            categoryId: "hymnals",
            categoryName: this.$t("modules.sync.hymnals_category"),
            trackCount: hymnal.length,
          });
        }
        
        if (hymnal1996 && hymnal1996.length > 0) {
          hymnalsList.push({
            id_album: "hymnal_1996",
            name: this.$t("modules.sync.hymnal_1996_name"),
            subtitle: this.$t("modules.sync.hymnal_1996_subtitle", { count: hymnal1996.length }),
            coverUrl: this.hymnal1996Img,
            status: downloadedManifest.includes(`hymnal_1996_${this.$i18n.locale}`) || (this.$i18n.locale === "pt" && downloadedManifest.includes("hymnal_1996")) ? "downloaded" : "idle",
            progress: 0,
            totalCount: hymnal1996.length,
            downloadedCount: 0,
            isHymnal: true,
            categoryId: "hymnals",
            categoryName: this.$t("modules.sync.hymnals_category"),
            trackCount: hymnal1996.length,
          });
        }
        
        if (hymnalsList.length > 0) {
          result.push({
            id_category: "hymnals",
            name: this.$t("modules.sync.hymnals_category"),
            icon: "mdi-book-cross",
            albums: hymnalsList,
          });
        }
        
        for (const cat of categories) {
          if (this.$i18n.locale === "es") continue;
          if (!cat.albums || cat.albums.length === 0) continue;
          
          const albumsList: SyncAlbum[] = [];
          for (const a of cat.albums) {
            if ([712, 629, 713].includes(a.id_album as number)) continue;
            
            let coverUrl = null;
            if (a.url_image) {
              const imgRelativePath = (a.url_image as string).replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/?(musics|images|covers)\//i, "");
              const localCheck = await window.electronAPI?.checkMedia("covers", imgRelativePath);
              coverUrl = (localCheck === false ? null : localCheck) || $path.file(a.url_image);
            }
            
            albumsList.push({
              id_album: a.id_album,
              name: a.name,
              subtitle: a.subtitle || (a.year ? `${cat.name} • ${a.year}` : cat.name),
              coverUrl,
              rawCoverUrl: a.url_image,
              status: downloadedManifest.includes(a.id_album) ? "downloaded" : "idle",
              progress: 0,
              totalCount: a.musics_count || 0,
              downloadedCount: 0,
              isHymnal: false,
              categoryId: cat.id_category,
              categoryName: cat.name,
              year: a.year,
              trackCount: a.musics_count || 0,
            });
          }
          if (albumsList.length > 0) {
            result.push({
              id_category: cat.id_category,
              name: cat.name,
              icon: this.getCategoryIcon(cat.name),
              albums: albumsList,
            });
          }
        }
        
        // Ordenação personalizada
        const orderMap: Record<string, number> = {
          hymnals: 1,
          Hinários: 1,
          "CDs Oficiais/Ano": 2,
          Infantis: 98,
          Doxologia: 99,
        };
        
        result.sort((a, b) => {
          const orderA = orderMap[a.id_category] || orderMap[a.name] || 50;
          const orderB = orderMap[b.id_category] || orderMap[b.name] || 50;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });

        if (window.electronAPI?.getAlbumsDetails) {
          try {
            const detailsMap = (await window.electronAPI.getAlbumsDetails(this.$i18n.locale)) as Record<string, { sizeBytes: number; formattedSize: string; addedAt?: string; folderPath?: string }>;
            if (detailsMap) {
              for (const cat of result) {
                for (const album of cat.albums) {
                  const key = String(album.id_album);
                  const details = detailsMap[key] || (album.isHymnal ? detailsMap[`${key}_${this.$i18n.locale}`] : undefined);
                  if (details) {
                    album.sizeBytes = details.sizeBytes;
                    album.formattedSize = details.formattedSize;
                    if (details.addedAt) {
                      album.addedAt = details.addedAt;
                    }
                    if (details.folderPath) {
                      album.folderPath = details.folderPath;
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.warn("Erro ao buscar detalhes de tamanho dos albuns:", err);
          }
        }

        this.categoriesWithAlbums = result;

        // Seleciona a primeira coletânea por padrão se nenhuma estiver selecionada
        if (!this.selectedAlbum && this.filteredAlbums.length > 0) {
          this.selectAlbum(this.filteredAlbums[0]);
        }
      } catch (e) {
        console.error("Erro ao carregar coletâneas:", e);
      }
      
      this.loadingList = false;
    },
    async verifyIdleAlbumsOnDisk() {
      if (!window.electronAPI || !window.electronAPI.checkMedia) return;

      const idleAlbums: SyncAlbum[] = [];
      for (const cat of this.categoriesWithAlbums) {
        for (const album of cat.albums) {
          if (album.status === "idle") {
            idleAlbums.push(album);
          }
        }
      }

      if (idleAlbums.length === 0) return;

      for (const album of idleAlbums) {
        try {
          let musicFiles: string[] = [];
          let slideFiles: string[] = [];

          if (album.isHymnal) {
            const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
            if (!hymnalData || !Array.isArray(hymnalData)) continue;

            for (const song of hymnalData) {
              const musicData = (await $db.get(`music_${song.id_music}`)) as any;
              if (musicData) {
                if (musicData.url_music) musicFiles.push(musicData.url_music);
                if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                if (musicData.url_image) slideFiles.push(musicData.url_image);
                if (musicData.lyric) {
                  musicData.lyric.forEach((l: any) => {
                    if (l.url_image) slideFiles.push(l.url_image);
                  });
                }
              }
            }
          } else {
            const albumData = (await $db.get(`album_${album.id_album}`)) as any;
            if (!albumData || !albumData.musics || !Array.isArray(albumData.musics)) continue;

            for (const song of albumData.musics) {
              const musicData = (await $db.get(`music_${song.id_music}`)) as any;
              if (musicData) {
                if (musicData.url_music) musicFiles.push(musicData.url_music);
                if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                if (musicData.url_image) slideFiles.push(musicData.url_image);
                if (musicData.lyric) {
                  musicData.lyric.forEach((l: any) => {
                    if (l.url_image) slideFiles.push(l.url_image);
                  });
                }
              }
            }
          }

          musicFiles = [...new Set(musicFiles)];
          slideFiles = [...new Set(slideFiles)];

          const allMediaFiles = [
            ...musicFiles.map(url => ({ url, type: "music" })),
            ...slideFiles.map(url => ({ url, type: "slides" })),
          ];

          if (album.rawCoverUrl) {
            allMediaFiles.push({ url: album.rawCoverUrl, type: "covers" });
          }

          if (allMediaFiles.length === 0) {
            album.status = "downloaded";
            await this.markAlbumDownloaded(album.id_album, album.isHymnal);
            continue;
          }

          // Verifica se todos os arquivos existem no disco
          let allExist = true;
          for (const media of allMediaFiles) {
            const relativePath = media.url.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/?(musics|images|covers)\//i, "");
            const exists = await window.electronAPI.checkMedia(media.type, relativePath);
            if (!exists) {
              allExist = false;
              break;
            }
          }

          if (allExist) {
            album.status = "downloaded";
            await this.markAlbumDownloaded(album.id_album, album.isHymnal);
          }
        } catch (e) {
          console.warn(`[Sync] Erro ao verificar álbum ${album.id_album}:`, e);
        }
      }
    },
    checkGlobalDownloadState() {
      const isDownloading = this.categoriesWithAlbums.some(cat => cat.albums.some(a => a.status === "downloading"));
      this.$appdata.set("sync_is_downloading", isDownloading);
    },
    async downloadAlbum(album: SyncAlbum) {
      if (!window.electronAPI) return;
      if (this.cancelToken) return;
      
      this.$appdata.set("sync_is_downloading", true);
      
      album.status = "downloading";
      album.progress = 0;
      album.totalCount = 0;
      album.downloadedCount = 0;
      album.cancelToken = false;
      album.progressText = "Preparando..."; 
      
      try {
        let musicFiles: string[] = [];
        let slideFiles: string[] = [];

        if (album.isHymnal) {
          const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
          if (!hymnalData || !Array.isArray(hymnalData)) {
            album.status = "idle";
            return;
          }

          let fetched = 0;
          const totalToFetch = hymnalData.length;

          for (const song of hymnalData) {
            fetched++;
            album.progress = Math.floor((fetched / totalToFetch) * 10);
            const musicData = (await $db.get(`music_${song.id_music}`)) as any;
            if (musicData) {
              if (musicData.url_music) musicFiles.push(musicData.url_music);
              if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
              if (musicData.url_image) slideFiles.push(musicData.url_image);
              
              if (musicData.lyric) {
                musicData.lyric.forEach((l: any) => {
                  if (l.url_image) slideFiles.push(l.url_image);
                });
              }
            }
          }
        } else {
          const albumData = (await $db.get(`album_${album.id_album}`)) as any;
          if (!albumData || !albumData.musics || !Array.isArray(albumData.musics)) {
            album.status = "idle";
            return;
          }
          
          let fetched = 0;
          const totalToFetch = albumData.musics.length;
          
          for (const song of albumData.musics) {
            fetched++;
            album.progress = Math.floor((fetched / totalToFetch) * 10);
            const musicData = (await $db.get(`music_${song.id_music}`)) as any;
            if (musicData) {
              if (musicData.url_music) musicFiles.push(musicData.url_music);
              if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
              if (musicData.url_image) slideFiles.push(musicData.url_image);
              
              if (musicData.lyric) {
                musicData.lyric.forEach((l: any) => {
                  if (l.url_image) slideFiles.push(l.url_image);
                });
              }
            }
          }
        }
        
        musicFiles = [...new Set(musicFiles)];
        slideFiles = [...new Set(slideFiles)];
        
        const allMediaFiles = [
          ...musicFiles.map(url => ({ url, type: "music" })),
          ...slideFiles.map(url => ({ url, type: "slides" })),
        ];

        if (album.rawCoverUrl) {
          allMediaFiles.push({ url: album.rawCoverUrl, type: "covers" });
        }
        
        album.totalCount = allMediaFiles.length;
        if (album.totalCount === 0) {
          album.status = "downloaded";
          await this.markAlbumDownloaded(album.id_album, album.isHymnal);
          if (album.sizeBytes && this.appDataSize !== null) {
            this.appDataSize += album.sizeBytes;
          }
          await this.loadAppDataSize();
          return;
        }
        
        let downloaded = 0;
        const batchSize = 5;
        let consecutiveErrors = 0;
        let totalErrors = 0;
        const MAX_CONSECUTIVE_ERRORS = 5; 
        
        album.progressText = this.$t("modules.sync.downloading");
        
        for (let i = 0; i < allMediaFiles.length; i += batchSize) {
          if (this.cancelToken || album.cancelToken || !navigator.onLine) {
            if (!navigator.onLine) totalErrors++;
            break;
          }
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) break;
          
          const batch = allMediaFiles.slice(i, i + batchSize);
          await Promise.all(batch.map(async (media) => {
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) return;
            const filesBaseUrl = import.meta.env.VITE_URL_FILES || "";
            const fullUrl = media.url.startsWith("http://") || media.url.startsWith("https://")
              ? media.url
              : `${filesBaseUrl}${media.url.startsWith("/") ? "" : "/"}${media.url}`;
            const relativePath = media.url.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/?(musics|images|covers)\//i, "");
            const exists = await window.electronAPI?.checkMedia(media.type, relativePath);
            if (!exists) {
              const success = await window.electronAPI?.downloadMedia(fullUrl, media.type, relativePath);
              if (!success) {
                consecutiveErrors++;
                totalErrors++;
                console.warn(`[Sync] Falha ao baixar: ${relativePath} (${consecutiveErrors} consecutivas)`);
                return;
              }
              consecutiveErrors = 0; 
            }
            downloaded++;
            album.downloadedCount = downloaded;
            album.progress = 10 + Math.floor((downloaded / album.totalCount) * 90);
            album.progressText = `${this.$t("modules.sync.downloading")} (${downloaded}/${album.totalCount})`;
          }));
        }
        
        const abortedByErrors = consecutiveErrors >= MAX_CONSECUTIVE_ERRORS;
        
        if (abortedByErrors || !navigator.onLine) {
          album.status = "error";
          album.progressText = !navigator.onLine ? this.$t("modules.sync.no_internet") : this.$t("modules.sync.server_failure");
          if (!this.isDownloadingAll) {
            this.$alert.error({
              title: this.$t("modules.sync.download_failed"),
              text: !navigator.onLine 
                ? this.$t("modules.sync.error_no_internet")
                : this.$t("modules.sync.error_server", { count: totalErrors }),
              translate: false,
            });
          }
        } else if (this.cancelToken || album.cancelToken) {
          album.status = "idle";
          album.progressText = this.$t("modules.sync.cancelled");
        } else {
          if (totalErrors > 0) {
            console.warn(`[Sync] Coletânea baixada com ${totalErrors} arquivo(s) faltando.`);
          }
          album.status = "downloaded";
          await this.markAlbumDownloaded(album.id_album, album.isHymnal);
          if (album.sizeBytes && this.appDataSize !== null) {
            this.appDataSize += album.sizeBytes;
          }
          await this.loadAppDataSize();
        }
      } catch (error) {
        console.error("Erro ao baixar album:", error);
        album.status = "error";
        album.progressText = this.$t("modules.sync.download_error");
      } finally {
        this.checkGlobalDownloadState();
      }
    },
    async markAlbumDownloaded(albumId: string | number, isHymnal = false) {
      const downloadedManifest = (await window.electronAPI?.getLocalDb("dla")) as any[] || [];
      const idToSave = isHymnal ? `${albumId}_${this.$i18n.locale}` : albumId;
      if (!downloadedManifest.includes(idToSave)) {
        downloadedManifest.push(idToSave);
        await window.electronAPI?.saveLocalDb("dla", downloadedManifest);
      }

      // Grava a data em que o álbum foi baixado
      const today = new Date().toLocaleDateString("pt-BR");
      const dlaDates = ((await window.electronAPI?.getLocalDb("dla_dates")) as Record<string, string>) || {};
      const saveKey = String(idToSave);
      dlaDates[saveKey] = today;
      if (isHymnal) {
        dlaDates[String(albumId)] = today;
      }
      await window.electronAPI?.saveLocalDb("dla_dates", dlaDates);

      // Atualiza os dados em memória
      if (this.selectedAlbum && (String(this.selectedAlbum.id_album) === String(albumId) || (isHymnal && this.selectedAlbum.id_album === albumId))) {
        this.selectedAlbum.addedAt = today;
        this.selectedAlbum.status = "downloaded";
      }
      for (const cat of this.categoriesWithAlbums) {
        const a = cat.albums.find(alb => String(alb.id_album) === String(albumId));
        if (a) {
          a.addedAt = today;
          a.status = "downloaded";
        }
      }
    },
    async downloadAllAlbums() {
      if (this.hasNoIdleAlbums) return;
      this.cancelToken = false;
      this.isDownloadingAll = true;
      this.$appdata.set("sync_is_downloading", true);
      
      for (const cat of this.categoriesWithAlbums) {
        for (const album of cat.albums) {
          if (this.cancelToken) break;
          if (album.status === "idle") {
            await this.downloadAlbum(album);
            if ((album.status as string) === "error" && !navigator.onLine) {
              this.cancelAll();
              this.$alert.error({
                title: this.$t("modules.sync.no_connection"),
                text: this.$t("modules.sync.batch_cancelled_no_internet"),
                translate: false,
              });
              break;
            }
          }
        }
        if (this.cancelToken) break;
      }
      
      this.isDownloadingAll = false;
      this.$appdata.set("sync_is_downloading", false);
      await this.loadAppDataSize();
    },
    cancelAll() {
      this.cancelToken = true;
    },
    cancelAlbum(album: SyncAlbum) {
      album.cancelToken = true;
    },
    deleteAlbum(album: SyncAlbum) {
      this.$alert.yesno({
        title: this.$t("modules.sync.delete_album"),
        text: this.$t("modules.sync.delete_confirm", { name: album.name }),
        translate: false,
      }, async (resp: string) => {
        if (resp === "yes") {
          let downloadedManifest = (await window.electronAPI?.getLocalDb("dla")) as any[] || [];
          
          if (album.isHymnal) {
            const specificId = `${album.id_album}_${this.$i18n.locale}`;
            downloadedManifest = downloadedManifest.filter((id: string | number) => String(id) !== specificId);
            if (this.$i18n.locale === "pt") {
              downloadedManifest = downloadedManifest.filter((id: string | number) => String(id) !== String(album.id_album));
            }
          } else {
            downloadedManifest = downloadedManifest.filter((id: string | number) => String(id) !== String(album.id_album));
          }
          
          await window.electronAPI?.saveLocalDb("dla", downloadedManifest);
          
          const dlaDates = ((await window.electronAPI?.getLocalDb("dla_dates")) as Record<string, string>) || {};
          if (album.isHymnal) {
            delete dlaDates[`${album.id_album}_${this.$i18n.locale}`];
            delete dlaDates[String(album.id_album)];
          } else {
            delete dlaDates[String(album.id_album)];
          }
          await window.electronAPI?.saveLocalDb("dla_dates", dlaDates);

          album.status = "idle";
          album.progress = 0;
          album.downloadedCount = 0;
          album.addedAt = undefined;
          
          if (album.sizeBytes && this.appDataSize !== null) {
            this.appDataSize = Math.max(0, this.appDataSize - album.sizeBytes);
          }
          
          try {
            let musicFiles: string[] = [];
            let slideFiles: string[] = [];
            if (album.isHymnal) {
              const hymnalData = (await $db.get(`${this.$i18n.locale}_${album.id_album}`)) as any[];
              if (hymnalData) {
                for (const song of hymnalData) {
                  const musicData = (await $db.get(`music_${song.id_music}`)) as any;
                  if (musicData) {
                    if (musicData.url_music) musicFiles.push(musicData.url_music);
                    if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                    if (musicData.url_image) slideFiles.push(musicData.url_image);
                    if (musicData.lyric) {
                      musicData.lyric.forEach((l: any) => {
                        if (l.url_image) slideFiles.push(l.url_image);
                      });
                    }
                  }
                }
              }
            } else {
              const albumData = (await $db.get(`album_${album.id_album}`)) as any;
              if (albumData && albumData.musics) {
                for (const song of albumData.musics) {
                  const musicData = (await $db.get(`music_${song.id_music}`)) as any;
                  if (musicData) {
                    if (musicData.url_music) musicFiles.push(musicData.url_music);
                    if (musicData.url_instrumental_music) musicFiles.push(musicData.url_instrumental_music);
                    if (musicData.url_image) slideFiles.push(musicData.url_image);
                    if (musicData.lyric) {
                      musicData.lyric.forEach((l: any) => {
                        if (l.url_image) slideFiles.push(l.url_image);
                      });
                    }
                  }
                }
              }
            }
            
            const cleanRelPath = (raw?: string | null): string => {
              if (!raw) return "";
              return raw.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/?(musics|images|covers)\//i, "");
            };

            musicFiles = [...new Set(musicFiles)];
            for (const urlPath of musicFiles) {
              const relativePath = cleanRelPath(urlPath);
              if (relativePath) {
                await window.electronAPI?.deleteMedia("music", relativePath);
              }
            }
            
            slideFiles = [...new Set(slideFiles)];
            for (const urlPath of slideFiles) {
              const relativePath = cleanRelPath(urlPath);
              if (relativePath) {
                await window.electronAPI?.deleteMedia("slides", relativePath);
              }
            }

            const coverUrl = album.rawCoverUrl || album.coverUrl;
            if (coverUrl) {
              const relativePath = cleanRelPath(coverUrl);
              if (relativePath) {
                await window.electronAPI?.deleteMedia("covers", relativePath);
              }
            }
          } catch (e) {
            console.error("Erro ao apagar arquivos:", e);
          } finally {
            await this.loadAppDataSize();
          }
        }
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.sync-modal-container {
  background: var(--main-bg, #161923);
  height: 84vh;
  max-height: 820px;
  border-radius: 20px !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
}

.sync-header {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(0, 0, 0, 0.12);
  padding: 18px 28px !important;
}

.sync-header-title {
  color: var(--sidebar-text, #ffffff);
  font-size: 1.45rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.sync-header-subtitle {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.84rem;
  display: block;
  margin-top: 2px;
}

.storage-header-widget {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.btn-primary-action {
  background: var(--accent-blue, #009fe3) !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  letter-spacing: 0.01em;
  font-size: 0.88rem;
  box-shadow: 0 4px 14px rgba(0, 159, 227, 0.35);
  transition: all 0.2s ease;
}

.btn-primary-action:hover {
  filter: brightness(1.08);
  box-shadow: 0 6px 18px rgba(0, 159, 227, 0.5);
}

.modal-close-btn {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  padding: 0 !important;
  border-radius: 10px !important;
  background: transparent !important;
  border: none !important;
  color: var(--sidebar-text-secondary, #94a3b8) !important;
  margin-left: 14px !important;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: var(--sidebar-text, #ffffff) !important;
}

/* Coluna 1 - Sidebar Esquerda */
.sync-sidebar-left {
  width: 255px;
  border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(0, 0, 0, 0.12);
}

.sidebar-section-title {
  color: rgba(255, 255, 255, 0.38);
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0 16px;
  margin-top: 18px;
  margin-bottom: 10px;
  display: block;
}

.category-nav-item {
  height: 46px;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid transparent;
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.88rem;
  margin-bottom: 6px;
  padding: 0 16px !important;
  transition: all 0.2s ease;
  user-select: none;
}

.category-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.category-nav-item.is-active {
  background: rgba(0, 159, 227, 0.16) !important;
  border-color: rgba(0, 159, 227, 0.35) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}

.category-badge {
  background: rgba(255, 255, 255, 0.07);
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 26px;
  height: 22px;
  padding: 0 7px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.category-nav-item.is-active .category-badge {
  background: rgba(0, 159, 227, 0.25) !important;
  color: #38bdf8 !important;
}

/* Coluna 2 - Catálogo Central */
.sync-catalog-center {
  background: transparent;
}

.catalog-toolbar {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(0, 0, 0, 0.06);
  padding: 12px 24px !important;
}

/* Standard Inputs - Louvor JA Signature Style */
:deep(.standard-text-input) {
  .v-field {
    background: var(--card-bg) !important;
    border: 1px solid rgba(128, 128, 128, 0.18) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.4) !important;
    }

    &--focused,
    &--focused:hover,
    &.v-field--focused {
      border-color: var(--accent-blue, rgb(var(--v-theme-primary))) !important;
      box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.18) !important;
    }

    .v-field__outline {
      display: none !important;
    }

    .v-field__overlay {
      display: none !important;
    }
  }

  .v-field__input {
    color: var(--sidebar-text) !important;
    font-size: 14px !important;
    padding-inline-start: 12px !important;
    padding-inline-end: 8px !important;
  }

  .v-field__prepend-inner {
    align-items: center !important;
    align-self: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;

    .v-icon {
      color: var(--sidebar-text-secondary, #a0a6b5) !important;
      opacity: 0.85 !important;
      transition: color 0.2s ease, opacity 0.2s ease;
    }
  }

  .v-field__append-inner {
    align-items: center !important;
    align-self: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;

    .v-icon {
      color: var(--sidebar-text-secondary, #a0a6b5) !important;
      opacity: 0.85 !important;
    }
  }

  .v-field--focused .v-field__prepend-inner .v-icon,
  .v-field--focused:hover .v-field__prepend-inner .v-icon,
  &.v-input--focused .v-field__prepend-inner .v-icon {
    color: var(--accent-blue, rgb(var(--v-theme-primary))) !important;
    opacity: 1 !important;
  }
}

.filter-select-fixed {
  flex: 0 0 170px !important;
  width: 170px !important;
  min-width: 170px !important;
  max-width: 170px !important;
}

.view-mode-toggle {
  background: var(--card-bg, #30364a);
  border: 1px solid rgba(128, 128, 128, 0.18);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  gap: 3px;
}

.view-toggle-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  border-radius: 7px !important;
  color: var(--sidebar-text-secondary, #94a3b8) !important;
  transition: all 0.2s ease;
}

.view-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  color: #ffffff !important;
}

.view-toggle-btn.view-active {
  background: var(--accent-blue, #009fe3) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0, 159, 227, 0.35);
}

.catalog-content-scroll {
  padding-right: 12px;
}

.sync-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

/* Painel e Card de Detalhes da Seleção */
.sync-details-column {
  width: 275px;
  min-width: 275px;
  border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(0, 0, 0, 0.04);
  overflow: hidden !important;
}

.album-details-card {
  background: var(--card-bg, #30364a);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  width: 100%;
}

.album-detail-title {
  color: var(--sidebar-text, #ffffff);
  font-size: 1.15rem;
  line-height: 1.25;
}

.album-detail-subtitle {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.85rem;
  line-height: 1.3;
}

.album-delete-btn {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  background: rgba(255, 255, 255, 0.04) !important;
  color: var(--sidebar-text-secondary, #94a3b8) !important;
  transition: all 0.2s ease;
}

.album-delete-btn:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  color: #ef4444 !important;
}

.status-badge-idle {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge-downloading {
  background: rgba(0, 159, 227, 0.15);
  border: 1px solid rgba(0, 159, 227, 0.35);
  color: #009fe3;
  font-size: 0.75rem;
  font-weight: 600;
}

.detail-cover-box {
  width: 160px;
  height: 160px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.detail-fallback-cover {
  width: 160px;
  height: 160px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.detail-meta-row {
  border-bottom: none;
}

.detail-action-btn-secondary {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  font-size: 0.84rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
  border: none !important;
  box-shadow: none !important;
  transition: all 0.2s ease;

  :deep(.v-btn__underlay),
  :deep(.v-btn__overlay) {
    display: none !important;
  }

  :deep(.v-icon) {
    color: #ffffff !important;
    font-size: 18px !important;
    opacity: 0.9;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.14) !important;
    color: #ffffff !important;
  }
}

.status-badge-downloaded {
  background: rgba(46, 125, 50, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.35);
  color: #4caf50;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.empty-icon-circle {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(0, 155, 226, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Scrollbar Oficial Louvor JA */
.sync-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.sync-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
.sync-scroll-area::-webkit-scrollbar-thumb {
  background: var(--accent-blue, #009fe3);
  border-radius: 4px;
  transition: background 0.2s ease;
}
.sync-scroll-area::-webkit-scrollbar-thumb:hover {
  background: var(--accent-yellow, #ffc107);
}

/* Adaptabilidade Tema Claro - Biblioteca Local */
:root[data-theme="light"] .sync-modal-container,
.v-theme--light .sync-modal-container,
.v-theme--light.sync-modal-container {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
}

:root[data-theme="light"] .sync-header,
.v-theme--light .sync-header {
  background: rgba(0, 0, 0, 0.02);
}

:root[data-theme="light"] .storage-header-widget,
.v-theme--light .storage-header-widget {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .modal-close-btn:hover,
.v-theme--light .modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.06) !important;
  color: var(--sidebar-text) !important;
}

:root[data-theme="light"] .sync-sidebar-left,
.v-theme--light .sync-sidebar-left {
  background: #f8fafc;
}

:root[data-theme="light"] .sidebar-section-title,
.v-theme--light .sidebar-section-title {
  color: var(--sidebar-text-secondary);
  opacity: 0.75;
}

:root[data-theme="light"] .category-nav-item:hover,
.v-theme--light .category-nav-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--sidebar-text);
}

:root[data-theme="light"] .category-nav-item.is-active,
.v-theme--light .category-nav-item.is-active {
  background: rgba(0, 159, 227, 0.12) !important;
  border-color: rgba(0, 159, 227, 0.35) !important;
  color: #0284c7 !important;

  .category-badge {
    background: rgba(0, 159, 227, 0.2) !important;
    color: #0284c7 !important;
  }
}

:root[data-theme="light"] .category-badge,
.v-theme--light .category-badge {
  background: rgba(0, 0, 0, 0.05);
  color: var(--sidebar-text-secondary);
}

:root[data-theme="light"] .catalog-toolbar,
.v-theme--light .catalog-toolbar {
  background: rgba(0, 0, 0, 0.02);
}

:root[data-theme="light"] .view-toggle-btn:hover,
.v-theme--light .view-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.06) !important;
  color: var(--sidebar-text) !important;
}

:root[data-theme="light"] .sync-details-column,
.v-theme--light .sync-details-column {
  background: rgba(0, 0, 0, 0.02);
}

:root[data-theme="light"] .album-details-card,
.v-theme--light .album-details-card {
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .album-delete-btn,
.v-theme--light .album-delete-btn {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  background: rgba(0, 0, 0, 0.03) !important;
  color: var(--sidebar-text-secondary) !important;

  &:hover {
    background: rgba(239, 68, 68, 0.1) !important;
    border-color: rgba(239, 68, 68, 0.3) !important;
    color: #ef4444 !important;
  }
}

:root[data-theme="light"] .status-badge-idle,
.v-theme--light .status-badge-idle {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .detail-cover-box,
.v-theme--light .detail-cover-box {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

:root[data-theme="light"] .detail-fallback-cover,
.v-theme--light .detail-fallback-cover {
  background: rgba(0, 0, 0, 0.04);
}

:root[data-theme="light"] .empty-icon-circle,
.v-theme--light .empty-icon-circle {
  background: rgba(0, 155, 226, 0.08);
}

:root[data-theme="light"] .detail-action-btn-secondary,
.v-theme--light .detail-action-btn-secondary {
  background: rgba(0, 0, 0, 0.05) !important;
  color: var(--sidebar-text, #303238) !important;

  :deep(.v-icon) {
    color: var(--sidebar-text, #303238) !important;
    opacity: 0.85;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.09) !important;
    color: var(--sidebar-text, #303238) !important;
  }
}

/* Responsividade: Oculta painel de detalhes em larguras menores para não cortar conteúdo */
@media (max-width: 1280px) {
  .sync-details-column {
    display: none !important;
  }

  .sync-sidebar-left {
    width: 215px !important;
  }
}

@media (max-width: 1100px) {
  .storage-header-widget {
    display: none !important;
  }

  .filter-select-fixed {
    display: none !important;
  }
}
</style>

<style lang="scss">
.compact-filter-menu {
  background: var(--ds-surface, #232733) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35) !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  padding: 6px 0 !important;
  backdrop-filter: blur(12px) !important;

  .v-list {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    max-height: 220px !important;
    overflow-y: auto !important;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent-blue, #009fe3);
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover,
    &::-webkit-scrollbar-thumb:active {
      background: var(--accent-yellow, #ffc107);
    }
  }

  .v-list-item {
    border-radius: 8px !important;
    min-height: 32px !important;
    height: 32px !important;
    --v-list-item-min-height: 32px !important;
    padding: 0 12px !important;
    margin: 0 6px 2px 6px !important;
    color: var(--sidebar-text-secondary, #94a3b8) !important;
    background: transparent !important;
    transition: all 0.15s ease !important;

    .v-list-item__content {
      padding: 0 !important;
    }

    .v-list-item-title {
      font-size: 0.84rem !important;
      line-height: 1.2 !important;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: var(--sidebar-text, #ffffff) !important;

      .text-caption:not(.text-primary) {
        color: var(--sidebar-text, #ffffff) !important;
        opacity: 1 !important;
      }
    }

    &--active {
      background: transparent !important;
      color: var(--accent-blue, #009fe3) !important;
      font-weight: 600 !important;

      .text-caption {
        color: var(--accent-blue, #009fe3) !important;
        opacity: 1 !important;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: var(--accent-blue, #009fe3) !important;
      }
    }
  }
}

:root[data-theme="light"] .compact-filter-menu,
.v-theme--light .compact-filter-menu {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12) !important;

  .v-list-item {
    color: #475569 !important;
    background: transparent !important;

    &:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;

      .text-caption:not(.text-primary) {
        color: #0f172a !important;
        opacity: 1 !important;
      }
    }

    &--active {
      background: transparent !important;
      color: #009fe3 !important;
      font-weight: 600 !important;

      .text-caption {
        color: #009fe3 !important;
        opacity: 1 !important;
      }

      &:hover {
        background: #f1f5f9 !important;
        color: #009fe3 !important;
      }
    }
  }
}

.support-category-menu {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12)) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  padding: 4px !important;

  .v-list {
    background: transparent !important;
    padding: 0 !important;
    max-height: 220px !important;
    overflow-y: auto !important;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent-blue, #009FE3);
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover,
    &::-webkit-scrollbar-thumb:active {
      background: var(--accent-yellow, #FFC107);
    }
  }

  .v-list-item {
    border-radius: 8px !important;
    min-height: 38px !important;
    padding: 6px 12px !important;
    margin: 2px 0 !important;
    font-size: 0.88rem !important;
    color: var(--sidebar-text-secondary, #94a3b8) !important;
    transition: all 0.15s ease !important;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.08) !important;
      color: var(--sidebar-text, #ffffff) !important;
    }

    &--active {
      background: rgba(0, 159, 227, 0.15) !important;
      color: rgb(var(--v-theme-primary)) !important;
      font-weight: 600 !important;
    }
  }
}

:root[data-theme="light"] .support-category-menu,
.v-theme--light .support-category-menu {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15) !important;

  .v-list-item {
    color: #475569 !important;

    &:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }

    &--active {
      background: rgba(0, 159, 227, 0.12) !important;
      color: #0284c7 !important;
    }
  }
}
</style>
