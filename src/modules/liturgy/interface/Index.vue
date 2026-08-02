<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" ref="moduleContainer" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>
      </div>

      <!-- Segmented Control for Days -->
      <div class="px-6 py-4 flex-shrink-0" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
        <div 
          style="background: rgba(128, 128, 128, 0.15); border-radius: 12px; padding: 4px; display: flex; gap: 4px; width: 100%; overflow-x: auto;"
          @wheel.prevent="onCustomWheelScroll"
        >
          <v-btn
            v-for="day in dayOptions.filter(d => d.value !== 'custom')"
            :key="day.value"
            :color="selectedDay === day.value ? 'primary' : undefined"
            :variant="selectedDay === day.value ? 'flat' : 'text'"
            class="flex-grow-1 text-none font-weight-bold rounded-lg"
            :style="{ color: selectedDay === day.value ? '#fff' : 'var(--sidebar-text)', letterSpacing: 0, height: '40px', minWidth: isCompactView ? '50px' : '80px' }"
            @click="selectedDay = day.value; onDayChange(day.value)"
          >
            {{ isCompactView ? day.label.substring(0, 3) : day.label }}
          </v-btn>
          
          <v-divider vertical class="mx-1 my-2" style="opacity: 0.1;" />

          <v-btn
            :color="selectedDay === 'custom' ? 'primary' : undefined"
            :variant="selectedDay === 'custom' ? 'flat' : 'text'"
            class="flex-grow-1 text-none font-weight-bold rounded-lg"
            :style="{ color: selectedDay === 'custom' ? '#fff' : 'var(--sidebar-text)', letterSpacing: 0, height: '40px', minWidth: isCompactView ? '0' : '100px' }"
            prepend-icon="mdi-star-outline"
            @click="selectedDay = 'custom'; onDayChange('custom')"
          >
            {{ isCompactView ? 'Avul.' : (dayOptions.find(d => d.value === 'custom')?.label || 'Avulsa') }}
          </v-btn>
        </div>
      </div>

      <!-- Custom liturgy selector -->
      <v-expand-transition>
        <div 
          v-if="selectedDay === 'custom'" 
          class="px-6 py-3 d-flex align-center flex-shrink-0 custom-liturgy-scroll" 
          style="gap: 8px; overflow-x: auto; background: rgba(128, 128, 128, 0.1); border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05)); max-width: 100%;"
          @wheel.prevent="onCustomWheelScroll"
        >
          <v-chip
            v-for="(liturgy, index) in customLiturgies"
            :key="index"
            :color="selectedCustomIndex === index ? 'primary' : 'default'"
            :variant="selectedCustomIndex === index ? 'flat' : 'elevated'"
            class="font-weight-medium text-none pr-2 flex-shrink-0"
            style="box-shadow: 0 2px 5px rgba(0,0,0,0.05);"
            @click="selectedCustomIndex = index; selectedItemIndex = null"
          >
            {{ liturgy.name }}
            <v-icon
              icon="mdi-close-circle"
              size="18"
              class="ml-2"
              style="opacity: 0.6; cursor: pointer;"
              @click.stop="removeCustomLiturgy(index)"
            />
          </v-chip>
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            rounded="lg"
            class="text-none font-weight-bold ml-2 flex-shrink-0"
            prepend-icon="mdi-plus"
            @click="showNewCustomDialog = true"
          >
            {{ t('custom_liturgy.new') }}
          </v-btn>
        </div>
      </v-expand-transition>

      <!-- Main Content Area -->
      <div class="content-main d-flex" style="flex-direction: row !important; overflow: hidden; flex-grow: 1; min-height: 0; padding: 24px; gap: 24px;">
        <!-- Left Panel: Liturgy List -->
        <div class="d-flex flex-column flex-grow-1" style="min-width: 0; min-height: 0; background: var(--main-bg, transparent); border-radius: 20px;">
          <!-- List Header -->
          <div class="px-6 py-4 d-flex align-center justify-space-between">
            <h3 style="font-size: 1.25rem; color: var(--sidebar-text); font-weight: 700;">
              {{ currentLiturgyTitle }}
            </h3>
            <div class="d-flex" style="gap: 12px;">
              <v-btn
                v-if="currentItems.length > 0"
                variant="tonal"
                color="error"
                rounded="lg"
                class="text-none font-weight-bold px-4"
                @click="confirmClearAll"
              >
                {{ t('actions.clear_all') }}
              </v-btn>
              <v-btn
                variant="flat"
                color="primary"
                rounded="lg"
                class="text-none font-weight-bold px-5"
                prepend-icon="mdi-plus"
                @click="showAddMenu = true; addStep = 1"
              >
                {{ t('add_item') }}
              </v-btn>
            </div>
          </div>

          <!-- Drag & Drop List -->
          <div class="flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 0;">
            <div v-if="currentItems.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-8">
              <v-icon size="56" class="mb-3">
                mdi-playlist-plus
              </v-icon>
              <div class="text-body-1 font-weight-medium mb-1">
                {{ t('empty_list') }}
              </div>
              <div class="text-body-2" style="max-width: 260px; text-align: center;">
                {{ t('empty_list_hint') }}
              </div>
            </div>

            <draggable
              v-else
              v-model="currentItems"
              item-key="id"
              handle=".drag-handle"
              ghost-class="liturgy-ghost"
              animation="200"
              @end="saveLiturgy"
            >
              <template #item="{ element, index }">
                <div
                  v-if="element.type === 'category'"
                  class="liturgy-category-item"
                  :class="{ 'liturgy-item-active': selectedItemIndex === index }"
                  @click="selectItem(index)"
                >
                  <v-icon class="drag-handle mr-2" size="18" style="cursor: grab; opacity: 0.3;">
                    mdi-drag-vertical
                  </v-icon>
                  <v-icon color="warning" size="18" class="mr-2">
                    mdi-tag
                  </v-icon>
                  <span class="font-weight-black text-uppercase" style="font-size: 0.85rem; letter-spacing: 1px; color: var(--sidebar-text);">
                    {{ element.name }}
                  </span>
                  <v-spacer />
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="editItem(index)"
                  >
                    <v-icon size="16">
                      mdi-pencil
                    </v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-delay="300"
                      content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                    >
                      {{ t('actions.edit') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    color="error"
                    @click.stop="removeItem(index)"
                  >
                    <v-icon size="16">
                      mdi-close
                    </v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-delay="300"
                      content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                    >
                      {{ t('actions.delete') }}
                    </v-tooltip>
                  </v-btn>
                </div>

                <div
                  v-else
                  class="liturgy-item"
                  :class="{ 'liturgy-item-active': selectedItemIndex === index }"
                  @click="selectItem(index)"
                >
                  <v-icon class="drag-handle mr-3" size="18" style="cursor: grab; opacity: 0.3;">
                    mdi-drag-vertical
                  </v-icon>
                  <div class="liturgy-item-number">
                    {{ getItemNumber(index) }}
                  </div>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    :color="element.done ? 'success' : 'grey'"
                    class="mr-2"
                    @click.stop="toggleItemDone(index)"
                  >
                    <v-icon size="22">
                      {{ element.done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                    </v-icon>
                  </v-btn>
                  <v-icon
                    :color="getTypeColor(element.type)"
                    size="20"
                    class="mr-3"
                    :style="element.done ? 'opacity: 0.5;' : ''"
                  >
                    {{ getTypeIcon(element.type) }}
                  </v-icon>
                  <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;" :style="element.done ? 'opacity: 0.5; text-decoration: line-through;' : ''">
                    <div class="font-weight-bold" style="font-size: 0.95rem; color: var(--sidebar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ element.name ? element.name.replace(/^undefined\s*-\s*/, '') : '' }}
                    </div>
                    <div v-if="element.subtitle" class="text-caption" style="color: var(--sidebar-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ element.subtitle }}
                    </div>
                  </div>
                  <div class="d-flex align-center" style="gap: 2px; flex-shrink: 0;">
                    <v-btn
                      v-if="isExecutable(element)"
                      icon
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click.stop="executeItem(element)"
                    >
                      <v-icon size="16">
                        {{ getExecuteIcon(element.type) }}
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ getExecuteTooltip(element.type) }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="editItem(index)"
                    >
                      <v-icon size="16">
                        mdi-pencil
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.edit') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      @click.stop="removeItem(index)"
                    >
                      <v-icon size="16">
                        mdi-close
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.delete') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- Right Panel: Sidebar (Notes Only) -->
        <div v-if="!isCompactView" class="d-flex flex-column flex-shrink-0" style="flex: 0 0 380px; width: 380px; min-height: 0; background: var(--card-bg, #fff); border-radius: 20px; border: 1px solid var(--border-color, rgba(0,0,0,0.05)); box-shadow: 0 8px 30px rgba(0,0,0,0.04); overflow: hidden;">
          <div class="pa-4 pb-3 d-flex align-center justify-space-between" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05)); background: rgba(var(--v-theme-surface), 0.3);">
            <h3 style="font-size: 1.15rem; color: var(--sidebar-text); font-weight: 700;">
              <v-icon size="20" class="mr-2 mb-1" color="primary">
                mdi-note-edit-outline
              </v-icon>
              {{ t('notes') }}
            </h3>
          </div>
          <div class="flex-grow-1" style="overflow-y: hidden;">
            <RichTextEditor
              v-model="currentNotes"
              placeholder="Escreva suas anotações para este culto aqui..."
              @blur="saveLiturgy"
            />
          </div>
        </div>
      </div>


      <!-- ====== ADD ITEM DIALOG (Multi-step) ====== -->
      <v-dialog
        v-model="showAddMenu"
        max-width="600"
        :theme="$theme.primary()"
        content-class="modern-alert-dialog-wrapper"
        @update:model-value="val => { if (!val) addStep = 1; }"
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
                  @click="showAddMenu = false"
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
                          Música não encontrada
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
                          Livro não encontrado
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
                            {{ addForm.verseBookId ? 'Capítulo não encontrado' : 'Selecione o livro primeiro' }}
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
                      placeholder="Ex: 1-5, 8"
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
                          Trocar
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
                          Remover
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
                    <span class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">Clique para buscar no computador</span>
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
                  placeholder="https://..."
                />
              </v-card-text>

              <v-card-actions class="px-6 pb-6 pt-2 d-flex justify-end" style="gap: 12px;">
                <v-spacer />
                <v-btn
                  color="error"
                  variant="tonal"
                  class="modern-alert-btn px-6"
                  height="40"
                  @click="showAddMenu = false"
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

      <!-- ====== NEW CUSTOM LITURGY DIALOG ====== -->
      <v-dialog
        v-model="showNewCustomDialog"
        max-width="420"
        :theme="$theme.primary()"
        content-class="modern-alert-dialog-wrapper"
      >
        <v-card class="modern-alert-card rounded-xl">
          <v-card-title class="pt-6 px-6">
            {{ t('custom_liturgy.new') }}
          </v-card-title>
          <v-card-text class="px-6 pb-2 pt-4">
            <v-text-field
              v-model="newCustomName"
              :placeholder="t('custom_liturgy.name_placeholder')"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="modern-input-no-thick"
              hide-details
              autofocus
              @keydown.enter="createCustomLiturgy"
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2 d-flex justify-end" style="gap: 12px;">
            <v-spacer />
            <v-btn
              color="error"
              variant="tonal"
              class="modern-alert-btn px-6"
              height="40"
              @click="showNewCustomDialog = false"
            >
              {{ t('actions.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="modern-alert-btn px-6"
              height="40"
              :disabled="!newCustomName.trim()"
              @click="createCustomLiturgy"
            >
              {{ t('actions.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import draggable from "vuedraggable";
import RichTextEditor from "./RichTextEditor.vue";

export default {
  name: "LiturgyModuleIndex",
  components: {
    MenuToggleButton,
    draggable,
    RichTextEditor,
  },
  data: () => ({
    isCompactView: false,
    selectedDay: null,
    selectedItemIndex: null,
    selectedCustomIndex: 0,

    // Liturgies storage: { sunday: [...], monday: [...], ... }
    liturgies: {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    },
    dayNotes: {
      sunday: "",
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
    },
    customLiturgies: [], // [{ name: "...", items: [...], notes: "" }]

    // Add item popup
    showAddMenu: false,
    addStep: 1,
    editingIndex: null,
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

    // Custom liturgy dialog
    showNewCustomDialog: false,
    newCustomName: "",

    // Data for selectors
    musicSearchQuery: "",
    musicList: [],
    bibleBooks: [],
    bibleVersions: [],
  }),
  computed: {
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
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    show() {
      return this.module.show;
    },
    dayOptions() {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      return [
        ...days.map(d => ({ value: d, label: this.t(`days.${d}`) })),
        { value: "custom", label: this.t("days.custom") },
      ];
    },
    currentItems: {
      get() {
        if (this.selectedDay === "custom") {
          const liturgy = this.customLiturgies[this.selectedCustomIndex];
          return liturgy ? liturgy.items : [];
        }
        return this.liturgies[this.selectedDay] || [];
      },
      set(val) {
        if (this.selectedDay === "custom") {
          if (this.customLiturgies[this.selectedCustomIndex]) {
            this.customLiturgies[this.selectedCustomIndex].items = val;
          }
        } else {
          this.liturgies[this.selectedDay] = val;
        }
      },
    },
    currentNotes: {
      get() {
        if (this.selectedDay === "custom") {
          const liturgy = this.customLiturgies[this.selectedCustomIndex];
          return liturgy ? (liturgy.notes || "") : "";
        }
        return this.dayNotes[this.selectedDay] || "";
      },
      set(val) {
        if (this.selectedDay === "custom") {
          if (this.customLiturgies[this.selectedCustomIndex]) {
            this.customLiturgies[this.selectedCustomIndex].notes = val;
          }
        } else {
          this.dayNotes[this.selectedDay] = val;
        }
      },
    },
    currentLiturgyTitle() {
      if (this.selectedDay === "custom") {
        const liturgy = this.customLiturgies[this.selectedCustomIndex];
        return liturgy ? liturgy.name : this.t("custom_liturgy.title");
      }
      return this.t(`days.${this.selectedDay}`);
    },
    selectedItem() {
      if (this.selectedItemIndex === null || this.selectedItemIndex >= this.currentItems.length) return null;
      return this.currentItems[this.selectedItemIndex];
    },
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
    verseChapterList() {
      if (!this.addForm.verseBookId) return [];
      const book = this.bibleBooks.find(b => b.id_bible_book === this.addForm.verseBookId);
      if (!book) return [];
      return Array.from({ length: book.chapters }, (_, i) => i + 1);
    },
  },
  watch: {
    show() {
      if (this.show) {
        this.loadData();
        this.$nextTick(() => {
          this.setupResizeObserver();
        });
      } else {
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
          this.resizeObserver = null;
        }
      }
    },
  },
  async mounted() {
    this.setTodayAsDefault();
    if (this.show) {
      await this.loadData();
      this.setupResizeObserver();
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    setupResizeObserver() {
      if (this.$refs.moduleContainer && !this.resizeObserver) {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            this.isCompactView = entry.contentRect.width < 915;
          }
        });
        this.resizeObserver.observe(this.$refs.moduleContainer);
      }
    },
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    onCustomWheelScroll(e) {
      if (e.deltaY !== 0) {
        e.currentTarget.scrollLeft += e.deltaY;
      }
    },

    // ====== DAY MANAGEMENT ======
    setTodayAsDefault() {
      const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      this.selectedDay = dayMap[new Date().getDay()];
    },
    onDayChange() {
      this.selectedItemIndex = null;
    },
    selectDay(day) {
      this.selectedDay = day;
      this.selectedItemIndex = null;
    },
    getLiturgyItems(day) {
      if (day === "custom") {
        return this.customLiturgies.flatMap(l => l.items);
      }
      return this.liturgies[day] || [];
    },

    // ====== ITEM TYPE HELPERS ======
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
    isExecutable(item) {
      return ["music", "verse", "link", "media"].includes(item.type);
    },

    getExecuteIcon(type) {
      if (type === "media") {
        const useInternal = this.$userdata.get("modules.config.media_use_internal_player");
        if (useInternal) return "mdi-play";
      }
      
      const map = {
        music: "mdi-play",
        verse: "mdi-presentation-play",
        link: "mdi-open-in-new",
        media: "mdi-open-in-new",
      };
      return map[type] || "mdi-play";
    },
    getExecuteTooltip(type) {
      if (type === "media") {
        const useInternal = this.$userdata.get("modules.config.media_use_internal_player");
        if (useInternal) return this.t("actions.play");
      }
      
      const map = {
        music: "actions.play",
        verse: "actions.project",
        link: "actions.open",
        media: "actions.open",
      };
      return this.t(map[type] || "actions.project");
    },

    // ====== ADD/EDIT ITEMS ======
    openAddForm(type) {
      this.editingIndex = null;
      this.addForm = {
        type,
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
      this.addStep = 2;
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
                this.$alert.error({ text: `O capítulo possui apenas ${maxVerse} versículos. O versículo ${num} não existe.`, translate: false });
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

      if (this.editingIndex !== null) {
        this.currentItems.splice(this.editingIndex, 1, item);
      } else {
        this.currentItems.push(item);
      }

      this.showAddMenu = false;
      this.addStep = 1;
      this.saveLiturgy();
    },
    removeItem(index) {
      this.$alert.yesno(
        { text: this.t("messages.confirm_delete"), translate: false },
        (resp) => {
          if (resp === "yes") {
            this.currentItems.splice(index, 1);
            if (this.selectedItemIndex === index) this.selectedItemIndex = null;
            else if (this.selectedItemIndex > index) this.selectedItemIndex--;
            this.saveLiturgy();
          }
        },
      );
    },
    editItem(index) {
      const item = this.currentItems[index];
      this.editingIndex = index;
      this.addForm = {
        type: item.type,
        name: item.name,
        subtitle: item.subtitle,
        musicId: item.musicId || null,
        musicMode: item.musicMode || "audio",
        verseBookId: item.verseBookId || null,
        verseChapter: item.verseChapter || null,
        verseNumbers: item.verseNumbers || "",
        filePath: item.filePath || "",
        url: item.url || "",
      };
      this.addStep = 2;
      this.showAddMenu = true;
    },
    toggleItemDone(index) {
      const item = this.currentItems[index];
      item.done = !item.done;
      this.saveLiturgy();
    },
    getItemNumber(index) {
      if (this.currentItems[index].type === "category") return null;
      let count = 0;
      for (let i = 0; i <= index; i++) {
        const item = this.currentItems[i];
        if (item.type === "category") {
          count = 0;
        } else {
          count++;
        }
      }
      return count;
    },
    confirmClearAll() {
      this.$alert.yesno(
        { text: this.t("messages.confirm_clear"), translate: false },
        (resp) => {
          if (resp === "yes") {
            this.currentItems = [];
            this.selectedItemIndex = null;
            this.saveLiturgy();
          }
        },
      );
    },
    selectItem(index) {
      this.selectedItemIndex = index;
      const item = this.currentItems[index];

      let changed = false;
      if (!item.done) {
        item.done = true;
        changed = true;
      }

      if (this.isExecutable(item)) {
        this.executeItem(item);
      }

      if (changed) {
        this.saveLiturgy();
      }
    },

    // ====== MUSIC SELECTOR ======
    onMusicSelect(musicId) {
      if (!musicId) return;
      const music = this.musicList.find(m => m.id_music === musicId);
      if (music && !this.addForm.name) {
        this.addForm.name = music.hymnal_track ? `${music.hymnal_track} - ${music.name}` : music.name;
      }
    },

    // ====== VERSE SELECTOR ======
    onBookSelect(bookId) {
      if (!bookId) return;
      this.addForm.verseChapter = 1;
      const book = this.bibleBooks.find(b => b.id_bible_book === bookId);
      if (book && !this.addForm.name) {
        this.addForm.name = book.name;
      }
    },

    // ====== MEDIA FILE SELECTOR ======
    async selectMediaFile() {
      if (window.electronAPI?.openFileDialog) {
        const filePath = await window.electronAPI.openFileDialog({
          title: "Selecionar Mídia",
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
            this.addForm.name = fileName.replace(/\.[^.]+$/, "");
          }
        }
      } else {
        this.$alert.error({ text: "Seleção de arquivos disponível apenas na versão desktop.", translate: false });
      }
    },

    // ====== EXECUTE/PROJECT ITEMS ======
    async executeItem(item) {
      let targetModule = null;

      if (item.type === "music") {
        if (item.musicId) {
          this.$media.open({ id_music: item.musicId, mode: "audio" });
          targetModule = "media";
        }
      } else if (item.type === "verse") {
        if (item.verseBookId && item.verseChapter) {
          targetModule = "bible";
          this.$nextTick(() => {
            this.$appdata.set("modules.bible.data.navigate", {
              bookId: item.verseBookId,
              chapter: item.verseChapter,
              verses: item.verseNumbers,
            });
          });
        }
      } else if (item.type === "media") {
        if (item.filePath) {
          const useInternal = this.$userdata.get("modules.config.media_use_internal_player");
          
          if (useInternal) {
            if (this.$appdata.get("modules.media.id_music")) {
              const confirmed = await new Promise((resolve) => {
                this.$alert.yesno({
                  text: "Uma música está em reprodução no momento. Deseja encerrá-la e reproduzir esta mídia?",
                  translate: false,
                }, (res) => resolve(res === "yes"));
              });
              if (!confirmed) return;
              this.$media.close(true);
            }

            // Reproduz no reprodutor interno (external_media)
            this.$appdata.set("modules.external_media.filePath", item.filePath);
            this.$appdata.set("modules.external_media.title", item.name || "");
            this.$appdata.set("modules.external_media.subtitle", item.subtitle || "");
            this.$appdata.set("modules.external_media.minimized", false);
            this.$appdata.set("modules.external_media.config", {
              is_paused: true,
              current_time: 0,
              progress: 0,
              duration: 0,
              volume: 100,
            });

            // Check if it's audio-only
            const ext = item.filePath.split(".").pop().toLowerCase();
            const isAudio = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext);

            if (isAudio) {
              // Audio goes straight to footer bar (minimized)
              this.$appdata.set("modules.external_media.minimized", true);
            } else {
              // Video opens the full module
              this.$appdata.set("modules.external_media.show", true);
            }
          } else {
            // Reproduz no reprodutor padrão do sistema operacional
            if (window.electronAPI && window.electronAPI.openPath) {
              window.electronAPI.openPath(item.filePath);
            }
          }
        }
      } else if (item.type === "link") {
        if (item.url) {
          if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(item.url);
          } else {
            window.open(item.url, "_blank");
          }
        }
      }

      if (targetModule) {
        const popups = this.$appdata.get("popups") || [];
        const isPopupOpened = popups.some(p => !p.closed);
        const currentModule = this.$appdata.get("popup_module");

        if (!isPopupOpened || currentModule !== targetModule) {
          let selectedMonitors = [];
          if (window.electronAPI && window.electronAPI.getDisplays) {
            const displays = await window.electronAPI.getDisplays();
            if (displays && displays.length > 1) {
              let configMonitors = this.$userdata.get("modules.config.slide_monitor");
              if (!Array.isArray(configMonitors)) {
                configMonitors = configMonitors ? [configMonitors] : [];
              }
              const primary = displays.find(d => d.isPrimary) || displays[0];
              selectedMonitors = configMonitors.filter(m => m !== primary.id);
            }
          }
          
          if (selectedMonitors.length > 0) {
            await this.$popup.syncMonitors(selectedMonitors, targetModule, true);
          } else {
            this.$popup.open({ module: targetModule, fullscreen: true });
          }
        }
      }
    },

    // ====== CUSTOM LITURGIES ======
    createCustomLiturgy() {
      if (!this.newCustomName.trim()) return;
      this.customLiturgies.push({
        name: this.newCustomName.trim(),
        items: [],
        notes: "",
      });
      this.selectedCustomIndex = this.customLiturgies.length - 1;
      this.newCustomName = "";
      this.showNewCustomDialog = false;
      this.saveLiturgy();
    },
    removeCustomLiturgy(index) {
      this.$alert.yesno(
        { text: `Deseja remover a liturgia "${this.customLiturgies[index].name}"?`, translate: false },
        (resp) => {
          if (resp === "yes") {
            this.customLiturgies.splice(index, 1);
            if (this.selectedCustomIndex >= this.customLiturgies.length) {
              this.selectedCustomIndex = Math.max(0, this.customLiturgies.length - 1);
            }
            this.saveLiturgy();
          }
        },
      );
    },

    // ====== PERSISTENCE ======
    saveLiturgy() {
      this.$userdata.set(`modules.${this.module_id}.liturgies`, JSON.parse(JSON.stringify(this.liturgies)));
      this.$userdata.set(`modules.${this.module_id}.dayNotes`, JSON.parse(JSON.stringify(this.dayNotes)));
      this.$userdata.set(`modules.${this.module_id}.customLiturgies`, JSON.parse(JSON.stringify(this.customLiturgies)));
    },
    loadSavedLiturgies() {
      const shouldClearChecks = !this.$appdata.get("liturgy_checks_cleared");

      const saved = this.$userdata.get(`modules.${this.module_id}.liturgies`);
      if (saved) {
        if (shouldClearChecks) {
          for (const day in saved) {
            saved[day].forEach(item => {
              if (item.done) item.done = false;
            });
          }
        }
        this.liturgies = { ...this.liturgies, ...saved };
      }

      const savedNotes = this.$userdata.get(`modules.${this.module_id}.dayNotes`);
      if (savedNotes) {
        this.dayNotes = { ...this.dayNotes, ...savedNotes };
      }

      const savedCustom = this.$userdata.get(`modules.${this.module_id}.customLiturgies`);
      if (savedCustom && Array.isArray(savedCustom)) {
        if (shouldClearChecks) {
          savedCustom.forEach(custom => {
            if (custom.items) {
              custom.items.forEach(item => {
                if (item.done) item.done = false;
              });
            }
          });
        }
        this.customLiturgies = savedCustom;
      }

      if (shouldClearChecks) {
        this.saveLiturgy();
        this.$appdata.set("liturgy_checks_cleared", true);
      }
    },

    // ====== DATA LOADING ======
    async loadData() {
      this.loadSavedLiturgies();

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
    },
  },
};
</script>

<style lang="scss" scoped>
.module-full-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  z-index: 10;
}

.modern-input-no-thick:deep(.v-field__overlay) {
  opacity: 0 !important;
}

.module-icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 151, 215, 0.3);
}

.liturgy-day-chip {
  transition: all 0.2s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(-1px);
  }
}

.liturgy-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--card-bg);
  border: 1px solid var(--glass-border, transparent);
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-hover);
  }
}

.liturgy-item-active {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.1) !important;
}

.liturgy-category-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin: 16px 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  background: rgba(255, 193, 7, 0.06);
  border: 1px dashed rgba(255, 193, 7, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 193, 7, 0.12);
  }
}

.liturgy-item-number {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-blue);
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0, 151, 215, 0.08);
  margin-right: 12px;
  flex-shrink: 0;
}

.liturgy-ghost {
  opacity: 0.4;
  background: rgba(0, 151, 215, 0.05);
  border-radius: 12px;
}

.modern-glass-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--shadow-hover) !important;
}
</style>
