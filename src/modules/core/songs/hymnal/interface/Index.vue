<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <ModuleHeader :title="t('title')" :image="headerImage">
        <div
          class="search-bar ml-4 d-flex align-center"
          :style="{ maxWidth: selectionMode ? '550px' : '500px', flex: '1', gap: '8px' }"
        >
          <v-badge
            v-if="selectionMode"
            :content="selectedIds.length"
            :model-value="selectedIds.length > 0"
            color="error"
            location="top end"
            offset-x="4"
            offset-y="4"
            class="flex-shrink-0"
          >
            <v-btn
              icon
              variant="flat"
              color="primary"
              :disabled="selectedIds.length === 0"
              @click="playSelected"
            >
              <v-icon size="20">
                mdi-play
              </v-icon>
              <v-tooltip activator="parent" location="bottom">
                {{ t('inputs.play_selected') }}
              </v-tooltip>
            </v-btn>
          </v-badge>
          <v-text-field
            v-model="search"
            class="flex-grow-1"
            style="min-width: 0;"
            :placeholder="t('inputs.search')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded="xl"
            :error="search !== '' && data.filter_count <= 0"
            @keydown.enter="playFirstResult"
          />
          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon
                variant="tonal"
                color="primary"
                size="small"
                class="flex-shrink-0"
              >
                <v-icon size="20">
                  mdi-dots-vertical
                </v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('inputs.more_options') }}
                </v-tooltip>
              </v-btn>
            </template>
            <v-list density="compact" rounded="lg" class="py-1">
              <v-list-item
                :disabled="!data.showing_all && data.filter_count <= 50"
                @click="toggleShowAllHymns"
              >
                <template #prepend>
                  <v-icon size="18">
                    {{ data.showing_all ? 'mdi-format-list-numbered' : 'mdi-view-list' }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ data.showing_all ? t('inputs.show_less') : t('inputs.show_all') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="playAllHymns">
                <template #prepend>
                  <v-icon size="18">
                    mdi-play-circle
                  </v-icon>
                </template>
                <v-list-item-title>{{ t('inputs.play_all') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="toggleSelectionMode">
                <template #prepend>
                  <v-icon size="18">
                    {{ selectionMode ? 'mdi-close-circle-outline' : 'mdi-checkbox-marked-circle-outline' }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ selectionMode ? t('inputs.cancel_selection') : t('inputs.select') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </ModuleHeader>

      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <div class="music-list flex-grow-1 d-flex flex-column" style="background: transparent; box-shadow: none; min-height: 0;">
          <LTable
            ref="table"
            v-model="data"
            :search="search"
            letter=""
            :searchable-fields="{
              track: true,
              name: true,
            }"
            :scroll="scroll"
            :has-scroll="has_scroll"
            :initial-limit="50"
            sort-by="track"
            :file="`${$i18n.locale}_hymnal`"
            class="modern-hymnal-table flex-grow-1 d-flex flex-column"
            style="min-height: 0;"
          >
            <div v-if="search && data.filter_count <= 0" class="d-flex flex-column align-center justify-center w-100" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
              <v-icon size="48" color="var(--sidebar-text-secondary)" class="mb-3">
                mdi-magnify
              </v-icon>
              <p style="color: var(--sidebar-text-secondary); font-weight: 500;">
                {{ t('data.empty_search') }}
              </p>
            </div>
            <tbody v-else class="music-list-container">
              <tr
                v-for="item in data.data"
                :key="item.id_music"
                class="music-item"
                :class="{ 'music-item-selected': selectionMode && selectedIds.includes(item.id_music) }"
                style="cursor: pointer;"
                @click="selectionMode ? toggleSelect(item.id_music) : $media.open({ id_music: item.id_music, mode: 'audio' })"
              >
                <td v-if="selectionMode" class="music-select">
                  <v-checkbox
                    :model-value="selectedIds.includes(item.id_music)"
                    hide-details
                    density="compact"
                    color="primary"
                    class="flex-grow-0"
                  />
                </td>
                <td class="music-number text-center">
                  {{ item.track }}
                </td>
                <td class="music-info">
                  <h4 class="music-title">
                    {{ item.name }}
                  </h4>
                </td>
                <td class="music-duration">
                  {{ $datetime.shortTime(item.duration) }}
                </td>
                <td v-if="!selectionMode" class="music-actions">
                  <div class="d-flex justify-end">
                    <LMusicMenuTable
                      :id-music="item.id_music"
                      :has-instrumental-music="item.has_instrumental_music"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </LTable>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";
import ModuleHeader from "@/components/ModuleHeader.vue";
import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

export default defineComponent({
  name: "ModuleView",
  components: {
    ModuleHeader,
    LTable,
    LMusicMenuTable,
  },

  data() {
    return {
      search: "",
      data: { filter_count: 0, data: [] } as any,
      scroll: {} as any,
      has_scroll: false,
      selectionMode: false,
      selectedIds: [] as string[],
      hymnalImg,
      hymnal1996Img,
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    headerImage() {
      if (this.$i18n.locale === "es") {
        return this.hymnal1996Img;
      }
      return this.hymnalImg;
    },

    classform() {
      return {
        group: "d-flex flex-wrap",
        group_item:
          "flex-shrink-1 flex-grow-1 d-flex flex-wrap justify-space-around",
      };
    },
    compact() {
      return this.$vuetify.display.width <= 800;
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    onScroll(data: any) {
      this.scroll = data;
    },
    hasScroll(data: boolean) {
      this.has_scroll = data;
    },
    playFirstResult() {
      if (this.data && this.data.data && this.data.data.length > 0) {
        const first = this.data.data[0];
        if (first.id_music) {
          this.$media.open({ id_music: first.id_music, mode: "audio" });
        }
      }
    },
    toggleShowAllHymns() {
      const table = this.$refs.table as any;
      if (this.data.showing_all) {
        table?.collapseToLimit();
      } else {
        table?.loadAll();
      }
    },
    playAllHymns() {
      const list = (this.$refs.table as any)?.getFilteredData() || [];
      const ids = list.map((item: any) => item.id_music).filter(Boolean);
      if (ids.length > 0) {
        this.$media.playQueue(ids);
      }
    },
    toggleSelectionMode() {
      this.selectionMode = !this.selectionMode;
      if (!this.selectionMode) {
        this.selectedIds = [];
      }
    },
    toggleSelect(id: string) {
      const index = this.selectedIds.indexOf(id);
      if (index >= 0) {
        this.selectedIds.splice(index, 1);
      } else {
        this.selectedIds.push(id);
      }
    },
    playSelected() {
      const list = (this.$refs.table as any)?.getFilteredData() || [];
      const ids = list
        .filter((item: any) => this.selectedIds.includes(item.id_music))
        .map((item: any) => item.id_music);
      if (ids.length > 0) {
        this.selectionMode = false;
        this.selectedIds = [];
        this.$media.playQueue(ids);
      }
    },
    close() {
      this.search = "";
    },
  },
});
</script>

<style lang="scss">
.module-full-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  z-index: 10;
}

.module-icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 151, 215, 0.3);
}

.modern-hymnal-table {
  background: transparent !important;
  
  .v-table__wrapper {
    background: transparent !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    flex: 1 1 auto;
    height: 100%;
  }
  
  table {
    background: transparent !important;
    border-spacing: 0;
  }

  tr:hover td {
    background: transparent !important;
  }

  .music-list-container {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }

  .music-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-color);
    transition: var(--transition);

    &:hover {
      background: var(--sidebar-hover) !important;
    }

    &.music-item-selected {
      background: rgba(0, 151, 215, 0.1) !important;
    }

    .music-select {
      display: flex;
      align-items: center;
      margin-right: 8px;
    }

    td {
      border-bottom: none !important;
      padding: 0 !important;
      height: auto !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    &:hover td,
    &:hover > td {
      background: transparent !important;
      background-color: transparent !important;
    }
  }

  .music-number {
    font-size: 15px;
    font-weight: 600; line-height: 1;
    color: var(--accent-blue);
    min-width: 40px;
    margin-right: 16px;
  }
  
  .music-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .music-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--sidebar-text);
      margin-bottom: 2px;
      line-height: 1.2;
    }
    
    .music-artist {
      font-size: 13px;
      color: var(--sidebar-text-secondary);
      margin: 0;
    }
  }
  
  .music-duration {
    font-size: 13px;
    color: var(--sidebar-text-secondary);
    min-width: 60px;
    padding-right: 16px !important;
  }
  
  .music-actions {
    min-width: 80px;
  }
}
</style>
