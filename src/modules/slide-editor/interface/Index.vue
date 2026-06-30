<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openEditor(null)">
        {{ t('new_slide') }}
      </v-btn>
      <v-spacer />
      <v-btn icon variant="text" @click="exportSlides">
        <v-icon>mdi-export</v-icon>
        <v-tooltip activator="parent">{{ t('export') }}</v-tooltip>
      </v-btn>
      <v-btn icon variant="text" @click="importSlides">
        <v-icon>mdi-import</v-icon>
        <v-tooltip activator="parent">{{ t('import') }}</v-tooltip>
      </v-btn>
    </template>

    <template #default>
      <v-row v-if="slides.length === 0" align="center" justify="center" class="fill-height">
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="grey-lighten-1">mdi-presentation-edit</v-icon>
          <p class="text-grey mt-4">{{ t('no_slides') }}</p>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="(slide, index) in slides" :key="slide.id" cols="12" sm="6" md="4" lg="3">
          <v-card :style="getSlideStyle(slide)" class="slide-card" @click="openEditor(index)">
            <v-card-title class="text-white text-h6">{{ slide.title }}</v-card-title>
            <v-card-text class="text-white text-body-2">{{ slide.mainText }}</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn icon size="small" variant="text" color="white" @click.stop="projectSlide(slide)">
                <v-icon>mdi-projector</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text" color="white" @click.stop="confirmDelete(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </ModuleContainer>

  <v-dialog v-model="editorOpen" max-width="900" fullscreen="smAndDown">
    <v-card v-if="editingSlide">
      <v-card-title>{{ editingIndex === null ? t('new_slide') : t('edit_slide') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="editingSlide.title" :label="t('slide_title')" variant="outlined" density="compact" />
            <v-textarea v-model="editingSlide.mainText" :label="t('main_text')" variant="outlined" rows="4" density="compact" />
            <v-textarea v-model="editingSlide.auxText" :label="t('aux_text')" variant="outlined" rows="2" density="compact" />

            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">{{ t('text_settings') }}</div>
            <v-row dense>
              <v-col cols="6">
                <v-select v-model="editingSlide.fontSize" :items="[16,18,20,24,28,32,36,42,48,56,64]" :label="t('font_size')" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="editingSlide.textColor" :label="t('text_color')" variant="outlined" density="compact">
                  <template #append-inner>
                    <input type="color" v-model="editingSlide.textColor" class="color-picker-input" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select v-model="editingSlide.textAlign" :items="['left','center','right']" :label="t('text_align')" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="editingSlide.fontFamily" :label="t('font_family')" variant="outlined" density="compact" placeholder="Arial, sans-serif" />
              </v-col>
              <v-col cols="4">
                <v-checkbox v-model="editingSlide.bold" :label="t('bold')" density="compact" hide-details />
              </v-col>
              <v-col cols="4">
                <v-checkbox v-model="editingSlide.italic" :label="t('italic')" density="compact" hide-details />
              </v-col>
            </v-row>

            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">{{ t('background') }}</div>
            <v-radio-group v-model="bgType" inline hide-details density="compact">
              <v-radio :label="t('color')" value="color" />
              <v-radio :label="t('image')" value="image" />
            </v-radio-group>
            <v-text-field v-if="bgType === 'color'" v-model="editingSlide.bgColor" :label="t('background_color')" variant="outlined" density="compact" class="mt-2">
              <template #append-inner>
                <input type="color" v-model="editingSlide.bgColor" class="color-picker-input" />
              </template>
            </v-text-field>
            <v-text-field v-else v-model="editingSlide.bgImage" :label="t('background_image')" variant="outlined" density="compact" class="mt-2" :placeholder="t('image_url_placeholder')" />
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-2">{{ t('preview') }}</div>
            <div class="slide-preview" :style="getPreviewStyle(editingSlide)">
              <div class="preview-content" :style="getTextStyle(editingSlide)">
                <div class="preview-title">{{ editingSlide.title }}</div>
                <div class="preview-main">{{ editingSlide.mainText }}</div>
                <div v-if="editingSlide.auxText" class="preview-aux">{{ editingSlide.auxText }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="editorOpen = false">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" variant="tonal" @click="saveSlide">{{ t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-text>{{ t('confirm_delete') }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">{{ t('cancel') }}</v-btn>
        <v-btn color="error" variant="tonal" @click="doDelete">{{ t('delete_slide') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImport" />
</template>

<script setup>
import manifest from "../manifest.json";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import { ref, computed, watch } from "vue";

const moduleContainer = ref(null);
const t = (key) => moduleContainer.value?.t(key) || key;
const fileInput = ref(null);

const slides = ref([]);
const editorOpen = ref(false);
const deleteDialog = ref(false);
const editingSlide = ref(null);
const editingIndex = ref(null);
const bgType = ref("color");
const deleteTarget = ref(null);

const STORAGE_KEY = "slide_editor_slides";

function loadSlides() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      slides.value = JSON.parse(stored);
    }
  } catch (e) {
    slides.value = [];
  }
}

function saveSlides() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slides.value));
}

function getSlideStyle(slide) {
  const bg = slide.bgImage
    ? `url(${slide.bgImage}) center/cover no-repeat`
    : slide.bgColor || "#1a1a2e";
  return {
    background: bg,
    backgroundSize: slide.bgImage ? "cover" : undefined,
    backgroundPosition: "center",
    borderRadius: "8px",
    cursor: "pointer",
    minHeight: "160px",
    position: "relative",
    overflow: "hidden",
  };
}

function getPreviewStyle(slide) {
  const bg = slide.bgImage
    ? `url(${slide.bgImage}) center/cover no-repeat`
    : slide.bgColor || "#000";
  return {
    background: bg,
    backgroundSize: slide.bgImage ? "cover" : undefined,
    backgroundPosition: "center",
    width: "100%",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    overflow: "hidden",
  };
}

function getTextStyle(slide) {
  return {
    color: slide.textColor || "#fff",
    fontSize: `${slide.fontSize || 24}px`,
    textAlign: slide.textAlign || "center",
    fontWeight: slide.bold ? "bold" : "normal",
    fontStyle: slide.italic ? "italic" : "normal",
    fontFamily: slide.fontFamily || "Arial, sans-serif",
  };
}

function openEditor(index) {
  if (index === null) {
    editingIndex.value = null;
    editingSlide.value = createEmptySlide();
    bgType.value = "color";
  } else {
    editingIndex.value = index;
    editingSlide.value = JSON.parse(JSON.stringify(slides.value[index]));
    bgType.value = editingSlide.value.bgImage ? "image" : "color";
  }
  editorOpen.value = true;
}

function createEmptySlide() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: "",
    mainText: "",
    auxText: "",
    bgColor: "#1a1a2e",
    bgImage: "",
    fontSize: 32,
    textColor: "#ffffff",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    bold: false,
    italic: false,
  };
}

function saveSlide() {
  if (!editingSlide.value) return;
  if (editingIndex.value === null) {
    slides.value.push(JSON.parse(JSON.stringify(editingSlide.value)));
  } else {
    slides.value[editingIndex.value] = JSON.parse(JSON.stringify(editingSlide.value));
  }
  saveSlides();
  editorOpen.value = false;
}

function confirmDelete(index) {
  deleteTarget.value = index;
  deleteDialog.value = true;
}

function doDelete() {
  if (deleteTarget.value !== null) {
    slides.value.splice(deleteTarget.value, 1);
    saveSlides();
  }
  deleteDialog.value = false;
  deleteTarget.value = null;
}

function projectSlide(slide) {
  const data = JSON.parse(JSON.stringify(slide));
  window.$appdata.set("slide_editor.data", data);
  import("@/helpers/Popup").then(({ default: $popup }) => {
    $popup.open({ module: "slide-editor" });
  });
}

function exportSlides() {
  const blob = new Blob([JSON.stringify({ slides: slides.value, version: "1.0" }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "slides_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importSlides() {
  fileInput.value?.click();
}

function handleImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.slides && Array.isArray(data.slides)) {
        slides.value.push(...data.slides);
        saveSlides();
      }
    } catch (err) {
      console.error("Import error:", err);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

loadSlides();
</script>

<style scoped>
.slide-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.slide-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.preview-title {
  font-size: 1.2em;
  margin-bottom: 8px;
  opacity: 0.8;
}
.preview-main {
  font-size: 1em;
}
.preview-aux {
  font-size: 0.8em;
  margin-top: 8px;
  opacity: 0.7;
}
.preview-content {
  padding: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.color-picker-input {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  cursor: pointer;
}
</style>