<template>
  <v-btn
    v-if="!is_mobile"
    :variant="variant"
    :size="size"
    :active="is_popup_opened"
    icon
    :class="{ 'rotate-icon': is_selected }"
    @click="popup()"
  >
    <v-icon>mdi-presentation-play</v-icon>
    <v-tooltip
      activator="parent"
      location="top"
      open-delay="300"
      content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
    >
      Projetar
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useAppData, usePopup } from "@/composables/useHelpers";

defineOptions({ name: "ScreenButton" });
import $userdata from "@/helpers/config/UserData";

const props = withDefaults(defineProps<{
  module: string;
  size?: string;
  variant?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
}>(), {
  size: "small",
  variant: "text",
});

const emit = defineEmits(["fullscreen"]);

const appdata = useAppData();
const popupHelper = usePopup();

const is_mobile = computed(() => appdata.get("is_mobile"));
const is_popup_opened = computed(() => !!appdata.get("popup"));
const popup_module = computed(() => appdata.get("popup_module"));
const is_selected = computed(() => is_popup_opened.value && popup_module.value === props.module);

const popup = async () => {
  if (is_selected.value) {
    popupHelper.exit();
  } else {
    let selectedMonitors: any[] = [];
    if ((window as any).electronAPI && (window as any).electronAPI.getDisplays) {
      const displays = await (window as any).electronAPI.getDisplays();
      if (displays && displays.length > 1) {
        let configMonitors: any = [];
        if (props.module === "external_media" && $userdata.get("modules.config.media_sync_projection_settings") === false) {
          configMonitors = $userdata.get("modules.config.media_slide_monitor");
        } else {
          configMonitors = $userdata.get("modules.config.slide_monitor");
        }
        if (!Array.isArray(configMonitors)) {
          configMonitors = configMonitors ? [configMonitors] : [];
        }
        const primary = displays.find((d: any) => d.isPrimary) || displays[0];
        selectedMonitors = configMonitors.filter((m: any) => m !== primary.id);
      }
    }
    
    if (selectedMonitors.length > 0) {
      await popupHelper.syncMonitors(selectedMonitors, props.module, true);
    } else {
      let fullscreen = true;
      if (props.module === "external_media" && $userdata.get("modules.config.media_sync_projection_settings") === false) {
        fullscreen = $userdata.get("modules.config.media_slide_fullscreen") !== false;
      } else {
        fullscreen = $userdata.get("modules.config.slide_fullscreen") !== false;
      }

      if (props.module === "external_media") {
        if (fullscreen) {
          emit("fullscreen");
        }
      } else {
        popupHelper.open({ module: props.module, fullscreen });
      }
    }
  }
};

const handleGlobalKeydown = (e: KeyboardEvent) => {
  // Ignorar se estiver focando em algum input/textarea
  const target = e.target as HTMLElement;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
    // Só ignora F5/ESC se for realmente num campo de input
    // Mas F5 e ESC costumam ser globais mesmo dentro de input, vou deixar passar ESC e F5
  }

  if (e.key === "F5") {
    // Only trigger if this specific module is the one currently open on screen
    const isModuleActive = appdata.get(`modules.${props.module}.show`);
    if (isModuleActive) {
      e.preventDefault();
      popup();
    }
  } else if (e.key === "Escape") {
    if (is_selected.value) {
      e.preventDefault();
      popupHelper.exit();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});
</script>

<style scoped>
.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>
