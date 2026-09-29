<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('sync.intro')" />

    <!-- 1. Acesso e Indicador -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-library" class="mr-2" size="22" />
      {{ t('sync.access_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.access_desc')" />

    <!-- 2. Espaço em Disco & Download de Coletâneas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-harddisk" class="mr-2" size="22" />
      {{ t('sync.storage_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.storage_desc')" />

    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-cloud-download-outline" class="mr-2" size="22" />
      {{ t('sync.collections_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.collections_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.status_idle')" />
      <li class="mb-2" v-html="t('sync.status_downloading')" />
      <li class="mb-2" v-html="t('sync.status_downloaded')" />
      <li class="mb-2" v-html="t('sync.status_delete')" />
    </ul>

    <!-- Exemplo Visual 1: Painel da Biblioteca Local & Estados de Download -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-folder-sync-outline" size="16" class="mr-1 text-primary" />
          {{ t('sync.preview_sync_storage_title') }}
        </span>
        <span class="text-caption opacity-60">Filosofia Off-line First</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <!-- Cabeçalho do Módulo Biblioteca Local -->
        <div class="d-flex align-center justify-space-between mb-4 pb-3 border-b-subtle flex-wrap gap-2">
          <div>
            <div class="d-flex align-center">
              <v-icon color="primary" size="26" class="mr-2">
                mdi-library
              </v-icon>
              <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">
                {{ $t('modules.sync.title') }}
              </span>
            </div>
            <div class="text-caption d-flex align-center mt-1 opacity-70">
              <v-icon
                icon="mdi-harddisk"
                size="14"
                color="primary"
                class="mr-1"
              />
              <span>Ocupando <strong>1.45 GB</strong> no disco</span>
            </div>
          </div>

          <!-- Botão Ilustrativo de Ação em Lote -->
          <div class="mock-batch-btn rounded-lg px-3 py-1 text-caption font-weight-bold d-flex align-center pointer-events-none">
            <v-icon icon="mdi-cloud-download" size="16" class="mr-1" />
            {{ $t('modules.sync.download_all') }}
          </div>
        </div>

        <!-- Lista Ilustrativa de Álbuns em Diferentes Estados -->
        <div class="d-flex flex-column gap-3">
          <!-- Categoria: Hinários Oficiais -->
          <div class="text-caption font-weight-bold text-uppercase opacity-60 px-1">
            Hinários Oficiais
          </div>

          <!-- Álbum 1: Baixado Completo -->
          <div class="mock-sync-item rounded-xl pa-3 d-flex align-center justify-space-between">
            <div class="d-flex align-center min-width-0 mr-2">
              <div class="mock-album-avatar rounded-lg mr-3 overflow-hidden d-flex align-center justify-center flex-shrink-0">
                <img :src="hymnalImg" alt="Hinário Adventista" class="mock-cover-img" />
              </div>
              <div class="min-width-0">
                <div class="font-weight-bold text-body-2 text-truncate" style="color: var(--sidebar-text);">
                  Hinário Adventista (Novo)
                </div>
                <div class="text-caption text-success font-weight-medium d-flex align-center mt-1">
                  <v-icon icon="mdi-check-circle" size="14" class="mr-1" />
                  Baixado &bull; 610 hinos (Pronto para uso offline)
                </div>
              </div>
            </div>

            <!-- Ação: Excluir para liberar espaço (Visual) -->
            <div class="mock-icon-btn rounded-lg pa-1 text-error pointer-events-none flex-shrink-0">
              <v-icon icon="mdi-delete-outline" size="18" />
            </div>
          </div>

          <!-- Álbum 2: Em Download Ativo -->
          <div class="mock-sync-item downloading rounded-xl pa-3 d-flex align-center justify-space-between">
            <div class="d-flex align-center min-width-0 mr-2 flex-grow-1">
              <div class="mock-album-avatar rounded-lg mr-3 overflow-hidden d-flex align-center justify-center flex-shrink-0">
                <img :src="hymnal1996Img" alt="Hinário Adventista 1996" class="mock-cover-img" />
              </div>
              <div class="min-width-0 flex-grow-1 pr-3">
                <div class="font-weight-bold text-body-2 text-truncate" style="color: var(--sidebar-text);">
                  Hinário Adventista 1996
                </div>
                <div class="d-flex align-center justify-space-between text-caption text-primary font-weight-medium my-1">
                  <span>Baixando 410 de 600...</span>
                  <span class="font-weight-bold">68%</span>
                </div>
                <v-progress-linear
                  model-value="68"
                  color="primary"
                  height="5"
                  rounded
                  striped
                />
              </div>
            </div>

            <!-- Ação: Cancelar Download (Visual) -->
            <div class="mock-icon-btn rounded-lg pa-1 text-error pointer-events-none flex-shrink-0">
              <v-icon icon="mdi-close" size="18" />
            </div>
          </div>

          <!-- Categoria: Coletâneas Jovens -->
          <div class="text-caption font-weight-bold text-uppercase opacity-60 px-1 mt-2">
            Coletâneas Jovem & Ministérios
          </div>

          <!-- Álbum 3: Não Baixado (Disponível na Nuvem) -->
          <div class="mock-sync-item rounded-xl pa-3 d-flex align-center justify-space-between">
            <div class="d-flex align-center min-width-0 mr-2">
              <div class="mock-album-avatar ja-cover rounded-lg mr-3 d-flex align-center justify-center flex-shrink-0 text-white">
                <v-icon size="24">
                  mdi-fire
                </v-icon>
              </div>
              <div class="min-width-0">
                <div class="font-weight-bold text-body-2 text-truncate" style="color: var(--sidebar-text);">
                  Louvor Jovem 2026
                </div>
                <div class="text-caption opacity-60 mt-1">
                  10 músicas &bull; 145 MB &bull; Disponível na nuvem
                </div>
              </div>
            </div>

            <!-- Ação: Baixar Coletânea (Visual) -->
            <div class="mock-icon-btn-primary rounded-lg pa-1 text-primary pointer-events-none flex-shrink-0">
              <v-icon icon="mdi-download" size="20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 3. Ações Globais em Lote -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-checkbox-multiple-marked-circle-outline" class="mr-2" size="22" />
      {{ t('sync.batch_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.batch_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.batch_download_all')" />
      <li class="mb-2" v-html="t('sync.batch_all_downloaded')" />
      <li class="mb-2" v-html="t('sync.batch_cancel_all')" />
    </ul>

    <!-- 4. Atualização do Banco de Dados Oficial -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-database-refresh" class="mr-2" size="22" />
      {{ t('sync.db_update_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.db_update_desc')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2" v-html="t('sync.db_version_check')" />
      <li class="mb-2" v-html="t('sync.db_update_btn')" />
    </ul>

    <!-- Exemplo Visual 2: Assistente de Atualização de Banco de Dados -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-database-sync" size="16" class="mr-1 text-primary" />
          {{ t('sync.preview_sync_db_title') }}
        </span>
        <span class="text-caption opacity-60">Sincronização Nuvem</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <div class="mock-db-modal rounded-xl pa-5 text-center mx-auto" style="max-width: 480px;">
          <v-icon color="primary" size="48" class="mb-3">
            mdi-database-refresh
          </v-icon>
          <div class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">
            Nova Versão do Banco de Dados Disponível
          </div>
          <div class="text-caption opacity-70 my-2" style="max-width: 380px; margin: 0 auto;">
            Novos hinos, correções de letras e versões bíblicas prontas para sincronizar sem perder suas configurações.
          </div>

          <!-- Comparativo de Versão -->
          <div class="mock-version-pill rounded-lg pa-2 px-4 d-inline-flex align-center gap-3 my-3">
            <span class="text-caption font-weight-medium opacity-70">Instalada: <strong>v3</strong></span>
            <v-icon icon="mdi-arrow-right" size="14" color="primary" />
            <span class="text-caption font-weight-bold text-primary">Nova: <strong>v4</strong></span>
          </div>

          <!-- Botão Ilustrativo de Atualizar -->
          <div class="d-flex justify-center mt-3 pointer-events-none">
            <div class="mock-ui-btn rounded-lg px-5 py-2 text-caption font-weight-bold d-flex align-center">
              <v-icon icon="mdi-download" size="16" class="mr-1" />
              Atualizar Banco de Dados
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-25" />

    <!-- 5. Importação do Louvor JA Clássico -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-history" class="mr-2" size="22" />
      {{ t('sync.import_legacy_title') }}
    </h3>
    <p class="mb-4" v-html="t('sync.import_legacy_desc')" />

    <!-- Exemplo Visual 3: Assistente de Migração do Clássico -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-bold text-uppercase opacity-70 d-flex align-center">
          <v-icon icon="mdi-folder-upload-outline" size="16" class="mr-1 text-primary" />
          {{ t('sync.preview_sync_legacy_title') }}
        </span>
        <span class="text-caption opacity-60">Economia de Banda</span>
      </div>

      <div class="preview-inner-bg rounded-lg pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="8">
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-folder-music-outline"
                color="primary"
                size="24"
                class="mr-2"
              />
              <span class="text-body-2 font-weight-bold" style="color: var(--sidebar-text);">
                Pasta Local do Louvor JA Antigo Detectada
              </span>
            </div>
            <div class="text-caption opacity-70 mb-2 font-family-monospace bg-surface-subtle pa-1 px-2 rounded">
              C:\Arquivos de Programas\Louvor JA\musicas
            </div>
            <div class="text-caption text-success font-weight-bold d-flex align-center">
              <v-icon icon="mdi-check-circle" size="14" class="mr-1" />
              580 arquivos de áudio e slides prontos para migração instantânea!
            </div>
          </v-col>

          <v-col cols="12" sm="4" class="text-sm-right mt-3 mt-sm-0">
            <div class="mock-ui-btn rounded-lg pa-2 px-3 text-caption font-weight-bold d-inline-flex align-center pointer-events-none">
              <v-icon icon="mdi-import" size="16" class="mr-1" />
              Importar Agora
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

export default defineComponent({
  name: "ManualSync",
  data() {
    return {
      hymnalImg,
      hymnal1996Img,
    };
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

.pointer-events-none {
  pointer-events: none !important;
}

.border-b-subtle {
  border-bottom: 1px solid var(--border-color, rgba(128, 128, 128, 0.12));
}

.bg-surface-subtle {
  background: rgba(128, 128, 128, 0.08);
}

/* Itens da Biblioteca Local */
.mock-sync-item {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.mock-sync-item.downloading {
  border-color: rgba(var(--v-theme-primary), 0.35);
  background: rgba(var(--v-theme-primary), 0.02);
}

.mock-album-avatar {
  width: 44px;
  height: 44px;
}

.mock-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ja-cover {
  background: linear-gradient(135deg, #0097d7 0%, #005b82 100%);
}

.mock-batch-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mock-icon-btn {
  background: rgba(239, 68, 68, 0.1);
}

.mock-icon-btn-primary {
  background: rgba(var(--v-theme-primary), 0.12);
}

/* Modal de Banco de Dados */
.mock-db-modal {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.mock-version-pill {
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
}

.mock-ui-btn {
  background: var(--v-theme-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
