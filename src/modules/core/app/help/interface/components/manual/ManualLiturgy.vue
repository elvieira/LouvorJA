<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('liturgy.intro')" />

    <!-- 1. Liturgias Diárias e Avulsas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-calendar-check-outline" class="mr-2" size="22" />
      {{ t('liturgy.days_title') }}
    </h3>
    <p class="mb-4" v-html="t('liturgy.days_p1')" />
    <p class="mb-4" v-html="t('liturgy.days_p2')" />

    <!-- Mockup Interativo 1: Seletor de Dias e Liturgia Avulsa -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-calendar-week" size="16" class="mr-1 text-primary" />
          {{ t('liturgy.preview_days_title') }}
        </span>
        <v-chip
          size="x-small"
          color="primary"
          variant="flat"
          class="font-weight-bold"
        >
          {{ t('liturgy.preview_day_active_badge') }}: {{ activeDayLabel }}
        </v-chip>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- Barra de Abas de Dias (Estilo fiel ao DaySelector.vue) -->
        <div class="mock-day-selector rounded-lg pa-1 d-flex flex-wrap gap-1 align-center mb-3">
          <v-btn
            v-for="d in weekDays"
            :key="d.value"
            size="small"
            :color="selectedDay === d.value ? 'primary' : ''"
            :variant="selectedDay === d.value ? 'flat' : 'text'"
            class="flex-grow-1 text-none font-weight-bold rounded-md"
            style="min-width: 48px; height: 36px;"
            @click="selectedDay = d.value"
          >
            {{ d.label }}
          </v-btn>

          <v-divider vertical class="mx-1 my-1 opacity-20 d-none d-sm-block" style="height: 24px;" />

          <v-btn
            size="small"
            :color="selectedDay === 'custom' ? 'primary' : ''"
            :variant="selectedDay === 'custom' ? 'flat' : 'text'"
            class="flex-grow-1 text-none font-weight-bold rounded-md"
            style="min-width: 90px; height: 36px;"
            prepend-icon="mdi-star-outline"
            @click="selectedDay = 'custom'"
          >
            {{ $t('modules.liturgy.days.custom') }}
          </v-btn>
        </div>

        <!-- Descrição do Dia Selecionado -->
        <div class="d-flex align-center justify-space-between px-2 py-1">
          <div class="d-flex align-center">
            <v-icon size="18" color="primary" class="mr-2">
              {{ selectedDay === 'custom' ? 'mdi-folder-star-outline' : 'mdi-calendar-clock-outline' }}
            </v-icon>
            <span class="text-caption font-weight-medium" style="color: var(--sidebar-text);">
              {{ dayDescription }}
            </span>
          </div>
          <span class="text-caption opacity-50">{{ daySubtext }}</span>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Tipos de Itens da Liturgia -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-shape-outline" class="mr-2" size="22" />
      {{ t('liturgy.item_types_title') }}
    </h3>
    <p class="mb-4" v-html="t('liturgy.item_types_intro')" />

    <!-- Mockup Interativo 2: Os 8 Tipos de Itens -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-layers-outline" size="16" class="mr-1 text-primary" />
          {{ t('liturgy.preview_types_title') }}
        </span>
        <span class="text-caption opacity-60">8 tipos disponíveis</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <v-row dense>
          <v-col
            v-for="itemType in itemTypesList"
            :key="itemType.id"
            cols="12"
            sm="6"
            md="3"
          >
            <div
              class="mock-type-card rounded-lg pa-3 d-flex flex-column h-100 cursor-pointer"
              :class="{ 'active': selectedType === itemType.id }"
              @click="selectedType = itemType.id"
            >
              <div class="d-flex align-center mb-2">
                <div
                  class="mock-type-icon-box rounded-md d-flex align-center justify-center mr-2"
                  :style="{ background: itemType.color + '22', color: itemType.color }"
                >
                  <v-icon size="18">
                    {{ itemType.icon }}
                  </v-icon>
                </div>
                <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                  {{ itemType.title }}
                </span>
              </div>
              <p class="text-caption opacity-70 mb-0 flex-grow-1" style="font-size: 0.75rem; line-height: 1.3;">
                {{ itemType.desc }}
              </p>
            </div>
          </v-col>
        </v-row>

        <!-- Preview Detalhado do Tipo Selecionado -->
        <div class="mock-selected-type-banner mt-3 pa-3 rounded-lg d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon size="20" :color="currentTypeDetail.color" class="mr-2">
              {{ currentTypeDetail.icon }}
            </v-icon>
            <div>
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                {{ currentTypeDetail.title }}:
              </span>
              <span class="text-caption opacity-80 ml-1">
                {{ currentTypeDetail.usage }}
              </span>
            </div>
          </div>
          <v-chip
            size="x-small"
            :color="currentTypeDetail.color"
            variant="tonal"
            class="font-weight-bold flex-shrink-0"
          >
            {{ currentTypeDetail.badge }}
          </v-chip>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Funcionalidades da Lista (Linha do Tempo e Ações) -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-format-list-checks" class="mr-2" size="22" />
      {{ t('liturgy.manage_title') }}
    </h3>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <span v-html="t('liturgy.timeline')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li><span class="text-success font-weight-bold">{{ t('liturgy.timeline_done') }}</span></li>
          <li><span class="text-primary font-weight-bold">{{ t('liturgy.timeline_next') }}</span></li>
          <li><span class="opacity-70">{{ t('liturgy.timeline_pending') }}</span></li>
        </ul>
      </li>
      <li class="mb-2" v-html="t('liturgy.drag_drop')" />
      <li class="mb-2" v-html="t('liturgy.toggle_done')" />
      <li class="mb-2">
        <strong>{{ t('liturgy.quick_actions') }}</strong>
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('liturgy.action_play')" />
          <li v-html="t('liturgy.action_view')" />
          <li v-html="t('liturgy.action_open')" />
          <li v-html="t('liturgy.action_duplicate')" />
          <li v-html="t('liturgy.action_edit')" />
          <li v-html="t('liturgy.action_delete')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('liturgy.collapse_expand')" />
      <li class="mb-2" v-html="t('liturgy.pending_tag')" />
      <li class="mb-2">
        <strong>{{ t('liturgy.global_actions') }}</strong>
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('liturgy.action_uncheck_all')" />
          <li v-html="t('liturgy.action_clear_all')" />
        </ul>
      </li>
    </ul>

    <!-- Mockup Interativo 3: A Lista de Culto com Linha do Tempo e Categorias -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-timeline-text-outline" size="16" class="mr-1 text-primary" />
          {{ t('liturgy.preview_list_title') }}
        </span>
        <span class="text-caption opacity-60">Clique nos círculos para marcar/desmarcar</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <!-- Top Bar da Lista -->
        <div class="d-flex flex-wrap align-center justify-space-between mb-4 gap-2">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2" size="20">
              mdi-calendar-check
            </v-icon>
            <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
              {{ t('liturgy.preview_list_header') }}
            </span>
          </div>

          <div class="d-flex align-center gap-2">
            <v-btn
              size="x-small"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-restart"
              class="text-none font-weight-bold rounded-md"
              @click="resetAllChecks"
            >
              {{ $t('modules.liturgy.actions.reset_checks') }}
            </v-btn>
            <v-btn
              size="x-small"
              variant="flat"
              color="primary"
              prepend-icon="mdi-plus"
              class="text-none font-weight-bold rounded-md"
            >
              {{ $t('modules.liturgy.add_item') }}
            </v-btn>
          </div>
        </div>

        <!-- Estrutura da Timeline com Itens -->
        <div class="mock-liturgy-timeline">
          <!-- Bloco de Categoria: Escola Sabatina -->
          <div class="mock-category-row d-flex align-center mb-2">
            <div class="mock-timeline-dot category-dot mr-3 flex-shrink-0" />
            <div class="mock-category-card rounded-lg pa-3 flex-grow-1 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon size="16" class="mr-2 opacity-40">
                  mdi-drag-vertical
                </v-icon>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  class="mr-2"
                  @click="catCollapsed = !catCollapsed"
                >
                  <v-icon size="16">
                    {{ catCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
                  </v-icon>
                </v-btn>
                <v-icon color="primary" size="18" class="mr-2">
                  mdi-flag-outline
                </v-icon>
                <span class="text-caption font-weight-bold text-uppercase" style="letter-spacing: 0.5px; color: var(--sidebar-text);">
                  {{ t('liturgy.preview_cat_header') }}
                </span>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="ml-2 font-weight-bold"
                >
                  {{ t('liturgy.preview_cat_count') }}
                </v-chip>
              </div>

              <div class="d-flex align-center gap-1 opacity-70">
                <v-icon size="16" class="mr-1">
                  mdi-plus
                </v-icon>
                <v-icon size="16" class="mr-1">
                  mdi-content-copy
                </v-icon>
                <v-icon size="16">
                  mdi-pencil-outline
                </v-icon>
              </div>
            </div>
          </div>

          <!-- Itens da Categoria (Suporta recolhimento) -->
          <v-expand-transition>
            <div v-show="!catCollapsed" class="d-flex flex-column gap-2 mb-2">
              <!-- Item 1: Oração Inicial (Concluído) -->
              <div class="mock-item-row d-flex align-center">
                <div class="mock-timeline-line" />
                <div
                  class="mock-timeline-dot item-dot mr-3 flex-shrink-0 cursor-pointer"
                  :class="{ 'done': item1Done, 'next': !item1Done }"
                  @click="item1Done = !item1Done"
                >
                  <v-icon v-if="item1Done" size="12" color="white">
                    mdi-check
                  </v-icon>
                  <div v-else class="pulse-core" />
                </div>

                <div
                  class="mock-item-card rounded-lg pa-3 flex-grow-1 d-flex align-center justify-space-between"
                  :class="{ 'item-done': item1Done }"
                  style="border-left: 3px solid #78909c;"
                >
                  <div class="d-flex align-center min-width-0">
                    <v-icon size="16" class="mr-2 opacity-30">
                      mdi-drag-vertical
                    </v-icon>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="item1Done ? 'success' : 'grey'"
                      class="mr-2"
                      @click="item1Done = !item1Done"
                    >
                      <v-icon size="18">
                        {{ item1Done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                      </v-icon>
                    </v-btn>
                    <v-icon size="18" color="blue-grey" class="mr-3">
                      mdi-note-text-outline
                    </v-icon>
                    <div>
                      <div class="text-caption font-weight-bold item-title">
                        {{ t('liturgy.preview_item_done_sample') }}
                      </div>
                      <div class="text-caption opacity-60" style="font-size: 0.72rem;">
                        {{ t('liturgy.preview_item_done_desc') }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center gap-1 opacity-60">
                    <v-icon size="16">
                      mdi-pencil-outline
                    </v-icon>
                  </div>
                </div>
              </div>

              <!-- Item 2: Hino 301 (Em andamento / Próximo no fluxo) -->
              <div class="mock-item-row d-flex align-center">
                <div class="mock-timeline-line" />
                <div
                  class="mock-timeline-dot item-dot mr-3 flex-shrink-0 cursor-pointer"
                  :class="{ 'done': item2Done, 'next': item1Done && !item2Done, 'pending': !item1Done && !item2Done }"
                  @click="item2Done = !item2Done"
                >
                  <v-icon v-if="item2Done" size="12" color="white">
                    mdi-check
                  </v-icon>
                  <div v-else-if="item1Done" class="pulse-core" />
                  <div v-else class="pending-dot" />
                </div>

                <div
                  class="mock-item-card rounded-lg pa-3 flex-grow-1 d-flex align-center justify-space-between"
                  :class="{ 'item-done': item2Done, 'item-active': item1Done && !item2Done }"
                  style="border-left: 3px solid #0097d7;"
                >
                  <div class="d-flex align-center min-width-0">
                    <v-icon size="16" class="mr-2 opacity-30">
                      mdi-drag-vertical
                    </v-icon>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="item2Done ? 'success' : (item1Done ? 'primary' : 'grey')"
                      class="mr-2"
                      @click="item2Done = !item2Done"
                    >
                      <v-icon size="18">
                        {{ item2Done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                      </v-icon>
                    </v-btn>
                    <v-icon size="18" color="primary" class="mr-3">
                      mdi-music
                    </v-icon>
                    <div>
                      <div class="d-flex align-center">
                        <span class="text-caption font-weight-bold item-title mr-2">
                          {{ t('liturgy.preview_item_song_sample') }}
                        </span>
                        <v-chip
                          size="x-small"
                          color="primary"
                          variant="tonal"
                          class="font-weight-bold px-1"
                          style="height: 16px; font-size: 0.65rem;"
                        >
                          Cantado
                        </v-chip>
                      </div>
                      <div class="text-caption opacity-60" style="font-size: 0.72rem;">
                        {{ t('liturgy.preview_item_song_desc') }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center gap-1">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="primary"
                    >
                      <v-icon size="18">
                        mdi-play-outline
                      </v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="primary"
                    >
                      <v-icon size="18">
                        mdi-eye-outline
                      </v-icon>
                    </v-btn>
                    <v-icon size="16" class="opacity-60 ml-1">
                      mdi-pencil-outline
                    </v-icon>
                  </div>
                </div>
              </div>

              <!-- Item 3: Leitura Bíblica (Pendente) -->
              <div class="mock-item-row d-flex align-center">
                <div class="mock-timeline-line" />
                <div
                  class="mock-timeline-dot item-dot mr-3 flex-shrink-0 cursor-pointer"
                  :class="{ 'done': item3Done, 'next': item1Done && item2Done && !item3Done, 'pending': (!item1Done || !item2Done) && !item3Done }"
                  @click="item3Done = !item3Done"
                >
                  <v-icon v-if="item3Done" size="12" color="white">
                    mdi-check
                  </v-icon>
                  <div v-else-if="item1Done && item2Done" class="pulse-core" />
                  <div v-else class="pending-dot" />
                </div>

                <div
                  class="mock-item-card rounded-lg pa-3 flex-grow-1 d-flex align-center justify-space-between"
                  :class="{ 'item-done': item3Done }"
                  style="border-left: 3px solid #ff9800;"
                >
                  <div class="d-flex align-center min-width-0">
                    <v-icon size="16" class="mr-2 opacity-30">
                      mdi-drag-vertical
                    </v-icon>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="item3Done ? 'success' : 'grey'"
                      class="mr-2"
                      @click="item3Done = !item3Done"
                    >
                      <v-icon size="18">
                        {{ item3Done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                      </v-icon>
                    </v-btn>
                    <v-icon size="18" color="warning" class="mr-3">
                      mdi-book-open-variant
                    </v-icon>
                    <div>
                      <div class="text-caption font-weight-bold item-title">
                        {{ t('liturgy.preview_item_bible_sample') }}
                      </div>
                      <div class="text-caption opacity-60" style="font-size: 0.72rem;">
                        {{ t('liturgy.preview_item_bible_desc') }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center gap-1">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="warning"
                    >
                      <v-icon size="18">
                        mdi-open-in-new
                      </v-icon>
                    </v-btn>
                    <v-icon size="16" class="opacity-60 ml-1">
                      mdi-pencil-outline
                    </v-icon>
                  </div>
                </div>
              </div>
            </div>
          </v-expand-transition>

          <!-- Item 4: Item Agendado por Data -->
          <div class="mock-item-row d-flex align-center mb-2">
            <div class="mock-timeline-dot item-dot mr-3 flex-shrink-0 pending">
              <div class="pending-dot" />
            </div>

            <div class="mock-item-card rounded-lg pa-3 flex-grow-1 d-flex align-center justify-space-between" style="border-left: 3px solid #4caf50;">
              <div class="d-flex align-center min-width-0">
                <v-icon size="16" class="mr-2 opacity-30">
                  mdi-drag-vertical
                </v-icon>
                <v-icon size="18" color="grey" class="mr-2 opacity-50">
                  mdi-checkbox-blank-circle-outline
                </v-icon>
                <v-icon size="18" color="success" class="mr-3">
                  mdi-calendar-clock
                </v-icon>
                <div>
                  <div class="text-caption font-weight-bold item-title">
                    {{ t('liturgy.preview_item_sched_sample') }}
                  </div>
                  <div class="text-caption opacity-60" style="font-size: 0.72rem;">
                    {{ t('liturgy.preview_item_sched_desc') }}
                  </div>
                </div>
              </div>

              <v-btn
                icon
                size="x-small"
                variant="text"
                color="success"
              >
                <v-icon size="18">
                  mdi-play-outline
                </v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Item 5: Item Pendente "A PREENCHER" -->
          <div class="mock-item-row d-flex align-center">
            <div class="mock-timeline-dot item-dot mr-3 flex-shrink-0 pending">
              <div class="pending-dot" />
            </div>

            <div class="mock-item-card rounded-lg pa-3 flex-grow-1 d-flex align-center justify-space-between mock-placeholder-border">
              <div class="d-flex align-center min-width-0">
                <v-icon size="16" class="mr-2 opacity-30">
                  mdi-drag-vertical
                </v-icon>
                <v-icon size="18" color="grey" class="mr-2 opacity-50">
                  mdi-checkbox-blank-circle-outline
                </v-icon>
                <v-icon size="18" color="warning" class="mr-3">
                  mdi-alert-circle-outline
                </v-icon>
                <div>
                  <div class="d-flex align-center">
                    <span class="text-caption font-weight-bold item-title mr-2">
                      {{ t('liturgy.preview_item_placeholder_sample') }}
                    </span>
                    <v-chip
                      size="x-small"
                      color="warning"
                      variant="flat"
                      class="font-weight-bold px-1"
                      style="height: 16px; font-size: 0.65rem;"
                    >
                      {{ t('liturgy.preview_item_placeholder_tag') }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-warning opacity-80" style="font-size: 0.72rem;">
                    Clique para definir a música deste momento
                  </div>
                </div>
              </div>

              <v-icon size="16" color="warning">
                mdi-pencil
              </v-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 4. Importar / Exportar, Templates e Agendados -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-swap-horizontal-bold" class="mr-2" size="22" />
      {{ t('liturgy.advanced_title') }}
    </h3>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('liturgy.import_export')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('liturgy.export_desc')" />
          <li v-html="t('liturgy.import_desc')" />
        </ul>
      </li>
      <li class="mb-3" v-html="t('liturgy.templates_desc')" />
      <li class="mb-3" v-html="t('liturgy.scheduled_desc')" />
    </ul>

    <!-- Mockup Interativo 4: Templates e Mídias Agendadas -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-buffer" size="16" class="mr-1 text-primary" />
          {{ t('liturgy.preview_adv_title') }}
        </span>

        <!-- Seletor entre Templates e Agendados -->
        <div class="d-flex align-center rounded-lg pa-1 mode-switch-container">
          <v-btn
            size="x-small"
            :variant="selectedAdvTab === 'templates' ? 'flat' : 'text'"
            :color="selectedAdvTab === 'templates' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-3 mr-1"
            @click="selectedAdvTab = 'templates'"
          >
            {{ t('liturgy.preview_adv_tab_templates') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedAdvTab === 'scheduled' ? 'flat' : 'text'"
            :color="selectedAdvTab === 'scheduled' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-3"
            @click="selectedAdvTab = 'scheduled'"
          >
            {{ t('liturgy.preview_adv_tab_scheduled') }}
          </v-btn>
        </div>
      </div>

      <!-- Preview de Templates -->
      <div v-if="selectedAdvTab === 'templates'" class="preview-inner-bg rounded-lg pa-3">
        <v-row dense>
          <v-col cols="12" sm="6">
            <div class="mock-template-card pa-3 rounded-lg d-flex flex-column justify-space-between h-100">
              <div class="mb-2">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                    {{ t('liturgy.preview_template_1_title') }}
                  </span>
                  <v-chip size="x-small" color="primary" variant="tonal">
                    8 itens
                  </v-chip>
                </div>
                <p class="text-caption opacity-70 mb-0" style="font-size: 0.75rem; line-height: 1.3;">
                  {{ t('liturgy.preview_template_1_desc') }}
                </p>
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-check"
                class="text-none font-weight-bold align-self-start"
              >
                {{ t('liturgy.preview_template_apply_btn') }}
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="mock-template-card pa-3 rounded-lg d-flex flex-column justify-space-between h-100">
              <div class="mb-2">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                    {{ t('liturgy.preview_template_2_title') }}
                  </span>
                  <v-chip size="x-small" color="primary" variant="tonal">
                    6 itens
                  </v-chip>
                </div>
                <p class="text-caption opacity-70 mb-0" style="font-size: 0.75rem; line-height: 1.3;">
                  {{ t('liturgy.preview_template_2_desc') }}
                </p>
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-check"
                class="text-none font-weight-bold align-self-start"
              >
                {{ t('liturgy.preview_template_apply_btn') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Preview de Itens Agendados -->
      <div v-else class="preview-inner-bg rounded-lg pa-3">
        <v-row dense>
          <v-col cols="12" sm="6">
            <div class="mock-template-card pa-3 rounded-lg">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                  {{ t('liturgy.preview_sched_1_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="success"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Sincronizado
                </v-chip>
              </div>
              <p class="text-caption opacity-70 mb-2" style="font-size: 0.75rem;">
                {{ t('liturgy.preview_sched_1_desc') }}
              </p>
              <div class="d-flex align-center text-caption font-weight-medium opacity-80" style="font-size: 0.72rem;">
                <v-icon size="14" color="success" class="mr-1">
                  mdi-calendar-check
                </v-icon>
                Vídeo deste sábado configurado
              </div>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="mock-template-card pa-3 rounded-lg">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">
                  {{ t('liturgy.preview_sched_2_title') }}
                </span>
                <v-chip
                  size="x-small"
                  color="success"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Trimestral
                </v-chip>
              </div>
              <p class="text-caption opacity-70 mb-2" style="font-size: 0.75rem;">
                {{ t('liturgy.preview_sched_2_desc') }}
              </p>
              <div class="d-flex align-center text-caption font-weight-medium opacity-80" style="font-size: 0.72rem;">
                <v-icon size="14" color="success" class="mr-1">
                  mdi-calendar-check
                </v-icon>
                13 vídeos cadastrados no trimestre
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 5. Bloco de Notas Integrado -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-note-text-outline" class="mr-2" size="22" />
      {{ t('liturgy.notes_title') }}
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('liturgy.notes_desc')" />

    <!-- Mockup 5: Bloco de Notas Formatado -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-notebook-outline" size="16" class="mr-1 text-primary" />
          {{ t('liturgy.preview_notes_title') }}
        </span>
        <v-chip size="x-small" variant="tonal" color="primary">
          Texto Enriquecido
        </v-chip>
      </div>

      <div class="mock-notes-container rounded-lg pa-4">
        <!-- Toolbar simulada do editor -->
        <div class="d-flex align-center gap-1 pb-3 mb-3 border-b-subtle opacity-70">
          <v-icon size="16">
            mdi-format-bold
          </v-icon>
          <v-icon size="16">
            mdi-format-italic
          </v-icon>
          <v-icon size="16">
            mdi-format-underlined
          </v-icon>
          <v-divider vertical class="mx-2" style="height: 14px;" />
          <v-icon size="16">
            mdi-format-list-bulleted
          </v-icon>
          <v-icon size="16">
            mdi-format-list-numbered
          </v-icon>
        </div>

        <!-- Conteúdo Simulado das Notas -->
        <div class="d-flex flex-column gap-2 text-body-2" style="color: var(--sidebar-text); line-height: 1.5;">
          <div class="d-flex align-start">
            <span class="text-primary font-weight-bold mr-2">•</span>
            <span>{{ t('liturgy.preview_notes_sample_line1') }}</span>
          </div>
          <div class="d-flex align-start">
            <span class="text-primary font-weight-bold mr-2">•</span>
            <span>{{ t('liturgy.preview_notes_sample_line2') }}</span>
          </div>
          <div class="d-flex align-start">
            <span class="text-primary font-weight-bold mr-2">•</span>
            <span><strong>{{ t('liturgy.preview_notes_sample_line3') }}</strong></span>
          </div>
          <div class="d-flex align-start">
            <span class="text-primary font-weight-bold mr-2">•</span>
            <span><em>{{ t('liturgy.preview_notes_sample_line4') }}</em></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualLiturgy",
  data: () => ({
    selectedDay: "saturday",
    selectedType: "music",
    selectedAdvTab: "templates" as "templates" | "scheduled",
    catCollapsed: false,
    item1Done: true,
    item2Done: false,
    item3Done: false,
    weekDays: [
      { value: "sunday", label: "Dom" },
      { value: "monday", label: "Seg" },
      { value: "tuesday", label: "Ter" },
      { value: "wednesday", label: "Qua" },
      { value: "thursday", label: "Qui" },
      { value: "friday", label: "Sex" },
      { value: "saturday", label: "Sáb" },
    ],
  }),
  computed: {
    activeDayLabel(): string {
      if (this.selectedDay === "custom") {
        return (this as any).$t("modules.liturgy.days.custom");
      }
      const found = this.weekDays.find((d) => d.value === this.selectedDay);
      return found ? found.label : "Sáb";
    },
    dayDescription(): string {
      if (this.selectedDay === "saturday") return "Culto Divino e Escola Sabatina principal da congregação.";
      if (this.selectedDay === "wednesday") return "Culto de Oração e Estudo das Escrituras.";
      if (this.selectedDay === "sunday") return "Culto de Evangelismo ou Treinamento de Domingo.";
      if (this.selectedDay === "custom") return "Programação especial avulsa (ex: Semana de Oração ou Casamento).";
      return "Programação semanal da igreja.";
    },
    daySubtext(): string {
      if (this.selectedDay === "saturday") return "Dia principal";
      if (this.selectedDay === "custom") return "Permanente";
      return "Dia regular";
    },
    itemTypesList(): Array<{ id: string; title: string; icon: string; color: string; desc: string }> {
      return [
        {
          id: "music",
          title: "Música",
          icon: "mdi-music-note",
          color: "#4caf50",
          desc: "Músicas do Hinário e coletâneas (cantado/playback).",
        },
        {
          id: "collection_item",
          title: "Coletâneas",
          icon: "mdi-music-box-multiple",
          color: "#009688",
          desc: "Coletâneas personalizadas ou vídeos do YouTube.",
        },
        {
          id: "verse",
          title: "Bíblia",
          icon: "mdi-book-open-variant",
          color: "#9c27b0",
          desc: "Passagem bíblica para leitura e projeção.",
        },
        {
          id: "file",
          title: "Mídia e Arquivos",
          icon: "mdi-folder-file-outline",
          color: "#607d8b",
          desc: "Vídeos, áudios, slides PPTX ou PDFs unificados.",
        },
        {
          id: "link",
          title: "Link Web",
          icon: "mdi-link",
          color: "#3f51b5",
          desc: "URL para abertura rápida no navegador.",
        },
        {
          id: "scheduled_item",
          title: "Item Agendado",
          icon: "mdi-calendar-check",
          color: "#673ab7",
          desc: "Vídeo inteligente vinculado por data.",
        },
        {
          id: "annotation",
          title: "Anotação",
          icon: "mdi-text",
          color: "#03a9f4",
          desc: "Texto informativo (ex: Oração, Doxologia).",
        },
        {
          id: "category",
          title: "Categoria",
          icon: "mdi-tag",
          color: "#ff9800",
          desc: "Separador visual e agrupador de blocos.",
        },
      ];
    },
    currentTypeDetail(): { title: string; icon: string; color: string; usage: string; badge: string } {
      const details: Record<string, { title: string; icon: string; color: string; usage: string; badge: string }> = {
        music: {
          title: "Música (Hinário & Coletâneas)",
          icon: "mdi-music-note",
          color: "#4caf50",
          usage: "Seleção de hinos do Hinário e músicas das coletâneas do acervo com execução de áudio (cantado/playback) e projeção da letra sincronizada.",
          badge: "Hinário & Coletâneas",
        },
        collection_item: {
          title: "Coletâneas Online e Personalizadas",
          icon: "mdi-music-box-multiple",
          color: "#009688",
          usage: "Permite adicionar músicas avulsas de suas coletâneas locais ou vídeos online do YouTube diretamente à ordem do culto.",
          badge: "Coletâneas & YouTube",
        },
        verse: {
          title: "Bíblia (Versículo)",
          icon: "mdi-book-open-variant",
          color: "#9c27b0",
          usage: "Abre o versículo diretamente no telão com apenas um clique.",
          badge: "Projeção Direta",
        },
        file: {
          title: "Mídia e Arquivos",
          icon: "mdi-folder-file-outline",
          color: "#607d8b",
          usage: "Unifica todo tipo de arquivo externo: vídeos, áudios, slides PPTX, PDFs ou documentos do computador com detecção inteligente de tipo.",
          badge: "Arquivos Unificados",
        },
        link: {
          title: "Link Web",
          icon: "mdi-link",
          color: "#3f51b5",
          usage: "Abre páginas da internet e formulários no seu navegador padrão.",
          badge: "Navegador",
        },
        scheduled_item: {
          title: "Item Agendado",
          icon: "mdi-calendar-check",
          color: "#673ab7",
          usage: "Identifica a data do sábado atual e roda automaticamente o vídeo programado.",
          badge: "Automação",
        },
        annotation: {
          title: "Anotação",
          icon: "mdi-text",
          color: "#03a9f4",
          usage: "Texto simples na ordem do culto para momentos que não necessitam de arquivo em tela.",
          badge: "Informativo",
        },
        category: {
          title: "Categoria",
          icon: "mdi-tag",
          color: "#ff9800",
          usage: "Agrupa itens em blocos (ex: Escola Sabatina), permitindo recolher e expandir.",
          badge: "Separador",
        },
      };

      return details[this.selectedType] || details.music;
    },
  },
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
    resetAllChecks() {
      this.item1Done = false;
      this.item2Done = false;
      this.item3Done = false;
    },
  },
});
</script>

<style scoped>
.manual-preview-card {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  user-select: none;
  -webkit-user-select: none;
}

.preview-inner-bg {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.mode-switch-container {
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid rgba(128, 128, 128, 0.15);
}

.mock-day-selector {
  background: rgba(128, 128, 128, 0.12);
  border: 1px solid rgba(128, 128, 128, 0.15);
}

/* Tipos de Itens Cards */
.mock-type-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.mock-type-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.mock-type-card.active {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.06);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
}

.mock-type-icon-box {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.mock-selected-type-banner {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

/* Timeline e Itens */
.mock-liturgy-timeline {
  position: relative;
}

.mock-timeline-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.25s ease;
}

.mock-timeline-dot.category-dot {
  background: var(--v-theme-primary);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.2);
}

.mock-timeline-dot.item-dot.done {
  background: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.mock-timeline-dot.item-dot.next {
  background: #0097d7;
  box-shadow: 0 0 0 4px rgba(0, 151, 215, 0.3);
  animation: pulse-ring 2s infinite;
}

.mock-timeline-dot.item-dot.pending {
  background: rgba(128, 128, 128, 0.2);
  border: 2px solid rgba(128, 128, 128, 0.4);
}

.pulse-core {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
}

.pending-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.6);
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(0, 151, 215, 0.5); }
  70% { box-shadow: 0 0 0 7px rgba(0, 151, 215, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 151, 215, 0); }
}

.mock-category-card {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.mock-item-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.mock-item-card.item-active {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
}

.mock-item-card.item-done {
  opacity: 0.55;
}

.mock-item-card.item-done .item-title {
  text-decoration: line-through;
}

.mock-placeholder-border {
  border: 1px dashed rgba(255, 152, 0, 0.5) !important;
  background: rgba(255, 152, 0, 0.04) !important;
}

/* Templates & Scheduled Cards */
.mock-template-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Bloco de notas */
.mock-notes-container {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.border-b-subtle {
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}

.min-width-0 {
  min-width: 0;
}
</style>
