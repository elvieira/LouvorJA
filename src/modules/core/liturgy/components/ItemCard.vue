<template>
  <div
    class="liturgy-item-card"
    :class="{
      'item-completed': item.checked,
      'item-category': item.type === 'category',
    }"
    :style="item.type !== 'category' ? { borderLeftColor: item.color || '#999' } : {}"
:draggable="!locked"
    @dragstart="$emit('drag-start', $event, item)"
    @dragend="$emit('drag-end', $event)"
    @dragover.prevent="$emit('drag-over', $event, item)"
    @drop.prevent="$emit('drop', $event, item)"
    @click="onClickAction"
  >
    <!-- Drag handle -->
    <v-icon
      v-if="!locked && item.type !== 'category'"
      size="small"
      class="item-drag-handle"
      @click.stop
    >
      mdi-drag
    </v-icon>

    <!-- Checkbox for completion -->
    <div v-if="item.type !== 'category' && !locked" class="item-check-wrapper" @click.stop>
      <v-checkbox
        :model-value="!!item.checked"
        hide-details
        density="compact"
        color="primary"
        class="item-check"
        @update:model-value="$emit('toggle-check', item)"
      />
    </div>
    <v-icon
      v-else-if="item.type !== 'category' && item.checked"
      size="small"
      color="success"
      class="item-check"
    >
      mdi-check-circle
    </v-icon>

    <!-- Icon -->
    <div class="item-icon-box">
      <v-icon
        :icon="iconForType"
        :color="item.color || 'grey-darken-1'"
        size="small"
      />
    </div>

    <!-- Body -->
    <div class="item-body">
      <div class="item-title">
        {{ item.title }}
      </div>
      <div v-if="item.description || subtitle" class="item-description">
        {{ item.description || subtitle }}
      </div>
    </div>

    <!-- YouTube badge -->
    <div
      v-if="isYouTube"
      class="item-badge"
      style="color: #FF0000; background: rgba(255, 0, 0, 0.08);"
    >
      <v-icon size="x-small" icon="mdi-youtube" />
      YouTube
    </div>

    <!-- Music badge -->
    <div
      v-if="item.type === 'music' && item.subType"
      class="item-badge"
    >
      {{ musicBadge }}
    </div>

    <!-- File badge -->
    <div
      v-if="item.type === 'file' && item.fileMode"
      class="item-badge"
    >
      <v-icon size="x-small" :icon="item.fileMode === 'internal' ? 'mdi-folder' : 'mdi-link'" />
      {{ item.fileMode }}
    </div>

    <!-- Scheduled status badge -->
    <div
      v-if="item.type === 'scheduled' && scheduledStatus"
      class="item-badge"
      :class="scheduledStatus.found ? 'badge-success' : 'badge-warning'"
    >
      <v-icon size="x-small" :icon="scheduledStatus.found ? 'mdi-file-check' : 'mdi-alert'" />
      {{ scheduledStatus.found ? scheduledStatus.name : 'Sem arquivo' }}
    </div>

    <!-- Actions -->
    <div v-if="!locked && item.type !== 'category'" class="item-actions">
      <v-btn
        icon="mdi-content-copy"
        size="small"
        variant="tonal"
        density="comfortable"
        @click.stop="$emit('copy-item', item)"
      />
      <v-btn
        icon="mdi-pencil"
        size="small"
        variant="tonal"
        color="primary"
        density="comfortable"
        @click.stop="$emit('edit', item)"
      />
      <v-btn
        icon="mdi-delete"
        size="small"
        variant="tonal"
        color="error"
        density="comfortable"
        @click.stop="$emit('remove', item)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "LiturgyItemCard",
  props: {
    item: {
      type: Object,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    scheduledStatus: {
      type: Object,
      default: null,
    },
  },
  emits: ["edit", "remove", "toggle-check", "click-action", "copy-item", "drag-start", "drag-end", "drag-over", "drop"],
  computed: {
    iconForType() {
      const map = {
        music: "mdi-music",
        file: "mdi-file",
        category: "mdi-label",
        scheduled: "mdi-calendar-clock",
        url: "mdi-web",
        annotation: "mdi-note-text",
      };
      return map[this.item.type] || "mdi-circle-outline";
    },
    isYouTube() {
      if (this.item.type !== "url" || !this.item.url) return false;
      const url = String(this.item.url).toLowerCase();
      return url.includes("youtube.com") || url.includes("youtu.be");
    },
    musicBadge() {
      if (!this.item.subType) return "";
      const map = {
        hasd: "HASD",
        ja: "JA",
        div: "DIV",
      };
      const label = map[this.item.subType] || this.item.subType.toUpperCase();
      if (this.item.musicId && this.item.musicId > 0) {
        return `${label} ${this.item.musicId}`;
      }
      return label;
    },
    subtitle() {
      if (this.item.type === "music" && this.item.choice) {
        return "Escolher em tempo real";
      }
      if (this.item.type === "file" && this.item.filePath) {
        return this.item.filePath;
      }
      if (this.item.type === "url" && this.item.url) {
        return this.item.url;
      }
      if (this.item.type === "scheduled" && this.scheduledStatus) {
        if (this.scheduledStatus.found) {
          return `${this.scheduledStatus.categoryName}: ${this.scheduledStatus.name}`;
        }
        return `${this.scheduledStatus.categoryName}: sem arquivo para esta data`;
      }
      return null;
    },
  },
  methods: {
    onClickAction() {
      if (this.item.type === "category") return;
      // Toggle check on any click
      this.$emit("toggle-check", this.item);
      // Also trigger action for actionable types
      if (this.item.type !== "annotation") {
        this.$emit("click-action", this.item);
      }
    },
  },
};
</script>
