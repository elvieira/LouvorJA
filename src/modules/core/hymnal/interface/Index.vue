<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Cabeçalho Integrado do Módulo -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          @click="close(); $modules.close(module_id); $router.push({ name: 'home' });"
          class="mr-4"
          color="var(--sidebar-text-secondary)"
        />
        
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
             <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600;">
            {{ t('title') }}
          </h2>
        </div>

        <div class="search-bar ml-4" style="max-width: 400px; flex: 1;">
          <v-text-field
            v-model="search"
            :placeholder="t('inputs.search')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded
            :error="search !== '' && data.filter_count <= 0"
          />
        </div>
      </div>

      <!-- Conteúdo Principal da Listagem -->
      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <div class="music-list flex-grow-1 d-flex flex-column" style="background: transparent; box-shadow: none; min-height: 0;">
          <l-table
            v-model="data"
            :search="search"
            letter=""
            :searchable_fields="{
              track: true,
              name: true,
            }"
            :scroll="scroll"
            :has_scroll="has_scroll"
            sort_by="track"
            :file="`${$i18n.locale}_hymnal`"
            class="modern-hymnal-table flex-grow-1 d-flex flex-column"
            style="min-height: 0;"
          >
            <tbody class="music-list-container">
              <tr v-for="item in data.data" :key="item.id_music" class="music-item">
                <td class="music-number text-center">
                  {{ item.track }}
                </td>
                <td class="music-info">
                  <h4 class="music-title">
                    {{ item.name }}
                  </h4>
                  <p class="music-artist">
                    {{ t("title") }}
                  </p>
                </td>
                <td class="music-duration">{{ $datetime.shortTime(item.duration) }}</td>
                <td class="music-actions">
                  <div class="d-flex justify-end">
                    <l-music-menu-table
                      :id_music="item.id_music"
                      :has_instrumental_music="item.has_instrumental_music"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </l-table>
        </div>

        <v-alert
          v-if="search && data.filter_count <= 0"
          type="error"
          :text="t('data.not_found')"
          variant="tonal"
          border="start"
          class="ma-2 mx-8"
        />

        <!-- Rodapé do Módulo -->
        <div class="w-100 px-8 pb-3 pt-2 text-right flex-shrink-0">
          <small style="color: var(--sidebar-text-secondary); font-weight: 500;">
            {{ t("data.records") }}: {{ data.filter_count }}
          </small>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";

import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";

export default {
  name: "HymnalModule",
  components: {
    LTable,
    LMusicMenuTable,
  },

  data: () => ({
    search: "",
    data: [],
    scroll: {},
    has_scroll: false,
  }),
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

    classform() {
      return {
        group: "d-flex flex-wrap",
        group_item:
          "flex-shrink-1 flex-grow-1 d-flex flex-wrap justify-space-around",
      };
    },
    compact: function () {
      return this.$vuetify.display.width <= 800;
    },
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    onScroll(data) {
      this.scroll = data;
    },
    hasScroll(data) {
      this.has_scroll = data;
    },
    close() {
      //Se fechar a janela, não manter o histórico de pesquisa.
      this.search = "";
    },
  },
};
</script>

<style lang="scss">
/* Container do modo tela cheia integrado */
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

  /* FORÇA A REMOÇÃO DO HOVER NATIVO DO VUETIFY NOS TDs */
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
    font-weight: 600;
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
