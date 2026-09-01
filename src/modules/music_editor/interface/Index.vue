<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page music-editor-module d-flex flex-column">
      <!-- ========================================== -->
      <!-- HEADER / MODULE HEADER                    -->
      <!-- ========================================== -->
      <ModuleHeader v-if="mode === 'edit'" :title="headerTitle" icon="mdi-music-note-plus">
        <div class="editor-header-controls">
          <div class="editor-tools-group d-flex flex-wrap justify-end align-center" style="gap: 8px;">
            <!-- Segmented Tab Navigation -->
            <div class="editor-tabs-pill d-flex align-center flex-shrink-0">
              <button
                v-for="tabItem in ribbonTabs"
                :key="tabItem.key"
                type="button"
                class="editor-tab-btn"
                :class="{ active: ribbonTab === tabItem.key }"
                @click="ribbonTab = tabItem.key"
              >
                <v-icon :icon="tabItem.icon" size="16" class="mr-1" />
                {{ tabItem.label }}
              </button>
            </div>

            <!-- Contextual Action Bar -->
            <div class="editor-actions-pill d-flex align-center flex-shrink-0">
              <!-- TAB: ARQUIVO -->
              <template v-if="ribbonTab === 'file'">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="openNewSong"
                >
                  <v-icon icon="mdi-file-plus-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('ribbon_new') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="currentFilePath ? 'var(--accent-blue)' : undefined"
                  @click="openFile"
                >
                  <v-icon icon="mdi-folder-open-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ currentFilePath ? currentFileName : t('ribbon_open') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="importTextFile"
                >
                  <v-icon icon="mdi-file-import-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('ribbon_import') }}
                  </v-tooltip>
                </v-btn>

                <div class="pill-divider" />

                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="externalAudioFilePath ? 'var(--accent-blue)' : undefined"
                  @click="pickExternalFile('audio')"
                >
                  <v-icon icon="mdi-file-music" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ externalAudioFilePath ? externalAudioFileName : t('external_audio_file') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="externalInstrumentalFilePath ? 'var(--accent-blue)' : undefined"
                  @click="pickExternalFile('instrumental')"
                >
                  <v-icon icon="mdi-file-music-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ externalInstrumentalFilePath ? externalInstrumentalFileName : t('external_instrumental_file') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  v-if="externalAudioFilePath || externalInstrumentalFilePath"
                  icon
                  variant="text"
                  size="small"
                  class="text-error"
                  @click="resetExternalPick"
                >
                  <v-icon icon="mdi-music-note-off-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('ribbon_remove_audio') }}
                  </v-tooltip>
                </v-btn>

                <div class="pill-divider" />

                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="saveFileAs"
                >
                  <v-icon icon="mdi-content-save-move-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('ribbon_save_as') }}
                  </v-tooltip>
                </v-btn>
              </template>

              <!-- TAB: FORMATAÇÃO -->
              <template v-if="ribbonTab === 'format'">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="activeSlide?.image ? 'var(--accent-blue)' : undefined"
                  @click="pickSlideImage"
                >
                  <v-icon icon="mdi-image-plus-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('format_image') }}
                  </v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  class="text-error"
                  :disabled="!activeSlide?.image"
                  @click="removeSlideImage"
                >
                  <v-icon icon="mdi-image-remove-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
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
                  <v-icon icon="mdi-arrow-right-bold-box-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
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
                  <v-icon icon="mdi-view-grid-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('format_all_slides') }}
                  </v-tooltip>
                </v-btn>

                <div class="pill-divider" />

                <!-- Main Font Size & Color -->
                <div class="format-inline-control d-flex align-center">
                  <v-icon icon="mdi-format-size" size="16" class="mr-1 opacity-70" />
                  <input
                    v-model.number="activeSlide.fontSize"
                    type="number"
                    min="1"
                    max="100"
                    class="format-stepper-input"
                  />
                  <ModernColorPicker v-model="activeSlide.fontColor">
                    <template #activator="{ props: colorProps }">
                      <div
                        v-bind="colorProps"
                        class="color-dot-indicator cursor-pointer ml-1.5"
                        :style="{ background: activeSlide.fontColor }"
                      />
                    </template>
                  </ModernColorPicker>
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('main_text') }} ({{ t('font_size') }} / {{ t('font_color') }})
                  </v-tooltip>
                </div>

                <!-- Aux Font Size & Color -->
                <div class="format-inline-control d-flex align-center ml-2">
                  <v-icon icon="mdi-subtitles-outline" size="14" class="mr-1 opacity-70" />
                  <input
                    v-model.number="activeSlide.auxFontSize"
                    type="number"
                    min="1"
                    max="100"
                    class="format-stepper-input"
                  />
                  <ModernColorPicker v-model="activeSlide.auxFontColor">
                    <template #activator="{ props: auxColorProps }">
                      <div
                        v-bind="auxColorProps"
                        class="color-dot-indicator cursor-pointer ml-1.5"
                        :style="{ background: activeSlide.auxFontColor }"
                      />
                    </template>
                  </ModernColorPicker>
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('aux_text') }} ({{ t('aux_font_size') }} / {{ t('aux_font_color') }})
                  </v-tooltip>
                </div>
              </template>

              <!-- TAB: SINCRONIA -->
              <template v-if="ribbonTab === 'sync'">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :disabled="!externalAudioFilePath"
                  :color="isPreviewingThisAudio ? 'var(--accent-blue)' : undefined"
                  @click="previewAudio"
                >
                  <v-icon :icon="isPreviewingThisAudio && !externalMediaIsPaused ? 'mdi-pause' : 'mdi-play'" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('ribbon_play') }}
                  </v-tooltip>
                </v-btn>

                <v-btn
                  variant="flat"
                  size="small"
                  rounded="lg"
                  color="var(--accent-blue)"
                  class="px-3 text-none font-weight-bold"
                  :disabled="!externalAudioFilePath"
                  @click="recordAndAdvance"
                >
                  <v-icon icon="mdi-microphone-plus" start size="18" />
                  {{ t('ribbon_record_advance') }}
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    Avança e grava o timestamp para o próximo slide
                  </v-tooltip>
                </v-btn>

                <div class="pill-divider" />

                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :disabled="!hasRecordedTimes"
                  @click="resetRecordedTimes"
                >
                  <v-icon icon="mdi-restore" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('ribbon_record_start') }}
                  </v-tooltip>
                </v-btn>

                <v-btn
                  icon
                  variant="text"
                  size="small"
                  class="text-error"
                  @click="clearAll"
                >
                  <v-icon icon="mdi-delete-outline" size="20" />
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ t('clear_all') }}
                  </v-tooltip>
                </v-btn>
              </template>
            </div>
          </div>
          <!-- Fim do grupo (Tabs e Actions) -->

          <!-- Primary Actions (Save & Present) -->
          <div class="editor-primary-actions d-flex align-center" style="gap: 8px;">
            <v-btn
              :color="canSave ? 'primary' : undefined"
              :variant="canSave ? 'flat' : 'tonal'"
              rounded="lg"
              class="editor-save-btn text-none font-weight-bold px-4"
              :disabled="!canSave"
              @click="saveDocument"
            >
              <v-icon
                icon="mdi-content-save"
                start
                size="18"
              />
              {{ t('save') }}
            </v-btn>

            <v-btn
              variant="tonal"
              color="primary"
              rounded="lg"
              class="editor-present-btn text-none font-weight-bold px-4"
              @click="startPresentation"
            >
              <v-icon
                icon="mdi-play-circle"
                start
                size="18"
              />
              {{ t('present') }}
            </v-btn>
          </div>
        </div>
      </ModuleHeader>

      <!-- ========================================== -->
      <!-- MAIN WORKSPACE CONTENT                     -->
      <!-- ========================================== -->
      <div class="content-main flex-grow-1 w-100 d-flex flex-column" style="overflow: hidden; padding: 20px 24px; min-height: 0;">
        <!-- EDIT MODE -->
        <template v-if="mode === 'edit'">
          <div class="editor-layout-grid d-flex flex-row flex-grow-1 w-100" style="min-height: 0; gap: 20px;">
            <!-- ========================================== -->
            <!-- LEFT PANEL: Text Editor & Slides List     -->
            <!-- ========================================== -->
            <div class="editor-sidebar-panel d-flex flex-column">
              <!-- TOP CARD: Slide Text Editor -->
              <div class="editor-glass-card slide-text-card pa-4 mb-4">
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center">
                    <v-icon
                      icon="mdi-format-text"
                      size="18"
                      color="var(--accent-blue)"
                      class="mr-2"
                    />
                    <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                      {{ t('lyrics_editor') }}
                    </span>
                  </div>
                  <v-chip
                    size="x-small"
                    color="primary"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ t('slide_label') }} {{ activeSlideIndex + 1 }}
                  </v-chip>
                </div>

                <!-- Main Textarea -->
                <div class="mb-3">
                  <div class="input-header-label d-flex align-center justify-space-between mb-1.5">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text-secondary);">
                      {{ t('main_text') }}
                    </span>
                    <button
                      v-if="activeSlide.text"
                      type="button"
                      class="clear-input-link"
                      @click="activeSlide.text = ''"
                    >
                      Limpar
                    </button>
                  </div>
                  <v-textarea
                    v-model="activeSlide.text"
                    :placeholder="t('slide_placeholder')"
                    variant="solo"
                    density="comfortable"
                    rounded="lg"
                    rows="3"
                    auto-grow
                    hide-details
                    class="editor-modern-textarea"
                  />
                </div>

                <!-- Aux Textarea -->
                <div v-if="activeSlideIndex !== 0">
                  <div class="input-header-label d-flex align-center justify-space-between mb-1.5">
                    <span class="text-caption font-weight-bold" style="color: var(--sidebar-text-secondary);">
                      {{ t('aux_text') }}
                    </span>
                    <button
                      v-if="activeSlide.auxText"
                      type="button"
                      class="clear-input-link"
                      @click="activeSlide.auxText = ''"
                    >
                      Limpar
                    </button>
                  </div>
                  <v-textarea
                    v-model="activeSlide.auxText"
                    :placeholder="t('aux_text_placeholder')"
                    variant="solo"
                    density="comfortable"
                    rounded="lg"
                    rows="2"
                    auto-grow
                    hide-details
                    class="editor-modern-textarea"
                  />
                </div>
              </div>

              <!-- BOTTOM CARD: Slide Navigator List -->
              <div class="editor-glass-card slides-playlist-card flex-grow-1 d-flex flex-column pa-4" style="min-height: 0;">
                <div class="d-flex align-center justify-space-between mb-3 flex-shrink-0">
                  <div class="d-flex align-center">
                    <v-icon
                      icon="mdi-view-carousel-outline"
                      size="18"
                      color="var(--accent-blue)"
                      class="mr-2"
                    />
                    <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                      {{ t('slides_list') }}
                    </span>
                  </div>
                  <div class="d-flex align-center" style="gap: 8px;">
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-medium"
                    >
                      {{ slidesInput.length }} {{ slidesInput.length === 1 ? 'slide' : 'slides' }}
                    </v-chip>
                    <v-btn
                      icon
                      variant="tonal"
                      size="x-small"
                      color="primary"
                      @click="addSlide"
                    >
                      <v-icon icon="mdi-plus" size="16" />
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium"
                      >
                        {{ t('add_slide') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>

                <!-- Scrollable Slide Items -->
                <div ref="slidesListPanel" class="slides-scroll-container flex-grow-1 pr-1">
                  <div
                    v-for="(slide, index) in slidesInput"
                    :key="index"
                    class="slide-item-card d-flex align-center mb-2"
                    :class="{ active: index === activeSlideIndex }"
                    :data-slide-index="index"
                    @click="activeSlideIndex = index"
                  >
                    <!-- Slide Number Chip -->
                    <div class="slide-item-chip d-flex align-center justify-center mr-3">
                      {{ index + 1 }}
                    </div>

                    <!-- Slide Text Info -->
                    <div class="slide-item-info flex-grow-1 text-truncate">
                      <div class="slide-item-title text-truncate font-weight-bold">
                        {{ slideRowLabel(slide) }}
                      </div>
                      <div class="slide-item-subtitle text-truncate">
                        {{ index === 0 ? (slide.text ? '' : t('empty_slide')) : (slide.auxText || (slide.text ? 'Sem texto auxiliar' : t('empty_slide'))) }}
                      </div>
                    </div>

                    <!-- Slide Image Badge / Thumbnail -->
                    <div v-if="slide.image" class="slide-item-image-badge mr-2">
                      <v-icon icon="mdi-image" size="16" color="var(--accent-blue)" />
                    </div>

                    <!-- Slide Timestamp Badge -->
                    <div v-if="typeof slide.time === 'number'" class="slide-item-time-badge mr-2 d-flex align-center">
                      <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                      <span>{{ formatTimeShort(slide.time) }}</span>
                    </div>

                    <!-- Actions on Hover -->
                    <div class="slide-item-actions d-flex align-center" @click.stop>
                      <v-btn
                        icon
                        variant="text"
                        size="x-small"
                        class="mx-0.5"
                        @click="duplicateSlideAt(index)"
                      >
                        <v-icon icon="mdi-content-duplicate" size="14" />
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-delay="300"
                          content-class="modern-glass-menu elevation-0 font-weight-medium"
                        >
                          {{ t('ribbon_duplicate_slide') }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        v-if="slidesInput.length > 1"
                        icon
                        variant="text"
                        size="x-small"
                        class="mx-0.5 text-error"
                        @click="removeSlide(index)"
                      >
                        <v-icon icon="mdi-close" size="14" />
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-delay="300"
                          content-class="modern-glass-menu elevation-0 font-weight-medium"
                        >
                          {{ t('ribbon_delete_slide') }}
                        </v-tooltip>
                      </v-btn>
                    </div>

                    <!-- Active Slide Progress Track -->
                    <div v-if="index === activeSlideIndex && isPreviewingThisAudio" class="slide-progress-track">
                      <div class="slide-progress-fill" :style="{ width: activeSlideProgress + '%' }" />
                    </div>
                  </div>
                </div>

                <!-- Add Slide Action Footer -->
                <div class="pt-2 flex-shrink-0">
                  <button
                    type="button"
                    class="add-slide-dashed-btn w-100 d-flex align-center justify-center py-2"
                    @click="addSlide"
                  >
                    <v-icon icon="mdi-plus" size="18" class="mr-1.5" />
                    <span class="text-body-2 font-weight-medium">{{ t('add_slide') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ========================================== -->
            <!-- RIGHT/CENTER: Slide Preview Canvas         -->
            <!-- ========================================== -->
            <div class="editor-preview-panel flex-grow-1 d-flex flex-column align-center justify-center position-relative">
              <!-- Widescreen Monitor Container -->
              <div class="preview-monitor-wrapper w-100 d-flex align-center justify-center">
                <div class="preview-monitor-card position-relative overflow-hidden">
                  <!-- Top Badges Overlay (Audio Tag Info) -->
                  <div
                    v-if="externalAudioFilePath"
                    class="preview-monitor-topbar position-absolute d-flex align-center px-4 py-3"
                    style="top: 0; left: 0; z-index: 10;"
                  >
                    <div class="preview-audio-tag d-flex align-center px-3 py-1">
                      <v-icon
                        icon="mdi-music"
                        size="14"
                        color="var(--accent-blue)"
                        class="mr-1.5"
                      />
                      <span class="text-caption font-weight-bold text-white text-truncate" style="max-width: 200px;">
                        {{ externalAudioFileName }}
                      </span>
                      <span v-if="isPreviewingThisAudio" class="ml-2 preview-live-dot" />
                    </div>
                  </div>

                  <!-- Live Slide Render -->
                  <div class="preview-slide-canvas w-100 h-100">
                    <LSlide
                      :text="activeSlideFormattedText"
                      :aux_text="activeSlideIndex === 0 ? '' : activeSlideFormattedAuxText"
                      :image="activeSlideImageUrl || undefined"
                      :text_size_pc="activeSlide?.fontSize"
                      :text_color="activeSlide?.fontColor"
                      :aux_text_size_pc="activeSlide?.auxFontSize"
                      :aux_text_color="activeSlide?.auxFontColor"
                      :cover="activeSlideIndex === 0"
                      force_image
                      class="w-100 h-100"
                    />
                  </div>

                  <!-- Floating Bottom Controller Pill -->
                  <div class="preview-floating-pill position-absolute d-flex align-center px-4 py-2" style="bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 20;">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="white"
                      class="mx-1"
                      :disabled="activeSlideIndex <= 0"
                      @click="goToFirstSlide"
                    >
                      <v-icon icon="mdi-skip-previous" size="18" />
                    </v-btn>

                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="white"
                      class="mx-1"
                      :disabled="activeSlideIndex <= 0"
                      @click="goToPrevSlide"
                    >
                      <v-icon icon="mdi-chevron-left" size="18" />
                    </v-btn>

                    <div class="preview-slide-counter px-3">
                      <span class="text-body-2 font-weight-bold text-white">
                        {{ activeSlideIndex + 1 }}
                      </span>
                      <span class="text-caption text-white opacity-60 mx-1">/</span>
                      <span class="text-caption text-white opacity-80">
                        {{ slidesInput.length }}
                      </span>
                    </div>

                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="white"
                      class="mx-1"
                      :disabled="activeSlideIndex >= slidesInput.length - 1"
                      @click="goToNextSlide"
                    >
                      <v-icon icon="mdi-chevron-right" size="18" />
                    </v-btn>

                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="white"
                      class="mx-1"
                      :disabled="activeSlideIndex >= slidesInput.length - 1"
                      @click="goToLastSlide"
                    >
                      <v-icon icon="mdi-skip-next" size="18" />
                    </v-btn>

                    <div class="pill-divider" style="height: 20px; margin: 0 8px; background: rgba(255,255,255,0.2);" />

                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="white"
                      class="mx-1"
                      @click="startPresentation"
                    >
                      <v-icon icon="mdi-fullscreen" size="18" />
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium"
                      >
                        {{ t('present') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ========================================== -->
        <!-- PRESENTATION / PLAYBACK VIEW               -->
        <!-- ========================================== -->
        <template v-if="mode === 'present'">
          <div class="native-player-container position-relative w-100 h-100 d-flex flex-row overflow-hidden rounded-xl">
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

            <!-- Slide Playlist Drawer (Present Mode) -->
            <div class="native-player-playlist" :class="{ open: showSlideList }">
              <div ref="presentPlaylistPanel" class="native-playlist-scroll">
                <div
                  v-for="(slide, index) in presentingSong?.slides"
                  :key="index"
                  class="native-playlist-item mb-2"
                  :class="{ active: index === presentSlideIndex }"
                  :data-slide-index="index"
                  @click="goToPresentSlide(index)"
                >
                  <div class="native-slide-chip mr-3">
                    {{ index + 1 }}
                  </div>
                  <div class="native-slide-text text-truncate font-weight-medium">
                    {{ slideRowLabel(slide) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Toolbar System Buttons -->
            <div class="native-player-toolbar d-flex align-center">
              <v-btn
                icon
                variant="flat"
                size="small"
                class="native-system-btn"
                @click="exitPresentation"
              >
                <v-icon icon="mdi-arrow-left" />
                <v-tooltip
                  activator="parent"
                  location="bottom"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium"
                >
                  Voltar ao Editor
                </v-tooltip>
              </v-btn>
            </div>

            <!-- Bottom Floating Player Bar -->
            <div class="native-player-footer position-absolute w-100 d-flex justify-center">
              <div class="native-footer-pill d-flex align-center px-6 py-2">
                <div class="native-player-info d-flex flex-column mr-6">
                  <span class="text-subtitle-2 font-weight-bold text-truncate text-white" style="line-height: 1.2;">
                    {{ presentingSong?.name }}
                  </span>
                  <span class="text-caption text-truncate" style="line-height: 1.2; color: rgba(255,255,255,0.6);">
                    Slide {{ presentSlideIndex + 1 }} de {{ presentingSong?.slides.length }}
                  </span>
                </div>

                <div class="d-flex align-center mr-4">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="white"
                    class="mx-1"
                    :disabled="presentSlideIndex <= 0"
                    @click="prevSlide"
                  >
                    <v-icon icon="mdi-skip-previous" />
                  </v-btn>
                  <v-btn
                    v-if="presentingSong?.filePathAudio || presentingSong?.filePathInstrumental"
                    icon
                    variant="text"
                    size="large"
                    color="white"
                    class="mx-1 native-play-btn"
                    @click="togglePresentPlayPause"
                  >
                    <v-icon :icon="presentIsPaused ? 'mdi-play-circle' : 'mdi-pause-circle'" size="36" />
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="white"
                    class="mx-1"
                    :disabled="presentSlideIndex >= (presentingSong?.slides.length || 1) - 1"
                    @click="nextSlide"
                  >
                    <v-icon icon="mdi-skip-next" />
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
                    color="white"
                    class="mx-1"
                    @click="togglePresentMute"
                  />
                </div>

                <v-btn
                  v-if="presentingSong?.filePathAudio && presentingSong?.filePathInstrumental"
                  icon
                  variant="text"
                  :color="presentActiveMode === 'audio' ? 'var(--accent-blue)' : 'white'"
                  size="small"
                  class="mx-1"
                  @click="togglePresentMode"
                >
                  <v-icon icon="mdi-account-voice" />
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    {{ presentActiveMode === 'instrumental' ? t('external_instrumental_file') : t('external_audio_file') }}
                  </v-tooltip>
                </v-btn>

                <ButtonScreen
                  module="music_editor"
                  variant="text"
                  size="small"
                  class="mx-1 text-white"
                />

                <v-btn
                  icon
                  variant="text"
                  :color="showSlideList ? 'var(--accent-blue)' : 'white'"
                  size="small"
                  class="mx-1"
                  @click="showSlideList = !showSlideList"
                >
                  <v-icon icon="mdi-format-list-bulleted" />
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-delay="300"
                    content-class="modern-glass-menu elevation-0 font-weight-medium"
                  >
                    Lista de Slides
                  </v-tooltip>
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
      ribbonTab: "file" as "file" | "format" | "sync",
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
    ribbonTabs(): { key: "file" | "format" | "sync"; label: string; icon: string }[] {
      return [
        { key: "file", label: this.t("ribbon_tab_file"), icon: "mdi-folder-outline" },
        { key: "format", label: this.t("ribbon_tab_format"), icon: "mdi-format-paint" },
        { key: "sync", label: this.t("ribbon_tab_sync"), icon: "mdi-clock-check-outline" },
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
    externalMediaIsPaused(): boolean {
      return (this as any).$appdata.get("modules.external_media.config.is_paused") !== false;
    },
    isPreviewingThisAudio(): boolean {
      const appdata = (this as any).$appdata;
      return !!this.externalAudioFilePath && appdata.get("modules.external_media.filePath") === this.externalAudioFilePath;
    },
    hasRecordedTimes(): boolean {
      return this.slidesInput.some((s) => typeof s.time === "number");
    },
    activeSlideProgress(): number {
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
    ribbonTab(val: string) {
      const valid = this.ribbonTabs.some((t) => t.key === val);
      if (!valid) {
        this.ribbonTab = "file";
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
    this.ribbonTab = "file";
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

    formatTimeShort(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    },

    scrollActiveSlideIntoView() {
      this.$nextTick(() => {
        const panel = this.$refs.slidesListPanel as HTMLElement | undefined;
        if (!panel) return;
        const row = panel.querySelector(`[data-slide-index="${this.activeSlideIndex}"]`);
        if (row) {
          row.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      if (lines.length === 0) return;

      this.slidesInput = lines.map((l: string) => ({ ...DEFAULT_SLIDE(), text: l }));
      this.activeSlideIndex = 0;
    },
    addSlide() {
      this.slidesInput.push(DEFAULT_SLIDE());
      this.activeSlideIndex = this.slidesInput.length - 1;
    },
    duplicateSlide() {
      this.duplicateSlideAt(this.activeSlideIndex);
    },
    duplicateSlideAt(index: number) {
      const target = this.slidesInput[index] || this.activeSlide;
      const copy = { ...target };
      this.slidesInput.splice(index + 1, 0, copy);
      this.activeSlideIndex = index + 1;
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
        is_paused: false,
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
        .map((s, index) => ({ 
          ...s, 
          text: s.text.trim(), 
          auxText: index === 0 ? "" : s.auxText.trim(),
          cover: index === 0,
        }))
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
        auxText: this.presentSlideIndex === 0 ? "" : this.currentSlideAuxText,
        image: this.currentSlideImageUrl,
        fontSize: this.currentSlideData?.fontSize,
        fontColor: this.currentSlideData?.fontColor,
        auxFontSize: this.currentSlideData?.auxFontSize,
        auxFontColor: this.currentSlideData?.auxFontColor,
        cover: this.presentSlideIndex === 0,
      });
    },
    exitPresentation() {
      this.presentingSong = null;
      this.presentSlideIndex = 0;
      const appdata = (this as any).$appdata;
      if (appdata.get("popup_module") === "music_editor") {
        import("@/helpers/ui/Popup").then(({ default: $popup }) => {
          $popup.exit();
        });
      }
    },
    playExternalFile(kind: "audio" | "instrumental") {
      const filePath = kind === "audio"
        ? this.presentingSong?.filePathAudio
        : this.presentingSong?.filePathInstrumental;
      if (!filePath) return;
      const appdata = (this as any).$appdata;
      if (appdata.get("modules.media.id_music")) {
        (this as any).$media.close(true);
      }
      appdata.set("modules.external_media.filePath", filePath);
      appdata.set("modules.external_media.title", this.presentingSong?.name || "");
      appdata.set("modules.external_media.subtitle", "");
      appdata.set("modules.external_media.minimized", true);
      appdata.set("modules.external_media.show", false);
      appdata.set("modules.external_media.config", {
        is_paused: false,
        current_time: 0,
        progress: 0,
        duration: 0,
        volume: 100,
      });
    },
    togglePresentPlayPause() {
      const appdata = (this as any).$appdata;
      const activePath = appdata.get("modules.external_media.filePath");
      if (!activePath) {
        if (this.presentingSong?.filePathAudio) {
          this.playExternalFile("audio");
        } else if (this.presentingSong?.filePathInstrumental) {
          this.playExternalFile("instrumental");
        }
        return;
      }
      appdata.set("modules.external_media.config.is_paused", !this.presentIsPaused);
    },
    togglePresentMode() {
      if (this.presentActiveMode === "audio" && this.presentingSong?.filePathInstrumental) {
        this.playExternalFile("instrumental");
      } else if (this.presentingSong?.filePathAudio) {
        this.playExternalFile("audio");
      }
    },
    togglePresentMute() {
      const appdata = (this as any).$appdata;
      const current = this.presentVolume;
      appdata.set("modules.external_media.config.volume", current > 0 ? 0 : 100);
    },
    seekPresentProgress(val: number) {
      const duration = this.presentDuration;
      if (duration <= 0) return;
      const target = (val / 100) * duration;
      (this as any).$appdata.set("modules.external_media.config.current_time", target);
    },
    formatPresentTime(seconds: number): string {
      const s = Math.max(0, Math.floor(seconds || 0));
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return `${m}:${rem.toString().padStart(2, "0")}`;
    },
    goToPresentSlide(index: number) {
      if (!this.presentingSong || index < 0 || index >= this.presentingSong.slides.length) return;
      this.presentSlideIndex = index;
      this.syncSlideToScreen();
    },
    nextSlide() {
      if (!this.presentingSong) return;
      if (this.presentSlideIndex < this.presentingSong.slides.length - 1) {
        this.presentSlideIndex++;
        this.syncSlideToScreen();
      }
    },
    prevSlide() {
      if (!this.presentingSong) return;
      if (this.presentSlideIndex > 0) {
        this.presentSlideIndex--;
        this.syncSlideToScreen();
      }
    },
    handlePresentKeydown(e: KeyboardEvent) {
      if (this.mode !== "present") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.exitPresentation();
      }
    },
  },
});
</script>

<style lang="scss">
.music-editor-module {
  width: 100%;
  height: 100%;
  background-color: var(--main-bg);

  /* ========================================== */
  /* HEADER & CONTROLS                         */
  /* ========================================== */
  .search-header {
    height: 72px;
    padding-top: 24px !important;
    padding-bottom: 0 !important;
    flex-wrap: nowrap !important;

    .section-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      @media (max-width: 1249px) {
        max-width: 260px;
      }

      @media (min-width: 1250px) {
        max-width: 380px;
      }
    }
  }

  .editor-header-controls {
    position: absolute;
    top: 20px;
    right: 24px;
    z-index: 35;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    max-width: calc(100% - 470px);
    pointer-events: none;
    transition: all 0.25s ease;

    & > * {
      pointer-events: auto;
    }

    .editor-tabs-pill {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 3px;
      box-shadow: var(--shadow);
    }

    .editor-tab-btn {
      display: inline-flex;
      align-items: center;
      padding: 5px 12px;
      border-radius: 16px;
      border: none;
      background: transparent;
      color: var(--sidebar-text-secondary);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        color: var(--sidebar-text);
        background: var(--sidebar-hover);
      }

      &.active {
        background: var(--accent-blue);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 151, 215, 0.35);
      }
    }

    .editor-actions-pill {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 3px 8px;
      min-height: 38px;
      gap: 5px;
      box-shadow: var(--shadow);

      .v-btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50% !important;
        transition: var(--transition);

        &:hover:not(:disabled):not(.v-btn--disabled) {
          background: var(--sidebar-hover);
        }

        &:disabled,
        &.v-btn--disabled {
          opacity: 0.28 !important;
          color: var(--sidebar-text-secondary) !important;
        }

        &.px-3 {
          width: auto !important;
          border-radius: 8px !important;
        }
      }
    }

    .pill-divider {
      width: 1px;
      height: 18px;
      background: var(--border-color);
      margin: 0 3px;
    }

    .format-inline-control {
      background: var(--sidebar-hover);
      padding: 2px 6px;
      border-radius: 10px;

      .format-stepper-input {
        width: 34px;
        background: transparent;
        border: none;
        outline: none;
        color: var(--sidebar-text);
        font-size: 12px;
        font-weight: 700;
        text-align: center;
        
        /* Oculta as setas nativas do navegador */
        -moz-appearance: textfield;
        appearance: textfield;
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }
      }
    }

    .color-dot-indicator {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    .editor-primary-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .editor-save-btn {
      height: 38px;
      border-radius: 8px !important;
      transition: var(--transition);

      &:not(:disabled):not(.v-btn--disabled) {
        box-shadow: 0 4px 12px rgba(0, 151, 215, 0.3) !important;
      }

      &:disabled,
      &.v-btn--disabled {
        opacity: 0.5 !important;
        background: var(--sidebar-hover) !important;
        color: var(--sidebar-text-secondary) !important;
        border: 1px solid var(--border-color) !important;
        box-shadow: none !important;
      }
    }

    .editor-present-btn {
      height: 38px;
      border-radius: 8px !important;
    }
  }

  /* ========================================== */
  /* LEFT SIDEBAR PANEL & CARDS                */
  /* ========================================== */
  .editor-sidebar-panel {
    width: 360px;
    min-width: 320px;
    max-width: 400px;
    height: 100%;
  }

  .editor-glass-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
  }

  .slide-text-card {
    flex-shrink: 0;

    .clear-input-link {
      background: transparent;
      border: none;
      font-size: 11px;
      color: var(--accent-blue);
      font-weight: 600;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .editor-modern-textarea {
      .v-field {
        background: var(--main-bg) !important;
        border: 1px solid var(--border-color) !important;
        box-shadow: none !important;
        transition: var(--transition);
        border-radius: 12px !important;

        &.v-field--focused {
          border-color: var(--accent-blue) !important;
          box-shadow: 0 0 0 3px rgba(0, 151, 215, 0.15) !important;
        }

        .v-field__input {
          font-size: 14px;
          line-height: 1.4;
          color: var(--sidebar-text);
        }
      }
    }
  }

  .slides-playlist-card {
    overflow: hidden;

    .slides-scroll-container {
      overflow-y: auto;
      overflow-x: hidden;
    }

    .slide-item-card {
      position: relative;
      background: var(--main-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 10px 12px;
      cursor: pointer;
      transition: var(--transition);
      overflow: hidden;

      &:hover {
        border-color: rgba(0, 151, 215, 0.4);
        background: var(--sidebar-hover);
        transform: translateX(3px);

        .slide-item-actions {
          opacity: 1;
        }
      }

      &.active {
        background: var(--sidebar-hover);
        border-color: var(--accent-blue);
        box-shadow: 0 4px 12px rgba(0, 151, 215, 0.15);
        transform: translateX(4px);

        .slide-item-chip {
          background: var(--accent-blue);
          color: #ffffff;
        }

        .slide-item-title {
          color: var(--accent-blue);
        }
      }

      .slide-item-chip {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--sidebar-hover);
        color: var(--sidebar-text-secondary);
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
        transition: var(--transition);
      }

      .slide-item-title {
        font-size: 13px;
        color: var(--sidebar-text);
        line-height: 1.2;
        margin-bottom: 2px;
      }

      .slide-item-subtitle {
        font-size: 11px;
        color: var(--sidebar-text-secondary);
        line-height: 1.2;
      }

      .slide-item-time-badge {
        font-size: 11px;
        font-weight: 600;
        color: rgb(var(--v-theme-success));
        background: rgba(var(--v-theme-success), 0.1);
        padding: 2px 6px;
        border-radius: 6px;
        flex-shrink: 0;
      }

      .slide-item-image-badge {
        flex-shrink: 0;
      }

      .slide-item-actions {
        opacity: 0;
        transition: opacity 0.2s ease;
        flex-shrink: 0;
      }

      .slide-progress-track {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: rgba(0, 151, 215, 0.2);

        .slide-progress-fill {
          height: 100%;
          background: var(--accent-blue);
          transition: width 0.1s linear;
        }
      }
    }

    .add-slide-dashed-btn {
      background: transparent;
      border: 1px dashed var(--border-color);
      border-radius: 12px;
      color: var(--accent-blue);
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        background: var(--sidebar-hover);
        border-color: var(--accent-blue);
      }
    }
  }

  /* ========================================== */
  /* RIGHT/CENTER PREVIEW MONITOR               */
  /* ========================================== */
  .editor-preview-panel {
    background: transparent;
    height: 100%;
    min-width: 0;
  }

  .preview-monitor-wrapper {
    height: 100%;
  }

  .preview-monitor-card {
    width: 100%;
    max-width: 960px;
    aspect-ratio: 16 / 9;
    background: #000000;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  }

  .preview-audio-tag {
    background: rgba(15, 15, 20, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;

    .preview-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgb(var(--v-theme-success));
      box-shadow: 0 0 8px rgb(var(--v-theme-success));
      animation: pulse 1.5s infinite;
    }
  }

  .preview-floating-pill {
    background: rgba(15, 15, 20, 0.65);
    backdrop-filter: blur(28px) saturate(160%);
    -webkit-backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

    .preview-slide-counter {
      min-width: 60px;
      text-align: center;
    }
  }

  /* ========================================== */
  /* NATIVE PLAYER (PRESENT MODE)              */
  /* ========================================== */
  .native-player-container {
    background: #000000;
    height: 100%;
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

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}
</style>
