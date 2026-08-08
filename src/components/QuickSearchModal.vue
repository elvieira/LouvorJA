<template>
  <v-dialog
    v-model="internalValue"
    max-width="600"
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper quick-search-modal"
    attach=".bg-main"
    transition="fade-transition"
    @keydown.esc="internalValue = false"
  >
    <v-card class="modern-alert-card rounded-xl overflow-hidden" style="display: flex; flex-direction: column; max-height: 85vh; background: var(--card-bg);">
      <!-- Barra de Pesquisa Fixa -->
      <div class="pa-4 flex-shrink-0" style="background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(128,128,128,0.1); z-index: 2;">
        <div class="d-flex align-center mb-3 px-1">
          <v-icon color="primary" size="20" class="mr-2">
            mdi-flash
          </v-icon>
          <h2 class="text-subtitle-2 font-weight-bold text-uppercase" style="color: var(--sidebar-text-secondary); letter-spacing: 1px; margin: 0;">
            Busca Rápida
          </h2>
        </div>
        <v-text-field
          ref="searchInput"
          v-model="searchQuery"
          :placeholder="t('search_placeholder')"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          density="comfortable"
          hide-details
          clearable
          rounded="lg"
          class="search-input-hero"
          autofocus
          @keydown.enter="playFirstResult"
        />
      </div>

      <div class="flex-grow-1" style="display: flex; flex-direction: column; position: relative;">
        <div 
          style="transition: height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); overflow-y: auto; overflow-x: hidden;"
          :style="{ height: currentHeight }"
        >
          <div ref="tableWrapper">
            <LTable
              v-if="searchQuery && searchQuery.trim().length > 0"
              v-model="searchData"
              :search="searchQuery"
              :searchable-fields="{ name: true }"
              sort-by="name"
              :file="`${$i18n.locale}_musics`"
              style="background: transparent;"
            >
              <div v-if="searchData.data && searchData.data.length === 0" class="d-flex flex-column align-center justify-center w-100 py-10 pointer-events-none">
                <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">
                  mdi-magnify
                </v-icon>
                <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
                  Nenhuma música encontrada
                </p>
              </div>
              <tbody v-else class="music-list-container">
                <tr 
                  v-for="item in searchData.data" 
                  :key="item.id_music"
                  class="music-item w-100"
                  style="cursor: pointer;"
                  @click="openMusic(item.id_music)"
                >
                  <td class="music-info flex-grow-1" style="border-bottom: none; padding-left: 24px !important; position: relative; top: -6px;">
                    <h4 class="music-title" style="margin: 0; font-size: 1rem; color: var(--sidebar-text);">
                      <span v-if="getHymnalTrack(item)" style="color: var(--accent-blue); margin-right: 8px;">{{ getHymnalTrack(item) }}</span>
                      {{ item.name }}
                    </h4>
                    <p v-if="item.albums && item.albums.length > 0" class="music-artist" style="margin-top: 4px; font-size: 0.8rem; color: var(--sidebar-text-secondary);">
                      {{ item.albums.map((a: any) => a.name).join(', ') }}
                    </p>
                  </td>
                  <td class="music-duration pr-4" style="border-bottom: none; color: var(--sidebar-text-secondary); font-size: 0.85rem; vertical-align: middle;">
                    {{ $datetime.shortTime(item.duration) }}
                  </td>
                </tr>
              </tbody>
            </LTable>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import LTable from "@/components/DataTable.vue";

export default defineComponent({
  name: "QuickSearchModal",
  components: {
    LTable,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const internalValue = ref(props.modelValue);
    const searchQuery = ref("");
    const searchData = ref<any>({ data: [] });
    const searchInput = ref<any>(null);
    const tableWrapper = ref<HTMLElement | null>(null);
    const currentHeight = ref("0px");
    let resizeObserver: ResizeObserver | null = null;

    onMounted(() => {
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const target = entries[0];
        
        // Cap it at 60vh (window.innerHeight * 0.6) so the transition isn't skipped by max-height clipping
        const vh60 = window.innerHeight * 0.6;
        const actualHeight = target.target.scrollHeight;
        const newHeight = Math.min(actualHeight, vh60);
        currentHeight.value = `${newHeight}px`;
      });
      
      if (tableWrapper.value) {
        resizeObserver.observe(tableWrapper.value);
      }
    });

    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    watch(() => props.modelValue, (newVal) => {
      internalValue.value = newVal;
      if (newVal) {
        // Reset and focus
        searchQuery.value = "";
        nextTick(() => {
          setTimeout(() => {
            if (searchInput.value) {
              searchInput.value.focus();
            }
          }, 100);
        });
      }
    });

    watch(internalValue, (newVal) => {
      emit("update:modelValue", newVal);
    });

    watch(() => searchData.value.data, () => {
      nextTick(() => {
        if (tableWrapper.value && searchQuery.value && searchQuery.value.trim().length > 0) {
          const vh60 = window.innerHeight * 0.6;
          const actualHeight = tableWrapper.value.scrollHeight;
          const newHeight = Math.min(actualHeight, vh60);
          currentHeight.value = `${newHeight}px`;
        }
      });
    }, { deep: true });

    watch(searchQuery, (newVal) => {
      if (!newVal || newVal.trim().length === 0) {
        currentHeight.value = "0px";
      }
    });

    return {
      internalValue,
      searchQuery,
      searchData,
      searchInput,
      tableWrapper,
      currentHeight,
    };
  },
  methods: {
    t(key: string) {
      return this.$t(`modules.home.${key}`);
    },
    getHymnalTrack(item: any): string | null {
      if (!item.albums) return null;
      for (const al of item.albums) {
        if (al.type === "hymnal") return al.pivot?.track || null;
      }
      return null;
    },
    openMusic(id_music: number | string) {
      this.$media.open({ id_music, mode: "audio" });
      this.internalValue = false;
    },
    playFirstResult() {
      if (this.searchData && this.searchData.data && this.searchData.data.length > 0) {
        this.openMusic(this.searchData.data[0].id_music);
      }
    },
  },
});
</script>

<style scoped>
.quick-search-modal :deep(.v-overlay__content) {
  margin: 24px;
}
.search-input-hero :deep(.v-field) {
  background: var(--card-bg) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
  border: 1px solid rgba(128, 128, 128, 0.15);
}
.search-input-hero :deep(.v-field--focused) {
  border-color: var(--accent-blue) !important;
  box-shadow: 0 4px 12px rgba(0, 151, 215, 0.15) !important;
}
.music-item {
  transition: all 0.2s ease;
}
.music-item:hover {
  background: rgba(128,128,128,0.15);
}

/* Força a tabela a renderizar a altura completa do seu conteúdo, 
   já que o scroll agora é feito pelo nosso wrapper animado */
:deep(.__table-data) {
  height: auto !important;
  background: transparent !important;
}
:deep(.__table-data .v-table__wrapper) {
  overflow: visible !important;
  background: transparent !important;
}
</style>
