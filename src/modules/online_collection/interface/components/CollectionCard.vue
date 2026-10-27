<template>
  <div class="online-collection-card" @click="$emit('click')">
    <div class="card-cover-container">
      <img
        v-if="image && !imgError"
        :src="image"
        loading="lazy"
        :alt="title"
        class="card-cover-img"
        @error="imgError = true"
      />
      <div v-else class="card-cover-fallback d-flex align-center justify-center">
        <v-icon size="44" color="rgba(255, 255, 255, 0.45)">
          mdi-play-circle-outline
        </v-icon>
      </div>

      <!-- Play overlay hover icon -->
      <div class="card-play-overlay">
        <div class="play-btn-circle d-flex align-center justify-center">
          <v-icon size="24" color="white">
            mdi-play
          </v-icon>
        </div>
      </div>

      <!-- Optional bottom badge -->
      <div v-if="badge" class="card-badge">
        <v-icon size="11" class="mr-1">
          mdi-play
        </v-icon>
        <span>{{ badge }}</span>
      </div>
    </div>

    <div class="card-info">
      <h3 class="card-title text-truncate-2">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="card-subtitle text-truncate">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CollectionCard",
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
.online-collection-card {
  width: 100%;
  min-width: 0;
  background: var(--card-bg, #1a2638);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1),
    box-shadow 0.25s cubic-bezier(0.2, 0, 0, 1),
    border-color 0.25s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
    border-color: rgba(0, 159, 227, 0.5);

    .card-cover-img {
      transform: scale(1.05);
    }

    .card-play-overlay {
      opacity: 1;
      .play-btn-circle {
        transform: scale(1);
      }
    }
  }

  .card-cover-container {
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #101c2e 0%, #172a45 100%);

    .card-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.35s ease;
    }

    .card-cover-fallback {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f1c2e 0%, #1e3556 100%);
    }

    .card-play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s ease;

      .play-btn-circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(0, 159, 227, 0.9);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        transform: scale(0.85);
        transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
      }
    }

    .card-badge {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(12, 20, 36, 0.85);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 9px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      z-index: 2;
    }
  }

  .card-info {
    padding: 14px 16px 16px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .card-title {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--sidebar-text);
      line-height: 1.35;
      margin: 0;
    }

    .card-subtitle {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--sidebar-text-secondary);
      margin-top: 4px;
      margin-bottom: 0;
    }
  }
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:root[data-theme="light"],
.v-theme--light {
  .online-collection-card {
    background: #ffffff;
    border-color: var(--border-color, rgba(0, 0, 0, 0.08));
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

    &:hover {
      border-color: var(--accent-blue, #008fd0);
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
    }

    .card-cover-container {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    }

    .card-info {
      .card-title {
        color: var(--sidebar-text, #1e293b);
      }
      .card-subtitle {
        color: var(--sidebar-text-secondary, #64748b);
      }
    }
  }
}
</style>
