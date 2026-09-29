<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('bible.intro')" />

    <!-- 1. Exibindo Passagens Bíblicas: Navegação e Versões -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-book-open-page-variant-outline" class="mr-2" size="22" />
      {{ t('bible.nav_title') }}
    </h3>
    <p class="mb-4" v-html="t('bible.nav_p1')" />
    <p class="mb-4" v-html="t('bible.nav_p2')" />

    <!-- Mockup: Navegação de Livros com Capítulos Encapsulados -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-book-open-outline" size="16" class="mr-1 text-primary" />
          {{ t('bible.preview_nav_title') }}
        </span>

        <!-- Seletor de Versão Mockup -->
        <div class="d-flex align-center py-1 px-3 rounded-lg preview-inner-bg">
          <v-icon size="16" color="primary" class="mr-1">
            mdi-translate
          </v-icon>
          <span class="text-caption font-weight-bold text-truncate" style="max-width: 220px; color: var(--sidebar-text);">
            {{ t('bible.preview_version_name') }}
          </span>
          <v-icon size="14" class="ml-1 opacity-60">
            mdi-chevron-down
          </v-icon>
        </div>
      </div>

      <!-- Container do Card Livros exatamente no padrão real da aplicação -->
      <div class="d-flex justify-center">
        <div class="mock-nav-card pa-3 rounded-xl w-100" style="max-width: 360px;">
          <div class="text-subtitle-2 font-weight-bold mb-3 px-1" style="color: var(--sidebar-text);">
            {{ $t('modules.bible.books') }}
          </div>

          <div class="d-flex flex-column gap-1">
            <!-- Livro 1: Gênesis (Expandido com capítulos encapsulados) -->
            <div
              class="mock-book-row px-3 py-2 rounded-lg d-flex align-center justify-space-between"
              :class="{ 'expanded': expandedNavBook === 'genesis' }"
              @click="toggleNavBook('genesis')"
            >
              <span class="font-weight-medium text-body-2" style="color: var(--sidebar-text);">Gênesis</span>
              <span class="text-caption font-weight-bold text-primary">Gn</span>
            </div>

            <!-- Grade de Capítulos Encapsulada dentro do Livro -->
            <v-expand-transition>
              <div
                v-if="expandedNavBook === 'genesis'"
                class="mock-chapters-panel pa-3 rounded-lg mb-1"
              >
                <div class="mock-chapters-grid">
                  <div
                    v-for="ch in 28"
                    :key="ch"
                    class="mock-ch-box d-flex align-center justify-center rounded-md"
                    :class="{ 'selected': ch === 1 }"
                  >
                    {{ ch }}
                  </div>
                </div>
              </div>
            </v-expand-transition>

            <!-- Livro 2: Êxodo -->
            <div
              class="mock-book-row px-3 py-2 rounded-lg d-flex align-center justify-space-between"
              :class="{ 'expanded': expandedNavBook === 'exodo' }"
              @click="toggleNavBook('exodo')"
            >
              <span class="font-weight-medium text-body-2" style="color: var(--sidebar-text);">Êxodo</span>
              <span class="text-caption font-weight-bold text-primary">Ex</span>
            </div>

            <!-- Livro 3: Levítico -->
            <div
              class="mock-book-row px-3 py-2 rounded-lg d-flex align-center justify-space-between"
              :class="{ 'expanded': expandedNavBook === 'levitico' }"
              @click="toggleNavBook('levitico')"
            >
              <span class="font-weight-medium text-body-2" style="color: var(--sidebar-text);">Levítico</span>
              <span class="text-caption font-weight-bold text-primary">Lv</span>
            </div>

            <!-- Livro 4: Números -->
            <div
              class="mock-book-row px-3 py-2 rounded-lg d-flex align-center justify-space-between"
              :class="{ 'expanded': expandedNavBook === 'numeros' }"
              @click="toggleNavBook('numeros')"
            >
              <span class="font-weight-medium text-body-2" style="color: var(--sidebar-text);">Números</span>
              <span class="text-caption font-weight-bold text-primary">Nm</span>
            </div>

            <!-- Livro 5: Deuteronômio -->
            <div
              class="mock-book-row px-3 py-2 rounded-lg d-flex align-center justify-space-between"
              :class="{ 'expanded': expandedNavBook === 'deuteronomio' }"
              @click="toggleNavBook('deuteronomio')"
            >
              <span class="font-weight-medium text-body-2" style="color: var(--sidebar-text);">Deuteronômio</span>
              <span class="text-caption font-weight-bold text-primary">Dt</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Barra de Pesquisa e Seleção de Versículos (REF / TEX) -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-text-box-search-outline" class="mr-2" size="22" />
      {{ t('bible.search_bar_title') }}
    </h3>
    <p class="mb-4" v-html="t('bible.search_bar_intro')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('bible.mode_ref')" />
        <ul class="mt-2 pl-4" style="list-style-type: circle;">
          <li class="mb-1" v-html="t('bible.mode_ref_book')" />
          <li class="mb-1" v-html="t('bible.mode_ref_chapter')" />
          <li class="mb-1" v-html="t('bible.mode_ref_verses')" />
          <li v-html="t('bible.mode_ref_enter')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('bible.mode_tex')" />
        <ul class="mt-2 pl-4" style="list-style-type: circle;">
          <li class="mb-1" v-html="t('bible.mode_tex_words')" />
          <li v-html="t('bible.mode_tex_wildcard')" />
        </ul>
      </li>
    </ul>

    <!-- Mockup Interativo: Modos da Barra de Pesquisa -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-tune" size="16" class="mr-1 text-primary" />
          {{ t('bible.preview_search_bar_title') }}
        </span>

        <!-- Switch Segmentado Interativo REF / TEX -->
        <div class="d-flex align-center rounded-lg pa-1 mode-switch-container">
          <v-btn
            size="x-small"
            :variant="selectedSearchMode === 'REF' ? 'flat' : 'text'"
            :color="selectedSearchMode === 'REF' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-3 mr-1"
            @click="selectedSearchMode = 'REF'"
          >
            {{ t('bible.preview_mode_ref_btn') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedSearchMode === 'TEX' ? 'flat' : 'text'"
            :color="selectedSearchMode === 'TEX' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-3"
            @click="selectedSearchMode = 'TEX'"
          >
            {{ t('bible.preview_mode_tex_btn') }}
          </v-btn>
        </div>
      </div>

      <!-- Preview do Modo REF -->
      <div v-if="selectedSearchMode === 'REF'" class="preview-inner-bg rounded-lg pa-4">
        <div class="text-caption mb-2 opacity-70">
          {{ t('bible.preview_ref_label') }}
        </div>

        <!-- Barra de Busca Mockup com Switch Integrado -->
        <div class="mock-search-input rounded-xl pa-2 px-3 d-flex align-center mb-4">
          <v-icon size="20" color="primary" class="mr-2">
            mdi-magnify
          </v-icon>
          <span class="text-body-2 font-weight-bold text-primary mr-1">
            {{ t('bible.preview_ref_input') }}
          </span>
          <span class="mock-blinking-cursor">|</span>
          <v-spacer />
          <!-- Mini switch visual embutido -->
          <div class="d-flex align-center rounded-pill px-2 py-1 mock-mini-switch">
            <span class="text-caption font-weight-bold text-primary mr-1">REF</span>
            <span class="text-caption opacity-40">TEX</span>
          </div>
        </div>

        <!-- Passos do Autocomplete Guiado -->
        <div class="d-flex flex-wrap gap-2 align-center justify-space-between mb-3">
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              class="font-weight-medium"
            >
              <v-icon start size="14">
                mdi-numeric-1-circle
              </v-icon>
              {{ t('bible.preview_ref_step_1') }}
            </v-chip>
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              class="font-weight-medium"
            >
              <v-icon start size="14">
                mdi-numeric-2-circle
              </v-icon>
              {{ t('bible.preview_ref_step_2') }}
            </v-chip>
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              class="font-weight-medium"
            >
              <v-icon start size="14">
                mdi-numeric-3-circle
              </v-icon>
              {{ t('bible.preview_ref_step_3') }}
            </v-chip>
          </div>

          <div class="d-flex align-center">
            <kbd class="keycap mr-2">ENTER</kbd>
            <span class="text-caption opacity-70">{{ t('bible.preview_ref_press_enter') }}</span>
          </div>
        </div>
      </div>

      <!-- Preview do Modo TEX -->
      <div v-else class="preview-inner-bg rounded-lg pa-4">
        <div class="text-caption mb-2 opacity-70">
          {{ t('bible.preview_tex_label') }}
        </div>

        <!-- Barra de Busca Mockup com Switch Integrado -->
        <div class="mock-search-input rounded-xl pa-2 px-3 d-flex align-center mb-4">
          <v-icon size="20" color="primary" class="mr-2">
            mdi-text-search
          </v-icon>
          <span class="text-body-2 font-weight-bold text-primary mr-1">
            {{ t('bible.preview_tex_input') }}
          </span>
          <span class="mock-blinking-cursor">|</span>
          <v-spacer />
          <!-- Mini switch visual embutido -->
          <div class="d-flex align-center rounded-pill px-2 py-1 mock-mini-switch">
            <span class="text-caption opacity-40 mr-1">REF</span>
            <span class="text-caption font-weight-bold text-primary">TEX</span>
          </div>
        </div>

        <!-- Resultado Instantâneo da Varredura -->
        <div class="mock-tex-result-card rounded-lg pa-3">
          <div class="d-flex align-center justify-space-between mb-1">
            <v-chip
              size="x-small"
              color="primary"
              variant="flat"
              class="font-weight-bold"
            >
              {{ t('bible.preview_tex_result_ref') }}
            </v-chip>
            <span class="text-caption opacity-50">ARA</span>
          </div>
          <p class="text-body-2 mb-0" style="color: var(--sidebar-text);">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="highlightTexSample" />
          </p>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Seleção Múltipla e Projeção no Telão -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-checkbox-multiple-marked-outline" class="mr-2" size="22" />
      {{ t('bible.multi_proj_title') }}
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('bible.multi_proj_p1')" />
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      {{ t('bible.multi_proj_p2') }}
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('bible.multi_mode_marker')" />
      <li class="mb-2" v-html="t('bible.multi_mode_keyboard')" />
      <li class="mb-2">
        <span v-html="t('bible.multi_mode_search')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li class="mb-1" v-html="t('bible.seq_1_3')" />
          <li class="mb-1" v-html="t('bible.seq_1_comma_3')" />
          <li v-html="t('bible.seq_1_3_comma_5')" />
        </ul>
      </li>
    </ul>

    <!-- Mockup Interativo: Padrões de Seleção Múltipla com Marcadores -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <div class="d-flex align-center">
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
            class="font-weight-bold mr-2"
          >
            <v-icon start size="16">
              mdi-checkbox-multiple-marked
            </v-icon>
            {{ $t('modules.bible.multi_select') }}
          </v-chip>
          <span class="text-caption font-weight-bold text-uppercase opacity-70">
            {{ t('bible.preview_multi_title') }}
          </span>
        </div>

        <!-- Seletor dos Padrões de Seleção -->
        <div class="d-flex align-center rounded-lg pa-1 mode-switch-container">
          <v-btn
            size="x-small"
            :variant="selectedMultiMode === 'single' ? 'flat' : 'text'"
            :color="selectedMultiMode === 'single' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-2 mr-1"
            @click="selectedMultiMode = 'single'"
          >
            {{ t('bible.preview_multi_tab_single') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedMultiMode === 'range' ? 'flat' : 'text'"
            :color="selectedMultiMode === 'range' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-2 mr-1"
            @click="selectedMultiMode = 'range'"
          >
            {{ t('bible.preview_multi_tab_range') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedMultiMode === 'alternate' ? 'flat' : 'text'"
            :color="selectedMultiMode === 'alternate' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-2"
            @click="selectedMultiMode = 'alternate'"
          >
            {{ t('bible.preview_multi_tab_alternate') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- Lista de Versículos com Marcadores / Checkboxes visuais -->
        <div class="d-flex flex-column gap-2 mb-3">
          <div
            v-for="item in currentVerseList"
            :key="item.number"
            class="mock-verse-item pa-3 rounded-lg d-flex align-start cursor-pointer"
            :class="{ 'selected': isVerseSelected(item.number) }"
          >
            <!-- Marcador / Checkbox -->
            <div class="mr-3 mt-1 d-flex align-center flex-shrink-0">
              <v-icon
                size="20"
                :color="isVerseSelected(item.number) ? 'primary' : 'grey'"
              >
                {{ isVerseSelected(item.number) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
              </v-icon>
            </div>
            <div class="mock-verse-badge rounded-md mr-3 d-flex align-center justify-center font-weight-bold text-caption flex-shrink-0">
              {{ item.number }}
            </div>
            <div class="flex-grow-1 text-body-2" style="color: var(--sidebar-text); line-height: 1.5;">
              {{ item.text }}
            </div>
          </div>
        </div>

        <!-- Barra Inferior de Ação: Apenas Projetar Selecionados com Atalho -->
        <div class="d-flex align-center pt-2 border-t-subtle">
          <kbd class="keycap">Ctrl / <span class="cmd-symbol">⌘</span></kbd>
          <span class="shortcut-operator">+</span>
          <kbd class="keycap">Enter</kbd>
          <span class="text-caption ml-2 font-weight-bold text-primary">
            {{ t('bible.preview_btn_project') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Destaque: Busca Rápida Global da Bíblia -->
    <v-alert
      type="success"
      variant="tonal"
      class="mb-4 rounded-lg"
      density="comfortable"
    >
      <span v-html="t('bible.quick_search_alert')" />
    </v-alert>

    <!-- Mockup: Diálogo Flutuante de Busca Rápida Global -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-lightning-bolt" size="16" class="mr-1 text-primary" />
          {{ t('bible.preview_quick_dialog_title') }}
        </span>
        <div class="d-flex align-center">
          <kbd class="keycap">Ctrl / <span class="cmd-symbol">⌘</span></kbd>
          <span class="shortcut-operator">+</span>
          <kbd class="keycap">B</kbd>
        </div>
      </div>

      <div class="d-flex justify-center py-2">
        <div class="mock-dialog-card rounded-xl pa-4 w-100" style="max-width: 520px;">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2" size="20">
                mdi-book-search-outline
              </v-icon>
              <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('bible.preview_quick_dialog_header') }}
              </span>
            </div>
            <v-chip size="x-small" variant="tonal" color="grey">
              {{ t('bible.preview_quick_dialog_esc') }}
            </v-chip>
          </div>

          <!-- Campo de Busca no Diálogo -->
          <div class="mock-search-input rounded-lg pa-2 px-3 d-flex align-center mb-3">
            <v-icon size="18" class="mr-2 text-primary">
              mdi-magnify
            </v-icon>
            <span class="text-body-2 font-weight-bold text-primary">
              {{ t('bible.preview_quick_dialog_input') }}
            </span>
            <span class="mock-blinking-cursor">|</span>
          </div>

          <!-- Preview do Versículo Encontrado -->
          <div class="mock-tex-result-card rounded-lg pa-3 mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption font-weight-bold text-primary">
                {{ t('bible.preview_quick_dialog_result_ref') }}
              </span>
              <span class="text-caption opacity-50">ARA</span>
            </div>
            <p class="text-body-2 mb-0" style="color: var(--sidebar-text); font-style: italic;">
              "{{ t('bible.preview_quick_dialog_result_text') }}"
            </p>
          </div>

          <div class="d-flex align-center justify-end">
            <kbd class="keycap mr-2">ENTER</kbd>
            <span class="text-caption opacity-70">{{ t('bible.preview_quick_dialog_hint') }}</span>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 4. Personalização da Projeção -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-palette-outline" class="mr-2" size="22" />
      {{ t('bible.custom_title') }}
    </h3>
    <p class="mb-4" v-html="t('bible.custom_p1')" />
    <p class="mb-4">
      {{ t('bible.custom_p2') }}
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('bible.custom_bg')" />
      <li class="mb-2" v-html="t('bible.custom_text')" />
      <li class="mb-2" v-html="t('bible.custom_ref')" />
    </ul>

    <!-- Mockup Interativo: Personalização e Preview de Telão (16:9) -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3 gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-monitor-dashboard" size="16" class="mr-1 text-primary" />
          {{ t('bible.preview_custom_box_title') }}
        </span>

        <!-- Seletor de Temas Visuais -->
        <div class="d-flex align-center rounded-lg pa-1 mode-switch-container">
          <v-btn
            size="x-small"
            :variant="selectedTheme === 'dark' ? 'flat' : 'text'"
            :color="selectedTheme === 'dark' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-2 mr-1"
            @click="selectedTheme = 'dark'"
          >
            {{ t('bible.preview_theme_dark') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedTheme === 'blue' ? 'flat' : 'text'"
            :color="selectedTheme === 'blue' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-2 mr-1"
            @click="selectedTheme = 'blue'"
          >
            {{ t('bible.preview_theme_blue') }}
          </v-btn>
          <v-btn
            size="x-small"
            :variant="selectedTheme === 'image' ? 'flat' : 'text'"
            :color="selectedTheme === 'image' ? 'primary' : ''"
            class="text-none font-weight-medium rounded-md px-2"
            @click="selectedTheme = 'image'"
          >
            {{ t('bible.preview_theme_image') }}
          </v-btn>
        </div>
      </div>

      <!-- Caixa de Preview do Telão (16:9) -->
      <div class="d-flex justify-center mb-4">
        <div
          class="mock-projection-screen rounded-xl overflow-hidden d-flex flex-column justify-center pa-6 position-relative"
          :class="`theme-${selectedTheme}`"
          :style="projectionScreenStyle"
        >
          <!-- Versículo Projetado -->
          <div class="mock-screen-verse-text mb-4 text-center">
            "{{ t('bible.preview_sample_verse_display') }}"
          </div>

          <!-- Referência Projetada -->
          <div class="mock-screen-ref text-right">
            — {{ t('bible.preview_sample_ref_display') }}
          </div>
        </div>
      </div>

      <!-- Controles do Painel de Customização Mockup -->
      <div class="preview-inner-bg rounded-lg pa-3">
        <v-row dense align="center">
          <v-col cols="12" sm="3">
            <div class="d-flex align-center">
              <v-icon size="16" color="primary" class="mr-2">
                mdi-format-size
              </v-icon>
              <span class="text-caption font-weight-medium" style="color: var(--sidebar-text);">
                {{ $t('modules.bible.font_size') }}: <strong>15%</strong>
              </span>
            </div>
          </v-col>
          <v-col cols="12" sm="3">
            <div class="d-flex align-center">
              <v-icon size="16" color="primary" class="mr-2">
                mdi-format-color-text
              </v-icon>
              <span class="text-caption font-weight-medium mr-2" style="color: var(--sidebar-text);">
                {{ $t('modules.bible.font_color') }}:
              </span>
              <div class="mock-color-circle" :style="{ background: selectedThemeColor }" />
            </div>
          </v-col>
          <v-col cols="12" sm="3">
            <div class="d-flex align-center">
              <v-icon size="16" color="primary" class="mr-2">
                mdi-format-align-center
              </v-icon>
              <span class="text-caption font-weight-medium" style="color: var(--sidebar-text);">
                {{ $t('modules.bible.text_align') }}: <strong>Centro</strong>
              </span>
            </div>
          </v-col>
          <v-col cols="12" sm="3">
            <div class="d-flex align-center justify-sm-end">
              <v-icon size="16" color="primary" class="mr-2">
                {{ selectedTheme === 'image' ? 'mdi-image-outline' : 'mdi-format-color-fill' }}
              </v-icon>
              <span class="text-caption font-weight-medium" style="color: var(--sidebar-text);">
                {{ selectedTheme === 'image' ? $t('modules.bible.bg_image') : $t('modules.bible.proj_background') }}
              </span>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import bibleBgSample from "@/assets/images/bible_bg_sample.jpg";

export default defineComponent({
  name: "ManualBible",
  data: () => ({
    expandedNavBook: "genesis",
    selectedSearchMode: "REF" as "REF" | "TEX",
    selectedMultiMode: "range" as "single" | "range" | "alternate",
    selectedTheme: "dark" as "dark" | "blue" | "image",
    bibleBgSample,
  }),
  computed: {
    projectionScreenStyle(): Record<string, string> {
      if (this.selectedTheme === "image") {
        return {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.65)), url('${this.bibleBgSample}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        };
      }
      return {};
    },
    highlightTexSample(): string {
      const fullText = this.t("bible.preview_tex_result_text");
      return fullText
        .replace(/Deus|Dios/gi, (match) => `<mark class="mock-highlight">${match}</mark>`)
        .replace(/mundo/gi, (match) => `<mark class="mock-highlight">${match}</mark>`);
    },
    currentVerseList(): Array<{ number: number; text: string }> {
      if (this.selectedMultiMode === "single") {
        return [
          { number: 16, text: this.t("bible.preview_verse_16") },
        ];
      }
      return [
        { number: 1, text: this.t("bible.preview_verse_1") },
        { number: 2, text: this.t("bible.preview_verse_2") },
        { number: 3, text: this.t("bible.preview_verse_3") },
        { number: 4, text: this.t("bible.preview_verse_4") },
        { number: 5, text: this.t("bible.preview_verse_5") },
      ];
    },
    selectedThemeColor(): string {
      if (this.selectedTheme === "blue") return "#e6f1ff";
      return "#ffffff";
    },
  },
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
    toggleNavBook(bookId: string) {
      if (this.expandedNavBook === bookId) {
        this.expandedNavBook = "";
      } else {
        this.expandedNavBook = bookId;
      }
    },
    isVerseSelected(verseNum: number): boolean {
      if (this.selectedMultiMode === "single") {
        return verseNum === 16;
      }
      if (this.selectedMultiMode === "range") {
        return verseNum >= 1 && verseNum <= 3;
      }
      if (this.selectedMultiMode === "alternate") {
        return [1, 3, 5].includes(verseNum);
      }
      return false;
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

/* Mockup Navegação Encapsulada (Estilo idêntico ao da aplicação) */
.mock-nav-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.mock-book-row {
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.mock-book-row:hover,
.mock-book-row.expanded {
  background: rgba(128, 128, 128, 0.08);
}

.mock-chapters-panel {
  background: var(--main-bg, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.1));
}

.mock-chapters-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  justify-content: center;
}

.mock-ch-box {
  height: 32px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sidebar-text);
  background: rgba(128, 128, 128, 0.1);
  transition: all 0.2s ease;
  cursor: default;
}

.mock-ch-box.selected {
  background: var(--v-theme-primary, #0097d7) !important;
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(var(--v-theme-primary), 0.4);
}

.mock-search-input {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mock-mini-switch {
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid rgba(128, 128, 128, 0.2);
}

.mock-blinking-cursor {
  animation: blink 1s infinite;
  color: var(--v-theme-primary);
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.mock-tex-result-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.mock-highlight) {
  background: rgba(var(--v-theme-primary), 0.25);
  color: var(--sidebar-text);
  font-weight: 700;
  padding: 0 4px;
  border-radius: 4px;
}

.mock-verse-item {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
  transition: all 0.2s ease;
}

.mock-verse-item.selected {
  background: rgba(var(--v-theme-primary), 0.12);
  border-color: rgba(var(--v-theme-primary), 0.35);
}

.mock-verse-badge {
  width: 24px;
  height: 24px;
  background: rgba(128, 128, 128, 0.15);
  color: var(--sidebar-text);
}

.mock-verse-item.selected .mock-verse-badge {
  background: var(--v-theme-primary);
  color: #ffffff;
}

.mock-dialog-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.mock-projection-screen {
  width: 100%;
  max-width: 580px;
  aspect-ratio: 16 / 9;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.mock-projection-screen.theme-dark {
  background-color: #000000;
  color: #ffffff;
}
.mock-projection-screen.theme-dark .mock-screen-ref {
  color: #fb8c00;
}

.mock-projection-screen.theme-blue {
  background: linear-gradient(135deg, #09192f 0%, #0d274d 100%);
  color: #e6f1ff;
}
.mock-projection-screen.theme-blue .mock-screen-ref {
  color: #64ffda;
}

.mock-projection-screen.theme-image {
  color: #ffffff;
}
.mock-projection-screen.theme-image .mock-screen-verse-text {
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.9);
}
.mock-projection-screen.theme-image .mock-screen-ref {
  color: #ffd166;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.95);
}

.mock-screen-verse-text {
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.5;
}

.mock-screen-ref {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.mock-color-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(128, 128, 128, 0.4);
}

.border-t-subtle {
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}

/* Keycaps */
.keycap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Symbol", "Apple Symbols", Roboto, "Helvetica Neue", Arial, sans-serif;
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.12);
  color: var(--sidebar-text);
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-bottom: 2px solid rgba(128, 128, 128, 0.4);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.cmd-symbol {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Symbol", "Apple Symbols", sans-serif;
  font-weight: 600;
  font-size: 1.05em;
  line-height: 1;
  display: inline-block;
}

.shortcut-operator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--sidebar-text);
  opacity: 0.45;
  margin: 0 5px;
  user-select: none;
  line-height: 1;
}
</style>
