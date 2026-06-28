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

loadFonts();

const app = createApp(App);

import ModuleManager from "@/helpers/ModuleManager";

app.use(router);
app.use(vuetify);
app.use(store);
app.use(helpersPlugin);
app.use(shortkey, { prevent: ["input", "textarea"] });
app.use(VueFullscreen);

createI18nInstance().then(async (i18n) => {
  app.use(i18n);
  await ModuleManager.init(i18n);
  app.mount("#app");
});
