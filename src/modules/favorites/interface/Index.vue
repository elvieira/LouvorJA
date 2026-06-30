<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-toolbar density="compact">
        <v-spacer />
        <v-btn
          v-if="favoriteSongs.length > 0"
          icon="mdi-play-circle-outline"
          variant="text"
          @click="playAll()"
        />
        <v-btn
          v-if="favoriteSongs.length > 0"
          icon="mdi-delete-sweep"
          variant="text"
          color="error"
          @click="confirmClearAll()"
        />
      </v-toolbar>
    </template>

    <div class="favorites-container pa-4">
      <!-- Empty state -->
      <div v-if="favoriteSongs.length === 0" class="text-center pa-12">
        <v-icon size="80" color="grey-lighten-2">mdi-heart-outline</v-icon>
        <p class="text-h6 text-grey mt-4">{{ t('no_favorites') }}</p>
        <p class="text-body-2 text-grey">{{ t('no_favorites_hint') }}</p>
      </div>

      <!-- Favorites list -->
      <div v-else>
        <div class="d-flex align-center mb-3">
          <v-icon icon="mdi-music-note" class="mr-2" />
          <span class="text-h6">{{ t('songs_section') }}</span>
          <v-spacer />
          <v-chip size="small" variant="tonal">
            {{ t('songs_count', { count: favoriteSongs.length }) }}
          </v-chip>
        </div>

        <v-list density="compact" class="favorites-list">
          <v-list-item
            v-for="(song, index) in favoriteSongs"
            :key="song.id_music"
            :title="song.name"
            :subtitle="song.album_name || ''"
            @click="playSong(song)"
          >
            <template #prepend>
              <v-icon
                icon="mdi-heart"
                color="red"
                class="mr-2"
                @click.stop="removeFavorite(song)"
              />
              <span class="text-caption text-medium-emphasis mr-2">
                {{ index + 1 }}
              </span>
            </template>
            <template #append>
              <v-btn
                icon="mdi-play-circle"
                variant="text"
                size="small"
                @click.stop="playSong(song)"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </ModuleContainer>
</template>

<script>
export default {
  name: "FavoritesModule",
};
</script>

<script setup>
import { ref, computed } from "vue";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import manifest from "../manifest.json";

const moduleContainer = ref(null);
const t = (key, params) => {
  let text = moduleContainer.value?.t(key) || key;
  if (params) {
    Object.keys(params).forEach((k) => {
      text = text.replace(`{${k}}`, params[k]);
    });
  }
  return text;
};

// Favorites stored in localStorage
const FAVORITES_KEY = "louvorja_favorites";

const favoriteSongs = ref([]);

function loadFavorites() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    favoriteSongs.value = data ? JSON.parse(data) : [];
  } catch (e) {
    favoriteSongs.value = [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteSongs.value));
}

function removeFavorite(song) {
  favoriteSongs.value = favoriteSongs.value.filter(
    (s) => s.id_music !== song.id_music
  );
  saveFavorites();
}

function confirmClearAll() {
  if (confirm(t("confirm_clear"))) {
    favoriteSongs.value = [];
    saveFavorites();
  }
}

function playSong(song) {
  // Emit event to media player
  if (window.electronAPI) {
    window.electronAPI.send("media-play", { id_music: song.id_music, mode: "audio" });
  }
}

function playAll() {
  if (favoriteSongs.value.length > 0) {
    const firstSong = favoriteSongs.value[0];
    playSong(firstSong);
  }
}

// Load on mount
loadFavorites();
</script>

<style scoped>
.favorites-container {
  max-height: 100%;
  overflow-y: auto;
}

.favorites-list {
  background: transparent;
}
</style>