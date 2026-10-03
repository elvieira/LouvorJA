<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page custom-collection-module d-flex flex-column">
      <ModuleHeader
        :title="detailCollection ? (isFavorites(detailCollection) ? t('favorites') : detailCollection.name) : t('title')"
        :icon="detailCollection && isFavorites(detailCollection) ? 'mdi-heart' : 'mdi-music-box-multiple'"
        :image="detailCollection?.coverImage || undefined"
      >
        <template #prefix>
          <v-btn
            v-if="detailCollection"
            icon
            variant="text"
            size="small"
            style="margin-right: 16px; color: var(--sidebar-text-secondary);"
            @click="detailCollectionId = null"
          >
            <v-icon>mdi-arrow-left</v-icon>
            <v-tooltip
              activator="parent"
              location="bottom"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('back') }}
            </v-tooltip>
          </v-btn>
        </template>
        <div v-if="!detailCollection" class="search-bar ml-4 d-flex align-center" style="max-width: 650px; flex: 1; gap: 16px;">
          <v-text-field
            v-model="search"
            :placeholder="t('search_collection_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
          >
            <template #append-inner>
              <v-menu :close-on-content-click="false" location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    icon="mdi-filter-variant"
                    size="small"
                    variant="text"
                    v-bind="menuProps"
                    color="var(--sidebar-text-secondary)"
                  />
                </template>
                <v-card
                  class="elevation-3"
                  :color="isDark ? 'var(--card-bg)' : '#ffffff'"
                  :theme="isDark ? 'dark' : 'light'"
                  rounded="lg"
                  min-width="220"
                  style="overflow: hidden; border: 1px solid rgba(150, 150, 150, 0.1);"
                >
                  <v-list
                    class="py-2"
                    bg-color="transparent"
                  >
                    <div
                      class="text-caption font-weight-bold mb-2 mx-4 mt-1"
                      style="color: var(--sidebar-text-secondary);"
                    >
                      {{ t('filter_search_by') }}
                    </div>
                    <v-list-item
                      :active="searchFilters.includes('name')"
                      active-color="var(--accent-blue)"
                      class="mx-2 rounded-lg mb-1"
                      style="min-height: 40px;"
                      @click="toggleSearchFilter('name')"
                    >
                      <div class="d-flex align-center">
                        <v-icon :icon="searchFilters.includes('name') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                        <span class="text-body-2 font-weight-medium">{{ t('filter_collection_name') }}</span>
                      </div>
                    </v-list-item>
                    <v-list-item
                      :active="searchFilters.includes('songs')"
                      active-color="var(--accent-blue)"
                      class="mx-2 rounded-lg mb-1"
                      style="min-height: 40px;"
                      @click="toggleSearchFilter('songs')"
                    >
                      <div class="d-flex align-center">
                        <v-icon :icon="searchFilters.includes('songs') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                        <span class="text-body-2 font-weight-medium">{{ t('filter_song_name') }}</span>
                      </div>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </template>
          </v-text-field>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-4"
            @click="openCreateDialog"
          >
            <v-icon start size="18">
              mdi-plus
            </v-icon>
            {{ t('new_collection') }}
          </v-btn>
        </div>
        <div v-else class="d-flex align-center" style="gap: 8px;">
          <v-menu
            v-if="hasPlayableSongsInDetail"
            location="bottom center"
            open-on-hover
            :close-on-content-click="true"
          >
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                color="primary"
                variant="tonal"
                class="text-none rounded-lg"
                prepend-icon="mdi-play"
              >
                {{ t('play_all') }}
              </v-btn>
            </template>
            <v-card class="modern-glass-menu elevation-4 mt-2" rounded="lg">
              <v-list class="py-1" bg-color="transparent" density="compact">
                <v-list-item class="mx-1 rounded" style="min-height: 32px;" @click.stop="playAllCollection('audio')">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2">
                      mdi-play-circle
                    </v-icon>
                    <span class="text-caption font-weight-medium">{{ $t('modules.media.general.sung') }}</span>
                  </div>
                </v-list-item>
                <v-list-item class="mx-1 rounded" style="min-height: 32px;" @click.stop="playAllCollection('instrumental')">
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

          <v-btn
            v-if="!isFavorites(detailCollection)"
            variant="tonal"
            color="primary"
            class="text-none font-weight-bold rounded-lg"
            @click="openAddSongDialog"
          >
            <v-icon start>
              mdi-plus
            </v-icon>
            {{ t('add') }}
          </v-btn>
        </div>
      </ModuleHeader>

      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <transition name="collection-view" mode="out-in">
          <!-- LIST VIEW -->
          <div
            v-if="!detailCollection"
            key="list"
            class="d-flex flex-column flex-grow-1"
            style="min-height: 0; overflow: hidden;"
          >
            <!-- Resultados da pesquisa (lista de músicas) -->
            <template v-if="search && search.trim()">
              <div v-if="searchResults.length === 0" class="flex-grow-1 d-flex flex-column align-center justify-center">
                <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">
                  mdi-magnify
                </v-icon>
                <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
                  {{ t('no_songs_found') }}
                </p>
              </div>

              <div v-else class="music-list flex-grow-1 d-flex flex-column" style="background: transparent; box-shadow: none; min-height: 0;">
                <div class="music-list-container flex-grow-1" style="overflow-y: auto;">
                  <div
                    v-for="result in searchResults"
                    :key="result.song.id"
                    class="music-item"
                    style="cursor: pointer;"
                    @click="playSong(result.song)"
                  >
                    <div class="music-info">
                      <h4 class="music-title">
                        {{ songLabel(result.song) }}
                      </h4>
                      <p class="music-artist">
                        {{ result.collection.name }}
                      </p>
                    </div>
                    <div class="music-duration">
                      {{ result.song.type === 'internal' ? $datetime.shortTime(songData(result.song)?.duration) : '' }}
                    </div>
                    <div class="music-actions d-flex align-center justify-end" @click.stop>
                      <LMusicMenuTable
                        v-if="result.song.type === 'internal'"
                        :id-music="result.song.id_music"
                        :has-instrumental-music="songData(result.song)?.has_instrumental_music"
                      />
                      <template v-else>
                        <v-btn
                          :disabled="!result.song.filePathAudio"
                          variant="text"
                          color="primary"
                          density="compact"
                          class="mx-1"
                          icon
                          @click="playExternalFile(result.song, 'audio')"
                        >
                          <v-icon>mdi-play-circle</v-icon>
                          <v-tooltip activator="parent" location="top">
                            Cantado
                          </v-tooltip>
                        </v-btn>
                        <v-btn
                          :disabled="!result.song.filePathInstrumental"
                          variant="text"
                          color="primary"
                          density="compact"
                          class="mx-1"
                          icon
                          @click="playExternalFile(result.song, 'instrumental')"
                        >
                          <v-icon>mdi-play-circle-outline</v-icon>
                          <v-tooltip activator="parent" location="top">
                            Playback
                          </v-tooltip>
                        </v-btn>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Grade de coletâneas -->
            <template v-else>
              <div v-if="collections.length === 0" class="flex-grow-1 d-flex flex-column align-center justify-center">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">
                  mdi-music-box-multiple-outline
                </v-icon>
                <h3 class="mb-2" style="color: var(--sidebar-text);">
                  {{ t('empty_collections_title') }}
                </h3>
                <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
                  {{ t('empty_collections_desc') }}
                </p>
              </div>

              <div v-else class="collections-page-scroll flex-grow-1" style="overflow-y: auto; overflow-x: hidden; padding: 16px 8px;">
                <div class="collections-grid-wrap">
                  <div
                    v-for="c in displayCollections"
                    :key="c.id"
                    class="collection-card"
                    @click="openCollection(c)"
                  >
                    <div
                      class="card-image"
                      :style="isFavorites(c) && !c.coverImage ? 'background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%) !important;' : ''"
                    >
                      <v-img
                        v-if="c.coverImage"
                        :src="c.coverImage"
                        cover
                        style="width: 100%; height: 100%; position: absolute; inset: 0;"
                      />
                      <v-icon
                        v-else
                        size="48"
                        :color="isFavorites(c) ? 'white' : undefined"
                      >
                        {{ isFavorites(c) ? 'mdi-heart' : 'mdi-music-box-multiple' }}
                      </v-icon>
                      <v-menu v-if="!isFavorites(c)" location="bottom end">
                        <template #activator="{ props: menuProps }">
                          <v-btn
                            v-bind="menuProps"
                            icon
                            variant="flat"
                            size="small"
                            color="rgba(0,0,0,0.45)"
                            style="position: absolute; top: 8px; right: 8px;"
                            @click.stop
                          >
                            <v-icon size="18">
                              mdi-dots-vertical
                            </v-icon>
                          </v-btn>
                        </template>
                        <v-card
                          class="elevation-3"
                          :color="isDark ? 'var(--card-bg)' : '#ffffff'"
                          :theme="isDark ? 'dark' : 'light'"
                          rounded="lg"
                          min-width="180"
                          style="overflow: hidden; border: 1px solid rgba(150, 150, 150, 0.1);"
                        >
                          <v-list class="py-2" bg-color="transparent">
                            <v-list-item
                              class="mx-2 rounded-lg mb-1"
                              style="min-height: 40px;"
                              @click="openRenameDialog(c)"
                            >
                              <div class="d-flex align-center">
                                <v-icon size="small" class="mr-3">
                                  mdi-pencil
                                </v-icon>
                                <span class="text-body-2 font-weight-medium">{{ t('rename') }}</span>
                              </div>
                            </v-list-item>
                            <v-list-item
                              class="mx-2 rounded-lg mb-0"
                              style="min-height: 40px;"
                              @click="confirmDelete(c)"
                            >
                              <div class="d-flex align-center">
                                <v-icon size="small" color="error" class="mr-3">
                                  mdi-delete
                                </v-icon>
                                <span class="text-body-2 font-weight-medium text-error">{{ t('delete') }}</span>
                              </div>
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </v-menu>
                      <div
                        v-else
                        class="d-flex align-center justify-center rounded-circle"
                        style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: rgba(0,0,0,0.25);"
                      >
                        <v-icon size="16" color="white">
                          mdi-heart
                        </v-icon>
                      </div>
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">
                        {{ isFavorites(c) ? t('favorites') : c.name }}
                      </h3>
                      <p class="card-stats">
                        {{ t('songs_count', [c.songs.length]) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- DETAIL VIEW -->
          <div
            v-else
            key="detail"
            class="d-flex flex-column flex-grow-1"
            style="min-height: 0; overflow: hidden;"
          >
            <div v-if="detailCollection.songs.length === 0" class="flex-grow-1 d-flex flex-column align-center justify-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                {{ isFavorites(detailCollection) ? 'mdi-heart-outline' : 'mdi-music-note-off-outline' }}
              </v-icon>
              <h3 class="mb-2" style="color: var(--sidebar-text);">
                {{ isFavorites(detailCollection) ? t('empty_favorites_title') : t('empty_songs_title') }}
              </h3>
              <p class="text-center mb-4" style="color: var(--sidebar-text-secondary); max-width: 360px;">
                {{ isFavorites(detailCollection) ? t('empty_favorites_desc') : t('empty_songs_desc') }}
              </p>
              <v-btn
                v-if="!isFavorites(detailCollection)"
                variant="flat"
                color="primary"
                class="rounded-lg text-none px-6 font-weight-bold"
                @click="openAddSongDialog"
              >
                <v-icon start>
                  mdi-plus
                </v-icon>
                {{ t('add_song') }}
              </v-btn>
            </div>

            <div v-else class="music-list flex-grow-1 d-flex flex-column" style="background: transparent; box-shadow: none; min-height: 0;">
              <div class="music-list-container flex-grow-1" style="overflow-y: auto;">
                <div
                  v-for="(item, index) in detailCollection.songs"
                  :key="item.id"
                  class="music-item"
                >
                  <div class="music-number text-center">
                    {{ index + 1 }}
                  </div>
                  <div class="music-info" style="cursor: pointer;" @click="playSong(item)">
                    <h4 class="music-title">
                      {{ songLabel(item) }}
                    </h4>
                  </div>
                  <div class="music-duration">
                    {{ item.type === 'internal' ? $datetime.shortTime(songData(item)?.duration) : '' }}
                  </div>
                  <div class="music-actions d-flex align-center justify-end">
                    <LMusicMenuTable
                      v-if="item.type === 'internal'"
                      :id-music="item.id_music"
                      :has-instrumental-music="songData(item)?.has_instrumental_music"
                    />
                    <template v-else>
                      <v-btn
                        variant="text"
                        density="compact"
                        class="mx-1"
                        icon
                        @click="playOrAddCantado(item)"
                      >
                        <v-icon>mdi-play-circle</v-icon>
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-delay="300"
                          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                        >
                          {{ item.filePathAudio ? 'Cantado' : t('add_cantado') }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        variant="text"
                        density="compact"
                        class="mx-1"
                        icon
                        @click="playOrAddInstrumental(item)"
                      >
                        <v-icon>mdi-play-circle-outline</v-icon>
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-delay="300"
                          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                        >
                          {{ item.filePathInstrumental ? 'Playback' : t('add_playback') }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        variant="text"
                        density="compact"
                        class="mx-1"
                        icon
                        @click="playNoAudio(item)"
                      >
                        <v-icon>mdi-monitor</v-icon>
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-delay="300"
                          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                        >
                          Sem Áudio
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-menu v-if="item.type === 'external' && !isFavorites(detailCollection)" location="bottom end" content-class="modern-glass-menu border">
                      <template #activator="{ props: menuProps }">
                        <v-btn
                          v-bind="menuProps"
                          icon
                          size="small"
                          variant="text"
                          class="mx-1"
                          @click.stop
                        >
                          <v-icon size="18">
                            mdi-pencil-outline
                          </v-icon>
                          <v-tooltip
                            activator="parent"
                            location="top"
                            open-delay="300"
                            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                          >
                            {{ t('edit_song') }}
                          </v-tooltip>
                        </v-btn>
                      </template>
                      <v-card
                        class="elevation-3"
                        :color="isDark ? 'var(--card-bg)' : '#ffffff'"
                        :theme="isDark ? 'dark' : 'light'"
                        rounded="lg"
                        min-width="180"
                        style="overflow: hidden; border: 1px solid rgba(150, 150, 150, 0.1);"
                      >
                        <v-list class="py-2" bg-color="transparent">
                          <v-list-item
                            class="mx-2 rounded-lg mb-1"
                            style="min-height: 40px;"
                            @click="changeCantado(item)"
                          >
                            <div class="d-flex align-center">
                              <v-icon size="small" class="mr-3">
                                mdi-file-music-outline
                              </v-icon>
                              <span class="text-body-2 font-weight-medium">{{ t('change_cantado') }}</span>
                            </div>
                          </v-list-item>
                          
                          <v-list-item
                            class="mx-2 rounded-lg mb-1"
                            style="min-height: 40px;"
                            @click="changePlayback(item)"
                          >
                            <div class="d-flex align-center">
                              <v-icon size="small" class="mr-3">
                                mdi-file-music-outline
                              </v-icon>
                              <span class="text-body-2 font-weight-medium">{{ item.filePathInstrumental ? t('change_playback') : t('add_playback') }}</span>
                            </div>
                          </v-list-item>
                          
                          <v-list-item
                            v-if="item.filePathInstrumental"
                            class="mx-2 rounded-lg mb-1"
                            style="min-height: 40px;"
                            @click="removePlayback(item)"
                          >
                            <div class="d-flex align-center">
                              <v-icon size="small" class="mr-3">
                                mdi-music-note-off-outline
                              </v-icon>
                              <span class="text-body-2 font-weight-medium">{{ t('remove_playback') }}</span>
                            </div>
                          </v-list-item>

                          <v-list-item
                            class="mx-2 rounded-lg mb-0 mt-2"
                            style="min-height: 40px;"
                            @click="removeSong(item.id)"
                          >
                            <div class="d-flex align-center">
                              <v-icon size="small" color="error" class="mr-3">
                                mdi-delete-outline
                              </v-icon>
                              <span class="text-body-2 font-weight-medium text-error">{{ t('remove_from_collection') }}</span>
                            </div>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-menu>
                    <v-btn
                      v-else-if="!isFavorites(detailCollection)"
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      class="mx-1"
                      @click="removeSong(item.id)"
                    >
                      <v-icon size="18">
                        mdi-close
                      </v-icon>
                      <v-tooltip activator="parent" location="top">
                        {{ t('remove_from_collection') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Dialog: criar/renomear coletânea -->
      <v-dialog v-model="showNameDialog" max-width="440" persistent>
        <v-card
          class="rounded-xl pa-2"
          :color="isDark ? 'var(--card-bg)' : '#ffffff'"
          :theme="isDark ? 'dark' : 'light'"
        >
          <!-- Passo 1: nome + capa -->
          <template v-if="dialogStep === 1">
            <v-card-title class="font-weight-bold">
              {{ editingCollection ? t('rename') : t('new_collection') }}
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-center mb-4">
                <div class="dialog-cover-card">
                  <div
                    class="dialog-cover-card-image cursor-pointer"
                    @click="($refs.coverInput as any).click()"
                  >
                    <img
                      v-if="coverInput"
                      :src="coverInput"
                      class="dialog-cover-card-img"
                    />
                    <v-icon v-else size="30" color="var(--accent-blue)">
                      mdi-image-plus
                    </v-icon>
                    <div v-if="coverInput" class="dialog-cover-card-hover">
                      <v-icon size="22" color="white">
                        mdi-pencil
                      </v-icon>
                    </div>
                    <v-btn
                      v-if="coverInput"
                      icon
                      size="x-small"
                      variant="flat"
                      color="error"
                      class="dialog-cover-remove-btn"
                      @click.stop="coverInput = null"
                    >
                      <v-icon size="14">
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
                <input
                  ref="coverInput"
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  @change="onCoverSelect"
                />
              </div>
              <div class="mb-4">
                <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                  {{ t('new_collection_name') }}
                </div>
                <v-text-field
                  v-model="nameInput"
                  variant="outlined"
                  color="primary"
                  rounded="lg"
                  density="compact"
                  hide-details
                  class="modern-input-compact"
                  autofocus
                  @keydown.enter="editingCollection ? saveName() : goToContentStep()"
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
                  @click="closeCreateDialog"
                >
                  {{ t('cancel') }}
                </v-btn>
                <v-btn
                  v-if="editingCollection"
                  variant="flat"
                  color="primary"
                  class="rounded-lg text-none px-6 font-weight-bold"
                  :disabled="!nameInput.trim()"
                  @click="saveName"
                >
                  {{ t('save') }}
                </v-btn>
                <v-btn
                  v-else
                  variant="flat"
                  color="primary"
                  class="rounded-lg text-none px-6 font-weight-bold"
                  :disabled="!nameInput.trim()"
                  @click="goToContentStep"
                >
                  {{ t('continue') }}
                </v-btn>
              </div>
            </v-card-actions>
          </template>

          <!-- Passo 2: escolher como popular a coletânea -->
          <template v-else>
            <v-card-title class="font-weight-bold">
              {{ t('add_content_title') }}
            </v-card-title>
            <v-card-text>
              <div v-if="!contentMode" class="d-flex flex-column" style="gap: 12px; padding: 4px;">
                <v-hover v-slot="{ isHovering, props }">
                  <div
                    v-bind="props"
                    class="d-flex align-center"
                    :style="{
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: isHovering ? 'rgba(var(--v-theme-primary), 0.5)' : 'rgba(150, 150, 150, 0.2)',
                      background: isHovering ? 'rgba(var(--v-theme-primary), 0.03)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }"
                    @click="pickFolderForNewCollection"
                  >
                    <div
                      class="mr-4 d-flex align-center justify-center flex-shrink-0"
                      :style="{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: isHovering ? 'rgba(var(--v-theme-primary), 0.1)' : 'rgba(var(--v-theme-on-surface), 0.04)',
                        transition: 'all 0.3s ease',
                      }"
                    >
                      <v-icon :color="isHovering ? 'primary' : 'rgba(var(--v-theme-on-surface), 0.6)'" size="20">
                        mdi-folder-music
                      </v-icon>
                    </div>
                    <div style="min-width: 0;">
                      <div class="font-weight-medium mb-1" style="font-size: 0.95rem; color: var(--sidebar-text); line-height: 1.2;">
                        {{ t('add_folder') }}
                      </div>
                    </div>
                  </div>
                </v-hover>
                
                <v-hover v-slot="{ isHovering, props }">
                  <div
                    v-bind="props"
                    class="d-flex align-center"
                    :style="{
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: isHovering ? 'rgba(var(--v-theme-primary), 0.5)' : 'rgba(150, 150, 150, 0.2)',
                      background: isHovering ? 'rgba(var(--v-theme-primary), 0.03)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }"
                    @click="contentMode = 'song'"
                  >
                    <div
                      class="mr-4 d-flex align-center justify-center flex-shrink-0"
                      :style="{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: isHovering ? 'rgba(var(--v-theme-primary), 0.1)' : 'rgba(var(--v-theme-on-surface), 0.04)',
                        transition: 'all 0.3s ease',
                      }"
                    >
                      <v-icon :color="isHovering ? 'primary' : 'rgba(var(--v-theme-on-surface), 0.6)'" size="20">
                        mdi-file-music
                      </v-icon>
                    </div>
                    <div style="min-width: 0;">
                      <div class="font-weight-medium mb-1" style="font-size: 0.95rem; color: var(--sidebar-text); line-height: 1.2; white-space: normal;">
                        {{ t('add_single_song') }}
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    v-bind="props"
                    class="d-flex align-center"
                    :style="{
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: isHovering ? 'rgba(var(--v-theme-primary), 0.5)' : 'rgba(150, 150, 150, 0.2)',
                      background: isHovering ? 'rgba(var(--v-theme-primary), 0.03)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }"
                    @click="createEmptyCollection"
                  >
                    <div
                      class="mr-4 d-flex align-center justify-center flex-shrink-0"
                      :style="{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: isHovering ? 'rgba(var(--v-theme-primary), 0.1)' : 'rgba(var(--v-theme-on-surface), 0.04)',
                        transition: 'all 0.3s ease',
                      }"
                    >
                      <v-icon :color="isHovering ? 'primary' : 'rgba(var(--v-theme-on-surface), 0.6)'" size="20">
                        mdi-playlist-plus
                      </v-icon>
                    </div>
                    <div style="min-width: 0;">
                      <div class="font-weight-medium mb-1" style="font-size: 0.95rem; color: var(--sidebar-text); line-height: 1.2;">
                        {{ t('create_empty_collection') }}
                      </div>
                      <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.2;">
                        {{ t('create_empty_collection_desc') }}
                      </div>
                    </div>
                  </div>
                </v-hover>
              </div>

              <div v-else>
                <div class="mb-4">
                  <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                    {{ t('external_audio_file') }}
                  </div>
                  
                  <!-- Selected Audio File -->
                  <div
                    v-if="externalAudioFileName"
                    class="rounded-xl pa-4 d-flex align-center justify-space-between"
                    style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(var(--v-theme-on-surface), 0.06);"
                  >
                    <div class="d-flex align-center" style="overflow: hidden;">
                      <v-icon color="primary" size="32" class="mr-3">
                        mdi-file-music
                      </v-icon>
                      <div class="d-flex flex-column" style="overflow: hidden;">
                        <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 250px;">
                          {{ externalAudioFileName }}
                        </span>
                        <span class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); max-width: 250px;" :title="externalAudioFilePath || undefined">
                          {{ externalAudioFilePath }}
                        </span>
                      </div>
                    </div>
                    <div class="d-flex align-center">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="primary"
                        class="mr-1"
                        @click="pickExternalFile('audio')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ t('actions.change') || 'Alterar' }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="externalAudioFileName = ''; externalAudioFilePath = ''"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ t('actions.delete') || 'Remover' }}
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Empty Dropzone for Audio -->
                  <div
                    v-else
                    class="rounded-xl d-flex flex-row align-center pa-3 cursor-pointer"
                    style="border: 2px dashed var(--border-color, rgba(128,128,128,0.2)); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                    onmouseover="this.style.background='rgba(128,128,128,0.04)'; this.style.borderColor='rgba(128,128,128,0.5)'"
                    onmouseout="this.style.background='rgba(128,128,128,0.02)'; this.style.borderColor='var(--border-color, rgba(128,128,128,0.2))'"
                    @click="pickExternalFile('audio')"
                  >
                    <v-icon
                      size="28"
                      color="primary"
                      class="mr-3 ml-2"
                      style="opacity: 0.8;"
                    >
                      mdi-file-find
                    </v-icon>
                    <div class="d-flex flex-column justify-center">
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">Selecionar Arquivo</span>
                      <span class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.2; margin-top: 2px;">Clique para buscar no computador</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                    {{ t('external_instrumental_file') }} ({{ t('optional') }})
                  </div>
                  
                  <!-- Selected Instrumental File -->
                  <div
                    v-if="externalInstrumentalFileName"
                    class="rounded-xl pa-4 d-flex align-center justify-space-between"
                    style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(var(--v-theme-on-surface), 0.06);"
                  >
                    <div class="d-flex align-center" style="overflow: hidden;">
                      <v-icon color="primary" size="32" class="mr-3">
                        mdi-file-music-outline
                      </v-icon>
                      <div class="d-flex flex-column" style="overflow: hidden;">
                        <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 250px;">
                          {{ externalInstrumentalFileName }}
                        </span>
                        <span class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); max-width: 250px;" :title="externalInstrumentalFilePath || undefined">
                          {{ externalInstrumentalFilePath }}
                        </span>
                      </div>
                    </div>
                    <div class="d-flex align-center">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="primary"
                        class="mr-1"
                        @click="pickExternalFile('instrumental')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ t('actions.change') || 'Alterar' }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="externalInstrumentalFileName = ''; externalInstrumentalFilePath = ''"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ t('actions.delete') || 'Remover' }}
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Empty Dropzone for Instrumental -->
                  <div
                    v-else
                    class="rounded-xl d-flex flex-row align-center pa-3 cursor-pointer"
                    style="border: 2px dashed var(--border-color, rgba(128,128,128,0.2)); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                    onmouseover="this.style.background='rgba(128,128,128,0.04)'; this.style.borderColor='rgba(128,128,128,0.5)'"
                    onmouseout="this.style.background='rgba(128,128,128,0.02)'; this.style.borderColor='var(--border-color, rgba(128,128,128,0.2))'"
                    @click="pickExternalFile('instrumental')"
                  >
                    <v-icon
                      size="28"
                      color="primary"
                      class="mr-3 ml-2"
                      style="opacity: 0.8;"
                    >
                      mdi-file-find
                    </v-icon>
                    <div class="d-flex flex-column justify-center">
                      <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">Selecionar Arquivo</span>
                      <span class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.2; margin-top: 2px;">Clique para buscar no computador</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="px-4 pb-4 justify-space-between">
              <v-btn
                variant="tonal"
                :color="isDark ? 'white' : 'grey-darken-2'"
                class="rounded-lg text-none px-6 font-weight-bold"
                @click="contentMode ? (contentMode = null) : (dialogStep = 1)"
              >
                {{ t('back') }}
              </v-btn>
              <div class="d-flex" style="gap: 12px;">
                <v-btn
                  variant="tonal"
                  :color="isDark ? 'white' : 'grey-darken-2'"
                  class="rounded-lg text-none px-6 font-weight-bold"
                  @click="closeCreateDialog"
                >
                  {{ t('cancel') }}
                </v-btn>
                <v-btn
                  v-if="contentMode === 'song'"
                  color="primary"
                  variant="flat"
                  class="rounded-lg text-none px-6 font-weight-bold"
                  :disabled="!externalAudioFilePath"
                  @click="finalizeCreateWithSong"
                >
                  {{ t('create_collection') }}
                </v-btn>
              </div>
            </v-card-actions>
          </template>
        </v-card>
      </v-dialog>

      <!-- Dialog: adicionar música na coletânea aberta -->
      <v-dialog
        v-model="showAddSongDialog"
        max-width="640"
        :theme="isDark ? 'dark' : 'light'"
        content-class="modern-alert-dialog-wrapper add-song-modal"
        transition="fade-transition"
        @keydown.esc="closeAddSongDialog"
      >
        <v-card 
          class="modern-alert-card rounded-xl overflow-hidden"
          style="display: flex; flex-direction: column; max-height: 85vh; background: var(--card-bg); border: 1px solid rgba(150, 150, 150, 0.1);"
        >
          <!-- Header Fixo -->
          <div class="pa-4 flex-shrink-0" style="background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(128,128,128,0.1); z-index: 2;">
            <div class="d-flex align-center justify-space-between mb-3 px-1">
              <div class="d-flex align-center">
                <v-icon color="primary" size="20" class="mr-2">
                  mdi-plus-circle-outline
                </v-icon>
                <h2 class="text-subtitle-2 font-weight-bold text-uppercase" style="color: var(--sidebar-text-secondary); letter-spacing: 1px; margin: 0;">
                  {{ t('add_song') }}
                </h2>
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                :color="isDark ? 'white' : 'grey-darken-2'"
                @click="closeAddSongDialog"
              />
            </div>

            <!-- PillSwitch de Abas: Músicas do Programa / Arquivo do Computador -->
            <div class="mb-3">
              <PillSwitch
                v-model="addSongTab"
                block
                :items="addSongTabItems"
              />
            </div>

            <!-- Se for Músicas do Programa: Barra de busca estilo Busca Rápida -->
            <template v-if="addSongTab === 'internal'">
              <v-text-field
                ref="internalSearchInput"
                v-model="internalSearchQuery"
                :placeholder="t('search_song_placeholder')"
                prepend-inner-icon="mdi-magnify"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                rounded="lg"
                class="search-input-hero"
                autofocus
              />
            </template>
          </div>

          <!-- Aba 1: Músicas do Programa -->
          <template v-if="addSongTab === 'internal'">
            <div class="add-song-list-scroll flex-grow-1">
              <!-- Estado inicial antes de digitar -->
              <div
                v-if="!internalSearchQuery || !internalSearchQuery.trim()"
                class="d-flex flex-column align-center justify-center py-12 text-center w-100"
                style="min-height: 260px;"
              >
                <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3 opacity-40">
                  mdi-text-search
                </v-icon>
                <span class="text-body-2 font-weight-medium" style="color: var(--sidebar-text-secondary); opacity: 0.7;">
                  Digite o nome ou número do hino para buscar...
                </span>
              </div>

              <!-- Nenhum resultado -->
              <div
                v-else-if="filteredInternalSongs.length === 0"
                class="d-flex flex-column align-center justify-center py-12 text-center w-100"
                style="min-height: 260px;"
              >
                <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3 opacity-40">
                  mdi-magnify
                </v-icon>
                <span class="text-body-2 font-weight-medium" style="color: var(--sidebar-text-secondary);">
                  {{ t('no_songs_found') }}
                </span>
              </div>

              <!-- Resultados da busca -->
              <div v-else class="add-song-list">
                <div
                  v-for="song in filteredInternalSongs"
                  :key="song.id_music"
                  class="add-song-row d-flex align-center px-4 py-2"
                  :class="{ 'selected': isSongSelected(song.id_music) }"
                  @click="toggleSongSelection(song.id_music)"
                >
                  <!-- Checkbox de Seleção Rápida -->
                  <div class="mr-3 d-flex align-center flex-shrink-0" @click.stop="toggleSongSelection(song.id_music)">
                    <v-icon
                      :icon="isSongSelected(song.id_music) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
                      :color="isSongSelected(song.id_music) ? 'primary' : 'rgba(128, 128, 128, 0.4)'"
                      size="20"
                      class="cursor-pointer"
                    />
                  </div>

                  <!-- Número do Hino (azul, exatamente igual à Busca Rápida) -->
                  <span
                    v-if="getSongTrack(song)"
                    class="font-weight-bold flex-shrink-0 text-left"
                    style="color: var(--accent-blue); min-width: 32px; margin-right: 8px; font-size: 0.95rem;"
                  >
                    {{ getSongTrack(song) }}
                  </span>

                  <!-- Informações da Música -->
                  <div class="flex-grow-1 mr-3" style="min-width: 0;">
                    <h4
                      class="music-title text-truncate font-weight-medium"
                      style="margin: 0; font-size: 0.95rem; color: var(--sidebar-text); line-height: 1.3;"
                    >
                      {{ song.name }}
                    </h4>
                    <p
                      class="music-artist text-truncate"
                      style="margin: 2px 0 0 0; font-size: 0.78rem; color: var(--sidebar-text-secondary); line-height: 1.2;"
                    >
                      {{ getSongAlbumName(song) }}
                    </p>
                  </div>

                  <!-- Duração -->
                  <span
                    v-if="song.duration"
                    class="music-duration text-caption mr-3 flex-shrink-0"
                    style="color: var(--sidebar-text-secondary); font-size: 0.8rem;"
                  >
                    {{ $datetime.shortTime(song.duration) }}
                  </span>

                  <!-- Ações à Direita -->
                  <div class="d-flex align-center flex-shrink-0" @click.stop>
                    <v-chip
                      v-if="isSongInCollection(song.id_music)"
                      size="x-small"
                      variant="tonal"
                      color="success"
                      class="font-weight-medium"
                    >
                      <v-icon start size="12">
                        mdi-check
                      </v-icon>
                      {{ t('in_collection') }}
                    </v-chip>
                    <v-btn
                      v-else
                      icon
                      size="small"
                      variant="text"
                      color="primary"
                      class="rounded-lg"
                      @click.stop="addSingleInternalSong(song)"
                    >
                      <v-icon size="20">
                        mdi-plus
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('add') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rodapé Fixo da Aba Interna -->
            <div
              class="px-6 py-3 d-flex align-center justify-space-between flex-shrink-0"
              style="background: rgba(0,0,0,0.02); border-top: 1px solid rgba(128,128,128,0.1);"
            >
              <div class="d-flex align-center">
                <span v-if="selectedInternalSongIds.length > 0" class="text-caption font-weight-bold" style="color: var(--accent-blue);">
                  {{ selectedInternalSongIds.length }} {{ selectedInternalSongIds.length === 1 ? 'música selecionada' : 'músicas selecionadas' }}
                </span>
              </div>
              <div class="d-flex align-center" style="gap: 12px;">
                <v-btn
                  variant="tonal"
                  :color="isDark ? 'white' : 'grey-darken-2'"
                  class="rounded-lg text-none px-5 font-weight-bold"
                  @click="closeAddSongDialog"
                >
                  {{ t('cancel') }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  class="rounded-lg text-none px-6 font-weight-bold"
                  :disabled="selectedInternalSongIds.length === 0"
                  @click="addSelectedInternalSongs"
                >
                  <v-icon start size="18">
                    mdi-plus
                  </v-icon>
                  {{ selectedInternalSongIds.length > 0 ? `${t('add_selected')} (${selectedInternalSongIds.length})` : t('add_selected') }}
                </v-btn>
              </div>
            </div>
          </template>

          <!-- Aba 2: Arquivo do Computador -->
          <template v-else>
            <div class="pa-6 flex-grow-1 overflow-y-auto" style="min-height: 240px;">
              <!-- Dropzone Cantado -->
              <div class="mb-4">
                <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary); margin-left: 2px;">
                  {{ t('external_audio_file') }}
                </div>
                
                <div
                  v-if="externalAudioFileName"
                  class="rounded-xl pa-4 d-flex align-center justify-space-between"
                  style="border: 1px solid rgba(128,128,128,0.15); background: rgba(var(--v-theme-on-surface), 0.04);"
                >
                  <div class="d-flex align-center" style="overflow: hidden;">
                    <v-icon color="primary" size="28" class="mr-3 flex-shrink-0">
                      mdi-file-music
                    </v-icon>
                    <div class="d-flex flex-column" style="overflow: hidden;">
                      <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 320px;">
                        {{ externalAudioFileName }}
                      </span>
                      <span class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); max-width: 320px;" :title="externalAudioFilePath || undefined">
                        {{ externalAudioFilePath }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex align-center flex-shrink-0">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="primary"
                      class="mr-1"
                      @click="pickExternalFile('audio')"
                    >
                      <v-icon size="18">
                        mdi-pencil
                      </v-icon>
                      <v-tooltip activator="parent" location="top">
                        {{ t('actions.change') || 'Alterar' }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="externalAudioFileName = ''; externalAudioFilePath = ''"
                    >
                      <v-icon size="18">
                        mdi-delete
                      </v-icon>
                      <v-tooltip activator="parent" location="top">
                        {{ t('actions.delete') || 'Remover' }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>

                <div
                  v-else
                  class="rounded-xl d-flex flex-row align-center pa-4 cursor-pointer"
                  style="border: 1px dashed rgba(128,128,128,0.25); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                  @click="pickExternalFile('audio')"
                >
                  <v-icon size="28" color="primary" class="mr-3 ml-1 opacity-80">
                    mdi-file-upload-outline
                  </v-icon>
                  <div class="d-flex flex-column justify-center">
                    <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
                      {{ t('select_file') }}
                    </span>
                    <span class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.2; margin-top: 2px;">
                      Clique para buscar o arquivo de áudio cantado
                    </span>
                  </div>
                </div>
              </div>

              <!-- Dropzone Instrumental -->
              <div class="mb-2">
                <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary); margin-left: 2px;">
                  {{ t('external_instrumental_file') }} ({{ t('optional') }})
                </div>
                
                <div
                  v-if="externalInstrumentalFileName"
                  class="rounded-xl pa-4 d-flex align-center justify-space-between"
                  style="border: 1px solid rgba(128,128,128,0.15); background: rgba(var(--v-theme-on-surface), 0.04);"
                >
                  <div class="d-flex align-center" style="overflow: hidden;">
                    <v-icon color="primary" size="28" class="mr-3 flex-shrink-0">
                      mdi-file-music-outline
                    </v-icon>
                    <div class="d-flex flex-column" style="overflow: hidden;">
                      <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 320px;">
                        {{ externalInstrumentalFileName }}
                      </span>
                      <span class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); max-width: 320px;" :title="externalInstrumentalFilePath || undefined">
                        {{ externalInstrumentalFilePath }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex align-center flex-shrink-0">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="primary"
                      class="mr-1"
                      @click="pickExternalFile('instrumental')"
                    >
                      <v-icon size="18">
                        mdi-pencil
                      </v-icon>
                      <v-tooltip activator="parent" location="top">
                        {{ t('actions.change') || 'Alterar' }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="externalInstrumentalFileName = ''; externalInstrumentalFilePath = ''"
                    >
                      <v-icon size="18">
                        mdi-delete
                      </v-icon>
                      <v-tooltip activator="parent" location="top">
                        {{ t('actions.delete') || 'Remover' }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>

                <div
                  v-else
                  class="rounded-xl d-flex flex-row align-center pa-4 cursor-pointer"
                  style="border: 1px dashed rgba(128,128,128,0.25); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                  @click="pickExternalFile('instrumental')"
                >
                  <v-icon size="28" color="primary" class="mr-3 ml-1 opacity-80">
                    mdi-file-upload-outline
                  </v-icon>
                  <div class="d-flex flex-column justify-center">
                    <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
                      {{ t('select_file') }}
                    </span>
                    <span class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.2; margin-top: 2px;">
                      Clique para buscar o arquivo de playback (opcional)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rodapé Fixo da Aba Externa -->
            <div
              class="px-6 py-3 d-flex align-center justify-end flex-shrink-0"
              style="background: rgba(0,0,0,0.02); border-top: 1px solid rgba(128,128,128,0.1); gap: 12px;"
            >
              <v-btn
                variant="tonal"
                :color="isDark ? 'white' : 'grey-darken-2'"
                class="rounded-lg text-none px-5 font-weight-bold"
                @click="closeAddSongDialog"
              >
                {{ t('cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="rounded-lg text-none px-6 font-weight-bold"
                :disabled="!externalAudioFilePath"
                @click="addSongToCollection"
              >
                <v-icon start size="18">
                  mdi-plus
                </v-icon>
                {{ t('add_song') }}
              </v-btn>
            </div>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";
import PillSwitch, { PillSwitchItem } from "@/components/inputs/PillSwitch.vue";
import { FAVORITES_COLLECTION_ID, ensureFavoritesCollection } from "@/helpers/services/Favorites";

interface InternalSong {
  id: string;
  type: "internal";
  id_music: any;
}
interface ExternalSong {
  id: string;
  type: "external";
  name: string;
  filePathAudio: string | null;
  filePathInstrumental: string | null;
}
type CollectionSong = InternalSong | ExternalSong;

interface CustomCollection {
  id: string;
  name: string;
  coverImage: string | null;
  songs: CollectionSong[];
  is_favorites?: boolean;
}

const MEDIA_FILTERS = [
  { name: "Áudios, Vídeos e Arquivos LouvorJA", extensions: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "mp4", "mkv", "avi", "mov", "wmv", "webm", "slja", "sja", "lja"] },
  { name: "Todos", extensions: ["*"] },
];

function isSljaFile(filePath: string): boolean {
  return /\.(slja|sja|lja)$/i.test(filePath);
}

function toLocalFileUrl(rawPath: string | null): string {
  if (!rawPath) return "";
  if ((window as any).electronAPI) {
    const normalized = rawPath.replace(/\\/g, "/");
    const prefix = normalized.startsWith("/") ? "local://app" : "local://app/";
    return `${prefix}${normalized}`;
  }
  return rawPath;
}

function secondsToHms(totalSeconds: number | null): string {
  const total = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${m}:${s}`;
}

function formatLyricText(raw: string): string {
  return (raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export default defineComponent({
  name: "CustomCollectionModule",
  components: {
    ModuleHeader,
    LMusicMenuTable,
    PillSwitch,
  },
  data() {
    return {
      collections: [] as CustomCollection[],
      search: "",
      searchFilters: ["name"] as string[],
      detailCollectionId: null as string | null,
      allSongs: [] as any[],
      showNameDialog: false,
      showAddSongDialog: false,
      dialogStep: 1 as 1 | 2,
      contentMode: null as "song" | null,
      nameInput: "",
      coverInput: null as string | null,
      editingCollection: null as CustomCollection | null,
      externalAudioFilePath: null as string | null,
      externalAudioFileName: "",
      externalInstrumentalFilePath: null as string | null,
      externalInstrumentalFileName: "",

      addSongTab: "internal" as "internal" | "external",
      internalSearchQuery: "",
      selectedInternalSongIds: [] as any[],

      playQueueItems: [] as CollectionSong[],
      playQueueIndex: -1,
      playQueueMode: "audio" as "audio" | "instrumental",
      playQueueActive: false,
      queueEndedBaseline: 0,
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return (this as any).$modules.get(this.module_id);
    },
    isDark(): boolean {
      return (this as any).$vuetify?.theme?.name === "dark";
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    detailCollection(): CustomCollection | null {
      return this.collections.find((c) => c.id === this.detailCollectionId) || null;
    },
    addSongTabItems(): PillSwitchItem[] {
      return [
        { value: "internal", label: this.t("internal_songs"), icon: "mdi-library-music" },
        { value: "external", label: this.t("external_file"), icon: "mdi-folder-upload" },
      ];
    },
    displayCollections(): CustomCollection[] {
      const fav = this.collections.find((c) => this.isFavorites(c));
      const others = this.collections.filter((c) => !this.isFavorites(c));
      return fav ? [fav, ...others] : others;
    },
    hasPlayableSongsInDetail(): boolean {
      return !!this.detailCollection && this.detailCollection.songs.length > 0;
    },
    currentQueueItem(): CollectionSong | null {
      if (!this.playQueueActive) return null;
      return this.playQueueItems[this.playQueueIndex] || null;
    },
    currentQueueEngine(): "media" | "external_media" | null {
      const item = this.currentQueueItem;
      if (!item) return null;
      if (item.type === "internal") return "media";
      const rawPath = this.playQueueMode === "instrumental" ? item.filePathInstrumental : item.filePathAudio;
      return rawPath && isSljaFile(rawPath) ? "media" : "external_media";
    },
    // Contador que só sobe quando o item atual da fila termina naturalmente (sem
    // nada em seguida na fila própria da engine), nunca num fechamento manual.
    // Cada engine tem o seu, incrementado só nessa hora específica (ver
    // "markNaturalEnd" no Media.ts e "ended_seq" no external_media).
    queueEngineEndedSeq(): number {
      const engine = this.currentQueueEngine;
      if (engine === "media") return (this as any).$appdata.get("modules.media.config.natural_end_seq") || 0;
      if (engine === "external_media") return (this as any).$appdata.get("modules.external_media.config.ended_seq") || 0;
      return 0;
    },
    filteredInternalSongs(): any[] {
      if (!this.allSongs || this.allSongs.length === 0) return [];

      const rawQuery = (this.internalSearchQuery || "").trim();
      if (!rawQuery) {
        return [];
      }

      const stringHelper = (this as any).$string;
      const isNum = !isNaN(Number(rawQuery)) && rawQuery !== "";
      const numQuery = isNum ? Number(rawQuery) : null;

      const results = this.allSongs.filter((m: any) => {
        const matchesName = stringHelper.matchesSearch(m.name, rawQuery);
        const matchesAlbum = m.albums ? stringHelper.matchesSearch(m.albums.map((a: any) => a.name).join(" "), rawQuery) : false;
        if (isNum) {
          const isHymnalTrack = m.albums?.some((a: any) => a.type === "hymnal" && Number(a.pivot?.track) === numQuery);
          return matchesName || matchesAlbum || isHymnalTrack;
        }
        return matchesName || matchesAlbum;
      });

      if (isNum) {
        results.sort((a: any, b: any) => {
          const getScore = (item: any) => {
            if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numQuery)) return 2;
            if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numQuery)) return 1;
            return 0;
          };
          return getScore(b) - getScore(a);
        });
      } else {
        const cleanQuery = stringHelper.clean(rawQuery);
        results.sort((a: any, b: any) => {
          const getTextScore = (item: any) => {
            let maxScore = 0;
            const cleanName = stringHelper.clean(item.name || "");
            if (cleanName.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 4);
            else if (cleanName.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 3);
            return maxScore;
          };
          return getTextScore(b) - getTextScore(a);
        });
      }

      return results.slice(0, 80);
    },
    searchResults(): { song: CollectionSong; collection: CustomCollection }[] {
      const query = (this.search || "").trim();
      if (!query) return [];
      const stringHelper = (this as any).$string;
      const results: { song: CollectionSong; collection: CustomCollection }[] = [];
      const seen = new Set<string>();
      for (const c of this.collections) {
        const collectionMatches = this.searchFilters.includes("name") && stringHelper.matchesSearch(c.name, query);
        for (const s of c.songs) {
          const key = `${c.id}:${s.id}`;
          if (seen.has(key)) continue;
          const songMatches = this.searchFilters.includes("songs") && stringHelper.matchesSearch(this.songLabel(s), query);
          if (collectionMatches || songMatches) {
            seen.add(key);
            results.push({ song: s, collection: c });
          }
        }
      }
      return results;
    },
  },
  watch: {
    "module.show"(val: boolean) {
      if (val) {
        this.loadCollections();
        this.loadAllSongs();
        this.checkPendingOpenCollection();
      }
    },
    searchFilters: {
      handler(val: string[]) {
        if (val.length === 0) {
          this.$nextTick(() => { this.searchFilters = ["name"]; });
        }
      },
      deep: true,
    },
    queueEngineEndedSeq(val: number) {
      if (!this.playQueueActive) return;
      if (val > this.queueEndedBaseline) {
        this.advancePlayQueue();
      }
    },
    "$store.state.user_data.modules.custom_collection.list": {
      handler() {
        this.loadCollections();
      },
      deep: true,
    },
    "$store.state.modules.custom_collection.openCollectionId": {
      handler(val: string) {
        if (val) {
          this.checkPendingOpenCollection();
        }
      },
    },
  },
  mounted() {
    window.addEventListener("open-favorites-collection", this.onOpenFavoritesEvent);
    if (this.module?.show) {
      this.loadCollections();
      this.loadAllSongs();
      this.checkPendingOpenCollection();
    }
  },
  beforeUnmount() {
    window.removeEventListener("open-favorites-collection", this.onOpenFavoritesEvent);
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${this.module_id}.${text}`, params || []);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    onOpenFavoritesEvent() {
      this.loadCollections();
      this.detailCollectionId = FAVORITES_COLLECTION_ID;
    },

    checkPendingOpenCollection() {
      const pending = (this as any).$appdata?.get("modules.custom_collection.openCollectionId");
      if (pending) {
        (this as any).$appdata.set("modules.custom_collection.openCollectionId", null);
        this.loadCollections();
        this.detailCollectionId = pending;
      }
    },

    toggleSearchFilter(filter: string) {
      if (this.searchFilters.includes(filter)) {
        if (this.searchFilters.length > 1) {
          this.searchFilters = this.searchFilters.filter((f) => f !== filter);
        }
      } else {
        this.searchFilters.push(filter);
      }
    },

    isFavorites(c: CustomCollection | null | undefined): boolean {
      if (!c) return false;
      return c.id === FAVORITES_COLLECTION_ID || Boolean((c as any).is_favorites);
    },

    loadCollections() {
      ensureFavoritesCollection();
      this.collections = (this as any).$userdata.get("modules.custom_collection.list") || [];
    },
    saveCollections() {
      (this as any).$userdata.set("modules.custom_collection.list", this.collections);
    },
    async loadAllSongs() {
      if (this.allSongs.length > 0) return;
      const list = await (this as any).$database.get(`${(this as any).$i18n.locale}_musics`);
      this.allSongs = list || [];
    },
    songData(item: InternalSong): any {
      return this.allSongs.find((s) => s.id_music === item.id_music);
    },
    songLabel(item: CollectionSong): string {
      if (item.type === "external") return item.name;
      return this.songData(item)?.name || "";
    },
    playAllCollection(mode: "audio" | "instrumental") {
      if (!this.detailCollection) return;

      const eligibleSongs = this.detailCollection.songs.filter((s) => {
        if (s.type === "internal") {
          if (mode === "instrumental") {
            const data = this.songData(s);
            return !!(data?.has_instrumental_music === 1 || data?.has_instrumental_music === true);
          }
          return true;
        }
        return mode === "instrumental" ? !!s.filePathInstrumental : !!s.filePathAudio;
      });

      if (eligibleSongs.length === 0) {
        import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
          $snackbar.show({ text: this.t("no_playable_songs"), color: "warning", timeout: 3000 });
        });
        return;
      }

      if (eligibleSongs.length < this.detailCollection.songs.length) {
        import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
          $snackbar.show({ text: this.t("some_songs_skipped"), color: "info", timeout: 4000 });
        });
      }

      this.playQueueItems = eligibleSongs;
      this.playQueueMode = mode;
      this.playQueueActive = true;
      this.playQueueAt(0);
    },
    playQueueAt(index: number) {
      if (index < 0 || index >= this.playQueueItems.length) {
        this.stopPlayQueue();
        return;
      }
      this.playQueueIndex = index;
      // Marca o valor atual do contador de "terminou" da engine que vai tocar
      // esse item: só um incremento A PARTIR DAQUI conta como fim dele (evita
      // confundir com incrementos antigos de quando essa engine tocou outra
      // coisa, inclusive ao trocar de engine no meio da fila).
      this.queueEndedBaseline = this.queueEngineEndedSeq;
      const item = this.playQueueItems[index];
      if (item.type === "internal") {
        // Zera a fila própria do $media antes de abrir: essa coletânea tem a sua
        // própria fila (aqui), e uma fila antiga de outro álbum não pode fazer o
        // $media pular pra uma música errada quando essa aqui terminar.
        (this as any).$appdata.set("modules.media.queue", { items: [], currentIndex: -1 });
        (this as any).$media.open({ id_music: item.id_music, mode: this.playQueueMode });
      } else {
        this.playExternalFile(item, this.playQueueMode);
      }
    },
    advancePlayQueue() {
      if (!this.playQueueActive) return;
      this.playQueueAt(this.playQueueIndex + 1);
    },
    stopPlayQueue() {
      this.playQueueActive = false;
      this.playQueueItems = [];
      this.playQueueIndex = -1;
    },
    playSong(item: CollectionSong) {
      this.stopPlayQueue();
      if (item.type === "internal") {
        (this as any).$media.open({ id_music: item.id_music, mode: "audio" });
        return;
      }
      this.playExternalFile(item, "audio");
    },
    async playExternalFile(item: ExternalSong, mode: "audio" | "instrumental" | "no_audio") {
      // "Sem Áudio" sempre usa o mesmo arquivo do Cantado (não é uma escolha
      // separada): se o Cantado mudar ou for excluído, o Sem Áudio acompanha.
      const rawPath = mode === "instrumental" ? item.filePathInstrumental : item.filePathAudio;
      if (!rawPath) return;

      if (isSljaFile(rawPath)) {
        await this.playSljaAsNativeSong(item, rawPath, mode);
        return;
      }

      const filePath = rawPath;
      const appdata = (this as any).$appdata;
      if (appdata.get("modules.media.id_music")) {
        (this as any).$media.close(true);
      }
      const ext = filePath.split(".").pop()?.toLowerCase() || "";
      const isAudio = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext);

      appdata.set("modules.external_media.filePath", filePath);
      appdata.set("modules.external_media.title", item.name);
      appdata.set("modules.external_media.subtitle", mode === "instrumental" ? "Playback" : mode === "no_audio" ? "Sem Áudio" : "");
      appdata.set("modules.external_media.image", "");
      appdata.set("modules.external_media.minimized", isAudio);
      appdata.set("modules.external_media.show", !isAudio);
      const currentVolume = appdata.get("modules.external_media.config.volume") ?? ((this as any).$userdata?.get?.("modules.external_media.volume") ?? 100);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: currentVolume,
      });
    },
    async playSljaAsNativeSong(item: ExternalSong, filePath: string, mode: "audio" | "instrumental" | "no_audio") {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.readSljaZip) return;
      const data = await electronAPI.readSljaZip(filePath);
      if (!data) {
        (this as any).$alert.error({ text: this.t("file_open_error"), translate: false });
        return;
      }

      // O $media sempre gera sua própria "capa" (usando name/url_image) antes dos slides
      // do lyric. O 1º slide do .slja já É essa capa/título, então usamos ele para
      // preencher a capa automática e não o repetimos dentro do lyric (evita duplicar).
      const [firstSlide, ...remainingSlides] = data.slides;

      const lyric: Record<string, any> = {};
      remainingSlides.forEach((s: any, index: number) => {
        const timeHms = secondsToHms(s.time);
        lyric[`s${index}`] = {
          lyric: formatLyricText(s.text),
          aux_lyric: formatLyricText(s.auxText),
          show_slide: 1,
          order: index,
          time: timeHms,
          instrumental_time: timeHms,
          url_image: s.image ? toLocalFileUrl(s.image) : undefined,
          image_position: 50,
          fontSize: s.fontSize,
          fontColor: s.fontColor,
          auxFontSize: s.auxFontSize,
          auxFontColor: s.auxFontColor,
        };
      });

      const titleFromFirstSlide = firstSlide?.text?.trim();
      const externalData = {
        name: titleFromFirstSlide || data.name || item.name,
        url_image: firstSlide?.image ? toLocalFileUrl(firstSlide.image) : undefined,
        image_position: 50,
        lyric,
        albums: [],
        categories: [],
        duration: "0:00",
        instrumental_duration: "0:00",
        has_instrumental_music: !!data.instrumentalPath,
      };

      const playMode = mode === "instrumental" ? "instrumental" : mode === "no_audio" ? "no_audio" : "audio";
      await (this as any).$media.open({
        id_music: `slja:${filePath}`,
        mode: playMode,
        externalData,
        externalAudioUrl: data.audioPath ? toLocalFileUrl(data.audioPath) : null,
        externalInstrumentalUrl: data.instrumentalPath ? toLocalFileUrl(data.instrumentalPath) : null,
      });

      // O $media só aceita tempos como string "H:M:S" (segundos inteiros), o que trunca a
      // precisão de décimos de segundo gravada no .slja. Sobrescrevemos com os tempos exatos.
      if (playMode === "audio" || playMode === "instrumental") {
        // A capa (índice 0) sempre começa em 0s. Se um slide sem sincronia manual
        // também ficar em 0s (ou empatar com o tempo anterior), o cálculo de "qual
        // slide mostrar agora" pula direto pra ele, pulando a capa visualmente.
        // Garantimos ordem estritamente crescente pra evitar esse empate.
        const preciseTimes: number[] = [0];
        remainingSlides.forEach((s: any) => {
          const raw = typeof s.time === "number" ? s.time : 0;
          const last = preciseTimes[preciseTimes.length - 1];
          preciseTimes.push(raw <= last ? last + 0.001 : raw);
        });
        (this as any).$appdata.set("modules.media.times", preciseTimes);
      }
    },
    async playOrAddCantado(item: ExternalSong) {
      if (item.filePathAudio) {
        this.playExternalFile(item, "audio");
        return;
      }
      await this.changeCantado(item);
    },
    async playOrAddInstrumental(item: ExternalSong) {
      if (item.filePathInstrumental) {
        this.playExternalFile(item, "instrumental");
        return;
      }
      await this.changePlayback(item);
    },
    async detectSljaInstrumental(filePath: string): Promise<boolean> {
      if (!isSljaFile(filePath)) return false;
      const electronAPI = (window as any).electronAPI;
      // Versão leve: só lê o cabeçalho do .slja, sem extrair áudio/imagens pro
      // disco (extrair é lento e trava o app quando é feito pra vários arquivos
      // de uma vez, como ao importar uma pasta inteira).
      if (!electronAPI?.checkSljaHasInstrumental) return false;
      return await electronAPI.checkSljaHasInstrumental(filePath);
    },
    async changeCantado(item: ExternalSong) {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const filePath = await (window as any).electronAPI.openFileDialog({
        title: this.t("external_audio_file"),
        filters: MEDIA_FILTERS,
      });
      if (!filePath) return;
      item.filePathAudio = filePath as string;
      if (isSljaFile(filePath as string) && !item.filePathInstrumental && await this.detectSljaInstrumental(filePath as string)) {
        item.filePathInstrumental = filePath as string;
      }
      this.saveCollections();
    },
    async changePlayback(item: ExternalSong) {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const filePath = await (window as any).electronAPI.openFileDialog({
        title: this.t("external_instrumental_file"),
        filters: MEDIA_FILTERS,
      });
      if (!filePath) return;
      item.filePathInstrumental = filePath as string;
      this.saveCollections();
    },
    removePlayback(item: ExternalSong) {
      item.filePathInstrumental = null;
      this.saveCollections();
    },
    playNoAudio(item: ExternalSong) {
      // "Sem Áudio" sempre é o próprio arquivo Cantado, tocado sem áudio: não há
      // nada pra escolher/trocar aqui.
      this.playExternalFile(item, "no_audio");
    },

    openCreateDialog() {
      this.editingCollection = null;
      this.nameInput = "";
      this.coverInput = null;
      this.dialogStep = 1;
      this.contentMode = null;
      this.resetExternalPick();
      this.showNameDialog = true;
    },
    openRenameDialog(c: CustomCollection) {
      if (this.isFavorites(c)) return;
      this.editingCollection = c;
      this.nameInput = c.name;
      this.coverInput = c.coverImage;
      this.dialogStep = 1;
      this.showNameDialog = true;
    },
    closeCreateDialog() {
      this.showNameDialog = false;
      this.dialogStep = 1;
      this.contentMode = null;
      this.resetExternalPick();
    },
    onCoverSelect(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.coverInput = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = "";
    },
    saveName() {
      const name = this.nameInput.trim();
      if (!name || !this.editingCollection) return;
      this.editingCollection.name = name;
      this.editingCollection.coverImage = this.coverInput;
      this.saveCollections();
      this.showNameDialog = false;
    },
    goToContentStep() {
      if (!this.nameInput.trim()) return;
      this.contentMode = null;
      this.resetExternalPick();
      this.dialogStep = 2;
    },
    confirmDelete(c: CustomCollection) {
      if (this.isFavorites(c)) return;
      (this as any).$alert.yesno({
        title: this.t("delete_collection_title"),
        text: this.t("delete_collection_text"),
        translate: false,
      }, (btn: any) => {
        if (btn === "yes") {
          this.collections = this.collections.filter((x) => x.id !== c.id);
          if (this.detailCollectionId === c.id) {
            this.detailCollectionId = null;
          }
          this.saveCollections();
        }
      });
    },
    openCollection(c: CustomCollection) {
      this.detailCollectionId = c.id;
    },
    resetExternalPick() {
      this.externalAudioFilePath = null;
      this.externalAudioFileName = "";
      this.externalInstrumentalFilePath = null;
      this.externalInstrumentalFileName = "";
    },
    stripExt(fileName: string): string {
      return fileName.replace(/\.[^./\\]+$/, "");
    },
    async pickExternalFile(kind: "audio" | "instrumental") {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const title = kind === "audio" ? this.t("external_audio_file") : this.t("external_instrumental_file");
      const filePath = await (window as any).electronAPI.openFileDialog({
        title,
        filters: MEDIA_FILTERS,
      });
      if (!filePath) return;
      const fileName = (filePath as string).split(/[\\/]/).pop() || "";
      if (kind === "audio") {
        this.externalAudioFilePath = filePath as string;
        this.externalAudioFileName = fileName;
        if (isSljaFile(filePath as string) && !this.externalInstrumentalFilePath && await this.detectSljaInstrumental(filePath as string)) {
          this.externalInstrumentalFilePath = filePath as string;
          this.externalInstrumentalFileName = fileName;
        }
      } else {
        this.externalInstrumentalFilePath = filePath as string;
        this.externalInstrumentalFileName = fileName;
      }
    },
    finalizeCreateWithSong() {
      if (!this.externalAudioFilePath) return;
      this.collections.push({
        id: crypto.randomUUID(),
        name: this.nameInput.trim(),
        coverImage: this.coverInput,
        songs: [{
          id: crypto.randomUUID(),
          type: "external",
          name: this.stripExt(this.externalAudioFileName),
          filePathAudio: this.externalAudioFilePath,
          filePathInstrumental: this.externalInstrumentalFilePath,
        }],
      });
      this.saveCollections();
      this.closeCreateDialog();
    },
    async pickFolderForNewCollection() {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.openFileDialog || !electronAPI?.readAudioFolder) return;

      const folderPath = await electronAPI.openFileDialog({
        title: this.t("add_folder"),
        properties: ["openDirectory"],
      });
      if (!folderPath) return;

      const files: { name: string; filePath: string }[] = await electronAPI.readAudioFolder(folderPath);
      if (!files || files.length === 0) {
        (this as any).$alert.error({ text: this.t("empty_folder"), translate: false });
        return;
      }

      const songs: ExternalSong[] = await Promise.all(files.map(async (file) => {
        const song: ExternalSong = {
          id: crypto.randomUUID(),
          type: "external",
          name: file.name,
          filePathAudio: file.filePath,
          filePathInstrumental: null,
        };
        if (isSljaFile(file.filePath) && await this.detectSljaInstrumental(file.filePath)) {
          song.filePathInstrumental = file.filePath;
        }
        return song;
      }));

      this.collections.push({
        id: crypto.randomUUID(),
        name: this.nameInput.trim(),
        coverImage: this.coverInput,
        songs,
      });
      this.saveCollections();
      this.closeCreateDialog();
    },
    createEmptyCollection() {
      const newId = crypto.randomUUID();
      this.collections.push({
        id: newId,
        name: this.nameInput.trim(),
        coverImage: this.coverInput,
        songs: [],
      });
      this.saveCollections();
      this.closeCreateDialog();
      this.detailCollectionId = newId;
    },
    openAddSongDialog() {
      if (this.isFavorites(this.detailCollection)) return;
      this.resetExternalPick();
      this.addSongTab = "internal";
      this.internalSearchQuery = "";
      this.selectedInternalSongIds = [];
      this.loadAllSongs();
      this.showAddSongDialog = true;
      this.$nextTick(() => {
        const input = (this.$refs.internalSearchInput as any)?.$el?.querySelector("input");
        if (input) input.focus();
      });
    },
    closeAddSongDialog() {
      this.showAddSongDialog = false;
      this.selectedInternalSongIds = [];
      this.resetExternalPick();
    },
    getSongTrack(song: any): string | null {
      if (!song?.albums) return null;
      for (const al of song.albums) {
        if (al.type === "hymnal" && al.pivot?.track) {
          return String(al.pivot.track);
        }
      }
      return null;
    },
    getSongAlbumName(song: any): string {
      if (!song?.albums || song.albums.length === 0) return "";
      return song.albums.map((a: any) => a.name).filter(Boolean).join(", ");
    },
    isSongInCollection(musicId: any): boolean {
      if (!this.detailCollection) return false;
      return this.detailCollection.songs.some(
        (s) => s.type === "internal" && s.id_music === musicId,
      );
    },
    isSongSelected(musicId: any): boolean {
      return this.selectedInternalSongIds.includes(musicId);
    },
    toggleSongSelection(musicId: any) {
      const idx = this.selectedInternalSongIds.indexOf(musicId);
      if (idx > -1) {
        this.selectedInternalSongIds.splice(idx, 1);
      } else {
        this.selectedInternalSongIds.push(musicId);
      }
    },
    addSingleInternalSong(song: any) {
      if (!this.detailCollection) return;
      this.detailCollection.songs.push({
        id: crypto.randomUUID(),
        type: "internal",
        id_music: song.id_music,
      });
      this.saveCollections();
      import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
        $snackbar.show({ text: this.t("song_added_success"), color: "success", timeout: 2000 });
      });
    },
    addSelectedInternalSongs() {
      if (!this.detailCollection || this.selectedInternalSongIds.length === 0) return;
      const count = this.selectedInternalSongIds.length;
      for (const musicId of this.selectedInternalSongIds) {
        this.detailCollection.songs.push({
          id: crypto.randomUUID(),
          type: "internal",
          id_music: musicId,
        });
      }
      this.saveCollections();
      this.selectedInternalSongIds = [];
      this.closeAddSongDialog();
      import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
        $snackbar.show({
          text: this.t("songs_added_success", [count]) || `${count} música(s) adicionada(s)!`,
          color: "success",
          timeout: 2500,
        });
      });
    },
    addSongToCollection() {
      if (!this.externalAudioFilePath || !this.detailCollection) return;
      this.detailCollection.songs.push({
        id: crypto.randomUUID(),
        type: "external",
        name: this.stripExt(this.externalAudioFileName),
        filePathAudio: this.externalAudioFilePath,
        filePathInstrumental: this.externalInstrumentalFilePath,
      });
      this.saveCollections();
      this.closeAddSongDialog();
    },
    removeSong(songId: string) {
      if (!this.detailCollection) return;
      this.detailCollection.songs = this.detailCollection.songs.filter((s) => s.id !== songId);
      this.saveCollections();
    },
  },
});
</script>

<style lang="scss">
.module-full-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  z-index: 10;
}

.collection-view-enter-active,
.collection-view-leave-active {
  transition: opacity 0.12s ease-out, transform 0.12s ease-out;
}

.collection-view-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.collection-view-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Fora de .custom-collection-module: o v-dialog é teleportado para fora da árvore do componente */
.dialog-cover-card {
  width: 168px;

  .dialog-cover-card-image {
    position: relative;
    width: 168px;
    height: 168px;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(150, 150, 150, 0.05);
    border: 2px dashed var(--border-color, #d0d0d0);
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
  }
}

.custom-collection-module {
  .search-bar {
    .v-field {
      background: var(--card-bg) !important;
      box-shadow: var(--shadow) !important;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      border-radius: 25px !important;
      
      .v-field__input {
        padding: 12px 20px !important;
        font-size: 14px !important;
      }
      
      .v-field__prepend-inner {
        padding-left: 16px !important;
        
        .v-icon {
          color: var(--accent-blue) !important;
          opacity: 0.7;
        }
      }
      
      &:hover {
        box-shadow: var(--shadow-hover) !important;
      }
      
      &.v-field--focused {
        border-color: var(--accent-blue);
        background: rgba(0, 151, 215, 0.05) !important;
        box-shadow: 0 4px 20px rgba(0, 151, 215, 0.15) !important;
      }
    }
  }

  .collections-grid-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
    padding: 0 16px 24px 16px;
  }

  .collection-card {
    width: 100%;
    min-width: 0;
    background: var(--card-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    transition: var(--transition);
    cursor: pointer;
    overflow: hidden;

    &:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);
    }

    .card-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      height: auto;
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      position: relative;
    }

    .card-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 80px;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--sidebar-text);
        margin-bottom: auto;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-stats {
        font-size: 12px;
        color: var(--sidebar-text-secondary);
        margin-top: 8px;
        flex-shrink: 0;
      }
    }
  }

  .music-list-container {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }

  .music-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-color);
    transition: var(--transition);

    &:hover {
      background: var(--sidebar-hover);
    }

    .music-number {
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      color: var(--accent-blue);
      min-width: 32px;
      margin-right: 16px;
    }

    .music-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .music-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--sidebar-text);
        margin-bottom: 2px;
        line-height: 1.2;
      }

      .music-artist {
        font-size: 13px;
        color: var(--sidebar-text-secondary);
        margin: 0;
        line-height: 1.2;
      }
    }

    .music-duration {
      font-size: 13px;
      color: var(--sidebar-text-secondary);
      min-width: 60px;
      padding-right: 16px;
      text-align: right;
    }
  }
}

.add-song-modal {
  :deep(.v-overlay__content) {
    margin: 24px;
  }
}
.search-input-hero {
  .v-field {
    background: var(--card-bg) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(128, 128, 128, 0.18) !important;
    border-radius: 12px !important;
    transition: all 0.2s ease !important;
  }
  .v-field--focused {
    border-color: var(--accent-blue) !important;
    box-shadow: 0 0 0 1px var(--accent-blue), 0 4px 14px rgba(0, 151, 215, 0.25) !important;
  }
}
.add-song-list-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 380px;
  min-height: 240px;
}
.add-song-row {
  border-bottom: 1px solid rgba(128, 128, 128, 0.08);
  cursor: pointer;
  transition: background 0.15s ease;
  min-height: 52px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(128, 128, 128, 0.08);
  }

  &.selected {
    background: rgba(var(--v-theme-primary), 0.1);
  }
}
</style>
