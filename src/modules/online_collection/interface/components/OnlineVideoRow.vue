<template>
  <div
    class="online-video-row d-flex align-center"
    :class="{ 'video-playing-active': isPlaying }"
    @click="$emit('play', video)"
  >
    <!-- Index number -->
    <div class="video-index font-tabular flex-shrink-0">
      <span v-if="!isPlaying">{{ index }}</span>
      <v-icon
        v-else
        size="16"
        color="primary"
        class="playing-pulse-icon"
      >
        mdi-volume-high
      </v-icon>
    </div>

    <!-- 16:9 Thumbnail -->
    <div class="video-thumb-container flex-shrink-0">
      <img
        v-if="video.image && !imgError"
        :src="video.image"
        loading="lazy"
        :alt="video.name"
        class="video-thumb-img"
        @error="imgError = true"
      />
      <div v-else class="video-thumb-fallback d-flex align-center justify-center">
        <v-icon size="26" color="rgba(255, 255, 255, 0.4)">
          mdi-video
        </v-icon>
      </div>
      <div class="video-play-overlay d-flex align-center justify-center">
        <v-icon size="22" color="white">
          mdi-play
        </v-icon>
      </div>
    </div>

    <!-- Title and Subtitle -->
    <div class="video-info flex-grow-1 min-w-0 mx-4">
      <h4 class="video-title text-truncate" :class="{ 'text-primary': isPlaying }">
        {{ video.name }}
      </h4>
      <p v-if="subtitle" class="video-subtitle text-truncate mb-0">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { OnlineVideo } from "@/helpers/services/OnlineCollections";

export default defineComponent({
  name: "OnlineVideoRow",
  props: {
    index: {
      type: Number,
      required: true,
    },
    video: {
      type: Object as PropType<OnlineVideo & { channelName?: string }>,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["play"],
  data() {
    return {
      imgError: false,
    };
  },
  watch: {
    "video.image"() {
      this.imgError = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.online-video-row {
  width: 100%;
  padding: 10px 18px;
  border-radius: 12px;
  background: transparent;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--sidebar-hover, rgba(255, 255, 255, 0.05));

    .video-thumb-img {
      transform: scale(1.05);
    }

    .video-play-overlay {
      opacity: 1;
    }
  }

  &.video-playing-active {
    background: rgba(0, 159, 227, 0.12) !important;
    border-left: 3px solid var(--accent-blue, #009FE3);
  }

  .video-index {
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    color: var(--accent-blue, #009FE3);
    min-width: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-right: 12px;
  }

  .video-thumb-container {
    width: 116px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #101c2e 0%, #172a45 100%);

    .video-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.25s ease;
    }

    .video-thumb-fallback {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f1c2e 0%, #1e3556 100%);
    }

    .video-play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  .video-info {
    .video-title {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--sidebar-text);
      line-height: 1.35;
      margin: 0;
    }

    .video-subtitle {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--sidebar-text-secondary);
      margin-top: 3px;
    }
  }
}

:root[data-theme="light"],
.v-theme--light {
  .online-video-row {
    border-bottom-color: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 155, 226, 0.06);
    }

    &.video-playing-active {
      background: rgba(0, 143, 208, 0.1) !important;
    }

    .video-thumb-container {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    }
  }
}
</style>
