<template>
  <div class="manual-container h-100 d-flex flex-column pb-4">
    <v-card class="settings-card rounded-xl flex-grow-1 overflow-hidden d-flex flex-column" flat style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color);">
      <!-- Top Header Area -->
      <div class="d-flex align-center py-6 px-6" style="border-bottom: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.01);">
        <v-btn
          class="mr-4"
          icon="mdi-arrow-left"
          size="small"
          variant="tonal"
          color="primary"
          @click="$emit('back')"
        />
        <div class="d-flex align-center justify-center rounded-circle pa-2 mr-3" style="background: rgba(0, 151, 215, 0.1);">
          <v-icon
            color="primary"
            icon="mdi-book-open-page-variant"
            size="22"
          />
        </div>
        <h3 class="font-weight-bold mb-0" style="color: var(--sidebar-text); font-size: 1.25rem; letter-spacing: -0.01em;">
          {{ $t('modules.help.manual_title') }}
        </h3>
        
        <v-spacer />
        
        <v-text-field
          v-model="search"
          bg-color="rgba(128, 128, 128, 0.08)"
          density="compact"
          flat
          hide-details
          placeholder="Buscar no manual..."
          prepend-inner-icon="mdi-magnify"
          rounded="xl"
          style="max-width: 320px;"
          variant="solo"
          elevation="0"
          class="search-bar"
        />
      </div>

      <!-- Main Area (Sidebar + Content) -->
      <div class="d-flex flex-grow-1" style="min-height: 0;">
        <!-- Sidebar Navigation -->
        <div class="manual-sidebar d-flex flex-column flex-shrink-0" style="width: 270px; border-right: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.015);">
          <v-list
            bg-color="transparent"
            class="px-4 py-4"
            density="comfortable"
            nav
          >
            <v-list-item
              v-for="section in sections"
              :key="section.id"
              :active="activeSection === section.id"
              class="mb-2 manual-list-item rounded-lg"
              :value="section.id"
              :ripple="false"
              @click="activeSection = section.id"
            >
              <template #prepend>
                <v-icon
                  :icon="section.icon"
                  size="small"
                  :color="activeSection === section.id ? 'primary' : 'grey-darken-1'"
                  style="margin-right: -16px;"
                />
              </template>
              <v-list-item-title 
                class="font-weight-medium" 
                :class="activeSection === section.id ? 'text-primary' : ''" 
                style="font-size: 0.95rem; letter-spacing: 0px;"
              >
                {{ section.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Main Content -->
        <div class="manual-content flex-grow-1 overflow-auto pa-8 bg-transparent">
          <v-fade-transition mode="out-in">
            <div :key="activeSection">
              <h2 class="mb-6 font-weight-bold" style="color: var(--sidebar-text); font-size: 2rem; letter-spacing: -0.02em;">
                {{ currentSectionTitle }}
              </h2>
              
              <div class="text-body-1" style="color: var(--sidebar-text-secondary); line-height: 1.7;">
                <component :is="activeSectionComponent" />
              </div>
            </div>
          </v-fade-transition>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ManualIntro from "./manual/ManualIntro.vue";
import ManualShortcuts from "./manual/ManualShortcuts.vue";
import ManualSongs from "./manual/ManualSongs.vue";
import ManualBible from "./manual/ManualBible.vue";
import ManualLiturgy from "./manual/ManualLiturgy.vue";
import ManualSync from "./manual/ManualSync.vue";
import ManualDisplays from "./manual/ManualDisplays.vue";
import ManualSettings from "./manual/ManualSettings.vue";

export default defineComponent({
  name: "HelpManual",
  components: {
    ManualIntro,
    ManualShortcuts,
    ManualSongs,
    ManualBible,
    ManualLiturgy,
    ManualSync,
    ManualDisplays,
    ManualSettings,
  },
  emits: ["back"],
  data() {
    return {
      search: "",
      activeSection: "intro",
    };
  },
  computed: {
    sections(): Array<{ id: string; title: string; icon: string }> {
      return [
        { id: "intro", title: "Introdução", icon: "mdi-flag" },
        { id: "shortcuts", title: "Teclas de Atalho", icon: "mdi-keyboard" },
        { id: "songs", title: "Músicas e Hinos", icon: "mdi-music-note" },
        { id: "bible", title: "Bíblia Sagrada", icon: "mdi-book-cross" },
        { id: "liturgy", title: "Liturgia", icon: "mdi-hands-pray" },
        // { id: "sync", title: "Sincronização e Download", icon: "mdi-cloud-sync" },
        // { id: "displays", title: "Telas de Projeção", icon: "mdi-monitor-multiple" },
        // { id: "settings", title: "Configurações", icon: "mdi-cog" },
      ];
    },
    currentSectionTitle(): string {
      const section = this.sections.find((s) => s.id === this.activeSection);
      return section ? section.title : "";
    },
    activeSectionComponent(): string {
      const map: Record<string, string> = {
        intro: "ManualIntro",
        shortcuts: "ManualShortcuts",
        songs: "ManualSongs",
        bible: "ManualBible",
        liturgy: "ManualLiturgy",
        sync: "ManualSync",
        displays: "ManualDisplays",
        settings: "ManualSettings",
      };
      return map[this.activeSection] || "ManualIntro";
    },
  },
});
</script>

<style scoped>
.search-bar :deep(.v-field) {
  box-shadow: none !important;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.search-bar :deep(.v-field--focused) {
  border-color: var(--accent-blue);
  background: rgba(0, 151, 215, 0.05) !important;
}
.manual-sidebar .v-list-item--active {
  background: rgba(0, 151, 215, 0.1) !important;
  color: var(--accent-blue) !important;
}
.manual-list-item {
  transition: all 0.2s ease;
}
.manual-list-item:hover:not(.v-list-item--active) {
  background: rgba(0, 0, 0, 0.04) !important;
}

/* Estilos globais para as tags de atalho dentro do manual */
.manual-container :deep(kbd) {
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  color: var(--sidebar-text);
  font-family: inherit; /* Herdando a fonte principal para integrar melhor com o texto */
  font-size: 0.8em;
  font-weight: 600;
  padding: 1px 5px;
  margin: 0 3px;
  white-space: nowrap;
}

/* Remover o scroll individual das tabelas */
.manual-container :deep(.v-table__wrapper) {
  overflow: visible !important;
}
</style>
