<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <div class="search-header-container" :class="(searchQuery || shouldShowHistory) ? 'search-header d-flex align-center w-100' : 'hero-search-header d-flex flex-column align-center justify-center'" :style="(searchQuery || shouldShowHistory) ? 'position: relative;' : 'flex: 1; position: relative; padding: 32px; transition: all 0.5s ease;'">
        <div :style="(searchQuery || shouldShowHistory) ? 'flex: 1; display: flex; align-items: center;' : 'position: absolute; top: 24px; left: 32px;'">
          <MenuToggleButton style="margin: 0;" @toggle-sidebar="toggleSidebar" />
        </div>

        <div v-if="!searchQuery && !shouldShowHistory" style="position: absolute; top: 24px; right: 32px; z-index: 5;">
          <button
            type="button"
            class="notification-bell-btn"
            :class="{
              'pulse-urgent': hasUrgentNotifications,
              'pulse-high': !hasUrgentNotifications && hasHighNotifications,
              'pulse-animation': !hasUrgentNotifications && !hasHighNotifications && hasUnreadNotifications,
            }"
            title="Notificações & Novidades"
            @click="openNotifications"
          >
            <v-icon
              size="22"
              :color="
                hasUrgentNotifications
                  ? 'error'
                  : hasHighNotifications
                    ? 'warning'
                    : hasUnreadNotifications
                      ? 'primary'
                      : 'var(--sidebar-text)'
              "
            >
              {{
                hasUrgentNotifications
                  ? 'mdi-bell-alert'
                  : hasHighNotifications
                    ? 'mdi-bell-alert-outline'
                    : hasUnreadNotifications
                      ? 'mdi-bell'
                      : 'mdi-bell-outline'
              }}
            </v-icon>
            <span 
              v-if="hasUnreadNotifications" 
              class="home-unread-badge"
              :class="{
                'badge-urgent': hasUrgentNotifications,
                'badge-high': !hasUrgentNotifications && hasHighNotifications,
              }"
            >
              {{ unreadNotificationsCount }}
            </span>
            <v-tooltip
              activator="parent"
              location="bottom"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{
                hasUrgentNotifications
                  ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'notificação urgente' : 'notificações (urgente)'}`
                  : hasHighNotifications
                    ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'notificação de alta prioridade' : 'notificações (alta prioridade)'}`
                    : hasUnreadNotifications
                      ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'nova notificação' : 'novas notificações'}`
                      : 'Notificações'
              }}
            </v-tooltip>
          </button>
        </div>
        
        <div v-if="!searchQuery && !shouldShowHistory" class="hero-content d-flex flex-column align-center w-100">
          <img src="/ico/favicon.svg" alt="LouvorJA" class="hero-logo" />
          <h1 class="hero-title mb-6">
            {{ t("what_shall_we_sing") }}
          </h1>
        </div>
        
        <div class="search-bar" :style="(searchQuery || shouldShowHistory) ? 'flex: 2; display: flex; justify-content: center; transition: all 0.5s ease;' : 'width: 100%; max-width: 650px; transition: all 0.5s ease;'">
          <v-text-field
            ref="searchInput"
            v-model="searchQuery"
            :placeholder="t('search_placeholder')"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            hide-details
            rounded="xl"
            :style="(searchQuery || shouldShowHistory) ? 'width: 100%; max-width: 600px;' : 'width: 100%;'"
            class="search-input-hero"
            @keydown.enter="playFirstResult"
          >
            <template #append-inner>
              <div class="d-flex align-center">
                <!-- Botão Limpar (X) -->
                <v-btn
                  v-if="searchQuery"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  class="clear-search-btn mr-1"
                  title="Limpar pesquisa"
                  @click="clearSearch"
                />

                <!-- Botão e Popover de Filtros -->
                <v-menu :close-on-content-click="false" location="bottom end" :offset="10">
                  <template #activator="{ props }">
                    <v-btn
                      icon="mdi-filter-variant"
                      size="small"
                      variant="text"
                      v-bind="props"
                      class="filter-search-btn"
                      :class="{ 'filter-active': hasCustomFilter }"
                      title="Filtrar pesquisa"
                    />
                  </template>
                  <v-card
                    :theme="isDark ? 'dark' : 'light'"
                    class="search-filter-popover elevation-6"
                    style="min-width: 250px;"
                  >
                    <div class="filter-header">
                      {{ t("filter_search_by") }}
                    </div>
                    <div
                      class="filter-item"
                      :class="{ active: searchFilters.includes('name') }"
                      @click="toggleSearchFilter('name')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('name') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        class="filter-radio-icon"
                      />
                      <span class="filter-label">{{ t("filter_name") }}</span>
                    </div>
                    <div
                      class="filter-item"
                      :class="{ active: searchFilters.includes('albums') }"
                      @click="toggleSearchFilter('albums')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('albums') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        class="filter-radio-icon"
                      />
                      <span class="filter-label">{{ t("filter_albums") }}</span>
                    </div>
                    <div
                      class="filter-item"
                      :class="{ active: searchFilters.includes('lyric') }"
                      @click="toggleSearchFilter('lyric')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('lyric') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        class="filter-radio-icon"
                      />
                      <span class="filter-label">{{ t("filter_lyric") }}</span>
                    </div>
                    <div class="filter-divider" />
                    <div
                      class="filter-item"
                      :class="{ active: searchFilters.includes('online_collection') }"
                      @click="toggleSearchFilter('online_collection')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('online_collection') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        class="filter-radio-icon"
                      />
                      <span class="filter-label">{{ t("filter_online") }}</span>
                    </div>
                    <div
                      class="filter-item"
                      :class="{ active: searchFilters.includes('custom_collection') }"
                      @click="toggleSearchFilter('custom_collection')"
                    >
                      <v-icon
                        :icon="searchFilters.includes('custom_collection') ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        class="filter-radio-icon"
                      />
                      <span class="filter-label">{{ t("filter_custom") }}</span>
                    </div>
                  </v-card>
                </v-menu>
              </div>
            </template>
          </v-text-field>
        </div>

        <div v-if="(searchQuery || shouldShowHistory)" style="flex: 1; display: flex; justify-content: flex-end; align-items: center; padding-right: 16px;">
          <button
            type="button"
            class="notification-bell-btn"
            :class="{
              'pulse-urgent': hasUrgentNotifications,
              'pulse-high': !hasUrgentNotifications && hasHighNotifications,
              'pulse-animation': !hasUrgentNotifications && !hasHighNotifications && hasUnreadNotifications,
            }"
            title="Notificações & Novidades"
            @click="openNotifications"
          >
            <v-icon
              size="22"
              :color="
                hasUrgentNotifications
                  ? 'error'
                  : hasHighNotifications
                    ? 'warning'
                    : hasUnreadNotifications
                      ? 'primary'
                      : 'var(--sidebar-text)'
              "
            >
              {{
                hasUrgentNotifications
                  ? 'mdi-bell-alert'
                  : hasHighNotifications
                    ? 'mdi-bell-alert-outline'
                    : hasUnreadNotifications
                      ? 'mdi-bell'
                      : 'mdi-bell-outline'
              }}
            </v-icon>
            <span 
              v-if="hasUnreadNotifications" 
              class="home-unread-badge"
              :class="{
                'badge-urgent': hasUrgentNotifications,
                'badge-high': !hasUrgentNotifications && hasHighNotifications,
              }"
            >
              {{ unreadNotificationsCount }}
            </span>
            <v-tooltip
              activator="parent"
              location="bottom"
              open-delay="300"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{
                hasUrgentNotifications
                  ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'notificação urgente' : 'notificações (urgente)'}`
                  : hasHighNotifications
                    ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'notificação de alta prioridade' : 'notificações (alta prioridade)'}`
                    : hasUnreadNotifications
                      ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'nova notificação' : 'novas notificações'}`
                      : 'Notificações'
              }}
            </v-tooltip>
          </button>
        </div>
      </div>

      <div v-if="searchQuery || shouldShowHistory" class="content-main">
        <div v-if="searchQuery" class="dashboard-section music-section h-100 d-flex flex-column" style="min-height: 0;">
          <div class="section-header">
            <h2 class="section-title">
              {{ t("search_results") }}
            </h2>
            <span v-if="searchData && searchData.data && !searchData.loading" class="text-caption font-weight-medium" style="color: var(--ds-text-secondary);">
              {{ searchData.data.length }} {{ t("songs") }}
            </span>
          </div>
          <div class="music-list flex-grow-1 d-flex flex-column" style="min-height: 0;">
            <LTable
              v-model="searchData"
              :search="searchQuery"
              :searchable-fields="searchableFields"
              sort-by="name"
              :file="`${$i18n.locale}_musics`"
              class="flex-grow-1 d-flex flex-column"
              style="background: transparent; min-height: 0;"
              hide-loading
            >
              <div v-if="searchData.loading === false && searchData.data && searchData.data.length === 0" class="empty-state d-flex flex-column align-center justify-center w-100" style="padding: 64px 24px;">
                <v-icon size="52" color="var(--ds-text-secondary)" class="mb-3">
                  mdi-magnify
                </v-icon>
                <p style="color: var(--ds-text-primary); font-size: 15px; font-weight: 600; margin-bottom: 4px;">
                  {{ t("no_musics_found") }}
                </p>
              </div>
              <tbody v-else class="music-list-container">
                <tr 
                  v-for="item in searchData.data" 
                  :key="item.id || item.id_music"
                  class="music-item search-result-item w-100"
                  :class="{ 'is-playing': isSongPlaying(item) }"
                  style="cursor: pointer;"
                  @click="playSong(item)"
                >
                  <td class="music-number-cell">
                    <span v-if="getHymnalTrack(item)" class="hymnal-track-number">
                      {{ getHymnalTrack(item) }}
                    </span>
                  </td>
                  <td class="music-play-cell">
                    <button 
                      type="button" 
                      class="music-play-btn"
                      :title="isSongPlaying(item) ? 'Em reprodução' : 'Reproduzir música'"
                      @click.stop="playSong(item)"
                    >
                      <v-icon size="18">
                        {{ isSongPlaying(item) ? 'mdi-volume-high' : 'mdi-play' }}
                      </v-icon>
                    </button>
                  </td>
                  <td class="music-info flex-grow-1">
                    <h4 class="music-title">
                      {{ item.name }}
                    </h4>
                    <p class="music-artist">
                      {{ item.subtitle || (item.albums ? item.albums.map((a: any) => a.name).join(', ') : '') }}
                    </p>
                  </td>
                  <td class="music-duration pr-4">
                    {{ item.duration ? $datetime.shortTime(item.duration) : '' }}
                  </td>
                  <td>
                    <div class="music-actions d-flex justify-end pr-4" @click.stop>
                      <LMusicMenuTable
                        :id-music="item.id_music"
                        :has-instrumental-music="item.has_instrumental_music"
                        :item="item"
                        :pulse-lyric="searchFilters.includes('lyric')"
                        :search-query="searchQuery"
                        :compact="true"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </LTable>
          </div>
        </div>

        <template v-else-if="shouldShowHistory && !searchQuery">
          <!-- Seção: Coletâneas Recentes -->
          <div class="dashboard-section collections-section">
            <div class="section-header">
              <h2 class="section-title">
                {{ t("recent_collections") }}
              </h2>
              <button
                type="button"
                class="section-see-all-btn"
                @click="openAllCollections"
              >
                <span>{{ t("see_all") }}</span>
                <v-icon size="16">
                  mdi-arrow-right
                </v-icon>
              </button>
            </div>
            <div 
              v-if="displayCollections.length > 0" 
              ref="collectionsGrid"
              class="collections-grid"
              @wheel="handleCollectionsScroll"
            >
              <div 
                v-for="collection in displayCollections" 
                :key="collection.id"
                class="collection-card"
                @click="openCollection(collection)"
              >
                <div class="card-image">
                  <v-img 
                    v-if="getCollectionImage(collection)" 
                    :src="getCollectionImage(collection)" 
                    cover 
                    class="card-cover-img"
                  />
                  <v-icon
                    v-else
                    size="48"
                    color="var(--ds-accent)"
                  >
                    {{ collection.icon || 'mdi-music-box-multiple' }}
                  </v-icon>
                </div>
                <div class="card-content">
                  <h3 class="card-title" :title="getCollectionName(collection)">
                    {{ getCollectionName(collection) }}
                  </h3>
                  <p v-if="collection.songCount" class="card-stats">
                    {{ collection.songCount }} {{ t("songs") }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state collections-empty">
              <v-icon size="48" color="var(--ds-text-secondary)">
                mdi-music-box-multiple-outline
              </v-icon>
              <p>{{ t("no_collections_played") }}</p>
            </div>
          </div>

          <!-- Seção: Músicas Mais Tocadas -->
          <div class="dashboard-section music-section">
            <div class="section-header">
              <h2 class="section-title">
                {{ t("top_songs") }}
              </h2>
              <button
                type="button"
                class="section-see-all-btn"
                @click="openAllSongs"
              >
                <span>{{ t("see_all") }}</span>
                <v-icon size="16">
                  mdi-arrow-right
                </v-icon>
              </button>
            </div>
            <div class="music-list">
              <div class="music-list-container">
                <div 
                  v-for="(song, index) in topSongs" 
                  :key="song.id_music || index"
                  class="music-item"
                  :class="{ 'is-playing': isSongPlaying(song) }"
                  @click="playSong(song)"
                >
                  <div class="music-number">
                    {{ index + 1 }}
                  </div>
                  <button 
                    type="button" 
                    class="music-play-btn"
                    :title="isSongPlaying(song) ? 'Em reprodução' : 'Reproduzir música'"
                    @click.stop="playSong(song)"
                  >
                    <v-icon size="18">
                      {{ isSongPlaying(song) ? 'mdi-volume-high' : 'mdi-play' }}
                    </v-icon>
                  </button>
                  <div class="music-info">
                    <h4 class="music-title">
                      {{ song.name }}
                    </h4>
                    <p class="music-artist">
                      {{ song.album_name }}
                    </p>
                  </div>
                  <div class="music-duration">
                    {{ $datetime.shortTime(song.duration) }}
                  </div>
                  <div class="music-actions" @click.stop>
                    <LMusicMenuTable
                      :id-music="song.id_music"
                      :has-instrumental-music="Boolean(song.has_instrumental_music)"
                      :item="song"
                      :compact="true"
                    />
                  </div>
                </div>
                <div v-if="topSongs.length === 0" class="empty-state">
                  <v-icon size="48" color="var(--ds-text-secondary)">
                    mdi-music-note-off
                  </v-icon>
                  <p>{{ t("no_songs_played") }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import manifest from "../manifest";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import LTable from "@/components/DataTable.vue";
import LMusicMenuTable from "@/components/MusicMenuTable.vue";
import { useTheme } from "vuetify";
import {
  unreadCount,
  hasUnread,
  hasUrgentUnread,
  hasHighUnread,
  toggleNotificationsPanel,
} from "@/helpers/services/Notifications";

import hymnalImg from "@/assets/images/hymnal.jpeg";
import hymnal1996Img from "@/assets/images/hymnal_1996.jpeg";

export default defineComponent({
  name: manifest.id,
  components: {
    MenuToggleButton,
    LTable,
    LMusicMenuTable,
  },
  setup() {
    const theme = useTheme();
    const isDark = computed(() => theme.name.value === "dark");
    const hasUnreadNotifications = hasUnread;
    const unreadNotificationsCount = unreadCount;
    const hasUrgentNotifications = hasUrgentUnread;
    const hasHighNotifications = hasHighUnread;
    const openNotifications = () => {
      toggleNotificationsPanel(true);
    };

    return {
      isDark,
      hasUnreadNotifications,
      unreadNotificationsCount,
      hasUrgentNotifications,
      hasHighNotifications,
      openNotifications,
    };
  },
  data: () => ({
    searchQuery: "",
    searchData: { data: [], loading: true } as any,
    manifest,
    dynamicCollectionInfo: {} as Record<string, any>,
    show_home_history: true,
    hymnalImg,
    hymnal1996Img,
  }),
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

    musicModules(): any[] {
      const modules = this.$appdata.get("modules") || {};
      const musicGroup = this.$appdata.get("module_group.musics") || {};
      const musicModuleIds = musicGroup.modules || [];
      
      const result: any[] = [];
      musicModuleIds.forEach((id: string) => {
        if (modules[id]) {
          result.push({
            id,
            ...modules[id],
          });
        }
      });
      
      return result;
    },

    shouldShowHistory(): boolean {
      return this.show_home_history && (this.displayCollections.length > 0 || this.topSongs.length > 0);
    },
    
    displayCollections(): any[] {
      const recentCollections = (this as any).$history.getRecentCollections();
      
      return recentCollections.map((item: any) => {
        const dynInfo = this.dynamicCollectionInfo[item.id] || {};
        
        return {
          ...item,
          songCount: dynInfo.songCount || 0,
          url_image: dynInfo.url_image || item.url_image,
        };
      });
    },
    
    topSongs(): any[] {
      return (this as any).$history.getTopSongs(20);
    },
    
    compact(): boolean {
      return this.$vuetify.display.width <= 800;
    },
    currentMediaId(): any {
      return this.$appdata.get("modules.media.id_music");
    },
    searchFilters(): string[] {
      const sf = (this as any).$store?.state?.user_data?.search_filters;
      if (Array.isArray(sf) && sf.length > 0) {
        return sf;
      }
      return ["name"];
    },
    hasCustomFilter(): boolean {
      return this.searchFilters.length > 1 || !this.searchFilters.includes("name");
    },
    searchableFields(): any {
      const fields: any = {};
      this.searchFilters.forEach(f => { fields[f] = true; });
      return fields;
    },
  },
  watch: {
    displayCollections: {
      handler() {
        this.fetchCollectionInfo();
      },
      deep: true,
      immediate: true,
    },
    searchQuery(newVal: string) {
      if (!newVal) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            (this.$refs.searchInput as any).focus();
          }
        });
      } else {
        this.searchData.loading = true;
      }
    },
    "module.show": {
      handler(newVal: boolean) {
        if (newVal) {
          const setting = this.$userdata.get("show_home_history");
          this.show_home_history = setting !== false;
          
          this.$nextTick(() => {
            if (this.$refs.searchInput) {
              (this.$refs.searchInput as any).focus();
            }
          });
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchCollectionInfo();
    const setting = this.$userdata.get("show_home_history");
    this.show_home_history = setting !== false;
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    /* NÃO MODIFICAR */
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */

    async fetchCollectionInfo() {
      const collections = this.displayCollections;
      let allCategories: any;
      
      for (const col of collections) {
        if (!this.dynamicCollectionInfo[col.id]) {
          try {
            const info: Record<string, any> = { songCount: 0, url_image: null };
            
            if (col.type === "album") {
              const data = await this.$database.get(`album_${col.id}`);
              if (data) {
                info.songCount = data.musics ? data.musics.length : (data.data ? data.data.length : 0);
                info.url_image = data.url_image;
              }
            } else {
              const modData = this.$appdata.get(`modules.${col.id}`);
              if (modData && modData.url_image) {
                info.url_image = modData.url_image;
              }

              if (["hymnal", "hymnal_1996"].includes(col.id)) {
                const locale = this.$i18n.locale;
                const data = await this.$database.get(`${locale}_${col.id}`);
                if (data && data.data) {
                  info.songCount = data.data.length;
                }
              }
            }

            if (!info.url_image) {
              if (!allCategories) {
                allCategories = await this.$database.get(`${this.$i18n.locale}_categories`);
              }
              if (allCategories) {
                for (const cat of allCategories) {
                  const albumObj = cat.albums?.find((a: any) => a.id_album === col.id || a.id_album === col.module || a.id_album === col.id.replace("hymnal", "hasd"));
                  if (albumObj && albumObj.url_image) {
                    info.url_image = albumObj.url_image;
                    break;
                  }
                }
              }
            }
            
            if (info.url_image && window.electronAPI) {
              const imgRelativePath = info.url_image.replace(/^\/(musics|images|covers)\//, "");
              const localCheck = await window.electronAPI.checkMedia("covers", imgRelativePath);
              if (localCheck) {
                info.local_url_image = localCheck;
              }
            }
            
            this.dynamicCollectionInfo = {
              ...this.dynamicCollectionInfo,
              [col.id]: info,
            };
          } catch(e) {
            console.error("Erro ao buscar info da coletânea", col.id, e);
          }
        }
      }
    },
    
    getCollectionImage(collection: any) {
      const name = this.getCollectionName(collection) || "";
      
      if (
        collection.id === "hymnal_1996" || 
        collection.module === "hymnal_1996" || 
        collection.id === "ha1996" ||
        name.includes("1996") ||
        (collection.url_image && collection.url_image.includes("1996"))
      ) {
        return this.hymnal1996Img;
      }
      
      if (
        collection.id === "hymnal" || 
        collection.module === "hymnal" || 
        collection.id === "hasd" ||
        name.includes("Hinário") ||
        name.includes("Himnario") ||
        collection.url_image === "/covers/hasd.bmp"
      ) {
        return this.$i18n.locale === "es" ? this.hymnal1996Img : this.hymnalImg;
      }
      
      if (collection.local_url_image) {
        return collection.local_url_image;
      }
      
      if (collection.url_image) {
        return this.$path.file(collection.url_image);
      }
      return null;
    },

    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },
    
    handleCollectionsScroll(event: WheelEvent) {
      event.preventDefault();
      
      const collectionsGrid = this.$refs.collectionsGrid as HTMLElement;
      
      if (collectionsGrid) {
        const scrollAmount = event.deltaY * 2;
        
        collectionsGrid.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    },
    
    openCollection(collection: any) {
      const name = (this.getCollectionName(collection) || "").toLowerCase();
      const id = String(collection.id).toLowerCase();
      const module = String(collection.module || "").toLowerCase();
      const img = String(collection.url_image || "").toLowerCase();

      const is1996 = id === "hymnal_1996" || 
        module === "hymnal_1996" || 
        id === "ha1996" ||
        name.includes("1996") ||
        img.includes("1996");

      const isNormal = id === "hymnal" || 
        module === "hymnal" || 
        id === "hasd" ||
        name.includes("hinário") ||
        name.includes("hinario") ||
        img.includes("hasd");

      if (is1996) {
        this.$modules.open("hymnal_1996");
        return;
      }
      
      if (isNormal) {
        this.$modules.open("hymnal");
        return;
      }
      
      if (collection.type === "album") {
        this.$media.openAlbum(collection.id);
      } else {
        this.$modules.open(collection.id);
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
        return;
      }
      if (song.is_external_song) {
        (this.$media as any).playExternalFile(song, "audio");
        return;
      }
      if (!song.id_music) return;
      if (typeof song.id_music === "string" && song.id_music.startsWith("slja:")) {
        this.$media.playExternalSlja(song.id_music.slice("slja:".length));
        return;
      }
      this.$media.open({ id_music: Number(song.id_music), mode: "audio" });
    },
    
    getCollectionName(collection: any): string {
      return collection.name || this.$t(collection.title) || collection.id;
    },
    
    playFirstResult() {
      if (this.searchData && this.searchData.data && this.searchData.data.length > 0) {
        this.playSong(this.searchData.data[0]);
      }
    },
    
    getHymnalTrack(item: any): string | number | null {
      if (!item) return null;
      if (item.hymnal_track) return item.hymnal_track;
      if (item.albums && Array.isArray(item.albums)) {
        const hymnalAlbum = item.albums.find((a: any) => a.type === "hymnal");
        if (hymnalAlbum?.pivot?.track) {
          return hymnalAlbum.pivot.track;
        }
      }
      return null;
    },
    
    openAlbum(id_album: string) {
      this.$media.openAlbum(id_album);
    },
    
    toggleSearchFilter(filter: string) {
      let updated: string[];
      if (this.searchFilters.includes(filter)) {
        updated = this.searchFilters.filter((f: string) => f !== filter);
      } else {
        updated = [...this.searchFilters, filter];
      }
      if (updated.length === 0) {
        updated = ["name"];
      }
      this.$userdata.set("search_filters", updated);
    },

    clearSearch() {
      this.searchQuery = "";
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          (this.$refs.searchInput as any).focus();
        }
      });
    },

    isSongPlaying(song: any): boolean {
      if (!song || !this.currentMediaId) return false;
      return Number(this.currentMediaId) === Number(song.id_music) || this.currentMediaId === song.id_music;
    },

    openAllCollections() {
      this.$modules.open("collections");
    },

    openAllSongs() {
      this.$modules.open("musics");
    },
  },
});
</script>

<style lang="scss">
.dashboard-home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header {
  background: transparent;
  padding: 24px 32px 10px 32px;
}

.hero-search-header {
  background: transparent;

  .hero-content {
    animation: fadeIn 0.4s ease;
  }

  .hero-logo {
    width: 88px;
    height: 88px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.15));
  }

  .hero-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--ds-text-primary);
    letter-spacing: -0.5px;
  }
}

.dashboard-home .search-bar {
  .v-field {
    background: var(--ds-surface, var(--card-bg)) !important;
    box-shadow: none !important;
    border: 1px solid var(--ds-border, #43495b) !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 26px !important;
    
    .v-field__input {
      padding: 10px 16px !important;
      font-size: 14px !important;
      color: var(--ds-text-primary, var(--sidebar-text)) !important;

      &::placeholder {
        color: var(--ds-text-secondary, var(--sidebar-text-secondary)) !important;
        opacity: 0.8;
      }
    }
    
    .v-field__prepend-inner {
      padding-left: 16px !important;
      
      .v-icon {
        color: var(--ds-text-secondary, #a0a6b5) !important;
        opacity: 0.9;
        transition: color 0.2s ease;
      }
    }
    
    &:hover {
      border-color: rgba(0, 155, 226, 0.45) !important;
    }
    
    &.v-field--focused {
      border-color: var(--ds-accent, #009be2) !important;
      background: var(--ds-surface, var(--card-bg)) !important;
      box-shadow: 0 0 0 3px rgba(0, 155, 226, 0.15) !important;

      .v-field__prepend-inner .v-icon {
        color: var(--ds-accent, #009be2) !important;
        opacity: 1;
      }
    }
  }

  .clear-search-btn {
    color: var(--ds-text-secondary, #a0a6b5) !important;
    border-radius: 50% !important;
    transition: all 0.15s ease;

    &:hover {
      color: var(--ds-text-primary, #f7f8fc) !important;
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.1)) !important;
    }
  }

  .filter-search-btn {
    color: var(--ds-text-secondary, #a0a6b5) !important;
    border-radius: 50% !important;
    transition: all 0.15s ease;

    &:hover, &.filter-active {
      color: var(--ds-accent, #009be2) !important;
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.1)) !important;
    }
  }
}

.search-filter-popover {
  background: var(--ds-surface, #30364a) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28) !important;
  padding: 8px !important;
  user-select: none;

  .filter-header {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--ds-text-secondary, #a0a6b5);
    padding: 6px 12px 6px 12px;
  }

  .filter-item {
    display: flex;
    align-items: center;
    padding: 9px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    color: var(--ds-text-primary, #f7f8fc);

    &:hover {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
    }

    &.active {
      background: rgba(0, 155, 226, 0.14) !important;
      color: var(--ds-accent, #009be2) !important;
      font-weight: 600;

      .filter-radio-icon {
        color: var(--ds-accent, #009be2) !important;
      }
    }

    .filter-radio-icon {
      font-size: 18px;
      margin-right: 12px;
      color: var(--ds-text-secondary, #a0a6b5);
      transition: color 0.15s ease;
    }

    .filter-label {
      font-size: 13px;
      font-weight: 500;
    }
  }

  .filter-divider {
    height: 1px;
    background: var(--ds-border, #43495b);
    opacity: 0.6;
    margin: 6px 8px;
  }
}

.content-main {
  padding: 20px 32px 32px 32px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-section {
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  
  &.collections-section {
    flex-shrink: 0;
    position: relative;
    min-height: 200px;
  }
  
  &.music-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    width: 100%;
    flex-shrink: 0;

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--ds-text-primary, var(--sidebar-text));
      margin: 0 !important;
      padding: 0;
      letter-spacing: -0.2px;
    }

    .section-see-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--ds-accent, #009be2);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
        transform: translateX(2px);
      }
    }
  }

  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--ds-text-primary, var(--sidebar-text));
    margin: 0 !important;
    padding-bottom: 10px;
    align-self: flex-start;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}

.collections-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 4px 14px 4px;
  margin-top: -6px;
  scroll-behavior: smooth;
  cursor: grab;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 8px;
    background-color: rgba(128, 128, 128, 0.15);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: var(--accent-blue, #009be2);
  }

  &::-webkit-scrollbar-thumb:hover,
  &::-webkit-scrollbar-thumb:active {
    background-color: var(--accent-yellow, #ffc107);
  }
  
  &:active {
    cursor: grabbing;
  }
}

.collection-card {
  width: 176px;
  min-width: 176px;
  background: var(--ds-surface, var(--card-bg));
  border: 1px solid var(--ds-border, #43495b);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 12px;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: rgba(0, 155, 226, 0.5);
    box-shadow: var(--shadow-hover);
    transform: translateY(-4px);

    .card-image img, .card-image .v-img {
      transform: scale(1.04);
    }
  }

  &:active {
    transform: scale(0.98);
  }
  
  .card-image {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: var(--ds-surface-elevated, #353c52);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    border-radius: 10px;

    img, .v-img {
      width: 100%;
      height: 100%;
      transition: transform 0.25s ease;
    }
  }
  
  .card-content {
    padding: 10px 2px 2px 2px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: transparent;
    
    .card-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--ds-text-primary, var(--sidebar-text));
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }
    
    .card-stats {
      font-size: 12px;
      color: var(--ds-text-secondary, var(--sidebar-text-secondary));
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.music-list {
  background: var(--ds-surface, var(--card-bg));
  border: 1px solid var(--ds-border, #43495b);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

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
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
}

.music-item {
  display: flex;
  align-items: center;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid var(--ds-border, #43495b);
  transition: background 0.15s ease, color 0.15s ease;
  cursor: pointer;
  user-select: none;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));

    .music-play-btn {
      background: var(--ds-accent, #009be2);
      color: #ffffff;
      transform: scale(1.05);
    }
  }

  &.is-playing {
    background: rgba(0, 155, 226, 0.12) !important;

    .music-title {
      color: var(--ds-accent, #009be2) !important;
      font-weight: 700 !important;
    }

    .music-play-btn {
      background: var(--ds-accent, #009be2);
      color: #ffffff;
    }
  }
  
  .music-number {
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    color: var(--ds-accent, #009be2);
    width: 36px;
    min-width: 36px;
    max-width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .music-play-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 155, 226, 0.12);
    color: var(--ds-accent, #009be2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    flex-shrink: 0;
    border: none;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  &.search-result-item {
    padding: 0 16px 0 0 !important;

    td {
      border-bottom: none !important;
    }

    .music-number-cell {
      width: 54px !important;
      min-width: 54px !important;
      max-width: 54px !important;
      height: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex-shrink: 0;

      .hymnal-track-number {
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        color: var(--ds-accent, #009be2);
        text-align: center;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .music-play-cell {
      width: 44px !important;
      min-width: 44px !important;
      max-width: 44px !important;
      height: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .music-play-btn {
        margin-right: 0 !important;
      }
    }

    .music-info {
      padding-left: 8px !important;
    }
  }
  
  .music-info {
    flex: 1;
    min-width: 0;
    padding-right: 16px;
    
    .music-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--ds-text-primary, var(--sidebar-text));
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.15s ease;
    }
    
    .music-artist {
      font-size: 12px;
      color: var(--ds-text-secondary, var(--sidebar-text-secondary));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }
  }
  
  .music-duration {
    font-size: 13px;
    color: var(--ds-text-secondary, var(--sidebar-text-secondary));
    margin-right: 14px;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .music-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  
  p {
    font-size: 14px;
    color: var(--sidebar-text-secondary);
    text-align: center;
  }
}

@media (max-width: 1024px) {  
  .search-header {
    padding: 16px 20px 8px 20px;
    justify-content: flex-start;
    
    .search-bar {
      max-width: 100%;
      
      .v-field__input {
        padding: 10px 14px !important;
        font-size: 13px !important;
      }
      
      .v-field__prepend-inner {
        padding-left: 12px !important;
      }
    }
  }
  
  .content-main {
    padding: 16px 20px 20px 20px;
  }
}

@media (max-width: 768px) {  
  .search-header {
    padding: 12px 16px 6px 16px;
    
    .search-bar .v-field {
      border-radius: 20px !important;
      
      .v-field__input {
        padding: 8px 12px !important;
        font-size: 12px !important;
      }
      
      .v-field__prepend-inner {
        padding-left: 10px !important;
      }
    }
  }
  
  .content-main {
    padding: 12px 16px 16px 16px;
  }
}

@media (max-height: 820px) {
  .search-header {
    padding: 14px 24px 8px 24px;
  }

  .content-main {
    padding: 14px 24px 20px 24px;
  }

  .dashboard-section {
    margin-bottom: 24px;

    &.collections-section {
      min-height: auto;
    }

    &.music-section {
      min-height: 180px;
    }
  }
}

@media (max-height: 720px) {
  .search-header {
    padding: 10px 20px 4px 20px;
  }

  .content-main {
    padding: 8px 20px 14px 20px;
  }

  .dashboard-section {
    margin-bottom: 16px;

    &.collections-section {
      min-height: auto;
    }

    &.music-section {
      min-height: 150px;
    }
  }
}

.notification-bell-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--ds-surface, var(--card-bg)) !important;
  border: 1px solid var(--ds-border, var(--border-color)) !important;
  color: var(--ds-text-primary, var(--sidebar-text));
  box-shadow: var(--shadow) !important;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  overflow: visible;

  &:hover {
    background: var(--ds-surface-elevated, var(--sidebar-hover)) !important;
    border-color: var(--ds-accent, var(--accent-blue)) !important;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }

  &.pulse-animation {
    animation: pulse-border-home 2s infinite !important;
  }

  &.pulse-high {
    animation: pulse-border-high 2s infinite !important;
  }

  &.pulse-urgent {
    animation: pulse-border-urgent 1.5s infinite !important;
  }
}

@keyframes pulse-border-home {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 151, 215, 0.5) !important;
  }
  70% {
    box-shadow: 0 0 0 8px rgba(0, 151, 215, 0) !important;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 151, 215, 0) !important;
  }
}

@keyframes pulse-border-high {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5) !important;
  }
  70% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0) !important;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0) !important;
  }
}

@keyframes pulse-border-urgent {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6) !important;
  }
  70% {
    box-shadow: 0 0 0 9px rgba(239, 68, 68, 0) !important;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0) !important;
  }
}

.home-unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--ds-accent, #009be2);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  padding: 0 5px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  border: 2px solid var(--ds-surface, #ffffff);
  pointer-events: none;

  &.badge-high {
    background-color: #f59e0b !important;
  }

  &.badge-urgent {
    background-color: #ef4444 !important;
    animation: badge-pulse-urgent 1.5s infinite;
  }
}

@keyframes badge-pulse-urgent {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}
</style>
