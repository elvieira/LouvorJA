<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    content-class="liturgy-dialog-wrapper"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card 
      class="rounded-xl"
      style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; max-height: 90vh; max-width: 900px; width: 100%; margin: 0 auto;"
    >
      <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon color="primary" size="32" class="mr-3">
              mdi-calendar-clock
            </v-icon>
            <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
              {{ t('scheduled_items.title') }}
            </h2>
          </div>
          <v-btn
            icon
            size="small"
            variant="flat"
            color="rgba(128,128,128,0.1)"
            class="rounded-lg"
            @click="close"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary); margin-left: 44px;">
          {{ t('scheduled_items.subtitle') }}
        </p>
      </div>

      <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 400px; display: flex; gap: 16px; overflow: hidden;">
        <!-- Left Pane: Categories -->
        <div class="categories-pane rounded-xl flex-shrink-0" style="width: 260px; min-width: 260px; display: flex; flex-direction: column; background: rgba(var(--v-theme-on-surface), 0.04); border: 1px solid rgba(128,128,128,0.1);">
          <div class="pa-4 border-b d-flex align-center justify-space-between" style="border-bottom-color: rgba(128,128,128,0.1) !important;">
            <span class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">Categorias</span>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              class="rounded-lg text-none px-2"
              height="28"
              @click="showNewCategoryForm = true"
            >
              <v-icon size="16" class="mr-1">
                mdi-plus
              </v-icon>
              Nova
            </v-btn>
          </div>
          
          <v-list class="bg-transparent flex-grow-1 overflow-y-auto pa-2" density="compact">
            <div 
              v-if="showNewCategoryForm" 
              class="category-item d-flex align-center pa-3 mb-2 rounded-lg" 
              style="background: rgba(var(--v-theme-primary), 0.15); border: 1px solid rgba(var(--v-theme-primary), 0.2);"
            >
              <v-icon size="20" class="mr-3 flex-shrink-0" color="primary">
                mdi-folder-plus
              </v-icon>
              <input 
                v-model="newCategoryName"
                type="text"
                placeholder="Nome da categoria..."
                autofocus
                class="text-body-2 font-weight-medium flex-grow-1 mr-2"
                style="background: transparent; border: none; outline: none; color: rgb(var(--v-theme-primary)); min-width: 0;"
                @keyup.enter="saveNewCategory"
                @keyup.esc="showNewCategoryForm = false"
              />
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                class="rounded-lg text-none px-3 font-weight-bold ml-1"
                @click="saveNewCategory"
              >
                {{ t('actions.save') }}
              </v-btn>
            </div>

            <template v-if="categories.length > 0">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="category-item d-flex align-center pa-3 mb-2 rounded-lg cursor-pointer"
                :style="{
                  background: selectedCategoryId === cat.id ? 'rgba(var(--v-theme-primary), 0.15)' : 'transparent',
                  color: selectedCategoryId === cat.id ? 'rgb(var(--v-theme-primary))' : 'var(--sidebar-text)',
                  border: selectedCategoryId === cat.id ? '1px solid rgba(var(--v-theme-primary), 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }"
                @click="selectedCategoryId = cat.id"
              >
                <v-icon size="20" class="mr-3 flex-shrink-0" :color="selectedCategoryId === cat.id ? 'primary' : 'rgba(128,128,128,0.5)'">
                  {{ selectedCategoryId === cat.id ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <span class="text-body-2 font-weight-medium flex-grow-1 text-truncate">
                  {{ cat.name }}
                </span>
                
                <v-btn
                  v-if="selectedCategoryId === cat.id"
                  color="rgba(var(--v-theme-error), 0.1)"
                  variant="flat"
                  size="24"
                  class="rounded-md ml-2 flex-shrink-0"
                  @click.stop="deleteCategory(cat.id)"
                >
                  <v-icon size="14" color="error">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </div>
            </template>
            <div v-else-if="!showNewCategoryForm" class="pa-4 text-center text-caption" style="color: var(--sidebar-text-secondary);">
              {{ t('scheduled_items.no_categories') }}
            </div>
          </v-list>
        </div>

        <!-- Right Pane: Calendar & Selection -->
        <div class="content-pane flex-grow-1 d-flex flex-column pa-6 rounded-xl" style="background: rgba(var(--v-theme-on-surface), 0.02); border: 1px solid rgba(128,128,128,0.1); overflow-y: auto;">
          <template v-if="selectedCategory">
            <div class="d-flex align-center justify-space-between mb-6" style="gap: 16px;">
              <div class="d-flex align-center" style="min-width: 0; flex: 1;">
                <v-avatar
                  color="rgba(var(--v-theme-primary), 0.1)"
                  size="40"
                  rounded="lg"
                  class="mr-3 flex-shrink-0"
                >
                  <v-icon color="primary" size="20">
                    mdi-folder-open
                  </v-icon>
                </v-avatar>
                <div style="min-width: 0;">
                  <h3 class="text-h6 font-weight-bold text-truncate" style="color: var(--sidebar-text); line-height: 1.2;">
                    {{ selectedCategory.name }}
                  </h3>
                  <div class="text-caption text-truncate" style="color: var(--sidebar-text-secondary);">
                    {{ t('scheduled_items.manage_files') }}
                  </div>
                </div>
              </div>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                class="rounded-lg text-none px-6 font-weight-bold"
                @click="selectFile"
              >
                {{ t('actions.add') }}
              </v-btn>
            </div>

            <div class="schedule-list flex-grow-1 d-flex flex-column" style="gap: 12px; overflow-y: auto;">
              <template v-if="currentCategoryItems.length > 0">
                <div 
                  v-for="item in currentCategoryItems" 
                  :key="item.id" 
                  class="current-item-box pa-3 rounded-xl border d-flex align-center" 
                  style="background: rgba(var(--v-theme-on-surface), 0.04); border-color: rgba(128,128,128,0.1) !important;"
                >
                  <v-avatar
                    color="rgba(var(--v-theme-primary), 0.1)"
                    size="42"
                    rounded="lg"
                    class="mr-4 flex-shrink-0"
                  >
                    <v-icon size="20" color="primary">
                      mdi-file-video
                    </v-icon>
                  </v-avatar>
                  <div class="flex-grow-1" style="min-width: 0;">
                    <div class="text-body-2 font-weight-bold text-truncate" style="color: var(--sidebar-text);">
                      {{ item.name }}
                    </div>
                    <div class="text-caption text-truncate" style="color: var(--sidebar-text-secondary);">
                      {{ item.filePath }}
                    </div>
                  </div>
                  
                  <div class="d-flex align-center ml-4 flex-shrink-0" style="gap: 8px;">
                    <input 
                      type="date" 
                      :value="item.date"
                      class="px-2 py-1 rounded-lg border text-body-2 font-weight-medium"
                      style="border-color: rgba(128,128,128,0.2); background: rgba(var(--v-theme-surface), 0.5); color: var(--sidebar-text); outline: none;"
                      @change="(e) => updateItemDate(item.id, (e.target as HTMLInputElement).value, e.target as HTMLInputElement)"
                    />
                    <v-btn
                      class="rounded-lg"
                      icon="mdi-delete"
                      variant="flat"
                      color="rgba(var(--v-theme-error), 0.1)"
                      size="small"
                      @click="removeScheduledItem(item.id)"
                    >
                      <v-icon color="error" size="18">
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
              <div v-else class="empty-state pa-6 mt-4 text-center rounded-xl d-flex flex-column align-center" style="border: 2px dashed rgba(128,128,128,0.2);">
                <v-icon size="48" color="rgba(128,128,128,0.3)" class="mb-3">
                  mdi-file-hidden
                </v-icon>
                <div class="text-body-2 mb-1" style="color: var(--sidebar-text);">
                  {{ t('scheduled_items.no_files') }}
                </div>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                  {{ t('scheduled_items.no_files_hint') }}
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-center justify-center h-100" style="opacity: 0.6;">
              <v-icon size="64" class="mb-4" color="var(--sidebar-text)">
                mdi-calendar-blank
              </v-icon>
              <h3 class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
                {{ t('scheduled_items.no_selection_title') }}
              </h3>
              <p class="text-body-2 text-center mt-2" style="color: var(--sidebar-text-secondary); max-width: 250px;">
                {{ t('scheduled_items.no_selection_hint') }}
              </p>
            </div>
          </template>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import $snackbar from "@/helpers/ui/Snackbar";



interface ScheduledItem {
  id: string;
  filePath: string;
  name: string;
  date: string;
}

interface Category {
  id: string;
  name: string;
  items?: ScheduledItem[];
  schedules?: Record<string, any>; // legacy
}

export default defineComponent({
  name: "ScheduledItemsDialog",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    extraData: {
      type: Object as PropType<{ scheduled_items: Category[], templates: any[] }>,
      required: true,
    },
  },
  emits: ["update:modelValue", "update:extraData", "save"],
  data() {
    return {
      selectedCategoryId: null as string | null,
      showNewCategoryForm: false,
      newCategoryName: "",
    };
  },
  computed: {
    categories(): Category[] {
      return this.extraData.scheduled_items || [];
    },
    selectedCategory(): Category | undefined {
      return this.categories.find(c => c.id === this.selectedCategoryId);
    },
    currentCategoryItems(): ScheduledItem[] {
      if (!this.selectedCategory) return [];
      const items = this.selectedCategory.items || [];
      return [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
  },
  watch: {
    categories: {
      immediate: true,
      handler(newCats) {
        let needsMigration = false;
        const migratedCats = newCats.map((cat: Category) => {
          if (cat.schedules && !cat.items) {
            needsMigration = true;
            return {
              ...cat,
              items: Object.entries(cat.schedules).map(([date, item]: [string, any]) => ({
                id: crypto.randomUUID(),
                filePath: item.filePath,
                name: item.name,
                date,
              })),
              schedules: undefined,
            };
          } else if (!cat.items) {
            needsMigration = true;
            return { ...cat, items: [] };
          }
          return cat;
        });

        if (needsMigration) {
          this.updateExtraData(migratedCats);
        }

        if (migratedCats.length > 0 && !this.selectedCategoryId) {
          this.selectedCategoryId = migratedCats[0].id;
        }
      },
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    close() {
      this.$emit("update:modelValue", false);
    },
    promptNewCategory() {
      // Usamos a nova forma de adicionar inline para evitar problemas com prompts globais
      this.showNewCategoryForm = true;
      this.newCategoryName = "";
    },
    saveNewCategory() {
      const val = this.newCategoryName.trim();
      if (val) {
        const newCat: Category = {
          id: crypto.randomUUID(),
          name: val,
          items: [],
        };
        const updated = [...this.categories, newCat];
        this.updateExtraData(updated);
        this.selectedCategoryId = newCat.id;
        this.showNewCategoryForm = false;
        this.newCategoryName = "";
      } else {
        this.showNewCategoryForm = false;
      }
    },
    deleteCategory(id: string) {
      this.$alert.yesno(
        { text: this.t("scheduled_items.confirm_delete_category"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            const updated = this.categories.filter(c => c.id !== id);
            this.updateExtraData(updated);
            if (this.selectedCategoryId === id) {
              this.selectedCategoryId = updated.length > 0 ? updated[0].id : null;
            }
          }
        },
      );
    },
    async selectFile() {
      if (!this.selectedCategory) return;
      
      if (window.electronAPI && window.electronAPI.openFileDialog) {
        const filePath = (await window.electronAPI.openFileDialog({
          title: "Selecionar Arquivo para Agendar",
          filters: [
            { name: "Mídia", extensions: ["mp4", "webm", "mkv", "avi", "mp3", "wav", "jpg", "png", "jpeg"] },
            { name: "Todos os Arquivos", extensions: ["*"] },
          ],
        })) as string | null;

        if (filePath) {
          const name = filePath.split(/[/\\]/).pop() || "Arquivo";
          
          let newDateObj = new Date();
          if (this.selectedCategory.items && this.selectedCategory.items.length > 0) {
            const items = this.selectedCategory.items;
            const maxDateStr = items.reduce((max, item) => (item.date > max ? item.date : max), items[0].date);
            const maxDate = new Date(`${maxDateStr}T00:00:00`);
            if (!isNaN(maxDate.getTime())) {
              maxDate.setDate(maxDate.getDate() + 1);
              newDateObj = maxDate;
            }
          }

          const year = newDateObj.getFullYear();
          const month = String(newDateObj.getMonth() + 1).padStart(2, "0");
          const day = String(newDateObj.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;

          const newItem: ScheduledItem = {
            id: crypto.randomUUID(),
            filePath,
            name,
            date: dateStr,
          };

          const newCategories = this.categories.map((c: Category) => {
            if (c.id === this.selectedCategoryId) {
              return { ...c, items: [...(c.items || []), newItem] };
            }
            return c;
          });
          this.updateExtraData(newCategories);
        }
      }
    },
    removeScheduledItem(itemId: string) {
      if (!this.selectedCategory) return;
      const newCategories = this.categories.map((c: Category) => {
        if (c.id === this.selectedCategoryId) {
          return { ...c, items: (c.items || []).filter(i => i.id !== itemId) };
        }
        return c;
      });
      this.updateExtraData(newCategories);
    },
    updateItemDate(itemId: string, newDate: string, target?: HTMLInputElement) {
      if (!this.selectedCategory) return;
      
      const isDateTaken = this.selectedCategory.items?.some(i => i.date === newDate && i.id !== itemId);
      if (isDateTaken) {
        $snackbar.show({ text: this.t("scheduled_items.date_exists_warning"), color: "warning" });
        if (target) {
          const currentItem = this.selectedCategory.items?.find(i => i.id === itemId);
          if (currentItem) {
            target.value = currentItem.date;
          }
        }
        return;
      }

      const newCategories = this.categories.map((c: Category) => {
        if (c.id === this.selectedCategoryId) {
          return {
            ...c,
            items: (c.items || []).map(i => i.id === itemId ? { ...i, date: newDate } : i),
          };
        }
        return c;
      });
      this.updateExtraData(newCategories);
    },
    updateExtraData(newCategories: Category[]) {
      const updatedExtraData = { ...this.extraData, scheduled_items: newCategories };
      this.$emit("update:extraData", updatedExtraData);
      this.$emit("save");
    },
  },
});
</script>

<style scoped>
.gap-4 { gap: 16px; }
.bg-card { background: var(--card-bg, #1e1e1e); color: var(--text-primary, #fff); }
.bg-toolbar { background: var(--toolbar-bg, #2a2a2a); }
.border-b { border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
.border { border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }
.border-dashed { border-style: dashed !important; }
</style>
