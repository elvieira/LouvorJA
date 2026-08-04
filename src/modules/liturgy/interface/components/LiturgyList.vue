<template>
  <div class="d-flex flex-column flex-grow-1" style="min-width: 0; min-height: 0; background: var(--main-bg, transparent); border-radius: 20px;">
    <!-- List Header -->
    <div class="px-6 py-4 d-flex align-center justify-space-between">
      <h3 style="font-size: 1.25rem; color: var(--sidebar-text); font-weight: 700;">
        {{ title }}
      </h3>
      <div class="d-flex" style="gap: 12px;">
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
        @update:model-value="$emit('update:items', $event)"
        @end="$emit('drag-end')"
      >
        <template #item="{ element, index }">
          <div
            v-if="element.type === 'category'"
            class="liturgy-category-item"
            :class="{ 'liturgy-item-active': selectedItemIndex === index }"
            @click="$emit('select-item', index)"
          >
            <v-icon class="drag-handle mr-2" size="18" style="cursor: grab; opacity: 0.3;">
              mdi-drag-vertical
            </v-icon>
            <v-icon color="warning" size="18" class="mr-2">
              mdi-tag
            </v-icon>
            <span class="font-weight-black text-uppercase" style="font-size: 0.85rem; letter-spacing: 1px; color: var(--sidebar-text);">
              {{ element.name }}
            </span>
            <v-spacer />
            <v-btn
              icon
              size="x-small"
              variant="text"
              @click.stop="$emit('edit-item', index)"
            >
              <v-icon size="16">
                mdi-pencil
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
              color="error"
              @click.stop="$emit('remove-item', index)"
            >
              <v-icon size="16">
                mdi-close
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

          <div
            v-else
            class="liturgy-item"
            :class="{ 'liturgy-item-active': selectedItemIndex === index }"
            @click="$emit('select-item', index)"
          >
            <v-icon class="drag-handle mr-3" size="18" style="cursor: grab; opacity: 0.3;">
              mdi-drag-vertical
            </v-icon>
            <div class="liturgy-item-number">
              {{ getItemNumber(index) }}
            </div>
            <v-btn
              icon
              size="x-small"
              variant="text"
              :color="element.done ? 'success' : 'grey'"
              class="mr-2"
              @click.stop="$emit('toggle-done', index)"
            >
              <v-icon size="22">
                {{ element.done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
              </v-icon>
            </v-btn>
            <v-icon
              :color="getTypeColor(element.type)"
              size="20"
              class="mr-3"
              :style="element.done ? 'opacity: 0.5;' : ''"
            >
              {{ getTypeIcon(element.type) }}
            </v-icon>
            <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;" :style="element.done ? 'opacity: 0.5; text-decoration: line-through;' : ''">
              <div class="font-weight-bold" style="font-size: 0.95rem; color: var(--sidebar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ element.name ? element.name.replace(/^undefined\s*-\s*/, '') : '' }}
              </div>
              <div v-if="element.subtitle" class="text-caption" style="color: var(--sidebar-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ element.subtitle }}
              </div>
            </div>
            <div class="d-flex align-center" style="gap: 2px; flex-shrink: 0;">
              <v-btn
                v-if="isExecutable(element)"
                icon
                size="x-small"
                variant="text"
                color="primary"
                @click.stop="$emit('execute-item', element)"
              >
                <v-icon size="16">
                  {{ getExecuteIcon(element.type) }}
                </v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  {{ getExecuteTooltip(element.type) }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click.stop="$emit('edit-item', index)"
              >
                <v-icon size="16">
                  mdi-pencil
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
                color="error"
                @click.stop="$emit('remove-item', index)"
              >
                <v-icon size="16">
                  mdi-close
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
        </template>
      </draggable>
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
  },
  emits: [
    "update:items", 
    "select-item", 
    "edit-item", 
    "remove-item", 
    "toggle-done", 
    "execute-item", 
    "clear-all", 
    "add-item",
    "drag-end",
  ],
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
      const map: Record<string, string> = { annotation: "mdi-text", category: "mdi-tag", music: "mdi-music-note", verse: "mdi-book-open-variant", media: "mdi-file-video", link: "mdi-link" };
      return map[type] || "mdi-help";
    },
    getTypeColor(type: string): string {
      const map: Record<string, string> = { annotation: "info", category: "warning", music: "success", verse: "purple", media: "orange", link: "cyan" };
      return map[type] || "grey";
    },
    isExecutable(item: any): boolean {
      return ["music", "verse", "link", "media"].includes(item.type);
    },
    getExecuteIcon(type: string): string {
      if (type === "media" && this.useInternalPlayer) {
        return "mdi-play";
      }
      const map: Record<string, string> = {
        music: "mdi-play",
        verse: "mdi-presentation-play",
        link: "mdi-open-in-new",
        media: "mdi-open-in-new",
      };
      return map[type] || "mdi-play";
    },
    getExecuteTooltip(type: string): string {
      if (type === "media" && this.useInternalPlayer) {
        return this.t("actions.play");
      }
      const map: Record<string, string> = {
        music: "actions.play",
        verse: "actions.project",
        link: "actions.open",
        media: "actions.open",
      };
      return this.t(map[type] || "actions.project");
    },
  },
});
</script>

<style lang="scss" scoped>
.liturgy-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--card-bg);
  border: 1px solid var(--glass-border, transparent);
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-hover);
  }
}

.liturgy-item-active {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.1) !important;
}

.liturgy-category-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin: 16px 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  background: rgba(255, 193, 7, 0.06);
  border: 1px dashed rgba(255, 193, 7, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 193, 7, 0.12);
  }
}

.liturgy-item-number {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-blue);
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0, 151, 215, 0.08);
  margin-right: 12px;
  flex-shrink: 0;
}

.liturgy-ghost {
  opacity: 0.4;
  background: rgba(0, 151, 215, 0.05);
  border-radius: 12px;
}
</style>
