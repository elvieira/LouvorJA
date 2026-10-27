<template>
  <div class="online-list-row d-flex align-center" @click="$emit('click')">
    <div class="row-thumb-container flex-shrink-0">
      <img
        v-if="image && !imgError"
        :src="image"
        loading="lazy"
        :alt="title"
        class="row-thumb-img"
        @error="imgError = true"
      />
      <div v-else class="row-thumb-fallback d-flex align-center justify-center">
        <v-icon size="24" color="rgba(255, 255, 255, 0.45)">
          mdi-play-circle-outline
        </v-icon>
      </div>
      <div class="row-play-overlay d-flex align-center justify-center">
        <v-icon size="20" color="white">
          mdi-play
        </v-icon>
      </div>
    </div>

    <div class="row-content flex-grow-1 min-w-0 mx-4">
      <h4 class="row-title text-truncate">
        {{ title }}
      </h4>
      <p v-if="subtitle" class="row-subtitle text-truncate mb-0">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="badge" class="row-badge-pill mr-3 flex-shrink-0">
      <v-icon size="11" class="mr-1">
        mdi-play
      </v-icon>
      <span>{{ badge }}</span>
    </div>

    <v-icon size="20" class="row-arrow flex-shrink-0" color="var(--sidebar-text-secondary)">
      mdi-chevron-right
    </v-icon>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CollectionListRow",
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
    },
  },
  emits: ["click"],
  data() {
    return {
      imgError: false,
    };
  },
  watch: {
    image() {
      this.imgError = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.online-list-row {
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  background: transparent;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--sidebar-hover, rgba(255, 255, 255, 0.05));

    .row-thumb-img {
      transform: scale(1.04);
    }

    .row-play-overlay {
      opacity: 1;
    }

    .row-arrow {
      color: var(--accent-blue, #009FE3) !important;
      transform: translateX(2px);
    }
  }

  .row-thumb-container {
    width: 110px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #101c2e 0%, #172a45 100%);

    .row-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.25s ease;
    }

    .row-thumb-fallback {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f1c2e 0%, #1e3556 100%);
    }

    .row-play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  .row-content {
    .row-title {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--sidebar-text);
      line-height: 1.35;
      margin: 0;
    }

    .row-subtitle {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--sidebar-text-secondary);
      margin-top: 3px;
    }
  }

  .row-badge-pill {
    background: rgba(12, 20, 36, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 9px;
    display: flex;
    align-items: center;
  }

  .row-arrow {
    transition: transform 0.2s ease, color 0.2s ease;
  }
}

:root[data-theme="light"],
.v-theme--light {
  .online-list-row {
    border-bottom-color: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 155, 226, 0.06);
    }

    .row-thumb-container {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    }

    .row-badge-pill {
      background: #e2e8f0;
      color: #334155;
      border-color: rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
