<template>
  <v-dialog
    :model-value="modelValue"
    :theme="$theme.primary()"
    content-class="liturgy-dialog-wrapper"
    @update:model-value="updateModelValue"
  >
    <v-card 
      class="add-item-card-modal"
      :class="{ 'step-selection': addStep === 1, 'step-form': addStep === 2 }"
    >
      <!-- Step 1: Type Selection -->
      <div v-if="addStep === 1" class="add-item-step-wrapper">
        <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <div class="add-item-header-icon mr-3">
                <v-icon color="white" size="20">
                  mdi-music-note
                </v-icon>
              </div>
              <div>
                <h2 class="text-h6 font-weight-bold mb-0" style="color: var(--sidebar-text); line-height: 1.2;">
                  {{ t('add_item') }}
                </h2>
                <div class="text-caption mt-0.5" style="color: var(--sidebar-text-secondary);">
                  {{ t('add_item_dialog.step1_subtitle') }}
                </div>
              </div>
            </div>
            <v-btn
              icon
              size="small"
              variant="text"
              class="modal-nav-icon-btn"
              @click="closeMenu"
            >
              <v-icon size="20">
                mdi-close
              </v-icon>
            </v-btn>
          </div>
        </div>
          
        <div style="background: var(--main-bg, #1a1d26); padding: 20px 24px 24px; flex: 1; min-height: 0; overflow-y: auto;">
          <div class="add-item-types-grid">
            <div
              v-for="type in itemTypes"
              :key="type.value"
              class="type-selection-card"
              @click="openAddForm(type.value)"
            >
              <div class="d-flex align-center" style="min-width: 0; flex: 1;">
                <div
                  class="type-icon-box"
                  :style="{
                    background: type.bgHex,
                  }"
                >
                  <v-icon size="22" :color="type.colorHex">
                    {{ type.icon }}
                  </v-icon>
                </div>
                <div class="type-text-wrap" style="min-width: 0; flex: 1;">
                  <div class="type-title" :title="type.label">
                    {{ type.label }}
                  </div>
                  <div v-if="type.description" class="type-description" :title="type.description">
                    {{ type.description }}
                  </div>
                </div>
              </div>
              <v-icon size="18" class="type-chevron">
                mdi-chevron-right
              </v-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Form -->
      <div v-else-if="addStep === 2" class="add-item-step-wrapper">
        <!-- Header -->
        <div class="pa-5 px-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-btn
                v-if="!editData && !isFillingPlaceholder"
                icon
                size="small"
                variant="text"
                class="modal-nav-icon-btn mr-3"
                @click="addStep = 1"
              >
                <v-icon size="20">
                  mdi-arrow-left
                </v-icon>
              </v-btn>
              <div
                class="mr-3 d-flex align-center justify-center flex-shrink-0"
                :style="{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: getTypeBgHex(addForm.type),
                }"
              >
                <v-icon :color="getTypeColorHex(addForm.type)" size="20">
                  {{ getTypeIcon(addForm.type) }}
                </v-icon>
              </div>
              <div>
                <h2 class="text-h6 font-weight-bold mb-0" style="color: var(--sidebar-text); line-height: 1.2;">
                  {{ getTypeLabel(addForm.type) }}
                </h2>
                <div class="text-caption mt-0.5" style="color: var(--sidebar-text-secondary);">
                  {{ t('add_item_dialog.step2_subtitle') }}
                </div>
              </div>
            </div>
            <v-btn
              icon
              size="small"
              variant="text"
              class="modal-nav-icon-btn"
              @click="closeMenu"
            >
              <v-icon size="20">
                mdi-close
              </v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Body -->
        <div class="step-form-content pa-5 px-6" style="background: var(--main-bg, #1a1d26); flex: 1; min-height: 0; overflow-y: auto;">
          <!-- Seção 1: Informações Gerais (Nome & Cor de Destaque) -->
          <div class="form-section-card mb-4">
            <!-- Nome -->
            <div class="form-field-group mb-3">
              <div class="field-label mb-1.5">
                {{ t('fields.name') }}
              </div>
              <v-text-field
                v-model="addForm.name"
                variant="solo"
                density="comfortable"
                color="primary"
                rounded="lg"
                hide-details
                class="standard-text-input"
                :placeholder="getNamePlaceholder(addForm.type)"
                autofocus
              />
            </div>

            <!-- Cor de Destaque -->
            <div class="form-field-group">
              <div class="field-label mb-2">
                {{ t('add_item_dialog.highlight_color') }}
              </div>
              <div class="color-palette-bar">
                <button
                  type="button"
                  class="color-circle-btn color-none-btn"
                  :class="{ active: !addForm.color }"
                  title="Sem cor de destaque"
                  @click="addForm.color = ''"
                >
                  <v-icon size="13">
                    mdi-close
                  </v-icon>
                </button>
                <button
                  v-for="color in colorPalette"
                  :key="color"
                  type="button"
                  class="color-circle-btn"
                  :class="{ active: addForm.color === color }"
                  :style="{ backgroundColor: color, color: color }"
                  @click="addForm.color = color"
                >
                  <v-icon v-if="addForm.color === color" size="13" color="white">
                    mdi-check
                  </v-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Seção 2: Detalhes Específicos por Tipo (ocultos em modo template) -->
          <template v-if="!isTemplateMode || isFillingPlaceholder">
            <div v-if="addForm.type === 'annotation'" class="form-section-card mb-4">
              <div class="form-field-group">
                <div class="field-label mb-1.5">
                  {{ t('fields.description') }}
                </div>
                <v-textarea
                  v-model="addForm.subtitle"
                  variant="solo"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  hide-details
                  rows="3"
                  auto-grow
                  prepend-inner-icon="mdi-text-box-outline"
                  class="standard-text-input"
                  placeholder="Escreva a anotação para este item..."
                />
              </div>
            </div>

            <!-- MÚSICA: Autocomplete + PillSwitch Modo de Reprodução -->
            <div v-if="addForm.type === 'music'" class="form-section-card mb-4">
              <div class="form-field-group mb-3">
                <div class="field-label mb-1.5">
                  {{ t('fields.search_music') }}
                </div>
                <v-autocomplete
                  v-model="addForm.musicId"
                  v-model:search="musicSearchQuery"
                  :menu="musicMenuOpen"
                  :items="filteredMusicList"
                  :custom-filter="() => true"
                  item-title="name"
                  item-value="id_music"
                  variant="solo"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-magnify"
                  :menu-icon="''"
                  class="standard-text-input music-search-autocomplete"
                  :placeholder="t('fields.search_music_placeholder')"
                  hide-details
                  hide-no-data
                  :menu-props="{ transition: 'fade-transition' }"
                  :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                  @update:menu="onMusicMenuUpdate"
                  @update:model-value="onMusicSelect"
                >
                  <template #append-inner>
                    <div class="d-flex align-center">
                      <v-btn
                        v-if="musicSearchQuery || addForm.musicId"
                        icon="mdi-close"
                        size="x-small"
                        variant="text"
                        class="clear-search-btn mr-1"
                        title="Limpar pesquisa"
                        @click.stop="clearMusicSearch"
                      />

                      <v-menu
                        :close-on-content-click="false"
                        location="bottom end"
                        :offset="8"
                        transition="slide-y-transition"
                      >
                        <template #activator="{ props: filterProps }">
                          <v-btn
                            icon="mdi-filter-variant"
                            size="small"
                            variant="text"
                            v-bind="filterProps"
                            class="filter-search-btn"
                            :class="{ 'filter-active': hasCustomMusicFilter }"
                            :title="t('fields.filter_by')"
                          />
                        </template>
                        <div class="search-filter-popover">
                          <div class="filter-header">
                            {{ t('fields.filter_by') }}
                          </div>
                          <button
                            type="button"
                            class="filter-item"
                            :class="{ active: musicSearchFilters.includes('name') }"
                            @click="toggleMusicSearchFilter('name')"
                          >
                            <v-icon
                              :icon="musicSearchFilters.includes('name') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                              size="18"
                              class="filter-radio-icon mr-2.5"
                              :class="{ 'active-check': musicSearchFilters.includes('name') }"
                            />
                            <span class="filter-label">{{ t('fields.filter_song_name') }}</span>
                          </button>
                          <button
                            type="button"
                            class="filter-item"
                            :class="{ active: musicSearchFilters.includes('albums') }"
                            @click="toggleMusicSearchFilter('albums')"
                          >
                            <v-icon
                              :icon="musicSearchFilters.includes('albums') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                              size="18"
                              class="filter-radio-icon mr-2.5"
                              :class="{ 'active-check': musicSearchFilters.includes('albums') }"
                            />
                            <span class="filter-label">{{ t('fields.filter_album') }}</span>
                          </button>
                          <button
                            type="button"
                            class="filter-item"
                            :class="{ active: musicSearchFilters.includes('lyric') }"
                            @click="toggleMusicSearchFilter('lyric')"
                          >
                            <v-icon
                              :icon="musicSearchFilters.includes('lyric') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                              size="18"
                              class="filter-radio-icon mr-2.5"
                              :class="{ 'active-check': musicSearchFilters.includes('lyric') }"
                            />
                            <span class="filter-label">{{ t('fields.filter_lyrics') }}</span>
                          </button>
                        </div>
                      </v-menu>
                    </div>
                  </template>
                  <template #item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      :title="undefined"
                      class="mx-2 rounded-lg mb-1"
                      color="primary"
                      style="min-height: 40px;"
                    >
                      <template v-if="item.raw.hymnal_track" #prepend>
                        <span class="mr-3 font-weight-bold" style="color: var(--accent-blue); min-width: 32px; font-size: 0.85rem;">{{ item.raw.hymnal_track }}</span>
                      </template>
                      <template #title>
                        <div class="d-flex flex-column justify-center" style="min-height: 38px;">
                          <span class="text-body-2 font-weight-medium" :class="item.value === addForm.musicId ? '' : 'opacity-70'">
                            {{ item.title }}
                          </span>
                          <span v-if="item.raw.album_names" class="text-caption" style="color: var(--sidebar-text-secondary); opacity: 0.8; font-size: 0.7rem !important; line-height: 1.2; margin-top: 2px;">{{ item.raw.album_names }}</span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>

              <!-- Seletor Modo da Música (Cantado / Playback) -->
              <div class="form-field-group">
                <div class="field-label mb-1.5">
                  {{ t('fields.music_mode') }}
                </div>
                <PillSwitch
                  v-model="addForm.musicMode"
                  :items="musicModeItems"
                />
                <div
                  v-if="selectedMusic && !selectedMusicHasPlayback"
                  class="playback-notice-badge mt-2"
                >
                  <v-icon size="14" class="mr-1.5" icon="mdi-information-outline" />
                  <span>{{ t('messages.playback_unavailable') }}</span>
                </div>
              </div>
            </div>

            <!-- COLETÂNEAS: Personalizadas / Online -->
            <div v-if="addForm.type === 'collection_item'" class="form-section-card mb-4">
              <!-- PillSwitch: Personalizadas / Online -->
              <div class="form-field-group mb-3">
                <div class="field-label mb-1.5">
                  {{ t('fields.collection_type') }}
                </div>
                <PillSwitch
                  v-model="addForm.collectionType"
                  :items="collectionTypeItems"
                  @update:model-value="onCollectionTypeChanged"
                />
              </div>

              <!-- ABA 1: COLETÂNEAS PERSONALIZADAS -->
              <div v-if="addForm.collectionType === 'custom'">
                <div
                  v-if="customCollections.length === 0"
                  class="empty-collections-state text-center pa-5 rounded-xl border"
                  style="background: rgba(var(--v-theme-on-surface), 0.02); border-color: rgba(128,128,128,0.15) !important;"
                >
                  <v-icon
                    size="36"
                    color="teal"
                    class="mb-2"
                    style="opacity: 0.7;"
                  >
                    mdi-folder-music-outline
                  </v-icon>
                  <div class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                    {{ t('fields.no_custom_collections') }}
                  </div>
                  <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
                    {{ t('fields.no_custom_collections_hint') }}
                  </div>
                </div>

                <div v-else>
                  <!-- Selecionar Coletânea -->
                  <div class="form-field-group mb-3">
                    <div class="field-label mb-1">
                      {{ t('fields.select_collection') }}
                    </div>
                    <v-select
                      v-model="addForm.collectionId"
                      :items="customCollections"
                      item-title="name"
                      item-value="id"
                      variant="solo"
                      density="comfortable"
                      color="primary"
                      rounded="lg"
                      hide-details
                      class="standard-text-input"
                      :placeholder="t('fields.select_collection')"
                      :menu-props="{ transition: 'fade-transition' }"
                      :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                      @update:model-value="onSelectCustomCollection"
                    >
                      <template #selection="{ item }">
                        <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
                      </template>
                      <template #item="{ item, props }">
                        <v-list-item
                          v-bind="props"
                          :title="undefined"
                          class="mx-2 rounded-lg mb-1"
                          color="primary"
                          style="min-height: 40px;"
                        >
                          <template #title>
                            <div class="d-flex flex-column justify-center" style="min-height: 38px;">
                              <span class="text-body-2 font-weight-medium" :class="item.value === addForm.collectionId ? '' : 'opacity-70'">
                                {{ item.title }}
                              </span>
                              <span class="text-caption" style="color: var(--sidebar-text-secondary); opacity: 0.8; font-size: 0.7rem !important; line-height: 1.2; margin-top: 2px;">
                                {{ (item.raw.songs || []).length }} {{ (item.raw.songs || []).length === 1 ? 'música' : 'músicas' }}
                              </span>
                            </div>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </div>

                  <!-- Selecionar Música da Coletânea -->
                  <div v-if="addForm.collectionId" class="form-field-group mb-3">
                    <div class="field-label mb-1">
                      {{ t('fields.select_song') }}
                    </div>
                    <v-select
                      v-model="addForm.collectionSongId"
                      :items="customCollectionSongs"
                      item-title="name"
                      item-value="id"
                      variant="solo"
                      density="comfortable"
                      color="primary"
                      rounded="lg"
                      hide-details
                      class="standard-text-input"
                      :placeholder="t('fields.select_song')"
                      :menu-props="{ transition: 'fade-transition' }"
                      :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                      @update:model-value="onSelectCustomSong"
                    >
                      <template #selection="{ item }">
                        <span class="text-body-2 font-weight-medium text-truncate">{{ item.title }}</span>
                      </template>
                      <template #item="{ item, props }">
                        <v-list-item
                          v-bind="props"
                          :title="undefined"
                          class="mx-2 rounded-lg mb-1"
                          color="primary"
                          style="min-height: 40px;"
                        >
                          <template #title>
                            <div class="d-flex flex-column justify-center" style="min-height: 38px;">
                              <span class="text-body-2 font-weight-medium text-truncate" :class="item.value === addForm.collectionSongId ? '' : 'opacity-70'">
                                {{ item.raw.name }}
                              </span>
                              <span v-if="item.raw.album" class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); opacity: 0.8; font-size: 0.7rem !important; line-height: 1.2; margin-top: 2px;">
                                {{ item.raw.album }}
                              </span>
                            </div>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </div>

                  <!-- Seletor Modo da Música se tiver playback -->
                  <div v-if="selectedCustomCollectionSong" class="form-field-group">
                    <div class="field-label mb-1.5">
                      {{ t('fields.music_mode') }}
                    </div>
                    <PillSwitch
                      v-model="addForm.musicMode"
                      :items="[
                        { value: 'audio', label: t('fields.music_mode_audio'), icon: 'mdi-account-voice' },
                        { value: 'instrumental', label: t('fields.music_mode_instrumental'), icon: 'mdi-music-note', disabled: !selectedCustomCollectionSong.hasPlayback }
                      ]"
                    />
                  </div>
                </div>
              </div>

              <!-- ABA 2: COLETÂNEAS ONLINE (YOUTUBE) -->
              <div v-else-if="addForm.collectionType === 'online'">
                <div class="form-field-group mb-3">
                  <div class="field-label mb-1.5">
                    {{ t('fields.search_online_videos') }}
                  </div>
                  <v-autocomplete
                    v-model="addForm.onlineVideoId"
                    v-model:search="onlineSearchQuery"
                    :menu="onlineMenuOpen"
                    :items="filteredOnlineVideos"
                    :custom-filter="() => true"
                    :loading="onlineLoading"
                    item-title="name"
                    item-value="id"
                    variant="solo"
                    density="comfortable"
                    color="primary"
                    rounded="lg"
                    prepend-inner-icon="mdi-magnify"
                    :menu-icon="''"
                    class="standard-text-input music-search-autocomplete"
                    :placeholder="t('fields.search_online_videos')"
                    hide-details
                    hide-no-data
                    :menu-props="{ transition: 'fade-transition' }"
                    :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                    @update:search="onOnlineMenuUpdate"
                    @update:model-value="onOnlineVideoSelect"
                    @click="openOnlineMenu"
                  >
                    <template #append-inner>
                      <div class="d-flex align-center">
                        <v-btn
                          v-if="onlineSearchQuery || addForm.onlineVideoId"
                          icon="mdi-close"
                          size="x-small"
                          variant="text"
                          class="clear-search-btn mr-1"
                          @click.stop="clearOnlineSearch"
                        />
                      </div>
                    </template>
                    <template #item="{ item, props }">
                      <v-list-item
                        v-bind="props"
                        :title="undefined"
                        class="mx-2 rounded-lg mb-1"
                        color="primary"
                        style="min-height: 40px;"
                      >
                        <template #title>
                          <div class="d-flex flex-column justify-center" style="min-height: 38px;">
                            <span class="text-body-2 font-weight-medium text-truncate" :class="item.value === addForm.onlineVideoId ? '' : 'opacity-70'">
                              {{ item.title }}
                            </span>
                            <span v-if="item.raw.channelName" class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); opacity: 0.8; font-size: 0.7rem !important; line-height: 1.2; margin-top: 2px;">
                              {{ item.raw.channelName }}
                            </span>
                          </div>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </div>
              </div>
            </div>

            <!-- VERSÍCULO: Livro + Capítulo / Versículos -->
            <div v-if="addForm.type === 'verse'" class="form-section-card mb-4">
              <div class="form-field-group mb-3">
                <div class="field-label mb-1">
                  {{ t('fields.book') }}
                </div>
                <v-autocomplete
                  v-model="addForm.verseBookId"
                  :items="bibleBooks"
                  item-title="name"
                  item-value="id_bible_book"
                  variant="solo"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-book-open-page-variant-outline"
                  class="standard-text-input"
                  :placeholder="t('fields.book')"
                  hide-details
                  :menu-props="{ transition: 'fade-transition' }"
                  :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                  @update:model-value="onBookSelect"
                >
                  <template #item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      :title="undefined"
                      class="mx-2 rounded-lg mb-1"
                      color="primary"
                      style="min-height: 40px;"
                    >
                      <template #title>
                        <div class="d-flex align-center">
                          <span class="text-body-2 font-weight-medium" :class="item.value === addForm.verseBookId ? '' : 'opacity-70'">
                            {{ item.title }}
                          </span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-title class="text-caption text-center pt-2 pb-2" style="color: var(--sidebar-text-secondary);">
                        {{ t('messages.book_not_found') }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>
              <div class="d-flex" style="gap: 12px;">
                <div style="flex: 1; min-width: 0;">
                  <div class="field-label mb-1">
                    {{ t('fields.chapter') }}
                  </div>
                  <v-autocomplete
                    v-model="addForm.verseChapter"
                    :items="verseChapterList"
                    variant="solo"
                    density="comfortable"
                    color="primary"
                    rounded="lg"
                    class="standard-text-input"
                    :placeholder="t('fields.chapter')"
                    hide-details
                    :menu-props="{ transition: 'fade-transition' }"
                    :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                  >
                    <template #item="{ item, props }">
                      <v-list-item
                        v-bind="props"
                        :title="undefined"
                        class="mx-2 rounded-lg mb-1"
                        color="primary"
                        style="min-height: 40px;"
                      >
                        <template #title>
                          <div class="d-flex align-center">
                            <span class="text-body-2 font-weight-medium" :class="item.value === addForm.verseChapter ? '' : 'opacity-70'">
                              {{ item.title }}
                            </span>
                          </div>
                        </template>
                      </v-list-item>
                    </template>
                    <template #no-data>
                      <v-list-item>
                        <v-list-item-title class="text-caption text-center pt-2 pb-2" style="color: var(--sidebar-text-secondary);">
                          {{ addForm.verseBookId ? t('messages.chapter_not_found') : t('messages.select_book_first') }}
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div class="field-label mb-1">
                    {{ t('fields.verses') }}
                  </div>
                  <v-text-field
                    v-model="addForm.verseNumbers"
                    variant="solo"
                    density="comfortable"
                    color="primary"
                    rounded="lg"
                    hide-details
                    class="standard-text-input"
                    :placeholder="t('fields.verses_placeholder')"
                  />
                </div>
              </div>
            </div>

            <!-- MÍDIA E ARQUIVOS: Dropzone ou Card Selecionado -->
            <div v-if="addForm.type === 'file' || addForm.type === 'media'" class="form-section-card mb-4">
              <div class="field-label mb-2">
                {{ t('fields.select_file') || 'Selecionar Arquivo ou Pasta' }}
              </div>
              <div
                v-if="addForm.filePath"
                class="selected-file-card"
              >
                <div class="d-flex align-center" style="overflow: hidden; min-width: 0; flex: 1;">
                  <div
                    class="file-icon-badge mr-3 flex-shrink-0"
                    :style="{
                      background: selectedFileInfo.color === 'primary' ? 'rgba(0, 159, 227, 0.15)' : 'rgba(128, 128, 128, 0.15)',
                    }"
                  >
                    <v-icon :icon="selectedFileInfo.icon" size="24" :color="selectedFileInfo.color" />
                  </div>
                  <div class="d-flex flex-column text-truncate" style="min-width: 0; flex: 1;">
                    <div class="d-flex align-center mb-0.5">
                      <span class="file-name-text font-weight-bold text-truncate" :title="selectedFileInfo.fileName">
                        {{ selectedFileInfo.fileName }}
                      </span>
                      <v-chip
                        size="x-small"
                        :color="selectedFileInfo.color"
                        variant="tonal"
                        class="ml-2 font-weight-bold px-2 flex-shrink-0"
                        style="height: 20px; font-size: 0.68rem;"
                      >
                        {{ selectedFileInfo.label }}
                      </v-chip>
                    </div>
                    <span class="file-path-text text-caption text-truncate" :title="addForm.filePath">
                      {{ addForm.filePath }}
                    </span>
                  </div>
                </div>
                <div class="d-flex align-center flex-shrink-0 ml-3" style="gap: 4px;">
                  <v-menu location="bottom end" :offset="4">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        v-bind="menuProps"
                        icon
                        size="small"
                        variant="text"
                        color="primary"
                        :title="t('actions.change')"
                      >
                        <v-icon size="18">
                          mdi-folder-open-outline
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact" rounded="lg" elevation="4">
                      <v-list-item
                        prepend-icon="mdi-file-outline"
                        @click="selectUnifiedFile"
                      >
                        <v-list-item-title class="text-body-2">
                          {{ t('fields.select_file') }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        prepend-icon="mdi-folder-outline"
                        @click="selectFolder"
                      >
                        <v-list-item-title class="text-body-2">
                          {{ t('fields.select_folder') }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="addForm.filePath = ''"
                  >
                    <v-icon size="18">
                      mdi-close
                    </v-icon>
                    <v-tooltip activator="parent" location="top">
                      {{ t('actions.delete') }}
                    </v-tooltip>
                  </v-btn>
                </div>
              </div>

              <div
                v-else
                class="file-dropzone-box"
                @click="selectUnifiedFile"
              >
                <div class="dropzone-icon-circle mb-2">
                  <v-icon size="24" color="primary">
                    mdi-cloud-upload-outline
                  </v-icon>
                </div>
                <div class="dropzone-title">
                  {{ t('fields.select_file') || 'Escolher Arquivo' }}
                </div>
                <div class="dropzone-subtitle mb-2">
                  {{ t('type_descriptions.file') }}
                </div>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="text-none font-weight-medium px-4 mt-1"
                  rounded="lg"
                  @click.stop="selectFolder"
                >
                  <v-icon start size="16">
                    mdi-folder-outline
                  </v-icon>
                  {{ t('fields.or_select_folder') || 'Ou selecionar uma pasta...' }}
                </v-btn>
              </div>
            </div>

            <!-- LINK: URL -->
            <div v-if="addForm.type === 'link'" class="form-section-card mb-4">
              <div class="form-field-group">
                <div class="field-label mb-1">
                  {{ t('fields.url') }}
                </div>
                <v-text-field
                  v-model="addForm.url"
                  variant="solo"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-link-variant"
                  hide-details
                  class="standard-text-input"
                  :placeholder="t('fields.url_placeholder')"
                />
              </div>
            </div>

            <!-- ITEM AGENDADO: Categoria -->
            <div v-if="addForm.type === 'scheduled_item'" class="form-section-card mb-4">
              <div class="form-field-group">
                <div class="field-label mb-1">
                  {{ t('add_item_dialog.scheduled_category') }}
                </div>
                <v-autocomplete
                  v-model="addForm.categoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  variant="solo"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  hide-details
                  class="standard-text-input"
                  placeholder="Selecione a categoria"
                  :menu-props="{ transition: 'fade-transition' }"
                  :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                  @update:model-value="onScheduledCategorySelect"
                >
                  <template #item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      :title="undefined"
                      class="mx-2 rounded-lg mb-1"
                      color="primary"
                      style="min-height: 40px;"
                    >
                      <template #title>
                        <div class="d-flex flex-column justify-center" style="min-height: 38px;">
                          <span class="text-body-2 font-weight-medium" :class="item.value === addForm.categoryId ? '' : 'opacity-70'">
                            {{ item.title }}
                          </span>
                          <span v-if="item.raw.items" class="text-caption" style="color: var(--sidebar-text-secondary); opacity: 0.8; font-size: 0.7rem !important; line-height: 1.2; margin-top: 2px;">
                            {{ (item.raw.items || []).length }} {{ (item.raw.items || []).length === 1 ? 'arquivo agendado' : 'arquivos agendados' }}
                          </span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-title class="text-caption text-center pt-2 pb-2" style="color: var(--sidebar-text-secondary);">
                        {{ t('add_item_dialog.no_scheduled_categories') }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="pa-4 px-6 d-flex justify-space-between align-center flex-shrink-0" style="background: rgba(0,0,0,0.02); border-top: 1px solid rgba(255,255,255,0.05);">
          <v-spacer />
          <div class="d-flex justify-end" style="gap: 12px;">
            <v-btn
              variant="tonal"
              class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
              @click="closeMenu"
            >
              {{ t('actions.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :disabled="!isFormValid"
              class="rounded-lg text-none px-6 font-weight-bold flex-shrink-0"
              @click="saveItem"
            >
              {{ t('actions.save') }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import PillSwitch from "@/components/inputs/PillSwitch.vue";
import { getLiturgyFileInfo, LiturgyFileInfo } from "../../helpers/fileHelper";
import OnlineCollections from "@/helpers/services/OnlineCollections";

export default defineComponent({
  name: "AddItemDialog",
  components: {
    PillSwitch,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object as PropType<any | null>,
      default: null,
    },
    categories: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    isTemplateMode: {
      type: Boolean,
      default: false,
    },
    isFillingPlaceholder: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "save"],
  data: () => ({
    addStep: 1 as number,
    addForm: {
      type: "annotation",
      name: "",
      subtitle: "",
      musicId: null as number | string | null,
      musicMode: "audio",
      verseBookId: null as number | null,
      verseChapter: null as number | null,
      verseNumbers: "",
      filePath: "",
      url: "",
      categoryId: null as string | null,
      color: "",
      collectionType: "custom" as "custom" | "online",
      collectionId: null as string | null,
      collectionSongId: null as any,
      collectionSongType: "internal" as "internal" | "external",
      collectionSongFilePath: "",
      collectionSongFilePathAudio: "",
      collectionSongFilePathInstrumental: "",
      onlineVideoId: "",
      onlineVideoImage: "",
      onlineChannelName: "",
      onlinePlaylistName: "",
    },
    musicSearchQuery: "",
    musicMenuOpen: false as boolean,
    musicSearchFilters: ["name"] as string[],
    musicList: [] as any[],
    bibleBooks: [] as any[],
    bibleVersions: [] as any[],
    customCollections: [] as any[],
    onlineVideos: [] as any[],
    onlineSearchQuery: "",
    onlineMenuOpen: false as boolean,
    onlineLoading: false,
    dataLoaded: false,
  }),
  computed: {
    hasCustomMusicFilter(): boolean {
      return this.musicSearchFilters.includes("albums") || this.musicSearchFilters.includes("lyric");
    },
    colorPalette(): string[] {
      return [
        "#ef4444",
        "#f43f5e",
        "#ec4899",
        "#a855f7",
        "#6366f1",
        "#3b82f6",
        "#06b6d4",
        "#10b981",
        "#84cc16",
        "#f59e0b",
        "#f97316",
      ];
    },
    itemTypes(): any[] {
      return [
        {
          value: "music",
          icon: "mdi-music",
          color: "purple",
          colorHex: "#a78bfa",
          bgHex: "rgba(139, 92, 246, 0.16)",
          label: this.t("types.music"),
          description: this.t("type_descriptions.music"),
        },
        {
          value: "collection_item",
          icon: "mdi-music-box-multiple",
          color: "sky",
          colorHex: "#38bdf8",
          bgHex: "rgba(2, 132, 199, 0.16)",
          label: this.t("types.collection_item"),
          description: this.t("type_descriptions.collection_item"),
        },
        {
          value: "verse",
          icon: "mdi-book-open-page-variant",
          color: "amber",
          colorHex: "#fbbf24",
          bgHex: "rgba(245, 158, 11, 0.16)",
          label: this.t("types.verse"),
          description: this.t("type_descriptions.verse"),
        },
        {
          value: "file",
          icon: "mdi-image-multiple",
          color: "emerald",
          colorHex: "#34d399",
          bgHex: "rgba(16, 185, 129, 0.16)",
          label: this.t("types.file"),
          description: this.t("type_descriptions.file"),
        },
        {
          value: "link",
          icon: "mdi-link-variant",
          color: "cyan",
          colorHex: "#22d3ee",
          bgHex: "rgba(6, 182, 212, 0.16)",
          label: this.t("types.link"),
          description: this.t("type_descriptions.link"),
        },
        {
          value: "scheduled_item",
          icon: "mdi-calendar-clock",
          color: "violet",
          colorHex: "#c084fc",
          bgHex: "rgba(168, 85, 247, 0.16)",
          label: this.t("types.scheduled_item"),
          description: this.t("type_descriptions.scheduled_item"),
        },
        {
          value: "annotation",
          icon: "mdi-text-box-outline",
          color: "blue",
          colorHex: "#60a5fa",
          bgHex: "rgba(59, 130, 246, 0.16)",
          label: this.t("types.annotation"),
          description: this.t("type_descriptions.annotation"),
        },
        {
          value: "category",
          icon: "mdi-folder-outline",
          color: "orange",
          colorHex: "#fb923c",
          bgHex: "rgba(234, 88, 12, 0.16)",
          label: this.t("types.category"),
          description: this.t("type_descriptions.category"),
        },
      ];
    },
    collectionTypeItems(): any[] {
      return [
        { value: "custom", label: this.t("fields.custom_collections"), icon: "mdi-folder-music" },
        { value: "online", label: this.t("fields.online_collections"), icon: "mdi-web" },
      ];
    },
    selectedCustomCollection(): any {
      if (!this.addForm.collectionId) return null;
      return this.customCollections.find((c: any) => c.id === this.addForm.collectionId) || null;
    },
    customCollectionSongs(): any[] {
      if (!this.selectedCustomCollection?.songs) return [];
      return this.selectedCustomCollection.songs.map((song: any) => {
        if (song.type === "internal") {
          const m = this.musicList.find((music: any) => music.id_music === song.id_music);
          const name = m ? (m.hymnal_track ? `${m.hymnal_track} - ${m.name}` : m.name) : `Música #${song.id_music}`;
          const hasPlayback = m ? (m.has_instrumental_music === 1 || m.has_instrumental_music === true) : false;
          return {
            id: song.id || song.id_music,
            name,
            type: "internal",
            album: m?.album_names || "",
            hasPlayback,
            raw: song,
          };
        }
        return {
          id: song.id || song.name || song.filePathAudio,
          name: song.name,
          type: "external",
          album: "Arquivo Externo",
          hasPlayback: !!song.filePathInstrumental,
          raw: song,
        };
      });
    },
    selectedCustomCollectionSong(): any {
      if (!this.addForm.collectionSongId) return null;
      const targetId = typeof this.addForm.collectionSongId === "object" ? (this.addForm.collectionSongId as any).id : this.addForm.collectionSongId;
      return this.customCollectionSongs.find((s: any) => s.id === targetId) || null;
    },
    filteredOnlineVideos(): any[] {
      const selectedVideo = this.onlineVideos.find((v: any) => v.id === this.addForm.onlineVideoId);
      const q = (this.onlineSearchQuery || "").trim().toLowerCase();
      if (!q) {
        if (selectedVideo) {
          const remaining = this.onlineVideos.filter((v: any) => v.id !== selectedVideo.id).slice(0, 39);
          return [selectedVideo, ...remaining];
        }
        return this.onlineVideos.slice(0, 40);
      }
      return this.onlineVideos.filter((v: any) => {
        return (v.name && v.name.toLowerCase().includes(q)) || (v.channelName && v.channelName.toLowerCase().includes(q));
      }).slice(0, 50);
    },
    selectedFileInfo(): LiturgyFileInfo {
      return getLiturgyFileInfo(this.addForm.filePath);
    },
    isFormValid(): boolean {
      if (!this.addForm.name.trim()) return false;

      if (this.isTemplateMode && !this.isFillingPlaceholder) {
        return true;
      }

      if (this.addForm.type === "music" && !this.addForm.musicId) return false;
      if (this.addForm.type === "collection_item") {
        if (this.addForm.collectionType === "custom") {
          if (!this.addForm.collectionId || !this.addForm.collectionSongId) return false;
        } else if (this.addForm.collectionType === "online") {
          if (!this.addForm.onlineVideoId) return false;
        }
      }
      if (this.addForm.type === "verse" && (!this.addForm.verseBookId || !this.addForm.verseChapter)) return false;
      if (this.addForm.type === "media" && !this.addForm.filePath) return false;
      if (this.addForm.type === "file" && !this.addForm.filePath) return false;
      if (this.addForm.type === "link" && !this.addForm.url.trim()) return false;
      if (this.addForm.type === "scheduled_item" && !this.addForm.categoryId) return false;
      return true;
    },
    filteredMusicList(): any[] {
      const selectedMusic = this.musicList.find(m => m.id_music === this.addForm.musicId);
      const query = (this.musicSearchQuery || "").trim().toLowerCase();
      
      if (!query) {
        return selectedMusic ? [selectedMusic] : [];
      }
      
      const isNum = !isNaN(Number(query)) && query !== "";
      const numQuery = isNum ? Number(query) : null;
      
      const results = this.musicList.filter(m => {
        const matchesName = this.musicSearchFilters.includes("name")
          ? this.$string.matchesSearch(m.name, this.musicSearchQuery)
          : false;
        const matchesAlbum = (this.musicSearchFilters.includes("albums") && m.albums)
          ? this.$string.matchesSearch(m.albums.map((a: any) => a.name).join(" "), this.musicSearchQuery)
          : false;
        const matchesLyric = (this.musicSearchFilters.includes("lyric") && m.lyric)
          ? this.$string.matchesSearch(m.lyric, this.musicSearchQuery)
          : false;

        if (isNum) {
          const isHymnalTrack = m.albums?.some((a: any) => a.type === "hymnal" && Number(a.pivot?.track) === numQuery);
          return matchesName || matchesAlbum || matchesLyric || isHymnalTrack;
        } 
        return matchesName || matchesAlbum || matchesLyric;
      });
      
      if (isNum) {
        results.sort((a, b) => {
          const getScore = (item: any) => {
            if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numQuery)) return 2;
            if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numQuery)) return 1;
            return 0;
          };
          return getScore(b) - getScore(a);
        });
      } else if (query) {
        const cleanQuery = this.$string.clean(query);
        results.sort((a, b) => {
          const getTextScore = (item: any) => {
            let maxScore = 0;
            if (this.musicSearchFilters.includes("name")) {
              const cleanName = this.$string.clean(item.name);
              if (cleanName.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 4);
              else if (cleanName.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 3);
            }
            if (this.musicSearchFilters.includes("albums") && item.albums) {
              const cleanAlbums = this.$string.clean(item.albums.map((al: any) => al.name).join(" "));
              if (cleanAlbums.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 2);
              else if (cleanAlbums.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 1);
            }
            if (this.musicSearchFilters.includes("lyric") && item.lyric) {
              const cleanLyric = this.$string.clean(item.lyric);
              if (cleanLyric.includes(cleanQuery)) maxScore = Math.max(maxScore, 0.5);
            }
            return maxScore;
          };
          
          const scoreA = getTextScore(a);
          const scoreB = getTextScore(b);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return this.$string.sort(a.name, b.name);
        });
      }
      
      return results.slice(0, 50); // limit to 50 results to keep the menu fast
    },
    verseChapterList(): number[] {
      if (!this.addForm.verseBookId) return [];
      const book = this.bibleBooks.find(b => b.id_bible_book === this.addForm.verseBookId);
      if (!book) return [];
      return Array.from({ length: book.chapters }, (_, i) => i + 1);
    },
    selectedMusic(): any {
      if (!this.addForm.musicId) return null;
      return this.musicList.find((m: any) => m.id_music === this.addForm.musicId) || null;
    },
    selectedMusicHasPlayback(): boolean {
      if (!this.selectedMusic) return true;
      return this.selectedMusic.has_instrumental_music === 1 || this.selectedMusic.has_instrumental_music === true;
    },
    musicModeItems(): any[] {
      return [
        {
          value: "audio",
          label: this.t("fields.music_mode_audio"),
          icon: "mdi-account-voice",
        },
        {
          value: "instrumental",
          label: this.t("fields.music_mode_instrumental"),
          icon: "mdi-music-note",
          disabled: this.selectedMusic ? !this.selectedMusicHasPlayback : false,
        },
      ];
    },
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.initForm();
      }
    },
    musicSearchQuery(val) {
      const query = (val || "").trim();
      if (!query) {
        this.musicMenuOpen = false;
      } else {
        this.$nextTick(() => {
          this.musicMenuOpen = this.filteredMusicList.length > 0;
        });
      }
    },
    onlineSearchQuery(val) {
      const query = (val || "").trim();
      if (!query) {
        this.onlineMenuOpen = false;
      } else {
        this.$nextTick(() => {
          this.onlineMenuOpen = this.filteredOnlineVideos.length > 0;
        });
      }
    },
  },
  mounted() {
    this.initForm();
  },
  methods: {
    initForm() {
      if (!this.dataLoaded) {
        this.loadData();
      }
      this.loadCustomCollections();
      if (this.editData) {
        this.addForm = { ...this.editData };
        if (!this.addForm.musicMode) {
          this.addForm.musicMode = "audio";
        }
        if (!this.addForm.collectionType) {
          this.addForm.collectionType = "custom";
        }
        if (this.addForm.type === "collection_item" && this.addForm.collectionType === "online") {
          this.loadOnlineVideos();
        }
        if (this.addForm.type === "collection_item" && this.addForm.collectionType === "custom") {
          if (!this.addForm.collectionSongId) {
            if (this.addForm.collectionSongType === "internal") {
              this.addForm.collectionSongId = (this.editData as any).musicId;
            } else {
              const matched = this.customCollectionSongs.find((s: any) => s.name === this.addForm.name || s.raw?.filePathAudio === (this.editData as any).filePath);
              if (matched) {
                this.addForm.collectionSongId = matched.id;
              }
            }
          }
        }
        this.addStep = 2;
      } else {
        this.addStep = 1;
        this.resetForm();
      }
    },
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    updateModelValue(val: boolean) {
      if (!val) {
        this.addStep = 1;
      }
      this.$emit("update:modelValue", val);
    },
    closeMenu() {
      this.$emit("update:modelValue", false);
    },
    toggleMusicSearchFilter(filter: string) {
      if (this.musicSearchFilters.includes(filter)) {
        if (this.musicSearchFilters.length > 1) {
          this.musicSearchFilters = this.musicSearchFilters.filter(f => f !== filter);
        }
      } else {
        this.musicSearchFilters.push(filter);
      }
    },
    clearMusicSearch() {
      this.musicSearchQuery = "";
      this.addForm.musicId = null;
      this.addForm.name = "";
      this.addForm.subtitle = "";
    },
    resetForm() {
      this.musicSearchQuery = "";
      this.musicMenuOpen = false;
      this.addForm = {
        type: "annotation",
        name: "",
        subtitle: "",
        musicId: null,
        musicMode: "audio",
        verseBookId: null,
        verseChapter: null,
        verseNumbers: "",
        filePath: "",
        url: "",
        categoryId: null,
        color: "",
        collectionType: "custom",
        collectionId: null,
        collectionSongId: null,
        collectionSongType: "internal",
        collectionSongFilePath: "",
        collectionSongFilePathAudio: "",
        collectionSongFilePathInstrumental: "",
        onlineVideoId: "",
        onlineVideoImage: "",
        onlineChannelName: "",
        onlinePlaylistName: "",
      };
    },
    getTypeIcon(type: string): string {
      if ((type === "file" || type === "media") && this.addForm.filePath) {
        return this.selectedFileInfo.icon;
      }
      if (type === "collection_item") {
        return this.addForm.collectionType === "online" ? "mdi-web" : "mdi-folder-music";
      }
      const item = this.itemTypes.find((t: any) => t.value === type);
      return item ? item.icon : "mdi-help";
    },
    getTypeColor(type: string): string {
      if ((type === "file" || type === "media") && this.addForm.filePath) {
        return this.selectedFileInfo.color;
      }
      if (type === "collection_item") {
        return this.addForm.collectionType === "online" ? "red" : "teal";
      }
      const item = this.itemTypes.find((t: any) => t.value === type);
      return item ? item.color : "grey";
    },
    getTypeColorHex(type: string): string {
      if ((type === "file" || type === "media") && this.addForm.filePath) {
        return this.selectedFileInfo.color === "primary" ? "#009fe3" : this.selectedFileInfo.color;
      }
      if (type === "collection_item") {
        return this.addForm.collectionType === "online" ? "#ef4444" : "#14b8a6";
      }
      const item = this.itemTypes.find((t: any) => t.value === type);
      return item ? item.colorHex : "#009fe3";
    },
    getTypeBgHex(type: string): string {
      if (type === "collection_item" && this.addForm.collectionType === "online") {
        return "rgba(239, 68, 68, 0.16)";
      }
      const item = this.itemTypes.find((t: any) => t.value === type);
      return item ? item.bgHex : "rgba(0, 159, 227, 0.16)";
    },
    getTypeLabel(type: string): string {
      return this.t(`types.${type}`);
    },
    getNamePlaceholder(type: string): string {
      const map: Record<string, string> = {
        annotation: "",
        category: "",
        music: "",
        collection_item: "",
        verse: "",
        media: "",
        link: "",
        file: "",
      };
      return map[type] || "";
    },
    openAddForm(type: string) {
      this.resetForm();
      this.addForm.type = type;
      this.addStep = 2;
      if (type === "collection_item" && (!this.isTemplateMode || this.isFillingPlaceholder)) {
        this.loadCustomCollections();
        this.loadOnlineVideos();
      }
    },
    loadCustomCollections() {
      this.customCollections = this.$userdata.get("modules.custom_collection.list") || [];
    },
    async loadOnlineVideos() {
      if (this.onlineVideos.length > 0) return;
      this.onlineLoading = true;
      try {
        const lang = this.$i18n?.locale || "pt";
        this.onlineVideos = await OnlineCollections.getAllVideos(lang);
      } catch (e) {
        console.error("Failed to load online collections:", e);
      } finally {
        this.onlineLoading = false;
      }
    },
    onCollectionTypeChanged(type: string) {
      if (type === "online") {
        this.loadOnlineVideos();
      }
    },
    onSelectCustomCollection(colId: string) {
      this.addForm.collectionId = colId;
      this.addForm.collectionSongId = null;
      this.addForm.name = "";
      this.addForm.subtitle = "";
    },
    onSelectCustomSong(songId: any) {
      if (!songId) return;
      const targetId = typeof songId === "object" ? (songId.id || songId.value) : songId;
      const song = this.customCollectionSongs.find((s: any) => s.id === targetId);
      if (!song) return;

      this.addForm.collectionSongId = song.id;
      this.addForm.collectionSongType = song.type;
      this.addForm.name = song.name;

      const colName = this.selectedCustomCollection?.name || "";
      if (song.type === "internal") {
        this.addForm.musicId = song.raw?.id_music || song.id;
        this.addForm.subtitle = `Coletânea: ${colName}${song.album ? ` - ${song.album}` : ""}`;
        this.addForm.musicMode = "audio";
      } else {
        const raw = song.raw;
        this.addForm.collectionSongFilePath = raw?.filePathAudio || raw?.filePathInstrumental || "";
        this.addForm.collectionSongFilePathAudio = raw?.filePathAudio || "";
        this.addForm.collectionSongFilePathInstrumental = raw?.filePathInstrumental || "";
        this.addForm.filePath = raw?.filePathAudio || raw?.filePathInstrumental || "";
        this.addForm.subtitle = `Coletânea: ${colName}`;
        this.addForm.musicMode = "audio";
      }
    },
    openOnlineMenu() {
      if (this.onlineVideos.length === 0) {
        this.loadOnlineVideos();
      }
      this.onlineMenuOpen = true;
    },
    onOnlineMenuUpdate(val: boolean) {
      if (!val || !this.onlineSearchQuery || !this.onlineSearchQuery.trim()) {
        this.onlineMenuOpen = false;
      } else {
        this.onlineMenuOpen = this.filteredOnlineVideos.length > 0;
      }
    },
    onOnlineVideoSelect(videoId: string | null) {
      this.onlineMenuOpen = false;
      if (!videoId) return;
      const video = this.onlineVideos.find((v: any) => v.id === videoId);
      if (!video) return;
      this.addForm.onlineVideoId = video.id;
      this.addForm.onlineVideoImage = video.image || "";
      this.addForm.onlineChannelName = video.channelName || "";
      this.addForm.onlinePlaylistName = video.playlistName || "";
      this.addForm.filePath = `youtube:${video.id}`;
      if (!this.addForm.name) {
        this.addForm.name = video.name;
      }
      this.addForm.subtitle = video.channelName ? `Canal: ${video.channelName}` : "Coletânea Online";
    },
    clearOnlineSearch() {
      this.onlineSearchQuery = "";
      this.onlineMenuOpen = false;
      this.addForm.onlineVideoId = "";
      this.addForm.onlineVideoImage = "";
      this.addForm.onlineChannelName = "";
      this.addForm.onlinePlaylistName = "";
      this.addForm.filePath = "";
      this.addForm.name = "";
      this.addForm.subtitle = "";
    },
    onScheduledCategorySelect(categoryId: string | null) {
      if (!categoryId) return;
      const cat = this.categories.find(c => c.id === categoryId);
      if (cat && !this.addForm.name) {
        this.addForm.name = cat.name;
      }
    },
    onMusicMenuUpdate(val: boolean) {
      if (!val || !this.musicSearchQuery || !this.musicSearchQuery.trim()) {
        this.musicMenuOpen = false;
      } else {
        this.musicMenuOpen = this.filteredMusicList.length > 0;
      }
    },
    onMusicSelect(musicId: number | string | null) {
      this.musicMenuOpen = false;
      if (!musicId) return;
      const music = this.musicList.find(m => m.id_music === musicId);
      if (music) {
        if (!this.addForm.name) {
          this.addForm.name = music.hymnal_track ? `${music.hymnal_track} - ${music.name}` : music.name;
        }
        const hasPlayback = music.has_instrumental_music === 1 || music.has_instrumental_music === true;
        if (!hasPlayback && this.addForm.musicMode === "instrumental") {
          this.addForm.musicMode = "audio";
        }
      }
    },
    onBookSelect(bookId: number | null) {
      if (!bookId) return;
      this.addForm.verseChapter = 1;
      const book = this.bibleBooks.find(b => b.id_bible_book === bookId);
      if (book && !this.addForm.name) {
        this.addForm.name = book.name;
      }
    },
    async selectUnifiedFile() {
      if (window.electronAPI?.openFileDialog) {
        const filePath = await window.electronAPI.openFileDialog({
          title: this.t("fields.select_file") || "Selecionar Arquivo",
          properties: ["openFile"],
          filters: [
            { name: "Todos os Arquivos e Mídias", extensions: ["*"] },
            { name: "Mídias (Áudio / Vídeo)", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "webm", "mp3", "opus", "wav", "flac", "aac", "ogg", "wma", "m4a"] },
            { name: "Apresentações e Documentos", extensions: ["pptx", "ppt", "ppsx", "pps", "pdf", "key", "odp", "doc", "docx", "txt"] },
            { name: "Músicas LouvorJA (.slja)", extensions: ["slja", "sja", "lja"] },
            { name: "Imagens", extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"] },
          ],
        });
        if (filePath) {
          const pathStr = filePath as string;
          this.addForm.filePath = pathStr;
          if (!this.addForm.name) {
            const info = getLiturgyFileInfo(pathStr);
            this.addForm.name = info.fileName;
          }
        }
      }
    },
    async selectFolder() {
      if (window.electronAPI?.openFileDialog) {
        const folderPath = await window.electronAPI.openFileDialog({
          title: this.t("fields.select_folder") || "Selecionar Pasta",
          properties: ["openDirectory"],
        });
        if (folderPath) {
          const pathStr = folderPath as string;
          this.addForm.filePath = pathStr;
          if (!this.addForm.name) {
            const info = getLiturgyFileInfo(pathStr);
            this.addForm.name = info.fileName;
          }
        }
      }
    },
    async selectMediaFile() {
      return this.selectUnifiedFile();
    },
    async selectExternalFile() {
      return this.selectUnifiedFile();
    },
    async loadData() {
      // Load music list
      try {
        const musicData = await this.$database.get(`${this.$i18n.locale}_musics`);
        if (musicData && Array.isArray(musicData)) {
          this.musicList = musicData.map(m => {
            const hymnalAlbum = m.albums ? m.albums.find((a: any) => a.type === "hymnal") : null;
            const hymnalTrack = hymnalAlbum && hymnalAlbum.pivot ? hymnalAlbum.pivot.track : null;
            return {
              id_music: m.id_music,
              hymnal_track: hymnalTrack,
              name: m.name,
              album_names: m.albums ? m.albums.map((a: any) => a.name).join(", ") : "",
              albums: m.albums,
              lyric: m.lyric || "",
              has_instrumental_music: m.has_instrumental_music,
              has_music: m.has_music,
            };
          });
        }
      } catch (e) {
        console.error("Failed to load music data:", e);
      }

      // Load bible books
      try {
        const books = await this.$database.get(`${this.$i18n.locale}_bible_book`);
        if (books && Array.isArray(books)) {
          this.bibleBooks = books;
        }
      } catch (e) {
        console.error("Failed to load bible books:", e);
      }

      this.dataLoaded = true;
    },
    async saveItem() {
      if (!this.isFormValid) return;

      if (this.addForm.type === "verse" && this.addForm.verseNumbers) {
        try {
          const savedVersion = this.$userdata.get("modules.bible.selected_version");
          let versionId = savedVersion;
          if (!versionId) {
            if (this.bibleVersions.length === 0) {
              const versions = await this.$database.get(`${this.$i18n.locale}_bible_version`);
              if (versions) this.bibleVersions = versions;
            }
            const ara = this.bibleVersions.find(v => v.abbreviation === "ARA" || v.name === "ARA");
            versionId = ara ? ara.id_bible_version : (this.bibleVersions[0]?.id_bible_version || 1);
          }

          const bible_file = `bible_${versionId}_${this.addForm.verseBookId}_${this.addForm.verseChapter}`;
          const versesData = await this.$database.get(bible_file);
          const maxVerse = versesData ? Object.keys(versesData).length : 0;
          
          if (maxVerse > 0) {
            const parts = this.addForm.verseNumbers.split(/[\s,-]+/);
            for (const p of parts) {
              if (!p) continue;
              const num = parseInt(p, 10);
              if (!isNaN(num) && (num < 1 || num > maxVerse)) {
                this.$alert.error({ text: this.t("messages.invalid_verse").replace("{max}", maxVerse.toString()).replace("{num}", num.toString()), translate: false });
                return; // halt save!
              }
            }
          }
        } catch (e) {
          console.error("Failed to validate verses", e);
        }
      }

      const item: any = {
        id: this.editData?.id || Date.now() + Math.random(),
        type: this.addForm.type,
        name: this.addForm.name.trim(),
        subtitle: this.addForm.subtitle?.trim() || "",
        color: this.addForm.color,
        done: this.editData?.done || false,
        doneDate: this.editData?.doneDate || null,
      };

      if (this.addForm.type === "music") {
        item.musicId = this.addForm.musicId;
        item.musicMode = this.addForm.musicMode;
        const music = this.musicList.find(m => m.id_music === this.addForm.musicId);
        if (music) {
          const originalName = music.hymnal_track ? `${music.hymnal_track} - ${music.name}` : music.name;
          if (item.name !== originalName && item.name !== music.name) {
            item.subtitle = `${originalName}${music.album_names ? ` - ${music.album_names}` : ""}`;
          } else {
            item.subtitle = music.album_names || "";
          }
        }
      }

      if (this.addForm.type === "collection_item") {
        item.collectionType = this.addForm.collectionType;
        if (this.addForm.collectionType === "custom") {
          item.collectionId = this.addForm.collectionId;
          item.collectionName = this.selectedCustomCollection?.name || "";
          item.collectionSongId = this.addForm.collectionSongId;
          item.collectionSongType = this.addForm.collectionSongType;
          item.musicMode = this.addForm.musicMode;
          if (this.addForm.collectionSongType === "internal") {
            const rawId = typeof this.addForm.collectionSongId === "object" ? (this.addForm.collectionSongId as any).id : this.addForm.collectionSongId;
            item.musicId = rawId;
          } else {
            item.filePath = this.addForm.collectionSongFilePath;
            item.filePathAudio = this.addForm.collectionSongFilePathAudio;
            item.filePathInstrumental = this.addForm.collectionSongFilePathInstrumental;
          }
        } else {
          item.onlineVideoId = this.addForm.onlineVideoId;
          item.onlineVideoImage = this.addForm.onlineVideoImage;
          item.onlineChannelName = this.addForm.onlineChannelName;
          item.filePath = `youtube:${this.addForm.onlineVideoId}`;
        }
      }

      if (this.addForm.type === "verse") {
        item.verseBookId = this.addForm.verseBookId;
        item.verseChapter = this.addForm.verseChapter;
        item.verseNumbers = this.addForm.verseNumbers;
        const book = this.bibleBooks.find(b => b.id_bible_book === this.addForm.verseBookId);
        if (book) {
          item.subtitle = `${book.name} ${this.addForm.verseChapter}${this.addForm.verseNumbers ? `:${  this.addForm.verseNumbers}` : ""}`;
        }
      }

      if (this.addForm.type === "scheduled_item") {
        item.categoryId = this.addForm.categoryId;
        const category = this.categories.find(c => c.id === this.addForm.categoryId);
        if (category) {
          item.subtitle = `Categoria: ${category.name}`;
          if (!item.name) item.name = "Item Agendado";
        }
      }

      if (this.addForm.type === "media" || this.addForm.type === "file") {
        item.filePath = this.addForm.filePath;
        if (item.filePath) {
          const parts = item.filePath.split(/[\\/]/);
          item.subtitle = parts[parts.length - 1];
        }
      }

      if (this.addForm.type === "link") {
        item.url = this.addForm.url.trim();
        if (item.url) {
          item.subtitle = item.url;
        }
      }

      this.$emit("save", item);
    },
  },
});
</script>

<style lang="scss" scoped>
.add-item-card-modal {
  border-radius: 20px !important;
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45) !important;
  display: flex !important;
  flex-direction: column !important;
  max-height: calc(100vh - 100px) !important;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  overflow: hidden !important;
  transition: max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &.step-selection {
    max-width: 660px;
  }

  &.step-form {
    max-width: 520px;
  }

  .add-item-step-wrapper {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    height: 100% !important;
    overflow: hidden !important;
  }
}

.step-form-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-on-surface), 0.2);
    border-radius: 4px;
  }
}

.modal-nav-icon-btn {
  color: var(--sidebar-text-secondary, #94a3b8) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  background: transparent !important;

  &:hover {
    color: var(--sidebar-text, #ffffff) !important;
    background: rgba(var(--v-theme-on-surface), 0.08) !important;
  }
}

.clear-search-btn {
  color: var(--sidebar-text-secondary, #94a3b8);
  border-radius: 6px;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(var(--v-theme-on-surface), 0.08);
  }
}

.filter-search-btn {
  color: var(--sidebar-text-secondary, #94a3b8);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(var(--v-theme-on-surface), 0.08);
  }

  &.filter-active {
    color: var(--v-theme-primary, #009fe3) !important;
  }
}

.music-search-autocomplete {
  cursor: text !important;

  :deep(.v-field),
  :deep(.v-field__field),
  :deep(.v-field__input),
  :deep(input) {
    cursor: text !important;
  }

  :deep(.clear-search-btn),
  :deep(.filter-search-btn),
  :deep(.v-btn) {
    cursor: pointer !important;
  }

  :deep(.v-autocomplete__menu-icon),
  :deep(.v-field__append-inner > .v-icon) {
    display: none !important;
  }
}

.search-filter-popover {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35) !important;
  padding: 6px !important;
  min-width: 190px;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .filter-header {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--sidebar-text-secondary, #94a3b8);
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
    background: transparent;
    border: none;
    color: var(--sidebar-text, #ffffff);
    text-align: left;
    outline: none;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.06);
    }

    .filter-label {
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.2;
    }

    .filter-radio-icon {
      color: var(--sidebar-text-secondary, #94a3b8);
      &.active-check {
        color: #009fe3;
      }
    }
  }
}

.add-item-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--ds-accent-gradient, linear-gradient(135deg, #009FE3 0%, #0077b6 100%));
  box-shadow: 0 4px 12px rgba(0, 159, 227, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.add-item-types-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.type-selection-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--ds-surface, #232733);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--v-theme-primary), 0.4);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
    background: var(--card-bg, #272c3d);

    .type-chevron {
      color: var(--sidebar-text, #ffffff);
      transform: translateX(3px);
    }
  }

  .type-icon-box {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  &:hover .type-icon-box {
    transform: scale(1.05);
  }

  .type-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--sidebar-text, #ffffff);
    line-height: 1.25;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .type-description {
    font-size: 0.8rem;
    color: var(--sidebar-text-secondary, #94a3b8);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .type-chevron {
    color: var(--sidebar-text-secondary, #64748b);
    transition: transform 0.25s ease, color 0.2s ease;
    flex-shrink: 0;
    margin-left: 8px;
  }
}

// Estilos de Formulário (Passo 2)
.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sidebar-text-secondary, #94a3b8);
  letter-spacing: 0.01em;
}

.form-section-card {
  background: var(--ds-surface, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}


.color-palette-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.color-circle-btn {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.15);
  }

  &.active {
    transform: scale(1.15);
    box-shadow: 0 0 0 2px var(--card-bg, #202431), 0 0 0 4px currentColor, 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  &.color-none-btn {
    background: rgba(128, 128, 128, 0.12);
    border: 1.5px dashed rgba(128, 128, 128, 0.4);
    color: var(--sidebar-text-secondary, #94a3b8);

    &.active {
      border: 2px solid var(--sidebar-text, #ffffff);
      color: var(--sidebar-text, #ffffff);
      box-shadow: 0 0 0 2px var(--card-bg, #202431), 0 0 0 4px rgba(128, 128, 128, 0.5);
    }
  }
}

:deep(.standard-text-input) {
  .v-field {
    background: var(--card-bg) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(128, 128, 128, 0.18) !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;

    &--focused,
    &--focused:hover {
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

  .v-field--focused .v-field__prepend-inner .v-icon,
  .v-field--focused:hover .v-field__prepend-inner .v-icon {
    color: var(--accent-blue, rgb(var(--v-theme-primary))) !important;
    opacity: 1 !important;
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

  &.v-textarea {
    .v-field__prepend-inner {
      align-items: flex-start !important;
      align-self: flex-start !important;
      padding-top: 10px !important;
    }
  }
}

.file-dropzone-box {
  border: 1.5px dashed var(--border-color, rgba(255, 255, 255, 0.15));
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 14px;
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.05);
    border-color: rgba(var(--v-theme-primary), 0.5);
    transform: translateY(-1px);

    .dropzone-icon-circle {
      transform: scale(1.08);
      background: rgba(var(--v-theme-primary), 0.18);
    }
  }

  .dropzone-icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(var(--v-theme-primary), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .dropzone-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--sidebar-text, #ffffff);
    margin-bottom: 2px;
  }

  .dropzone-subtitle {
    font-size: 0.75rem;
    color: var(--sidebar-text-secondary, #94a3b8);
    text-align: center;
  }
}

.selected-file-card {
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  background: rgba(var(--v-theme-on-surface), 0.04);
  transition: all 0.2s ease;

  .file-icon-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-name-text {
    font-size: 0.88rem;
    color: var(--sidebar-text, #ffffff);
    max-width: 240px;
  }

  .file-path-text {
    color: var(--sidebar-text-secondary, #94a3b8);
    max-width: 280px;
    font-size: 0.72rem !important;
  }
}

.playback-notice-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 0.75rem;
}


// Suporte para tema claro
:root[data-theme="light"],
.v-theme--light {
  .add-item-card-modal {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12) !important;
  }

  .type-selection-card {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.08);

    &:hover {
      background: #ffffff;
      border-color: var(--ds-accent, #008FD0);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    }

    .type-title {
      color: #1e293b;
    }

    .type-description {
      color: #64748b;
    }
  }

  .form-section-card {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  }

  .file-dropzone-box {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.12);

    &:hover {
      background: rgba(0, 159, 227, 0.05);
      border-color: #009fe3;
    }
  }

  .selected-file-card {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.08);
  }

  .color-circle-btn.active {
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px currentColor, 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .color-circle-btn.color-none-btn.active {
    border-color: #1e293b;
    color: #1e293b;
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px rgba(0, 0, 0, 0.2);
  }

  .standard-text-input :deep(.v-field:not(.v-field--focused)) {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
  }

  .search-filter-popover {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;

    .filter-item {
      color: #1e293b;

      &:hover {
        background: #f1f5f9;
      }
    }
  }
}
</style>
