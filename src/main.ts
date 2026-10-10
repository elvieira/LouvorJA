import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import store from "./store";
import { loadFonts } from "./plugins/webfontloader";
import { createI18nInstance } from "./i18n";
import shortkey from "vue3-shortkey";
import VueFullscreen from "vue-fullscreen";
import helpersPlugin from "./plugins/helpers";
import "./assets/styles/main.css";
import "./assets/styles/fonts.css";
import "./assets/styles/layout.scss";

import Logger from "./helpers/services/Logger";

loadFonts();

const app = createApp(App);

app.config.errorHandler = (err, instance, info) => {
  Logger.error(`[Vue Error] ${info}`, err instanceof Error ? err.stack || err.message : err);
  console.error(err);
};

import ModuleManager from "@/helpers/core/ModuleManager";
import Telemetry from "./helpers/services/Telemetry";

app.use(router);
app.use(vuetify);
app.use(store);
app.use(helpersPlugin);
app.use(shortkey, { prevent: ["input", "textarea"] });
app.use(VueFullscreen);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
createI18nInstance().then(async (i18n: any) => {
  app.use(i18n);
  await ModuleManager.init(i18n);
  Telemetry.init().catch(() => {});
  app.mount("#app");
});
