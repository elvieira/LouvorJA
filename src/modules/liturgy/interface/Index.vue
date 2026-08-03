<template>
  <v-slide-y-reverse-transition appear>
    <div
      v-if="show"
      ref="moduleContainer"
      class="module-full-page d-flex flex-column"
      :style="{ '--app-region': 'no-drag' }"
    >
      <ModuleHeader 
        :title="t('title')" 
        :subtitle="t('description')"
        icon="mdi-format-list-checks"
        @close="module.show = false"
      />

      <!-- Segmented Control for Days -->
      <DaySelector 
        v-model:selected-day="selectedDay"
        :is-compact-view="isCompactView"
        :day-options="dayOptions"
        @change="onDayChange"
      />

      <!-- Custom liturgy selector -->
      <CustomLiturgySelector 
        v-if="selectedDay === 'custom'"
        v-model:selected-custom-index="selectedCustomIndex"
        :custom-liturgies="customLiturgies"
        :label-new="t('custom_liturgy.new')"
        @remove-custom="removeCustom"
        @add-custom="showNewCustomDialog = true"
      />

      <!-- Main Content Area -->
      <div class="content-main d-flex" style="flex-direction: row !important; overflow: hidden; flex-grow: 1; min-height: 0; padding: 24px; gap: 24px;">
        <template v-if="selectedDay !== 'custom' || customLiturgies.length > 0">
          <!-- Left Panel: Liturgy List -->
          <LiturgyList 
            v-model:items="currentItems"
            :title="currentLiturgyTitle"
            :selected-item-index="selectedItemIndex"
            :use-internal-player="$userdata.get('modules.config.media_use_internal_player')"
            @select-item="selectItem"
            @edit-item="editItem"
            @remove-item="removeItem"
            @toggle-done="toggleItemDone"
            @execute-item="executeItem"
            @clear-all="confirmClearAll"
            @add-item="openAddMenu"
            @drag-end="saveLiturgy"
          />

          <!-- Right Panel: Sidebar (Notes Only) -->
          <LiturgyNotes 
            v-if="!isCompactView"
            v-model="currentNotes"
            @blur="saveLiturgy"
          />
        </template>
        <template v-else>
          <div class="d-flex flex-column align-center justify-center w-100 h-100" style="opacity: 0.6; min-height: 300px;">
            <v-icon size="64" class="mb-4" color="var(--sidebar-text-secondary)">
              mdi-format-list-checks
            </v-icon>
            <h3 class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
              {{ t('custom_liturgy.empty_list') }}
            </h3>
            <span class="text-body-2" style="color: var(--sidebar-text-secondary);">{{ t('custom_liturgy.empty_list_hint') }}</span>
          </div>
        </template>
      </div>

      <!-- Add Item Dialog -->
      <AddItemDialog 
        v-model="showAddMenu"
        :edit-data="editData"
        @save="onSaveItem"
      />

      <!-- New Custom Dialog -->
      <NewCustomDialog 
        v-model="showNewCustomDialog"
        @save="createCustomLiturgy"
      />
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import DaySelector from "./components/DaySelector.vue";
import CustomLiturgySelector from "./components/CustomLiturgySelector.vue";
import LiturgyList from "./components/LiturgyList.vue";
import LiturgyNotes from "./components/LiturgyNotes.vue";
import AddItemDialog from "./components/AddItemDialog.vue";
import NewCustomDialog from "./components/NewCustomDialog.vue";

export default {
  name: "LiturgyModuleIndex",
  components: {
    ModuleHeader,
    DaySelector,
    CustomLiturgySelector,
    LiturgyList,
    LiturgyNotes,
    AddItemDialog,
    NewCustomDialog,
  },
  data: () => ({
    isCompactView: false,
    selectedDay: null,
    selectedItemIndex: null,
    selectedCustomIndex: 0,

    // Liturgies storage
    liturgies: {
      sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [],
    },
    dayNotes: {
      sunday: "", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "", saturday: "",
    },
    customLiturgies: [],

    // Dialogs
    showAddMenu: false,
    editData: null,
    editingIndex: null,
    showNewCustomDialog: false,
  }),
  computed: {
    module_id() { return manifest.id; },
    module() { return this.$modules.get(this.module_id); },
    show() { return this.module.show; },
    dayOptions() {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      return [
        ...days.map(d => ({ value: d, label: this.t(`days.${d}`) })),
        { value: "custom", label: this.t("days.custom") },
      ];
    },
    currentItems: {
      get() {
        if (this.selectedDay === "custom") {
          const liturgy = this.customLiturgies[this.selectedCustomIndex];
          return liturgy ? liturgy.items : [];
        }
        return this.liturgies[this.selectedDay] || [];
      },
      set(val) {
        if (this.selectedDay === "custom") {
          if (this.customLiturgies[this.selectedCustomIndex]) {
            this.customLiturgies[this.selectedCustomIndex].items = val;
          }
        } else {
          this.liturgies[this.selectedDay] = val;
        }
      },
    },
    currentNotes: {
      get() {
        if (this.selectedDay === "custom") {
          const liturgy = this.customLiturgies[this.selectedCustomIndex];
          return liturgy ? (liturgy.notes || "") : "";
        }
        return this.dayNotes[this.selectedDay] || "";
      },
      set(val) {
        if (this.selectedDay === "custom") {
          if (this.customLiturgies[this.selectedCustomIndex]) {
            this.customLiturgies[this.selectedCustomIndex].notes = val;
          }
        } else {
          this.dayNotes[this.selectedDay] = val;
        }
      },
    },
    currentLiturgyTitle() {
      if (this.selectedDay === "custom") {
        const liturgy = this.customLiturgies[this.selectedCustomIndex];
        return liturgy ? liturgy.name : this.t("custom_liturgy.title");
      }
      return this.t(`days.${this.selectedDay}`);
    },
  },
  watch: {
    show() {
      if (this.show) {
        this.loadSavedLiturgies();
        this.$nextTick(() => { this.setupResizeObserver(); });
      } else {
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
          this.resizeObserver = null;
        }
      }
    },
  },
  async mounted() {
    this.setTodayAsDefault();
    if (this.show) {
      await this.loadSavedLiturgies();
      this.setupResizeObserver();
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    setupResizeObserver() {
      if (this.$refs.moduleContainer && !this.resizeObserver) {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            this.isCompactView = entry.contentRect.width < 915;
          }
        });
        this.resizeObserver.observe(this.$refs.moduleContainer);
      }
    },
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    setTodayAsDefault() {
      const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      this.selectedDay = dayMap[new Date().getDay()];
    },
    onDayChange() {
      this.selectedItemIndex = null;
    },

    // CUSTOM LITURGY
    createCustomLiturgy(name) {
      this.customLiturgies.push({
        name,
        items: [],
        notes: "",
      });
      this.selectedCustomIndex = this.customLiturgies.length - 1;
      this.selectedDay = "custom";
      this.saveLiturgy();
    },
    removeCustom(index) {
      this.$alert.yesno(
        { text: this.t("custom_liturgy.confirm_delete"), translate: false },
        (resp) => {
          if (resp === "yes") {
            this.customLiturgies.splice(index, 1);
            if (this.customLiturgies.length === 0) {
              this.setTodayAsDefault();
            } else {
              if (this.selectedCustomIndex >= this.customLiturgies.length) {
                this.selectedCustomIndex = this.customLiturgies.length - 1;
              }
            }
            this.saveLiturgy();
          }
        },
      );
    },

    // ITEMS
    openAddMenu() {
      this.editData = null;
      this.editingIndex = null;
      this.showAddMenu = true;
    },
    editItem(index) {
      this.editingIndex = index;
      this.editData = { ...this.currentItems[index] };
      this.showAddMenu = true;
    },
    onSaveItem(item) {
      if (this.editingIndex !== null) {
        this.currentItems.splice(this.editingIndex, 1, item);
      } else {
        this.currentItems.push(item);
      }
      this.showAddMenu = false;
      this.editData = null;
      this.editingIndex = null;
      this.saveLiturgy();
    },
    removeItem(index) {
      this.$alert.yesno(
        { text: this.t("messages.confirm_delete"), translate: false },
        (resp) => {
          if (resp === "yes") {
            this.currentItems.splice(index, 1);
            if (this.selectedItemIndex === index) this.selectedItemIndex = null;
            else if (this.selectedItemIndex > index) this.selectedItemIndex--;
            this.saveLiturgy();
          }
        },
      );
    },
    toggleItemDone(index) {
      const item = this.currentItems[index];
      item.done = !item.done;
      this.saveLiturgy();
    },
    confirmClearAll() {
      this.$alert.yesno(
        { text: this.t("messages.confirm_clear"), translate: false },
        (resp) => {
          if (resp === "yes") {
            this.currentItems = [];
            this.selectedItemIndex = null;
            this.saveLiturgy();
          }
        },
      );
    },
    selectItem(index) {
      this.selectedItemIndex = index;
      const item = this.currentItems[index];

      let changed = false;
      if (!item.done) {
        item.done = true;
        changed = true;
      }

      if (["music", "verse", "link", "media"].includes(item.type)) {
        this.executeItem(item);
      }

      if (changed) {
        this.saveLiturgy();
      }
    },
    async executeItem(item) {
      let targetModule = null;

      if (item.type === "music") {
        if (item.musicId) {
          this.$media.open({ id_music: item.musicId, mode: "audio" });
          targetModule = "media";
        }
      } else if (item.type === "verse") {
        if (item.verseBookId && item.verseChapter) {
          targetModule = "bible";
          this.$nextTick(() => {
            this.$appdata.set("modules.bible.data.navigate", {
              bookId: item.verseBookId,
              chapter: item.verseChapter,
              verses: item.verseNumbers,
            });
          });
        }
      } else if (item.type === "media") {
        if (item.filePath) {
          const useInternal = this.$userdata.get("modules.config.media_use_internal_player");
          
          if (useInternal) {
            if (this.$appdata.get("modules.media.id_music")) {
              const confirmed = await new Promise((resolve) => {
                this.$alert.yesno({
                  text: "Uma música está em reprodução no momento. Deseja encerrá-la e reproduzir esta mídia?",
                  translate: false,
                }, (res) => resolve(res === "yes"));
              });
              if (!confirmed) return;
              this.$media.close(true);
            }

            // Reproduz no reprodutor interno (external_media)
            this.$appdata.set("modules.external_media.filePath", item.filePath);
            this.$appdata.set("modules.external_media.title", item.name || "");
            this.$appdata.set("modules.external_media.subtitle", item.subtitle || "");
            this.$appdata.set("modules.external_media.minimized", false);
            this.$appdata.set("modules.external_media.config", {
              is_paused: true,
              current_time: 0,
              progress: 0,
              duration: 0,
              volume: 100,
            });

            // Check if it's audio-only
            const ext = item.filePath.split(".").pop().toLowerCase();
            const isAudio = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext);

            if (isAudio) {
              // Audio goes straight to footer bar (minimized)
              this.$appdata.set("modules.external_media.minimized", true);
            } else {
              // Video opens the full module
              this.$appdata.set("modules.external_media.show", true);
            }
          } else {
            // Reproduz no reprodutor padrão do sistema operacional
            if (window.electronAPI && window.electronAPI.openPath) {
              window.electronAPI.openPath(item.filePath);
            }
          }
        }
      } else if (item.type === "link") {
        if (item.url) {
          if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(item.url);
          } else {
            window.open(item.url, "_blank");
          }
        }
      }

      if (targetModule) {
        const popups = this.$appdata.get("popups") || [];
        const isPopupOpened = popups.some(p => !p.closed);
        const currentModule = this.$appdata.get("popup_module");

        if (!isPopupOpened || currentModule !== targetModule) {
          let selectedMonitors = [];
          if (window.electronAPI && window.electronAPI.getDisplays) {
            const displays = await window.electronAPI.getDisplays();
            if (displays && displays.length > 1) {
              let configMonitors = this.$userdata.get("modules.config.slide_monitor");
              if (!Array.isArray(configMonitors)) {
                configMonitors = configMonitors ? [configMonitors] : [];
              }
              const primary = displays.find(d => d.isPrimary) || displays[0];
              selectedMonitors = configMonitors.filter(m => m !== primary.id);
            }
          }
          
          if (selectedMonitors.length > 0) {
            await this.$popup.syncMonitors(selectedMonitors, targetModule, true);
          } else {
            this.$popup.open({ module: targetModule, fullscreen: true });
          }
        }
      }
    },
    async saveLiturgy() {
      await this.$userdata.set("modules.liturgy.liturgies", JSON.parse(JSON.stringify(this.liturgies)));
      await this.$userdata.set("modules.liturgy.dayNotes", JSON.parse(JSON.stringify(this.dayNotes)));
      await this.$userdata.set("modules.liturgy.custom", JSON.parse(JSON.stringify(this.customLiturgies)));
    },
    async loadSavedLiturgies() {
      try {
        const saved = await this.$userdata.get("modules.liturgy.liturgies");
        if (saved) {
          for (const day in this.liturgies) {
            if (saved[day]) this.liturgies[day] = saved[day];
          }
        }
        const savedNotes = await this.$userdata.get("modules.liturgy.dayNotes");
        if (savedNotes) {
          for (const day in this.dayNotes) {
            if (savedNotes[day]) this.dayNotes[day] = savedNotes[day];
          }
        }
        const custom = await this.$userdata.get("modules.liturgy.custom");
        if (custom && Array.isArray(custom)) {
          this.customLiturgies = custom;
        }
      } catch (e) {
        console.error("Failed to load liturgies:", e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.module-full-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  z-index: 10;
}
</style>
