<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page music-editor-module d-flex flex-column">
      <ModuleHeader v-if="mode === 'edit'" :title="headerTitle" icon="mdi-music-note-plus">
        <!-- EDIT HEADER (compact ribbon) -->
        <div class="d-flex flex-column align-end compact-ribbon">
          <div class="compact-ribbon-tabs d-flex align-center">
            <button
              v-for="tabItem in ribbonTabs"
              :key="tabItem.key"
              type="button"
              class="ribbon-tab-btn compact"
              :class="{ active: ribbonTab === tabItem.key }"
              @click="ribbonTab = tabItem.key"
            >
              {{ tabItem.label }}
            </button>
          </div>

          <div class="compact-ribbon-toolbar d-flex align-center">
            <!-- ARQUIVO -->
            <template v-if="ribbonTab === 'file'">
              <v-btn
                icon
                variant="text"
                size="small"
                @click="openNewSong"
              >
                <v-icon>mdi-file-plus-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_new') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :color="currentFilePath ? 'primary' : undefined"
                @click="openFile"
              >
                <v-icon>mdi-folder-open-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ currentFilePath ? currentFileName : t('ribbon_open') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="importTextFile"
              >
                <v-icon>mdi-file-import-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_import') }}
                </v-tooltip>
              </v-btn>
              <div class="compact-ribbon-divider" />
              <v-btn
                icon
                variant="text"
                size="small"
                :color="externalAudioFilePath ? 'primary' : undefined"
                @click="pickExternalFile('audio')"
              >
                <v-icon>mdi-file-music</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ externalAudioFilePath ? externalAudioFileName : t('external_audio_file') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :color="externalInstrumentalFilePath ? 'primary' : undefined"
                @click="pickExternalFile('instrumental')"
              >
                <v-icon>mdi-file-music-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ externalInstrumentalFilePath ? externalInstrumentalFileName : t('external_instrumental_file') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="!externalAudioFilePath && !externalInstrumentalFilePath"
                @click="resetExternalPick"
              >
                <v-icon>mdi-music-note-off-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_remove_audio') }}
                </v-tooltip>
              </v-btn>
              <div class="compact-ribbon-divider" />
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="!canSave || !currentFilePath"
                @click="saveDocument"
              >
                <v-icon>mdi-content-save</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('save') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="saveFileAs"
              >
                <v-icon>mdi-content-save-move-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_save_as') }}
                </v-tooltip>
              </v-btn>
            </template>

            <!-- SLIDES -->
            <template v-if="ribbonTab === 'slides'">
              <v-btn
                icon
                variant="text"
                size="small"
                @click="addSlide"
              >
                <v-icon>mdi-plus-box-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_new_slide') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="duplicateSlide"
              >
                <v-icon>mdi-content-duplicate</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_duplicate_slide') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="slidesInput.length <= 1"
                @click="removeSlide(activeSlideIndex)"
              >
                <v-icon>mdi-delete-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('ribbon_delete_slide') }}
                </v-tooltip>
              </v-btn>
              <div class="compact-ribbon-divider" />
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="activeSlideIndex <= 0"
                @click="goToFirstSlide"
              >
                <v-icon>mdi-page-first</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="activeSlideIndex <= 0"
                @click="goToPrevSlide"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="activeSlideIndex >= slidesInput.length - 1"
                @click="goToNextSlide"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="activeSlideIndex >= slidesInput.length - 1"
                @click="goToLastSlide"
              >
                <v-icon>mdi-page-last</v-icon>
              </v-btn>
            </template>

            <!-- FORMATAR -->
            <template v-if="ribbonTab === 'format'">
              <v-btn
                icon
                variant="text"
                size="small"
                :color="activeSlide?.image ? 'primary' : undefined"
                @click="pickSlideImage"
              >
                <v-icon>mdi-image-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('format_image') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="!activeSlide?.image"
                @click="removeSlideImage"
              >
                <v-icon>mdi-image-remove</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('format_remove_image') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="!activeSlide?.image"
                @click="applyImageToFollowingSlides"
              >
                <v-icon>mdi-arrow-right-bold-box-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('format_all_next') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="!activeSlide?.image"
                @click="applyImageToAllSlides"
              >
                <v-icon>mdi-view-grid-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('format_all_slides') }}
                </v-tooltip>
              </v-btn>
              <div class="compact-ribbon-divider" />
              <div class="compact-format-field">
                <input
                  v-model.number="activeSlide.fontSize"
                  type="number"
                  min="1"
                  class="ribbon-number-input"
                />
                <ModernColorPicker v-model="activeSlide.fontColor" />
                <v-tooltip activator="parent" location="bottom">
                  {{ t('main_text') }}
                </v-tooltip>
              </div>
              <div class="compact-format-field">
                <input
                  v-model.number="activeSlide.auxFontSize"
                  type="number"
                  min="1"
                  class="ribbon-number-input"
                />
                <ModernColorPicker v-model="activeSlide.auxFontColor" />
                <v-tooltip activator="parent" location="bottom">
                  {{ t('aux_text') }}
                </v-tooltip>
              </div>
            </template>
          </div>
        </div>
      </ModuleHeader>

      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden;">
        <!-- EDIT VIEW (ribbon-style editor) -->
        <template v-if="mode === 'edit'">
          <div class="editor-workspace d-flex flex-grow-1" style="min-height: 0;">
            <!-- LEFT PANEL -->
            <div class="editor-left-panel">
              <div class="panel-section">
                <div class="panel-label">
                  {{ t('main_text') }}
                </div>
                <v-textarea
                  v-model="activeSlide.text"
                  :placeholder="t('slide_placeholder')"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  rows="2"
                  auto-grow
                  hide-details
                />
              </div>
              <div class="panel-section">
                <div class="panel-label">
                  {{ t('aux_text') }}
                </div>
                <v-textarea
                  v-model="activeSlide.auxText"
                  :placeholder="t('aux_text_placeholder')"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  rows="1"
                  auto-grow
                  hide-details
                />
              </div>
              <div class="panel-section pb-1">
                <div class="panel-label mb-0">
                  {{ t('slides') }}
                </div>
              </div>
              <div ref="slidesListPanel" class="slides-list-panel">
                <div
                  v-for="(slide, index) in slidesInput"
                  :key="index"
                  class="slide-row"
                  :class="{ active: index === activeSlideIndex }"
                  :data-slide-index="index"
                  @click="activeSlideIndex = index"
                >
                  <span class="slide-num">{{ index + 1 }}</span>
                  <span class="slide-label">{{ slideRowLabel(slide) }}</span>
                  <v-icon
                    v-if="typeof slide.time === 'number'"
                    size="14"
                    color="success"
                    class="slide-time-indicator"
                  >
                    mdi-check-circle
                    <v-tooltip activator="parent" location="top">
                      {{ t('slide_time_recorded') }}
                    </v-tooltip>
                  </v-icon>
                  <div v-if="index === activeSlideIndex && isPreviewingThisAudio" class="slide-progress-track">
                    <div class="slide-progress-fill" :style="{ width: activeSlideProgress + '%' }" />
                  </div>
                </div>
              </div>
            </div>

            <!-- PREVIEW -->
            <div class="editor-preview-area">
              <div class="editor-preview-toolbar d-flex align-center">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :disabled="!externalAudioFilePath"
                  @click="previewAudio"
                >
                  <v-icon>mdi-play</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    {{ t('ribbon_play') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :disabled="!externalAudioFilePath"
                  @click="recordAndAdvance"
                >
                  <v-icon>mdi-microphone-plus</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    {{ t('ribbon_record_advance') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :disabled="!hasRecordedTimes"
                  @click="resetRecordedTimes"
                >
                  <v-icon>mdi-record-circle-outline</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    {{ t('ribbon_record_start') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="clearAll"
                >
                  <v-icon>mdi-delete-sweep-outline</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    {{ t('clear_all') }}
                  </v-tooltip>
                </v-btn>
              </div>
              <div class="editor-preview-canvas">
                <LSlide
                  :text="activeSlideFormattedText"
                  :aux_text="activeSlideFormattedAuxText"
                  :image="activeSlideImageUrl || undefined"
                  :text_size_pc="activeSlide?.fontSize"
                  :text_color="activeSlide?.fontColor"
                  :aux_text_size_pc="activeSlide?.auxFontSize"
                  :aux_text_color="activeSlide?.auxFontColor"
                  force_image
                />
                <div class="editor-preview-controls">
                  <button
                    type="button"
                    class="preview-nav-btn"
                    :disabled="activeSlideIndex <= 0"
                    @click="goToFirstSlide"
                  >
                    <v-icon size="18">
                      mdi-skip-previous
                    </v-icon>
                  </button>
                  <button
                    type="button"
                    class="preview-nav-btn"
                    :disabled="activeSlideIndex <= 0"
                    @click="goToPrevSlide"
                  >
                    <v-icon size="18">
                      mdi-chevron-left
                    </v-icon>
                  </button>
                  <div class="preview-slide-count">
                    {{ t('slide_label') }} {{ activeSlideIndex + 1 }} / {{ slidesInput.length }}
                  </div>
                  <button
                    type="button"
                    class="preview-nav-btn"
                    :disabled="activeSlideIndex >= slidesInput.length - 1"
                    @click="goToNextSlide"
                  >
                    <v-icon size="18">
                      mdi-chevron-right
                    </v-icon>
                  </button>
                  <button
                    type="button"
                    class="preview-nav-btn"
                    :disabled="activeSlideIndex >= slidesInput.length - 1"
                    @click="goToLastSlide"
                  >
                    <v-icon size="18">
                      mdi-skip-next
                    </v-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- PRESENT VIEW (native player look) -->
        <template v-if="mode === 'present'">
          <div class="native-player-container position-relative w-100 h-100 d-flex flex-row overflow-hidden">
            <div class="native-player-visual flex-grow-1 position-relative">
              <LSlide
                :text="currentSlideText"
                :aux_text="currentSlideAuxText"
                :image="currentSlideImageUrl || undefined"
                :text_size_pc="currentSlideData?.fontSize"
                :text_color="currentSlideData?.fontColor"
                :aux_text_size_pc="currentSlideData?.auxFontSize"
                :aux_text_color="currentSlideData?.auxFontColor"
                force_image
                class="w-100 h-100"
              />
            </div>

            <div class="native-player-playlist" :class="{ open: showSlideList }">
              <div ref="presentPlaylistPanel" class="native-playlist-scroll">
                <div
                  v-for="(slide, index) in presentingSong?.slides"
                  :key="index"
                  class="native-playlist-item"
                  :class="{ active: index === presentSlideIndex }"
                  :data-slide-index="index"
                  @click="goToPresentSlide(index)"
                >
                  <div class="native-slide-chip">
                    {{ index + 1 }}
                  </div>
                  <div class="native-slide-text text-truncate">
                    {{ slideRowLabel(slide) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="native-player-toolbar d-flex align-center">
              <v-btn
                icon
                variant="flat"
                size="small"
                class="native-system-btn"
                @click="exitPresentation"
              >
                <v-icon>mdi-minus</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Minimizar
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="flat"
                size="small"
                class="native-system-btn"
                @click="exitPresentation"
              >
                <v-icon>mdi-close</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Fechar
                </v-tooltip>
              </v-btn>
            </div>

            <div class="native-player-footer position-absolute w-100 d-flex justify-center">
              <div class="native-footer-pill d-flex align-center px-6 py-2">
                <div class="native-player-info d-flex flex-column mr-6">
                  <span class="text-subtitle-2 font-weight-bold text-truncate text-white" style="line-height: 1.2;">{{ presentingSong?.name }}</span>
                  <span class="text-caption text-truncate" style="line-height: 1.2; color: rgba(255,255,255,0.6);">{{ presentingSong?.name }}</span>
                </div>

                <div class="d-flex align-center mr-4">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mx-1"
                    :disabled="presentSlideIndex <= 0"
                    @click="prevSlide"
                  >
                    <v-icon>mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="presentingSong?.filePathAudio || presentingSong?.filePathInstrumental"
                    icon
                    variant="text"
                    size="large"
                    class="mx-1 native-play-btn"
                    @click="togglePresentPlayPause"
                  >
                    <v-icon>{{ presentIsPaused ? 'mdi-play-circle' : 'mdi-pause-circle' }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mx-1"
                    :disabled="presentSlideIndex >= (presentingSong?.slides.length || 1) - 1"
                    @click="nextSlide"
                  >
                    <v-icon>mdi-skip-next</v-icon>
                  </v-btn>
                </div>

                <div v-if="presentActiveMode" class="native-timeline d-flex align-center flex-grow-1 mr-4">
                  <span class="text-caption mr-2" style="color: rgba(255,255,255,0.7);">{{ formatPresentTime(presentCurrentTime) }}</span>
                  <v-slider
                    v-model="presentProgress"
                    :min="0"
                    :max="100"
                    step="0.1"
                    hide-details
                    color="white"
                    track-color="rgba(255,255,255,0.3)"
                    thumb-size="12"
                    class="native-timeline-slider flex-grow-1"
                    @end="seekPresentProgress"
                  />
                  <span class="text-caption ml-2" style="color: rgba(255,255,255,0.7);">{{ formatPresentTime(presentDuration) }}</span>
                </div>

                <div v-if="presentActiveMode" class="d-flex align-center mr-2">
                  <v-btn
                    :icon="presentVolumeIcon"
                    variant="text"
                    size="small"
                    class="mx-1"
                    @click="togglePresentMute"
                  />
                </div>

                <v-btn
                  v-if="presentingSong?.filePathAudio && presentingSong?.filePathInstrumental"
                  icon
                  variant="text"
                  :color="presentActiveMode === 'audio' ? 'info' : undefined"
                  size="small"
                  class="mx-1"
                  @click="togglePresentMode"
                >
                  <v-icon>mdi-account-voice</v-icon>
                  <v-tooltip activator="parent" location="top">
                    {{ presentActiveMode === 'instrumental' ? t('external_instrumental_file') : t('external_audio_file') }}
                  </v-tooltip>
                </v-btn>

                <ButtonScreen
                  module="music_editor"
                  variant="text"
                  size="small"
                  class="mx-1"
                />

                <v-btn
                  icon
                  variant="text"
                  :color="showSlideList ? 'info' : undefined"
                  size="small"
                  class="mx-1"
                  @click="showSlideList = !showSlideList"
                >
                  <v-icon>mdi-format-list-bulleted</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import ButtonScreen from "@/components/buttons/Screen.vue";
import LSlide from "@/components/Slide.vue";
import ModernColorPicker from "@/components/inputs/ModernColorPicker.vue";

interface EditorSlide {
  text: string;
  auxText: string;
  image: string | null;
  fontSize: number;
  fontColor: string;
  auxFontSize: number;
  auxFontColor: string;
  time: number | null;
}

const DEFAULT_SLIDE = (): EditorSlide => ({
  text: "",
  auxText: "",
  image: null,
  fontSize: 18,
  fontColor: "#ffffff",
  auxFontSize: 10,
  auxFontColor: "#ffffff",
  time: null,
});

interface PresentedSong {
  name: string;
  slides: EditorSlide[];
  filePathAudio: string | null;
  filePathInstrumental: string | null;
}

const AUDIO_FILTERS = [
  { name: "Áudio", extensions: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"] },
  { name: "Todos", extensions: ["*"] },
];

const LJA_OPEN_FILTERS = [
  { name: "Arquivo LouvorJA", extensions: ["slja", "lja"] },
];

const SLJA_SAVE_FILTERS = [
  { name: "Arquivo LouvorJA", extensions: ["slja"] },
];

const TXT_FILTERS = [
  { name: "Texto", extensions: ["txt"] },
];

const IMAGE_FILTERS = [
  { name: "Imagens", extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"] },
];

function formatSlideText(raw: string): string {
  return (raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function normalizeSlides(rawSlides: any[]): EditorSlide[] {
  if (!Array.isArray(rawSlides) || rawSlides.length === 0) return [DEFAULT_SLIDE()];
  return rawSlides.map((s) => {
    const base = DEFAULT_SLIDE();
    if (typeof s === "string") return { ...base, text: s };
    return {
      ...base,
      text: s.text || "",
      auxText: s.auxText || "",
      image: s.image || null,
      fontSize: s.fontSize || base.fontSize,
      fontColor: s.fontColor || base.fontColor,
      auxFontSize: s.auxFontSize || base.auxFontSize,
      auxFontColor: s.auxFontColor || base.auxFontColor,
      time: typeof s.time === "number" ? s.time : null,
    };
  });
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

function toOpaqueHex(color: string): string {
  if (typeof color !== "string") return "#ffffff";
  if (/^#[0-9a-fA-F]{8}$/.test(color)) return color.slice(0, 7);
  return color;
}

export default defineComponent({
  name: "MusicEditorModule",
  components: {
    ModuleHeader,
    ButtonScreen,
    LSlide,
    ModernColorPicker,
  },
  data() {
    return {
      slidesInput: [DEFAULT_SLIDE()] as EditorSlide[],
      activeSlideIndex: 0,
      ribbonTab: "file" as "file" | "slides" | "format",
      currentFilePath: null as string | null,
      recordingMode: false,
      externalAudioFilePath: null as string | null,
      externalAudioFileName: "",
      externalInstrumentalFilePath: null as string | null,
      externalInstrumentalFileName: "",
      presentingSong: null as PresentedSong | null,
      presentSlideIndex: 0,
      showSlideList: true,
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

    mode(): "edit" | "present" {
      return this.presentingSong ? "present" : "edit";
    },
    nameInput(): string {
      return (this.slidesInput[0]?.text || "").trim();
    },
    headerTitle(): string {
      if (this.mode === "present") return this.presentingSong?.name || "";
      return this.nameInput || this.t("new_song");
    },
    ribbonTabs(): { key: "file" | "slides" | "format"; label: string }[] {
      return [
        { key: "file", label: this.t("ribbon_tab_file") },
        { key: "slides", label: this.t("ribbon_tab_slides") },
        { key: "format", label: this.t("ribbon_tab_format") },
      ];
    },
    canSave(): boolean {
      return !!this.nameInput.trim();
    },
    currentFileName(): string {
      return this.currentFilePath ? this.currentFilePath.split(/[\\/]/).pop() || "" : "";
    },
    activeSlide(): EditorSlide {
      return this.slidesInput[this.activeSlideIndex] || this.slidesInput[0];
    },
    activeSlideFormattedText(): string {
      return formatSlideText(this.activeSlide?.text || "");
    },
    activeSlideFormattedAuxText(): string {
      return formatSlideText(this.activeSlide?.auxText || "");
    },
    activeSlideImageUrl(): string {
      return toLocalFileUrl(this.activeSlide?.image || null);
    },
    externalMediaCurrentTime(): number {
      return (this as any).$appdata.get("modules.external_media.config.current_time") || 0;
    },
    isPreviewingThisAudio(): boolean {
      const appdata = (this as any).$appdata;
      return !!this.externalAudioFilePath && appdata.get("modules.external_media.filePath") === this.externalAudioFilePath;
    },
    hasRecordedTimes(): boolean {
      return this.slidesInput.some((s) => typeof s.time === "number");
    },
    activeSlideProgress(): number {
      // O slide 1 sempre começa implicitamente em 0 (nunca tem tempo gravado).
      const start = typeof this.activeSlide?.time === "number"
        ? this.activeSlide.time
        : this.activeSlideIndex === 0 ? 0 : null;
      if (start === null) return 0;
      const next = this.slidesInput[this.activeSlideIndex + 1]?.time;
      const duration = (this as any).$appdata.get("modules.external_media.config.duration") || 0;
      const end = typeof next === "number" ? next : duration;
      if (end <= start) return 0;
      const progress = ((this.externalMediaCurrentTime - start) / (end - start)) * 100;
      return Math.min(100, Math.max(0, progress));
    },
    currentSlideText(): string {
      if (!this.presentingSong) return "";
      return formatSlideText(this.presentingSong.slides[this.presentSlideIndex]?.text || "");
    },
    currentSlideAuxText(): string {
      if (!this.presentingSong) return "";
      return formatSlideText(this.presentingSong.slides[this.presentSlideIndex]?.auxText || "");
    },
    currentSlideImageUrl(): string {
      if (!this.presentingSong) return "";
      return toLocalFileUrl(this.presentingSong.slides[this.presentSlideIndex]?.image || null);
    },
    currentSlideData(): EditorSlide | null {
      if (!this.presentingSong) return null;
      return this.presentingSong.slides[this.presentSlideIndex] || null;
    },
    presentActiveMode(): "audio" | "instrumental" | null {
      if (!this.presentingSong) return null;
      const activePath = (this as any).$appdata.get("modules.external_media.filePath");
      if (!activePath) return null;
      if (activePath === this.presentingSong.filePathAudio) return "audio";
      if (activePath === this.presentingSong.filePathInstrumental) return "instrumental";
      return null;
    },
    presentIsPaused(): boolean {
      return (this as any).$appdata.get("modules.external_media.config.is_paused") !== false;
    },
    presentCurrentTime(): number {
      return (this as any).$appdata.get("modules.external_media.config.current_time") || 0;
    },
    presentDuration(): number {
      return (this as any).$appdata.get("modules.external_media.config.duration") || 0;
    },
    presentProgress: {
      get(): number {
        return (this as any).$appdata.get("modules.external_media.config.progress") || 0;
      },
      set(val: number) {
        (this as any).$appdata.set("modules.external_media.config.progress", val);
      },
    },
    presentVolume(): number {
      return (this as any).$appdata.get("modules.external_media.config.volume") ?? 100;
    },
    presentVolumeIcon(): string {
      const v = this.presentVolume;
      if (v <= 0) return "mdi-volume-mute";
      if (v <= 20) return "mdi-volume-low";
      if (v <= 70) return "mdi-volume-medium";
      return "mdi-volume-high";
    },
  },
  watch: {
    "module.show"(val: boolean) {
      if (val) {
        this.openNewSong();
      } else if (this.presentingSong) {
        this.exitPresentation();
      }
    },
    externalMediaCurrentTime(val: number) {
      if (this.mode !== "edit" || this.recordingMode || !this.isPreviewingThisAudio || !this.hasRecordedTimes) return;
      let bestIndex = -1;
      let bestTime = -1;
      this.slidesInput.forEach((s, index) => {
        if (typeof s.time === "number" && s.time <= val && s.time > bestTime) {
          bestTime = s.time;
          bestIndex = index;
        }
      });
      if (bestIndex >= 0 && bestIndex !== this.activeSlideIndex) {
        this.activeSlideIndex = bestIndex;
      }
    },
    activeSlideIndex() {
      this.scrollActiveSlideIntoView();
    },
    presentCurrentTime(val: number) {
      if (this.mode !== "present" || !this.presentingSong) return;
      let bestIndex = -1;
      let bestTime = -1;
      this.presentingSong.slides.forEach((s, index) => {
        if (typeof s.time === "number" && s.time <= val && s.time > bestTime) {
          bestTime = s.time;
          bestIndex = index;
        }
      });
      if (bestIndex >= 0 && bestIndex !== this.presentSlideIndex) {
        this.presentSlideIndex = bestIndex;
        this.syncSlideToScreen();
      }
    },
    presentSlideIndex() {
      this.$nextTick(() => {
        const panel = this.$refs.presentPlaylistPanel as HTMLElement | undefined;
        if (!panel) return;
        const row = panel.querySelector(`[data-slide-index="${this.presentSlideIndex}"]`);
        if (row) {
          row.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      });
    },
  },
  mounted() {
    if (this.module?.show) {
      this.openNewSong();
    }
    window.addEventListener("keydown", this.handlePresentKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handlePresentKeydown);
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string, params?: any[]): string {
      return (this as any).$t(`modules.${this.module_id}.${text}`, params || []);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    scrollActiveSlideIntoView() {
      this.$nextTick(() => {
        const panel = this.$refs.slidesListPanel as HTMLElement | undefined;
        if (!panel) return;
        const row = panel.querySelector(`[data-slide-index="${this.activeSlideIndex}"]`);
        if (row) {
          row.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      });
    },

    slideRowLabel(slide: EditorSlide): string {
      const text = (slide.text || "").trim().split("\n")[0];
      if (!text) return this.t("empty_slide");
      return text.length > 28 ? `${text.slice(0, 28)}...` : text;
    },

    openNewSong() {
      this.slidesInput = [DEFAULT_SLIDE()];
      this.activeSlideIndex = 0;
      this.ribbonTab = "file";
      this.currentFilePath = null;
      this.resetExternalPick();
    },
    clearAll() {
      (this as any).$alert.yesno(
        { text: this.t("clear_all_confirm"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            this.openNewSong();
          }
        },
      );
    },
    hasSlideContent(s: EditorSlide): boolean {
      return s.text.trim().length > 0 || s.auxText.trim().length > 0 || !!s.image;
    },
    buildFileData() {
      return {
        type: "lja-song",
        version: 1,
        name: this.nameInput.trim(),
        slides: this.slidesInput
          .map((s) => ({ ...s, text: s.text.trim(), auxText: s.auxText.trim() }))
          .filter((s) => this.hasSlideContent(s)),
        filePathAudio: this.externalAudioFilePath,
        filePathInstrumental: this.externalInstrumentalFilePath,
      };
    },
    buildSljaSlides() {
      const slides = this.slidesInput
        .map((s) => ({ ...s, text: s.text.trim(), auxText: s.auxText.trim() }))
        .filter((s) => this.hasSlideContent(s));
      return slides.map((s, index) => ({
        tipo: index === 0 ? "CAPA" : "LETRA",
        letra: s.text.replace(/\r?\n/g, "|"),
        letraAux: s.auxText.replace(/\r?\n/g, "|"),
        fundoLetra: 1,
        tamanhoLetra: s.fontSize,
        corLetra: toOpaqueHex(s.fontColor),
        corFundo: "#000000",
        tamanhoLetraAux: s.auxFontSize,
        corLetraAux: toOpaqueHex(s.auxFontColor),
        imagemSourcePath: s.image,
        imagemPosicao: 5,
        tempo: typeof s.time === "number" ? Math.round(s.time * 1000000) : 0,
      }));
    },
    async openFile() {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.openFileDialog) return;

      const filePath = await electronAPI.openFileDialog({
        title: this.t("ribbon_open"),
        filters: LJA_OPEN_FILTERS,
      });
      if (!filePath) return;

      const isLegacyReference = (filePath as string).toLowerCase().endsWith(".lja");

      if (isLegacyReference) {
        if (!electronAPI?.readTextFile) return;
        const content = await electronAPI.readTextFile(filePath);
        if (!content) {
          (this as any).$alert.error({ text: this.t("file_open_error"), translate: false });
          return;
        }
        try {
          const data = JSON.parse(content);
          this.externalAudioFilePath = data.filePathAudio || null;
          this.externalInstrumentalFilePath = data.filePathInstrumental || null;
          this.externalAudioFileName = this.externalAudioFilePath ? this.externalAudioFilePath.split(/[\\/]/).pop() || "" : "";
          this.externalInstrumentalFileName = this.externalInstrumentalFilePath ? this.externalInstrumentalFilePath.split(/[\\/]/).pop() || "" : "";
          this.slidesInput = normalizeSlides(Array.isArray(data.slides) ? data.slides : []);
          this.activeSlideIndex = 0;
          this.currentFilePath = filePath;
          this.ribbonTab = "file";
        } catch (e) {
          (this as any).$alert.error({ text: this.t("file_open_error"), translate: false });
        }
        return;
      }

      if (!electronAPI?.readSljaZip) return;
      const data = await electronAPI.readSljaZip(filePath);
      if (!data) {
        (this as any).$alert.error({ text: this.t("file_open_error"), translate: false });
        return;
      }
      this.externalAudioFilePath = data.audioPath || null;
      this.externalInstrumentalFilePath = data.instrumentalPath || null;
      this.externalAudioFileName = this.externalAudioFilePath ? this.externalAudioFilePath.split(/[\\/]/).pop() || "" : "";
      this.externalInstrumentalFileName = this.externalInstrumentalFilePath ? this.externalInstrumentalFilePath.split(/[\\/]/).pop() || "" : "";
      this.slidesInput = normalizeSlides(data.slides);
      this.activeSlideIndex = 0;
      this.currentFilePath = filePath;
      this.ribbonTab = "file";
    },
    async saveDocument() {
      const name = this.nameInput.trim();
      if (!name) {
        (this as any).$alert.show({ text: this.t("name_required"), translate: false });
        return;
      }
      const slides = this.slidesInput.filter((s) => this.hasSlideContent(s));
      if (slides.length === 0) {
        (this as any).$alert.show({ text: this.t("slides_required"), translate: false });
        return;
      }
      if (!this.currentFilePath) {
        await this.saveFileAs();
        return;
      }
      const electronAPI = (window as any).electronAPI;
      const isLegacyReference = this.currentFilePath.toLowerCase().endsWith(".lja");

      if (isLegacyReference) {
        if (!electronAPI?.writeTextFile) return;
        const ok = await electronAPI.writeTextFile(this.currentFilePath, JSON.stringify(this.buildFileData(), null, 2));
        if (!ok) {
          (this as any).$alert.error({ text: this.t("file_save_error"), translate: false });
        }
        return;
      }

      if (!electronAPI?.writeSljaZip) return;
      const ok = await electronAPI.writeSljaZip({
        filePath: this.currentFilePath,
        slides: this.buildSljaSlides(),
        audioSourcePath: this.externalAudioFilePath,
        instrumentalSourcePath: this.externalInstrumentalFilePath,
      });
      if (!ok) {
        (this as any).$alert.error({ text: this.t("file_save_error"), translate: false });
      }
    },
    async saveFileAs() {
      const name = this.nameInput.trim();
      if (!name) {
        (this as any).$alert.show({ text: this.t("name_required"), translate: false });
        return;
      }
      const slides = this.slidesInput.filter((s) => this.hasSlideContent(s));
      if (slides.length === 0) {
        (this as any).$alert.show({ text: this.t("slides_required"), translate: false });
        return;
      }
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.saveFileDialog || !electronAPI?.writeSljaZip) return;

      const filePath = await electronAPI.saveFileDialog({
        title: this.t("ribbon_save_as"),
        defaultPath: `${name}.slja`,
        filters: SLJA_SAVE_FILTERS,
      });
      if (!filePath) return;

      const ok = await electronAPI.writeSljaZip({
        filePath,
        slides: this.buildSljaSlides(),
        audioSourcePath: this.externalAudioFilePath,
        instrumentalSourcePath: this.externalInstrumentalFilePath,
      });
      if (ok) {
        this.currentFilePath = filePath;
      } else {
        (this as any).$alert.error({ text: this.t("file_save_error"), translate: false });
      }
    },
    async importTextFile() {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.openFileDialog || !electronAPI?.readTextFile) return;

      const filePath = await electronAPI.openFileDialog({
        title: this.t("ribbon_import"),
        filters: TXT_FILTERS,
      });
      if (!filePath) return;

      const content = await electronAPI.readTextFile(filePath);
      if (!content) {
        (this as any).$alert.error({ text: this.t("file_open_error"), translate: false });
        return;
      }
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return;

      this.slidesInput = lines.map((l) => ({ ...DEFAULT_SLIDE(), text: l }));
      this.activeSlideIndex = 0;
    },
    addSlide() {
      this.slidesInput.push(DEFAULT_SLIDE());
      this.activeSlideIndex = this.slidesInput.length - 1;
    },
    duplicateSlide() {
      const copy = { ...this.activeSlide };
      this.slidesInput.splice(this.activeSlideIndex + 1, 0, copy);
      this.activeSlideIndex += 1;
    },
    removeSlide(index: number) {
      if (this.slidesInput.length <= 1) return;
      this.slidesInput.splice(index, 1);
      if (this.activeSlideIndex >= this.slidesInput.length) {
        this.activeSlideIndex = this.slidesInput.length - 1;
      }
    },
    goToFirstSlide() {
      this.activeSlideIndex = 0;
    },
    goToLastSlide() {
      this.activeSlideIndex = this.slidesInput.length - 1;
    },
    goToPrevSlide() {
      if (this.activeSlideIndex > 0) this.activeSlideIndex--;
    },
    goToNextSlide() {
      if (this.activeSlideIndex < this.slidesInput.length - 1) this.activeSlideIndex++;
    },
    resetExternalPick() {
      this.externalAudioFilePath = null;
      this.externalAudioFileName = "";
      this.externalInstrumentalFilePath = null;
      this.externalInstrumentalFileName = "";
    },
    previewAudio() {
      if (!this.externalAudioFilePath) return;
      this.recordingMode = false;
      const appdata = (this as any).$appdata;
      if (appdata.get("modules.media.id_music")) {
        (this as any).$media.close(true);
      }
      appdata.set("modules.external_media.filePath", this.externalAudioFilePath);
      appdata.set("modules.external_media.title", this.nameInput.trim() || this.t("new_song"));
      appdata.set("modules.external_media.subtitle", "");
      appdata.set("modules.external_media.minimized", true);
      appdata.set("modules.external_media.show", false);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
      });
    },
    recordAndAdvance() {
      if (!this.externalAudioFilePath) return;
      if (!this.isPreviewingThisAudio) {
        this.previewAudio();
        this.recordingMode = true;
        return;
      }
      this.recordingMode = true;
      // O tempo é gravado no PRÓXIMO slide (o que está prestes a aparecer), não no atual —
      // o slide 1 sempre começa em 0 implicitamente, sem precisar de tempo gravado.
      if (this.activeSlideIndex < this.slidesInput.length - 1) {
        this.activeSlideIndex++;
        this.activeSlide.time = this.externalMediaCurrentTime;
      }
    },
    resetRecordedTimes() {
      this.slidesInput.forEach((s) => { s.time = null; });
    },
    async pickExternalFile(kind: "audio" | "instrumental") {
      if (this.mode === "present") {
        this.playExternalFile(kind);
        return;
      }
      if (!(window as any).electronAPI?.openFileDialog) return;
      const filePath = await (window as any).electronAPI.openFileDialog({
        title: kind === "audio" ? this.t("external_audio_file") : this.t("external_instrumental_file"),
        filters: AUDIO_FILTERS,
      });
      if (!filePath) return;
      const fileName = (filePath as string).split(/[\\/]/).pop() || "";
      if (kind === "audio") {
        this.externalAudioFilePath = filePath as string;
        this.externalAudioFileName = fileName;
      } else {
        this.externalInstrumentalFilePath = filePath as string;
        this.externalInstrumentalFileName = fileName;
      }
    },
    async pickSlideImage() {
      if (!(window as any).electronAPI?.openFileDialog) return;
      const filePath = await (window as any).electronAPI.openFileDialog({
        title: this.t("format_image"),
        filters: IMAGE_FILTERS,
      });
      if (!filePath) return;
      this.activeSlide.image = filePath as string;
    },
    removeSlideImage() {
      this.activeSlide.image = null;
    },
    applyImageToAllSlides() {
      const image = this.activeSlide?.image;
      if (!image) return;
      this.slidesInput.forEach((s) => { s.image = image; });
    },
    applyImageToFollowingSlides() {
      const image = this.activeSlide?.image;
      if (!image) return;
      for (let i = this.activeSlideIndex; i < this.slidesInput.length; i++) {
        this.slidesInput[i].image = image;
      }
    },

    startPresentation() {
      const slides = this.slidesInput
        .map((s) => ({ ...s, text: s.text.trim(), auxText: s.auxText.trim() }))
        .filter((s) => this.hasSlideContent(s));
      if (slides.length === 0) {
        (this as any).$alert.show({ text: this.t("slides_required"), translate: false });
        return;
      }
      this.presentingSong = {
        name: this.nameInput.trim() || this.t("new_song"),
        slides,
        filePathAudio: this.externalAudioFilePath,
        filePathInstrumental: this.externalInstrumentalFilePath,
      };
      this.presentSlideIndex = Math.min(this.activeSlideIndex, slides.length - 1);
      this.syncSlideToScreen();
    },
    syncSlideToScreen() {
      (this as any).$appdata.set("modules.music_editor.data", {
        text: this.currentSlideText,
        auxText: this.currentSlideAuxText,
        image: this.currentSlideImageUrl,
        fontSize: this.currentSlideData?.fontSize,
        fontColor: this.currentSlideData?.fontColor,
        auxFontSize: this.currentSlideData?.auxFontSize,
        auxFontColor: this.currentSlideData?.auxFontColor,
      });
    },
    nextSlide() {
      if (!this.presentingSong) return;
      if (this.presentSlideIndex >= this.presentingSong.slides.length - 1) return;
      this.presentSlideIndex++;
      this.syncSlideToScreen();
    },
    prevSlide() {
      if (this.presentSlideIndex <= 0) return;
      this.presentSlideIndex--;
      this.syncSlideToScreen();
    },
    handlePresentKeydown(e: KeyboardEvent) {
      if (this.mode !== "present") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        this.prevSlide();
      }
    },
    exitPresentation() {
      const appdata = (this as any).$appdata;
      if (appdata.get("popup_module") === this.module_id) {
        (this as any).$popup.exit();
      }
      appdata.set("modules.music_editor.data", null);
      this.presentingSong = null;
    },
    playExternalFile(mode: "audio" | "instrumental") {
      if (!this.presentingSong) return;
      const filePath = mode === "audio" ? this.presentingSong.filePathAudio : this.presentingSong.filePathInstrumental;
      if (!filePath) return;

      const appdata = (this as any).$appdata;
      if (appdata.get("modules.media.id_music")) {
        (this as any).$media.close(true);
      }
      appdata.set("modules.external_media.filePath", filePath);
      appdata.set("modules.external_media.title", this.presentingSong.name);
      appdata.set("modules.external_media.subtitle", mode === "instrumental" ? "Playback" : "");
      appdata.set("modules.external_media.minimized", false);
      appdata.set("modules.external_media.show", false);
      appdata.set("modules.external_media.config", {
        is_paused: true,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
      });
    },
    goToPresentSlide(index: number) {
      const slide = this.presentingSong?.slides[index];
      this.presentSlideIndex = index;
      this.syncSlideToScreen();
      if (slide && typeof slide.time === "number" && this.presentDuration > 0) {
        const percent = Math.min(100, Math.max(0, (slide.time / this.presentDuration) * 100));
        const appdata = (this as any).$appdata;
        appdata.set("modules.external_media.config.current_time", slide.time);
        appdata.set("modules.external_media.config.request_action", {
          action: "seek",
          value: percent,
          timestamp: Date.now(),
        });
      }
    },
    formatPresentTime(seconds: number): string {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
    togglePresentPlayPause() {
      if (!this.presentActiveMode) {
        if (this.presentingSong?.filePathAudio) {
          this.playExternalFile("audio");
        } else if (this.presentingSong?.filePathInstrumental) {
          this.playExternalFile("instrumental");
        }
        return;
      }
      (this as any).$appdata.set("modules.external_media.config.request_action", {
        action: "toggle_play",
        timestamp: Date.now(),
      });
    },
    togglePresentMode() {
      if (!this.presentingSong) return;
      const next = this.presentActiveMode === "audio" ? "instrumental" : "audio";
      const targetPath = next === "audio" ? this.presentingSong.filePathAudio : this.presentingSong.filePathInstrumental;
      if (!targetPath) return;
      this.playExternalFile(next);
    },
    seekPresentProgress() {
      if (!this.presentDuration) return;
      const appdata = (this as any).$appdata;
      const time = (this.presentDuration * this.presentProgress) / 100;
      appdata.set("modules.external_media.config.current_time", time);
      appdata.set("modules.external_media.config.request_action", {
        action: "seek",
        value: this.presentProgress,
        timestamp: Date.now(),
      });
    },
    togglePresentMute() {
      const appdata = (this as any).$appdata;
      const nextVolume = this.presentVolume > 0 ? 0 : 100;
      appdata.set("modules.external_media.config.volume", nextVolume);
      appdata.set("modules.external_media.config.request_action", {
        action: "set_volume",
        value: nextVolume,
        timestamp: Date.now(),
      });
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

.music-editor-module {
  /* Compact ribbon (docked in the header, top-right) */
  .compact-ribbon {
    gap: 4px;
  }

  .compact-ribbon-tabs {
    gap: 4px;
  }

  .ribbon-tab-btn {
    background: none;
    border: none;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--sidebar-text-secondary);
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      color: var(--sidebar-text);
    }

    &.active {
      color: var(--accent-blue);
      background: rgba(var(--v-theme-primary), 0.12);
    }
  }

  .compact-ribbon-toolbar {
    gap: 2px;
    min-height: 40px;
  }

  .compact-ribbon-divider {
    width: 1px;
    height: 24px;
    background: var(--border-color);
    margin: 0 4px;
  }

  .compact-format-field {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px;
  }

  .ribbon-number-input {
    width: 44px;
    background: var(--main-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--sidebar-text);
    font-size: 12px;
    padding: 2px 4px;
  }

  /* Editor workspace */
  .editor-workspace {
    overflow: hidden;
  }

  .editor-left-panel {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background: var(--card-bg);
  }

  .panel-section {
    padding: 12px 16px;
  }

  .panel-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--sidebar-text-secondary);
    margin-bottom: 6px;
  }

  .slides-list-panel {
    flex: 1;
    overflow-y: auto;
  }

  .slide-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    overflow: hidden;

    &:hover {
      background: var(--sidebar-hover);
    }

    &.active {
      background: var(--accent-blue);

      .slide-num,
      .slide-label {
        color: white;
      }
    }

    .slide-num {
      font-weight: 700;
      font-size: 15px;
      min-width: 18px;
      color: var(--accent-blue);
    }

    .slide-label {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      color: var(--sidebar-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-transform: uppercase;
    }

    .slide-time-indicator {
      flex-shrink: 0;
    }

    .slide-progress-track {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.25);
    }

    .slide-progress-fill {
      height: 100%;
      background: rgb(var(--v-theme-success));
      transition: width 0.15s linear;
    }
  }

  .editor-preview-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: #000;
  }

  .editor-preview-toolbar {
    flex-shrink: 0;
    gap: 2px;
    padding: 4px 12px;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
  }

  .editor-preview-canvas {
    flex: 1;
    position: relative;
  }

  .editor-preview-controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(15, 15, 20, 0.55);
    backdrop-filter: blur(28px) saturate(160%);
    -webkit-backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 5;
  }

  .preview-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: white;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    &:disabled {
      opacity: 0.35;
      cursor: default;
    }
  }

  .preview-slide-count {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    min-width: 90px;
    text-align: center;
  }

  /* Native player look (present mode) */
  .native-player-container {
    height: 100%;
    background: #000;
  }

  .native-player-visual {
    height: 100%;
  }

  .native-player-toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    padding: 6px 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .native-system-btn {
    border-radius: 50% !important;
    width: 32px !important;
    height: 32px !important;
    margin: 0 4px;
    background: transparent !important;
    color: white !important;
    box-shadow: none !important;

    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
    }
  }

  .native-player-playlist {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 0;
    opacity: 0;
    z-index: 40;
    overflow: hidden;
    background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
    transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s;

    &.open {
      width: 340px;
      opacity: 1;
    }
  }

  .native-playlist-scroll {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 56px 16px 90px;
  }

  .native-playlist-item {
    display: flex;
    align-items: center;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    padding: 12px 16px;
    margin-bottom: 12px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transform: translateX(-4px);
    }

    &.active {
      background: rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.4);
      transform: translateX(-8px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

      .native-slide-chip {
        background: white;
        color: black;
      }

      .native-slide-text {
        color: white;
        font-weight: 600;
      }
    }
  }

  .native-slide-chip {
    width: 28px;
    height: 28px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin-right: 14px;
    flex-shrink: 0;
  }

  .native-slide-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
  }

  .native-player-footer {
    bottom: 32px;
    z-index: 60;
    pointer-events: none;
  }

  .native-footer-pill {
    pointer-events: auto;
    background: rgba(15, 15, 20, 0.55);
    backdrop-filter: blur(28px) saturate(160%);
    -webkit-backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    min-height: 60px;
    max-width: calc(100% - 48px);

    .v-btn .v-icon {
      color: white;
    }
  }

  .native-player-info {
    max-width: 220px;
    min-width: 140px;
  }

  .native-play-btn {
    transform: scale(1.1);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: scale(1.25);
    }
  }

  .native-timeline {
    min-width: 150px;
  }

  .native-timeline-slider {
    cursor: pointer;

    &.v-input {
      margin: 0;
    }

    :deep(.v-input__control) {
      min-height: 0;
    }

    :deep(.v-slider-track__background),
    :deep(.v-slider-track__fill) {
      height: 4px;
    }

    :deep(.v-slider-thumb__surface) {
      width: 12px;
      height: 12px;
    }
  }
}
</style>
