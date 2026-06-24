<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column" :class="{ 'hero-mode': !searchQuery }">
      <div class="search-header-container" :class="searchQuery ? 'search-header' : 'hero-search-header'">
        <MenuToggleButton class="menu-btn" @toggle-sidebar="toggleSidebar" />
        
        <div class="hero-content d-flex flex-column align-center w-100" v-if="!searchQuery">
          <img src="/ico/favicon.svg" alt="LouvorJA" style="width: 80px; height: 80px; margin-bottom: 24px;" />
          <h1 class="hero-title mb-8">O que vamos cantar?</h1>
        </div>
        
        <div class="search-bar" :class="{ 'hero-search-bar': !searchQuery }">
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            clearable
            rounded
            class="search-input"
          />
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div class="content-main" v-if="searchQuery">
        <!-- Resultados da Pesquisa -->
        <div class="dashboard-section music-section h-100 d-flex flex-column" style="min-height: 0;">
          <h2 class="section-title mb-4">
            Resultados da Pesquisa
          </h2>
          <div class="music-list flex-grow-1 d-flex flex-column" style="min-height: 0; background: transparent; box-shadow: none;">
            <l-table
              v-model="searchData"
              :search="searchQuery"
              :searchable_fields="{
                name: true,
                albums_names: true,
              }"
              sort_by="name"
              :file="`${$i18n.locale}_musics`"
              class="flex-grow-1 d-flex flex-column"
              style="background: transparent; min-height: 0;"
            >
              <tbody class="music-list-container">
                <tr 
                  v-for="item in searchData.data" 
                  :key="item.id_music"
                  class="music-item w-100"
                  @click="$media.open({ id_music: item.id_music, mode: 'audio' })"
                  style="cursor: pointer;"
                >
                  <td class="music-info flex-grow-1" style="border-bottom: none; padding-left: 24px !important;">
                    <h4 class="music-title">
                      {{ item.name }}
                    </h4>
                    <p class="music-artist" style="margin-top: 4px;">
                      {{ item.albums ? item.albums.map(a => a.name).join(', ') : '' }}
                    </p>
                  </td>
                  <td class="music-duration pr-4" style="border-bottom: none;">
                    {{ $datetime.shortTime(item.duration) }}
                  </td>
                  <td style="border-bottom: none;">
                    <div class="d-flex justify-end pr-4">
                      <l-music-menu-table
                        :id_music="item.id_music"
                        :has_instrumental_music="item.has_instrumental_music"
                      />
                    </div>
                  </td>
                </tr>
                <tr v-if="searchData.data && searchData.data.length === 0">
                  <td class="text-center pa-8 text-grey w-100 d-block" style="border-bottom: none;">
                    Nenhuma música encontrada.
                  </td>
                </tr>
              </tbody>
            </l-table>
          </div>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
    LTable,
    LMusicMenuTable,
  },
  data() {
    return {
      searchQuery: "",
      searchData: [],
      manifest: manifest,
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

    toggleSidebar() {
      // Emite para o Main.vue via evento global
      const mainEl = document.querySelector('.main-container');
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }
    },
    
    openAlbum(id_album) {
      this.$media.openAlbum(id_album);
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/home.scss";
</style>
