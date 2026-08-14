<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="900"
    content-class="modern-alert-dialog-wrapper"
    attach="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="modern-alert-card rounded-xl">
      <v-card-title class="pt-6 px-6 pb-4 d-flex align-center justify-space-between">
        <div class="d-flex flex-column">
          <span class="font-weight-bold" style="font-size: 1.25rem; color: var(--sidebar-text);">Itens Agendados</span>
          <span class="text-caption mt-1" style="color: var(--sidebar-text-secondary); opacity: 0.8;">Gerencie as categorias e mídias agendadas por data</span>
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
      </v-card-title>

      <v-card-text class="px-6 pb-6 pt-0" style="height: 550px; display: flex; overflow: hidden; gap: 16px;">
        <!-- Left Pane: Categories -->
        <div class="categories-pane rounded-xl" style="width: 280px; display: flex; flex-direction: column; background: rgba(var(--v-theme-on-surface), 0.04); border: 1px solid rgba(128,128,128,0.1);">
          <div class="pa-4 border-b d-flex align-center justify-space-between" style="border-bottom-color: rgba(128,128,128,0.1) !important;">
            <span class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">Categorias</span>
            <v-btn
              color="primary"
              icon="mdi-plus"
              variant="flat"
              size="24"
              class="rounded-lg"
              @click="showNewCategoryForm = true"
            >
              <v-icon size="16">
                mdi-plus
              </v-icon>
            </v-btn>
          </div>
          
          <v-list class="bg-transparent flex-grow-1 overflow-y-auto pa-2" density="compact">
            <div v-if="showNewCategoryForm" class="mb-2 d-flex align-center px-2">
              <v-text-field
                v-model="newCategoryName"
                variant="solo"
                flat
                bg-color="rgba(var(--v-theme-on-surface), 0.06)"
                rounded="lg"
                density="compact"
                hide-details
                placeholder="Nome"
                autofocus
                class="modern-input-no-thick flex-grow-1 mr-2"
                @keyup.enter="saveNewCategory"
                @keyup.esc="showNewCategoryForm = false"
              />
              <v-btn
                icon="mdi-check"
                color="primary"
                variant="flat"
                size="28"
                class="rounded-lg"
                @click="saveNewCategory"
              />
            </div>

            <template v-if="categories.length > 0">
              <v-list-item
                v-for="cat in categories"
                :key="cat.id"
                :active="selectedCategoryId === cat.id"
                class="mb-1 rounded-lg"
                :style="{
                  background: selectedCategoryId === cat.id ? 'rgba(var(--v-theme-primary), 0.1)' : 'transparent',
                  color: selectedCategoryId === cat.id ? 'rgb(var(--v-theme-primary))' : 'var(--sidebar-text)'
                }"
                @click="selectedCategoryId = cat.id"
              >
                <template #prepend>
                  <v-icon size="small" :color="selectedCategoryId === cat.id ? 'primary' : 'rgba(128,128,128,0.5)'">
                    mdi-folder
                  </v-icon>
                </template>
                <v-list-item-title class="font-weight-medium text-body-2">
                  {{ cat.name }}
                </v-list-item-title>
                <template #append>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    class="rounded-lg"
                    @click.stop="deleteCategory(cat.id)"
                  />
                </template>
              </v-list-item>
            </template>
            <div v-else-if="!showNewCategoryForm" class="pa-4 text-center text-caption" style="color: var(--sidebar-text-secondary);">
              Nenhuma categoria criada.
            </div>
          </v-list>
        </div>

        <!-- Right Pane: Calendar & Selection -->
        <div class="content-pane flex-grow-1 d-flex flex-column pa-6 rounded-xl" style="background: rgba(var(--v-theme-on-surface), 0.02); border: 1px solid rgba(128,128,128,0.1); overflow-y: auto;">
          <template v-if="selectedCategory">
            <div class="d-flex align-center mb-6">
              <v-avatar
                color="rgba(var(--v-theme-primary), 0.1)"
                size="40"
                rounded="lg"
                class="mr-3"
              >
                <v-icon color="primary" size="20">
                  mdi-folder-open
                </v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
                  {{ selectedCategory.name }}
                </h3>
                <span class="text-caption" style="color: var(--sidebar-text-secondary);">Selecione uma data para agendar a mídia</span>
              </div>
            </div>

            <div class="d-flex" style="gap: 24px;">
              <div class="calendar-container" style="min-width: 320px;">
                <v-date-picker 
                  v-model="selectedDateObj"
                  color="primary"
                  :first-day-of-week="0"
                  class="rounded-xl border"
                  style="border-color: rgba(128,128,128,0.1) !important;"
                  elevation="0"
                  hide-header
                  show-adjacent-months
                />
              </div>

              <div class="schedule-details flex-grow-1 d-flex flex-column">
                <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: var(--sidebar-text);">
                  Arquivo para {{ formattedDate }}
                </h4>
                
                <div v-if="currentScheduledItem" class="current-item-box pa-4 rounded-xl border mb-4" style="background: rgba(var(--v-theme-on-surface), 0.04); border-color: rgba(128,128,128,0.1) !important;">
                  <div class="d-flex align-center">
                    <v-avatar
                      color="rgba(var(--v-theme-primary), 0.1)"
                      size="48"
                      rounded="lg"
                      class="mr-4"
                    >
                      <v-icon size="24" color="primary">
                        mdi-file-video
                      </v-icon>
                    </v-avatar>
                    <div class="flex-grow-1" style="min-width: 0;">
                      <div class="text-body-2 font-weight-bold text-truncate" style="color: var(--sidebar-text);">
                        {{ currentScheduledItem.name }}
                      </div>
                      <div class="text-caption text-truncate" style="color: var(--sidebar-text-secondary);">
                        {{ currentScheduledItem.filePath }}
                      </div>
                    </div>
                    <v-btn
                      class="ml-2 rounded-lg"
                      icon="mdi-delete"
                      variant="flat"
                      color="rgba(var(--v-theme-error), 0.1)"
                      @click="removeScheduledItem"
                    >
                      <v-icon color="error" size="20">
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </div>
                </div>

                <div v-else class="empty-state pa-6 text-center rounded-xl mb-4 d-flex flex-column align-center justify-center flex-grow-1" style="border: 2px dashed rgba(128,128,128,0.2);">
                  <v-icon size="48" color="rgba(128,128,128,0.3)" class="mb-3">
                    mdi-file-hidden
                  </v-icon>
                  <div class="text-body-2 mb-1" style="color: var(--sidebar-text);">
                    Nenhum arquivo agendado
                  </div>
                  <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                    Clique no botão abaixo para escolher uma mídia.
                  </div>
                </div>

                <v-btn
                  block
                  color="primary"
                  variant="flat"
                  class="rounded-lg modern-alert-btn mt-auto"
                  height="48"
                  prepend-icon="mdi-folder-search"
                  @click="selectFile"
                >
                  {{ currentScheduledItem ? 'Trocar Arquivo' : 'Selecionar Arquivo' }}
                </v-btn>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-center justify-center h-100" style="opacity: 0.6;">
              <v-icon size="64" class="mb-4" color="var(--sidebar-text)">
                mdi-calendar-blank
              </v-icon>
              <h3 class="text-h6 font-weight-bold" style="color: var(--sidebar-text);">
                Selecione uma Categoria
              </h3>
              <p class="text-body-2 text-center mt-2" style="color: var(--sidebar-text-secondary); max-width: 250px;">
                Crie ou selecione uma categoria no menu lateral para começar a agendar mídias.
              </p>
            </div>
          </template>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { v4 as uuidv4 } from "uuid";

interface ScheduledItem {
  filePath: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  schedules: Record<string, ScheduledItem>; // key is YYYY-MM-DD
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
      selectedDateObj: [new Date()] as Date[] | Date,
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
    resolvedDate(): Date | null {
      const d = this.selectedDateObj;
      if (!d) return null;
      if (Array.isArray(d)) return d[0] || null;
      return d;
    },
    selectedDateString(): string {
      // YYYY-MM-DD in local timezone
      const d = this.resolvedDate;
      if (!d) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formattedDate(): string {
      const d = this.resolvedDate;
      if (!d) return "";
      return d.toLocaleDateString("pt-BR");
    },
    currentScheduledItem(): ScheduledItem | null {
      if (!this.selectedCategory || !this.selectedDateString) return null;
      return this.selectedCategory.schedules[this.selectedDateString] || null;
    },
  },
  watch: {
    categories: {
      immediate: true,
      handler(newCats) {
        if (newCats.length > 0 && !this.selectedCategoryId) {
          this.selectedCategoryId = newCats[0].id;
        }
      },
    },
  },
  methods: {
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
          id: uuidv4(),
          name: val,
          schedules: {},
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
        { text: "Tem certeza que deseja remover esta categoria?", translate: false },
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
      if (!this.selectedCategory || !this.selectedDateString) return;

      if (window.electronAPI && window.electronAPI.openFileDialog) {
        const filePath = (await window.electronAPI.openFileDialog({
          title: "Selecionar Arquivo para Agendar",
          filters: [
            { name: "Mídia", extensions: ["mp4", "webm", "mkv", "avi", "mp3", "wav", "jpg", "png", "jpeg"] },
            { name: "Todos os Arquivos", extensions: ["*"] },
          ],
        })) as string | null;

        if (filePath) {
          // extrai o nome do arquivo
          const name = filePath.split(/[/\\]/).pop() || "Arquivo";
          
          const updatedSchedules = {
            ...this.selectedCategory.schedules,
            [this.selectedDateString]: { filePath, name },
          };
          
          const updatedCategories = this.categories.map((c) =>
            c.id === this.selectedCategoryId ? { ...c, schedules: updatedSchedules } : c,
          );
          
          this.updateExtraData(updatedCategories);
        }
      }
    },
    removeScheduledItem() {
      if (!this.selectedCategory || !this.selectedDateString) return;
      
      const updatedSchedules = { ...this.selectedCategory.schedules };
      delete updatedSchedules[this.selectedDateString];
      
      const updatedCategories = this.categories.map((c) =>
        c.id === this.selectedCategoryId ? { ...c, schedules: updatedSchedules } : c,
      );
      
      this.updateExtraData(updatedCategories);
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
