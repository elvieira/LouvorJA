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

        <div class="search-bar ml-4" style="max-width: 300px; flex: 1;">
          <v-select
            v-model="id_category"
            :items="categoryOptions"
            item-title="name"
            item-value="id_category"
            variant="solo"
            density="comfortable"
            hide-details
            rounded
            prepend-inner-icon="mdi-filter-variant"
          />
        </div>
      </div>

      <!-- Conteúdo Principal do Grid de Coleções -->
      <div class="content-main d-flex flex-column flex-grow-1" style="overflow: hidden; padding-top: 16px;">
        <v-progress-linear
          :color="$theme.primary()"
          indeterminate
          v-if="loading"
        />

        <v-alert
          v-if="error"
          type="error"
          :text="error"
          variant="tonal"
          border="start"
          class="ma-2 mx-8"
        />

        <div class="collections-page-scroll flex-grow-1" style="overflow-y: auto; overflow-x: hidden; padding: 16px 8px;">
          <div class="collections-grid-wrap">
            <div 
              v-for="album in albums" 
              :key="album.id_album"
              class="collection-card"
              @click="openAlbum(album.id_album)"
            >
              <div class="card-image" :style="album.color ? `background: ${album.color}` : ''">
                <v-img 
                  v-if="album.url_image" 
                  :src="$path.file(album.url_image)" 
                  cover 
                  style="width: 100%; height: 100%; position: absolute; inset: 0;"
                />
                <v-icon v-else size="48">mdi-album</v-icon>
              </div>
              <div class="card-content">
                <h3 class="card-title" style="-webkit-line-clamp: 2;">
                  {{ album.name }}
                </h3>
                <p class="card-stats">
                  {{ album.subtitle || '' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rodapé do Módulo -->
        <div class="w-100 px-8 pb-3 pt-2 text-right flex-shrink-0">
          <small style="color: var(--sidebar-text-secondary); font-weight: 500;">
            {{ t("all_collections") }}: {{ albums.length }}
          </small>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: manifest.id,
  data: () => ({
    categories: [],
    lang: null,
    id_category: 0,
    loading: false,
    error: null,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    categoryOptions() {
      return [
        { id_category: 0, name: this.t("all_collections") },
        ...this.categories,
      ];
    },
    albums() {
      if (!this.categories) {
        return [];
      }
      if (!this.id_category || this.id_category === 0) {
        return [
          ...new Map(
            this.categories
              .reduce((acc, category) => acc.concat(category.albums), [])
              .map((album) => [album.id_album, { ...album, subtitle: null }])
          ).values(),
        ].sort((a, b) => this.$string.sort(a.name, b.name));
      }

      return this.categories
        .filter((item) => item.id_category == this.id_category)[0]
        ?.albums.sort((a, b) => a.order - b.order) || [];
    },
    compact: function () {
      return this.$vuetify.display.width <= 600;
    },
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    async loadData() {
      this.id_category = 0;
      this.categories = [];
      this.loading = true;

      this.categories = await this.$database.get(
        `${this.$i18n.locale}_categories`
      );

      if (this.categories == null) {
        this.$modules.close(this.module_id);
        return;
      }

      if (this.categories.length > 0) {
        this.categories.sort((a, b) => a.order - b.order);
      }
      
      this.id_category = 0;
      this.lang = this.$i18n.locale;
      this.loading = false;
    },
    openAlbum(id_album) {
      this.$media.openAlbum(id_album);
    },
    async show(value) {
      if (value && this.lang != this.$i18n.locale) {
        await this.loadData();
      }
    },
    close() {
      this.id_category = 0;
    },
  },
  async mounted() {
    await this.loadData();
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

.collections-page-scroll {
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--border-color);
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(135deg, var(--accent-blue-dark) 0%, var(--accent-blue) 100%);
    }
  }
}

.collections-grid-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  padding: 0 16px 24px 16px;
  
  .collection-card {
    /* Força o width 100% para ocupar o cell do grid, sobrescrevendo flex-shrink do home.scss se houver */
    width: 100%;
    min-width: 0;
    flex-shrink: 1;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .collections-grid-wrap {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 0 8px 16px 8px;
  }
}

@media (max-width: 480px) {
  .collections-grid-wrap {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
