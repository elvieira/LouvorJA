<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6 text-body-1" v-html="t('favorites.intro')" />

    <!-- Card de Ação Rápida / Atalho Direto -->
    <div
      class="manual-preview-card pa-5 rounded-xl mb-6"
      style="border: 1px solid rgba(233, 30, 99, 0.3); background: linear-gradient(135deg, rgba(233, 30, 99, 0.08) 0%, rgba(123, 31, 162, 0.05) 100%);"
    >
      <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 16px;">
        <div class="d-flex align-center">
          <div
            class="rounded-circle pa-3 mr-3 d-flex align-center justify-center flex-shrink-0"
            style="background: rgba(233, 30, 99, 0.15); width: 48px; height: 48px;"
          >
            <v-icon color="#e91e63" size="26">
              mdi-heart
            </v-icon>
          </div>
          <div>
            <h4 class="text-subtitle-1 font-weight-bold mb-1" style="color: var(--sidebar-text);">
              {{ t('favorites.quick_access_title') }}
            </h4>
            <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary);">
              {{ t('favorites.quick_access_desc') }}
            </p>
          </div>
        </div>

        <div class="d-flex align-center" style="gap: 12px;">
          <v-btn
            color="#e91e63"
            variant="flat"
            size="default"
            class="rounded-xl font-weight-bold text-none px-5 elevation-2"
            @click="goToFavorites"
          >
            <v-icon
              start
              icon="mdi-heart"
              class="mr-1"
            >
              mdi-heart
            </v-icon>
            {{ t('favorites.open_favorites_btn') }}
          </v-btn>
        </div>
      </div>

      <v-divider class="my-3 opacity-20" />

      <!-- Nota do Atalho de Teclado -->
      <div class="d-flex align-center flex-wrap pt-1" style="gap: 8px;">
        <v-icon size="16" color="#e91e63" class="mr-1">
          mdi-keyboard
        </v-icon>
        <span class="text-caption font-weight-medium" style="color: var(--sidebar-text);" v-html="t('favorites.keyboard_shortcut_note')" />
      </div>
    </div>

    <!-- 1. Como Adicionar Músicas aos Favoritos -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon
        icon="mdi-heart-plus-outline"
        class="mr-2"
        size="22"
        color="#e91e63"
      >
        mdi-heart-plus-outline
      </v-icon>
      {{ t('favorites.how_to_add_title') }}
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      {{ t('favorites.how_to_add_desc') }}
    </p>

    <!-- Cards de Métodos de Adição -->
    <v-row dense class="mb-6">
      <!-- Método 1: Listas -->
      <v-col cols="12" md="6">
        <div class="shortcut-hero-card rounded-lg pa-4 h-100 d-flex flex-column justify-space-between">
          <div>
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-format-list-bulleted"
                size="20"
                color="primary"
                class="mr-2"
              >
                mdi-format-list-bulleted
              </v-icon>
              <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('favorites.method_lists_title') }}
              </span>
            </div>
            <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
              {{ t('favorites.method_lists_desc') }}
            </p>
          </div>
          <!-- Ilustração da linha com coração -->
          <div class="preview-inner-bg rounded-lg pa-3 d-flex align-center justify-space-between">
            <div class="d-flex align-center overflow-hidden mr-2">
              <span class="font-weight-bold mr-2 text-caption" style="color: var(--accent-blue);">01</span>
              <span class="text-caption font-weight-medium text-truncate" style="color: var(--sidebar-text);">Ó Deus de Amor</span>
            </div>
            <div class="d-flex align-center" style="gap: 4px;">
              <v-icon size="18" color="rgba(128,128,128,0.5)">
                mdi-play-circle-outline
              </v-icon>
              <v-icon size="18" color="#e91e63">
                mdi-heart
              </v-icon>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Método 2: Player Inferior -->
      <v-col cols="12" md="6">
        <div class="shortcut-hero-card rounded-lg pa-4 h-100 d-flex flex-column justify-space-between">
          <div>
            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-play-box-outline"
                size="20"
                color="primary"
                class="mr-2"
              >
                mdi-play-box-outline
              </v-icon>
              <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('favorites.method_player_title') }}
              </span>
            </div>
            <p class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
              {{ t('favorites.method_player_desc') }}
            </p>
          </div>
          <!-- Ilustração do player com coração -->
          <div class="preview-inner-bg rounded-lg pa-3 d-flex align-center justify-space-between">
            <div class="d-flex align-center overflow-hidden mr-2">
              <v-icon size="20" color="primary" class="mr-2">
                mdi-music
              </v-icon>
              <div class="d-flex flex-column">
                <span class="text-caption font-weight-bold text-truncate" style="color: var(--sidebar-text); line-height: 1.2;">Tocando Agora</span>
                <span class="text-caption opacity-60 text-truncate" style="font-size: 0.72rem;">Hinário Adventista</span>
              </div>
            </div>
            <v-icon size="20" color="#e91e63">
              mdi-heart
            </v-icon>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Feedback Visual -->
    <div class="manual-preview-card pa-4 rounded-xl mb-6">
      <div class="d-flex align-center mb-2">
        <v-icon
          icon="mdi-bell-ring-outline"
          size="18"
          color="#e91e63"
          class="mr-2"
        >
          mdi-bell-ring-outline
        </v-icon>
        <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
          {{ t('favorites.visual_feedback_title') }}
        </span>
      </div>
      <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
        {{ t('favorites.visual_feedback_desc') }}
      </p>
    </div>

    <!-- 2. Como Visualizar e Reproduzir -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon
        icon="mdi-folder-star-outline"
        class="mr-2"
        size="22"
        color="#e91e63"
      >
        mdi-folder-star-outline
      </v-icon>
      {{ t('favorites.how_to_view_title') }}
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);" v-html="t('favorites.how_to_view_desc')" />

    <v-row dense class="mb-6">
      <v-col cols="12" sm="6">
        <div class="shortcut-hero-card rounded-lg pa-4 h-100">
          <div class="d-flex align-center mb-2">
            <v-icon
              icon="mdi-shield-lock-outline"
              size="18"
              color="success"
              class="mr-2"
            >
              mdi-shield-lock-outline
            </v-icon>
            <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
              {{ t('favorites.safety_title') }}
            </span>
          </div>
          <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
            {{ t('favorites.safety_desc') }}
          </p>
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <div class="shortcut-hero-card rounded-lg pa-4 h-100">
          <div class="d-flex align-center mb-2">
            <v-icon
              icon="mdi-playlist-play"
              size="18"
              color="primary"
              class="mr-2"
            >
              mdi-playlist-play
            </v-icon>
            <span class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text);">
              {{ t('favorites.play_all_title') }}
            </span>
          </div>
          <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
            {{ t('favorites.play_all_desc') }}
          </p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { openFavorites } from "@/helpers/services/Favorites";

export default defineComponent({
  name: "ManualFavorites",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
    goToFavorites() {
      openFavorites();
    },
  },
});
</script>

<style scoped>
.shortcut-hero-card {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.12);
  transition: all 0.2s ease;
}
.shortcut-hero-card:hover {
  border-color: rgba(233, 30, 99, 0.3);
  background: rgba(128, 128, 128, 0.08);
}
.manual-preview-card {
  background: rgba(128, 128, 128, 0.03);
  border: 1px solid rgba(128, 128, 128, 0.12);
}
.preview-inner-bg {
  background: var(--card-bg);
  border: 1px solid rgba(128, 128, 128, 0.15);
}
.keycap {
  display: inline-block;
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-bottom: 2px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.72rem;
  font-family: inherit;
  font-weight: 700;
  color: var(--sidebar-text);
  margin: 0 2px;
}
</style>
