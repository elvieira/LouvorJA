<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openEditor(null)">
        {{ t('new_service') }}
      </v-btn>
    </template>

    <template #default>
      <!-- Service list view -->
      <v-row v-if="!editingService">
        <v-col cols="12" v-if="services.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1">mdi-book-open-page-variant</v-icon>
          <p class="text-grey mt-4">{{ t('no_services') }}</p>
        </v-col>

        <v-col v-for="svc in sortedServices" :key="svc.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="pa-3" @click="editingService = { ...svc }">
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" color="primary">{{ getTypeIcon(svc.type) }}</v-icon>
              <v-chip size="small" variant="tonal" color="primary">{{ svc.type }}</v-chip>
            </div>
            <div class="text-subtitle-1 font-weight-bold">{{ svc.theme || t('no_theme') }}</div>
            <div class="text-caption text-grey mt-1">{{ svc.date }} {{ svc.time }}</div>
            <div class="d-flex align-center mt-2">
              <v-icon size="small" color="grey" class="mr-1">mdi-format-list-numbered</v-icon>
              <span class="text-caption">{{ (svc.items || []).length }} itens</span>
              <v-spacer />
              <v-icon size="small" :color="svc.done ? 'success' : 'grey'">{{ svc.done ? 'mdi-check-circle' : 'mdi-clock-outline' }}</v-icon>
            </div>
            <v-card-actions class="pa-0 mt-2">
              <v-btn size="small" variant="text" color="primary" @click.stop="openEditor(svc)">{{ t('edit_service') }}</v-btn>
              <v-spacer />
              <v-btn size="small" icon variant="text" color="error" @click.stop="confirmDeleteService(svc.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Service editor -->
      <v-row v-else>
        <v-col cols="12" md="8">
          <v-card class="pa-4">
            <div class="d-flex align-center mb-4">
              <v-btn icon variant="text" class="mr-2" @click="editingService = null">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <span class="text-h6">{{ editingService.id ? t('edit_service') : t('new_service') }}</span>
              <v-spacer />
              <v-btn variant="tonal" color="success" size="small" class="mr-2" @click="toggleDone">
                <v-icon start>mdi-check</v-icon>
                {{ t('mark_done') }}
              </v-btn>
              <v-btn variant="tonal" color="primary" size="small" @click="saveService">
                <v-icon start>mdi-content-save</v-icon>
                {{ t('save') }}
              </v-btn>
            </div>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select v-model="editingService.type" :items="serviceTypes" :label="t('service_type')" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field v-model="editingService.date" type="date" :label="t('service_date')" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field v-model="editingService.time" type="time" :label="t('service_time')" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editingService.theme" :label="t('service_theme')" variant="outlined" density="compact" />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="d-flex align-center mb-3">
              <span class="text-subtitle-1">{{ t('service_items') }}</span>
              <v-spacer />
              <v-chip variant="tonal" size="small">{{ (editingService.items || []).length }} itens</v-chip>
            </div>

            <div v-if="!editingService.items || editingService.items.length === 0" class="text-center py-6 text-grey">
              {{ t('no_items') }}
            </div>

            <v-list v-else lines="two">
              <v-list-item
                v-for="(item, i) in editingService.items"
                :key="item._key"
                class="mb-2"
                style="cursor: grab;"
              >
                <template #prepend>
                  <v-icon class="mr-2" color="primary">{{ getItemTypeIcon(item.type) }}</v-icon>
                  <v-icon size="small" class="mr-2 handle" color="grey">mdi-drag</v-icon>
                </template>
                <v-list-item-title>
                  <v-chip size="x-small" variant="tonal" class="mr-2">{{ t(`item_types.${item.type}`) }}</v-chip>
                  {{ item.title || '(sem título)' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <template v-if="item.duration">{{ item.duration }} min &middot; </template>
                  {{ item.description || '' }}
                </v-list-item-subtitle>
                <template #append>
                  <v-btn v-if="['worship_song','adventist_hymn','special_song'].includes(item.type)" icon size="x-small" variant="text" color="primary" @click="playMusic(item)">
                    <v-icon>mdi-play</v-icon>
                    <v-tooltip activator="parent">{{ t('play') }}</v-tooltip>
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" color="error" @click="removeItem(i)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
                <v-divider v-if="i < editingService.items.length - 1" class="mt-2" />
              </v-list-item>
            </v-list>

            <v-divider class="my-3" />

            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title class="text-body-2">
                  <v-icon start>mdi-plus-circle</v-icon>
                  {{ t('add_item') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col cols="6">
                      <v-select v-model="newItem.type" :items="Object.keys(itemTypeLabels)" :label="t('item_type')" variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field v-model="newItem.title" :label="t('item_title')" variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="newItem.description" :label="t('item_description')" variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field v-model="newItem.duration" type="number" :label="t('item_duration')" variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="6" class="d-flex align-center">
                      <v-btn color="primary" variant="tonal" size="small" @click="addItem">
                        <v-icon start>mdi-plus</v-icon>
                        {{ t('add_item') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <div class="d-flex align-center mt-4">
              <v-spacer />
              <v-chip variant="outlined" prepend-icon="mdi-clock-outline">{{ t('total_duration') }}: {{ totalDuration }} min</v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </ModuleContainer>

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-text>{{ t('confirm_delete') }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">{{ t('cancel') }}</v-btn>
        <v-btn color="error" variant="tonal" @click="doDeleteService">{{ t('delete_service') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImport" />
</template>

<script setup>
import manifest from "../manifest.json";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import { ref, computed, onMounted } from "vue";

const moduleContainer = ref(null);
const t = (key) => moduleContainer.value?.t(key) || key;
const fileInput = ref(null);

const services = ref([]);
const editingService = ref(null);
const deleteDialog = ref(false);
const deleteTarget = ref(null);

const newItem = ref(createEmptyItem());

const STORAGE_KEY = "liturgy_services";

const serviceTypes = [
  "Culto de Adoração",
  "Santa Ceia",
  "Batismo",
  "Culto Jovem",
  "Culto Infantil",
  "Especial",
  "Oração",
  "Líderes",
  "Outro",
];

const itemTypeLabels = {
  worship_song: t("item_types.worship_song"),
  adventist_hymn: t("item_types.adventist_hymn"),
  bible_reading: t("item_types.bible_reading"),
  announcement: t("item_types.announcement"),
  prayer: t("item_types.prayer"),
  video: t("item_types.video"),
  custom_slide: t("item_types.custom_slide"),
  break: t("item_types.break"),
  instrumental: t("item_types.instrumental"),
  special_song: t("item_types.special_song"),
  other: t("item_types.other"),
};

const sortedServices = computed(() => {
  return [...services.value].sort((a, b) => {
    const da = `${a.date} ${a.time || "00:00"}`;
    const db = `${b.date} ${b.time || "00:00"}`;
    return da.localeCompare(db);
  });
});

const totalDuration = computed(() => {
  if (!editingService.value?.items) return 0;
  return editingService.value.items.reduce((sum, it) => sum + (parseInt(it.duration) || 0), 0);
});

function getTypeIcon(type) {
  const icons = {
    "Culto de Adoração": "mdi-church",
    "Santa Ceia": "mdi-bread-slice",
    "Batismo": "mdi-water",
    "Culto Jovem": "mdi-account-group",
    "Culto Infantil": "mdi-teddy-bear",
    "Especial": "mdi-star",
    "Oração": "mdi-hand-pray",
    "Líderes": "mdi-account-tie",
    "Outro": "mdi-calendar-question",
  };
  return icons[type] || "mdi-calendar";
}

function getItemTypeIcon(type) {
  const icons = {
    worship_song: "mdi-microphone",
    adventist_hymn: "mdi-music",
    bible_reading: "mdi-book-open-variant",
    announcement: "mdi-bullhorn",
    prayer: "mdi-hand-pray",
    video: "mdi-video",
    custom_slide: "mdi-presentation",
    break: "mdi-clock-pause",
    instrumental: "mdi-instrument-triangle",
    special_song: "mdi-star",
    other: "mdi-dots-horizontal",
  };
  return icons[type] || "mdi-puzzle";
}

function createEmptyItem() {
  return { _key: "", type: "worship_song", title: "", description: "", duration: "" };
}

function openEditor(svc) {
  if (!svc) {
    editingService.value = createEmptyService();
  } else {
    editingService.value = JSON.parse(JSON.stringify(svc));
  }
}

function createEmptyService() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type: "Culto de Adoração",
    date: dateStr,
    time: "19:00",
    theme: "",
    items: [],
    done: false,
    createdAt: now.toISOString(),
  };
}

function saveService() {
  if (!editingService.value) return;
  const idx = services.value.findIndex((s) => s.id === editingService.value.id);
  if (idx >= 0) {
    services.value[idx] = JSON.parse(JSON.stringify(editingService.value));
  } else {
    services.value.push(JSON.parse(JSON.stringify(editingService.value)));
  }
  persist();
  editingService.value = null;
}

function toggleDone() {
  if (editingService.value) {
    editingService.value.done = !editingService.value.done;
  }
}

function confirmDeleteService(id) {
  deleteTarget.value = id;
  deleteDialog.value = true;
}

function doDeleteService() {
  if (deleteTarget.value) {
    services.value = services.value.filter((s) => s.id !== deleteTarget.value);
    persist();
  }
  deleteDialog.value = false;
  deleteTarget.value = null;
}

function addItem() {
  if (!editingService.value) return;
  if (!editingService.value.items) editingService.value.items = [];
  const item = { ...newItem.value };
  item._key = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  editingService.value.items.push(item);
  newItem.value = createEmptyItem();
}

function removeItem(index) {
  if (!editingService.value?.items) return;
  editingService.value.items.splice(index, 1);
}

function playMusic(item) {
  import("@/helpers/Media").then(({ default: $media }) => {
    if (item.id_music) {
      $media.open({ id_music: item.id_music });
    }
  });
}

function loadServices() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) services.value = JSON.parse(stored);
  } catch (e) {
    services.value = [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services.value));
}

function exportServices() {
  const blob = new Blob([JSON.stringify({ services: services.value, version: "1.0" }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "liturgias_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromFile() {
  fileInput.value?.click();
}

function handleImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.services && Array.isArray(data.services)) {
        services.value.push(...data.services);
        persist();
      }
    } catch (err) {
      console.error("Import error:", err);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

loadServices();
</script>

<style scoped>
.v-list-item {
  transition: background 0.2s;
  border-radius: 8px;
}
.v-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.handle {
  cursor: grab;
}
</style>