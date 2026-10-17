<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    content-class="liturgy-dialog-wrapper templates-dialog-wrapper"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card
      class="templates-modal-card"
      :class="{ 'compact-mode': isCompactLayout, 'step-templates': currentStep === 1, 'step-detail': currentStep === 2, 'wide-mode': !isCompactLayout }"
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
            title="Voltar para templates"
            @click="currentStep = 1"
          >
            <v-icon size="20">
              mdi-arrow-left
            </v-icon>
          </v-btn>
          <div class="header-icon-box mr-3">
            <v-icon color="#f59e0b" size="24">
              mdi-view-dashboard-outline
            </v-icon>
          </div>
          <div>
            <h2 class="modal-title font-weight-bold">
              {{ t('templates.title') }}
            </h2>
            <p class="modal-subtitle mb-0">
              {{ isCompactLayout && currentStep === 2 && selectedTemplate ? selectedTemplate.name : t('templates.subtitle') }}
            </p>
          </div>
        </div>
        <v-btn
          icon
          size="small"
          variant="text"
          class="modal-close-btn mr-1"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <!-- MAIN CONTENT (RESPONSIVE: TWO PANES OR MASTER-DETAIL STEPS) -->
      <div class="modal-body-container" :class="{ 'compact-container': isCompactLayout }">
        <!-- LEFT PANE: TEMPLATES LIST -->
        <div
          v-if="!isCompactLayout || currentStep === 1"
          class="templates-sidebar-pane"
        >
          <!-- Pane Header -->
          <div class="pane-header d-flex align-center justify-space-between px-4 py-3.5">
            <div class="d-flex align-center">
              <v-chip
                size="small"
                color="warning"
                variant="tonal"
                class="font-weight-bold px-2.5"
                style="height: 28px; border-radius: 8px; font-size: 0.8rem;"
              >
                {{ templates.length }} {{ templates.length === 1 ? 'template' : 'templates' }}
              </v-chip>
            </div>
            <v-btn
              color="#f59e0b"
              variant="tonal"
              size="small"
              class="new-template-btn text-none px-3"
              height="30"
              prepend-icon="mdi-plus"
              @click="openNewTemplateForm"
            >
              {{ t('templates.new') }}
            </v-btn>
          </div>

          <!-- New Template Inline Card -->
          <div v-if="showNewTemplateForm" class="new-template-card pa-4 ma-3 rounded-lg">
            <div class="d-flex align-center mb-3" style="margin-bottom: 14px !important;">
              <v-icon size="18" color="#f59e0b" class="mr-2">
                mdi-plus-box-outline
              </v-icon>
              <span class="text-caption font-weight-bold" style="color: var(--sidebar-text);">Novo Template</span>
            </div>
            <v-text-field
              ref="newTemplateInputRef"
              v-model="newTemplateName"
              variant="solo"
              density="comfortable"
              rounded="lg"
              color="warning"
              hide-details
              autofocus
              class="standard-text-input mb-3"
              :placeholder="t('templates.name_placeholder')"
              @keydown.enter="saveNewTemplate"
              @keydown.esc="cancelNewTemplate"
            />
            <div class="d-flex align-center justify-end mt-3" style="gap: 8px;">
              <v-btn
                variant="text"
                class="text-none rounded-lg font-weight-medium px-4"
                height="38"
                @click="cancelNewTemplate"
              >
                {{ t('actions.cancel') }}
              </v-btn>
              <v-btn
                color="#f59e0b"
                variant="flat"
                class="text-none rounded-lg font-weight-bold px-5"
                height="38"
                @click="saveNewTemplate"
              >
                {{ t('actions.save') }}
              </v-btn>
            </div>
          </div>

          <!-- Templates Scrollable List -->
          <div class="templates-scroll-list flex-grow-1">
            <template v-if="templates.length > 0">
              <div
                v-for="tpl in templates"
                :key="tpl.id"
                class="template-nav-item d-flex align-center cursor-pointer"
                :class="{ active: selectedTemplateId === tpl.id }"
                @click="selectTemplate(tpl.id)"
              >
                <div class="template-item-icon mr-3">
                  <v-icon size="20">
                    {{ selectedTemplateId === tpl.id ? 'mdi-file-document' : 'mdi-file-document-outline' }}
                  </v-icon>
                </div>

                <div class="template-item-content flex-grow-1 min-w-0 mr-3">
                  <div class="template-item-name text-truncate">
                    {{ tpl.name }}
                  </div>
                  <div class="template-item-count">
                    {{ (tpl.items || []).length }} {{ (tpl.items || []).length === 1 ? 'item' : 'itens' }}
                  </div>
                </div>

                <div class="d-flex align-center flex-shrink-0" style="gap: 6px; margin-right: 4px;">
                  <v-btn
                    color="error"
                    variant="text"
                    size="small"
                    density="comfortable"
                    icon="mdi-trash-can-outline"
                    class="delete-template-btn rounded-lg"
                    title="Excluir Template"
                    @click.stop="confirmDeleteTemplate(tpl.id)"
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
            <div v-else-if="!showNewTemplateForm" class="templates-empty-state pa-6 text-center">
              <v-icon size="36" class="mb-2 opacity-40" color="var(--sidebar-text-secondary)">
                mdi-folder-outline
              </v-icon>
              <div class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">
                {{ t('templates.empty_list') }}
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANE: TEMPLATE DETAIL & LITURGY LIST -->
        <div
          v-if="!isCompactLayout || currentStep === 2"
          class="templates-content-pane flex-grow-1 d-flex flex-column"
        >
          <template v-if="selectedTemplate">
            <!-- Content Header -->
            <div class="content-header d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center" style="min-width: 0; flex: 1;">
                <div class="template-badge-icon mr-3 flex-shrink-0">
                  <v-icon color="#f59e0b" size="22">
                    mdi-file-document-edit-outline
                  </v-icon>
                </div>
                <div style="min-width: 0;">
                  <h3 class="template-header-title text-truncate">
                    {{ selectedTemplate.name }}
                  </h3>
                  <div class="template-header-subtitle text-truncate">
                    {{ (selectedTemplate.items || []).length }} {{ (selectedTemplate.items || []).length === 1 ? 'item configurado' : 'itens configurados' }}
                  </div>
                </div>
              </div>

              <!-- Apply Action Button -->
              <div class="d-flex align-center flex-shrink-0" style="gap: 10px;">
                <v-btn
                  color="#f59e0b"
                  variant="flat"
                  prepend-icon="mdi-check-all"
                  class="apply-template-btn rounded-lg font-weight-bold px-4"
                  height="34"
                  @click="applyTemplate"
                >
                  {{ t('templates.apply') }}
                </v-btn>
              </div>
            </div>

            <!-- Embedded Liturgy List Wrapper -->
            <div class="template-list-wrapper flex-grow-1 d-flex flex-column rounded-lg">
              <LiturgyList
                v-model:items="currentTemplateItems"
                :title="''"
                :hide-timeline="true"
                :has-notes-toggle="false"
                :selected-item-index="null"
                :use-internal-player="false"
                :show-notes="false"
                :is-template-mode="true"
                @add-item="$emit('add-item', selectedTemplateId)"
                @add-item-to-category="(catId) => $emit('add-item-to-category', { templateId: selectedTemplateId, categoryId: catId })"
                @edit-item="editItem"
                @duplicate-item="duplicateItem"
                @remove-item="removeItem"
                @clear-all="clearItems"
                @drag-end="saveTemplatesData"
              />
            </div>
          </template>

          <!-- No Template Selected Placeholder -->
          <div v-else class="no-template-selected d-flex flex-column align-center justify-center h-100 pa-8">
            <div class="empty-icon-circle mb-4">
              <v-icon size="40" color="var(--sidebar-text-secondary)">
                mdi-view-dashboard-variant-outline
              </v-icon>
            </div>
            <h3 class="text-h6 font-weight-bold mb-1" style="color: var(--sidebar-text);">
              {{ t('templates.no_selection_title') }}
            </h3>
            <p class="text-body-2 text-center mb-5" style="color: var(--sidebar-text-secondary); max-width: 320px;">
              {{ t('templates.no_selection_hint') }}
            </p>
            <v-btn
              v-if="templates.length === 0"
              color="#f59e0b"
              variant="flat"
              prepend-icon="mdi-plus"
              class="rounded-lg font-weight-bold px-5 text-none"
              @click="openNewTemplateForm"
            >
              Criar Primeiro Template
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick } from "vue";
import LiturgyList from "./LiturgyList.vue";

interface Template {
  id: string;
  name: string;
  items: any[];
}

export default defineComponent({
  name: "TemplatesDialog",
  components: {
    LiturgyList,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    extraData: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  emits: ["update:modelValue", "update-extra-data", "add-item", "add-item-to-category", "edit-item", "apply-template"],
  data() {
    return {
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
      currentStep: 1, // 1: Templates, 2: Detalhes do Template
      selectedTemplateId: null as string | null,
      showNewTemplateForm: false,
      newTemplateName: "",
    };
  },
  computed: {
    isCompactLayout(): boolean {
      return this.windowWidth < 1350;
    },
    templates(): Template[] {
      return this.extraData?.templates || [];
    },
    selectedTemplate(): Template | undefined {
      return this.templates.find((t: Template) => t.id === this.selectedTemplateId);
    },
    currentTemplateItems: {
      get(): any[] {
        return this.selectedTemplate ? this.selectedTemplate.items : [];
      },
      set(val: any[]) {
        this.updateTemplateItems(val);
      },
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.handleResize();
          this.currentStep = 1;
          if (!this.selectedTemplateId && this.templates.length > 0) {
            this.selectedTemplateId = this.templates[0].id;
          }
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
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    selectTemplate(templateId: string) {
      this.selectedTemplateId = templateId;
      this.currentStep = 2;
    },
    openNewTemplateForm() {
      this.showNewTemplateForm = true;
      this.newTemplateName = "";
      nextTick(() => {
        const input = (this.$refs.newTemplateInputRef as any)?.$el?.querySelector("input");
        if (input) input.focus();
      });
    },
    cancelNewTemplate() {
      this.showNewTemplateForm = false;
      this.newTemplateName = "";
    },
    updateExtraData(newTemplates: Template[]) {
      this.$emit("update-extra-data", {
        ...this.extraData,
        templates: newTemplates,
      });
    },
    updateTemplateItems(items: any[]) {
      if (!this.selectedTemplateId) return;
      const newTemplates = this.templates.map((t: Template) => {
        if (t.id === this.selectedTemplateId) {
          return { ...t, items };
        }
        return t;
      });
      if (this.selectedTemplate) {
        this.selectedTemplate.items = items;
      }
      this.updateExtraData(newTemplates);
    },
    saveTemplatesData() {
      if (this.selectedTemplate) {
        this.updateTemplateItems(this.selectedTemplate.items);
      }
    },
    saveNewTemplate() {
      const name = this.newTemplateName.trim();
      if (!name) {
        this.showNewTemplateForm = false;
        return;
      }

      const newTemplate: Template = {
        id: crypto.randomUUID(),
        name,
        items: [],
      };

      this.updateExtraData([...this.templates, newTemplate]);
      this.selectedTemplateId = newTemplate.id;
      this.newTemplateName = "";
      this.showNewTemplateForm = false;
      if (this.isCompactLayout) {
        this.currentStep = 2;
      }
    },
    confirmDeleteTemplate(id: string) {
      this.$alert.yesno(
        {
          text: this.t("templates.confirm_delete"),
          translate: false,
        },
        (res: string) => {
          if (res === "yes") {
            const newTemplates = this.templates.filter((t: Template) => t.id !== id);
            this.updateExtraData(newTemplates);
            if (this.selectedTemplateId === id) {
              this.selectedTemplateId = newTemplates.length > 0 ? newTemplates[0].id : null;
              if (this.isCompactLayout) {
                this.currentStep = 1;
              }
            }
          }
        },
      );
    },
    editItem(index: number) {
      if (!this.selectedTemplate) return;
      const item = this.selectedTemplate.items[index];
      if (item) {
        this.$emit("edit-item", { item, index, templateId: this.selectedTemplateId });
      }
    },
    duplicateItem(index: number) {
      if (!this.selectedTemplate) return;
      const original = this.selectedTemplate.items[index];
      if (!original) return;

      if (original.type === "category") {
        let endIndex = index + 1;
        while (endIndex < this.selectedTemplate.items.length && this.selectedTemplate.items[endIndex].type !== "category") {
          endIndex++;
        }
        const itemCount = endIndex - (index + 1);

        if (itemCount > 0) {
          this.$alert.show(
            {
              title: this.t("messages.duplicate_category_title"),
              text: this.t("messages.duplicate_category_text"),
              translate: false,
              buttons: [
                { text: "modules.liturgy.actions.cancel", color: "white", variant: "tonal", value: "cancel" },
                { text: "modules.liturgy.messages.duplicate_category_only", color: "warning", variant: "tonal", value: "category_only" },
                { text: "modules.liturgy.messages.duplicate_category_all", color: "primary", variant: "flat", value: "all" },
              ],
            },
            (resp: any) => {
              if (resp === "all") {
                const itemsToDuplicate = this.selectedTemplate!.items.slice(index, endIndex);
                const newItems = itemsToDuplicate.map((item: any) => ({
                  ...JSON.parse(JSON.stringify(item)),
                  id: crypto.randomUUID(),
                  done: false,
                }));
                const list = [...this.selectedTemplate!.items];
                list.splice(endIndex, 0, ...newItems);
                this.updateTemplateItems(list);
              } else if (resp === "category_only") {
                const newCategory = {
                  ...JSON.parse(JSON.stringify(original)),
                  id: crypto.randomUUID(),
                };
                const list = [...this.selectedTemplate!.items];
                list.splice(endIndex, 0, newCategory);
                this.updateTemplateItems(list);
              }
            },
          );
          return;
        }

        const newCategory = {
          ...JSON.parse(JSON.stringify(original)),
          id: crypto.randomUUID(),
        };
        const list = [...this.selectedTemplate.items];
        list.splice(index + 1, 0, newCategory);
        this.updateTemplateItems(list);
        return;
      }

      const duplicated = JSON.parse(JSON.stringify(original));
      duplicated.id = crypto.randomUUID();
      const newItems = [...this.selectedTemplate.items];
      newItems.splice(index + 1, 0, duplicated);
      this.updateTemplateItems(newItems);
    },
    removeItem(index: number) {
      if (!this.selectedTemplate) return;
      const original = this.selectedTemplate.items[index];
      if (!original) return;

      if (original.type === "category") {
        let endIndex = index + 1;
        while (endIndex < this.selectedTemplate.items.length && this.selectedTemplate.items[endIndex].type !== "category") {
          endIndex++;
        }
        const itemCount = endIndex - (index + 1);

        if (itemCount > 0) {
          this.$alert.show(
            {
              title: this.t("messages.confirm_delete_category_title"),
              text: this.t("messages.confirm_delete_category_text"),
              translate: false,
              buttons: [
                { text: "modules.liturgy.actions.cancel", color: "white", variant: "tonal", value: "cancel" },
                { text: "modules.liturgy.messages.delete_category_only", color: "warning", variant: "tonal", value: "category_only" },
                { text: "modules.liturgy.messages.delete_category_all", color: "error", variant: "flat", value: "all" },
              ],
            },
            (resp: any) => {
              if (resp === "all") {
                const countToDelete = endIndex - index;
                const list = [...this.selectedTemplate!.items];
                list.splice(index, countToDelete);
                this.updateTemplateItems(list);
              } else if (resp === "category_only") {
                const list = [...this.selectedTemplate!.items];
                list.splice(index, 1);
                this.updateTemplateItems(list);
              }
            },
          );
          return;
        }
      }

      this.$alert.yesno(
        {
          text: this.t("messages.confirm_delete"),
          translate: false,
        },
        (res: string) => {
          if (res === "yes") {
            const newItems = [...this.selectedTemplate!.items];
            newItems.splice(index, 1);
            this.updateTemplateItems(newItems);
          }
        },
      );
    },
    clearItems() {
      if (!this.selectedTemplate) return;
      this.$alert.yesno(
        {
          text: this.t("messages.confirm_clear"),
          translate: false,
        },
        (res: string) => {
          if (res === "yes") {
            this.updateTemplateItems([]);
          }
        },
      );
    },
    applyTemplate() {
      if (!this.selectedTemplate) return;
      this.$emit("apply-template", this.selectedTemplate);
      this.$emit("update:modelValue", false);
    },
  },
});
</script>

<!-- Global / Teleported overlay styling to respect topbar and fix height -->
<style lang="scss">
.templates-dialog-wrapper {
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
  .templates-dialog-wrapper {
    max-width: min(1140px, calc(100vw - var(--sidebar-width, 280px) - 48px)) !important;
  }
}
</style>

<style scoped lang="scss">
.templates-modal-card {
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
  background: rgba(245, 158, 11, 0.12);
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
.templates-sidebar-pane {
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

.new-template-btn {
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
}

.new-template-card {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  flex-shrink: 0;
}

.templates-scroll-list {
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

.template-nav-item {
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
    background: rgba(245, 158, 11, 0.12) !important;
    border-color: rgba(245, 158, 11, 0.4) !important;
    color: #f59e0b;

    .template-item-icon {
      background: rgba(245, 158, 11, 0.18);
      color: #f59e0b;
    }

    .template-item-name {
      color: #f59e0b;
      font-weight: 700;
    }

    .template-item-count {
      color: rgba(245, 158, 11, 0.85);
    }
  }
}

.template-item-icon {
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

.template-item-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--sidebar-text, #ffffff);
  line-height: 1.25;
}

.template-item-count {
  font-size: 0.76rem;
  color: var(--sidebar-text-secondary, #94a3b8);
  line-height: 1.2;
  margin-top: 2px;
}

.delete-template-btn {
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
.templates-content-pane {
  background: var(--ds-surface, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
  border-radius: 12px;
  padding: 16px 20px 20px;
  overflow: hidden;
  height: 100%;
  min-height: 0;
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

.template-badge-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-header-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--sidebar-text, #ffffff);
  line-height: 1.25;
  margin: 0;
}

.template-header-subtitle {
  font-size: 0.8rem;
  color: var(--sidebar-text-secondary, #94a3b8);
  line-height: 1.25;
}

.apply-template-btn {
  text-transform: none;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25) !important;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35) !important;
  }
}

.template-list-wrapper {
  background: var(--card-bg, #202431);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  height: 100%;
  min-height: 0;
  flex: 1;
}

// COMPACT / STEP MODE STYLES
@mixin templates-step-rules {
  &.step-templates {
    .templates-content-pane {
      display: none !important;
    }

    .templates-sidebar-pane {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      flex: 1;
    }
  }

  &.step-detail {
    .templates-sidebar-pane {
      display: none !important;
    }

    .templates-content-pane {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      flex: 1;
    }
  }
}

.compact-mode {
  @include templates-step-rules;
}

@media (max-width: 1349px) {
  .templates-modal-card {
    @include templates-step-rules;
  }
}

// EMPTY STATE
.no-template-selected {
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
      border-color: #f59e0b !important;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2) !important;
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
  .templates-modal-card {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12) !important;
  }

  .modal-header {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
  }

  .templates-sidebar-pane,
  .templates-content-pane {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.06);
  }

  .template-list-wrapper {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.08);
  }

  .template-nav-item {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.06);
    color: #64748b;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.1);
      color: #1e293b;
    }

    &.active {
      background: rgba(245, 158, 11, 0.12) !important;
      border-color: rgba(245, 158, 11, 0.4) !important;
      color: #d97706;

      .template-item-icon {
        background: rgba(245, 158, 11, 0.2);
        color: #d97706;
      }

      .template-item-name {
        color: #d97706;
      }

      .template-item-count {
        color: rgba(217, 119, 6, 0.85);
      }
    }
  }

  .back-btn {
    color: #1e293b;
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
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

  .modal-title,
  .template-header-title,
  .pane-title {
    color: #1e293b;
  }

  .modal-subtitle,
  .template-header-subtitle {
    color: #64748b;
  }

  .standard-text-input :deep(.v-field:not(.v-field--focused)) {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
  }
}
</style>
