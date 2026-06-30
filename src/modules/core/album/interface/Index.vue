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
          <v-tooltip activator="parent" location="bottom" open-delay="300" content-class="modern-glass-menu elevation-0 font-weight-medium text-white">Voltar</v-tooltip>
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
                v-for="item in module.data.musics"
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
                    <MusicMenuTable
                      :id_music="item.id_music"
                      :has_instrumental_music="item.has_instrumental_music"
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

<script>
import manifest from "../manifest.json";

import MusicMenuTable from "@/components/MusicMenuTable.vue";
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default {
  name: "AlbumModule",
  components: {
    MusicMenuTable,
    MenuToggleButton,
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
    loading() {
      return this.$appdata.get("modules.album.loading");
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
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
};
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
