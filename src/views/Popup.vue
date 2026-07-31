<template>
  <div class="w-100 h-100 position-relative" style="background: #000">
    <ReturnStatusBar v-if="is_status_bar" />
    <NoticeBar v-else-if="is_notice_bar" />
    <ReturnScreen v-else-if="is_return_screen" />
    <component :is="loadModuleComponent()" v-else-if="module" />
    <TimerOverlay v-if="show_timer_overlay" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import ReturnScreen from "@/components/ReturnScreen.vue";
import ReturnStatusBar from "@/components/ReturnStatusBar.vue";
import NoticeBar from "@/components/NoticeBar.vue";
import TimerOverlay from "@/components/TimerOverlay.vue";

export default {
  name: "PopupPage",
  components: {
    ReturnScreen,
    ReturnStatusBar,
    NoticeBar,
    TimerOverlay,
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
    is_status_bar() {
      return this.$route.query.role === "status";
    },
    is_notice_bar() {
      return this.$route.query.role === "notice";
    },
    timer() {
      return this.$appdata.get("timer") || {};
    },
    show_timer_overlay() {
      // Barras (status/aviso) nunca mostram o overlay do timer — são tiras
      // finas dedicadas a outra informação.
      if (this.is_status_bar || this.is_notice_bar) return false;
      // Na tela de retorno, sempre exibe. Na tela principal, evita duplicar
      // quando o próprio módulo do timer já ocupa a tela inteira.
      if (!this.timer.started) return false;
      if (this.is_return_screen) return true;
      return this.module !== "timer";
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
