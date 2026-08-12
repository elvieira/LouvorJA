<template>
  <div class="w-100 h-100" style="background: #000">
    <component :is="loadModuleComponent()" v-if="activeModule" />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

export default defineComponent({
  name: "PopupPage",
  data: () => ({
    message: null as any,
    activeModule: "" as string,
  }),
  computed: {
    module(): string {
      return this.$appdata.get("popup_module");
    },
  },
  watch: {
    module: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.activeModule = newVal;
        }
      },
    },
  },
  mounted() {
    this.$appdata.set("is_popup", true);

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (e.key === "Escape" || e.key === "F5") {
        if (window.opener) {
          window.opener.postMessage("escape-pressed", "*");
        }
        if (window.electronAPI) {
          window.electronAPI.windowControl("close");
        } else {
          window.close();
        }
      }
    });

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin === window.location.origin || event.origin === "file://" || event.origin === "null") {
        if (event.data === "close") {
          if (window.electronAPI) {
            window.electronAPI.windowControl("close");
          } else {
            window.close();
          }
          return;
        }

        this.message = event.data;
        if (event.data.param) {
          this.$appdata.set(event.data.param, event.data.value);
        }
      }
    });

    if (window.opener) {
      window.opener.postMessage("mounted", "*");
    }
  },
  methods: {
    loadModuleComponent() {
      return defineAsyncComponent(() => {
        const moduleComponents = import.meta.glob("@/modules/**/interface/Popup.vue");
        const match = Object.keys(moduleComponents).find(path => path.endsWith(`/${this.activeModule}/interface/Popup.vue`));
        
        if (match) {
          return moduleComponents[match]() as Promise<any>;
        } 
        return Promise.reject(new Error(`Popup component for ${this.activeModule} not found`)).catch((e: Error) => {
          this.$alert.error({
            text: "messages.error_import_module",
            error: e,
          });
          return null;
        });
        
      });
    },
  },
});
</script>
