<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    content-class="liturgy-dialog-wrapper scheduled-dialog-wrapper"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card
      class="scheduled-modal-card"
      :class="{ 'compact-mode': isCompactLayout, 'step-categories': currentStep === 1, 'step-files': currentStep === 2, 'wide-mode': !isCompactLayout }"
    >
      <!-- MODAL HEADER -->
      <div class="modal-header d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <v-btn
            v-if="isCompactLayout && currentStep === 2"
            icon
            size="small"
            variant="text"
            class="modal-nav-icon-btn mr-3"
            title="Voltar para categorias"
            @click="currentStep = 1"
          >
            <v-icon size="20">
              mdi-arrow-left
            </v-icon>
          </v-btn>
          <div class="header-icon-box mr-3">
            <v-icon color="#009fe3" size="24">
              mdi-calendar-clock-outline
            </v-icon>
          </div>
          <div>
            <h2 class="modal-title font-weight-bold">
              {{ t('scheduled_items.title') }}
            </h2>
            <p class="modal-subtitle mb-0">
              {{ isCompactLayout && currentStep === 2 && selectedCategory ? selectedCategory.name : t('scheduled_items.subtitle') }}
            </p>
          </div>
        </div>
        <v-btn
          icon
          size="small"
          variant="text"
          class="modal-close-btn mr-1"
          @click="close"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <!-- MAIN CONTENT (RESPONSIVE: TWO PANES OR MASTER-DETAIL STEPS) -->
      <div class="modal-body-container" :class="{ 'compact-container': isCompactLayout }">
        <!-- LEFT PANE: CATEGORIES LIST -->
        <div
          v-if="!isCompactLayout || currentStep === 1"
          class="scheduled-sidebar-pane"
        >
          <!-- Pane Header -->
          <div class="pane-header d-flex align-center justify-space-between px-4 py-3.5">
            <div class="d-flex align-center">
              <v-chip
                size="small"
                color="primary"
                variant="tonal"
                class="font-weight-bold px-2.5"
                style="height: 28px; border-radius: 8px; font-size: 0.8rem;"
              >
                {{ categories.length }} {{ categories.length === 1 ? 'categoria' : 'categorias' }}
              </v-chip>
            </div>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              class="new-category-btn text-none font-weight-bold px-3"
              height="30"
              prepend-icon="mdi-plus"
              @click="openNewCategoryForm"
            >
              {{ t('scheduled_items.new_category') }}
            </v-btn>
          </div>

          <!-- New Category Inline Card -->
          <div v-if="showNewCategoryForm" class="new-category-card pa-4 ma-3 rounded-lg">
            <div class="d-flex align-center mb-3" style="margin-bottom: 14px !important;">
              <v-icon size="18" color="primary" class="mr-2">
                mdi-folder-plus-outline
              </v-icon>
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">Nova Categoria</span>
            </div>
            <v-text-field
              ref="newCategoryInputRef"
              v-model="newCategoryName"
              variant="solo"
              density="comfortable"
              rounded="lg"
              color="primary"
              hide-details
              autofocus
              class="standard-text-input mb-3"
              :placeholder="t('scheduled_items.category_name_placeholder')"
              @keydown.enter="saveNewCategory"
              @keydown.esc="cancelNewCategory"
            />
            <div class="d-flex align-center justify-end mt-3" style="gap: 8px;">
              <v-btn
                variant="text"
                class="text-none rounded-lg font-weight-medium px-4"
                height="38"
                @click="cancelNewCategory"
              >
                {{ t('actions.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="text-none rounded-lg font-weight-bold px-5"
                height="38"
                @click="saveNewCategory"
              >
                {{ t('actions.save') }}
              </v-btn>
            </div>
          </div>

          <!-- Categories Scrollable List -->
          <div class="scheduled-scroll-list flex-grow-1">
            <template v-if="categories.length > 0">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="category-nav-item d-flex align-center cursor-pointer"
                :class="{ active: selectedCategoryId === cat.id }"
                @click="selectCategory(cat.id)"
              >
                <div class="category-item-icon mr-3">
                  <v-icon size="20">
                    {{ selectedCategoryId === cat.id ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                </div>

                <div class="category-item-content flex-grow-1 min-w-0 mr-3">
                  <div class="category-item-name text-truncate">
                    {{ cat.name }}
                  </div>
                  <div class="category-item-count">
                    {{ (cat.items || []).length }} {{ (cat.items || []).length === 1 ? 'arquivo agendado' : 'arquivos agendados' }}
                  </div>
                </div>

                <div class="d-flex align-center flex-shrink-0" style="gap: 6px; margin-right: 4px;">
                  <v-btn
                    color="error"
                    variant="text"
                    size="small"
                    density="comfortable"
                    icon="mdi-trash-can-outline"
                    class="delete-category-btn rounded-lg"
                    title="Excluir Categoria"
                    @click.stop="deleteCategory(cat.id)"
                  />
                  <v-icon
                    v-if="isCompactLayout"
                    size="20"
                    color="var(--sidebar-text-secondary)"
                    class="chevron-icon ml-1"
                  >
                    mdi-chevron-right
                  </v-icon>
                </div>
              </div>
            </template>

            <!-- Empty List State -->
            <div v-else-if="!showNewCategoryForm" class="categories-empty-state pa-6 text-center">
              <v-icon size="36" class="mb-2 opacity-40" color="var(--sidebar-text-secondary)">
                mdi-folder-outline
              </v-icon>
              <div class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">
                {{ t('scheduled_items.no_categories') }}
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANE: FILES & SCHEDULES -->
        <div
          v-if="!isCompactLayout || currentStep === 2"
          class="scheduled-content-pane flex-grow-1 d-flex flex-column"
        >
          <template v-if="selectedCategory">
            <!-- Content Header -->
            <div class="content-header d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center" style="min-width: 0; flex: 1;">
                <div class="category-badge-icon mr-3 flex-shrink-0">
                  <v-icon color="#009fe3" size="22">
                    mdi-folder-open-outline
                  </v-icon>
                </div>
                <div style="min-width: 0;">
                  <h3 class="category-header-title text-truncate">
                    {{ selectedCategory.name }}
                  </h3>
                  <div class="category-header-subtitle text-truncate">
                    {{ (selectedCategory.items || []).length }} {{ (selectedCategory.items || []).length === 1 ? 'arquivo configurado' : 'arquivos configurados' }}
                  </div>
                </div>
              </div>

              <!-- Header Actions: Limpar Tudo & Adicionar -->
              <div class="d-flex align-center flex-shrink-0 ml-3" style="gap: 8px;">
                <v-btn
                  v-if="currentCategoryItems.length > 0"
                  variant="tonal"
                  color="error"
                  rounded="lg"
                  class="text-none font-weight-medium px-3"
                  height="34"
                  size="small"
                  prepend-icon="mdi-trash-can-outline"
                  @click="clearAllCategoryItems"
                >
                  {{ t('actions.clear_all') }}
                </v-btn>

                <v-btn
                  variant="flat"
                  color="primary"
                  rounded="lg"
                  class="text-none font-weight-bold px-3.5"
                  height="34"
                  prepend-icon="mdi-plus"
                  @click="selectFile"
                >
                  {{ t('actions.add') }}
                </v-btn>
              </div>
            </div>

            <!-- Scheduled Files Wrapper -->
            <div class="files-list-wrapper flex-grow-1 d-flex flex-column rounded-lg">
              <!-- Scheduled Files List -->
              <template v-if="currentCategoryItems.length > 0">
                <div class="files-scroll-container">
                  <div
                    v-for="item in currentCategoryItems"
                    :key="item.id"
                    class="scheduled-file-card d-flex align-center"
                  >
                    <!-- File Type Icon -->
                    <div
                      class="file-icon-box mr-3 flex-shrink-0"
                      :style="{ background: `${getFileInfo(item.filePath).color}20` }"
                    >
                      <v-icon size="18" :color="getFileInfo(item.filePath).color">
                        {{ getFileInfo(item.filePath).icon }}
                      </v-icon>
                    </div>

                    <!-- File Details -->
                    <div class="file-details-box flex-grow-1 mr-3" style="min-width: 0; overflow: hidden;">
                      <div class="file-name text-truncate" :title="item.name">
                        {{ item.name }}
                      </div>
                      <div class="file-path text-truncate" :title="item.filePath">
                        {{ item.filePath }}
                      </div>
                    </div>

                    <!-- Date & Actions -->
                    <div class="d-flex align-center file-actions" style="gap: 12px; flex-shrink: 0;">
                      <!-- V-MENU + DATE PICKER -->
                      <v-menu
                        v-model="activeDateMenu[item.id]"
                        :close-on-content-click="false"
                        location="bottom end"
                        transition="scale-transition"
                        offset="4"
                      >
                        <template #activator="{ props: menuProps }">
                          <button
                            type="button"
                            class="scheduled-date-btn d-flex align-center"
                            :class="{ 'has-date': !!item.date, 'active': activeDateMenu[item.id] }"
                            v-bind="menuProps"
                            :title="item.date ? 'Alterar data agendada' : 'Agendar data'"
                          >
                            <v-icon size="17" class="date-icon">
                              {{ item.date ? 'mdi-calendar-check' : 'mdi-calendar-outline' }}
                            </v-icon>
                            <span class="date-text">
                              {{ formatDisplayDate(item.date) }}
                            </span>
                            <v-icon
                              v-if="item.date"
                              size="15"
                              class="clear-date-btn"
                              title="Remover data"
                              @click.stop="clearItemDate(item.id)"
                            >
                              mdi-close-circle
                            </v-icon>
                          </button>
                        </template>

                        <v-card class="date-picker-menu-card rounded-xl elevation-12">
                          <v-locale-provider :locale="currentLocale">
                            <v-date-picker
                              :model-value="parseDate(item.date)"
                              color="primary"
                              hide-header
                              show-adjacent-months
                              width="280"
                              @update:model-value="(val) => onDatePicked(item.id, val)"
                            />
                          </v-locale-provider>
                          <div class="date-picker-footer d-flex align-center justify-space-between">
                            <v-btn
                              v-if="item.date"
                              variant="tonal"
                              size="small"
                              color="error"
                              rounded="lg"
                              class="text-none font-weight-medium px-3.5 date-clear-btn"
                              height="32"
                              @click="clearItemDate(item.id)"
                            >
                              {{ t('actions.clear') }}
                            </v-btn>
                            <v-spacer v-else />
                            <v-btn
                              variant="tonal"
                              size="small"
                              rounded="lg"
                              class="text-none font-weight-medium px-4 close-btn"
                              height="32"
                              @click="activeDateMenu[item.id] = false"
                            >
                              {{ t('actions.close') }}
                            </v-btn>
                          </div>
                        </v-card>
                      </v-menu>

                      <!-- Delete File Button (matching LiturgyList standard) -->
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        class="delete-file-btn"
                        title="Excluir Arquivo"
                        @click="removeScheduledItem(item.id)"
                      >
                        <v-icon size="18">
                          mdi-trash-can-outline
                        </v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Empty Files State -->
              <div v-else class="empty-files-state flex-grow-1 d-flex flex-column align-center justify-center pa-8 text-center">
                <div class="empty-files-icon-box mb-3">
                  <v-icon size="36" color="var(--sidebar-text-secondary)">
                    mdi-file-outline
                  </v-icon>
                </div>
                <h4 class="text-subtitle-1 font-weight-bold mb-1" style="color: var(--sidebar-text);">
                  {{ t('scheduled_items.no_files') }}
                </h4>
                <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); max-width: 320px;">
                  {{ t('scheduled_items.no_files_hint') }}
                </p>
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  class="rounded-lg font-weight-bold px-4 text-none"
                  height="38"
                  @click="selectFile"
                >
                  {{ t('actions.add') }}
                </v-btn>
              </div>
            </div>
          </template>

          <!-- No Category Selected Placeholder -->
          <div v-else class="no-category-selected d-flex flex-column align-center justify-center h-100 pa-8">
            <div class="empty-icon-circle mb-4">
              <v-icon size="40" color="var(--sidebar-text-secondary)">
                mdi-calendar-blank-outline
              </v-icon>
            </div>
            <h3 class="text-h6 font-weight-bold mb-1" style="color: var(--sidebar-text);">
              {{ t('scheduled_items.no_selection_title') }}
            </h3>
            <p class="text-body-2 text-center mb-5" style="color: var(--sidebar-text-secondary); max-width: 320px;">
              {{ t('scheduled_items.no_selection_hint') }}
            </p>
            <v-btn
              v-if="categories.length === 0"
              color="primary"
              variant="flat"
              prepend-icon="mdi-plus"
              class="rounded-lg font-weight-bold px-5 text-none"
              @click="openNewCategoryForm"
            >
              Criar Primeira Categoria
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick } from "vue";
import $snackbar from "@/helpers/ui/Snackbar";
import { getLiturgyFileInfo } from "../../helpers/fileHelper";

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
      type: Object as PropType<{ scheduled_items: Category[]; templates: any[] }>,
      required: true,
    },
  },
  emits: ["update:modelValue", "update:extraData", "save"],
  data() {
    return {
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
      currentStep: 1, // 1: Categorias, 2: Arquivos da Categoria
      selectedCategoryId: null as string | null,
      showNewCategoryForm: false,
      newCategoryName: "",
      activeDateMenu: {} as Record<string, boolean>,
    };
  },
  computed: {
    isCompactLayout(): boolean {
      return this.windowWidth < 1350;
    },
    categories(): Category[] {
      return this.extraData.scheduled_items || [];
    },
    selectedCategory(): Category | undefined {
      return this.categories.find(c => c.id === this.selectedCategoryId);
    },
    currentCategoryItems(): ScheduledItem[] {
      if (!this.selectedCategory) return [];
      const items = this.selectedCategory.items || [];
      return [...items].sort((a, b) => {
        const da = a.date || "9999-99-99";
        const db = b.date || "9999-99-99";
        return da.localeCompare(db);
      });
    },
    currentLocale(): string {
      const loc = (this as any).$i18n?.locale;
      const lang = typeof loc === "object" && loc !== null && "value" in loc ? loc.value : loc;
      return typeof lang === "string" && lang.startsWith("es") ? "es" : "pt";
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.handleResize();
          this.currentStep = 1;
          if (!this.selectedCategoryId && this.categories.length > 0) {
            this.selectedCategoryId = this.categories[0].id;
          }
        }
      },
    },
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
  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.currentStep = 1;
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    close() {
      this.$emit("update:modelValue", false);
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    getFileInfo(filePath?: string) {
      return getLiturgyFileInfo(filePath);
    },
    selectCategory(catId: string) {
      this.selectedCategoryId = catId;
      this.currentStep = 2;
    },
    openNewCategoryForm() {
      this.showNewCategoryForm = true;
      this.newCategoryName = "";
      nextTick(() => {
        const input = (this.$refs.newCategoryInputRef as any)?.$el?.querySelector("input");
        if (input) input.focus();
      });
    },
    cancelNewCategory() {
      this.showNewCategoryForm = false;
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
        this.currentStep = 2;
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
              this.currentStep = 1;
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
            { name: "Todos os Arquivos e Mídias", extensions: ["*"] },
            { name: "Mídias (Áudio / Vídeo)", extensions: ["mp4", "webm", "mkv", "avi", "mov", "wmv", "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"] },
            { name: "Apresentações e Documentos", extensions: ["pptx", "ppt", "ppsx", "pps", "pdf", "key", "odp", "doc", "docx", "txt"] },
            { name: "Imagens", extensions: ["jpg", "png", "jpeg", "webp", "gif", "bmp", "svg"] },
          ],
        })) as string | null;

        if (filePath) {
          const name = filePath.split(/[/\\]/).pop() || "Arquivo";
          
          let newDateObj = new Date();
          const itemsWithDates = (this.selectedCategory.items || []).filter(i => !!i.date);
          if (itemsWithDates.length > 0) {
            const maxDateStr = itemsWithDates.reduce((max, item) => (item.date > max ? item.date : max), itemsWithDates[0].date);
            const parts = maxDateStr.split("-");
            if (parts.length === 3) {
              const maxDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
              if (!isNaN(maxDate.getTime())) {
                maxDate.setDate(maxDate.getDate() + 1);
                newDateObj = maxDate;
              }
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
    clearAllCategoryItems() {
      if (!this.selectedCategory) return;
      this.$alert.yesno(
        { text: this.t("messages.confirm_clear"), translate: false },
        (resp: string) => {
          if (resp === "yes") {
            const newCategories = this.categories.map((c: Category) => {
              if (c.id === this.selectedCategoryId) {
                return { ...c, items: [] };
              }
              return c;
            });
            this.updateExtraData(newCategories);
          }
        },
      );
    },
    parseDate(dateStr?: string): Date | undefined {
      if (!dateStr) return undefined;
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day, 12, 0, 0);
        }
      }
      return undefined;
    },
    formatDateToISO(val: any): string {
      if (!val) return "";
      let d: Date;
      if (val instanceof Date) {
        d = val;
      } else if (typeof val === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        d = new Date(val);
      } else if (typeof val === "number") {
        d = new Date(val);
      } else {
        d = new Date(val);
      }
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatDisplayDate(dateStr?: string): string {
      if (!dateStr) return "dd/mm/aaaa";
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    },
    onDatePicked(itemId: string, val: any) {
      if (!val) return;
      const dateStr = this.formatDateToISO(val);
      if (dateStr) {
        this.updateItemDate(itemId, dateStr);
        this.activeDateMenu[itemId] = false;
      }
    },
    clearItemDate(itemId: string) {
      this.updateItemDate(itemId, "");
      this.activeDateMenu[itemId] = false;
    },
    updateItemDate(itemId: string, newDate: string) {
      if (!this.selectedCategory) return;
      
      if (newDate) {
        const isDateTaken = this.selectedCategory.items?.some(i => i.date === newDate && i.id !== itemId);
        if (isDateTaken) {
          $snackbar.show({ text: this.t("scheduled_items.date_exists_warning"), color: "warning" });
          return;
        }
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

<!-- Global / Teleported overlay styling to respect topbar and fix height -->
<style lang="scss">
.scheduled-dialog-wrapper {
  align-self: flex-start !important;
  margin-top: 84px !important;
  margin-bottom: 24px !important;
  height: calc(100vh - 108px) !important;
  max-height: calc(100vh - 108px) !important;
  min-height: calc(100vh - 108px) !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: calc(100vw - var(--sidebar-width, 280px) - 32px) !important;
}

@media (min-width: 1350px) {
  .scheduled-dialog-wrapper {
    max-width: min(1140px, calc(100vw - var(--sidebar-width, 280px) - 48px)) !important;
  }
}
</style>

<style scoped lang="scss">
.scheduled-modal-card {
  background: var(--modal-bg, var(--card-bg, #202431)) !important;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
  border-radius: 16px !important;
  display: flex !important;
  flex-direction: column !important;
  max-width: 680px !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  max-height: 100% !important;
  flex: 1 1 100% !important;
  margin: 0 auto;
  overflow: hidden;

  &.wide-mode {
    max-width: 1140px !important;
  }
}

// HEADER
.modal-header {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  flex-shrink: 0;
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(0, 159, 227, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  color: var(--sidebar-text, #ffffff);
  font-size: 1.12rem;
  line-height: 1.25;
  margin: 0;
}

.modal-subtitle {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.8rem;
  line-height: 1.25;
}

.modal-nav-icon-btn,
.modal-close-btn {
  color: var(--sidebar-text-secondary, #94a3b8);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(var(--v-theme-on-surface), 0.08);
  }
}

// BODY
.modal-body-container {
  display: flex;
  gap: 20px;
  padding: 20px 24px 24px;
  flex: 1;
  min-height: 0;
  height: calc(100% - 73px);
  overflow: hidden;
  background: rgba(var(--v-theme-on-surface), 0.015);

  &.compact-container {
    padding: 16px 20px 20px;
    gap: 0;
  }
}

// LEFT PANE (SIDEBAR)
.scheduled-sidebar-pane {
  width: 340px;
  min-width: 340px;
  max-width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--ds-surface, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

.pane-header {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  flex-shrink: 0;
  padding: 14px 18px;
}

.pane-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--sidebar-text, #ffffff);
  letter-spacing: 0.01em;
}

.new-category-btn {
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
}

.new-category-card {
  background: rgba(0, 159, 227, 0.08);
  border: 1px solid rgba(0, 159, 227, 0.25);
  flex-shrink: 0;
}

.scheduled-scroll-list {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-height: 0;
  flex: 1;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.25);
    border-radius: 4px;
  }
}

.category-nav-item {
  border-radius: 10px !important;
  padding: 12px 18px;
  transition: all 0.18s ease;
  color: var(--sidebar-text-secondary, #94a3b8);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  background: rgba(var(--v-theme-on-surface), 0.02);
  min-height: 58px;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.06);
    border-color: rgba(var(--v-theme-on-surface), 0.12);
    color: var(--sidebar-text, #ffffff);
  }

  &.active {
    background: rgba(0, 159, 227, 0.12) !important;
    border-color: rgba(0, 159, 227, 0.4) !important;
    color: rgb(var(--v-theme-primary));

    .category-item-icon {
      background: rgba(0, 159, 227, 0.18);
      color: rgb(var(--v-theme-primary));
    }

    .category-item-name {
      color: rgb(var(--v-theme-primary));
      font-weight: 700;
    }

    .category-item-count {
      color: rgba(0, 159, 227, 0.85);
    }
  }
}

.category-item-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.category-item-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--sidebar-text, #ffffff);
  line-height: 1.25;
}

.category-item-count {
  font-size: 0.76rem;
  color: var(--sidebar-text-secondary, #94a3b8);
  line-height: 1.2;
  margin-top: 2px;
}

.delete-category-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  opacity: 0.8;
  margin-right: 6px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background: rgba(var(--v-theme-error), 0.12) !important;
    transform: scale(1.08);
  }
}

.chevron-icon {
  opacity: 0.6;
  transition: transform 0.2s ease;
}

// RIGHT PANE
.scheduled-content-pane {
  background: var(--ds-surface, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  border-radius: 12px;
  padding: 16px 20px 20px;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.content-header {
  flex-shrink: 0;
}

.back-btn {
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  color: var(--sidebar-text, #ffffff);
  background: rgba(var(--v-theme-on-surface), 0.06);

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.12);
  }
}

.category-badge-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(0, 159, 227, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-header-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--sidebar-text, #ffffff);
  line-height: 1.25;
  margin: 0;
}

.category-header-subtitle {
  font-size: 0.8rem;
  color: var(--sidebar-text-secondary, #94a3b8);
  line-height: 1.25;
}

.files-list-wrapper {
  background: var(--card-bg, #202431);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  height: 100%;
  min-height: 0;
  min-width: 0;
  width: 100%;
  flex: 1;
}

.files-scroll-container {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.25);
    border-radius: 4px;
  }
}

.scheduled-file-card {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.04));
  border-radius: 12px !important;
  padding: 12px 16px !important;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.07);
    border-color: var(--border-color, rgba(255, 255, 255, 0.09));
    transform: translateY(-1px);

    .delete-file-btn {
      opacity: 0.85;
    }
  }
}

.file-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1.3;
}

.file-path {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  line-height: 1.25;
  margin-top: 2px;
}

.scheduled-date-btn {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 5px 12px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--sidebar-text-secondary, #94a3b8);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;

  .date-icon {
    color: var(--sidebar-text-secondary, #94a3b8);
    transition: color 0.2s ease;
    flex-shrink: 0;
  }

  .date-text {
    letter-spacing: 0.3px;
  }

  .clear-date-btn {
    opacity: 0.5;
    margin-left: 2px;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      opacity: 1;
      color: rgb(var(--v-theme-error));
      transform: scale(1.15);
    }
  }

  &:hover,
  &.active {
    border-color: rgba(0, 159, 227, 0.5);
    background: rgba(0, 159, 227, 0.08);
    color: var(--sidebar-text, #ffffff);

    .date-icon {
      color: #009fe3;
    }
  }

  &.has-date {
    color: var(--sidebar-text, #ffffff);
    font-weight: 600;

    .date-icon {
      color: #009fe3;
    }
  }
}

.date-picker-menu-card {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12)) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55) !important;
  overflow: hidden;
  width: 280px !important;
  max-width: 280px !important;

  :deep(.v-picker) {
    background: transparent !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  :deep(.v-picker__body) {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    display: flex !important;
    flex-direction: column !important;

    > * {
      width: 100% !important;
      max-width: 100% !important;
    }
  }

  :deep(.v-date-picker) {
    background: transparent !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  :deep(.v-picker-title) {
    display: none !important;
  }

  :deep(.v-date-picker-header) {
    display: none !important;
  }

  :deep(.v-date-picker-controls) {
    height: 42px !important;
    min-height: 42px !important;
    padding: 6px 8px 0 !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  :deep(.v-date-picker-controls__month-btn) {
    width: auto !important;
    min-width: unset !important;
    max-width: none !important;
    height: 32px !important;
    padding: 0 4px 0 8px !important;
    font-size: 0.88rem !important;
    font-weight: 600 !important;
    margin-inline-end: 0 !important;

    .v-btn__content {
      display: inline-block !important;
      text-transform: lowercase !important;

      &::first-letter {
        text-transform: uppercase !important;
      }
    }
  }

  :deep(.v-date-picker-controls__mode-btn) {
    width: 24px !important;
    min-width: 24px !important;
    height: 24px !important;
    padding: 0 !important;
    margin-inline-start: -2px !important;
    opacity: 0.75;

    &:hover {
      opacity: 1;
    }
  }

  :deep(.v-date-picker-controls__month) {
    display: flex !important;
    align-items: center !important;
    gap: 2px !important;

    .v-btn {
      width: 28px !important;
      min-width: 28px !important;
      height: 28px !important;
      padding: 0 !important;
    }
  }

  :deep(.v-date-picker-month) {
    width: 100% !important;
    padding: 0 8px 6px !important;
    min-height: unset !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }

  :deep(.v-date-picker-month__weekday) {
    font-size: 0.72rem !important;
    font-weight: 600 !important;
    height: 24px !important;
    color: var(--sidebar-text-secondary, #94a3b8) !important;
  }

  :deep(.v-date-picker-month__day) {
    width: 32px !important;
    height: 32px !important;
  }

  :deep(.v-date-picker-month__day-btn) {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    font-size: 0.78rem !important;
    font-weight: 500 !important;
    border-radius: 8px !important;
  }

  :deep(.v-date-picker-years) {
    width: 100% !important;
    max-width: 100% !important;
    height: 250px !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    box-sizing: border-box !important;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(128, 128, 128, 0.3);
      border-radius: 4px;
    }
  }

  :deep(.v-date-picker-years__content) {
    width: 100% !important;
    max-width: 100% !important;
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 8px 10px !important;
    padding: 6px 12px 10px !important;
    box-sizing: border-box !important;
    justify-content: stretch !important;
  }

  :deep(.v-date-picker-years__content .v-btn) {
    width: 100% !important;
    height: 36px !important;
    font-size: 0.88rem !important;
    font-weight: 500 !important;
    border-radius: 8px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  :deep(.v-date-picker-months) {
    width: 100% !important;
    max-width: 100% !important;
    height: 250px !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    box-sizing: border-box !important;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(128, 128, 128, 0.3);
      border-radius: 4px;
    }
  }

  :deep(.v-date-picker-months__content) {
    width: 100% !important;
    max-width: 100% !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 8px 12px !important;
    padding: 6px 14px 10px !important;
    box-sizing: border-box !important;
    justify-content: stretch !important;
  }

  :deep(.v-date-picker-months__content .v-btn) {
    width: 100% !important;
    height: 36px !important;
    font-size: 0.86rem !important;
    border-radius: 8px !important;
    padding: 0 !important;
  }

  .date-picker-footer {
    padding: 10px 14px !important;
    border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    background: rgba(var(--v-theme-on-surface), 0.02);
    gap: 8px;

    .date-clear-btn {
      font-size: 0.78rem !important;
    }

    .close-btn {
      color: var(--sidebar-text-secondary, #94a3b8);
      font-size: 0.78rem !important;

      &:hover {
        color: var(--sidebar-text, #ffffff);
      }
    }
  }
}

.delete-file-btn {
  opacity: 0.45;
  transition: opacity 0.2s, color 0.2s, background 0.2s;
  color: var(--sidebar-text-secondary, rgba(var(--v-theme-on-surface), 0.7));
  border-radius: 8px;

  &:hover {
    opacity: 1;
    color: rgb(var(--v-theme-error)) !important;
    background: rgba(var(--v-theme-error), 0.1) !important;
  }
}

// COMPACT / STEP MODE STYLES (Single Pane Full Width)
@mixin scheduled-step-rules {
  &.step-categories {
    .scheduled-content-pane {
      display: none !important;
    }

    .scheduled-sidebar-pane {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      flex: 1;
    }
  }

  &.step-files {
    .scheduled-sidebar-pane {
      display: none !important;
    }

    .scheduled-content-pane {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      flex: 1;
    }
  }
}

.compact-mode {
  @include scheduled-step-rules;
}

@media (max-width: 1349px) {
  .scheduled-modal-card {
    @include scheduled-step-rules;
  }
}

// EMPTY STATES
.empty-files-state {
  opacity: 0.8;
}

.empty-files-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-category-selected {
  opacity: 0.75;
}

.empty-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

// STANDARD TEXT INPUT
:deep(.standard-text-input) {
  .v-field {
    background: var(--card-bg) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(128, 128, 128, 0.18) !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;

    &--focused,
    &--focused:hover {
      border-color: #009fe3 !important;
      box-shadow: 0 4px 12px rgba(0, 159, 227, 0.2) !important;
    }

    .v-field__outline {
      display: none !important;
    }

    .v-field__overlay {
      display: none !important;
    }
  }

  .v-field__input {
    color: var(--sidebar-text) !important;
    font-size: 14px !important;
  }
}

// LIGHT THEME SUPPORT
:root[data-theme="light"],
.v-theme--light {
  .scheduled-modal-card {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12) !important;
  }

  .modal-header {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
  }

  .scheduled-sidebar-pane,
  .scheduled-content-pane {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.06);
  }

  .files-list-wrapper {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.08);
  }

  .category-nav-item {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.06);
    color: #64748b;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.1);
      color: #1e293b;
    }

    &.active {
      background: rgba(0, 159, 227, 0.12) !important;
      border-color: rgba(0, 159, 227, 0.4) !important;
      color: #0284c7;

      .category-item-icon {
        background: rgba(0, 159, 227, 0.2);
        color: #0284c7;
      }

      .category-item-name {
        color: #0284c7;
      }

      .category-item-count {
        color: rgba(2, 132, 199, 0.85);
      }
    }
  }

  .scheduled-file-card {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.07);

    &:hover {
      background: #f8fafc;
      border-color: rgba(0, 0, 0, 0.12);
    }
  }

  .delete-file-btn {
    color: #94a3b8;

    &:hover {
      color: rgb(var(--v-theme-error)) !important;
      background: rgba(var(--v-theme-error), 0.1) !important;
    }
  }

  .modal-nav-icon-btn,
  .modal-close-btn {
    color: #64748b;

    &:hover {
      color: #1e293b;
      background: rgba(0, 0, 0, 0.06);
    }
  }

  .scheduled-date-btn {
    background: #f1f5f9;
    border-color: rgba(0, 0, 0, 0.08);
    color: #475569;

    .date-icon {
      color: #64748b;
    }

    &:hover,
    &.active {
      background: rgba(0, 159, 227, 0.08);
      border-color: #009fe3;
      color: #0284c7;

      .date-icon {
        color: #0284c7;
      }
    }

    &.has-date {
      color: #0f172a;
      background: #f8fafc;
      border-color: rgba(0, 159, 227, 0.35);

      .date-icon {
        color: #009fe3;
      }
    }
  }

  .date-picker-menu-card {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.1) !important;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15) !important;

    .date-picker-footer {
      border-top-color: rgba(0, 0, 0, 0.08);
      background: #fafafa;

      .close-btn {
        color: #64748b;

        &:hover {
          color: #1e293b;
        }
      }
    }
  }

  .modal-title,
  .category-header-title,
  .pane-title,
  .file-name {
    color: #1e293b;
  }

  .modal-subtitle,
  .category-header-subtitle,
  .file-path {
    color: #64748b;
  }

  .standard-text-input :deep(.v-field:not(.v-field--focused)) {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
  }
}
</style>
