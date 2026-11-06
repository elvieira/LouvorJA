<template>
  <v-snackbar
    :model-value="snackbar.show"
    :timeout="snackbar.timeout"
    :theme="isDark ? 'dark' : 'light'"
    location="bottom right"
    variant="flat"
    :class="['modern-snackbar', `modern-snackbar--${statusConfig.type}`]"
    :style="{
      marginBottom: isFooterVisible ? '88px' : '20px',
      marginRight: '20px',
    }"
    transition="snackbar-transition"
    @update:model-value="(val) => appdata.set('snackbar.show', val)"
  >
    <div class="modern-snackbar-body">
      <div
        class="modern-snackbar-icon-box"
        :style="{
          backgroundColor: statusConfig.badgeBg,
          color: statusConfig.color,
        }"
      >
        <v-progress-circular
          v-if="snackbar.loading"
          indeterminate
          :color="statusConfig.color"
          size="18"
          width="2.5"
        />
        <v-icon
          v-else
          :icon="statusConfig.icon"
          :color="statusConfig.color"
          size="20"
        />
      </div>

      <div class="modern-snackbar-text">
        {{ snackbar.text ? $t(snackbar.text) : "" }}
      </div>
    </div>

    <template #actions>
      <v-btn
        variant="text"
        size="small"
        icon="mdi-close"
        class="modern-snackbar-close"
        @click="appdata.set('snackbar.show', false)"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import { useAppData, useMedia } from "@/composables/useHelpers";

defineOptions({ name: "AppSnackbar" });

const appdata = useAppData();
const media = useMedia();
const vuetifyTheme = useTheme();

const isDark = computed(() => {
  return Boolean(vuetifyTheme.global.current.value.dark ?? appdata.get("is_dark"));
});

const isFooterVisible = computed(() => {
  return (
    media.isMinimized() ||
    (appdata.get("modules.external_media.minimized") === true &&
      !!appdata.get("modules.external_media.filePath"))
  );
});

const snackbar = computed(() => ({
  show: appdata.get("snackbar.show") || false,
  text: appdata.get("snackbar.text") || "",
  loading: appdata.get("snackbar.loading") || false,
  color: appdata.get("snackbar.color") || "primary",
  timeout: appdata.get("snackbar.timeout") || 5000,
}));

const statusConfig = computed(() => {
  const rawColor = String(snackbar.value.color || "primary").toLowerCase();

  if (
    rawColor.includes("warn") ||
    rawColor.includes("orange") ||
    rawColor.includes("amber")
  ) {
    return {
      type: "warning",
      icon: "mdi-alert-circle-outline",
      color: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.14)",
    };
  }

  if (
    rawColor.includes("success") ||
    rawColor.includes("green") ||
    rawColor.includes("check")
  ) {
    return {
      type: "success",
      icon: "mdi-check-circle-outline",
      color: "#10b981",
      badgeBg: "rgba(16, 185, 129, 0.14)",
    };
  }

  if (
    rawColor.includes("error") ||
    rawColor.includes("err") ||
    rawColor.includes("red") ||
    rawColor.includes("danger")
  ) {
    return {
      type: "error",
      icon: "mdi-alert-octagon-outline",
      color: "#ef4444",
      badgeBg: "rgba(239, 68, 68, 0.14)",
    };
  }

  if (rawColor.includes("info") || rawColor.includes("cyan")) {
    return {
      type: "info",
      icon: "mdi-information-outline",
      color: "#0284c7",
      badgeBg: "rgba(2, 132, 199, 0.14)",
    };
  }

  // Default / Primary
  return {
    type: "primary",
    icon: "mdi-information-outline",
    color: "#009be2",
    badgeBg: "rgba(0, 155, 226, 0.14)",
  };
});
</script>

<style lang="scss">
/* ==========================================================================
   Smooth Snackbar Transition
   ========================================================================== */
.snackbar-transition-enter-active {
  transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.38s cubic-bezier(0.16, 1, 0.3, 1) !important;
  will-change: opacity, transform;
}

.snackbar-transition-leave-active {
  transition: opacity 0.26s cubic-bezier(0.4, 0, 1, 1),
              transform 0.26s cubic-bezier(0.4, 0, 1, 1) !important;
  will-change: opacity, transform;
}

.snackbar-transition-enter-from {
  opacity: 0 !important;
  transform: translateY(28px) scale(0.94) !important;
}

.snackbar-transition-enter-to {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
}

.snackbar-transition-leave-from {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
}

.snackbar-transition-leave-to {
  opacity: 0 !important;
  transform: translateY(20px) scale(0.96) !important;
}

.v-overlay.v-snackbar.modern-snackbar {
  pointer-events: none;

  .v-snackbar__wrapper {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.94) !important;
    backdrop-filter: blur(24px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
    border-radius: 14px !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.05) !important;
    padding: 8px 10px 8px 12px !important;
    min-width: 320px !important;
    max-width: 480px !important;
    color: #1e293b !important;
    transform-origin: bottom right;
    transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  /* Type-specific subtle border tinting */
  &.modern-snackbar--warning .v-snackbar__wrapper {
    border-color: rgba(245, 158, 11, 0.35) !important;
  }
  &.modern-snackbar--success .v-snackbar__wrapper {
    border-color: rgba(16, 185, 129, 0.35) !important;
  }
  &.modern-snackbar--error .v-snackbar__wrapper {
    border-color: rgba(239, 68, 68, 0.35) !important;
  }
  &.modern-snackbar--info .v-snackbar__wrapper,
  &.modern-snackbar--primary .v-snackbar__wrapper {
    border-color: rgba(0, 155, 226, 0.35) !important;
  }

  /* Dark Theme */
  &.v-theme--dark .v-snackbar__wrapper,
  .v-theme--dark & .v-snackbar__wrapper {
    background: rgba(18, 30, 49, 0.92) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    box-shadow: 0 16px 40px -6px rgba(0, 0, 0, 0.5), 0 4px 14px -2px rgba(0, 0, 0, 0.3) !important;
    color: #f1f5f9 !important;
  }

  &.v-theme--dark.modern-snackbar--warning .v-snackbar__wrapper,
  .v-theme--dark &.modern-snackbar--warning .v-snackbar__wrapper {
    border-color: rgba(245, 158, 11, 0.4) !important;
  }
  &.v-theme--dark.modern-snackbar--success .v-snackbar__wrapper,
  .v-theme--dark &.modern-snackbar--success .v-snackbar__wrapper {
    border-color: rgba(16, 185, 129, 0.4) !important;
  }
  &.v-theme--dark.modern-snackbar--error .v-snackbar__wrapper,
  .v-theme--dark &.modern-snackbar--error .v-snackbar__wrapper {
    border-color: rgba(239, 68, 68, 0.4) !important;
  }
  &.v-theme--dark.modern-snackbar--info .v-snackbar__wrapper,
  .v-theme--dark &.modern-snackbar--info .v-snackbar__wrapper,
  &.v-theme--dark.modern-snackbar--primary .v-snackbar__wrapper,
  .v-theme--dark &.modern-snackbar--primary .v-snackbar__wrapper {
    border-color: rgba(0, 155, 226, 0.4) !important;
  }

  /* Reset inner Vuetify content padding */
  .v-snackbar__content {
    padding: 0 !important;
    display: flex;
    align-center;
    flex: 1 1 auto;
    min-width: 0;
  }

  .v-snackbar__actions {
    margin: 0 !important;
    padding-left: 6px !important;
    align-self: center;
  }

  .modern-snackbar-body {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-width: 0;
  }

  .modern-snackbar-icon-box {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .modern-snackbar-text {
    font-size: 0.88rem;
    font-weight: 500;
    line-height: 1.42;
    word-break: break-word;
    color: inherit;
    flex: 1 1 auto;
  }

  .modern-snackbar-close {
    opacity: 0.5;
    transition: opacity 0.2s ease, background-color 0.2s ease, transform 0.15s ease;
    border-radius: 8px !important;

    &:hover {
      opacity: 0.95;
      background-color: rgba(150, 150, 150, 0.15) !important;
    }

    &:active {
      transform: scale(0.92);
    }
  }
}
</style>


