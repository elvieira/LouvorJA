<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <ModuleHeader :title="t('title')" :image="headerImage">
        <div class="search-bar ml-4" style="max-width: 400px; flex: 1;">
          <v-text-field
            v-model="search"
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
        </div>
        <template #title-actions>
          <v-menu
            v-if="data.unformatted_data && data.unformatted_data.length > 0"
            location="bottom center"
            open-on-hover
            :close-on-content-click="true"
          >
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                color="primary"
                variant="tonal"
                class="ml-6 text-none rounded"
                prepend-icon="mdi-play"
              >
                Reproduzir Todas
              </v-btn>
            </template>
            <v-card class="modern-glass-menu elevation-4 mt-2" rounded="lg">
              <v-list class="py-1" bg-color="transparent" density="compact">
                <v-list-item class="mx-1 rounded" style="min-height: 32px;" @click.stop="$media.playAll(data.unformatted_data, 'audio', module_id, headerImage)">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2">
                      mdi-play-circle
                    </v-icon>
                    <span class="text-caption font-weight-medium">{{ $t('modules.media.general.sung') }}</span>
                  </div>
                </v-list-item>
                <v-list-item class="mx-1 rounded" style="min-height: 32px;" @click.stop="$media.playAll(data.unformatted_data, 'instrumental', module_id, headerImage)">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2">
                      mdi-play-circle-outline
                    </v-icon>
                    <span class="text-caption font-weight-medium">{{ $t('modules.media.general.instrumental') }}</span>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>
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
                style="cursor: pointer;"
                @click="$media.open({ id_music: item.id_music, mode: 'audio' })"
              >
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
                <td class="music-actions">
                  <div class="d-flex justify-end">
                    <LMusicMenuTable
                      :id-music="item.id_music"
                      :has-instrumental-music="item.has_instrumental_music"
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="!data.showing_all && data.count < data.filter_count" class="load-more-item">
                <td colspan="4" class="text-center py-4">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    rounded="lg"
                    class="text-none font-weight-medium px-6"
                    prepend-icon="mdi-chevron-down"
                    @click="loadAllHymns"
                  >
                    {{ t('inputs.show_more') }}
                  </v-btn>
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
    loadAllHymns() {
      (this.$refs.table as any)?.loadAll();
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

  .load-more-item {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    border-bottom: none !important;

    td {
      border-bottom: none !important;
      padding: 0 !important;
      background: transparent !important;
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
