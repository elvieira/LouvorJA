<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('music_editor.intro')" />

    <!-- 1. Barra de Ferramentas (Ribbon) e Área de Trabalho -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-view-dashboard-outline" class="mr-2" size="22" />
      {{ t('music_editor.ribbon_title') }}
    </h3>
    <p class="mb-4" v-html="t('music_editor.ribbon_p1')" />

    <!-- Exemplo Visual 1: O Editor de Música Completo com Ribbon e Canvas -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-presentation-play" size="16" class="mr-1 text-primary" />
          {{ t('music_editor.preview_ribbon_title') }}
        </span>
        <div class="mock-ui-btn rounded-lg pa-1 px-3 text-caption font-weight-bold d-flex align-center pointer-events-none">
          <v-icon icon="mdi-projector-screen" size="16" class="mr-1" />
          {{ t('music_editor.preview_btn_present') }}
        </div>
      </div>

      <div class="preview-inner-bg rounded-lg pa-3">
        <!-- BARRA RIBBON SUPERIOR -->
        <div class="mock-ribbon-bar rounded-lg pa-2 mb-3">
          <div class="d-flex align-center justify-space-between flex-wrap gap-2 pb-2 border-b-subtle">
            <!-- Abas do Ribbon (Alternância Visual de Abas) -->
            <div class="mock-ribbon-tabs d-flex align-center gap-1">
              <button
                v-for="rb in ribbonTabs"
                :key="rb.key"
                type="button"
                class="mock-ribbon-tab-btn rounded-md px-3 py-1 font-weight-bold text-caption d-flex align-center"
                :class="{ active: currentRibbonTab === rb.key }"
                @click="currentRibbonTab = rb.key"
              >
                <v-icon :icon="rb.icon" size="14" class="mr-1" />
                {{ rb.label }}
              </button>
            </div>

            <!-- Identificador da Música -->
            <div class="text-caption font-weight-bold opacity-70 d-flex align-center">
              <v-icon icon="mdi-music-clef-treble" size="16" class="mr-1 text-primary" />
              <span>Grande é o Senhor.slja</span>
            </div>
          </div>

          <!-- Barra de Ferramentas Ilustrativa da Aba Ativa -->
          <div class="d-flex align-center flex-wrap gap-2 pt-2 pointer-events-none opacity-90" style="min-height: 38px;">
            <!-- ABA: ARQUIVO -->
            <template v-if="currentRibbonTab === 'file'">
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded">
                <v-icon icon="mdi-file-plus-outline" size="16" class="mr-1" />
                Novo
              </div>
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded">
                <v-icon icon="mdi-folder-open-outline" size="16" class="mr-1" />
                Abrir
              </div>
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded">
                <v-icon icon="mdi-file-import-outline" size="16" class="mr-1" />
                Importar (.txt)
              </div>
              <v-divider vertical class="mx-1 my-1" style="height: 18px;" />
              <div class="mock-tool-btn text-primary d-flex align-center text-caption px-2 py-1 rounded font-weight-bold">
                <v-icon icon="mdi-file-music" size="16" class="mr-1" />
                Cantado.mp3
              </div>
              <div class="mock-tool-btn text-primary d-flex align-center text-caption px-2 py-1 rounded font-weight-bold">
                <v-icon icon="mdi-file-music-outline" size="16" class="mr-1" />
                Playback.mp3
              </div>
              <v-divider vertical class="mx-1 my-1" style="height: 18px;" />
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded font-weight-bold">
                <v-icon icon="mdi-content-save-outline" size="16" class="mr-1" />
                Salvar
              </div>
            </template>

            <!-- ABA: SLIDES -->
            <template v-else-if="currentRibbonTab === 'slides'">
              <div class="mock-tool-btn text-primary d-flex align-center text-caption px-2 py-1 rounded font-weight-bold bg-primary-subtle">
                <v-icon icon="mdi-plus-box-outline" size="16" class="mr-1" />
                Novo Slide
              </div>
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded font-weight-medium">
                <v-icon icon="mdi-content-duplicate" size="16" class="mr-1" />
                Duplicar Slide
              </div>
              <div class="mock-tool-btn text-error d-flex align-center text-caption px-2 py-1 rounded font-weight-medium">
                <v-icon icon="mdi-delete-outline" size="16" class="mr-1" />
                Excluir Slide
              </div>
              <span class="text-caption opacity-60 ml-auto">3 slides na apresentação</span>
            </template>

            <!-- ABA: FORMATAR -->
            <template v-else-if="currentRibbonTab === 'format'">
              <div class="mock-tool-btn text-primary d-flex align-center text-caption px-2 py-1 rounded font-weight-bold bg-primary-subtle">
                <v-icon icon="mdi-image-outline" size="16" class="mr-1" />
                Fundo: Imagem
              </div>
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded font-weight-medium">
                <v-icon icon="mdi-arrow-right-bold-box-outline" size="16" class="mr-1" />
                Todos Seguintes
              </div>
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded font-weight-medium">
                <v-icon icon="mdi-view-grid-outline" size="16" class="mr-1" />
                Todos Slides
              </div>
              <v-divider vertical class="mx-1 my-1" style="height: 18px;" />
              <div class="d-flex align-center gap-1 text-caption">
                <span class="opacity-60">Fonte:</span>
                <span class="font-weight-bold px-1">24px</span>
              </div>
              <div class="d-flex align-center gap-1 ml-2 text-caption">
                <span class="opacity-60">Cor:</span>
                <span class="mock-color-dot" style="background: #ffffff;" />
                <span class="mock-color-dot" style="background: #ffe082;" />
                <span class="mock-color-dot" style="background: #80deea;" />
              </div>
            </template>

            <!-- ABA: SINCRONIA -->
            <template v-else-if="currentRibbonTab === 'sync'">
              <div class="mock-tool-btn text-primary d-flex align-center text-caption px-2 py-1 rounded font-weight-bold bg-primary-subtle">
                <v-icon icon="mdi-play" size="16" class="mr-1" />
                Tocar Áudio
              </div>
              <div class="mock-ui-btn rounded px-2 py-1 text-caption font-weight-bold d-flex align-center">
                <v-icon icon="mdi-record-rec" size="16" class="mr-1" />
                Gravar e Avançar (Espaço)
              </div>
              <div class="mock-tool-btn d-flex align-center text-caption px-2 py-1 rounded opacity-70">
                <v-icon icon="mdi-restore" size="16" class="mr-1" />
                Gravar do Início
              </div>
              <span class="text-caption font-weight-bold text-primary ml-auto">
                Tempo de Áudio: 0:28
              </span>
            </template>
          </div>
        </div>

        <!-- WORKSPACE: MINIATURAS À ESQUERDA + CANVAS DE PROJEÇÃO AO CENTRO -->
        <v-row dense class="mt-1">
          <!-- Coluna Esquerda: Miniaturas dos Slides -->
          <v-col cols="12" md="3" class="pr-md-2">
            <div class="mock-slides-column rounded-lg pa-2">
              <div class="text-caption font-weight-bold opacity-60 mb-2 px-1">
                SLIDES ({{ activeSlideIndex + 1 }} de {{ slidesList.length }})
              </div>

              <div class="d-flex flex-column gap-2" style="max-height: 280px; overflow-y: auto;">
                <div
                  v-for="(slide, idx) in slidesList"
                  :key="slide.id"
                  class="mock-slide-thumb rounded-md pa-2 cursor-pointer d-flex align-center justify-space-between"
                  :class="{ active: activeSlideIndex === idx }"
                  @click="activeSlideIndex = idx"
                >
                  <div class="d-flex align-center min-width-0">
                    <span class="text-caption font-weight-bold mr-2 opacity-70" style="min-width: 14px;">
                      {{ Number(idx) + 1 }}
                    </span>
                    <div class="mock-mini-slide-preview rounded-sm mr-2" :style="getSlideBackground(slide)">
                      <div class="mock-preview-lines" />
                    </div>
                    <div class="text-caption font-weight-medium text-truncate" style="max-width: 100px;">
                      {{ slide.mainText.split('\n')[0] }}
                    </div>
                  </div>

                  <!-- Tag de Tempo Karaokê -->
                  <span
                    class="text-caption font-weight-bold px-1 rounded bg-primary-subtle text-primary"
                    style="font-size: 10px;"
                  >
                    {{ slide.timestamp }}
                  </span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Coluna Central: Canvas de Projeção em 16:9 -->
          <v-col cols="12" md="9">
            <div class="mock-canvas-container rounded-lg overflow-hidden position-relative">
              <!-- Tela 16:9 -->
              <div
                class="mock-canvas-screen d-flex flex-column justify-space-between pa-4 pa-sm-6"
                :style="currentCanvasBackground"
              >
                <!-- Texto Auxiliar Superior -->
                <div
                  class="text-left font-weight-medium"
                  style="color: #80deea; font-size: 13px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);"
                >
                  {{ currentSlide.auxText }}
                </div>

                <!-- Letra Principal Centralizada -->
                <div
                  class="text-center font-weight-bold my-auto px-2"
                  style="color: #ffffff; font-size: 22px; line-height: 1.3; white-space: pre-line; text-shadow: 0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6);"
                >
                  {{ currentSlide.mainText }}
                </div>

                <!-- Rodapé do Canvas -->
                <div class="d-flex align-center justify-space-between text-caption opacity-70 text-white" style="font-size: 11px;">
                  <span>Louvor JA Projeção</span>
                  <span>Slide {{ activeSlideIndex + 1 }} de {{ slidesList.length }}</span>
                </div>
              </div>
            </div>

            <!-- Demonstração dos Campos de Edição da Estrofe (Apenas Leitura / Visual) -->
            <div class="mock-editor-inputs rounded-lg pa-3 mt-2">
              <v-row dense>
                <v-col cols="12" sm="8">
                  <div class="text-caption font-weight-bold opacity-70 mb-1">
                    {{ $t('modules.music_editor.main_text') }} (Letra do Slide)
                  </div>
                  <div class="mock-static-textarea rounded-md pa-2 text-body-2 font-weight-medium" style="white-space: pre-line; min-height: 52px;">
                    {{ currentSlide.mainText }}
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="text-caption font-weight-bold opacity-70 mb-1">
                    {{ $t('modules.music_editor.aux_text') }} (Acordes / Notas)
                  </div>
                  <div class="mock-static-textarea rounded-md pa-2 text-body-2 font-weight-medium" style="min-height: 52px;">
                    {{ currentSlide.auxText }}
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 2. Importação Automática de Letra (.txt) -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-file-import-outline" class="mr-2" size="20" />
      {{ t('music_editor.preview_import_title') }}
    </h4>
    <p class="mb-4 pl-2 text-body-2" style="color: var(--sidebar-text-secondary);">
      Ao usar <strong>"Importar (.txt)"</strong>, o Louvor JA faz a leitura inteligente do arquivo de texto e divide automaticamente as estrofes em slides separados a cada quebra dupla de linha:
    </p>

    <!-- Exemplo Visual 2: Importador Automático -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="preview-inner-bg rounded-lg pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold opacity-70 mb-1">
              Arquivo de Texto Original (.txt):
            </div>
            <div class="mock-code-block rounded-md pa-3 font-family-monospace text-caption">
              Primeira estrofe da música...<br />
              Com seus versos e rimas.<br />
              <br />
              Segunda estrofe da música...<br />
              Dividida automaticamente por linha dupla.
            </div>
          </v-col>

          <v-col cols="12" md="6" class="text-center">
            <v-icon
              icon="mdi-arrow-right-bold"
              color="primary"
              size="28"
              class="my-2 d-none d-md-inline-block"
            />
            <div class="text-caption font-weight-bold text-primary mb-2">
              Resultado Automático no Editor:
            </div>
            <div class="d-flex flex-column gap-1 text-left">
              <div class="bg-primary-subtle rounded pa-2 text-caption">
                <strong>Slide 1:</strong> "Primeira estrofe da música..."
              </div>
              <div class="bg-primary-subtle rounded pa-2 text-caption">
                <strong>Slide 2:</strong> "Segunda estrofe da música..."
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Sincronia e Temporização Karaokê -->
    <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary d-flex align-center pl-2">
      <v-icon icon="mdi-sync" class="mr-2" size="20" />
      {{ t('music_editor.preview_sync_title') }}
    </h4>
    <p class="mb-4 pl-2 text-body-2" style="color: var(--sidebar-text-secondary);">
      Com o áudio vinculado, você pode gravar a passagem de cada estrofe em tempo real enquanto ouve a canção. Na hora da apresentação, o Louvor JA avança os slides automaticamente no segundo exato:
    </p>

    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('music_editor.sync_player')" />
      <li class="mb-2" v-html="t('music_editor.sync_record_advance')" />
      <li class="mb-2" v-html="t('music_editor.sync_reset')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 4. Apresentação e Projeção ao Vivo -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-projector-screen" class="mr-2" size="22" />
      {{ t('music_editor.projection_title') }}
    </h3>
    <p class="mb-4" v-html="t('music_editor.projection_p1')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import bibleBgSample from "@/assets/images/bible_bg_sample.jpg";

type RibbonTabKey = "file" | "slides" | "format" | "sync";

interface RibbonTabItem {
  key: RibbonTabKey;
  label: string;
  icon: string;
}

interface EditorSlide {
  id: string;
  mainText: string;
  auxText: string;
  timestamp: string;
}

export default defineComponent({
  name: "ManualMusicEditor",
  data() {
    return {
      currentRibbonTab: "format" as RibbonTabKey,
      activeSlideIndex: 0,

      // Abas do Ribbon
      ribbonTabs: [
        { key: "file", label: "Arquivo", icon: "mdi-folder-outline" },
        { key: "slides", label: "Slides", icon: "mdi-presentation" },
        { key: "format", label: "Formatar", icon: "mdi-format-paint" },
        { key: "sync", label: "Sincronia", icon: "mdi-sync" },
      ] as RibbonTabItem[],

      // Lista de Slides da Música de Exemplo
      slidesList: [
        {
          id: "sl1",
          mainText: "Grande é o Senhor e mui digno de louvor\nNa cidade do nosso Deus, Seu santo monte",
          auxText: "Salmo 48:1 • [Tom: D]",
          timestamp: "0:00",
        },
        {
          id: "sl2",
          mainText: "Alegria de toda a terra é o monte Sião\nAs extremidades do norte, a cidade do grande Rei",
          auxText: "[Estrofe 2 - Todos]",
          timestamp: "0:28",
        },
        {
          id: "sl3",
          mainText: "Deus Se fez conhecer em Seus palácios\nComo um alto refúgio para o Seu povo",
          auxText: "[Coro Forte]",
          timestamp: "1:04",
        },
      ] as EditorSlide[],
    };
  },
  computed: {
    currentSlide(): EditorSlide {
      return this.slidesList[this.activeSlideIndex] || this.slidesList[0];
    },
    currentCanvasBackground(): Record<string, string> {
      return {
        background: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${bibleBgSample})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    },
  },
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
    getSlideBackground(slide: EditorSlide): Record<string, string> {
      return {
        background: slide.id === "sl1" ? "#102a45" : "#1a237e",
      };
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

/* Barra Ribbon */
.mock-ribbon-bar {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.mock-ribbon-tabs {
  background: rgba(128, 128, 128, 0.08);
  border-radius: 8px;
  padding: 2px;
}

.mock-ribbon-tab-btn {
  border: none;
  background: transparent;
  color: var(--sidebar-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mock-ribbon-tab-btn.active {
  background: var(--card-bg, #ffffff);
  color: var(--v-theme-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.mock-tool-btn {
  background: rgba(128, 128, 128, 0.08);
  color: var(--sidebar-text);
}

.mock-ui-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
}

/* Bolinhas de cor */
.mock-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Miniaturas de Slides */
.mock-slides-column {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
}

.mock-slide-thumb {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  transition: all 0.2s ease;
}

.mock-slide-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.mock-slide-thumb.active {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.1);
}

.mock-mini-slide-preview {
  width: 32px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-preview-lines {
  width: 18px;
  height: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1px;
}

/* Canvas de Projeção */
.mock-canvas-container {
  background: #000000;
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.mock-canvas-screen {
  aspect-ratio: 16 / 9;
  width: 100%;
  min-height: 220px;
}

/* Campos Estáticos */
.mock-editor-inputs {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
}

.mock-static-textarea {
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  background: rgba(128, 128, 128, 0.03);
  color: var(--sidebar-text);
}

.mock-code-block {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
  color: var(--sidebar-text);
  line-height: 1.5;
}

/* Utilitários */
.bg-primary-subtle {
  background: rgba(var(--v-theme-primary), 0.08);
}

.border-b-subtle {
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
}

.font-family-monospace {
  font-family: monospace;
}

.pointer-events-none {
  pointer-events: none;
}

.min-width-0 {
  min-width: 0;
}
</style>
