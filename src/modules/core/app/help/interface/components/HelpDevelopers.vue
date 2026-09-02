<template>
  <div
    class="developers-container mx-auto pb-4 px-2"
    style="max-width: 800px; padding-top: 10px;"
  >
    <!-- Owner Section -->
    <v-card class="rounded-xl pa-5 mb-8" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <div class="d-flex align-center">
        <v-avatar size="80" class="mr-5" style="border: 2px solid var(--border-color); background: rgba(0, 151, 215, 0.05);">
          <v-img v-if="data.owner.avatar" :src="getAvatarSrc(data.owner.avatar)" />
          <v-icon
            v-else
            size="40"
            color="var(--sidebar-text-secondary)"
          >
            mdi-account
          </v-icon>
        </v-avatar>
        <div>
          <h4 class="text-h6 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
            {{ data.owner.name }}
          </h4>
          <div class="text-subtitle-2 mb-2" style="color: var(--accent-blue);">
            {{ data.owner.role }}
          </div>
          <p class="text-body-2 mb-3" style="color: var(--sidebar-text-secondary); max-width: 500px;">
            {{ data.owner.description }}
          </p>
          <div class="d-flex" style="gap: 8px;">
            <v-btn
              v-for="(link, idx) in data.owner.links"
              :key="idx"
              icon
              size="32"
              variant="tonal"
              color="primary"
              @click="openLink(link.url)"
            >
              <v-icon size="18">
                {{ link.icon }}
              </v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Maintainer Section -->
    <v-card class="rounded-xl pa-4 mb-8" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <div class="d-flex align-center">
        <v-avatar size="60" class="mr-4" style="border: 1px solid var(--border-color); background: rgba(0, 151, 215, 0.05);">
          <v-img v-if="data.current_version_maintainer.avatar" :src="getAvatarSrc(data.current_version_maintainer.avatar)" />
          <v-icon
            v-else
            size="28"
            color="var(--sidebar-text-secondary)"
          >
            mdi-account-group
          </v-icon>
        </v-avatar>
        <div>
          <h4 class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
            {{ data.current_version_maintainer.name }}
          </h4>
          <div class="text-caption mb-1" style="color: var(--accent-blue);">
            {{ data.current_version_maintainer.role }}
          </div>
          <p class="text-body-2 mb-2" style="color: var(--sidebar-text-secondary); max-width: 500px;">
            {{ data.current_version_maintainer.description }}
          </p>
          <div class="d-flex" style="gap: 8px;">
            <v-btn
              v-for="(link, idx) in data.current_version_maintainer.links"
              :key="idx"
              icon
              size="28"
              variant="tonal"
              color="primary"
              @click="openLink(link.url)"
            >
              <v-icon size="16">
                {{ link.icon }}
              </v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Other Developers -->
    <h3 class="text-subtitle-1 font-weight-bold mb-3 px-2" style="color: var(--sidebar-text);">
      {{ $t('modules.help.other_developers') || 'Equipe de Desenvolvedores' }}
    </h3>
    <v-row class="mb-6">
      <v-col
        v-for="(dev, idx) in data.developers"
        :key="idx"
        cols="12"
        sm="6"
      >
        <v-card class="rounded-xl pa-3 d-flex align-center h-100" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
          <v-avatar size="48" class="mr-3" style="border: 1px solid var(--border-color); background: rgba(0, 151, 215, 0.05);">
            <v-img v-if="dev.avatar" :src="getAvatarSrc(dev.avatar)" />
            <v-icon
              v-else
              size="24"
              color="var(--sidebar-text-secondary)"
            >
              mdi-account-code
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
              {{ dev.name }}
            </div>
            <div class="text-caption" style="color: var(--sidebar-text-secondary);">
              {{ dev.role }}
            </div>
          </div>
          <div class="d-flex flex-column" style="gap: 4px;">
            <v-btn
              v-for="(link, lidx) in dev.links"
              :key="lidx"
              icon
              size="24"
              variant="text"
              color="var(--sidebar-text-secondary)"
              @click="openLink(link.url)"
            >
              <v-icon size="16">
                {{ link.icon }}
              </v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Collaborators -->
    <h3 class="text-subtitle-1 font-weight-bold mb-3 px-2" style="color: var(--sidebar-text);">
      {{ $t('modules.help.collaborators') || 'Colaboradores e Apoiadores' }}
    </h3>
    <v-row>
      <v-col
        v-for="(collab, idx) in data.collaborators"
        :key="idx"
        cols="12"
        md="4"
        sm="6"
      >
        <v-card class="rounded-xl pa-4 h-100 d-flex flex-column" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
          <div class="d-flex justify-space-between align-start mb-2 flex-grow-1">
            <h4 class="text-subtitle-2 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
              {{ collab.name }}
            </h4>
          </div>
          <v-btn
            v-if="collab.link && collab.link !== '#'"
            variant="text"
            size="small"
            color="var(--accent-blue)"
            class="align-self-start text-none ml-n2"
            prepend-icon="mdi-open-in-new"
            @click="openLink(collab.link)"
          >
            Acessar
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import developersData from "../../data/developers.json";

export default defineComponent({
  name: "HelpDevelopers",
  setup() {
    const avatarCache = ref<Record<string, string>>({});

    try {
      const stored = localStorage.getItem("dev_avatars_cache");
      if (stored) {
        avatarCache.value = JSON.parse(stored);
      }
    } catch (e) {
      // ignorar
    }

    const openLink = (url: string) => {
      if (url && url !== "#") {
        if (window.electronAPI && window.electronAPI.openExternal) {
          window.electronAPI.openExternal(url);
        } else {
          window.open(url, "_blank");
        }
      }
    };

    const getAvatarSrc = (url: string) => {
      if (!url) return "";
      return avatarCache.value[url] || url;
    };

    return {
      data: developersData,
      openLink,
      getAvatarSrc,
    };
  },
});
</script>
