<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page custom-collection-module d-flex flex-column">
      <ModuleHeader
        :title="detailCollection ? detailCollection.name : t('title')"
        icon="mdi-music-box-multiple"
        :image="detailCollection?.coverImage || undefined"
      >
        <div v-if="!detailCollection" class="search-bar ml-4 d-flex align-center" style="max-width: 500px; flex: 1; gap: 16px;">
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
                  class="pa-2"
                  rounded="lg"
                  min-width="200"
                  style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2));"
                >
                  <div class="text-caption font-weight-bold mb-2 mx-2 mt-1" style="color: var(--sidebar-text-secondary);">
                    {{ t('filter_search_by') }}
                  </div>
                  <v-list density="compact" bg-color="transparent" class="pa-0">
                    <v-checkbox
                      v-model="searchFilters"
                      value="name"
                      :label="t('filter_collection_name')"
                      hide-details
                      density="compact"
                      color="primary"
                      class="mb-1"
                    />
                    <v-checkbox
                      v-model="searchFilters"
                      value="songs"
                      :label="t('filter_song_name')"
                      hide-details
                      density="compact"
                      color="primary"
                    />
                  </v-list>
                </v-card>
              </v-menu>
            </template>
          </v-text-field>
          <v-btn
            color="primary"
            variant="flat"
            rounded="xl"
            class="text-none px-4"
            style="height: 44px; flex-shrink: 0;"
            @click="openCreateDialog"
          >
            <v-icon start>
              mdi-plus
            </v-icon>
            {{ t('new_collection') }}
          </v-btn>
        </div>
        <div v-else class="d-flex align-center" style="gap: 8px;">
          <v-btn
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
                    v-for="c in collections"
                    :key="c.id"
                    class="collection-card"
                    @click="openCollection(c)"
                  >
                    <div class="card-image">
                      <v-img
                        v-if="c.coverImage"
                        :src="c.coverImage"
                        cover
                        style="width: 100%; height: 100%; position: absolute; inset: 0;"
                      />
                      <v-icon v-else size="48">
                        mdi-music-box-multiple
                      </v-icon>
                      <v-menu location="bottom end">
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
                        <v-list density="compact" rounded="lg" class="py-1">
                          <v-list-item @click="openRenameDialog(c)">
                            <template #prepend>
                              <v-icon size="18">
                                mdi-pencil
                              </v-icon>
                            </template>
                            <v-list-item-title>{{ t('rename') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="confirmDelete(c)">
                            <template #prepend>
                              <v-icon size="18" color="error">
                                mdi-delete
                              </v-icon>
                            </template>
                            <v-list-item-title class="text-error">
                              {{ t('delete') }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">
                        {{ c.name }}
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
            <div class="pl-4 pb-2">
              <v-btn
                icon
                variant="tonal"
                size="small"
                color="primary"
                @click="detailCollectionId = null"
              >
                <v-icon>mdi-arrow-left</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('back') }}
                </v-tooltip>
              </v-btn>
            </div>

            <div v-if="detailCollection.songs.length === 0" class="flex-grow-1 d-flex flex-column align-center justify-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-music-note-off-outline
              </v-icon>
              <h3 class="mb-2" style="color: var(--sidebar-text);">
                {{ t('empty_songs_title') }}
              </h3>
              <p class="text-center" style="color: var(--sidebar-text-secondary); max-width: 360px;">
                {{ t('empty_songs_desc') }}
              </p>
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
                        :color="item.filePathAudio ? 'primary' : undefined"
                        variant="text"
                        density="compact"
                        class="mx-1"
                        icon
                        @click="playOrAddCantado(item)"
                      >
                        <v-icon>mdi-play-circle</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ item.filePathAudio ? 'Cantado' : t('add_cantado') }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        :color="item.filePathInstrumental ? 'primary' : undefined"
                        variant="text"
                        density="compact"
                        class="mx-1"
                        icon
                        @click="playOrAddInstrumental(item)"
                      >
                        <v-icon>mdi-play-circle-outline</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ item.filePathInstrumental ? 'Playback' : t('add_playback') }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        :color="item.filePathNoAudio ? 'primary' : undefined"
                        variant="text"
                        density="compact"
                        class="mx-1"
                        icon
                        @click="playOrAddNoAudio(item)"
                      >
                        <v-icon>mdi-monitor</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ item.filePathNoAudio ? 'Sem Áudio' : t('add_no_audio') }}
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-menu v-if="item.type === 'external'" location="bottom end">
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
                          <v-tooltip activator="parent" location="top">
                            {{ t('edit_song') }}
                          </v-tooltip>
                        </v-btn>
                      </template>
                      <v-list density="compact" rounded="lg" class="py-1">
                        <v-list-item @click="changeCantado(item)">
                          <template #prepend>
                            <v-icon size="18">
                              mdi-file-music-outline
                            </v-icon>
                          </template>
                          <v-list-item-title>{{ t('change_cantado') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="changePlayback(item)">
                          <template #prepend>
                            <v-icon size="18">
                              mdi-file-music-outline
                            </v-icon>
                          </template>
                          <v-list-item-title>{{ item.filePathInstrumental ? t('change_playback') : t('add_playback') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="item.filePathInstrumental" @click="removePlayback(item)">
                          <template #prepend>
                            <v-icon size="18">
                              mdi-music-note-off-outline
                            </v-icon>
                          </template>
                          <v-list-item-title>{{ t('remove_playback') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="changeNoAudio(item)">
                          <template #prepend>
                            <v-icon size="18">
                              mdi-monitor
                            </v-icon>
                          </template>
                          <v-list-item-title>{{ item.filePathNoAudio ? t('change_no_audio') : t('add_no_audio') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="item.filePathNoAudio" @click="removeNoAudio(item)">
                          <template #prepend>
                            <v-icon size="18">
                              mdi-music-note-off-outline
                            </v-icon>
                          </template>
                          <v-list-item-title>{{ t('remove_no_audio') }}</v-list-item-title>
                        </v-list-item>
                        <v-divider class="my-1" />
                        <v-list-item @click="removeSong(item.id)">
                          <template #prepend>
                            <v-icon size="18" color="error">
                              mdi-delete-outline
                            </v-icon>
                          </template>
                          <v-list-item-title class="text-error">
                            {{ t('remove_from_collection') }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                    <v-btn
                      v-else
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
        <v-card class="rounded-xl pa-2">
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
              <v-text-field
                v-model="nameInput"
                :label="t('new_collection_name')"
                :placeholder="t('new_collection_placeholder')"
                variant="outlined"
                density="comfortable"
                autofocus
                hide-details
                @keydown.enter="editingCollection ? saveName() : goToContentStep()"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" class="text-none" @click="closeCreateDialog">
                {{ t('cancel') }}
              </v-btn>
              <v-btn
                v-if="editingCollection"
                color="primary"
                variant="flat"
                class="text-none font-weight-bold"
                :disabled="!nameInput.trim()"
                @click="saveName"
              >
                {{ t('save') }}
              </v-btn>
              <v-btn
                v-else
                color="primary"
                variant="flat"
                class="text-none font-weight-bold"
                :disabled="!nameInput.trim()"
                @click="goToContentStep"
              >
                {{ t('continue') }}
              </v-btn>
            </v-card-actions>
          </template>

          <!-- Passo 2: escolher como popular a coletânea -->
          <template v-else>
            <v-card-title class="font-weight-bold">
              {{ t('add_content_title') }}
            </v-card-title>
            <v-card-text>
              <div v-if="!contentMode" class="d-flex flex-column" style="gap: 12px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="text-none justify-start py-3"
                  style="height: auto; min-height: 48px;"
                  block
                  @click="pickFolderForNewCollection"
                >
                  <v-icon start>
                    mdi-folder-music
                  </v-icon>
                  <span style="white-space: normal; text-align: left; line-height: 1.3;">{{ t('add_folder') }}</span>
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="text-none justify-start py-3"
                  style="height: auto; min-height: 48px;"
                  block
                  @click="contentMode = 'song'"
                >
                  <v-icon start>
                    mdi-file-music
                  </v-icon>
                  <span style="white-space: normal; text-align: left; line-height: 1.3;">{{ t('add_single_song') }}</span>
                </v-btn>
              </div>

              <div v-else>
                <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                  {{ t('external_audio_file') }}
                </div>
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="text-none mb-5"
                  block
                  @click="pickExternalFile('audio')"
                >
                  <v-icon start>
                    mdi-file-music
                  </v-icon>
                  <span class="text-truncate">{{ externalAudioFileName || t('select_file') }}</span>
                </v-btn>

                <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
                  {{ t('external_instrumental_file') }} ({{ t('optional') }})
                </div>
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="text-none"
                  block
                  @click="pickExternalFile('instrumental')"
                >
                  <v-icon start>
                    mdi-file-music-outline
                  </v-icon>
                  <span class="text-truncate">{{ externalInstrumentalFileName || t('select_file') }}</span>
                </v-btn>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" class="text-none" @click="contentMode ? (contentMode = null) : (dialogStep = 1)">
                {{ t('back') }}
              </v-btn>
              <v-spacer />
              <v-btn variant="text" class="text-none" @click="closeCreateDialog">
                {{ t('cancel') }}
              </v-btn>
              <v-btn
                v-if="contentMode === 'song'"
                color="primary"
                variant="flat"
                class="text-none font-weight-bold"
                :disabled="!externalAudioFilePath"
                @click="finalizeCreateWithSong"
              >
                {{ t('create_collection') }}
              </v-btn>
            </v-card-actions>
          </template>
        </v-card>
      </v-dialog>

      <!-- Dialog: adicionar música na coletânea aberta -->
      <v-dialog v-model="showAddSongDialog" max-width="440" persistent>
        <v-card class="rounded-xl pa-2">
          <v-card-title class="font-weight-bold">
            {{ t('add_song') }}
          </v-card-title>
          <v-card-text>
            <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
              {{ t('external_audio_file') }}
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              class="text-none mb-5"
              block
              @click="pickExternalFile('audio')"
            >
              <v-icon start>
                mdi-file-music
              </v-icon>
              <span class="text-truncate">{{ externalAudioFileName || t('select_file') }}</span>
            </v-btn>

            <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
              {{ t('external_instrumental_file') }} ({{ t('optional') }})
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              class="text-none mb-5"
              block
              @click="pickExternalFile('instrumental')"
            >
              <v-icon start>
                mdi-file-music-outline
              </v-icon>
              <span class="text-truncate">{{ externalInstrumentalFileName || t('select_file') }}</span>
            </v-btn>

            <div class="text-caption font-weight-bold mb-2" style="color: var(--sidebar-text-secondary);">
              {{ t('no_audio_file') }} ({{ t('optional') }})
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              class="text-none"
              block
              @click="pickExternalFile('no_audio')"
            >
              <v-icon start>
                mdi-monitor
              </v-icon>
              <span class="text-truncate">{{ externalNoAudioFileName || t('select_file') }}</span>
            </v-btn>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" class="text-none" @click="closeAddSongDialog">
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="text-none font-weight-bold"
              :disabled="!externalAudioFilePath"
              @click="addSongToCollection"
            >
              {{ t('add_song') }}
            </v-btn>
          </v-card-actions>
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
  filePathNoAudio: string | null;
}
type CollectionSong = InternalSong | ExternalSong;

interface CustomCollection {
  id: string;
  name: string;
  coverImage: string | null;
  songs: CollectionSong[];
}

const MEDIA_FILTERS = [
  { name: "Áudios, Vídeos e Arquivos LouvorJA", extensions: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "mp4", "mkv", "avi", "mov", "wmv", "webm", "slja"] },
  { name: "Todos", extensions: ["*"] },
];

function isSljaFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith(".slja");
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
      externalNoAudioFilePath: null as string | null,
      externalNoAudioFileName: "",
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
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    detailCollection(): CustomCollection | null {
      return this.collections.find((c) => c.id === this.detailCollectionId) || null;
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
  },
  mounted() {
    if (this.module?.show) {
      this.loadCollections();
      this.loadAllSongs();
    }
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${this.module_id}.${text}`, params || []);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    loadCollections() {
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
    playSong(item: CollectionSong) {
      if (item.type === "internal") {
        (this as any).$media.open({ id_music: item.id_music, mode: "audio" });
        return;
      }
      this.playExternalFile(item, "audio");
    },
    async playExternalFile(item: ExternalSong, mode: "audio" | "instrumental" | "no_audio") {
      const rawPath = mode === "audio" ? item.filePathAudio : mode === "instrumental" ? item.filePathInstrumental : item.filePathNoAudio;
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
      appdata.set("modules.external_media.minimized", isAudio);
      appdata.set("modules.external_media.show", !isAudio);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
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
        const preciseTimes = [0, ...remainingSlides.map((s: any) => (typeof s.time === "number" ? s.time : 0))];
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
      if (!electronAPI?.readSljaZip) return false;
      const data = await electronAPI.readSljaZip(filePath);
      return !!data?.instrumentalPath;
    },
    async changeCantado(item: ExternalSong) {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const filePath = await (window as any).electronAPI.openFileDialog({
        title: this.t("external_audio_file"),
        filters: MEDIA_FILTERS,
      });
      if (!filePath) return;
      item.filePathAudio = filePath as string;
      if (isSljaFile(filePath as string)) {
        if (!item.filePathNoAudio) item.filePathNoAudio = filePath as string;
        if (!item.filePathInstrumental && await this.detectSljaInstrumental(filePath as string)) {
          item.filePathInstrumental = filePath as string;
        }
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
    async playOrAddNoAudio(item: ExternalSong) {
      if (item.filePathNoAudio) {
        this.playExternalFile(item, "no_audio");
        return;
      }
      await this.changeNoAudio(item);
    },
    async changeNoAudio(item: ExternalSong) {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const filePath = await (window as any).electronAPI.openFileDialog({
        title: this.t("no_audio_file"),
        filters: MEDIA_FILTERS,
      });
      if (!filePath) return;
      item.filePathNoAudio = filePath as string;
      this.saveCollections();
    },
    removeNoAudio(item: ExternalSong) {
      item.filePathNoAudio = null;
      this.saveCollections();
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
      this.externalNoAudioFilePath = null;
      this.externalNoAudioFileName = "";
    },
    stripExt(fileName: string): string {
      return fileName.replace(/\.[^./\\]+$/, "");
    },
    async pickExternalFile(kind: "audio" | "instrumental" | "no_audio") {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const title = kind === "audio" ? this.t("external_audio_file") : kind === "instrumental" ? this.t("external_instrumental_file") : this.t("no_audio_file");
      const filePath = await (window as any).electronAPI.openFileDialog({
        title,
        filters: MEDIA_FILTERS,
      });
      if (!filePath) return;
      const fileName = (filePath as string).split(/[\\/]/).pop() || "";
      if (kind === "audio") {
        this.externalAudioFilePath = filePath as string;
        this.externalAudioFileName = fileName;
        if (isSljaFile(filePath as string)) {
          if (!this.externalNoAudioFilePath) {
            this.externalNoAudioFilePath = filePath as string;
            this.externalNoAudioFileName = fileName;
          }
          if (!this.externalInstrumentalFilePath && await this.detectSljaInstrumental(filePath as string)) {
            this.externalInstrumentalFilePath = filePath as string;
            this.externalInstrumentalFileName = fileName;
          }
        }
      } else if (kind === "instrumental") {
        this.externalInstrumentalFilePath = filePath as string;
        this.externalInstrumentalFileName = fileName;
      } else {
        this.externalNoAudioFilePath = filePath as string;
        this.externalNoAudioFileName = fileName;
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
          filePathNoAudio: this.externalNoAudioFilePath,
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
          filePathNoAudio: null,
        };
        if (isSljaFile(file.filePath)) {
          song.filePathNoAudio = file.filePath;
          if (await this.detectSljaInstrumental(file.filePath)) {
            song.filePathInstrumental = file.filePath;
          }
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
    openAddSongDialog() {
      this.resetExternalPick();
      this.showAddSongDialog = true;
    },
    closeAddSongDialog() {
      this.showAddSongDialog = false;
      this.resetExternalPick();
    },
    addSongToCollection() {
      if (!this.externalAudioFilePath || !this.detailCollection) return;
      this.detailCollection.songs.push({
        id: crypto.randomUUID(),
        type: "external",
        name: this.stripExt(this.externalAudioFileName),
        filePathAudio: this.externalAudioFilePath,
        filePathInstrumental: this.externalInstrumentalFilePath,
        filePathNoAudio: this.externalNoAudioFilePath,
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
    background: #ffffff;
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
</style>
