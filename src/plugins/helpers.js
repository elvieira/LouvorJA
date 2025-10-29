// @/plugins/helpers.js
// Plugin para fornecer helpers globalmente usando provide/inject (Vue 3 best practice)

import Modules from "@/helpers/Modules";
import Dev from "@/helpers/Dev";
import String from "@/helpers/String";
import UserData from "@/helpers/UserData";
import AppData from "@/helpers/AppData";
import DateTime from "@/helpers/DateTime";
import Theme from "@/helpers/Theme";
import Path from "@/helpers/Path";
import Media from "@/helpers/Media";
import Alert from "@/helpers/Alert";
import Popup from "@/helpers/Popup";
import Database from "@/helpers/Database";

// Símbolos de injeção (garantem unicidade e evitam colisões)
export const HelpersSymbol = Symbol('helpers');

// Plugin de instalação
export default {
  install(app) {
    // Criar objeto com todos os helpers
    const helpers = {
      userdata: UserData,
      appdata: AppData,
      modules: Modules,
      dev: Dev,
      string: String,
      datetime: DateTime,
      theme: Theme,
      path: Path,
      media: Media,
      alert: Alert,
      popup: Popup,
      database: Database,
    };

    // Fornecer helpers globalmente
    app.provide(HelpersSymbol, helpers);

    // Também adicionar ao globalProperties para compatibilidade retroativa
    // (permite usar this.$helpers nos componentes Options API)
    app.config.globalProperties.$helpers = helpers;
    
    // Manter compatibilidade com o código existente
    app.config.globalProperties.$userdata = UserData;
    app.config.globalProperties.$appdata = AppData;
    app.config.globalProperties.$modules = Modules;
    app.config.globalProperties.$dev = Dev;
    app.config.globalProperties.$string = String;
    app.config.globalProperties.$datetime = DateTime;
    app.config.globalProperties.$theme = Theme;
    app.config.globalProperties.$path = Path;
    app.config.globalProperties.$media = Media;
    app.config.globalProperties.$alert = Alert;
    app.config.globalProperties.$popup = Popup;
    app.config.globalProperties.$database = Database;
  },
};
