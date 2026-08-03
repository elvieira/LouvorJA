<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper"
    @update:model-value="updateModelValue"
  >
    <v-card class="modern-alert-card rounded-xl">
      <v-window v-model="addStep">
        <!-- Step 1: Type Selection -->
        <v-window-item :value="1">
          <v-card-title class="pt-6 px-6 pb-2 d-flex align-center justify-space-between">
            <span class="font-weight-bold" style="font-size: 1.2rem; color: var(--sidebar-text);">{{ t('add_item') }}</span>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="closeMenu"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="px-6 pb-6 pt-2">
            <v-row class="mt-1">
              <v-col
                v-for="type in itemTypes"
                :key="type.value"
                cols="6"
                sm="4"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    class="d-flex flex-column align-center justify-center rounded-xl pa-3 w-100 cursor-pointer text-center"
                    :elevation="0"
                    style="transition: all 0.3s ease; border: 1px solid var(--border-color, rgba(128,128,128,0.15)); aspect-ratio: 1;"
                    :style="{ background: isHovering ? 'rgba(128,128,128,0.04)' : 'transparent' }"
                    @click="openAddForm(type.value)"
                  >
                    <v-icon
                      :color="type.color"
                      size="42"
                      class="mb-3"
                      :style="{ transform: isHovering ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s ease' }"
                    >
                      {{ type.icon }}
                    </v-icon>
                    <div class="font-weight-bold mb-1" style="font-size: 0.95rem; color: var(--sidebar-text); line-height: 1.2;">
                      {{ type.label }}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--sidebar-text-secondary); line-height: 1.2; padding: 0 4px;">
                      {{ type.description }}
                    </div>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <!-- Step 2: Form -->
        <v-window-item :value="2">
          <v-card-title class="pt-6 px-6 d-flex align-center">
            <v-btn
              icon
              size="small"
              variant="text"
              class="mr-3"
              style="margin-left: -8px;"
              @click="addStep = 1"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-icon :color="getTypeColor(addForm.type)" class="mr-3">
              {{ getTypeIcon(addForm.type) }}
            </v-icon>
            <span class="font-weight-bold" style="font-size: 1.2rem; color: var(--sidebar-text);">{{ t('add_item') }}: {{ getTypeLabel(addForm.type) }}</span>
          </v-card-title>

          <v-card-text class="px-6 pb-2 pt-4">
            <!-- Name -->
            <v-text-field
              v-model="addForm.name"
              :label="t('fields.name')"
              variant="solo-filled"
              flat
              bg-color="rgba(128,128,128,0.05)"
              rounded="xl"
              density="comfortable"
              hide-details
              class="modern-input-no-thick mb-4"
              :placeholder="getNamePlaceholder(addForm.type)"
              autofocus
            />

            <!-- Description (annotation only) -->
            <v-textarea
              v-if="addForm.type === 'annotation'"
              v-model="addForm.subtitle"
              :label="t('fields.description')"
              variant="solo-filled"
              flat
              bg-color="rgba(128,128,128,0.05)"
              rounded="xl"
              density="comfortable"
              hide-details
              rows="2"
              auto-grow
              class="modern-input-no-thick mb-4"
            />

            <!-- Music selector -->
            <div v-if="addForm.type === 'music'" class="mb-4">
              <v-autocomplete
                v-model="addForm.musicId"
                v-model:search="musicSearchQuery"
                :items="filteredMusicList"
                :custom-filter="() => true"
                item-title="name"
                item-value="id_music"
                :label="t('fields.search_music')"
                variant="solo-filled"
                flat
                bg-color="rgba(128,128,128,0.05)"
                rounded="xl"
                density="comfortable"
                class="modern-input-no-thick"
                hide-details
                clearable
                :menu-props="{ transition: 'fade-transition' }"
                :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                @update:model-value="onMusicSelect"
              >
                <template #item="{ item, props }">
                  <v-list-item
                    v-bind="props"
                    :title="null"
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
              <v-autocomplete
                v-model="addForm.verseBookId"
                :items="bibleBooks"
                item-title="name"
                item-value="id_bible_book"
                :label="t('fields.book')"
                variant="solo-filled"
                flat
                bg-color="rgba(128,128,128,0.05)"
                rounded="xl"
                density="comfortable"
                class="modern-input-no-thick mb-3"
                hide-details
                :menu-props="{ transition: 'fade-transition' }"
                :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                @update:model-value="onBookSelect"
              >
                <template #item="{ item, props }">
                  <v-list-item
                    v-bind="props"
                    :title="null"
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
              <div class="d-flex" style="gap: 12px;">
                <v-autocomplete
                  v-model="addForm.verseChapter"
                  :items="verseChapterList"
                  :label="t('fields.chapter')"
                  variant="solo-filled"
                  flat
                  bg-color="rgba(128,128,128,0.05)"
                  rounded="xl"
                  density="comfortable"
                  class="modern-input-no-thick mb-3"
                  hide-details
                  style="max-width: 120px;"
                  :menu-props="{ transition: 'fade-transition' }"
                  :list-props="{ style: 'background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color, rgba(150, 150, 150, 0.2)); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); padding: 8px 0;' }"
                >
                  <template #item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      :title="null"
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
                <v-text-field
                  v-model="addForm.verseNumbers"
                  :label="t('fields.verses')"
                  variant="solo-filled"
                  flat
                  bg-color="rgba(128,128,128,0.05)"
                  rounded="xl"
                  density="comfortable"
                  class="modern-input-no-thick mb-3"
                  hide-details
                  :placeholder="t('fields.verses_placeholder')"
                />
              </div>
            </div>

            <!-- Media file selector -->
            <div v-if="addForm.type === 'media'" class="mb-4">
              <div
                v-if="addForm.filePath"
                class="rounded-xl pa-4 d-flex align-center justify-space-between"
                style="border: 1px solid var(--border-color, rgba(128,128,128,0.2)); background: rgba(128,128,128,0.05);"
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

            <!-- Link URL -->
            <v-text-field
              v-if="addForm.type === 'link'"
              v-model="addForm.url"
              :label="t('fields.url')"
              variant="solo-filled"
              flat
              bg-color="rgba(128,128,128,0.05)"
              rounded="xl"
              density="comfortable"
              class="modern-input-no-thick mb-4"
              hide-details
              :placeholder="t('fields.url_placeholder')"
            />
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

<script>
export default {
  name: "AddItemDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue", "save"],
  data: () => ({
    addStep: 1,
    addForm: {
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
    },
    musicSearchQuery: "",
    musicList: [],
    bibleBooks: [],
    bibleVersions: [],
    dataLoaded: false,
  }),
  computed: {
    itemTypes() {
      return [
        { value: "annotation", icon: "mdi-text", color: "info", label: this.t("types.annotation"), description: this.t("type_descriptions.annotation") },
        { value: "category", icon: "mdi-tag", color: "warning", label: this.t("types.category"), description: this.t("type_descriptions.category") },
        { value: "music", icon: "mdi-music-note", color: "success", label: this.t("types.music"), description: this.t("type_descriptions.music") },
        { value: "verse", icon: "mdi-book-open-variant", color: "purple", label: this.t("types.verse"), description: this.t("type_descriptions.verse") },
        { value: "media", icon: "mdi-file-video", color: "orange", label: this.t("types.media"), description: this.t("type_descriptions.media") },
        { value: "link", icon: "mdi-link", color: "cyan", label: this.t("types.link"), description: this.t("type_descriptions.link") },
      ];
    },
    isFormValid() {
      if (!this.addForm.name.trim()) return false;
      if (this.addForm.type === "music" && !this.addForm.musicId) return false;
      if (this.addForm.type === "verse" && (!this.addForm.verseBookId || !this.addForm.verseChapter)) return false;
      if (this.addForm.type === "media" && !this.addForm.filePath) return false;
      if (this.addForm.type === "link" && !this.addForm.url.trim()) return false;
      return true;
    },
    filteredMusicList() {
      const selectedMusic = this.musicList.find(m => m.id_music === this.addForm.musicId);
      const query = (this.musicSearchQuery || "").trim().toLowerCase();
      
      if (!query) {
        return selectedMusic ? [selectedMusic] : [];
      }
      
      const isNum = !isNaN(query) && query !== "";
      const numQuery = isNum ? Number(query) : null;
      
      const results = this.musicList.filter(m => {
        const title = (m.name || "").toLowerCase();
        
        if (isNum) {
          const isHymnalTrack = m.albums?.some(a => a.type === "hymnal" && Number(a.pivot?.track) === numQuery);
          return title.includes(query) || isHymnalTrack;
        } 
        return title.includes(query);
      });
      
      if (isNum) {
        results.sort((a, b) => {
          const getScore = (item) => {
            if (item.albums?.some(al => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numQuery)) return 2;
            if (item.albums?.some(al => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numQuery)) return 1;
            return 0;
          };
          return getScore(b) - getScore(a);
        });
      }
      
      return results.slice(0, 50); // limit to 50 results to keep the menu fast
    },
    verseChapterList() {
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
    t(text) {
      return this.$t(`modules.liturgy.${text}`);
    },
    updateModelValue(val) {
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
      };
    },
    getTypeIcon(type) {
      const map = { annotation: "mdi-text", category: "mdi-tag", music: "mdi-music-note", verse: "mdi-book-open-variant", media: "mdi-file-video", link: "mdi-link" };
      return map[type] || "mdi-help";
    },
    getTypeColor(type) {
      const map = { annotation: "info", category: "warning", music: "success", verse: "purple", media: "orange", link: "cyan" };
      return map[type] || "grey";
    },
    getTypeLabel(type) {
      return this.t(`types.${type}`);
    },
    getNamePlaceholder(type) {
      const map = {
        annotation: "",
        category: "",
        music: "",
        verse: "",
        media: "",
        link: "",
      };
      return map[type] || "";
    },
    openAddForm(type) {
      this.resetForm();
      this.addForm.type = type;
      this.addStep = 2;
    },
    onMusicSelect(musicId) {
      if (!musicId) return;
      const music = this.musicList.find(m => m.id_music === musicId);
      if (music && !this.addForm.name) {
        this.addForm.name = music.hymnal_track ? `${music.hymnal_track} - ${music.name}` : music.name;
      }
    },
    onBookSelect(bookId) {
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
          this.addForm.filePath = filePath;
          if (!this.addForm.name) {
            const fileName = filePath.split(/[\\/]/).pop();
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
            const hymnalAlbum = m.albums ? m.albums.find(a => a.type === "hymnal") : null;
            const hymnalTrack = hymnalAlbum && hymnalAlbum.pivot ? hymnalAlbum.pivot.track : null;
            return {
              id_music: m.id_music,
              hymnal_track: hymnalTrack,
              name: m.name,
              album_names: m.albums ? m.albums.map(a => a.name).join(", ") : "",
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
                this.$alert.error({ text: this.t("messages.invalid_verse").replace("{max}", maxVerse).replace("{num}", num), translate: false });
                return; // halt save!
              }
            }
          }
        } catch (e) {
          console.error("Failed to validate verses", e);
        }
      }

      const item = {
        id: Date.now() + Math.random(),
        type: this.addForm.type,
        name: this.addForm.name.trim(),
        subtitle: this.addForm.subtitle?.trim() || "",
      };

      if (this.addForm.type === "music") {
        item.musicId = this.addForm.musicId;
        item.musicMode = this.addForm.musicMode;
        const music = this.musicList.find(m => m.id_music === this.addForm.musicId);
        if (music) {
          item.subtitle = music.album_names || "";
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

      if (this.addForm.type === "media") {
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
};
</script>
