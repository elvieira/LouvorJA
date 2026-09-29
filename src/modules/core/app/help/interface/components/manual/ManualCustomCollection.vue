<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('custom_collection.intro')" />

    <!-- 1. Biblioteca e Navegação de Coletâneas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-music-box-multiple" class="mr-2" size="22" />
      {{ t('custom_collection.preview_grid_title') }}
    </h3>
    <p class="mb-4">
      O Louvor JA permite visualizar todas as suas coletâneas personalizadas em uma grade moderna com capas visuais, além de acessar a lista de faixas de cada uma com um único clique:
    </p>

    <!-- Exemplo Visual 1: Alternância entre Grade da Biblioteca e Detalhes da Coletânea -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-view-dashboard-outline" size="16" class="mr-1 text-primary" />
          {{ viewMode === 'library' ? t('custom_collection.preview_mode_library') : t('custom_collection.preview_mode_detail') }}
        </span>
        <div class="d-flex align-center gap-1">
          <v-btn
            size="x-small"
            :color="viewMode === 'library' ? 'primary' : ''"
            :variant="viewMode === 'library' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="viewMode = 'library'"
          >
            {{ t('custom_collection.preview_mode_library') }}
          </v-btn>
          <v-btn
            size="x-small"
            :color="viewMode === 'detail' ? 'primary' : ''"
            :variant="viewMode === 'detail' ? 'flat' : 'tonal'"
            class="text-none font-weight-bold"
            @click="viewMode = 'detail'"
          >
            {{ t('custom_collection.preview_mode_detail') }}
          </v-btn>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- MODO GRADE / BIBLIOTECA -->
        <div v-if="viewMode === 'library'">
          <!-- Barra de Busca Ilustrativa -->
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
            <div class="mock-search-box rounded-xl d-flex align-center px-3 py-1 flex-grow-1" style="max-width: 380px;">
              <v-icon
                icon="mdi-magnify"
                size="18"
                color="primary"
                class="mr-2 opacity-70"
              />
              <span class="text-caption opacity-50 flex-grow-1">Buscar coletânea...</span>
              <v-icon icon="mdi-filter-variant" size="18" class="ml-2 opacity-60" />
            </div>

            <div class="mock-ui-btn rounded-lg pa-2 px-3 text-caption font-weight-bold d-flex align-center">
              <v-icon icon="mdi-plus" size="16" class="mr-1" />
              {{ $t('modules.custom_collection.new_collection') }}
            </div>
          </div>

          <!-- Grade de Coletâneas -->
          <v-row dense>
            <v-col
              v-for="col in sampleCollections"
              :key="col.id"
              cols="12"
              sm="4"
            >
              <div
                class="mock-collection-card rounded-lg pa-0 overflow-hidden cursor-pointer"
                :class="{ 'card-selected': selectedColId === col.id }"
                @click="selectedColId = col.id; viewMode = 'detail'"
              >
                <!-- Capa -->
                <div class="mock-card-cover" :style="{ background: col.gradient }">
                  <v-icon size="40" color="white" class="opacity-90">
                    {{ col.icon }}
                  </v-icon>
                  <div class="mock-card-options-btn">
                    <v-icon size="16" color="white">
                      mdi-dots-vertical
                    </v-icon>
                  </div>
                </div>

                <!-- Conteúdo -->
                <div class="pa-3">
                  <div class="font-weight-bold text-subtitle-2 text-truncate" style="color: var(--sidebar-text);">
                    {{ col.name }}
                  </div>
                  <div class="text-caption opacity-60 mt-1 d-flex align-center justify-space-between">
                    <span>{{ col.countText }}</span>
                    <span class="text-primary font-weight-medium">Ver faixas &rarr;</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- MODO DETALHES DA COLETÂNEA -->
        <div v-else>
          <!-- Cabeçalho da Coletânea -->
          <div class="d-flex align-center justify-space-between mb-4 pb-3 border-b-subtle flex-wrap gap-2">
            <div class="d-flex align-center">
              <div
                class="mock-back-btn rounded-circle pa-1 mr-2 d-flex align-center justify-center cursor-pointer"
                @click="viewMode = 'library'"
              >
                <v-icon size="18">
                  mdi-arrow-left
                </v-icon>
              </div>
              <div
                class="mock-mini-cover rounded-md mr-3 d-flex align-center justify-center text-white"
                :style="{ background: activeCollection.gradient, width: '36px', height: '36px' }"
              >
                <v-icon size="20">
                  {{ activeCollection.icon }}
                </v-icon>
              </div>
              <div>
                <div class="font-weight-bold text-subtitle-1" style="color: var(--sidebar-text); line-height: 1.2;">
                  {{ activeCollection.name }}
                </div>
                <div class="text-caption opacity-60">
                  {{ activeCollection.songs.length }} músicas cadastradas
                </div>
              </div>
            </div>

            <!-- Botões Ilustrativos do Cabeçalho -->
            <div class="d-flex align-center gap-2">
              <div class="mock-ui-btn-tonal rounded-lg pa-1 px-3 text-caption font-weight-bold d-flex align-center">
                <v-icon icon="mdi-play" size="16" class="mr-1" />
                {{ t('custom_collection.preview_btn_play_all') }}
              </div>
              <div class="mock-ui-btn rounded-lg pa-1 px-3 text-caption font-weight-bold d-flex align-center">
                <v-icon icon="mdi-plus" size="16" class="mr-1" />
                {{ t('custom_collection.preview_btn_add') }}
              </div>
            </div>
          </div>

          <!-- Lista de Faixas da Coletânea -->
          <div class="mock-song-list rounded-lg overflow-hidden">
            <div
              v-for="(song, idx) in activeCollection.songs"
              :key="song.id"
              class="mock-song-item d-flex align-center pa-2 px-3"
            >
              <!-- Número Sequencial -->
              <span class="mock-song-number text-caption font-weight-bold text-primary mr-3" style="min-width: 20px;">
                {{ Number(idx) + 1 }}
              </span>

              <!-- Informações da Música -->
              <div class="flex-grow-1 min-width-0 mr-2">
                <div class="text-body-2 font-weight-medium text-truncate" style="color: var(--sidebar-text);">
                  {{ song.title }}
                </div>
                <div class="text-caption opacity-50 text-truncate">
                  {{ song.details }}
                </div>
              </div>

              <!-- Duração -->
              <span class="text-caption opacity-60 mr-3 d-none d-sm-block">
                {{ song.duration }}
              </span>

              <!-- Botões de Ação por Faixa (Visual) -->
              <div class="d-flex align-center gap-1 opacity-80 pointer-events-none">
                <v-icon :color="song.hasAudio ? 'primary' : 'grey'" size="18" class="mx-1">
                  mdi-play-circle
                </v-icon>
                <v-icon :color="song.hasPlayback ? 'primary' : 'grey'" size="18" class="mx-1">
                  mdi-play-circle-outline
                </v-icon>
                <v-icon color="primary" size="18" class="mx-1">
                  mdi-monitor
                </v-icon>
                <v-icon color="primary" size="18" class="mx-1">
                  mdi-playlist-plus
                </v-icon>
                <v-icon size="16" class="mx-1 opacity-60">
                  mdi-dots-vertical
                </v-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Criação de Coletâneas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-folder-plus-outline" class="mr-2" size="22" />
      {{ t('custom_collection.create_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.create_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('custom_collection.step_1_title')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('custom_collection.step_1_name')" />
          <li v-html="t('custom_collection.step_1_cover')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('custom_collection.step_2_title')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('custom_collection.step_2_folder')" />
          <li v-html="t('custom_collection.step_2_song')" />
          <li v-html="t('custom_collection.step_2_empty')" />
        </ul>
      </li>
    </ul>

    <!-- Exemplo Visual 2: Assistente de Criação em 2 Etapas -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-wizard-hat" size="16" class="mr-1 text-primary" />
          {{ t('custom_collection.preview_wizard_title') }}
        </span>
        <div class="d-flex gap-1">
          <v-chip
            size="x-small"
            :color="wizardStep === 1 ? 'primary' : ''"
            :variant="wizardStep === 1 ? 'flat' : 'outlined'"
            class="font-weight-bold cursor-pointer"
            @click="wizardStep = 1"
          >
            {{ t('custom_collection.preview_wizard_step1_tab') }}
          </v-chip>
          <v-chip
            size="x-small"
            :color="wizardStep === 2 ? 'primary' : ''"
            :variant="wizardStep === 2 ? 'flat' : 'outlined'"
            class="font-weight-bold cursor-pointer"
            @click="wizardStep = 2"
          >
            {{ t('custom_collection.preview_wizard_step2_tab') }}
          </v-chip>
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <!-- ETAPA 1: NOME & CAPA -->
        <div v-if="wizardStep === 1" class="d-flex flex-column align-center text-center">
          <div class="text-caption font-weight-bold opacity-70 mb-3">
            {{ t('custom_collection.preview_wizard_cover_label') }}
          </div>

          <!-- Caixa Ilustrativa de Capa -->
          <div class="mock-cover-upload has-cover rounded-xl mb-4 d-flex flex-column align-center justify-center">
            <div class="mock-cover-preview w-100 h-100 d-flex flex-column align-center justify-center text-white">
              <v-icon size="36">
                mdi-music-box-multiple
              </v-icon>
              <span class="text-caption font-weight-bold mt-1">Capa da Coletânea</span>
            </div>
          </div>

          <!-- Campo Ilustrativo de Nome -->
          <div class="w-100" style="max-width: 320px;">
            <div class="text-caption font-weight-medium text-left mb-1 opacity-70">
              {{ t('custom_collection.preview_wizard_name_label') }}
            </div>
            <div class="mock-static-input w-100 rounded-lg pa-2 px-3 mb-4 text-left font-weight-medium text-body-2">
              Louvor Jovem 2026
            </div>

            <div class="mock-ui-btn rounded-lg pa-2 text-center text-caption font-weight-bold w-100 d-flex align-center justify-center">
              <span>{{ $t('modules.custom_collection.continue') }}</span>
              <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
            </div>
          </div>
        </div>

        <!-- ETAPA 2: ESCOLHER MODO DE PREENCHIMENTO -->
        <div v-else>
          <div class="text-caption font-weight-bold opacity-70 mb-3">
            {{ $t('modules.custom_collection.add_content_title') }}
          </div>

          <div class="d-flex flex-column gap-2 mb-4">
            <!-- Opção 1: Pasta Inteira -->
            <div class="mock-wizard-option selected rounded-xl pa-3 d-flex align-center">
              <div class="mock-option-icon rounded-lg mr-3 d-flex align-center justify-center">
                <v-icon color="primary" size="22">
                  mdi-folder-music
                </v-icon>
              </div>
              <div class="min-width-0">
                <div class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">
                  {{ t('custom_collection.preview_wizard_opt_folder_title') }}
                </div>
                <div class="text-caption opacity-60">
                  {{ t('custom_collection.preview_wizard_opt_folder_desc') }}
                </div>
              </div>
            </div>

            <!-- Opção 2: Adicionar uma Música -->
            <div class="mock-wizard-option rounded-xl pa-3 d-flex align-center">
              <div class="mock-option-icon rounded-lg mr-3 d-flex align-center justify-center">
                <v-icon color="primary" size="22">
                  mdi-file-music
                </v-icon>
              </div>
              <div class="min-width-0">
                <div class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">
                  {{ t('custom_collection.preview_wizard_opt_song_title') }}
                </div>
                <div class="text-caption opacity-60">
                  {{ t('custom_collection.preview_wizard_opt_song_desc') }}
                </div>
              </div>
            </div>

            <!-- Opção 3: Criar Vazia -->
            <div class="mock-wizard-option rounded-xl pa-3 d-flex align-center">
              <div class="mock-option-icon rounded-lg mr-3 d-flex align-center justify-center">
                <v-icon color="primary" size="22">
                  mdi-plus-box-outline
                </v-icon>
              </div>
              <div class="min-width-0">
                <div class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">
                  {{ t('custom_collection.preview_wizard_opt_empty_title') }}
                </div>
                <div class="text-caption opacity-60">
                  {{ t('custom_collection.preview_wizard_opt_empty_desc') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Gerenciamento de Músicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-music-box-multiple" class="mr-2" size="22" />
      {{ t('custom_collection.manage_songs_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.add_songs_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('custom_collection.add_catalog')" />
      <li class="mb-2" v-html="t('custom_collection.add_local_files')" />
      <li class="mb-3">
        <span v-html="t('custom_collection.song_actions_title')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('custom_collection.action_playback_options')" />
          <li v-html="t('custom_collection.action_queue')" />
          <li v-html="t('custom_collection.action_edit_media')" />
          <li v-html="t('custom_collection.action_remove')" />
        </ul>
      </li>
    </ul>

    <!-- 4. Busca e Filtros -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-filter-variant" class="mr-2" size="22" />
      {{ t('custom_collection.search_filter_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.search_desc')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('custom_collection.filter_collection_name')" />
      <li class="mb-2" v-html="t('custom_collection.filter_song_name')" />
    </ul>

    <!-- Exemplo Visual 3: Demonstração de Busca com Filtro -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-card-search-outline" size="16" class="mr-1 text-primary" />
          {{ t('custom_collection.preview_filter_title') }}
        </span>
        <span class="text-caption opacity-60">Exemplo ilustrativo</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- Demonstração da Barra com Menu de Filtro Aberto -->
        <v-row dense align="center">
          <v-col cols="12" sm="7">
            <div class="mock-search-box rounded-xl d-flex align-center px-3 py-2 mb-2">
              <v-icon
                icon="mdi-magnify"
                size="18"
                color="primary"
                class="mr-2 opacity-70"
              />
              <span class="text-body-2 font-weight-medium">Descansar</span>
              <v-icon
                icon="mdi-filter-variant"
                size="18"
                color="primary"
                class="ml-auto"
              />
            </div>

            <!-- Resultado encontrado -->
            <div class="mock-filter-results rounded-lg pa-2">
              <div class="d-flex align-center justify-space-between pa-2">
                <div>
                  <div class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                    Descansar
                  </div>
                  <div class="text-caption opacity-50">
                    Na coletânea: <strong>Louvor Jovem 2026</strong>
                  </div>
                </div>
                <div class="d-flex align-center gap-1 opacity-80 pointer-events-none">
                  <v-icon color="primary" size="18">
                    mdi-play-circle
                  </v-icon>
                  <v-icon color="primary" size="18">
                    mdi-play-circle-outline
                  </v-icon>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" sm="5">
            <!-- Menu de Filtros Flutuante Ilustrativo -->
            <div class="mock-filter-menu rounded-lg pa-3">
              <div class="text-caption font-weight-bold opacity-70 mb-2">
                {{ $t('modules.custom_collection.filter_search_by') }}
              </div>
              <div class="d-flex align-center text-caption font-weight-medium py-1 opacity-60">
                <v-icon size="16" icon="mdi-circle-outline" class="mr-2" />
                {{ t('custom_collection.preview_filter_opt_col') }}
              </div>
              <div class="d-flex align-center text-caption font-weight-bold text-primary py-1 bg-primary-subtle rounded px-2">
                <v-icon
                  size="16"
                  icon="mdi-check-circle"
                  color="primary"
                  class="mr-2"
                />
                {{ t('custom_collection.preview_filter_opt_song') }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Card de Destaque: Salvar Fila de Reprodução como Coletânea -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center mb-2">
        <v-icon
          icon="mdi-playlist-check"
          color="primary"
          size="22"
          class="mr-2"
        />
        <span class="font-weight-bold text-subtitle-2 text-primary">
          {{ t('custom_collection.preview_queue_save_title') }}
        </span>
      </div>
      <p class="text-body-2 mb-3" v-html="t('custom_collection.preview_queue_save_desc')" />
      <div class="d-flex align-center gap-2 flex-wrap text-caption opacity-80 bg-primary-subtle rounded-lg pa-3">
        <v-icon icon="mdi-lightbulb-on-outline" size="18" color="primary" />
        <span>Dica: Monte a ordem musical do culto na Fila de Reprodução e clique em <strong>"Salvar como Coletânea"</strong> para guardar a seleção completa para outras ocasiões!</span>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 5. Ações da Coletânea -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-cog-outline" class="mr-2" size="22" />
      {{ t('custom_collection.collection_actions_title') }}
    </h3>
    <p class="mb-4" v-html="t('custom_collection.collection_actions_desc')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface SampleSong {
  id: string;
  title: string;
  details: string;
  duration: string;
  hasAudio: boolean;
  hasPlayback: boolean;
}

interface SampleCollection {
  id: string;
  name: string;
  countText: string;
  icon: string;
  gradient: string;
  songs: SampleSong[];
}

export default defineComponent({
  name: "ManualCustomCollection",
  data() {
    return {
      viewMode: "library" as "library" | "detail",
      selectedColId: "col1",
      wizardStep: 1,

      sampleCollections: [
        {
          id: "col1",
          name: "Louvor Jovem 2026",
          countText: "4 músicas",
          icon: "mdi-fire",
          gradient: "linear-gradient(135deg, #0097d7 0%, #005b82 100%)",
          songs: [
            { id: "s1", title: "Descansar", details: "Arquivo local MP3 (Cantado + Playback)", duration: "3:45", hasAudio: true, hasPlayback: true },
            { id: "s2", title: "Grandes Coisas", details: "Acervo Oficial Louvor JA", duration: "4:12", hasAudio: true, hasPlayback: true },
            { id: "s3", title: "A Começar em Mim", details: "Arquivo SLJA sem trilha de voz", duration: "3:20", hasAudio: false, hasPlayback: true },
            { id: "s4", title: "Restaura em Mim", details: "Arquivo local MP3 (Cantado + Playback)", duration: "4:05", hasAudio: true, hasPlayback: true },
          ],
        },
        {
          id: "col2",
          name: "Músicas de Oração",
          countText: "3 músicas",
          icon: "mdi-hands-pray",
          gradient: "linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)",
          songs: [
            { id: "s5", title: "Em Espírito, em Verdade", details: "Acervo Oficial Louvor JA", duration: "3:50", hasAudio: true, hasPlayback: true },
            { id: "s6", title: "Quero Estar ao Pé da Cruz", details: "Arquivo local MP3", duration: "4:30", hasAudio: true, hasPlayback: true },
          ],
        },
        {
          id: "col3",
          name: "Coro & Grupo Vocal",
          countText: "2 músicas",
          icon: "mdi-account-group",
          gradient: "linear-gradient(135deg, #e65100 0%, #bf360c 100%)",
          songs: [
            { id: "s7", title: "Castelo Forte", details: "Coral Jovem Central", duration: "5:10", hasAudio: true, hasPlayback: true },
          ],
        },
      ] as SampleCollection[],
    };
  },
  computed: {
    activeCollection(): SampleCollection {
      return this.sampleCollections.find((c) => c.id === this.selectedColId) || this.sampleCollections[0];
    },
  },
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>

<style scoped>
.manual-section {
  color: var(--sidebar-text);
  line-height: 1.6;
}

.manual-preview-card {
  background: var(--v-theme-surface, rgba(128, 128, 128, 0.05));
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.preview-inner-bg {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.12));
}

.mock-search-box {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.mock-ui-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mock-ui-btn-tonal {
  background: rgba(var(--v-theme-primary), 0.12);
  color: var(--v-theme-primary);
}

.mock-back-btn {
  background: rgba(128, 128, 128, 0.1);
  color: var(--sidebar-text);
}

/* Cards da Coletânea */
.mock-collection-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.mock-collection-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.mock-collection-card.card-selected {
  border-color: var(--v-theme-primary);
}

.mock-card-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mock-card-options-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Lista de Músicas */
.mock-song-list {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
}

.mock-song-item {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.mock-song-item:last-child {
  border-bottom: none;
}

/* Wizard Assistente */
.mock-cover-upload {
  width: 130px;
  height: 130px;
  border: 2px solid var(--v-theme-primary);
  background: linear-gradient(135deg, #0097d7 0%, #005b82 100%);
}

.mock-static-input {
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  background: var(--card-bg, #ffffff);
  color: var(--sidebar-text);
}

.mock-wizard-option {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.18));
}

.mock-wizard-option.selected {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.05);
}

.mock-option-icon {
  width: 38px;
  height: 38px;
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Filtros */
.mock-filter-results {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
}

.mock-filter-menu {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.18));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.bg-primary-subtle {
  background: rgba(var(--v-theme-primary), 0.08);
}

.border-b-subtle {
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
}

.pointer-events-none {
  pointer-events: none;
}

.min-width-0 {
  min-width: 0;
}
</style>
