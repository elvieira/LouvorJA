<template>
  <div 
    class="split-play-all-container" 
    :class="{ 
      'is-disabled': isDisabled, 
      'is-open': menuOpen 
    }"
  >
    <!-- Botão Principal: Reproduzir Todas -->
    <button
      type="button"
      class="split-btn-main"
      :disabled="isDisabled"
      title="Reproduzir todas as músicas"
      @click="playDefault"
    >
      <v-icon size="16" class="btn-play-icon">
        mdi-play
      </v-icon>
      <span class="btn-label">{{ $t('modules.media.general.play_all') || 'Reproduzir Todas' }}</span>
    </button>

    <!-- Divisor sutil centralizado -->
    <div class="split-btn-divider" />

    <!-- Botão Secundário: Seta para Dropdown -->
    <v-menu
      v-model="menuOpen"
      :disabled="isDisabled"
      location="bottom end"
      :offset="8"
      transition="slide-y-transition"
    >
      <template #activator="{ props: menuProps }">
        <button
          v-bind="menuProps"
          type="button"
          class="split-btn-arrow"
          :disabled="isDisabled"
          title="Opções de reprodução"
        >
          <v-icon size="18">
            mdi-chevron-down
          </v-icon>
        </button>
      </template>

      <div class="split-play-dropdown-menu">
        <!-- Opção: Cantado -->
        <button
          type="button"
          class="filter-item"
          @click="playMode('audio')"
        >
          <span class="filter-label">{{ $t('modules.media.general.sung') || 'Cantado' }}</span>
        </button>

        <!-- Opção: Playback -->
        <button
          type="button"
          class="filter-item"
          @click="playMode('instrumental')"
        >
          <span class="filter-label">{{ $t('modules.media.general.instrumental') || 'Playback' }}</span>
        </button>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useMedia } from "@/composables/useHelpers";

const props = withDefaults(defineProps<{
  items?: any[];
  moduleId?: string | null;
  image?: string;
  disabled?: boolean;
}>(), {
  items: () => [],
  moduleId: null,
  image: "",
  disabled: false,
});

const media = useMedia();
const menuOpen = ref(false);

const isDisabled = computed(() => {
  return props.disabled || !props.items || props.items.length === 0;
});

const playDefault = () => {
  if (isDisabled.value) return;
  (media as any).playAll(props.items, "audio", props.moduleId, props.image);
};

const playMode = (mode: "audio" | "instrumental") => {
  if (isDisabled.value) return;
  menuOpen.value = false;
  (media as any).playAll(props.items, mode, props.moduleId, props.image);
};
</script>

<style lang="scss" scoped>
.split-play-all-container {
  display: inline-flex;
  align-items: stretch;
  height: 32px;
  border-radius: 8px;
  background: var(--ds-accent, #009FE3);
  box-shadow: 0 3px 10px rgba(0, 159, 227, 0.32);
  user-select: none;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(.is-disabled) {
    background: #008FD0;
    box-shadow: 0 4px 14px rgba(0, 159, 227, 0.42);
    transform: translateY(-1px);
  }

  &:active:not(.is-disabled) {
    background: #027BB3;
    transform: translateY(0);
  }

  &.is-open:not(.is-disabled) {
    background: #008FD0;
  }

  &.is-disabled {
    background: rgba(255, 255, 255, 0.08) !important;
    box-shadow: none !important;
    cursor: not-allowed;
    transform: none !important;

    .split-btn-main,
    .split-btn-arrow {
      color: rgba(255, 255, 255, 0.3) !important;
      cursor: not-allowed;
    }

    .split-btn-divider {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.split-btn-main {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px 0 13px;
  background: transparent;
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  outline: none;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  transition: background 0.15s ease;

  .btn-play-icon {
    color: #FFFFFF;
    flex-shrink: 0;
  }

  .btn-label {
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: -0.1px;
    line-height: 1;
    white-space: nowrap;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active:not(:disabled) {
    background: rgba(0, 0, 0, 0.12);
  }
}

.split-btn-divider {
  align-self: center;
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.split-btn-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  padding: 0;
  background: transparent;
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  outline: none;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active:not(:disabled) {
    background: rgba(0, 0, 0, 0.12);
  }
}

.split-play-dropdown-menu {
  min-width: 150px;
  background: var(--ds-surface, #30364a) !important;
  border: 1px solid var(--ds-border, #43495b) !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28) !important;
  padding: 8px !important;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .filter-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 9px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: var(--ds-text-primary, #f7f8fc);
    text-align: left;
    outline: none;

    .filter-label {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.2;
    }

    &:hover {
      background: var(--ds-accent-hover, rgba(0, 155, 226, 0.08));
      color: var(--ds-accent, #009be2);
    }

    &:active {
      background: rgba(0, 155, 226, 0.14) !important;
      color: var(--ds-accent, #009be2) !important;
      font-weight: 600;
    }
  }
}

// Suporte ao tema claro
:root[data-theme="light"],
.v-theme--light {
  .split-play-all-container.is-disabled {
    background: #E2E8F0 !important;

    .split-btn-main,
    .split-btn-arrow {
      color: #94A3B8 !important;
    }

    .split-btn-divider {
      background: #CBD5E1;
    }
  }

  .split-play-dropdown-menu {
    background: #FFFFFF !important;
    border: 1px solid var(--ds-border, #E2E8F0) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;

    .filter-item {
      color: var(--ds-text-primary, #334155);

      &:hover {
        background: rgba(0, 155, 226, 0.08);
        color: var(--ds-accent, #008fd0);
      }

      &:active {
        background: rgba(0, 155, 226, 0.14) !important;
        color: var(--ds-accent, #008fd0) !important;
      }
    }
  }
}
</style>
