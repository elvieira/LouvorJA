<template>
  <div class="w-100 h-100" style="background: #000">
    <component :is="loadModuleComponent()" v-if="module" />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

export default defineComponent({
  name: "PopupPage",
  data: () => ({
    message: null as any,
  }),
  computed: {
    module(): string {
      return this.$appdata.get("popup_module");
    },
  },
  mounted() {
    this.$appdata.set("is_popup", true);
    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin === window.location.origin || event.origin === "file://" || event.origin === "null") {
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
        const match = Object.keys(moduleComponents).find(path => path.endsWith(`/${this.module}/interface/Popup.vue`));
        
        if (match) {
          return moduleComponents[match]() as Promise<any>;
        } 
        return Promise.reject(new Error(`Popup component for ${this.module} not found`)).catch((e: Error) => {
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
