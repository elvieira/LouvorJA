<template>
  <div class="w-100 h-100" style="background: #000">
    <component v-if="module" :is="loadModuleComponent()" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import {
  captureCurrentBounds,
  getPopupSlotId,
  parseSlotIndex,
  requestWindowManagementPermission,
  resolveBoundsForSlot,
  saveSlotBounds,
  scheduleRestoreOnWindow,
} from "@/helpers/PopupLayout";

export default {
  name: "PopupPage",
  data: () => ({
    message: null,
    layoutInterval: null,
  }),
  computed: {
    module() {
      return this.$appdata.get("popup_module");
    },
    slotIndex() {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = parseInt(params.get("slot"), 10);
      if (!Number.isNaN(fromUrl) && fromUrl > 0) {
        return fromUrl;
      }
      return parseSlotIndex(window.name);
    },
    slotId() {
      if (this.slotIndex) {
        return getPopupSlotId(this.slotIndex);
      }
      return window.name || "";
    },
  },
  methods: {
    loadModuleComponent() {
      return defineAsyncComponent(() => {
        return import(
          `@/modules/core/${this.module}/interface/Popup.vue`
        ).catch(() => {
          return import(`@/modules/${this.module}/interface/Popup.vue`).catch(
            (e) => {
              this.$alert.error({
                text: "messages.error_import_module",
                error: e,
              });

              return null;
            },
          );
        });
      });
    },
    async restoreLayout() {
      const entry = resolveBoundsForSlot(this.slotId);
      if (!entry) return;

      await requestWindowManagementPermission();
      scheduleRestoreOnWindow(window, entry);
    },
    reportBounds() {
      if (!this.slotId) return;

      const bounds = captureCurrentBounds(window);
      if (!bounds) return;

      saveSlotBounds(this.slotId, bounds);

      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(
            { action: "popup-bounds", slot: this.slotId, bounds },
            window.location.origin,
          );
        } catch (e) {
          console.log(e);
        }
      }
    },
    handleMessage(event) {
      if (event.origin !== window.location.origin) return;

      if (event.data?.action === "report-bounds") {
        this.reportBounds();
        return;
      }

      if (event.data?.action === "restore-bounds") {
        this.restoreLayout();
        return;
      }

      this.message = event.data;
      if (event.data.param) {
        this.$appdata.set(event.data.param, event.data.value);
      }
    },
  },
  mounted() {
    this.$appdata.set("is_popup", true);

    window.addEventListener("message", this.handleMessage);
    window.addEventListener("resize", this.reportBounds);

    this.restoreLayout();
    this.reportBounds();

    this.layoutInterval = setInterval(() => {
      this.reportBounds();
    }, 2000);

    window.addEventListener("beforeunload", this.reportBounds);

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage("mounted", window.location.origin);
    }
  },
  beforeUnmount() {
    this.reportBounds();
    window.removeEventListener("message", this.handleMessage);
    window.removeEventListener("resize", this.reportBounds);
    window.removeEventListener("beforeunload", this.reportBounds);
    if (this.layoutInterval) {
      clearInterval(this.layoutInterval);
    }
  },
};
</script>
