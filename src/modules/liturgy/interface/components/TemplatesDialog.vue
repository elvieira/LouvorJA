<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    content-class="liturgy-dialog-wrapper"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card 
      class="rounded-xl"
      style="background: var(--card-bg, #ffffff); box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; max-height: 90vh; min-height: 80vh; max-width: 1100px; width: 100%; margin: 0 auto;"
    >
      <!-- HEADER -->
      <div class="pa-6 pb-4 flex-shrink-0" style="background: rgba(0,0,0,0.02);">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon color="warning" size="32" class="mr-3">
              mdi-view-dashboard-outline
            </v-icon>
            <h2 class="text-h5 font-weight-bold mb-0" style="color: var(--sidebar-text);">
              {{ t('templates.title') }}
            </h2>
          </div>
          <v-btn
            icon
            size="small"
            variant="flat"
            color="rgba(128,128,128,0.1)"
            class="rounded-lg"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <p class="text-caption mb-0" style="color: var(--sidebar-text-secondary); margin-left: 44px;">
          {{ t('templates.subtitle') }}
        </p>
      </div>

      <!-- MAIN CONTENT -->
      <div style="background: var(--main-bg, #f5f5f5); padding: 24px; flex: 1; min-height: 400px; display: flex; gap: 16px; overflow: hidden;">
        <!-- Left Pane: Templates List -->
        <div class="categories-pane rounded-xl flex-shrink-0" style="width: 260px; min-width: 260px; display: flex; flex-direction: column; background: rgba(var(--v-theme-on-surface), 0.04); border: 1px solid rgba(128,128,128,0.1);">
          <div class="pa-4 border-b d-flex align-center justify-space-between" style="border-bottom-color: rgba(128,128,128,0.1) !important;">
            <span class="font-weight-bold text-body-2" style="color: var(--sidebar-text);">{{ t('templates.my_templates') }}</span>
            <v-btn
              color="warning"
              variant="tonal"
              size="small"
              class="rounded-lg text-none px-2"
              height="28"
              @click="showNewTemplateForm = true"
            >
              <v-icon size="16" class="mr-1">
                mdi-plus
              </v-icon>
              {{ t('templates.new') }}
            </v-btn>
          </div>
          
          <v-list class="bg-transparent flex-grow-1 overflow-y-auto pa-2" density="compact">
            <div 
              v-if="showNewTemplateForm" 
              class="category-item d-flex align-center pa-3 mb-2 rounded-lg" 
              style="background: rgba(var(--v-theme-warning), 0.15); border: 1px solid rgba(var(--v-theme-warning), 0.2);"
            >
              <v-icon size="20" class="mr-3 flex-shrink-0" color="warning">
                mdi-plus-box-outline
              </v-icon>
              <input 
                v-model="newTemplateName"
                type="text"
                :placeholder="t('templates.name_placeholder')"
                autofocus
                class="text-body-2 font-weight-medium flex-grow-1 mr-2"
                style="background: transparent; border: none; outline: none; color: rgb(var(--v-theme-warning)); min-width: 0;"
                @keyup.enter="saveNewTemplate"
                @keyup.esc="showNewTemplateForm = false"
              />
              <v-btn
                color="warning"
                variant="flat"
                size="small"
                class="rounded-lg text-none px-3 font-weight-bold ml-1 flex-shrink-0"
                @click="saveNewTemplate"
              >
                {{ t('actions.save') }}
              </v-btn>
            </div>

            <template v-if="templates.length > 0">
              <div
                v-for="tpl in templates"
                :key="tpl.id"
                class="category-item d-flex align-center pa-3 mb-2 rounded-lg cursor-pointer"
                :style="{
                  background: selectedTemplateId === tpl.id ? 'rgba(var(--v-theme-warning), 0.15)' : 'transparent',
                  color: selectedTemplateId === tpl.id ? 'rgb(var(--v-theme-warning))' : 'var(--sidebar-text)',
                  border: selectedTemplateId === tpl.id ? '1px solid rgba(var(--v-theme-warning), 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }"
                @click="selectedTemplateId = tpl.id"
              >
                <v-icon size="20" class="mr-3 flex-shrink-0" :color="selectedTemplateId === tpl.id ? 'warning' : 'rgba(128,128,128,0.5)'">
                  {{ selectedTemplateId === tpl.id ? 'mdi-file-document' : 'mdi-file-document-outline' }}
                </v-icon>
                <span class="text-body-2 font-weight-medium flex-grow-1 text-truncate">
                  {{ tpl.name }}
                </span>
                
                <v-btn
                  v-if="selectedTemplateId === tpl.id"
                  color="rgba(var(--v-theme-error), 0.1)"
                  variant="flat"
                  size="24"
                  class="rounded-md ml-2 flex-shrink-0"
                  @click.stop="confirmDeleteTemplate(tpl.id)"
                >
                  <v-icon size="14" color="error">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </div>
            </template>
            <div v-else-if="!showNewTemplateForm" class="text-center pa-4 text-caption" style="color: var(--sidebar-text-secondary); opacity: 0.7;">
              {{ t('templates.empty_list') }}
            </div>
          </v-list>
        </div>

        <!-- Right Pane: Liturgy Items list for Template -->
        <div class="content-pane flex-grow-1 d-flex flex-column pa-6 rounded-xl" style="background: rgba(var(--v-theme-on-surface), 0.02); border: 1px solid rgba(128,128,128,0.1); overflow-y: hidden;">
          <template v-if="selectedTemplate">
            <div class="d-flex align-center justify-space-between mb-6" style="gap: 16px;">
              <div class="d-flex align-center" style="min-width: 0; flex: 1;">
                <v-avatar
                  color="rgba(var(--v-theme-warning), 0.1)"
                  size="40"
                  rounded="lg"
                  class="mr-3 flex-shrink-0"
                >
                  <v-icon color="warning" size="20">
                    mdi-file-document
                  </v-icon>
                </v-avatar>
                <div style="min-width: 0;">
                  <h3 class="text-h6 font-weight-bold text-truncate" style="color: var(--sidebar-text); line-height: 1.2;">
                    {{ selectedTemplate.name }}
                  </h3>
                  <div class="text-caption text-truncate" style="color: var(--sidebar-text-secondary);">
                    {{ t('templates.template_subtitle') }}
                  </div>
                </div>
              </div>
              
              <div class="d-flex flex-shrink-0" style="gap: 8px;">
                <v-btn
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-check-all"
                  class="rounded-lg text-none px-4 font-weight-bold"
                  @click="applyTemplate"
                >
                  {{ t('templates.apply') }}
                </v-btn>
              </div>
            </div>

            <!-- Items List -->
            <div class="template-list-container flex-grow-1 d-flex flex-column rounded-xl" style="background: var(--main-bg); overflow: hidden; position: relative;">
              <LiturgyList 
                v-model:items="currentTemplateItems"
                :title="''"
                :hide-timeline="true"
                :has-notes-toggle="false"
                :selected-item-index="null"
                :use-internal-player="false"
                :show-notes="false"
                @add-item="$emit('add-item', selectedTemplateId)"
                @edit-item="editItem"
                @duplicate-item="duplicateItem"
                @remove-item="removeItem"
                @clear-all="clearItems"
                @drag-end="saveTemplatesData"
              />
            </div>
          </template>
          
          <div v-else class="d-flex flex-column align-center justify-center h-100 opacity-60">
            <v-icon size="64" class="mb-4" color="rgba(128,128,128,0.5)">
              mdi-file-document-multiple-outline
            </v-icon>
            <h3 class="text-h6 font-weight-bold mb-1" style="color: var(--sidebar-text);">
              {{ t('templates.no_selection_title') }}
            </h3>
            <span class="text-body-2 text-center" style="color: var(--sidebar-text-secondary); max-width: 250px;">
              {{ t('templates.no_selection_hint') }}
            </span>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import LiturgyList from "./LiturgyList.vue";
import { v4 as uuidv4 } from "uuid";

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
  emits: ["update:modelValue", "update-extra-data", "add-item", "edit-item", "apply-template"],
  data() {
    return {
      selectedTemplateId: null as string | null,
      showNewTemplateForm: false,
      newTemplateName: "",
    };
  },
  computed: {
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
        if (this.selectedTemplateId) {
          const newTemplates = this.templates.map((t: Template) => {
            if (t.id === this.selectedTemplateId) {
              return { ...t, items: val };
            }
            return t;
          });
          this.updateExtraData(newTemplates);
        }
      },
    },
  },
  watch: {
    modelValue(val) {
      if (val && !this.selectedTemplateId && this.templates.length > 0) {
        this.selectedTemplateId = this.templates[0].id;
      }
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    updateExtraData(newTemplates: Template[]) {
      this.$emit("update-extra-data", {
        ...this.extraData,
        templates: newTemplates,
      });
    },

    saveTemplatesData() {
      // Just forces update of the list
      this.updateExtraData([...this.templates]);
    },
    saveNewTemplate() {
      const name = this.newTemplateName.trim();
      if (!name) {
        this.showNewTemplateForm = false;
        return;
      }
      
      const newTemplate: Template = {
        id: uuidv4(),
        name,
        items: [],
      };
      
      this.updateExtraData([...this.templates, newTemplate]);
      this.selectedTemplateId = newTemplate.id;
      this.newTemplateName = "";
      this.showNewTemplateForm = false;
    },
    confirmDeleteTemplate(id: string) {
      this.$alert.yesno({
        text: this.t("templates.confirm_delete"),
        translate: false,
      }, (res: string) => {
        if (res === "yes") {
          const newTemplates = this.templates.filter((t: Template) => t.id !== id);
          this.updateExtraData(newTemplates);
          if (this.selectedTemplateId === id) {
            this.selectedTemplateId = null;
          }
        }
      });
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
      const item = this.selectedTemplate.items[index];
      if (!item) return;
      const duplicated = JSON.parse(JSON.stringify(item));
      duplicated.id = uuidv4();
      
      const newItems = [...this.selectedTemplate.items];
      newItems.splice(index + 1, 0, duplicated);
      this.currentTemplateItems = newItems;
    },
    removeItem(index: number) {
      if (!this.selectedTemplate) return;
      this.$alert.yesno({
        text: this.t("messages.confirm_delete"),
        translate: false,
      }, (res: string) => {
        if (res === "yes") {
          const newItems = [...this.selectedTemplate!.items];
          newItems.splice(index, 1);
          this.currentTemplateItems = newItems;
        }
      });
    },
    clearItems() {
      if (!this.selectedTemplate) return;
      this.$alert.yesno({
        text: this.t("messages.confirm_clear"),
        translate: false,
      }, (res: string) => {
        if (res === "yes") {
          this.currentTemplateItems = [];
        }
      });
    },
    applyTemplate() {
      if (!this.selectedTemplate) return;
      this.$emit("apply-template", this.selectedTemplate);
      this.$emit("update:modelValue", false);
    },
  },
});
</script>
