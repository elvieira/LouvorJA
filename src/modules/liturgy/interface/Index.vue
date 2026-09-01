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
        icon="mdi-hands-pray"
        @close="module.show = false"
      >
        <div class="d-flex" style="gap: 12px;">
          <v-btn
            variant="tonal"
            color="#f6c32a"
            append-icon="mdi-view-dashboard-outline"
            class="rounded-lg text-body-2 font-weight-medium"
            style="text-transform: none; letter-spacing: normal;"
            @click="showTemplatesDialog = true"
          >
            Templates
          </v-btn>
          <v-btn
            variant="tonal"
            color="primary"
            append-icon="mdi-calendar-clock"
            class="rounded-lg text-body-2 font-weight-bold"
            style="text-transform: none; letter-spacing: normal;"
            @click="showScheduledItems = true"
          >
            Itens Agendados
          </v-btn>
        </div>
      </ModuleHeader>

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
            :show-notes="showNotes"
            @select-item="selectItem"
            @edit-item="editItem"
            @duplicate-item="duplicateItem"
            @remove-item="removeItem"
            @toggle-done="toggleItemDone"
            @execute-item="executeItem"
            @clear-all="confirmClearAll"
            @add-item="openAddMenu"
            @add-item-to-category="openAddMenuWithCategory"
            @drag-end="saveLiturgy"
            @toggle-notes="showNotes = !showNotes"
          />

          <!-- Right Panel: Sidebar (Notes Only) -->
          <LiturgyNotes 
            v-if="showNotes && !isCompactView"
            v-model="currentNotes"
            @blur="saveLiturgy"
          />
        </template>
        <template v-else>
          <div class="d-flex flex-column align-center justify-center w-100 h-100" style="opacity: 0.6; min-height: 300px;">
            <v-icon size="64" class="mb-4" color="var(--sidebar-text-secondary)">
              mdi-hands-pray
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
        v-if="showAddMenu"
        v-model="showAddMenu"
        :edit-data="editData"
        :categories="extraData.scheduled_items || []"
        :is-template-mode="isTemplateMode"
        :is-filling-placeholder="isFillingPlaceholder"
        @save="onSaveItem"
      />

      <!-- New Custom Dialog -->
      <NewCustomDialog 
        v-model="showNewCustomDialog"
        @save="createCustomLiturgy"
      />

      <!-- Scheduled Items Dialog -->
      <ScheduledItemsDialog 
        v-if="showScheduledItems"
        v-model="showScheduledItems"
        v-model:extra-data="extraData"
        @save="saveLiturgy"
      />
      <TemplatesDialog
        v-if="showTemplatesDialog"
        v-model="showTemplatesDialog"
        :extra-data="extraData"
        @update-extra-data="updateExtraDataAndSave"
        @add-item="openAddMenuForTemplate"
        @edit-item="editTemplateItem"
        @apply-template="applyTemplateToCurrentDay"
      />
    </div>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import manifest from "../manifest";
import ModuleHeader from "@/components/ModuleHeader.vue";
import DaySelector from "./components/DaySelector.vue";
import CustomLiturgySelector from "./components/CustomLiturgySelector.vue";
import LiturgyList from "./components/LiturgyList.vue";
import LiturgyNotes from "./components/LiturgyNotes.vue";
import AddItemDialog from "./components/AddItemDialog.vue";
import NewCustomDialog from "./components/NewCustomDialog.vue";
import ScheduledItemsDialog from "./components/ScheduledItemsDialog.vue";
import TemplatesDialog from "./components/TemplatesDialog.vue";


export default defineComponent({
  name: "LiturgyModuleIndex",
  components: {
    ModuleHeader,
    DaySelector,
    CustomLiturgySelector,
    LiturgyList,
    LiturgyNotes,
    AddItemDialog,
    NewCustomDialog,
    ScheduledItemsDialog,
    TemplatesDialog,
  },
  data: () => ({
    isCompactView: false as boolean,
    selectedDay: undefined as string | undefined,
    selectedItemIndex: null as number | null,
    selectedCustomIndex: 0 as number,

    // Liturgies storage
    liturgies: {
      sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [],
    } as Record<string, any[]>,
    dayNotes: {
      sunday: "", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "", saturday: "",
    } as Record<string, string>,
    customLiturgies: [] as any[],

    extraData: {
      scheduled_items: [],
      templates: [],
    } as any,

    // Dialogs
    showAddMenu: false as boolean,
    editData: null as any,
    editingIndex: null as number | null,
    insertingCategoryId: null as string | null,
    showNewCustomDialog: false as boolean,
    showScheduledItems: false as boolean,
    showTemplatesDialog: false as boolean,
    isTemplateMode: false as boolean,
    isFillingPlaceholder: false as boolean,
    templateTargetId: null as string | null,
    showNotes: false as boolean,
    resizeObserver: null as ResizeObserver | null,
  }),
  computed: {
    module_id(): string { return manifest.id; },
    module(): any { return this.$modules.get(this.module_id); },
    show(): boolean { return this.module.show; },
    dayOptions(): {value: string, label: string}[] {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      return [
        ...days.map(d => ({ value: d, label: this.t(`days.${d}`) })),
        { value: "custom", label: this.t("days.custom") },
      ];
    },
    currentItems: {
      get(): any[] {
        if (this.selectedDay === "custom") {
          const liturgy = this.customLiturgies[this.selectedCustomIndex];
          return liturgy ? liturgy.items : [];
        }
        return this.selectedDay ? this.liturgies[this.selectedDay] || [] : [];
      },
      set(val: any[]) {
        if (this.selectedDay === "custom") {
          if (this.customLiturgies[this.selectedCustomIndex]) {
            this.customLiturgies[this.selectedCustomIndex].items = val;
          }
        } else if (this.selectedDay) {
          this.liturgies[this.selectedDay] = val;
        }
      },
    },
    currentNotes: {
      get(): string {
        if (this.selectedDay === "custom") {
          const liturgy = this.customLiturgies[this.selectedCustomIndex];
          return liturgy ? (liturgy.notes || "") : "";
        }
        return this.selectedDay ? this.dayNotes[this.selectedDay] || "" : "";
      },
      set(val: string) {
        if (this.selectedDay === "custom") {
          if (this.customLiturgies[this.selectedCustomIndex]) {
            this.customLiturgies[this.selectedCustomIndex].notes = val;
          }
        } else if (this.selectedDay) {
          this.dayNotes[this.selectedDay] = val;
        }
      },
    },
    currentLiturgyTitle(): string {
      if (this.selectedDay === "custom") {
        const liturgy = this.customLiturgies[this.selectedCustomIndex];
        return liturgy ? liturgy.name : this.t("custom_liturgy.title");
      }
      return this.selectedDay ? this.t(`days.${this.selectedDay}`) : "";
    },
  },
  watch: {
    show() {
      if (this.show) {
        this.loadSavedLiturgies();
        this.$nextTick(() => { this.setupResizeObserver(); });
      } else {
        this.showAddMenu = false;
        this.showNewCustomDialog = false;
        this.showTemplatesDialog = false;
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
        this.resizeObserver.observe(this.$refs.moduleContainer as Element);
      }
    },
    t(text: string): string {
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
    createCustomLiturgy(name: string) {
      this.customLiturgies.push({
        name,
        items: [],
        notes: "",
      });
      this.selectedCustomIndex = this.customLiturgies.length - 1;
      this.selectedDay = "custom";
      this.saveLiturgy();
    },
    removeCustom(index: number) {
      this.$alert.yesno(
        { text: this.t("custom_liturgy.confirm_delete"), translate: false },
        (resp: string) => {
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
      this.insertingCategoryId = null;
      this.isTemplateMode = false;
      this.isFillingPlaceholder = false;
      this.showAddMenu = true;
    },
    openAddMenuWithCategory(categoryId: string) {
      this.editData = null;
      this.editingIndex = null;
      this.insertingCategoryId = categoryId;
      this.isTemplateMode = false;
      this.isFillingPlaceholder = false;
      this.showAddMenu = true;
    },
    editItem(index: number) {
      this.editingIndex = index;
      this.insertingCategoryId = null;
      this.editData = { ...this.currentItems[index] };
      
      // Se for um placeholder, abre em modo de preenchimento
      const isPlaceholder = this.isItemPlaceholder(this.editData);
      this.isTemplateMode = isPlaceholder;
      this.isFillingPlaceholder = isPlaceholder;
      
      this.showAddMenu = true;
    },
    isItemPlaceholder(item: any): boolean {
      if (item.type === "music" && !item.musicId) return true;
      if (item.type === "verse" && (!item.verseBookId || !item.verseChapter)) return true;
      if (item.type === "media" && !item.filePath) return true;
      if (item.type === "file" && !item.filePath) return true;
      if (item.type === "link" && !item.url?.trim()) return true;
      if (item.type === "scheduled_item" && !item.categoryId) return true;
      return false;
    },
    openAddMenuForTemplate(templateId: string) {
      this.editData = null;
      this.editingIndex = null;
      this.insertingCategoryId = null;
      this.isTemplateMode = true;
      this.isFillingPlaceholder = false;
      this.templateTargetId = templateId;
      this.showAddMenu = true;
    },
    editTemplateItem({ item, index, templateId }: any) {
      this.editData = { ...item };
      this.editingIndex = index;
      this.insertingCategoryId = null;
      this.isTemplateMode = true;
      this.isFillingPlaceholder = false;
      this.templateTargetId = templateId;
      this.showAddMenu = true;
    },
    updateExtraDataAndSave(newData: any) {
      this.extraData = newData;
      this.saveLiturgy();
    },
    applyTemplateToCurrentDay(template: any) {
      this.$alert.yesno({
        text: this.t("templates.confirm_apply"),
        translate: false,
      }, (res: string) => {
        if (res === "yes") {
          const newItems = template.items.map((i: any) => {
            const newItem = JSON.parse(JSON.stringify(i));
            newItem.id = crypto.randomUUID();
            return newItem;
          });
          this.currentItems = newItems;
          this.saveLiturgy();
        }
      });
    },
    onSaveItem(item: any) {
      if (this.isTemplateMode && this.templateTargetId && !this.isFillingPlaceholder) {
        // Save into template
        if (!this.extraData.templates) this.extraData.templates = [];
        const tIndex = this.extraData.templates.findIndex((t: any) => t.id === this.templateTargetId);
        if (tIndex !== -1) {
          const t = this.extraData.templates[tIndex];
          if (this.editingIndex !== null) {
            t.items.splice(this.editingIndex, 1, item);
          } else {
            t.items.push(item);
          }
          this.saveLiturgy();
        }
      } else {
        // Save into current liturgy
        if (this.editingIndex !== null) {
          this.currentItems.splice(this.editingIndex, 1, item);
        } else if (this.insertingCategoryId) {
          const catIdx = this.currentItems.findIndex((i: any) => i.id === this.insertingCategoryId);
          if (catIdx !== -1) {
            let insertIdx = catIdx + 1;
            while (insertIdx < this.currentItems.length && this.currentItems[insertIdx].type !== "category") {
              insertIdx++;
            }
            this.currentItems.splice(insertIdx, 0, item);
          } else {
            this.currentItems.push(item);
          }
        } else {
          this.currentItems.push(item);
        }
      }
      this.showAddMenu = false;
      this.editData = null;
      this.editingIndex = null;
      this.isTemplateMode = false;
      this.isFillingPlaceholder = false;
      this.templateTargetId = null;
      this.saveLiturgy();
    },
    duplicateItem(index: number) {
      const original = this.currentItems[index];
      
      if (original.type === "category") {
        let endIndex = index + 1;
        while (endIndex < this.currentItems.length && this.currentItems[endIndex].type !== "category") {
          endIndex++;
        }
        
        const itemsToDuplicate = this.currentItems.slice(index, endIndex);
        const newItems = itemsToDuplicate.map((item: any) => ({
          ...JSON.parse(JSON.stringify(item)),
          id: Date.now() + Math.random(),
          done: false,
        }));
        
        this.currentItems.splice(endIndex, 0, ...newItems);
      } else {
        const newItem = {
          ...JSON.parse(JSON.stringify(original)),
          id: Date.now() + Math.random(),
          done: false,
        };
        this.currentItems.splice(index + 1, 0, newItem);
      }
      
      this.saveLiturgy();
    },
    removeItem(index: number) {
      this.$alert.yesno(
        { text: this.t("messages.confirm_delete"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            this.currentItems.splice(index, 1);
            if (this.selectedItemIndex === index) this.selectedItemIndex = null;
            else if (this.selectedItemIndex !== null && this.selectedItemIndex > index) this.selectedItemIndex--;
            this.saveLiturgy();
          }
        },
      );
    },
    toggleItemDone(index: number) {
      const item = this.currentItems[index];
      item.done = !item.done;
      this.saveLiturgy();
    },
    confirmClearAll() {
      this.$alert.yesno(
        { text: this.t("messages.confirm_clear"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            this.currentItems = [];
            this.selectedItemIndex = null;
            this.saveLiturgy();
          }
        },
      );
    },
    selectItem(index: number) {
      this.selectedItemIndex = index;
      const item = this.currentItems[index];

      if (this.isItemPlaceholder(item)) {
        this.editItem(index);
        return;
      }

      let changed = false;
      if (!item.done) {
        item.done = true;
        changed = true;
      }

      if (["music", "verse", "link", "media", "file", "scheduled_item"].includes(item.type)) {
        this.executeItem(item);
      }

      if (changed) {
        this.saveLiturgy();
      }
    },
    async executeItem(item: any): Promise<void> {
      if (this.isItemProjecting(item)) {
        this.closeProjection(item.type);
        return;
      }

      let targetModule = null;

      if (item.type === "music") {
        if (item.musicId) {
          const success = await this.$media.open({ id_music: item.musicId, mode: "audio" });
          if (success !== false) {
            targetModule = "media";
          }
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
      } else if (item.type === "file") {
        if (item.filePath && window.electronAPI?.openPath) {
          window.electronAPI.openPath(item.filePath);
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
                }, (res: string) => resolve(res === "yes"));
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
            const ext = item.filePath.split(".").pop()?.toLowerCase() || "";
            const isAudio = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext);

            if (isAudio) {
              // Audio goes straight to footer bar (minimized)
              this.$appdata.set("modules.external_media.minimized", true);
            } else {
              // Video opens the full module
              this.$appdata.set("modules.external_media.show", true);
              targetModule = "external_media";
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
      } else if (item.type === "scheduled_item") {
        const categoryId = item.categoryId;
        const categories = this.extraData.scheduled_items || [];
        const category = categories.find((c: any) => c.id === categoryId);
        
        if (!category) {
          this.$alert.show({ text: "Categoria não encontrada ou foi removida.", translate: false });
          return;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        let schedule = null;
        if (category.items && Array.isArray(category.items)) {
          schedule = category.items.find((i: any) => i.date === dateString);
        } else if (category.schedules) {
          schedule = category.schedules[dateString];
        }
        
        if (!schedule || !schedule.filePath) {
          this.$alert.show({ text: "Nenhum arquivo agendado para o dia de hoje nesta categoria.", translate: false });
          return;
        }

        // Simular um item do tipo "media" para executar no fluxo padrão
        const mediaItem = {
          type: "media",
          filePath: schedule.filePath,
          name: schedule.name || "Item Agendado",
          subtitle: category.name,
        };
        
        return this.executeItem(mediaItem);
      }

      if (targetModule) {
        const popups = this.$appdata.get("popups") || [];
        const isPopupOpened = popups.some((p: any) => !p.closed);
        const currentModule = this.$appdata.get("popup_module");

        if (!isPopupOpened || currentModule !== targetModule) {
          let selectedMonitors: any[] = [];
          if (window.electronAPI && window.electronAPI.getDisplays) {
            const displays = await window.electronAPI.getDisplays();
            if (displays && displays.length > 1) {
              let configMonitors = [];
              if (targetModule === "external_media") {
                const syncSettings = this.$userdata.get("modules.config.media_sync_projection_settings") !== false;
                configMonitors = syncSettings
                  ? this.$userdata.get("modules.config.slide_monitor") || []
                  : this.$userdata.get("modules.config.media_slide_monitor") || [];
              } else {
                configMonitors = this.$userdata.get("modules.config.slide_monitor") || [];
              }
              
              if (!Array.isArray(configMonitors)) {
                configMonitors = configMonitors ? [configMonitors] : [];
              }
              const primary = (displays as any[]).find((d: any) => d.isPrimary) || (displays as any[])[0];
              selectedMonitors = configMonitors.filter((m: any) => m !== (primary as any).id);
            }
          }
          
          if (selectedMonitors.length > 0) {
            await (this as any).$popup.syncMonitors(selectedMonitors, targetModule, true);
          } else if (targetModule !== "external_media") {
            const fullscreen = this.$userdata.get("modules.config.slide_fullscreen") !== false;
            await (this as any).$popup.open({ module: targetModule, fullscreen });
          }
        }
      }
    },
    async saveLiturgy() {
      const dataToSave = {
        liturgies: JSON.parse(JSON.stringify(this.liturgies)),
        dayNotes: JSON.parse(JSON.stringify(this.dayNotes)),
        custom: JSON.parse(JSON.stringify(this.customLiturgies)),
        scheduled_items: JSON.parse(JSON.stringify(this.extraData.scheduled_items || [])),
        templates: JSON.parse(JSON.stringify(this.extraData.templates || [])),
      };
      if (window.electronAPI && window.electronAPI.saveLiturgyData) {
        await window.electronAPI.saveLiturgyData(dataToSave);
      }
    },
    async loadSavedLiturgies() {
      try {
        if (!window.electronAPI || !window.electronAPI.getLiturgyData) return;
        
        let saved = await window.electronAPI.getLiturgyData() as any;
        
        // MIGRATION FALLBACK
        if (!saved) {
          const oldLiturgies = await this.$userdata.get("modules.liturgy.liturgies");
          const oldNotes = await this.$userdata.get("modules.liturgy.dayNotes");
          const oldCustom = await this.$userdata.get("modules.liturgy.custom");
          
          if (oldLiturgies || oldNotes || oldCustom) {
            saved = {
              liturgies: oldLiturgies || {},
              dayNotes: oldNotes || {},
              custom: oldCustom || [],
              scheduled_items: [],
              templates: [],
            };
            // The migrated data will be saved the next time saveLiturgy is called
          }
        }
        
        if (saved) {
          if (saved.liturgies) {
            for (const day in this.liturgies) {
              if (saved.liturgies[day]) this.liturgies[day] = saved.liturgies[day];
            }
          }
          if (saved.dayNotes) {
            for (const day in this.dayNotes) {
              if (saved.dayNotes[day]) this.dayNotes[day] = saved.dayNotes[day];
            }
          }
          if (saved.custom && Array.isArray(saved.custom)) {
            this.customLiturgies = saved.custom;
          }
          if (saved.scheduled_items) {
            this.extraData.scheduled_items = saved.scheduled_items;
          }
          if (saved.templates) {
            this.extraData.templates = saved.templates;
          }
        }
      } catch (e) {
        console.error("Failed to load liturgies:", e);
      }
    },
    isItemProjecting(item: any) {
      const currentModule = this.$appdata.get("popup_module");
      if (!currentModule) return false;
      
      if (item.type === "lyric" && currentModule === "lyric") {
        return this.$appdata.get("modules.lyric.id_music") === item.id_music && this.$appdata.get("modules.lyric.show") === true;
      }
      if (item.type === "bible" && currentModule === "bible") {
        return this.$appdata.get("modules.bible.id_bible_book") === item.id_bible_book && 
          this.$appdata.get("modules.bible.chapter") === item.chapter && 
          JSON.stringify(this.$appdata.get("modules.bible.verses")) === JSON.stringify(item.verses) &&
          this.$appdata.get("modules.bible.show") === true;
      }
      if (item.type === "media" && currentModule === "external_media") {
        return this.$appdata.get("modules.external_media.filePath") === item.filePath && 
          this.$appdata.get("modules.external_media.show") === true;
      }
      return false;
    },
    closeProjection(type: string) {
      if (type === "lyric") {
        this.$appdata.set("modules.lyric.show", false);
      } else if (type === "bible") {
        this.$appdata.set("modules.bible.show", false);
      } else if (type === "media") {
        this.$appdata.set("modules.external_media.show", false);
        this.$appdata.set("modules.external_media.minimized", false);
        this.$appdata.set("modules.external_media.filePath", null);
      }
      
      // Fecha a janela de projeção caso esteja aberta
      import("@/helpers/ui/Popup").then(({ default: $popup }) => {
        $popup.exit();
      });
    },
  },
});
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

.no-hover :deep(.v-btn__overlay) {
  display: none !important;
}
</style>

<style lang="scss">
.liturgy-dialog-wrapper {
  transform: translateX(calc(var(--sidebar-width, 280px) / 2));
  max-width: calc(100vw - var(--sidebar-width, 280px) - 48px) !important;
}

body.sidebar-collapsed .liturgy-dialog-wrapper {
  transform: translateX(calc(var(--sidebar-collapsed-width, 72px) / 2));
  max-width: calc(100vw - var(--sidebar-collapsed-width, 72px) - 48px) !important;
}

@media (max-width: 1024px) {
  body:not(.sidebar-collapsed) .liturgy-dialog-wrapper {
    transform: none !important;
    max-width: calc(100vw - 48px) !important;
  }
}
</style>
