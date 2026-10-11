<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column" :style="`z-index: 100;`">
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
        <v-btn
          icon
          variant="text"
          size="small"
          style="margin-right: 16px; color: var(--sidebar-text-secondary);"
          @click="$modules.close(module_id)"
        >
          <v-icon>mdi-arrow-left</v-icon>
          <v-tooltip
            activator="parent"
            location="bottom"
            open-delay="300"
            content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
          >
            {{ t('back') }}
          </v-tooltip>
        </v-btn>
        
        <div class="d-flex align-center mr-auto">
          <div class="album-cover-box d-flex align-center justify-center mr-4" :style="module?.data?.color ? `background: ${module.data.color}` : ''" style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);">
            <v-img
              v-if="module?.data?.url_image"
              :src="$path.file(module.data.url_image)"
              cover
              style="width: 100%; height: 100%;"
            />
            <v-icon v-else size="24" color="white">
              mdi-album
            </v-icon>
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ module?.data?.name }}
          </h2>
          
          <SplitPlayAllButton
            class="ml-6"
            :items="module?.data?.musics"
            :module-id="module?.data?.id_album"
            :image="module?.data?.url_image"
          />
        </div>
      </div>

      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <v-progress-linear
          v-if="loading"
          :color="$theme.primary()"
          indeterminate
        />

        <div v-if="!loading" class="music-list flex-grow-1 d-flex flex-column" style="background: transparent; box-shadow: none; min-height: 0;">
          <v-table class="modern-hymnal-table flex-grow-1 d-flex flex-column" style="min-height: 0; background: transparent;">
            <tbody class="music-list-container">
              <tr
                v-for="item in module?.data?.musics"
                :key="item.id_music"
                class="music-item"
                style="cursor: pointer;"
                @click="$media.open({ id_music: item.id_music, id_album: module?.data?.id_album, mode: 'audio' })"
              >
                <td class="music-info pl-3">
                  <h4 class="music-title">
                    {{ item.name }}
                  </h4>
                </td>
                <td class="music-duration">
                  {{ $datetime.shortTime(item.duration) }}
                </td>
                <td class="music-actions">
                  <div class="d-flex justify-end">
                    <MusicMenuTable
                      :id-music="item.id_music"
                      :has-instrumental-music="item.has_instrumental_music"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";

import MusicMenuTable from "@/components/MusicMenuTable.vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import SplitPlayAllButton from "@/components/SplitPlayAllButton.vue";

export default defineComponent({
  name: "AlbumModule",
  components: {
    MusicMenuTable,
    MenuToggleButton,
    SplitPlayAllButton,
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    /* NÃO MODIFICAR */
    module_id(): string {
      return manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */
    loading(): boolean {
      return this.$appdata.get("modules.album.loading") || false;
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
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
    width: 100%;
  }

  tr:hover td {
    background: transparent !important;
  }

  .music-list-container {
    display: flex;
    flex-direction: column;
    padding: 0;
    width: 100%;
  }

  .music-item {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    width: 100%;
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

  .v-table__wrapper {
    /* Scrollbar oficial do Louvor JA */
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent-blue, #009FE3);
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: var(--accent-yellow, #FFC107);
    }
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

// Suporte ao tema claro
:root[data-theme="light"],
.v-theme--light {
  .modern-hymnal-table {
    .music-item {
      border-bottom-color: rgba(0, 0, 0, 0.06);

      &:hover {
        background: rgba(0, 155, 226, 0.06) !important;
      }

      .music-title {
        color: var(--ds-text-primary, #30333A);
      }

      .music-artist,
      .music-duration {
        color: var(--ds-text-secondary, #6D7480);
      }
    }
  }
}
</style>
