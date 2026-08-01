<template>
  <div class="w-100 h-100" style="background: #000">
    <component :is="loadModuleComponent()" v-if="module" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "PopupPage",
  data: () => ({
    message: null,
  }),
  computed: {
    module() {
      return this.$appdata.get("popup_module");
    },
  },
  mounted() {
    this.$appdata.set("is_popup", true);
    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin || event.origin === "file://" || event.origin === "null") {
        this.message = event.data;
        if (event.data.param) {
          this.$appdata.set(event.data.param, event.data.value);
        }
      }
    });

    window.opener.postMessage("mounted", "*");
  },
  methods: {
    loadModuleComponent() {
      return defineAsyncComponent(() => {
        const moduleComponents = import.meta.glob("@/modules/**/interface/Popup.vue");
        const match = Object.keys(moduleComponents).find(path => path.endsWith(`/${this.module}/interface/Popup.vue`));
        
        if (match) {
          return moduleComponents[match]();
        } 
        return Promise.reject(new Error(`Popup component for ${this.module} not found`)).catch((e) => {
          this.$alert.error({
            text: "messages.error_import_module",
            error: e,
          });
          return null;
        });
        
      });
    },
  },
};
</script>
