<template>
  <div class="w-100 h-100 position-relative" style="background: #000">
    <ReturnScreen v-if="is_return_screen" />
    <component :is="loadModuleComponent()" v-else-if="module" />
    <CronometroOverlay v-if="show_cronometro_overlay" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import ReturnScreen from "@/components/ReturnScreen.vue";
import CronometroOverlay from "@/components/CronometroOverlay.vue";

export default {
  name: "PopupPage",
  components: {
    ReturnScreen,
    CronometroOverlay,
  },
  data: () => ({
    message: null,
  }),
  computed: {
    module() {
      return this.$appdata.get("popup_module");
    },
    is_return_screen() {
      return this.$route.query.role === "return";
    },
    cronometro() {
      return this.$appdata.get("cronometro") || {};
    },
    show_cronometro_overlay() {
      // Na tela de retorno, sempre exibe. Na tela principal, evita duplicar
      // quando o próprio módulo do cronômetro já ocupa a tela inteira.
      if (!this.cronometro.started) return false;
      if (this.is_return_screen) return true;
      return this.module !== "cronometro";
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
  },
};
</script>
