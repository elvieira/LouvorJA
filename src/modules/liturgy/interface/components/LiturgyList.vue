<template>
  <div class="d-flex flex-column flex-grow-1" style="min-width: 0; min-height: 0; background: var(--main-bg, transparent); border-radius: 20px; position: relative;">
    <!-- List Header -->
    <div class="px-6 py-4 d-flex align-center justify-space-between">
      <h3 style="font-size: 1.25rem; color: var(--sidebar-text); font-weight: 700;">
        {{ title }}
      </h3>
      <div class="d-flex align-center" style="gap: 12px;">
        <v-btn
          v-if="hasDoneItems"
          variant="tonal"
          color="warning"
          rounded="lg"
          class="text-none font-weight-bold px-4"
          prepend-icon="mdi-restart"
          @click="$emit('reset-checks')"
        >
          {{ t('actions.reset_checks') }}
        </v-btn>

        <v-btn
          v-if="items.length > 0"
          variant="tonal"
          color="error"
          rounded="lg"
          class="text-none font-weight-bold px-4"
          @click="$emit('clear-all')"
        >
          {{ t('actions.clear_all') }}
        </v-btn>

        <v-btn
          variant="flat"
          color="primary"
          rounded="lg"
          class="text-none font-weight-bold px-5"
          prepend-icon="mdi-plus"
          @click="$emit('add-item')"
        >
          {{ t('add_item') }}
        </v-btn>
      </div>
    </div>

    <!-- Drag & Drop List -->
    <div class="flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 0;">
      <div v-if="items.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-8">
        <v-icon size="56" class="mb-3">
          mdi-playlist-plus
        </v-icon>
        <div class="text-body-1 font-weight-medium mb-1">
          {{ t('empty_list') }}
        </div>
        <div class="text-body-2" style="max-width: 260px; text-align: center;">
          {{ t('empty_list_hint') }}
        </div>
      </div>

      <draggable
        v-else
        :model-value="items"
        item-key="id"
        handle=".drag-handle"
        ghost-class="liturgy-ghost"
        animation="200"
        class="liturgy-timeline-container"
        :class="{ 'no-timeline': hideTimeline }"
        @update:model-value="$emit('update:items', $event)"
        @end="$emit('drag-end')"
      >
        <template #item="{ element, index }">
          <div v-show="element.type === 'category' || !isItemCollapsed(index)" class="timeline-row">
            <!-- Timeline Node (Dot & Line) -->
            <div v-if="!hideTimeline" class="timeline-node-wrapper">
              <!-- Category Circle: bolinha diferente que identifica o início de categoria (clean) -->
              <div
                v-if="element.type === 'category'"
                class="timeline-node-category"
                :class="{ 'is-completed': isCategoryComplete(element.id) }"
              >
                <v-tooltip
                  activator="parent"
                  location="left"
                  open-delay="200"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  {{ element.name }}
                </v-tooltip>
              </div>

              <!-- Item Flow Circle: bolinha com estados dinâmicos (concluído, próximo no fluxo, pendente) -->
              <div
                v-else
                class="timeline-node-item"
                :class="`status-${getItemFlowState(element, index)}`"
                @click.stop="$emit('select-item', index)"
              >
                <!-- 1. Que foi concluído: bolinha verde com check -->
                <template v-if="getItemFlowState(element, index) === 'done'">
                  <div class="timeline-circle-done">
                    <v-icon size="10" color="white">
                      mdi-check
                    </v-icon>
                  </div>
                </template>

                <!-- 2. Próximo no fluxo: bolinha pulsante na cor do programa (#0097d7) -->
                <template v-else-if="getItemFlowState(element, index) === 'next'">
                  <div class="timeline-circle-next">
                    <div class="timeline-circle-core" />
                  </div>
                </template>

                <!-- 3. Não concluído ainda: bolinha sutil vazada -->
                <template v-else>
                  <div class="timeline-circle-pending">
                    <div class="timeline-circle-dot" />
                  </div>
                </template>

                <v-tooltip
                  activator="parent"
                  location="left"
                  open-delay="200"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  {{ getItemFlowTooltip(element, index) }}
                </v-tooltip>
              </div>
            </div>

            <!-- Content Area -->
            <div class="timeline-content">
              <!-- Category Block -->
              <div
                v-if="element.type === 'category'"
                class="liturgy-category-card"
              >
                <div class="d-flex align-center w-100 px-4 py-3">
                  <v-icon class="drag-handle mr-2" size="18" style="cursor: grab; opacity: 0.3;">
                    mdi-drag-vertical
                  </v-icon>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    class="mr-2"
                    @click.stop="toggleCategory(element.id)"
                  >
                    <v-icon size="16">
                      {{ collapsedCategories.includes(element.id) ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
                    </v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-delay="300"
                      content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                    >
                      {{ collapsedCategories.includes(element.id) ? t('liturgy_list.expand_category') : t('liturgy_list.collapse_category') }}
                    </v-tooltip>
                  </v-btn>
                  <v-icon color="grey" size="18" class="mr-3">
                    mdi-flag-outline
                  </v-icon>
                  
                  <span class="font-weight-bold text-subtitle-2" style="color: rgba(var(--v-theme-on-surface), 0.9); letter-spacing: 0.5px;">
                    {{ element.name }}
                  </span>
                  
                  <div class="ml-4 category-badge">
                    {{ getItemsCountForCategory(index) }} itens
                  </div>

                  <v-spacer />

                  <div class="d-flex align-center category-actions" style="gap: 4px; flex-shrink: 0;">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('add-item-to-category', element.id)"
                    >
                      <v-icon size="18">
                        mdi-plus
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.add') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('duplicate-item', index)"
                    >
                      <v-icon size="16">
                        mdi-content-copy
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.duplicate') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('edit-item', index)"
                    >
                      <v-icon size="16">
                        mdi-pencil-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.edit') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('remove-item', index)"
                    >
                      <v-icon size="16">
                        mdi-trash-can-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.delete') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Normal Item Block -->
              <div
                v-else
                class="liturgy-item-card"
                :class="{ 
                  'liturgy-item-active': selectedItemIndex === index,
                  'liturgy-item-placeholder': isItemPlaceholder(element)
                }"
                :style="element.color ? `border-left: 3px solid ${element.color}; padding-left: 13px !important;` : ''"
                @click="$emit('select-item', index)"
              >
                <div class="d-flex align-center w-100 px-4 py-3">
                  <v-icon class="drag-handle mr-3" size="18" style="cursor: grab; opacity: 0.3;">
                    mdi-drag-vertical
                  </v-icon>

                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    :color="element.done ? 'success' : 'grey'"
                    class="mr-3"
                    @click.stop="$emit('toggle-done', index)"
                  >
                    <v-icon size="20">
                      {{ element.done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                    </v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-delay="300"
                      content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                    >
                      {{ element.done ? t('liturgy_list.mark_undone') : t('liturgy_list.mark_done') }}
                    </v-tooltip>
                  </v-btn>
                  
                  <div class="item-icon-wrapper mr-4">
                    <v-icon size="18" :color="element.color || 'grey-lighten-1'">
                      {{ getItemIcon(element) }}
                    </v-icon>
                  </div>

                  <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;" :style="element.done ? 'opacity: 0.5; text-decoration: line-through;' : ''">
                    <div class="d-flex align-center">
                      <div class="font-weight-medium" style="font-size: 0.95rem; color: rgba(var(--v-theme-on-surface), 0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ element.name ? element.name.replace(/^undefined\s*-\s*/, '') : '' }}
                      </div>
                      <v-chip
                        v-if="isItemPlaceholder(element)"
                        size="x-small"
                        color="warning"
                        variant="flat"
                        class="ml-2 font-weight-bold px-2"
                        style="height: 18px; font-size: 0.65rem;"
                      >
                        {{ t('liturgy_list.placeholder') }}
                      </v-chip>
                      <v-chip
                        v-if="element.type === 'music'"
                        size="x-small"
                        :color="element.musicMode === 'instrumental' ? 'purple' : 'primary'"
                        variant="tonal"
                        class="ml-2 font-weight-bold px-2"
                        style="height: 18px; font-size: 0.65rem;"
                      >
                        <v-icon start size="11" class="mr-1">
                          {{ element.musicMode === 'instrumental' ? 'mdi-music-note' : 'mdi-account-voice' }}
                        </v-icon>
                        {{ element.musicMode === 'instrumental' ? t('fields.music_mode_instrumental') : t('fields.music_mode_audio') }}
                      </v-chip>
                    </div>
                    <div v-if="element.subtitle && !isItemPlaceholder(element)" class="text-caption" style="color: rgba(var(--v-theme-on-surface), 0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ element.subtitle }}
                    </div>
                    <div v-else-if="isItemPlaceholder(element)" class="text-caption font-weight-medium text-warning" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ t('liturgy_list.placeholder_hint') }}
                    </div>
                  </div>

                  <div class="d-flex align-center item-actions" style="gap: 4px; flex-shrink: 0;">
                    <!-- Botão Reproduzir: Para música e mídia -->
                    <v-btn
                      v-if="(element.type === 'music' || element.type === 'media') && isExecutable(element)"
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('execute-item', element, 'play')"
                    >
                      <v-icon size="18">
                        mdi-play-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.play') }}
                      </v-tooltip>
                    </v-btn>

                    <!-- Botão Visualizar: Exclusivo para músicas (projeção de letra) -->
                    <v-btn
                      v-if="element.type === 'music' && isExecutable(element)"
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('execute-item', element, 'view')"
                    >
                      <v-icon size="18">
                        mdi-eye-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.view') }}
                      </v-tooltip>
                    </v-btn>

                    <!-- Botão Abrir: Para link, item agendado, texto bíblico e arquivo/diretório -->
                    <v-btn
                      v-if="['link', 'scheduled_item', 'verse', 'file'].includes(element.type) && isExecutable(element)"
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('execute-item', element, 'open')"
                    >
                      <v-icon size="18">
                        mdi-open-in-new
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.open') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('duplicate-item', index)"
                    >
                      <v-icon size="16">
                        mdi-content-copy
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.duplicate') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('edit-item', index)"
                    >
                      <v-icon size="16">
                        mdi-pencil-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.edit') }}
                      </v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="$emit('remove-item', index)"
                    >
                      <v-icon size="16">
                        mdi-trash-can-outline
                      </v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        open-delay="300"
                        content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                      >
                        {{ t('actions.delete') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Half-moon Notes Toggle Button -->
    <div
      v-if="hasNotesToggle"
      class="notes-toggle-btn"
      :class="{ 'is-active': showNotes }"
      :title="showNotes ? 'Fechar Anotações' : 'Abrir Anotações'"
      @click="$emit('toggle-notes')"
    >
      <v-icon size="20" color="white" class="chevron-icon flex-shrink-0">
        {{ showNotes ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
      </v-icon>
      <span class="notes-toggle-text">
        {{ showNotes ? 'Fechar' : 'Anotações' }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import draggable from "vuedraggable";

export default defineComponent({
  name: "LiturgyList",
  components: {
    draggable,
  },
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    selectedItemIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    useInternalPlayer: {
      type: Boolean,
      default: false,
    },
    showNotes: {
      type: Boolean,
      default: false,
    },
    hasNotesToggle: {
      type: Boolean,
      default: true,
    },
    hideTimeline: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update:items", 
    "select-item", 
    "edit-item", 
    "duplicate-item",
    "remove-item", 
    "toggle-done", 
    "execute-item", 
    "clear-all", 
    "reset-checks",
    "add-item",
    "add-item-to-category",
    "drag-end",
    "toggle-notes",
  ],
  data() {
    return {
      collapsedCategories: [] as string[],
    };
  },
  computed: {
    hasDoneItems(): boolean {
      return this.items.some((i: any) => i && i.done);
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.liturgy.${text}`);
    },
    getItemNumber(index: number): number | null {
      if (!this.items[index]) return null;
      if (this.items[index].type === "category") return null;
      let count = 0;
      for (let i = 0; i <= index; i++) {
        const item = this.items[i];
        if (item && item.type === "category") {
          count = 0;
        } else {
          count++;
        }
      }
      return count;
    },
    getTypeIcon(type: string): string {
      const map: Record<string, string> = { annotation: "mdi-text", category: "mdi-tag", music: "mdi-music", verse: "mdi-book-open-variant", media: "mdi-file-video", link: "mdi-link", file: "mdi-folder-file-outline", scheduled_item: "mdi-calendar-clock" };
      return map[type] || "mdi-help";
    },
    getItemIcon(element: any): string {
      if (element.type === "media" && element.filePath) {
        const ext = element.filePath.split(".").pop()?.toLowerCase() || "";
        const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"];
        if (audioExts.includes(ext)) return "mdi-headphones";
        return "mdi-video-outline";
      }
      if (element.type === "music") {
        return element.musicMode === "instrumental" ? "mdi-music-note" : "mdi-account-voice";
      }
      return this.getTypeIcon(element.type);
    },
    getTypeColor(type: string): string {
      const map: Record<string, string> = { annotation: "info", category: "warning", music: "indigo", verse: "purple", media: "orange", link: "cyan", file: "blue", scheduled_item: "pink" };
      return map[type] || "grey";
    },
    toggleCategory(id: string) {
      if (this.collapsedCategories.includes(id)) {
        this.collapsedCategories = this.collapsedCategories.filter((c) => c !== id);
      } else {
        this.collapsedCategories.push(id);
      }
    },
    isItemCollapsed(index: number): boolean {
      for (let i = index - 1; i >= 0; i--) {
        if (this.items[i].type === "category") {
          return this.collapsedCategories.includes(this.items[i].id);
        }
      }
      return false;
    },
    getItemsCountForCategory(index: number): number {
      let count = 0;
      for (let i = index + 1; i < this.items.length; i++) {
        if (this.items[i].type === "category") break;
        count++;
      }
      return count;
    },
    hasPlayableItems(index: number): boolean {
      for (let i = index + 1; i < this.items.length; i++) {
        if (this.items[i].type === "category") break;
        if (this.isExecutable(this.items[i])) return true;
      }
      return false;
    },
    playCategory(index: number) {
      // Find first playable item in this category
      for (let i = index + 1; i < this.items.length; i++) {
        if (this.items[i].type === "category") break;
        if (this.isExecutable(this.items[i])) {
          this.$emit("execute-item", this.items[i]);
          return;
        }
      }
    },
    isExecutable(item: any): boolean {
      if (this.isItemPlaceholder(item)) return false;
      return ["music", "verse", "link", "media", "file", "scheduled_item"].includes(item.type);
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
    getItemActionIcon(element: any): string {
      if (element.type === "music" || element.type === "media") {
        return "mdi-play-outline";
      }
      return "mdi-eye-outline";
    },
    getItemActionTooltip(element: any): string {
      if (element.type === "music" || element.type === "media") {
        return this.t("actions.play");
      }
      return this.t("actions.view");
    },
    getExecuteIcon(type: string): string {
      if ((type === "media" || type === "scheduled_item") && this.useInternalPlayer) {
        return "mdi-play";
      }
      const map: Record<string, string> = {
        music: "mdi-play",
        verse: "mdi-presentation-play",
        link: "mdi-open-in-new",
        media: "mdi-open-in-new",
        scheduled_item: "mdi-play",
      };
      return map[type] || "mdi-play";
    },
    getExecuteTooltip(type: string): string {
      if ((type === "media" || type === "scheduled_item") && this.useInternalPlayer) {
        return this.t("actions.play");
      }
      const map: Record<string, string> = {
        music: "actions.play",
        verse: "actions.project",
        link: "actions.open",
        media: "actions.open",
        scheduled_item: "actions.play",
      };
      return this.t(map[type] || "actions.project");
    },
    getItemFlowState(element: any, index: number): "done" | "next" | "pending" {
      if (element.done) {
        return "done";
      }
      if (this.selectedItemIndex === index) {
        return "next";
      }
      const selectedItem = this.selectedItemIndex !== null ? this.items[this.selectedItemIndex] : null;
      const hasActiveSelectedItem = selectedItem && selectedItem.type !== "category" && !selectedItem.done;

      if (!hasActiveSelectedItem) {
        const firstPendingIndex = this.items.findIndex(
          (item) => item && item.type !== "category" && !item.done,
        );
        if (firstPendingIndex === index) {
          return "next";
        }
      }
      return "pending";
    },
    getItemFlowTooltip(element: any, index: number): string {
      const state = this.getItemFlowState(element, index);
      const name = element.name || "";
      if (state === "done") {
        return `${name} (${this.t("liturgy_list.flow_done")})`;
      }
      if (state === "next") {
        const label = this.selectedItemIndex === index
          ? this.t("liturgy_list.flow_active")
          : this.t("liturgy_list.flow_next");
        return `${name} (${label})`;
      }
      return `${name} (${this.t("liturgy_list.flow_pending")})`;
    },
    isCategoryComplete(categoryId: string): boolean {
      const catIndex = this.items.findIndex((i) => i.id === categoryId);
      if (catIndex === -1) return false;
      let hasItems = false;
      for (let i = catIndex + 1; i < this.items.length; i++) {
        if (this.items[i].type === "category") break;
        hasItems = true;
        if (!this.items[i].done) return false;
      }
      return hasItems;
    },
  },
});
</script>

<style lang="scss" scoped>
.liturgy-timeline-container {
  position: relative;
  padding: 16px 24px;
  
  // The vertical timeline line
  &::before {
    content: '';
    position: absolute;
    top: 32px;
    bottom: 32px;
    left: 48px;
    width: 2px;
    background: linear-gradient(
      180deg,
      rgba(var(--v-theme-primary), 0.45) 0%,
      rgba(var(--v-theme-on-surface), 0.15) 20%,
      rgba(var(--v-theme-on-surface), 0.15) 80%,
      rgba(var(--v-theme-primary), 0.35) 100%
    );
    border-radius: 1px;
    z-index: 0;
  }

  &.no-timeline {
    padding-left: 8px;
    &::before {
      display: none;
    }
  }
}

.timeline-row {
  display: flex;
  align-items: stretch;
  position: relative;
  z-index: 1;
  margin-bottom: 4px;
}

.timeline-node-wrapper {
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

/* Bolinha de Categoria (Marco visual clean que identifica o início de uma categoria) */
.timeline-node-category {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px var(--v-theme-surface, #1e212b), 0 0 10px rgba(var(--v-theme-primary), 0.5);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  cursor: default;

  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px var(--v-theme-surface, #1e212b), 0 0 14px rgba(var(--v-theme-primary), 0.8);
  }

  &.is-completed {
    background: #22c55e;
    box-shadow: 0 0 0 3px var(--v-theme-surface, #1e212b), 0 0 10px rgba(34, 197, 94, 0.5);

    &:hover {
      box-shadow: 0 0 0 3px var(--v-theme-surface, #1e212b), 0 0 14px rgba(34, 197, 94, 0.8);
    }
  }
}

/* Bolinhas dos Itens do Fluxo */
.timeline-node-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  user-select: none;

  // 1. Concluído (que foram feitos)
  .timeline-circle-done {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #22c55e;
    border: 2px solid #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
    transition: all 0.25s ease;
  }

  // 2. Próximo no fluxo (na cor do programa #0097d7)
  .timeline-circle-next {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.6);
    animation: timeline-flow-pulse 2s infinite ease-in-out;

    .timeline-circle-core {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgb(var(--v-theme-primary));
      box-shadow: 0 0 6px rgb(var(--v-theme-primary));
    }
  }

  // 3. Não concluído ainda (pendente / futuro)
  .timeline-circle-pending {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(var(--v-theme-on-surface), 0.25);
    background: var(--v-theme-surface, #1e212b);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;

    .timeline-circle-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(var(--v-theme-on-surface), 0.35);
      transition: all 0.25s ease;
    }
  }

  &:hover {
    .timeline-circle-pending {
      border-color: rgb(var(--v-theme-primary));
      box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.4);
      .timeline-circle-dot {
        background: rgb(var(--v-theme-primary));
      }
    }
    .timeline-circle-done {
      transform: scale(1.1);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
    }
  }
}

@keyframes timeline-flow-pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.5), 0 0 2px rgba(var(--v-theme-primary), 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 16px rgba(var(--v-theme-primary), 0.85), 0 0 5px rgba(var(--v-theme-primary), 0.6);
    transform: scale(1.12);
  }
}

.timeline-content {
  flex-grow: 1;
  min-width: 0;
  padding-left: 12px;
  padding-bottom: 8px;
}

/* Category Card */
.liturgy-category-card {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  margin-bottom: 8px;
  transition: all 0.2s ease;
  user-select: none;
  cursor: pointer;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.06);
    .category-actions .v-btn { opacity: 1; }
  }

  .category-badge {
    background: rgba(var(--v-theme-on-surface), 0.08);
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .category-actions .v-btn {
    opacity: 0.4;
    transition: opacity 0.2s;
    color: rgba(var(--v-theme-on-surface), 0.7);
    &:hover { opacity: 1; color: white; }
  }
}

/* Item Card */
.liturgy-item-card {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.03);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
    .item-actions .v-btn { opacity: 1; }
  }

  .item-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-actions .v-btn {
    opacity: 0.3;
    transition: opacity 0.2s;
    color: rgba(var(--v-theme-on-surface), 0.7);
    &:hover { opacity: 1; color: white; }
  }
}

.liturgy-item-active {
  background: rgba(var(--v-theme-primary), 0.15) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.3) !important;
}

.liturgy-ghost {
  opacity: 0.4;
  background: rgba(0, 151, 215, 0.05);
  border-radius: 12px;
}
</style>

<style scoped>
.notes-toggle-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 60px;
  background-color: rgba(var(--v-theme-primary), 0.8);
  border-radius: 30px 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 2px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -2px 0 10px rgba(0,0,0,0.2);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-right: none;
  overflow: hidden;
  white-space: nowrap;
}
.notes-toggle-btn:hover {
  background-color: rgba(var(--v-theme-primary), 1);
  width: 105px;
  padding-left: 8px;
}
.notes-toggle-btn:active {
  background-color: rgba(var(--v-theme-primary), 0.6);
}
.notes-toggle-text {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.notes-toggle-btn:hover .notes-toggle-text {
  opacity: 1;
  transition-delay: 0.1s;
}

.liturgy-item-placeholder {
  border: 1px dashed rgba(var(--v-theme-warning), 0.5) !important;
  background: rgba(var(--v-theme-warning), 0.03) !important;
}
.liturgy-item-placeholder:hover {
  background: rgba(var(--v-theme-warning), 0.08) !important;
  border-color: rgba(var(--v-theme-warning), 0.8) !important;
}
</style>
