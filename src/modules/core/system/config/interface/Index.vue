<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column bg-main h-100" style="overflow: hidden;">
      <ModuleHeader :title="t('main_title')" :icon="manifest.icon || 'mdi-cog'" />

      <div class="settings-body-wrapper flex-grow-1 d-flex" style="min-height: 0; overflow: hidden; justify-content: center;">
        <!-- CARD FLUTUANTE DE NAVEGAÇÃO DE CATEGORIAS -->
        <v-card
          class="settings-nav-card flex-shrink-0 d-flex flex-column pa-2 rounded-xl"
          flat
        >
          <div class="nav-pills-scroll d-flex flex-column flex-grow-1" style="overflow-y: auto; overflow-x: hidden; gap: 3px; padding-right: 2px;">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="nav-category-pill d-flex align-center w-100"
              :class="{ 'active': activeCategoryId === cat.id }"
              :title="t(cat.title)"
              @click="selectCategory(cat.id)"
            >
              <div class="pill-icon-wrap d-flex align-center justify-center mr-3">
                <v-icon size="17">
                  {{ cat.icon }}
                </v-icon>
              </div>
              <span class="pill-text flex-grow-1 text-truncate">{{ t(cat.title) }}</span>
              <v-icon v-if="activeCategoryId === cat.id" size="16" class="pill-arrow ml-1">
                mdi-chevron-right
              </v-icon>
            </button>
          </div>
        </v-card>

        <!-- PAINEL DETAIL COM CONTEÚDO DA CATEGORIA -->
        <main class="settings-content-panel flex-grow-1" style="overflow-y: auto; overflow-x: hidden; max-width: 1060px; padding-right: 8px;">
          <div class="settings-content-container pb-6">
            <!-- CABEÇALHO DA CATEGORIA SELECIONADA -->
            <div class="settings-category-header mb-6">
              <div class="d-flex align-center">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="44"
                  class="mr-3 rounded-xl"
                  style="border-radius: 14px !important;"
                >
                  <v-icon size="24" color="primary">
                    {{ activeCategory.icon }}
                  </v-icon>
                </v-avatar>
                <div>
                  <h1 class="text-h5 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
                    {{ t(activeCategory.title) }}
                  </h1>
                  <p class="text-caption text-sm-body-2 mb-0" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
                    {{ t(activeCategory.description) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- COMPONENTE MODULAR ATIVO COM TRANSIÇÃO SUAVE -->
            <transition name="fade-fast" mode="out-in">
              <component :is="activeCategory.component" :key="activeCategory.id" />
            </transition>
          </div>
        </main>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";

import ConfigSystem from "./components/ConfigSystem.vue";
import ConfigAppearance from "./components/ConfigAppearance.vue";
import ConfigCollections from "./components/ConfigCollections.vue";
import ConfigDisplays from "./components/ConfigDisplays.vue";
import ConfigSlideStyle from "./components/ConfigSlideStyle.vue";
import ConfigBible from "./components/ConfigBible.vue";
import ConfigMedia from "./components/ConfigMedia.vue";
import ConfigStreaming from "./components/ConfigStreaming.vue";
import ConfigMaintenance from "./components/ConfigMaintenance.vue";

export default defineComponent({
  name: manifest.id,
  components: {
    ModuleHeader,
    ConfigSystem,
    ConfigAppearance,
    ConfigCollections,
    ConfigDisplays,
    ConfigSlideStyle,
    ConfigBible,
    ConfigMedia,
    ConfigStreaming,
    ConfigMaintenance,
  },
  data: () => ({
    manifest,
    activeCategoryId: "system",
    categories: [
      {
        id: "system",
        title: "category_system",
        description: "category_system_desc",
        icon: "mdi-laptop",
        component: "ConfigSystem",
      },
      {
        id: "appearance",
        title: "category_appearance",
        description: "category_appearance_desc",
        icon: "mdi-palette-outline",
        component: "ConfigAppearance",
      },
      {
        id: "collections",
        title: "category_collections",
        description: "category_collections_desc",
        icon: "mdi-book-multiple-outline",
        component: "ConfigCollections",
      },
      {
        id: "displays",
        title: "category_displays",
        description: "category_displays_desc",
        icon: "mdi-monitor-multiple",
        component: "ConfigDisplays",
      },
      {
        id: "slide_style",
        title: "category_slide_style",
        description: "category_slide_style_desc",
        icon: "mdi-format-size",
        component: "ConfigSlideStyle",
      },
      {
        id: "bible",
        title: "category_bible",
        description: "category_bible_desc",
        icon: "mdi-book-open-page-variant-outline",
        component: "ConfigBible",
      },
      {
        id: "media",
        title: "category_media",
        description: "category_media_desc",
        icon: "mdi-play-circle-outline",
        component: "ConfigMedia",
      },
      {
        id: "streaming",
        title: "category_streaming",
        description: "category_streaming_desc",
        icon: "mdi-broadcast",
        component: "ConfigStreaming",
      },
      {
        id: "maintenance",
        title: "category_maintenance",
        description: "category_maintenance_desc",
        icon: "mdi-database-cog-outline",
        component: "ConfigMaintenance",
      },
    ],
  }),
  computed: {
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return (this as any).$modules.get(this.module_id);
    },
    activeCategory(): any {
      const found = this.categories.find(c => c.id === this.activeCategoryId);
      return found || this.categories[0];
    },
  },
  mounted() {
    const savedCategory = (this as any).$userdata.get("modules.config.active_category");
    if (savedCategory && this.categories.some(c => c.id === savedCategory)) {
      this.activeCategoryId = savedCategory;
    }
  },
  methods: {
    t(text: string): string {
      return (this as any).$t(`modules.${manifest.id}.${text}`);
    },
    selectCategory(id: string) {
      this.activeCategoryId = id;
      (this as any).$userdata.set("modules.config.active_category", id);
    },
  },
});
</script>

<style scoped>
.settings-body-wrapper {
  background: var(--main-bg);
  padding: 20px 32px 32px 32px;
  gap: 28px;
}

.settings-nav-card {
  width: 270px;
  min-width: 270px;
  height: fit-content;
  max-height: 100%;
  background: var(--card-bg);
  box-shadow: var(--shadow);
  border-radius: 24px !important;
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s ease;
}

:deep(.settings-card) {
  border-radius: 24px !important;
}

.nav-category-pill {
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  padding: 8px 12px;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--sidebar-text);
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  position: relative;
}

.pill-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(150, 150, 150, 0.08);
  color: var(--accent-blue);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-category-pill:hover {
  background: rgba(150, 150, 150, 0.08);
  transform: translateX(3px);
}

.nav-category-pill:hover .pill-icon-wrap {
  background: rgba(0, 151, 215, 0.15);
  color: var(--accent-blue);
}

.nav-category-pill.active {
  background: linear-gradient(135deg, var(--accent-blue) 0%, #0077b6 100%) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: none !important;
}

.nav-category-pill.active .pill-icon-wrap {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff !important;
}

.nav-category-pill.active .pill-text {
  color: #ffffff !important;
}

.nav-category-pill.active .pill-arrow {
  color: #ffffff !important;
  opacity: 0.9;
}

/* Scrollbar idêntica ao padrão refinado do módulo da Bíblia */
.settings-content-panel::-webkit-scrollbar,
.nav-pills-scroll::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.settings-content-panel::-webkit-scrollbar-track,
.nav-pills-scroll::-webkit-scrollbar-track {
  background: transparent !important;
  margin: 8px 0;
}

.settings-content-panel::-webkit-scrollbar-thumb,
.nav-pills-scroll::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background-color: var(--accent-blue, #0097d7);
  transition: background-color 0.2s ease;
}

.settings-content-panel::-webkit-scrollbar-thumb:hover,
.nav-pills-scroll::-webkit-scrollbar-thumb:hover,
.settings-content-panel::-webkit-scrollbar-thumb:active,
.nav-pills-scroll::-webkit-scrollbar-thumb:active {
  background-color: var(--accent-yellow, #ffc107);
}

.settings-content-panel,
.nav-pills-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--accent-blue, #0097d7) transparent;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-fast-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-fast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 1200px) {
  .settings-body-wrapper {
    padding: 16px 20px 24px 20px;
    gap: 20px;
  }
}

@media (max-width: 1040px) {
  .settings-body-wrapper {
    padding: 16px 16px 24px 16px !important;
    gap: 16px !important;
  }
  .settings-nav-card {
    width: 68px !important;
    min-width: 68px !important;
    padding: 8px 6px !important;
  }
  .nav-pills-scroll {
    align-items: center;
    padding-right: 0 !important;
  }
  .nav-category-pill {
    width: 52px !important;
    height: 46px !important;
    padding: 0 !important;
    justify-content: center !important;
    border-radius: 14px !important;
  }
  .nav-category-pill:hover {
    transform: scale(1.06) !important;
  }
  .nav-category-pill .pill-icon-wrap {
    margin-right: 0 !important;
  }
  .nav-category-pill .pill-text,
  .nav-category-pill .pill-arrow {
    display: none !important;
  }
}

@media (max-width: 680px) {
  .settings-body-wrapper {
    padding: 12px !important;
    gap: 10px !important;
  }
  .settings-nav-card {
    width: 58px !important;
    min-width: 58px !important;
    padding: 6px 3px !important;
  }
  .nav-category-pill {
    width: 48px !important;
    height: 42px !important;
  }
}
</style>
