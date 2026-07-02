<template>
  <v-dialog
    :model-value="show"
    max-width="600"
    persistent
    @update:model-value="$emit('cancel')"
  >
    <v-card rounded="lg" class="liturgy-item-editor">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon :icon="item && item.id ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" />
        {{ item && item.id ? "Editar Item" : "Adicionar Item" }}
      </v-card-title>

      <v-card-text>
        <!-- Type Selector -->
        <div v-if="!formData.id || !formData.type" class="type-selector">
          <div
            v-for="opt in typeOptions"
            :key="opt.value"
            class="type-option"
            :class="{ active: formData.type === opt.value }"
            @click="selectType(opt.value)"
          >
            <v-icon class="type-icon" :icon="opt.icon" />
            <span class="type-label">{{ opt.label }}</span>
          </div>
        </div>

        <!-- Selected type badge -->
        <div v-else class="d-flex align-center mb-4 pa-3 rounded-lg" style="background: rgba(0, 151, 215, 0.08);">
          <v-icon :icon="currentTypeIcon" class="mr-2" color="primary" />
          <span class="font-weight-medium">{{ currentTypeLabel }}</span>
          <v-spacer />
          <v-btn
            v-if="!locked"
            icon="mdi-swap"
            size="x-small"
            variant="text"
            @click="formData.type = null"
          />
        </div>

        <!-- Form fields -->
        <div v-if="formData.type" class="editor-form">
          <!-- Common: Title -->
          <v-text-field
            v-model="formData.title"
            label="Título"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />

          <!-- Common: Color -->
          <div>
            <label class="text-body-2 mb-1 d-block">Cor</label>
            <v-color-picker
              v-model="formData.color"
              mode="hex"
              hide-inputs
              flat
              width="100%"
              style="max-width: 100%;"
            />
          </div>

          <!-- Music fields -->
          <template v-if="formData.type === 'music'">
            <!-- Hymnal selector: 2022, 1996, JA, Diverse -->
            <v-select
              v-model="formData.subType"
              :items="musicSubTypes"
              item-title="title"
              item-value="value"
              label="Hinário"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="onHymnalChange"
            />

            <!-- Search hymn by name/number -->
            <div v-if="!formData.choice" class="hymn-search-container">
              <v-text-field
                v-model="hymnSearch"
                label="Buscar hino (número ou nome)"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                clearable
                placeholder="Digite o numero ou nome..."
                :loading="hymnLoading"
                @update:model-value="onHymnSearch"
              />
              <!-- Results dropdown -->
              <div v-if="hymnResults.length > 0" class="hymn-results-list">
                <div
                  v-for="hymn in hymnResults"
                  :key="hymn.id_music"
                  class="hymn-result-item"
                  :class="{ 'hymn-result-selected': formData.musicId === hymn.id_music }"
                  @click="selectHymn(hymn)"
                >
                  <span class="hymn-track">{{ hymn.track || '?' }}</span>
                  <span class="hymn-name">{{ hymn.name || 'Sem nome' }}</span>
                </div>
              </div>
              <div v-if="hymnSearched && hymnResults.length === 0 && !hymnLoading" class="text-caption mt-1" style="color: var(--v-theme-error);">
                Nenhum hino encontrado
              </div>
              <div v-if="selectedHymnName" class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
                Selecionado: {{ selectedHymnName }}
              </div>
            </div>

            <!-- Choice at runtime -->
            <v-switch
              v-model="formData.choice"
              label="Escolher em tempo real"
              color="primary"
              hide-details
              density="compact"
            />
          </template>

          <!-- File fields -->
          <template v-if="formData.type === 'file'">
            <v-text-field
              v-model="formData.filePath"
              label="Caminho do arquivo"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              append-inner-icon="mdi-folder-open"
              readonly
              @click:append-inner="pickFile"
            />
            <v-select
              v-model="formData.fileMode"
              :items="fileModes"
              label="Modo de abertura"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </template>

          <!-- URL fields -->
          <template v-if="formData.type === 'url'">
            <v-text-field
              v-model="formData.url"
              label="Endereço (URL)"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              placeholder="https://"
            />
          </template>

          <!-- Scheduled fields -->
          <template v-if="formData.type === 'scheduled'">
            <v-select
              v-model="formData.scheduledCategoryId"
              :items="scheduledCategoryItems"
              item-title="name"
              item-value="id"
              label="Categoria"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </template>

          <!-- Description (not for category) -->
          <template v-if="formData.type !== 'category'">
            <div v-if="formData.type === 'annotation'" class="w-100">
              <label class="text-body-2 mb-1 d-block">Texto da anotação</label>
              <textarea
                v-model="formData.description"
                class="w-100"
                style="min-height: 100px; border: 1px solid rgba(var(--v-theme-on-surface), 0.2); border-radius: 8px; padding: 12px; font-size: 14px; outline: none; resize: vertical;"
                placeholder="Digite a anotação..."
              />
            </div>
            <v-text-field
              v-else
              v-model="formData.description"
              label="Descrição"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </template>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="$emit('cancel')">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!formData.type || !formData.title"
          @click="onSave"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import $database from "@/helpers/Database";

export default {
  name: "LiturgyItemEditor",
  props: {
    show: { type: Boolean, default: false },
    item: { type: Object, default: null },
    locked: { type: Boolean, default: false },
    scheduledCategories: { type: Array, default: () => [] },
  },
  emits: ["save", "cancel"],
  data() {
    return {
      formData: this.createEmptyForm(),
      hymnResults: [],
      hymnLoading: false,
      hymnSearch: "",
      hymnSearched: false,
      hymnDebounce: null,
    };
  },
  computed: {
    typeOptions() {
      return [
        { value: "music", label: "Música/Hino", icon: "mdi-music" },
        { value: "file", label: "Arquivo", icon: "mdi-file" },
        { value: "category", label: "Categoria", icon: "mdi-label" },
        { value: "scheduled", label: "Item Agendado", icon: "mdi-calendar-clock" },
        { value: "url", label: "Site/URL", icon: "mdi-web" },
        { value: "annotation", label: "Anotação", icon: "mdi-note-text" },
      ];
    },
    musicSubTypes() {
      return [
        { title: "Hinário Adventista 2022", value: "hasd" },
        { title: "Hinário Adventista 1996", value: "hasd_1996" },
        { title: "Coletânea JA", value: "ja" },
        { title: "Diversos", value: "div" },
      ];
    },
    fileModes() {
      return [
        { title: "Interno (caminho dentro do app)", value: "internal" },
        { title: "Externo (caminho absoluto do PC)", value: "external" },
      ];
    },
    scheduledCategoryItems() {
      return this.scheduledCategories || [];
    },
    currentTypeIcon() {
      const opt = this.typeOptions.find(o => o.value === this.formData.type);
      return opt ? opt.icon : "mdi-help";
    },
    currentTypeLabel() {
      const opt = this.typeOptions.find(o => o.value === this.formData.type);
      return opt ? opt.label : "";
    },
    selectedHymnName() {
      if (!this.formData.musicId || this.formData.musicId < 0) return "";
      const found = this.hymnResults.find(h => h.id_music === this.formData.musicId);
      return found ? found.name : "";
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.formData = this.item ? this.cloneItem(this.item) : this.createEmptyForm();
        this.hymnResults = [];
        this.hymnSearch = "";
      }
    },
  },
  methods: {
    createEmptyForm() {
      return {
        id: null,
        type: null,
        title: "",
        color: "#4F0000",
        subType: null,
        description: "",
        musicId: null,
        choice: false,
        url: null,
        filePath: null,
        fileMode: "internal",
        scheduledCategoryId: null,
        checked: null,
      };
    },
    cloneItem(item) {
      return JSON.parse(JSON.stringify({
        ...this.createEmptyForm(),
        ...item,
      }));
    },
    selectType(type) {
      this.formData.type = type;
      if (type === "music" && !this.formData.subType) {
        this.formData.subType = "hasd";
      }
      if (type === "file" && !this.formData.fileMode) {
        this.formData.fileMode = "internal";
      }
    },

    // ===== HYMN SEARCH =====
    getDatabaseFile(subType) {
      const locale = (this.$i18n && this.$i18n.locale) || "pt";
      const map = {
        hasd: `${locale}_hymnal`,
        hasd_1996: `${locale}_hymnal_1996`,
        ja: `${locale}_ja`,
        div: `${locale}_musics`,
      };
      return map[subType] || `${locale}_hymnal`;
    },

    onHymnalChange() {
      this.formData.musicId = null;
      this.hymnResults = [];
      this.hymnSearch = "";
      if (this.hymnSearch && this.hymnSearch.length > 0) {
        this.searchHymns(this.hymnSearch);
      }
    },

    onHymnSearch(query) {
      this.hymnSearch = query || "";
      this.hymnSearched = false;
      if (this.hymnDebounce) clearTimeout(this.hymnDebounce);
      this.hymnDebounce = setTimeout(() => {
        this.searchHymns(this.hymnSearch);
      }, 300);
    },

    selectHymn(hymn) {
      this.formData.musicId = hymn.id_music;
      this.formData.title = hymn.name || this.formData.title;
      this.hymnResults = [];
      this.hymnSearch = hymn.name || "";
    },

    async searchHymns(query) {
      if (!query || query.length < 1) {
        this.hymnResults = [];
        this.hymnSearched = false;
        return;
      }
      this.hymnLoading = true;
      try {
        const dbFile = this.getDatabaseFile(this.formData.subType);
        console.log("[Liturgia] Searching hymns:", query, "in db:", dbFile);
        const rawData = await $database.get(dbFile);
        console.log("[Liturgia] Raw data type:", typeof rawData, "isArray:", Array.isArray(rawData), "keys:", rawData ? (Array.isArray(rawData) ? rawData.length : Object.keys(rawData).slice(0,5)) : "null");
        // Data can be array directly or {data: [...]}
        const hymns = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        console.log("[Liturgia] Hymns array length:", hymns.length);
        if (hymns.length > 0) {
          const lowerQuery = query.toLowerCase();
          const numQuery = parseInt(query);
          const filtered = hymns.filter(item => {
            if (item.name && item.name.toLowerCase().includes(lowerQuery)) return true;
            if (item.track && item.track === numQuery) return true;
            if (item.id_music && String(item.id_music).includes(query)) return true;
            return false;
          }).slice(0, 50);
          this.hymnResults = filtered.map(item => ({
            ...item,
            display: `${item.track || "?"}. ${item.name || "Sem nome"}`,
          }));
        }
      } catch (e) {
        console.error("Hymn search error:", e);
        this.hymnResults = [];
      }
      this.hymnLoading = false;
      this.hymnSearched = true;
    },

    onHymnSelected(id_music) {
      if (id_music) {
        const found = this.hymnResults.find(h => h.id_music === id_music);
        if (found) {
          this.formData.title = found.name || this.formData.title;
          this.formData.musicId = found.id_music;
        }
      }
    },

    onSave() {
      const data = { ...this.formData };
      if (!data.id) {
        data.id = `lit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      }
      this.cleanupFields(data);
      this.$emit("save", data);
    },
    cleanupFields(data) {
      const type = data.type;
      if (type !== "music") {
        delete data.subType;
        delete data.musicId;
        delete data.choice;
      }
      if (type !== "file") {
        delete data.filePath;
        delete data.fileMode;
      }
      if (type !== "url") {
        delete data.url;
      }
      if (type !== "scheduled") {
        delete data.scheduledCategoryId;
      }
      if (type === "category") {
        delete data.description;
      }
    },
    async pickFile() {
      if (window.electronAPI && window.electronAPI.selectFile) {
        try {
          const result = await window.electronAPI.selectFile();
          if (result) {
            this.formData.filePath = result;
          }
        } catch (e) {
          console.error("File pick error:", e);
        }
      }
    },
  },
};
</script>
