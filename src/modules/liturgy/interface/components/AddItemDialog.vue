<template>
  <v-dialog
    :model-value="modelValue"
    :theme="$theme.primary()"
    content-class="liturgy-dialog-wrapper"
    @update:model-value="updateModelValue"
  >
    <v-card 
      class="rounded-xl"
      style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; max-height: 90vh; max-width: 680px; width: 100%; margin: 0 auto;"
    >
      <v-window v-model="addStep">
        <!-- Step 1: Type Selection -->
        <v-window-item :value="1">
          <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text); line-height: 1.2;">
                  {{ t('add_item') }}
                </h2>
                <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
                  {{ t('add_item_dialog.step1_subtitle') }}
                </div>
              </div>
              <v-btn
                icon
                size="small"
                variant="flat"
                color="rgba(128,128,128,0.1)"
                class="rounded-lg"
                @click="closeMenu"
              >
                <v-icon size="20">
                  mdi-close
                </v-icon>
              </v-btn>
            </div>
          </div>
          
          <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 0; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 12px;">
              <v-hover v-for="type in itemTypes" :key="type.value" v-slot="{ isHovering, props }">
                <div
                  v-bind="props"
                  class="pa-4 d-flex align-center h-100"
                  :style="{ 
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isHovering ? 'rgba(var(--v-theme-primary), 0.3)' : 'rgba(128,128,128,0.1)',
                    background: isHovering ? 'rgba(var(--v-theme-primary), 0.02)' : 'var(--card-bg, #ffffff)',
                    boxShadow: isHovering ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovering ? 'translateY(-2px)' : 'none',
                    minWidth: 0,
                  }"
                  @click="openAddForm(type.value)"
                >
                  <div
                    class="mr-3 d-flex align-center justify-center flex-shrink-0"
                    :style="{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: isHovering ? 'rgba(var(--v-theme-primary), 0.1)' : 'rgba(var(--v-theme-on-surface), 0.04)',
                      transition: 'all 0.3s ease',
                    }"
                  >
                    <v-icon :color="isHovering ? 'primary' : 'rgba(var(--v-theme-on-surface), 0.6)'" size="20">
                      {{ type.icon }}
                    </v-icon>
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <div
                      class="font-weight-medium mb-1"
                      :title="type.label"
                      style="font-size: 0.92rem; color: var(--sidebar-text); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      {{ type.label }}
                    </div>
                    <div
                      class="text-caption"
                      style="color: var(--sidebar-text-secondary); line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
                    >
                      {{ type.description }}
                    </div>
                  </div>
                </div>
              </v-hover>
            </div>
          </div>
        </v-window-item>

        <!-- Step 2: Form -->
        <v-window-item :value="2">
          <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
            <div class="d-flex align-center">
              <v-btn
                v-if="!editData && !isFillingPlaceholder"
                icon
                size="small"
                variant="flat"
                color="rgba(128,128,128,0.1)"
                class="rounded-lg mr-4"
                @click="addStep = 1"
              >
                <v-icon size="20">
                  mdi-arrow-left
                </v-icon>
              </v-btn>
              <div class="d-flex align-center">
                <v-avatar
                  color="rgba(var(--v-theme-primary), 0.1)"
                  size="40"
                  rounded="lg"
                  class="mr-3"
                >
                  <v-icon :color="getTypeColor(addForm.type)" size="20">
                    {{ getTypeIcon(addForm.type) }}
                  </v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text); line-height: 1.2;">
                    {{ getTypeLabel(addForm.type) }}
                  </h2>
                  <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
                    {{ t('add_item_dialog.step2_subtitle') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 0; overflow-y: auto;">
            <!-- Name -->
            <div class="mb-4">
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('fields.name') }}
              </div>
              <v-text-field
                v-model="addForm.name"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                hide-details
                class="modern-input-compact"
                :placeholder="getNamePlaceholder(addForm.type)"
                autofocus
              />
            </div>

            <!-- Color Selector -->
            <div class="mb-4">
              <div class="text-body-2 font-weight-medium mb-2" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('add_item_dialog.highlight_color') }}
              </div>
              <div class="d-flex align-center" style="flex-wrap: wrap; gap: 6px;">
                <v-btn
                  icon
                  size="x-small"
                  color="transparent"
                  variant="flat"
                  :style="!addForm.color ? 'border: 2px solid rgba(128,128,128,0.5);' : 'border: 1px dashed rgba(128,128,128,0.3);'"
                  @click="addForm.color = ''"
                >
                  <v-icon size="16" :color="!addForm.color ? 'var(--sidebar-text)' : 'grey'">
                    mdi-close
                  </v-icon>
                </v-btn>
                <v-btn
                  v-for="color in ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#FF5722']"
                  :key="color"
                  icon
                  size="x-small"
                  :color="color"
                  variant="flat"
                  :style="addForm.color === color ? 'border: 2px solid white; transform: scale(1.15); transition: all 0.2s;' : 'opacity: 0.8; transition: all 0.2s;'"
                  @click="addForm.color = color"
                >
                  <v-icon v-if="addForm.color === color" size="16" color="white">
                    mdi-check
                  </v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Description (annotation only) -->
            <div v-if="addForm.type === 'annotation'" class="mb-4">
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('fields.description') }}
              </div>
              <v-textarea
                v-model="addForm.subtitle"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                hide-details
                rows="2"
                auto-grow
                class="modern-input-compact"
              />
            </div>

            <!-- Music selector -->
            <div v-if="addForm.type === 'music'" class="mb-4">
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('fields.search_music') }}
              </div>
              <v-autocomplete
                v-model="addForm.musicId"
                v-model:search="musicSearchQuery"
                :items="filteredMusicList"
                :custom-filter="() => true"
                item-title="name"
                item-value="id_music"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                class="modern-input-compact"
                :placeholder="t('fields.search_music')"
                hide-details
                clearable
                :menu-props="{ transition: 'fade-transition' }"
                :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                @update:model-value="onMusicSelect"
              >
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
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title class="text-caption text-center pt-2 pb-2" style="color: var(--sidebar-text-secondary);">
                      {{ t('messages.music_not_found') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <!-- Seletor Modo da Música (Cantado / Playback) -->
              <div class="mt-4">
                <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                  {{ t('fields.music_mode') }}
                </div>
                <PillSwitch
                  v-model="addForm.musicMode"
                  block
                  :items="musicModeItems"
                />
                <div
                  v-if="selectedMusic && !selectedMusicHasPlayback"
                  class="text-caption mt-1 ml-1 d-flex align-center"
                  style="color: var(--sidebar-text-secondary); opacity: 0.7;"
                >
                  <v-icon size="13" class="mr-1" icon="mdi-information-outline" />
                  {{ t('messages.playback_unavailable') }}
                </div>
              </div>
            </div>

            <!-- Coletâneas Selector (Personalizadas & Online) -->
            <div v-if="addForm.type === 'collection_item'" class="mb-4">
              <!-- PillSwitch: Personalizadas / Online -->
              <div class="mb-4">
                <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                  {{ t('fields.collection_type') }}
                </div>
                <PillSwitch
                  v-model="addForm.collectionType"
                  block
                  :items="collectionTypeItems"
                  @update:model-value="onCollectionTypeChanged"
                />
              </div>

              <!-- ABA 1: COLETÂNEAS PERSONALIZADAS -->
              <div v-if="addForm.collectionType === 'custom'">
                <div
                  v-if="customCollections.length === 0"
                  class="text-center pa-6 rounded-xl border"
                  style="background: rgba(var(--v-theme-on-surface), 0.02); border-color: rgba(128,128,128,0.15) !important;"
                >
                  <v-icon
                    size="40"
                    color="teal"
                    class="mb-2"
                    style="opacity: 0.6;"
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
                  <div class="mb-3">
                    <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                      {{ t('fields.select_collection') }}
                    </div>
                    <v-select
                      v-model="addForm.collectionId"
                      :items="customCollections"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      color="teal"
                      rounded="lg"
                      density="compact"
                      hide-details
                      class="modern-input-compact"
                      :placeholder="t('fields.select_collection')"
                      @update:model-value="onSelectCustomCollection"
                    >
                      <template #item="{ item, props }">
                        <v-list-item
                          v-bind="props"
                          :title="undefined"
                          class="mx-2 rounded-lg mb-1"
                          color="teal"
                        >
                          <template #title>
                            <div class="d-flex align-center justify-space-between w-100">
                              <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
                              <v-chip
                                size="x-small"
                                color="teal"
                                variant="tonal"
                                class="ml-2"
                              >
                                {{ (item.raw.songs || []).length }} músicas
                              </v-chip>
                            </div>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </div>

                  <!-- Selecionar Música da Coletânea -->
                  <div v-if="addForm.collectionId" class="mb-3">
                    <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                      {{ t('fields.select_song') }}
                    </div>
                    <v-select
                      v-model="addForm.collectionSongId"
                      :items="customCollectionSongs"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      color="teal"
                      rounded="lg"
                      density="compact"
                      hide-details
                      class="modern-input-compact"
                      :placeholder="t('fields.select_song')"
                      return-object
                      @update:model-value="onSelectCustomSong"
                    >
                      <template #selection="{ item }">
                        <div class="d-flex align-center text-truncate">
                          <span class="text-body-2 font-weight-medium text-truncate">{{ item.raw.name }}</span>
                        </div>
                      </template>
                      <template #item="{ item, props }">
                        <v-list-item
                          v-bind="props"
                          :title="undefined"
                          class="mx-2 rounded-lg mb-1"
                          color="teal"
                        >
                          <template #title>
                            <div class="d-flex align-center justify-space-between w-100">
                              <div class="d-flex flex-column text-truncate" style="min-width: 0;">
                                <span class="text-body-2 font-weight-medium text-truncate">{{ item.raw.name }}</span>
                                <span class="text-caption text-truncate opacity-60">{{ item.raw.album }}</span>
                              </div>
                              <v-chip
                                size="x-small"
                                :color="item.raw.type === 'internal' ? 'primary' : 'deep-orange'"
                                variant="tonal"
                                class="ml-2 flex-shrink-0"
                              >
                                {{ item.raw.type === 'internal' ? 'Interna' : 'Arquivo' }}
                              </v-chip>
                            </div>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </div>

                  <!-- Seletor Modo da Música se tiver playback -->
                  <div v-if="selectedCustomCollectionSong" class="mt-4">
                    <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                      {{ t('fields.music_mode') }}
                    </div>
                    <PillSwitch
                      v-model="addForm.musicMode"
                      block
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
                <!-- Se um vídeo já estiver selecionado, exibe preview card com opção de trocar -->
                <div
                  v-if="addForm.onlineVideoId"
                  class="rounded-xl pa-3 d-flex align-center justify-space-between mb-3"
                  style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(var(--v-theme-on-surface), 0.06);"
                >
                  <div class="d-flex align-center" style="overflow: hidden;">
                    <div
                      class="mr-3 flex-shrink-0 rounded-lg overflow-hidden position-relative"
                      style="width: 72px; height: 48px; background: #000;"
                    >
                      <img
                        v-if="addForm.onlineVideoImage"
                        :src="addForm.onlineVideoImage"
                        style="width: 100%; height: 100%; object-fit: cover;"
                      />
                      <v-icon
                        v-else
                        size="24"
                        color="red"
                        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
                      >
                        mdi-youtube
                      </v-icon>
                    </div>
                    <div class="d-flex flex-column" style="overflow: hidden;">
                      <div class="d-flex align-center">
                        <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 250px;">
                          {{ addForm.name }}
                        </span>
                        <v-chip
                          size="x-small"
                          color="red"
                          variant="flat"
                          class="ml-2 font-weight-bold px-2 flex-shrink-0"
                          style="height: 18px; font-size: 0.65rem;"
                        >
                          YouTube
                        </v-chip>
                      </div>
                      <span class="text-caption text-truncate mt-1" style="color: var(--sidebar-text-secondary); max-width: 320px;">
                        {{ addForm.onlineChannelName || 'Coletânea Online' }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex align-center flex-shrink-0 ml-2">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="addForm.onlineVideoId = ''; addForm.name = ''; addForm.subtitle = '';"
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">
                        {{ t('actions.delete') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>

                <!-- Lista de busca / seleção de vídeos online -->
                <div v-else>
                  <div class="mb-3">
                    <v-text-field
                      v-model="onlineSearchQuery"
                      variant="outlined"
                      color="red"
                      rounded="lg"
                      density="compact"
                      hide-details
                      prepend-inner-icon="mdi-magnify"
                      class="modern-input-compact"
                      :placeholder="t('fields.search_online_videos')"
                      clearable
                    />
                  </div>

                  <div v-if="onlineLoading" class="d-flex align-center justify-center py-6">
                    <v-progress-circular indeterminate color="red" size="32" />
                    <span class="ml-3 text-caption" style="color: var(--sidebar-text-secondary);">Carregando vídeos online...</span>
                  </div>

                  <div
                    v-else
                    class="rounded-xl border pa-2 overflow-y-auto"
                    style="max-height: 240px; background: rgba(var(--v-theme-on-surface), 0.02); border-color: rgba(128,128,128,0.15) !important;"
                  >
                    <template v-if="filteredOnlineVideos.length > 0">
                      <div
                        v-for="video in filteredOnlineVideos"
                        :key="video.id"
                        class="d-flex align-center pa-2 rounded-lg cursor-pointer mb-1 transition-all"
                        style="background: transparent;"
                        onmouseover="this.style.background='rgba(var(--v-theme-on-surface), 0.06)'"
                        onmouseout="this.style.background='transparent'"
                        @click="onSelectOnlineVideo(video)"
                      >
                        <div
                          class="mr-3 flex-shrink-0 rounded-lg overflow-hidden position-relative"
                          style="width: 64px; height: 38px; background: #000;"
                        >
                          <img :src="video.image" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                          <v-icon size="16" color="white" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.9;">
                            mdi-play-circle
                          </v-icon>
                        </div>
                        <div class="d-flex flex-column text-truncate" style="min-width: 0;">
                          <span class="text-body-2 font-weight-medium text-truncate" style="color: var(--sidebar-text);">
                            {{ video.name }}
                          </span>
                          <span class="text-caption text-truncate opacity-60">
                            {{ video.channelName }}
                          </span>
                        </div>
                      </div>
                    </template>
                    <div v-else class="text-center py-6 text-caption" style="color: var(--sidebar-text-secondary);">
                      Nenhum vídeo encontrado.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Verse selector -->
            <div v-if="addForm.type === 'verse'">
              <div class="mb-3">
                <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                  {{ t('fields.book') }}
                </div>
                <v-autocomplete
                  v-model="addForm.verseBookId"
                  :items="bibleBooks"
                  item-title="name"
                  item-value="id_bible_book"
                  variant="outlined"
                  color="primary"
                  rounded="lg"
                  density="compact"
                  class="modern-input-compact"
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
              <div class="d-flex mb-2" style="gap: 12px;">
                <div style="flex: 0 0 120px;">
                  <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                    {{ t('fields.chapter') }}
                  </div>
                  <v-autocomplete
                    v-model="addForm.verseChapter"
                    :items="verseChapterList"
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    density="compact"
                    class="modern-input-compact"
                    style="max-width: 120px;"
                    :placeholder="t('fields.chapter')"
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
                <div style="flex: 1;">
                  <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                    {{ t('fields.verses') }}
                  </div>
                  <v-text-field
                    v-model="addForm.verseNumbers"
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    density="compact"
                    hide-details
                    class="modern-input-compact"
                    :placeholder="t('fields.verses_placeholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Unified Media & File selector -->
            <div v-if="addForm.type === 'file' || addForm.type === 'media'" class="mb-4">
              <div
                v-if="addForm.filePath"
                class="rounded-xl pa-4 d-flex align-center justify-space-between"
                style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(var(--v-theme-on-surface), 0.06);"
              >
                <div class="d-flex align-center" style="overflow: hidden;">
                  <v-avatar
                    size="44"
                    rounded="lg"
                    class="mr-3 flex-shrink-0"
                    :color="selectedFileInfo.color"
                    variant="tonal"
                  >
                    <v-icon :icon="selectedFileInfo.icon" size="26" />
                  </v-avatar>
                  <div class="d-flex flex-column" style="overflow: hidden;">
                    <div class="d-flex align-center">
                      <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 250px;">
                        {{ selectedFileInfo.fileName }}
                      </span>
                      <v-chip
                        size="x-small"
                        :color="selectedFileInfo.color"
                        variant="flat"
                        class="ml-2 font-weight-bold px-2 flex-shrink-0"
                        style="height: 18px; font-size: 0.65rem;"
                      >
                        {{ selectedFileInfo.label }}
                      </v-chip>
                    </div>
                    <span class="text-caption text-truncate mt-1" style="color: var(--sidebar-text-secondary); max-width: 320px;" :title="addForm.filePath">
                      {{ addForm.filePath }}
                    </span>
                  </div>
                </div>
                <div class="d-flex align-center flex-shrink-0 ml-2">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="primary"
                    class="mr-1"
                    @click="selectUnifiedFile"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">
                      {{ t('actions.change') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="addForm.filePath = ''"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">
                      {{ t('actions.delete') }}
                    </v-tooltip>
                  </v-btn>
                </div>
              </div>

              <div
                v-else
                class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer pa-6"
                style="border: 2px dashed var(--border-color, rgba(128,128,128,0.25)); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                onmouseover="this.style.background='rgba(128,128,128,0.05)'; this.style.borderColor='rgba(var(--v-theme-primary), 0.5)'"
                onmouseout="this.style.background='rgba(128,128,128,0.02)'; this.style.borderColor='var(--border-color, rgba(128,128,128,0.25))'"
                @click="selectUnifiedFile"
              >
                <v-avatar
                  size="52"
                  color="rgba(var(--v-theme-primary), 0.1)"
                  class="mb-3"
                >
                  <v-icon
                    size="28"
                    color="primary"
                  >
                    mdi-folder-file-outline
                  </v-icon>
                </v-avatar>
                <span class="text-body-1 font-weight-bold mb-1" style="color: var(--sidebar-text);">
                  {{ t('fields.select_file') || 'Selecionar Arquivo ou Pasta' }}
                </span>
                <span class="text-caption text-center" style="color: var(--sidebar-text-secondary); max-width: 320px;">
                  {{ t('type_descriptions.file') }}
                </span>
              </div>
            </div>

            <!-- Link URL -->
            <div v-if="addForm.type === 'link'" class="mb-4">
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                {{ t('fields.url') }}
              </div>
              <v-text-field
                v-model="addForm.url"
                variant="outlined"
                color="primary"
                rounded="lg"
                density="compact"
                hide-details
                class="modern-input-compact"
                :placeholder="t('fields.url_placeholder')"
              />
            </div>
            <div v-if="addForm.type === 'scheduled_item'" class="pb-2 pt-0">
              <div class="mb-4">
                <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                  {{ t('add_item_dialog.scheduled_category') }}
                </div>
                <v-autocomplete
                  v-model="addForm.categoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  color="primary"
                  rounded="lg"
                  density="compact"
                  hide-details
                  class="modern-input-compact"
                  placeholder="Selecione a categoria"
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
                      <template #prepend>
                        <v-icon :color="item.value === addForm.categoryId ? 'primary' : 'rgba(128,128,128,0.5)'" class="mr-3" size="20">
                          {{ item.value === addForm.categoryId ? 'mdi-folder-open' : 'mdi-folder' }}
                        </v-icon>
                      </template>
                      <template #title>
                        <div class="d-flex align-center">
                          <span class="text-body-2 font-weight-medium" :class="item.value === addForm.categoryId ? '' : 'opacity-70'">
                            {{ item.title }}
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
          </div>
          <div class="pa-4 d-flex justify-space-between align-center flex-shrink-0" style="background: rgba(0,0,0,0.02); border-top: 1px solid rgba(0,0,0,0.05);">
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
        </v-window-item>
      </v-window>
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
    musicList: [] as any[],
    bibleBooks: [] as any[],
    bibleVersions: [] as any[],
    customCollections: [] as any[],
    onlineVideos: [] as any[],
    onlineSearchQuery: "",
    onlineLoading: false,
    dataLoaded: false,
  }),
  computed: {
    itemTypes(): any[] {
      return [
        { value: "music", icon: "mdi-music-note", color: "success", label: this.t("types.music"), description: this.t("type_descriptions.music") },
        { value: "collection_item", icon: "mdi-music-box-multiple", color: "teal", label: this.t("types.collection_item"), description: this.t("type_descriptions.collection_item") },
        { value: "verse", icon: "mdi-book-open-variant", color: "purple", label: this.t("types.verse"), description: this.t("type_descriptions.verse") },
        { value: "file", icon: "mdi-folder-file-outline", color: "blue-grey", label: this.t("types.file"), description: this.t("type_descriptions.file") },
        { value: "link", icon: "mdi-link", color: "indigo", label: this.t("types.link"), description: this.t("type_descriptions.link") },
        { value: "scheduled_item", icon: "mdi-calendar-check", color: "deep-purple", label: this.t("types.scheduled_item"), description: this.t("type_descriptions.scheduled_item") },
        { value: "annotation", icon: "mdi-text", color: "info", label: this.t("types.annotation"), description: this.t("type_descriptions.annotation") },
        { value: "category", icon: "mdi-tag", color: "warning", label: this.t("types.category"), description: this.t("type_descriptions.category") },
      ];
    },
    collectionTypeItems(): any[] {
      return [
        { value: "custom", label: this.t("fields.custom_collections"), icon: "mdi-folder-music" },
        { value: "online", label: this.t("fields.online_collections"), icon: "mdi-youtube" },
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
            id: song.id_music,
            name,
            type: "internal",
            album: m?.album_names || "",
            hasPlayback,
            raw: song,
          };
        }
        return {
          id: song.id || song.name,
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
      const q = (this.onlineSearchQuery || "").trim().toLowerCase();
      if (!q) {
        return this.onlineVideos.slice(0, 30);
      }
      return this.onlineVideos.filter((v: any) => {
        return (v.name && v.name.toLowerCase().includes(q)) || (v.channelName && v.channelName.toLowerCase().includes(q));
      }).slice(0, 50);
    },
    selectedFileInfo(): LiturgyFileInfo {
      return getLiturgyFileInfo(this.addForm.filePath);
    },
    isFormValid(): boolean {
      if (this.isTemplateMode && !this.isFillingPlaceholder) {
        return true; // Se for modo template, tudo é opcional (o nome será preenchido depois se vazio)
      }

      if (!this.addForm.name.trim()) return false;

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
        const matchesName = this.$string.matchesSearch(m.name, this.musicSearchQuery);
        const matchesAlbum = m.albums ? this.$string.matchesSearch(m.albums.map((a: any) => a.name).join(" "), this.musicSearchQuery) : false;
        
        if (isNum) {
          const isHymnalTrack = m.albums?.some((a: any) => a.type === "hymnal" && Number(a.pivot?.track) === numQuery);
          return matchesName || matchesAlbum || isHymnalTrack;
        } 
        return matchesName || matchesAlbum;
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
            const cleanName = this.$string.clean(item.name);
            if (cleanName.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 4);
            else if (cleanName.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 3);
            
            if (item.albums) {
              const cleanAlbums = this.$string.clean(item.albums.map((al: any) => al.name).join(" "));
              if (cleanAlbums.startsWith(cleanQuery)) maxScore = Math.max(maxScore, 2);
              else if (cleanAlbums.includes(` ${cleanQuery}`)) maxScore = Math.max(maxScore, 1);
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
    resetForm() {
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
        return this.addForm.collectionType === "online" ? "mdi-youtube" : "mdi-folder-music";
      }
      const map: Record<string, string> = {
        annotation: "mdi-text",
        category: "mdi-tag",
        music: "mdi-music-note",
        collection_item: "mdi-music-box-multiple",
        verse: "mdi-book-open-variant",
        media: "mdi-folder-file-outline",
        link: "mdi-link",
        file: "mdi-folder-file-outline",
        scheduled_item: "mdi-calendar-clock",
      };
      return map[type] || "mdi-help";
    },
    getTypeColor(type: string): string {
      if ((type === "file" || type === "media") && this.addForm.filePath) {
        return this.selectedFileInfo.color;
      }
      if (type === "collection_item") {
        return this.addForm.collectionType === "online" ? "red" : "teal";
      }
      const map: Record<string, string> = {
        annotation: "info",
        category: "warning",
        music: "success",
        collection_item: "teal",
        verse: "purple",
        media: "orange",
        link: "cyan",
        file: "blue-grey",
        scheduled_item: "deep-purple",
      };
      return map[type] || "grey";
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
      if (type === "collection_item") {
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
    onSelectCustomSong(songItem: any) {
      if (!songItem) return;
      const song = typeof songItem === "object" && songItem.raw ? songItem : this.customCollectionSongs.find((s: any) => s.id === songItem);
      if (!song) return;

      this.addForm.collectionSongId = song.id;
      this.addForm.collectionSongType = song.type;
      this.addForm.name = song.name;

      const colName = this.selectedCustomCollection?.name || "";
      if (song.type === "internal") {
        this.addForm.musicId = song.id;
        this.addForm.subtitle = `Coletânea: ${colName}${song.album ? ` - ${song.album}` : ""}`;
        this.addForm.musicMode = "audio";
      } else {
        const raw = song.raw;
        this.addForm.collectionSongFilePath = raw.filePathAudio || raw.filePathInstrumental || "";
        this.addForm.collectionSongFilePathAudio = raw.filePathAudio || "";
        this.addForm.collectionSongFilePathInstrumental = raw.filePathInstrumental || "";
        this.addForm.filePath = raw.filePathAudio || raw.filePathInstrumental || "";
        this.addForm.subtitle = `Coletânea: ${colName}`;
        this.addForm.musicMode = "audio";
      }
    },
    onSelectOnlineVideo(video: any) {
      if (!video) return;
      this.addForm.onlineVideoId = video.id;
      this.addForm.onlineVideoImage = video.image || "";
      this.addForm.onlineChannelName = video.channelName || "";
      this.addForm.onlinePlaylistName = video.playlistName || "";
      this.addForm.filePath = `youtube:${video.id}`;
      this.addForm.name = video.name;
      this.addForm.subtitle = video.channelName ? `Canal: ${video.channelName}` : "Coletânea Online";
    },
    onMusicSelect(musicId: number | string | null) {
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
          title: this.t("fields.select_file") || "Selecionar Arquivo ou Pasta",
          properties: ["openFile", "openDirectory"],
          filters: [
            { name: "Todos os Arquivos e Mídias", extensions: ["*"] },
            { name: "Mídias (Áudio / Vídeo)", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "webm", "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"] },
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

      if (this.isTemplateMode && !this.isFillingPlaceholder && !this.addForm.name.trim()) {
        this.addForm.name = this.getTypeLabel(this.addForm.type);
      }

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
