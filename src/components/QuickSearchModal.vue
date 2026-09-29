<template>
  <v-dialog
    v-model="internalValue"
    max-width="640"
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper quick-search-modal"
    attach=".bg-main"
    transition="fade-transition"
    @keydown.esc="internalValue = false"
  >
    <v-card class="modern-alert-card rounded-xl overflow-hidden" style="display: flex; flex-direction: column; max-height: 90%; background: var(--card-bg);">
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
        >
          <template #append-inner>
            <v-menu :close-on-content-click="false" location="bottom end">
              <template #activator="{ props: menuProps }">
                <v-btn
                  icon="mdi-filter-variant"
                  size="small"
                  variant="text"
                  v-bind="menuProps"
                  color="var(--sidebar-text-secondary)"
                />
              </template>
              <v-card
                class="elevation-3"
                :color="isDark ? 'var(--card-bg)' : '#ffffff'"
                :theme="isDark ? 'dark' : 'light'"
                rounded="lg"
                min-width="220"
                style="overflow: hidden; border: 1px solid rgba(150, 150, 150, 0.1);"
              >
                <v-list class="py-2" bg-color="transparent">
                  <div
                    class="text-caption font-weight-bold mb-2 mx-4 mt-1"
                    style="color: var(--sidebar-text-secondary);"
                  >
                    Filtrar pesquisa por:
                  </div>
                  <v-list-item
                    :active="searchFilters.includes('name')"
                    active-color="var(--accent-blue)"
                    class="mx-2 rounded-lg mb-1"
                    style="min-height: 40px;"
                    @click="toggleSearchFilter('name')"
                  >
                    <div class="d-flex align-center">
                      <v-icon :icon="searchFilters.includes('name') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                      <span class="text-body-2 font-weight-medium">Nome da música</span>
                    </div>
                  </v-list-item>
                  <v-list-item
                    :active="searchFilters.includes('albums')"
                    active-color="var(--accent-blue)"
                    class="mx-2 rounded-lg mb-1"
                    style="min-height: 40px;"
                    @click="toggleSearchFilter('albums')"
                  >
                    <div class="d-flex align-center">
                      <v-icon :icon="searchFilters.includes('albums') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                      <span class="text-body-2 font-weight-medium">Álbum/Coletânea</span>
                    </div>
                  </v-list-item>
                  <v-list-item
                    :active="searchFilters.includes('lyric')"
                    active-color="var(--accent-blue)"
                    class="mx-2 rounded-lg mb-1"
                    style="min-height: 40px;"
                    @click="toggleSearchFilter('lyric')"
                  >
                    <div class="d-flex align-center">
                      <v-icon :icon="searchFilters.includes('lyric') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                      <span class="text-body-2 font-weight-medium">Letra da música</span>
                    </div>
                  </v-list-item>
                  <v-divider class="my-1 border-opacity-25" />
                  <v-list-item
                    :active="searchFilters.includes('online_collection')"
                    active-color="var(--accent-blue)"
                    class="mx-2 rounded-lg mb-1"
                    style="min-height: 40px;"
                    @click="toggleSearchFilter('online_collection')"
                  >
                    <div class="d-flex align-center">
                      <v-icon :icon="searchFilters.includes('online_collection') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                      <span class="text-body-2 font-weight-medium">Coletâneas Online</span>
                    </div>
                  </v-list-item>
                  <v-list-item
                    :active="searchFilters.includes('custom_collection')"
                    active-color="var(--accent-blue)"
                    class="mx-2 rounded-lg mb-1"
                    style="min-height: 40px;"
                    @click="toggleSearchFilter('custom_collection')"
                  >
                    <div class="d-flex align-center">
                      <v-icon :icon="searchFilters.includes('custom_collection') ? 'mdi-check-circle' : 'mdi-circle-outline'" size="small" class="mr-3" />
                      <span class="text-body-2 font-weight-medium">Coletâneas Personalizadas</span>
                    </div>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-text-field>
      </div>

      <div class="flex-grow-1" style="display: flex; flex-direction: column; position: relative;">
        <div 
          ref="scrollContainer"
          style="transition: height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); overflow-y: auto; overflow-x: hidden;"
          :style="{ height: currentHeight }"
          @scroll="onContainerScroll"
        >
          <div ref="tableWrapper">
            <LTable
              v-if="searchQuery && searchQuery.trim().length > 0"
              v-model="searchData"
              :search="searchQuery"
              :searchable-fields="searchableFields"
              :has-scroll="true"
              :scroll="scrollState"
              sort-by="name"
              :file="`${$i18n.locale}_musics`"
              style="background: transparent;"
              hide-loading
            >
              <div v-if="searchData.loading === false && searchData.data && searchData.data.length === 0" class="d-flex flex-column align-center justify-center w-100 py-10 pointer-events-none">
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
                  :key="item.id || item.id_music"
                  class="music-item w-100"
                  style="cursor: pointer;"
                  @click="playSong(item)"
                >
                  <td class="music-info flex-grow-1" style="border-bottom: none; padding-left: 20px !important; position: relative; top: -2px;">
                    <h4 class="music-title" style="margin: 0; font-size: 0.95rem; color: var(--sidebar-text);">
                      <span v-if="getHymnalTrack(item)" style="color: var(--accent-blue); margin-right: 8px;">{{ getHymnalTrack(item) }}</span>
                      {{ item.name }}
                    </h4>
                    <p class="music-artist" style="margin-top: 2px; margin-bottom: 0; font-size: 0.78rem; color: var(--sidebar-text-secondary);">
                      {{ item.subtitle || (item.albums && item.albums.length > 0 ? item.albums.map((a: any) => a.name).join(', ') : '') }}
                    </p>
                  </td>
                  <td class="music-duration pr-2" style="border-bottom: none; color: var(--sidebar-text-secondary); font-size: 0.8rem; vertical-align: middle; white-space: nowrap;">
                    {{ item.duration ? $datetime.shortTime(item.duration) : '' }}
                  </td>
                  <td style="border-bottom: none; vertical-align: middle;" class="pr-3 pl-0">
                    <div class="d-flex justify-end" @click.stop>
                      <LMusicMenuTable
                        :id-music="item.id_music"
                        :has-instrumental-music="item.has_instrumental_music"
                        :item="item"
                        compact
                        @action="onMenuAction"
                      />
                    </div>
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
import { defineComponent, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import { useUserData } from "@/composables/useHelpers";
import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";

export default defineComponent({
  name: "QuickSearchModal",
  components: {
    LTable,
    LMusicMenuTable,
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
    const searchData = ref<any>({ data: [], loading: true });
    const searchInput = ref<any>(null);
    const tableWrapper = ref<HTMLElement | null>(null);
    const currentHeight = ref("0px");
    let resizeObserver: ResizeObserver | null = null;

    const store = useStore();
    const theme = useTheme();
    const userdata = useUserData();
    const isDark = computed(() => theme.name.value === "dark");

    const searchFilters = computed<string[]>(() => {
      const sf = store.state.user_data?.search_filters;
      if (Array.isArray(sf) && sf.length > 0) {
        return sf;
      }
      return ["name"];
    });

    const searchableFields = computed(() => {
      const f: Record<string, boolean> = {};
      searchFilters.value.forEach((k) => { f[k] = true; });
      return f;
    });

    const toggleSearchFilter = (filter: string) => {
      let updated: string[];
      if (searchFilters.value.includes(filter)) {
        updated = searchFilters.value.filter((f) => f !== filter);
      } else {
        updated = [...searchFilters.value, filter];
      }
      if (updated.length === 0) {
        updated = ["name"];
      }
      userdata.set("search_filters", updated);
    };

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

    const scrollContainer = ref<HTMLElement | null>(null);
    const scrollState = ref<Record<string, any>>({});
    const onContainerScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      scrollState.value = {
        scroll_bottom: scrollBottom,
        scroll_top: target.scrollTop,
      };
    };

    watch(() => searchData.value.data?.length, () => {
      nextTick(() => {
        if (tableWrapper.value && searchQuery.value && searchQuery.value.trim().length > 0) {
          const vh60 = window.innerHeight * 0.6;
          const actualHeight = tableWrapper.value.scrollHeight;
          const newHeight = Math.min(actualHeight, vh60);
          currentHeight.value = `${newHeight}px`;
        }
      });
    });

    watch(searchQuery, (newVal) => {
      if (!newVal || newVal.trim().length === 0) {
        currentHeight.value = "0px";
      } else {
        searchData.value.loading = true;
        if (scrollContainer.value) {
          scrollContainer.value.scrollTop = 0;
        }
      }
    });

    return {
      internalValue,
      searchQuery,
      searchData,
      searchInput,
      tableWrapper,
      scrollContainer,
      scrollState,
      onContainerScroll,
      currentHeight,
      isDark,
      searchFilters,
      searchableFields,
      toggleSearchFilter,
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
    onMenuAction(action: string) {
      if (action !== "queue") {
        this.internalValue = false;
      }
    },
    playSong(song: any) {
      if (song.is_online_collection) {
        (this.$media as any).playOnlineVideo({
          id: song.video_id,
          name: song.name,
          channelName: song.channel_name,
          image: song.image,
        });
        this.internalValue = false;
        return;
      }
      if (song.is_external_song) {
        (this.$media as any).playExternalFile(song, "audio");
        this.internalValue = false;
        return;
      }
      if (!song.id_music) return;
      if (typeof song.id_music === "string" && song.id_music.startsWith("slja:")) {
        this.$media.playExternalSlja(song.id_music.slice("slja:".length));
        this.internalValue = false;
        return;
      }
      this.openMusic(song.id_music);
    },
    openMusic(id_music: number | string) {
      this.$media.open({ id_music: Number(id_music), mode: "audio" });
      this.internalValue = false;
    },
    playFirstResult() {
      if (this.searchData && this.searchData.data && this.searchData.data.length > 0) {
        this.playSong(this.searchData.data[0]);
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
