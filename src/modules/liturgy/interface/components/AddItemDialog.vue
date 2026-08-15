<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper"
    attach="true"
    @update:model-value="updateModelValue"
  >
    <v-card class="modern-alert-card rounded-xl">
      <v-window v-model="addStep">
        <!-- Step 1: Type Selection -->
        <v-window-item :value="1">
          <v-card-title class="pt-6 px-6 pb-4 d-flex align-center justify-space-between">
            <div class="d-flex flex-column">
              <span class="font-weight-bold" style="font-size: 1.25rem; color: var(--sidebar-text);">{{ t('add_item') }}</span>
              <span class="text-caption mt-1" style="color: var(--sidebar-text-secondary); opacity: 0.8;">Selecione o tipo de item para adicionar à liturgia</span>
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
          </v-card-title>
          
          <v-card-text class="px-6 pb-6 pt-0">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              <v-hover v-for="type in itemTypes" :key="type.value" v-slot="{ isHovering, props }">
                <div
                  v-bind="props"
                  class="pa-3 d-flex align-center"
                  :style="{ 
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isHovering ? 'rgba(var(--v-theme-primary), 0.3)' : 'rgba(var(--v-theme-on-surface), 0.03)',
                    background: isHovering ? 'rgba(var(--v-theme-on-surface), 0.08)' : 'rgba(var(--v-theme-on-surface), 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }"
                  @click="openAddForm(type.value)"
                >
                  <div
                    class="mr-3 d-flex align-center justify-center flex-shrink-0"
                    :style="{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: isHovering ? 'rgba(var(--v-theme-primary), 0.1)' : 'rgba(var(--v-theme-on-surface), 0.06)',
                      transition: 'all 0.2s ease',
                    }"
                  >
                    <v-icon :color="isHovering ? 'primary' : 'rgba(var(--v-theme-on-surface), 0.6)'" size="20">
                      {{ type.icon }}
                    </v-icon>
                  </div>
                  <div style="min-width: 0;">
                    <div class="font-weight-medium mb-1" style="font-size: 0.95rem; color: var(--sidebar-text); line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ type.label }}
                    </div>
                    <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.2;">
                      {{ type.description }}
                    </div>
                  </div>
                </div>
              </v-hover>
            </div>
          </v-card-text>
        </v-window-item>

        <!-- Step 2: Form -->
        <v-window-item :value="2">
          <v-card-title class="pt-6 px-6 pb-4 d-flex align-center">
            <v-btn
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
                <v-icon color="primary" size="20">
                  {{ getTypeIcon(addForm.type) }}
                </v-icon>
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="font-weight-bold" style="font-size: 1.15rem; color: var(--sidebar-text); line-height: 1.2;">{{ getTypeLabel(addForm.type) }}</span>
                <span class="text-caption" style="color: var(--sidebar-text-secondary); opacity: 0.8; line-height: 1.2;">Configurar detalhes do item</span>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="px-6 pb-2 pt-4">
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
                Cor de destaque (opcional)
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

            <!-- Media file selector -->
            <div v-if="addForm.type === 'media'" class="mb-4">
              <div
                v-if="addForm.filePath"
                class="rounded-xl pa-4 d-flex align-center justify-space-between"
                style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(var(--v-theme-on-surface), 0.06);"
              >
                <div class="d-flex align-center" style="overflow: hidden;">
                  <v-icon color="primary" size="32" class="mr-3">
                    mdi-file-video
                  </v-icon>
                  <div class="d-flex flex-column" style="overflow: hidden;">
                    <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 250px;">
                      {{ addForm.filePath.split(/[\\/]/).pop() }}
                    </span>
                    <span class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); max-width: 250px;" :title="addForm.filePath">
                      {{ addForm.filePath }}
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
                    @click="selectMediaFile"
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
                class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer"
                style="height: 120px; border: 2px dashed var(--border-color, rgba(128,128,128,0.2)); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                onmouseover="this.style.background='rgba(128,128,128,0.04)'; this.style.borderColor='rgba(128,128,128,0.5)'"
                onmouseout="this.style.background='rgba(128,128,128,0.02)'; this.style.borderColor='var(--border-color, rgba(128,128,128,0.2))'"
                @click="selectMediaFile"
              >
                <v-icon
                  size="36"
                  color="primary"
                  class="mb-2"
                  style="opacity: 0.8;"
                >
                  mdi-cloud-upload
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">{{ t('fields.select_file') || 'Selecionar Arquivo' }}</span>
                <span class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">{{ t('fields.click_to_browse') }}</span>
              </div>
            </div>

            <!-- External File/Directory selector -->
            <div v-if="addForm.type === 'file'" class="mb-4">
              <div
                v-if="addForm.filePath"
                class="rounded-xl pa-4 d-flex align-center justify-space-between"
                style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(var(--v-theme-on-surface), 0.06);"
              >
                <div class="d-flex align-center" style="overflow: hidden;">
                  <v-icon color="primary" size="32" class="mr-3">
                    mdi-folder-file-outline
                  </v-icon>
                  <div class="d-flex flex-column" style="overflow: hidden;">
                    <span class="font-weight-bold text-truncate" style="color: var(--sidebar-text); max-width: 250px;">
                      {{ addForm.filePath.split(/[\\/]/).pop() }}
                    </span>
                    <span class="text-caption text-truncate" style="color: var(--sidebar-text-secondary); max-width: 250px;" :title="addForm.filePath">
                      {{ addForm.filePath }}
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
                    @click="selectExternalFile"
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
                class="rounded-xl d-flex flex-column align-center justify-center cursor-pointer"
                style="height: 120px; border: 2px dashed var(--border-color, rgba(128,128,128,0.2)); background: rgba(128,128,128,0.02); transition: all 0.2s;"
                onmouseover="this.style.background='rgba(128,128,128,0.04)'; this.style.borderColor='rgba(128,128,128,0.5)'"
                onmouseout="this.style.background='rgba(128,128,128,0.02)'; this.style.borderColor='var(--border-color, rgba(128,128,128,0.2))'"
                @click="selectExternalFile"
              >
                <v-icon
                  size="36"
                  color="primary"
                  class="mb-2"
                  style="opacity: 0.8;"
                >
                  mdi-file-find
                </v-icon>
                <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">Selecionar Arquivo ou Pasta</span>
                <span class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">{{ t('fields.click_to_browse') }}</span>
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
          </v-card-text>

          <v-card-text v-if="addForm.type === 'scheduled_item'" class="px-6 pb-2 pt-0">
            <div class="mb-4">
              <div class="text-body-2 font-weight-medium mb-1" style="color: var(--sidebar-text-secondary); margin-left: 4px;">
                Categoria Agendada
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
                      Nenhuma categoria criada. Crie uma em Itens Agendados.
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </div>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2 d-flex justify-end" style="gap: 12px;">
            <v-spacer />
            <v-btn
              color="error"
              variant="tonal"
              class="modern-alert-btn px-6"
              height="40"
              @click="closeMenu"
            >
              {{ t('actions.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="modern-alert-btn px-6"
              height="40"
              :disabled="!isFormValid"
              @click="saveItem"
            >
              {{ t('actions.save') }}
            </v-btn>
          </v-card-actions>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "AddItemDialog",
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
    },
    musicSearchQuery: "",
    musicList: [] as any[],
    bibleBooks: [] as any[],
    bibleVersions: [] as any[],
    dataLoaded: false,
  }),
  computed: {
    itemTypes(): any[] {
      return [
        { value: "annotation", icon: "mdi-text", color: "info", label: this.t("types.annotation"), description: this.t("type_descriptions.annotation") },
        { value: "category", icon: "mdi-tag", color: "warning", label: this.t("types.category"), description: this.t("type_descriptions.category") },
        { value: "music", icon: "mdi-music-note", color: "success", label: this.t("types.music"), description: this.t("type_descriptions.music") },
        { value: "verse", icon: "mdi-book-open-variant", color: "purple", label: this.t("types.verse"), description: this.t("type_descriptions.verse") },
        { value: "media", icon: "mdi-file-video", color: "orange", label: this.t("types.media"), description: this.t("type_descriptions.media") },
        { value: "link", icon: "mdi-link", color: "indigo", label: this.t("types.link"), description: this.t("type_descriptions.link") },
        { value: "file", icon: "mdi-file-document-outline", color: "blue-grey", label: this.t("types.file"), description: this.t("type_descriptions.file") },
        { value: "scheduled_item", icon: "mdi-calendar-check", color: "deep-purple", label: this.t("types.scheduled_item"), description: this.t("type_descriptions.scheduled_item") },
      ];
    },
    isFormValid(): boolean {
      if (!this.addForm.name.trim()) return false;
      if (this.addForm.type === "music" && !this.addForm.musicId) return false;
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
  },
  watch: {
    modelValue(val) {
      if (val) {
        if (!this.dataLoaded) {
          this.loadData();
        }
        if (this.editData) {
          this.addForm = { ...this.editData };
          this.addStep = 2;
        } else {
          this.addStep = 1;
          this.resetForm();
        }
      }
    },
  },
  methods: {
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
      };
    },
    getTypeIcon(type: string): string {
      const map: Record<string, string> = { annotation: "mdi-text", category: "mdi-tag", music: "mdi-music-note", verse: "mdi-book-open-variant", media: "mdi-file-video", link: "mdi-link", file: "mdi-folder-file-outline", scheduled_item: "mdi-calendar-clock" };
      return map[type] || "mdi-help";
    },
    getTypeColor(type: string): string {
      const map: Record<string, string> = { annotation: "info", category: "warning", music: "success", verse: "purple", media: "orange", link: "cyan" };
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
        verse: "",
        media: "",
        link: "",
      };
      return map[type] || "";
    },
    openAddForm(type: string) {
      this.resetForm();
      this.addForm.type = type;
      this.addStep = 2;
    },
    onMusicSelect(musicId: number | string | null) {
      if (!musicId) return;
      const music = this.musicList.find(m => m.id_music === musicId);
      if (music && !this.addForm.name) {
        this.addForm.name = music.hymnal_track ? `${music.hymnal_track} - ${music.name}` : music.name;
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
    async selectMediaFile() {
      if (window.electronAPI?.openFileDialog) {
        const filePath = await window.electronAPI.openFileDialog({
          title: this.t("fields.select_media"),
          filters: [
            { name: "Mídia", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "webm", "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"] },
            { name: "Vídeos", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "webm"] },
            { name: "Áudios", extensions: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"] },
            { name: "Todos", extensions: ["*"] },
          ],
        });
        if (filePath) {
          this.addForm.filePath = filePath as string;
          if (!this.addForm.name) {
            const fileName = (filePath as string).split(/[\\/]/).pop() || "";
            this.addForm.name = fileName;
          }
        }
      }
    },
    async selectExternalFile() {
      if (window.electronAPI?.openFileDialog) {
        const filePath = await window.electronAPI.openFileDialog({
          title: "Selecionar Arquivo ou Pasta",
          properties: ["openFile", "openDirectory"],
          filters: [
            { name: "Todos os Arquivos", extensions: ["*"] },
          ],
        });
        if (filePath) {
          const pathStr = filePath as string;
          const ext = pathStr.split(".").pop()?.toLowerCase() || "";
          const blockedExts = ["mp4", "mkv", "avi", "mov", "wmv", "webm", "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"];
          if (blockedExts.includes(ext)) {
            if (this.$alert && typeof this.$alert.error === "function") {
              this.$alert.error({ text: "Arquivos de áudio e vídeo devem ser adicionados usando o tipo 'Mídia'.", translate: false });
            } else {
              alert("Arquivos de áudio e vídeo devem ser adicionados usando o tipo 'Mídia'.");
            }
            return;
          }
          this.addForm.filePath = pathStr;
          if (!this.addForm.name) {
            const fileName = pathStr.split(/[\\/]/).pop() || "";
            this.addForm.name = fileName;
          }
        }
      }
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
        id: Date.now() + Math.random(),
        type: this.addForm.type,
        name: this.addForm.name.trim(),
        subtitle: this.addForm.subtitle?.trim() || "",
        color: this.addForm.color,
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
