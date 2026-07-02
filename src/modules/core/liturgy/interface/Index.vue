<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Header -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />

        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
        </div>
      </div>

      <!-- Content -->
      <div class="content-main d-flex flex-column" style="padding-top: 16px;">
        <!-- Day Selector -->
        <div class="liturgy-day-selector mb-2">
          <v-btn
            v-for="day in days"
            :key="day.value"
            :variant="selectedDay === day.value ? 'flat' : 'tonal'"
            :color="selectedDay === day.value ? 'primary' : undefined"
            class="day-btn"
            @click="selectedDay = day.value"
          >
            <div class="day-label">
              <v-icon size="x-small" class="mb-1">
                {{ day.icon }}
              </v-icon>
              {{ day.label }}
            </div>
          </v-btn>
        </div>

        <!-- Grid: Items list + Notes -->
        <div class="liturgy-content">
          <!-- Main column: Items -->
          <div class="liturgy-main-col">
            <!-- Toolbar -->
            <div class="liturgy-toolbar">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                :disabled="lockItems"
                @click="addItem"
              >
                {{ t('add_item') }}
              </v-btn>

              <div class="toolbar-spacer" />

              <v-btn
                variant="text"
                size="small"
                :prepend-icon="lockItems ? 'mdi-lock' : 'mdi-lock-open'"
                :color="lockItems ? 'error' : undefined"
                @click="toggleLock"
              >
                {{ lockItems ? t('unlock_items') : t('lock_items') }}
              </v-btn>

              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-content-copy"
                :disabled="currentDayItems.length === 0"
                @click="copyItems"
              >
                {{ t('copy_items') }}
              </v-btn>

              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-content-paste"
                :disabled="!clipboard || clipboard.length === 0"
                @click="pasteItems"
              >
                {{ t('paste_items') }}
              </v-btn>

              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-broom"
                color="error"
                :disabled="currentDayItems.length === 0 || lockItems"
                @click="clearDay"
              >
                {{ t('clear_day') }}
              </v-btn>

              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-calendar-clock"
                @click="scheduledModalShow = true"
              >
                Agendados
              </v-btn>
            </div>

            <!-- Items List -->
            <div class="liturgy-items-list" style="flex: 1;">
              <template v-if="currentDayItems.length > 0">
                <ItemCard
                  v-for="item in currentDayItems"
                  :key="item.id"
                  :item="item"
                  :locked="lockItems"
                  :scheduled-status="item.type === 'scheduled' ? getScheduledItemStatus(item) : null"
                  @edit="editItem"
                  @remove="removeItem"
                  @toggle-check="toggleCheck"
                  @click-action="clickItemAction"
                  @copy-item="copySingleItem"
                  @drag-start="onDragStart"
                  @drag-end="onDragEnd"
                  @drag-over="onDragOver"
                  @drop="onDrop"
                />
              </template>
              <div v-else class="liturgy-empty">
                <v-icon size="48" color="grey-lighten-1">
                  mdi-format-list-checks
                </v-icon>
                <p>{{ t('no_items') }}</p>
              </div>
            </div>
          </div>

          <!-- Side column: Notes -->
          <div v-if="settings.showAnnotations" class="liturgy-side-col">
            <div class="liturgy-notes-editor" style="background: var(--card-bg); border-radius: var(--border-radius); box-shadow: var(--shadow); overflow: hidden;">
              <div class="notes-header">
                <v-icon size="small" class="mr-1">
                  mdi-note-text
                </v-icon>
                <span class="notes-title">
                  {{ t('notes_of_day') }}
                </span>
              </div>
              <div class="notes-textarea px-4 pb-4">
                <textarea
                  v-model="currentDayNotes"
                  :placeholder="t('notes_of_day')"
                  :disabled="lockItems"
                  class="w-100"
                  style="flex: 1; min-height: 200px;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Item Editor Modal -->
      <ItemEditor
        :show="editorShow"
        :item="editingItem"
        :locked="lockItems"
        :scheduled-categories="liturgyData.scheduledCategories"
        @save="onEditorSave"
        @cancel="onEditorCancel"
      />

      <!-- Scheduled Items Manager Modal -->
      <v-dialog v-model="scheduledModalShow" max-width="700" persistent>
        <v-card rounded="lg">
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon icon="mdi-calendar-clock" class="mr-2" />
            Itens Agendados
          </v-card-title>
          <v-card-text>
            <!-- Categories -->
            <div class="d-flex align-center mb-3">
              <v-text-field
                v-model="newCategoryName"
                label="Nova categoria (ex: Sermão, Escola Sabatina)"
                variant="outlined"
                density="compact"
                hide-details
                @keyup.enter="addScheduledCategory"
              />
              <v-btn color="primary" variant="flat" class="ml-2" style="height: 40px;" @click="addScheduledCategory">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>

            <div v-if="liturgyData.scheduledCategories.length > 0" class="mb-4">
              <div v-for="cat in liturgyData.scheduledCategories" :key="cat.id" class="d-flex align-center pa-2 mb-1 rounded-lg" style="background: rgba(0,0,0,0.05);">
                <v-icon icon="mdi-folder" size="small" class="mr-2" />
                <span class="flex-grow-1">{{ cat.name }}</span>
                <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="removeScheduledCategory(cat.id)" />
              </div>
            </div>

            <v-divider class="mb-3" />

            <!-- Scheduled items by date -->
            <div class="text-body-2 mb-2 mt-3">Agendar arquivo por data:</div>
            <div class="d-flex align-center mb-2" style="flex-wrap: wrap; gap: 8px;">
              <v-select
                v-model="newScheduledItem.categoryId"
                :items="liturgyData.scheduledCategories"
                item-title="name"
                item-value="id"
                label="Categoria"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 180px; flex: 1;"
              />
              <v-text-field
                v-model="newScheduledItem.date"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                label="Data"
                style="max-width: 160px;"
              />
            </div>
            <div class="d-flex align-center mb-2" style="gap: 8px;">
              <v-text-field
                v-model="newScheduledItem.name"
                label="Nome do arquivo (ex: Sermão Pr. Silva)"
                variant="outlined"
                density="compact"
                hide-details
                style="flex: 1;"
              />
              <v-btn
                variant="outlined"
                density="compact"
                prepend-icon="mdi-folder-open"
                style="height: 40px;"
                @click="pickScheduledFile"
              >
                Escolher
              </v-btn>
              <v-btn color="primary" variant="flat" style="height: 40px;" @click="addScheduledItem" :disabled="!newScheduledItem.categoryId || !newScheduledItem.date">
                <v-icon>mdi-plus</v-icon>
                Agendar
              </v-btn>
            </div>
            <div v-if="newScheduledItem.filePath" class="text-caption mb-2 pa-2 rounded" style="background: rgba(0,0,0,0.05);">
              <v-icon size="x-small" icon="mdi-file" /> {{ newScheduledItem.filePath }}
            </div>

            <div v-if="liturgyData.scheduledItems.length > 0" style="max-height: 250px; overflow-y: auto;">
              <div v-for="item in liturgyData.scheduledItems" :key="item.id" class="d-flex align-center pa-2 mb-1 rounded-lg" style="background: rgba(0,0,0,0.03);">
                <v-icon :icon="getCategoryIcon(item.categoryId)" size="small" class="mr-2" />
                <span class="text-caption" style="min-width: 80px;">{{ getCategoryName(item.categoryId) }}</span>
                <span class="text-caption mx-2" style="min-width: 80px;">{{ formatDateBR(item.date) }}</span>
                <span class="flex-grow-1 text-body-2 text-truncate">{{ item.name }}</span>
                <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="editScheduledItem(item)" />
                <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="removeScheduledItem(item.id)" />
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="scheduledModalShow = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import ItemCard from "../components/ItemCard.vue";
import ItemEditor from "../components/ItemEditor.vue";

export default {
  name: manifest.id,
  components: {
    MenuToggleButton,
    ItemCard,
    ItemEditor,
  },
  data() {
    return {
      manifest,
      selectedDay: new Date().getDay() === 0 ? 1 : new Date().getDay() + 1,
      editorShow: false,
      editingItem: null,
      clipboard: null,
      scheduledModalShow: false,
      newCategoryName: "",
      newScheduledItem: { categoryId: null, date: "", name: "", filePath: null },
      dragSource: null,
      liturgyData: this.createDefaultData(),
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATÓRIAS - INÍCIO */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATÓRIAS - FIM */

    settings() {
      return this.liturgyData.settings || {};
    },

    lockItems() {
      return !!this.settings.lockItems;
    },

    currentDayData() {
      return this.liturgyData.days[this.selectedDay] || { items: [], notes: "" };
    },

    currentDayItems() {
      return this.currentDayData.items || [];
    },

    currentDayNotes: {
      get() {
        return this.currentDayData.notes || "";
      },
      set(val) {
        if (!this.liturgyData.days[this.selectedDay]) {
          this.liturgyData.days[this.selectedDay] = { items: [], notes: "" };
        }
        this.liturgyData.days[this.selectedDay].notes = val;
        this.persist();
      },
    },

    days() {
      return [
        { value: 1, label: this.t("sunday"),    icon: "mdi-calendar-today" },
        { value: 2, label: this.t("monday"),    icon: "mdi-calendar-today" },
        { value: 3, label: this.t("tuesday"),   icon: "mdi-calendar-today" },
        { value: 4, label: this.t("wednesday"), icon: "mdi-calendar-today" },
        { value: 5, label: this.t("thursday"),  icon: "mdi-calendar-today" },
        { value: 6, label: this.t("friday"),    icon: "mdi-calendar-today" },
        { value: 7, label: this.t("saturday"),  icon: "mdi-calendar-today" },
      ];
    },
  },
  watch: {
    "module.show": {
      handler(val) {
        if (val) {
          this.loadData();
          this.selectedDay = this.getTodayDay();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    /* METHODS OBRIGATÓRIOS - INÍCIO */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATÓRIOS - FIM */
    
    getTodayDay() {
      const jsDay = new Date().getDay();
      return jsDay === 0 ? 1 : jsDay + 1;
    },

    createDefaultData() {
      const days = {};
      for (let i = 1; i <= 7; i++) {
        days[i] = { items: [], notes: "" };
      }
      return {
        days,
        settings: {
          markCompleted: true,
          lockItems: false,
          showAnnotations: true,
          youtubeInApp: true,
        },
        scheduledCategories: [],
        scheduledItems: [],
      };
    },

    loadData() {
      const saved = this.$userdata.get("modules.liturgy");
      if (saved) {
        // Merge with defaults to ensure structure
        this.liturgyData = {
          ...this.createDefaultData(),
          ...saved,
          days: { ...this.createDefaultData().days, ...(saved.days || {}) },
          settings: { ...this.createDefaultData().settings, ...(saved.settings || {}) },
        };
      }
    },

    persist() {
      this.$userdata.set("modules.liturgy", this.liturgyData);
    },

    formatDateBR(dateStr) {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },

    addScheduledCategory() {
      if (!this.newCategoryName.trim()) return;
      const cat = {
        id: `cat_${Date.now()}`,
        name: this.newCategoryName.trim(),
      };
      this.liturgyData.scheduledCategories.push(cat);
      this.newCategoryName = "";
      this.persist();
    },

    removeScheduledCategory(catId) {
      this.liturgyData.scheduledCategories = this.liturgyData.scheduledCategories.filter(c => c.id !== catId);
      this.liturgyData.scheduledItems = this.liturgyData.scheduledItems.filter(i => i.categoryId !== catId);
      this.persist();
    },

    async pickScheduledFile() {
      if (window.electronAPI && window.electronAPI.selectFile) {
        try {
          const result = await window.electronAPI.selectFile();
          if (result) {
            this.newScheduledItem.filePath = result;
            if (!this.newScheduledItem.name) {
              const parts = result.split(/[/\\]/);
              this.newScheduledItem.name = parts[parts.length - 1].replace(/\.[^.]+$/, "");
            }
          }
        } catch (e) {
          console.error("File pick error:", e);
        }
      }
    },

    addScheduledItem() {
      if (!this.newScheduledItem.categoryId) return;
      const item = {
        id: `sched_${Date.now()}`,
        categoryId: this.newScheduledItem.categoryId,
        date: this.newScheduledItem.date,
        name: this.newScheduledItem.name || "Sem nome",
        filePath: this.newScheduledItem.filePath || null,
      };
      this.liturgyData.scheduledItems.push(item);
      this.newScheduledItem = { categoryId: null, date: "", name: "", filePath: null };
      this.persist();
    },

    editScheduledItem(item) {
      this.newScheduledItem = { ...item };
      // Remove from list (will be re-added on "Agendar")
      this.liturgyData.scheduledItems = this.liturgyData.scheduledItems.filter(i => i.id !== item.id);
      this.persist();
    },

    removeScheduledItem(itemId) {
      this.liturgyData.scheduledItems = this.liturgyData.scheduledItems.filter(i => i.id !== itemId);
      this.persist();
    },

    getCategoryName(catId) {
      const cat = this.liturgyData.scheduledCategories.find(c => c.id === catId);
      return cat ? cat.name : "Desconhecida";
    },

    getCategoryIcon(catId) {
      return "mdi-folder";
    },

    resolveScheduledItem(categoryId) {
      // Calculate cult date based on selected day of week
      const today = new Date();
      const todayDay = today.getDay() === 0 ? 1 : today.getDay() + 1;
      const diff = this.selectedDay - todayDay;
      const cultDate = new Date(today);
      cultDate.setDate(today.getDate() + diff);
      const cultDateStr = cultDate.toISOString().slice(0, 10);

      console.log("[Liturgia] resolveScheduledItem:", { categoryId, selectedDay: this.selectedDay, todayDay, cultDateStr });
      console.log("[Liturgia] All scheduled items:", JSON.stringify(this.liturgyData.scheduledItems));

      const items = this.liturgyData.scheduledItems
        .filter(i => i.categoryId === categoryId && i.date <= cultDateStr)
        .sort((a, b) => b.date.localeCompare(a.date));
      console.log("[Liturgia] Filtered items:", items);
      return items[0] || null;
    },

    getScheduledItemStatus(item) {
      if (!item.scheduledCategoryId) return null;
      const resolved = this.resolveScheduledItem(item.scheduledCategoryId);
      const catName = this.getCategoryName(item.scheduledCategoryId);
      if (resolved) {
        return { found: true, name: resolved.name, categoryName: catName };
      }
      return { found: false, categoryName: catName };
    },

    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) {
        mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
      }
    },

    // ---- Toolbar Actions ----
    addItem() {
      this.editingItem = null;
      this.editorShow = true;
    },

    editItem(item) {
      this.editingItem = { ...item };
      this.editorShow = true;
    },

    removeItem(item) {
      if (!confirm(this.t("confirm_remove"))) return;
      const items = this.liturgyData.days[this.selectedDay].items;
      const idx = items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        items.splice(idx, 1);
        this.persist();
      }
    },

    toggleCheck(item) {
      const items = this.liturgyData.days[this.selectedDay].items;
      const found = items.find(i => i.id === item.id);
      if (found) {
        found.checked = found.checked ? null : new Date().toISOString();
        this.persist();
      }
    },

    toggleLock() {
      this.liturgyData.settings.lockItems = !this.liturgyData.settings.lockItems;
      this.persist();
    },

    copyItems() {
      this.clipboard = JSON.parse(JSON.stringify(this.currentDayItems));
    },

    copySingleItem(item) {
      this.clipboard = [JSON.parse(JSON.stringify(item))];
    },

    pasteItems() {
      if (!this.clipboard || this.clipboard.length === 0) return;
      const day = this.liturgyData.days[this.selectedDay];
      this.clipboard.forEach(item => {
        const copy = { ...item };
        copy.id = `lit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        day.items.push(copy);
      });
      this.persist();
    },

    clearDay() {
      if (!confirm(this.t("confirm_clear_day"))) return;
      this.liturgyData.days[this.selectedDay].items = [];
      this.liturgyData.days[this.selectedDay].notes = "";
      this.persist();
    },

    // ---- Editor Callbacks ----
    onEditorSave(data) {
      const items = this.liturgyData.days[this.selectedDay].items;
      const idx = items.findIndex(i => i.id === data.id);
      if (idx !== -1) {
        // Update existing
        items.splice(idx, 1, data);
      } else {
        // Add new
        items.push(data);
      }
      this.persist();
      this.editorShow = false;
      this.editingItem = null;
    },

    onEditorCancel() {
      this.editorShow = false;
      this.editingItem = null;
    },

    // ---- Drag and Drop ----
    onDragStart(event, item) {
      this.dragSource = item;
      event.dataTransfer.effectAllowed = "move";
    },

    onDragEnd() {
      this.dragSource = null;
    },

    onDragOver(event, _item) {
      event.dataTransfer.dropEffect = "move";
    },

    onDrop(event, targetItem) {
      if (!this.dragSource || !targetItem) return;
      if (this.dragSource.id === targetItem.id) return;

      const items = this.liturgyData.days[this.selectedDay].items;
      const srcIdx = items.findIndex(i => i.id === this.dragSource.id);
      const tgtIdx = items.findIndex(i => i.id === targetItem.id);
      if (srcIdx === -1 || tgtIdx === -1) return;

      // Remove from old position and insert at new
      const [moved] = items.splice(srcIdx, 1);
      items.splice(tgtIdx, 0, moved);
      this.persist();
    },

    // ---- Click Action ----
    clickItemAction(item) {
      if (item.type === "music") {
        if (item.musicId && item.musicId > 0) {
          this.$media.open({ id_music: item.musicId, mode: "audio" });
        }
      } else if (item.type === "url" && item.url) {
        if (window.electronAPI && window.electronAPI.openExternal) {
          window.electronAPI.openExternal(item.url);
        } else {
          window.open(item.url, "_blank");
        }
      } else if (item.type === "file" && item.filePath) {
        if (window.electronAPI && window.electronAPI.openPath) {
          window.electronAPI.openPath(item.filePath);
        }
      } else if (item.type === "scheduled") {
        // Resolve the scheduled item by category + cult date
        console.log("[Liturgia] Scheduled item clicked:", item);
        const resolved = this.resolveScheduledItem(item.scheduledCategoryId);
        console.log("[Liturgia] Resolved:", resolved);
        if (resolved && resolved.filePath) {
          console.log("[Liturgia] Opening file:", resolved.filePath);
          if (window.electronAPI && window.electronAPI.openPath) {
            window.electronAPI.openPath(resolved.filePath);
          } else {
            console.error("[Liturgia] electronAPI.openPath not available");
          }
        } else {
          console.warn("[Liturgia] No scheduled file resolved for category:", item.scheduledCategoryId);
        }
      }
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/liturgy.scss";
</style>
